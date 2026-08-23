"""Багц хөрвүүлэлтийн гол урсгал.

Файл бүрийн зам:
  хайх → урт хэмжих → хэсэглэх → хэсгийг байршуулах → загвараар хөрвүүлэх
  → татаж авах → буцаан наах → /output дотор эх нэрээр нь хадгалах.
"""

from __future__ import annotations

import shutil
import threading
import time
import traceback
from dataclasses import dataclass, field
from pathlib import Path

from . import config as cfg
from . import media
from .config import Settings, estimate_cost
from .manifest import Manifest
from .media import Segment
from .providers import GenRequest, Provider, download, get_provider

_print_lock = threading.Lock()


def log(message: str) -> None:
    with _print_lock:
        print(message, flush=True)


# ---------------------------------------------------------------------------
# Файл хайх ба гаралтын зам
# ---------------------------------------------------------------------------
def discover(input_dir: Path, extensions=cfg.VIDEO_EXTENSIONS, recursive: bool = False) -> list[Path]:
    """Хавтаснаас видео файлуудыг олж, нэрээр эрэмбэлж буцаана."""
    exts = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in extensions}
    pattern = "**/*" if recursive else "*"
    files = [
        p
        for p in input_dir.glob(pattern)
        if p.is_file() and p.suffix.lower() in exts and not p.name.startswith(".")
    ]
    return sorted(files, key=lambda p: str(p).lower())


def output_path_for(src: Path, input_dir: Path, output_dir: Path, recursive: bool = False) -> Path:
    """Эх нэрийг хадгална; recursive үед дэд хавтасны бүтцийг ч хадгална."""
    if recursive:
        try:
            relative = src.resolve().relative_to(input_dir.resolve())
        except ValueError:
            relative = Path(src.name)
    else:
        relative = Path(src.name)
    return output_dir / relative.with_suffix(".mp4")


def segment_duration_arg(seg: Segment, settings: Settings) -> str:
    """Хэсэг бүрийн гаралтын урт.

    duration='auto' үед эх хэсгийн урттай тэнцүү болгож, монтажийн хэмнэлийг
    хадгална (загварын зөвшөөрөх 4–30 секундын хүрээнд).
    """
    if settings.duration != "auto":
        return settings.duration
    limits = settings.limits
    secs = int(round(seg.duration))
    secs = max(limits.min_output_seconds, min(limits.max_output_seconds, secs))
    return str(secs)


# ---------------------------------------------------------------------------
# Нэг файлын төлөвлөгөө
# ---------------------------------------------------------------------------
@dataclass
class FilePlan:
    src: Path
    dest: Path
    duration: float
    segments: list[Segment] = field(default_factory=list)
    skipped: str | None = None       # алгассан шалтгаан
    cost: float = 0.0

    @property
    def key(self) -> str:
        return self.src.name


def plan_file(src: Path, settings: Settings, probe=None) -> FilePlan:
    """Нэг файлыг хэрхэн хөрвүүлэхийг тооцно (API дуудахгүй)."""
    probe = probe or media.probe_duration
    dest = output_path_for(src, settings.input_dir, settings.output_dir, settings.recursive)

    if dest.exists() and not settings.overwrite:
        return FilePlan(src, dest, 0.0, [], skipped="аль хэдийн байна")

    try:
        duration = probe(src)
    except media.MediaError as exc:
        return FilePlan(src, dest, 0.0, [], skipped=str(exc))

    try:
        segments = media.plan_segments(
            duration,
            settings.chunk_seconds,
            settings.long_video,
            settings.limits.max_reference_seconds,
            settings.limits.min_output_seconds,
        )
    except media.MediaError as exc:
        return FilePlan(src, dest, duration, [], skipped=str(exc))

    if not segments:
        return FilePlan(
            src, dest, duration, [],
            skipped=(
                f"{duration:.1f}с — лавлагааны "
                f"{settings.limits.max_reference_seconds}с хязгаараас урт"
            ),
        )

    plan = FilePlan(src, dest, duration, segments)
    plan.cost = sum(
        estimate_cost(
            seg.duration,
            float(segment_duration_arg(seg, settings)),
            settings.resolution,
            settings.provider,
        )
        for seg in segments
    )
    return plan


def plan_batch(settings: Settings, probe=None) -> list[FilePlan]:
    files = discover(settings.input_dir, settings.extensions, settings.recursive)
    if settings.limit:
        files = files[: settings.limit]
    return [plan_file(f, settings, probe) for f in files]


# ---------------------------------------------------------------------------
# Гүйцэтгэл
# ---------------------------------------------------------------------------
def with_retry(fn, retries: int, label: str):
    """Түр зуурын алдаанд экспоненциал хүлээлттэйгээр дахин оролдоно."""
    delay = 2.0
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            return fn()
        except Exception as exc:  # noqa: BLE001 — provider бүр өөр алдаа шиднэ
            last = exc
            if attempt == retries:
                break
            log(f"   ↻ {label}: {exc} — {delay:.0f}с дараа дахин ({attempt}/{retries - 1})")
            time.sleep(delay)
            delay *= 2
    raise last  # type: ignore[misc]


