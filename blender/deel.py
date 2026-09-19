"""Монгол үндэсний хувцасны гурван дүр — 6 метр өндөр.

Лавлагаа: тал нутагт зогсох гурван эмэгтэй.
  1. khalkh   — Халх хатны хувцас: эвэрт тоорцог, хатгамалт уужин, улаан хормой
  2. buryat   — Буриад дэгэл: хөх торгон дээл, улаан залаатай малгай, мөнгөн гоёл
  3. uzemchin — Үзэмчин маягийн: өндөр улаан малгай, цайвар дээл, хар хээт хантааз

Бүх дүр НЭГ биеийн масштабтай — хүмүүс ижил биетэй, зөвхөн малгай нь
өөр өндөртэй тул нийт өндөр нь ялгаатай. CFG["height"] нь хамгийн өндөр
дүрийн (khalkh) малгайн орой хүртэлх хэмжээ.

Ашиглах:
    blender -b -P blender/deel.py -- --render out/deel --res 1920x1080 --samples 96
    blender -b -P blender/deel.py -- --save-blend deel.blend
    blender -b -P blender/deel.py -- --only khalkh --angle front --render out/k
"""

import math
import os
import random
import sys

import bpy
from mathutils import Euler, Matrix, Vector

# ══════════════════════════════════════════════════════════════════════
#  Тохиргоо
# ══════════════════════════════════════════════════════════════════════
CFG = {
    "height": 6.0,        # ДҮР БҮР малгайн орой хүртэл ижил өндөр, метрээр
    # Байрлал (x, y). Гурвуулаа 6 м боловч өөр өөр зайд зогсоно — лавлагаа
    # зурган дээрх дүрсийн өндрөөс (89.2% / 62.7% / 53.8%) урвуугаар бодов:
    # зай нь 16.6 / 23.6 / 27.6 м. Камер (0, -6, 3) дээр 50 мм.
    "layout": {"khalkh": (-2.69, 10.62), "buryat": (0.09, 17.62),
               "uzemchin": (3.97, 21.56)},
    "seed": 11,
    # Харьцуулах стандарт хүн. 2260 оны орчин үе — энгийн битүү хослол.
    "human": {"on": True, "height": 1.70, "at": (-1.18, 9.75), "rot": -24.0},
    # Цуваа эгнээ: --queue тугаар асаана. Гүн рүү жигд алслана.
    # Диагональ эгнээ: гүн рүү 29 / 50 / 70 м. Хажуу тийш ч шилжинэ —
    # эс бөгөөс урт линз дээр бие биенээ бүрэн халхална.
    "queue": {"khalkh": (-2.49, 11.40), "buryat": (0.42, 32.00),
              "uzemchin": (6.52, 52.00)},
    "wind": 0.30,         # хормойн салхины хазайлт (0 = салхигүй)
    "ground": True,
    "sun": {"energy": 4.5, "color": (1.0, 0.82, 0.60), "angle_deg": 7.0},
    "sky": 0.28,          # Nishita тэнгэрийн хүч — 1.0 бол бүх зүйл цайрна
    "exposure": -2.1,
    "device": "AUTO",
}

# Биеийн тэмдэгт цэгүүд — малгайгүй биеийн өндрийн ХУВИАР.
# Лавлагаа зургаас хэмжсэн: толгой нь биеийн 1/9 — загварын харьцаа.
LM = {
    "head_top": 1.000,
    "brow":     0.968,
    "chin":     0.888,
    "neck":     0.865,
    "shoulder": 0.830,
    "bust":     0.754,
    "waist":    0.642,
    "hip":      0.568,
    "knee":     0.326,
    "ankle":    0.040,
    "hem":      0.000,
}

COL = "DEEL"


# ══════════════════════════════════════════════════════════════════════
#  Туслах — геометр
# ══════════════════════════════════════════════════════════════════════
def _col():
    c = bpy.data.collections.get(COL)
    if c is None:
        c = bpy.data.collections.new(COL)
        bpy.context.scene.collection.children.link(c)
    return c


def _link(ob, parent=None):
    _col().objects.link(ob)
    if parent:
        ob.parent = parent
    return ob


