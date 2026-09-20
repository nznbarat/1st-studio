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

import re as _re
def run(src=None, action=None, **flags):
    s = src if src is not None else SRC
    if action:
        s2 = _re.sub(r'^ACTION\s*=\s*"BUILD"', 'ACTION = "%s"' % action, s, count=1, flags=_re.M)
        assert s2 != s, "ACTION мөрийг олсонгүй"
        s = s2
    for k, v in flags.items():
        s2 = _re.sub(r'^%s\s*=\s*\w+' % k, '%s = %r' % (k, v), s, count=1, flags=_re.M)
        assert s2 != s, k + " мөрийг олсонгүй"
        s = s2
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
ok(all(kp.interpolation == "LINEAR" for fc in cam.animation_data.action.fcurves for kp in fc.keyframe_points), "интерполяц тохирсон")
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
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "target"]) == 1, "манай бай тусдаа үүссэн")
ourcam = [o for o in bpy.data.objects if o.get("1st_role") == "cam"][0]
ok(sc.collection in ourcam.users_collection, "камер лавлах цуглуулга дотор БИШ — тайзны үндэст")

# ── 3. Дахин дахин ажиллуулах — холбосон загвар салахгүй ─────────────
print("3. Гурван удаа дараалан ажиллуулах")
sc = bpy.reset()
sc.render.fps = 30; sc.frame_end = 77; sc.render.resolution_x = 1280
run()
empty = [o for o in bpy.data.objects if o.get("1st_role") == "model"]
ok(len(empty) == 0, "энэ жишээнд загвар алга")
rd = ("    (\"uid-hero\", \"myhero_01\", \"model\", 0.0, 0.0, 0.0, 0.0, 0.09, 20.0, 12.0, 18.0),")
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


# ── 7. Хэрэглэгчийн болгосон хуулбарт хүрэхгүй ───────────────────────
print("7. Shift+D хуулбар, нэр сольсон объектод хүрэхгүй")
sc = bpy.reset()
run(WITH)
cam = [o for o in bpy.data.objects if o.get("1st_role") == "cam"][0]
copy = bpy.data.objects.new("ShotCam.001", bpy.data.cameras.new("c2"))
sc.collection.objects.link(copy)
copy["1st_studio"] = cam["1st_studio"]          # Shift+D тэмдгийг нь ч хуулна
copy["1st_role"] = "cam"
renamed = [o for o in bpy.data.objects if o.get("1st_role") == "subject"][0]
renamed.name = "МинийДүр"
run(WITH)
ok(copy in bpy.data.objects, "Shift+D хуулбар амьд үлдсэн")
ok(renamed in bpy.data.objects, "нэрийг нь сольсон объект амьд үлдсэн")
run(WITH, action="REMOVE")
ok(copy in bpy.data.objects, "REMOVE ч хуулбарт хүрээгүй")
ok(renamed in bpy.data.objects, "REMOVE ч нэр сольсонд хүрээгүй")

# ── 8. Хадгалаагүй файл ба нөөц хуулбар ─────────────────────────────
print("8. Хадгалаагүй файл дээр ажиллахгүй")
sc = bpy.reset()
bpy.data.is_saved = False
run()
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "юунд ч хүрээгүй")
ok(bpy.WM.popups and "ЗОГС" in " ".join(bpy.WM.popups[-1][1]), "яагаад зогссоноо хэлсэн")
sc = bpy.reset()
bpy.data.is_saved = False
run(SAFETY=False)
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) > 0, "SAFETY=False бол үргэлжилнэ")
sc = bpy.reset()
run()
ok(len(bpy.saved_copies) == 1 and "нөөц" in bpy.saved_copies[0], "нөөц хуулбар үүссэн")

# ── 9. Туршилтын горим ───────────────────────────────────────────────
print("9. DRY_RUN — юунд ч хүрэхгүй")
sc = bpy.reset()
run(DRY_RUN=True)
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "объект үүсээгүй")
ok(sc.render.fps == 24 and sc.get("1st_studio_backup") is None, "тохиргоо хөндөгдөөгүй")
ok(bpy.WM.popups and "DRY_RUN" in " ".join(bpy.WM.popups[-1][1]), "юу болох байсныг хэлсэн")

