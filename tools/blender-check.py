"""
Blender экспортын шалгалт — 2-р алхам: үүсгэсэн .py файлуудыг ЖИНХЭНЭ Blender дотор
ажиллуулж, камер бай руугаа харж байгааг Blender-ийн өөрийн математикаар шалгана.

    node tools/blender-check.mjs                                  # 1-р алхам
    blender -b -P tools/blender-check.py -- .blender-check        # 2-р алхам

`pip install bpy` хийсэн бол Blender-гүйгээр ч ажиллана:
    python3 tools/blender-check.py .blender-check
"""
import json
import math
import os
import runpy
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

EPS_ANGLE = 1e-4      # градус
EPS_MM = 1e-3
EPS_UV = 1e-5


def fcurves(id_data):
    """Blender 4.4+ slotted actions болон хуучин хувилбар хоёуланг дэмжинэ."""
    ad = getattr(id_data, "animation_data", None)
    if not ad or not ad.action:
        return []
    act = ad.action
    try:
        if hasattr(act, "layers") and len(act.layers):
            cb = act.layers[0].strips[0].channelbag(ad.action_slot)
            if cb:
                return list(cb.fcurves)
    except Exception:
        pass
    try:
        return list(act.fcurves)
    except Exception:
        return []


def roll_deg(matrix):
    """Камерын өөрийн +Z тэнхлэгээр хэмжсэн roll (хөтөч дэх утгатай ижил конвенц)."""
    rot = matrix.to_3x3()
    fwd = (rot @ Vector((0, 0, -1))).normalized()
    up = (rot @ Vector((0, 1, 0))).normalized()
    world_up = Vector((0, 0, 1))
    if abs(fwd.dot(world_up)) > 0.9999:          # яг дээрээс/доороос харж байвал roll утгагүй
        return 0.0
    ref = (world_up - world_up.dot(fwd) * fwd).normalized()
    return math.degrees(math.atan2(ref.cross(up).dot(-fwd), ref.dot(up)))


def run_case(folder, case):
    fails = []

    def need(ok, msg):
        if not ok:
            fails.append(msg)

    bpy.ops.wm.read_homefile(use_empty=True)
    runpy.run_path(os.path.join(folder, case["file"]), run_name="__main__")

    scene = bpy.context.scene
    cam = bpy.data.objects.get("ShotCam")
    target = bpy.data.objects.get("CAM_TARGET")
    cam_data = bpy.data.cameras.get("ShotCam")
    need(cam and target and cam_data, "ShotCam / CAM_TARGET үүсээгүй")
    if fails:
        return fails

    need(scene.camera is cam, "идэвхтэй камер ShotCam болоогүй")
    need(scene.render.fps == case["fps"], f"fps {scene.render.fps} ≠ {case['fps']}")
    need(scene.frame_start == case["frame_start"] and scene.frame_end == case["frame_end"],
         f"фреймийн муж {scene.frame_start}-{scene.frame_end} ≠ {case['frame_start']}-{case['frame_end']}")
    res = [scene.render.resolution_x, scene.render.resolution_y]
    need(res == case["res"], f"нягтрал {res} ≠ {case['res']}")
    need(cam_data.sensor_fit == "VERTICAL" and abs(cam_data.sensor_height - 24.0) < EPS_MM,
         "сенсор VERTICAL / 24mm биш — линз хөтөчтэй таарахгүй")

    depsgraph = bpy.context.evaluated_depsgraph_get()
    for k in case["keys"]:
        scene.frame_set(k["frame"])
        depsgraph.update()
        cam_eval = cam.evaluated_get(depsgraph)
        tgt_world = target.evaluated_get(depsgraph).matrix_world.translation

        want = Vector(k["target"])
        need((tgt_world - want).length < 1e-4,
             f"[{k['frame']}] бай {tuple(round(v, 3) for v in tgt_world)} ≠ {tuple(round(v, 3) for v in want)}")

        uv = world_to_camera_view(scene, cam_eval, tgt_world)
        need(abs(uv.x - .5) < EPS_UV and abs(uv.y - .5) < EPS_UV,
             f"[{k['frame']}] камер бай руугаа харахгүй байна — кадрын байрлал "
             f"({uv.x:.5f}, {uv.y:.5f}), төв нь (0.5, 0.5)")
        need(abs(uv.z - k["distance"]) < 1e-3,
             f"[{k['frame']}] бай хүртэлх зай {uv.z:.3f}м ≠ {k['distance']}м")

        lens = cam_data.evaluated_get(depsgraph).lens
        need(abs(lens - k["lens"]) < EPS_MM, f"[{k['frame']}] линз {lens:.3f}mm ≠ {k['lens']:.3f}mm")

        got_roll = roll_deg(cam_eval.matrix_world)
        need(abs(got_roll - k["roll_deg"]) < 1e-3,
             f"[{k['frame']}] roll {got_roll:.3f}° ≠ {k['roll_deg']:.3f}°")

    for holder, label in ((cam, "камер"), (cam_data, "линз")):
        modes = {kp.interpolation for fc in fcurves(holder) for kp in fc.keyframe_points}
        need(modes == {case["interpolation"]},
             f"{label}ын интерполяц {modes or 'тавигдаагүй'} ≠ {{'{case['interpolation']}'}}")

    layout = bpy.data.collections.get("1stStudio_Layout")
    names = sorted(o.name for o in layout.objects) if layout else []
    want_names = sorted(case["subjects"] + case["props"])
    need(names == want_names, f"тайзны объектууд {names} ≠ {want_names}")

    text = bpy.data.texts.get("1stStudio_Prompt")
    need(text is not None and text.as_string().rstrip("\n") == case["prompt"].rstrip("\n"),
         "промтын текст блок эх бичвэртэйгээ таарахгүй")

    return fails


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    folder = args[0] if args else ".blender-check"
    manifest = os.path.join(folder, "expected.json")
    if not os.path.exists(manifest):
        sys.exit(f"{manifest} алга. Эхлээд: node tools/blender-check.mjs --out {folder}")

    cases = json.load(open(manifest, encoding="utf-8"))
    print(f"Blender {bpy.app.version_string} | {len(cases)} тест | {folder}\n")

    bad = 0
    for case in cases:
        try:
            fails = run_case(folder, case)
        except Exception as exc:                      # ачаалахгүй .py ч бас унал
            fails = [f"{type(exc).__name__}: {exc}"]
        if fails:
            bad += 1
            print(f"  ✘ {case['id']}")
            for f in fails:
                print(f"      {f}")
        else:
            print(f"  ✔ {case['id']}")

    print(f"\n{len(cases) - bad}/{len(cases)} тест давлаа.")
    sys.exit(1 if bad else 0)


main()
