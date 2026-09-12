"""
1st Studio — Сансрын хөлгийн кабин (процедурал загвар)

Ашиглах:
    Blender → Scripting таб → Open → энэ файл → Run Script (Alt+P)
    эсвэл:  blender -b -P blender/cockpit.py -- --render out.png

Бүх хэмжээ метрээр, Blender-ийн Z-дээш системд. Доорх CFG-г өөрчилбөл
өрөөний хэмжээ, гэрлийн өнгө, бохирдлын хэмжээ шууд өөрчлөгдөнө.
"""

import math
import random
import sys

import bpy
from mathutils import Vector

# ══════════════════════════════════════════════════════════════════════
#  Тохиргоо
# ══════════════════════════════════════════════════════════════════════
CFG = {
    "seed": 7,
    "clear_scene": True,        # Blender-ийн анхны Cube/Light/Camera-г устгах
    "haze": 0.0003,            # агаарын манан (0 = унтраах)
    "glass": False,            # цонхонд шил тавих эсэх
    "room": {"w": 10.0, "d": 8.0, "h": 3.15},   # өргөн (X), гүн (Y), өндөр (Z)
    "window": {
        "tilt_deg": -18.0,      # цонхны налуу: сөрөг = дээд тал нь ард (G-Class маягийн босоо)
        "sill": 0.06,           # цонхны доод ирмэг — бараг шалнаас
        "head": 3.02,           # цонхны дээд ирмэг — таазны дор
        "pillar": 0.34,         # хоёр цонхны дундах баганын хагас өргөн
        "edge": 0.45,           # хана ба цонхны хоорондох зай
        "mullions": 1,          # 1 = хуваагчгүй цэлгэр цонх
    },
    "console": {
        "y": 1.95, "w": 7.2, "depth": 1.35, "h": 0.80,
        "tilt_deg": None,       # None = CFG["lean_deg"]-ийг дагана
        "glow_panels": 5,       # урд талын гэрэлтэх хавтангийн тоо
    },
    "seat": {"x": 1.18, "y": 0.50, "scale": 1.28},
    # Удирдлагын байрлал — жүжигчний гарт таарахаар тохируулна.
    # Бүгд суудлын төвөөс хэмжсэн зай (метр), өндөр нь шалнаас.
    "controls": {
        "yoke_fwd": 0.40,    # жолоо суудлаас урагш
        "yoke_side": 0.12,   # жолоо хажуу тийш шилжих
        "yoke_z": 0.83,      # жолооны бариулын өндөр
        "yoke_span": 0.26,   # хоёр бариулын хоорондох хагас зай
        "side_x": 0.55,      # хажуугийн самбар суудлаас хажуу тийш
        "side_y": 0.02,      # хажуугийн самбар урагш/хойш
        "side_z": 0.88,      # хажуугийн самбарын өндөр
        # Консолын ирмэг — кадрын доод зурвасыг нөхнө. Камерын координатад
        # барих тул камер хөдлөхөд ч кадар дахь байрлал нь хэвээр үлдэнэ.
        "ring_on": True,
        "ledge_screen": -0.16,  # ирмэгийн байрлал. Бага (сөрөг) нь бага хаана.
                                # -0.16 → доод 11%, -0.08 → доод 16%
        "ledge_depth": 0.85,    # камераас хэдэн метрт
        "ledge_width": 2.10,    # өргөн
        "ledge_bow": 0.09,      # нумын гүнзгий (0 = шулуун)
        # Гарыг далдлах консолын товгор хэсэг. Кадрын координатаар өгнө
        # (0..1). Гар нь CG жолоотой таарахгүй мөчид үүнийг асаана.
        "cover_on": False,
        "cover_x": 0.86,        # төвийн байрлал кадрын өргөнөөр
        "cover_y": 0.20,        # төв, кадрын доороос дээш
        "cover_w": 0.34,        # өргөн (кадрын хувиар)
        "cover_h": 0.30,        # өндөр (кадрын хувиар)
        "cover_depth": 0.72,    # камераас хэдэн метрт
    },
    "exposure": -0.45,
    "angle": "wide",
    "ship": {                   # хөлгийн гадна их бие — 0110 ачааны хөлөг
        "on": True,
        "number": "0110",
        "width": 42.0,          # их биеийн өргөн
        "depth": 26.0,          # их биеийн босоо зузаан
        "bay": 0.55,            # гүүрний цонхны булангийн гүн
        "nose": 62.0,           # хамрын урт
        "nose_drop": 21.0,      # хамар доошоо унах хэмжээ
        "segments": 6,          # ачааны сегментийн тоо
        "seg_len": 23.0,        # нэг сегментийн урт
        "stern": 40.0,          # хойд блокийн урт
        "engine_r": 9.0,        # том хөдөлгүүрийн радиус
        "portholes": 46,        # гэрэлтэй жижиг цонхны тоо
    },
    "sun": {"energy": 2.6, "color": (1.0, 0.97, 0.93)},
    "flythrough": True,         # цонхоор нэвтэрч ордог камерын анимац
    "flight_pace": 1.0,         # 1.0 = 18 сек. Их болгох тусам удаан, хүнд
    "device": "AUTO",          # AUTO = GPU байвал GPU, үгүй бол CPU. "CPU" / "GPU" гэж тулгаж болно
    # Жүжигчний биеийн налуу. Консол, хажуугийн самбар, жолооны налууг
    # үүнтэй нийлүүлж, суугаа байрлалтай зохицуулна.
    "lean_deg": 12.0,
    "grime": 0.55,              # 0 = цэвэр, 1 = маш бохир
    "warm": (1.0, 0.62, 0.26),  # консолын бүлээн гэрэл
    "cool": (0.32, 0.55, 1.0),  # цонхны хүйтэн гэрэл
}

# Камерын бэлэн өнцгүүд: (байрлал), (харах цэг), линз мм
ANGLES = {
    "wide":   ((-3.25, -3.60, 1.68), (0.55, 2.20, 1.02), 24.0),   # лавлах зургийн өнцөг
    "seat":   ((-0.30, -2.45, 1.86), (1.15, 2.40, 1.20), 35.0),   # суудлын мөрөн дээгүүр
    "window": ((-2.30, 0.20, 1.30), (2.40, 3.70, 1.80), 28.0),    # цонх өөд доод өнцгөөс
    "corner": ((3.70, -3.30, 2.10), (-1.30, 2.40, 1.05), 20.0),   # баруун булангаас өргөн
    "bow":    ((21.0, 40.0, 17.0), (0.0, 5.0, 1.4), 50.0),        # хамрын цонх рүү дээрээс
    "ship":   ((205.0, 165.0, 130.0), (0.0, -70.0, -8.0), 50.0),  # бүтэн хөлөг
    "stern":  ((-95.0, -235.0, 24.0), (0.0, -150.0, -8.0), 48.0), # хойд талаас, хөдөлгүүрүүд
    # Ногоон дэвсгэр дээр буулгасан нисгэгчид зориулсан дэвсгэр (16:9, дунд зэргийн кадр).
    # Камер нисгэгчийн зүүн-урд талд: нисгэгч дэлгэцийн зүүн тийш харна, консол зүүн талд.
    "pilot":  ((-0.95, 0.75, 1.34), (1.20, -0.50, 1.18), 29.0),
    # Консол УРД талд — жүжигчин консолын ард суух композитод.
    # --pass fg / --pass bg-тэй хамт ашиглана.
    "console": ((1.55, 3.85, 1.74), (1.15, -0.35, 1.02), 30.0),
    # Уудам сансрыг цонхоор ажиглаж буй нисгэгч: хүн баруун талд жижиг,
    # консол доогуур, цонх ба од зүүн талд. Өргөн линз — уудмыг мэдрүүлнэ.
    "vista":  ((-3.50, -2.50, 1.50), (0.20, 0.85, 1.15), 24.0),
}

COL = "COCKPIT"
rng = random.Random(CFG["seed"])


# ══════════════════════════════════════════════════════════════════════
#  Туслах функцууд
# ══════════════════════════════════════════════════════════════════════
def clear_startup_objects():
    """Blender-ийн анхны Cube / Light / Camera-г устгана (байвал)."""
    gone = []
    for name in ("Cube", "Light", "Camera"):
        ob = bpy.data.objects.get(name)
        if ob and not any(c.name == COL for c in ob.users_collection):
            bpy.data.objects.remove(ob, do_unlink=True)
            gone.append(name)
    if gone:
        print("[1st Studio] Анхны объект устгав:", ", ".join(gone))


