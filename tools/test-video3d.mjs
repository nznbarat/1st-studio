/**
 * video3d.js-ийн цэвэр логикийг шалгана (хөтөч, сүлжээ шаардахгүй).
 *
 * Гол зорилго: хөтчийн хувилбар нь Python дахь v2v3d‑тэй **ижил** үр дүн
 * гаргаж байгааг батлах — workflow задлан шинжлэлт, кадрын тоо, хэмжээ,
 * промтын боловсруулалт.
 *
 * Ажиллуулах:  node tools/test-video3d.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ─── video3d.js‑ийг DOM‑гүйгээр ачаалах ─── */
const listeners = [];
const sandbox = {
  console,
  crypto: { randomUUID: () => "test-client" },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = String(v); },
  },
  document: {
    addEventListener: (type, fn) => listeners.push([type, fn]),
    getElementById: () => null,
    createElement: () => ({ style: {}, appendChild() {}, remove() {} }),
  },
  location: { protocol: "file:" },
  setTimeout,
  URL: { createObjectURL: () => "", revokeObjectURL() {} },
};

const source =
  readFileSync(join(root, "video3d-styles.js"), "utf8") +
  "\n" +
  readFileSync(join(root, "video3d.js"), "utf8") +
  `
globalThis.__api = {
  V3D_STYLES, resolveTargets, applyValues, framesFor, sizeFor,
  ensureVideoReference, stripVideoReference, sortedNodes, isLink,
};
`;
runInNewContext(source, sandbox, { filename: "video3d.js" });
const api = sandbox.__api;

/* ─── Жижигхэн тест бүтэц ─── */
let passed = 0;
const failures = [];
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a === b) passed++;
  else failures.push(`${name}\n    хүлээсэн: ${b}\n    гарсан:   ${a}`);
}
function ok(name, condition) {
  check(name, !!condition, true);
}

/* ─── 1. Загварууд ─── */
check("10 загвар ачаалагдсан", api.V3D_STYLES.length, 10);
ok("загвар бүр @Video1 агуулна",
  api.V3D_STYLES.every((s) => /@Video1/.test(s.prompt)));

/* ─── 2. Промтын боловсруулалт (Python‑ийн styles.py‑тай ижил) ─── */
check("лавлагаагүй промтод @Video1 нэмнэ",
  api.ensureVideoReference("make it clay"), "@Video1 — make it clay");
check("байгаа лавлагааг давхардуулахгүй",
  api.ensureVideoReference("Use @Video1 as motion"), "Use @Video1 as motion");
check("локал загварт лавлагааг цэвэрлэнэ",
  api.stripVideoReference("@Video1 — make it clay"), "make it clay");
ok("дунд орсон лавлагааг үгээр солино",
  api.stripVideoReference(api.V3D_STYLES[4].prompt).includes("the source video"));
ok("цэвэрлэсний дараа @Video1 үлдэхгүй",
  !/@Video1/.test(api.stripVideoReference(api.V3D_STYLES[0].prompt)));

/* ─── 3. Кадрын тоо (Wan‑д 4n+1) ─── */
check("5с × 16fps → 81 кадр", api.framesFor(5, 16), 81);
check("5.2с × 16fps → 85 кадр", api.framesFor(5.2, 16), 85);
check("1с × 16fps → 17 кадр", api.framesFor(1, 16), 17);
check("10с × 24fps → 241 кадр", api.framesFor(10, 24), 241);
ok("үргэлж 4n+1 хэлбэртэй",
  [1, 2.5, 5, 8.3, 12, 30].every((s) => (api.framesFor(s, 16) - 1) % 4 === 0));

/* ─── 4. Хэмжээ (16‑д хуваагдана) ─── */
check("720p 16:9", api.sizeFor("720p", "16:9"), [1280, 720]);
check("480p 9:16", api.sizeFor("480p", "9:16"), [480, 848]);
ok("бүх хослол 16‑д хуваагдана",
  ["480p", "720p", "1080p"].every((r) =>
    ["16:9", "9:16", "1:1", "4:3", "21:9"].every((a) => {
      const [w, h] = api.sizeFor(r, a);
      return w % 16 === 0 && h % 16 === 0;
    })));

/* ─── 5. Workflow задлан шинжлэлт (Python‑ийн comfy_workflow.py‑тай ижил) ─── */
const workflow = JSON.parse(
  readFileSync(join(root, "video-to-3d", "workflows", "wan-vace-v2v.api.json"), "utf8")
);
const targets = api.resolveTargets(workflow);
const addr = (name) => (targets[name] ? `${targets[name].nodeId}.${targets[name].input}` : null);

check("видео оруулах цэг", addr("video"), "6.file");
check("промтын цэг", addr("prompt"), "4.text");
check("negative промтын цэг", addr("negative"), "5.text");
check("seed‑ийн цэг", addr("seed"), "10.seed");
check("кадрын тооны цэг", addr("frames"), "8.length");
check("өргөний цэг", addr("width"), "8.width");
check("өндрийн цэг", addr("height"), "8.height");
check("fps‑ийн цэг", addr("fps"), "13.fps");
check("strength‑ийн цэг", addr("strength"), "8.strength");

const applied = api.applyValues(
  workflow,
  { video: "v3d/a.mp4", prompt: "P", negative: "N", seed: 42, frames: 81, width: 1280, height: 720 },
  targets
);
check("видео зөв зангилаанд суусан", applied["6"].inputs.file, "v3d/a.mp4");
check("промт зөв зангилаанд суусан", applied["4"].inputs.text, "P");
check("negative зөв зангилаанд суусан", applied["5"].inputs.text, "N");
check("seed зөв зангилаанд суусан", applied["10"].inputs.seed, 42);
check("кадрын тоо зөв зангилаанд суусан", applied["8"].inputs.length, 81);
check("эх workflow хэвээрээ", workflow["6"].inputs.file, "input.mp4");

check("хоосон утга алгасагдана",
  api.applyValues(workflow, { video: "", prompt: "P" }, targets)["6"].inputs.file, "input.mp4");

/* ─── 6. Туслах функцууд ─── */
ok("холбоосыг таньдаг", api.isLink(["6", 0]) && !api.isLink([1, 2]) && !api.isLink("x"));
check("зангилаа дугаараар эрэмбэлэгдэнэ",
  api.sortedNodes({ "10": { class_type: "B" }, "2": { class_type: "A" } }).map((e) => e[0]),
  ["2", "10"]);

/* ─── Дүн ─── */
if (failures.length) {
  console.error(`\n✗ ${failures.length} тест унасан:\n`);
  for (const f of failures) console.error("  " + f + "\n");
  process.exit(1);
}
console.log(`✓ ${passed} тест ногоон — хөтчийн логик Python хувилбартай таарч байна`);
