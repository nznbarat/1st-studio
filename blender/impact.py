"""1st Studio — "0110" ачааны хөлөг рүү солир мөргөх нь.

Камер нь СОЛИР дээр суусан (POV). Хийн аварга гаригийн солирын
бүслүүр дотор алсаас хөлгийг олж хараад, тогтмол хурдаар АЖУУХАН
ойртоно. Хүрэхээс 3 фреймийн (1/8 сек) өмнө тасална — мөргөлт
"яалтгүй" мэдрэгдэнэ, гэхдээ дэлбэрэлт харагдахгүй.
Хичкокийн "ширээн доорх бөмбөг": үзэгч юу болохыг мэдэж байгаа тул
айдас дэлбэрэлтээс биш, хүлээлтээс үүснэ.

    python3 blender/impact.py -- --angle pov --frames 720 --res 1920x1080 \
        --samples 96 --device GPU --anim --render out/impact

Үндсэн зарчим: солир бол хөдөлгүүргүй чулуу. Хурд нь ТОГТМОЛ. Иймд
дэлгэц дээрх хэмжээ нь 1/R буюу гиперболоор өснө. Хэмнэлийг зөвхөн
эхлэх ба тасалах зайн харьцаа тодорхойлно: 1400->23 м (60.9x) бол
сүүлийн 3 секундэд 7 дахин дэлбэрч томордог; 1600->260 м (6.2x) бол
1.52 дахин буюу тайван, зогсолтгүй ойртолт. Хурдыг "мэдрүүлдэг" зүйл нь хөлөг биш,
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
    # Солирын толгой хөлгийн их биед ХҮРЭХ мөч дэх камер->мөргөх цэгийн зай.
    # BVH-ээр бодит mesh-ийг хэмжив: толгой кадрын зүүн доод буланд тул
    # мөргөх цэгт биш, доод баруун хажууд (z = -8.1 м) хүрнэ.
    "contact": 19.8,
    # ТАСЛАХ зай = хүрэхээс 3 фреймийн (1/8 сек) өмнө: 19.8 + 3·44.7/24.
    # Чулуу их биеэс ~4.6 м — диаметрийнхээ хагаст, нүдэнд хүрсэн мэт.
    # Мөргөлт "яалтгүй" мэдрэгдэнэ, гэхдээ дэлбэрэлт харагдахгүй.
    "end": 25.4,
    # Эхлэх зай = таслах + 44.7 м/с · 30 сек. Хурдыг баталсан хувилбарынхаар
    # (1600 -> 260 м) үлдээж, эхний 5.1 сек-ийг хасаад төгсгөлд 5.4 сек нэмэв.
    "dist0": 1366.0,
    "roll": 11.0,         # бүх хугацаанд эргэх өнцөг (градус) — чулуу эргэлддэг
    # Бидний дагаж яваа чулуу: камерын өмнө зүүн доор. Байрлалыг өнцгөөр
    # бодсон — 35 мм дээр кадрын хагас өнцөг хэвтээ 27.2°, босоо 16.1°,
    # диагональ 30.5°. Чулуу тэнхлэгээс 27.0°-д, өнцгийн радиус 18.9° тул
    # зөвхөн ЗҮҮН ДООД булангаар тусна: оройн ирмэг нь ndc_y 0.15 орчимд.
    # Өмнө нь 4.6 м-т байхад 47.6° радиустай болж БҮХ кадрыг хаадаг,
    # 11 м-т байхад ndc_y 0.32 хүрч сүүлийн 5 секундэд хөлгийг халхалдаг байв.
    "rock_r": 4.0,
    "rock_at": (-5.5, -7.3, -17.9),

    # Кадрын байрлал: (эхлэлд, төгсгөлд) ndc.
    # Эхэнд хөлөг төвөөс баруун-доош — од нь зүүн дээд буланд байгаа тул
    # тэнцвэр хангана. Төгсгөлд мөргөх цэг төв рүү ирнэ.
    "ndc0": (0.60, 0.43),
    "ndc1": (0.50, 0.47),

    # ХИЙН АВАРГА ГАРИГ. Хязгааргүй алсад (камерын байрлалыг дагана, эс
    # бөгөөс 1340 м явах явцад параллакс үүсэж гариг хөдлөх мэт болно).
    #   screen   — камерын тэнхлэгээс (баруун, дээш) tan өнцөг: 24° баруун,
    #              14° доош. Од зүүн дээд буланд тул гариг эсрэг буланд.
    #   Од кадрын дотор байгаа тул кадар доторх ЯМАР Ч гариг хавирган
    #   сар хэлбэртэй харагдана (фазын өнцөг >120°) — физик. Одоос хамгийн
    #   хол булан нь хамгийн том хавирга (≈20%) өгнө.
    #   band_to  — бүслүүрийн зурвас гаригийн төвөөр дайрч энэ цэг рүү
    #              кадрыг налуу огтолно. Бүслүүр экваторын хавтгайд тул
    #              гаригийн зурвасууд түүнтэй ЗЭРЭГЦЭЭ.
    "planet": {"screen": (0.445, -0.249), "radius_deg": 20.0,
               "dist": 150000.0, "band_to": (-0.404, 0.047)},
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


def plume_mat(name, colour, strength, x_hot, x_cold, r0=1.0):
    """Тийрэлтийн чийдэн — ГАДАРГУУ биш, ЭЗЭЛХҮҮН гэрэлтэлт.

    Гадаргуугийн гэрэлтэлт нь конусын ирмэгийг хурц зураас болгон үлдээж,
    цул гурвалжин мэт харагдуулдаг. Эзэлхүүний гэрэлтэлт нь ирмэггүй,
    бодит чийдэн шиг зөөлөн уусна. Хүч нь объектын X координатаар буурна.

    АНХААР: `strength` нь МЕТР ТУТМЫН гэрэлтэлт — харааны шугам дагуу
    хуримтлагдана. Ар талаас налуу харахад шугам ~18 м явна: 0.9/м бол
    ~16 болж бүрэн цайдаг байв. Тэнхлэгээс радиусаар бүдгэрүүлснээр
    конусын хана хурц ирмэг болж харагдахгүй.
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
    # радиус: sqrt(y² + z²) / r0 -> (1 - ·)^1.5
    yy = nt.nodes.new("ShaderNodeMath"); yy.operation = "MULTIPLY"
    zz = nt.nodes.new("ShaderNodeMath"); zz.operation = "MULTIPLY"
    nt.links.new(sep.outputs["Y"], yy.inputs[0]); nt.links.new(sep.outputs["Y"], yy.inputs[1])
    nt.links.new(sep.outputs["Z"], zz.inputs[0]); nt.links.new(sep.outputs["Z"], zz.inputs[1])
    rr = nt.nodes.new("ShaderNodeMath"); rr.operation = "ADD"
    nt.links.new(yy.outputs[0], rr.inputs[0]); nt.links.new(zz.outputs[0], rr.inputs[1])
    sq = nt.nodes.new("ShaderNodeMath"); sq.operation = "SQRT"
    nt.links.new(rr.outputs[0], sq.inputs[0])
    rad = nt.nodes.new("ShaderNodeMapRange")
    rad.inputs[1].default_value = 0.0
    rad.inputs[2].default_value = r0
    rad.inputs[3].default_value = 1.0          # тэнхлэг дээр 1
    rad.inputs[4].default_value = 0.0          # ханан дээр 0
    nt.links.new(sq.outputs[0], rad.inputs[0])
    rp = nt.nodes.new("ShaderNodeMath"); rp.operation = "POWER"
    rp.inputs[1].default_value = 1.5
    nt.links.new(rad.outputs[0], rp.inputs[0])
    both = nt.nodes.new("ShaderNodeMath"); both.operation = "MULTIPLY"
    nt.links.new(pw.outputs[0], both.inputs[0])
    nt.links.new(rp.outputs[0], both.inputs[1])
    nt.links.new(both.outputs[0], mul.inputs[0])
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
def add_panels(m, size=(4.2, 2.1, 2.1), seam=0.035, depth=0.05):
    """Их биеийн хавтан: гурван тэнхлэгийн сараалжин оёдол + хавтан бүрийн
    өнгө/барзгаршлын ялгаа. Объектын координатаар (метр) тул проекцгүй —
    хажуу, дээд, доод бүх гадаргуу дээр оёдол гарна. Сүүлийн секундэд
    камер их биеэс 25 м-т ирэхэд энэ оёдол л гадаргууг "жинхэнэ төмөр"
    болгодог; үгүй бол хар хана дээр цонх л харагдана."""
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    base = tuple(b.inputs["Base Color"].default_value)
    rough = b.inputs["Roughness"].default_value
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])

    def mth(op, a, v=None):
        n = nt.nodes.new("ShaderNodeMath")
        n.operation = op
        nt.links.new(a, n.inputs[0])
        if v is not None:
            n.inputs[1].default_value = v
        return n.outputs[0]

    seams = None
    for ax, L in zip(("X", "Y", "Z"), size):
        # 0 = хавтангийн төв, 0.5 = оёдол
        d = mth("ABSOLUTE", mth("SUBTRACT", mth("FRACT", mth("DIVIDE", sep.outputs[ax], L)), 0.5))
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs[1].default_value = 0.5 - seam
        mr.inputs[2].default_value = 0.5
        nt.links.new(d, mr.inputs[0])
        seams = mr.outputs[0] if seams is None else _max(nt, seams, mr.outputs[0])
    # хавтан бүрийн санамсаргүй утга: floor(coord / size)
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = tuple(1.0 / v for v in size)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    fl = nt.nodes.new("ShaderNodeVectorMath")
    fl.operation = "FLOOR"
    nt.links.new(mp.outputs["Vector"], fl.inputs[0])
    wn = nt.nodes.new("ShaderNodeTexWhiteNoise")
    wn.noise_dimensions = "3D"
    nt.links.new(fl.outputs[0], wn.inputs["Vector"])
    var = nt.nodes.new("ShaderNodeMapRange")
    var.inputs[3].default_value = 0.78
    var.inputs[4].default_value = 1.22
    nt.links.new(wn.outputs["Value"], var.inputs[0])
    # өнгө = суурь · ялгаа · (1 - 0.65·оёдол)
    dark = nt.nodes.new("ShaderNodeMapRange")
    dark.inputs[3].default_value = 1.0
    dark.inputs[4].default_value = 0.35
    nt.links.new(seams, dark.inputs[0])
    k = nt.nodes.new("ShaderNodeMath")
    k.operation = "MULTIPLY"
    nt.links.new(var.outputs[0], k.inputs[0])
    nt.links.new(dark.outputs[0], k.inputs[1])
    col = nt.nodes.new("ShaderNodeMix")
    col.data_type = "RGBA"
    col.blend_type = "MULTIPLY"
    col.inputs["Factor"].default_value = 1.0
    col.inputs[6].default_value = base
    ck = nt.nodes.new("ShaderNodeCombineXYZ")
    for i in range(3):
        nt.links.new(k.outputs[0], ck.inputs[i])
    nt.links.new(ck.outputs[0], col.inputs[7])
    nt.links.new(col.outputs[2], b.inputs["Base Color"])
    # барзгаршил хавтан бүрээр ±0.12
    rr = nt.nodes.new("ShaderNodeMapRange")
    rr.inputs[3].default_value = max(0.05, rough - 0.12)
    rr.inputs[4].default_value = min(1.0, rough + 0.12)
    nt.links.new(wn.outputs["Value"], rr.inputs[0])
    nt.links.new(rr.outputs[0], b.inputs["Roughness"])
    # товгор: оёдол хонхор
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.55
    bump.inputs["Distance"].default_value = depth
    nt.links.new(seams, bump.inputs["Height"])
    bump.invert = True
    nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m


