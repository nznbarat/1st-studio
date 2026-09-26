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
    "л", "уу", "үү", "вэ", "бэ", "хэмээн",
    /* туслах үйл үг: «хатааж байна» → «drying» */
    "байна", "байлаа", "байв"
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
              const num = G.numeric(words[i]);
              if (num) {
                out.push(num);
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
                let en = G.applyTags(hit.en, hit.tags, isVerb);
                /* Монголд тооны араас ганц тоо хэрэглэдэг: «гурван эмэгтэй».
                   Англид олон тоо болгоно → «three women». Харьяалахын тийн
                   ялгалтай бол тодотгол тул хөндөхгүй: «5 секундын» → 5‑second. */
                const src = words[i + used - 1];
                /* Тийн ялгалын угтвар үгтэй бол («with part») хөндөхгүй — зөвхөн
                   нэрлэх ба заах тийн: «гурван эмэгтэй», «гурван эмэгтэйг». */
                const caseTags = (hit.tags || []).filter((t) => t !== "acc");
                if (!isVerb && !caseTags.length && G.isCount(out[out.length - 1]) &&
                    !/(ын|ийн|ны|ний|ины)$/.test(src)) {
                  en = G.pluralLast(en);
                }
                out.push(en);
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
    brand: "a channel style-guide fragment — a reusable English descriptor for look, lighting, palette, camera or narration tone",
    plain: "general descriptive text"
  };

  const RULES = [
    "Output English only. Never leave Cyrillic characters in the output.",
    "Keep it natural, visual and concrete — these become AI image/video prompts.",
    "Translate faithfully: never exaggerate, intensify or add drama; keep sizes, proportions, numbers and quantities exactly as in the source.",
    "Preserve Mongolian cultural terms with a short clarifier on first use: deel (traditional Mongolian robe), ger (yurt), morin khuur (horsehead fiddle), airag (fermented mare's milk), ovoo (sacred cairn), khadag (ceremonial silk scarf), khuushuur, buuz, del (mane).",
    "Keep roughly the same length and the same line breaks as the input.",
    "Do not add commentary, quotes, numbering or explanation."
  ].join("\n- ");

  /* ── АНГЛИ → МОНГОЛ (зөвхөн дэлгэцэд унших утга) ─────────────
     Англи промт үгчлэн үлдэнэ; монгол нь түүнийг ойлгоход л туслана. */
  let rev = null;
  /* Промтын түгээмэл нэр томьёо — урвуу толиос түрүүлж шалгана
     (урвуу толь «cold»‑ыг «ханиад», «look»‑ыг «хараач» гэх мэт алддаг). */
  const EN_MN = {
    "photorealistic": "бодит зураг шиг", "photo-realistic": "бодит зураг шиг", "cinematic": "кино шиг",
    "sci-fi": "шинжлэх ухааны уран зөгнөлт", "science fiction": "шинжлэх ухааны уран зөгнөлт",
    "film grain": "хальсны ширхэг", "grain": "ширхэг", "anamorphic": "анаморф", "anamorphic look": "анаморф харагдац",
    "look": "харагдац", "style": "хэв маяг", "mood": "уур амьсгал", "tone": "өнгө аяс", "aesthetic": "хэв маяг",
    "shot": "кадр", "take": "дүрс авалт", "continuous take": "тасралтгүй авалт", "one continuous take": "нэг тасралтгүй авалт",
    "cut": "таслал", "cuts": "таслал", "tracking": "дагах хөдөлгөөн", "wide shot": "өргөн кадр", "close-up": "ойрын кадр",
    "lens": "линз", "depth of field": "гүний хурц байдал", "shallow depth of field": "гүехэн гүний хурц", "motion blur": "хөдөлгөөний бүдгэрэл",
    "light": "гэрэл", "lighting": "гэрэлтүүлэг", "lit": "гэрэлтсэн", "backlight": "ар гэрэл", "backlights": "араас гэрэлтүүлнэ",
    "rim light": "хүрээ гэрэл", "volumetric": "эзэлхүүнт", "rays": "туяа", "light rays": "гэрлийн туяа", "glow": "туяа",
    "glowing": "гэрэлтэх", "shadow": "сүүдэр", "shadows": "сүүдэр", "flare": "гялбаа", "lens flare": "линзийн гялбаа",
    "cold": "хүйтэн", "cool": "сэрүүн", "warm": "дулаан", "deep": "гүн", "faint": "бүдэг", "dim": "бүдэг", "bright": "тод",
    "dark": "бараан", "black": "хар", "white": "цагаан", "grey": "саарал", "gray": "саарал", "blue": "цэнхэр",
    "red": "улаан", "gold": "алт", "golden": "алтан", "amber": "хув шар", "beige": "цайвар шаргал", "sand-colored": "элсэн өнгийн",
    "space": "сансар", "star": "од", "stars": "одод", "planet": "гариг", "gas giant": "хийн аварга гариг", "nebula": "мананцар",
    "haze": "униар", "asteroid": "астероид", "asteroids": "астероид", "hull": "их бие", "spaceship": "сансрын хөлөг",
    "ship": "хөлөг", "cargo": "ачааны", "engine": "хөдөлгүүр", "window": "цонх", "windows": "цонх",
    "realistic": "бодит", "realistic scale": "бодит хэмжээ", "scale": "хэмжээ", "slow": "удаан", "heavy": "хүнд",
    "ominous": "түгшүүртэй", "text": "бичвэр", "people": "хүн", "explosion": "дэлбэрэлт", "overkill": "хэтрүүлэл",
    "neon": "неон", "cartoon": "хүүхэлдэйн", "video-game": "видео тоглоомын", "narration": "өгүүлэмж", "dialogue": "яриа",
    "music": "хөгжим", "sound": "дуу авиа", "sounds": "дуу авиа", "drone": "гүн нам дуу", "rumble": "нүргээн", "silence": "нам гүм",
    "palette": "өнгөний палетт", "colors": "өнгө", "colours": "өнгө", "desaturated": "бүдгэрүүлсэн", "bands": "судал",
    "plating": "хавтан", "foreground": "урд талд", "blurred": "бүдэг", "edges": "ирмэг", "hard": "хатуу",
    "blue-white": "цэнхэр цагаан", "grey-beige": "саарал шаргал", "upper left": "зүүн дээд буланд", "upper right": "баруун дээд талаас",
    "gives": "өгнө", "worn": "элэгдсэн", "huge": "асар том", "ringed": "цагирагтай", "drifts": "хөвнө", "drift": "хөвөх",
    "slowly": "удаанаар", "quietly": "чимээгүй", "glides": "гулсан хөдөлнө", "fragment": "хэлтэрхий", "fragments": "хэлтэрхий",
    "tumble": "эргэлдэнэ", "tumbling": "эргэлдэх", "past": "хажуугаар", "jagged": "ирмэгтэй", "enters": "орж ирнэ",
    "heading": "чиглэн", "straight": "шууд", "rear": "арын", "section": "хэсэг", "growing": "томорч", "fast": "хурдан",
    "moment": "агшин", "before": "өмнө", "impact": "мөргөлдөөн", "along": "дагуу", "front": "урд", "ends": "дуусна",
    "nacelles": "хөдөлгүүрийн бүрхүүл", "rocky": "хадархаг", "field": "талбар", "lights": "гэрэл", "few": "цөөн",
    "distant": "алсын", "thin": "нимгэн", "sharp": "хурц", "dense": "шигүү", "weathered": "элэгдсэн", "metal": "металл",
    "panels": "хавтан", "armored": "хуягт", "small": "жижиг", "large": "том", "round": "бөөрөнхий", "long": "урт"
  };
  const STOP = new Set("a an the of with and at to in on from for by its it into through toward towards as is are yet".split(" "));
  function reverseMap() {
    if (rev) return rev;
    rev = Object.create(null);
    const M = WB.dict.map;
    for (const mn in M) {
      const en = String(M[mn].en || "").toLowerCase().trim();
      if (!en || en.length > 40) continue;
      /* хамгийн богино монгол хувилбарыг сонгоно */
      if (!rev[en] || mn.length < rev[en].length) rev[en] = mn;
    }
    return rev;
  }
  function revWord(w) {
    const R = reverseMap();
    return EN_MN[w] || R[w] || (w.endsWith("es") && R[w.slice(0, -2)]) || (w.endsWith("s") && R[w.slice(0, -1)]) ||
      (w.endsWith("ing") && (R[w.slice(0, -3)] || R[w.slice(0, -3) + "e"])) || (w.endsWith("ed") && R[w.slice(0, -2)]) || "";
  }
  /**
   * Офлайн, толиор — англи текстийн ойролцоо монгол утга (мөр бүрээр).
   * @returns {{mn:string, unknown:string[]}}
   */
  T.roughMN = function (en) {
    const R = reverseMap();
    const unknown = [];
    const lines = String(en || "").split(/\r?\n/);
    const outLines = lines.map((line) => {
      const phrases = line.split(/\s*,\s*/).filter(Boolean);
      return phrases
        .map((ph) => {
          const w = ph.toLowerCase().replace(/[^a-z0-9\s\-'–]/g, " ").split(/\s+/).filter(Boolean);
          const res = [];
          let neg = false; /* «no text» → «бичвэргүй» (хэллэгийн төгсгөлд) */
          for (let i = 0; i < w.length; ) {
            let hit = "";
            let n = 0;
            for (let k = Math.min(4, w.length - i); k >= 2 && !hit; k--) {
              const key = w.slice(i, i + k).join(" ");
              if (EN_MN[key] || R[key]) {
                hit = EN_MN[key] || R[key];
                n = k;
              }
            }
            if (!hit) {
              if (w[i] === "no" || w[i] === "without") {
                neg = true;
                i++;
                continue;
              }
              if (STOP.has(w[i])) {
                i++;
                continue;
              }
              hit = revWord(w[i]);
              n = 1;
              if (!hit) {
                if (/[a-z]/.test(w[i])) unknown.push(w[i]);
                hit = w[i];
              }
            }
            res.push(hit);
            i += n;
          }
          const out = res.join(" ");
          return neg && out ? out + "гүй" : out;
        })
        .join(", ");
    });
    return { mn: outLines.join("\n"), unknown: [...new Set(unknown)] };
  };

  /**
   * Англи текстүүдийн монгол утга. Claude холбогдсон бол түүгээр (зөвхөн
   * орчуулна, англи эхийг өөрчлөхгүй), эс бөгөөс толиор ойролцоо.
   * @param {string[]} list
   * @returns {Promise<{mn:string[], ai:boolean}>}
   */
  T.toMN = async function (list) {
    const items = (list || []).map((x) => String(x || "").trim());
    if (!items.some(Boolean)) return { mn: items.map(() => ""), ai: false };
    if (WB.api.live()) {
      try {
        const prompt =
          "Translate each English text below into natural, simple Mongolian (Cyrillic). " +
          "It is only a reading aid for a Mongolian filmmaker — keep the meaning exact: no exaggeration, " +
          "keep sizes, numbers, timings and proportions as written; keep line breaks; keep technical film terms understandable " +
          "(e.g. anamorphic → анаморф, film grain → хальсны ширхэг). Keep [@image1]-style references unchanged.\n" +
          'Return ONLY a JSON object {"p0":"…","p1":"…"}.\n\n' +
          items.map((t, i) => "[p" + i + "]\n" + t).join("\n\n");
        const o = await WB.api.askJSON(prompt, Math.min(6000, 400 + items.join(" ").length * 3));
        if (o && typeof o === "object") {
          const mn = items.map((t, i) => (typeof o["p" + i] === "string" ? o["p" + i].trim() : ""));
          if (mn.some(Boolean)) return { mn: mn.map((m, i) => m || T.roughMN(items[i]).mn), ai: true };
        }
      } catch (e) {
        WB.api.state.lastError = e.message;
      }
    }
    return { mn: items.map((t) => T.roughMN(t).mn), ai: false };
  };

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

    /* Дуудлага явж байх хооронд хэрэглэгч тухайн мөрийг засвал (монгол
       эсвэл англи тал) хоцорсон хариугаар дарж бичихгүй. */
    const snap = new Map(jobs.map((j) => [j, { mn: j.field.mn, en: j.field.en }]));
    const fresh = (j) => {
      const o = snap.get(j);
      return j.field.mn === o.mn && j.field.en === o.en;
    };
    /* «Бүгдийг дахин орчуулах» 🔒 мөрийг дарсан бол түгжээг нь тайлна */
    const put = (j, en, unk, src) => {
      j.field.en = en;
      j.field.unk = unk;
      j.field.src = src;
      j.field.auto = true;
    };

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
          if (!fresh(it.job)) {
            /* алгасна — хэрэглэгч энэ хооронд зассан */
          } else if (en) {
            put(it.job, en, [], "ai");
            ai++;
          } else {
            const off = T.offline(it.mn);
            put(it.job, off.en, off.unknown, "dict");
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
        put(j, off.en, off.unknown, "dict");
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
