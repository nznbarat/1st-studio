"""1st Studio — "0110" ачааны хөлөг рүү солир мөргөх нь.

Камер нь СОЛИР дээр суусан (POV). Алсаас хөлгийг олж хараад, тогтмол
хурдаар ойртож, их биений хажуу тал руу мөргөнө.

    python3 blender/impact.py -- --angle pov --frames 720 --res 1920x1080 \
        --samples 96 --device GPU --anim --render out/impact

Үндсэн зарчим: солир бол хөдөлгүүргүй чулуу. Хурд нь ТОГТМОЛ. Иймд
дэлгэц дээрх хэмжээ нь 1/R буюу гиперболоор өснө — эхэндээ удаан,
сүүлийн 3 секундэд дэлбэрч томроно. Энэ нь физикийн хувьд ч, кино
хэмнэлийн хувьд ч зөв хэлбэр. Хурдыг "мэдрүүлдэг" зүйл нь хөлөг биш,
хажуугаар өнгөрөх ойрын чулуунуудын ПАРАЛЛАКС — тиймээс замын дагуу
6 чулууг тодорхой мөчид өнгөрөхөөр нь зориуд байрлуулсан.
"""
import bpy
import bmesh
import math
import os
import random
import sys
from mathutils import Vector, Matrix, Quaternion

# ══════════════════════════════════════════════════════════════════════
#  Тохиргоо
# ══════════════════════════════════════════════════════════════════════
CFG = {
    # ХӨЛӨГ. Урт нь X тэнхлэгийн дагуу; хамар +X, хөдөлгүүр -X талд.
    "ship_len": 240.0,
    # Их биений хөндлөн огтлол: (x, хагас өргөн, хагас өндөр).
    # Хамрын үзүүрээс сүүл хүртэл.
    "hull": [(120.0,  1.6,  1.6), (110.0,  3.6,  2.8), ( 96.0,  6.4,  4.6),
             ( 78.0,  9.2,  6.8), ( 56.0, 11.8,  8.6), ( 30.0, 13.0,  9.8),
             (  4.0, 13.0, 10.0), (-26.0, 12.4,  9.6), (-56.0, 10.8,  8.4),
             (-86.0,  9.0,  7.4), (-108.0, 7.2,  6.4), (-120.0, 5.6,  5.2)],
    # Хөдөлгүүрийн хоёр цагираг: (төв x, урт, гадна радиус, цөмийн радиус)
    "engines": [(-52.0, 44.0, 18.5, 9.5), (-104.0, 24.0, 11.5, 5.8)],
    "greeble": 260,       # их бие дээрх жижиг хайрцгийн тоо
    "windows": 46,        # цонхны тоо

    # СОЛИР ба түүний зам.
    "hit": (10.0, 13.0, -2.0),      # мөргөх цэг — их биений баруун хажуу
    # Ирэх чиглэл (хөлгөөс солир руу). Баруун хажуу, АР, доор талаас.
    #   +Y (баруун хажуу) -> хөлгийн хамар дэлгэцийн ЗҮҮН талд (лавлагаатай ижил)
    #   -X (ар тал)       -> хөдөлгүүрийн хөх гялбаа БИДЭН ЛҮҮ харна. Урд талаас
    #                        ирвэл хоёр хөдөлгүүр хоёулаа нүүр буруулж, хөлгийн
    #                        хамгийн онцлог шинж нь бүхэл шотод харагдахгүй.
    #   -Z (доор)         -> бид хөлгийг доороос дээш харна, илүү аварга.
    #   Тэнхлэгээс 56.6° — хөдөлгүүрийн ам дугуйныхаа 0.55-г харуулна.
    #   72° дээр (өмнөх утга) ам нь нарийн зураас болж гялбаа алга болдог;
    #   44° дээр гялбаа сайхан ч хөлөг богиноссон мэт болно.
    "from": (-0.55, 0.76, -0.34),
    "dist0": 1400.0,      # эхлэх зай, метр
    # Хэдэн метрт зогсох. Солирын толгой камерын өмнө 15 м хүртэл сунах тул
    # үүнээс их байх ёстой — эс бөгөөс чулуу их бие рүү нэвт орно.
    "stop": 18.0,
    "roll": 11.0,         # бүх хугацаанд эргэх өнцөг (градус) — чулуу эргэлддэг
    # Бидний дагаж яваа чулуу: камерын өмнө зүүн доор. Байрлалыг өнцгөөр
    # бодсон — 35 мм дээр кадрын хагас өнцөг хэвтээ 27.2°, босоо 16.1°,
    # диагональ 30.5°. Чулуу тэнхлэгээс 27.0°-д, өнцгийн радиус 18.9° тул
    # 8.0°-46° мужийг эзэлж ЗҮҮН ДООД БУЛАНД тусна. Өмнө нь 4.6 м-т байсан
    # нь 47.6° радиустай болж БҮХ кадрыг хаадаг байв.
    "rock_r": 4.0,
    "rock_at": (-2.7, -4.9, -11.0),

    # Кадрын байрлал: (эхлэлд, төгсгөлд) ndc.
    # Эхэнд хөлөг төвөөс баруун-доош — од нь зүүн дээд буланд байгаа тул
    # тэнцвэр хангана. Төгсгөлд мөргөх цэг төв рүү ирнэ.
    "ndc0": (0.60, 0.43),
    "ndc1": (0.50, 0.47),

    "lens": 35.0,
    "fstop": 2.0,
    "sun": 14.0,
    "exposure": -0.4,
    "seed": 1102,
    "device": "AUTO",
}

