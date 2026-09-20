# ══════════════════════════════════════════════════════════════════════
#  1st Studio — Camera Director  →  Blender
#  Үүсгэсэн: 1970-01-01T00:00:00Z                                   #@DATE
#
#  ┌────────────────────────────────────────────────────────────────┐
#  │  ЯАЖ АЖИЛЛУУЛАХ ВЭ                                             │
#  │  1. Blender дээрээ файлаа ХАДГАЛ  (Ctrl + S)  ← заавал         │
#  │  2. Дээд талын «Scripting» таб ▸ Open ▸ энэ файл               │
#  │  3. «Run Script» товч  (эсвэл Alt + P)                         │
#  └────────────────────────────────────────────────────────────────┘
#
#  ⚠ ЮУ БОЛОХ ВЭ
#    • Скрипт өөрийнхөө үүсгэсэн объектыг л дарж бичнэ. Нэрийг нь
#      сольсон, эсвэл Shift+D-ээр хуулсан бол ТАНЫХ гэж үзэж хүрэхгүй.
#    • Дахин дахин ажиллуулж болно. Ctrl+P-ээр холбосон таны загвар
#      САЛАХГҮЙ — Empty байрандаа үлдэж, зөвхөн шинэ байрлал авна.
#    • fps, фреймийн муж, нягтрал, идэвхтэй камер — хуучныг чинь санаж авна.
#    • Лавлах хэлбэрүүд (wireframe) рендерт ОГТ гарахгүй.
#    • Хадгалаагүй файл дээр ажиллахаас ТАТГАЛЗАНА (доорх SAFETY).
#
#  ↩ БҮГДИЙГ БУЦААХ  —  гурван арга:
#    1) Ажилласны дараа гарах цонхон дээрх «бүгдийг арилгах» товч.
#       Эсвэл F3 дарж «1st Studio» гэж хайна.
#    2) Доорх  ACTION  мөрийг  "REMOVE"  болгоод дахин Run Script.
#    3) Blender ▸ File ▸ Revert — сүүлд хадгалсан хувилбар руу бүрэн буцна.
#    Аль нь ч таны загварыг устгахгүй — зөвхөн Empty-ээсээ салгана.
#
#  💡 Ctrl+Z бас ажиллана: Run Script дарахаас ӨМНӨХ төлөв рүү буцна
#     (хулганаа 3D цонхон дээр аваачаад дарна).
# ══════════════════════════════════════════════════════════════════════

# ─── ТОХИРГОО · хүсвэл өөрчил ─────────────────────────────────────────
ACTION      = "BUILD"  # "BUILD" = камерыг үүсгэнэ · "REMOVE" = бүгдийг арилгаж, тохиргоог сэргээнэ
SET_SCENE   = True     # fps / фреймийн муж / нягтралыг энэ шотынхоор солих уу
MAKE_REFS   = True     # дүр, объектын лавлах хэлбэр (wireframe) үүсгэх үү
SET_CAMERA  = True     # ShotCam-ыг Scene-ийн идэвхтэй камер болгох уу

SAFETY      = True     # хадгалаагүй файл дээр ажиллуулахгүй (маш чухал)
AUTO_BACKUP = True     # ажиллахын өмнө .blend-ийн нөөц хуулбар үлдээх
DRY_RUN     = False    # юунд ч хүрэлгүй, зөвхөн юу хийхээ хэлнэ
FORCE_OPTS  = False    # дээрх 3 тохиргоог .blend дотор хадгалсныг ДАРЖ бичих
# ──────────────────────────────────────────────────────────────────────

import bpy
import math
import os
import traceback

VERSION = "1st Studio 1.1"
STAMP        = "1970-01-01T00:00:00Z"   #@STAMP
MARK    = "1st_studio"          # манай өгөгдөл мөн эсэхийг заах тэмдэг
ROLE    = "1st_role"            # үүрэг: cam / target / subject / prop / model / anim
KEYID   = "1st_key"             # загварын хэзээ ч давтагдахгүй таних тэмдэг
POSE    = "1st_pose"            # бидний сүүлд бичсэн байрлал
SCENEOF = "1st_scene"           # аль тайзных вэ
REG     = "1st_studio_objects"  # бидний үүсгэсэн объектын нэрсийн бүртгэл
BACKUP  = "1st_studio_backup"   # хэрэглэгчийн хуучин тохиргоо
OPTS    = "1st_studio_opts"     # хэрэглэгчийн сонгосон горим
COLL    = "1stStudio_Layout"
TEXT    = "1stStudio_Prompt"
NOTE    = "# --- 1st Studio: доор өөрийн тэмдэглэлээ бичиж болно ---"

