/**
 * Офлайн орчуулгын регресс тест.
 * Толь эсвэл морфологи засах бүрдээ ажиллуулна — өмнө нь ажиллаж байсан
 * орчуулга эвдэрсэн эсэхийг барина.
 *
 * Ажиллуулах:  node tools/check-translate.mjs
 *
 * Мөр бүр: [монгол, агуулах ёстой (regex), агуулж БОЛОХГҮЙ (regex|null)]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const js = join(dirname(fileURLToPath(import.meta.url)), "..", "world-builder", "js");
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
const load = (f) => vm.runInContext(readFileSync(f, "utf8"), ctx, { filename: f });
["00-core.js", "10-grammar.js", "20-dict.js"].forEach((f) => load(join(js, f)));
readdirSync(join(js, "dict")).filter((f) => f.endsWith(".js")).sort().forEach((f) => load(join(js, "dict", f)));
load(join(js, "40-translate.js"));

const CASES = [
  /* нөхцөл үйл үг ба материалын тэмдэг нэр */
  ["харан зогсоно", /look/, /black/],
  ["инээн", /laugh/, null],
  ["цасан тал", /snow/, null],
  ["модон ширээ", /wood/, null],
  ["чулуун хөшөө", /stone/, null],
  /* ь‑тэй үг, далд н, гийгүүлэгч */
  ["морины дэл", /horse/, null],
  ["хонины ноос", /sheep/, /bell/],
  ["толины өмнө", /mirror/, null],
  ["морьд давхина", /horses/, null],
  ["нүүрэнд", /face/, null],
  ["секундэд", /second/, null],
  ["хаврын эхэн сар", /first|begin/, /mother/],
  /* тоо ба нэгж */
  ["35мм линз", /35mm/, null],
  ["1-р кадр", /1st/, null],
  ["тоос шиг", /like dust/, null],
  ["хатааж байна", /drying/, /being/],
  /* тооны араас олон тоо */
  ["гурван эмэгтэй", /three women/, null],
  ["хоёр морьтон", /two horsemen/, /horsemans/],
  ["нийт 5 кадр", /5 shots/, null],
  ["5 секундын уусалт", /second/, /seconds/],
  ["хоёр ах дүү", /siblings/, /siblingses/],
  ["хоёр хэсэгтэй", /with/, /withs/],
  ["1 кадр", /1 shot/, /shots/],
  /* брэнд файлын хэллэг */
  ["хормой нь салхинд намирна", /hem/, /skirt of a robe/],
  ["анаморф хальсны нарийн ширхэг", /anamorphic.*grain/, /narrow/],
  ["тэнгэрийн дэвсгэрт", /backdrop/, /mat/],
  ["үлэмж том хүн", /immense/, /ulemj/],
];

let pass = 0;
const fails = [];
for (const [mn, want, bad] of CASES) {
  const en = ctx.WB.tr.offline(mn).en;
  const ok = want.test(en) && !(bad && bad.test(en));
  if (ok) pass++;
  else fails.push(`  ✗ ${mn}  →  «${en}»  (хүлээсэн ${want}${bad ? `, хориглосон ${bad}` : ""})`);
}
console.log(`Орчуулгын тест: ${pass}/${CASES.length} давлаа`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
