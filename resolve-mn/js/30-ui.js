/* ═════════════════════════════════════════════════════════════
   30 · Интерфейс — хайлт, жагсаалт, хөтөч
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const UI = (RM.ui = RM.ui || {});
  const $ = RM.$, el = RM.el;

  UI.state = {
    q:    "",
    page: "all",
    cat:  "all",
    view: RM.store.get("view", "hailt")
  };

  /* ══════════ Зүүн талын хөтлөгч ══════════ */

  UI.buildRail = function () {
    const rail = $("#rail");
    rail.innerHTML = "";

    const views = [
      { id: "hailt",  n: "◎", t: "Хайлт",     s: "Нэр томьёо хайх" },
      { id: "huudas", n: "▦", t: "Хуудсаар",  s: "Resolve-ийн 7 хуудас" },
      { id: "tovch",  n: "⌨", t: "Товчлуур",  s: "Гарын товчлуурууд" },
      { id: "hutuch", n: "▶", t: "Хөтөч",     s: "Алхам алхмаар заавар" },
      { id: "tuhai",  n: "ⓘ", t: "Тухай",     s: "Энэ юу вэ" }
    ];

    views.forEach((v) => {
      const b = el("button", {
        class: "step" + (UI.state.view === v.id ? " on" : ""),
        "data-v": v.id,
        onclick: () => UI.go(v.id)
      });
      b.appendChild(el("span", { class: "n", text: v.n }));
      const wrap = el("span");
      wrap.appendChild(el("b", { text: v.t }));
      wrap.appendChild(el("small", { text: v.s }));
      b.appendChild(wrap);
      rail.appendChild(b);
    });

    const sec = el("div", { class: "railsec" });
    sec.appendChild(el("div", { class: "railstat", html:
      "<b>" + RM.dict.size() + "</b> нэр томьёо<br>" +
      "<b>" + RM.dict.cats.length + "</b> ангилал<br>" +
      "<b>" + RM.guides.length + "</b> ажлын урсгал" }));
    rail.appendChild(sec);
  };

  UI.go = function (view) {
    UI.state.view = view;
    RM.store.set("view", view);
    RM.$$("#rail .step").forEach((b) => b.classList.toggle("on", b.getAttribute("data-v") === view));
    RM.$$("#main .panel").forEach((p) => p.classList.toggle("on", p.id === "p-" + view));
    if (view === "hailt")  { const i = $("#q"); if (i) i.focus(); }
    if (view === "huudas") UI.renderPages();
    if (view === "tovch")  UI.renderKeys();
    if (view === "hutuch") UI.renderGuides();
    window.scrollTo(0, 0);
    const m = $("#main"); if (m) m.scrollTop = 0;
  };

  /* ══════════ Шүүлтүүрийн товчнууд ══════════ */

  UI.buildFilters = function () {
    /* хуудсаар шүүх */
    const pf = $("#pageFilter");
    pf.innerHTML = "";
    pf.appendChild(mkChip("all", "Бүгд", RM.dict.size(), () => setPage("all")));
    RM.dict.pages.forEach((p) => {
      const n = RM.dict.pageCount(p.id);
      if (!n) return;
      pf.appendChild(mkChip(p.id, p.icon + " " + p.label, n, () => setPage(p.id)));
    });

    UI.buildCatFilter();

    function setPage(id) {
      UI.state.page = id;
      UI.state.cat = "all";
      RM.$$("#pageFilter .chip").forEach((c) => c.classList.toggle("on", c.getAttribute("data-id") === id));
      UI.buildCatFilter();
      UI.renderResults();
    }
  };

  UI.buildCatFilter = function () {
    const cf = $("#catFilter");
    cf.innerHTML = "";
    /* Ангиллын шүүлтүүрийг зөвхөн тодорхой хуудас сонгосон үед гаргана —
       бүх ангиллыг зэрэг харуулбал 26 товч болж нүд зайлуулна. */
    if (UI.state.page === "all") { cf.classList.remove("on"); return; }
    const cats = RM.dict.cats.filter((c) => c.page === UI.state.page);
    if (cats.length < 2) { cf.classList.remove("on"); return; }
    cf.classList.add("on");
    cf.appendChild(mkChip("all", "Бүх ангилал", 0, () => setCat("all"), true));
    cats.forEach((c) => cf.appendChild(mkChip(c.id, c.icon + " " + c.label, c.count, () => setCat(c.id))));

    function setCat(id) {
      UI.state.cat = id;
      RM.$$("#catFilter .chip").forEach((x) => x.classList.toggle("on", x.getAttribute("data-id") === id));
      UI.renderResults();
    }
  };

  function mkChip(id, label, count, fn, plain) {
    const c = el("button", { class: "chip" + (id === "all" ? " on" : ""), "data-id": id, onclick: fn });
    c.appendChild(document.createTextNode(label));
    if (count && !plain) c.appendChild(el("i", { text: String(count) }));
    return c;
  }

  /* ══════════ Хайлтын үр дүн ══════════ */

  UI.renderResults = function () {
    const box = $("#results"), meta = $("#resultMeta");
    const r = RM.dict.search(UI.state.q, { page: UI.state.page, cat: UI.state.cat, limit: 400 });

    meta.textContent = UI.state.q
      ? r.total + " илэрц" + (r.total > r.items.length ? " (эхний " + r.items.length + ") " : "")
      : r.total + " нэр томьёо";

    box.innerHTML = "";

    if (!r.items.length) {
      box.appendChild(el("div", { class: "empty", html:
        "<b>Олдсонгүй.</b><br>Англи нэрээр нь (жишээ нь <code>ripple</code>), " +
        "монголоор нь (<code>долгиолон</code>), эсвэл тайлбар доторх үгээр хайж үзнэ үү." }));
      return;
    }

    const frag = document.createDocumentFragment();
    r.items.forEach((row) => frag.appendChild(UI.card(row)));
    box.appendChild(frag);
  };

  UI.card = function (row) {
    const q = UI.state.q;
    const page = RM.dict.page(row.page);
    const c = el("article", { class: "term", "data-page": row.page, style: "--hue:" + page.hue });

    const head = el("div", { class: "term-head" });
    head.appendChild(el("h3", { class: "en", html: RM.mark(row.en, q) }));
    if (row.key) {
      const k = el("button", {
        class: "kbd", title: "Хуулах", onclick: () => RM.copy(row.key)
      });
      row.key.split("+").forEach((part, i) => {
        if (i) k.appendChild(el("span", { class: "plus", text: "+" }));
        k.appendChild(el("kbd", { text: part }));
      });
      head.appendChild(k);
    }
    c.appendChild(head);

    c.appendChild(el("p", { class: "mn", html: RM.mark(row.mn, q) }));
    if (row.desc) c.appendChild(el("p", { class: "desc", html: RM.mark(row.desc, q) }));

    const foot = el("div", { class: "term-foot" });
    foot.appendChild(el("span", { class: "pg", text: page.icon + " " + page.label }));
    const cat = RM.dict.cat(row.cat);
    if (cat) foot.appendChild(el("span", { class: "ct", text: cat.label }));
    if (row.loc) foot.appendChild(el("span", { class: "loc", html: "📍 " + RM.mark(row.loc, q) }));
    c.appendChild(foot);

    return c;
  };

  /* ══════════ Хуудсаар үзэх ══════════ */

  UI.renderPages = function () {
    const box = $("#pagesBox");
    if (box.dataset.built) return;
    box.dataset.built = "1";

    RM.dict.pages.forEach((p) => {
      const cats = RM.dict.cats.filter((c) => c.page === p.id);
      if (!cats.length) return;

      const sec = el("section", { class: "pagecard", style: "--hue:" + p.hue });
      const h = el("div", { class: "pagecard-head" });
      h.appendChild(el("span", { class: "pgicon", text: p.icon }));
      const ht = el("div");
      ht.appendChild(el("h3", { text: p.label }));
      ht.appendChild(el("small", { text: RM.dict.pageCount(p.id) + " нэр томьёо · " + cats.length + " ангилал" }));
      h.appendChild(ht);
      sec.appendChild(h);

      cats.forEach((c) => {
        const row = el("button", {
          class: "catrow",
          onclick: () => {
            UI.state.page = p.id; UI.state.cat = c.id; UI.state.q = "";
            $("#q").value = "";
            UI.buildFilters();
            RM.$$("#pageFilter .chip").forEach((x) => x.classList.toggle("on", x.getAttribute("data-id") === p.id));
            UI.buildCatFilter();
            RM.$$("#catFilter .chip").forEach((x) => x.classList.toggle("on", x.getAttribute("data-id") === c.id));
            UI.renderResults();
            UI.go("hailt");
          }
        });
        row.appendChild(el("span", { class: "ci", text: c.icon }));
        const t = el("span", { class: "ct" });
        t.appendChild(el("b", { text: c.label }));
        if (c.note) t.appendChild(el("small", { text: c.note }));
        row.appendChild(t);
        row.appendChild(el("span", { class: "cn", text: String(c.count) }));
        sec.appendChild(row);
      });

      box.appendChild(sec);
    });
  };

  /* ══════════ Товчлуурын хүснэгт ══════════ */

  UI.renderKeys = function () {
    const box = $("#keysBox");
    if (box.dataset.built) return;
    box.dataset.built = "1";

    const withKeys = RM.dict.rows.filter((r) => r.key);
    const groups = {};
    withKeys.forEach((r) => { (groups[r.cat] = groups[r.cat] || []).push(r); });

    $("#keyCount").textContent = withKeys.length;

    RM.dict.cats.forEach((c) => {
      const list = groups[c.id];
      if (!list) return;
      const p = RM.dict.page(c.page);

      const sec = el("section", { class: "keygroup", style: "--hue:" + p.hue });
      sec.appendChild(el("h3", { text: c.icon + "  " + c.label }));

      const tbl = el("div", { class: "keytable" });
      list.forEach((r) => {
        const row = el("div", { class: "keyrow" });
        const k = el("button", { class: "kbd", title: "Хуулах", onclick: () => RM.copy(r.key) });
        r.key.split("+").forEach((part, i) => {
          if (i) k.appendChild(el("span", { class: "plus", text: "+" }));
          k.appendChild(el("kbd", { text: part }));
        });
        row.appendChild(k);
        const txt = el("div", { class: "keytxt" });
        txt.appendChild(el("b", { text: r.mn }));
        txt.appendChild(el("small", { text: r.desc }));
        row.appendChild(txt);
        tbl.appendChild(row);
      });
      sec.appendChild(tbl);
      box.appendChild(sec);
    });
  };

  /* ══════════ Ажлын урсгалын хөтөч ══════════ */

  UI.renderGuides = function () {
    const box = $("#guidesBox");
    if (box.dataset.built) return;
    box.dataset.built = "1";

    RM.guides.forEach((g) => {
      const sec = el("section", { class: "guide" });

      const head = el("button", {
        class: "guide-head",
        onclick: () => sec.classList.toggle("open")
      });
      head.appendChild(el("span", { class: "gnum", text: g.icon }));
      const ht = el("span", { class: "gt" });
      ht.appendChild(el("b", { text: g.title }));
      ht.appendChild(el("small", { text: g.lead }));
      head.appendChild(ht);
      head.appendChild(el("span", { class: "gcount", text: g.steps.length + " алхам" }));
      head.appendChild(el("span", { class: "gchev", text: "▾" }));
      sec.appendChild(head);

      const body = el("ol", { class: "guide-body" });
      g.steps.forEach((s) => {
        const li = el("li");
        li.appendChild(el("b", { text: s.t }));
        li.appendChild(el("p", { html: s.b }));
        if (s.tip) li.appendChild(el("p", { class: "tip", html: "<b>Санамж:</b> " + s.tip }));
        body.appendChild(li);
      });
      sec.appendChild(body);
      box.appendChild(sec);
    });

    if (box.firstChild) box.firstChild.classList.add("open");
  };

  /* ══════════ Холболт ══════════ */

  UI.bind = function () {
    const input = $("#q");
    const run = RM.debounce(() => {
      UI.state.q = input.value;
      $("#qclear").classList.toggle("on", !!input.value);
      UI.renderResults();
    }, 110);

    input.addEventListener("input", run);

    $("#qclear").addEventListener("click", () => {
      input.value = ""; UI.state.q = "";
      $("#qclear").classList.remove("on");
      UI.renderResults(); input.focus();
    });

    document.addEventListener("keydown", (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === "/" && !typing) { e.preventDefault(); UI.go("hailt"); input.focus(); input.select(); }
      else if (e.key === "Escape" && typing) { input.value = ""; UI.state.q = ""; $("#qclear").classList.remove("on"); UI.renderResults(); }
    });
  };

})(window.RM);
