"""fal.ai — Seedance 2.5 reference-to-video.

Талбарын нэрс (2026-08): prompt, image_urls, video_urls, audio_urls,
resolution, duration, aspect_ratio, generate_audio, seed.
Схем өөрчлөгдвөл `python -m v2v3d schema` ажиллуулж шалгана уу.
"""

from __future__ import annotations

import os
from pathlib import Path

from . import GenRequest, GenResult, Provider

ENV_KEYS = ("FAL_KEY", "FAL_API_KEY")


class FalProvider(Provider):
    name = "fal"

    def _client(self):
        try:
            import fal_client  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover - орчноос хамаарна
            raise RuntimeError(
                "fal-client суулгаагүй байна:  pip install fal-client"
            ) from exc
        return fal_client

    def check_credentials(self) -> None:
        if not any(os.environ.get(k) for k in ENV_KEYS):
            raise RuntimeError(
                "FAL_KEY орчны хувьсагч алга.  export FAL_KEY=... гэж тохируулна уу."
            )
        # fal_client нь FAL_KEY‑г уншдаг тул нэрийг нь тэгшитгэнэ.
        if not os.environ.get("FAL_KEY"):
            os.environ["FAL_KEY"] = os.environ["FAL_API_KEY"]

    def upload(self, path: Path) -> str:
        return self._client().upload_file(str(path))

    def build_payload(self, req: GenRequest) -> dict:
        payload: dict = {
            "prompt": req.prompt,
            "video_urls": list(req.video_urls),
            "resolution": req.resolution,
            "duration": req.duration,
            "generate_audio": req.generate_audio,
        }
        if req.image_urls:
            payload["image_urls"] = list(req.image_urls)
        if req.aspect_ratio and req.aspect_ratio != "auto":
            payload["aspect_ratio"] = req.aspect_ratio
        if req.seed is not None:
            payload["seed"] = req.seed
        payload.update(self.extra)
        payload.update(req.extra)
        return payload

    def generate(self, payload: dict) -> GenResult:
        client = self._client()
        result = client.subscribe(self.endpoint, arguments=payload, with_logs=False)
        return GenResult(
            video_url=extract_video_url(result),
            request_id=result.get("request_id") if isinstance(result, dict) else None,
            raw=result if isinstance(result, dict) else {},
        )

    def schema_url(self) -> str:
        return (
            "https://fal.ai/api/openapi/queue/openapi.json"
            f"?endpoint_id={self.endpoint}"
        )


def extract_video_url(result) -> str:
    """Хариунаас видеоны хаягийг олно (схемийн хэд хэдэн хувилбарыг тэсвэрлэнэ)."""
    if isinstance(result, str):
        return result
    if not isinstance(result, dict):
        raise RuntimeError(f"хариу танигдахгүй: {type(result).__name__}")

    node = result.get("video") or result.get("output")
    if isinstance(node, dict) and node.get("url"):
        return node["url"]
    if isinstance(node, str):
        return node

    for key in ("videos", "outputs"):
        items = result.get(key)
        if isinstance(items, list) and items:
            first = items[0]
            if isinstance(first, dict) and first.get("url"):
                return first["url"]
            if isinstance(first, str):
                return first

    if isinstance(result.get("url"), str):
        return result["url"]
    raise RuntimeError(f"хариунаас видеоны хаяг олдсонгүй: {list(result)[:8]}")
