#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   Ангиллын JSON файлуудаас  toli-data.js  файлыг угсарна.

   Ажиллуулах:
     node tools/build-toli.mjs [эх хавтас]     (эсвэл npm run toli)

   Эх хавтас дотор <ангилал>.json файлууд байна:
     { "cat": "cam-move", "entries": [ { id, mn, en, ... }, ... ] }
   ══════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] || join(root, 'toli-src');

/* Ангиллын дараалал, монгол нэр, дүрс */
const CATS = [
  { id: 'blender-basics', mn: 'Blender-ийн үндэс', ico: '🧊' },
  { id: 'blender-cmd', mn: 'Blender команд ба товчлуур', ico: '⌨' },
  { id: 'cam-move', mn: 'Камерын хөдөлгөөн', ico: '🎥' },
  { id: 'shot', mn: 'Кадр, өнцөг, найруулга', ico: '🖼' },
  { id: 'lens', mn: 'Линз, фокус, экспозиц', ico: '🔭' },
  { id: 'light', mn: 'Гэрэлтүүлэг', ico: '💡' },
  { id: 'anim', mn: 'Анимаци ба түлхүүр кадр', ico: '◆' },
  { id: 'render', mn: 'Рендер ба гаралт', ico: '🖨' },
  { id: 'ai', mn: 'AI видео ба промт', ico: '✨' },
  { id: 'studio', mn: '1st Studio нэр томъёо', ico: '🎬' },
];

const FIELDS = ['id', 'mn', 'en', 'alt', 'blender', 'keys', 'short', 'deep', 'use', 'ex', 'warn', 'studio', 'rel'];
const clean = v => (typeof v === 'string' ? v.replace(/\s+$/gm, '').trim() : v);

if (!existsSync(src)) {
  console.error('Эх хавтас олдсонгүй:', src);
  process.exit(1);
}

const entries = [];
const seen = new Map();
const warn = [];
let files = 0;

for (const c of CATS) {
  const f = join(src, c.id + '.json');
  if (!existsSync(f)) { warn.push('дутуу файл: ' + c.id + '.json'); continue; }
  let data;
  try { data = JSON.parse(readFileSync(f, 'utf8')); }
  catch (e) { warn.push(c.id + '.json — JSON алдаатай: ' + e.message); continue; }
  files++;
  const list = Array.isArray(data) ? data : (data.entries || []);
  for (const raw of list) {
    if (!raw || !raw.id || !raw.mn) { warn.push(c.id + ' — id/mn дутуу бичлэг алгасав'); continue; }
    const e = { cat: c.id };
    for (const k of FIELDS) {
      const v = clean(raw[k]);
      if (k === 'rel') e.rel = Array.isArray(raw.rel) ? raw.rel.filter(x => typeof x === 'string') : [];
      else if (typeof v === 'string' && v.length) e[k] = v;
    }
    e.id = String(e.id).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!e.id) { warn.push(c.id + ' — id хоосон болов'); continue; }
    if (seen.has(e.id)) {
      const old = seen.get(e.id);
      warn.push('давхардсан id: ' + e.id + ' (' + old.cat + ' ба ' + c.id + ') — сүүлийнхийг нь дугаарлав');
      let n = 2; while (seen.has(e.id + '-' + n)) n++;
      e.id = e.id + '-' + n;
    }
    if (!e.deep) warn.push(e.id + ' — гүнзгий тайлбар (deep) дутуу');
    if (!e.short) warn.push(e.id + ' — товч тодорхойлолт (short) дутуу');
    seen.set(e.id, e);
    entries.push(e);
  }
}

/* rel доторх байхгүй id-уудыг хасна */
let relFixed = 0;
for (const e of entries) {
  const before = e.rel.length;
  e.rel = e.rel.filter(id => seen.has(id) && id !== e.id);
  relFixed += before - e.rel.length;
}

const used = new Set(entries.map(e => e.cat));
const cats = CATS.filter(c => used.has(c.id));

const out = '/* ══════════════════════════════════════════════════════════════\n' +
  '   1st Studio — Толь (нэр томъёоны лавлах)\n' +
  '   АВТОМАТААР ҮҮССЭН ФАЙЛ — гараар засахгүй.\n' +
  '   Эх сурвалж: toli-src/*.json   ·   Дахин үүсгэх: npm run toli\n' +
  '   Бичлэг: ' + entries.length + ' · Ангилал: ' + cats.length + '\n' +
  '   ══════════════════════════════════════════════════════════════ */\n' +
  'const TOLI = ' + JSON.stringify({ cats, entries }, null, 1) + ';\n';

writeFileSync(join(root, 'toli-data.js'), out, 'utf8');

console.log('✓ toli-data.js үүслээ —', entries.length, 'бичлэг,', cats.length, 'ангилал,', files, 'файлаас');
console.log('  хэмжээ:', (out.length / 1024).toFixed(0) + ' KB · холбоосын засвар:', relFixed);
const byCat = {};
entries.forEach(e => { byCat[e.cat] = (byCat[e.cat] || 0) + 1; });
cats.forEach(c => console.log('   ' + c.ico + ' ' + c.mn.padEnd(30) + (byCat[c.id] || 0)));
if (warn.length) {
  console.log('\n⚠ Анхаарах (' + warn.length + '):');
  warn.slice(0, 25).forEach(w => console.log('   · ' + w));
  if (warn.length > 25) console.log('   … бас ' + (warn.length - 25));
}
