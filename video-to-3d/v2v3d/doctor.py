"""ComfyUI‑гийн workflow‑г ажиллуулахаас өмнө шалгах.

Сервер дээр байгаа зангилаанууд (`/object_info`)‑тай тулгаж, дутуу custom node,
байхгүй моделийн файл, буруу оролтын нэрийг **урьдчилж** олно.
Сүлжээний хэсэг нь CLI дээр, шалгалтын логик нь энд — тестлэхэд хялбар.
"""

from __future__ import annotations

ERROR = "error"
WARN = "warn"


def _declared_inputs(spec: dict) -> dict:
    inputs = spec.get("input", {}) or {}
    merged = {}
    for group in ("required", "optional", "hidden"):
        values = inputs.get(group)
        if isinstance(values, dict):
            merged.update(values)
    return merged


def _choices(entry) -> list | None:
    """Оролт combo (сонголтын жагсаалт) бол сонголтуудыг буцаана."""
    if isinstance(entry, list) and entry and isinstance(entry[0], list):
        return entry[0]
    return None


def check_workflow(workflow: dict, object_info: dict) -> list[tuple[str, str]]:
    """(түвшин, мессеж) хэлбэрийн жагсаалт буцаана.  Хоосон = бүх зүйл цэгцтэй."""
    issues: list[tuple[str, str]] = []

    for node_id, node in sorted(workflow.items(), key=lambda kv: str(kv[0]).zfill(6)):
        class_type = node.get("class_type", "?")
        spec = object_info.get(class_type)
        if spec is None:
            issues.append(
                (ERROR, f"[{node_id}] '{class_type}' зангилаа сервер дээр алга "
                        "— custom node суулгах эсвэл workflow‑гоо солих хэрэгтэй")
            )
            continue

        declared = _declared_inputs(spec)
        for name, value in (node.get("inputs") or {}).items():
            if isinstance(value, list) and len(value) == 2 and isinstance(value[0], str):
                continue  # холбоос — шалгах шаардлагагүй
            if name not in declared:
                issues.append(
                    (WARN, f"[{node_id}] {class_type}.{name} — сервер дээрх хувилбарт "
                           "ийм оролт алга (нэр өөрчлөгдсөн байж болно)")
                )
                continue
            options = _choices(declared[name])
            if options is not None and isinstance(value, str) and value not in options:
                sample = ", ".join(str(o) for o in options[:4]) or "(хоосон)"
                issues.append(
                    (ERROR, f"[{node_id}] {class_type}.{name} = '{value}' олдсонгүй.  "
                            f"Байгаа нь: {sample}{' …' if len(options) > 4 else ''}")
                )
    return issues


def summarize(issues: list[tuple[str, str]]) -> tuple[int, int]:
    errors = sum(1 for level, _ in issues if level == ERROR)
    warnings = len(issues) - errors
    return errors, warnings
