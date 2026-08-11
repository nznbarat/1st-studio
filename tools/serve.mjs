/**
 * Хөгжүүлэлтийн энгийн статик сервер.
 *   node tools/serve.mjs            → http://localhost:8080/world-builder/
 *   PORT=3000 node tools/serve.mjs
 *
 * /api/claude руу ирсэн хүсэлтийг api/claude.js рүү дамжуулна, ингэснээр
 * ANTHROPIC_API_KEY тохируулсан үед локал дээр ч прокси горим ажиллана.
 */
import http from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 8080);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8"
};

let claudeHandler = null;
try {
  claudeHandler = (await import(pathToFileURL(join(root, "api", "claude.js")).href)).default;
} catch (e) {
  console.warn("api/claude.js ачаалагдсангүй:", e.message);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/api/claude" && claudeHandler) {
    res.status = (c) => ((res.statusCode = c), res);
    res.json = (o) => res.end(JSON.stringify(o));
    res.send = (t) => res.end(t);
    try {
      await claudeHandler(req, res);
    } catch (e) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: { message: e.message } }));
    }
    return;
  }

  if (pathname === "/") pathname = "/world-builder/index.html";
  const file = normalize(join(root, pathname));
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
    res.statusCode = 404;
    return res.end("404");
  }
  res.setHeader("Content-Type", MIME[extname(file)] || "application/octet-stream");
  res.end(readFileSync(file));
});

server.listen(port, () => {
  console.log(`→ http://localhost:${port}/world-builder/`);
  console.log(process.env.ANTHROPIC_API_KEY ? "  прокси идэвхтэй (ANTHROPIC_API_KEY олдлоо)" : "  прокси идэвхгүй — түлхүүр эсвэл офлайн толь");
});