# Нарны/одны чиглэл камерын хүрээнд: зүүн дээд буланд.
SUN_SCREEN = (0.41, 0.20)     # (зүүн тийш, дээш) камерын тэнхлэгээс.
# 35 мм дээр хэвтээ хагас өнцөг 27.2°. 0.41 -> 22.4° зүүн, 0.20 -> 11.4°
# дээш буюу од ndc (0.10, 0.85) орчимд — лавлагаа зурагтай ижил байрлал.
# 0.55 байхад 28.8° болж кадраас ГАРЧ, зөвхөн арын гэрэл үлддэг байв.
SW, SH_RATIO = 36.0, 9.0 / 16.0


# ══════════════════════════════════════════════════════════════════════
#  Туслах
# ══════════════════════════════════════════════════════════════════════
def clear():
    for c in (bpy.data.objects, bpy.data.meshes, bpy.data.materials,
              bpy.data.lights, bpy.data.cameras, bpy.data.node_groups):
        for item in list(c):
            c.remove(item, do_unlink=True)


def mat(name, base=(0.05, 0.05, 0.06), rough=0.5, metal=0.0,
        emit=None, emit_str=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1.0)
        b.inputs["Emission Strength"].default_value = emit_str
    return m


def mesh(name, verts, faces, material, smooth=False):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    return ob


def box(name, c, s, material):
    hx, hy, hz = s[0] / 2, s[1] / 2, s[2] / 2
    v = [(c[0] + x * hx, c[1] + y * hy, c[2] + z * hz)
         for x, y, z in ((-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
                         (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1))]
    f = [(0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1),
         (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)]
    return mesh(name, v, f, material)


def plume_mat(name, colour, strength, x_hot, x_cold):
    """Тийрэлтийн чийдэн — ГАДАРГУУ биш, ЭЗЭЛХҮҮН гэрэлтэлт.

    Гадаргуугийн гэрэлтэлт нь конусын ирмэгийг хурц зураас болгон үлдээж,
    цул гурвалжин мэт харагдуулдаг. Эзэлхүүний гэрэлтэлт нь ирмэггүй,
    бодит чийдэн шиг зөөлөн уусна. Хүч нь объектын X координатаар буурна.
    """
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for nm in [x.name for x in nt.nodes
               if x.bl_idname != "ShaderNodeOutputMaterial"]:
        nt.nodes.remove(nt.nodes[nm])
    out = next(x for x in nt.nodes if x.bl_idname == "ShaderNodeOutputMaterial")
    emi = nt.nodes.new("ShaderNodeEmission")
    emi.inputs["Color"].default_value = (*colour, 1.0)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs[1].default_value = x_cold        # From Min (хөвөгч, вектор биш)
    mr.inputs[2].default_value = x_hot         # From Max
    mr.inputs[3].default_value = 0.0
    mr.inputs[4].default_value = 1.0
    pw = nt.nodes.new("ShaderNodeMath")
    pw.operation = "POWER"
    pw.inputs[1].default_value = 3.0           # амнаас хол болох тусам хурдан унана
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = strength
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["X"], mr.inputs[0])
    nt.links.new(mr.outputs[0], pw.inputs[0])
    nt.links.new(pw.outputs[0], mul.inputs[0])
    nt.links.new(mul.outputs[0], emi.inputs["Strength"])
    nt.links.new(emi.outputs[0], out.inputs["Volume"])
    return m


def section(w, h, n=16, p=3.4):
    """Супер-эллипс хөндлөн огтлол — хайрцаглаг боловч булангүй."""
    pts = []
    for i in range(n):
        a = 2.0 * math.pi * i / n
        cy, sz = math.cos(a), math.sin(a)
        y = w * math.copysign(abs(cy) ** (2.0 / p), cy)
        z = h * math.copysign(abs(sz) ** (2.0 / p), sz)
        pts.append((y, z))
    return pts


def loft(name, profile, material, n=16, smooth=True):
    """(x, w, h) жагсаалтаас хоолой үүсгэнэ. Хоёр үзүүрийг таглана."""
    verts, faces = [], []
    for x, w, h in profile:
        for y, z in section(w, h, n):
            verts.append((x, y, z))
    rows = len(profile)
    for r in range(rows - 1):
        for i in range(n):
            j = (i + 1) % n
            a, b = r * n + i, r * n + j
            c, d = (r + 1) * n + j, (r + 1) * n + i
            faces.append((a, b, c, d))
    verts.append((profile[0][0], 0.0, 0.0))
    verts.append((profile[-1][0], 0.0, 0.0))
    c0, c1 = len(verts) - 2, len(verts) - 1
    for i in range(n):
        j = (i + 1) % n
        faces.append((c0, j, i))
        faces.append((c1, (rows - 1) * n + i, (rows - 1) * n + j))
    return mesh(name, verts, faces, material, smooth)


