#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   tools/blender-template.py  →  app.js доторх BLENDER_TPL хувьсагч

   Яагаад ийм вэ:
   Програм нь file:// дээр ч ажилладаг тул гадны файл уншиж чадахгүй.
   Тиймээс Python загварыг app.js дотор мөр мөрөөр нь шингээнэ.
   Гэхдээ эх сурвалж нь жинхэнэ .py файл хэвээр үлдэнэ —
   python3 -m py_compile -ээр шалгаж, хүн уншиж болно.

   Ажиллуулах:  node tools/build-blender-py.mjs        (шинэчилнэ)
                node tools/build-blender-py.mjs --check (зөвхөн шалгана)
   ══════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TPL = join(ROOT, 'tools', 'blender-template.py');
const APP = join(ROOT, 'app.js');

const HEAD = '/* ══ BLENDER_TPL эхлэл — tools/blender-template.py-ээс автоматаар үүснэ ══';
const NOTE = '   ГАРААР БҮҮ ЗАСААРАЙ.  Засварлахдаа .py файлыг засаад:\n' +
  '   node tools/build-blender-py.mjs                                    ══ */';
const FOOT = '/* ══ BLENDER_TPL төгсгөл ══ */';

const REQUIRED = ['#@DATE', '#@FPS', '#@FRAME_START', '#@FRAME_END', '#@RES_X',
  '#@RES_Y', '#@INTERP', '#@KEYS', '#@SUBJECTS', '#@PROPS', '#@PROMPT'];

const py = readFileSync(TPL, 'utf8').replace(/\r\n/g, '\n').replace(/\s+$/, '');
const missing = REQUIRED.filter(t => !py.includes(t));
if (missing.length) {
  console.error('❌ Загварт дараах тэмдэг дутуу байна: ' + missing.join(', '));
  process.exit(1);
}

const block = HEAD + '\n' + NOTE + '\nconst BLENDER_TPL = [\n' +
  py.split('\n').map(l => JSON.stringify(l) + ',').join('\n') +
  "\n].join('\\n');\n" + FOOT;

const app = readFileSync(APP, 'utf8');
const a = app.indexOf(HEAD);
const b = app.indexOf(FOOT);
if (a < 0 || b < 0) {
  console.error('❌ app.js дотроос BLENDER_TPL хэсгийг олсонгүй.');
  process.exit(1);
}
const next = app.slice(0, a) + block + app.slice(b + FOOT.length);

if (process.argv.includes('--check')) {
  if (next !== app) {
    console.error('❌ app.js доторх BLENDER_TPL нь blender-template.py-тэй таарахгүй байна.\n' +
      '   Засах:  node tools/build-blender-py.mjs');
    process.exit(2);
  }
  console.log('✅ BLENDER_TPL таарч байна (' + py.split('\n').length + ' мөр)');
  process.exit(0);
}

writeFileSync(APP, next);
console.log('✅ BLENDER_TPL шинэчлэгдлээ — ' + py.split('\n').length + ' мөр, ' +
  (block.length / 1024).toFixed(1) + ' KB');
