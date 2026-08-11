/* ═════════════════════════════════════════════════════════════
   ЕРТӨНЦ БҮТЭЭГЧ v3 — цөм (core)
   Дэлхийн хаанаас ч ажиллах ганц дэлгэцийн апп.
   Энэ файл: нэрийн орон зай, туслах функцууд, хадгалалт, мэдэгдэл.
   ═════════════════════════════════════════════════════════════ */
(function (root) {
  "use strict";

  const WB = (root.WB = root.WB || {});
  WB.version = "3.0.0";

  /* ── жижиг туслахууд ────────────────────────────────────── */
  const U = (WB.util = {});

  U.uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

  U.el = (id) => document.getElementById(id);
  U.qs = (sel, ctx) => (ctx || document).querySelector(sel);
  U.qsa = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  U.esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  U.debounce = (fn, ms) => {
    let t = null;
    const wrapped = (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
    wrapped.cancel = () => clearTimeout(t);
    wrapped.flush = (...a) => {
      clearTimeout(t);
      fn(...a);
    };
    return wrapped;
  };

  U.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  U.clone = (o) => (typeof structuredClone === "function" ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

  U.pad2 = (n) => String(n).padStart(2, "0");

  U.slug = (s) =>
    String(s || "")
      .replace(/[^\wа-яА-ЯөүӨҮёЁ -]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "tosol";

  /** Даалгаврын жагсаалтыг зэрэг (concurrency) хязгаартай гүйцэтгэнэ. */
  U.pool = async function (items, limit, worker, onProgress) {
    const results = new Array(items.length);
    let index = 0;
    let done = 0;
    const runners = new Array(Math.max(1, Math.min(limit, items.length))).fill(0).map(async () => {
      for (;;) {
        const i = index++;
        if (i >= items.length) return;
        try {
          results[i] = await worker(items[i], i);
        } catch (err) {
          results[i] = { __error: err };
        }
        done++;
        if (onProgress) onProgress(done, items.length);
      }
    });
    await Promise.all(runners);
    return results;
  };

  /* ── товч мэдэгдэл (toast) — alert()‑ийн оронд ──────────── */
  let toastBox = null;
  U.toast = function (msg, kind, ms) {
    if (!toastBox) {
      toastBox = document.createElement("div");
      toastBox.id = "toasts";
      document.body.appendChild(toastBox);
    }
    const t = document.createElement("div");
    t.className = "toast " + (kind || "info");
    t.textContent = msg;
    t.onclick = () => t.remove();
    toastBox.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 260);
    }, ms || (kind === "bad" ? 6500 : 3200));
    return t;
  };

  /* ── баталгаажуулах цонх (confirm‑ийн оронд) ────────────── */
  U.confirm = function (question, okLabel) {
    return new Promise((resolve) => {
      const back = document.createElement("div");
      back.className = "modal on confirm-modal";
      back.innerHTML =
        '<div class="mbox small"><p class="qtext"></p>' +
        '<div class="mrow"><button class="acc" data-yes></button><button data-no>Болих</button></div></div>';
      back.querySelector(".qtext").textContent = question;
      back.querySelector("[data-yes]").textContent = okLabel || "Тийм";
      const close = (v) => {
        back.remove();
        resolve(v);
      };
      back.querySelector("[data-yes]").onclick = () => close(true);
      back.querySelector("[data-no]").onclick = () => close(false);
      back.addEventListener("click", (e) => {
        if (e.target === back) close(false);
      });
      document.body.appendChild(back);
      back.querySelector("[data-yes]").focus();
    });
  };

  /* ── localStorage бүрхүүл (хаалттай горимд ч унахгүй) ───── */
  const LS = (WB.store = {});
  const KEY = "wb3:";
  let memFallback = {};
  let lsOK = (() => {
    try {
      const k = KEY + "__t";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })();

  LS.available = lsOK;
  LS.get = function (name, dflt) {
    try {
      const raw = lsOK ? localStorage.getItem(KEY + name) : memFallback[name];
      return raw == null ? dflt : JSON.parse(raw);
    } catch (e) {
      return dflt;
    }
  };
  LS.set = function (name, value) {
    const raw = JSON.stringify(value);
    try {
      if (lsOK) localStorage.setItem(KEY + name, raw);
      else memFallback[name] = raw;
      return true;
    } catch (e) {
      /* хязгаар дүүрсэн ч апп унах ёсгүй */
      memFallback[name] = raw;
      return false;
    }
  };
  LS.del = function (name) {
    try {
      if (lsOK) localStorage.removeItem(KEY + name);
    } catch (e) {}
    delete memFallback[name];
  };
  LS.keys = function (prefix) {
    const out = [];
    try {
      if (lsOK) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(KEY + (prefix || ""))) out.push(k.slice(KEY.length));
        }
      }
    } catch (e) {}
    for (const k of Object.keys(memFallback)) {
      if (k.startsWith(prefix || "") && !out.includes(k)) out.push(k);
    }
    return out;
  };

  /* ── энгийн эвент шин ───────────────────────────────────── */
  const handlers = {};
  WB.on = (name, fn) => ((handlers[name] = handlers[name] || []).push(fn), fn);
  WB.emit = (name, payload) => (handlers[name] || []).forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.error("[WB]", name, e);
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