def tube(name, x0, x1, r_in, r_out, material, n=32, smooth=True):
    """Цагираг хоолой (хөндлөвч нь бөгж). r_in=0 бол дүүрэн цилиндр."""
    verts, faces = [], []
    rings = [(x0, r_out), (x1, r_out)] if r_in <= 0 else \
            [(x0, r_out), (x1, r_out), (x1, r_in), (x0, r_in)]
    for x, r in rings:
        for i in range(n):
            a = 2.0 * math.pi * i / n
            verts.append((x, r * math.cos(a), r * math.sin(a)))
    m = len(rings)
    for k in range(m):
        k2 = (k + 1) % m
        if r_in <= 0 and k == 1:
            continue
        for i in range(n):
            j = (i + 1) % n
            faces.append((k * n + i, k * n + j, k2 * n + j, k2 * n + i))
    if r_in <= 0:
        for x_i, sgn in ((0, 1), (1, -1)):
            c = len(verts)
            verts.append((rings[x_i][0], 0.0, 0.0))
            for i in range(n):
                j = (i + 1) % n
                faces.append((c, x_i * n + (j if sgn > 0 else i),
                              x_i * n + (i if sgn > 0 else j)))
    return mesh(name, verts, faces, material, smooth)


def disc(name, x, r, material, n=40):
    verts = [(x, 0.0, 0.0)]
    for i in range(n):
        a = 2.0 * math.pi * i / n
        verts.append((x, r * math.cos(a), r * math.sin(a)))
    faces = [(0, 1 + i, 1 + (i + 1) % n) for i in range(n)]
    return mesh(name, verts, faces, material)


# ══════════════════════════════════════════════════════════════════════
#  Хөлөг
# ══════════════════════════════════════════════════════════════════════
def hull_wh(x):
    """Их биений тухайн x дээрх хагас өргөн, хагас өндөр (шугаман интерполяц)."""
    p = CFG["hull"]
    if x >= p[0][0]:
        return p[0][1], p[0][2]
    for i in range(len(p) - 1):
        a, b = p[i], p[i + 1]
        if b[0] <= x <= a[0]:
            t = (a[0] - x) / (a[0] - b[0])
            return a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t
    return p[-1][1], p[-1][2]


def build_ship():
    M = {
        "hull": mat("HULL", (0.086, 0.090, 0.098), 0.52, 0.62),
        "plate": mat("PLATE", (0.160, 0.162, 0.172), 0.42, 0.70),
        "dark": mat("DARK", (0.038, 0.038, 0.044), 0.64, 0.55),
        "win": mat("WIN", (0.0, 0.0, 0.0), 0.3, 0.0, (1.0, 0.58, 0.24), 3.5),
        "core": mat("CORE", (0.0, 0.0, 0.0), 0.3, 0.0, (0.34, 0.62, 1.0), 48.0),
    }
    root = bpy.data.objects.new("SHIP", None)
    bpy.context.collection.objects.link(root)
    parts = [loft("Hull", CFG["hull"], M["hull"], 16)]

    # Нурууны хэрэгслийн зурвас — дээд талын урт хайрцаг
    parts.append(box("Spine", (26.0, 0.0, 10.4), (150.0, 9.0, 2.6), M["plate"]))
    parts.append(box("SpineCap", (-38.0, 0.0, 11.4), (44.0, 6.0, 1.4), M["dark"]))
    # Хэвлийн ойлгуур (киль)
    parts.append(box("Keel", (14.0, 0.0, -10.6), (118.0, 7.0, 3.2), M["plate"]))
    # Хамрын хавтан
    parts.append(box("Prow", (112.0, 0.0, 0.4), (22.0, 3.2, 3.0), M["plate"]))
    # Их биеийг хавтгай хавтан мэт харагдуулахгүйн тулд том шаталсан блокууд
    parts.append(box("BayA", (18.0, 0.0, 6.2), (62.0, 24.0, 7.0), M["hull"]))
    parts.append(box("BayB", (-14.0, 0.0, -5.4), (46.0, 21.0, 6.2), M["hull"]))
    parts.append(box("Dock", (62.0, 0.0, -7.2), (34.0, 15.0, 4.4), M["plate"]))

    # Хөдөлгүүрийн цагирагууд
    rng = random.Random(CFG["seed"])
    for k, (cx, ln, ro, ri) in enumerate(CFG["engines"]):
        x0, x1 = cx - ln / 2, cx + ln / 2        # x0 = АРД харсан тал
        # Гадна бүрхүүл: бараг шулуун, урд тийш бага зэрэг нарийсна.
        sh = [(x0, ro, ro), (x0 + ln * 0.62, ro, ro), (x1, ro * 0.88, ro * 0.88)]
        parts.append(loft("EngShell_%d" % k, sh, M["hull"], 40))
        # Товойсон хавирга — радиусын 7%. Үүнээс бага бол 18 м радиус дээр
        # огт мэдэгдэхгүй, бүрхүүл нь цул гуулин торх мэт болно.
        for i in range(5):
            xr = x0 + ln * (0.13 + 0.17 * i)
            rr = ro * (1.0 if xr < x0 + ln * 0.62 else 0.92)
            parts.append(tube("EngRib_%d_%d" % (k, i), xr - 0.7, xr + 0.7,
                              rr, rr * 1.07, M["plate"], 40))
        # Уртааш зурвасууд — цилиндрийг "хийцтэй" болгоно
        for i in range(10):
            a = 2.0 * math.pi * i / 10.0
            b = box("EngStrake_%d_%d" % (k, i),
                    (cx - ln * 0.05, ro * 1.02 * math.cos(a),
                     ro * 1.02 * math.sin(a)),
                    (ln * 0.80, ro * 0.16, ro * 0.05), M["dark"])
            b.rotation_euler = (a, 0.0, 0.0)
            parts.append(b)
        # Хонхор цөм: харанхуй хоолой + дотор нь гүнзгий гэрэлтэх хавтан.
        # Хавтанг яг ирмэг дээр тавивал зүгээр нэг хөх дугуй болдог; дотогш
        # оруулбал хоолойн ханан дээр туссан гэрэл нь гүн мэдрүүлнэ.
        parts.append(tube("EngBore_%d" % k, x0 - 0.2, x1, ri * 0.97, ri,
                          M["dark"], 40))
        parts.append(tube("EngLip_%d" % k, x0 - 0.5, x0 + 1.4, ri, ro,
                          M["plate"], 40))
        parts.append(disc("EngCore_%d" % k, x0 + ln * 0.16, ri * 0.95,
                          M["core"], 44))
        # тийрэлтийн чийдэн — хойш сунасан, сүүлдээ уусдаг конус
        plen = 56.0 * ln / 44.0
        pl = []
        for i in range(10):
            t = i / 9.0
            rr = ri * (0.94 - 0.78 * t ** 0.7)
            pl.append((x0 - 0.4 - plen * t, rr, rr))
        pm = plume_mat("PLUME_%d" % k, (0.26, 0.52, 1.0), 4.5,
                       x0 - 0.4, x0 - 0.4 - plen)
        p = loft("Plume_%d" % k, pl, pm, 26)
        p.visible_shadow = False
        p.visible_diffuse = False
        parts.append(p)

    # Их бие дээрх жижиг эд анги (greeble) — хөлгийг "том" харагдуулдаг зүйл
    for i in range(CFG["greeble"]):
        x = rng.uniform(-112.0, 112.0)
        w, h = hull_wh(x)
        a = rng.uniform(0.0, 2.0 * math.pi)
        y, z = w * math.cos(a), h * math.sin(a)
        n = Vector((0.0, y / max(w, 0.01), z / max(h, 0.01))).normalized()
        s = (rng.uniform(1.5, 9.0), rng.uniform(1.2, 5.0), rng.uniform(0.35, 1.6))
        c = Vector((x, y, z)) + n * (s[2] * 0.45)
        g = box("Greeble_%03d" % i, c, s,
                M["plate"] if rng.random() < 0.28 else
                (M["dark"] if rng.random() < 0.4 else M["hull"]))
        g.rotation_euler = (math.atan2(z, y) - math.pi / 2, 0.0, 0.0)
        parts.append(g)

    # Цонхнууд — хоёр талд эгнээгээр
    for i in range(CFG["windows"]):
        x = rng.uniform(-10.0, 104.0)
        w, h = hull_wh(x)
        side = 1 if i % 2 == 0 else -1
        z = rng.choice((-0.45, 0.0, 0.38)) * h
        # супер-эллипсийн хажуугийн радиус. z сөрөг байж болох тул abs()
        # — сөрөг тоог бутархай зэрэгт дэвшүүлбэл комплекс тоо гарна.
        y = side * w * (max(0.0, 1.0 - abs(z / h) ** 3.4)) ** (1.0 / 3.4)
        parts.append(box("Win_%03d" % i, (x, y * 1.01, z),
                         (rng.uniform(1.6, 4.4), 0.5, rng.uniform(0.5, 1.1)),
                         M["win"]))

    for p in parts:
        p.parent = root
    return root, M