def _max(nt, a, b):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = "MAXIMUM"
    nt.links.new(a, n.inputs[0])
    nt.links.new(b, n.inputs[1])
    return n.outputs[0]


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
        # 18: цацрагийн босго (60)-оос доош, Fog Glow (2.5)-оос дээш — зөөлөн
        # цэнхэр туяарал үлдэнэ. 48 дээр AgX цэнхэрийг цагаан болгож, 2
        # салаат цацраг нь хөлгөөс 70 м урт шаантаг гаргадаг байв.
        "core": mat("CORE", (0.0, 0.0, 0.0), 0.3, 0.0, (0.34, 0.62, 1.0), 18.0),
    }
    add_panels(M["hull"])
    add_panels(M["plate"], size=(2.6, 1.3, 1.3))
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
        # 56.6° налуугаас ln·0.16 гүнд байхад хоолойн хана бүрэн хаадаг байв
        parts.append(disc("EngCore_%d" % k, x0 + ln * 0.06, ri * 0.95,
                          M["core"], 44))
        # тийрэлтийн чийдэн — хойш сунасан, сүүлдээ уусдаг конус
        # Эзэлхүүний гэрэлтэлт харааны шугамын УРТААР хуримтлагдана. Ар
        # талаас налуу харахад шугам конусын дагуу ~50 м явж (хажуугаас ~10 м)
        # 5 дахин тод болж, AgX түүнийг цагаан шаантаг болгодог байв. Лавлагаа
        # зураг дээр ч урт тийрэлт биш — зөвхөн амсрын цэнхэр гэрэл.
        plen = 34.0 * ln / 44.0
        pl = []
        for i in range(10):
            t = i / 9.0
            rr = ri * (0.94 - 0.78 * t ** 0.7)
            pl.append((x0 - 0.4 - plen * t, rr, rr))
        pm = plume_mat("PLUME_%d" % k, (0.22, 0.48, 1.0), 1.2,
                       x0 - 0.4, x0 - 0.4 - plen, ri * 0.94)
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

    # Их биеийн гэрэлтүүлэгч — мөргөх орчмын баруун хажууд. Од урд талд тул
    # бидний ойртох тал СҮҮДЭРТ: сүүлийн секундэд их бие хар хана болж,
    # хар солир түүн дээр алга болдог байв. Дүүргэгч гэрлийг нэмбэл
    # алсын силуэт алдагдана. Гэрэл зайны квадратаар сулардаг тул эдгээр
    # 1000 м-т зөвхөн замын гэрэл шиг цэг, 25 м-т хавтанг гэрэлтүүлж,
    # солирыг гэрэлтэй төмрийн өмнө ХАР СИЛУЭТ болгоно.
    lamp = mat("LAMP", (0.0, 0.0, 0.0), 0.3, 0.0, (1.0, 0.86, 0.68), 40.0)
    # Сүүлийнх нь солирын толгой хүрэх цэгийн (12.6, 10.8, -7.9) ЯГ АРД —
    # ар гэрэл. Толгой камерт бэхлэгдсэн тул кадрт дээш "авчрах" боломжгүй
    # (камертай хамт эргэнэ); харин цаанаас туссан гэрэл түүний ирмэгийг
    # гэрэлтүүлж хар хавтангаас салгана.
    for i, (x, z) in enumerate(((-6.0, -6.0), (8.0, 3.0), (22.0, -5.0), (36.0, 2.5),
                                (13.0, -7.2))):
        w, h = hull_wh(x)
        y = w * (max(0.0, 1.0 - abs(z / h) ** 3.4)) ** (1.0 / 3.4)
        ld = bpy.data.lights.new("HullLight_%d" % i, "POINT")
        ld.energy = 1500.0
        ld.shadow_soft_size = 0.25
        ld.color = (1.0, 0.86, 0.68)
        lo = bpy.data.objects.new("HullLight_%d" % i, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = (x, y + 1.3, z)
        parts.append(lo)
        parts.append(box("HullLamp_%d" % i, (x, y + 0.35, z), (0.9, 0.5, 0.35), lamp))

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
    return hit + u * CFG["dist0"], hit + u * CFG["end"], u, -u


def basis(fwd):
    """Камерын суурь: урагш, баруун, дээш (roll=0, дэлхийн Z дээш)."""
    f = Vector(fwd).normalized()
    r = f.cross(Vector((0.0, 0.0, 1.0)))
    if r.length < 1e-6:
        r = Vector((1.0, 0.0, 0.0))
    r.normalize()
    return f, r, r.cross(f)


def sky_dirs(fwd):
    """Од, гариг, бүслүүрийн хавтгайн нормаль — гэрэл, гариг, тэнгэр
    гурвуулаа ЭНЭ функцээс авна, тэгэхгүй бол бие биенээсээ зөрнө."""
    f, r, u = basis(fwd)
    star = (f - r * SUN_SCREEN[0] + u * SUN_SCREEN[1]).normalized()
    P = CFG["planet"]
    planet = (f + r * P["screen"][0] + u * P["screen"][1]).normalized()
    q = (f + r * P["band_to"][0] + u * P["band_to"][1]).normalized()
    return star, planet, planet.cross(q).normalized()


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
def build_field(P0, Pe, fwd, secs=30.0, belt_n=None):
    """Дэвсгэрийн чулуунууд + замын дагуу ЗОРИУД байрлуулсан өнгөрөгчид.

    Сансарт хурдыг мэдрүүлдэг зүйл нь алсын объект биш, ойрын объектын
    параллакс. Тиймээс 6 чулууг тодорхой секундэд, тодорхой зайд
    өнгөрөхөөр нь байрлуулав — санамсаргүй биш, хэмнэлтэй.
    """
    rock = mat("ROCK", (0.052, 0.049, 0.044), 0.93, 0.0)
    f, e1, e2 = basis(fwd)
    rng = random.Random(CFG["seed"] + 7)
    out = []

    # Шотын уртаас хамаарсан ЗАЙН ЗАСВАР. Зам ижил боловч 8 секундэд
    # хурд 172 м/с, 30 секундэд 46 м/с — 3.7 дахин зөрүүтэй. 34 м-ийн
    # зайд өнгөрөх чулуу 30 сек дээр 78°/сек буюу сайхан шуурна, харин
    # 8 сек дээр 293°/сек болж 4 фреймд шувт өнгөрөөд алдаа мэт болно.
    # Зайг хурдны язгуураар (sqrt) томруулж өнцгийн хурдыг барина —
    # шугаман засвар хэтэрхий холдуулж чулууг үл үзэгдэх болгоно.
    k = math.sqrt(30.0 / max(1.0, secs))
    # (замын хувь 0..1, хажуугийн зай м, өнцөг°, радиус м)
    passes = [(0.15,  95.0,  35.0, 14.0), (0.31,  58.0, 200.0,  9.0),
              (0.46, 150.0, 115.0, 26.0), (0.62,  44.0, 300.0,  7.5),
              (0.76, 105.0,  55.0, 19.0), (0.88,  34.0, 240.0,  6.0)]
    if abs(k - 1.0) > 0.01:
        print("[1st Studio] Шот %.0f сек -> өнгөрөгч чулуунуудыг %.2f дахин "
              "холдуулав (өнцгийн хурдыг барихын тулд)" % (secs, k))
    for i, (t, m, ang, r) in enumerate(passes):
        m, r = m * k, r * (k ** 0.6)
        c = P0 + (Pe - P0) * t
        a = math.radians(ang)
        pos = c + (e1 * math.cos(a) + e2 * math.sin(a)) * m
        out.append(build_rock("Pass_%d" % i, pos, r, CFG["seed"] + 40 + i, rock,
                              3 if r < 12 else 4))

    ship = Vector((0.0, 0.0, 0.0))

    def hides_ship(pos, r):
        """Замын аль нэг цэгээс харахад чулуу хөлгийн ӨМНӨ, хөлгийн өнцгийн
        хүрээнд байна уу. Хөлөг 240 м — 56.6° налуугаас ~200 м өргөн."""
        for t in (0.0, 0.35, 0.7, 1.0):
            C = P0 + (Pe - P0) * t
            to_s, to_r = ship - C, pos - C
            if to_r.length >= to_s.length - r:
                continue                      # хөлгийн ард — зүгээр
            ang = to_s.angle(to_r)
            if ang < math.atan(130.0 / to_s.length) + math.asin(min(1.0, r / to_r.length)):
                return True
        return False

    def place(i):
        """Дэвсгэрийн нэг чулууны байрлал ба радиус."""
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
        if belt_n is not None:
            # Бүслүүр бол хавтгай давхарга. Хавтгайгаас хэлбийлтийг 65%
            # багасгана — чулуунууд тэнгэрийн зурвастай нэг чиглэлд эгнэнэ.
            mid = P0 + (Pe - P0) * 0.5
            pos = pos - belt_n * ((pos - mid).dot(belt_n) * 0.65)
        return pos, r

    # Дэвсгэр: хөлгийн эргэн тойронд бөөгнөрөл + замын дагуу тархалт
    moved = 0
    for i in range(52):
        pos, r = place(i)
        for _ in range(40):
            if not hides_ship(pos, r * 1.3):
                break
            moved += 1
            pos, r = place(i)
        out.append(build_rock("Rock_%02d" % i, pos, r, CFG["seed"] + 200 + i,
                              rock, 3 if r < 26 else 4, 3))
    if moved:
        print("[1st Studio] Хөлгийг халхалж байсан %d байрлалыг дахин сонгов" % moved)
    return rock, out


# ══════════════════════════════════════════════════════════════════════
#  Гэрэл, ертөнц
# ══════════════════════════════════════════════════════════════════════
def build_light(P0, fwd):
    """Нар ба харагдах од. Од нь кадрын зүүн дээд буланд (лавлагаа зурагтай ижил)."""
    f, r, u = basis(fwd)
    star = sky_dirs(fwd)[0]

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
    # Од бол зөвхөн ХАРАГДАХ дүрс — гэрлийг SUN өгнө. Бөмбөрцөг камераас
    # 62 км-т, гариг 150 км-т тул гаригаас харахад "од" КАМЕРЫН талд
    # байрлаж, шөнийн талыг урдаас нь гэрэлтүүлж хавирган сарыг устгадаг
    # байв (хэмжсэн: шөнийн талын гэрлийн тал хувь нь үүнээс). Бусад
    # объектын туяа түүнийг "харахгүй" болгосноор гэрлийн эх үүсвэр биш
    # болно; камерт харагдсаар байна.
    o.visible_diffuse = False
    o.visible_glossy = False
    o.visible_transmission = False
    o.visible_volume_scatter = False
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


def build_world(star=None, belt_n=None):
    """Хар тэнгэр + процедурын од + бүслүүрийн тоосон зурвас.

    Voronoi-гийн зай нь цэг бүрт 0 болдог тул нарийн ramp од болгоно.
    World shader-т TexCoord "Generated" нь туяаны ЧИГЛЭЛ (камерын
    байрлалаас үл хамаарна) — 5.2.2 дээр +X/-X/+Y тийш харж шалгасан.
    """
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
    sky = add.outputs[2]
    if belt_n is not None:
        sky = belt_band(nt, tex, sky, belt_n, star)
    nt.links.new(sky, bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return w


def belt_band(nt, tex, sky, n, star):
    """Бүслүүрийн дотроос харахад цагираг нь тэнгэрийг бүтэн тойрсон
    ИХ ТОЙРОГ болж харагдана (Сүүн зам шиг). Туяа хавтгайтай хэр ойр вэ
    гэдгийг |чиглэл·n|-ээр хэмжиж Гауссын зурвас болгоно. Одны зүг рүү
    тоос урагшаа сарнидаг тул тэр хэсэг нь илүү гэрэлтэнэ."""
    def vm(op, a=None, b=None):
        nd = nt.nodes.new("ShaderNodeVectorMath")
        nd.operation = op
        if a is not None:
            nt.links.new(a, nd.inputs[0])
        if isinstance(b, (tuple, Vector)):
            nd.inputs[1].default_value = tuple(b)
        return nd

    def m(op, *args):
        """Math зангилаа. MULTIPLY_ADD нь гурван оролттой (a·b + c)."""
        nd = nt.nodes.new("ShaderNodeMath")
        nd.operation = op
        for i, a in enumerate(args):
            if isinstance(a, (int, float)):
                nd.inputs[i].default_value = a
            else:
                nt.links.new(a, nd.inputs[i])
        return nd.outputs[0]

    d = vm("NORMALIZE", tex.outputs["Generated"]).outputs[0]
    h = m("ABSOLUTE", vm("DOT_PRODUCT", d, n).outputs["Value"])
    core = m("EXPONENT", m("MULTIPLY", m("POWER", m("DIVIDE", h, 0.034), 2.0), -1.0))
    halo = m("EXPONENT", m("MULTIPLY", m("POWER", m("DIVIDE", h, 0.13), 2.0), -1.0))
    band = m("ADD", core, m("MULTIPLY", halo, 0.22))
    # бөөгнөрөл — тоос жигд биш
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 9.0
    nz.inputs["Detail"].default_value = 7.0
    nt.links.new(d, nz.inputs["Vector"])
    clump = m("MULTIPLY_ADD", nz.outputs["Fac"], 1.6, -0.35)
    band = m("MULTIPLY", band, m("MAXIMUM", clump, 0.0))
    # урагш сарнилт: одны зүгт 1 + 5·cos^8
    if star is not None:
        c = m("MAXIMUM", vm("DOT_PRODUCT", d, star).outputs["Value"], 0.0)
        band = m("MULTIPLY", band, m("MULTIPLY_ADD", m("POWER", c, 8.0), 5.0, 1.0))
    col = nt.nodes.new("ShaderNodeMix")
    col.data_type = "RGBA"
    col.blend_type = "MULTIPLY"
    col.inputs["Factor"].default_value = 1.0
    col.inputs[7].default_value = (0.034, 0.031, 0.027, 1.0)   # дулаан саарал тоос
    nt.links.new(band, col.inputs[6])
    add = nt.nodes.new("ShaderNodeMix")
    add.data_type = "RGBA"
    add.blend_type = "ADD"
    add.inputs["Factor"].default_value = 1.0
    nt.links.new(sky, add.inputs[6])
    nt.links.new(col.outputs[2], add.inputs[7])
    return add.outputs[2]


# ══════════════════════════════════════════════════════════════════════
#  Хийн аварга гариг
# ══════════════════════════════════════════════════════════════════════
def gas_giant_mat(star):
    """Өргөрөгийн зурвастай гариг. Шөнийн тал бүрэн хар биш — цагираг
    болон сарнуудын ойсон гэрэл бага зэрэг гэрэлтүүлдэг (≈1%)."""
    m = bpy.data.materials.new("GAS_GIANT")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 1.0
    b.inputs["Specular IOR Level"].default_value = 0.0
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    R = CFG["planet"]["dist"] * math.sin(math.radians(CFG["planet"]["radius_deg"]))
    mp.inputs["Scale"].default_value = (1.0 / R, 1.0 / R, 1.0 / R)
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type = "BANDS"
    wv.bands_direction = "Z"
    # Хийн аварга гаригийн зурвас өргөн, өргөргийн дагуу тэгш — зөвхөн
    # ирмэгээрээ эргүүлэгтэй. Distortion 5.5 дээр модны хээ мэт болдог байв.
    wv.inputs["Scale"].default_value = 3.2
    wv.inputs["Distortion"].default_value = 1.6
    wv.inputs["Detail"].default_value = 2.5
    wv.inputs["Detail Scale"].default_value = 1.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    stops = [(0.00, (0.62, 0.52, 0.40)), (0.20, (0.82, 0.74, 0.58)),
             (0.42, (0.50, 0.40, 0.31)), (0.60, (0.76, 0.71, 0.62)),
             (0.80, (0.44, 0.49, 0.55)), (1.00, (0.70, 0.63, 0.50))]
    cr.elements[0].position, cr.elements[0].color = stops[0][0], (*stops[0][1], 1)
    cr.elements[1].position, cr.elements[1].color = stops[-1][0], (*stops[-1][1], 1)
    for pos, c in stops[1:-1]:
        e = cr.elements.new(pos)
        e.color = (*c, 1)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], wv.inputs["Vector"])
    nt.links.new(wv.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Emission Color"])
    b.inputs["Emission Strength"].default_value = 0.012        # шөнийн тал
    return m


def atmo_mat(star):
    """Агаар мандлын гэрэлт хүрээ — зөвхөн ГЭРЭЛТСЭН ирмэг дээр."""
    m = bpy.data.materials.new("GAS_GIANT_ATMO")
    m.use_nodes = True
    nt = m.node_tree
    out = next(x for x in nt.nodes if x.bl_idname == "ShaderNodeOutputMaterial")
    for nm in [x.name for x in nt.nodes if x is not out and
               x.bl_idname != "ShaderNodeOutputMaterial"]:
        nt.nodes.remove(nt.nodes[nm])
    out = next(x for x in nt.nodes if x.bl_idname == "ShaderNodeOutputMaterial")
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    rim = nt.nodes.new("ShaderNodeMath")
    rim.operation = "POWER"
    rim.inputs[1].default_value = 3.0
    dot = nt.nodes.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = tuple(star)
    lit = nt.nodes.new("ShaderNodeMapRange")
    lit.inputs[1].default_value = -0.25       # терминатораас цааш бага зэрэг
    lit.inputs[2].default_value = 0.55
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    k = nt.nodes.new("ShaderNodeMath")
    k.operation = "MULTIPLY"
    k.inputs[1].default_value = 2.2
    emi = nt.nodes.new("ShaderNodeEmission")
    emi.inputs["Color"].default_value = (0.74, 0.83, 1.0, 1.0)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(lw.outputs["Facing"], rim.inputs[0])
    nt.links.new(geo.outputs["Normal"], dot.inputs[0])
    nt.links.new(dot.outputs["Value"], lit.inputs[0])
    nt.links.new(rim.outputs[0], mul.inputs[0])
    nt.links.new(lit.outputs[0], mul.inputs[1])
    nt.links.new(mul.outputs[0], k.inputs[0])
    nt.links.new(k.outputs[0], emi.inputs["Strength"])
    nt.links.new(tr.outputs[0], add.inputs[0])
    nt.links.new(emi.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs["Surface"])
    return m


def build_sky_objects(anchor, star_dir, planet_dir, belt_n, with_planet=True):
    """Од ба гаригийг камерын БАЙРЛАЛЫГ дагадаг SKY хоосон объектод
    холбоно — эргэлтийг биш. Ингэснээр тэд хязгааргүй алсад байгаа мэт:
    камер эргэхэд кадар дотор шилжинэ, харин явахад параллакс үүсэхгүй.
    150 км-т байрлуулсан ч 1340 м явахад 0.5° шилжих байсан."""
    sky = bpy.data.objects.new("SKY", None)
    bpy.context.collection.objects.link(sky)
    if anchor.type == "EMPTY" or anchor.animation_data:
        c = sky.constraints.new("COPY_LOCATION")
        c.target = anchor
    else:
        sky.location = anchor.location
    star = bpy.data.objects.get("STAR")
    if star is not None:
        star.parent = sky
        star.location = star_dir * 62000.0
    if not with_planet:
        return sky, None
    P = CFG["planet"]
    R = P["dist"] * math.sin(math.radians(P["radius_deg"]))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80,
                                         radius=R, location=(0, 0, 0))
    g = bpy.context.object
    g.name = "GAS_GIANT"
    g.data.materials.append(gas_giant_mat(star_dir))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80,
                                         radius=R * 1.014, location=(0, 0, 0))
    a = bpy.context.object
    a.name = "GAS_GIANT_ATMO"
    a.data.materials.append(atmo_mat(star_dir))
    a.visible_shadow = False
    # Зөвхөн КАМЕРТ харагдана. Эс бөгөөс гэрэлтсэн ирмэг нь гэрлийн эх
    # үүсвэр болж гаригийг ДОТРООС нь гэрэлтүүлдэг: гадаргуугаас гарсан туяа
    # бүрхүүлийн дотор талыг цохиход Cycles нормалийг туяа руу эргүүлдэг тул
    # "гэрэлтсэн тал" маск урвуу болж шөнийн тал дээр асдаг байв
    # (хэмжсэн: шөнийн талын гэрлийн 84% үүнээс).
    a.visible_diffuse = False
    a.visible_glossy = False
    a.visible_transmission = False
    a.visible_volume_scatter = False
    for o in (g, a):
        for poly in o.data.polygons:
            poly.use_smooth = True
        o.parent = sky
        o.location = planet_dir * P["dist"]
        # Тэнхлэг = бүслүүрийн нормаль: цагираг экваторын хавтгайд оршдог
        o.rotation_euler = Vector((0.0, 0.0, 1.0)).rotation_difference(belt_n).to_euler()
    # Дүүргэгч гэрлүүд нь хөлгийн сүүдэр талд зориулсан кино заль. 5%
    # альбедотой хөлөг дээр бараг мэдэгдэхгүй ч 60% альбедотой гариг дээр
    # 12–16 дахин тод тусаж, ШӨНИЙН ТАЛЫГ бүтэн гэрэлтүүлээд хавирган
    # сарыг устгадаг байв. Light linking-ээр гаригийг зөвхөн НАР гэрэлтүүлнэ.
    nofill = bpy.data.collections.new("NO_FILL")
    for o in (g, a):
        nofill.objects.link(o)
    for co in nofill.collection_objects:
        co.light_linking.link_state = "EXCLUDE"
    for nm in ("FILL", "FILL_LOW"):
        lo = bpy.data.objects.get(nm)
        if lo is not None:
            lo.light_linking.receiver_collection = nofill
    return sky, g


