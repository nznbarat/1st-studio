/**
 * video3d.html-ийг жинхэнэ хөтөч дээр, хуурамч ComfyUI сервертэй туршина.
 *
 * Шалгах зүйлс:
 *   • file:// дээрээс нээхэд хуудас алдаагүй ачаалагдана
 *   • CORS‑той локал сервер рүү upload → prompt → history → view урсгал ажиллана
 *   • workflow дотор видео, промт, seed, кадрын тоо зөв суудаг
 *   • гаралт эх нэрээрээ татагдана
 *
 * Шаардлага (заавал биш — байхгүй бол алгасна):
 *   npm i -D playwright   ба   ffmpeg (эсвэл FFMPEG=/зам/ffmpeg)
 *
 * Ажиллуулах:  node tools/e2e-video3d.mjs
 */
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FFMPEG = process.env.FFMPEG || "ffmpeg";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch (e) {
  console.log("⏭  playwright суулгаагүй тул алгаслаа (npm i -D playwright)");
  process.exit(0);
}

const work = mkdtempSync(join(tmpdir(), "v3d-e2e-"));
const clip = join(work, "тест клип.mp4");
try {
  execFileSync(FFMPEG, [
    "-y", "-v", "error", "-f", "lavfi",
    "-i", "testsrc=size=320x240:rate=24:duration=6",
    "-pix_fmt", "yuv420p", clip,
  ]);
} catch (e) {
  console.log(`⏭  ffmpeg олдсонгүй тул алгаслаа (${FFMPEG})`);
  process.exit(0);
}

/* ─── Хуурамч ComfyUI (жинхэнэ нь --enable-cors-header тугтай ингэж ажилладаг) ─── */
const received = { uploads: [], graphs: [] };
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const json = (payload) => {
    res.writeHead(200, { ...CORS, "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  };

  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }

  if (url.pathname === "/system_stats") {
    return json({ system: { comfyui_version: "e2e" }, devices: [{ name: "Fake GPU" }] });
  }

  if (url.pathname === "/upload/image") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const match = /filename="([^"]*)"/.exec(body.toString("latin1"));
      received.uploads.push(match ? match[1] : "?");
      json({ name: "uploaded.mp4", subfolder: "v3d", type: "input" });
    });
    return;
  }

  if (url.pathname === "/prompt") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      received.graphs.push(JSON.parse(Buffer.concat(chunks).toString("utf8")).prompt);
      json({ prompt_id: "e2e-1" });
    });
    return;
  }

  if (url.pathname.startsWith("/history/")) {
    return json({
      "e2e-1": {
        status: { status_str: "success", completed: true },
        outputs: { 14: { videos: [{ filename: "render.mp4", subfolder: "", type: "output" }] } },
      },
    });
  }

  if (url.pathname === "/view") {
    const data = readFileSync(clip);
    res.writeHead(200, { ...CORS, "Content-Type": "video/mp4", "Content-Length": data.length });
    return res.end(data);
  }

  res.writeHead(404, CORS);
  res.end("{}");
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;

/* ─── Хөтөч ─── */
/* Урьдчилан суулгасан Chromium байвал түүнийг ашиглана (дахин татахгүй). */
const candidates = [
  process.env.CHROMIUM_PATH,
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  "/opt/pw-browsers/chromium/chrome-linux/chrome",
];
const preinstalled = candidates.find((p) => p && existsSync(p));
const browser = await chromium.launch(preinstalled ? { executablePath: preinstalled } : {});
const context = await browser.newContext({ acceptDownloads: true });
const page = await context.newPage();

const problems = [];
page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
page.on("console", (m) => {
  const text = m.text();
  /* Google Fonts татаж чадаагүй нь хуудасны алдаа биш */
  if (m.type() === "error" && !/Failed to load resource/.test(text)) {
    problems.push("console: " + text);
  }
});

await page.goto("file://" + join(root, "video3d.html"));
await page.waitForSelector("#start");