# ══════════════════════════════════════════════════════════════════════
#  Чулуу
# ══════════════════════════════════════════════════════════════════════
def _hash(i, j, k, s):
    n = (i * 374761393 + j * 668265263 + k * 1274126177 + s * 1013904223)
    n &= 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFF) / 32767.5 - 1.0


def vnoise(p, s):
    """Гурван хэмжээст утгын шуугиан — гурвалсан шугаман интерполяц."""
    x, y, z = p
    i, j, k = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - i, y - j, z - k
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    fz = fz * fz * (3 - 2 * fz)
    out = 0.0
    for dz in (0, 1):
        wz = fz if dz else 1 - fz
        for dy in (0, 1):
            wy = fy if dy else 1 - fy
            for dx in (0, 1):
                wx = fx if dx else 1 - fx
                out += wx * wy * wz * _hash(i + dx, j + dy, k + dz, s)
    return out


def build_rock(name, center, radius, seed, material, subdiv=3, craters=4):
    """Icosphere + олон давхар шуугиан + тогоо. Чулуу бүр өөр хэлбэртэй."""
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=subdiv, radius=1.0,
                                          location=(0, 0, 0))
    ob = bpy.context.object
    ob.name = name
    rng = random.Random(seed)
    # тогооны байрлал ба хэмжээ
    pits = [(Vector((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized(),
             rng.uniform(0.22, 0.52), rng.uniform(0.10, 0.26))
            for _ in range(craters)]
    for v in ob.data.vertices:
        n = v.co.normalized()
        # 3 давхар шуугиан — томоос жижиг рүү
        d = 1.0
        for oct_ in range(3):
            f = 1.7 * (2.1 ** oct_)
            d += vnoise((n.x * f + seed * 0.37, n.y * f - seed * 0.19,
                         n.z * f + seed * 0.53), seed + oct_) * (0.26 / (1.8 ** oct_))
        # тогоо: дотогш дарж, ирмэгийг нь бага зэрэг өргөнө
        for axis, ang, deep in pits:
            c = n.dot(axis)
            t = math.acos(max(-1.0, min(1.0, c))) / ang
            if t < 1.0:
                d -= deep * (1.0 - t * t) ** 1.5
            elif t < 1.25:
                d += deep * 0.28 * (1.0 - abs(t - 1.12) / 0.13) ** 2
        v.co = n * (radius * max(0.35, d))
    # бага зэрэг хавтгайруулж "чулуулаг" болгоно
    ob.scale = (1.0, rng.uniform(0.72, 1.0), rng.uniform(0.66, 0.95))
    ob.rotation_euler = (rng.uniform(0, 6.28), rng.uniform(0, 6.28),
                         rng.uniform(0, 6.28))
    ob.location = center
    ob.data.materials.append(material)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


# ══════════════════════════════════════════════════════════════════════
#  Зам ба камерын геометр
# ══════════════════════════════════════════════════════════════════════
def path():
    """(эхлэх цэг, төгсгөх цэг, ирэх нэгж вектор, явах нэгж вектор)."""
    u = Vector(CFG["from"]).normalized()
    hit = Vector(CFG["hit"])
    return hit + u * CFG["dist0"], hit + u * CFG["stop"], u, -u


def basis(fwd):
    """Камерын суурь: урагш, баруун, дээш (roll=0, дэлхийн Z дээш)."""
    f = Vector(fwd).normalized()
    r = f.cross(Vector((0.0, 0.0, 1.0)))
    if r.length < 1e-6:
        r = Vector((1.0, 0.0, 0.0))
    r.normalize()
    return f, r, r.cross(f)


def project(C, A, P, lens):
    """P цэг дэлгэцийн хаана буух вэ (ndc)."""
    f, r, u = basis(A - C)
    v = P - C
    z = v.dot(f)
    if z <= 0:
        return None
    return (0.5 + (v.dot(r) / z) * lens / SW,
            0.5 + (v.dot(u) / z) * lens / (SW * SH_RATIO))


def aim_for(C, P, nx, ny, lens):
    """P цэгийг (nx, ny) ndc дээр буулгах ХАРЦЫН цэгийг олно (Ньютоны давталт)."""
    A = P.copy()
    d = (P - C).length
    for _ in range(8):
        q = project(C, A, P, lens)
        if q is None:
            break
        ex, ey = nx - q[0], ny - q[1]
        if abs(ex) < 1e-5 and abs(ey) < 1e-5:
            break
        f, r, u = basis(A - C)
        A = A - r * (ex * d * SW / lens) - u * (ey * d * SW * SH_RATIO / lens)
    return A


def quat_for(fwd, roll_deg):
    """Урагшлах чиглэл + эргэлтээс камерын кватернион.

    Blender-ийн камер локал -Z рүү харна, локал +Y нь дээш.
    """
    f, r0, u0 = basis(fwd)
    a = math.radians(roll_deg)
    r = r0 * math.cos(a) + u0 * math.sin(a)
    u = u0 * math.cos(a) - r0 * math.sin(a)
    return Matrix((( r.x, u.x, -f.x),
                   ( r.y, u.y, -f.y),
                   ( r.z, u.z, -f.z))).to_quaternion()


# ══════════════════════════════════════════════════════════════════════
#  Чулууны талбай
# ══════════════════════════════════════════════════════════════════════
def build_field(P0, Pe, fwd):
    """Дэвсгэрийн чулуунууд + замын дагуу ЗОРИУД байрлуулсан өнгөрөгчид.

    Сансарт хурдыг мэдрүүлдэг зүйл нь алсын объект биш, ойрын объектын
    параллакс. Тиймээс 6 чулууг тодорхой секундэд, тодорхой зайд
    өнгөрөхөөр нь байрлуулав — санамсаргүй биш, хэмнэлтэй.
    """
    rock = mat("ROCK", (0.052, 0.049, 0.044), 0.93, 0.0)
    f, e1, e2 = basis(fwd)
    rng = random.Random(CFG["seed"] + 7)
    out = []

    # (секунд 0..1 хувиар, хажуугийн зай м, өнцөг°, радиус м)
    passes = [(0.15,  95.0,  35.0, 14.0), (0.31,  58.0, 200.0,  9.0),
              (0.46, 150.0, 115.0, 26.0), (0.62,  44.0, 300.0,  7.5),
              (0.76, 105.0,  55.0, 19.0), (0.88,  34.0, 240.0,  6.0)]
    for i, (t, m, ang, r) in enumerate(passes):
        c = P0 + (Pe - P0) * t
        a = math.radians(ang)
        pos = c + (e1 * math.cos(a) + e2 * math.sin(a)) * m
        out.append(build_rock("Pass_%d" % i, pos, r, CFG["seed"] + 40 + i, rock,
                              3 if r < 12 else 4))

    # Дэвсгэр: хөлгийн эргэн тойронд бөөгнөрөл + замын дагуу тархалт
    for i in range(52):
        if i < 22:                       # хөлгийн ойролцоо — гүн мэдрүүлнэ
            pos = Vector((rng.uniform(-420, 420), rng.uniform(-360, 360),
                          rng.uniform(-240, 240)))
            r = rng.uniform(8.0, 46.0)
        else:                            # замын дагуу, гэхдээ хэт ойрхон биш
            t = rng.uniform(0.02, 0.95)
            c = P0 + (Pe - P0) * t
            a = rng.uniform(0, 2 * math.pi)
            m = rng.uniform(230.0, 900.0)
            pos = c + (e1 * math.cos(a) + e2 * math.sin(a)) * m
            r = rng.uniform(10.0, 60.0)
        out.append(build_rock("Rock_%02d" % i, pos, r, CFG["seed"] + 200 + i,
                              rock, 2 if r < 20 else 3, 3))
    return rock, out


# ══════════════════════════════════════════════════════════════════════
#  Гэрэл, ертөнц
# ══════════════════════════════════════════════════════════════════════
def build_light(P0, fwd):
    """Нар ба харагдах од. Од нь кадрын зүүн дээд буланд (лавлагаа зурагтай ижил)."""
    f, r, u = basis(fwd)
    star = (f - r * SUN_SCREEN[0] + u * SUN_SCREEN[1]).normalized()

    d = bpy.data.lights.new("SUN", "SUN")
    d.energy = CFG["sun"]
    d.color = (0.82, 0.89, 1.0)
    d.angle = math.radians(0.36)
    s = bpy.data.objects.new("SUN", d)
    bpy.context.collection.objects.link(s)
    s.rotation_euler = Vector((0.0, 0.0, -1.0)).rotation_difference(-star).to_euler()

    m = mat("STAR", (0, 0, 0), 0.5, 0.0, (0.80, 0.90, 1.0), 9000.0)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=240.0,
                                          location=P0 + star * 62000.0)
    o = bpy.context.object
    o.name = "STAR"
    o.data.materials.append(m)
    o.visible_shadow = False
    for p in o.data.polygons:
        p.use_smooth = True

    # Маш сул дүүргэгч — эс бөгөөс сүүдэр талбай нь бүрэн хар болно
    fd = bpy.data.lights.new("FILL", "SUN")
    fd.energy = 0.95
    fd.color = (0.26, 0.38, 0.66)
    fd.angle = math.radians(40.0)
    fo = bpy.data.objects.new("FILL", fd)
    bpy.context.collection.objects.link(fo)
    fo.rotation_euler = Vector((0.0, 0.0, -1.0)).rotation_difference(star).to_euler()

    bd = bpy.data.lights.new("FILL_LOW", "SUN")
    bd.energy = 0.40
    bd.color = (0.34, 0.40, 0.58)
    bd.angle = math.radians(60.0)
    bo = bpy.data.objects.new("FILL_LOW", bd)
    bpy.context.collection.objects.link(bo)
    low = (Vector((0.0, 0.0, 1.0)) + f * 0.3 + r * 0.5).normalized()
    bo.rotation_euler = Vector((0.0, 0.0, -1.0)).rotation_difference(-low).to_euler()
    return s, star


def build_world():
    """Хар тэнгэр + процедурын од. Voronoi-гийн зай нь цэг бүрт 0 болдог."""
    w = bpy.data.worlds.new("SPACE")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    add = nt.nodes.new("ShaderNodeMix")
    add.data_type = "RGBA"
    add.blend_type = "ADD"
    add.inputs["Factor"].default_value = 1.0
    tex = nt.nodes.new("ShaderNodeTexCoord")
    for i, (scale, lo, hi, gain) in enumerate(((210.0, 0.0, 0.030, 1.0),
                                               (46.0, 0.0, 0.016, 3.2))):
        v = nt.nodes.new("ShaderNodeTexVoronoi")
        v.voronoi_dimensions = "3D"
        v.inputs["Scale"].default_value = scale
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = lo
        ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
        ramp.color_ramp.elements[1].position = hi
        ramp.color_ramp.elements[1].color = (0, 0, 0, 1)
        g = nt.nodes.new("ShaderNodeMix")
        g.data_type = "RGBA"
        g.blend_type = "MULTIPLY"
        g.inputs["Factor"].default_value = 1.0
        g.inputs[7].default_value = (gain, gain * 0.98, gain * 1.05, 1.0)
        nt.links.new(tex.outputs["Generated"], v.inputs["Vector"])
        nt.links.new(v.outputs["Distance"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], g.inputs[6])
        nt.links.new(g.outputs[2], add.inputs[6 if i == 0 else 7])
    nt.links.new(add.outputs[2], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


# ══════════════════════════════════════════════════════════════════════
#  Рендер, компоновк
# ══════════════════════════════════════════════════════════════════════
def setup_render(res=(1920, 1080), samples=96):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "GPU" if CFG["device"] == "GPU" else "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.use_adaptive_sampling = True
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.fps = 24
    sc.render.film_transparent = False          # одон тэнгэр хэрэгтэй
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.5         # 180° хаалт
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.exposure = CFG["exposure"]
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "16"


def setup_glare():
    """Оддын туяа (Streaks) + хөдөлгүүрийн гэрлийн тархалт (Fog Glow).

    Blender 5.0-ийн компоновк хоёр зүйлээр өөрчлөгдсөн:
      1. Glare-ийн бүх тохиргоо СОКЕТ болсон. glare_type шинж чанар
         байхгүй — "Type" нэртэй цэсэн оролт руу мөр өгнө.
      2. CompositorNodeComposite зангилаа УСТСАН. Бүлэг нь рендерийн
         үр дүнг бүлгийн ОРОЛТООС авдаггүй (тэгвэл хоосон хар гарна) —
         бүлэг дотор Render Layers зангилаа тавьж, Group Output руу
         холбоно.
    """
    try:
        sc = bpy.context.scene
        ng = bpy.data.node_groups.new("IMPACT_CMP", "CompositorNodeTree")
        ng.interface.new_socket("Image", in_out="OUTPUT",
                                socket_type="NodeSocketColor")
        rl = ng.nodes.new("CompositorNodeRLayers")
        rl.scene = sc
        rl.location = (-520, 0)
        go = ng.nodes.new("NodeGroupOutput")
        go.location = (420, 0)

        fog = ng.nodes.new("CompositorNodeGlare")
        fog.location = (-220, 40)
        fog.inputs["Type"].default_value = "Fog Glow"
        fog.inputs["Quality"].default_value = "High"
        fog.inputs["Threshold"].default_value = 1.10
        fog.inputs["Strength"].default_value = 0.45
        fog.inputs["Size"].default_value = 0.70

        st = ng.nodes.new("CompositorNodeGlare")
        st.location = (110, -30)
        st.inputs["Type"].default_value = "Streaks"
        st.inputs["Quality"].default_value = "High"
        st.inputs["Threshold"].default_value = 6.0      # зөвхөн од цацарна
        st.inputs["Strength"].default_value = 0.80
        st.inputs["Streaks"].default_value = 4
        st.inputs["Fade"].default_value = 0.92
        st.inputs["Color Modulation"].default_value = 0.30

        ng.links.new(rl.outputs["Image"], fog.inputs["Image"])
        ng.links.new(fog.outputs["Image"], st.inputs["Image"])
        ng.links.new(st.outputs["Image"], go.inputs["Image"])
        sc.compositing_node_group = ng
        sc.render.use_compositing = True
        sc.render.compositor_device = "CPU"
        return True
    except Exception as e:                                   # noqa: BLE001
        print("[1st Studio] Glare тавигдсангүй (%s) — рендер үргэлжилнэ"
              % type(e).__name__)
        return False


# ══════════════════════════════════════════════════════════════════════
#  Камер
# ══════════════════════════════════════════════════════════════════════
def build_camera(angle, lens=None):
    P0, Pe, u, fwd = path()
    hit = Vector(CFG["hit"])
    d = bpy.data.cameras.new("IMPACT_CAM")
    d.sensor_width = SW
    d.clip_start = 0.05
    d.clip_end = 200000.0
    d.dof.use_dof = True
    d.dof.aperture_fstop = CFG["fstop"]
    d.dof.aperture_blades = 7
    cam = bpy.data.objects.new("IMPACT_CAM", d)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    focus = bpy.data.objects.new("FOCUS", None)
    bpy.context.collection.objects.link(focus)
    focus.location = hit
    d.dof.focus_object = focus

    if angle == "ship":
        # Лавлагаа зурагтай ижил гоо зураг: замын дээр, 520 м-т, урт линз
        d.lens = lens or 55.0
        C = hit + u * 520.0
        cam.location = C
        cam.rotation_mode = "QUATERNION"
        A = aim_for(C, Vector((0.0, 0.0, 0.0)), 0.52, 0.47, d.lens)
        cam.rotation_quaternion = quat_for(A - C, 0.0)
        return cam, None
    if angle == "side":
        # Гадна талаас бүх замыг харах шалгах өнцөг
        d.lens = lens or 24.0
        f, e1, e2 = basis(fwd)
        mid = P0 + (Pe - P0) * 0.5
        C = mid + e1 * 1250.0 + e2 * 260.0
        cam.location = C
        cam.rotation_mode = "QUATERNION"
        cam.rotation_quaternion = quat_for(mid - C, 0.0)
        d.dof.use_dof = False
        return cam, None

    # pov — солир дээр суусан камер
    d.lens = lens or CFG["lens"]
    met = bpy.data.objects.new("METEOR", None)
    bpy.context.collection.objects.link(met)
    met.empty_display_size = 6.0
    met.rotation_mode = "QUATERNION"
    cam.parent = met
    cam.location = (0.0, 0.0, 0.0)
    cam.rotation_mode = "QUATERNION"

    # Бидний унаж яваа чулуу — камерын өмнө зүүн доор. Энэ нь "би чулуун
    # дээр байна" гэдгийг нэг харцаар ойлгуулдаг цорын ганц зүйл.
    rock = mat("HEAD_ROCK", (0.040, 0.038, 0.034), 0.94, 0.0)
    head = build_rock("METEOR_HEAD", (0, 0, 0), CFG["rock_r"],
                      CFG["seed"] + 3, rock, 4, 5)
    head.parent = met
    head.location = CFG["rock_at"]
    head.name = "METEOR_HEAD"
    return cam, met


# ══════════════════════════════════════════════════════════════════════
#  Хөдөлгөөн
# ══════════════════════════════════════════════════════════════════════
def animate(cam, met, frames):
    P0, Pe, u, fwd = path()
    hit = Vector(CFG["hit"])
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 1, frames
    lens = cam.data.lens
    v = (Pe - P0).length / (frames / 24.0)

    fs = set(range(1, frames + 1, max(1, frames // 180)))
    fs.update(range(max(1, int(frames * 0.86)), frames + 1, 2))   # төгсгөл нягт
    fs.update((1, frames))
    prev = None
    rows = []
    for f in sorted(x for x in fs if 1 <= x <= frames):
        t = (f - 1) / float(frames - 1)
        C = P0 + (Pe - P0) * t                    # ТОГТМОЛ хурд — хөдөлгүүргүй
        s = t * t * (3.0 - 2.0 * t)
        nx = CFG["ndc0"][0] + (CFG["ndc1"][0] - CFG["ndc0"][0]) * s
        ny = CFG["ndc0"][1] + (CFG["ndc1"][1] - CFG["ndc0"][1]) * s
        P = Vector((0.0, 0.0, 0.0)).lerp(hit, s)  # бүтэн хөлөг -> мөргөх цэг
        A = aim_for(C, P, nx, ny, lens)
        q = quat_for(A - C, CFG["roll"] * t)
        if prev is not None and q.dot(prev) < 0.0:
            q = Quaternion((-q.w, -q.x, -q.y, -q.z))
        prev = q
        met.location = C
        met.rotation_quaternion = q
        met.keyframe_insert("location", frame=f)
        met.keyframe_insert("rotation_quaternion", frame=f)
        rows.append((f, (C - hit).length))

    # Толгойн чулуу камертай хамт явах тул кадрын нэг байрандаа ЗОГСОНО.
    # Хөдөлгөөнгүй бол зүгээр нэг хар хээ мэт харагдана — жинхэнэ чулуу
    # эргэлддэг тул удаан эргэлт өгнө.
    head = bpy.data.objects.get("METEOR_HEAD")
    if head is not None:
        e0 = list(head.rotation_euler)
        for f, sp in ((1, 0.0), (frames, 1.0)):
            head.rotation_euler = (e0[0] + math.radians(38.0) * sp,
                                   e0[1] - math.radians(17.0) * sp,
                                   e0[2] + math.radians(9.0) * sp)
            head.keyframe_insert("rotation_euler", frame=f)

    ad = met.animation_data
    try:
        cb = ad.action.layers[0].strips[0].channelbag(ad.action_slot)
        for fc in cb.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
    except Exception:                                            # noqa: BLE001
        pass

    L = CFG["ship_len"]
    print("[1st Studio] Мөргөлт: %d фрейм (%.1f сек), %.0f мм"
          % (frames, frames / 24.0, lens))
    print("   зай %.0f -> %.0f м, хурд %.1f м/с (%.0f км/ц) — ТОГТМОЛ"
          % (CFG["dist0"], CFG["stop"], v, v * 3.6))
    print("   сек    зай м   хөлөг кадрын өргөний")
    for frac in (0.0, 0.25, 0.5, 0.7, 0.85, 0.93, 0.97, 1.0):
        f = 1 + int((frames - 1) * frac)
        R = (P0 + (Pe - P0) * frac - hit).length
        print("   %5.1f  %6.0f   %5.1f%%"
              % (f / 24.0, R, 100.0 * L / max(R, 1.0) * lens / SW))


def prep_viewport():
    """.blend нээмэгц шууд харагдахаар: материалтай, камерын харцаар."""
    for scr in bpy.data.screens:
        for area in scr.areas:
            if area.type != "VIEW_3D":
                continue
            for sp in area.spaces:
                if sp.type == "VIEW_3D":
                    sp.shading.type = "MATERIAL"
                    sp.clip_end = 200000.0
                    sp.region_3d.view_perspective = "CAMERA"


# ══════════════════════════════════════════════════════════════════════
def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []

    def opt(flag, default=None):
        return argv[argv.index(flag) + 1] if flag in argv else default

    CFG["device"] = opt("--device", CFG["device"])
    CFG["dist0"] = float(opt("--dist", CFG["dist0"]))
    CFG["roll"] = float(opt("--roll", CFG["roll"]))
    CFG["exposure"] = float(opt("--exposure", CFG["exposure"]))
    angle = opt("--angle", "pov")
    lens = float(opt("--lens")) if "--lens" in argv else None

    clear()
    P0, Pe, u, fwd = path()
    build_ship()
    if "--no-field" not in argv:
        build_field(P0, Pe, fwd)
    build_light(P0, fwd)
    build_world()

    res = opt("--res", "960x540")
    setup_render(tuple(int(v) for v in res.split("x")),
                 int(opt("--samples", 64)))
    if "--no-glare" not in argv:
        setup_glare()
    cam, met = build_camera(angle, lens)

    frames = int(opt("--frames", 720))
    if met is not None:
        animate(cam, met, frames)
    else:
        bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, frames
        print("[1st Studio] Өнцөг '%s' — хөдөлгөөнгүй шалгах кадр" % angle)

    n = len([o for o in bpy.data.objects if o.type == "MESH"])
    print("[1st Studio] Хөлөг %.0f м · объект %d · од/нар тавигдсан"
          % (CFG["ship_len"], n))

    frame = opt("--frame")
    if frame:
        bpy.context.scene.frame_set(int(frame))

    blend = opt("--save-blend")
    if blend:
        if not frame:
            bpy.context.scene.frame_set(1)
        r = bpy.context.scene.render
        if not r.filepath or r.filepath.startswith("/tmp"):
            r.filepath = "//out/f"
        prep_viewport()
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(blend))
        print("[1st Studio] Хадгаллаа:", blend)

    if "--render" in argv:
        out = argv[argv.index("--render") + 1]
        bpy.context.scene.render.filepath = os.path.abspath(out)
        if met is not None and "--anim" in argv and not frame:
            if "--range" in argv:
                a, b = opt("--range").split("-")
                bpy.context.scene.frame_start = int(a)
                bpy.context.scene.frame_end = int(b)
                print("[1st Studio] Зөвхөн фрейм %s-%s" % (a, b))
            if "--mp4" in argv:
                r = bpy.context.scene.render
                r.image_settings.media_type = "VIDEO"     # 5.0-д заавал
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
