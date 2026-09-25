/* ═════════════════════════════════════════════════════════════
   Claude‑ийн холболт.
   Гурван шат: (1) сервер прокси /api/claude  (түлхүүр шаардахгүй)
               (2) хэрэглэгчийн API түлхүүр   (шууд anthropic руу)
               (3) офлайн толь                 (интернэтгүй ч ажиллана)
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const A = (WB.api = {});
  const U = WB.util;

  A.DEFAULT_MODEL = "claude-opus-5-5";
  A.MODELS = [
    [A.DEFAULT_MODEL, "Opus 5.5 — хамгийн чадвартай (анхдагч)"],
    ["claude-sonnet-5", "Sonnet 5 — хурдан, чанартай"],
    ["claude-sonnet-4-6", "Sonnet 4.6 — тэнцвэртэй"],
    ["claude-haiku-4-5-20251001", "Haiku 4.5 — хямд, маш хурдан"]
  ];

  /* Нэг удаагийн шилжүүлэг: өмнөх анхдагч (эсвэл прокси тавьсан) загвартай
     хөтчийг шинэ анхдагч руу шилжүүлнэ. Дараа нь хэрэглэгчийн сонголт
     хэвээр үлдэнэ. */
  const MODEL_V = 2;
  if ((WB.store.get("modelV", 0) || 0) < MODEL_V) {
    if (WB.store.get("model", null)) {
      WB.store.set("model", A.DEFAULT_MODEL);
      WB.store.set("modelPicked", true);
    }
    WB.store.set("modelV", MODEL_V);
  }

  A.state = {
    mode: "unknown",     /* unknown | proxy | key | off */
    forceOffline: false,
    key: "",
    model: WB.store.get("model", A.DEFAULT_MODEL),
    proxyPath: "/api/claude",
    busy: 0,
    calls: 0,
    inTokens: 0,
    outTokens: 0,
    lastError: ""
  };

  /* API түлхүүрийг сонголтоор хөтчид үлдээх (анхдагчаар — үгүй) */
  const REMEMBER = "rememberKey";
  if (WB.store.get(REMEMBER, false)) A.state.key = WB.store.get("key", "") || "";

  A.rememberKey = function (on) {
    WB.store.set(REMEMBER, !!on);
    if (on) WB.store.set("key", A.state.key || "");
    else WB.store.del("key");
  };

  A.setKey = function (k) {
    A.state.key = (k || "").trim();
    if (WB.store.get(REMEMBER, false)) WB.store.set("key", A.state.key);
  };

  /**
   * @param {string} m загварын id
   * @param {boolean} [byUser] хэрэглэгч өөрөө сонгосон — серверийн прокси
   *   цаашид түүнийг өөрийн анхдагчаар дарахгүй
   */
  A.setModel = function (m, byUser) {
    A.state.model = (m || "").trim() || A.DEFAULT_MODEL;
    WB.store.set("model", A.state.model);
    if (byUser) WB.store.set("modelPicked", true);
    WB.emit("api:model", A.state.model);
  };

  A.live = function () {
    return (A.state.mode === "proxy" || A.state.mode === "key") && !A.state.forceOffline;
  };

  /* ── дуудлагын дараалал: зэрэг явах хүсэлтийн тоог хязгаарлана ── */
  let active = 0;
  const MAX_PARALLEL = 3;
  const waiting = [];
  function acquire() {
    if (active < MAX_PARALLEL) {
      active++;
      return Promise.resolve();
    }
    return new Promise((res) => waiting.push(res));
  }
  function release() {
    active--;
    const next = waiting.shift();
    if (next) {
      active++;
      next();
    }
  }

  /* ── үр дүнгийн кэш: ижил текстийг хоёр удаа төлбөргүй ──── */
  const cache = new Map();
  const CACHE_MAX = 600;
  /** FNV‑1a — зургийн өгөгдлийг кэшийн түлхүүрт богино хэлбэрээр оруулна. */
  function fnv(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }
  /* Зургийг түлхүүрт оруулахгүй бол ижил санаагаар ӨӨР зураг илгээхэд
     өмнөх зургийн хариу кэшээс буцаж ирнэ. Заагч нь NUL — текстэд гардаггүй. */
  function cacheKey(prompt, model, images) {
    const img = (images || []).map((im) => im.data.length + ":" + fnv(im.data)).join(",");
    return model + "\u0000" + img + "\u0000" + prompt;
  }
  A.clearCache = () => cache.clear();
  A.cacheSize = () => cache.size;

  /* ── бодит HTTP дуудлага ────────────────────────────────── */
  async function raw(body, signal) {
    const payload = JSON.stringify(Object.assign({}, body, { model: A.state.model }));

    if (A.state.mode === "proxy") {
      const res = await fetch(A.state.proxyPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: signal
      });
      if (!res.ok) throw await httpError(res);
      return res.json();
    }

    const headers = { "Content-Type": "application/json" };
    if (A.state.key) {
      headers["x-api-key"] = A.state.key;
      headers["anthropic-version"] = "2023-06-01";
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    }
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: headers,
      body: payload,
      signal: signal
    });
    if (!res.ok) throw await httpError(res);
    return res.json();
  }

  async function httpError(res) {
    let detail = "";
    try {
      const j = await res.json();
      detail = (j.error && (j.error.message || j.error.type)) || j.message || "";
    } catch (e) {
      try {
        detail = (await res.text()).slice(0, 200);
      } catch (e2) {}
    }
    const err = new Error("HTTP " + res.status + (detail ? " — " + detail : ""));
    err.status = res.status;
    return err;
  }

  const RETRYABLE = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);

  /** Дахин оролдлоготой дуудлага (429 / түр зуурын алдаанд). */
  A.call = async function (body, opts) {
    opts = opts || {};
    const tries = opts.tries || 4;
    await acquire();
    A.state.busy++;
    WB.emit("api:busy", A.state.busy);
    try {
      let wait = 900;
      for (let attempt = 1; ; attempt++) {
        try {
          const data = await raw(body, opts.signal);
          A.state.calls++;
          if (data && data.usage) {
            A.state.inTokens += data.usage.input_tokens || 0;
            A.state.outTokens += data.usage.output_tokens || 0;
          }
          WB.emit("api:usage", A.state);
          return data;
        } catch (err) {
          if (err.name === "AbortError") throw err;
          const retryable = !err.status || RETRYABLE.has(err.status);
          if (attempt >= tries || !retryable) {
            A.state.lastError = err.message;
            throw err;
          }
          await U.sleep(wait);
          wait *= 2;
        }
      }
    } finally {
      A.state.busy--;
      WB.emit("api:busy", A.state.busy);
      release();
    }
  };

  /** Нэг мөр асуулт → нэг мөр хариу. Кэштэй. */
  A.ask = async function (prompt, maxTokens, opts) {
    opts = opts || {};
    const images = opts.images || [];
    const ck = cacheKey(prompt, A.state.model, images);
    if (!opts.noCache && cache.has(ck)) return cache.get(ck);

    /* Зураг байвал текстийн ӨМНӨ image блок болгон илгээнэ. */
    const content = images.length
      ? images
          .map((im) => ({
            type: "image",
            source: { type: "base64", media_type: im.media_type, data: im.data }
          }))
          .concat([{ type: "text", text: prompt }])
      : prompt;
    const body = {
      max_tokens: maxTokens || 1200,
      messages: [{ role: "user", content: content }]
    };
    if (opts.system) body.system = opts.system;
    if (opts.temperature != null) body.temperature = opts.temperature;

    const data = await A.call(body, opts);
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!opts.noCache) {
      if (cache.size > CACHE_MAX) cache.clear();
      cache.set(ck, text);
    }
    return text;
  };

  /** JSON хариу шаардсан дуудлага — хашилт, код блокыг цэвэрлэнэ. */
  A.askJSON = async function (prompt, maxTokens, opts) {
    const txt = await A.ask(prompt, maxTokens, opts);
    return A.parseJSON(txt);
  };

  A.parseJSON = function (txt) {
    const clean = String(txt || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const s = clean.indexOf("[");
    const o = clean.indexOf("{");
    const start = s >= 0 && (o < 0 || s < o) ? s : o;
    const end = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
    if (start < 0 || end < 0) throw new Error("Хариунаас JSON олдсонгүй");
    let slice = clean.slice(start, end + 1);
    try {
      return JSON.parse(slice);
    } catch (e) {
      /* сүүлийн таслал, тасарсан мөрийг уучилж дахин оролдоно */
      slice = slice.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(slice);
    }
  };

  /**
   * Ямар горимд ажиллахыг тодорхойлно.
   * Эхлээд серверийн прокси, дараа нь хэрэглэгчийн түлхүүр.
   */
  A.probe = async function () {
    A.state.mode = "unknown";
    WB.emit("api:mode", A.state);

    /* 1) сервер прокси байгаа эсэх (ганц файлаар нээсэн үед алгасна) */
    const canProxy = !!A.state.proxyPath && location.protocol !== "file:";
    if (canProxy) try {
      const res = await fetch(A.state.proxyPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true })
      });
      if (res.ok) {
        const j = await res.json().catch(() => ({}));
        if (j && j.ok) {
          A.state.mode = "proxy";
          /* Серверийн анхдагчийг зөвхөн хэрэглэгч өөрөө сонгоогүй үед авна */
          if (j.model && !WB.store.get("modelPicked", false)) A.setModel(j.model);
          WB.emit("api:mode", A.state);
          return A.state.mode;
        }
      }
    } catch (e) {
      /* прокси байхгүй — цааш нь */
    }

    /* 2) хэрэглэгчийн түлхүүр эсвэл claude.ai дотор ажиллаж байгаа эсэх */
    try {
      A.state.mode = "key";
      await raw({ max_tokens: 8, messages: [{ role: "user", content: "Reply with: ok" }] });
      WB.emit("api:mode", A.state);
      return "key";
    } catch (e) {
      A.state.mode = "off";
      A.state.lastError = e.message;
      WB.emit("api:mode", A.state);
      return "off";
    }
  };
})(window.WB);
