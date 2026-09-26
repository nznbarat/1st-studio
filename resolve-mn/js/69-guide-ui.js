/* ═════════════════════════════════════════════════════════════
   69 · Жишээтэй заавар — нийтлэг бүрэлдэхүүн (Fusion, Edit хоёр хуудас хамт хэрэглэнэ)

   G.ui.buildControls(tool, specs, onChange) — слайдер, жагсаалт, чагт, товч
   G.ui.buildDemo(tool, S, demos)            — жишээний самбар (Өмнө / Дараа)
   G.ui.buildTool(tool, S, cfg)              — хэрэгслийн карт
      cfg = { groups, total, demos, simPage, tipLabel, impacts }
   G.ui.watchNav(sectionSelector)           — одоо уншиж буй бүлгийг цэсэнд тодруулах
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const G = (RM.fz = RM.fz || {});
  const icon = (id) => (RM.sim && RM.sim.icon ? RM.sim.icon(id) : "");
  let cid = 0;

  function buildControls(tool, specs, onChange) {
    const el = G.el;
    const box = el("div", { class: "ctrls" });
    const v = {}, inputs = {};
    specs.forEach((sp) => {
      const id = "c-" + tool.id + "-" + sp.id + "-" + ++cid;
      if (sp.type === "button") {
        const b = el("button", { type: "button", class: "cbtn", id, text: sp.label, onclick: () => onChange(sp.id) });
        inputs[sp.id] = { inp: b, btn: true };
        box.appendChild(el("div", { class: "crow btnrow" }, [b]));
        return;
      }
      v[sp.id] = sp.value;
      if (sp.type === "range") {
        const out = el("output", { for: id });
        const show = () => { const n = +v[sp.id]; out.textContent = (sp.fmt ? sp.fmt(n) : (Math.abs(n) >= 10 || sp.step >= 1 ? n.toFixed(0) : n.toFixed(2))) + (sp.unit || ""); };
        const inp = el("input", { type: "range", id, min: sp.min, max: sp.max, step: sp.step, value: sp.value,
          oninput: (e) => { v[sp.id] = +e.target.value; show(); onChange(); } });
        show();
        inputs[sp.id] = { inp, show };
        box.appendChild(el("div", { class: "crow" }, [el("label", { for: id, text: sp.label }), inp, out]));
      } else if (sp.type === "select") {
        const sel = el("select", { id, onchange: (e) => { v[sp.id] = e.target.value; onChange(); } },
          sp.options.map(([val, lb]) => el("option", { value: val, text: lb, selected: val === sp.value ? "selected" : null })));
        inputs[sp.id] = { inp: sel };
        box.appendChild(el("div", { class: "crow sel" }, [el("label", { for: id, text: sp.label }), sel]));
      } else if (sp.type === "check") {
        const cb = el("input", { type: "checkbox", id, checked: sp.value ? "checked" : null, onchange: (e) => { v[sp.id] = e.target.checked; onChange(); } });
        inputs[sp.id] = { inp: cb };
        box.appendChild(el("div", { class: "crow chk" }, [cb, el("label", { for: id, text: sp.label })]));
      }
    });
    const ctl = {
      set(k, val) { v[k] = val; const i = inputs[k]; if (!i) return; if (i.inp.type === "checkbox") i.inp.checked = !!val; else i.inp.value = val; if (i.show) i.show(); },
      disable(k, on) { const i = inputs[k]; if (i) { i.inp.disabled = !!on; i.inp.closest(".crow").classList.toggle("off", !!on); } },
      label(k, text) { const i = inputs[k]; if (i && i.btn) i.inp.textContent = text; }
    };
    return { box, v, ctl };
  }

  function buildDemo(tool, S, demos) {
    const el = G.el;
    const def = demos[tool.demo];
    const wrap = el("div", { class: "tool-demo" });
    if (!def) return wrap;
    const stage = el("div", { class: "stage" + (def.checker ? " checker" : "") + (def.cls ? " " + def.cls : ""), role: "img", "aria-label": tool.en + " — хөтөч дээрх жишээ" });
    wrap.appendChild(stage);
    const st = def.init(stage, S, tool);
    let before = false;
    const run = (act) => def.update(c.v, before, st, c.ctl, act);
    const c = buildControls(tool, def.controls, run);
    if (!def.noAB) {
      const bBefore = el("button", { type: "button", "aria-pressed": "false", text: def.abLabels ? def.abLabels[0] : "Өмнө" });
      const bAfter = el("button", { type: "button", "aria-pressed": "true", text: def.abLabels ? def.abLabels[1] : "Дараа" });
      const setAB = (b) => { before = b; bBefore.setAttribute("aria-pressed", b); bAfter.setAttribute("aria-pressed", !b); run(); };
      bBefore.addEventListener("click", () => setAB(true));
      bAfter.addEventListener("click", () => setAB(false));
      wrap.appendChild(el("div", { class: "ab" }, [
        el("div", { class: "seg", role: "group", "aria-label": "Өмнө, дараа харьцуулах" }, [bBefore, bAfter]),
        el("span", { class: "ab-hint", text: def.hint || "Хөтөч дээрх ойролцоо дуурайлга" })
      ]));
    }
    if (def.controls.length) wrap.appendChild(c.box);
    if (def.extra) wrap.appendChild(el("div", { class: "extra" }, [def.extra(st), el("p", { text: def.extraText || "Муруй: хэвтээ — оролт, босоо — гаралт. Улаан, ногоон, цэнхэр — суваг бүр." })]));
    run();
    return wrap;
  }

  function buildTool(tool, S, cfg) {
    const el = G.el, fmt = G.fmt;
    const g = cfg.groups.find((x) => x.id === tool.group);
    const imp = tool.impact && cfg.impacts ? cfg.impacts[tool.impact] : null;
    const text = el("div", { class: "tool-text" }, [
      el("section", {}, [el("h4", { text: "Юу хийдэг" }), el("p", { html: fmt(tool.what) })]),
      el("section", { class: "effect" }, [el("h4", { text: "Бичлэгт үзүүлэх нөлөө" }), el("p", { html: fmt(tool.effect) })]),
      el("section", {}, [el("h4", { text: "Resolve дээр алхам алхмаар" }), el("ol", {}, tool.steps.map((s) => el("li", { html: fmt(s) })))]),
      el("section", {}, [el("h4", { text: "Гол тохиргоо" }),
        el("dl", { class: "params" }, tool.params.flatMap(([k, d]) => [el("dt", { text: k }), el("dd", { html: fmt(d) })]))]),
      el("section", { class: "tips" }, [el("h4", { text: "Анхаарах" }), el("ul", {}, tool.tips.map((t) => el("li", { html: fmt(t) })))]),
      tool.unsure ? el("p", { class: "unsure", html: "<b>Баталгаажаагүй:</b> " + fmt(tool.unsure) }) : null,
      el("p", { class: "tool-links" }, [
        el("a", { href: "interface.html#" + cfg.simPage + "." + (tool.simId || tool.id), text: "Загвар дээр харах →" }),
        el("a", { href: "index.html#" + (tool.dictId || tool.id), text: "Толь, гарын авлага →" })
      ])
    ]);
    return el("article", { class: "tool", id: tool.id }, [
      el("header", { class: "tool-h" }, [
        el("span", { class: "tool-ic", html: icon(tool.iconId || tool.id) || '<span class="glyph">' + (tool.glyph || "•") + "</span>" }),
        el("div", {}, [
          el("p", { class: "tool-n", text: "№ " + tool.n + " / " + cfg.total + " · " + g.title }),
          el("h3", { text: tool.en }),
          el("p", { class: "tool-mn", text: tool.mn })
        ]),
        imp ? el("span", { class: "impact " + tool.impact, text: imp }) : null
      ]),
      el("p", { class: "tool-tip" }, [el("span", { text: cfg.tipLabel }), el("code", { text: tool.tip })]),
      el("div", { class: "tool-body" }, [text, buildDemo(tool, S, cfg.demos)])
    ]);
  }

  function watchNav(sel) {
    if (!("IntersectionObserver" in window)) return;
    const links = RM.$$(".fz-nav .chips a");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-40% 0px -55% 0px" });
    RM.$$(sel).forEach((s) => io.observe(s));
  }

  function jumpToHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && document.getElementById(h)) requestAnimationFrame(() => document.getElementById(h).scrollIntoView());
  }

  G.ui = { buildControls, buildDemo, buildTool, watchNav, jumpToHash };
})(window.RM);
