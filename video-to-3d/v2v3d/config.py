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


@dataclass(frozen=True)
class Limits:
    """Provider бүрийн уртын хязгаар (секунд)."""

    max_reference_seconds: int
    min_output_seconds: int
    max_output_seconds: int
    default_chunk_seconds: int


# Локал ComfyUI‑д API‑ийн хязгаар байхгүй — зөвхөн VRAM хязгаарлана.
PROVIDER_LIMITS = {
    "fal": Limits(MAX_REF_VIDEO_SECONDS, MIN_OUTPUT_SECONDS, MAX_OUTPUT_SECONDS, 10),
    "replicate": Limits(MAX_REF_VIDEO_SECONDS, MIN_OUTPUT_SECONDS, MAX_OUTPUT_SECONDS, 10),
    "comfy": Limits(30, 1, 30, 5),
}

# Төлбөргүй, өөрийн машин дээр ажилладаг provider‑ууд
LOCAL_PROVIDERS = {"comfy"}

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
    "comfy": "http://127.0.0.1:8188",
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
    max_ref_seconds: int | None = None   # provider‑ийн хязгаарыг дарах

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

    @property
    def limits(self) -> Limits:
        base = PROVIDER_LIMITS.get(self.provider, PROVIDER_LIMITS["fal"])
        if self.max_ref_seconds is None:
            return base
        return Limits(
            self.max_ref_seconds,
            base.min_output_seconds,
            min(base.max_output_seconds, self.max_ref_seconds),
            base.default_chunk_seconds,
        )

    @property
    def is_local(self) -> bool:
        return self.provider in LOCAL_PROVIDERS

    def validate(self) -> list[str]:
        """Ажиллуулахаас өмнөх шалгалт — алдааны жагсаалт буцаана."""
        errors: list[str] = []
        if self.provider not in DEFAULT_ENDPOINTS:
            errors.append(f"provider '{self.provider}' танигдахгүй байна")
        if self.resolution not in RESOLUTIONS:
            errors.append(f"resolution '{self.resolution}' буруу ({'/'.join(RESOLUTIONS)})")
        if self.aspect_ratio not in ASPECT_RATIOS:
            errors.append(f"aspect_ratio '{self.aspect_ratio}' буруу")
        limits = self.limits
        if self.duration != "auto":
            try:
                secs = int(self.duration)
            except ValueError:
                errors.append("duration нь 'auto' эсвэл бүхэл тоо байх ёстой")
            else:
                if not limits.min_output_seconds <= secs <= limits.max_output_seconds:
                    errors.append(
                        f"duration {limits.min_output_seconds}–{limits.max_output_seconds} "
                        "секундын хооронд байна"
                    )
        if self.chunk_seconds < limits.min_output_seconds:
            errors.append(f"chunk-seconds хамгийн багадаа {limits.min_output_seconds}")
        if self.chunk_seconds > limits.max_reference_seconds:
            errors.append(
                f"chunk-seconds хамгийн ихдээ {limits.max_reference_seconds} "
                "(лавлагааны уртын хязгаар)"
            )
        if self.long_video not in ("segment", "trim", "whole", "skip"):
            errors.append(f"long-video '{self.long_video}' буруу")
        if len(self.style_images) > MAX_REF_IMAGES:
            errors.append(f"style-image хамгийн ихдээ {MAX_REF_IMAGES} ширхэг")
        if self.concurrency < 1:
            errors.append("concurrency 1-ээс багагүй")
        return errors


def estimate_cost(
    reference_seconds: float, output_seconds: float, resolution: str, provider: str = "fal"
) -> float:
    """Нэг хүсэлтийн ойролцоо үнэ (USD).

    Видео лавлагаатай үед лавлагааны болон гаралтын секунд хоёулаа тооцогдож,
    нийт дүнд 0.6 үржвэр орно.
    """
    if provider in LOCAL_PROVIDERS:
        return 0.0
    rate = PRICE_PER_SECOND.get(resolution, PRICE_PER_SECOND["720p"])
    return (reference_seconds + output_seconds) * rate * REFERENCE_VIDEO_MULTIPLIER