def fresh_collection(name):
    """Өмнөх барилтыг цэвэрлээд шинэ коллекц үүсгэнэ."""
    old = bpy.data.collections.get(name)
    if old:
        for ob in list(old.objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        bpy.data.collections.remove(old)
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    for block in (bpy.data.meshes, bpy.data.curves):
        for b in list(block):
            if b.users == 0:
                block.remove(b)
    return col


def _link(ob, col):
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    col.objects.link(ob)


def box(name, size, loc, rot=(0, 0, 0), mat=None, parent=None, bevel=0.0, col=None):
    """Тэгш өнцөгт биет. size = (x, y, z) бүтэн хэмжээ."""
    mesh = bpy.data.meshes.new(name)
    sx, sy, sz = (s / 2 for s in size)
    verts = [(-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz),
             (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz)]
    faces = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    ob.location = loc
    ob.rotation_euler = rot
    if mat:
        ob.data.materials.append(mat)
    if bevel:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width, m.segments, m.limit_method = bevel, 2, "ANGLE"
        m.angle_limit = math.radians(35)
    _link(ob, col or bpy.data.collections[COL])
    if parent:
        ob.parent = parent
    return ob


def cyl(name, r, h, loc, rot=(0, 0, 0), mat=None, parent=None, verts=16, col=None):
    mesh = bpy.data.meshes.new(name)
    ring_b, ring_t = [], []
    for i in range(verts):
        a = 2 * math.pi * i / verts
        ring_b.append((r * math.cos(a), r * math.sin(a), -h / 2))
        ring_t.append((r * math.cos(a), r * math.sin(a), h / 2))
    vs = ring_b + ring_t
    fs = [(i, (i + 1) % verts, verts + (i + 1) % verts, verts + i) for i in range(verts)]
    fs.append(tuple(range(verts - 1, -1, -1)))
    fs.append(tuple(range(verts, 2 * verts)))
    mesh.from_pydata(vs, [], fs)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    ob.location, ob.rotation_euler = loc, rot
    if mat:
        ob.data.materials.append(mat)
    _link(ob, col or bpy.data.collections[COL])
    if parent:
        ob.parent = parent
    return ob


def tube(name, points, radius, mat=None, parent=None, col=None):
    """Кабель / хоолой — муруйгаар."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(points) - 1)
    for bp, p in zip(sp.bezier_points, points):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    ob = bpy.data.objects.new(name, cu)
    if mat:
        ob.data.materials.append(mat)
    _link(ob, col or bpy.data.collections[COL])
    if parent:
        ob.parent = parent
    return ob


def empty(name, loc, rot=(0, 0, 0)):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = 0.3
    ob.location, ob.rotation_euler = loc, rot
    _link(ob, bpy.data.collections[COL])
    return ob


# ══════════════════════════════════════════════════════════════════════
#  Материалууд
# ══════════════════════════════════════════════════════════════════════
def _nodes(mat):
    if getattr(mat, "node_tree", None) is None:      # Blender 5-д шинэ материал шууд зангилаатай
        mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    return nt, out


def metal(name, base, rough=0.55, metallic=0.25, grime=None, scale=6.0, bump=0.25, wear=0.55):
    """Бохирдол, зэврэлттэй будсан метал."""
    grime = CFG["grime"] if grime is None else grime
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    nt, out = _nodes(mat)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (300, 0)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (-800, 0)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.location = (-600, 100)
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 12.0
    noise.inputs["Roughness"].default_value = 0.62
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-400, 100)
    ramp.color_ramp.elements[0].position = 0.38
    ramp.color_ramp.elements[1].position = 0.72
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.location = (-180, 120)
    mix.blend_type = "MIX"
    mix.inputs["Fac"].default_value = grime
    dirt = tuple(c * 0.42 for c in base[:3]) + (1,)
    mix.inputs["Color1"].default_value = (*base[:3], 1)
    mix.inputs["Color2"].default_value = dirt
    rmix = nt.nodes.new("ShaderNodeMixRGB")
    rmix.location = (-180, -80)
    rmix.inputs["Fac"].default_value = 0.5
    rmix.inputs["Color1"].default_value = (rough,) * 3 + (1,)
    rmix.inputs["Color2"].default_value = (min(rough + 0.28, 1.0),) * 3 + (1,)
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.location = (60, -220)
    bmp.inputs["Strength"].default_value = bump
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.location = (-400, -320)
    fine.inputs["Scale"].default_value = scale * 14
    fine.inputs["Detail"].default_value = 6.0
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(coord.outputs["Object"], fine.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mix.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], rmix.inputs["Fac"])
    nt.links.new(fine.outputs["Fac"], bmp.inputs["Height"])
    # ── ирмэгийн элэгдэл: гүдгэр ирмэгүүд будаггүй, гялалзсан метал болно ──
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    geo.location = (-800, -560)
    pr = nt.nodes.new("ShaderNodeValToRGB")
    pr.location = (-560, -560)
    pr.color_ramp.elements[0].position = 0.50
    pr.color_ramp.elements[1].position = 0.58
    pw = nt.nodes.new("ShaderNodeMath")            # элэгдлийн хүчийг тохируулна
    pw.location = (-360, -560)
    pw.operation = "MULTIPLY"
    pw.inputs[1].default_value = wear
    ew = nt.nodes.new("ShaderNodeMixRGB")
    ew.location = (60, 140)
    ew.inputs["Color2"].default_value = (0.66, 0.64, 0.60, 1)
    er = nt.nodes.new("ShaderNodeMixRGB")
    er.location = (60, -60)
    er.inputs["Color2"].default_value = (max(rough - 0.30, 0.08),) * 3 + (1,)
    nt.links.new(geo.outputs["Pointiness"], pr.inputs["Fac"])
    nt.links.new(pr.outputs["Color"], pw.inputs[0])
    nt.links.new(pw.outputs["Value"], ew.inputs["Fac"])
    nt.links.new(pw.outputs["Value"], er.inputs["Fac"])
    nt.links.new(mix.outputs["Color"], ew.inputs["Color1"])
    nt.links.new(rmix.outputs["Color"], er.inputs["Color1"])
    nt.links.new(ew.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(er.outputs["Color"], bsdf.inputs["Roughness"])
    nt.links.new(bmp.outputs["Normal"], bsdf.inputs["Normal"])
    bsdf.inputs["Metallic"].default_value = metallic
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def emit(name, color, strength):
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    nt, out = _nodes(mat)
    e = nt.nodes.new("ShaderNodeEmission")
    e.location = (300, 0)
    e.inputs["Color"].default_value = (*color[:3], 1)
    e.inputs["Strength"].default_value = strength
    nt.links.new(e.outputs["Emission"], out.inputs["Surface"])
    return mat


def starfield(name):
    """Цонхны цаадах сансар — од + сул мананцар."""
    mat = bpy.data.materials.new(name)
    nt, out = _nodes(mat)
    e = nt.nodes.new("ShaderNodeEmission")
    e.location = (300, 0)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (-900, 0)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.location = (-700, 150)
    vor.feature = "F1"
    vor.inputs["Scale"].default_value = 240.0
    star = nt.nodes.new("ShaderNodeValToRGB")
    star.location = (-500, 150)
    star.color_ramp.interpolation = "EASE"
    star.color_ramp.elements[0].position = 0.0
    star.color_ramp.elements[0].color = (1, 1, 1, 1)
    star.color_ramp.elements[1].position = 0.075
    star.color_ramp.elements[1].color = (0, 0, 0, 1)
    neb = nt.nodes.new("ShaderNodeTexNoise")
    neb.location = (-700, -150)
    neb.inputs["Scale"].default_value = 5.0
    neb.inputs["Detail"].default_value = 8.0
    nramp = nt.nodes.new("ShaderNodeValToRGB")
    nramp.location = (-500, -150)
    nramp.color_ramp.elements[0].position = 0.35
    nramp.color_ramp.elements[0].color = (0.002, 0.009, 0.035, 1)
    nramp.color_ramp.elements[1].position = 0.78
    nramp.color_ramp.elements[1].color = (0.018, 0.062, 0.16, 1)
    boost = nt.nodes.new("ShaderNodeMixRGB")      # одыг тодруулна
    boost.location = (-320, 150)
    boost.blend_type = "MULTIPLY"
    boost.inputs["Fac"].default_value = 1.0
    boost.inputs["Color2"].default_value = (16.0, 16.0, 17.0, 1)
    add = nt.nodes.new("ShaderNodeMixRGB")
    add.location = (-250, 0)
    add.blend_type = "ADD"
    add.inputs["Fac"].default_value = 1.0
    nt.links.new(coord.outputs["Generated"], vor.inputs["Vector"])
    nt.links.new(coord.outputs["Generated"], neb.inputs["Vector"])
    nt.links.new(vor.outputs["Distance"], star.inputs["Fac"])
    nt.links.new(neb.outputs["Fac"], nramp.inputs["Fac"])
    nt.links.new(nramp.outputs["Color"], add.inputs["Color1"])
    nt.links.new(star.outputs["Color"], boost.inputs["Color1"])
    nt.links.new(boost.outputs["Color"], add.inputs["Color2"])
    nt.links.new(add.outputs["Color"], e.inputs["Color"])
    e.inputs["Strength"].default_value = 2.6
    nt.links.new(e.outputs["Emission"], out.inputs["Surface"])
    return mat


# ══════════════════════════════════════════════════════════════════════
#  Бүтцүүд
# ══════════════════════════════════════════════════════════════════════
def build_floor(M):
    """Шал — том метал хавтангууд, хооронд нь ховил."""
    w, d = CFG["room"]["w"], CFG["room"]["d"]
    step, gap = 1.25, 0.035
    nx, ny = int(w / step) + 1, int(d / step) + 1
    box("FloorBase", (w + 0.4, d + 0.4, 0.12), (0, 0, -0.14), mat=M["dark"])
    for i in range(nx):
        for j in range(ny):
            x = -w / 2 + step / 2 + i * step
            y = -d / 2 + step / 2 + j * step
            if x > w / 2 or y > d / 2:
                continue
            t = 0.07 + rng.uniform(-0.004, 0.004)
            box("FloorPlate_%02d_%02d" % (i, j), (step - gap, step - gap, t),
                (x, y, -t / 2), mat=M["floor"], bevel=0.012)
            box("FloorInset_%02d_%02d" % (i, j), (step - gap - 0.16, step - gap - 0.16, 0.012),
                (x, y, -0.004), mat=M["floor"], bevel=0.008)
            if rng.random() < 0.22:        # зарим хавтан дээр бэхэлгээний толгой
                for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                    box("Bolt", (0.07, 0.07, 0.012),
                        (x + sx * (step / 2 - 0.13), y + sy * (step / 2 - 0.13), -0.004),
                        mat=M["dark"])


def floor_detail(M):
    """Шалны люк, тор, бэхэлгээний цагираг."""
    w, d = CFG["room"]["w"], CFG["room"]["d"]
    for (fx, fy, fw, fd) in ((-3.2, -2.6, 1.5, 1.5), (2.8, -3.0, 1.3, 1.3), (-1.0, 2.9, 1.8, 1.1)):
        box("FloorHatch", (fw, fd, 0.05), (fx, fy, -0.025), mat=M["metal"], bevel=0.02)
        box("HatchRim", (fw + 0.14, fd + 0.14, 0.03), (fx, fy, -0.04), mat=M["dark"])
        for k in range(6):                     # торны хавирга
            box("HatchBar", (fw - 0.18, 0.055, 0.035), (fx, fy - fd / 2 + 0.16 + k * (fd - 0.3) / 5, 0.005),
                mat=M["dark"])
        box("HatchHandle", (0.26, 0.10, 0.05), (fx + fw / 2 - 0.22, fy, 0.035), mat=M["metal"], bevel=0.015)
    for (tx, ty) in ((-4.2, 1.8), (4.2, -1.4), (-4.2, -3.2), (4.2, 2.6)):
        cyl("TieRing", 0.09, 0.04, (tx, ty, 0.01), mat=M["dark"], verts=12)
        box("TiePlate", (0.30, 0.30, 0.02), (tx, ty, -0.005), mat=M["metal"], bevel=0.01)
    for side in (-1, 1):                       # хана-шалны шилжилтийн зурвас
        box("FloorKerb", (0.22, d - 0.3, 0.09), (side * (w / 2 - 0.24), 0, 0.02),
            mat=M["metal"], bevel=0.02)


def build_shell(M):
    """Хана, дээвэр, тэдгээрийн хавтангууд."""
    w, d, h = CFG["room"]["w"], CFG["room"]["d"], CFG["room"]["h"]
    # налуу цонхны хана урагш гарах тул тааз, хажуу ханыг тэр хэмжээгээр уртасгана
    lean = max(0.0, h * math.sin(math.radians(CFG["window"]["tilt_deg"]))) + 0.5
    dd, cy = d + 0.4 + lean, lean / 2
    box("Ceiling", (w + 0.4, dd, 0.25), (0, cy, h + 0.12), mat=M["ceil"])
    box("WallBack", (w + 0.4, 0.25, h), (0, -d / 2 - 0.12, h / 2), mat=M["wall"])
    for side in (-1, 1):
        box("WallSide_%d" % side, (0.25, dd, h), (side * (w / 2 + 0.12), cy, h / 2), mat=M["wall"])
        # хананы хэвтээ хавирга
        for z in (0.55, 1.5, 2.35):
            box("Rib", (0.09, d, 0.16), (side * (w / 2 - 0.05), 0, z), mat=M["metal"], bevel=0.01)
        # босоо завсар
        for y in [-3.0, -1.4, 0.4, 2.2]:
            box("Seam", (0.06, 0.05, h - 0.3), (side * (w / 2 - 0.04), y, h / 2), mat=M["dark"])

    # таазны гэрлийн самбарууд — доторхыг гаднаас харагдуулна
    for i, yy in enumerate((-2.4, -0.3, 1.9)):
        box("CeilLampRim_%d" % i, (4.6, 0.70, 0.16), (0, yy, h - 0.14), mat=M["metal"], bevel=0.02)
        box("CeilLamp_%d" % i, (4.2, 0.50, 0.09), (0, yy, h - 0.20), mat=M["warmpanel"])
    for sx in (-1, 1):
        box("WallLampRim_%d" % sx, (0.16, 3.2, 0.34), (sx * (w / 2 - 0.20), 0.6, 2.25),
            mat=M["metal"], bevel=0.02)
        box("WallLamp_%d" % sx, (0.08, 2.9, 0.22), (sx * (w / 2 - 0.29), 0.6, 2.25),
            mat=M["warmpanel"])

    # дээврийн дам нуруу ба хавтангууд
    for x in [-3.6, -1.2, 1.2, 3.6]:
        box("CeilBeam", (0.20, d - 0.3, 0.16), (x, 0, h - 0.09), mat=M["metal"], bevel=0.01)
    for y in [-2.6, -0.6, 1.6]:
        box("CeilCross", (w - 0.4, 0.14, 0.11), (0, y, h - 0.06), mat=M["metal"], bevel=0.008)
    for i in range(10):                    # дээврийн жижиг агааржуулагч
        box("CeilVent", (0.45, 0.30, 0.035),
            (rng.uniform(-4.2, 4.2), rng.uniform(-3.4, 3.2), h - 0.19), mat=M["dark"])

    # хойд хананы бүтэц — кадрын дэвсгэрт байнга ордог
    by = -d / 2 + 0.14
    for xx in (-3.6, -2.2, -0.8, 0.6, 2.0, 3.4):
        box("BackSeamV", (0.06, 0.05, h - 0.25), (xx, by, h / 2 - 0.05), mat=M["dark"])
    for zz in (0.95, 1.92, 2.78):
        box("BackSeamH", (w - 0.5, 0.05, 0.05), (0, by, zz), mat=M["dark"])
    box("BackRack", (2.3, 0.30, 1.65), (-2.4, by + 0.12, 0.90), mat=M["wall"], bevel=0.04)
    box("BackRackFace", (2.05, 0.08, 1.45), (-2.4, by + 0.26, 0.92), mat=M["dark"], bevel=0.02)
    for k in range(5):
        box("BackShelf", (1.9, 0.06, 0.16), (-2.4, by + 0.30, 1.52 - k * 0.29), mat=M["wall"], bevel=0.01)
    for k in range(8):
        box("BackBtn", (0.06, 0.05, 0.045),
            (-3.1 + (k % 4) * 0.42, by + 0.31, 1.30 - (k // 4) * 0.58),
            mat=M["amber"] if k % 3 else M["screen"])
    box("BackScreen", (0.62, 0.05, 0.34), (-1.5, by + 0.31, 1.24), mat=M["dim_screen"])
    box("BackScreenRim", (0.72, 0.05, 0.44), (-1.5, by + 0.29, 1.24), mat=M["dark"], bevel=0.01)
    for k in range(6):                          # люк ба бэхэлгээ
        xx = rng.uniform(0.2, 4.2)
        zz = rng.uniform(0.5, 2.5)
        box("BackHatch", (rng.uniform(0.5, 1.0), 0.08, rng.uniform(0.4, 0.8)),
            (xx, by + 0.04, zz), mat=M["metal"], bevel=0.02)
        for cx, cz in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            box("BackBolt", (0.05, 0.03, 0.05), (xx + cx * 0.18, by + 0.08, zz + cz * 0.13), mat=M["dark"])
    for k, zz in enumerate((2.58, 2.40)):       # хойд хананы хоолой
        cyl("BackPipe_%d" % k, 0.06 + 0.02 * k, w - 1.4, (0, by + 0.16, zz),
            rot=(0, math.radians(90), 0), mat=M["metal"])
    for xx in (-3.4, -1.0, 1.4, 3.8):
        box("BackPipeClamp", (0.10, 0.30, 0.46), (xx, by + 0.16, 2.49), mat=M["dark"])

    # баруун хананы люк + самбар
    door = box("DoorFrame", (0.18, 1.5, 2.35), (w / 2 - 0.16, -0.9, 1.18), mat=M["metal"], bevel=0.02)
    box("DoorLeaf", (0.10, 1.25, 2.10), (w / 2 - 0.26, -0.9, 1.10), mat=M["wall"], bevel=0.015)
    for z in (0.55, 1.05, 1.55):
        box("DoorRib", (0.05, 1.15, 0.10), (w / 2 - 0.33, -0.9, z), mat=M["dark"])
    box("DoorLight", (0.03, 0.22, 0.07), (w / 2 - 0.34, -0.15, 1.95), mat=M["screen"])

    # хананы хэрэгслийн хайрцгууд
    for y, z, ww, hh in ((2.6, 1.75, 0.9, 0.62), (-2.7, 1.62, 0.7, 0.5)):
        box("WallBox", (0.28, ww, hh), (w / 2 - 0.30, y, z), mat=M["metal"], bevel=0.02)
        for k in range(5):
            box("WallBtn", (0.03, 0.07, 0.05),
                (w / 2 - 0.45, y - ww / 2 + 0.15 + k * (ww - 0.3) / 4, z + hh / 2 - 0.12),
                mat=M["amber"] if k % 2 else M["screen"])

    # хананы оёдол, люк, хоолойн зам — хавтгай гадаргууг эвднэ
    for side in (-1, 1):
        wx = side * (w / 2 - 0.13)
        for yy in (-3.3, -2.1, -0.9, 0.3, 1.5, 2.7):
            box("WallSeamV", (0.05, 0.06, h - 0.25), (wx, yy, h / 2 - 0.05), mat=M["dark"])
        for zz in (0.95, 1.92, 2.78):
            box("WallSeamH", (0.05, d - 0.5, 0.05), (wx, 0.2, zz), mat=M["dark"])
        for k in range(7):                     # люк ба хавтангууд
            yy = rng.uniform(-3.6, 2.9)
            zz = rng.uniform(0.45, 2.55)
            box("WallHatch", (0.08, rng.uniform(0.45, 1.0), rng.uniform(0.35, 0.8)),
                (wx - side * 0.03, yy, zz), mat=M["metal"], bevel=0.02)
            for cx, cz in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                box("HatchBolt", (0.03, 0.05, 0.05),
                    (wx - side * 0.07, yy + cx * 0.17, zz + cz * 0.13), mat=M["dark"])
        for k in range(5):                     # жижиг агааржуулагч
            box("WallVent", (0.06, 0.30, 0.22),
                (wx - side * 0.04, rng.uniform(-3.4, 2.6), rng.uniform(0.6, 2.4)), mat=M["dark"])
        box("WallDuct", (0.22, d - 1.2, 0.26), (wx - side * 0.14, 0.1, 2.62),
            mat=M["metal"], bevel=0.04)
        for yy in (-3.0, -1.2, 0.6, 2.4):      # хоолойн бэхэлгээ
            box("DuctClamp", (0.30, 0.09, 0.34), (wx - side * 0.16, yy, 2.62), mat=M["dark"])

    # баруун хананы тоноглолын хана (нисгэгчийн ард байрлах дэвсгэр)
    rx = w / 2 - 0.30
    for i, yy in enumerate((-3.3, -2.15, -1.0)):
        box("RackBody_%d" % i, (0.42, 1.02, 1.75), (rx - 0.04, yy, 0.90), mat=M["wall"], bevel=0.03)
        box("RackFace_%d" % i, (0.06, 0.92, 1.62), (rx - 0.26, yy, 0.92), mat=M["dark"], bevel=0.02)
        for k in range(5):                     # жижиг зүүний хэсгүүд
            box("RackPanel_%d_%d" % (i, k), (0.05, 0.80, 0.20),
                (rx - 0.29, yy, 1.52 - k * 0.30), mat=M["wall"], bevel=0.01)
        for k in range(2):                     # хоёрхон бүдэг дэлгэц
            box("RackScreen_%d_%d" % (i, k), (0.04, 0.30, 0.14),
                (rx - 0.31, yy - 0.20, 1.48 - k * 0.61), mat=M["dim_screen"])
        for k in range(7):                     # заагч гэрлүүд
            box("RackBtn_%d_%d" % (i, k), (0.035, 0.05, 0.04),
                (rx - 0.31, yy - 0.30 + k * 0.10, 0.55 + (k % 3) * 0.30),
                mat=M["amber"] if k % 3 else M["red"])
    box("RackTop", (0.50, 3.4, 0.14), (rx - 0.04, -2.15, 1.85), mat=M["metal"], bevel=0.02)
    box("RackLampRim", (0.26, 3.0, 0.14), (rx - 0.36, -2.15, 1.94), mat=M["metal"], bevel=0.02)
    box("RackLamp", (0.14, 2.8, 0.07), (rx - 0.39, -2.15, 1.89), mat=M["warmpanel"])
    for k in range(3):                         # хананы дагуух хоолой
        cyl("RackPipe_%d" % k, 0.05 + 0.015 * k, 5.4, (rx - 0.62, -1.2, 2.45 - k * 0.17),
            rot=(math.radians(90), 0, 0), mat=M["metal"])

    # зүүн хананы хоолойнууд
    for i, z in enumerate((2.55, 2.72, 2.38)):
        r = 0.055 + 0.02 * (i % 2)
        cyl("PipeL_%d" % i, r, d - 0.5, (-w / 2 + 0.28 + i * 0.14, 0, z),
            rot=(math.radians(90), 0, 0), mat=M["metal"])
    for y in [-3.0, -1.2, 0.8, 2.6]:       # хоолойн бэхэлгээ
        box("PipeClamp", (0.5, 0.1, 0.55), (-w / 2 + 0.36, y, 2.55), mat=M["dark"])


def build_window(M):
    """Урд талын налуу цонхны хана — хоёр том цонх, дунд нь багана."""
    wcfg, room = CFG["window"], CFG["room"]
    w, h = room["w"], room["h"]
    y0 = room["d"] / 2
    tilt = math.radians(wcfg["tilt_deg"])
    root = empty("WINDOW_WALL", (0, y0, 0), (-tilt, 0, 0))

    sill, head, pil, edge = wcfg["sill"], wcfg["head"], wcfg["pillar"], wcfg["edge"]
    th = 0.30                                    # ханын зузаан

    def wall_box(name, size, loc, bevel=0.02, mat=None):
        return box(name, size, loc, mat=mat or M["wall"], parent=root, bevel=bevel)

    wall_box("WinSill", (w, th, sill), (0, 0, sill / 2))                     # доод хэсэг
    wall_box("WinHead", (w, th, h - head), (0, 0, head + (h - head) / 2))    # дээд хэсэг
    wall_box("WinPillar", (pil * 2, th + 0.06, head - sill), (0, 0, (sill + head) / 2))
    for side in (-1, 1):                                                     # хажуугийн тулгуур
        wall_box("WinEdge_%d" % side, (edge, th, head - sill),
                 (side * (w / 2 - edge / 2), 0, (sill + head) / 2))

    # цонхны хүрээ ба дундах нимгэн хуваагч
    for side in (-1, 1):
        x_in = side * pil
        x_out = side * (w / 2 - edge)
        lo, hi = min(x_in, x_out), max(x_in, x_out)
        box("WinFrameTop_%d" % side, (abs(x_out - x_in), th + 0.10, 0.14),
            ((lo + hi) / 2, 0, head - 0.06), mat=M["metal"], parent=root, bevel=0.012)
        box("WinFrameBot_%d" % side, (abs(x_out - x_in), th + 0.14, 0.18),
            ((lo + hi) / 2, -0.02, sill + 0.08), mat=M["metal"], parent=root, bevel=0.012)
        n = wcfg["mullions"]
        for k in range(1, n):
            x = lo + (hi - lo) * k / n
            box("Mullion", (0.10, th + 0.04, head - sill - 0.1),
                (x, 0, (sill + head) / 2), mat=M["metal"], parent=root, bevel=0.008)
        if CFG["glass"]:
            box("Glass_%d" % side, (abs(x_out - x_in) - 0.04, 0.02, head - sill - 0.08),
                ((lo + hi) / 2, 0.04, (sill + head) / 2), mat=M["glass"], parent=root)

    # доод самбарын нарийн ширхэгүүд (зай байвал)
    for k in range(18 if sill > 0.55 else 0):
        x = rng.uniform(-w / 2 + 0.6, w / 2 - 0.6)
        box("SillGreeble", (rng.uniform(0.18, 0.5), 0.06, rng.uniform(0.05, 0.14)),
            (x, -th / 2 - 0.03, rng.uniform(0.2, sill - 0.15)), mat=M["dark"], parent=root)

    # цонхны дээд ирмэгийн гэрэлтэй товчны эгнээ — өрөөний доторх талд
    zb = head + 0.22 if (CFG["room"]["h"] - head) > 0.34 else head - 0.16
    yb = -th / 2 - 0.03 if (CFG["room"]["h"] - head) > 0.34 else -th / 2 - 0.12
    for k in range(16):
        x = -w / 2 + 1.0 + k * 0.42
        box("HeadBtnRim", (0.24, 0.06, 0.18), (x, yb + 0.02, zb), mat=M["dark"], parent=root)
        box("HeadBtn", (0.16, 0.06, 0.10), (x, yb - 0.02, zb),
            mat=M["amber"] if k % 3 else M["screen"], parent=root)
    return root


def build_console(M):
    """Гол консол — урд талдаа бүлээн гэрэлтэй, дээд гадаргуу налуу."""
    c = CFG["console"]
    tilt = math.radians(c["tilt_deg"] if c["tilt_deg"] is not None else CFG["lean_deg"])
    y, w, dep, hgt = c["y"], c["w"], c["depth"], c["h"]
    front = y - dep / 2

    box("ConsoleBody", (w, dep, hgt), (0, y, hgt / 2), mat=M["wall"], bevel=0.03)
    box("ConsoleKick", (w - 0.3, dep - 0.2, 0.12), (0, y, 0.06), mat=M["dark"])

    # урд талын гэрэлтэх хавтангууд
    n = c["glow_panels"]
    pw = (w - 0.6) / n
    for i in range(n):
        x = -w / 2 + 0.3 + pw * (i + 0.5)
        box("GlowRecess", (pw - 0.10, 0.10, 0.50), (x, front + 0.04, 0.40), mat=M["dark"])
        box("GlowPanel", (pw - 0.18, 0.04, 0.42), (x, front - 0.015, 0.40), mat=M["glow"])
        box("GlowRibTop", (pw - 0.10, 0.14, 0.07), (x, front + 0.02, 0.66), mat=M["metal"])
        box("GlowRibBot", (pw - 0.10, 0.14, 0.07), (x, front + 0.02, 0.14), mat=M["metal"])
        for sl in range(3):                    # гэрлийн доторх хэвтээ дүнз
            box("GlowSlat", (pw - 0.18, 0.05, 0.022),
                (x, front - 0.03, 0.24 + sl * 0.16), mat=M["dark"])

    # налуу дээд гадаргуу
    top = empty("CONSOLE_TOP", (0, y - 0.05, hgt + 0.04), (tilt, 0, 0))
    box("DeskSlab", (w, dep * 0.95, 0.10), (0, 0, 0), mat=M["metal"], parent=top, bevel=0.02)
    box("DeskLip", (w, 0.10, 0.16), (0, -dep * 0.45, 0.04), mat=M["metal"], parent=top, bevel=0.015)

    # дээд гадаргуу дээрх товч, дэлгэц
    for i in range(130):
        px = rng.uniform(-w / 2 + 0.25, w / 2 - 0.25)
        py = rng.uniform(-dep * 0.36, dep * 0.36)
        kind = rng.random()
        if kind < 0.10:
            m, sz = M["dim_screen"], (rng.uniform(0.24, 0.40), rng.uniform(0.16, 0.26), 0.02)
        elif kind < 0.26:
            m, sz = M["amber"], (rng.uniform(0.045, 0.09), rng.uniform(0.04, 0.07), 0.022)
        elif kind < 0.34:
            m, sz = M["red"], (0.045, 0.045, 0.028)
        elif kind < 0.44:
            m, sz = M["screen"], (rng.uniform(0.05, 0.10), rng.uniform(0.04, 0.07), 0.022)
        elif kind < 0.72:
            m, sz = M["metal"], (rng.uniform(0.10, 0.30), rng.uniform(0.07, 0.20), rng.uniform(0.015, 0.035))
        else:
            m, sz = M["dark"], (rng.uniform(0.08, 0.22), rng.uniform(0.06, 0.16), rng.uniform(0.02, 0.05))
        box("Key", sz, (px, py, 0.05 + sz[2] / 2), mat=m, parent=top)
        if kind >= 0.44 and rng.random() < 0.6:
            box("KeyRim", (sz[0] + 0.06, sz[1] + 0.06, 0.018), (px, py, 0.054), mat=M["dark"], parent=top)

    # төвийн өндөрлөсөн хэсэг + монитор
    box("CenterStack", (1.9, 0.85, 0.42), (0.1, y + 0.15, hgt + 0.20), mat=M["wall"], bevel=0.02)
    mon = empty("MONITOR", (0.1, y + 0.02, hgt + 0.44), (math.radians(74), 0, 0))
    box("MonitorCase", (1.25, 0.62, 0.09), (0, 0, 0), mat=M["dark"], parent=mon, bevel=0.012)
    box("MonitorScreen", (1.06, 0.46, 0.02), (0, 0, 0.055), mat=M["dim_screen"], parent=mon)
    for r in range(3):
        box("MonRow", (0.92, 0.06, 0.004), (0, -0.14 + r * 0.14, 0.066), mat=M["screen"], parent=mon)
    box("MonitorHood", (1.30, 0.10, 0.14), (0, 0.32, 0.05), mat=M["metal"], parent=mon)

    # хажуугийн эргэсэн жигүүрүүд
    for side in (-1, 1):
        wing = empty("WING_%d" % side, (side * (w / 2 + 0.72), y - 0.55, 0), (0, 0, side * math.radians(-26)))
        box("WingBody", (1.9, dep * 0.9, hgt), (0, 0, hgt / 2), mat=M["wall"], parent=wing, bevel=0.03)
        box("WingGlow", (1.5, 0.04, 0.34), (0, -dep * 0.45 - 0.01, 0.42), mat=M["glow"], parent=wing)
        wtop = empty("WING_TOP_%d" % side, (0, -0.05, hgt + 0.04), (tilt, 0, 0))
        wtop.parent = wing
        box("WingSlab", (1.9, dep * 0.85, 0.09), (0, 0, 0), mat=M["metal"], parent=wtop, bevel=0.015)
        for i in range(16):
            box("WingKey", (rng.uniform(0.08, 0.22), rng.uniform(0.07, 0.18), 0.03),
                (rng.uniform(-0.8, 0.8), rng.uniform(-0.4, 0.4), 0.06),
                mat=rng.choice([M["dark"], M["amber"], M["screen"]]), parent=wtop)

    return top


def sweep_arc(name, cx, cy, r, a0, a1, steps, profile, mat, col=None):
    """Хаалттай огтлолыг нумын дагуу шүүрдэж гөлгөр гадаргуу үүсгэнэ.

    profile = [(радиус чиглэлийн хазайлт, өндөр), ...] — хаалттай контур.
    Өнцөгтэй сегментийн оронд тасралтгүй нум гарна.
    """
    n = len(profile)
    verts = []
    for i in range(steps + 1):
        a = a0 + (a1 - a0) * i / steps
        sa, ca = math.sin(a), math.cos(a)
        for (ro, z) in profile:
            verts.append((cx + (r + ro) * sa, cy + (r + ro) * ca, z))
    faces = []
    for sgi in range(steps):
        p0, p1 = sgi * n, (sgi + 1) * n
        for i in range(n):
            j = (i + 1) % n
            faces.append((p0 + i, p0 + j, p1 + j, p1 + i))
    faces.append(tuple(range(n - 1, -1, -1)))                       # эхний таг
    faces.append(tuple(range(steps * n, (steps + 1) * n)))          # сүүлийн таг
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.validate()
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    if mat:
        ob.data.materials.append(mat)
    _link(ob, col or bpy.data.collections[COL])
    return ob


def build_station(M):
    """Кадрын доод ирмэгийг нөхөх консолын ирмэг.

    Жүжигчний бие бичлэгийн доод хүрээгээр тасардаг тул тэр зурвасыг
    халхлах хэрэгтэй. Дэлхийн координатад тавихад камер хөдлөхөд байрлал
    нь алдагддаг учир ирмэгийг КАМЕРЫН координатад барьж, кадрын доод
    хэдэн хувийг эзлэхийг шууд тооцоолно.
    """
    c = CFG["controls"]
    if not c.get("ring_on"):
        return None
    cam = bpy.data.objects.get("SET_CAM")
    if cam is None:
        return None
    d, v = c["ledge_depth"], c["ledge_screen"]
    bow, wdt = c["ledge_bow"], c["ledge_width"]
    half_h = d * (10.125 / cam.data.lens)     # 16:9 кадрын босоо хагас өндөр
    y_top = (2.0 * v - 1.0) * half_h

    piv = empty("LEDGE", (0.0, 0.0, 0.0))
    piv.parent = cam
    piv.location = (0.0, y_top, -d)
    piv.rotation_euler = (0.0, 0.0, 0.0)

    lean = math.radians(CFG["lean_deg"])
    n = 18
    seg_w = wdt / n * 1.3
    made = []
    for i in range(n):
        t = (i + 0.5) / n - 0.5
        x = t * wdt
        zc = -bow * (1.0 - math.cos(t * math.pi))
        rz = -t * math.pi * bow * 0.5
        made.append(box("LedgeTop_%02d" % i, (seg_w, 0.08, 0.40),
                        (x, -0.055, zc - 0.17), rot=(lean, rz, 0), mat=M["metal"], bevel=0.02))
        made.append(box("LedgeBody_%02d" % i, (seg_w, 0.42, 0.40),
                        (x, -0.28, zc - 0.17), rot=(0, rz, 0), mat=M["wall"], bevel=0.03))
        made.append(box("LedgeLip_%02d" % i, (seg_w, 0.06, 0.09),
                        (x, -0.03, zc + 0.02), rot=(0, rz, 0), mat=M["metal"], bevel=0.025))
        made.append(box("LedgeGlow_%02d" % i, (seg_w * 0.84, 0.10, 0.03),
                        (x, -0.34, zc + 0.02), rot=(0, rz, 0), mat=M["glow"]))
        for k in range(2):
            kind = rng.random()
            if kind < 0.22:
                m, sz = M["dim_screen"], (0.075, 0.010, 0.055)
            elif kind < 0.55:
                m, sz = (M["amber"] if rng.random() < 0.6 else M["screen"]), (0.030, 0.014, 0.028)
            elif kind < 0.65:
                m, sz = M["red"], (0.026, 0.016, 0.026)
            else:
                m, sz = M["dark"], (rng.uniform(0.04, 0.08), 0.016, rng.uniform(0.03, 0.06))
            made.append(box("LedgeKey_%02d_%d" % (i, k), sz,
                            (x + rng.uniform(-seg_w * 0.3, seg_w * 0.3), -0.035,
                             zc - 0.12 - k * 0.14), rot=(lean, rz, 0), mat=m))
    # ── Гарыг далдлах товгор хэсэг (сонголтоор) ──
    if c.get("cover_on"):
        dc = c["cover_depth"]
        hh = dc * (10.125 / cam.data.lens)          # босоо хагас өндөр
        hw = hh * 16.0 / 9.0                        # хэвтээ хагас өргөн
        cxs = (2.0 * c["cover_x"] - 1.0) * hw
        cys = (2.0 * c["cover_y"] - 1.0) * hh
        cw, ch = c["cover_w"] * 2 * hw, c["cover_h"] * 2 * hh
        cov = empty("HAND_COVER", (0.0, 0.0, 0.0))
        cov.parent = cam
        cov.location = (cxs, cys, -dc)
        parts = [
            box("CoverBody", (cw, ch, 0.30), (0, 0, -0.15), mat=M["wall"], bevel=0.03),
            box("CoverFace", (cw * 0.92, ch * 0.86, 0.05), (0, 0, 0.02),
                rot=(math.radians(CFG["lean_deg"]), 0, 0), mat=M["metal"], bevel=0.02),
            box("CoverRim", (cw * 1.04, ch * 0.10, 0.09), (0, ch * 0.46, 0.01), mat=M["metal"], bevel=0.02),
            box("CoverGlow", (cw * 0.70, 0.02, 0.02), (0, -ch * 0.44, 0.03), mat=M["glow"]),
        ]
        for k in range(7):                          # гадаргуугийн удирдлагууд
            kind = rng.random()
            if kind < 0.3:
                m, sz = (M["amber"] if rng.random() < 0.5 else M["screen"]), (0.022, 0.020, 0.020)
            elif kind < 0.42:
                m, sz = M["red"], (0.020, 0.018, 0.020)
            elif kind < 0.58:
                m, sz = M["dim_screen"], (0.070, 0.045, 0.008)
            else:
                m, sz = M["dark"], (rng.uniform(0.03, 0.07), rng.uniform(0.02, 0.05), 0.014)
            parts.append(box("CoverKey_%d" % k, sz,
                             (rng.uniform(-cw * 0.34, cw * 0.34), rng.uniform(-ch * 0.28, ch * 0.28), 0.05),
                             rot=(math.radians(CFG["lean_deg"]), 0, 0), mat=m))
        for ob in parts:
            ob.parent = cov
    for ob in made:
        ob.parent = piv
    return piv


def build_controls(M):
    """Нисгэгчийн удирдлага — жүжигчний гарын байрлалд тааруулсан.

    Хэмжээг CFG["controls"]-оос авна. Композитод гар нь бариул дээр
    яг таарахгүй байвал тэндхийн тоог өөрчилнө.
    """
    st, c = CFG["seat"], CFG["controls"]
    x, y = st["x"] + c["yoke_side"], st["y"] + c["yoke_fwd"]
    z, span = c["yoke_z"], c["yoke_span"]
    lean = math.radians(CFG["lean_deg"])       # бие, консол, жолоо ижил налуутай
    back = (-lean, 0, 0)                       # нисгэгч рүү налах
    up = (lean, 0, 0)                          # нисгэгч рүү харсан гадаргуу

    # ── Хоёр гарын жолоо ──
    box("YokeColumn", (0.15, 0.19, z - 0.22), (x, y + 0.11, (z - 0.22) / 2 + 0.06),
        rot=back, mat=M["dark"], bevel=0.03)
    box("YokeHub", (0.24, 0.17, 0.15), (x, y, z), rot=back, mat=M["dark"], bevel=0.03)
    box("YokeFace", (0.14, 0.03, 0.09), (x, y - 0.09, z + 0.02), rot=back, mat=M["dim_screen"])
    for sx in (-1, 1):
        box("YokeArm_%d" % sx, (span * 0.8, 0.09, 0.06), (x + sx * span * 0.62, y, z),
            rot=back, mat=M["metal"], bevel=0.02)
        box("YokeGrip_%d" % sx, (0.095, 0.13, 0.21), (x + sx * span, y - 0.01, z),
            rot=back, mat=M["dark"], bevel=0.045)
        box("YokeTrig_%d" % sx, (0.04, 0.04, 0.025), (x + sx * span, y - 0.08, z + 0.08),
            rot=back, mat=M["red"])

    # ── Суудлын хажуугийн удирдлагын самбар ──
    ax, ay, az = st["x"] + c["side_x"], st["y"] + c["side_y"], c["side_z"]
    box("SideConsole", (0.33, 0.60, 0.11), (ax, ay, az), rot=up, mat=M["wall"], bevel=0.03)
    box("SideRim", (0.36, 0.63, 0.04), (ax, ay, az + 0.06), rot=up, mat=M["metal"], bevel=0.02)
    box("SidePost", (0.11, 0.15, az - 0.18), (ax, ay - 0.18, (az - 0.18) / 2), mat=M["dark"], bevel=0.02)
    cyl("SideKnob", 0.058, 0.10, (ax - 0.05, ay + 0.18, az + 0.11), mat=M["metal"], verts=18)
    cyl("SideKnobCap", 0.032, 0.04, (ax - 0.05, ay + 0.18, az + 0.18), mat=M["dark"], verts=14)
    box("SideLever", (0.05, 0.07, 0.24), (ax + 0.09, ay + 0.02, az + 0.15),
        rot=(math.radians(-13), 0, 0), mat=M["dark"], bevel=0.02)
    box("SideLeverKnob", (0.07, 0.09, 0.06), (ax + 0.09, ay - 0.01, az + 0.26), mat=M["metal"], bevel=0.02)
    for k in range(6):
        box("SideBtn_%d" % k, (0.035, 0.05, 0.018),
            (ax - 0.10 + (k % 2) * 0.10, ay - 0.20 - (k // 2) * 0.09, az + 0.075),
            mat=M["amber"] if k % 2 else M["screen"])
    box("SideScreen", (0.15, 0.10, 0.012), (ax, ay - 0.08, az + 0.075), mat=M["dim_screen"])
    return None


def build_seat(M):
    s = CFG["seat"]
    x, y, k = s["x"], s["y"], s["scale"]
    root = empty("SEAT", (x, y, 0))
    box("SeatFoot", (0.72 * k, 0.80 * k, 0.10), (0, 0, 0.05), mat=M["dark"], parent=root, bevel=0.02)
    cyl("SeatPost", 0.13 * k, 0.44, (0, 0, 0.30), mat=M["dark"], parent=root)
    box("SeatMech", (0.46 * k, 0.52 * k, 0.16), (0, 0, 0.56), mat=M["dark"], parent=root, bevel=0.02)
    box("SeatPan", (0.78 * k, 0.70 * k, 0.13), (0, 0.02, 0.70), mat=M["seat"], parent=root, bevel=0.05)
    for side in (-1, 1):                       # суултын хажуугийн дэр
        box("SeatBolster", (0.12 * k, 0.66 * k, 0.10), (side * 0.33 * k, 0.02, 0.78),
            mat=M["seat"], parent=root, bevel=0.04)
    back = empty("SEAT_BACK", (x, y - 0.32 * k, 0.74), (math.radians(-11), 0, 0))
    box("SeatBack", (0.76 * k, 0.20 * k, 0.78), (0, 0, 0.40), mat=M["seat"], parent=back, bevel=0.07)
    for side in (-1, 1):                       # түшлэгийн хажуугийн дэр
        box("SeatWing", (0.11 * k, 0.26 * k, 0.68), (side * 0.35 * k, 0.03, 0.42),
            mat=M["seat"], parent=back, bevel=0.05)
    box("SeatBackRib", (0.34 * k, 0.05, 0.62), (0, -0.12, 0.40), mat=M["dark"], parent=back)
    box("SeatHeadStem", (0.13, 0.07, 0.16), (0, 0, 0.86), mat=M["dark"], parent=back)
    box("SeatHead", (0.50 * k, 0.22 * k, 0.26), (0, 0.01, 1.04), mat=M["seat"], parent=back, bevel=0.07)
    for side in (-1, 1):
        box("SeatArm", (0.12 * k, 0.50 * k, 0.09), (side * 0.40 * k, 0.06, 0.92), mat=M["seat"],
            parent=root, bevel=0.03)
        box("SeatArmPost", (0.08, 0.10, 0.20), (side * 0.40 * k, 0.22, 0.80), mat=M["dark"], parent=root)
    return root


def build_cables(M):
    """Дээврээс унжсан кабель, хоолойнууд."""
    h = CFG["room"]["h"]
    pts = [
        [(-4.3, 3.1, h - 0.30), (-3.4, 3.0, h - 0.62), (-2.4, 2.9, h - 0.35), (-1.5, 2.8, h - 0.28)],
        [(-4.5, 2.7, h - 0.32), (-3.6, 2.6, h - 0.75), (-2.6, 2.5, h - 0.48), (-1.7, 2.5, h - 0.30)],
        [(-4.6, 3.3, h - 0.26), (-4.0, 3.4, h - 0.95), (-3.2, 3.3, h - 0.58)],
        [(2.6, 3.2, h - 0.28), (3.4, 3.1, h - 0.55), (4.2, 3.0, h - 0.30)],
    ]
    for i, p in enumerate(pts):
        tube("Cable_%d" % i, [Vector(v) for v in p], 0.028 + rng.uniform(0, 0.02), mat=M["cable"])
    for i, x in enumerate((-2.0, 2.2)):    # хөндлөн хоолой
        tube("DuctRun_%d" % i,
             [Vector((x, -3.6, h - 0.42)), Vector((x, -0.5, h - 0.40)), Vector((x, 3.2, h - 0.46))],
             0.075, mat=M["metal"])


def build_lights(M):
    """Гэрэлтүүлэг — консолын бүлээн, цонхны хүйтэн."""
    room = CFG["room"]
    out = []

    def area(name, loc, rot, size, color, power, size_y=None):
        d = bpy.data.lights.new(name, "AREA")
        d.shape = "RECTANGLE"
        d.size, d.size_y = size, size_y or size
        d.color = color
        d.energy = power
        ob = bpy.data.objects.new(name, d)
        ob.location, ob.rotation_euler = loc, rot
        ob.visible_camera = False              # гэрэл өөрөө кадрт харагдахгүй
        _link(ob, bpy.data.collections[COL])
        out.append(ob)
        return ob

    c = CFG["console"]
    front = c["y"] - c["depth"] / 2
    # консолын доорх бүлээн гэрэл — шалыг гэрэлтүүлнэ
    for x in (-3.1, -1.05, 1.05, 3.1):
        area("WarmSpill_%0.0f" % x, (x, front - 0.16, 0.40),
             (math.radians(-64), 0, 0), 1.5, CFG["warm"], 52, size_y=0.45)
    for yy in (-2.4, -0.3, 1.9):               # таазны гэрлийн бодит тусгал
        area("CeilFill_%0.0f" % (yy * 10), (0, yy, room["h"] - 0.30),
             (math.radians(180), 0, 0), 4.2, (1.0, 0.78, 0.55), 34, size_y=0.5)
    # дэлгэцүүдийн ойлт
    area("DeskFill", (0, c["y"] - 0.1, 1.45), (math.radians(180), 0, 0), 2.4, (1.0, 0.78, 0.52), 8, size_y=1.0)
    # цонхны цаадах хүйтэн гэрэл
    ship_on = CFG["ship"]["on"]
    if not ship_on:                            # хөлөггүй үед цонхны цаанаас хүйтэн гэрэл
        area("SpaceKey", (0, room["d"] / 2 + 2.2, 1.9), (math.radians(-90), 0, 0),
             9.0, CFG["cool"], 520, size_y=3.4)
    if not ship_on:
        area("SpaceFill", (-2.0, room["d"] / 2 + 1.2, 2.6), (math.radians(-70), 0, math.radians(12)),
             4.0, (0.45, 0.62, 1.0), 150, size_y=2.0)
    # баруун хананы сул бүлээн
    area("WallWarm", (room["w"] / 2 - 0.5, -0.6, 2.3), (0, math.radians(75), 0), 1.6, CFG["warm"], 26)
    return out


def world_starfield(world):
    """Дэлхийг одон орон болгоно — дотроос цонхоор ч, гаднаас ч харагдана."""
    if getattr(world, "node_tree", None) is None:
        world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    out.location = (400, 0)
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.location = (200, 0)
    coord = nt.nodes.new("ShaderNodeTexCoord")
    coord.location = (-900, 0)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.location = (-700, 150)
    vor.inputs["Scale"].default_value = 130.0
    star = nt.nodes.new("ShaderNodeValToRGB")
    star.location = (-500, 150)
    star.color_ramp.interpolation = "EASE"
    star.color_ramp.elements[0].position = 0.0
    star.color_ramp.elements[0].color = (1, 1, 1, 1)
    star.color_ramp.elements[1].position = 0.040
    star.color_ramp.elements[1].color = (0, 0, 0, 1)
    boost = nt.nodes.new("ShaderNodeMixRGB")
    boost.location = (-320, 150)
    boost.blend_type = "MULTIPLY"
    boost.inputs["Fac"].default_value = 1.0
    boost.inputs["Color2"].default_value = (14.0, 14.0, 15.0, 1)
    neb = nt.nodes.new("ShaderNodeTexNoise")
    neb.location = (-700, -150)
    neb.inputs["Scale"].default_value = 3.0
    neb.inputs["Detail"].default_value = 8.0
    nramp = nt.nodes.new("ShaderNodeValToRGB")
    nramp.location = (-500, -150)
    nramp.color_ramp.elements[0].position = 0.36
    nramp.color_ramp.elements[0].color = (0.0004, 0.001, 0.004, 1)
    nramp.color_ramp.elements[1].position = 0.80
    nramp.color_ramp.elements[1].color = (0.009, 0.022, 0.055, 1)
    add = nt.nodes.new("ShaderNodeMixRGB")
    add.location = (-160, 0)
    add.blend_type = "ADD"
    add.inputs["Fac"].default_value = 1.0
    nt.links.new(coord.outputs["Generated"], vor.inputs["Vector"])
    nt.links.new(coord.outputs["Generated"], neb.inputs["Vector"])
    nt.links.new(vor.outputs["Distance"], star.inputs["Fac"])
    nt.links.new(star.outputs["Color"], boost.inputs["Color1"])
    nt.links.new(neb.outputs["Fac"], nramp.inputs["Fac"])
    nt.links.new(nramp.outputs["Color"], add.inputs["Color1"])
    nt.links.new(boost.outputs["Color"], add.inputs["Color2"])
    nt.links.new(add.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])


def build_haze(M):
    """Өрөөний доторх агаарын манан — эзэлхүүнийг зөвхөн кабинаар хязгаарлана."""
    if not CFG["haze"]:
        return None
    room = CFG["room"]
    mat = bpy.data.materials.new("cab_haze")
    if getattr(mat, "node_tree", None) is None:
        mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    vol = nt.nodes.new("ShaderNodeVolumeScatter")
    vol.inputs["Density"].default_value = CFG["haze"]
    vol.inputs["Anisotropy"].default_value = 0.5
    vol.inputs["Color"].default_value = (0.66, 0.78, 1.0, 1)
    nt.links.new(vol.outputs["Volume"], out.inputs["Volume"])
    ob = box("HAZE_VOLUME", (room["w"] - 0.4, room["d"] - 0.4, room["h"] - 0.15),
             (0, 0, room["h"] / 2), mat=mat)
    ob.visible_shadow = False
    return ob


def build_space(M):
    """Цонхны цаадах сансар."""
    room = CFG["room"]
    plane = box("SPACE_BACKDROP", (46, 0.1, 26), (0, room["d"] / 2 + 16, 6.0), mat=M["space"])
    plane.visible_shadow = False
    return plane


# ══════════════════════════════════════════════════════════════════════
#  Хөлгийн гадна их бие — 6602 ачааны хөлөг
# ══════════════════════════════════════════════════════════════════════
def plate_field(name, a0, a1, b0, b1, fixed, plane, step, mat, parent, thick=0.5, gap=0.3):
    """Талбайг метал хавтангаар бүрхэнэ.
    plane: 'front' (XZ, y=fixed) | 'top' (XY, z=fixed) | 'side' (YZ, x=fixed)"""
    na = max(1, round(abs(a1 - a0) / step))
    nb = max(1, round(abs(b1 - b0) / step))
    da, db = (a1 - a0) / na, (b1 - b0) / nb
    for i in range(na):
        for j in range(nb):
            a = a0 + da * (i + 0.5)
            b = b0 + db * (j + 0.5)
            sa, sb = abs(da) - gap, abs(db) - gap
            if plane == "front":
                size, loc = (sa, thick, sb), (a, fixed, b)
            elif plane == "top":
                size, loc = (sa, sb, thick), (a, b, fixed)
            else:
                size, loc = (thick, sa, sb), (fixed, a, b)
            box("%s_%d_%d" % (name, i, j), size, loc, mat=mat, parent=parent, bevel=0.06)


def loft(name, sections, mat, parent=None, col=None):
    """Хөндлөн огтлолуудыг холбож гөлгөр их бие үүсгэнэ.
    sections = [(y, [(x, z), ...]), ...] — бүх цагираг ижил цэгийн тоотой."""
    n = len(sections[0][1])
    verts = [(x, y, z) for y, ring in sections for (x, z) in ring]
    faces = []
    for si in range(len(sections) - 1):
        a, b = si * n, (si + 1) * n
        for i in range(n):
            j = (i + 1) % n
            faces.append((a + i, a + j, b + j, b + i))
    faces.append(tuple(range(n - 1, -1, -1)))
    faces.append(tuple(range((len(sections) - 1) * n, len(sections) * n)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.validate()
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    if mat:
        ob.data.materials.append(mat)
    _link(ob, col or bpy.data.collections[COL])
    if parent:
        ob.parent = parent
    return ob


def hull_ring(w, h, z0, top=0.70, bot=0.55, cz=0.28):
    """Хавтгайдуу найман өнцөгт хөндлөн огтлол."""
    ht, hb = z0 + h / 2, z0 - h / 2
    return [(-w * top / 2, ht), (w * top / 2, ht),
            (w / 2, ht - h * cz), (w / 2, hb + h * cz),
            (w * bot / 2, hb), (-w * bot / 2, hb),
            (-w / 2, hb + h * cz), (-w / 2, ht - h * cz)]


def hull_marking(name, text, loc, size, mat, parent, rot=(math.pi / 2, 0, math.pi)):
    """Их бие дээрх дугаар/бичиг."""
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = text
    cu.size = size
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.extrude = 0.02
    ob = bpy.data.objects.new(name, cu)
    ob.location, ob.rotation_euler = loc, rot
    ob.data.materials.append(mat)
    _link(ob, bpy.data.collections[COL])
    ob.parent = parent
    return ob


def build_ship(M):
    """Бүтэн хөлөг: хамар, гүүрний блок, их бие, ачааны сегмент, хөдөлгүүр."""
    cfg = CFG["ship"]
    if not cfg["on"]:
        return None
    root = empty("SHIP", (0, 0, 0))
    room = CFG["room"]
    wall_y = room["d"] / 2
    W, D = cfg["width"], cfg["depth"]
    zc = -(D / 2) - 0.5                          # их биеийн төв: дээд тавцан z = -0.5
    deck = -0.5
    R = random.Random(CFG["seed"] + 11)
    nose_y = wall_y + 1.35 + cfg["nose"]
    body_end = -18.0 - cfg["segments"] * cfg["seg_len"]
    stern_y = body_end - cfg["stern"]
    drop = cfg["nose_drop"]

    # ── 1. Их бие — хамраас хойш нэг гөлгөр лофт ──
    # (y, өргөн, өндөр, ДЭЭД ирмэгийн z) — тавцан гүүрнээс хойш тэгш
    secs = [
        (nose_y,         3.0,      3.0,      deck - drop * 0.95),
        (nose_y - 14,    12.0,     7.0,      deck - drop * 0.70),
        (nose_y - 28,    22.0,     12.0,     deck - drop * 0.44),
        (nose_y - 40,    30.0,     17.0,     deck - drop * 0.20),
        (wall_y + 14,    W * 0.72, D * 0.80, deck),
        (wall_y + 1.0,   W * 0.90, D * 0.88, deck),
        (-18.0,          W,        D,        deck),
        (body_end + 20,  W,        D,        deck),
        (body_end,       W * 0.99, D * 0.99, deck),
        (stern_y + 7,    W * 1.06, D * 1.08, deck + 0.6),
        (stern_y,        W * 0.94, D * 0.98, deck + 0.3),
    ]
    loft("HullBody", [(y, hull_ring(w, h, top - h / 2)) for (y, w, h, top) in secs],
         M["hull"], parent=root)

    # ── 2. Гүүрний блок ба цонхны булан ──
    bx = room["w"] / 2 + 1.6
    bz0, bz1 = deck - 0.8, room["h"] + 1.4
    by0, by1 = -room["d"] / 2 - 2.0, wall_y + 1.35
    # хөндий бүрхүүл — урд тал нь нээлттэй, тэндээс цонх харагдана
    rw, rd, rh = room["w"], room["d"], room["h"]
    box("BridgeTop", (bx * 2, by1 - by0, bz1 - rh),
        (0, (by0 + by1) / 2, (rh + bz1) / 2), mat=M["hull"], parent=root, bevel=0.3)
    box("BridgeFloor", (bx * 2, by1 - by0, -0.15 - bz0),
        (0, (by0 + by1) / 2, (bz0 - 0.15) / 2), mat=M["hull"], parent=root, bevel=0.3)
    for sx in (-1, 1):
        box("BridgeSide_%d" % sx, (bx - rw / 2, by1 - by0, bz1 - bz0),
            (sx * (rw / 2 + (bx - rw / 2) / 2), (by0 + by1) / 2, (bz0 + bz1) / 2),
            mat=M["hull"], parent=root, bevel=0.3)
    box("BridgeBack", (bx * 2, 1.2, bz1 - bz0),
        (0, by0 + 0.6, (bz0 + bz1) / 2), mat=M["hull"], parent=root, bevel=0.3)
    bay = cfg["bay"]
    ox = room["w"] / 2 - CFG["window"]["edge"] + 0.5
    oz0, oz1 = -0.35, room["h"] - 0.05
    for sx in (-1, 1):
        box("BaySide_%d" % sx, (0.9, bay + 1.0, oz1 - oz0 + 1.5),
            (sx * (ox + 0.45), wall_y + bay / 2 + 0.3, (oz0 + oz1) / 2),
            mat=M["hull"], parent=root, bevel=0.1)
    box("BayTop", (ox * 2 + 1.9, bay + 1.0, 1.1),
        (0, wall_y + bay / 2 + 0.3, oz1 + 0.55), mat=M["hull"], parent=root, bevel=0.1)
    box("BayBottom", (ox * 2 + 1.9, bay + 1.0, 0.9),
        (0, wall_y + bay / 2 + 0.3, oz0 - 0.45), mat=M["hull"], parent=root, bevel=0.1)
    for k in range(9):                           # гүүрний блокийн нарийвчлал
        box("BridgeGreeble", (R.uniform(1.0, 3.4), R.uniform(1.0, 3.0), R.uniform(0.3, 1.1)),
            (R.uniform(-bx * 0.8, bx * 0.8), R.uniform(by0 + 1, by1 - 3), bz1 + 0.3),
            mat=M["hull"], parent=root, bevel=0.08)

    # ── 3. Дээд тавцангийн хавтан ба нурууны блокууд ──
    plate_field("BowDeck", -W * 0.24, W * 0.24, wall_y + 2.6, wall_y + 15.5, deck - 0.16, "top",
                6.0, M["hull"], root, thick=0.45)
    plate_field("AftDeck", -W * 0.30, W * 0.30, body_end + 2, -18.0, deck - 0.16, "top",
                7.0, M["hull"], root, thick=0.45)
    for sx in (-1, 1):                           # урд их биеийн хажуу хавтангууд
        plate_field("FwdSide_%d" % sx, -17.0, wall_y - 2.0, zc - D * 0.24, zc + D * 0.24,
                    sx * (W * 0.455), "side", 6.0, M["hull"], root, thick=0.5)
    for k in range(22):                          # их биеийн нэмэлт ширхэгүүд (гүүрнээс хойш)
        ln, wd = R.uniform(3, 9), R.uniform(2, 7)
        box("HullGreeble", (wd, ln, R.uniform(0.4, 1.6)),
            (R.uniform(-W * 0.30, W * 0.30), R.uniform(body_end, by0 - 4.0), deck + 0.30),
            mat=M["hull"], parent=root, bevel=0.1)
    for k in range(8):                           # хамрын тавцангийнх — гүүрний өмнө
        box("BowGreeble", (R.uniform(2, 6), R.uniform(2, 6), R.uniform(0.3, 1.1)),
            (R.uniform(-W * 0.22, W * 0.22), R.uniform(wall_y + 3.5, wall_y + 14.0), deck + 0.25),
            mat=M["hull"], parent=root, bevel=0.1)
    y = -20.0
    while y > body_end + 6:
        ln = R.uniform(7.0, 17.0)
        hw = R.uniform(0.18, 0.34) * W
        off = R.uniform(-0.20, 0.20) * W
        hgt = R.uniform(1.4, 4.2)
        box("SpineBlock", (hw, ln, hgt), (off, y - ln / 2, deck + hgt / 2),
            mat=M["hull"], parent=root, bevel=0.2)
        for k in range(R.randint(1, 3)):
            box("SpineGreeble", (R.uniform(1.0, hw * 0.55), R.uniform(1.5, ln * 0.45), R.uniform(0.4, 1.5)),
                (off + R.uniform(-hw * 0.3, hw * 0.3), y - R.uniform(1.5, ln - 1.5), deck + hgt + 0.4),
                mat=M["hull"], parent=root, bevel=0.1)
        y -= ln + R.uniform(1.5, 4.5)

    # ── 4. Ачааны сегментүүд: цагираг, X тулаас, хажуугийн хавтан ──
    seg_n, seg_len = cfg["segments"], cfg["seg_len"]
    sf = W / 2 + 0.08                            # хажуу нүүрний байрлал
    zs0, zs1 = zc - D * 0.22, zc + D * 0.22      # хажуу нүүрний өндөр
    y = -18.0
    for i in range(seg_n):
        y1 = y - seg_len
        loft("CargoRing_%02d" % i,
             [(y1 + 0.3, hull_ring(W * 1.05, D * 1.05, zc)),
              (y1 + 2.1, hull_ring(W * 1.05, D * 1.05, zc))], M["metal"], parent=root)
        bh = (zs1 - zs0) * 0.92
        diag = math.hypot(seg_len - 6.0, bh)
        ang = math.atan2(bh, seg_len - 6.0)
        for sx in (-1, 1):
            for sgn in (-1, 1):
                box("CargoBrace_%02d_%d_%d" % (i, sx, sgn), (1.7, diag, 1.7),
                    (sx * (sf - 0.5), (y + y1) / 2, zc), rot=(sgn * ang, 0, 0),
                    mat=M["metal"], parent=root)
            plate_field("CargoSide_%02d_%d" % (i, sx), y1 + 2.6, y - 1.2, zs0, zs1, sx * sf,
                        "side", 5.5, M["hull"], root, thick=0.45)
        y = y1

    # ── 5. Хойд блок ба хөдөлгүүрүүд ──
    box("SternCap", (W * 0.80, 2.6, D * 0.82), (0, stern_y + 1.2, zc),
        mat=M["metal"], parent=root, bevel=0.3)
    for k in range(12):
        box("SternGreeble", (R.uniform(3, 10), R.uniform(3, 10), R.uniform(1.5, 5.5)),
            (R.uniform(-W * 0.33, W * 0.33), R.uniform(stern_y + 6, body_end - 4),
             deck + R.uniform(0.5, 3.0)), mat=M["hull"], parent=root, bevel=0.15)
    er = cfg["engine_r"]
    for sx, r, dx, dz in ((-1, er, 0.30, 0.06), (1, er, 0.30, 0.06),
                          (-1, er * 0.52, 0.56, 0.30), (1, er * 0.52, 0.56, 0.30)):
        ex, ez = sx * W * dx, zc + D * dz
        ey = stern_y - r * 0.7
        cyl("Nacelle_%d_%02.0f" % (sx, r * 10), r, r * 2.8, (ex, ey, ez),
            rot=(math.radians(90), 0, 0), mat=M["hull"], parent=root, verts=28)
        cyl("NacelleRing_%d_%02.0f" % (sx, r * 10), r * 1.08, r * 0.3, (ex, ey - r * 1.2, ez),
            rot=(math.radians(90), 0, 0), mat=M["metal"], parent=root, verts=28)
        cyl("Exhaust_%d_%02.0f" % (sx, r * 10), r * 0.78, 0.35, (ex, ey - r * 1.42, ez),
            rot=(math.radians(90), 0, 0), mat=M["thrust"], parent=root, verts=28)

    # ── 6. Гэрэл, тэмдэглэгээ ──
    keel = zc - D * 0.48
    box("RunStrip", (0.6, abs(body_end - (-20.0)), 0.28),
        (0, (body_end - 20.0) / 2, keel), mat=M["runlight"], parent=root)
    box("BluePanel", (W * 0.16, 14.0, 0.3), (-W * 0.24, -34.0, keel + 1.2),
        mat=M["bluepanel"], parent=root)
    for i in range(cfg["portholes"]):
        sx = R.choice((-1, 1))
        box("Porthole", (0.3, R.uniform(1.0, 2.4), R.uniform(0.5, 1.0)),
            (sx * (sf + 0.05), R.uniform(body_end + 6, -12), R.uniform(zs0 + 1, zs1 - 1)),
            mat=M["window_lit"], parent=root)
    num = cfg["number"]
    hull_marking("Mark_deck", num, (-W * 0.14, wall_y + 11.0, deck + 0.16), 3.4,
                 M["marking"], root, rot=(0, 0, math.radians(180)))
    for sx in (-1, 1):
        hull_marking("MarkSide_%d" % sx, num, (sx * (sf + 0.3), -150.0, zc + 2.0), 5.0,
                     M["marking"], root,
                     rot=(math.radians(90), 0, math.radians(90 * sx)))
    return root


def build_alert(frames=624, start=0.5, period=14):
    """Мөргөлдөөний дараах түгшүүрийн гэрэлтүүлэг.

    start — нислэгийн хэдэн хувиас эхлэх (0.5 = хагасаас)
    Улаан гэрэл анивчиж, энгийн бүлээн гэрэл сулрана.
    """
    room = CFG["room"]
    f0 = max(1, int(frames * start))
    reds = []
    for i, (x, y) in enumerate(((-3.2, -2.6), (3.2, -2.6), (-3.2, 2.2), (3.2, 2.2))):
        d = bpy.data.lights.new("AlertLamp_%d" % i, "POINT")
        d.color = (1.0, 0.10, 0.05)
        d.shadow_soft_size = 0.25
        d.energy = 0.0
        ob = bpy.data.objects.new("AlertLamp_%d" % i, d)
        ob.location = (x, y, room["h"] - 0.45)
        _link(ob, bpy.data.collections[COL])
        reds.append(d)
    warm = [o.data for o in bpy.data.collections[COL].objects
            if o.type == "LIGHT" and o.name.startswith(("CeilFill", "WarmSpill", "DeskFill"))]
    for d in warm:                                  # анхны хүчийг санаж авна
        d["base_energy"] = d.energy

    f = 1
    while f <= frames:
        on = f >= f0 and ((f - f0) // period) % 2 == 0
        for d in reds:
            d.energy = 260.0 if on else 0.0
            d.keyframe_insert("energy", frame=f)
        for d in warm:                              # мөргөлдөөний дараа бүлээн гэрэл сулрана
            d.energy = d["base_energy"] * (0.35 if f >= f0 else 1.0)
            d.keyframe_insert("energy", frame=f)
        f += period if f >= f0 else max(1, f0 - 1)
    for d in reds + warm:                           # анивчилт хурц байх ёстой
        ad = d.animation_data
        act = ad.action if ad else None
        if not act:
            continue
        curves = []
        try:
            if hasattr(act, "layers") and len(act.layers):
                cb = act.layers[0].strips[0].channelbag(ad.action_slot)
                if cb:
                    curves = list(cb.fcurves)
        except Exception:
            pass
        if not curves:
            try:
                curves = list(act.fcurves)
            except Exception:
                curves = []
        for fc in curves:
            for kp in fc.keyframe_points:
                kp.interpolation = "CONSTANT"
    print("[1st Studio] Түгшүүр: %d фреймээс, %d фрейм тутам анивчина" % (f0, period))


def build_sun():
    """Алслагдсан од — хөлгийн их биеийг гэрэлтүүлнэ."""
    d = bpy.data.lights.new("StarSun", "SUN")
    d.energy = CFG["sun"]["energy"]
    d.color = CFG["sun"]["color"]
    d.angle = math.radians(0.9)
    ob = bpy.data.objects.new("StarSun", d)
    ob.location = (250, -220, 240)
    _link(ob, bpy.data.collections[COL])
    aim = empty("SUN_AIM", (0, -80, -8))
    con = ob.constraints.new("TRACK_TO")
    con.target = aim
    con.track_axis, con.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    return ob


# ══════════════════════════════════════════════════════════════════════
#  Камер, рендер
# ══════════════════════════════════════════════════════════════════════
# Консолын бүх хэсэг — композитод урд давхарга болгон салгахад ашиглана
CONSOLE_PARTS = ("Console", "Glow", "Desk", "Key", "CenterStack", "Monitor",
                 "MonRow", "Wing", "Yoke", "CONSOLE_TOP", "MONITOR", "WING_")


def render_pass(kind, dist=None):
    """Тайзыг ГҮНЭЭР хоёр давхарга болгон хуваана.

    fg — жүжигчнээс ОЙР бүх зүйл, ил тод дэвсгэртэй (жүжигчний УРД тавина)
    bg — жүжигчнээс ХОЛ бүх зүйл (жүжигчний АРД тавина)

    Эд ангиар нь хуваах нь буруу: консолын ард байгаа хэсгүүд ч урд
    давхаргад орж жүжигчнийг халхалдаг. Камерын clip зайгаар хуваавал
    ямар ч өнцөгт зөв ажиллана.
    """
    scene = bpy.context.scene
    cam = scene.camera
    if dist is None:
        bpy.context.view_layer.update()            # камерын матриц шинэчлэгдсэн байх ёстой
        seat = Vector((CFG["seat"]["x"], CFG["seat"]["y"], 1.10))
        dist = (seat - Vector(cam.matrix_world.translation)).length
    if kind == "fg":
        cam.data.clip_end = dist
        scene.render.film_transparent = True
        scene.render.image_settings.color_mode = "RGBA"
    else:
        cam.data.clip_start = max(0.05, dist)
    print("[1st Studio] Давхарга: %s (хуваалтын зай %.2fм)" % (kind, dist))


def slide_camera(cam, aim, metres, frames):
    """Камерыг харцандаа перпендикуляр хажуу тийш гулсуулна (truck)."""
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, frames
    base_c = Vector(cam.location)
    base_a = Vector(aim.location)
    fwd = (base_a - base_c)
    lat = Vector((-fwd.y, fwd.x, 0.0)).normalized()      # хэвтээ хөндлөн тэнхлэг
    for f, t in ((1, -0.5), (frames, 0.5)):
        cam.location = base_c + lat * (metres * t)
        aim.location = base_a + lat * (metres * t)
        cam.keyframe_insert("location", frame=f)
        aim.keyframe_insert("location", frame=f)
    for holder in (cam, aim):                             # жигд хурдтай гулсалт
        ad = holder.animation_data
        act = ad.action if ad else None
        if not act:
            continue
        curves = []
        try:
            if hasattr(act, "layers") and len(act.layers):
                cb = act.layers[0].strips[0].channelbag(ad.action_slot)
                if cb:
                    curves = list(cb.fcurves)
        except Exception:
            pass
        if not curves:
            try:
                curves = list(act.fcurves)
            except Exception:
                curves = []
        for fc in curves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
    scene.frame_set(1)
    print("[1st Studio] Хажуу гулсалт: %.2fм, %d фрейм" % (metres, frames))


def arc_camera(cam, aim, frames=624, a0=55.0, a1=90.0, d0=1.90, d1=1.35,
               z0=1.50, z1=1.42, lens=26.0, hold=0.5):
    """Нисгэгчийг тойрох нум: урд талын гуравны хоёроос хажуугийн профиль руу,
    зэрэгцээд ойртоно. Бодит бичлэгийн хөдөлгөөнтэй тааруулахад зориулсан.

    a0/a1 — нисгэгчийн харцны тэнхлэгээс хэмжсэн өнцөг (90° = яг хажуу).
    d0/d1 — нисгэгч хүртэлх зай. Камер нисгэгчийн +X талд байх тул
    цонх (+Y) дэлгэцийн БАРУУН тийш харагдана.
    hold  — эхэнд хэдэн хувийг ХӨДӨЛГӨӨНГҮЙ барих. Бодит бичлэгт камер
            эхний 13 секундэд бараг зогсож байгаад дараа нь хөдөлдөг тул
            0.5 гэдэг нь эхний хагасыг зогсоох гэсэн үг.
    """
    sx, sy = CFG["seat"]["x"], CFG["seat"]["y"]
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, frames
    cam.data.lens = lens
    aim.location = (sx, sy, 1.20)
    aim.keyframe_insert("location", frame=1)
    aim.keyframe_insert("location", frame=frames)
    hold_f = max(1, int(frames * max(0.0, min(0.95, hold))))
    keys = [(1, 0.0), (hold_f, 0.0), (frames, 1.0)] if hold_f > 1 else [(1, 0.0), (frames, 1.0)]
    for f, t in keys:
        a = math.radians(a0 + (a1 - a0) * t)
        d = d0 + (d1 - d0) * t
        cam.location = (sx + d * math.sin(a), sy + d * math.cos(a), z0 + (z1 - z0) * t)
        cam.keyframe_insert("location", frame=f)
    ad = cam.animation_data
    act = ad.action if ad else None
    curves = []
    if act:
        try:
            if hasattr(act, "layers") and len(act.layers):
                cb = act.layers[0].strips[0].channelbag(ad.action_slot)
                if cb:
                    curves = list(cb.fcurves)
        except Exception:
            pass
        if not curves:
            try:
                curves = list(act.fcurves)
            except Exception:
                curves = []
    for fc in curves:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    scene.frame_set(1)
    print("[1st Studio] Нум: %.0f°→%.0f°, %.2fм→%.2fм, %d фрейм (эхний %d зогсолт), %.0fмм"
          % (a0, a1, d0, d1, frames, hold_f, lens))


def hide_prefix(*prefixes):
    """Нэр нь өгсөн угтвараар эхэлсэн объектуудыг рендерээс нууна."""
    n = 0
    for ob in bpy.data.collections[COL].objects:
        if any(ob.name.startswith(pfx) for pfx in prefixes):
            ob.hide_render = ob.hide_viewport = True
            n += 1
    print("[1st Studio] Нуусан объект: %d (%s)" % (n, ", ".join(prefixes)))
    return n


def set_angle(cam, name):
    """Камерыг бэлэн өнцөгт байрлуулна."""
    loc, aim, lens = ANGLES.get(name, ANGLES["wide"])
    cam.location = loc
    cam.data.lens = lens
    bpy.data.objects["CAM_AIM"].location = aim
    return cam


# Нислэгийн зам: (фрейм, камерын байрлал, харах цэг, линз мм)
FLIGHT = [
    # (фрейм, камерын байрлал, харах цэг, линз мм)
    # Хөлөг асар том тул камер удаан, инерцтэй хөдөлнө. Урт линз масс мэдрүүлнэ.
    (1,   (56.0, 160.0, 62.0), (4.0, 44.0, -4.0),  50.0),   # маш хол — хөлөг бүхэлдээ
    (120, (30.0, 92.0, 34.0),  (2.0, 24.0, -1.0),  44.0),   # их бие дагуу гулсана
    (228, (13.0, 38.0, 13.0),  (0.5, 8.0, 1.2),    36.0),   # хамрын тавцан руу
    (288, (5.6, 16.0, 5.4),    (0.5, 3.2, 1.5),    30.0),   # цонхны булангийн амсар
    (336, (-0.6, 5.8, 2.45),   (1.2, 0.55, 1.05),  27.0),   # харах цэг суудалд тогтоно
    (384, (-3.0, 2.2, 2.15),   (1.2, 0.55, 1.05),  25.0),   # цонхоор нэвтэрч, тойрч эхэлнэ
    (432, (-3.25, -3.60, 1.72), (1.1, 0.55, 1.05), 24.0),   # эцсийн өргөн кадр
]


def build_flythrough(cam, aim):
    """Цонхоор нэвтэрч ордог камерын хөдөлгөөн."""
    sc = bpy.context.scene
    pace = max(0.2, CFG["flight_pace"])
    keys = [(int(round(1 + (f - 1) * pace)), loc, a, lens) for f, loc, a, lens in FLIGHT]
    sc.frame_start, sc.frame_end = keys[0][0], keys[-1][0]
    for f, loc, a, lens in keys:
        cam.location = loc
        cam.keyframe_insert("location", frame=f)
        aim.location = a
        aim.keyframe_insert("location", frame=f)
        cam.data.lens = lens
        cam.data.keyframe_insert("lens", frame=f)
    for holder in (cam, aim, cam.data):
        ad = holder.animation_data
        if not ad or not ad.action:
            continue
        act = ad.action
        curves = []
        try:
            if hasattr(act, "layers") and len(act.layers):
                cb = act.layers[0].strips[0].channelbag(ad.action_slot)
                if cb:
                    curves = list(cb.fcurves)
        except Exception:
            pass
        if not curves:
            try:
                curves = list(act.fcurves)
            except Exception:
                curves = []
        for fc in curves:
            pts = fc.keyframe_points
            for kp in pts:
                kp.interpolation = "BEZIER"
                kp.handle_left_type = kp.handle_right_type = "AUTO"
            if len(pts) > 1:
                pts[0].handle_right_type = "VECTOR"        # эхлэхдээ аль хэдийн хөдөлж байна
                pts[-1].handle_left_type = "AUTO_CLAMPED"  # төгсгөлд нь аажим тогтоно
    sc.frame_set(sc.frame_start)


def build_camera():
    loc, aim_loc, lens = ANGLES[CFG["angle"]]
    aim = empty("CAM_AIM", aim_loc)
    data = bpy.data.cameras.new("SET_CAM")
    data.lens = lens
    data.sensor_fit = "HORIZONTAL"
    data.sensor_width = 36.0
    cam = bpy.data.objects.new("SET_CAM", data)
    cam.location = loc
    _link(cam, bpy.data.collections[COL])
    con = cam.constraints.new("TRACK_TO")
    con.target = aim
    con.track_axis, con.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    bpy.context.scene.camera = cam
    if CFG["flythrough"]:
        build_flythrough(cam, aim)
    return cam


def pick_device():
    """GPU байвал асаана (OptiX / CUDA / HIP / Metal / oneAPI), үгүй бол CPU."""
    want = CFG["device"].upper()
    if want == "CPU":
        return "CPU"
    addon = bpy.context.preferences.addons.get("cycles")
    if not addon:
        return "CPU"
    prefs = addon.preferences
    for kind in ("OPTIX", "CUDA", "HIP", "METAL", "ONEAPI"):
        try:
            prefs.compute_device_type = kind
            for fn in ("refresh_devices", "get_devices"):
                if hasattr(prefs, fn):
                    getattr(prefs, fn)()
                    break
            found = [d for d in prefs.devices if d.type == kind]
            if found:
                for d in prefs.devices:
                    d.use = d.type in (kind, "CPU")
                print("[1st Studio] GPU:", kind, "—", ", ".join(d.name for d in found))
                return "GPU"
        except Exception:
            continue
    if want == "GPU":
        print("[1st Studio] GPU олдсонгүй, CPU-гаар ажиллана.")
    return "CPU"


def setup_render(samples=64, res=(960, 540)):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = pick_device()
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    sc.cycles.transmission_bounces = 4
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.film_transparent = False
    world = sc.world or bpy.data.worlds.new("World")
    sc.world = world
    if getattr(world, "node_tree", None) is None:
        world.use_nodes = True
    world_starfield(world)
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    sc.view_settings.exposure = CFG["exposure"]


def prep_viewport():
    """Файлыг нээмэгц камерын харцаар, материалтай харагддаг болгоно."""
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type != "VIEW_3D":
                continue
            for space in area.spaces:
                if space.type != "VIEW_3D":
                    continue
                space.shading.type = "MATERIAL"        # хурдан, гэрэл материалтай
                space.shading.use_scene_lights = True
                space.shading.use_scene_world = True
                space.clip_end = 200.0
                space.overlay.show_overlays = False
                if space.region_3d:
                    space.region_3d.view_perspective = "CAMERA"


def build():
    fresh_collection(COL)
    if CFG["clear_scene"]:
        clear_startup_objects()
    M = {
        "wall":   metal("cab_wall", (0.47, 0.47, 0.46), rough=0.58, metallic=0.15, scale=4.0),
        "metal":  metal("cab_metal", (0.42, 0.42, 0.41), rough=0.45, metallic=0.55, scale=8.0),
        "ceil":   metal("cab_ceil", (0.20, 0.20, 0.21), rough=0.72, metallic=0.10, scale=4.0),
        "floor":  metal("cab_floor", (0.38, 0.37, 0.34), rough=0.38, metallic=0.45, scale=5.0, bump=0.35),
        "dark":   metal("cab_dark", (0.055, 0.055, 0.060), rough=0.62, metallic=0.30, scale=10.0),
        "seat":   metal("cab_seat", (0.016, 0.017, 0.021), rough=0.78, metallic=0.02, scale=18.0, bump=0.5, grime=0.3),
        "cable":  metal("cab_cable", (0.03, 0.03, 0.034), rough=0.80, metallic=0.0, scale=30.0),
        "glow":   emit("cab_glow", (1.0, 0.52, 0.20), 4.6),
        "amber":  emit("cab_amber", (1.0, 0.55, 0.15), 5.0),
        "screen": emit("cab_screen", (0.55, 0.80, 1.0), 2.0),
        "red":    emit("cab_red", (1.0, 0.13, 0.08), 4.0),
        "dim_screen": emit("cab_dimscreen", (0.10, 0.22, 0.42), 1.1),
        "space":  starfield("cab_space"),
        "hull":     metal("shp_hull", (0.44, 0.44, 0.43), rough=0.52, metallic=0.22, scale=0.25, bump=0.14, grime=0.42),
        "marking":  metal("shp_mark", (0.10, 0.10, 0.11), rough=0.70, metallic=0.10, scale=2.0, grime=0.2),
        "thrust":   emit("shp_thrust", (0.32, 0.60, 1.0), 14.0),
        "runlight": emit("shp_run", (1.0, 0.10, 0.06), 7.0),
        "bluepanel": emit("shp_blue", (0.22, 0.52, 1.0), 4.0),
        "window_lit": emit("shp_win", (1.0, 0.70, 0.36), 6.0),
        "warmpanel": emit("cab_warmpanel", (1.0, 0.74, 0.46), 3.4),
        "glass":  None,
    }
    glass = bpy.data.materials.new("cab_glass")
    if getattr(glass, "node_tree", None) is None:
        glass.use_nodes = True
    gb = glass.node_tree.nodes["Principled BSDF"]
    gb.inputs["Base Color"].default_value = (0.72, 0.85, 1.0, 1)
    gb.inputs["Roughness"].default_value = 0.12
    gb.inputs["Metallic"].default_value = 0.0
    if "Alpha" in gb.inputs:
        gb.inputs["Alpha"].default_value = 0.06
    try:
        glass.blend_method = "BLEND"                 # хуучин хувилбаруудад хэрэгтэй
    except Exception:
        pass
    M["glass"] = glass

    build_floor(M)
    floor_detail(M)
    build_shell(M)
    build_window(M)
    build_console(M)
    build_seat(M)
    build_controls(M)
    build_cables(M)
    build_haze(M)
    if CFG["ship"]["on"]:
        build_ship(M)
        build_sun()
    else:
        build_space(M)
    build_lights(M)
    cam = build_camera()
    build_station(M)   # камерын координатад барих тул камерын ДАРАА
    n = len(bpy.data.collections[COL].objects)
    print("[1st Studio] Кабин бэлэн: %d объект." % n)
    return cam


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []

    def opt(flag, default=None):
        return argv[argv.index(flag) + 1] if flag in argv else default

    if "--angle" in argv:                      # тодорхой өнцөг асуувал нислэгийн анимац хэрэггүй
        CFG["angle"] = opt("--angle", CFG["angle"])
        CFG["flythrough"] = False
    CFG["device"] = opt("--device", CFG["device"])
    if "--cover" in argv:                      # гарыг далдлах товгор хэсгийг асаана
        CFG["controls"]["cover_on"] = True
    alert_from = opt("--alert")                # мөргөлдөөний түгшүүрийн гэрэл
    build()
    res = opt("--res", "960x540")
    setup_render(samples=int(opt("--samples", 64)),
                 res=tuple(int(v) for v in res.lower().split("x")))
    blend = opt("--save-blend")
    if blend:
        prep_viewport()
        bpy.ops.wm.save_as_mainfile(filepath=blend)
        print("[1st Studio] Хадгаллаа:", blend)
    if "--no-seat" in argv:                    # жүжигчин өөрийн сандал дээр сууж байвал
        hide_prefix("Seat", "SEAT")
    arc = opt("--arc")
    if arc:
        arc_camera(bpy.data.objects["SET_CAM"], bpy.data.objects["CAM_AIM"], int(arc),
                   hold=float(opt("--arc-hold", 0.5)))
    slide = opt("--slide")
    if slide:
        slide_camera(bpy.data.objects["SET_CAM"], bpy.data.objects["CAM_AIM"],
                     float(slide), int(opt("--slide-frames", 120)))
    if alert_from is not None:
        build_alert(int(opt("--arc", 624)), float(alert_from))
    layer = opt("--pass")
    if layer:
        split = opt("--split")
        render_pass(layer, float(split) if split else None)
    frame = opt("--frame")
    if frame:
        bpy.context.scene.frame_set(int(frame))
    if "--render" in argv:
        out = argv[argv.index("--render") + 1]
        bpy.context.scene.render.filepath = out
        if "--anim" in argv:
            bpy.ops.render.render(animation=True)
            print("[1st Studio] Анимац рендерлэв:", out)
        else:
            bpy.ops.render.render(write_still=True)
            print("[1st Studio] Рендер:", out)


main()