def convert_segment(
    plan: FilePlan,
    seg: Segment,
    settings: Settings,
    provider: Provider,
    prompt: str,
    work_dir: Path,
    image_urls: list[str],
) -> Path:
    """Нэг хэсгийг хөрвүүлж, татаж авсан файлын замыг буцаана."""
    single = len(plan.segments) == 1
    piece = work_dir / f"{plan.src.stem}.part{seg.index:03d}{plan.src.suffix}"
    if single and settings.long_video == "whole":
        source_piece = plan.src
    else:
        source_piece = media.cut(plan.src, seg, piece, settings.reencode_split)

    url = with_retry(
        lambda: provider.upload(source_piece), settings.retries, f"{plan.key} байршуулах"
    )
    request = GenRequest(
        prompt=prompt,
        video_urls=[url],
        image_urls=image_urls,
        duration=segment_duration_arg(seg, settings),
        resolution=settings.resolution,
        aspect_ratio=settings.aspect_ratio,
        generate_audio=settings.generate_audio,
        seed=settings.seed,
    )
    payload = provider.build_payload(request)
    result = with_retry(
        lambda: provider.generate(payload), settings.retries, f"{plan.key} хөрвүүлэх"
    )

    out_piece = work_dir / f"{plan.src.stem}.out{seg.index:03d}.mp4"
    with_retry(
        lambda: download(result.video_url, out_piece), settings.retries, f"{plan.key} татах"
    )
    return out_piece


def process_file(
    plan: FilePlan,
    settings: Settings,
    provider: Provider,
    prompt: str,
    manifest: Manifest,
    image_urls: list[str],
) -> str:
    """Нэг файлыг бүрэн хөрвүүлнэ.  Төлвийг ('done'|'skipped'|'error') буцаана."""
    if plan.skipped:
        log(f"⏭  {plan.key} — {plan.skipped}")
        manifest.update(plan.key, status="skipped", reason=plan.skipped)
        return "skipped"

    work_dir = (settings.work_dir or settings.output_dir / ".work") / plan.src.stem
    work_dir.mkdir(parents=True, exist_ok=True)
    manifest.update(
        plan.key,
        status="running",
        source=str(plan.src),
        output=str(plan.dest),
        duration=round(plan.duration, 2),
        segments=len(plan.segments),
        provider=settings.provider,
        endpoint=settings.resolved_endpoint(),
        estimated_cost_usd=round(plan.cost, 4),
    )

    try:
        pieces: list[Path] = []
        for seg in plan.segments:
            log(
                f"   ▸ {plan.key} [{seg.index + 1}/{len(plan.segments)}] "
                f"{seg.start:.1f}–{seg.start + seg.duration:.1f}с"
            )
            pieces.append(
                convert_segment(plan, seg, settings, provider, prompt, work_dir, image_urls)
            )

        plan.dest.parent.mkdir(parents=True, exist_ok=True)
        media.concat(pieces, plan.dest)
        manifest.update(plan.key, status="done", error=None)
        log(f"✅ {plan.key} → {plan.dest}")
        if not settings.keep_work:
            shutil.rmtree(work_dir, ignore_errors=True)
        return "done"
    except Exception as exc:  # noqa: BLE001
        manifest.update(plan.key, status="error", error=str(exc))
        log(f"❌ {plan.key} — {exc}")
        if settings.keep_work:
            log(traceback.format_exc())
        return "error"


def run_batch(settings: Settings, prompt: str) -> dict[str, int]:
    """Бүх файлыг хөрвүүлж, төлвийн тоог буцаана."""
    from concurrent.futures import ThreadPoolExecutor

    plans = plan_batch(settings)
    if not plans:
        log(f"⚠️  {settings.input_dir} дотор видео файл олдсонгүй")
        return {}

    provider = get_provider(settings.provider, settings.resolved_endpoint(), settings.extra)
    provider.check_credentials()

    manifest = Manifest(settings.output_dir / "_manifest.json")
    todo = [p for p in plans if not p.skipped]
    total_cost = sum(p.cost for p in todo)
    log(
        f"📦 {len(plans)} файл — хөрвүүлэх {len(todo)}, "
        f"хэсэг {sum(len(p.segments) for p in todo)}, "
        f"ойролцоо өртөг ${total_cost:.2f}"
    )

    image_urls: list[str] = []
    if settings.style_images and todo:
        for ref in settings.style_images:
            image_urls.append(
                ref if ref.startswith(("http://", "https://")) else provider.upload(Path(ref))
            )

    counts: dict[str, int] = {}
    with ThreadPoolExecutor(max_workers=settings.concurrency) as pool:
        futures = [
            pool.submit(process_file, plan, settings, provider, prompt, manifest, image_urls)
            for plan in plans
        ]
        for fut in futures:
            status = fut.result()
            counts[status] = counts.get(status, 0) + 1

    if not settings.keep_work:
        shutil.rmtree(settings.output_dir / ".work", ignore_errors=True)
    return counts
