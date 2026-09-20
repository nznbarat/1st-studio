# ══════════════════════════════════════════════════════════════════════
#  1st Studio — Camera Director  →  Blender
#  Үүсгэсэн: 1970-01-01T00:00:00Z                                   #@DATE
#
#  ┌────────────────────────────────────────────────────────────────┐
#  │  ЯАЖ АЖИЛЛУУЛАХ ВЭ                                             │
#  │  Blender ▸ дээд талын «Scripting» таб ▸ Open ▸ энэ файл        │
#  │  ▸ «Run Script» товч (эсвэл Alt + P)                           │
#  └────────────────────────────────────────────────────────────────┘
#
#  ⚠ АЮУЛГҮЙ ЮУ?  —  Тийм.
#    • Энэ скрипт таны ЮУГ Ч устгахгүй. Зөвхөн өөрийнхөө үүсгэсэн,
#      дотроо «1st_studio» гэсэн тэмдэгтэй объектыг л дарж бичнэ.
#    • Дахин дахин ажиллуулж болно. Ctrl+P-ээр холбосон таны загвар
#      САЛАХГҮЙ — Empty байрандаа үлдэж, зөвхөн шинэ байрлал авна.
#    • fps, фреймийн муж, нягтрал, идэвхтэй камер — хуучныг чинь санаж авна.
#    • Лавлах хэлбэрүүд (wireframe) рендерт ОГТ гарахгүй.
#
#  ↩ БҮГДИЙГ БУЦААХ  —  хоёр арга:
#    1) Доорх  ACTION  мөрийг  "REMOVE"  болгоод дахин Run Script дарна.
#       1st Studio-ийн нэмсэн бүхэн арилж, хуучин тохиргоо чинь сэргэнэ.
#       Таны загвар устахгүй — зөвхөн Empty-ээсээ салж, байрандаа үлдэнэ.
#    2) Blender ▸ File ▸ Revert — сүүлд хадгалсан хувилбар руу бүрэн буцна.
#
#  💡 Зөвлөгөө: эхлээд файлаа нэг хадгалчих (Ctrl+S). Тэгвэл ямар ч үед
#     File ▸ Revert дарахад бүх юм хуучин хэвэндээ орно.
# ══════════════════════════════════════════════════════════════════════

# ─── ТОХИРГОО · хүсвэл өөрчил ─────────────────────────────────────────
ACTION     = "BUILD"   # "BUILD" = камерыг үүсгэнэ · "REMOVE" = бүгдийг арилгаж, тохиргоог сэргээнэ
SET_SCENE  = True      # fps / фреймийн муж / нягтралыг энэ шотынхоор солих уу
MAKE_REFS  = True      # дүр, объектын лавлах хэлбэр (wireframe) үүсгэх үү
SET_CAMERA = True      # ShotCam-ыг Scene-ийн идэвхтэй камер болгох уу
# ──────────────────────────────────────────────────────────────────────

import bpy
import math
import traceback

VERSION = "1st Studio 1.0"
MARK    = "1st_studio"          # манай өгөгдөл мөн эсэхийг заах тэмдэг
ROLE    = "1st_role"            # объектын үүрэг: cam / target / subject / prop / model
BACKUP  = "1st_studio_backup"   # хэрэглэгчийн хуучин тохиргоо энд хадгалагдана
COLL    = "1stStudio_Layout"
TEXT    = "1stStudio_Prompt"

FPS          = 24                 #@FPS
FRAME_START  = 1                  #@FRAME_START
FRAME_END    = 120                #@FRAME_END
RES_X        = 1920               #@RES_X
RES_Y        = 1080               #@RES_Y
INTERPOLATION = "BEZIER"          #@INTERP

# (фрейм, камерын байрлал, эргэлт-квартернион (w,x,y,z), байны байрлал, линз мм)
#   Эргэлтийг квартернионоор өгнө — Euler-ийн дараалал хөтөч ба Blender дээр
#   өөр учир зөрдөг. Квартернион дээр ямар ч зөрүү гарахгүй.
KEYS = [
#@KEYS
]

# (нэр, x, y, эргэлт_z, хэмжээ)
SUBJECTS = [
#@SUBJECTS
]

