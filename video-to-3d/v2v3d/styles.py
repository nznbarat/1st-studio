"""Загварын промт бэлдэц (preset) уншиж, эцсийн промт угсарна."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

STYLES_FILE = Path(__file__).with_name("styles.json")

#  Seedance промтод видео лавлагааг ингэж дууддаг: @Video1 (эсвэл [Video1]).
VIDEO_TOKEN = "@Video1"


@dataclass(frozen=True)
class Style:
    id: str
    name: str
    desc: str
    prompt: str


def load_styles(path: Path | None = None) -> dict[str, Style]:
    data = json.loads((path or STYLES_FILE).read_text(encoding="utf-8"))
    return {
        s["id"]: Style(id=s["id"], name=s["name"], desc=s["desc"], prompt=s["prompt"])
        for s in data["styles"]
    }


def get_style(style_id: str, path: Path | None = None) -> Style:
    styles = load_styles(path)
    if style_id not in styles:
        raise KeyError(
            f"'{style_id}' гэсэн загвар алга. Боломжтой: {', '.join(styles)}"
        )
    return styles[style_id]


def ensure_video_reference(prompt: str) -> str:
    """Промтод видео лавлагаа байхгүй бол урд нь нэмнэ.

    Ингэхгүй бол загвар оруулсан видеог үл тоож, промтоос шинэ видео зохиочихно.
    """
    text = prompt.strip()
    lowered = text.lower()
    if "@video1" in lowered or "[video1]" in lowered:
        return text
    return f"{VIDEO_TOKEN} — {text}"


_LEADING_REF = re.compile(r"^[@\[]Video1\]?\s*[—–\-:]?\s*", re.IGNORECASE)
_INLINE_REF = re.compile(r"[@\[]Video1\]?", re.IGNORECASE)


def strip_video_reference(prompt: str) -> str:
    """Seedance‑ийн @Video1 тэмдэглэгээг энгийн үг болгоно.

    Локал загварууд (Wan, LTX) ийм лавлагааг ойлгодоггүй — видеог тусдаа
    оролтоор авдаг тул промтод нь ердийн өгүүлбэр байх нь дээр.
    """
    text = _LEADING_REF.sub("", prompt.strip())
    return _INLINE_REF.sub("the source video", text).strip()


def build_prompt(
    style_id: str = "3d-render",
    override: str | None = None,
    extra: str | None = None,
    styles_file: Path | None = None,
) -> str:
    """Эцсийн промт: --prompt давуутай, эс бөгөөс сонгосон preset."""
    base = override if override else get_style(style_id, styles_file).prompt
    if extra:
        base = f"{base.rstrip()} {extra.strip()}"
    return ensure_video_reference(base)
