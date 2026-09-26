/* ═════════════════════════════════════════════════════════════
   73 · Fusion заавар — хуудсыг угсрах
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const G = RM.fz, el = G.el, fmt = G.fmt;
  const icon = (id) => (RM.sim && RM.sim.icon ? RM.sim.icon(id) : "");

  /* Карт, жишээ, тохиргооны самбар — 69-guide-ui.js (Edit заавартай хамт хэрэглэнэ) */
  const CFG = { groups: G.groups, total: 28, demos: G.demos, simPage: "fusion", tipLabel: "Доод мөрөнд" };
  const buildTool = (tool, S) => G.ui.buildTool(tool, S, CFG);

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
    G.ui.buildLessonsPage({
      root: document.getElementById("fz"),
      brand: [el("b", { text: "Fusion" }), el("span", { text: " хэрэгслийн мөр" })],
      navOut: [el("a", { href: "index.html", text: "Толь" }), el("a", { href: "interface.html#fusion", text: "Загвар" })],
      hero: el("header", { class: "hero", id: "top" }, [
        el("p", { class: "eyebrow", text: "DaVinci Resolve Studio 21 · Fusion хуудас" }),
        el("h1", { text: "Fusion хэрэгслийн мөр" }),
        el("p", { class: "lead", html: fmt("Viewer ба Nodes самбарын хоорондох **28 товч** — хичээл бүр тусдаа хуудас: юу хийдэг, бичлэгт ямар нөлөө үзүүлдэг, Resolve дээр алхам алхмаар хэрхэн хэрэглэх вэ. Хичээл бүрт хөтөч дээр шууд туршдаг жишээ бий — слайдер хөдөлгөж, **Өмнө / Дараа**-аар харьцуулна.") }),
        buildToolbar()
      ]),
      basics: buildBasics(),
      groups: G.groups, tools: G.tools,
      buildTool: (t) => buildTool(t, S),
      recipes: buildRecipes(), recipesTitle: "Хамтдаа хэрэглэх 4 жишээ",
      baseTitle: "Fusion хэрэгслийн мөр",
      footer: el("footer", { class: "fz-foot" }, [
        el("p", { html: fmt("**Эх сурвалж.** Товчны дараалал, tooltip, доод мөрийн тайлбар — таны Resolve Studio 21-ийн 2026-09-25-ны дэлгэцийн зургаас, 28 товч бүгд. Тохиргооны нэрс — Blackmagic-ийн Fusion гарын авлагаас; Resolve 21-д зарим нь өөр байж болно, баталгаажаагүйг картанд тэмдэглэсэн.") }),
        el("p", { html: fmt("**Жишээнүүд** хөтөчийн шүүлтүүрээр ойролцоогоор дуурайлгасан — Fusion-ий бодит тооцоолол биш. Жишээний кадрыг кодоор зурсан.") })
      ])
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})(window.RM);