def empty(name, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = 0.3
    ob.location, ob.rotation_euler = loc, rot
    return _link(ob, parent)


def _mesh(name, verts, faces, mat, parent, smooth=True, shade=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    if mat:
        me.materials.append(mat)
    for p in me.polygons:
        p.use_smooth = smooth if shade is None else shade
    ob = bpy.data.objects.new(name, me)
    return _link(ob, parent)


def ring(rx, ry, n=32, cx=0.0, cy=0.0, squash=0.0, folds=0, amp=0.0,
          a0=0.0, a1=2 * math.pi):
    """Эллипс цагираг (эсвэл нум). folds/amp нь эдийн атираа үүсгэнэ."""
    pts = []
    closed = abs((a1 - a0) - 2 * math.pi) < 1e-6
    m = n if closed else n - 1
    for i in range(n):
        a = a0 + (a1 - a0) * i / m
        k = 1.0 + (amp * math.cos(folds * a) if folds else 0.0)
        x = rx * k * math.cos(a)
        y = ry * k * math.sin(a)
        if squash:
            y *= 1.0 - squash * (math.cos(a) ** 2) * (1 if y > 0 else 0.6)
        pts.append((cx + x, cy + y))
    return pts


def loft(name, sections, mat, parent=None, cap_bottom=False, cap_top=False,
         smooth=True, closed=True):
    """sections = [(z, [(x, y), ...]), ...] — бүх цагираг ижил тооны оройтой.

    closed=False бол сүүлийн болон эхний оройг холбохгүй — урд тал нь
    нээлттэй нөмрөг, уужин зэргийг барихад хэрэгтэй.
    """
    n = len(sections[0][1])
    verts, faces = [], []
    for z, r in sections:
        for (x, y) in r:
            verts.append((x, y, z))
    lim = n if closed else n - 1
    for i in range(len(sections) - 1):
        a, b = i * n, (i + 1) * n
        for j in range(lim):
            k = (j + 1) % n
            faces.append((a + j, a + k, b + k, b + j))
    if cap_bottom:
        verts.append((sum(p[0] for p in sections[0][1]) / n,
                      sum(p[1] for p in sections[0][1]) / n, sections[0][0]))
        c = len(verts) - 1
        for j in range(n):
            faces.append((c, (j + 1) % n, j))
    if cap_top:
        top = sections[-1]
        verts.append((sum(p[0] for p in top[1]) / n,
                      sum(p[1] for p in top[1]) / n, top[0]))
        c = len(verts) - 1
        a = (len(sections) - 1) * n
        for j in range(n):
            faces.append((c, a + j, a + (j + 1) % n))
    return _mesh(name, verts, faces, mat, parent, smooth)


def revolve(name, profile, n=32, mat=None, parent=None, loc=(0, 0, 0), smooth=True):
    """profile = [(r, z), ...] — Z тэнхлэгийг тойруулж эргүүлнэ."""
    secs = [(z, ring(r, r, n)) for (r, z) in profile]
    ob = loft(name, secs, mat, parent, smooth=smooth)
    ob.location = loc
    return ob


def cyl(name, r, h, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, parent=None, n=24, r2=None):
    r2 = r if r2 is None else r2
    ob = loft(name, [(-h / 2, ring(r, r, n)), (h / 2, ring(r2, r2, n))],
              mat, parent, cap_bottom=True, cap_top=True)
    ob.location, ob.rotation_euler = loc, rot
    return ob


def box(name, size, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, parent=None, bevel=0.0):
    sx, sy, sz = (s / 2 for s in size)
    v = [(-sx, -sy, -sz), (sx, -sy, -sz), (sx, sy, -sz), (-sx, sy, -sz),
         (-sx, -sy, sz), (sx, -sy, sz), (sx, sy, sz), (-sx, sy, sz)]
    f = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    ob = _mesh(name, v, f, mat, parent, smooth=False)
    ob.location, ob.rotation_euler = loc, rot
    if bevel:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width, m.segments, m.limit_method = bevel, 2, "ANGLE"
        m.angle_limit = math.radians(40)
    return ob


def sweep(name, path, radius, mat, parent=None, n=10, taper=None):
    """path = [(x, y, z), ...] дагуу дугуй огтлол шүүрдэнэ (эвэр, гинж, залаа)."""
    verts, faces = [], []
    P = [Vector(p) for p in path]
    up = Vector((0, 0, 1))
    for i, p in enumerate(P):
        t = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)])
        if t.length < 1e-9:
            t = Vector((0, 0, 1))
        t.normalize()
        a = up.cross(t)
        if a.length < 1e-6:
            a = Vector((1, 0, 0)).cross(t)
        a.normalize()
        b = t.cross(a).normalized()
        r = radius * (1.0 if taper is None else taper(i / max(1, len(P) - 1)))
        for j in range(n):
            th = 2 * math.pi * j / n
            verts.append(tuple(p + a * (r * math.cos(th)) + b * (r * math.sin(th))))
    for i in range(len(P) - 1):
        for j in range(n):
            k = (j + 1) % n
            faces.append((i * n + j, i * n + k, (i + 1) * n + k, (i + 1) * n + j))
    return _mesh(name, verts, faces, mat, parent)


