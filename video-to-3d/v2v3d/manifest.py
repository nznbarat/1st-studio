"""Багцын явцын бүртгэл — тасалдсан ажлыг үргэлжлүүлэхэд хэрэглэнэ."""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path


class Manifest:
    """output/_manifest.json дотор файл тус бүрийн төлвийг хадгална."""

    def __init__(self, path: Path):
        self.path = path
        self._lock = threading.Lock()
        self.data: dict = {"version": 1, "files": {}}
        if path.exists():
            try:
                loaded = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict) and "files" in loaded:
                    self.data = loaded
            except json.JSONDecodeError:
                # Эвдэрсэн бүртгэлээс болж ажил зогсох ёсгүй.
                backup = path.with_suffix(".json.bak")
                path.replace(backup)

    def get(self, key: str) -> dict:
        return self.data["files"].get(key, {})

    def is_done(self, key: str) -> bool:
        return self.get(key).get("status") == "done"

    def update(self, key: str, **fields) -> None:
        with self._lock:
            entry = self.data["files"].setdefault(key, {})
            entry.update(fields)
            entry["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            self._flush()

    def summary(self) -> dict[str, int]:
        counts: dict[str, int] = {}
        for entry in self.data["files"].values():
            status = entry.get("status", "unknown")
            counts[status] = counts.get(status, 0) + 1
        return counts

    def _flush(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(".json.tmp")
        tmp.write_text(
            json.dumps(self.data, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        tmp.replace(self.path)
