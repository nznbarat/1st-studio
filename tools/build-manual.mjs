#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   manual.js доторх агуулгаас ГАРЫН-АВЛАГА.md файлыг үүсгэнэ.
   Ингэснээр програм доторх тусламж ба репо доторх бичиг баримт хоёр
   ҮРГЭЛЖ ижил байна (нэг эх сурвалж).

   Ажиллуулах:  node tools/build-manual.mjs     (эсвэл npm run manual)
   ══════════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'manual.js'), 'utf8');

/* manual.js-ийг JS болгон уншина (DOM-гүй тул зөвхөн MANUAL хэсгийг таслан авна) */
const start = src.indexOf('const MANUAL = [');
const end = src.indexOf('\n];', start);
if (start < 0 || end < 0) {
  console.error('manual.js дотроос MANUAL массивыг олсонгүй');
  process.exit(1);
}
const body = src.slice(start, end + 3).replace(/^const MANUAL = /, '');
// eslint-disable-next-line no-new-func
const MANUAL = new Function('return ' + body.replace(/;\s*$/, ''))();

/* [[G]] → `G`,  бусад нь аль хэдийн markdown */
const conv = t => t.replace(/\[\[(.+?)\]\]/g, '`$1`').replace(/^!\s/gm, '> ⚠️ ');

const today = new Date().toISOString().slice(0, 10);
let out = `# 1st Studio — Camera Director · Гарын авлага

> Энэ файлыг **гараар засахгүй**. Агуулга нь \`manual.js\` дотор байдаг
> (програм дотор \`F1\` товчоор нээгддэг гарын авлага). Дахин үүсгэх:
> \`npm run manual\`. Үүсгэсэн: ${today}

Blender 5.2-ийн дүр төрхтэй, монгол хэл дээрх 3D камер найруулагч ба
AI видео промт үүсгэгч. Суулгац шаардахгүй — \`camera.html\` файлыг хөтчөөр
нээхэд шууд ажиллана.

---

## Агуулга

`;

let grp = '';
MANUAL.forEach(s => {
  if (s.grp !== grp) { grp = s.grp; out += `\n**${grp}**\n\n`; }
  const anchor = s.t.toLowerCase().replace(/[^\wа-яөүёa-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  out += `- [${s.ico} ${s.t}](#${anchor})\n`;
});

out += '\n---\n';
MANUAL.forEach(s => {
  out += `\n## ${s.ico} ${s.t}\n`;
  const md = s.md.replace(/^\n/, '')
    .replace(/^### /gm, '#### ')     /* h3 → h4 */
    .replace(/^## (?!#)/gm, '### '); /* h2 → h3 (бүлгийн гарчиг h2 болсон тул) */
  out += conv(md);
  out += '\n---\n';
});

out += `
*Энэ бичиг баримт \`manual.js\`-ээс автоматаар үүссэн — 1st Studio, Camera Director.*
`;

writeFileSync(join(root, 'ГАРЫН-АВЛАГА.md'), out, 'utf8');
console.log('✓ ГАРЫН-АВЛАГА.md үүслээ —', MANUAL.length, 'бүлэг,', out.split('\n').length, 'мөр');
