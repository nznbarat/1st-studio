"""Replicate — bytedance/seedance-2.5.

Replicate дээрх талбарын нэрс fal‑аас өөр байж болзошгүй тул энд дүрсийг
(FIELD_MAP) орчны хувьсагчаар дарж болно.  Бодит нэрсийг харах:

    python -m v2v3d schema --provider replicate

Дараа нь жишээ нь:  export V2V3D_RP_VIDEO_FIELD=video_references
"""

from __future__ import annotations

import os
from pathlib import Path

from . import GenRequest, GenResult, Provider

ENV_KEYS = ("REPLICATE_API_TOKEN",)

# Анхдагч талбарын нэрс — schema командаар шалгаж, шаардвал дарна уу.
FIELD_MAP = {
    "prompt": os.environ.get("V2V3D_RP_PROMPT_FIELD", "prompt"),
    "videos": os.environ.get("V2V3D_RP_VIDEO_FIELD", "reference_videos"),
    "images": os.environ.get("V2V3D_RP_IMAGE_FIELD", "reference_images"),
    "duration": os.environ.get("V2V3D_RP_DURATION_FIELD", "duration"),
    "resolution": os.environ.get("V2V3D_RP_RESOLUTION_FIELD", "resolution"),
    "aspect_ratio": os.environ.get("V2V3D_RP_ASPECT_FIELD", "aspect_ratio"),
    "seed": os.environ.get("V2V3D_RP_SEED_FIELD", "seed"),
}

AUTO_DURATION = -1  # Replicate дээр "ухаалаг урт" гэсэн утга


class ReplicateProvider(Provider):
    name = "replicate"

    def _client(self):
        try:
            import replicate  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover - орчноос хамаарна
            raise RuntimeError(
                "replicate суулгаагүй байна:  pip install replicate"
            ) from exc
        return replicate

    def check_credentials(self) -> None:
        if not any(os.environ.get(k) for k in ENV_KEYS):
            raise RuntimeError(
                "REPLICATE_API_TOKEN орчны хувьсагч алга.  "
                "export REPLICATE_API_TOKEN=... гэж тохируулна уу."
            )

    def upload(self, path: Path) -> str:
        client = self._client()
        with path.open("rb") as fh:
            handle = client.files.create(fh)
        urls = getattr(handle, "urls", None) or {}
        url = urls.get("get") if isinstance(urls, dict) else None
        if not url:
            url = getattr(handle, "url", None)
        if not url:
            raise RuntimeError(f"{path.name}: Replicate байршуулалтаас хаяг ирсэнгүй")
        return url

    def build_payload(self, req: GenRequest) -> dict:
        fm = FIELD_MAP
        payload: dict = {
            fm["prompt"]: req.prompt,
            fm["videos"]: list(req.video_urls),
            fm["resolution"]: req.resolution,
            fm["duration"]: AUTO_DURATION if req.duration == "auto" else int(req.duration),
        }
        if req.image_urls:
            payload[fm["images"]] = list(req.image_urls)
        if req.aspect_ratio and req.aspect_ratio != "auto":
            payload[fm["aspect_ratio"]] = req.aspect_ratio
        if req.seed is not None:
            payload[fm["seed"]] = req.seed
        payload.update(self.extra)
        payload.update(req.extra)
        return payload

    def generate(self, payload: dict) -> GenResult:
        client = self._client()
        output = client.run(self.endpoint, input=payload)
        return GenResult(video_url=extract_video_url(output), raw={})

    def schema_url(self) -> str:
        owner, _, name = self.endpoint.partition("/")
        name = name.split(":")[0]
        return f"https://api.replicate.com/v1/models/{owner}/{name}"


def extract_video_url(output) -> str:
    """Replicate‑ийн хариунаас видеоны хаягийг гаргана."""
    if isinstance(output, str):
        return output
    url = getattr(output, "url", None)
    if isinstance(url, str):
        return url
    if isinstance(output, dict):
        for key in ("video", "output", "url"):
            node = output.get(key)
            if isinstance(node, str):
                return node
            if isinstance(node, dict) and isinstance(node.get("url"), str):
                return node["url"]
    if isinstance(output, (list, tuple)) and output:
        return extract_video_url(output[0])
    raise RuntimeError(f"Replicate хариу танигдахгүй: {type(output).__name__}")