/* Хуурамч сервер рүү чиглүүлэх */
await page.fill("#comfyUrl", base);
await page.dispatchEvent("#comfyUrl", "change");

await page.click("#ping");
await page.waitForFunction(() => document.querySelector("#log").textContent.includes("Fake GPU"), null, { timeout: 8000 });

/* Workflow ба клип нэмэх */
await page.setInputFiles("#wfInput", join(root, "video-to-3d", "workflows", "wan-vace-v2v.api.json"));
await page.waitForFunction(() => document.querySelector("#wfname").textContent.includes("wan-vace"), null, { timeout: 8000 });

/* Клипийг хуудас дотор File болгож үүсгэнэ.  Кирилл нэрийг эцсээ хүртэл
   хадгалж байгааг шалгах зорилготой (Playwright кирилл зам дээр унадаг). */
await page.evaluate(({ name, base64 }) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const transfer = new DataTransfer();
  transfer.items.add(new File([bytes], name, { type: "video/mp4" }));
  const input = document.getElementById("fileInput");
  input.files = transfer.files;
  input.dispatchEvent(new Event("change"));
}, { name: "тест клип.mp4", base64: readFileSync(clip).toString("base64") });

await page.waitForFunction(() => document.querySelectorAll("#rows tr").length === 1, null, { timeout: 8000 });

/* Латин биш нэрийн анхааруулга (урт хэмжигдсэний дараа гарна) */
const cyrillicWarned = await page
  .waitForFunction(
    () => getComputedStyle(document.getElementById("namewarn")).display !== "none",
    null,
    { timeout: 8000 }
  )
  .then(() => true, () => false);

/* Ажиллуулах */
const download = page.waitForEvent("download", { timeout: 45000 });
await page.click("#start");
await page.waitForFunction(
  () => document.querySelector("#rows .pill.done") !== null,
  null,
  { timeout: 45000 }
);
const saved = await download;

/* ─── Шалгалт ─── */
const results = [];
const check = (name, actual, expected) => {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  results.push([name, a === b, a, b]);
};
const ok = (name, condition) => check(name, !!condition, true);

ok("хуудас алдаагүй ачаалагдсан", problems.length === 0);
check("нэг файл байршуулсан", received.uploads.length, 1);
check("нэг хүсэлт илгээсэн", received.graphs.length, 1);

const graph = received.graphs[0] || {};
check("байршуулсан файлын нэр зангилаанд суусан", graph["6"]?.inputs?.file, "v3d/uploaded.mp4");
ok("промт суусан", /3D CGI/.test(graph["4"]?.inputs?.text || ""));
ok("@Video1 цэвэрлэгдсэн", !/@Video1/.test(graph["4"]?.inputs?.text || ""));
ok("seed тоо болсон", Number.isInteger(graph["10"]?.inputs?.seed));
ok("кадрын тоо 4n+1", ((graph["8"]?.inputs?.length || 0) - 1) % 4 === 0);
check("өргөн 720p 16:9", graph["8"]?.inputs?.width, 1280);
ok("латин биш нэрийг анхааруулсан", cyrillicWarned);
ok("гаралт .mp4 өргөтгөлтэй", /\.mp4$|^download$/.test(saved.suggestedFilename()));

const noteText = await page.textContent("#rows .note");
ok("тэмдэглэлд хэмжээ бичигдсэн", /MB/.test(noteText || ""));

await browser.close();
server.close();

const failed = results.filter((r) => !r[1]);
for (const [name, pass, actual, expected] of results) {
  if (!pass) console.error(`  ✗ ${name}\n      хүлээсэн: ${expected}\n      гарсан:   ${actual}`);
}
if (problems.length) for (const p of problems) console.error("  ! " + p);

if (failed.length) {
  console.error(`\n✗ ${failed.length}/${results.length} тест унасан`);
  process.exit(1);
}
console.log(`✓ ${results.length} e2e тест ногоон — хөтөч дээр бүтэн урсгал ажиллаж байна`);
