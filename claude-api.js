/* ══════════════════════════════════════════════════════════════════════
   1st Studio — Claude холболт  (Camera Director)

   Гурван шат, аль нь ажиллахыг өөрөө олно:
     1. Сервер прокси  /api/claude   — түлхүүр шаардахгүй (Vercel дээр)
     2. Өөрийн API түлхүүр           — шууд api.anthropic.com руу
     3. Холбоогүй                    — програм хэвийн ажиллана, зөвхөн
                                       Claude-ийн товчнууд унтарна

   Ертөнц Бүтээгчийн world-builder/js/30-api.js-тэй ижил зарчим,
   гэхдээ WB орчингүй, дангаараа ажиллана.
   ══════════════════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  const CLA = root.CLA = {};

  CLA.MODELS = [
    ['claude-sonnet-5', 'Sonnet 5 — тэнцвэртэй (санал болгож байна)'],
    ['claude-opus-5', 'Opus 5 — хамгийн чадвартай'],
    ['claude-haiku-4-5-20251001', 'Haiku 4.5 — хамгийн хурдан, хямд']
  ];
  const DEFAULT_MODEL = 'claude-sonnet-5';

  /* ── Хөтчийн санах ой (private горимд ч унахгүй) ── */
  const NS = '1stStudio.claude.';
  const store = {
    get(k, d) { try { const v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem(NS + k); } catch (e) { } }
  };
  CLA.store = store;

  CLA.state = {
    mode: 'unknown',            /* unknown | proxy | key | off */
    key: '',
    model: store.get('model', DEFAULT_MODEL),
    proxyPath: '/api/claude',
    busy: 0,
    calls: 0,
    inTokens: 0,
    outTokens: 0,
    lastError: ''
  };

  /* Түлхүүрийг зөвхөн хэрэглэгч зөвшөөрвөл хадгална */
  const REMEMBER = 'rememberKey';
  if (store.get(REMEMBER, false)) CLA.state.key = store.get('key', '') || '';

  CLA.remembers = () => !!store.get(REMEMBER, false);
  CLA.rememberKey = function (on) {
    store.set(REMEMBER, !!on);
    if (on) store.set('key', CLA.state.key || ''); else store.del('key');
  };
  CLA.setKey = function (k) {
    CLA.state.key = String(k || '').trim();
    if (store.get(REMEMBER, false)) store.set('key', CLA.state.key);
  };
  CLA.setModel = function (m) {
    CLA.state.model = String(m || '').trim() || DEFAULT_MODEL;
    store.set('model', CLA.state.model);
  };
  CLA.forget = function () {
    CLA.state.key = '';
    store.del('key'); store.set(REMEMBER, false);
  };
  /** Холбогдсон эсэх */
  CLA.ready = () => CLA.state.mode === 'proxy' || CLA.state.mode === 'key';

  /* ── Өөрчлөлтийг сонсогчид ── */
  const listeners = {};
  CLA.on = function (ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); };
  function emit(ev, data) { (listeners[ev] || []).forEach(f => { try { f(data); } catch (e) { } }); }

  /* ── Зэрэг явах хүсэлтийн тоог хязгаарлана ── */
  let active = 0;
  const MAX_PARALLEL = 3;
  const waiting = [];
  function acquire() {
    if (active < MAX_PARALLEL) { active++; return Promise.resolve(); }
    return new Promise(res => waiting.push(res));
  }
  function release() {
    active--;
    const next = waiting.shift();
    if (next) { active++; next(); }
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* ── Кэш: ижил асуултыг хоёр удаа төлбөргүй ── */
  const cache = new Map();
  const CACHE_MAX = 300;
  CLA.clearCache = () => cache.clear();
  CLA.cacheSize = () => cache.size;

  /* ── Бодит HTTP дуудлага ── */
  async function raw(body, signal) {
    const payload = JSON.stringify(Object.assign({}, body, { model: CLA.state.model }));

    if (CLA.state.mode === 'proxy') {
      const res = await fetch(CLA.state.proxyPath, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, signal
      });
      if (!res.ok) throw await httpError(res);
      return res.json();
    }

    const headers = { 'Content-Type': 'application/json' };
    if (CLA.state.key) {
      headers['x-api-key'] = CLA.state.key;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers, body: payload, signal
    });
    if (!res.ok) throw await httpError(res);
    return res.json();
  }

  async function httpError(res) {
    let detail = '';
    try {
      const j = await res.json();
      detail = (j.error && (j.error.message || j.error.type)) || j.message || '';
    } catch (e) {
      try { detail = (await res.text()).slice(0, 200); } catch (e2) { }
    }
    const err = new Error('HTTP ' + res.status + (detail ? ' — ' + detail : ''));
    err.status = res.status;
    return err;
  }

  /** Алдааг монголоор ойлгомжтой болгоно */
  CLA.humanError = function (err) {
    const s = err && err.status, m = String((err && err.message) || '');
    if (err && err.name === 'AbortError') return 'Цуцлагдлаа.';
    if (s === 401 || s === 403) return 'API түлхүүр буруу эсвэл хүчингүй байна.';
    if (s === 429) return 'Хэт олон хүсэлт — хэсэг хүлээгээд дахин оролдоно уу.';
    if (s === 400 && /credit|balance/i.test(m)) return 'Дансны үлдэгдэл дууссан байна.';
    if (s === 404) return 'Сонгосон загвар олдсонгүй. Өөр загвар сонгоно уу.';
    if (s >= 500) return 'Anthropic-ийн сервер түр завгүй байна. Дахин оролдоно уу.';
    if (/Failed to fetch|NetworkError|load failed/i.test(m)) return 'Интернэт холболт алга.';
    return m || 'Тодорхойгүй алдаа.';
  };

  const RETRYABLE = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);

  /** Дахин оролдлоготой дуудлага */
  CLA.call = async function (body, opts) {
    opts = opts || {};
    const tries = opts.tries || 3;
    await acquire();
    CLA.state.busy++; emit('busy', CLA.state.busy);
    try {
      let wait = 900;
      for (let attempt = 1; ; attempt++) {
        try {
          const data = await raw(body, opts.signal);
          CLA.state.calls++;
          if (data && data.usage) {
            CLA.state.inTokens += data.usage.input_tokens || 0;
            CLA.state.outTokens += data.usage.output_tokens || 0;
          }
          emit('usage', CLA.state);
          return data;
        } catch (err) {
          if (err.name === 'AbortError') throw err;
          const retryable = !err.status || RETRYABLE.has(err.status);
          if (attempt >= tries || !retryable) { CLA.state.lastError = err.message; throw err; }
          await sleep(wait); wait *= 2;
        }
      }
    } finally {
      CLA.state.busy--; emit('busy', CLA.state.busy);
      release();
    }
  };

  /** Нэг асуулт → нэг текст хариу */
  CLA.ask = async function (prompt, maxTokens, opts) {
    opts = opts || {};
    const ck = CLA.state.model + '¶' + (opts.system || '') + '¶' + prompt;
    if (!opts.noCache && cache.has(ck)) return cache.get(ck);

    const body = { max_tokens: maxTokens || 1200, messages: [{ role: 'user', content: prompt }] };
    if (opts.system) body.system = opts.system;
    if (opts.temperature != null) body.temperature = opts.temperature;

    const data = await CLA.call(body, opts);
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    if (!opts.noCache) {
      if (cache.size > CACHE_MAX) cache.clear();
      cache.set(ck, text);
    }
    return text;
  };

  /** JSON хариу — код блок, илүүдэл таслалыг уучилна */
  CLA.askJSON = async function (prompt, maxTokens, opts) {
    return CLA.parseJSON(await CLA.ask(prompt, maxTokens, opts));
  };
  CLA.parseJSON = function (txt) {
    const clean = String(txt || '').replace(/```json/gi, '').replace(/```/g, '').trim();
    const s = clean.indexOf('['), o = clean.indexOf('{');
    const start = s >= 0 && (o < 0 || s < o) ? s : o;
    const end = Math.max(clean.lastIndexOf(']'), clean.lastIndexOf('}'));
    if (start < 0 || end < 0) throw new Error('Хариунаас JSON олдсонгүй');
    let slice = clean.slice(start, end + 1);
    try { return JSON.parse(slice); }
    catch (e) { return JSON.parse(slice.replace(/,\s*([}\]])/g, '$1')); }
  };

  /**
   * Ямар горимд ажиллахыг тодорхойлно.
   * force=true бол кэшлэсэн хариултыг үл тоомсорлоно.
   */
  CLA.probe = async function () {
    CLA.state.mode = 'unknown'; emit('mode', CLA.state);

    /* 1) сервер прокси (файлаар нээсэн үед байхгүй) */
    if (CLA.state.proxyPath && location.protocol !== 'file:') {
      try {
        const res = await fetch(CLA.state.proxyPath, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ping: true })
        });
        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          if (j && j.ok) {
            CLA.state.mode = 'proxy';
            if (j.model) CLA.setModel(j.model);
            emit('mode', CLA.state);
            return 'proxy';
          }
        }
      } catch (e) { /* прокси алга — цааш */ }
    }

    /* 2) хэрэглэгчийн түлхүүр */
    if (!CLA.state.key) {
      CLA.state.mode = 'off';
      CLA.state.lastError = 'Түлхүүр оруулаагүй байна.';
      emit('mode', CLA.state);
      return 'off';
    }
    try {
      CLA.state.mode = 'key';
      await raw({ max_tokens: 8, messages: [{ role: 'user', content: 'Reply with: ok' }] });
      emit('mode', CLA.state);
      return 'key';
    } catch (e) {
      CLA.state.mode = 'off';
      CLA.state.lastError = CLA.humanError(e);
      emit('mode', CLA.state);
      return 'off';
    }
  };
})(window);
