/* ═════════════════════════════════════════════════════════════
   73 · Fusion заавар — хуудсыг угсрах
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const G = RM.fz, el = G.el, fmt = G.fmt;
  const icon = (id) => (RM.sim && RM.sim.icon ? RM.sim.icon(id) : "");
  const groupOf = (id) => G.groups.find((g) => g.id === id);
  let cid = 0;

  /* ── тохиргооны самбар ── */
  function buildControls(tool, specs, onChange) {
    const box = el("div", { class: "ctrls" });
    const v = {}, inputs = {};
    specs.forEach((sp) => {
      const id = "c-" + tool.id + "-" + sp.id + "-" + ++cid;
      if (sp.type === "button") {
        const b = el("button", { type: "button", class: "cbtn", id, text: sp.label, onclick: () => onChange(sp.id) });
        box.appendChild(el("div", { class: "crow btnrow" }, [b]));
        return;
      }
      v[sp.id] = sp.value;
      if (sp.type === "range") {
        const out = el("output", { for: id });
        const show = () => { const n = +v[sp.id]; out.textContent = (Math.abs(n) >= 10 || sp.step >= 1 ? n.toFixed(0) : n.toFixed(2)) + (sp.unit || ""); };
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
      disable(k, on) { const i = inputs[k]; if (i) { i.inp.disabled = !!on; i.inp.closest(".crow").classList.toggle("off", !!on); } }
    };
    return { box, v, ctl };
  }

  /* ── жишээний самбар ── */
  function buildDemo(tool, S) {
    const def = G.demos[tool.demo];
    const wrap = el("div", { class: "tool-demo" });
    if (!def) return wrap;
    const stage = el("div", { class: "stage" + (def.checker ? " checker" : ""), role: "img", "aria-label": tool.en + " — хөтөч дээрх жишээ" });
    wrap.appendChild(stage);
    const st = def.init(stage, S);
    let before = false;
    const run = (act) => def.update(c.v, before, st, c.ctl, act);
    const c = buildControls(tool, def.controls, run);
    const bBefore = el("button", { type: "button", "aria-pressed": "false", text: "Өмнө" });
    const bAfter = el("button", { type: "button", "aria-pressed": "true", text: "Дараа" });
    const setAB = (b) => { before = b; bBefore.setAttribute("aria-pressed", b); bAfter.setAttribute("aria-pressed", !b); run(); };
    bBefore.addEventListener("click", () => setAB(true));
    bAfter.addEventListener("click", () => setAB(false));
    wrap.appendChild(el("div", { class: "ab" }, [
      el("div", { class: "seg", role: "group", "aria-label": "Эффекттэй, эффектгүй харьцуулах" }, [bBefore, bAfter]),
      el("span", { class: "ab-hint", text: "Хөтөч дээрх ойролцоо дуурайлга" })
    ]));
    wrap.appendChild(c.box);
    if (def.extra) wrap.appendChild(el("div", { class: "extra" }, [def.extra(st), el("p", { text: "Муруй: хэвтээ — оролт, босоо — гаралт. Улаан, ногоон, цэнхэр — суваг бүр." })]));
    run();
    return wrap;
  }

  /* ── хэрэгслийн карт ── */
  function buildTool(tool, S) {
    const g = groupOf(tool.group);
    const text = el("div", { class: "tool-text" }, [
      el("section", {}, [el("h4", { text: "Юу хийдэг" }), el("p", { html: fmt(tool.what) })]),
      el("section", { class: "effect" }, [el("h4", { text: "Бичлэгт үзүүлэх нөлөө" }), el("p", { html: fmt(tool.effect) })]),
      el("section", {}, [el("h4", { text: "Resolve дээр алхам алхмаар" }), el("ol", {}, tool.steps.map((s) => el("li", { html: fmt(s) })))]),
      el("section", {}, [el("h4", { text: "Гол тохиргоо" }),
        el("dl", { class: "params" }, tool.params.flatMap(([k, d]) => [el("dt", { text: k }), el("dd", { html: fmt(d) })]))]),
      el("section", { class: "tips" }, [el("h4", { text: "Анхаарах" }), el("ul", {}, tool.tips.map((t) => el("li", { html: fmt(t) })))]),
      tool.unsure ? el("p", { class: "unsure", html: "<b>Баталгаажаагүй:</b> " + fmt(tool.unsure) }) : null,
      el("p", { class: "tool-links" }, [
        el("a", { href: "interface.html#fusion." + tool.id, text: "Загвар дээр харах →" }),
        el("a", { href: "index.html#" + tool.id, text: "Толь, гарын авлага →" })
      ])
    ]);
    return el("article", { class: "tool", id: tool.id }, [
      el("header", { class: "tool-h" }, [
        el("span", { class: "tool-ic", html: icon(tool.id) }),
        el("div", {}, [
          el("p", { class: "tool-n", text: "№ " + tool.n + " / 28 · " + g.title }),
          el("h3", { text: tool.en }),
          el("p", { class: "tool-mn", text: tool.mn })
        ])
      ]),
      el("p", { class: "tool-tip" }, [el("span", { text: "Доод мөрөнд" }), el("code", { text: tool.tip })]),
      el("div", { class: "tool-body" }, [text, buildDemo(tool, S)])
    ]);
  }

  /* ── Resolve-ийн хэрэгслийн мөрийн хуулбар ── */
  function buildToolbar() {
    const status = el("span", { class: "tb-hint", text: "Товч дээр хулганаа тавина уу — Resolve шиг доор нэр, тайлбар нь гарна. Товшвол тухайн заавар руу очно." });
    const bar = el("div", { class: "tb", role: "toolbar", "aria-label": "Fusion хэрэгслийн мөр" });
    G.groups.forEach((g, gi) => {
      if (gi) bar.appendChild(el("span", { class: "tb-div", "aria-hidden": "true" }));
      G.tools.filter((t) => t.group === g.id).forEach((t) => {
        const a = el("a", { class: "tb-b", href: "#" + t.id, title: t.en, "aria-label": t.en + " — " + t.mn, html: icon(t.id) });
        const show = () => { status.textContent = t.tip; status.classList.add("on"); };
        a.addEventListener("mouseenter", show); a.addEventListener("focus", show);
        bar.appendChild(a);
      });
    });
    bar.addEventListener("mouseleave", () => status.classList.remove("on"));
    return el("div", { class: "tb-wrap" }, [
      el("div", { class: "tb-scroll" }, [bar]),
      el("div", { class: "tb-status" }, [status, el("span", { class: "tb-mem", text: "9% - 2973 MB" })])
    ]);
  }

  const node = (label, cls) => el("span", { class: "nd " + (cls || "") }, [el("span", { text: label })]);
  const arrow = () => el("span", { class: "ar", "aria-hidden": "true", text: "→" });
  const PORT = { bg: ["y", "шар (Background)"], fg: ["g", "ногоон (Foreground)"], mask: ["b", "цэнхэр (Effect Mask)"] };

  function buildBasics() {
    const flow = el("div", { class: "flow" }, [node("MediaIn1", "src"), arrow(), node("Blur1", "sel"), arrow(), node("MediaOut1", "out")]);
    return el("section", { class: "basics", id: "nod" }, [
      el("div", { class: "basics-text" }, [
        el("h2", { text: "Нод хэрхэн ажилладаг" }),
        el("p", { html: fmt("Fusion-д дүрс **зүүнээс баруун тийш** нодоос нод руу урсана. Хэрэгсэл бүр нэг нод: оролтоор дүрс авч, пикселийг өөрчлөөд, гаралтаар дараагийн нод руу дамжуулна. **MediaIn** — timeline-ийн клип, **MediaOut** — үр дүн буцаж timeline руу очих цэг.") }),
        flow,
        el("ul", { class: "ports" }, [
          el("li", { html: '<i class="pt y"></i><b>Шар гурвалжин</b> — гол оролт (Merge-д Background, доод давхарга).' }),
          el("li", { html: '<i class="pt g"></i><b>Ногоон</b> — Foreground: Merge-ийн дээд давхарга.' }),
          el("li", { html: '<i class="pt b"></i><b>Цэнхэр</b> — Effect Mask: маск холбоход эффект зөвхөн тэр хэсэгт үйлчилнэ.' }),
          el("li", { html: '<i class="pt o"></i><b>Дөрвөлжин</b> — гаралт; шугамыг эндээс дараагийн нодын оролт руу чирнэ.' })
        ])
      ]),
      el("div", { class: "basics-list" }, [
        el("h3", { text: "Хэрэгслийн мөрийг хэрэглэх" }),
        el("ol", {}, [
          "Nodes самбарт нод сонгоод товч дарвал шинэ нод **түүний ард** холбогдож нэмэгдэнэ.",
          "Товчийг Nodes самбар руу **чирвэл** хүссэн газраа тавина; холболтын шугам дээр тавибал дунд нь орно.",
          "Мөрөнд байхгүй нодыг Nodes самбарт [k:Shift+Space] — Select Tool цонхоор хайна.",
          "Нод сонгоод [k:1] эсвэл [k:2] — Viewer-т харуулна.",
          "Тохиргоо нь баруун талын **Inspector**-т; ◆ дээр дарж түлхүүр кадар тавина.",
          "Мөрийг нуух, харуулах — Fusion цэс → Show Toolbar."
        ].map((s) => el("li", { html: fmt(s) })))
      ])
    ]);
  }

  function buildRecipes() {
    return el("section", { class: "recipes", id: "jishee" }, [
      el("h2", { text: "Хамтдаа хэрэглэх 4 жишээ" }),
      el("p", { class: "lead", text: "Хэрэгслүүд ганцаараа биш, гинж болж ажилладаг. Доорх схем бүр Nodes самбарт яг ийм харагдана." }),
      el("div", { class: "rgrid" }, G.recipes.map((r) => {
        const chain = el("div", { class: "flow" });
        r.chain.forEach(([lb, k], i) => { if (i) chain.appendChild(arrow()); chain.appendChild(node(lb, k === "tool" ? "" : k)); });
        return el("article", { class: "recipe" }, [
          el("h3", { text: r.title }),
          chain,
          el("ul", { class: "side" }, r.side.map(([lb, port, idx]) => el("li", { html: '<i class="pt ' + PORT[port][0] + '"></i><b>' + lb + "</b> → " + r.chain[idx][0] + "-ийн " + PORT[port][1] + " оролт" }))),
          el("p", { class: "why", html: fmt(r.why) }),
          el("ol", {}, r.steps.map((s) => el("li", { html: fmt(s) })))
        ]);
      }))
    ]);
  }

  function build() {
    const S = G.build();
    const root = document.getElementById("fz");
    const nav = el("nav", { class: "fz-nav", "aria-label": "Бүлгүүд" }, [
      el("a", { class: "brand", href: "#top" }, [el("b", { text: "Fusion" }), el("span", { text: " хэрэгслийн мөр" })]),
      el("div", { class: "chips" }, [el("a", { href: "#nod", text: "Нод" })].concat(
        G.groups.map((g) => el("a", { href: "#g-" + g.id, text: g.title })), [el("a", { href: "#jishee", text: "Жишээ" })])),
      el("div", { class: "out" }, [el("a", { href: "index.html", text: "Толь" }), el("a", { href: "interface.html#fusion", text: "Загвар" })])
    ]);
    const hero = el("header", { class: "hero", id: "top" }, [
      el("p", { class: "eyebrow", text: "DaVinci Resolve Studio 21 · Fusion хуудас" }),
      el("h1", { text: "Fusion хэрэгслийн мөр" }),
      el("p", { class: "lead", html: fmt("Viewer ба Nodes самбарын хоорондох **28 товч** тус бүр юу хийдэг, бичлэгт ямар нөлөө үзүүлдэг, Resolve дээр алхам алхмаар хэрхэн хэрэглэх вэ. Карт бүрт хөтөч дээр шууд туршдаг жишээ бий — слайдер хөдөлгөж, **Өмнө / Дараа**-аар харьцуулна.") }),
      buildToolbar()
    ]);
    root.appendChild(nav);
    root.appendChild(hero);
    root.appendChild(buildBasics());
    G.groups.forEach((g, gi) => {
      const sec = el("section", { class: "grp", id: "g-" + g.id }, [
        el("div", { class: "grp-h" }, [
          el("p", { class: "eyebrow", text: "Бүлэг " + (gi + 1) + " / 6 · " + g.en }),
          el("h2", { text: g.title }),
          el("p", { class: "lead", html: fmt(g.intro) })
        ])
      ]);
      G.tools.filter((t) => t.group === g.id).forEach((t) => sec.appendChild(buildTool(t, S)));
      root.appendChild(sec);
    });
    root.appendChild(buildRecipes());
    root.appendChild(el("footer", { class: "fz-foot" }, [
      el("p", { html: fmt("**Эх сурвалж.** Товчны дараалал, tooltip, доод мөрийн тайлбар — таны Resolve Studio 21-ийн 2026-09-25-ны дэлгэцийн зургаас, 28 товч бүгд. Тохиргооны нэрс — Blackmagic-ийн Fusion гарын авлагаас; Resolve 21-д зарим нь өөр байж болно, баталгаажаагүйг картанд тэмдэглэсэн.") }),
      el("p", { html: fmt("**Жишээнүүд** хөтөчийн шүүлтүүрээр ойролцоогоор дуурайлгасан — Fusion-ий бодит тооцоолол биш. Жишээний кадрыг кодоор зурсан.") })
    ]));

    /* одоо уншиж буй бүлгийг цэсэнд тодруулах */
    if ("IntersectionObserver" in window) {
      const links = RM.$$(".fz-nav .chips a");
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      }), { rootMargin: "-40% 0px -55% 0px" });
      RM.$$("#nod, .grp, #jishee").forEach((s) => io.observe(s));
    }
    const h = decodeURIComponent(location.hash.slice(1));
    if (h && document.getElementById(h)) requestAnimationFrame(() => document.getElementById(h).scrollIntoView());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})(window.RM);
