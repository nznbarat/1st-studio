/* ═════════════════════════════════════════════════════════════
   80 · Claude-аас асуух — нэр томьёоны карт бүрд
   Хөнгөн сэдэв — бичсэн гарын авлага; гүнзгий асуулт — Claude шууд хариулна.

   Хоёр холболт:
   • claude.ai дээр нийтэлсэн хуудас — хуудасны «sample» чадвар (API түлхүүргүй,
     үзэгчийн өөрийн Claude эрхээр; анх асуухад зөвшөөрөл асууна).
   • Татаж авсан файл — хэрэглэгчийн өөрийн Anthropic API түлхүүр. Түлхүүр зөвхөн
     энэ хөтчийн localStorage-д хадгалагдаж, зөвхөн api.anthropic.com руу явна.
     Загварын нэрийг кодод бичээгүй — түлхүүрээр /v1/models-оос жагсааж авна.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const A = RM.ask = {};
  const el = RM.el;
  const inClaude = !!(window.claude && typeof window.claude.use === "function");
  A.mode = inClaude ? "claude" : "api";

  /* ── localStorage — хаагдсан үед (нууц цонх, хориг) алдаа шидэхгүй ── */
  const LS = { key: "rm.ask.key", model: "rm.ask.model" };
  const store = {
    get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } },
    set(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) { /* хадгалахгүй */ } }
  };

  /* ── идэвхтэй эсэх: <html class="ask-on"> ── */
  let state = inClaude ? "wait" : "api";      /* wait | ok | off | api */
  const on = (v) => {
    document.documentElement.classList.toggle("ask-on", !!v);
    if (inClaude) state = v ? "ok" : "off";
    chipUpdate();
  };
  let samplePromise = null;
  const getSample = () => samplePromise || (samplePromise = window.claude.use("sample").catch(() => null));

  /* ── Толгойн тэмдэг: Claude холбогдсон эсэх, хаанаас асуух ── */
  let chip = null, pop = null;
  const WHERE = "Нэр томьёоны карт бүрийн доор (загварт — баруун талын тайлбарын самбарт) «✦ Claude-аас асуух» мөрийг нээнэ.";
  function chipText() {
    if (state === "ok") return ["Claude холбогдсон", "claude.ai-ийн Claude таны эрхээр хариулна; анх асуухад зөвшөөрөл асууна. " + WHERE];
    if (state === "wait") return ["Claude…", "Claude-той холбогдож байна."];
    if (state === "off") return ["Claude холбогдоогүй", "Энэ харагдацад Claude-ын чадвар ажиллахгүй байна — хуудсыг шинэ цонхонд, эсвэл дэмждэггүй аппаар нээсэн байж магадгүй. claude.ai дээрх artifact-аар нь нээх, эсвэл татаж авсан файлд өөрийн API түлхүүрээр ашиглана уу."];
    return store.get(LS.key)
      ? ["Claude · API түлхүүр", "Таны Anthropic API түлхүүрээр холбогдоно. " + WHERE]
      : ["Claude · түлхүүр алга", "Энэ файлд Claude-ыг өөрийн Anthropic API түлхүүрээр холбоно. " + WHERE + " Эхний удаа ⚙ Тохиргоо нээгдэж түлхүүр асууна."];
  }
  function chipUpdate() {
    if (!chip) return;
    const [t, tip] = chipText();
    chip.className = "ask-chipbar " + state;
    chip.querySelector(".t").textContent = t;
    chip.title = tip;
    if (pop) pop.textContent = tip;
  }
  function chipMount() {
    const top = document.getElementById("top");
    if (!top || chip) return;
    chip = el("button", { type: "button", class: "ask-chipbar", "aria-expanded": "false" },
      [el("span", { class: "s", text: "✦" }), el("span", { class: "t" })]);
    chip.addEventListener("click", () => {
      if (pop) { pop.remove(); pop = null; chip.setAttribute("aria-expanded", "false"); return; }
      pop = el("div", { class: "ask-pop", role: "note" });
      document.body.appendChild(pop);
      const r = chip.getBoundingClientRect();
      pop.style.top = Math.round(r.bottom + 8) + "px";
      pop.style.right = Math.max(8, Math.round(window.innerWidth - r.right)) + "px";
      chip.setAttribute("aria-expanded", "true");
      chipUpdate();
    });
    document.addEventListener("click", (e) => { if (pop && !chip.contains(e.target)) { pop.remove(); pop = null; chip.setAttribute("aria-expanded", "false"); } });
    const sp = top.querySelector(".spacer");
    if (sp && sp.nextSibling) top.insertBefore(chip, sp.nextSibling); else top.appendChild(chip);
    chipUpdate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", chipMount); else chipMount();

  if (inClaude) getSample().then((s) => on(!!s));
  else on(true);

  /* claude.ai-д эдгээр алдаа гарвал энэ удаагийн нээлтэд боломжгүй — нууна */
  const GONE = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];

  const ERR = {
    rate_limited: "Хэт олон асуулт эсвэл таны хэрэглээний хязгаар дууссан. Түр хүлээгээд дахин асууна уу.",
    session_expired: "claude.ai-д дахин нэвтэрнэ үү.",
    refused: "Claude энэ асуултад хариулахаас татгалзлаа. Асуултаа өөрөөр бичнэ үү.",
    empty_completion: "Хариулт хоосон ирлээ. Асуултаа тодорхой болгоод дахин асууна уу.",
    prompt_too_large: "Асуулт хэт урт байна. Товчилно уу.",
    upstream_error: "Холболт тасарлаа. Дахин оролдоно уу.",
    bad_key: "API түлхүүр буруу эсвэл хүчингүй байна. ⚙ Тохиргооноос шалгана уу.",
    no_credit: "Anthropic данс дээр үлдэгдэл алга. console.anthropic.com-оос шалгана уу.",
    no_model: "Энэ түлхүүрээр ашиглах загвар олдсонгүй.",
    network: "api.anthropic.com руу холбогдож чадсангүй. Интернэтээ шалгана уу.",
    api_error: "API алдаа гарлаа."
  };

  /* ── Claude-д өгөх заавар: нэр томьёо, бичсэн гарын авлага, асуулт ── */
  const RULES = [
    "You are a patient teacher of DaVinci Resolve Studio 21 for Mongolian speakers.",
    "Answer in Mongolian (Cyrillic script), in the clear, practical style of the Blackmagic Design reference manual.",
    "Rules:",
    "- Keep every Resolve interface name in English exactly as Resolve shows it, and explain it in Mongolian the first time it appears.",
    "- Describe only what DaVinci Resolve Studio 21 really does. If you are not sure that a control exists, what it is called, or where it is in version 21, say so plainly with the word «баталгаажаагүй» instead of guessing.",
    "- Formatting (the page understands only this): '## ' for a short heading, '- ' for bullets, '1. ' for numbered steps, '> ' for a warning or tip, **bold** for interface names, and keyboard shortcuts written like [k:Ctrl+W]. No tables, no code blocks, no links, no other Markdown.",
    "- Stay focused on the learner's question; usually 150–400 words."
  ].join("\n");

  function context(row) {
    const page = RM.dict.page(row.page) || {};
    const cat = RM.dict.cat(row.cat) || {};
    const long = String(row.long || "").slice(0, 6000);
    return [
      "The term the learner has open:",
      "English: " + row.en,
      "Mongolian: " + row.mn,
      "Resolve page: " + (page.label || row.page || "") + (cat.label ? " — " + cat.label : ""),
      row.loc ? "Location in Resolve: " + row.loc : "",
      row.key ? "Shortcut: " + row.key : "",
      row.desc ? "Short description: " + row.desc : "",
      long ? "Manual text the learner can already read (do not repeat it — go deeper):\n" + long : "There is no written manual for this term yet."
    ].filter(Boolean).join("\n");
  }

  /* ── Claude-ийн хариуг хуудасны mini-markdown-д тааруулах ── */
  const tidy = (t) => String(t || "")
    .replace(/^#{3,6}\s+/gm, "## ")
    .replace(/^#\s+/gm, "## ")
    .replace(/^\s*\*\s+/gm, "- ")
    .replace(/`([^`\n]+)`/g, "$1")
    .replace(/\[\[([^\]]*)\]\]/g, "$1");

  /* ── Хэрэглэгчийн API түлхүүрээр ── */
  const API = "https://api.anthropic.com/v1/";
  const headers = (key) => ({
    "content-type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  });
  async function apiErr(res) {
    let msg = "";
    try { const j = await res.json(); msg = (j.error && j.error.message) || ""; } catch (e) { /* бие хоосон */ }
    const code = res.status === 401 || res.status === 403 ? "bad_key"
      : res.status === 429 ? "rate_limited"
      : /credit|balance|billing/i.test(msg) ? "no_credit" : "api_error";
    return { code, message: msg };
  }
  A.listModels = async function (key) {
    let res;
    try { res = await fetch(API + "models?limit=50", { headers: headers(key) }); }
    catch (e) { throw { code: "network" }; }
    if (!res.ok) throw await apiErr(res);
    const j = await res.json();
    return (j.data || []).map((m) => ({ id: m.id, name: m.display_name || m.id }));
  };
  async function apiModel(key) {
    const saved = store.get(LS.model);
    if (saved) return saved;
    const list = await A.listModels(key);   /* хамгийн сүүлд гарсан нь эхэнд */
    if (!list.length) throw { code: "no_model" };
    store.set(LS.model, list[0].id);
    return list[0].id;
  }
  async function askApi(turns, onText, signal) {
    const key = store.get(LS.key);
    if (!key) throw { code: "no_key" };
    const model = await apiModel(key);
    let res;
    try {
      res = await fetch(API + "messages", {
        method: "POST", signal, headers: headers(key),
        body: JSON.stringify({ model, max_tokens: 4000, stream: true, messages: turns })
      });
    } catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "network" }; }
    if (!res.ok) throw await apiErr(res);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = "", text = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
          const data = chunk.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("");
          if (!data) continue;
          let ev; try { ev = JSON.parse(data); } catch (e) { continue; }
          if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") { text += ev.delta.text; onText(text); }
          else if (ev.type === "error") throw { code: "api_error", message: ev.error && ev.error.message, text };
        }
      }
    } catch (e) {
      if (e && e.code) throw e;
      throw { code: e && e.name === "AbortError" ? "cancelled" : "upstream_error", text };
    }
    if (!text.trim()) throw { code: "empty_completion" };
    return { text };
  }

  /* ── claude.ai-ийн хуудсанд ── */
  async function askClaude(turns, onText, signal, first) {
    const sample = await getSample();
    if (!sample) throw { code: "not_granted" };
    const opts = { signal, onText: ({ text }) => onText(text) };
    if (!first) opts.cache = false;   /* үргэлжлэл асуулт бүр шинэ хариулт */
    return sample(turns, opts);
  }

  /* ── API түлхүүрийн тохиргоо (татаж авсан файлд) ── */
  function keyPanel(onDone) {
    const box = el("div", { class: "ask-key" });
    const inp = el("input", { type: "password", placeholder: "sk-ant-…", autocomplete: "off", spellcheck: "false", "aria-label": "Anthropic API түлхүүр" });
    inp.value = store.get(LS.key);
    const sel = el("select", { "aria-label": "Загвар", hidden: "" });
    const msg = el("p", { class: "ask-msg" });
    const load = el("button", { type: "button", class: "ask-btn", text: "Шалгах" });
    const save = el("button", { type: "button", class: "ask-btn pri", text: "Хадгалах" });
    const del = el("button", { type: "button", class: "ask-btn", text: "Устгах" });

    const fill = (list) => {
      sel.innerHTML = "";
      list.forEach((m) => sel.appendChild(el("option", { value: m.id, text: m.name })));
      const cur = store.get(LS.model);
      if (cur && list.some((m) => m.id === cur)) sel.value = cur;
      sel.hidden = !list.length;
    };
    load.onclick = async () => {
      const k = inp.value.trim();
      if (!k) { msg.textContent = "Түлхүүрээ оруулна уу."; return; }
      msg.textContent = "Шалгаж байна…";
      try { const list = await A.listModels(k); fill(list); msg.textContent = "Түлхүүр зөв. Загвараа сонгоод «Хадгалах»."; }
      catch (e) { msg.textContent = ERR[e.code] || e.message || ERR.api_error; }
    };
    save.onclick = () => {
      const k = inp.value.trim();
      if (!k) { msg.textContent = "Түлхүүрээ оруулна уу."; return; }
      store.set(LS.key, k);
      if (!sel.hidden && sel.value) store.set(LS.model, sel.value);
      msg.textContent = "Хадгаллаа.";
      chipUpdate();
      onDone && onDone();
    };
    del.onclick = () => { store.set(LS.key, ""); store.set(LS.model, ""); inp.value = ""; fill([]); msg.textContent = "Түлхүүрийг энэ хөтчөөс устгалаа."; chipUpdate(); onDone && onDone(); };

    box.append(
      el("p", { class: "ask-hint", html: "Энэ файлд Claude-ыг <b>өөрийн Anthropic API түлхүүрээр</b> холбоно — " +
        "<a href=\"https://console.anthropic.com/settings/keys\" target=\"_blank\" rel=\"noopener\">console.anthropic.com</a>-оос авна, асуулт бүрт API-ийн төлбөр гарна. " +
        "Түлхүүр зөвхөн энэ хөтчид хадгалагдаж, зөвхөн api.anthropic.com руу илгээгдэнэ. Нийтийн компьютерт бүү хадгална уу." }),
      el("div", { class: "ask-row" }, [inp, load]),
      el("div", { class: "ask-row" }, [sel, save, del]),
      msg
    );
    return box;
  }

  /* ── Картны «Claude-аас асуух» хэсэг ── */
  const CHIPS = [
    ["Илүү гүнзгий", "Үүнийг гарын авлагаас илүү гүнзгий тайлбарла: Resolve дотор яг хэрхэн ажилладаг, мэргэжлийн хүн хэзээ, яагаад хэрэглэдэг вэ?"],
    ["Алхам алхмаар жишээ", "Бодит ажлын нэг жишээг Resolve 21 дээр алхам алхмаар заа."],
    ["Түгээмэл алдаа", "Эхлэгчдийн гаргадаг түгээмэл алдаа, тэдгээрээс хэрхэн сэргийлэх вэ?"]
  ];

  A.box = function (row) {
    const det = el("details", { class: "ask" });
    det.appendChild(el("summary", { html: "<span class=\"ask-star\">✦</span><b>Claude-аас асуух</b><small>гүнзгий асуулт</small>" }));
    det.addEventListener("toggle", () => { if (det.open && !det.dataset.built) build(det, row); });
    return det;
  };

  function build(det, row) {
    det.dataset.built = "1";
    const turns = [];                      /* энэ картны яриа — зөвхөн хуудсанд */
    const log = el("div", { class: "ask-log", "aria-live": "polite" });
    const ta = el("textarea", { rows: "2", placeholder: "Асуултаа монголоор бичнэ үү…", "aria-label": "Асуулт" });
    const send = el("button", { type: "submit", class: "ask-btn pri", text: "Асуух" });
    const stop = el("button", { type: "button", class: "ask-btn", text: "Зогсоох", hidden: "" });
    const form = el("form", { class: "ask-form" }, [ta, el("div", { class: "ask-row end" }, [stop, send])]);
    const chips = el("div", { class: "ask-chips" }, CHIPS.map(([lb, q]) =>
      el("button", { type: "button", class: "ask-chip", text: lb, onclick: () => ask(q) })));
    const note = el("p", { class: "ask-note" });
    const body = el("div", { class: "ask-body" });
    let ctl = null, keyBox = null;

    const setNote = () => {
      note.innerHTML = "";
      if (A.mode === "claude") {
        note.textContent = "claude.ai-ийн Claude таны эрхээр хариулна. Анх асуухад зөвшөөрөл асууна. Хариултыг бичсэн гарын авлагатай тулгаж шалгана уу.";
      } else {
        const key = store.get(LS.key);
        note.append(key ? "Таны API түлхүүрээр · " + (store.get(LS.model) || "загвар автоматаар") + " · " : "API түлхүүр оруулаагүй · ");
        note.appendChild(el("button", { type: "button", class: "ask-link", text: "⚙ Тохиргоо", onclick: toggleKey }));
      }
    };
    const toggleKey = () => {
      if (keyBox) { keyBox.remove(); keyBox = null; return; }
      keyBox = keyPanel(() => { setNote(); if (store.get(LS.key)) { keyBox.remove(); keyBox = null; } });
      body.insertBefore(keyBox, body.firstChild);
    };

    const busy = (b) => { send.disabled = b; ta.disabled = b; stop.hidden = !b; chips.querySelectorAll("button").forEach((c) => (c.disabled = b)); };

    async function ask(q) {
      q = String(q || "").trim();
      if (!q || ctl) return;
      if (A.mode === "api" && !store.get(LS.key)) { if (!keyBox) toggleKey(); return; }
      const first = !turns.length;
      turns.push({ role: "user", content: first ? RULES + "\n\n" + context(row) + "\n\nThe learner's question:\n" + q : q });
      log.appendChild(el("div", { class: "ask-q", text: q }));
      const out = el("div", { class: "ask-a thinking", text: "Бодож байна…" });
      log.appendChild(out);
      ta.value = "";
      busy(true);
      ctl = new AbortController();
      const render = (t) => { out.classList.remove("thinking"); out.innerHTML = RM.md(tidy(t)); };
      try {
        const call = A.mode === "claude" ? askClaude : askApi;
        const r = await call(turns.slice(), render, ctl.signal, first);
        render(r.text);
        turns.push({ role: "assistant", content: r.text });
        if (r.truncated) out.appendChild(el("p", { class: "ask-msg", text: "Хариулт тасарсан — асуултаа хэсэгчлэн асууна уу." }));
      } catch (e) {
        e = e || {};
        turns.pop();                       /* амжилтгүй асуултыг ярианаас хасна */
        if (e.text && e.code !== "refused") render(e.text); else out.remove();
        if (A.mode === "claude" && GONE.includes(e.code)) { on(false); return; }
        if (e.code === "no_key") { if (!keyBox) toggleKey(); }
        else if (e.code !== "cancelled") log.appendChild(el("p", { class: "ask-msg", text: ERR[e.code] || e.message || ERR.upstream_error }));
        if (e.code === "bad_key") setNote();
      } finally {
        ctl = null; busy(false);
      }
    }

    stop.onclick = () => ctl && ctl.abort();
    form.addEventListener("submit", (e) => { e.preventDefault(); ask(ta.value); });
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ask(ta.value); } });

    body.append(chips, log, form, note);
    det.appendChild(body);
    setNote();
    if (A.mode === "api" && !store.get(LS.key)) toggleKey();
  }

  /* Бусад хэсэг (толь, загвар) ашиглахгүй бол ч алдаа гаргахгүй */
  A.available = () => document.documentElement.classList.contains("ask-on");
})(window.RM);
