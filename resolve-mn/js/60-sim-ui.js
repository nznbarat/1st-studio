/* ═════════════════════════════════════════════════════════════
   60 · Загварын харилцан үйлдэл — товших, тайлбарлах, хуудас солих
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const S = RM.sim, $ = RM.$, el = RM.el;

  const ORDER = ["media", "photo", "cut", "edit", "fusion", "color", "fairlight", "deliver"];

  S.state = {
    page:   RM.store.get("simPage", "edit"),
    reveal: RM.store.get("simReveal", false),
    sel:    null
  };

  /* ── хуудас зурах ── */

  S.render = function (page) {
    if (!S.hasOwnProperty(page) || typeof S[page] !== "function") page = "edit";
    S.state.page = page;
    S.state.sel = null;
    RM.store.set("simPage", page);

    const stage = $("#rsHost");
    S.closeMenu();
    stage.innerHTML = S[page]();

    const win = stage.firstElementChild;
    if (win && S.state.reveal) win.classList.add("reveal");

    S.showHint();
    S.buildList();
  };

  /* ── тайлбар харуулах ── */

  S.select = function (id, node, dimmed) {
    const row = RM.dict.byId[id];
    if (!row) { RM.toast("Тайлбар олдсонгүй: " + id); return; }

    RM.$$("#rsHost .hs.sel").forEach((n) => n.classList.remove("sel"));
    if (node) node.classList.add("sel");
    S.state.sel = id;

    const page = RM.dict.page(row.page);
    const cat  = RM.dict.cat(row.cat);
    const box  = $("#sideBody");
    box.innerHTML = "";

    const d = el("div", { class: "detail" });
    d.appendChild(el("div", { class: "den", text: row.en }));
    d.appendChild(el("div", { class: "dmn", text: row.mn }));
    if (row.desc) d.appendChild(el("p", { class: "ddesc", text: row.desc }));

    if (dimmed) d.appendChild(S.whyBox(dimmed === true ? "clip" : dimmed));

    if (row.key) {
      const r = el("div", { class: "drow" });
      r.appendChild(el("span", { class: "lb", text: "Товчлуур" }));
      const k = el("button", { class: "dkbd", title: "Хуулах", onclick: () => RM.copy(row.key) });
      row.key.split("+").forEach((part, i) => {
        if (i) k.appendChild(el("span", { class: "plus", text: "+" }));
        k.appendChild(el("kbd", { text: part }));
      });
      r.appendChild(k);
      d.appendChild(r);
    }

    if (row.loc) {
      const r = el("div", { class: "drow" });
      r.appendChild(el("span", { class: "lb", text: "Байрлал" }));
      r.appendChild(el("span", { text: row.loc }));
      d.appendChild(r);
    }

    const r2 = el("div", { class: "drow" });
    r2.appendChild(el("span", { class: "lb", text: "Ангилал" }));
    const tags = el("span");
    tags.appendChild(el("span", { class: "dpage", text: page.icon + " " + page.label }));
    if (cat) tags.appendChild(el("span", { class: "dpage", text: " " + cat.label, style: "margin-left:5px" }));
    r2.appendChild(tags);
    d.appendChild(r2);

    if (row.long) {
      const L = el("section", { class: "dlong" });
      L.appendChild(el("div", { class: "dlh", html:
        "<span>Гарын авлага</span><small>дэлгэрэнгүй тайлбар</small>" }));
      L.appendChild(el("div", { class: "dlb", html: RM.md(row.long) }));
      d.appendChild(L);
    }

    d.appendChild(el("p", { class: "more", html:
      'Бүрэн толиос энэ үгийг үзэх: <a href="index.html?q=' +
      encodeURIComponent(row.en) + '">' + RM.esc(row.en) + ' →</a>' }));

    box.appendChild(d);
    box.scrollTop = 0;

    /* гарын авлага доторх холбоос → тэр нэр томьёог сонгоно */
    RM.$$("a.xref", d).forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const tid = a.getAttribute("data-id");
      if (!RM.dict.byId[tid]) return;
      const node = $('#rsHost .hs[data-t="' + tid + '"]');
      S.select(tid, node, false);
      if (node) node.scrollIntoView({ block: "nearest", inline: "nearest" });
    }));

    /* жагсаалтад тэмдэглэх */
    RM.$$("#sideBody .spotlist button").forEach((b) =>
      b.classList.toggle("on", b.getAttribute("data-id") === id));

    S.buildList(id);
  };

  /* Саарал (идэвхгүй) цэсний мөрийн тайлбар — хуудас бүрийн бодит ажиглалтаас */
  S.whyBox = function (ctx) {
    const NAMES = { media: "Media", photo: "Photo", cut: "Cut", edit: "Edit", fusion: "Fusion",
                    color: "Color", fairlight: "Fairlight", deliver: "Deliver" };
    const KEYS  = { media: "Shift+2", cut: "Shift+3", edit: "Shift+4", fusion: "Shift+5",
                    color: "Shift+6", fairlight: "Shift+7", deliver: "Shift+8" };
    const here  = NAMES[S.state.page] || S.state.page;
    const pages = S.pagesOf(ctx) || [];
    const STATES = {
      unsaved: "Энэ команд <b>хадгалаагүй өөрчлөлт</b> байгаа үед л идэвхжинэ — таны зурагт төслийн " +
               "нэрний ард улбар шар <b>Edited</b> тэмдэг байгаагүй тул саарал байсан. Өөрчлөлт хийсний " +
               "дараа (Edited гарч ирэхэд) идэвхжинэ.",
      collab:  "Энэ хоёр мөр төслийн сан <b>Local</b> (нэг компьютерийн) үед саарал байдаг — " +
               "Single User Project чагттай боловч солих боломжгүй. Олон хэрэглэгчийн горим " +
               "<b>PostgreSQL сүлжээний сан</b> эсвэл <b>Blackmagic Cloud</b> сангийн төсөлд л идэвхжинэ."
    };
    let html;
    if (ctx && ctx.indexOf("state:") === 0 && STATES[ctx.slice(6)]) {
      html = "<b>Яагаад саарал байна вэ?</b> " + STATES[ctx.slice(6)];
    } else if (!pages.length) {
      html = "<b>Яагаад саарал байна вэ?</b> Таны Resolve-ийн дэлгэцийн зурагт энэ мөр саарал байсан. " +
             "Ямар нөхцөлд идэвхждэгийг (сан, зураг сонгосон эсэх) Resolve дээрээ шалгана уу.";
    } else {
      const list = pages.map((p) => "<b>" + (NAMES[p] || p) + "</b>" + (KEYS[p] ? " (" + KEYS[p] + ")" : "")).join(", ");
      html = "<b>Яагаад саарал байна вэ?</b> Энэ команд " + list + " хуудсанд идэвхтэй. " +
             "Одоо та <b>" + RM.esc(here) + "</b> хуудсанд байна — энд тухайн команд ажиллах сонголт " +
             "(timeline дээрх клип, засвар) байхгүй тул идэвхгүй.";
      if (pages.indexOf("edit") !== -1 && pages.indexOf("cut") !== -1) {
        html += " Edit, Cut хуудсанд клип сонгосон үед идэвхжинэ.";
      }
      if (S.state.page === "fusion") {
        html += " <i>Тэмдэглэл:</i> Fusion хуудсанд нодны талбар идэвхтэй үед Cut, Copy, Paste, " +
                "Delete Selected нь нод дээр ажиллаж идэвхжсэн тохиолдол ажиглагдсан (2026-09-11).";
      }
      if (ctx === "clip" || pages.indexOf("media") === -1) html += " Media хуудасны төлөв зургаар баталгаажаагүй.";
    }
    return el("div", { class: "why", html: html });
  };

  S.showHint = function () {
    const box = $("#sideBody");
    box.innerHTML = "";
    /* Товших цэгийн тоог жагсаалттай нэг болгохын тулд өвөрмөц нэр томьёогоор тоолно
       (нэг нэр томьёо дэлгэц дээр хэд хэдэн газар давтагдаж болно). */
    const seen = Object.create(null);
    RM.$$("#rsHost .hs").forEach((el) => {
      const id = el.getAttribute("data-t");
      if (id && RM.dict.byId[id]) seen[id] = 1;
    });
    const n = Object.keys(seen).length;
    box.appendChild(el("div", { class: "hint", html:
      "<b>Дэлгэц дээрх ямар ч хэсэг дээр товшино уу.</b> Тухайн хэсгийн монгол нэр, " +
      "юу хийдэг, товчлуур, хаана байдаг нь энд гарч ирнэ." +
      "<ul>" +
      "<li>Энэ хуудсанд <b>" + n + "</b> товшиж болох цэг бий.</li>" +
      "<li>Доорх хуудасны мөрөөр Resolve-ийн ажлын орон зай хооронд шилжинэ.</li>" +
      "<li><b>Цэг харуулах</b> товчоор бүх идэвхтэй хэсгийг тодруулж харна.</li>" +
      "<li>Тайлбарын доор <b>Гарын авлага</b> — албан ёсны гарын авлагын хэв маягтай дэлгэрэнгүй заавар, алхам, анхааруулга.</li>" +
      "<li>Resolve-оо хажууд нь нээж, хоёрыг зэрэгцүүлж харьцуулаарай.</li>" +
      "</ul>" }));
    S.buildList();
  };

  /* ── энэ хуудасны бүх цэгийн жагсаалт ── */

  S.buildList = function (selId) {
    const host = $("#sideBody");
    const old = host.querySelector(".spotlist");
    if (old) old.remove();

    const ids = [];
    RM.$$("#rsHost .hs").forEach((n) => {
      const id = n.getAttribute("data-t");
      if (id && ids.indexOf(id) === -1) ids.push(id);
    });

    const rows = ids.map((id) => RM.dict.byId[id]).filter(Boolean);
    if (!rows.length) return;

    /* ангиллаар бүлэглэх */
    const groups = {};
    rows.forEach((r) => { (groups[r.cat] = groups[r.cat] || []).push(r); });

    const wrap = el("div", { class: "spotlist" });
    wrap.appendChild(el("h3", { text: "Энэ хуудасны бүх цэг — " + rows.length }));

    RM.dict.cats.forEach((c) => {
      const list = groups[c.id];
      if (!list) return;
      wrap.appendChild(el("h3", { text: c.icon + "  " + c.label }));
      list.sort((a, b) => a.en.localeCompare(b.en)).forEach((r) => {
        const b = el("button", {
          "data-id": r.id,
          class: r.id === selId ? "on" : "",
          onclick: () => {
            const node = $('#rsHost .hs[data-t="' + r.id + '"]');
            S.select(r.id, node);
            if (node) node.scrollIntoView({ block: "center", behavior: "smooth" });
          }
        });
        b.appendChild(el("i", { text: r.en }));
        b.appendChild(el("span", { text: r.mn }));
        wrap.appendChild(b);
      });
    });

    host.appendChild(wrap);
  };

  /* ── цэсний унждаг жагсаалт ── */

  S.closeMenu = function () {
    const open = $("#rsMenuPop");
    if (open) open.remove();
    RM.$$("#rsHost .mi.open").forEach((n) => n.classList.remove("open"));
  };

  /* Цэсний мөрийн идэвхтэй хуудсуудыг задлана */
  S.pagesOf = function (ctx) {
    if (!ctx) return null;
    if (ctx === "clip") return ["edit", "cut"];
    if (ctx === "none" || ctx.indexOf("state:") === 0) return [];
    return ctx.split(",").map((x) => x.trim()).filter(Boolean);
  };
  S.isDim = function (ctx) {
    const pages = S.pagesOf(ctx);
    return !!pages && pages.indexOf(S.state.page) === -1;
  };

  S.openMenu = function (node) {
    const id = node.getAttribute("data-t");
    const def = (S.menus || {})[id];
    S.closeMenu();
    if (!def) return false;

    node.classList.add("open");
    const pop = el("div", { id: "rsMenuPop", class: "rs-menupop" });

    def.items.forEach((it) => {
      if (it === "-") { pop.appendChild(el("div", { class: "msep" })); return; }
      const [termId, label, key, arrow, ctx] = it;
      /* 5 дахь утга — команд идэвхтэй байх хуудсууд ("edit,cut,fairlight").
         "clip" = "edit,cut"; "none" = зурагт саарал байсан, нөхцөл тодорхойгүй.
         Бусад хуудсанд саарал болно — бодит программын зан төлөв (дэлгэцийн зургаас). */
      const dim = S.isDim(ctx);
      const row = el("button", {
        class: "mrow" + (dim ? " dim" : ""), "data-t": termId,
        title: dim ? "Энэ команд одоогийн хуудсанд идэвхгүй — товшиж шалтгааныг үзнэ үү" : "",
        onclick: (e) => {
          e.stopPropagation();
          S.closeMenu();
          S.select(termId, node, dim ? (ctx || "clip") : false);
        }
      });
      row.appendChild(el("span", { class: "ml", text: label }));
      if (key)   row.appendChild(el("span", { class: "mk", text: key }));
      if (arrow) row.appendChild(el("span", { class: "ma", text: arrow }));
      pop.appendChild(row);
    });

    /* байрлуулах — цэсний нэрний доор, дэлгэцээс халихгүйгээр */
    const host = $("#rsHost");
    const hb = host.getBoundingClientRect();
    const nb = node.getBoundingClientRect();
    pop.style.left = Math.max(2, Math.min(nb.left - hb.left, hb.width - 300)) + "px";
    pop.style.top  = (nb.bottom - hb.top) + "px";
    host.appendChild(pop);
    return true;
  };

  /* ── холболт ── */

  S.bind = function () {
    /* товших */
    $("#rsHost").addEventListener("click", (e) => {
      /* цэсний мөр — унждаг жагсаалт нээнэ (агуулга нь баталгаажсан бол) */
      const mi = e.target.closest(".mi");
      if (mi) {
        e.stopPropagation();
        const wasOpen = mi.classList.contains("open");
        S.closeMenu();
        if (!wasOpen && !S.openMenu(mi)) {
          /* агуулгыг нь хараахан баталгаажуулаагүй цэс — тайлбарыг нь үзүүлнэ */
          S.select(mi.getAttribute("data-t"), mi);
        } else if (!wasOpen) {
          S.select(mi.getAttribute("data-t"), mi);
        }
        return;
      }
      if (e.target.closest("#rsMenuPop")) return;
      S.closeMenu();

      const go = e.target.closest("[data-go]");
      const hs = e.target.closest(".hs");
      if (!hs) return;
      e.stopPropagation();

      /* хуудасны товч бол эхлээд тайлбарыг нь үзүүлээд, дараа нь шилжинэ */
      if (go) {
        const target = go.getAttribute("data-go");
        const id = go.getAttribute("data-t");
        if (target === S.state.page) { S.select(id, go); return; }
        S.render(target);
        S.syncPageBtns();
        const node = $('#rsHost .hs[data-t="' + id + '"]');
        S.select(id, node);
        return;
      }

      S.select(hs.getAttribute("data-t"), hs);
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#rsHost")) S.closeMenu();
    });

    /* Цэс нээлттэй байхад хажуугийн цэсэн дээр хулгана тултал шилжинэ —
       бодит программын зан төлөв. */
    $("#rsHost").addEventListener("mouseover", (e) => {
      if (!$("#rsMenuPop")) return;
      const mi = e.target.closest(".rs-menu .mi");
      if (!mi || mi.classList.contains("open")) return;
      if (S.openMenu(mi)) S.select(mi.getAttribute("data-t"), mi);
    });

    /* цэг харуулах */
    $("#revealBtn").addEventListener("click", () => {
      S.state.reveal = !S.state.reveal;
      RM.store.set("simReveal", S.state.reveal);
      const win = $("#rsHost").firstElementChild;
      if (win) win.classList.toggle("reveal", S.state.reveal);
      $("#revealBtn").classList.toggle("on", S.state.reveal);
    });
    $("#revealBtn").classList.toggle("on", S.state.reveal);

    /* дээд талын хуудасны товчнууд */
    RM.$$("#pageBtns .tbtn").forEach((b) => {
      b.addEventListener("click", () => {
        S.render(b.getAttribute("data-p"));
        S.syncPageBtns();
      });
    });

    /* гар */
    document.addEventListener("keydown", (e) => {
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      if (e.key === "Escape") { S.closeMenu(); S.showHint(); RM.$$("#rsHost .hs.sel").forEach((n) => n.classList.remove("sel")); }
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = ORDER.indexOf(S.state.page);
        const n = (i + (e.key === "ArrowRight" ? 1 : ORDER.length - 1)) % ORDER.length;
        S.render(ORDER[n]); S.syncPageBtns();
      }
    });
  };

  S.syncPageBtns = function () {
    RM.$$("#pageBtns .tbtn").forEach((b) =>
      b.classList.toggle("on", b.getAttribute("data-p") === S.state.page));
  };

  /* ── эхлүүлэлт ── */

  S.boot = function () {
    const q = new URLSearchParams(location.search);
    const p = q.get("p");
    if (p && ORDER.indexOf(p) !== -1) S.state.page = p;

    S.render(S.state.page);
    S.bind();
    S.syncPageBtns();

    const t = q.get("t");
    if (t && RM.dict.byId[t]) {
      const node = $('#rsHost .hs[data-t="' + t + '"]');
      S.select(t, node);
    }

    console.log("Resolve интерфейсийн загвар · " +
      RM.$$("#rsHost .hs").length + " цэг энэ хуудсанд");
  };

})(window.RM);
