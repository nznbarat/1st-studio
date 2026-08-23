"""Сүлжээгүй тестүүд:  python3 -m unittest discover -s tests -v

Хамгийн сүүлийн тест нь fake provider‑тэй бүтэн урсгалыг шалгана
(ffmpeg байхгүй бол алгасна).
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from v2v3d import comfy_workflow as wf  # noqa: E402
from v2v3d import config as cfg  # noqa: E402
from v2v3d import doctor as doc  # noqa: E402
from v2v3d import media, pipeline  # noqa: E402
from v2v3d.cli import main as cli_main  # noqa: E402
from v2v3d.cli import parse_set  # noqa: E402
from v2v3d.config import Settings, estimate_cost  # noqa: E402
from v2v3d.manifest import Manifest  # noqa: E402
from v2v3d.providers import GenRequest, GenResult, Provider  # noqa: E402
from v2v3d.providers.fal import FalProvider, extract_video_url  # noqa: E402
from v2v3d.providers.replicate import ReplicateProvider  # noqa: E402
from v2v3d.providers.comfy import ComfyProvider, _size_for  # noqa: E402
from v2v3d.styles import (  # noqa: E402
    build_prompt,
    ensure_video_reference,
    load_styles,
    strip_video_reference,
)

WORKFLOW_PATH = Path(__file__).resolve().parents[1] / "workflows" / "wan-vace-v2v.api.json"


def make_settings(tmp: Path, **kw) -> Settings:
    base = dict(input_dir=tmp / "in", output_dir=tmp / "out")
    base.update(kw)
    return Settings(**base)


class TestStyles(unittest.TestCase):
    def test_every_preset_references_the_video(self):
        for style in load_styles().values():
            self.assertIn("@Video1", style.prompt, style.id)

    def test_custom_prompt_gets_video_token(self):
        self.assertTrue(build_prompt(override="make it clay").startswith("@Video1"))

    def test_existing_token_is_not_duplicated(self):
        text = "Use @Video1 as motion"
        self.assertEqual(ensure_video_reference(text), text)

    def test_extra_prompt_is_appended(self):
        prompt = build_prompt("clay", extra="Night scene.")
        self.assertTrue(prompt.endswith("Night scene."))

    def test_unknown_style_raises(self):
        with self.assertRaises(KeyError):
            build_prompt("no-such-style")


class TestComfyWorkflow(unittest.TestCase):
    """Workflow дотор утга суулгах логик — сервер шаардахгүй."""

    def setUp(self):
        self.workflow = wf.load_workflow(WORKFLOW_PATH)

    def test_template_resolves_every_target(self):
        targets = wf.resolve_targets(self.workflow)
        for name in ("video", "prompt", "negative", "seed", "frames", "width", "height", "fps"):
            self.assertIn(name, targets, name)
        self.assertEqual(str(targets["video"]), "6.file (LoadVideo)")
        self.assertEqual(targets["prompt"].node_id, "4")
        self.assertEqual(targets["negative"].node_id, "5")

    def test_values_land_in_the_right_nodes(self):
        applied = wf.apply_values(
            self.workflow,
            {"video": "v2v3d/a.mp4", "prompt": "P", "negative": "N", "seed": 42, "frames": 81},
        )
        self.assertEqual(applied["6"]["inputs"]["file"], "v2v3d/a.mp4")
        self.assertEqual(applied["4"]["inputs"]["text"], "P")
        self.assertEqual(applied["5"]["inputs"]["text"], "N")
        self.assertEqual(applied["10"]["inputs"]["seed"], 42)
        self.assertEqual(applied["8"]["inputs"]["length"], 81)

    def test_original_workflow_is_not_mutated(self):
        wf.apply_values(self.workflow, {"video": "x.mp4", "prompt": "P"})
        self.assertEqual(self.workflow["6"]["inputs"]["file"], "input.mp4")

    def test_manual_map_overrides_autodetection(self):
        mapping = wf.parse_mapping(["prompt=5.text"])
        applied = wf.apply_values(self.workflow, {"prompt": "P"}, mapping)
        self.assertEqual(applied["5"]["inputs"]["text"], "P")
        self.assertEqual(applied["4"]["inputs"]["text"], "3D render style")

    def test_set_overrides_any_node_input(self):
        applied = wf.apply_values(
            self.workflow, {"video": "x.mp4", "prompt": "P"}, overrides={"10.steps": 8}
        )
        self.assertEqual(applied["10"]["inputs"]["steps"], 8)

    def test_bad_map_is_rejected(self):
        for bad in ["prompt", "prompt=6", "nope=6.text"]:
            with self.assertRaises(wf.WorkflowError):
                wf.parse_mapping([bad])

    def test_missing_video_node_is_reported(self):
        with self.assertRaises(wf.WorkflowError):
            wf.apply_values({"1": {"class_type": "X", "inputs": {}}}, {"prompt": "P"})

    def test_ui_format_export_is_rejected(self):
        tmp = Path(tempfile.mkdtemp()) / "ui.json"
        tmp.write_text('{"nodes": [], "links": []}', encoding="utf-8")
        with self.assertRaises(wf.WorkflowError) as ctx:
            wf.load_workflow(tmp)
        self.assertIn("API", str(ctx.exception))
        shutil.rmtree(tmp.parent, ignore_errors=True)

    def test_frame_count_is_four_n_plus_one(self):
        for seconds, fps in ((5, 16), (3.3, 16), (10, 24), (1, 16)):
            frames = wf.frames_for(seconds, fps)
            self.assertEqual((frames - 1) % 4, 0)
            self.assertGreaterEqual(frames, 5)


class TestDoctor(unittest.TestCase):
    OBJECT_INFO = {
        "KSampler": {"input": {"required": {"seed": ["INT", {}], "model": ["MODEL"], "steps": ["INT", {}]}}},
        "UNETLoader": {"input": {"required": {"unet_name": [["real.safetensors"], {}]}}},
    }

    def test_clean_workflow_has_no_issues(self):
        workflow = {
            "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "real.safetensors"}},
            "2": {"class_type": "KSampler", "inputs": {"seed": 1, "steps": 20, "model": ["1", 0]}},
        }
        self.assertEqual(doc.check_workflow(workflow, self.OBJECT_INFO), [])

    def test_missing_node_class_is_an_error(self):
        issues = doc.check_workflow({"1": {"class_type": "Nope", "inputs": {}}}, self.OBJECT_INFO)
        self.assertEqual(doc.summarize(issues), (1, 0))

    def test_missing_model_file_is_an_error(self):
        workflow = {"1": {"class_type": "UNETLoader", "inputs": {"unet_name": "absent.safetensors"}}}
        issues = doc.check_workflow(workflow, self.OBJECT_INFO)
        self.assertEqual(doc.summarize(issues), (1, 0))
        self.assertIn("real.safetensors", issues[0][1])

    def test_unknown_input_is_only_a_warning(self):
        workflow = {"1": {"class_type": "KSampler", "inputs": {"seed": 1, "mystery": 3}}}
        self.assertEqual(doc.summarize(doc.check_workflow(workflow, self.OBJECT_INFO)), (0, 1))


class TestComfyProvider(unittest.TestCase):
    def test_prompt_loses_the_seedance_token(self):
        self.assertEqual(strip_video_reference("@Video1 — make it clay"), "make it clay")
        self.assertIn("the source video", strip_video_reference(build_prompt("blockout")))

    def test_payload_carries_prompt_video_and_frames(self):
        provider = ComfyProvider("http://x:8188", {"workflow": str(WORKFLOW_PATH), "fps": 16})
        payload = provider.build_payload(
            GenRequest(prompt="@Video1 — clay", video_urls=["v2v3d/a.mp4"], duration="5", seed=9)
        )
        graph = payload["prompt"]
        self.assertEqual(graph["6"]["inputs"]["file"], "v2v3d/a.mp4")
        self.assertEqual(graph["4"]["inputs"]["text"], "clay")
        self.assertEqual(graph["10"]["inputs"]["seed"], 9)
        self.assertEqual(graph["8"]["inputs"]["length"], 81)
        self.assertIn("client_id", payload)

    def test_missing_workflow_is_reported_clearly(self):
        with self.assertRaises(RuntimeError) as ctx:
            ComfyProvider("http://x:8188", {}).build_payload(GenRequest(prompt="p"))
        self.assertIn("--workflow", str(ctx.exception))

    def test_resolution_maps_to_pixel_size(self):
        self.assertEqual(_size_for("720p", "16:9"), (1280, 720))
        self.assertEqual(_size_for("480p", "9:16"), (480, 848))
        for width, height in (_size_for(r, a) for r in ("480p", "720p") for a in ("16:9", "1:1")):
            self.assertEqual(width % 16, 0)
            self.assertEqual(height % 16, 0)

    def test_local_provider_is_free(self):
        settings = Settings(input_dir=Path("a"), output_dir=Path("b"), provider="comfy")
        self.assertTrue(settings.is_local)
        self.assertEqual(estimate_cost(10, 10, "720p", "comfy"), 0.0)
        self.assertEqual(settings.limits.default_chunk_seconds, 5)


class TestSegments(unittest.TestCase):
    def test_segment_mode_covers_whole_video(self):
        segs = media.plan_segments(47, 10, "segment", 30)
        self.assertEqual(len(segs), 5)
        self.assertAlmostEqual(sum(s.duration for s in segs), 47, places=3)
        self.assertAlmostEqual(segs[-1].start + segs[-1].duration, 47, places=3)

    def test_short_tail_is_merged_into_previous(self):
        segs = media.plan_segments(42.5, 10, "segment", 30)
        self.assertEqual(len(segs), 4)
        self.assertGreaterEqual(segs[-1].duration, cfg.MIN_OUTPUT_SECONDS)
        self.assertAlmostEqual(sum(s.duration for s in segs), 42.5, places=3)

    def test_trim_caps_at_reference_limit(self):
        segs = media.plan_segments(120, 10, "trim", 30)
        self.assertEqual(len(segs), 1)
        self.assertEqual(segs[0].duration, 30)

    def test_skip_drops_long_video(self):
        self.assertEqual(media.plan_segments(120, 10, "skip", 30), [])
        self.assertEqual(len(media.plan_segments(20, 10, "skip", 30)), 1)

    def test_whole_mode_rejects_long_video(self):
        with self.assertRaises(media.MediaError):
            media.plan_segments(120, 10, "whole", 30)

    def test_no_segment_exceeds_reference_limit(self):
        for total in (5, 31, 60, 119.4, 301):
            for chunk in (4, 10, 30):
                for seg in media.plan_segments(total, chunk, "segment", 30):
                    self.assertLessEqual(seg.duration, 30 + 1e-6)


class TestDiscovery(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "in" / "sub").mkdir(parents=True)
        for name in ("b.mp4", "a.MP4", "c.mov", "notes.txt", ".hidden.mp4"):
            (self.tmp / "in" / name).write_bytes(b"x")
        (self.tmp / "in" / "sub" / "d.mp4").write_bytes(b"x")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_finds_only_video_files_sorted(self):
        found = [p.name for p in pipeline.discover(self.tmp / "in", (".mp4",))]
        self.assertEqual(found, ["a.MP4", "b.mp4"])

    def test_extension_filter_and_recursion(self):
        found = [p.name for p in pipeline.discover(self.tmp / "in", (".mp4", ".mov"), recursive=True)]
        self.assertEqual(found, ["a.MP4", "b.mp4", "c.mov", "d.mp4"])

    def test_output_keeps_original_name(self):
        src = self.tmp / "in" / "b.mp4"
        dest = pipeline.output_path_for(src, self.tmp / "in", self.tmp / "out")
        self.assertEqual(dest, self.tmp / "out" / "b.mp4")

    def test_output_keeps_subfolders_when_recursive(self):
        src = self.tmp / "in" / "sub" / "d.mp4"
        dest = pipeline.output_path_for(src, self.tmp / "in", self.tmp / "out", recursive=True)
        self.assertEqual(dest, self.tmp / "out" / "sub" / "d.mp4")

    def test_non_mp4_input_becomes_mp4_output(self):
        src = self.tmp / "in" / "c.mov"
        dest = pipeline.output_path_for(src, self.tmp / "in", self.tmp / "out")
        self.assertEqual(dest.name, "c.mp4")


class TestPlanning(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "in").mkdir(parents=True)
        (self.tmp / "in" / "clip.mp4").write_bytes(b"x")

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_existing_output_is_skipped(self):
        settings = make_settings(self.tmp)
        (self.tmp / "out").mkdir()
        (self.tmp / "out" / "clip.mp4").write_bytes(b"x")
        plan = pipeline.plan_file(self.tmp / "in" / "clip.mp4", settings, probe=lambda p: 12.0)
        self.assertEqual(plan.skipped, "аль хэдийн байна")

    def test_overwrite_ignores_existing_output(self):
        settings = make_settings(self.tmp, overwrite=True)
        (self.tmp / "out").mkdir()
        (self.tmp / "out" / "clip.mp4").write_bytes(b"x")
        plan = pipeline.plan_file(self.tmp / "in" / "clip.mp4", settings, probe=lambda p: 12.0)
        self.assertIsNone(plan.skipped)

    def test_probe_failure_is_reported_not_raised(self):
        def boom(_):
            raise media.MediaError("эвдэрсэн файл")

        plan = pipeline.plan_file(self.tmp / "in" / "clip.mp4", make_settings(self.tmp), probe=boom)
        self.assertEqual(plan.skipped, "эвдэрсэн файл")

    def test_auto_duration_follows_segment_length(self):
        settings = make_settings(self.tmp)
        seg = media.Segment(0, 0.0, 9.4)
        self.assertEqual(pipeline.segment_duration_arg(seg, settings), "9")

    def test_auto_duration_respects_model_minimum(self):
        settings = make_settings(self.tmp)
        seg = media.Segment(0, 0.0, 2.0)
        self.assertEqual(pipeline.segment_duration_arg(seg, settings), str(cfg.MIN_OUTPUT_SECONDS))

    def test_explicit_duration_wins(self):
        settings = make_settings(self.tmp, duration="12")
        self.assertEqual(pipeline.segment_duration_arg(media.Segment(0, 0, 5), settings), "12")


class TestSettingsAndCost(unittest.TestCase):
    def test_validate_accepts_defaults(self):
        self.assertEqual(make_settings(Path("/tmp")).validate(), [])

    def test_validate_catches_bad_values(self):
        errors = make_settings(Path("/tmp"), resolution="4k", duration="99", chunk_seconds=99).validate()
        self.assertEqual(len(errors), 3)

    def test_reference_video_discount_is_applied(self):
        self.assertAlmostEqual(estimate_cost(10, 10, "720p"), 20 * 0.4730 * 0.6, places=4)

    def test_endpoint_override(self):
        settings = make_settings(Path("/tmp"), endpoint="me/custom")
        self.assertEqual(settings.resolved_endpoint(), "me/custom")

    def test_parse_set_reads_json_values(self):
        parsed = parse_set(["camera_fixed=true", "steps=30", "note=hello world"])
        self.assertEqual(parsed, {"camera_fixed": True, "steps": 30, "note": "hello world"})


class TestProviders(unittest.TestCase):
    def test_fal_payload_field_names(self):
        payload = FalProvider("bytedance/seedance-2.5/reference-to-video").build_payload(
            GenRequest(prompt="p", video_urls=["u"], duration="8", aspect_ratio="16:9", seed=3)
        )
        self.assertEqual(payload["video_urls"], ["u"])
        self.assertEqual(payload["duration"], "8")
        self.assertEqual(payload["aspect_ratio"], "16:9")
        self.assertEqual(payload["seed"], 3)

    def test_fal_payload_omits_auto_aspect_ratio(self):
        payload = FalProvider("e").build_payload(GenRequest(prompt="p", video_urls=["u"]))
        self.assertNotIn("aspect_ratio", payload)

    def test_extra_fields_are_merged(self):
        payload = FalProvider("e", {"camera_fixed": True}).build_payload(
            GenRequest(prompt="p", video_urls=["u"])
        )
        self.assertTrue(payload["camera_fixed"])

    def test_replicate_auto_duration_becomes_minus_one(self):
        payload = ReplicateProvider("bytedance/seedance-2.5").build_payload(
            GenRequest(prompt="p", video_urls=["u"])
        )
        self.assertEqual(payload["duration"], -1)

    def test_video_url_extraction_variants(self):
        self.assertEqual(extract_video_url({"video": {"url": "a"}}), "a")
        self.assertEqual(extract_video_url({"videos": [{"url": "b"}]}), "b")
        self.assertEqual(extract_video_url({"output": "c"}), "c")
        with self.assertRaises(RuntimeError):
            extract_video_url({"nothing": 1})


class TestManifest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_state_survives_reload(self):
        path = self.tmp / "_manifest.json"
        Manifest(path).update("a.mp4", status="done")
        self.assertTrue(Manifest(path).is_done("a.mp4"))

    def test_corrupt_manifest_is_backed_up_not_fatal(self):
        path = self.tmp / "_manifest.json"
        path.write_text("{ broken", encoding="utf-8")
        manifest = Manifest(path)
        manifest.update("a.mp4", status="done")
        self.assertTrue((self.tmp / "_manifest.json.bak").exists())
        self.assertEqual(manifest.summary(), {"done": 1})


class TestRetry(unittest.TestCase):
    def test_retries_then_succeeds(self):
        calls = {"n": 0}

        def flaky():
            calls["n"] += 1
            if calls["n"] < 2:
                raise RuntimeError("түр зуурын алдаа")
            return "ok"

        original = pipeline.time.sleep
        pipeline.time.sleep = lambda _s: None
        try:
            self.assertEqual(pipeline.with_retry(flaky, 3, "тест"), "ok")
        finally:
            pipeline.time.sleep = original
        self.assertEqual(calls["n"], 2)

    def test_gives_up_after_all_attempts(self):
        original = pipeline.time.sleep
        pipeline.time.sleep = lambda _s: None
        try:
            with self.assertRaises(RuntimeError):
                pipeline.with_retry(lambda: (_ for _ in ()).throw(RuntimeError("үргэлж")), 2, "тест")
        finally:
            pipeline.time.sleep = original


class FakeProvider(Provider):
    """Байршуулалт, хөрвүүлэлтийг дуурайж, оруулсан хэсгийг нь буцаана."""

    name = "fake"
    payloads: list[dict] = []

    def check_credentials(self) -> None:
        return None

    def upload(self, path: Path) -> str:
        return path.resolve().as_uri()

    def build_payload(self, req: GenRequest) -> dict:
        return {"prompt": req.prompt, "video_urls": list(req.video_urls), "duration": req.duration}

    def generate(self, payload: dict) -> GenResult:
        FakeProvider.payloads.append(payload)
        return GenResult(video_url=payload["video_urls"][0])


@unittest.skipUnless(media.has_ffmpeg(), "ffmpeg суулгаагүй")
class TestEndToEnd(unittest.TestCase):
    """Хуурамч provider‑тэй бүтэн урсгал: хэрчих → хөрвүүлэх → наах."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "in").mkdir(parents=True)
        self._make_clip(self.tmp / "in" / "богино.mp4", 6)
        self._make_clip(self.tmp / "in" / "urt clip.mp4", 25)
        FakeProvider.payloads = []
        self._real = pipeline.get_provider
        self._log = pipeline.log
        pipeline.get_provider = lambda name, endpoint, extra=None: FakeProvider(endpoint, extra)
        pipeline.log = lambda *_a, **_k: None

    def tearDown(self):
        pipeline.get_provider = self._real
        pipeline.log = self._log
        shutil.rmtree(self.tmp, ignore_errors=True)

    def _make_clip(self, path: Path, seconds: int):
        subprocess.run(
            [
                media.FFMPEG, "-y", "-v", "error",
                "-f", "lavfi", "-i", f"testsrc=size=320x240:rate=24:duration={seconds}",
                "-pix_fmt", "yuv420p", str(path),
            ],
            check=True,
        )

    def test_batch_preserves_names_and_length(self):
        settings = make_settings(self.tmp, chunk_seconds=10, concurrency=2)
        counts = pipeline.run_batch(settings, "@Video1 3D render")

        self.assertEqual(counts.get("done"), 2)
        self.assertTrue((self.tmp / "out" / "богино.mp4").exists())
        self.assertTrue((self.tmp / "out" / "urt clip.mp4").exists())

        # 25 секундын видео 10с‑ийн хэсгүүдэд хуваагдана
        self.assertEqual(len(FakeProvider.payloads), 4)
        self.assertTrue(all(p["prompt"].startswith("@Video1") for p in FakeProvider.payloads))

        length = media.probe_duration(self.tmp / "out" / "urt clip.mp4")
        self.assertAlmostEqual(length, 25, delta=1.5)
        self.assertFalse((self.tmp / "out" / ".work").exists())

    def test_rerun_skips_finished_files(self):
        settings = make_settings(self.tmp, chunk_seconds=10)
        pipeline.run_batch(settings, "@Video1 3D render")
        FakeProvider.payloads = []
        counts = pipeline.run_batch(settings, "@Video1 3D render")
        self.assertEqual(counts.get("skipped"), 2)
        self.assertEqual(FakeProvider.payloads, [])


