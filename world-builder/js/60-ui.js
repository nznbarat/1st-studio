/* ═════════════════════════════════════════════════════════════
   Дэлгэцийн бүрэлдэхүүн — самбар, картууд, хос хэлний блок.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const UI = (WB.ui = {});
  const U = WB.util;
  const S = WB.state;
  const T = WB.tr;
  const PR = WB.prompt;
  const el = U.el;

  let duals = [];

  /* ── самбар солих ───────────────────────────────────────── */
  UI.goto = function (p) {
    U.qsa(".step").forEach((x) => x.classList.toggle("on", x.dataset.p === p));
    U.qsa(".panel").forEach((x) => x.classList.remove("on"));
    const target = el("p-" + p);
    if (target) target.classList.add("on");
    el("main").scrollTop = 0;
    WB.store.set("panel", p);
    if (p === "dict") UI.renderDict();
    if (p === "out") UI.renderOut();
    if (p === "brand" && WB.brand) WB.brand.paintOutputs();
  };

  /* ── хос хэлний талбар ──────────────────────────────────── */
  function autoGrow(ta) {
    ta.style.height = "auto";
    ta.style.height = Math.max(64, ta.scrollHeight) + "px";
  }

  function statusLabel(field) {
    if (!field.src) return { t: "", c: "st" };
    if (field.src === "ai") return { t: "AI ОРЧУУЛСАН ✓", c: "st done" };
    if ((field.unk || []).length) return { t: "ТОЛЬ · ЗАРИМ ҮГ ТАНИАГҮЙ", c: "st warn" };
    return { t: "ТОЛЬ ОРЧУУЛСАН ✓", c: "st done" };
  }

  UI.dualField = function (field, kind, label, placeholder) {
    const wrap = document.createElement("div");
    wrap.className = "dual";
    wrap.innerHTML =
      '<div class="dual-head"><span class="lb"></span><span class="st"></span></div>' +
      '<div class="dual-body">' +
      '<div class="pn mn"><span class="tag">МН</span><textarea spellcheck="false"></textarea></div>' +
      '<div class="seam"><button class="go" title="Одоо орчуулах">→</button>' +
      '<button class="lk" title="Англи талыг гараар засах">🔓</button></div>' +
      '<div class="pn en"><span class="tag">EN</span><textarea spellcheck="false"></textarea></div>' +
      "</div><div class=\"unk\"></div>";

    wrap.querySelector(".lb").textContent = label;
    const taMN = wrap.querySelector(".pn.mn textarea");
    const taEN = wrap.querySelector(".pn.en textarea");
    const stat = wrap.querySelector(".st");
    const lk = wrap.querySelector(".lk");
    const unkEl = wrap.querySelector(".unk");

    taMN.placeholder = placeholder ? "Жишээ: " + placeholder : "Монголоор бич…";
    taEN.placeholder = "English appears here…";
    taMN.value = field.mn;
    taEN.value = field.en;
    const sl = statusLabel(field);
    stat.textContent = sl.t;
    stat.className = sl.c;
    if (!field.auto) {
      lk.classList.add("on");
      lk.textContent = "🔒";
    }
    paintUnknown(unkEl, field);
    setTimeout(() => {
      autoGrow(taMN);
      autoGrow(taEN);
    }, 0);

    const sync = () => {
      taEN.value = field.en;
      autoGrow(taEN);
      autoGrow(taMN);
      const s2 = statusLabel(field);
      stat.textContent = s2.t;
      stat.className = s2.c;
      paintUnknown(unkEl, field);
      UI.renderOut();
      UI.updateCounts();
    };

    const doTranslate = async () => {
      stat.textContent = "ОРЧУУЛЖ БАЙНА…";
      stat.className = "st go";
      await T.field(field, kind);
      sync();
      S.touch();
    };

    let timer = null;
    taMN.addEventListener("input", () => {
      field.mn = taMN.value;
      autoGrow(taMN);
      S.touch();
      if (!field.auto || !S.P.opts.autoTranslate) return;
      stat.textContent = "…";
      stat.className = "st";
      clearTimeout(timer);
      timer = setTimeout(doTranslate, 1200);
    });
    taEN.addEventListener("input", () => {
      field.en = taEN.value;
      field.auto = false;
      field.src = "manual";
      lk.classList.add("on");
      lk.textContent = "🔒";
      stat.textContent = "ГАРААР ЗАССАН";
      stat.className = "st";
      autoGrow(taEN);
      S.touch();
      UI.renderOut();
    });
    wrap.querySelector(".go").onclick = doTranslate;
    lk.onclick = () => {
      field.auto = !field.auto;
      lk.classList.toggle("on", !field.auto);
      lk.textContent = field.auto ? "🔓" : "🔒";
      S.touch();
    };

    wrap._sync = sync;
    wrap._field = field;
    wrap._kind = kind;
    duals.push(wrap);
    return wrap;
  };

  function paintUnknown(box, field) {
    const u = field.unk || [];
    box.classList.toggle("on", u.length > 0);
    box.innerHTML = "";
    if (!u.length) return;
    const span = document.createElement("span");
    span.innerHTML = "⚠ Толинд алга: <b>" + U.esc(u.slice(0, 8).join(", ")) + "</b>" + (u.length > 8 ? " …" : "");
    const btn = document.createElement("button");
    btn.textContent = "Тольд нэмэх";
    btn.onclick = () => UI.goto("dict");
    box.append(span, btn);
  }

  /* ── ТҮҮХ самбар ────────────────────────────────────────── */
  UI.renderStory = function () {
    const P = S.P;
    const lb = el("loglineBox");
    lb.innerHTML = "";
    const card = document.createElement("div");
    card.className = "card";
    const top = document.createElement("div");
    top.className = "card-top";
    top.innerHTML = '<span class="idx">ЛОГЛАЙН</span>';
    card.appendChild(top);
    card.appendChild(
      UI.dualField(P.logline, "logline", "Түүхийн гол утга (1 өгүүлбэр)",
        "Цаг хугацааг гэтлэх зүүлт олсон охин эцгийнхээ алдааг засахаар өнгөрсөн рүү буцна.")
    );
    lb.appendChild(card);

    const list = el("sceneList");
    list.innerHTML = "";
    if (!P.scenes.length) {
      list.innerHTML =
        '<div class="empty"><b>Үзэгдэл алга</b>Доорх товчоор эхний үзэгдлээ нэмэх, эсвэл 0‑р алхмын автомат горимоор бүхэлд нь гаргуулна уу.</div>';
      return;
    }
    P.scenes.forEach((s, i) => {
      const card = document.createElement("div");
      card.className = "card";

      const top = document.createElement("div");
      top.className = "card-top";
      top.innerHTML = '<span class="idx">ҮЗЭГДЭЛ ' + U.pad2(i + 1) + "</span>";
      const nm = document.createElement("input");
      nm.className = "nameIn";
      nm.value = s.name;
      nm.placeholder = "Үзэгдлийн нэр…";
      nm.oninput = () => {
        s.name = nm.value;
        S.touch();
        UI.renderOut();
      };
      const up = mini("↑", "Дээш", () => {
        if (i > 0) {
          S.pushHistory();
          P.scenes.splice(i - 1, 0, P.scenes.splice(i, 1)[0]);
          UI.renderAll();
        }
      });
      const dn = mini("↓", "Доош", () => {
        if (i < P.scenes.length - 1) {
          S.pushHistory();
          P.scenes.splice(i + 1, 0, P.scenes.splice(i, 1)[0]);
          UI.renderAll();
        }
      });
      const shotBtn = document.createElement("button");
      shotBtn.className = "aibtn";
      shotBtn.textContent = "🎬 Кадр гаргах";
      shotBtn.onclick = () => UI.makeShots(s, shotBtn);
      const x = mini("×", "Устгах", async () => {
        if (await U.confirm("Энэ үзэгдлийг устгах уу?", "Устгах")) {
          S.pushHistory();
          P.scenes.splice(i, 1);
          UI.renderAll();
        }
      }, "xbtn danger");
      top.append(nm, up, dn, shotBtn, x);
      card.appendChild(top);

      card.appendChild(
        UI.dualField(s.body, "scene", "Үзэгдлийн тайлбар",
          "Намрын хээр талд охин ганцаараа зогсоно. Салхи өвсийг найгуулж, алсад хөх уулс харагдана.")
      );

      /* дүр, байршлын холбоос */
      const links = document.createElement("div");
      links.className = "links";
      const cw = document.createElement("div");
      cw.className = "linkgrp";
      cw.innerHTML = '<span class="llb">Дүрүүд:</span>';
      if (!P.cast.length) cw.innerHTML += '<span class="dimtext">— дүр бүртгээгүй —</span>';
      P.cast.forEach((c) => {
        const chip = document.createElement("button");
        chip.className = "chip" + (s.castIds.includes(c.id) ? " on" : "");
        chip.textContent = c.name || "нэргүй";
        chip.onclick = () => {
          const at = s.castIds.indexOf(c.id);
          if (at < 0) s.castIds.push(c.id);
          else s.castIds.splice(at, 1);
          chip.classList.toggle("on");
          S.touch();
          UI.renderOut();
        };
        cw.appendChild(chip);
      });
      const lw = document.createElement("div");
      lw.className = "linkgrp";
      lw.innerHTML = '<span class="llb">Байршил:</span>';
      const sel = document.createElement("select");
      sel.className = "minisel";
      sel.innerHTML = '<option value="">— сонгох —</option>';
      P.locs.forEach((l) => {
        const o = document.createElement("option");
        o.value = l.id;
        o.textContent = l.name || "нэргүй";
        if (s.locId === l.id) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = () => {
        s.locId = sel.value;
        S.touch();
        UI.renderOut();
      };
      lw.appendChild(sel);
      links.append(cw, lw);
      card.appendChild(links);

      /* кадрууд */
      if (s.shots.length) {
        const sw = document.createElement("div");
        sw.className = "shots";
        s.shots.forEach((sh, j) => {
          const row = document.createElement("div");
          row.className = "shot";
          const head = document.createElement("div");
          head.className = "shot-head";
          head.innerHTML = '<span class="idx">КАДР ' + U.pad2(j + 1) + "</span>";
          const cam = document.createElement("input");
          cam.className = "camIn";
          cam.value = sh.cam;
          cam.placeholder = "camera move…";
          cam.oninput = () => {
            sh.cam = cam.value;
            S.touch();
            UI.renderOut();
          };
          const dur = document.createElement("input");
          dur.className = "durIn";
          dur.value = sh.dur;
          dur.placeholder = "3s";
          dur.oninput = () => {
            sh.dur = dur.value;
            S.touch();
          };
          const del = mini("×", "Устгах", () => {
            s.shots.splice(j, 1);
            UI.renderAll();
          }, "xbtn danger");
          head.append(cam, dur, del);
          row.appendChild(head);
          row.appendChild(UI.dualField(sh.body, "shot", "Кадрын дүрслэл", "камер аажим ойртоно, охин эргэж харна"));
          sw.appendChild(row);
        });
        card.appendChild(sw);
      }
      list.appendChild(card);
    });
  };

  function mini(txt, title, fn, cls) {
    const b = document.createElement("button");
    b.className = cls || "xbtn";
    b.textContent = txt;
    b.title = title;
    b.onclick = fn;
    return b;
  }

  /* ── ДҮР / БАЙРШИЛ самбар ───────────────────────────────── */
  UI.renderCards = function (arr, defs, listId, kind, word, phName) {
    const list = el(listId);
    list.innerHTML = "";
    if (!arr.length) {
      list.innerHTML =
        '<div class="empty"><b>' + word + " алга</b>Доорх товчоор нэмээд монголоор дүрсэлж эхлээрэй.</div>";
      return;
    }
    arr.forEach((it, i) => {
      const card = document.createElement("div");
      card.className = "card";
      const top = document.createElement("div");
      top.className = "card-top";
      top.innerHTML = '<span class="idx">' + word.toUpperCase() + " " + U.pad2(i + 1) + "</span>";
      const nm = document.createElement("input");
      nm.className = "nameIn";
      nm.value = it.name;
      nm.placeholder = phName;
      nm.oninput = () => {
        it.name = nm.value;
        S.touch();
        UI.renderOut();
      };
      const aib = document.createElement("button");
      aib.className = "aibtn";
      aib.textContent = "✨ Дэлгэрүүлэх";
      aib.title = "Хоосон талбаруудыг Claude‑аар бөглүүлнэ";
      aib.onclick = async () => {
        if (!WB.auto.needAI()) return;
        await withBtn(aib, "Бодож байна…", async () => {
          const n = await WB.auto.expand(kind, it);
          UI.renderAll();
          if (n) {
            await UI.translatePending([kind]);
            U.toast(n + " талбар дүүрлээ", "good");
          } else U.toast("Бүх талбар аль хэдийн дүүрэн байна", "info");
        });
      };
      const x = mini("×", "Устгах", async () => {
        if (await U.confirm("Устгах уу?", "Устгах")) {
          S.pushHistory();
          arr.splice(i, 1);
          UI.renderAll();
        }
      }, "xbtn danger");
      top.append(nm, aib, x);
      card.appendChild(top);
      if (it.pro) {
        const badge = document.createElement("div");
        badge.className = "probadge";
        badge.textContent = "✨ Өнгөлсөн промттой — Промт самбараас харна уу";
        card.appendChild(badge);
      }
      defs.forEach((f) => card.appendChild(UI.dualField(it.f[f.k], kind, f.lb, f.ph)));
      list.appendChild(card);
    });
  };

  /* ── ПРОМТ самбар ───────────────────────────────────────── */
  UI.renderOut = function () {
    const list = el("outList");
    if (!list) return;
    const blocks = PR.blocks();
    list.innerHTML = "";
    if (!blocks.length) {
      list.innerHTML =
        '<div class="empty"><b>Одоохондоо хоосон</b>Монголоор бичихэд бэлэн англи промтууд энд цугларна.</div>';
      UI.updateCounts();
      return;
    }
    blocks.forEach((b) => {
      const w = document.createElement("div");
      w.className = "outwrap" + (b.sub ? " sub" : "");
      const h = document.createElement("h3");
      h.appendChild(document.createTextNode(b.title + " "));
      const em = document.createElement("em");
      em.textContent = b.tag;
      h.appendChild(em);
      const pre = document.createElement("div");
      pre.className = "out";
      pre.textContent = b.text;
      const cp = document.createElement("button");
      cp.className = "cp";
      cp.textContent = "Хуулах";
      cp.onclick = () => UI.copy(b.text, cp);
      w.append(h, pre, cp);
      list.appendChild(w);
    });

    const neg = document.createElement("div");
    neg.className = "outwrap";
    const nh = document.createElement("h3");
    nh.appendChild(document.createTextNode("Сөрөг промт "));
    const nem = document.createElement("em");
    nem.textContent = "NEGATIVE";
    nh.appendChild(nem);
    const npre = document.createElement("div");
    npre.className = "out";
    npre.textContent = PR.negative();
    const ncp = document.createElement("button");
    ncp.className = "cp";
    ncp.textContent = "Хуулах";
    ncp.onclick = () => UI.copy(PR.negative(), ncp);
    neg.append(nh, npre, ncp);
    list.appendChild(neg);
    UI.updateCounts();
  };

  UI.copy = async function (txt, btn) {
    try {
      await navigator.clipboard.writeText(txt);
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = txt;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch (e2) {}
      t.remove();
    }
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "Хуулагдлаа ✓";
      btn.classList.add("done");
      setTimeout(() => {
        btn.textContent = old;
        btn.classList.remove("done");
      }, 1500);
    }
  };

  /* ── ТОЛЬ самбар ────────────────────────────────────────── */
  let dictCat = "all";
  UI.renderDict = function () {
    UI.updateCounts();

    /* ангиллын хавтангууд */
    const cats = el("catGrid");
    if (cats && !cats.dataset.built) {
      cats.dataset.built = "1";
      const mk = (id, label, icon, count) => {
        const b = document.createElement("button");
        b.className = "catcard" + (id === dictCat ? " on" : "");
        b.dataset.cat = id;
        b.innerHTML =
          '<span class="ci">' + icon + '</span><span class="cl"></span><span class="cc">' + count + "</span>";
        b.querySelector(".cl").textContent = label;
        b.onclick = () => {
          dictCat = id;
          U.qsa(".catcard").forEach((c) => c.classList.toggle("on", c.dataset.cat === id));
          UI.runDictSearch();
        };
        return b;
      };
      cats.appendChild(mk("all", "Бүгд", "📚", WB.dict.size()));
      WB.dict.cats.forEach((c) => cats.appendChild(mk(c.id, c.label, c.icon, c.count)));
    }

    /* таниагүй үгс */
    const ul = el("unkList");
    ul.innerHTML = "";
    const words = [...T.unknown].filter((w) => !S.P.custom[w]);
    el("unkCount").textContent = words.length;
    if (!words.length) {
      ul.innerHTML =
        '<div class="empty small"><b>Таниагүй үг алга</b>Офлайн орчуулга хийхэд толинд байхгүй үг гарвал энд цугларна.</div>';
    } else {
      words.slice(0, 300).forEach((w) => {
        const row = document.createElement("div");
        row.className = "drow";
        const mn = document.createElement("input");
        mn.className = "mn";
        mn.value = w;
        mn.readOnly = true;
        const ar = document.createElement("span");
        ar.className = "ar";
        ar.textContent = "→";
        const en = document.createElement("input");
        en.className = "en";
        en.placeholder = "англи утга…";
        const ok = mini("✓", "Хадгалах", () => {
          const v = en.value.trim();
          if (!v) return;
          S.P.custom[w] = v;
          T.unknown.delete(w);
          S.touch();
          UI.renderDict();
        });
        en.onkeydown = (e) => {
          if (e.key === "Enter") ok.onclick();
        };
        row.append(mn, ar, en, ok);
        ul.appendChild(row);
      });
    }

    /* хэрэглэгчийн үгс */
    const cl = el("customList");
    cl.innerHTML = "";
    const entries = Object.entries(S.P.custom);
    if (!entries.length) {
      cl.innerHTML = '<p class="note" style="margin:0 0 8px">Одоогоор нэмсэн үг алга.</p>';
    }
    entries.forEach(([m, e]) => {
      const row = document.createElement("div");
      row.className = "drow";
      const mn = document.createElement("input");
      mn.className = "mn";
      mn.value = m;
      const ar = document.createElement("span");
      ar.className = "ar";
      ar.textContent = "→";
      const en = document.createElement("input");
      en.className = "en";
      en.value = e;
      const upd = () => {
        delete S.P.custom[m];
        const nm = mn.value.trim().toLowerCase();
        const ne = en.value.trim();
        if (nm && ne) S.P.custom[nm] = ne;
        S.touch();
        UI.updateCounts();
      };
      mn.onchange = upd;
      en.onchange = upd;
      const del = mini("×", "Устгах", () => {
        delete S.P.custom[m];
        S.touch();
        UI.renderDict();
      }, "xbtn danger");
      row.append(mn, ar, en, del);
      cl.appendChild(row);
    });

    UI.runDictSearch();
  };

  UI.runDictSearch = function () {
    const q = (el("dictSearch").value || "").trim();
    const box = el("dictHits");
    const hits = WB.dict.search(q, { cat: dictCat, custom: S.P.custom, limit: 120 });
    if (!hits.length) {
      box.innerHTML = '<p class="note" style="padding:10px">Олдсонгүй. Доор гараар нэмж болно.</p>';
      return;
    }
    box.innerHTML = "";
    hits.forEach((h) => {
      const d = document.createElement("div");
      d.className = "hit";
      const m = document.createElement("span");
      m.className = "m";
      m.textContent = h.mn + (h.cat === "custom" ? " ✎" : "");
      const e = document.createElement("span");
      e.className = "e";
      e.textContent = h.en;
      const c = document.createElement("span");
      c.className = "c";
      c.textContent = WB.dict.catLabel(h.cat);
      d.append(m, e, c);
      box.appendChild(d);
    });
  };

  /* ── тоолуурууд, төлөв ──────────────────────────────────── */
  UI.updateCounts = function () {
    const set = (id, v) => {
      const n = el(id);
      if (n) n.textContent = v;
    };
    set("dcBuilt", WB.dict.size().toLocaleString("en-US"));
    set("dcCats", WB.dict.cats.length);
    set("dcCustom", Object.keys(S.P.custom).length);
    set("dcUnk", [...T.unknown].filter((w) => !S.P.custom[w]).length);

    const blocks = PR.blocks();
    set("statScenes", S.P.scenes.length);
    set("statCast", S.P.cast.length);
    set("statLocs", S.P.locs.length);
    set("statPrompts", blocks.length);

    const pend = S.pending().length;
    const badge = el("pendBadge");
    if (badge) {
      badge.textContent = pend ? pend + " орчуулга хүлээгдэж байна" : "";
      badge.classList.toggle("on", pend > 0);
    }
  };

  UI.setStatus = function () {
    const st = WB.api.state;
    const box = el("status");
    const txt = el("statusTxt");
    if (!box) return;
    const busy = st.busy > 0;
    box.className = busy
      ? "busy"
      : st.mode === "unknown"
      ? ""
      : WB.api.live()
      ? "ai"
      : "off";
    txt.textContent = busy
      ? "Ажиллаж байна… (" + st.busy + ")"
      : st.mode === "unknown"
      ? "Шалгаж байна…"
      : st.forceOffline
      ? "Гараар офлайн болгосон"
      : st.mode === "proxy"
      ? "AI идэвхтэй · сервер"
      : st.mode === "key"
      ? "AI идэвхтэй · түлхүүр"
      : "Офлайн толь";
    const g = el("gear");
    if (g) g.classList.toggle("live", WB.api.live());
    const usage = el("usage");
    if (usage) {
      usage.textContent = st.calls ? st.calls + " дуудлага · " + Math.round((st.inTokens + st.outTokens) / 1000) + "k токен" : "";
    }
  };

  /* ── бүх зүйлийг дахин зурах ────────────────────────────── */
  UI.renderAll = function () {
    duals = [];
    if (WB.brand) WB.brand.render();
    UI.renderStory();
    UI.renderCards(S.P.cast, S.CAST_FIELDS, "castList", "char", "Дүр", "Дүрийн нэр…");
    UI.renderCards(S.P.locs, S.LOC_FIELDS, "locList", "loc", "Байршил", "Байршлын нэр…");
    UI.renderOut();
    UI.renderDict();
    const t = el("projTitle");
    if (t && t.value !== S.P.title) t.value = S.P.title;
    UI.syncOpts();
  };

  UI.syncOpts = function () {
    const o = S.P.opts;
    U.qsa(".stl").forEach((c) => (c.checked = o.styles.includes(c.value)));
    const tgt = el("targetSel");
    if (tgt) tgt.value = o.target;
    const ar = el("arSel");
    if (ar) ar.value = o.ar;
    const neg = el("negIn");
    if (neg) neg.value = o.negative;
    const cont = el("contChk");
    if (cont) cont.checked = !!o.continuity;
    const at = el("autoTrChk");
    if (at) at.checked = !!o.autoTranslate;
    const br = el("brandChk");
    if (br) br.checked = o.brandOn !== false;
  };

  /* ── багц орчуулга ──────────────────────────────────────── */
  UI.translatePending = async function (kinds, force, btn) {
    const targets = S.pending(kinds, force);
    if (!targets.length) {
      U.toast("Орчуулах шинэ зүйл алга", "info");
      return;
    }
    const bar = UI.progress("Орчуулж байна…");
    try {
      const r = await T.run(targets, (d, t) => bar.set(d, t));
      duals.forEach((d) => d._sync && d._sync());
      UI.renderAll();
      S.touch();
      U.toast(
        "Орчууллаа: " + r.ai + " AI, " + r.dict + " толь" + (r.dict && !WB.api.live() ? " (офлайн)" : ""),
        "good"
      );
    } catch (e) {
      U.toast("Орчуулга бүтсэнгүй: " + e.message, "bad");
    } finally {
      bar.done();
    }
  };

  UI.makeShots = async function (scene, btn) {
    if (!WB.auto.needAI()) return;
    await withBtn(btn, "Гаргаж байна…", async () => {
      scene.shots = await WB.auto.shotList(scene, Number(el("shotCount") ? el("shotCount").value : 4) || 4);
      S.touch();
      UI.renderAll();
      await UI.translatePending(["shot"]);
    });
  };

  /* ── явцын мөр ──────────────────────────────────────────── */
  UI.progress = function (label) {
    const bar = el("progress");
    const lab = el("progressLabel");
    const fill = el("progressFill");
    bar.classList.add("on");
    lab.textContent = label;
    fill.style.width = "4%";
    return {
      set(done, total) {
        lab.textContent = label + " " + done + "/" + total;
        fill.style.width = Math.max(4, Math.round((done / Math.max(1, total)) * 100)) + "%";
      },
      label(t) {
        lab.textContent = t;
      },
      done() {
        fill.style.width = "100%";
        setTimeout(() => bar.classList.remove("on"), 600);
      }
    };
  };

  async function withBtn(btn, label, fn) {
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = label;
    try {
      await fn();
    } catch (e) {
      if (e.message !== "__cancelled__") U.toast("Алдаа: " + e.message, "bad");
    }
    btn.disabled = false;
    btn.textContent = old;
  }
  UI.withBtn = withBtn;
})(window.WB);
