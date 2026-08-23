"""ComfyUI‑ийн API‑форматтай workflow дотор утга суулгах логик.

Хэрэглэгч ComfyUI‑гаасаа өөрийн workflow‑гоо „Save (API format)"‑оор
экспортлоод өгнө.  Энэ модуль тухайн workflow дотроос видео, промт, seed,
кадрын тоо зэрэг оруулах цэгүүдийг **автоматаар олж**, шаардвал гараар
зааж өгсөн (`--map`) хаягаар дарж бичнэ.  Сүлжээ шаардахгүй, цэвэр логик.
"""

from __future__ import annotations

import copy
import json
from dataclasses import dataclass
from pathlib import Path

# Оруулах цэг бүрийн нэр
TARGET_NAMES = (
    "video", "prompt", "negative", "seed", "frames", "width", "height", "fps", "strength",
)

VIDEO_CLASSES = ("LoadVideo", "VHS_LoadVideo", "LoadVideoUpload", "VHS_LoadVideoPath")
VIDEO_INPUTS = ("file", "video", "video_path")
TEXT_INPUTS = ("text", "prompt", "string")
SEED_INPUTS = ("seed", "noise_seed")
FRAME_INPUTS = ("length", "num_frames", "frame_count", "video_frames")
FPS_INPUTS = ("fps", "frame_rate")


class WorkflowError(RuntimeError):
    pass


@dataclass(frozen=True)
class Target:
    node_id: str
    input_name: str
    class_type: str = ""

    def __str__(self) -> str:
        return f"{self.node_id}.{self.input_name} ({self.class_type})"


