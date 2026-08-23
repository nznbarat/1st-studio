"""Provider‑ийн нийтлэг интерфейс (fal.ai / Replicate)."""

from __future__ import annotations

import shutil
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class GenRequest:
    """Provider‑ээс хамааралгүй нэг хүсэлт."""

    prompt: str
    video_urls: list[str] = field(default_factory=list)
    image_urls: list[str] = field(default_factory=list)
    duration: str = "auto"
    resolution: str = "720p"
    aspect_ratio: str = "auto"
    generate_audio: bool = False
    seed: int | None = None
    extra: dict = field(default_factory=dict)


@dataclass
class GenResult:
    video_url: str
    request_id: str | None = None
    raw: dict = field(default_factory=dict)


class Provider:
    """Дэд ангиуд upload/build_payload/generate‑ийг гүйцээнэ."""

    name = "base"

    def __init__(self, endpoint: str, extra: dict | None = None):
        self.endpoint = endpoint
        self.extra = extra or {}

    # --- дэд ангиуд ---------------------------------------------------
    def check_credentials(self) -> None:
        raise NotImplementedError

    def upload(self, path: Path) -> str:
        raise NotImplementedError

    def build_payload(self, req: GenRequest) -> dict:
        raise NotImplementedError

    def generate(self, payload: dict) -> GenResult:
        raise NotImplementedError

    def schema_url(self) -> str:
        raise NotImplementedError


def download(url: str, dest: Path, timeout: int = 600) -> Path:
    """Гаралтын видеог татаж хадгална."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "v2v3d/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp, tmp.open("wb") as fh:
        shutil.copyfileobj(resp, fh, length=1 << 20)
    tmp.replace(dest)
    return dest


def get_provider(name: str, endpoint: str, extra: dict | None = None) -> Provider:
    if name == "fal":
        from .fal import FalProvider

        return FalProvider(endpoint, extra)
    if name == "replicate":
        from .replicate import ReplicateProvider

        return ReplicateProvider(endpoint, extra)
    raise KeyError(f"provider '{name}' танигдахгүй (fal | replicate)")
