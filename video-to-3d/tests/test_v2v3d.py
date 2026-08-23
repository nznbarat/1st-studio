"""Сүлжээгүй тестүүд:  python3 -m unittest discover -s tests -v

Хамгийн сүүлийн тест нь fake provider‑тэй бүтэн урсгалыг шалгана
(ffmpeg байхгүй бол алгасна).
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from v2v3d import config as cfg  # noqa: E402
from v2v3d import media, pipeline  # noqa: E402
from v2v3d.cli import main as cli_main  # noqa: E402
from v2v3d.cli import parse_set  # noqa: E402
from v2v3d.config import Settings, estimate_cost  # noqa: E402
from v2v3d.manifest import Manifest  # noqa: E402
from v2v3d.providers import GenRequest, GenResult, Provider  # noqa: E402
from v2v3d.providers.fal import FalProvider, extract_video_url  # noqa: E402
from v2v3d.providers.replicate import ReplicateProvider  # noqa: E402
from v2v3d.styles import build_prompt, ensure_video_reference, load_styles  # noqa: E402


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


if __name__ == "__main__":
    unittest.main()
