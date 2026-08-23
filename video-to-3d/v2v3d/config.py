"""Тохиргоо, хязгаар, үнийн тооцоо."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

# ---------------------------------------------------------------------------
# Загварын хязгаарууд (Seedance 2.5 reference-to-video, fal.ai)
# Эх сурвалж: fal.ai загварын хуудас, 2026-08.
# Provider схем өөрчлөгдвөл CLI-ийн тохиргоогоор дарж болно.
# ---------------------------------------------------------------------------
MAX_REF_VIDEOS = 10          # нэг хүсэлтэд оруулах видео лавлагааны тоо
MAX_REF_VIDEO_SECONDS = 30   # видео лавлагаануудын нийт урт (ойролцоогоор)
MAX_REF_IMAGES = 30
MIN_OUTPUT_SECONDS = 4
MAX_OUTPUT_SECONDS = 30

RESOLUTIONS = ("480p", "720p", "1080p")
ASPECT_RATIOS = ("16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "9:21", "auto")

# Секунд тутмын үнэ (USD). Видео лавлагаа хавсаргавал лавлагааны секунд ч
# тооцогдоод, нийт дүн 0.6-аар үржигдэнэ.
PRICE_PER_SECOND = {"480p": 0.2205, "720p": 0.4730, "1080p": 0.9460}
REFERENCE_VIDEO_MULTIPLIER = 0.6

VIDEO_EXTENSIONS = (".mp4", ".mov", ".m4v", ".mkv", ".webm")

# Provider бүрийн анхдагч endpoint. Схем шинэчлэгдвэл --endpoint-оор солино.
DEFAULT_ENDPOINTS = {
    "fal": "bytedance/seedance-2.5/reference-to-video",
    "replicate": "bytedance/seedance-2.5",
}


@dataclass
class Settings:
    """Нэг багц ажиллуулалтын бүх тохиргоо."""

    input_dir: Path
    output_dir: Path
    provider: str = "fal"
    endpoint: str | None = None

    prompt: str = ""
    style: str = "3d-render"

    resolution: str = "720p"
    aspect_ratio: str = "auto"
    duration: str = "auto"          # "auto" эсвэл 4–30 секунд
    generate_audio: bool = False
    seed: int | None = None
    style_images: list[str] = field(default_factory=list)

    # Урт видеог хэрхэн зохицуулах
    long_video: str = "segment"     # segment | trim | whole | skip
    chunk_seconds: int = 10
    reencode_split: bool = False

    # Багцын горим
    recursive: bool = False
    extensions: tuple[str, ...] = VIDEO_EXTENSIONS
    concurrency: int = 2
    retries: int = 3
    limit: int | None = None
    overwrite: bool = False
    dry_run: bool = False
    keep_work: bool = False
    work_dir: Path | None = None

    # Provider‑ийн payload‑д шууд нэмэх талбарууд (--set key=value)
    extra: dict = field(default_factory=dict)

    def resolved_endpoint(self) -> str:
        return self.endpoint or DEFAULT_ENDPOINTS[self.provider]

    def validate(self) -> list[str]:
        """Ажиллуулахаас өмнөх шалгалт — алдааны жагсаалт буцаана."""
        errors: list[str] = []
        if self.provider not in DEFAULT_ENDPOINTS:
            errors.append(f"provider '{self.provider}' танигдахгүй байна")
        if self.resolution not in RESOLUTIONS:
            errors.append(f"resolution '{self.resolution}' буруу ({'/'.join(RESOLUTIONS)})")
        if self.aspect_ratio not in ASPECT_RATIOS:
            errors.append(f"aspect_ratio '{self.aspect_ratio}' буруу")
        if self.duration != "auto":
            try:
                secs = int(self.duration)
            except ValueError:
                errors.append("duration нь 'auto' эсвэл бүхэл тоо байх ёстой")
            else:
                if not MIN_OUTPUT_SECONDS <= secs <= MAX_OUTPUT_SECONDS:
                    errors.append(
                        f"duration {MIN_OUTPUT_SECONDS}–{MAX_OUTPUT_SECONDS} секундын хооронд байна"
                    )
        if self.chunk_seconds < MIN_OUTPUT_SECONDS:
            errors.append(f"chunk-seconds хамгийн багадаа {MIN_OUTPUT_SECONDS}")
        if self.chunk_seconds > MAX_REF_VIDEO_SECONDS:
            errors.append(
                f"chunk-seconds хамгийн ихдээ {MAX_REF_VIDEO_SECONDS} "
                "(видео лавлагааны хязгаар)"
            )
        if self.long_video not in ("segment", "trim", "whole", "skip"):
            errors.append(f"long-video '{self.long_video}' буруу")
        if len(self.style_images) > MAX_REF_IMAGES:
            errors.append(f"style-image хамгийн ихдээ {MAX_REF_IMAGES} ширхэг")
        if self.concurrency < 1:
            errors.append("concurrency 1-ээс багагүй")
        return errors


def estimate_cost(reference_seconds: float, output_seconds: float, resolution: str) -> float:
    """Нэг хүсэлтийн ойролцоо үнэ (USD).

    Видео лавлагаатай үед лавлагааны болон гаралтын секунд хоёулаа тооцогдож,
    нийт дүнд 0.6 үржвэр орно.
    """
    rate = PRICE_PER_SECOND.get(resolution, PRICE_PER_SECOND["720p"])
    return (reference_seconds + output_seconds) * rate * REFERENCE_VIDEO_MULTIPLIER