# ══════════════════════════════════════════════════════════════════════
#  Туслах — материал
# ══════════════════════════════════════════════════════════════════════
def _nodes(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (600, 0)
    return nt, out


def _pbr(mat, base, rough, metallic=0.0, sheen=0.0):
    nt, out = _nodes(mat)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.location = (280, 0)
    b.inputs["Base Color"].default_value = (*base[:3], 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metallic
    for key, val in (("Sheen Weight", sheen), ("Sheen Roughness", 0.35)):
        if key in b.inputs:
            b.inputs[key].default_value = val
    nt.links.new(b.outputs["BSDF"], out.inputs["Surface"])
    return nt, b


def cloth(name, color, rough=0.78, sheen=0.35):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    _pbr(m, color, rough, 0.0, sheen)
    return m


def silk(name, color):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    _pbr(m, color, 0.26, 0.0, 0.6)
    return m


def metal(name, color, rough=0.28):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    _pbr(m, color, rough, 1.0)
    return m


def brocade(name, base, accent, scale=26.0, rough=0.42):
    """Хээт торгон — хоёр өнгийг Voronoi + долгионоор холино.

    6 метрийн дүр дээр нарийн хатгамал уншигдахгүй тул дунд зэргийн
    давтамжтай хээ л хангалттай: гэрлийн тусгал нь эдийн бүтцийг өгнө.
    """
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    nt, b = _pbr(m, base, rough, 0.0, 0.45)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    tex.location = (-900, 0)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.location = (-680, 120)
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = scale
    wav = nt.nodes.new("ShaderNodeTexWave")
    wav.location = (-680, -160)
    wav.wave_type = "RINGS"
    wav.inputs["Scale"].default_value = scale * 0.45
    wav.inputs["Distortion"].default_value = 5.0
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.location = (-420, 0)
    mix.inputs["Factor"].default_value = 0.5
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-200, 0)
    ramp.color_ramp.elements[0].position = 0.34
    ramp.color_ramp.elements[0].color = (*base[:3], 1)
    ramp.color_ramp.elements[1].position = 0.56
    ramp.color_ramp.elements[1].color = (*accent[:3], 1)
    nt.links.new(tex.outputs["Object"], vor.inputs["Vector"])
    nt.links.new(tex.outputs["Object"], wav.inputs["Vector"])
    nt.links.new(vor.outputs["Distance"], mix.inputs[6])
    nt.links.new(wav.outputs["Color"], mix.inputs[7])
    nt.links.new(mix.outputs[2], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.location = (60, -260)
    bump.inputs["Strength"].default_value = 0.22
    nt.links.new(ramp.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def striped(name, base, accent, scale=90.0):
    """Босоо хатгамалт зурвас — дээлийн энгэр, хормойн ирмэгт."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    nt, b = _pbr(m, base, 0.48, 0.0, 0.4)
    tex = nt.nodes.new("ShaderNodeTexCoord")
    tex.location = (-700, 0)
    wav = nt.nodes.new("ShaderNodeTexWave")
    wav.location = (-480, 0)
    wav.wave_type = "BANDS"
    wav.bands_direction = "Z"
    wav.inputs["Scale"].default_value = scale
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.location = (-240, 0)
    ramp.color_ramp.elements[0].color = (*base[:3], 1)
    ramp.color_ramp.elements[1].color = (*accent[:3], 1)
    nt.links.new(tex.outputs["Object"], wav.inputs["Vector"])
    nt.links.new(wav.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    return m


def build_materials():
    return {
        "skin":   cloth("dl_skin", (0.80, 0.62, 0.50), rough=0.55, sheen=0.1),
        "hair":   cloth("dl_hair", (0.035, 0.028, 0.026), rough=0.42, sheen=0.2),
        "silver": metal("dl_silver", (0.86, 0.88, 0.92), rough=0.20),
        "gold":   metal("dl_gold", (0.92, 0.72, 0.28), rough=0.24),
        "coral":  cloth("dl_coral", (0.72, 0.13, 0.10), rough=0.32),
        "pearl":  cloth("dl_pearl", (0.93, 0.92, 0.88), rough=0.22, sheen=0.5),
        "boot":   cloth("dl_boot", (0.10, 0.09, 0.10), rough=0.45, sheen=0.1),
        # ── Халх ──
        "k_hat":   cloth("dl_k_hat", (0.045, 0.042, 0.048), rough=0.52),
        "k_red":   silk("dl_k_red", (0.55, 0.045, 0.045)),
        "k_coat":  brocade("dl_k_coat", (0.09, 0.22, 0.10), (0.68, 0.56, 0.16), scale=16.0),
        "k_front": striped("dl_k_front", (0.62, 0.10, 0.09), (0.80, 0.66, 0.20), scale=120.0),
        "k_dark":  brocade("dl_k_dark", (0.055, 0.05, 0.06), (0.62, 0.56, 0.30), scale=22.0),
        "k_blue":  silk("dl_k_blue", (0.08, 0.52, 0.72)),
        "k_green": silk("dl_k_green", (0.28, 0.46, 0.10)),
        # ── Буриад ──
        "b_deel":  silk("dl_b_deel", (0.06, 0.40, 0.50)),
        "b_hem":   cloth("dl_b_hem", (0.05, 0.05, 0.06), rough=0.55),
        "b_trim":  striped("dl_b_trim", (0.72, 0.28, 0.06), (0.16, 0.34, 0.58), scale=150.0),
        "b_hat":   cloth("dl_b_hat", (0.05, 0.05, 0.055), rough=0.48),
        # ── Үзэмчин ──
        "u_robe":  silk("dl_u_robe", (0.80, 0.74, 0.62)),
        "u_coat":  brocade("dl_u_coat", (0.22, 0.10, 0.09), (0.62, 0.50, 0.22), scale=14.0),
        "u_hat":   silk("dl_u_hat", (0.52, 0.09, 0.10)),
    }


# ══════════════════════════════════════════════════════════════════════
#  Бие — гурван дүрд нийтлэг
# ══════════════════════════════════════════════════════════════════════
class Body:
    """Биеийн хэмжээсүүд. H = малгайгүй биеийн өндөр (метр)."""

    def __init__(self, H):
        self.H = H
        for k, v in LM.items():
            setattr(self, k, v * H)
        self.sh_w = 0.098 * H          # мөрний хагас өргөн
        self.waist_w = 0.070 * H
        self.hip_w = 0.086 * H
        self.head_w = 0.042 * H
        self.head_d = 0.050 * H


def build_head(B, M, parent, hair_sheath=False):
    """Толгой, хүзүү, нүүр. 6 метрийн дүр тул нүүр энгийн хэлбэртэй."""
    hw, hd = B.head_w, B.head_d
    z0, z1 = B.chin, B.head_top
    secs = []
    for t, rw, rd in ((0.00, 0.62, 0.62), (0.16, 0.86, 0.88), (0.38, 1.00, 1.00),
                      (0.62, 1.00, 1.02), (0.84, 0.82, 0.86), (1.00, 0.40, 0.44)):
        secs.append((z0 + (z1 - z0) * t, ring(hw * rw, hd * rd, 28, squash=0.18)))
    loft("Head", secs, M["skin"], parent, cap_top=True)
    # хүзүү
    # нүүрний тэмдэг — 6 м дүрийг ойроос харахад толгой хоосон өндөг
    # шиг харагдахгүйн тулд хамар, хөмсөг, уруулыг товчхон өгнө
    fz = z0 + (z1 - z0) * 0.56
    box("Nose", (hw * 0.17, hd * 0.26, hw * 0.34), (0, -hd * 0.92, fz),
        rot=(math.radians(-8), 0, 0), mat=M["skin"], parent=parent, bevel=hw * 0.05)
    for sx in (-1, 1):
        box("Brow_%d" % sx, (hw * 0.34, hd * 0.10, hw * 0.10),
            (sx * hw * 0.38, -hd * 0.86, fz + hw * 0.44),
            rot=(0, math.radians(-7 * sx), 0), mat=M["hair"], parent=parent)
        box("Eye_%d" % sx, (hw * 0.28, hd * 0.06, hw * 0.09),
            (sx * hw * 0.38, -hd * 0.90, fz + hw * 0.22), mat=M["hair"], parent=parent)
    box("Lip", (hw * 0.30, hd * 0.10, hw * 0.12), (0, -hd * 0.90, fz - hw * 0.52),
        mat=M["coral"], parent=parent, bevel=hw * 0.03)
    loft("Neck", [(B.shoulder - 0.02 * B.H, ring(hw * 0.52, hw * 0.52, 20)),
                  (B.chin + 0.01 * B.H, ring(hw * 0.44, hw * 0.46, 20))],
         M["skin"], parent)
    # үс — толгойн ар талыг бүрхэнэ
    secs = []
    for t, rw, rd in ((0.30, 1.02, 1.04), (0.58, 1.04, 1.06), (0.86, 0.86, 0.90), (1.00, 0.44, 0.48)):
        z = z0 + (z1 - z0) * t
        secs.append((z, ring(hw * rw, hd * rd, 28, cy=-hd * 0.10, squash=0.10)))
    loft("Hair", secs, M["hair"], parent, cap_top=True)
    if hair_sheath:                      # буриад/халх — цээжин дээр унжсан үсний сав
        for sx in (-1, 1):
            box("HairSheath_%d" % sx, (hw * 0.30, hd * 0.22, B.H * 0.135),
                (sx * hw * 0.80, -hd * 0.62, B.chin - B.H * 0.055),
                mat=M["hair"], parent=parent, bevel=hw * 0.05)


def build_arms(B, M, parent, mat, sleeve=1.0, lift=0.0):
    """Ханцуй бүхий гар. sleeve = ханцуйны өргөний коэффициент."""
    for sx in (-1, 1):
        top = Vector((sx * B.sh_w * 0.92, 0, B.shoulder - B.H * 0.012))
        elb = Vector((sx * B.sh_w * 1.16, -B.H * 0.012, B.bust - B.H * 0.045))
        wri = Vector((sx * B.sh_w * 1.05, -B.H * 0.052, B.waist - B.H * 0.012))
        path = []
        for i in range(9):
            t = i / 8.0
            p = top.lerp(elb, min(1.0, t * 2)) if t < 0.5 else elb.lerp(wri, (t - 0.5) * 2)
            p.z += lift * B.H * 0.02 * math.sin(math.pi * t)
            path.append(tuple(p))
        sweep("Sleeve_%d" % sx, path, B.H * 0.033 * sleeve, mat, parent, n=14,
              taper=lambda t: 1.0 - 0.28 * t)
        # гар
        h0 = wri + Vector((0, -B.H * 0.016, -B.H * 0.018))
        cyl("Hand_%d" % sx, B.H * 0.019, B.H * 0.042, tuple(h0),
            rot=(math.radians(18), 0, 0), mat=M["skin"], parent=parent, n=14)


def build_boots(B, M, parent):
    for sx in (-1, 1):
        cyl("Boot_%d" % sx, B.H * 0.026, B.H * 0.075,
            (sx * B.H * 0.026, 0, B.H * 0.038), mat=M["boot"], parent=parent, n=14)
        box("BootToe_%d" % sx, (B.H * 0.050, B.H * 0.070, B.H * 0.022),
            (sx * B.H * 0.026, -B.H * 0.022, B.H * 0.011), mat=M["boot"],
            parent=parent, bevel=B.H * 0.008)


def skirt(name, B, M, mat, z_top, r_top, z_bot, r_bot, parent, n=44,
          wind=0.0, flare=1.8, cap=False):
    """Хормой — доошоо дэлгэрэх лофт. wind нь доод хэсгийг хажуу тийш зөөнө."""
    secs = []
    steps = 9
    for i in range(steps):
        t = i / (steps - 1.0)
        z = z_top + (z_bot - z_top) * t
        r = r_top + (r_bot - r_top) * (t ** flare)
        off = wind * B.H * 0.10 * (t ** 2.2)
        # атираа: доошоо гүнзгийрнэ — эд нугаларсан харагдана
        secs.append((z, ring(r, r * 0.86, n, cx=off, cy=-off * 0.35,
                             folds=16, amp=0.038 * (t ** 0.8))))
    return loft(name, secs, mat, parent, cap_bottom=cap)


# ══════════════════════════════════════════════════════════════════════
#  1. Халх хатны хувцас
# ══════════════════════════════════════════════════════════════════════
def fig_khalkh(B, M, origin):
    root = empty("KHALKH", origin)
    build_head(B, M, root)
    build_boots(B, M, root)

    # ── их бие: дотор дээл ──
    body = [(B.hip, ring(B.hip_w, B.hip_w * 0.80, 40)),
            (B.waist, ring(B.waist_w, B.waist_w * 0.80, 40)),
            (B.bust, ring(B.sh_w * 0.86, B.sh_w * 0.70, 40)),
            (B.shoulder, ring(B.sh_w, B.sh_w * 0.66, 40))]
    loft("K_Torso", body, M["k_front"], root)
    # зогсоо зах
    loft("K_Collar", [(B.neck, ring(B.head_w * 0.62, B.head_w * 0.64, 24)),
                      (B.chin - B.H * 0.004, ring(B.head_w * 0.60, B.head_w * 0.62, 24))],
         M["k_red"], root)
    build_arms(B, M, root, M["k_front"], sleeve=1.15)

    # ── хормой: улаан торго ──
    skirt("K_Skirt", B, M, M["k_red"], B.hip, B.hip_w * 1.02, B.hem, B.H * 0.215,
          root, wind=CFG["wind"], flare=1.7)
    # ар талын дэлгэц (улаан сүүл)
    train = []
    for i in range(9):
        t = i / 8.0
        z = B.waist + (B.hem - B.waist) * t
        r = B.waist_w * 1.05 + (B.H * 0.175) * (t ** 1.5)
        train.append((z, ring(r, r * 0.42, 40, cy=r * 0.50,
                              cx=CFG["wind"] * B.H * 0.13 * (t ** 2.2))))
    loft("K_Train", train, M["k_red"], root)

    # ── уужин: ханцуйгүй урт хантааз, хээт торго ──
    # Урд тал нь 64° нээлттэй нум — доторх хатгамалт энгэр харагдана.
    A0, A1 = math.radians(-58), math.radians(238)
    coat = []
    for i in range(9):
        t = i / 8.0
        z = B.shoulder + (B.knee * 0.55 - B.shoulder) * t
        r = B.sh_w * (1.16 + 0.95 * t ** 1.35)
        coat.append((z, ring(r, r * 0.66, 40, a0=A0, a1=A1,
                             cx=CFG["wind"] * B.H * 0.05 * (t ** 2.5),
                             folds=11, amp=0.030 * t)))
    loft("K_Coat", coat, M["k_coat"], root, closed=False)
    lower = []
    for i in range(7):
        t = i / 6.0
        z = B.knee * 0.55 + (B.hem + B.H * 0.02 - B.knee * 0.55) * t
        r = B.sh_w * 2.11 + B.H * 0.045 * t
        lower.append((z, ring(r, r * 0.64, 40, a0=A0, a1=A1,
                              cx=CFG["wind"] * B.H * (0.05 + 0.05 * t),
                              folds=11, amp=0.030 + 0.016 * t)))
    loft("K_CoatHem", lower, M["k_dark"], root, closed=False)

    # ── энгэрийн босоо хатгамалт зурвас ──
    for sx in (-1, 1):
        box("K_Placket_%d" % sx, (B.sh_w * 0.30, B.H * 0.006, B.shoulder - B.waist),
            (sx * B.sh_w * 0.30, -B.sh_w * 0.62, (B.shoulder + B.waist) / 2),
            mat=M["k_front"], parent=root)
    box("K_Band", (B.sh_w * 1.7, B.H * 0.006, B.H * 0.020),
        (0, -B.sh_w * 0.63, B.bust), mat=M["k_green"], parent=root)

    # ── хөх торгон бүс, урд талын том зангиа ──
    cyl("K_Sash", B.waist_w * 1.10, B.H * 0.052, (0, 0, B.waist),
        mat=M["k_blue"], parent=root, n=36)
    for sx in (-1, 1):
        box("K_Bow_%d" % sx, (B.H * 0.052, B.H * 0.030, B.H * 0.044),
            (sx * B.H * 0.030, -B.waist_w * 0.88, B.waist - B.H * 0.006),
            rot=(0, 0, sx * math.radians(12)), mat=M["k_blue"], parent=root,
            bevel=B.H * 0.008)

    # ── толгойн гоёл: тоорцог, эвэр, мөнгөн даруулга ──
    hat = empty("K_HAT", (0, 0, 0), parent=root)
    crown_z = B.head_top - B.H * 0.012
    # мөнгөн даруулга (духны тууз)
    loft("K_Crown", [(crown_z - B.H * 0.030, ring(B.head_w * 1.06, B.head_d * 1.06, 28)),
                     (crown_z + B.H * 0.008, ring(B.head_w * 1.10, B.head_d * 1.10, 28))],
         M["silver"], hat)
    # эвэр — хоёр талд дээш, гадагш нуман хэлбэр
    for sx in (-1, 1):
        path = []
        for i in range(11):
            t = i / 10.0
            a = math.radians(-18 + 128 * t)
            rr = B.H * 0.115
            path.append((sx * (B.head_w * 0.74 + rr * math.sin(a) * 1.35),
                         -B.head_d * 0.10 + rr * 0.12 * math.sin(2 * a),
                         crown_z - B.H * 0.012 + rr * (1 - math.cos(a)) * 0.92))
        sweep("K_Horn_%d" % sx, path, B.H * 0.021, M["hair"], hat, n=16,
              taper=lambda t: 0.62 + 0.70 * math.sin(math.pi * t) ** 0.7)
        for k in range(4):              # эвэр дээрх мөнгөн бүслүүр
            t = 0.18 + k * 0.22
            i = int(t * 10)
            p = path[min(i, len(path) - 1)]
            cyl("K_HornBand_%d_%d" % (sx, k), B.H * 0.024, B.H * 0.010, p,
                rot=(math.radians(90), 0, math.radians(20 * sx)),
                mat=M["silver"], parent=hat, n=16)
    # тоорцог — дээд талдаа дэлгэрсэн хар малгай
    top = crown_z + B.H * 0.012
    loft("K_Toortsog", [(top, ring(B.head_w * 0.86, B.head_d * 0.80, 28)),
                        (top + B.H * 0.052, ring(B.head_w * 1.02, B.head_d * 0.92, 28)),
                        (top + B.H * 0.058, ring(B.head_w * 1.62, B.head_d * 1.10, 28)),
                        (top + B.H * 0.094, ring(B.head_w * 1.78, B.head_d * 1.20, 28))],
         M["k_hat"], hat, cap_top=True)
    cyl("K_Finial", B.H * 0.012, B.H * 0.030, (0, 0, top + B.H * 0.108),
        mat=M["coral"], parent=hat, n=14, r2=B.H * 0.006)
    # сувдан унжлага — нүүрний хоёр талаар
    R = random.Random(CFG["seed"])
    for sx in (-1, 1):
        for k in range(3):
            # зай нь радиусаас 4 дахин их — эс бөгөөс нийлж хавтан болно
            x = sx * (B.head_w * (0.60 + 0.26 * k))
            L = B.H * (0.115 + 0.022 * R.random())
            z0 = crown_z - B.H * 0.030
            sweep("K_Strand_%d_%d" % (sx, k),
                  [(x, -B.head_d * (0.74 + 0.03 * k), z0 - L * t / 6.0) for t in range(7)],
                  B.H * 0.0030, M["pearl"], hat, n=8)
    return root


# ══════════════════════════════════════════════════════════════════════
#  2. Буриад дээл
# ══════════════════════════════════════════════════════════════════════
def fig_buryat(B, M, origin):
    root = empty("BURYAT", origin)
    build_head(B, M, root, hair_sheath=True)
    build_boots(B, M, root)

    body = [(B.hip, ring(B.hip_w * 1.02, B.hip_w * 0.82, 40)),
            (B.waist, ring(B.waist_w * 1.02, B.waist_w * 0.82, 40)),
            (B.bust, ring(B.sh_w * 0.88, B.sh_w * 0.72, 40)),
            (B.shoulder, ring(B.sh_w, B.sh_w * 0.68, 40))]
    loft("B_Torso", body, M["b_deel"], root)
    loft("B_Collar", [(B.neck, ring(B.head_w * 0.64, B.head_w * 0.66, 24)),
                      (B.chin - B.H * 0.004, ring(B.head_w * 0.62, B.head_w * 0.64, 24))],
         M["b_trim"], root)
    build_arms(B, M, root, M["b_deel"], sleeve=1.0)
    # мөрний хээт зүйлс ба ханцуйны ам
    for sx in (-1, 1):
        box("B_Yoke_%d" % sx, (B.sh_w * 0.62, B.sh_w * 0.50, B.H * 0.030),
            (sx * B.sh_w * 0.72, -B.sh_w * 0.18, B.shoulder - B.H * 0.030),
            mat=M["b_trim"], parent=root, bevel=B.H * 0.006)
        cyl("B_Cuff_%d" % sx, B.H * 0.034, B.H * 0.026,
            (sx * B.sh_w * 1.05, -B.H * 0.056, B.waist - B.H * 0.006),
            rot=(math.radians(16), 0, 0), mat=M["b_trim"], parent=root, n=16)
    # бүс
    cyl("B_Belt", B.waist_w * 1.06, B.H * 0.038, (0, 0, B.waist + B.H * 0.010),
        mat=M["b_trim"], parent=root, n=36)
    # хормой — хар ирмэгтэй
    skirt("B_Skirt", B, M, M["b_deel"], B.hip, B.hip_w * 1.04, B.hem + B.H * 0.030,
          B.H * 0.180, root, wind=CFG["wind"] * 0.7, flare=1.6)
    skirt("B_Hem", B, M, M["b_hem"], B.hem + B.H * 0.030, B.H * 0.180,
          B.hem, B.H * 0.186, root, wind=CFG["wind"] * 0.7, flare=1.0)
    # мөнгөн гоёл — хүзүүний гинж, залаа
    for k in range(3):
        r = B.sh_w * (0.52 + 0.14 * k)
        sweep("B_Chain_%d" % k,
              [(r * math.sin(math.radians(-70 + 140 * i / 12.0)),
                -B.sh_w * 0.60,
                B.neck - B.H * (0.030 + 0.022 * k) - r * 0.30 *
                math.cos(math.radians(-70 + 140 * i / 12.0)) ** 2) for i in range(13)],
              B.H * 0.0045, M["silver"], root, n=8)
    for sx in (-1, 1):
        cyl("B_Earring_%d" % sx, B.H * 0.020, B.H * 0.005,
            (sx * B.head_w * 1.02, -B.head_d * 0.20, B.chin + B.H * 0.040),
            rot=(0, math.radians(90), 0), mat=M["silver"], parent=root, n=18)
        sweep("B_EarChain_%d" % sx,
              [(sx * B.head_w * 1.02, -B.head_d * 0.24,
                B.chin + B.H * 0.036 - B.H * 0.016 * i) for i in range(6)],
              B.H * 0.004, M["silver"], root, n=8)
    # ── малгай: хар хүрээ, улаан залаа ──
    hz = B.head_top - B.H * 0.004
    loft("B_HatBand", [(hz - B.H * 0.020, ring(B.head_w * 1.08, B.head_d * 1.08, 26)),
                       (hz + B.H * 0.020, ring(B.head_w * 1.06, B.head_d * 1.06, 26))],
         M["b_trim"], root)
    loft("B_Hat", [(hz + B.H * 0.020, ring(B.head_w * 1.04, B.head_d * 1.04, 26)),
                   (hz + B.H * 0.062, ring(B.head_w * 0.96, B.head_d * 0.96, 26))],
         M["b_hat"], root, cap_top=True)
    cyl("B_HatKnob", B.H * 0.022, B.H * 0.026, (0, 0, hz + B.H * 0.076),
        mat=M["coral"], parent=root, n=16, r2=B.H * 0.014)
    return root


# ══════════════════════════════════════════════════════════════════════
#  3. Үзэмчин маягийн хувцас
# ══════════════════════════════════════════════════════════════════════
def fig_uzemchin(B, M, origin):
    root = empty("UZEMCHIN", origin)
    build_head(B, M, root)
    build_boots(B, M, root)

    body = [(B.hip, ring(B.hip_w, B.hip_w * 0.80, 40)),
            (B.waist, ring(B.waist_w, B.waist_w * 0.80, 40)),
            (B.bust, ring(B.sh_w * 0.86, B.sh_w * 0.70, 40)),
            (B.shoulder, ring(B.sh_w, B.sh_w * 0.66, 40))]
    loft("U_Torso", body, M["u_robe"], root)
    loft("U_Collar", [(B.neck, ring(B.head_w * 0.62, B.head_w * 0.64, 24)),
                      (B.chin - B.H * 0.004, ring(B.head_w * 0.60, B.head_w * 0.62, 24))],
         M["coral"], root)
    build_arms(B, M, root, M["u_robe"], sleeve=1.05)
    # гадуур хар хээт хантааз
    UA0, UA1 = math.radians(-52), math.radians(232)
    coat = []
    for i in range(7):
        t = i / 6.0
        z = B.shoulder + (B.hip * 0.72 - B.shoulder) * t
        r = B.sh_w * (1.08 + 0.34 * t ** 1.2)
        coat.append((z, ring(r, r * 0.70, 36, a0=UA0, a1=UA1, folds=9, amp=0.024 * t)))
    loft("U_Coat", coat, M["u_coat"], root, closed=False)
    # хормой — цайвар дээл дээр хар хээт гадуур
    skirt("U_Skirt", B, M, M["u_robe"], B.hip, B.hip_w * 1.02, B.hem,
          B.H * 0.170, root, wind=CFG["wind"] * 0.5, flare=1.7)
    over = []
    for i in range(8):
        t = i / 7.0
        z = B.hip * 0.72 + (B.hem + B.H * 0.10 - B.hip * 0.72) * t
        r = B.sh_w * 1.42 + B.H * 0.075 * (t ** 1.6)
        over.append((z, ring(r, r * 0.70, 36, a0=UA0, a1=UA1,
                             cx=CFG["wind"] * B.H * 0.03 * t ** 2,
                             folds=13, amp=0.030 + 0.020 * t)))
    loft("U_CoatSkirt", over, M["u_coat"], root, closed=False)
    # ── өндөр улаан малгай, алтан титэм ──
    hz = B.head_top - B.H * 0.006
    loft("U_Hat", [(hz - B.H * 0.016, ring(B.head_w * 1.10, B.head_d * 1.10, 26)),
                   (hz + B.H * 0.020, ring(B.head_w * 1.02, B.head_d * 1.02, 26)),
                   (hz + B.H * 0.090, ring(B.head_w * 0.66, B.head_d * 0.66, 26)),
                   (hz + B.H * 0.120, ring(B.head_w * 0.54, B.head_d * 0.54, 26))],
         M["u_hat"], root, cap_top=True)
    loft("U_HatBand", [(hz + B.H * 0.016, ring(B.head_w * 1.05, B.head_d * 1.05, 26)),
                       (hz + B.H * 0.032, ring(B.head_w * 0.99, B.head_d * 0.99, 26))],
         M["gold"], root)
    cyl("U_Finial", B.H * 0.020, B.H * 0.034, (0, 0, hz + B.H * 0.136),
        mat=M["gold"], parent=root, n=16, r2=B.H * 0.010)
    R = random.Random(CFG["seed"] + 5)
    for sx in (-1, 1):
        for k in range(3):
            x = sx * (B.head_w * (0.70 + 0.14 * k))
            L = B.H * (0.10 + 0.02 * R.random())
            sweep("U_Strand_%d_%d" % (sx, k),
                  [(x, -B.head_d * 0.70, hz - B.H * 0.016 - L * t / 5.0) for t in range(6)],
                  B.H * 0.0040, M["pearl"], root, n=8)
    return root


# ══════════════════════════════════════════════════════════════════════
#  Харьцуулах стандарт хүн — 170 см
# ══════════════════════════════════════════════════════════════════════
def fig_human(M, origin, H=1.70, rot=0.0):
    """Хэмжээ харьцуулах жирийн хүн.

    Аврагуудын 1/9 харьцаатай толгойн оронд бодит 1/7.6 харьцаа өгнө —
    эс бөгөөс харьцуулалт өөрөө гажина.
    """
    root = empty("HUMAN", (origin[0], origin[1], 0), (0, 0, math.radians(rot)))
    suit = cloth("hm_suit", (0.085, 0.095, 0.115), rough=0.62, sheen=0.15)
    trim = cloth("hm_trim", (0.30, 0.34, 0.40), rough=0.40, sheen=0.25)
    hw, hd = H * 0.066, H * 0.076
    z_head, z_chin = H, H * 0.868
    z_neck, z_sh = H * 0.845, H * 0.818
    z_bust, z_waist, z_hip = H * 0.720, H * 0.600, H * 0.520
    z_knee, z_ank = H * 0.285, H * 0.040
    sw = H * 0.115

    # толгой
    secs = []
    for t, rw, rd in ((0.00, 0.60, 0.62), (0.18, 0.88, 0.90), (0.44, 1.00, 1.00),
                      (0.70, 0.96, 0.98), (1.00, 0.42, 0.46)):
        secs.append((z_chin + (z_head - z_chin) * t,
                     ring(hw * rw, hd * rd, 20, squash=0.16)))
    loft("HM_Head", secs, M["skin"], root, cap_top=True)
    loft("HM_Hair", [(z_chin + (z_head - z_chin) * 0.40, ring(hw * 1.03, hd * 1.05, 20, cy=-hd * 0.10)),
                     (z_chin + (z_head - z_chin) * 0.78, ring(hw * 1.02, hd * 1.04, 20, cy=-hd * 0.10)),
                     (z_head, ring(hw * 0.44, hd * 0.48, 20, cy=-hd * 0.06))],
         M["hair"], root, cap_top=True)
    loft("HM_Neck", [(z_sh, ring(hw * 0.54, hw * 0.54, 14)),
                     (z_chin + H * 0.004, ring(hw * 0.46, hw * 0.48, 14))], M["skin"], root)
    # их бие
    loft("HM_Torso", [(z_hip, ring(sw * 0.82, sw * 0.58, 26)),
                      (z_waist, ring(sw * 0.72, sw * 0.50, 26)),
                      (z_bust, ring(sw * 0.90, sw * 0.58, 26)),
                      (z_sh, ring(sw, sw * 0.56, 26))], suit, root, cap_top=True)
    box("HM_Collar", (sw * 0.70, sw * 0.50, H * 0.020), (0, -sw * 0.10, z_sh - H * 0.014),
        mat=trim, parent=root, bevel=H * 0.004)
    # гар — бага зэрэг биеэс салангид
    for sx in (-1, 1):
        path = [(sx * sw * 0.92, 0, z_sh - H * 0.020),
                (sx * sw * 1.05, -H * 0.006, z_bust - H * 0.030),
                (sx * sw * 1.02, -H * 0.028, z_waist),
                (sx * sw * 0.96, -H * 0.040, z_hip - H * 0.030)]
        sweep("HM_Arm_%d" % sx, path, H * 0.040, suit, root, n=12,
              taper=lambda t: 1.0 - 0.34 * t)
        cyl("HM_Hand_%d" % sx, H * 0.021, H * 0.050,
            (sx * sw * 0.94, -H * 0.046, z_hip - H * 0.062),
            mat=M["skin"], parent=root, n=12)
    # хөл
    for sx in (-1, 1):
        path = [(sx * sw * 0.40, 0, z_hip),
                (sx * sw * 0.40, H * 0.004, z_knee + H * 0.08),
                (sx * sw * 0.38, 0, z_knee),
                (sx * sw * 0.36, -H * 0.004, z_ank + H * 0.04)]
        sweep("HM_Leg_%d" % sx, path, H * 0.056, suit, root, n=12,
              taper=lambda t: 1.0 - 0.30 * t)
        box("HM_Boot_%d" % sx, (H * 0.060, H * 0.115, H * 0.052),
            (sx * sw * 0.36, -H * 0.022, H * 0.026), mat=M["boot"], parent=root,
            bevel=H * 0.010)
    return root


# ══════════════════════════════════════════════════════════════════════
#  Тайз
# ══════════════════════════════════════════════════════════════════════
FIGURES = {"khalkh": fig_khalkh, "buryat": fig_buryat, "uzemchin": fig_uzemchin}
# Дүр тус бүрийн малгайн нэмэлт өндөр — биеийн өндрийн хувиар
# Малгай/эвэр нь биеийн оройноос дээш хэдэн хувь гарах вэ.
# Эдгээрийг build() дараа нь бодит хэмжилтээр шалгана.
HAT_EXTRA = {"khalkh": 0.152, "buryat": 0.082, "uzemchin": 0.142}


def clear_scene():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def build(only=None):
    clear_scene()
    random.seed(CFG["seed"])
    M = build_materials()
    names = [only] if only else ["khalkh", "buryat", "uzemchin"]
    rots = {"khalkh": 8.0, "buryat": -6.0, "uzemchin": 14.0}
    out = []
    for n in names:
        # Дүр БҮР яг CFG["height"] өндөртэй: малгайн нэмэлт өндөр нь дүр
        # бүрт өөр тул биеийн өндрийг тус тусад нь буцаан бодно.
        H = CFG["height"] / (1.0 + HAT_EXTRA[n])
        B = Body(H)
        table = CFG["queue"] if CFG.get("use_queue") else CFG["layout"]
        pos = (0.0, 0.0) if only else table[n]
        o = FIGURES[n](B, M, (pos[0], pos[1], 0))
        o.rotation_euler = (0, 0, math.radians(rots[n]))
        out.append((n, o))
        d = math.hypot(pos[0] - 0.0, pos[1] - (-6.0))
        print("[1st Studio] %-9s нийт %.2f м (бие %.2f) · камераас %.1f м"
              % (n, H * (1.0 + HAT_EXTRA[n]), H, d))
    hc = CFG["human"]
    if hc["on"] and not only:
        fig_human(M, hc["at"], hc["height"], hc["rot"])
    if CFG["ground"]:
        # Хажуугийн гялбаа (sheen) нь асар том хавтгайг цав цагаан болгодог
        # тул газарт зөвхөн матовой сарних гадаргуу өгнө.
        g = cloth("dl_ground", (0.13, 0.115, 0.055), rough=0.96, sheen=0.0)
        box("Ground", (600, 600, 0.2), (0, 0, -0.1), mat=g)
    # ── Өндрийг яг зорилтод тааруулна ──
    # HAT_EXTRA нь зөвхөн анхны таамаг. Малгай, эвэр, залаа нь нийлээд
    # хэд болохыг урьдчилан мэдэх боломжгүй тул барьсны ДАРАА хэмжиж,
    # үндэс объектыг зөрүүгээр нь масштаблана (үндэс нь шалан дээр тул
    # масштаб шууд өндрийн коэффициент болно).
    def top_of(o):
        zs = []
        for ch in ([o] + list(o.children_recursive)):
            if ch.type != "MESH":
                continue
            for c in ch.bound_box:
                zs.append((ch.matrix_world @ Vector(c)).z)
        return max(zs) if zs else 0.0

    bpy.context.view_layer.update()
    print("\n[1st Studio] Өндрийн тохируулга (зорилт %.2f м):" % CFG["height"])
    for n, o in out:
        h0 = top_of(o)
        if h0 > 1e-6:
            k = CFG["height"] / h0
            o.scale = (k, k, k)
            bpy.context.view_layer.update()
        h1 = top_of(o)
        print("   %-9s барьсан %.3f -> масштаб %.4f -> %.3f м (зөрүү %+.1f мм)"
              % (n, h0, o.scale.z, h1, 1000 * (h1 - CFG["height"])))
    if hc["on"] and not only:
        H = CFG["height"] / (1.0 + HAT_EXTRA["khalkh"])
        man = hc["height"]
        print("\n[1st Studio] ХЭМЖЭЭНИЙ ХАРЬЦУУЛАЛТ")
        print("   аврага %.2f м · стандарт хүн %.2f м · харьцаа %.2f дахин"
              % (CFG["height"], man, CFG["height"] / man))
        print("   хүн аврагын нийт өндрийн %.1f%%" % (100 * man / CFG["height"]))
        for k in ("ankle", "knee", "hip", "waist", "shoulder", "head_top"):
            z = LM[k] * H
            tag = "  <- хүний толгойн орой яг энд" if abs(z - man) < 0.10 else ""
            print("   аврагын %-9s %5.2f м%s" % (k, z, tag))
        print("   Жишээ: 170 см хүнтэй харьцуулбал энэ нь 50 см нялх хүүхэд")
        print("          насанд хүрэгчийн хажууд зогсохтой тэнцүү (29.4%% ~ %.1f%%)"
              % (100 * man / CFG["height"]))
    print("[1st Studio] Нийт объект %d" % len(bpy.data.objects))
    return out


def build_light():
    d = bpy.data.lights.new("SunLow", "SUN")
    d.energy = CFG["sun"]["energy"]
    d.color = CFG["sun"]["color"]
    d.angle = math.radians(1.2)
    ob = bpy.data.objects.new("SunLow", d)
    ob.rotation_euler = (math.radians(90 - CFG["sun"]["angle_deg"]), 0, math.radians(-118))
    _link(ob)
    w = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputWorld")
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.location = (-300, 0)
    try:
        sky.sky_type = "NISHITA"
        sky.sun_elevation = math.radians(CFG["sun"]["angle_deg"])
        sky.sun_rotation = math.radians(-118)
        sky.altitude = 1400.0
    except Exception:
        pass
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = CFG["sky"]
    nt.links.new(sky.outputs[0], bg.inputs["Color"])
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])


ANGLES = {
    # (камерын байрлал, харах цэг, линз). hero нь лавлагаа зургийн хүрээ:
    # камер 3 м өндөрт, хэвтээ харна (харах цэг ижил өндөрт тул налуугүй).
    "hero":  ((0.0, -6.0, 3.0), (0.0, 20.0, 3.0), 50.0),
    "wide":  ((-2.0, -14.0, 3.4), (1.0, 20.0, 3.2), 35.0),
    "low":   ((0.0, -4.0, 1.1), (0.0, 18.0, 4.2), 40.0),
    "side":  ((-18.0, 12.0, 3.2), (2.0, 16.0, 3.0), 55.0),
    # khalkh дүрийн толгойн гоёл — эвэр, тоорцог, сувдан унжлага
    "close": ((1.31, 6.12, 5.05), (-2.69, 10.62, 5.15), 85.0),
    # гурвуулангийн бүтэн хүрээ, арай өргөн
    "trio":  ((1.6, -9.0, 3.2), (0.4, 18.0, 3.0), 40.0),
    # ХЭМЖЭЭ ХАРЬЦУУЛАХ: алсаас урт линзээр — хэтийн гажилт багасч,
    # аврага ба хүний өндрийн харьцаа цэвэр уншигдана (46 м, 135 мм).
    "scale": ((-1.90, -35.6, 3.05), (-1.90, 10.30, 3.05), 135.0),
    # цуваа эгнээ (--queue-тэй хамт): 85 мм, нэг дэх нь 29 м зайд.
    # Хэтийн шахалт бий боловч алслалтын жижгэрэлт (100/59/42%) хадгалагдана.
    "line":  ((0.0, -18.0, 3.10), (0.0, 30.0, 3.10), 85.0),
}


def build_camera(name="hero"):
    loc, aim_loc, lens = ANGLES.get(name, ANGLES["hero"])
    aim = empty("CAM_AIM", aim_loc)
    d = bpy.data.cameras.new("DEEL_CAM")
    d.lens = lens
    d.sensor_width = 36.0
    d.dof.use_dof = True
    d.dof.focus_object = aim
    d.dof.aperture_fstop = 3.2
    cam = bpy.data.objects.new("DEEL_CAM", d)
    cam.location = loc
    _link(cam)
    c = cam.constraints.new("TRACK_TO")
    c.target = aim
    c.track_axis, c.up_axis = "TRACK_NEGATIVE_Z", "UP_Y"
    bpy.context.scene.camera = cam
    return cam


def pick_device():
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
            prefs.get_devices()
        except Exception:
            continue
        for dev in prefs.devices:
            if dev.type == kind:
                dev.use = True
                print("[1st Studio] GPU: %s (%s)" % (kind, dev.name))
                return "GPU"
    return "CPU"


def setup_render(samples=64, res=(960, 540)):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = pick_device()
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    sc.render.resolution_x, sc.render.resolution_y = res
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    sc.view_settings.exposure = CFG["exposure"]


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []

    def opt(flag, default=None):
        return argv[argv.index(flag) + 1] if flag in argv else default

    CFG["height"] = float(opt("--height", CFG["height"]))
    CFG["wind"] = float(opt("--wind", CFG["wind"]))
    CFG["device"] = opt("--device", CFG["device"])
    only = opt("--only")
    CFG["use_queue"] = "--queue" in argv
    if "--no-human" in argv:
        CFG["human"]["on"] = False
    build(only)
    build_light()
    build_camera(opt("--angle", "close" if only else "hero"))
    res = opt("--res", "960x540")
    setup_render(samples=int(opt("--samples", 64)),
                 res=tuple(int(v) for v in res.lower().split("x")))
    blend = opt("--save-blend")
    if blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(blend))
        print("[1st Studio] Хадгаллаа:", blend)
    if "--render" in argv:
        out = argv[argv.index("--render") + 1]
        bpy.context.scene.render.filepath = os.path.abspath(out)
        bpy.ops.render.render(write_still=True)
        print("[1st Studio] Рендер:", out)


main()