# ══════════════════════════════════════════════════════════════════════
#  Рендер, компоновк
# ══════════════════════════════════════════════════════════════════════
def pick_device():
    """GPU-г Blender-ийн тохиргоонд АСААНА (OptiX / CUDA / HIP / Metal / oneAPI).

    Файлд cycles.device = "GPU" гэж бичих нь хангалтгүй: Preferences ->
    System -> Cycles Render Devices нь "None" байвал Blender чимээгүй CPU
    руу шилждэг. Шинэ суулгасан Blender дээр анхдагч нь "None".
    deel.py, cockpit.py-тэй ижил логик.
    """
    want = CFG["device"].upper()
    if want == "CPU":
        return "CPU"
    addon = bpy.context.preferences.addons.get("cycles")
    if addon:
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
                    print("[1st Studio] GPU:", kind, "—",
                          ", ".join(d.name for d in found))
                    return "GPU"
            except Exception:                                    # noqa: BLE001
                continue
    if want == "GPU":
        # Тулгасан бол GPU гэж ТЭМДЭГЛЭНЭ — cloud-д GPU байхгүй ч .blend-ийг
        # таны компьютер дээр нээхэд GPU-гаар рендерлэх ёстой.
        print("[1st Studio] GPU энд олдсонгүй — файлд GPU гэж тэмдэглэв.")
        return "GPU"
    return "CPU"