# (нэр, төрөл, x, y, z, эргэлт_z, хэмжээ, өргөн, гүн, өндөр)
#   · загвар (model): хэмжээ = импортын автомат тааруулалттайгаа, өргөн/гүн/өндөр = ЭХ хэмжээ
#   · бусад объект:   хэмжээ = 1.0,  өргөн/гүн/өндөр = тайзан дээрх бодит хэмжээ
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


def popup(lines, title="1st Studio", icon="INFO"):
    """Blender дотор жижиг цонхоор мэдэгдэнэ (харагдахгүй бол чимээгүй өнгөрнө)."""
    def draw(self, context):
        for ln in lines:
            self.layout.label(text=str(ln))
    try:
        bpy.context.window_manager.popup_menu(draw, title=title, icon=icon)
    except Exception:
        pass
    for ln in lines:
        say(ln)


def is_ours(data):
    """Энэ объект/цуглуулгыг 1st Studio үүсгэсэн үү?"""
    try:
        return data.get(MARK) is not None
    except Exception:
        return False


def tag(data, role=None):
    try:
        data[MARK] = VERSION
        if role is not None:
            data[ROLE] = role
    except Exception:
        pass


def owned(role=None):
    """Манай тэмдэгтэй объектууд. role өгвөл зөвхөн тэр үүрэгтэйг нь."""
    out = []
    for ob in bpy.data.objects:
        if not is_ours(ob):
            continue
        if role is None or ob.get(ROLE) == role:
            out.append(ob)
    return out


def find_owned(role):
    got = owned(role)
    return got[0] if got else None


def to_object_mode():
    """Edit / Sculpt горимд байвал Object горим руу гаргана."""
    try:
        ob = bpy.context.view_layer.objects.active
        if ob is not None and ob.mode != "OBJECT":
            bpy.ops.object.mode_set(mode="OBJECT")
    except Exception:
        pass


def unparent_keep_transform(ob):
    """Хүүхдүүдийг байрлалыг нь хөдөлгөлгүй эцгээс нь салгана."""
    for ch in list(ob.children):
        try:
            m = ch.matrix_world.copy()
            ch.parent = None
            ch.matrix_world = m
        except Exception:
            pass


def our_collection(scene, create=True):
    for col in bpy.data.collections:
        if is_ours(col) and col.get(ROLE) == "layout":
            if col.name not in scene.collection.children:
                try:
                    scene.collection.children.link(col)
                except Exception:
                    pass
            return col
    if not create:
        return None
    col = bpy.data.collections.new(COLL)
    tag(col, "layout")
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
    """Хуучин анимацийг арилгана (хэн ч хэрэглэхгүй болсон Action-ыг устгана)."""
    try:
        ad = id_data.animation_data
        if not ad:
            return
        act = ad.action
        id_data.animation_data_clear()
        if act is not None:
            tag(act, "anim")
        if act is not None and act.users == 0 and not act.use_fake_user:
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
    for fc in fcurves_of(id_data):
        for kp in fc.keyframe_points:
            try:
                kp.interpolation = mode
                if mode == "BEZIER":
                    kp.handle_left_type = "AUTO_CLAMPED"
                    kp.handle_right_type = "AUTO_CLAMPED"
            except Exception:
                pass
        try:
            fc.update()
        except Exception:
            pass


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


def ref_object(name, role, me, col):
    """Лавлах хэлбэр — утсан харагдацтай, РЕНДЕРТ ГАРАХГҮЙ."""
    ob = bpy.data.objects.new(name, me)
    tag(ob, role)
    ob.display_type = "WIRE"
    ob.hide_render = True
    col.objects.link(ob)
    return ob


def purge_orphans():
    """Манай үүсгэсэн, хэн ч хэрэглэхгүй болсон өгөгдлийг арилгана.
       (Ингэхгүй бол дахин дахин гаргах бүрд файл хавагнана.)"""
    for store in (bpy.data.actions, bpy.data.meshes, bpy.data.cameras):
        for item in list(store):
            if is_ours(item) and item.users == 0 and not item.use_fake_user:
                try:
                    store.remove(item)
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
            "res_x": int(scene.render.resolution_x),
            "res_y": int(scene.render.resolution_y),
            "res_pct": int(scene.render.resolution_percentage),
            "camera": scene.camera.name if scene.camera else "",
        }
    except Exception:
        pass