@unittest.skipUnless(media.has_ffmpeg(), "ffmpeg суулгаагүй")
class TestCli(unittest.TestCase):
    """Аргументын холболт — 'plan' команд API дуудахгүйгээр ажиллана."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "in").mkdir(parents=True)
        subprocess.run(
            [
                media.FFMPEG, "-y", "-v", "error",
                "-f", "lavfi", "-i", "testsrc=size=320x240:rate=24:duration=8",
                "-pix_fmt", "yuv420p", str(self.tmp / "in" / "a.mp4"),
            ],
            check=True,
        )

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_plan_command_runs_without_network(self):
        import contextlib
        import io

        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer):
            code = cli_main(["plan", "-i", str(self.tmp / "in"), "-o", str(self.tmp / "out"), "--style", "clay"])
        self.assertEqual(code, 0)
        self.assertIn("a.mp4", buffer.getvalue())

    def test_bad_option_is_reported(self):
        import contextlib
        import io

        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer):
            code = cli_main(
                ["plan", "-i", str(self.tmp / "in"), "-o", str(self.tmp / "out"), "--chunk-seconds", "99"]
            )
        self.assertEqual(code, 2)


class FakeComfyHandler(BaseHTTPRequestHandler):
    """ComfyUI‑ийн HTTP гэрээг дуурайна: upload → prompt → history → view."""

    input_dir: Path = Path(".")
    graphs: dict[str, dict] = {}
    videos: dict[str, str] = {}

    def _json(self, payload: dict, code: int = 200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):  # noqa: N802
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/system_stats":
            return self._json({"system": {"comfyui_version": "test"}})
        if parsed.path.startswith("/history/"):
            prompt_id = parsed.path.rsplit("/", 1)[1]
            name = FakeComfyHandler.videos.get(prompt_id)
            if not name:
                return self._json({})
            return self._json(
                {
                    prompt_id: {
                        "status": {"status_str": "success", "completed": True},
                        "outputs": {
                            "14": {"videos": [{"filename": name, "subfolder": "v2v3d", "type": "input"}]}
                        },
                    }
                }
            )
        if parsed.path == "/view":
            query = urllib.parse.parse_qs(parsed.query)
            path = FakeComfyHandler.input_dir / query["subfolder"][0] / query["filename"][0]
            data = path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "video/mp4")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        return self._json({}, 404)

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        if self.path == "/upload/image":
            name, payload = _parse_multipart(body, self.headers.get("Content-Type", ""))
            target = FakeComfyHandler.input_dir / "v2v3d" / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
            return self._json({"name": name, "subfolder": "v2v3d", "type": "input"})
        if self.path == "/prompt":
            graph = json.loads(body)["prompt"]
            prompt_id = f"p{len(FakeComfyHandler.graphs) + 1}"
            FakeComfyHandler.graphs[prompt_id] = graph
            stored = graph["6"]["inputs"]["file"]
            FakeComfyHandler.videos[prompt_id] = stored.split("/")[-1]
            return self._json({"prompt_id": prompt_id})
        return self._json({}, 404)

    def log_message(self, *_args):
        return


def _parse_multipart(body: bytes, content_type: str) -> tuple[str, bytes]:
    boundary = content_type.split("boundary=")[1].encode()
    for part in body.split(b"--" + boundary):
        if b'filename="' not in part:
            continue
        head, _, payload = part.partition(b"\r\n\r\n")
        name = head.split(b'filename="')[1].split(b'"')[0].decode("utf-8")
        return name, payload.rstrip(b"\r\n")
    raise AssertionError("multipart дотор файл алга")


@unittest.skipUnless(media.has_ffmpeg(), "ffmpeg суулгаагүй")
class TestComfyEndToEnd(unittest.TestCase):
    """Хуурамч ComfyUI сервер дээр бүтэн багцыг гүйлгэнэ."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        (self.tmp / "in").mkdir(parents=True)
        subprocess.run(
            [
                media.FFMPEG, "-y", "-v", "error",
                "-f", "lavfi", "-i", "testsrc=size=320x240:rate=24:duration=12",
                "-pix_fmt", "yuv420p", str(self.tmp / "in" / "clip.mp4"),
            ],
            check=True,
        )
        FakeComfyHandler.input_dir = self.tmp / "comfy-input"
        FakeComfyHandler.graphs = {}
        FakeComfyHandler.videos = {}
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), FakeComfyHandler)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}"
        self._log = pipeline.log
        pipeline.log = lambda *_a, **_k: None

    def tearDown(self):
        pipeline.log = self._log
        self.server.shutdown()
        self.server.server_close()
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_full_batch_over_the_comfy_api(self):
        settings = make_settings(
            self.tmp,
            provider="comfy",
            endpoint=self.url,
            chunk_seconds=5,
            concurrency=2,
            extra={
                "workflow": str(WORKFLOW_PATH),
                "fps": 16,
                "poll_seconds": 0.01,
                "mapping": {},
                "overrides": {"10.steps": 6},
            },
        )
        counts = pipeline.run_batch(settings, build_prompt("blockout"))

        self.assertEqual(counts.get("done"), 1)
        self.assertTrue((self.tmp / "out" / "clip.mp4").exists())
        self.assertAlmostEqual(media.probe_duration(self.tmp / "out" / "clip.mp4"), 12, delta=1.5)

        # 12 секунд → 5 + 5 + 2.  Локал загварт 4 секундын доод хязгаар байхгүй.
        self.assertEqual(len(FakeComfyHandler.graphs), 3)
        for graph in FakeComfyHandler.graphs.values():
            self.assertNotIn("@Video1", graph["4"]["inputs"]["text"])
            self.assertIn("blockout", graph["4"]["inputs"]["text"])
            self.assertEqual(graph["10"]["inputs"]["steps"], 6)
            self.assertEqual((graph["8"]["inputs"]["length"] - 1) % 4, 0)
            self.assertTrue(graph["6"]["inputs"]["file"].endswith(".mp4"))

    def test_unreachable_server_gives_a_clear_error(self):
        provider = ComfyProvider("http://127.0.0.1:1", {"workflow": str(WORKFLOW_PATH)})
        with self.assertRaises(RuntimeError) as ctx:
            provider.check_credentials()
        self.assertIn("ComfyUI", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
