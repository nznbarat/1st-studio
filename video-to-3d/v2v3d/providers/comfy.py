"""Локал ComfyUI — төлбөргүй, өөрийн GPU дээр ажиллана.

Ажиллах зарчим:
  1. /upload/image  — хэрчсэн хэсгийг ComfyUI‑ийн input хавтас руу байршуулна
  2. /prompt        — workflow дотор видео, промт, seed, кадрын тоог суулгаж илгээнэ
  3. /history/{id}  — дуустал нь тогтмол шалгана
  4. /view?...      — гарсан видеог татаж авна

Endpoint нь серверийн хаяг (анхдагч http://127.0.0.1:8188).
"""

from __future__ import annotations

import json
import mimetypes
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

from .. import comfy_workflow as wf
from ..styles import strip_video_reference
from . import GenRequest, GenResult, Provider

VIDEO_SUFFIXES = (".mp4", ".webm", ".mkv", ".mov", ".gif", ".m4v")
OUTPUT_KEYS = ("videos", "gifs", "images", "files")


class ComfyProvider(Provider):
    name = "comfy"

    def __init__(self, endpoint: str, extra: dict | None = None):
        super().__init__(endpoint.rstrip("/"), extra)
        self.client_id = str(uuid.uuid4())
        self.fps = int(self.extra.get("fps", 16))
        self.strength = self.extra.get("strength")
        self.timeout = int(self.extra.get("timeout", 3600))
        self.poll_seconds = float(self.extra.get("poll_seconds", 2.0))
        self.mapping = self.extra.get("mapping") or {}
        self.overrides = self.extra.get("overrides") or {}
        self._workflow_path = self.extra.get("workflow")
        self._workflow: dict | None = None

    # --- workflow -----------------------------------------------------
    @property
    def workflow(self) -> dict:
        if self._workflow is None:
            if not self._workflow_path:
                raise RuntimeError(
                    "--workflow заагаагүй байна.  ComfyUI‑гаасаа API‑форматтай "
                    "workflow экспортлож зааж өгнө үү "
                    "(жишээ: workflows/wan-vace-v2v.api.json)"
                )
            self._workflow = wf.load_workflow(Path(self._workflow_path))
        return self._workflow

    # --- Provider интерфейс -------------------------------------------
    def check_credentials(self) -> None:
        """Түлхүүр биш — сервер асаалттай эсэхийг шалгана."""
        try:
            self._get("/system_stats")
        except OSError as exc:
            raise RuntimeError(
                f"ComfyUI сервер ({self.endpoint}) хариу өгсөнгүй: {exc}\n"
                "   ComfyUI‑гаа асааж, --endpoint‑ыг зөв зааж өгнө үү."
            ) from exc
        self.workflow  # workflow‑г эрт уншиж алдааг эрт мэдэх

    def upload(self, path: Path) -> str:
        """Видеог ComfyUI‑ийн input хавтас руу байршуулж, файлын нэрийг буцаана."""
        body, content_type = _multipart(
            {"type": "input", "subfolder": "v2v3d", "overwrite": "true"},
            "image",
            path,
        )
        request = urllib.request.Request(
            f"{self.endpoint}/upload/image",
            data=body,
            headers={"Content-Type": content_type},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=300) as resp:
            info = json.loads(resp.read().decode("utf-8"))
        name = info.get("name") or path.name
        subfolder = info.get("subfolder") or ""
        return f"{subfolder}/{name}" if subfolder else name

    def build_payload(self, req: GenRequest) -> dict:
        seconds = float(req.duration) if req.duration != "auto" else 5.0
        width, height = _size_for(req.resolution, req.aspect_ratio)
        values = {
            "video": req.video_urls[0] if req.video_urls else None,
            "prompt": strip_video_reference(req.prompt),
            "seed": req.seed if req.seed is not None else int(uuid.uuid4().int % (2**31)),
            "frames": wf.frames_for(seconds, self.fps),
            "fps": self.fps,
            "width": width,
            "height": height,
            "strength": self.strength,
        }
        prompt_graph = wf.apply_values(self.workflow, values, self.mapping, self.overrides)
        return {"prompt": prompt_graph, "client_id": self.client_id}

    def generate(self, payload: dict) -> GenResult:
        prompt_id = self._post("/prompt", payload).get("prompt_id")
        if not prompt_id:
            raise RuntimeError("ComfyUI prompt_id буцаасангүй")

        deadline = time.time() + self.timeout
        while time.time() < deadline:
            history = self._get(f"/history/{prompt_id}").get(prompt_id)
            if history:
                status = history.get("status", {})
                if status.get("status_str") == "error" or status.get("completed") is False:
                    raise RuntimeError(f"ComfyUI алдаа: {_error_text(status)}")
                url = self._output_url(history.get("outputs", {}))
                if url:
                    return GenResult(video_url=url, request_id=prompt_id, raw=history)
            time.sleep(self.poll_seconds)
        raise RuntimeError(f"ComfyUI {self.timeout}с дотор дуусгасангүй (prompt {prompt_id})")

    def schema_url(self) -> str:
        return f"{self.endpoint}/object_info"

    # --- дотоод -------------------------------------------------------
    def _output_url(self, outputs: dict) -> str | None:
        for node_output in outputs.values():
            for key in OUTPUT_KEYS:
                for item in node_output.get(key, []) or []:
                    if not isinstance(item, dict) or not item.get("filename"):
                        continue
                    if key == "images" and not item["filename"].lower().endswith(VIDEO_SUFFIXES):
                        continue
                    query = urllib.parse.urlencode(
                        {
                            "filename": item["filename"],
                            "subfolder": item.get("subfolder", ""),
                            "type": item.get("type", "output"),
                        }
                    )
                    return f"{self.endpoint}/view?{query}"
        return None

    def _get(self, path: str) -> dict:
        request = urllib.request.Request(
            f"{self.endpoint}{path}", headers={"User-Agent": "v2v3d/1.0"}
        )
        with urllib.request.urlopen(request, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8") or "{}")

    def _post(self, path: str, body: dict) -> dict:
        data = json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            f"{self.endpoint}{path}",
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=120) as resp:
                return json.loads(resp.read().decode("utf-8") or "{}")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:600]
            raise RuntimeError(f"ComfyUI {exc.code}: {detail}") from exc


