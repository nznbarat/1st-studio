/**
 * Ганц файлын хувилбар угсрагч.
 *
 * world-builder/index.html доторх бүх <link rel=stylesheet> ба <script src>
 * файлыг мөрөнд нь шингээж, интернэтгүйгээр давхар товшиход нээгддэг
 * ганц HTML файл гаргана.
 *
 * Ажиллуулах:  node tools/build-single.mjs
 * Гаралт:      world-builder/ertunts-buteegch.html
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "world-builder");
const outFile = join(base, "ertunts-buteegch.html");

let html = readFileSync(join(base, "index.html"), "utf8");

/* CSS шингээх */
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => {
  const css = readFileSync(join(base, href), "utf8");
  return "<style>\n" + css + "\n</style>";
});

/* JS шингээх */
let scriptCount = 0;
html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (m, src) => {
  const js = readFileSync(join(base, src), "utf8");
  scriptCount++;
  return "<script>\n/* ── " + src + " ── */\n" + js + "\n</script>\n";
});

/* Ганц файлаар ажиллах үед сервер прокси байхгүй тул шалгалтыг алгасна */
html = html.replace(
  "<title>",
  "<!-- ГАНЦ ФАЙЛЫН ХУВИЛБАР — tools/build-single.mjs‑ээр үүссэн. Гараар бүү зас. -->\n<title>"
);
html = html.replace(
  "</body>",
  '<script>window.WB && (WB.api.state.proxyPath = "");</script>\n</body>'
);

writeFileSync(outFile, html, "utf8");
const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(0);
console.log(`✓ ${outFile}`);
console.log(`  ${scriptCount} script + CSS шингээлээ · ${kb} KB`);
