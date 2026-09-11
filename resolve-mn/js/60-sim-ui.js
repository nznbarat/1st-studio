/* ═════════════════════════════════════════════════════════════
   60 · Загварын харилцан үйлдэл — товших, тайлбарлах, хуудас солих
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const S = RM.sim, $ = RM.$, el = RM.el;

  const ORDER = ["media", "cut", "edit", "fusion", "color", "fairlight", "deliver", "photo"];

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
    stage.innerHTML = S[page]();

    const win = stage.firstElementChild;
    if (win && S.state.reveal) win.classList.add("reveal");

    S.showHint();
    S.buildList();
  };

  /* ── тайлбар харуулах ── */

  S.select = function (id, node) {
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

    d.appendChild(el("p", { class: "more", html:
      'Бүрэн толиос энэ үгийг үзэх: <a href="index.html?q=' +
      encodeURIComponent(row.en) + '">' + RM.esc(row.en) + ' →</a>' }));

    box.appendChild(d);

    /* жагсаалтад тэмдэглэх */
    RM.$$("#sideBody .spotlist button").forEach((b) =>
      b.classList.toggle("on", b.getAttribute("data-id") === id));

    S.buildList(id);
  };

  S.showHint = function () {
    const box = $("#sideBody");
    box.innerHTML = "";
    const n = RM.$$("#rsHost .hs").length;
    box.appendChild(el("div", { class: "hint", html:
      "<b>Дэлгэц дээрх ямар ч хэсэг дээр товшино уу.</b> Тухайн хэсгийн монгол нэр, " +
      "юу хийдэг, товчлуур, хаана байдаг нь энд гарч ирнэ." +
      "<ul>" +
      "<li>Энэ хуудсанд <b>" + n + "</b> товшиж болох цэг бий.</li>" +
      "<li>Доорх хуудасны мөрөөр Resolve-ийн ажлын орон зай хооронд шилжинэ.</li>" +
      "<li><b>Цэг харуулах</b> товчоор бүх идэвхтэй хэсгийг тодруулж харна.</li>" +
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

  /* ── холболт ── */

  S.bind = function () {
    /* товших */
    $("#rsHost").addEventListener("click", (e) => {
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
      if (e.key === "Escape") { S.showHint(); RM.$$("#rsHost .hs.sel").forEach((n) => n.classList.remove("sel")); }
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