# ── 10. Буруу ACTION ─────────────────────────────────────────────────
print("10. Буруу ACTION")
sc = bpy.reset()
run(action="REMOOVE")
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "бичиглэлийн алдаанд юу ч хийгээгүй")
ok(bpy.WM.popups and "BUILD" in " ".join(bpy.WM.popups[-1][1]), "зөв утгыг зааж өгсөн")

# ── 11. «Бүгдийг арилгах» товч ───────────────────────────────────────
print("11. Арилгах товч бүртгэгдсэн")
sc = bpy.reset()
run()
ok(len(bpy.utils.registered) == 1, "оператор бүртгэгдсэн")
run()
ok(len(bpy.utils.registered) == 1, "дахин ажиллуулахад давхарлаагүй")
op = bpy.utils.registered[0]
ok(op.bl_idname == "wm.studio1_remove", "товчны нэр зөв")
op().execute(None)
ok(len([o for o in bpy.data.objects if o.get("1st_studio")]) == 0, "товч дарахад бүгд арилсан")

# ── 12. Хэрэглэгчийн тэмдэглэл, гараар зөөсөн загвар ────────────────
print("12. Хэрэглэгчийн тэмдэглэл ба гар байрлал")
sc = bpy.reset()
run(WITH)
txt = [t for t in bpy.data.texts if t.get("1st_studio")][0]
txt.write("\nМинийи тэмдэглэл: гэрлийг зүүн талаас")
run(WITH)
ok("Минийи тэмдэглэл" in txt.as_string(), "тэмдэглэл хадгалагдсан")
ok(txt.as_string().count("Минийи тэмдэглэл") == 1, "тэмдэглэл давхарлаагүй")
em = [o for o in bpy.data.objects if o.get("1st_role") == "model"][0]
em.location = (5.0, 5.0, 0.0)
run(WITH)
ok(abs(em.location[0] - 5.0) < 1e-6, "гараар зөөсөн загварыг дарж бичээгүй")
ok(bpy.WM.popups and "Гараар зөөсөн" in " ".join(bpy.WM.popups[-1][1]), "энэ тухай хэлсэн")
run(WITH, action="REMOVE")
ok(txt in bpy.data.texts, "тэмдэглэлтэй текстийг устгаагүй")

# ── 13. Хоёр тайз ────────────────────────────────────────────────────
print("13. Хоёр тайзтай файл")
sc = bpy.reset()
sc.render.fps = 30
run()
sc2 = bpy.data.scenes.new("Scene2")
sc2.render.fps = 60
other = bpy.data.objects.new("ӨөрТайзныКамер", bpy.data.cameras.new("c3"))
sc2.collection.objects.link(other)
sc2.camera = other
bpy.context.scene = sc2
run()
ok(other in bpy.data.objects, "нөгөө тайзны объектод хүрээгүй")
ok(len([o for o in sc.objects if o.get("1st_role") == "cam"]) == 1, "эхний тайзны камер бүтэн")
ok(len([o for o in sc2.objects if o.get("1st_role") == "cam"]) == 1, "хоёр дахь тайзанд ч камер үүссэн")
run(action="REMOVE")
ok(sc.render.fps == 30 and sc2.render.fps == 60, "хоёр тайзны тохиргоо хоёулаа сэргэсэн")
ok(sc2.camera is other, "хоёр дахь тайзны камер буцаж ирсэн")
bpy.context.scene = sc

# ── 14. Хэрэглэгчийн сонголт .blend дотор үлдэнэ ────────────────────
print("14. Сонголт .blend дотор хадгалагдана")
sc = bpy.reset()
run(MAKE_REFS=False)
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "subject"]) == 0, "лавлах хэлбэр үүсээгүй")
run()
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "subject"]) == 0, "шинэ файл ч сонголтыг дарж бичээгүй")
run(FORCE_OPTS=True)
ok(len([o for o in bpy.data.objects if o.get("1st_role") == "subject"]) == 1, "FORCE_OPTS үед дарж бичсэн")

print()
print(("БҮГД ТЭНЦЛЭЭ ✅" if not fails else "УНАСАН: %d ❌" % len(fails)))
for f in fails: print("   -", f)
sys.exit(1 if fails else 0)