def restore_settings(scene):
    b = scene.get(BACKUP)
    if b is None:
        return False
    try:
        scene.render.fps = int(b["fps"])
        scene.render.fps_base = float(b["fps_base"])
        scene.frame_start = int(b["frame_start"])
        scene.frame_end = int(b["frame_end"])
        scene.render.resolution_x = int(b["res_x"])
        scene.render.resolution_y = int(b["res_y"])
        scene.render.resolution_percentage = int(b["res_pct"])
        name = str(b["camera"])
        scene.camera = bpy.data.objects.get(name) if name else None
    except Exception:
        pass
    try:
        del scene[BACKUP]
    except Exception:
        pass
    return True


# ══════════════════════════════════════════════════════════════════════
#  БҮТЭЭХ
# ══════════════════════════════════════════════════════════════════════

def build():
    scene = bpy.context.scene
    to_object_mode()

    if not KEYS:
        popup(["Түлхүүр кадр алга.", "Хөтөч дээрээ кадр нэмээд дахин гаргана уу."],
              icon="ERROR")
        return

    kept_models = []
    skipped = []

    # ── Хуучин лавлах хэлбэрүүдээ л цэвэрлэнэ (хэрэглэгчийнхэд хүрэхгүй) ──
    for ob in owned():
        role = ob.get(ROLE)
        if role == "model":
            kept_models.append(ob)          # хүүхэдтэй байж магад — хэзээ ч устгахгүй
            continue
        if ob.children:
            skipped.append(ob.name)         # хэн нэгэн үүн дээр юм холбосон байна
            continue
        drop_action(ob)                     # өнчин Action үлдээхгүй
        if ob.data is not None:
            drop_action(ob.data)
        try:
            bpy.data.objects.remove(ob, do_unlink=True)
        except Exception:
            skipped.append(ob.name)

    col = our_collection(scene)

    # ── Тайзны тохиргоо ──
    if SET_SCENE:
        backup_settings(scene)
        try:
            scene.render.fps = FPS
            scene.render.fps_base = 1.0
            scene.frame_start = FRAME_START
            scene.frame_end = FRAME_END
            scene.render.resolution_x = RES_X
            scene.render.resolution_y = RES_Y
            scene.render.resolution_percentage = 100
        except Exception:
            pass

    # ── Камерын бай (Empty) ──
    target = bpy.data.objects.new("CAM_TARGET", None)
    tag(target, "target")
    target.empty_display_type = "PLAIN_AXES"
    target.empty_display_size = 0.35
    col.objects.link(target)

    # ── Камер ──
    cam_data = bpy.data.cameras.new("ShotCam")
    tag(cam_data, "cam")
    cam_data.sensor_fit = "VERTICAL"
    cam_data.sensor_width = 36.0
    cam_data.sensor_height = 24.0
    cam_data.lens_unit = "MILLIMETERS"
    cam_data.display_size = 0.6
    cam_data.clip_start = 0.05
    cam_data.clip_end = 2000.0
    cam = bpy.data.objects.new("ShotCam", cam_data)
    tag(cam, "cam")
    cam.rotation_mode = "QUATERNION"
    col.objects.link(cam)

    if SET_CAMERA:
        if not SET_SCENE:
            backup_settings(scene)
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
            if holder.animation_data and holder.animation_data.action:
                tag(holder.animation_data.action, "anim")
        except Exception:
            pass

    set_interpolation(cam, INTERPOLATION)
    set_interpolation(cam_data, INTERPOLATION)
    set_interpolation(target, INTERPOLATION)

    # ── Дүрүүд ба объектууд (зөвхөн лавлах, рендерт гарахгүй) ──
    if MAKE_REFS:
        for (name, x, y, rz, sc) in SUBJECTS:
            me = mesh_cylinder("1st_" + name, 0.22, 1.72)
            ob = ref_object(name, "subject", me, col)
            ob.location = (x, y, 0.86 * sc)
            ob.rotation_euler[2] = rz
            ob.scale = (sc, sc, sc)

    # ── Оруулсан 3D загварууд — Empty, дахин ажиллуулахад САЛАХГҮЙ ──
    used = []
    for (name, kind, x, y, z, rz, sc, w, d, h) in PROPS:
        if kind == "model":
            ob = None
            for m in kept_models:
                if m not in used and (m.get("1st_key") == name or m.name == name):
                    ob = m
                    break
            if ob is None:
                ob = bpy.data.objects.new(name, None)
                tag(ob, "model")
                col.objects.link(ob)
            used.append(ob)
            ob["1st_key"] = name
            ob.empty_display_type = "PLAIN_AXES"
            ob.empty_display_size = max(0.4, h * 0.5)
            ob.location = (x, y, z)
            ob.rotation_euler[2] = rz
            ob.scale = (sc, sc, sc)
            link_only_to(ob, col)
        elif MAKE_REFS:
            me = mesh_box("1st_" + name, max(w, 0.05), max(d, 0.05), max(h, 0.05))
            ob = ref_object(name, "prop", me, col)
            ob.location = (x, y, z + max(h, 0.05) * 0.5 * sc)
            ob.rotation_euler[2] = rz
            ob.scale = (sc, sc, sc)

    # Энэ удаа ашиглагдаагүй, хүүхэдгүй хуучин загварын Empty-г арилгана
    for m in kept_models:
        if m not in used and not m.children:
            try:
                bpy.data.objects.remove(m, do_unlink=True)
            except Exception:
                pass

    # ── Промт — текст блок ──
    try:
        txt = None
        for t in bpy.data.texts:
            if is_ours(t):
                txt = t
                break
        if txt is None:
            txt = bpy.data.texts.new(TEXT)
            tag(txt, "prompt")
        txt.clear()
        txt.write(PROMPT)
    except Exception:
        pass

    purge_orphans()

    try:
        scene.frame_set(FRAME_START)
    except Exception:
        pass
    try:
        bpy.ops.ed.undo_push(message="1st Studio — камер үүсгэв")
    except Exception:
        pass

    lines = [
        "Бэлэн боллоо.",
        "%d түлхүүр кадр · %d фрейм · %d fps" % (len(KEYS), FRAME_END - FRAME_START + 1, FPS),
        "Камер: ShotCam   (0 товч дарж харна)",
    ]
    if used:
        lines.append("%d загварын Empty — өөрийн загвараа сонгоод дараа нь" % len(used))
        lines.append("Empty-г сонгон Ctrl+P дарж холбоорой.")
    if skipped:
        lines.append("Хүрээгүй объект (юм холбоотой): " + ", ".join(skipped[:4]))
    lines.append("Буцаах бол: ACTION = \"REMOVE\" болгоод дахин ажиллуул.")
    popup(lines)


