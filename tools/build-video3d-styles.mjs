/**
 * Загварын промтуудыг Python хэрэгслээс хөтчийн хувилбар руу хуулна.
 *
 * Ганц эх сурвалж:  video-to-3d/v2v3d/styles.json
 * Гаралт:           video3d-styles.js  (file:// дээр fetch хийж болдоггүй тул)
 *
 * Ажиллуулах:  node tools/build-video3d-styles.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "video-to-3d", "v2v3d", "styles.json");
const target = join(root, "video3d-styles.js");

const { styles } = JSON.parse(readFileSync(source, "utf8"));

for (const style of styles) {
  if (!/@video1|\[video1\]/i.test(style.prompt)) {
    throw new Error(`'${style.id}' промтод @Video1 лавлагаа алга`);
  }
}

const body = styles
  .map(
    (s) =>
      "  " +
      JSON.stringify({ id: s.id, name: s.name, desc: s.desc, prompt: s.prompt })
  )
  .join(",\n");

writeFileSync(
  target,
  `/* ─────────────────────────────────────────────────────────────
   АВТОМАТААР ҮҮССЭН ФАЙЛ — гараар засахгүй.
   Эх сурвалж:  video-to-3d/v2v3d/styles.json
   Дахин үүсгэх: node tools/build-video3d-styles.mjs
   ───────────────────────────────────────────────────────────── */
'use strict';
const V3D_STYLES = [
${body}
];
`,
  "utf8"
);

console.log(`✓ ${styles.length} загвар → video3d-styles.js`);
