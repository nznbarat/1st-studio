/* ═════════════════════════════════════════════════════════════
   DaVinci Resolve — Монгол хөтөч
   00 · Цөм: нэрийн орон зай, туслах функцууд
   ═════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  const RM = (global.RM = global.RM || {});

  RM.version = "1.0";

  /* ── DOM туслахууд ── */
  RM.$  = (sel, root) => (root || document).querySelector(sel);
  RM.$$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  RM.el = function (tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") n.className = attrs[k];
        else if (k === "text") n.textContent = attrs[k];
        else if (k === "html") n.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
      }
    }
    if (kids) (Array.isArray(kids) ? kids : [kids]).forEach((k) => {
      if (k == null) return;
      n.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
    });
    return n;
  };

  /* HTML-д аюулгүй болгох */
  RM.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /* Хайлтын үрийг тодруулах */
  RM.mark = function (text, q) {
    const safe = RM.esc(text);
    if (!q) return safe;
    const needle = RM.esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return safe.replace(new RegExp("(" + needle + ")", "gi"), "<mark>$1</mark>");
    } catch (e) { return safe; }
  };

  /* Кирилл/латин ялгаагүй жижигрүүлэлт */
  RM.norm = function (s) {
    return String(s == null ? "" : s).toLowerCase().replace(/ё/g, "е").trim();
  };

  /* Хугацаа хойшлуулагч (хайлтын оролтод) */
  RM.debounce = function (fn, ms) {
    let t = 0;
    return function () {
      const args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(self, args), ms || 120);
    };
  };

  /* Түр зуурын мэдэгдэл */
  RM.toast = function (msg) {
    let box = RM.$("#toast");
    if (!box) {
      box = RM.el("div", { id: "toast" });
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.classList.add("on");
    clearTimeout(RM.toast._t);
    RM.toast._t = setTimeout(() => box.classList.remove("on"), 1800);
  };

  /* Санах ойд хадгалах (localStorage аюулгүй) */
  RM.store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem("rm." + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem("rm." + key, JSON.stringify(val)); } catch (e) { /* үл хайхрах */ }
    },
    del(key) {
      try { localStorage.removeItem("rm." + key); } catch (e) { /* үл хайхрах */ }
    }
  };

  /* Хуулах */
  RM.copy = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => RM.toast("Хуулагдлаа: " + text),
        () => RM.toast("Хуулж чадсангүй")
      );
      return;
    }
    const ta = RM.el("textarea", { style: "position:fixed;opacity:0" });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); RM.toast("Хуулагдлаа: " + text); }
    catch (e) { RM.toast("Хуулж чадсангүй"); }
    ta.remove();
  };

})(window);