def _error_text(status: dict) -> str:
    messages = status.get("messages") or []
    for entry in reversed(messages):
        if isinstance(entry, list) and len(entry) == 2 and "error" in str(entry[0]).lower():
            return json.dumps(entry[1], ensure_ascii=False)[:400]
    return status.get("status_str", "тодорхойгүй")


def _size_for(resolution: str, aspect_ratio: str) -> tuple[int, int]:
    """Нягтрал ба харьцаанаас өргөн/өндрийг тооцно (16‑д хуваагдана)."""
    short_side = {"480p": 480, "720p": 720, "1080p": 1080}.get(resolution, 720)
    ratios = {
        "16:9": (16, 9), "9:16": (9, 16), "1:1": (1, 1), "4:3": (4, 3),
        "3:4": (3, 4), "21:9": (21, 9), "9:21": (9, 21),
    }
    width_ratio, height_ratio = ratios.get(aspect_ratio, (16, 9))
    if width_ratio >= height_ratio:
        height = short_side
        width = round(short_side * width_ratio / height_ratio)
    else:
        width = short_side
        height = round(short_side * height_ratio / width_ratio)
    return _round16(width), _round16(height)


def _round16(value: int) -> int:
    return max(16, int(round(value / 16)) * 16)


def _multipart(fields: dict, file_field: str, path: Path) -> tuple[bytes, str]:
    """multipart/form-data биеийг гараар угсарна (гадны сан хэрэггүй)."""
    boundary = f"----v2v3d{uuid.uuid4().hex}"
    line = f"--{boundary}".encode()
    parts: list[bytes] = []
    for key, value in fields.items():
        parts += [
            line,
            f'Content-Disposition: form-data; name="{key}"'.encode(),
            b"",
            str(value).encode("utf-8"),
        ]
    mime = mimetypes.guess_type(path.name)[0] or "video/mp4"
    parts += [
        line,
        f'Content-Disposition: form-data; name="{file_field}"; filename="{path.name}"'.encode(),
        f"Content-Type: {mime}".encode(),
        b"",
        path.read_bytes(),
        f"--{boundary}--".encode(),
        b"",
    ]
    return b"\r\n".join(parts), f"multipart/form-data; boundary={boundary}"