def setup_render(res=(1920, 1080), samples=96):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = pick_device()
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
        fog.inputs["Threshold"].default_value = 2.5     # гариг дээр цэнхэр манан тараахгүй
        fog.inputs["Strength"].default_value = 0.35
        fog.inputs["Size"].default_value = 0.70

        st = ng.nodes.new("CompositorNodeGlare")
        st.location = (110, -30)
        st.inputs["Type"].default_value = "Streaks"
        st.inputs["Quality"].default_value = "High"
        # Зөвхөн ОД цацарна. 6.0 дээр хөдөлгүүрийн цөм (гэрэлтэлт 48) ч
        # давж, 20–28 сек-д лазер мэт урт цэнхэр туяа үүсгэн хүлээлтийн
        # хамгийн чухал хэсэгт хөлгөөс анхаарал сарниулдаг байв.
        st.inputs["Threshold"].default_value = 60.0     # од ~9000 — ганцаараа давна
        st.inputs["Strength"].default_value = 0.40
        # 2 салаа, 0° = хэвтээ анаморф цацраг — лавлагаа зураг дээрх одтой
        # ижил. 4 салаа нь загалмай үүсгэж CG мэт харагддаг байв.
        st.inputs["Streaks"].default_value = 2
        st.inputs["Streaks Angle"].default_value = 0.0
        st.inputs["Fade"].default_value = 0.95
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
          % (CFG["dist0"], CFG["end"], v, v * 3.6))
    if CFG["end"] > CFG["contact"]:
        R_end = CFG["end"]
        left = (R_end - CFG["contact"]) / v
        print("   ТАСАЛНА: мөргөлт хүртэл %.3f сек (%.1f фрейм) үлдэнэ — кадрын гадна"
              % (left, left * 24.0))
        print("   сүүлийн 3 сек-д хөлөг %.2f дахин томорно" % ((R_end + 3 * v) / R_end))
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
    CFG["end"] = float(opt("--end", CFG["end"]))
    CFG["roll"] = float(opt("--roll", CFG["roll"]))
    CFG["exposure"] = float(opt("--exposure", CFG["exposure"]))
    angle = opt("--angle", "pov")
    lens = float(opt("--lens")) if "--lens" in argv else None

    frames = int(opt("--frames", 720))

    clear()
    P0, Pe, u, fwd = path()
    star_dir, planet_dir, belt_n = sky_dirs(fwd)
    build_ship()
    if "--no-field" not in argv:
        build_field(P0, Pe, fwd, frames / 24.0, belt_n)
    build_light(P0, fwd)
    build_world(star_dir, belt_n)

    res = opt("--res", "960x540")
    setup_render(tuple(int(v) for v in res.split("x")),
                 int(opt("--samples", 64)))
    if "--no-glare" not in argv:
        setup_glare()
    cam, met = build_camera(angle, lens)
    build_sky_objects(met if met is not None else cam, star_dir, planet_dir,
                      belt_n, "--no-planet" not in argv)

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
