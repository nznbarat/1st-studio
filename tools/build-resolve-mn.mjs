/**
 * resolve-mn — ганц файлын хувилбар угсрагч.
 *
 * css/*.css ба js/**.js файлуудыг HTML дотор шингээж, интернэт,
 * сервер шаардахгүй, давхар товшиход нээгддэг бие даасан файл гаргана.
 *
 * Ажиллуулах:  node tools/build-resolve-mn.mjs
 * Гаралт:      resolve-mn/resolve-toli.html    (толь)
 *              resolve-mn/resolve-dotor.html   (интерфейсийн загвар)
 *              resolve-mn/resolve-fusion-zaavar.html (Fusion хэрэгслийн заавар)
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = join(root, "resolve-mn");

/* Ганц файлын нэрс — хоорондоо холбогдоно */
const OUT = { "index.html": "resolve-toli.html", "interface.html": "resolve-dotor.html",
              "fusion-zaavar.html": "resolve-fusion-zaavar.html" };

function build(srcName) {
  let html = readFileSync(join(base, srcName), "utf8");
  let css = 0, js = 0, bytes = 0;

  /* Дотоод CSS шингээх (Google Fonts-ийн холбоос өөр дараалалтай тул хөндөгдөхгүй) */
  html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, href) => {
    const body = readFileSync(join(base, href), "utf8");
    css++; bytes += Buffer.byteLength(body);
    return "<style>\n/* ── " + href + " ── */\n" + body + "\n</style>";
  });

  /* JS шингээх */
  html = html.replace(/<script src="([^"]+)"><\/script>\n?/g, (m, src) => {
    const body = readFileSync(join(base, src), "utf8");
    js++; bytes += Buffer.byteLength(body);
    return "<script>\n/* ── " + src + " ── */\n" + body + "\n</script>\n";
  });

  /* Хуудас хоорондын холбоосыг ганц файлын нэр рүү чиглүүлэх.
     HTML дэх href, мөн шингэсэн JS доторх холбоос үүсгэгчийг хоёуланг нь хамарна.
     (Хашилтын ард байгаа нэрийг л солино — бичвэр дэх дурдлага хэвээр.) */
  for (const [from, to] of Object.entries(OUT)) {
    /* Зөвхөн холбоосын утга (хашилтын ард) солигдоно — гарын авлагын бичвэр
       дэх "index.html" гэх мэт ердийн дурдлагыг хөндөхгүй. */
    html = html.replace(new RegExp('(?<=["\'])' + from.replace(".", "\\."), "g"), to);
  }

  /* Репогийн бүтэцтэй уялдсан холбоос бие даасан файлд утгагүй — хасна */
  html = html.replace(
    /\s*<a class="backlink" href="\.\.\/world-builder\/"[\s\S]*?<\/a>/,
    ""
  );

  html = html.replace("<title>",
    "<!-- ГАНЦ ФАЙЛЫН ХУВИЛБАР — tools/build-resolve-mn.mjs-ээр үүссэн. Гараар бүү зас.\n" +
    "     Эх код: resolve-mn/ хавтас. -->\n<title>");

  const outPath = join(base, OUT[srcName]);
  writeFileSync(outPath, html, "utf8");
  const kb = (statSync(outPath).size / 1024).toFixed(0);
  console.log(`✓ resolve-mn/${OUT[srcName]}  ·  ${css} CSS + ${js} JS шингээв  ·  ${kb} KB`);
  return html;
}

for (const src of Object.keys(OUT)) build(src);
console.log("\nЭдгээр файлыг хаана ч хуулж, давхар товшиход нээгдэнэ. Интернэт шаардахгүй.");
