/**
 * Vercel serverless proxy for the Anthropic Messages API.
 *
 * Why: the browser cannot call api.anthropic.com without exposing a key.
 * With ANTHROPIC_API_KEY set in the Vercel project's environment variables,
 * the deployed World Builder works for every visitor with no key pasting.
 *
 * If the variable is missing the endpoint answers 501 and the front-end
 * quietly falls back to "bring your own key" and then to the offline
 * dictionary, so the app never breaks.
 *
 * Env vars:
 *   ANTHROPIC_API_KEY  (required to enable the proxy)
 *   WB_MODEL           (optional, default model id)
 *   WB_MAX_TOKENS      (optional, hard ceiling per request, default 8000)
 */

const ALLOWED_MODEL = /^claude-[a-z0-9.\-]+$/i;
const DEFAULT_MODEL = process.env.WB_MODEL || "claude-sonnet-4-6";
const MAX_TOKENS_CAP = Number(process.env.WB_MAX_TOKENS || 8000);
const MAX_BODY_CHARS = 120000;

/* Хамгийн энгийн хурдны хязгаар — нэг IP‑ээс минутад хэдэн дуудлага.
   Serverless нь төлөвгүй тул зөвхөн нэг instance дотор ажиллана;
   бүрэн хамгаалалт биш ч санамсаргүй давталтыг барина. */
const RATE_WINDOW_MS = 60000;
const RATE_MAX = Number(process.env.WB_RATE_MAX || 40);
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  rec.n++;
  return rec.n > RATE_MAX;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY_CHARS) throw new Error("body too large");
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Use POST" } });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res
      .status(501)
      .json({ error: { message: "ANTHROPIC_API_KEY тохируулаагүй байна — хэрэглэгчийн түлхүүр рүү шилжинэ." } });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return res.status(400).json({ error: { message: "Хүсэлтийн бие буруу: " + e.message } });
  }

  /* Хөтчийн эхний шалгалт: жинхэнэ дуудлага хийхгүйгээр прокси байгааг мэдэгдэнэ. */
  if (body && body.ping) {
    return res.status(200).json({ ok: true, model: DEFAULT_MODEL });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    (req.socket && req.socket.remoteAddress) ||
    "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: { message: "Хэт олон хүсэлт. Минут хүлээгээд дахин оролдоно уу." } });
  }

  const model = ALLOWED_MODEL.test(String(body.model || "")) ? body.model : DEFAULT_MODEL;
  const maxTokens = Math.min(Number(body.max_tokens) || 1200, MAX_TOKENS_CAP);
  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || !messages.length) {
    return res.status(400).json({ error: { message: "messages массив шаардлагатай" } });
  }

  const payload = { model, max_tokens: maxTokens, messages };
  if (typeof body.system === "string") payload.system = body.system;
  if (typeof body.temperature === "number") payload.temperature = body.temperature;

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: { message: "Anthropic руу холбогдож чадсангүй: " + e.message } });
  }
};
