/**
 * Blender экспортын шалгалт — 1-р алхам: тест .py файлуудыг үүсгэнэ.
 *
 *   node tools/blender-check.mjs            → .blender-check/ дотор тест файлууд
 *   node tools/blender-check.mjs --out DIR
 *
 * app.js доторх ЖИНХЭНЭ экспортын кодыг (blenderKey / exportPY) тасдан авч
 * хөтөчгүйгээр ажиллуулна — өөр хуулбар байхгүй тул код өөрчлөгдвөл тест шууд мэдэрнэ.
 * Дараа нь 2-р алхам:  blender -b -P tools/blender-check.py -- .blender-check
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const THREE = require(join(root, "three.min.js"));
globalThis.THREE = THREE;

const outIdx = process.argv.indexOf("--out");
const outDir = outIdx > -1 ? process.argv[outIdx + 1] : join(root, ".blender-check");
mkdirSync(outDir, { recursive: true });

/* ── app.js-ээс хэрэгтэй хэсгүүдийг тасдаж авах ── */
const lines = readFileSync(join(root, "app.js"), "utf8").split("\n");
function cut(startRe, endRe, label) {
  const s = lines.findIndex(l => startRe.test(l));
  const e = lines.findIndex((l, i) => i > s && endRe.test(l));
  if (s < 0 || e < 0) throw new Error(`app.js дотроос "${label}" олдсонгүй — тестийг шинэчлэх хэрэгтэй`);
  return lines.slice(s, e).join("\n");
}
const code = [
  cut(/^function posOf\(s\)/, /^function applyCam/, "posOf"),
  cut(/^function applyCam\(cam, s, shake\)/, /^const cloneS/, "applyCam"),
  lines.find(l => l.startsWith("function lensMM")),
  cut(/Blender Python экспорт/, /22\. Toast/, "Blender экспорт"),
].join("\n");

/* ── Хөтчийн орчныг орлуулах хамгийн бага stub ── */
const shell = `
let fps = 24, fStart = 1, fEnd = 120, interp = 'smooth';
let keys = []; const people = [], props = [];
let ASPECT = 16 / 9, PROMPT = '', OUT = null;
function shotAspect() { return ASPECT; }
function toast(msg) { throw new Error('exportPY зогслоо: ' + msg); }
function stamp() { return 'check'; }
const $ = () => ({ value: '16:9', textContent: PROMPT });
function dl(name, data) { OUT = data; }
${code}
globalThis.__export = cfg => {
  ASPECT = cfg.aspect; fps = cfg.fps; fStart = cfg.fStart; fEnd = cfg.fEnd;
  interp = cfg.interp; keys = cfg.keys; PROMPT = cfg.prompt;
  people.length = 0; props.length = 0;
  cfg.people.forEach(p => people.push(p)); cfg.props.forEach(p => props.push(p));
  OUT = null; exportPY(); return OUT;
};`;
new Function(shell)();

/* ── Тест кейсүүд ── */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const key = (frame, theta, phi, radius, fov, roll, target) => ({ theta, phi, radius, fov, roll, target, frame });
const person = (x, z, ry, sc) => ({ position: V(x, 0, z), rotation: { y: ry }, scale: { x: sc } });
const prop = (kind, x, z, ry, sc) => ({ userData: { kind }, position: V(x, 0, z), rotation: { y: ry }, scale: { x: sc } });

const KEYS = [
  key(1,  0.0, Math.PI / 2.2, 6.0, 50,  0,     V(0, 1.2, 0)),
  key(48, 1.1, Math.PI / 2.6, 3.2, 35,  0.08,  V(0.5, 1.4, -1)),   // гурван тэнхлэгт эргэлт + roll
  key(96, 2.4, Math.PI / 3.0, 8.5, 85, -0.05,  V(-1, 1.0, 2)),
];
const PEOPLE = [person(0, 0, 0, 1), person(1.5, -2.2, 1.57, 1.05)];
const PROPS = [prop("car", -3, 1.2, 0.5, 1), prop("tree", 4, -4, 0, 2)];
const base = { aspect: 16 / 9, fps: 24, fStart: 1, fEnd: 96, interp: "smooth",
               keys: KEYS, people: PEOPLE, props: PROPS, prompt: "Шөнийн студи, dolly-in" };

const cases = [
  { id: "bezier",   cfg: base },
  { id: "linear",   cfg: { ...base, interp: "linear" } },
  { id: "const",    cfg: { ...base, interp: "const" } },
  { id: "vertical", cfg: { ...base, aspect: 9 / 16 } },
  { id: "empty",    cfg: { ...base, keys: [KEYS[0]], people: [], props: [] } },
  // промт нь хашилт, ар налуу зураас, мөр таслалт агуулсан хэцүү тохиолдол
  { id: "quotes",   cfg: { ...base, prompt: 'Камер: "dolly-in"\nЗам: C:\\render\\out\nТөгсгөл "' } },
];

const manifest = [];
for (const { id, cfg } of cases) {
  const py = globalThis.__export(cfg);
  if (!py) throw new Error(`[${id}] экспорт хоосон буцаалаа`);
  const file = `case-${id}.py`;
  writeFileSync(join(outDir, file), py, "utf8");
  const vertical = cfg.aspect < 1;
  manifest.push({
    id, file,
    fps: cfg.fps, frame_start: cfg.fStart, frame_end: cfg.fEnd,
    res: vertical ? [Math.round(1080 * cfg.aspect), 1080] : [1920, Math.round(1920 / cfg.aspect)],
    interpolation: { smooth: "BEZIER", linear: "LINEAR", const: "CONSTANT" }[cfg.interp],
    prompt: cfg.prompt,
    subjects: cfg.people.map((_, i) => `Subject_${String(i + 1).padStart(2, "0")}`),
    props: cfg.props.map((p, i) => `${p.userData.kind}_${String(i + 1).padStart(2, "0")}`),
    keys: cfg.keys.map(k => ({
      frame: k.frame,
      target: [k.target.x, -k.target.z, k.target.y],       // Blender (Z дээш) координат
      lens: 12 / Math.tan(k.fov * Math.PI / 360),
      roll_deg: (k.roll || 0) * 180 / Math.PI,
      distance: k.radius,
    })),
  });
  console.log(`  ✔ ${file.padEnd(18)} ${py.length} тэмдэгт`);
}
writeFileSync(join(outDir, "expected.json"), JSON.stringify(manifest, null, 2), "utf8");

console.log(`\n${cases.length} тест файл үүслээ: ${outDir}`);
console.log(`\nДараагийн алхам — Blender дээр шалгах:\n  blender -b -P tools/blender-check.py -- ${outDir}`);
