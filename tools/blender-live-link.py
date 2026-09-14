# ══════════════════════════════════════════════════════════════
#  1st Studio — Blender Live Link
#  Blender дотор нэг удаа ажиллуулахад тогтмол "сонсож" эхэлнэ:
#  хөтчөөс шинэ .py экспорт татмагц Blender өөрөө шинэчилнэ.
#
#  Ашиглах:
#    Blender → Scripting таб → Open → энэ файл → Run Script (Alt+P)
#    Зогсоохдоо дахин Run Script дарна.
#
#  Blender 4.4+ / 5.x (5.2 LTS дээр шалгасан)
# ══════════════════════════════════════════════════════════════
import bpy
import os
import glob
import time

# ── Тохиргоо ──────────────────────────────────────────────────
WATCH_DIR = ""                          # хоосон = Downloads-ыг автоматаар олно
PATTERN = "1st-studio-camera-*.py"      # ажиглах файлын хэв
INTERVAL = 1.5                          # шалгах давтамж (секунд)
SETTLE = 0.7                            # татаж дуусахыг хүлээх хугацаа (секунд)
APPLY_ON_START = True                   # эхлэнгүүт сүүлийн экспортыг оруулах эсэх

KEY = "_1st_studio_live_link"
_last = {"file": None, "mtime": None}


def watch_dir():
    """Ажиглах хавтсыг олно (WATCH_DIR → Downloads → home)."""
    if WATCH_DIR:
        return os.path.expanduser(WATCH_DIR)
    home = os.path.expanduser("~")
    for name in ("Downloads", "Татаж авсан файлууд", "Downloads (1)"):
        p = os.path.join(home, name)
        if os.path.isdir(p):
            return p
    return home


def newest_export():
    """Хавтас доторх хамгийн сүүлд бичигдсэн экспортыг буцаана."""
    files = glob.glob(os.path.join(watch_dir(), PATTERN))
    if not files:
        return None
    return max(files, key=os.path.getmtime)


def apply_file(path):
    """Экспортын скриптийг одоогийн Blender сесс дотор ажиллуулна."""
    with open(path, "r", encoding="utf-8") as fh:
        src = fh.read()
    ns = {"__name__": "__main__", "__file__": path}
    exec(compile(src, path, "exec"), ns)
    redraw()


def redraw():
    """Нээлттэй 3D харагдацуудыг шинэчилнэ (background горимд алгасна)."""
    wm = getattr(bpy.context, "window_manager", None)
    if not wm:
        return
    for win in wm.windows:
        screen = getattr(win, "screen", None)
        if screen:
            for area in screen.areas:
                area.tag_redraw()


def tick():
    """Таймерын нэг алхам. None буцаавал таймер зогсоно."""
    if not bpy.app.driver_namespace.get(KEY):
        print("[1st Studio] Live Link зогслоо.")
        return None

    path = newest_export()
    if path:
        mtime = os.path.getmtime(path)
        changed = (path != _last["file"]) or (mtime != _last["mtime"])
        # файл бүрэн бичигдэж дуусахыг хүлээнэ
        if changed and (time.time() - mtime) >= SETTLE:
            _last["file"] = path
            _last["mtime"] = mtime
            try:
                apply_file(path)
                print("[1st Studio] ✔ оруулж ирлээ: %s" % os.path.basename(path))
            except Exception as err:
                print("[1st Studio] ✘ алдаа (%s): %s" % (os.path.basename(path), err))
    return INTERVAL


def start():
    bpy.app.driver_namespace[KEY] = True
    _last["file"] = None
    _last["mtime"] = None
    if not APPLY_ON_START:
        path = newest_export()
        if path:
            _last["file"] = path
            _last["mtime"] = os.path.getmtime(path)
    bpy.app.timers.register(tick, first_interval=0.2, persistent=True)
    print("[1st Studio] ▶ Live Link аслаа — ажиглаж буй хавтас: %s" % watch_dir())
    print("[1st Studio]   хэв: %s · давтамж: %.1fс · зогсоох: дахин Run Script" % (PATTERN, INTERVAL))


def stop():
    bpy.app.driver_namespace[KEY] = False
    print("[1st Studio] ⏹ зогсоох хүсэлт илгээлээ.")


if bpy.app.driver_namespace.get(KEY):
    stop()
else:
    start()
