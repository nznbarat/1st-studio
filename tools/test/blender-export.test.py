# -*- coding: utf-8 -*-
"""Үүссэн Blender скриптийг хуурамч bpy дээр ЖИНХЭНЭЭР ажиллуулж шалгана."""
import sys, os, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.environ.get("TPLOUT") or tempfile.mkdtemp(prefix="1st-py-")
os.environ["TPLOUT"] = SP
sys.path.insert(0, os.path.join(HERE, "fakebpy"))
import bpy

GEN = os.path.join(HERE, "pygen.cjs")
subprocess.run(["node", GEN], check=True, env=dict(os.environ))
SRC = open(os.path.join(SP, "sample-export.py"), encoding="utf-8").read()

def run(src=None, action=None):
    s = src if src is not None else SRC
    if action:
        s = s.replace('ACTION     = "BUILD"', 'ACTION     = "%s"' % action, 1)
    g = {"__name__": "shot"}
    exec(compile(s, "shot.py", "exec"), g)
    return g

fails = []
def ok(cond, msg):
    print(("  ✓ " if cond else "  ✗ ") + msg)
    if not cond: fails.append(msg)

# ── 1. Цэвэр ажиллалт ────────────────────────────────────────────────
print("1. Цэвэр .blend дээр ажиллуулах")
sc = bpy.reset()
run()
cams = [o for o in bpy.data.objects if o.data.__class__.__name__ == "Camera"]
ok(len(cams) == 1, "нэг камер үүссэн")
ok(sc.camera is cams[0], "идэвхтэй камер болсон")
ok(sc.render.fps == 24 and sc.frame_end == 120, "fps/фреймийн муж тохирсон")
ok(sc.render.resolution_x == 1920 and sc.render.resolution_y == 1080, "нягтрал тохирсон")
refs = [o for o in bpy.data.objects if o.get("1st_role") in ("subject", "prop")]
ok(len(refs) == 2 and all(o.hide_render for o in refs), "лавлах хэлбэр рендерт гарахгүй")
ok(all(o.get("1st_studio") for o in bpy.data.objects), "бүх объект тэмдэгтэй")
cam = cams[0]
ok(cam.rotation_mode == "QUATERNION", "камер квартернион горимд")
ok(cam.animation_data and len(cam.animation_data.action.fcurves) == 7, "байрлал 3 + эргэлт 4 = 7 муруй")
ok(all(kp.interpolation == "BEZIER" for fc in cam.animation_data.action.fcurves for kp in fc.keyframe_points), "интерполяц тохирсон")
ok(len(bpy.WM.popups) == 1, "хэрэглэгчид мэдэгдсэн")
ok(("undo_push", "1st Studio — камер үүсгэв") in bpy.ops_log, "Ctrl+Z-ийн алхам үүссэн")

# ── 2. Хэрэглэгчийн ижил нэртэй объектод хүрэхгүй ────────────────────
print("2. Хэрэглэгчийн «ShotCam», «CAM_TARGET», «1stStudio_Layout»-д хүрэхгүй")
sc = bpy.reset()
mine = bpy.data.objects.new("ShotCam", bpy.data.cameras.new("ShotCam"))
sc.collection.objects.link(mine)
tgt = bpy.data.objects.new("CAM_TARGET", None); sc.collection.objects.link(tgt)
col = bpy.data.collections.new("1stStudio_Layout"); sc.collection.children.link(col)
prec = bpy.data.objects.new("МинийҮнэтэйЗагвар", bpy.data.meshes.new("m")); col.objects.link(prec)
run()
ok(mine in bpy.data.objects, "хэрэглэгчийн ShotCam амьд")
ok(tgt in bpy.data.objects, "хэрэглэгчийн CAM_TARGET амьд")
ok(prec in bpy.data.objects, "хэрэглэгчийн загвар амьд")
ok(prec.get("1st_studio") is None, "хэрэглэгчийн объект тэмдэглэгдээгүй")
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "cam"]) == 1, "манай камер тусдаа үүссэн")

# ── 3. Дахин дахин ажиллуулах — холбосон загвар салахгүй ─────────────
print("3. Гурван удаа дараалан ажиллуулах")
sc = bpy.reset()
sc.render.fps = 30; sc.frame_end = 77; sc.render.resolution_x = 1280
run()
empty = [o for o in bpy.data.objects if o.get("1st_role") == "model"]
ok(len(empty) == 0, "энэ жишээнд загвар алга")
rd = ("    (\"myhero_01\", \"model\", 0.0, 0.0, 0.0, 0.0, 0.09, 20.0, 12.0, 18.0),")
import json
subprocess.run(["node", "-e",
  "const{render}=require(process.env.GEN);require('fs').writeFileSync(require('path').join(process.env.TPLOUT,'with-model.py'),render({rdata:" + json.dumps(rd) + "}))"],
  check=True, env=dict(os.environ, GEN=GEN))
