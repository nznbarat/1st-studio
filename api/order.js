/**
 * Захиалгын маягтыг Telegram руу дамжуулах Vercel serverless прокси.
 *
 * ЯАГААД:
 *   Урьд нь ботын нууц түлхүүр index.html дотор ИЛ бичээстэй байсан.
 *   Хуудсыг нээсэн хэн ч түүнийг уншиж, таны ботоор дуртай юмаа
 *   бичиж, бүх мессежийг чинь уншиж чаддаг байв.
 *   Одоо түлхүүр зөвхөн серверт байна — хөтөч рүү хэзээ ч очихгүй.
 *
 * ТОХИРУУЛАХ (Vercel ▸ Project ▸ Settings ▸ Environment Variables):
 *   TELEGRAM_BOT_TOKEN   шинэ түлхүүр — @BotFather ▸ /revoke хийсний дараах
 *   TELEGRAM_CHAT_ID     захиалга очих чат (танай хувийн чат эсвэл групп)
 *   ORDER_RATE_MAX       (сонголт) нэг IP-ээс цагт хэдэн захиалга, анхдагч 10
 *
 * Тохируулаагүй бол 501 буцаана — хуудас нь утас, имэйлээ харуулж,
 * хэрэглэгч ямар ч тохиолдолд холбогдож чадна.
 */

const MAX_BODY_CHARS = 8000;
const LIMITS = { name: 120, phone: 80, service: 120, message: 1500 };

/* Энгийн хурдны хязгаар. Serverless нь төлөвгүй тул зөвхөн нэг instance
   дотор ажиллана — бүрэн хамгаалалт биш ч урсгал спамыг барина. */
const RATE_WINDOW_MS = 60 * 60 * 1000;
const hits = new Map();

function rateLimited(ip, max) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  rec.n++;
  return rec.n > max;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY_CHARS) throw new Error("хэт урт");
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

/** Удирдах тэмдэг арилгаж, уртыг нь хязгаарлана */
function clean(v, max) {
  return String(v == null ? "" : v)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, max);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(501).json({
      error: "Захиалгын суваг тохируулаагүй байна."
    });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return res.status(400).json({ error: "Хүсэлтийн бие буруу байна." });
  }

  /* Робот барих хавх: жинхэнэ хүн энэ талбарыг хардаггүй тул хоосон байна */
  if (clean(body.website, 50)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const phone = clean(body.phone, LIMITS.phone);
  const service = clean(body.service, LIMITS.service);
  const message = clean(body.message, LIMITS.message);

  if (!name || !phone) {
    return res.status(400).json({ error: "Нэр болон утасны дугаар шаардлагатай." });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    (req.socket && req.socket.remoteAddress) ||
    "unknown";
  if (rateLimited(ip, Number(process.env.ORDER_RATE_MAX || 10))) {
    return res.status(429).json({
      error: "Хэт олон захиалга илгээлээ. Хэсэг хүлээгээд дахин оролдоно уу."
    });
  }

  /* parse_mode ОГТ хэрэглэхгүй — тэгвэл хэрэглэгчийн бичсэн текст
     Telegram дээр зүгээр л текст хэвээр үлдэнэ (тэмдэг оруулж эвдэхгүй). */
  const text = [
    "🎵 Шинэ захиалга!",
    "👤 Нэр: " + name,
    "📞 Утас: " + phone,
    service ? "🎤 Үйлчилгээ: " + service : "",
    message ? "💬 Мэдэгдэл: " + message : "",
    "🌐 Эх сурвалж: " + clean(req.headers["referer"] || "", 120)
  ].filter(Boolean).join("\n").slice(0, 4000);

  try {
    const upstream = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,               /* ЗӨВХӨН серверээс — хэрэглэгч сонгож чадахгүй */
        text: text,
        disable_web_page_preview: true
      })
    });
    if (!upstream.ok) {
      /* Telegram-ийн хариуг хэрэглэгчид харуулахгүй — түлхүүр агуулж магадгүй */
      let detail = "";
      try { detail = (await upstream.json()).description || ""; } catch (e) { }
      console.error("[order] telegram", upstream.status, detail);
      return res.status(502).json({ error: "Илгээж чадсангүй. Дахин оролдоно уу." });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[order]", e && e.message);
    return res.status(502).json({ error: "Сүлжээний алдаа. Дахин оролдоно уу." });
  }
};
