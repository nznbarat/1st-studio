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
        el("dl", { class: "params" }, tool.params.flatMap(([k, d]) => [el("dt", { html: fmt(k) }), el("dd", { html: fmt(d) })]))]),
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


  /* ══════════ Хичээлийн горим — нэг удаад нэг хичээл (хэрэглэгчийн хүсэлтээр) ══════════
     Нүүр (#top): hero, үндэс, хичээлийн жагсаалт (#hicheel). #<id> — тэр хичээл л харагдана,
     доор нь «‹ Өмнөх · Дараах ›», дээр нь явцын зурвас. ← → товчоор шилжинэ. */
  function buildLessonsPage(c) {
    const el = G.el, fmt = G.fmt;
    const root = c.root;
    const firstOf = (gid) => c.tools.find((t) => t.group === gid);
    root.appendChild(el("nav", { class: "fz-nav", "aria-label": "Хичээлүүд" }, [
      el("a", { class: "brand", href: "#top" }, c.brand),
      el("div", { class: "chips" }, [el("a", { href: "#top", text: "Нүүр" })].concat(
        c.groups.map((g) => el("a", { href: "#" + firstOf(g.id).id, "data-group": g.id, text: g.title })),
        [el("a", { href: "#jishee", "data-group": "jishee", text: "Жишээ" })])),
      el("div", { class: "out" }, c.navOut)
    ]));

    /* нүүр */
    const toc = el("section", { class: "toc", id: "hicheel" }, [
      el("h2", { text: "Хичээлүүд" }),
      el("p", { class: "lead", html: fmt("Хичээл бүр **тусдаа хуудас**: юу хийдэг, бичлэгт үзүүлэх нөлөө, алхам алхмаар, туршдаг жишээ. Доод талын **Дараах ›** товчоор, эсвэл гарын [k:←] [k:→]-оор дараалан үзнэ.") })
    ].concat(c.groups.map((g, gi) => el("div", { class: "toc-g" }, [
      el("h3", {}, [el("span", { class: "toc-gn", text: String(gi + 1).padStart(2, "0") }), g.title, el("small", { text: g.en })]),
      el("div", { class: "toc-grid" }, c.tools.filter((t) => t.group === g.id).map((t) => el("a", { class: "toc-i", href: "#" + t.id }, [
        el("span", { class: "toc-ic", html: icon(t.iconId || t.id) || t.glyph || "•" }),
        el("span", { class: "toc-t" }, [el("small", { text: "№ " + t.n }), el("b", { text: t.en }), el("span", { text: t.mn })]),
        t.impact && c.impacts ? el("span", { class: "impact " + t.impact, text: c.impacts[t.impact] }) : null
      ])))
    ]))).concat([el("div", { class: "toc-g" }, [el("h3", {}, [el("span", { class: "toc-gn", text: "★" }), c.recipesTitle]),
      el("div", { class: "toc-grid" }, [el("a", { class: "toc-i", href: "#jishee" }, [el("span", { class: "toc-ic", text: "⛓" }),
        el("span", { class: "toc-t" }, [el("small", { text: "Сүүлийн хичээл" }), el("b", { text: c.recipesTitle }), el("span", { text: "Хэрэгслүүдийг дараалан хэрэглэх" })])])])])]));
    const intro = el("div", { class: "intro" }, [c.hero, c.basics, toc]);
    root.appendChild(intro);

    /* хичээлүүд */
    const lessons = c.tools.map((t) => ({ id: t.id, group: t.group, title: t.en, node: c.buildTool(t) }));
    lessons.push({ id: "jishee", group: "jishee", title: c.recipesTitle, node: c.recipes });
    const wrap = el("div", { class: "lessons" });
    lessons.forEach((L, i) => {
      const g = c.groups.find((x) => x.id === L.group);
      const first = g && firstOf(g.id).id === L.id;
      const sec = el("section", { class: "lesson", "aria-label": L.title, hidden: "hidden" }, [
        el("div", { class: "crumb" }, [
          el("a", { href: "#hicheel", text: "☰ Хичээлүүд" }),
          el("span", { text: "Хичээл " + (i + 1) + " / " + lessons.length + (g ? " · " + g.title : "") }),
          el("span", { class: "prog", "aria-hidden": "true" }, [el("i", { style: "width:" + ((i + 1) / lessons.length * 100).toFixed(1) + "%" })])
        ]),
        first ? el("div", { class: "grp-h lesson-grp" }, [
          el("p", { class: "eyebrow", text: "Бүлэг " + (c.groups.indexOf(g) + 1) + " / " + c.groups.length + " · " + g.en }),
          el("h2", { text: g.title }), el("p", { class: "lead", html: fmt(g.intro) })]) : null,
        L.node
      ]);
      const prev = lessons[i - 1], next = lessons[i + 1];
      const pg = (cls, href, small, big) => el("a", { class: "pg " + cls, href }, [el("small", { text: small }), el("span", { text: big })]);
      sec.appendChild(el("nav", { class: "pager", "aria-label": "Хичээл хооронд шилжих" }, [
        prev ? pg("prev", "#" + prev.id, "‹ Өмнөх", prev.title) : pg("prev", "#top", "‹ Буцах", "Нүүр"),
        el("a", { class: "pg toc-l", href: "#hicheel", text: "☰" , title: "Бүх хичээл", "aria-label": "Бүх хичээл" }),
        next ? pg("next", "#" + next.id, "Дараах ›", next.title) : pg("next", "#hicheel", "Дуусав ✓", "Хичээлийн жагсаалт")
      ]));
      L.el = sec;
      wrap.appendChild(sec);
    });
    root.appendChild(wrap);
    root.appendChild(c.footer);

    const idx = {}; lessons.forEach((L, i) => { idx[L.id] = i; });
    const chips = RM.$$(".fz-nav .chips a");
    const route = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      const cur = Object.prototype.hasOwnProperty.call(idx, h) ? lessons[idx[h]] : null;
      intro.hidden = !!cur;
      lessons.forEach((L) => { L.el.hidden = L !== cur; });
      document.title = cur ? cur.title + " · " + c.baseTitle : c.baseTitle;
      chips.forEach((a) => a.classList.toggle("on", cur ? a.getAttribute("data-group") === cur.group : a.getAttribute("href") === "#top"));
      const on = RM.$(".fz-nav .chips a.on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "nearest" });
      const target = !cur && h && document.getElementById(h);
      if (target) target.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", (e) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      const h = decodeURIComponent(location.hash.slice(1));
      if (!Object.prototype.hasOwnProperty.call(idx, h)) return;
      const i = idx[h];
      if (e.key === "ArrowRight" && lessons[i + 1]) location.hash = lessons[i + 1].id;
      else if (e.key === "ArrowLeft") location.hash = lessons[i - 1] ? lessons[i - 1].id : "top";
    });
    route();
  }

  G.ui = { buildControls, buildDemo, buildTool, watchNav, jumpToHash, buildLessonsPage };
})(window.RM);
