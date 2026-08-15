/**
 * YouTube-ийн автомат хадмалыг татаж, цэвэр JSON болгож буцаана.
 *
 * Яагаад сервер талд вэ: хөтөч YouTube руу шууд хандахад CORS хориглодог.
 * Түлхүүр, эрх шаардахгүй — олон нийтэд нээлттэй хадмалын урсгалыг л уншина.
 *
 *   GET /api/youtube?v=<videoId>&lang=en
 *   → { title, lang, lines: [{ t: секунд, text: "…" }] }
 *
 * YouTube дотоод бүтцээ өөрчилдөг тул энэ нь эмзэг зам. Ажиллахгүй бол
 * хуудсан дээрх «Show transcript → хуулж буулгах» арга үргэлж ажиллана.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0 Safari/537.36";

/** ytInitialPlayerResponse-ийн JSON-ыг хаалт тоолж таслана */
function carveJson(html, marker) {
  const at = html.indexOf(marker);
  if (at < 0) return null;
  const start = html.indexOf("{", at);
  if (start < 0) return null;

  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try { return JSON.parse(html.slice(start, i + 1)); } catch (e) { return null; }
    }
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const url = new URL(req.url, "http://localhost");
  const id = (url.searchParams.get("v") || "").trim();
  const want = (url.searchParams.get("lang") || "").trim();

  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: { message: "videoId буруу байна" } }));
  }

  try {
    const page = await fetch("https://www.youtube.com/watch?v=" + id, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" }
    });
    if (!page.ok) throw new Error("YouTube хуудас нээгдсэнгүй (HTTP " + page.status + ")");
    const html = await page.text();

    const player = carveJson(html, "ytInitialPlayerResponse");
    if (!player) throw new Error("Видеоны мэдээлэл уншигдсангүй — YouTube бүтцээ өөрчилсөн байж болно");

    const title = ((player.videoDetails || {}).title) || "";
    const tracks =
      (((player.captions || {}).playerCaptionsTracklistRenderer || {}).captionTracks) || [];
    if (!tracks.length) throw new Error("Энэ видеонд хадмал алга");

    const track =
      (want && tracks.find((t) => (t.languageCode || "").startsWith(want))) ||
      tracks.find((t) => (t.languageCode || "").startsWith("en")) ||
      tracks[0];

    const capRes = await fetch(track.baseUrl + "&fmt=json3", { headers: { "User-Agent": UA } });
    if (!capRes.ok) throw new Error("Хадмал татагдсангүй (HTTP " + capRes.status + ")");
    const cap = await capRes.json();

    const lines = (cap.events || [])
      .filter((e) => e.segs)
      .map((e) => ({
        t: Math.round((e.tStartMs || 0) / 1000),
        text: e.segs.map((s) => s.utf8 || "").join("").replace(/\s+/g, " ").trim()
      }))
      .filter((l) => l.text && l.text !== "[Music]");

    return res.end(JSON.stringify({ title, lang: track.languageCode || "", lines }));
  } catch (e) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: { message: e.message } }));
  }
};
