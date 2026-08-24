/* ═══════════════════════════════════════════════════════════
   resolve-mn толины шалгалт
   Ажиллуулах: node tools/check-resolve-mn.mjs
   ═══════════════════════════════════════════════════════════ */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dictDir = join(root, "resolve-mn/js/dict");

/* ── Хуурамч орчин үүсгэж толийг ачаална ── */
const RM = {
  norm: (s) => String(s == null ? "" : s).toLowerCase().replace(/ё/g, "е").trim()
};
globalThis.window = { RM };
globalThis.RM = RM;

const engine = readFileSync(join(root, "resolve-mn/js/10-dict.js"), "utf8");
new Function("window", "RM", engine)(globalThis.window, RM);

const files = readdirSync(dictDir).filter((f) => f.endsWith(".js")).sort();
for (const f of files) {
  const src = readFileSync(join(dictDir, f), "utf8");
  new Function("RM", src)(RM);
}

const guideSrc = readFileSync(join(root, "resolve-mn/js/20-guide.js"), "utf8");
new Function("window", "RM", guideSrc)(globalThis.window, RM);

const D = RM.dict;
/* Монгол нэр нь зориудаар латинаар үлддэг нэрс (товчлолын задаргаа) */
const LATIN_OK = new Set([
  "BRAW", "OTIO", "H.265 (HEVC)", "23.976 fps"
]);

let problems = 0;
const warn = (msg) => { problems++; console.log("  ⚠ " + msg); };

console.log("═══ resolve-mn толины шалгалт ═══\n");

console.log("Нэр томьёо : " + D.size());
console.log("Ангилал    : " + D.cats.length);
console.log("Файл       : " + files.length);
console.log("Товчлуур   : " + D.rows.filter((r) => r.key).length);
console.log("Байрлалтай : " + D.rows.filter((r) => r.loc).length);
console.log("Ажлын урсгал: " + RM.guides.length +
            " (" + RM.guides.reduce((a, g) => a + g.steps.length, 0) + " алхам)");

console.log("\n── Хуудас тус бүрээр ──");
for (const p of D.pages) {
  const n = D.pageCount(p.id);
  if (n) console.log("  " + p.label.padEnd(12) + String(n).padStart(4));
}

console.log("\n── Шалгалт ──");

/* 1 · Давхардсан англи нэр */
if (D.dupes.length) warn("Давхардсан англи нэр: " + D.dupes.join(", "));

/* 2 · Давхардсан монгол нэр */
const mnSeen = new Map();
for (const r of D.rows) {
  const k = RM.norm(r.mn);
  if (mnSeen.has(k)) warn('Монгол нэр давхардсан: "' + r.mn + '" — ' + mnSeen.get(k) + " ба " + r.en);
  else mnSeen.set(k, r.en);
}

/* 3 · Дутуу талбар */
for (const r of D.rows) {
  if (!r.desc) warn("Тайлбар дутуу: " + r.en);
  if (r.desc && r.desc.length < 15) warn("Тайлбар хэт богино: " + r.en);
  /* Стандарт, формат, брэндийн нэрийг зориудаар орчуулаагүй — эдгээр нь алдаа биш.
     Монгол нэр нь англитайгаа ижил, эсвэл товчлолын задаргаа бол зөвшөөрнө. */
  const latinOnly = !/[А-Яа-яЁёӨөҮү]/.test(r.mn);
  const intentional = RM.norm(r.mn) === RM.norm(r.en) || LATIN_OK.has(r.en);
  if (latinOnly && !intentional) {
    warn("Монгол нэр орчуулагдаагүй байж магадгүй: " + r.en + " → " + r.mn);
  }
}

/* 4 · Ангилал бүр хуудастай эсэх */
const pageIds = new Set(D.pages.map((p) => p.id));
for (const c of D.cats) {
  if (!pageIds.has(c.page)) warn("Ангилал танигдахгүй хуудсанд: " + c.label + " → " + c.page);
  if (!c.count) warn("Хоосон ангилал: " + c.label);
}

/* 5 · Товчлуурын хэлбэр */
const keyOk = /^[A-Za-z0-9↑↓←→]+$|^(Ctrl|Shift|Alt)(\+(Ctrl|Shift|Alt))*\+\S+$|^(Space|Backspace|Delete|Enter|Tab)$|^F\d{1,2}$|^Ctrl\+,$/;
for (const r of D.rows) {
  if (r.key && !keyOk.test(r.key)) warn('Товчлуурын хэлбэр эргэлзээтэй: "' + r.key + '" (' + r.en + ")");
}

/* 6 · HTML холбоос бүрэн эсэх */
const html = readFileSync(join(root, "resolve-mn/index.html"), "utf8");
for (const f of files) {
  if (!html.includes("js/dict/" + f)) warn("index.html-д холбогдоогүй файл: " + f);
}
const linked = [...html.matchAll(/js\/dict\/([\w.-]+\.js)/g)].map((m) => m[1]);
for (const l of linked) {
  if (!files.includes(l)) warn("index.html байхгүй файлыг холбож байна: " + l);
}

/* 7 · Хайлтын эрүүл мэнд */
const probes = ["ripple", "долгиолон", "node", "нод", "green screen", "ногоон дэлгэц",
                "рендер", "render", "өнгө", "color", "дуу", "audio", "товчлуур"];
for (const q of probes) {
  if (D.search(q, {}).total === 0) warn('Хайлт хоосон буцаж байна: "' + q + '"');
}

console.log(problems ? "\n" + problems + " асуудал олдлоо." : "\n✓ Асуудал олдсонгүй.");
process.exit(problems ? 1 : 0);
