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
    "human": {"on": True, "height": 1.70, "at": (-0.10, 7.00), "rot": -24.0},
    # Алхалт. Зам нь аврагуудын шугамаас 13.5 м ПЕРПЕНДИКУЛЯР зайд —
    # 6 м аврагыг 2.39:1 дэлгэц гэж үзвэл (14.3 м өргөн) 13.5 м дээрээс
    # хэвтээ 56°, босоо 25° өнцгөөр харагдана. Кино театрын эхний эгнээ
    # ихэвчлэн 50–60° хэвтээ өнцгийн бүсэд байдаг (SMPTE сүүлийн эгнээ
    # >= 30°, THX >= 36°). Замын турш хамгийн ойрын аврага 13.5–14.8 м.
    "walk": {"a": (8.84, 3.60), "b": (15.50, 14.54),
             "hold": 0.0,             # хүн зогсохгүй — 30 секундын турш алхана
             "step": 0.62, "swing": 17.0, "bob": 0.026},
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
HUMAN = {}       # build() дараа: {"root": ..., "hips": {...}}


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
    # Хөл — ташааны голд эцэглэнэ. Гол байхгүй бол алхаа хийх боломжгүй:
    # объектыг өөрийнх нь төвөөр эргүүлэхэд хөл дундуураа тасарч эргэдэг.
    hips, arms = {}, {}
    for sx in (-1, 1):
        hip = empty("HM_HIP_%d" % sx, (sx * sw * 0.40, 0, z_hip), parent=root)
        hips[sx] = hip
        path = [(0, 0, 0),
                (0, H * 0.004, -(z_hip - z_knee) * 0.55),
                (-sx * sw * 0.02, 0, -(z_hip - z_knee)),
                (-sx * sw * 0.04, -H * 0.004, -(z_hip - z_ank - H * 0.04))]
        sweep("HM_Leg_%d" % sx, path, H * 0.056, suit, hip, n=12,
              taper=lambda t: 1.0 - 0.30 * t)
        box("HM_Boot_%d" % sx, (H * 0.060, H * 0.115, H * 0.052),
            (-sx * sw * 0.04, -H * 0.022, -(z_hip - H * 0.026)), mat=M["boot"],
            parent=hip, bevel=H * 0.010)
    return {"root": root, "hips": hips, "arms": arms}


def walk_t(f, frames):
    """Фреймээс алхалтын 0..1 параметр. CFG["walk"]["hold"] зогсолтыг тооцно."""
    hf = max(1, int(frames * CFG["walk"]["hold"])) if CFG["walk"]["hold"] > 0 else 1
    if f <= hf:
        return 0.0
    return (f - hf) / float(frames - hf)


def walk_pos(t):
    """Алхалтын зам дээрх байрлал. t нь 0..1 (зогсолтын дараах хэсэгт)."""
    w = CFG["walk"]
    ax, ay = w["a"]
    bx, by = w["b"]
    return (ax + (bx - ax) * t, ay + (by - ay) * t)


def walk_heading():
    """Алхах чиглэл рүү харах Z эргэлт (градусаар). Хүний нүүр нь -Y тал."""
    w = CFG["walk"]
    dx, dy = w["b"][0] - w["a"][0], w["b"][1] - w["a"][1]
    return math.degrees(math.atan2(dx, -dy))