# ══════════════════════════════════════════════════════════════════════
#  УСТГАХ — бүгдийг арилгаж, хуучин тохиргоог сэргээнэ
# ══════════════════════════════════════════════════════════════════════

def remove_all():
    scene = bpy.context.scene
    to_object_mode()
    n = 0
    freed = 0

    for ob in owned():
        if ob.children:
            unparent_keep_transform(ob)
            freed += 1
        try:
            bpy.data.objects.remove(ob, do_unlink=True)
            n += 1
        except Exception:
            pass

    for col in list(bpy.data.collections):
        if is_ours(col) and not col.objects and not col.children:
            try:
                bpy.data.collections.remove(col)
            except Exception:
                pass

    for t in list(bpy.data.texts):
        if is_ours(t):
            try:
                bpy.data.texts.remove(t)
            except Exception:
                pass

    purge_orphans()

    had = restore_settings(scene)
    try:
        bpy.ops.ed.undo_push(message="1st Studio — устгав")
    except Exception:
        pass

    lines = ["%d объект арилгалаа." % n]
    if freed:
        lines.append("%d загвар байрандаа үлдэж, Empty-ээсээ салав." % freed)
    lines.append("Хуучин тохиргоо сэргэлээ." if had else "Тохиргоо хөндөгдөөгүй байсан.")
    popup(lines)


# ══════════════════════════════════════════════════════════════════════

def run():
    if bpy.app.version < (3, 0, 0):
        popup(["Blender 3.0-аас дээш хувилбар хэрэгтэй.",
               "Таных: %d.%d" % (bpy.app.version[0], bpy.app.version[1])], icon="ERROR")
        return
    try:
        if str(ACTION).strip().upper().startswith("R"):
            remove_all()
        else:
            build()
    except Exception as err:
        traceback.print_exc()
        popup(["Алдаа гарлаа:", str(err)[:70],
               "Window ▸ Toggle System Console дотроос дэлгэрэнгүйг үзнэ үү."],
              icon="ERROR")


run()
