/* ═════════════════════════════════════════════════════════════
   Орчуулгын хөдөлгүүр.
   • офлайн: ангилсан толь + морфологи
   • онлайн: Claude, багцалсан дуудлагаар (олон талбарыг нэг удаа)
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const T = (WB.tr = {});
  const U = WB.util;
  const D = WB.dict;
  const G = WB.gram;

  T.unknown = new Set();       /* толинд олдоогүй бүх үг */
  T.customRef = null;          /* төслийн нэмэлт толь (state тохируулна) */

  const CYR = /[а-яөүёА-ЯӨҮЁ]/;
  const CYR_G = /[а-яөүёА-ЯӨҮЁ]/g;
  T.cyrRatio = function (s) {
    const m = String(s).match(CYR_G);
    return m ? m.length / s.length : 0;
  };

  /* ── ОФЛАЙН ─────────────────────────────────────────────── */
  const MAX_PHRASE = 4;

  /** Англид дүйцэлгүй бөөмс, тодотгол үгс — орчуулгаас гээгдэнэ. */
  const PARTICLES = new Set([
    "нь", "бол", "юм", "билээ", "буй", "бөгөөд", "аж", "гэнэ", "шүү",
    "л", "уу", "үү", "вэ", "бэ", "хэмээн"
  ]);

  T.offline = function (text) {
    const src = String(text || "");
    if (!src.trim()) return { en: "", unknown: [] };
    const custom = T.customRef || {};
    const unknown = new Set();

    const en = src
      .split(/(\n+)/)
      .map((chunk) => {
        if (/^\n+$/.test(chunk)) return chunk;
        return chunk
          .split(/([,.;:!?—–()"«»]+)/)
          .map((seg) => {
            if (/^[,.;:!?—–()"«»\s]+$/.test(seg) || !seg.trim()) return seg;
            const words = seg.toLowerCase().split(/\s+/).filter(Boolean);
            const out = [];
            let i = 0;
            while (i < words.length) {
              if (PARTICLES.has(words[i])) {
                i++;
                continue;
              }
              const span = Math.min(MAX_PHRASE, words.length - i);
              let hit = null;
              let used = 1;

              /* урт хэллэгээс эхэлж таарууллаа */
              for (let n = span; n >= 1; n--) {
                const phrase = words.slice(i, i + n).join(" ");
                const post = D.postp(phrase);
                if (post) {
                  hit = { post: post };
                  used = n;
                  break;
                }
                const r = D.lookup(phrase, custom);
                if (r) {
                  hit = r;
                  used = n;
                  break;
                }
              }

              if (hit && hit.post) {
                /* Дагавар үг англид өмнөх хэллэгийн УРД орно.
                   Толины олон үгт бичлэг нэг элемент болж ордог тул
                   нэг элемент ухрахад «on sand dune» гэсэн зөв дараалал гарна. */
                const back = Math.min(1, out.length);
                out.splice(out.length - back, 0, hit.post);
              } else if (hit) {
                const isVerb = /ing$/.test(hit.en) || hit.cat === "verb";
                out.push(G.applyTags(hit.en, hit.tags, isVerb));
              } else {
                const w = words[i];
                if (CYR.test(w)) unknown.add(w);
                out.push(G.translit(w));
              }
              i += used;
            }
            return out.filter(Boolean).join(" ");
          })
          .join("");
      })
      .join("");

    unknown.forEach((w) => T.unknown.add(w));
    return { en: G.tidy(en), unknown: [...unknown] };
  };

  /* ── ОНЛАЙН ─────────────────────────────────────────────── */
  T.KIND_HINT = {
    logline: "a one-line film logline — one compelling English sentence",
    scene: "a film scene description — a vivid, concrete English video-generation prompt",
    char: "a film character description — a concrete English image-prompt fragment",
    loc: "a film location description — a concrete English image-prompt fragment",
    shot: "a single camera shot description for a video generator",
    plain: "general descriptive text"
  };

  const RULES = [
    "Output English only. Never leave Cyrillic characters in the output.",
    "Keep it natural, visual and concrete — these become AI image/video prompts.",
    "Preserve Mongolian cultural terms with a short clarifier on first use: deel (traditional Mongolian robe), ger (yurt), morin khuur (horsehead fiddle), airag (fermented mare's milk), ovoo (sacred cairn), khadag (ceremonial silk scarf), khuushuur, buuz, del (mane).",
    "Keep roughly the same length and the same line breaks as the input.",
    "Do not add commentary, quotes, numbering or explanation."
  ].join("\n- ");

  /** Нэг талбарыг AI‑аар орчуулна. */
  T.aiOne = async function (text, kind) {
    const prompt =
      "Translate the Mongolian text below into English. Context: it is " +
      (T.KIND_HINT[kind] || T.KIND_HINT.plain) +
      ".\nRules:\n- " +
      RULES +
      "\n\nMongolian text:\n" +
      text;
    const out = await WB.api.ask(prompt, Math.min(2000, 300 + text.length * 2));
    if (!out) throw new Error("хоосон хариу");
    if (T.cyrRatio(out) > 0.15) throw new Error("кирилл үлдсэн");
    return out.replace(/^["'«]|["'»]$/g, "").trim();
  };

  /**
   * ОЛОН талбарыг НЭГ дуудлагаар орчуулна — хамгийн том хэмнэлт.
   * @param {Array<{id:string, kind:string, mn:string}>} items
   * @returns {Promise<Object>} id → english
   */
  T.aiMany = async function (items) {
    if (!items.length) return {};
    if (items.length === 1) {
      const one = await T.aiOne(items[0].mn, items[0].kind);
      return { [items[0].id]: one };
    }
    const body = items
      .map((it, i) => "### " + it.id + " (" + (T.KIND_HINT[it.kind] || T.KIND_HINT.plain) + ")\n" + it.mn)
      .join("\n\n");

    const prompt =
      "Translate every Mongolian block below into English.\nRules:\n- " +
      RULES +
      '\n- Return ONLY a JSON object mapping each block id to its English translation, e.g. {"id1":"...","id2":"..."}.\n' +
      "- Every id present below must appear in the JSON.\n\n" +
      body;

    const obj = await WB.api.askJSON(prompt, Math.min(6000, 600 + body.length * 2));
    const out = {};
    for (const it of items) {
      const v = obj[it.id];
      if (typeof v === "string" && v.trim() && T.cyrRatio(v) <= 0.15) out[it.id] = v.trim();
    }
    return out;
  };

  /** Багцыг тохиромжтой хэмжээгээр хуваана (тэмдэгтийн уртаар). */
  T.chunk = function (items, maxChars, maxItems) {
    maxChars = maxChars || 2600;
    maxItems = maxItems || 8;
    const out = [];
    let cur = [];
    let len = 0;
    for (const it of items) {
      const l = (it.mn || "").length + 40;
      if (cur.length && (cur.length >= maxItems || len + l > maxChars)) {
        out.push(cur);
        cur = [];
        len = 0;
      }
      cur.push(it);
      len += l;
    }
    if (cur.length) out.push(cur);
    return out;
  };

  /**
   * Талбаруудыг орчуулна. AI боломжтой бол багцлан, үгүй бол толиор.
   * @param {Array<{field:object, kind:string}>} targets
   * @param {(done:number,total:number)=>void} onProgress
   */
  T.run = async function (targets, onProgress) {
    const jobs = targets.filter((t) => t.field && (t.field.mn || "").trim());
    if (!jobs.length) return { ai: 0, dict: 0 };
    let ai = 0;
    let dict = 0;

    if (WB.api.live()) {
      const items = jobs.map((j, i) => ({ id: "b" + i, kind: j.kind, mn: j.field.mn.trim(), job: j }));
      const groups = T.chunk(items);
      let done = 0;
      const results = await U.pool(
        groups,
        2,
        async (grp) => {
          try {
            return { grp: grp, map: await T.aiMany(grp) };
          } catch (e) {
            return { grp: grp, map: null, err: e };
          }
        },
        () => {}
      );
      for (const r of results) {
        const grp = (r && r.grp) || [];
        for (const it of grp) {
          const en = r && r.map && r.map[it.id];
          if (en) {
            it.job.field.en = en;
            it.job.field.unk = [];
            it.job.field.src = "ai";
            ai++;
          } else {
            const off = T.offline(it.mn);
            it.job.field.en = off.en;
            it.job.field.unk = off.unknown;
            it.job.field.src = "dict";
            dict++;
          }
          done++;
          if (onProgress) onProgress(done, jobs.length);
        }
      }
      if (results.some((r) => r && r.err)) {
        const first = results.find((r) => r && r.err);
        WB.api.state.lastError = first.err.message;
      }
    } else {
      jobs.forEach((j, i) => {
        const off = T.offline(j.field.mn);
        j.field.en = off.en;
        j.field.unk = off.unknown;
        j.field.src = "dict";
        dict++;
        if (onProgress) onProgress(i + 1, jobs.length);
      });
    }
    WB.emit("tr:done", { ai: ai, dict: dict });
    return { ai: ai, dict: dict };
  };

  /** Нэг талбар — бичиж байхад автоматаар дуудагдана. */
  T.field = async function (field, kind) {
    const src = (field.mn || "").trim();
    if (!src) {
      field.en = "";
      field.unk = [];
      field.src = "";
      return field;
    }
    if (WB.api.live()) {
      try {
        field.en = await T.aiOne(src, kind);
        field.unk = [];
        field.src = "ai";
        return field;
      } catch (e) {
        WB.api.state.lastError = e.message;
        if (e.status === 401 || e.status === 403) WB.api.state.mode = "off";
      }
    }
    const off = T.offline(src);
    field.en = off.en;
    field.unk = off.unknown;
    field.src = "dict";
    return field;
  };

  /**
   * АВТОМАТ ТОЛЬ БӨГЛӨЛТ — таниагүй үгсийг Claude‑аар нэг дор орчуулж,
   * төслийн нэмэлт тольд шингээнэ. Ингэснээр офлайн горим улам сайжирна.
   */
  T.fillUnknown = async function (words, onProgress) {
    const list = (words || [...T.unknown]).filter((w) => !(T.customRef || {})[w]);
    if (!list.length) return {};
    if (!WB.api.live()) throw new Error("Энэ боломж Claude холболт шаардана.");

    const groups = [];
    for (let i = 0; i < list.length; i += 60) groups.push(list.slice(i, i + 60));
    const merged = {};
    let done = 0;

    for (const grp of groups) {
      const prompt =
        "Below is a list of Mongolian words taken from a film script. " +
        "For each one give the most useful single English equivalent for an image/video generation prompt.\n" +
        "Rules:\n" +
        '- Return ONLY a JSON object: {"монгол үг":"english", ...}\n' +
        "- Use the dictionary (base) form of the English word: nouns singular, verbs as -ing gerunds, adjectives plain.\n" +
        "- If a word is a proper name, transliterate it and keep it capitalised.\n" +
        "- Every word in the list must appear as a key exactly as written.\n\n" +
        grp.join("\n");
      try {
        const obj = await WB.api.askJSON(prompt, 4000);
        for (const k in obj) {
          const v = obj[k];
          if (typeof v === "string" && v.trim()) merged[k.toLowerCase()] = v.trim();
        }
      } catch (e) {
        /* энэ багц бүтсэнгүй — үлдсэнийг үргэлжлүүлнэ */
      }
      done += grp.length;
      if (onProgress) onProgress(Math.min(done, list.length), list.length);
    }
    return merged;
  };
})(window.WB);
