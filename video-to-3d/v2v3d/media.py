"""ffmpeg/ffprobe дээр суурилсан видео туслахууд.

Багц хөрвүүлэлтэд ffmpeg заавал хэрэгтэй: урт видеог хэрчих, хэсгүүдийг
буцааж наах, үргэлжлэх хугацааг мэдэх.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path


class MediaError(RuntimeError):
    pass


# Хөрвүүлэгчийн замыг орчны хувьсагчаар дарж болно (жишээ нь imageio-ffmpeg).
FFMPEG = os.environ.get("V2V3D_FFMPEG", "ffmpeg")
FFPROBE = os.environ.get("V2V3D_FFPROBE", "ffprobe")


def has_ffmpeg() -> bool:
    return bool(shutil.which(FFMPEG) or Path(FFMPEG).is_file())


def _has_ffprobe() -> bool:
    return bool(shutil.which(FFPROBE) or Path(FFPROBE).is_file())


def _run(cmd: list[str]) -> str:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        tail = (proc.stderr or "").strip().splitlines()[-5:]
        raise MediaError(f"{cmd[0]} алдаа: " + " | ".join(tail))
    return proc.stdout


def probe_duration(path: Path) -> float:
    """Видеоны урт секундээр."""
    if not _has_ffprobe():
        return _duration_from_ffmpeg(path)
    out = _run(
        [
            FFPROBE, "-v", "error",
            "-show_entries", "format=duration",
            "-of", "json", str(path),
        ]
    )
    try:
        return float(json.loads(out)["format"]["duration"])
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        raise MediaError(f"{path.name}: урт нь тодорхойгүй ({exc})") from exc


def _duration_from_ffmpeg(path: Path) -> float:
    """ffprobe байхгүй үед ffmpeg‑ийн гаралтаас уртыг уншина."""
    proc = subprocess.run([FFMPEG, "-i", str(path)], capture_output=True, text=True)
    match = re.search(r"Duration:\s*(\d+):(\d\d):(\d\d(?:\.\d+)?)", proc.stderr or "")
    if not match:
        raise MediaError(f"{path.name}: урт нь тодорхойгүй (ffprobe олдсонгүй)")
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


@dataclass(frozen=True)
class Segment:
    """Эх видеоны нэг хэсэг: эхлэх цэг ба урт (секунд)."""

    index: int
    start: float
    duration: float


def plan_segments(
    total_duration: float,
    chunk_seconds: int,
    mode: str,
    max_reference_seconds: int,
    min_segment: int = 4,
) -> list[Segment]:
    """Эх видеог хэрхэн хэсэглэхийг тооцно (сүлжээ шаардахгүй, цэвэр функц).

    mode:
      whole   — бүтнээр нь нэг хүсэлт (хязгаараас урт бол алдаа өгнө)
      trim    — эхний max_reference_seconds‑ыг л авна
      segment — chunk_seconds тутам хэрчинэ
      skip    — хязгаараас урт бол огт хийхгүй
    """
    total = max(0.0, float(total_duration))
    if total == 0:
        return []

    if mode == "whole":
        if total > max_reference_seconds:
            raise MediaError(
                f"видео {total:.1f}с — лавлагааны хязгаар {max_reference_seconds}с‑ээс урт "
                "(--long-video segment эсвэл trim ашиглана уу)"
            )
        return [Segment(0, 0.0, total)]

    if mode == "skip":
        if total > max_reference_seconds:
            return []
        return [Segment(0, 0.0, total)]

    if mode == "trim":
        return [Segment(0, 0.0, min(total, float(max_reference_seconds)))]

    if mode != "segment":
        raise MediaError(f"long-video горим '{mode}' танигдахгүй")

    step = float(min(chunk_seconds, max_reference_seconds))
    segments: list[Segment] = []
    start = 0.0
    while start < total - 0.05:
        length = min(step, total - start)
        segments.append(Segment(len(segments), start, length))
        start += step

    # Сүүлийн хэсэг хэт богино бол өмнөх хэсэгтээ нийлүүлнэ
    # (загвар 4 секундээс богино гаралт өгдөггүй).
    if len(segments) > 1 and segments[-1].duration < min_segment:
        last = segments.pop()
        prev = segments.pop()
        merged = prev.duration + last.duration
        if merged <= max_reference_seconds:
            segments.append(Segment(prev.index, prev.start, merged))
        else:
            segments.append(prev)
            segments.append(Segment(prev.index + 1, last.start, float(min_segment)))
    return segments


def cut(src: Path, seg: Segment, dest: Path, reencode: bool = False) -> Path:
    """Эх видеоноос нэг хэсгийг тасалж авна."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    codec = (
        ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac"]
        if reencode
        else ["-c", "copy"]
    )
    _run(
        [
            FFMPEG, "-y", "-v", "error",
            "-ss", f"{seg.start:.3f}",
            "-i", str(src),
            "-t", f"{seg.duration:.3f}",
            *codec,
            "-movflags", "+faststart",
            str(dest),
        ]
    )
    return dest


def concat(parts: list[Path], dest: Path) -> Path:
    """Хэсгүүдийг нэг файл болгож наана."""
    if not parts:
        raise MediaError("наах хэсэг алга")
    dest.parent.mkdir(parents=True, exist_ok=True)
    if len(parts) == 1:
        shutil.copyfile(parts[0], dest)
        return dest

    listing = dest.parent / f"{dest.stem}.concat.txt"
    listing.write_text(
        "".join(f"file '{p.resolve().as_posix()}'\n" for p in parts), encoding="utf-8"
    )
    try:
        _run(
            [
                FFMPEG, "-y", "-v", "error",
                "-f", "concat", "-safe", "0",
                "-i", str(listing),
                "-c", "copy", "-movflags", "+faststart",
                str(dest),
            ]
        )
    except MediaError:
        # Кодек зөрвөл дахин кодлож наана.
        _run(
            [
                FFMPEG, "-y", "-v", "error",
                "-f", "concat", "-safe", "0",
                "-i", str(listing),
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                "-c:a", "aac", "-movflags", "+faststart",
                str(dest),
            ]
        )
    finally:
        listing.unlink(missing_ok=True)
    return dest