FPS          = 24                 #@FPS
FRAME_START  = 1                  #@FRAME_START
FRAME_END    = 120                #@FRAME_END
RES_X        = 1920               #@RES_X
RES_Y        = 1080               #@RES_Y
INTERPOLATION = "LINEAR"          #@INTERP

# (фрейм, камерын байрлал, эргэлт-квартернион (w,x,y,z), байны байрлал, линз мм)
#   · Эргэлтийг квартернионоор өгнө — Euler-ийн дараалал хөтөч ба Blender
#     дээр өөр учир зөрдөг. Квартернион дээр ямар ч зөрүү гарахгүй.
#   · Фрейм БҮРЭЭР шатаасан тул тойрох хөдөлгөөн Blender дээр ч яг дугуй
#     хэвээрээ гарна (зөвхөн түлхүүр кадр өгвөл Blender шулуунаар татдаг).
KEYS = [
#@KEYS
]

# (нэр, x, y, эргэлт_z, хэмжээ)
SUBJECTS = [
#@SUBJECTS
]

# (таних тэмдэг, харагдах нэр, төрөл, x, y, z, эргэлт_z, хэмжээ, өргөн, гүн, өндөр)
#   · загвар (model): хэмжээ = импортын автомат тааруулалттайгаа,
#                     өргөн/гүн/өндөр = загварын ЭХ хэмжээ
#   · бусад объект:   хэмжээ = 1.0, өргөн/гүн/өндөр = тайзан дээрх бодит хэмжээ
PROPS = [
#@PROPS
]

PROMPT = "\n".join([
#@PROMPT
])


# ══════════════════════════════════════════════════════════════════════
#  ТУСЛАХ ХЭСЭГ
# ══════════════════════════════════════════════════════════════════════

def say(*parts):
    """Консол руу бичнэ. Кирилл үсэг дэмжихгүй консол дээр ч унахгүй."""
    msg = " ".join(str(p) for p in parts)
    try:
        print("[1st Studio]", msg)
    except Exception:
        try:
            print("[1st Studio]", msg.encode("ascii", "replace").decode("ascii"))
        except Exception:
            pass


def popup(lines, title="1st Studio", icon="INFO", op=""):
    """Blender дотор жижиг цонхоор мэдэгдэнэ (харагдахгүй бол чимээгүй өнгөрнө)."""
    def draw(self, context):
        for ln in lines:
            self.layout.label(text=str(ln))
        if op:
            try:
                self.layout.separator()
                self.layout.operator(op, icon="TRASH")
            except Exception:
                pass
    try:
        bpy.context.window_manager.popup_menu(draw, title=title, icon=icon)
    except Exception:
        pass
    for ln in lines:
        say(ln)


def undo_mark(msg):
    """Undo стек дээр нэрлэсэн цэг үлдээнэ (Edit ▸ Undo History дотор харагдана)."""
    try:
        bpy.ops.ed.undo_push(message=msg)
        return True
    except Exception:
        return False


def is_ours(data):
    """Энэ объект/цуглуулгыг 1st Studio үүсгэсэн үү?"""
    try:
        return data.get(MARK) is not None
    except Exception:
        return False


def tag(data, role=None, scene=None):
    try:
        data[MARK] = VERSION + " " + STAMP
        if role is not None:
            data[ROLE] = role
        if scene is not None:
            data[SCENEOF] = scene.name
    except Exception:
        pass


def registry(scene):
    try:
        return set(str(n) for n in scene.get(REG, []))
    except Exception:
        return set()


def remember_owned(scene, objs):
    try:
        scene[REG] = [o.name for o in objs]
    except Exception:
        pass


def owned(scene, role=None):
    """Энэ ТАЙЗАН дээрх, манай тэмдэгтэй объектууд."""
    try:
        here = set(o.name for o in scene.objects)
    except Exception:
        here = None
    out = []
    for ob in bpy.data.objects:
        if not is_ours(ob):
            continue
        if here is not None and ob.name not in here:
            continue
        own_scene = ob.get(SCENEOF)
        if own_scene is not None and str(own_scene) != scene.name:
            continue
        if role is None or ob.get(ROLE) == role:
            out.append(ob)
    return out


def find_owned(scene, role):
    got = owned(scene, role)
    return got[0] if got else None


def split_ours(scene):
    """Бидний үүсгэснийг хэрэглэгч өөрийн болгосноос нь ялгана.

    Бүртгэлд байхгүй нэр = хэрэглэгч хуулсан (ShotCam.001) эсвэл нэрийг нь
    сольсон гэсэн үг. Тэдэнд хүрэхгүй.
    """
    reg = registry(scene)
    mine, theirs = [], []
    for ob in owned(scene):
        if reg and ob.name not in reg:
            theirs.append(ob.name)
        else:
            mine.append(ob)
    return mine, theirs