WITH = open(os.path.join(SP, "with-model.py"), encoding="utf-8").read()
sc = bpy.reset()
sc.render.fps = 30; sc.frame_end = 77; sc.render.resolution_x = 1280
run(WITH)
em = [o for o in bpy.data.objects if o.get("1st_role") == "model"]
ok(len(em) == 1, "загварын Empty үүссэн")
ok(abs(em[0].scale[0] - 0.09) < 1e-9, "автомат тааруулалт Empty дээр буусан")
hero = bpy.data.objects.new("МинийЖинхэнэЗагвар", bpy.data.meshes.new("hero"))
sc.collection.objects.link(hero); hero.parent = em[0]
for i in range(2):
    run(WITH)
em2 = [o for o in bpy.data.objects if o.get("1st_role") == "model"]
ok(len(em2) == 1, "дахин ажиллуулахад Empty олшроогүй")
ok(em2[0] is em[0], "яг тэр Empty хэвээр")
ok(hero.parent is em[0], "Ctrl+P-ийн холбоос САЛААГҮЙ")
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "cam"]) == 1, "камер олшроогүй")
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "subject"]) == 1, "дүр олшроогүй")
ok(len([c for c in bpy.data.collections if c.get("1st_studio")]) == 1, "цуглуулга олшроогүй")
live = [a for a in bpy.data.actions]
ok(len(live) == 3, "яг 3 амьд анимаци, өнчин үлдээгүй (%d)" % len(live))
ok(all(a.users > 0 for a in live), "амьд анимаци санамсаргүй устгагдаагүй")
bk = sc.get("1st_studio_backup")
ok(bk is not None and bk["fps"] == 30 and bk["frame_end"] == 77 and bk["res_x"] == 1280,
   "ХАМГИЙН АНХНЫ тохиргоо хадгалагдсан")

# ── 4. Бүгдийг буцаах ────────────────────────────────────────────────
print("4. ACTION = REMOVE — бүгдийг буцаах")
run(WITH, action="REMOVE")
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "манай объект бүгд арилсан")
ok(hero in bpy.data.objects, "хэрэглэгчийн загвар АМЬД")
ok(hero.parent is None, "загвар эцгээсээ салсан")
ok(sc.render.fps == 30 and sc.frame_end == 77 and sc.render.resolution_x == 1280, "хуучин тохиргоо сэргэсэн")
ok(sc.get("1st_studio_backup") is None, "нөөц устсан")
ok(len([c for c in bpy.data.collections if c.get("1st_studio")]) == 0, "цуглуулга арилсан")
ok(len([t for t in bpy.data.texts if t.get("1st_studio")]) == 0, "текст блок арилсан")

# ── 5. Edit горимд байхад ────────────────────────────────────────────
print("5. Edit горимд ажиллуулах")
sc = bpy.reset()
ob = bpy.data.objects.new("Cube", bpy.data.meshes.new("Cube")); sc.collection.objects.link(ob)
ob.mode = "EDIT"; bpy.context.view_layer.objects.active = ob
run()
ok(ob.mode == "OBJECT", "Object горим руу гаргасан")
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "cam"]) == 1, "камер зүгээр үүссэн")
ok(len(ob.data.verts) == 0, "хэрэглэгчийн тор хөндөгдөөгүй")

# ── 6. Кадр байхгүй ба хуучин Blender ────────────────────────────────
print("6. Ирмэгийн тохиолдол")
sc = bpy.reset()
subprocess.run(["node", "-e",
  "const{render}=require(process.env.GEN);require('fs').writeFileSync(require('path').join(process.env.TPLOUT,'empty.py'),render({kdata:'',pdata:'',rdata:'',promptTxt:''}))"],
  check=True, env=dict(os.environ, GEN=GEN))
run(open(os.path.join(SP, "empty.py"), encoding="utf-8").read())
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "хоосон кадртай бол юу ч үүсгэхгүй")
ok(bpy.WM.popups and "кадр" in " ".join(bpy.WM.popups[-1][1]), "шалтгааныг хэлсэн")
sc = bpy.reset(); old = bpy.app.version; bpy.App.version = (2, 93, 0)
run()
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "хуучин Blender дээр эелдэг татгалзсан")
bpy.App.version = old

print()
print(("БҮГД ТЭНЦЛЭЭ ✅" if not fails else "УНАСАН: %d ❌" % len(fails)))
for f in fails: print("   -", f)
sys.exit(1 if fails else 0)
