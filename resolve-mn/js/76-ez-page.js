/* ═════════════════════════════════════════════════════════════
   76 · Edit хуудасны заавар — хуудсыг угсрах
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const E = RM.ez, G = RM.fz, el = G.el, fmt = G.fmt;
  const icon = (id) => (RM.sim && RM.sim.icon ? RM.sim.icon(id) : "");
  const byId = (id) => E.tools.find((t) => t.id === id);
  const CFG = { groups: E.groups, total: E.tools.length, demos: E.demos, simPage: "edit", tipLabel: "Tooltip", impacts: E.impacts };

  /* Resolve-ийн timeline хэрэгслийн мөрийн хуулбар — зүүнээс баруун, зурагт байгаа дарааллаар */
  const BAR = [
    ["timeline-view-options", "show-keyframe-tray", "voiceover"],
    ["selection-mode", "trim-edit-mode", "blade", "dynamic-trim-mode-slip"],
    ["insert", "overwrite", "replace"],
    ["snapping", "linked-selection", "position-lock"],
    ["flag", "marker"],
    ["full-extent-zoom", "detail-zoom", "custom-zoom"]
  ];

  function buildToolbar() {
    const status = el("span", { class: "tb-hint", text: "Товч дээр хулганаа тавина уу — Resolve-ийн tooltip доор гарна. Товшвол тухайн заавар руу очно." });
    const bar = el("div", { class: "tb ez-tb", role: "toolbar", "aria-label": "Edit timeline-ийн хэрэгслийн мөр" });
    BAR.forEach((g, gi) => {
      if (gi) bar.appendChild(el("span", { class: "tb-div", "aria-hidden": "true" }));
      g.forEach((id) => {
        const t = byId(id);
        const a = el("a", { class: "tb-b" + (id === "selection-mode" ? " red" : "") + (id === "full-extent-zoom" ? " on" : ""), href: "#" + id, title: t.tip, "aria-label": t.en + " — " + t.mn, html: icon(id) });
        const show = () => { status.textContent = t.tip; status.classList.add("on"); };
        a.addEventListener("mouseenter", show); a.addEventListener("focus", show);
        bar.appendChild(a);
        if (id === "flag" || id === "marker") bar.appendChild(el("a", { class: "tb-dd", href: "#" + id, "aria-hidden": "true", tabindex: "-1", text: "⌄" }));
      });
    });
    bar.appendChild(el("span", { class: "tb-zoom", "aria-hidden": "true" }, [el("span", { text: "−" }), el("i"), el("span", { text: "+" })]));
    bar.addEventListener("mouseleave", () => status.classList.remove("on"));
    return el("div", { class: "tb-wrap" }, [
      el("div", { class: "tb-scroll" }, [bar]),
      el("div", { class: "tb-status" }, [status, el("span", { class: "tb-mem", text: "Edit · Resolve Studio 21" })])
    ]);
  }

  function buildBasics() {
    const imp = (k, d) => el("li", {}, [el("span", { class: "impact " + k, text: E.impacts[k] }), el("span", { html: fmt(d) })]);
    return el("section", { class: "basics", id: "suuri" }, [
      el("div", { class: "basics-text" }, [
        el("h2", { text: "Бичлэгт нөлөөлөх үү?" }),
        el("p", { html: fmt("Edit хуудасны товч бүр **гурван өөр түвшинд** ажилладаг. Эхлээд үүнийг ялгах нь чухал: зарим нь **монтажийг** (аль клип хэзээ, хэр удаан) өөрчилнө, зарим нь **дүрсийг** (пиксел), харин нэлээд олон нь зөвхөн **таны нүдэнд** — харагдац, тэмдэглэл. Карт бүрийн баруун дээд талд энэ шошго бий.") }),
        el("ul", { class: "imp-list" }, [
          imp("edit", "Клипийн байрлал, урт, дараалал — Selection, Trim, Blade, Insert, Overwrite, Replace."),
          imp("image", "Кадрын агуулга — Transform, Crop, Dynamic Zoom, Smart Reframe, OpenFX, Fusion."),
          imp("audio", "Timeline-д шинэ дуу — Voiceover."),
          imp("note", "Туг, тэмдэглэгээ, Annotations — Deliver-ээр гаргасан файлд орохгүй."),
          imp("view", "Snapping, Linked Selection, томруулалт, Timeline View Options, Jog Wheel."),
          imp("protect", "Position Lock — монтажийг санамсаргүй өөрчлөлтөөс.")
        ])
      ]),
      el("div", { class: "basics-list" }, [
        el("h3", { text: "Жишээн дээрх timeline-ийг унших" }),
        el("ol", {}, [
          "**V1** — видео зам, **A1** — дууны зам. Нэг файлын видео, дуу хамт (холбоотой).",
          "**A · B · C** — гурван клип. Клип бүрт **эх 2.0–8.0** гэх мэт — эх бичлэгийн аль хэсэг харагдаж байгаа (slip-ийн ялгааг эндээс харна).",
          "**Улаан босоо шугам** — заагч (playhead).",
          "**Судалтай хэсэг** — хоосон зай (gap): тоглуулахад хар.",
          "**Шар хүрээ** — үйлдлээр өөрчлөгдсөн клип; **тасархай хүрээ** — өмнөх байрлал.",
          "Доод мөрөнд timeline-ийн **нийт урт** — Insert, Ripple уртыг өөрчилдөг, Overwrite, Roll өөрчилдөггүй.",
          "**Өмнө / Дараа** товчоор үйлдлийн өмнөх, дараах байдлыг харьцуулна."
        ].map((s) => el("li", { html: fmt(s) })))
      ])
    ]);
  }

  function buildRecipes() {
    return el("section", { class: "recipes", id: "jishee" }, [
      el("h2", { text: "Хамтдаа хэрэглэх 4 жишээ" }),
      el("p", { class: "lead", text: "Товчнууд ганцаараа биш, дараалал болж ажилладаг. Шошгон дээр дарвал тухайн картанд очно." }),
      el("div", { class: "rgrid" }, E.recipes.map((r) => el("article", { class: "recipe" }, [
        el("h3", { text: r.title }),
        el("div", { class: "chips-row" }, r.chain.map((id, i) => [i ? el("span", { class: "ar", "aria-hidden": "true", text: "→" }) : null,
          el("a", { class: "tchip", href: "#" + id, html: icon(id) + "<span>" + byId(id).en + "</span>" })]).flat().filter(Boolean)),
        el("p", { class: "why", html: fmt(r.why) }),
        el("ol", {}, r.steps.map((s) => el("li", { html: fmt(s) })))
      ])))
    ]);
  }

  function build() {
    const S = G.build();
    const root = document.getElementById("fz");
    root.appendChild(el("nav", { class: "fz-nav", "aria-label": "Бүлгүүд" }, [
      el("a", { class: "brand", href: "#top" }, [el("b", { text: "Edit" }), el("span", { text: " хэрэгслийн мөр" })]),
      el("div", { class: "chips" }, [el("a", { href: "#suuri", text: "Нөлөө" })].concat(
        E.groups.map((g) => el("a", { href: "#g-" + g.id, text: g.title })), [el("a", { href: "#jishee", text: "Жишээ" })])),
      el("div", { class: "out" }, [el("a", { href: "index.html", text: "Толь" }), el("a", { href: "interface.html#edit", text: "Загвар" }), el("a", { href: "fusion-zaavar.html", text: "Fusion" })])
    ]));
    root.appendChild(el("header", { class: "hero", id: "top" }, [
      el("p", { class: "eyebrow", text: "DaVinci Resolve Studio 21 · Edit хуудас" }),
      el("h1", { text: "Edit хэрэгслийн мөр" }),
      el("p", { class: "lead", html: fmt("Timeline-ийн хэрэгслийн мөрийн **товч бүр**, viewer дээрх **удирдлагын горим** юу хийдэг, бичлэгт **ямар нөлөө** үзүүлдэг вэ. Карт бүрт хөтөч дээр шууд туршдаг жишээ бий — клип зөөж, тайрч, шигтгэж, **Өмнө / Дараа**-аар харьцуулна.") }),
      buildToolbar()
    ]));
    root.appendChild(buildBasics());
    E.groups.forEach((g, gi) => {
      const sec = el("section", { class: "grp", id: "g-" + g.id }, [
        el("div", { class: "grp-h" }, [
          el("p", { class: "eyebrow", text: "Бүлэг " + (gi + 1) + " / " + E.groups.length + " · " + g.en }),
          el("h2", { text: g.title }),
          el("p", { class: "lead", html: fmt(g.intro) })
        ])
      ]);
      E.tools.filter((t) => t.group === g.id).forEach((t) => sec.appendChild(G.ui.buildTool(t, S, CFG)));
      root.appendChild(sec);
    });
    root.appendChild(buildRecipes());
    root.appendChild(el("footer", { class: "fz-foot" }, [
      el("p", { html: fmt("**Эх сурвалж.** Товчны дараалал, tooltip, цэсний мөр — таны Resolve Studio 21-ийн 2026-09-26-ны дэлгэцийн зургаас. Үйлдлийн тайлбар — Blackmagic-ийн гарын авлага, Resolve-ийн түгээмэл ажиллагаанаас; баталгаажаагүйг картанд тэмдэглэсэн.") }),
      el("p", { html: fmt("**Жишээнүүд** хөтөч дээр ойролцоогоор дуурайлгасан — Resolve-ийн бодит тооцоолол биш. Кадрыг кодоор зурсан; A · B · C клип нь жишээний нэр.") })
    ]));
    G.ui.watchNav("#suuri, .grp, #jishee");
    G.ui.jumpToHash();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})(window.RM);