def animate_walk(h, frames):
    """Алхалт: урагш хөдөлгөөн + биеийн доргио + хөлийн савлалт."""
    w = CFG["walk"]
    root, hips = h["root"], h["hips"]
    dist = math.dist(w["a"], w["b"])
    nstep = dist / w["step"]
    base_z = root.location.z
    root.rotation_euler = (0, 0, math.radians(walk_heading()))
    # Алхаа нь синусоид тул хоёр үзүүрийн түлхүүр хангалтгүй.
    keys = max(30, frames // 4)
    for i in range(keys + 1):
        f = 1 + round((frames - 1) * i / keys)
        t = walk_t(f, frames)
        x, y = walk_pos(t)
        ph = 2 * math.pi * nstep * t                    # алхмын фаз
        root.location = (x, y, base_z + w["bob"] * abs(math.sin(ph)))
        root.keyframe_insert("location", frame=f)
        for sx in (-1, 1):
            a = math.radians(w["swing"]) * math.sin(ph + (0 if sx > 0 else math.pi))
            hips[sx].rotation_euler = (a, 0, 0)
            hips[sx].keyframe_insert("rotation_euler", frame=f)
    for ob in [root] + list(hips.values()):             # жигд алхаа — зөөлрөлтгүй
        ad = ob.animation_data
        try:
            cb = ad.action.layers[0].strips[0].channelbag(ad.action_slot)
            for fc in cb.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = "LINEAR"
        except Exception:
            pass
    hold_s = frames * w["hold"] / 24.0
    print("[1st Studio] Алхалт: %.2f м / %.1f сек = %.2f м/с, %.0f алхам%s"
          % (dist, (frames * (1 - w["hold"])) / 24.0,
             dist / ((frames * (1 - w["hold"])) / 24.0), nstep,
             ", зогсолт %.1f сек" % hold_s if hold_s > 0 else ", зогсохгүй"))


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
    HUMAN.clear()
    if hc["on"] and not only:
        HUMAN.update(fig_human(M, hc["at"], hc["height"], hc["rot"]))
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


# ══════════════════════════════════════════════════════════════════════
#  Камерын хөдөлгөөн
# ══════════════════════════════════════════════════════════════════════
# Тус бүр нь (эхний камер, эхний харц, төгсгөлийн камер, төгсгөлийн харц, линз).
# Линз нь хөдөлгөөний турш ТОГТМОЛ — зум нь камерын хөдөлгөөнийг хуурамч
# болгодог. Хүрээ өөрчлөгдөх нь зөвхөн камер өөрөө явснаас.
MOVES = {
    # Хүнээс эхэлж, ухарч өргөгдөн аврагуудыг илчилнэ — хэмжээний цохилт.
    "reveal": {"kind": "line", "lens": 40.0,
               "c0": (1.40, 3.00, 1.45), "a0": (-0.10, 7.00, 1.05),
               "c1": (2.30, -8.60, 4.30), "a1": (-1.40, 9.60, 3.10)},
    # Эхний аврагыг ЖИНХЭНЭ нумаар тойрно. Өмнө нь энэ нь хоёр цэгийн
    # хоорондох ШУЛУУН байсан тул камер дундуураа 11.6 м хүртэл ойртож,
    # аврага кадрыг бүхэлд нь эзэлж нөгөө хоёрыг халхалдаг байв.
    # Тогтмол радиустай нум нь хүрээг эхнээс эцэс хүртэл жигд барина.
    "orbit":  {"kind": "arc", "lens": 55.0,
               "center": (-2.69, 10.62), "r": 21.0,
               "az0": -150.0, "az1": -42.0, "z": 3.40, "aim_z": 3.00},
    # Алхаж яваа хүнийг МӨРДӨЖ, зэрэг тойрон холдоно.
    # Харцыг хүнээс ДЭЭШ тооцоолсноор хүн дэлгэцийн доод хэсэгт голлож
    # үлдэнэ — аврагууд дээгүүр нь өндийж харагдана.
    # Камер ТОГТМОЛ төвтэй нумаар явж холдоно, харц нь хүнийг мөрдөнө.
    # Нумыг хөдөлж яваа хүн дээр төвлөрүүлбэл зогсолт дуусах мөчид камер
    # гэнэт үсэрнэ (хүн тэр хооронд 2 м явчихсан байна). Бодит зураг авалт
    # ч ийм байдаг: камер замаараа явна, операторч харцаа дагуулна.
    "walk":   {"kind": "follow", "lens": 40.0,
               "center": (12.17, 9.07),          # замын дунд цэг
               "az0": -61.0, "az1": -1.0,        # хүн→аврагын тэнхлэгийн ±30°
               "r0": 20.0, "r1": 38.0,
               "z0": 2.40, "z1": 7.00,
               "ndc_y": 0.28,                    # хүн кадрын доод хэсэгт
               "hold": 0.1667},                  # камер эхний 5 сек байрандаа
    # ХОЛООС ДАГАН ХАРАХ: orbit-ын нум дээр мөрдөх харц.
    # Камер хүний замын дундыг тойрон 42 -> 54 м зайд явна; харц нь алхаж
    # яваа хүнийг дагана. Хүн кадрын голд байхад аврагууд 18.6 м хажуу
    # тийш байх тул 35 мм линз хэрэгтэй (шаардах радиус > 36.2 м).
    #
    # Кино театрын дүрмээр тохируулсан гурван зүйл:
    #   1. ӨНДӨР. Өмнө нь 4.20 -> 7.00 м байв. 7 м бол 6 м аврагаас ДЭЭГҮҮР
    #      — өөрөөр хэлбэл бид аврагыг ДЭЭРЭЭС доош харж байсан (оройнууд
    #      нь тэнгэрийн хаяанаас 0.025–0.028 ndc ДООГУУР унана). Сүр
    #      жавхлангийн дүрэм эсрэгээрээ: аварга юмыг ҮРГЭЛЖ доороос харна.
    #      3.20 -> 4.80 м болгов — оройнууд хаяанаас +0.076 -> +0.030
    #      ДЭЭГҮҮР гарна, өсөлт нь (1.6 м) хэвээр мэдрэгдэнэ.
    #   2. ГУРАВНЫ ДҮРЭМ. ndc_y 0.30 -> 0.333 — хүн яг доод гуравны нэг
    #      дээр. Тэнгэрийн хаяа 0.39–0.47 буюу төвөөс доош — аврагууд
    #      хаяаг эвдэж дээш өндийнө.
    #   3. 180°-ЫН ШУГАМ. Камер хүн<->аврагын шугамын нэг талд (баруун)
    #      30 секундын турш үлдэнэ — ойртолтын үед ч (хэмжсэн: -255 -> -127,
    #      тэмдэг өөрчлөгдөөгүй).
    #
    # Сүүлийн 5 сек: ОЙРТОЛТ (close). Камер нумаа орхилгүй жижиг хүн рүү
    # шумбана — 54 -> 24 м радиус, 4.80 -> 1.80 м өндөр (хүний нүдний
    # түвшин). Хүн кадрын 5.7% -> 15.0% буюу 2.6 дахин том болно.
    # Өнцөг нь ШУГАМАН (нум зогсохгүй), радиус ба өндөр нь smoothstep —
    # ингэснээр нум->ойртолтын заагт камер зогсохгүй, төгсгөлд нь
    # 2 м/с болж намжина. az2=16° нь хүнийг khalkh (0.43) ба buryat (0.61)
    # хоёрын ЗАВСАРТ гаргана — өөр өнцөгт тэр аврагын хормой дээр
    # давхцаж, харагдахаа болино.
    "watch":  {"kind": "follow", "lens": 35.0,
               "center": (12.17, 9.07),          # хүний замын дунд
               "az0": -66.0, "az1": 4.0,         # 70° нум
               "r0": 42.0, "r1": 54.0,
               "z0": 3.20, "z1": 4.80,           # аврагын оройноос ДООГУУР
               "ndc_y": 0.333,                   # доод гуравны нэг
               "hold": 0.1667,                   # эхний 5 сек камер байрандаа
               "close": 0.1667,                  # сүүлийн 5 сек ойртоно
               "az2": 16.0, "r2": 24.0, "z2": 1.80},
    # Эгнээний дагуу удаан түрэх (--queue-тэй хамт).
    "push":   {"kind": "line", "lens": 85.0,
               "c0": (0.00, -30.0, 3.10), "a0": (0.20, 30.0, 3.10),
               "c1": (0.00, -12.0, 3.10), "a1": (0.20, 30.0, 3.10)},
}


def ease_from(u, v0=0.0):
    """u(0..1) -> 0..1. Эхлэлийн налуу v0, төгсгөлийн налуу 0 (Эрмитийн куб).

    v0=0 бол энгийн smoothstep. v0-г өмнөх үеийн хурдаар өгвөл хоёр үеийн
    ЗААГТ хурд тасрахгүй — камер зогсоод дахин хөдөлдөг "үсрэлт" арилна.
    """
    a = v0 - 2.0
    b = 3.0 - 2.0 * v0
    return ((a * u + b) * u + v0) * u


def animate_camera(cam, aim, move, frames):
    """Камер ба харцыг түлхүүрлэнэ.

    line — эхлэл, төгсгөл хоёрын хооронд шулуунаар.
    arc  — төв цэгийг тойрон тогтмол радиустай нумаар. Нум нь завсрын
           түлхүүрүүд шаарддаг: зөвхөн хоёр үзүүрийг өгвөл Blender тэднийг
           шулуунаар холбож, камер дундуураа объект руу дайрна.
    """
    m = MOVES[move]
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 1, frames
    cam.data.lens = m["lens"]

    if m["kind"] == "line":
        keys = [(1, m["c0"], m["a0"]), (frames, m["c1"], m["a1"])]
        d0, d1 = math.dist(m["c0"], m["a0"]), math.dist(m["c1"], m["a1"])
        print("[1st Studio] Хөдөлгөөн '%s': %d фрейм (%.1f сек), %.0f мм, шулуун"
              % (move, frames, frames / 24.0, m["lens"]))
        print("   зай %.1f -> %.1f м, өндөр %.2f -> %.2f м, хурд %.2f м/с"
              % (d0, d1, m["c0"][2], m["c1"][2],
                 math.dist(m["c0"], m["c1"]) / (frames / 24.0)))
    elif m["kind"] == "follow":
        hold_f = max(1, int(frames * m["hold"]))
        # Ойртолтын үе — хөдөлгөөний СҮҮЛИЙН хэсэг. close=0 бол байхгүй.
        close_n = int(frames * m.get("close", 0.0))
        close_f = frames - close_n if close_n > 0 else frames
        cx, cy = m["center"]
        k = (m["lens"] / 36.0) * (bpy.context.scene.render.resolution_x /
                                  bpy.context.scene.render.resolution_y)
        lift = (0.5 - m["ndc_y"]) / k          # харц нь хүнээс (lift x зай) дээш
        hz = CFG["human"]["height"] * 0.5

        # ойртолтын үе нумын үеэс хэд дахин богино вэ — хурд залгахад хэрэгтэй
        ratio = ((frames - close_f) / float(close_f - hold_f)) if close_n > 0 else 0.0

        def station(f):
            """Фрейм -> (өнцөг°, радиус, өндөр). Гурван үе: зогсолт, нум, ойртолт."""
            if f <= close_f:
                tc = 0.0 if f <= hold_f else (f - hold_f) / float(close_f - hold_f)
                return (m["az0"] + (m["az1"] - m["az0"]) * tc,
                        m["r0"] + (m["r1"] - m["r0"]) * tc,
                        m["z0"] + (m["z1"] - m["z0"]) * tc)
            u = (f - close_f) / float(frames - close_f)
            # Суваг бүр нумын үеийн ӨӨРИЙН хурдаараа ойртолтод ордог.
            # v0 = (нум энэ сувгаар ойртолтын хугацаанд хэдийг туулах байсан)
            #    / (ойртолт хэдийг туулах) — заагт налуу яг таарна.
            # Радиусын v0 сөрөг: нум ХОЛДОЖ байсан тул камер эхлээд бага зэрэг
            # холдсоор байж, дараа нь эргэж ойртоно (жинхэнэ кран ингэж явна).
            return tuple(v1 + (v2 - v1) * ease_from(u, (v1 - v0) * ratio / (v2 - v1))
                         if abs(v2 - v1) > 1e-9 else v1
                         for v0, v1, v2 in (
                             (m["az0"], m["az1"], m["az2"]),
                             (m["r0"], m["r1"], m["r2"]),
                             (m["z0"], m["z1"], m["z2"])))

        # Түлхүүрийн фреймүүд: жигд + үений зааг + ойртолтын үед НЯГТ
        # (тэнд камер 9 м/с хүрэх тул сийрэг түлхүүр нумыг олон өнцөгт болгоно).
        fs = {1, frames, hold_f, close_f}
        fs.update(range(1, frames + 1, max(1, (frames - 1) // max(30, frames // 5))))
        if close_n > 0:
            fs.update(range(close_f, frames + 1, 2))
        keys, prev, travel, vmax = [], None, 0.0, 0.0
        for f in sorted(x for x in fs if 1 <= x <= frames):
            a, r, z = station(f)
            az = math.radians(a)
            c = (cx + r * math.cos(az), cy + r * math.sin(az), z)
            # ХАРЦ: хүнийг үргэлж мөрдөнө — зогсолтын үед ч (энэ нь пан)
            hx, hy = walk_pos(walk_t(f, frames))
            d = math.dist(c, (hx, hy, hz))
            keys.append((f, c, (hx, hy, hz + lift * d)))
            if prev:
                seg = math.dist(prev[1], c)
                travel += seg
                vmax = max(vmax, seg / ((f - prev[0]) / 24.0))
            prev = (f, c)
        print("[1st Studio] Хөдөлгөөн '%s': %d фрейм (%.1f сек), %.0f мм, мөрдөх"
              % (move, frames, frames / 24.0, m["lens"]))
        print("   камер зогсолт %d фрейм (%.1f сек) — харц нь энэ үед ч хүнийг дагана"
              % (hold_f, hold_f / 24.0))
        print("   нум: радиус %.0f -> %.0f м, өндөр %.2f -> %.2f м, өнцөг %.0f°"
              % (m["r0"], m["r1"], m["z0"], m["z1"], abs(m["az1"] - m["az0"])))
        if close_n > 0:
            ex, ey = walk_pos(1.0)
            ec = keys[-1][1]
            print("   ойртолт: сүүлийн %d фрейм (%.1f сек) — радиус %.0f -> %.0f м, "
                  "өндөр %.2f -> %.2f м, өнцөг %+.0f°"
                  % (close_n, close_n / 24.0, m["r1"], m["r2"], m["z1"], m["z2"],
                     m["az2"] - m["az1"]))
            print("   төгсгөлд хүн хүртэл %.1f м (%d фрейм дээр %.1f м байсан)"
                  % (math.dist(ec, (ex, ey, hz)), close_f,
                     math.dist(keys[[x[0] for x in keys].index(close_f)][1],
                               (lambda t: (t[0], t[1], hz))(walk_pos(walk_t(close_f, frames))))))
        print("   зам %.1f м, дундаж %.2f м/с, дээд %.1f м/с, хүн ndc_y=%.3f дээр, %d түлхүүр"
              % (travel, travel / ((frames - hold_f) / 24.0), vmax, m["ndc_y"], len(keys)))
    else:
        cx, cy = m["center"]
        keys, prev, travel = [], None, 0.0
        steps = max(8, frames // 6)          # нумыг хангалттай нягт түлхүүрлэнэ
        for i in range(steps + 1):
            t = i / steps
            f = 1 + round((frames - 1) * t)
            az = math.radians(m["az0"] + (m["az1"] - m["az0"]) * t)
            c = (cx + m["r"] * math.cos(az), cy + m["r"] * math.sin(az), m["z"])
            keys.append((f, c, (cx, cy, m["aim_z"])))
            if prev:
                travel += math.dist(prev, c)
            prev = c
        print("[1st Studio] Хөдөлгөөн '%s': %d фрейм (%.1f сек), %.0f мм, нум"
              % (move, frames, frames / 24.0, m["lens"]))
        print("   радиус %.1f м тогтмол, өнцөг %.0f° -> %.0f° (%.0f°), %d түлхүүр"
              % (m["r"], m["az0"], m["az1"], abs(m["az1"] - m["az0"]), len(keys)))
        print("   туулах зам %.1f м, хурд %.2f м/с" % (travel, travel / (frames / 24.0)))

    for f, c, a in keys:
        cam.location = c
        aim.location = a
        cam.keyframe_insert("location", frame=f)
        aim.keyframe_insert("location", frame=f)
    # Нумын завсрын түлхүүрүүд Bezier-ээр зөөлрвөл алхам бүрт удааширч
    # чичирдэг тул шугаман болгоно. Хоёр үзүүрт л зөөлрөлт хэрэгтэй.
    if m["kind"] in ("arc", "follow"):
        for ob in (cam, aim):
            ad = ob.animation_data
            try:
                cb = ad.action.layers[0].strips[0].channelbag(ad.action_slot)
                for fc in cb.fcurves:
                    for kp in fc.keyframe_points:
                        kp.interpolation = "LINEAR"
            except Exception:
                pass


def build_camera(name="hero"):
    loc, aim_loc, lens = ANGLES.get(name, ANGLES["hero"])
    aim = empty("CAM_AIM", aim_loc)
    d = bpy.data.cameras.new("DEEL_CAM")
    d.lens = lens
    d.sensor_width = 36.0
    # Анхдагч clip_end нь 100 м — 600 м газрыг таслаж хиймэл тэнгэрийн
    # хаяа үүсгэнэ. Тайз 60 м хүрэх тул алсыг нь нээв.
    d.clip_start = 0.10
    d.clip_end = 3000.0
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


def prep_viewport():
    """Blender дээр нээмэгц камерын харцаар, материалтай харагддаг болгоно."""
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type != "VIEW_3D":
                continue
            for space in area.spaces:
                if space.type != "VIEW_3D":
                    continue
                space.shading.type = "MATERIAL"
                space.shading.use_scene_lights = True
                space.shading.use_scene_world = True
                space.clip_end = 3000.0        # алсын газар харагдана
                space.clip_start = 0.10
                try:
                    space.region_3d.view_perspective = "CAMERA"
                except Exception:
                    pass


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
    move = opt("--move")
    if move:
        if move not in MOVES:
            print("[1st Studio] '%s' хөдөлгөөн алга. Байгаа нь: %s"
                  % (move, ", ".join(MOVES)))
            return
        nfr = int(opt("--frames", 96))
        if MOVES[move]["kind"] == "follow" and HUMAN:
            animate_walk(HUMAN, nfr)
        animate_camera(bpy.context.scene.camera, bpy.data.objects["CAM_AIM"],
                       move, nfr)
    frame = opt("--frame")
    if frame:
        bpy.context.scene.frame_set(int(frame))
    blend = opt("--save-blend")
    if blend:
        # Нээмэгц шууд ажиллахад бэлэн байлгана: камерын харц, материал,
        # гаралтын зам, фреймийн хүрээ бүгд тавигдсан байна.
        bpy.context.scene.frame_set(1)
        if not bpy.context.scene.render.filepath or \
                bpy.context.scene.render.filepath.startswith("/tmp"):
            bpy.context.scene.render.filepath = "//out/f"
        bpy.context.scene.render.image_settings.file_format = "PNG"
        prep_viewport()
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(blend))
        print("[1st Studio] Хадгаллаа:", blend)
    if "--render" in argv:
        out = argv[argv.index("--render") + 1]
        bpy.context.scene.render.filepath = os.path.abspath(out)
        # --frames = хөдөлгөөний урт, --anim = дарааллыг рендерлэ гэсэн туг.
        # Нэг тугт нийлүүлбэл --frame-тэй зөрчилдөж, ганц кадар хүсэхэд
        # бүтэн дараалал рендерлэдэг байв.
        if move and "--anim" in argv and not frame:
            # --mp4: PNG дараалал биш, шууд видео бичнэ (Blender-ийн ffmpeg).
            # --range A-B: дарааллын зөвхөн нэг хэсгийг (жишээ: ойртолт).
            if "--range" in argv:
                a, b = argv[argv.index("--range") + 1].split("-")
                bpy.context.scene.frame_start = int(a)
                bpy.context.scene.frame_end = int(b)
                print("[1st Studio] Зөвхөн фрейм %s-%s" % (a, b))
            if "--mp4" in argv:
                r = bpy.context.scene.render
                r.image_settings.file_format = "FFMPEG"
                r.ffmpeg.format = "MPEG4"
                r.ffmpeg.codec = "H264"
                r.ffmpeg.constant_rate_factor = "HIGH"
                r.ffmpeg.ffmpeg_preset = "GOOD"
            bpy.ops.render.render(animation=True)
            print("[1st Studio] Анимац рендерлэв:", out)
        else:
            bpy.ops.render.render(write_still=True)
            print("[1st Studio] Рендер:", out)


main()