def in_object_mode():
    """Object горимд оруулна. Чадахгүй бол False буцаана."""
    try:
        ob = bpy.context.view_layer.objects.active
        if ob is not None and ob.mode != "OBJECT":
            bpy.ops.object.mode_set(mode="OBJECT")
    except Exception:
        pass
    try:
        return bpy.context.mode == "OBJECT"
    except Exception:
        return True


def unparent_keep_transform(ob):
    """Хүүхдүүдийг байрлалыг нь хөдөлгөлгүй эцгээс нь салгана."""
    for ch in list(ob.children):
        try:
            m = ch.matrix_world.copy()
            ch.parent = None
            ch.matrix_world = m
        except Exception:
            try:
                ch.parent = None
            except Exception:
                pass


def linked_somewhere(col, scene):
    """Энэ цуглуулга тайзан дээр аль нэг замаар холбогдсон уу?"""
    if col is scene.collection:
        return True
    try:
        for c in scene.collection.children_recursive:
            if c is col:
                return True
    except Exception:
        return col.name in scene.collection.children
    return False


def our_collection(scene, create=True):
    for col in bpy.data.collections:
        if is_ours(col) and col.get(ROLE) == "layout" and col.get(SCENEOF) in (None, scene.name):
            if not linked_somewhere(col, scene):
                try:
                    scene.collection.children.link(col)
                except Exception:
                    pass
            return col
    if not create:
        return None
    col = bpy.data.collections.new(COLL)
    tag(col, "layout", scene)
    scene.collection.children.link(col)
    return col


def link_only_to(ob, col):
    for c in list(ob.users_collection):
        if c is not col:
            try:
                c.objects.unlink(ob)
            except Exception:
                pass
    if ob.name not in col.objects:
        col.objects.link(ob)


def drop_action(id_data):
    """Хуучин анимацийг арилгана (өнчин Action үлдээхгүй)."""
    try:
        ad = id_data.animation_data
        if not ad:
            return
        act = ad.action
        id_data.animation_data_clear()
        if act is None:
            return
        if is_ours(act):
            try:
                act.use_fake_user = False
            except Exception:
                pass
        if act.users == 0 and not act.use_fake_user:
            bpy.data.actions.remove(act)
    except Exception:
        pass


def fcurves_of(id_data):
    """Blender 4.4+ slotted actions ба хуучин хувилбар хоёуланг дэмжинэ."""
    try:
        ad = id_data.animation_data
    except Exception:
        return []
    if not ad or not ad.action:
        return []
    act = ad.action
    try:
        if hasattr(act, "layers") and len(act.layers):
            slot = getattr(ad, "action_slot", None)
            for layer in act.layers:
                for strip in layer.strips:
                    cb = strip.channelbag(slot) if slot is not None else None
                    if cb is not None and len(cb.fcurves):
                        return list(cb.fcurves)
    except Exception:
        pass
    try:
        return list(act.fcurves)
    except Exception:
        return []


def set_interpolation(id_data, mode):
    """Тавьсан түлхүүр цэгийн тоог буцаана (0 бол хэрэглэгчид хэлнэ)."""
    n = 0
    for fc in fcurves_of(id_data):
        for kp in fc.keyframe_points:
            try:
                kp.interpolation = mode
                if mode == "BEZIER":
                    kp.handle_left_type = "AUTO_CLAMPED"
                    kp.handle_right_type = "AUTO_CLAMPED"
                n += 1
            except Exception:
                pass
        try:
            fc.update()
        except Exception:
            pass
    return n


# ─── Хэлбэр бүтээх (bpy.ops хэрэглэхгүй тул ямар ч горимд аюулгүй) ────

