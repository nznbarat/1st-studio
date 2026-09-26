#!/usr/bin/env bash
# 1st Studio — cloud орчинд Blender 5.2.2 LTS-ээр скрипт ажиллуулна.
#
#   blender/run.sh blender/impact.py -- --angle pov --frames 192 --render out/x
#
# Container нь session бүрт шинээр үүсдэг тул bpy алга байвал өөрөө
# суулгана (~30 сек, 995 МБ). 5.1-ээс хойшхи bpy нь Python 3.13 шаарддаг —
# 3.11 дээр `pip index versions bpy` 5.0.1-ээс цааш юу ч харуулахгүй.
#
# Өөрийн компьютер дээр энэ хэрэггүй: blender -b -P blender/impact.py -- ...
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BPY_VERSION="${BPY_VERSION:-5.2.2}"
LIB="${BPY_LIB:-$ROOT/bpylib52}"
PY="${BPY_PYTHON:-python3.13}"

have() {
  PYTHONPATH="$LIB" "$PY" -c \
    "import bpy,sys; sys.exit(0 if bpy.app.version_string.split()[0]=='$BPY_VERSION' else 1)" \
    >/dev/null 2>&1
}
if ! have; then
  echo "[1st Studio] bpy $BPY_VERSION суулгаж байна ($LIB)..." >&2
  "$PY" -m pip install --quiet --disable-pip-version-check --upgrade \
      --target "$LIB" "bpy==$BPY_VERSION" >&2
fi
exec env PYTHONPATH="$LIB" "$PY" "$@"