def load_workflow(path: Path) -> dict:
    """API‑форматтай workflow унших (UI‑ийн формат биш эсэхийг шалгана)."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if "nodes" in data and "links" in data:
        raise WorkflowError(
            f"{path} нь UI‑ийн формат байна.  ComfyUI дотроо Settings → Dev Mode‑ыг "
            "асаагаад Workflow → Export (API) сонголтоор дахин хадгална уу."
        )
    if not isinstance(data, dict) or not data:
        raise WorkflowError(f"{path}: workflow хоосон эсвэл танигдахгүй")
    for node_id, node in data.items():
        if not isinstance(node, dict) or "class_type" not in node:
            raise WorkflowError(f"{path}: '{node_id}' зангилаа буруу бүтэцтэй")
    return data


def _is_link(value) -> bool:
    """[node_id, slot] хэлбэрийн холбоос эсэх."""
    return isinstance(value, list) and len(value) == 2 and isinstance(value[0], str)


def _nodes(workflow: dict):
    """Зангилаануудыг дугаараар нь эрэмбэлж давтана."""
    def key(item):
        try:
            return (0, int(item[0]))
        except ValueError:
            return (1, 0)

    return sorted(workflow.items(), key=key)


def _find_input(workflow: dict, names, classes=(), predicate=None) -> Target | None:
    """Тодорхой нэртэй оролт эхлээд сонгосон ангиас, дараа нь хаанаас ч хайна."""
    for want_class in (True, False):
        for node_id, node in _nodes(workflow):
            class_type = node.get("class_type", "")
            if want_class and classes and class_type not in classes:
                continue
            if want_class and not classes:
                continue
            inputs = node.get("inputs", {})
            for name in names:
                if name in inputs and not _is_link(inputs[name]):
                    if predicate and not predicate(class_type, inputs[name]):
                        continue
                    return Target(node_id, name, class_type)
    return None


def _find_conditioning(workflow: dict) -> tuple[Target | None, Target | None]:
    """positive/negative оролттой зангилаанаас текстийн эх сурвалж руу мөшгинө."""
    for _node_id, node in _nodes(workflow):
        inputs = node.get("inputs", {})
        if not (_is_link(inputs.get("positive")) and _is_link(inputs.get("negative"))):
            continue
        found = []
        for slot in ("positive", "negative"):
            target_id = inputs[slot][0]
            target_node = workflow.get(target_id, {})
            text = _text_input(target_node)
            found.append(Target(target_id, text, target_node.get("class_type", "")) if text else None)
        if found[0]:
            return found[0], found[1]
    # Мөшгиж чадаагүй бол эхний хоёр текст зангилааг авна.
    texts = [
        Target(node_id, name, node.get("class_type", ""))
        for node_id, node in _nodes(workflow)
        if (name := _text_input(node))
    ]
    return (texts[0] if texts else None, texts[1] if len(texts) > 1 else None)


def _text_input(node: dict) -> str | None:
    for name in TEXT_INPUTS:
        value = node.get("inputs", {}).get(name)
        if isinstance(value, str):
            return name
    return None


def resolve_targets(workflow: dict) -> dict[str, Target]:
    """Workflow дотроос оруулах цэгүүдийг автоматаар олно."""
    found: dict[str, Target] = {}

    video = _find_input(
        workflow, VIDEO_INPUTS, VIDEO_CLASSES,
    ) or _find_input(
        workflow, VIDEO_INPUTS, (),
        predicate=lambda _c, v: isinstance(v, str),
    )
    if video:
        found["video"] = video

    positive, negative = _find_conditioning(workflow)
    if positive:
        found["prompt"] = positive
    if negative:
        found["negative"] = negative

    for name, names, classes in (
        ("seed", SEED_INPUTS, ("KSampler", "KSamplerAdvanced", "RandomNoise")),
        ("frames", FRAME_INPUTS, ()),
        ("fps", FPS_INPUTS, ()),
    ):
        target = _find_input(workflow, names, classes)
        if target:
            found[name] = target

    size = _find_input(
        workflow, ("width",), (),
        predicate=lambda _c, v: isinstance(v, int),
    )
    if size and "height" in workflow[size.node_id].get("inputs", {}):
        found["width"] = size
        found["height"] = Target(size.node_id, "height", size.class_type)

    strength = _find_input(
        workflow, ("strength",), (),
        predicate=lambda class_type, _v: "vace" in class_type.lower(),
    )
    if strength:
        found["strength"] = strength
    return found


def parse_mapping(pairs: list[str]) -> dict[str, Target]:
    """--map video=12.file  →  {"video": Target("12", "file")}"""
    mapping: dict[str, Target] = {}
    for item in pairs:
        name, sep, address = item.partition("=")
        node_id, dot, input_name = address.partition(".")
        if not sep or not dot:
            raise WorkflowError(f"--map '{item}' буруу — НЭР=ЗАНГИЛАА.ОРОЛТ хэлбэртэй")
        if name not in TARGET_NAMES:
            raise WorkflowError(
                f"--map '{name}' танигдахгүй.  Боломжтой: {', '.join(TARGET_NAMES)}"
            )
        mapping[name] = Target(node_id.strip(), input_name.strip())
    return mapping


def apply_values(
    workflow: dict,
    values: dict,
    mapping: dict[str, Target] | None = None,
    overrides: dict | None = None,
) -> dict:
    """Утгуудыг суулгаж, шинэ workflow буцаана (эхийг өөрчлөхгүй)."""
    result = copy.deepcopy(workflow)
    targets = resolve_targets(result)
    targets.update(mapping or {})

    if "video" not in targets:
        raise WorkflowError(
            "Workflow дотроос видео оруулах зангилаа олдсонгүй — "
            "--map video=ЗАНГИЛАА.ОРОЛТ гэж зааж өгнө үү"
        )
    if "prompt" not in targets:
        raise WorkflowError(
            "Workflow дотроос промтын зангилаа олдсонгүй — "
            "--map prompt=ЗАНГИЛАА.ОРОЛТ гэж зааж өгнө үү"
        )

    for name, value in values.items():
        target = targets.get(name)
        if target is None or value is None:
            continue
        node = result.get(target.node_id)
        if node is None:
            raise WorkflowError(f"'{target.node_id}' зангилаа workflow дотор алга")
        node.setdefault("inputs", {})[target.input_name] = value

    for address, value in (overrides or {}).items():
        node_id, dot, input_name = str(address).partition(".")
        if not dot:
            raise WorkflowError(f"--set '{address}' буруу — ЗАНГИЛАА.ОРОЛТ=УТГА хэлбэртэй")
        node = result.get(node_id)
        if node is None:
            raise WorkflowError(f"--set: '{node_id}' зангилаа workflow дотор алга")
        node.setdefault("inputs", {})[input_name] = value
    return result


def frames_for(seconds: float, fps: int, multiple: int = 4, offset: int = 1) -> int:
    """Секундыг кадрын тоо болгоно.  Wan‑д 4n+1 (81, 121 …) хэлбэр таарна."""
    raw = max(1.0, seconds) * fps
    steps = max(1, round((raw - offset) / multiple))
    return steps * multiple + offset