def mesh_box(name, w, d, h):
    x, y, z = w * 0.5, d * 0.5, h * 0.5
    verts = [(-x, -y, -z), (x, -y, -z), (x, y, -z), (-x, y, -z),
             (-x, -y, z), (x, -y, z), (x, y, z), (-x, y, z)]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1),
             (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    tag(me)
    return me


def mesh_cylinder(name, r, h, seg=16):
    verts, faces = [], []
    for i in range(seg):
        a = 2.0 * math.pi * i / seg
        verts.append((r * math.cos(a), r * math.sin(a), -h * 0.5))
    for i in range(seg):
        a = 2.0 * math.pi * i / seg
        verts.append((r * math.cos(a), r * math.sin(a), h * 0.5))
    for i in range(seg):
        j = (i + 1) % seg
        faces.append((i, j, seg + j, seg + i))
    faces.append(tuple(range(seg - 1, -1, -1)))
    faces.append(tuple(range(seg, seg * 2)))
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    tag(me)
    return me


def ref_object(scene, name, role, me, col):
    """Лавлах хэлбэр — утсан харагдацтай, РЕНДЕРТ ГАРАХГҮЙ."""
    ob = bpy.data.objects.new(name, me)
    tag(ob, role, scene)
    ob.display_type = "WIRE"
    ob.hide_render = True
    col.objects.link(ob)
    return ob


def purge_orphans():
    """Манай үүсгэсэн, хэн ч хэрэглэхгүй болсон өгөгдлийг арилгана."""
    for store in (bpy.data.actions, bpy.data.meshes, bpy.data.cameras):
        for item in list(store):
            if not is_ours(item):
                continue
            try:
                if item.use_fake_user:
                    item.use_fake_user = False
            except Exception:
                pass
            try:
                if item.users == 0:
                    store.remove(item)
            except Exception:
                pass


# ══════════════════════════════════════════════════════════════════════
#  АЮУЛГҮЙ БАЙДЛЫН УРЬДЧИЛСАН ШАЛГАЛТ
# ══════════════════════════════════════════════════════════════════════

def safety_check():
    """Буцаана: (үргэлжлүүлж болох уу, нөөц файлын зам)"""
    if not SAFETY:
        return True, ""
    if not bpy.data.is_saved:
        popup(["ЗОГС — файлаа хараахан хадгалаагүй байна.",
               "Скрипт юунд ч хүрсэнгүй.",
               "",
               "Эхлээд  File ▸ Save As…  дарж хадгална уу.",
               "Тэгж байж л дараа нь  File ▸ Revert  дарахад",
               "бүх юм хуучин хэвэндээ орно.",
               "",
               "(Мэдээж хадгалахгүй үргэлжлүүлэхийг хүсвэл дээрх",
               " SAFETY = False болгоно)"], icon="ERROR")
        return False, ""
    path = ""
    if AUTO_BACKUP:
        try:
            base = bpy.data.filepath
            path = base[:-6] + "_1stStudio-нөөц.blend" if base.lower().endswith(".blend") else base + "_нөөц.blend"
            bpy.ops.wm.save_as_mainfile(filepath=path, copy=True)
        except Exception as err:
            say("нөөц хуулбар хийж чадсангүй:", err)
            path = ""
    return True, path


def read_opts(scene):
    """Хэрэглэгчийн сонгосон горимыг .blend дотроос уншина."""
    global SET_SCENE, MAKE_REFS, SET_CAMERA
    if FORCE_OPTS:
        return
    o = scene.get(OPTS)
    if not o:
        return
    try:
        SET_SCENE = bool(o["set_scene"])
        MAKE_REFS = bool(o["make_refs"])
        SET_CAMERA = bool(o["set_camera"])
    except Exception:
        pass


def write_opts(scene):
    try:
        scene[OPTS] = {"set_scene": bool(SET_SCENE),
                       "make_refs": bool(MAKE_REFS),
                       "set_camera": bool(SET_CAMERA)}
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════════
#  ТОХИРГОО ХАДГАЛАХ / СЭРГЭЭХ
# ══════════════════════════════════════════════════════════════════════

def backup_settings(scene):
    if scene.get(BACKUP) is not None:
        return                      # хамгийн анхны тохиргоог л хадгална
    try:
        scene[BACKUP] = {
            "fps": int(scene.render.fps),
            "fps_base": float(scene.render.fps_base),
            "frame_start": int(scene.frame_start),
            "frame_end": int(scene.frame_end),
            "frame_current": int(scene.frame_current),
            "frame_step": int(getattr(scene, "frame_step", 1)),
            "res_x": int(scene.render.resolution_x),
            "res_y": int(scene.render.resolution_y),
            "res_pct": int(scene.render.resolution_percentage),
            "px_x": float(getattr(scene.render, "pixel_aspect_x", 1.0)),
            "px_y": float(getattr(scene.render, "pixel_aspect_y", 1.0)),
            "border": bool(getattr(scene.render, "use_border", False)),
            "camera": scene.camera.name if scene.camera else "",
        }
    except Exception:
        pass
    try:
        if scene.camera is not None:
            scene[BACKUP + "_cam"] = scene.camera     # нэр сольсон ч олдоно
    except Exception:
        pass


def _one(label, fn, failed):
    try:
        fn()
    except Exception:
        failed.append(label)


def restore_settings(scene):
    """Буцаана: (нөөц байсан уу, сэргээгдээгүй зүйлсийн жагсаалт)"""
    b = scene.get(BACKUP)
    if b is None:
        return False, []
    failed = []

    cam = None
    try:
        cam = scene.get(BACKUP + "_cam")
    except Exception:
        cam = None
    if cam is None:
        try:
            nm = str(b["camera"])
            cam = bpy.data.objects.get(nm) if nm else None
        except Exception:
            cam = None
    _one("идэвхтэй камер", lambda: setattr(scene, "camera", cam), failed)

    _one("fps", lambda: setattr(scene.render, "fps", int(b["fps"])), failed)
    _one("fps_base", lambda: setattr(scene.render, "fps_base", float(b["fps_base"])), failed)
    _one("фреймийн эхлэл", lambda: setattr(scene, "frame_start", int(b["frame_start"])), failed)
    _one("фреймийн төгсгөл", lambda: setattr(scene, "frame_end", int(b["frame_end"])), failed)
    _one("фреймийн алхам", lambda: setattr(scene, "frame_step", int(b.get("frame_step", 1))), failed)
    _one("нягтрал X", lambda: setattr(scene.render, "resolution_x", int(b["res_x"])), failed)
    _one("нягтрал Y", lambda: setattr(scene.render, "resolution_y", int(b["res_y"])), failed)
    _one("нягтралын %", lambda: setattr(scene.render, "resolution_percentage", int(b["res_pct"])), failed)
    _one("пикселийн харьцаа", lambda: (setattr(scene.render, "pixel_aspect_x", float(b.get("px_x", 1.0))),
                                       setattr(scene.render, "pixel_aspect_y", float(b.get("px_y", 1.0)))), failed)
    _one("рендерийн хүрээ", lambda: setattr(scene.render, "use_border", bool(b.get("border", False))), failed)
    _one("одоогийн фрейм", lambda: scene.frame_set(int(b.get("frame_current", b["frame_start"]))), failed)

    if not failed:                      # бүгд бүтсэн үед л бүртгэлээ устгана
        for k in (BACKUP, BACKUP + "_cam"):
            try:
                del scene[k]
            except Exception:
                pass
    return True, failed


def scenes_with_backup():
    return [s for s in bpy.data.scenes if s.get(BACKUP) is not None]


# ══════════════════════════════════════════════════════════════════════
#  БҮТЭЭХ
# ══════════════════════════════════════════════════════════════════════

def build(backup_path):
    scene = bpy.context.scene

    if not in_object_mode():
        popup(["Object горимд ороод дахин ажиллуулна уу.",
               "(Tab товч дарж Edit / Sculpt горимоос гарна)",
               "Скрипт юунд ч хүрсэнгүй."], icon="ERROR")
        return

    if not KEYS:
        popup(["Түлхүүр кадр алга.",
               "Хөтөч дээрээ кадр нэмээд дахин гаргана уу."], icon="ERROR")
        return

    read_opts(scene)

    # ── Өмнөх экспорт энэнээс ШИНЭ бол анхааруулна ──
    prev_stamp = ""
    for ob in owned(scene):
        v = str(ob.get(MARK) or "")
        if " " in v:
            prev_stamp = v.split(" ")[-1]
            break
    if prev_stamp and prev_stamp > STAMP and not DRY_RUN:
        popup(["Тайзан дээр ИЛҮҮ ШИНЭ экспорт байна:",
               "  одоо байгаа: " + prev_stamp[:16].replace("T", " "),
               "  энэ файл   : " + STAMP[:16].replace("T", " "),
               "",
               "Хуучин файлаар дарж бичихгүйн тулд зогслоо.",
               "Үнэхээр солих бол дээрх DRY_RUN = False хэвээр,",
               "энэ мөрийг дахин ажиллуулахын өмнө шинэ скрипт татна уу."],
              icon="ERROR")
        return

    mine, theirs = split_ours(scene)
    kept_models, skipped, created = [], [], []
    ours_now = []                      # ЗӨВХӨН энэ удаа бидний хүрсэн объект

    if DRY_RUN:
        popup(["ТУРШИЛТ (DRY_RUN) — юунд ч хүрсэнгүй.",
               "Устгах байсан: %d объект" % len([o for o in mine if o.get(ROLE) not in ("model", "cam", "target")]),
               "Хадгалах байсан: %d загварын Empty" % len([o for o in mine if o.get(ROLE) == "model"]),
               "Таных гэж үзсэн: %d" % len(theirs),
               "Үүсгэх байсан: %d кадр, %d дүр, %d объект" % (len(KEYS), len(SUBJECTS), len(PROPS))])
        return

    # ── Зөвхөн лавлах хэлбэрүүдээ цэвэрлэнэ ──
    #    камер, бай, загварын Empty — дахин ашиглана (тохиргоо, холбоос нь хадгалагдана)
    for ob in mine:
        role = ob.get(ROLE)
        if role in ("model", "cam", "target"):
            if role == "model":
                kept_models.append(ob)
            continue
        if ob.children:
            skipped.append(ob.name)         # хэн нэгэн үүн дээр юм холбосон байна
            continue
        drop_action(ob)
        if ob.data is not None:
            drop_action(ob.data)
        try:
            bpy.data.objects.remove(ob, do_unlink=True)
        except Exception:
            skipped.append(ob.name)

    col = our_collection(scene)

    # ── Тайзны тохиргоо ──
    if SET_SCENE or SET_CAMERA:
        backup_settings(scene)
    if SET_SCENE:
        try:
            scene.render.fps = FPS
            scene.render.fps_base = 1.0
            scene.frame_start = FRAME_START
            scene.frame_end = FRAME_END
            scene.frame_step = 1
            scene.render.resolution_x = RES_X
            scene.render.resolution_y = RES_Y
            scene.render.resolution_percentage = 100
            scene.render.pixel_aspect_x = 1.0
            scene.render.pixel_aspect_y = 1.0
            scene.render.use_border = False
        except Exception:
            pass

    # ── Камерын бай (Empty) — зөвхөн лавлах цэг ──
    target = find_owned(scene, "target")
    if target is None:
        target = bpy.data.objects.new("CAM_TARGET_REF", None)
        tag(target, "target", scene)
        scene.collection.objects.link(target)
        created.append(target)
    target.empty_display_type = "PLAIN_AXES"
    target.empty_display_size = 0.35
    ours_now.append(target)

    # ── Камер ──
    cam = find_owned(scene, "cam")
    if cam is None:
        cam_data = bpy.data.cameras.new("ShotCam")
        tag(cam_data, "cam", scene)
        cam_data.clip_start = 0.05
        cam_data.clip_end = 2000.0
        cam_data.display_size = 0.6
        cam = bpy.data.objects.new("ShotCam", cam_data)
        tag(cam, "cam", scene)
        scene.collection.objects.link(cam)     # лавлах цуглуулга дотор БИШ:
        created.append(cam)                    # тэрийг нь хэрэглэгч нуух юм уу устгаж болно
    else:
        cam_data = cam.data
    ours_now.append(cam)
    cam.rotation_mode = "QUATERNION"
    cam_data.sensor_fit = "VERTICAL"
    cam_data.sensor_width = 36.0
    cam_data.sensor_height = 24.0
    try:
        cam_data.lens_unit = "MILLIMETERS"
    except Exception:
        pass

    if SET_CAMERA:
        scene.camera = cam

    drop_action(cam)
    drop_action(cam_data)
    drop_action(target)

    for (f, loc, rot, tloc, lens) in KEYS:
        cam.location = loc
        cam.rotation_quaternion = rot
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_quaternion", frame=f)
        cam_data.lens = lens
        cam_data.keyframe_insert("lens", frame=f)
        target.location = tloc
        target.keyframe_insert("location", frame=f)

    for holder in (cam, cam_data, target):
        try:
            ad = holder.animation_data
            act = ad.action if ad else None
            if act is not None:
                act.use_fake_user = False       # цэвэрлэгээнд саад болохгүй
                tag(act, "anim", scene)
        except Exception:
            pass

    n_interp = (set_interpolation(cam, INTERPOLATION)
                + set_interpolation(cam_data, INTERPOLATION)
                + set_interpolation(target, INTERPOLATION))

    # ── Дүрүүд (зөвхөн лавлах, рендерт гарахгүй) ──
    if MAKE_REFS:
        for (name, x, y, rz, sc) in SUBJECTS:
            me = mesh_cylinder("1st_" + name, 0.22, 1.72)
            ob = ref_object(scene, name, "subject", me, col)
            ob.location = (x, y, 0.86 * sc)
            ob.rotation_euler[2] = rz
            ob.scale = (sc, sc, sc)
            created.append(ob)
            ours_now.append(ob)

    # ── Объект ба оруулсан 3D загварууд ──
    used, moved_by_user = [], []
    for (uid, label, kind, x, y, z, rz, sc, w, d, h) in PROPS:
        if kind == "model":
            ob = None
            for m in kept_models:
                if m not in used and str(m.get(KEYID) or "") == uid:
                    ob = m
                    break
            fresh = ob is None
            if fresh:
                ob = bpy.data.objects.new(label, None)
                tag(ob, "model", scene)
                ob[KEYID] = uid
                col.objects.link(ob)
                created.append(ob)
            used.append(ob)
            ours_now.append(ob)
            ob.empty_display_type = "PLAIN_AXES"
            ob.empty_display_size = max(0.4, h * 0.5)

            # Хэрэглэгч Blender дээр гараар зөөсөн бол ДАРЖ бичихгүй, ЗӨРҮҮГ нь нэмнэ
            prev = None if fresh else ob.get(POSE)
            now = (round(ob.location[0], 4), round(ob.location[1], 4), round(ob.location[2], 4),
                   round(ob.rotation_euler[2], 4), round(ob.scale[0], 4))
            if prev is not None and tuple(round(float(v), 4) for v in prev) != now:
                moved_by_user.append(ob.name)
                ob.location = (ob.location[0] + (x - float(prev[0])),
                               ob.location[1] + (y - float(prev[1])),
                               ob.location[2] + (z - float(prev[2])))
                ob.rotation_euler[2] = ob.rotation_euler[2] + (rz - float(prev[3]))
                f = (sc / float(prev[4])) if float(prev[4]) else 1.0
                ob.scale = (ob.scale[0] * f, ob.scale[1] * f, ob.scale[2] * f)
            else:
                ob.location = (x, y, z)
                ob.rotation_euler[2] = rz
                ob.scale = (sc, sc, sc)
            ob[POSE] = [x, y, z, rz, sc]
            if fresh:
                link_only_to(ob, col)           # шинэ л бол манай цуглуулгад
            elif not ob.users_collection:       # хуучныг нь хэрэглэгчийн байранд үлдээнэ
                col.objects.link(ob)
        elif MAKE_REFS:
            me = mesh_box("1st_" + label, max(w, 0.05), max(d, 0.05), max(h, 0.05))
            ob = ref_object(scene, label, "prop", me, col)
            ob[KEYID] = uid
            ob.location = (x, y, z + max(h, 0.05) * 0.5 * sc)
            ob.rotation_euler[2] = rz
            ob.scale = (sc, sc, sc)
            created.append(ob)
            ours_now.append(ob)

    # Энэ удаа ашиглагдаагүй, хүүхэдгүй хуучин загварын Empty-г арилгана
    orphaned = []
    for m in kept_models:
        if m in used:
            continue
        if m.children:
            orphaned.append(m.name)
            continue
        try:
            bpy.data.objects.remove(m, do_unlink=True)
        except Exception:
            pass

    # ── Промт — текст блок (хэрэглэгчийн тэмдэглэлийг хадгална) ──
    try:
        txt = None
        for t in bpy.data.texts:
            if is_ours(t) and not t.filepath:
                txt = t
                break
        if txt is None:
            txt = bpy.data.texts.new(TEXT)
            tag(txt, "prompt", scene)
        tail = ""
        try:
            old = txt.as_string()
            if NOTE in old:
                tail = old.split(NOTE, 1)[1]
        except Exception:
            tail = ""
        txt.clear()
        txt.write(PROMPT + "\n\n" + NOTE + tail)
    except Exception:
        pass

    remember_owned(scene, ours_now)
    write_opts(scene)
    purge_orphans()

    # Тоглуулах толгойг зөвхөн мужаас гадуур байвал зөөнө
    try:
        if scene.frame_current < FRAME_START or scene.frame_current > FRAME_END:
            scene.frame_set(FRAME_START)
    except Exception:
        pass
    undo_mark("1st Studio — камер үүсгэв")

    lines = [
        "Бэлэн боллоо.",
        "%d фрейм · %d fps · %dx%d" % (len(KEYS), FPS, RES_X, RES_Y),
        "Камер: %s   (0 товч дарж харна)" % cam.name,
    ]
    if used:
        lines.append("")
        lines.append("%d загварын Empty. Өөрийн загвараа холбохдоо:" % len(used))
        lines.append("  1) Эхлээд ЗАГВАРАА сонго")
        lines.append("  2) Shift дарж EMPTY-г сонго")
        lines.append("  3) Ctrl+P ▸ «Object (Without Inverse)»")
    if moved_by_user:
        lines.append("Гараар зөөсөн загварыг дарж бичсэнгүй: " + ", ".join(moved_by_user[:3]))
    if orphaned:
        lines.append("Шинэ экспортод алга, гэхдээ юм холбоотой: " + ", ".join(orphaned[:3]))
    if theirs:
        lines.append("Таных гэж үзэж хүрсэнгүй: " + ", ".join(theirs[:3]))
    if skipped:
        lines.append("Хүрээгүй (юм холбоотой): " + ", ".join(skipped[:3]))
    if n_interp == 0:
        lines.append("Анхаар: шилжилтийн хэлбэр тавигдсангүй —")
        lines.append("  Graph Editor ▸ бүгдийг сонгоод T дарна.")
    try:
        if any(m.camera for m in scene.timeline_markers):
            lines.append("Анхаар: timeline marker камер сольж магадгүй.")
    except Exception:
        pass
    lines.append("")
    lines.append("CAM_TARGET_REF бол зөвхөн лавлах цэг — камер үүнийг ДАГАХГҮЙ.")
    if backup_path:
        lines.append("Нөөц хуулбар: " + os.path.basename(backup_path))
    lines.append("Ctrl+Z дарвал ажиллахаас өмнөх төлөв рүү буцна.")
    popup(lines, op="wm.studio1_remove")


# ══════════════════════════════════════════════════════════════════════
#  УСТГАХ — бүгдийг арилгаж, хуучин тохиргоог сэргээнэ
# ══════════════════════════════════════════════════════════════════════

def remove_all(backup_path):
    if not in_object_mode():
        popup(["Object горимд ороод дахин ажиллуулна уу.",
               "Скрипт юунд ч хүрсэнгүй."], icon="ERROR")
        return

    # Эхлээд ТОХИРГООГ сэргээнэ — камер устахаас өмнө заагчийг нь буцаана
    restored, failed, scenes = 0, [], scenes_with_backup()
    for sc in scenes:
        had, bad = restore_settings(sc)
        if had:
            restored += 1
            failed.extend(bad)

    n, freed, theirs_all = 0, 0, []
    for sc in bpy.data.scenes:
        mine, theirs = split_ours(sc)
        theirs_all.extend(theirs)
        for ob in mine:
            if ob.children:
                unparent_keep_transform(ob)
                freed += 1
            try:
                bpy.data.objects.remove(ob, do_unlink=True)
                n += 1
            except Exception:
                pass
        try:
            del sc[REG]
        except Exception:
            pass
        try:
            del sc[OPTS]
        except Exception:
            pass

    for col in list(bpy.data.collections):
        if is_ours(col) and not col.objects and not col.children:
            try:
                bpy.data.collections.remove(col)
            except Exception:
                pass

    for t in list(bpy.data.texts):
        if not is_ours(t):
            continue
        keep = False
        try:
            body = t.as_string()
            keep = NOTE in body and body.split(NOTE, 1)[1].strip() != ""
        except Exception:
            keep = False
        if keep:
            continue                    # хэрэглэгчийн тэмдэглэлтэй — үлдээнэ
        try:
            bpy.data.texts.remove(t)
        except Exception:
            pass

    purge_orphans()
    undo_mark("1st Studio — устгав")

    lines = ["%d объект арилгалаа." % n]
    if freed:
        lines.append("%d загвар байрандаа үлдэж, Empty-ээсээ салав." % freed)
    if restored:
        lines.append("%d тайзны хуучин тохиргоо сэргэлээ." % restored)
    else:
        lines.append("Тохиргоо хөндөгдөөгүй байсан.")
    if failed:
        lines.append("СЭРГЭЭГДЭЭГҮЙ: " + ", ".join(failed[:4]))
        lines.append("(нөөц устгагдаагүй — дахин оролдож болно)")
    if theirs_all:
        lines.append("Таных гэж үзэж хүрсэнгүй: " + ", ".join(theirs_all[:3]))
    popup(lines)


# ══════════════════════════════════════════════════════════════════════
#  «Бүгдийг арилгах» товч (F3 ▸ «1st Studio» гэж хайж бас олно)
# ══════════════════════════════════════════════════════════════════════

class STUDIO1_OT_remove(bpy.types.Operator):
    """1st Studio-ийн нэмсэн бүхнийг арилгаж, хуучин тохиргоог сэргээнэ"""
    bl_idname = "wm.studio1_remove"
    bl_label = "1st Studio — бүгдийг арилгаж, тохиргоог сэргээх"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        undo_mark("1st Studio — арилгахын өмнөх төлөв")
        remove_all("")
        return {"FINISHED"}


def register_button():
    try:
        bpy.utils.unregister_class(STUDIO1_OT_remove)
    except Exception:
        pass
    try:
        bpy.utils.register_class(STUDIO1_OT_remove)
    except Exception:
        pass


# ══════════════════════════════════════════════════════════════════════

def run():
    if bpy.app.version < (3, 0, 0):
        popup(["Blender 3.0-аас дээш хувилбар хэрэгтэй.",
               "Таных: %d.%d" % (bpy.app.version[0], bpy.app.version[1])], icon="ERROR")
        return

    act = str(ACTION).strip().upper()
    if act not in ("BUILD", "REMOVE"):
        popup(["ACTION нь «BUILD» эсвэл «REMOVE» байх ёстой.",
               "Одоо: «%s»" % ACTION,
               "Юунд ч хүрсэнгүй."], icon="ERROR")
        return

    register_button()

    go, backup_path = safety_check()
    if not go:
        return

    undo_mark("1st Studio — ажиллахаас өмнөх төлөв")
    try:
        if act == "REMOVE":
            remove_all(backup_path)
        else:
            build(backup_path)
    except Exception as err:
        traceback.print_exc()
        undo_mark("1st Studio — алдаа гарсан төлөв")
        popup(["Алдаа гарлаа:", str(err)[:70],
               "",
               "Ctrl+Z дарвал өмнөх төлөв рүү буцна.",
               "Window ▸ Toggle System Console дотроос дэлгэрэнгүйг үзнэ үү."],
              icon="ERROR")


run()
