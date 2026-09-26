/* ═════════════════════════════════════════════════════════════
   75 · Edit хуудасны заавар — хөтөч дээрх жишээнүүд

   Timeline-ийн жишээнд жижиг timeline зурна: V1, A1 (заримд A2) зам,
   A · B · C клип, заагч. Клип бүрийн дотор эх бичлэгийн аль хэсэг
   харагдаж байгааг (эх: 2.0–8.0 с) бичнэ — slip, roll-ийн ялгаа харагдана.
   Viewer-ийн жишээнд 71-ийн сансрын кадрыг ашиглана.

   Бүтэц: E.demos[нэр] = { controls, init(stage, S, tool) → st, update(v, before, st, ctl, act),
                           noAB?, abLabels?, hint? }
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const E = RM.ez, G = RM.fz, el = G.el, W = G.W, H = G.H, P = G.planet;
  const D = (E.demos = {});

  const R = (id, label, min, max, step, value, unit, fmt) => ({ id, label, type: "range", min, max, step, value, unit, fmt });
  const SEL = (id, label, options, value) => ({ id, label, type: "select", options, value });
  const CHK = (id, label, value) => ({ id, label, type: "check", value });
  const BTN = (id, label) => ({ id, label, type: "button" });
  const sec = (n) => n.toFixed(1);
  const FPS = 24;

  /* ══════════ Timeline-ийн жижиг загвар ══════════ */
  const HUE = { A: 208, B: 28, C: 152, S: 285, "B1": 28, "B2": 28, VO: 0 };
  const copy = (arr) => arr.map((c) => Object.assign({}, c));

  function tlInit(stage, S, tracks) {
    stage.classList.add("ez-stage");
    const root = el("div", { class: "ez-tl" });
    const ruler = el("div", { class: "ez-ru" });
    const rows = el("div", { class: "ez-rows" });
    const ph = el("div", { class: "ez-ph" });
    const info = el("div", { class: "ez-info", "aria-live": "polite" });
    const lanes = {};
    (tracks || ["V1", "A1"]).forEach((id) => {
      const lane = el("div", { class: "ez-lane" });
      lanes[id] = lane;
      rows.appendChild(el("div", { class: "ez-row " + (id[0] === "V" ? "v" : "a") }, [el("span", { class: "ez-hd", text: id }), lane]));
    });
    const phWrap = el("div", { class: "ez-phwrap" }, [ph]);
    root.appendChild(ruler); root.appendChild(rows); root.appendChild(phWrap); root.appendChild(info);
    stage.appendChild(root);
    return { root, ruler, lanes, ph, info, src: S.src, phWrap };
  }

  /* model = { T, t0?, ph, tracks: {V1:[clip], A1:[clip]}, ghosts: {V1:[{s,d}]}, marks:[{t,color,where}], snap, msg, opts } */
  function tlRender(st, m) {
    const T0 = m.t0 || 0, T = m.T, span = T - T0;
    const pct = (t) => ((t - T0) / span * 100);
    const o = m.opts || {};
    /* шугам */
    const step = span > 40 ? 10 : span > 12 ? 2 : span > 5 ? 1 : 0.5;
    let rh = "";
    for (let t = Math.ceil(T0 / step) * step; t <= T + 1e-6; t += step) rh += '<span style="left:' + pct(t) + '%">' + (step < 1 ? t.toFixed(1) : t.toFixed(0)) + "</span>";
    (m.marks || []).filter((k) => k.where === "timeline").forEach((k) => { rh += '<i class="ez-mk" style="left:' + pct(k.t) + "%;--mc:" + k.color + '"></i>'; });
    st.ruler.innerHTML = rh;
    /* зам бүр */
    for (const id in st.lanes) {
      const lane = st.lanes[id], clips = (m.tracks[id] || []).slice().sort((a, b) => a.s - b.s);
      let h = "";
      /* хоосон зай — видео замд, клипүүдийн хооронд */
      if (id[0] === "V" && !o.noGaps) {
        let end = 0;
        clips.forEach((c) => { if (c.s - end > 0.05 && end > 0) h += '<div class="ez-gap" style="left:' + pct(end) + "%;width:" + (pct(c.s) - pct(end)) + '%"></div>'; end = Math.max(end, c.s + c.d); });
      }
      ((m.ghosts || {})[id] || []).forEach((g) => { h += '<div class="ez-ghost" style="left:' + pct(g.s) + "%;width:" + (pct(g.s + g.d) - pct(g.s)) + '%"></div>'; });
      clips.forEach((c) => {
        if (c.s + c.d < T0 || c.s > T) return;
        const left = pct(c.s), w = pct(c.s + c.d) - left;
        const hue = c.hue != null ? c.hue : (HUE[c.n] != null ? HUE[c.n] : 200);
        const cls = "ez-clip " + (id[0] === "V" ? "v" : "a") + (c.chg ? " chg" : "") + (c.rec ? " rec" : "") + (c.cut ? " cut" : "") + (c.shake ? " shake" : "");
        const srcTxt = o.durs === false ? "" : (o.srcLabel !== false ? "эх " + sec(c.i) + "–" + sec(c.i + c.d) : sec(c.d) + " с");
        const name = o.names === false ? "" : c.label || c.n;
        let style = "left:" + left + "%;width:" + w + "%;--h:" + hue + ";--i:" + c.i + ";";
        if (c.op != null) style += "--op:" + c.op + ";";
        let inner = "";
        if (id[0] === "V") {
          const th = o.thumb || "film";
          inner = '<span class="ez-img ' + th + '" style="background-image:url(' + st.src + ')"></span>';
        } else {
          inner = o.wave === false ? "" : '<span class="ez-wave" style=\'background-image:' + (o.nonrect === false ? WAVE.uni : WAVE.bi) + '\'></span>';
        }
        const badge = c.off ? '<b class="ez-off">' + (c.off > 0 ? "+" : "") + c.off + "</b>" : "";
        const flag = c.flag ? '<i class="ez-flag" style="--fc:' + c.flag + '"></i>' : "";
        const cm = (m.marks || []).filter((k) => k.where === "clip" && k.clip === c.n).map((k) => '<i class="ez-cmk" style="left:' + ((k.t - c.s) / c.d * 100) + "%;--mc:" + k.color + '"></i>').join("");
        h += '<div class="' + cls + '" style="' + style + '">' + inner + badge + flag + cm +
             '<span class="ez-cn"><b>' + name + "</b>" + (srcTxt ? "<small>" + srcTxt + "</small>" : "") + "</span></div>";
      });
      if (m.snap != null && id === Object.keys(st.lanes)[0]) h += '<div class="ez-snap" style="left:' + pct(m.snap) + '%"></div>';
      lane.innerHTML = h;
    }
    /* заагч */
    st.ph.style.left = pct(m.ph) + "%";
    st.ph.hidden = m.ph == null || m.ph < T0 || m.ph > T;
    st.info.innerHTML = "<span>" + (m.msg || "") + "</span>";
  }

  /* Дууны долгионы зураг — нэг удаа үүсгэнэ (хоёр талт ба нэг талт) */
  const WAVE = (() => {
    const r = G.prng(11); let bi = "", uni = "";
    for (let x = 0; x < 120; x++) {
      const a = Math.max(0.08, Math.min(1, 0.25 + 0.55 * Math.abs(Math.sin(x / 7)) * (0.5 + r()) + (r() < 0.08 ? 0.3 : 0)));
      bi += '<rect x="' + x + '" y="' + (20 - a * 18).toFixed(1) + '" width=".7" height="' + (a * 36).toFixed(1) + '"/>';
      uni += '<rect x="' + x + '" y="' + (40 - a * 38).toFixed(1) + '" width=".7" height="' + (a * 38).toFixed(1) + '"/>';
    }
    const url = (body) => 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" preserveAspectRatio="none" width="120" height="40"><g fill="#fff">' + body + "</g></svg>") + '")';
    return { bi: url(bi), uni: url(uni) };
  })();

  const endOf = (clips) => clips.reduce((e, c) => Math.max(e, c.s + c.d), 0);
  const lenMsg = (clips, base) => {
    const L = endOf(clips), dl = L - base;
    return "Timeline-ийн урт: <b>" + sec(L) + " с</b>" + (Math.abs(dl) > 0.05 ? ' <span class="' + (dl > 0 ? "up" : "dn") + '">(' + (dl > 0 ? "+" : "") + sec(dl) + ")</span>" : " (хэвээр)");
  };
  const BASE = () => [{ n: "A", s: 0, d: 5, i: 1 }, { n: "B", s: 5, d: 6, i: 2 }, { n: "C", s: 11, d: 5, i: 0.5 }];

  /* Нэг клипийг [a, b] хэсгээр дарж бичих (хасах) */
  function carve(clips, a, b) {
    const out = [];
    clips.forEach((c) => {
      const cs = c.s, ce = c.s + c.d;
      if (ce <= a + 1e-6 || cs >= b - 1e-6) { out.push(c); return; }
      if (cs < a) out.push(Object.assign({}, c, { d: a - cs, chg: true }));
      if (ce > b) out.push(Object.assign({}, c, { s: b, d: ce - b, i: c.i + (b - cs), chg: true }));
    });
    return out;
  }
  /* t цэгт клипийг хоёр хуваах */
  function split(clips, t, tag) {
    const out = [];
    clips.forEach((c) => {
      if (t > c.s + 0.05 && t < c.s + c.d - 0.05) {
        out.push(Object.assign({}, c, { d: t - c.s, label: c.n + "1", cut: tag }));
        out.push(Object.assign({}, c, { s: t, d: c.s + c.d - t, i: c.i + (t - c.s), label: c.n + "2", cut: tag }));
      } else out.push(c);
    });
    return out;
  }
  const both = (v, a) => ({ V1: v, A1: a || copy(v) });

  /* ═════ 1. Selection Mode ═════ */
  D.selection = {
    controls: [SEL("act", "Хулганаар", [["move", "B-г голоос нь чирж зөөх"], ["trim", "B-ийн баруун ирмэгийг чирэх"]], "move"),
               R("amt", "Хэр хол", 0, 3, 0.1, 2, " с")],
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      let c = BASE(); const base = endOf(c);
      let msg = "Өмнө: A · B · C хоорондоо зайгүй. " + lenMsg(c, base);
      const ghosts = {};
      if (!before) {
        const B = c[1];
        ghosts.V1 = [{ s: B.s, d: B.d }];
        if (v.act === "move") {
          const ns = B.s + v.amt, others = carve([c[0], c[2]], ns, ns + B.d);
          c = others.concat([Object.assign({}, B, { s: ns, chg: true })]);
          msg = "B " + sec(v.amt) + " с зөөгдөж, ард нь <b>хоосон зай</b> үлдэв; C-ийн эхний " + sec(v.amt) + " с <b>дарагдав</b>. " + lenMsg(c, base);
        } else {
          c[1] = Object.assign({}, B, { d: B.d - v.amt, chg: true });
          msg = "B богиносож <b>" + sec(v.amt) + " с хоосон зай</b> үлдэв — C хөдөлсөнгүй. " + lenMsg(c, base);
        }
      }
      tlRender(st, { T: 20, ph: 8, tracks: both(c), ghosts: { V1: ghosts.V1, A1: ghosts.V1 }, msg });
    }
  };

  /* ═════ 2. Trim Edit Mode — ripple, roll, slip, slide ═════ */
  function trimModel(type, amt) {
    const c = BASE(); const [A, B, C] = c;
    if (type === "ripple") { B.d += amt; C.s += amt; B.chg = C.chg = true; }
    else if (type === "roll") { B.d += amt; C.s += amt; C.d -= amt; C.i += amt; B.chg = C.chg = true; }
    else if (type === "slip") { B.i += amt; B.chg = true; }
    else if (type === "slide") { A.d += amt; B.s += amt; C.s += amt; C.d -= amt; C.i += amt; A.chg = B.chg = C.chg = true; }
    return c;
  }
  const TRIM_TXT = {
    ripple: "B-ийн төгсгөл чирэгдэж, хойшхи C <b>хамт зөрөв</b>.",
    roll: "B|C огтлолт зөөгдөв: B уртсаж C богиносов (эсвэл эсрэгээр).",
    slip: "B-ийн байрлал, урт хэвээр — <b>эх бичлэгийн өөр хэсэг</b> харагдана (эх … тоог хар).",
    slide: "B хөршүүдийн хооронд зөөгдөв: A уртсаж C богиносов, B-ийн агуулга хэвээр."
  };
  D.trim = {
    controls: [SEL("type", "Тайралтын төрөл", [["ripple", "Ripple — B-ийн ирмэг"], ["roll", "Roll — B|C огтлолт"], ["slip", "Slip — B-ийн дээд хагас"], ["slide", "Slide — B-ийн доод хагас"]], "ripple"),
               R("amt", "Чирэх зай", -2, 2, 0.1, 1.5, " с")],
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      const base = endOf(BASE());
      const c = before ? BASE() : trimModel(v.type, v.amt);
      tlRender(st, { T: 20, ph: 8, tracks: both(c), msg: (before ? "Өмнө. " : TRIM_TXT[v.type] + " ") + lenMsg(c, base) });
    }
  };

  /* ═════ 3. Blade ═════ */
  D.blade = {
    controls: [R("ph", "Заагч (хэрчих газар)", 1, 15, 0.1, 8, " с"), CHK("link", "Linked Selection асаалттай", true)],
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      const c = BASE();
      let tv = c, ta = copy(c), msg = "Өмнө: B бүтэн нэг клип.";
      if (!before) {
        tv = split(c, v.ph, true);
        ta = v.link ? split(copy(c), v.ph, true) : copy(c);
        msg = "Заагч дээр хэрчигдэв — клип хоёр болсон ч <b>тоглуулахад ялгаагүй</b>. " + (v.link ? "Дуу ч хамт хэрчигдэв." : "Linked унтраалттай — <b>зөвхөн видео</b> хэрчигдэв.") + " " + lenMsg(tv, 16);
      }
      tlRender(st, { T: 20, ph: v.ph, tracks: both(tv, ta), msg });
    }
  };

  /* ═════ 4. Dynamic Trim (Slip) ═════ */
  D.dyntrim = {
    controls: [SEL("mode", "Дэд горим", [["slip", "Slip (зурагт)"], ["slide", "Slide"]], "slip"),
               R("amt", "J ◀ · K ■ · L ▶ тоглуулсан", -2, 2, 0.1, 1, " с", (n) => (n < 0 ? "J " : n > 0 ? "L " : "K ") + Math.abs(n).toFixed(1))],
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      const c = before ? BASE() : trimModel(v.mode, v.amt);
      const key = v.amt < 0 ? "J — хойш" : v.amt > 0 ? "L — урагш" : "K — зогсоосон";
      tlRender(st, { T: 20, ph: 8, tracks: both(c), msg: before ? "Өмнө." : "<b>" + key + "</b> " + sec(Math.abs(v.amt)) + " с тоглуулаад K-оор зогсоов → " + TRIM_TXT[v.mode] });
    }
  };

  /* ═════ 5–7. Insert / Overwrite / Replace ═════ */
  const SRC = { n: "S", d: 3, i: 4, hue: HUE.S, label: "S (Source)" };
  const editCtl = [R("ph", "Timeline-ийн заагч", 1, 15, 0.1, 8, " с")];
  D.insert = {
    controls: editCtl,
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      let c = BASE(); const base = endOf(c);
      let msg = "Source viewer-т <b>S</b> (3 с) бэлэн. Заагч " + sec(v.ph) + " с дээр.";
      if (!before) {
        c = split(c, v.ph).map((k) => (k.s >= v.ph - 1e-6 ? Object.assign({}, k, { s: k.s + SRC.d, chg: true }) : k));
        c.push(Object.assign({}, SRC, { s: v.ph, chg: true }));
        msg = "S шигтгэгдэж, заагчаас хойшхи бүх клип <b>3 с баруун тийш</b> түлхэгдэв. Юу ч устсангүй. " + lenMsg(c, base);
      }
      tlRender(st, { T: 22, ph: v.ph, tracks: both(c), msg });
    }
  };
  D.overwrite = {
    controls: editCtl,
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      let c = BASE(); const base = endOf(c);
      let msg = "Source viewer-т <b>S</b> (3 с) бэлэн. Заагч " + sec(v.ph) + " с дээр.";
      if (!before) {
        c = carve(c, v.ph, v.ph + SRC.d);
        c.push(Object.assign({}, SRC, { s: v.ph, chg: true }));
        msg = "S доорх " + sec(SRC.d) + " с-ийг <b>дарж бичив</b> — бусад клип хөдөлсөнгүй. " + lenMsg(c, base);
      }
      tlRender(st, { T: 22, ph: v.ph, tracks: both(c), msg });
    }
  };
  D.replace = {
    controls: editCtl,
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      const c = BASE(); const base = endOf(c);
      const k = c.findIndex((x) => v.ph >= x.s && v.ph < x.s + x.d);
      let msg = "Source viewer-т <b>S</b> бэлэн. Заагч " + sec(v.ph) + " с — " + (k >= 0 ? c[k].n + " клип дээр." : "хоосон газар.");
      if (!before && k >= 0) {
        const t = c[k];
        c[k] = Object.assign({}, SRC, { s: t.s, d: t.d, i: SRC.i - (v.ph - t.s), chg: true, label: "S" });
        msg = t.n + " → <b>S</b>: байрлал, урт нь " + t.n + "-ийнх (" + sec(t.d) + " с). Source-ийн заагч дээрх кадр timeline-ийн заагчтай тэгшлэгдэв. " + lenMsg(c, base);
      }
      tlRender(st, { T: 22, ph: v.ph, tracks: both(c), msg });
    }
  };

  /* ═════ 8. Snapping ═════ */
  D.snapping = {
    abLabels: ["Унтраалттай", "Асаалттай"], hint: "C-г гүйлгэгчээр чирж үзээрэй",
    controls: [R("pos", "C-г чирэх байрлал", 10.2, 16, 0.05, 11.35, " с")],
    init: (stage, S) => tlInit(stage, S),
    update(v, off, st) {
      const c = BASE(); c.splice(2, 1);
      const C = { n: "C", s: v.pos, d: 4, i: 0.5, chg: true }, ph = 14, TH = 0.6;
      let s = v.pos, snap = null;
      if (!off) {
        const cand = [[11, 11], [ph, ph], [ph - C.d, ph]];
        for (const [start, line] of cand) if (Math.abs(v.pos - start) < TH) { s = start; snap = line; break; }
      }
      C.s = s;
      const gap = s - 11;
      let msg = snap != null ? "Наалдав: C " + (snap === 11 ? "B-ийн төгсгөлд" : "заагчид") + " (" + sec(s) + " с)." :
        (gap > 0 && gap < 0.8 ? "B, C хооронд <b>" + Math.round(gap * FPS) + " кадр хар</b> завсар — тоглуулахад анивчина." :
         gap < 0 && gap > -0.8 ? "C нь B-ийн сүүлийн <b>" + Math.round(-gap * FPS) + " кадрыг</b> дарав." : "C " + sec(s) + " с-т.");
      tlRender(st, { T: 20, ph, tracks: both(carve(c, s, s + C.d).concat([C])), snap, msg });
    }
  };

  /* ═════ 9. Linked Selection ═════ */
  D.linked = {
    abLabels: ["Унтраалттай", "Асаалттай"], hint: "B-ийн видеог чирж үзээрэй",
    controls: [R("amt", "B-ийн видеог зөөх", -1.5, 1.5, 0.05, 0.5, " с")],
    init: (stage, S) => tlInit(stage, S),
    update(v, off, st) {
      const c = [{ n: "A", s: 0, d: 5, i: 1 }, { n: "B", s: 7, d: 5, i: 2 }, { n: "C", s: 14, d: 4, i: 0.5 }];
      const vv = copy(c), aa = copy(c);
      vv[1].s += v.amt; vv[1].chg = true;
      let msg;
      if (!off) { aa[1].s += v.amt; aa[1].chg = true; msg = "Видео, дуу <b>хамт</b> зөөгдөв — синк хэвээр."; }
      else {
        const f = Math.round(v.amt * FPS);
        if (f) { vv[1].off = f; aa[1].off = -f; }
        msg = f ? "Зөвхөн видео зөөгдөв — дуу <b>" + Math.abs(f) + " кадраар зөрөв</b> (Resolve улаан " + (f > 0 ? "+" : "") + f + " гэж харуулна)." : "Зөрөөгүй.";
      }
      tlRender(st, { T: 20, ph: 9, tracks: both(vv, aa), msg });
    }
  };

  /* ═════ 10. Position Lock ═════ */
  D.poslock = {
    abLabels: ["Түгжээгүй", "Position Lock"],
    controls: [BTN("move", "B-г 2 с баруун тийш зөөх оролдох"), R("op", "B · Opacity", 0, 100, 1, 100)],
    init(stage, S) { const st = tlInit(stage, S); st.moved = false; st.shake = 0; return st; },
    update(v, off, st, ctl, act) {
      const locked = !off;
      if (act === "move") { if (locked) { st.shake++; st.moved = false; } else st.moved = !st.moved; }
      if (locked && st.moved) st.moved = false;
      ctl.label("move", st.moved ? "B-г буцааж тавих" : "B-г 2 с баруун тийш зөөх оролдох");
      let c = BASE();
      if (st.moved) c = carve([c[0], c[2]], 7, 13).concat([Object.assign({}, c[1], { s: 7, chg: true })]);
      const B = c.find((x) => x.n === "B"); B.op = v.op / 100;
      if (act === "move" && locked) B.shake = true;
      const msg = locked ? (act === "move" ? "<b>Түгжээтэй</b> — B хөдөлсөнгүй. Харин Opacity (" + v.op + ") засагдав." : "Position Lock: клип хөдлөхгүй, шинж нь засагдана. Opacity " + v.op + ".")
                         : (st.moved ? "Түгжээгүй — B зөөгдөж C-г дарав. Санамсаргүй ийм зүйл болохоос түгжээ хамгаална." : "Түгжээгүй. Opacity " + v.op + ".");
      tlRender(st, { T: 20, ph: 8, tracks: both(c), msg });
    }
  };

  /* ═════ 11–12. Flag, Marker ═════ */
  const COLORS = [["#2f7ff5", "Blue"], ["#27cfd8", "Cyan"], ["#2fc24a", "Green"], ["#f0a232", "Yellow"], ["#e8392f", "Red"], ["#f040b8", "Pink"],
    ["#9a3cf0", "Purple"], ["#e2346c", "Fuchsia"], ["#f39ab8", "Rose"], ["#a79cf0", "Lavender"], ["#8fd6f4", "Sky"], ["#72d46a", "Mint"],
    ["#e6e45a", "Lemon"], ["#e8a66c", "Sand"], ["#9a6b52", "Cocoa"], ["#f4efe4", "Cream"]];
  const colorSel = (id, def) => SEL(id, "Өнгө", COLORS, def);
  D.flag = {
    controls: [colorSel("c", "#2fc24a"), CHK("smart", "Media Pool-д зөвхөн энэ өнгийн тугтайг харуулах", false)],
    init(stage, S) { const st = tlInit(stage, S); return st; },
    update(v, before, st) {
      /* A клипийг хэрчиж хоёр хэсэг болгосон — туг эх клипэд хамаардаг тул хоёуланд нь гарна */
      const c = [{ n: "A", s: 0, d: 4, i: 1, label: "A (1-р хэсэг)" }, { n: "B", s: 4, d: 6, i: 2 }, { n: "A", s: 10, d: 5, i: 8, label: "A (2-р хэсэг)" }];
      if (!before) c.forEach((k) => { if (k.n === "A") k.flag = v.c; });
      if (!before && v.smart) c.splice(1, 1);
      const name = (COLORS.find((x) => x[0] === v.c) || [0, ""])[1];
      tlRender(st, { T: 18, ph: 6, tracks: both(c), opts: { noGaps: true, srcLabel: false },
        msg: before ? "Туггүй." : "A клипэд <b>" + name + "</b> туг — timeline дахь <b>хоёр хэсэгт хоёуланд</b> нь гарав (туг эх клипэд хамаардаг)." + (v.smart ? " Smart Bin-ээр шүүвэл зөвхөн A." : "") });
    }
  };
  D.marker = {
    controls: [colorSel("c", "#2f7ff5"), SEL("where", "Хаана", [["timeline", "Timeline-ийн шугам дээр (клип сонгоогүй)"], ["clip", "B клип дээр (клип сонгосон)"]], "timeline"),
               R("t", "Кадар", 5.2, 10.8, 0.1, 7.5, " с"), CHK("mv", "Дараа нь B-г 3 с зөөх", false)],
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      let c = BASE();
      const marks = before ? [] : [{ t: v.t, color: v.c, where: v.where, clip: "B" }];
      if (v.mv) {
        const B = Object.assign({}, c[1], { s: c[1].s + 3, chg: true });
        c = carve([c[0], c[2]], B.s, B.s + B.d).concat([B]);
        if (marks[0] && v.where === "clip") marks[0].t += 3;
      }
      const msg = before ? "Тэмдэглэгээгүй." : (v.where === "timeline" ? "Timeline marker — шугам дээр, клип зөөсөн ч <b>байрандаа</b>." : "Clip marker — B дээр, B-тэй <b>хамт зөөгдөнө</b>.") + " Эцсийн бичлэгт харагдахгүй.";
      tlRender(st, { T: 20, ph: v.t, tracks: both(c), marks, opts: { srcLabel: false }, msg });
    }
  };

  /* ═════ 13–15. Томруулалт ═════ */
  const LONG = (() => { const r = G.prng(7), out = []; let t = 0, k = 0; while (t < 58) { const d = 1.5 + r() * 5; out.push({ n: String.fromCharCode(65 + (k % 26)), s: t, d: Math.min(d, 60 - t), i: r() * 5, hue: (k * 47) % 360 }); t += d; k++; } return out; })();
  function zoomDemo(mode) {
    return {
      noAB: true,
      controls: [SEL("mode", "Горим", [["full", "Full Extent Zoom"], ["detail", "Detail Zoom"], ["custom", "Custom Zoom"]], mode),
                 R("z", "Custom · гүйлгэгч (− ● +)", 1, 12, 0.1, 3, "×"), R("ph", "Заагч", 0, 60, 0.1, 31, " с")],
      init: (stage, S) => tlInit(stage, S),
      update(v, before, st, ctl) {
        ctl.disable("z", v.mode !== "custom");
        const w = v.mode === "full" ? 60 : v.mode === "detail" ? 3 : 60 / v.z;
        let t0 = v.mode === "full" ? 0 : Math.max(0, Math.min(60 - w, v.ph - w / 2));
        const T = t0 + w;
        const vis = LONG.filter((c) => c.s + c.d > t0 && c.s < T).length;
        tlRender(st, { T, t0, ph: v.ph, tracks: both(LONG), opts: { srcLabel: false, names: w < 30, durs: false }, msg:
          "Цонхонд <b>" + sec(w) + " с</b> (" + Math.round(w * FPS) + " кадр), " + vis + " клип. " + (v.mode === "full" ? "Бүх 60 с." : v.mode === "detail" ? "Заагчийн орчим — кадраар засахад." : "Гүйлгэгчээр тохируулсан хэмжээ.") + " Бичлэг өөрчлөгдөхгүй." });
      }
    };
  }
  D["zoom-full"] = zoomDemo("full"); D["zoom-detail"] = zoomDemo("detail"); D["zoom-custom"] = zoomDemo("custom");

  /* ═════ 16. Timeline View Options ═════ */
  D.tvo = {
    noAB: true,
    controls: [CHK("wave", "Display Audio Waveforms", true), CHK("names", "Display Clip Names", true), CHK("durs", "Display Clip Durations", true),
               CHK("nonrect", "Display Non-Rectified Waveforms", true),
               SEL("thumb", "Thumbnail View ›", [["film", "Filmstrip"], ["ends", "Эхэн, төгсгөлийн зураг"], ["simple", "Зураггүй"]], "film"),
               R("vh", "Track Height · Video", 26, 60, 1, 44, "%"), R("ah", "Track Height · Audio", 20, 56, 1, 38, "%")],
    init: (stage, S) => tlInit(stage, S),
    update(v, before, st) {
      st.root.style.setProperty("--vh", v.vh + "%"); st.root.style.setProperty("--ah", v.ah + "%");
      tlRender(st, { T: 18, ph: 8, tracks: both(BASE()), opts: { wave: v.wave, names: v.names, durs: v.durs, nonrect: v.nonrect, thumb: v.thumb, srcLabel: false },
        msg: "Зөвхөн <b>харагдац</b> өөрчлөгдөв — бичлэг, дуу, урт хэвээр (16.0 с)." });
    }
  };

  /* ═════ 17. Баталгаажаагүй (Show Keyframe Tray) ═════ */
  D.unknown = {
    noAB: true, controls: [],
    init(stage) {
      stage.classList.add("ez-unknown");
      stage.appendChild(el("div", { class: "ez-q" }, [el("b", { text: "?" }), el("p", { text: "Энэ товчийг дарсны дараах дэлгэцийн зургийг илгээнэ үү — таамаглалгүйгээр жишээ хийнэ." })]));
      return {};
    },
    update() {}
  };

  /* ═════ 18. Voiceover ═════ */
  D.voiceover = {
    noAB: true,
    controls: [BTN("rec", "● Бичих"), R("ph", "Заагч (эхлэх газар)", 0, 10, 0.1, 3, " с")],
    init(stage, S) { const st = tlInit(stage, S, ["V1", "A1", "A2"]); st.takes = []; st.rec = null; return st; },
    update(v, before, st, ctl, act) {
      const draw = () => {
        const a2 = st.takes.map((t, k) => ({ n: "VO", s: t.s, d: t.d, i: 0, hue: 130, label: "Voiceover " + (k + 1) }));
        if (st.rec) a2.push({ n: "VO", s: st.rec.s, d: st.rec.d, i: 0, hue: 0, rec: true, label: "● REC" });
        tlRender(st, { T: 20, ph: st.rec ? st.rec.s + st.rec.d : v.ph, tracks: { V1: BASE(), A1: BASE(), A2: a2 }, opts: { srcLabel: false },
          msg: st.rec ? "Бичиж байна… " + sec(st.rec.d) + " с — дахин дарж зогсооно." :
            st.takes.length ? "A2 замд <b>" + st.takes.length + " бичлэг</b> нэмэгдэв — эцсийн бичлэгт орно. Видео хөндөгдсөнгүй." : "Бичих товч → ярих → дахин дарж зогсоо." });
      };
      if (act === "rec") {
        if (st.rec) { clearInterval(st.timer); st.takes.push({ s: st.rec.s, d: Math.max(0.4, st.rec.d) }); st.rec = null; ctl.label("rec", "● Бичих"); }
        else {
          st.rec = { s: v.ph, d: 0 }; ctl.label("rec", "■ Зогсоох");
          st.timer = setInterval(() => { if (!st.rec) return; st.rec.d = Math.min(20 - st.rec.s, st.rec.d + 0.25); draw(); if (st.rec.s + st.rec.d >= 20) { clearInterval(st.timer); st.takes.push(st.rec); st.rec = null; ctl.label("rec", "● Бичих"); draw(); } }, 125);
        }
      }
      draw();
    }
  };

  /* ══════════ Viewer-ийн жишээнүүд ══════════ */
  const img = (src, cls) => el("img", { src, class: "ly " + (cls || ""), alt: "", draggable: "false" });
  const pctX = (x) => (x / W * 100) + "%", pctY = (y) => (y / H * 100) + "%";

  /* ═════ 19. Transform ═════ */
  D.transform = {
    controls: [R("z", "Zoom", 0.4, 2, 0.01, 1.35), R("x", "Position X", -320, 320, 1, -90), R("y", "Position Y", -180, 180, 1, 20),
               R("r", "Rotation Angle", -45, 45, 0.5, 0, "°"), CHK("ovl", "Viewer ▭ ⌄ → Transform (бариул)", true)],
    init(stage, S) {
      stage.classList.add("ez-black");
      const i = img(S.src); stage.appendChild(i);
      const box = el("div", { class: "ez-box" }, ["tl", "tr", "bl", "br", "t", "b", "l", "r"].map((k) => el("i", { class: k })).concat([el("b")]));
      stage.appendChild(box);
      return { i, box };
    },
    update(v, before, st) {
      const tf = before ? "none" : "translate(" + (v.x / W * 100) + "%," + (v.y / H * 100) + "%) rotate(" + v.r + "deg) scale(" + v.z + ")";
      st.i.style.transform = tf; st.box.style.transform = tf;
      st.box.hidden = before || !v.ovl;
    }
  };

  /* ═════ 20. Crop ═════ */
  D.crop = {
    controls: [R("l", "Crop Left", 0, 300, 1, 40), R("r", "Crop Right", 0, 300, 1, 0), R("t", "Crop Top", 0, 170, 1, 46), R("b", "Crop Bottom", 0, 170, 1, 46),
               R("soft", "Softness", 0, 30, 0.5, 0), CHK("ovl", "Viewer ▭ ⌄ → Crop (бариул)", true)],
    checker: true,
    init(stage, S) {
      const i = img(S.src); stage.appendChild(i);
      const box = el("div", { class: "ez-box crop" }, ["t", "b", "l", "r"].map((k) => el("i", { class: k })));
      stage.appendChild(box);
      return { i, box };
    },
    update(v, before, st) {
      if (before) { st.i.style.webkitMaskImage = st.i.style.maskImage = "none"; st.box.hidden = true; return; }
      const x0 = v.l, y0 = v.t, x1 = W - v.r, y1 = H - v.b;
      G.setMask(st.i, G.maskURL((c) => c.rect(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)), v.soft));
      Object.assign(st.box.style, { left: pctX(x0), top: pctY(y0), width: pctX(x1 - x0), height: pctY(y1 - y0) });
      st.box.hidden = !v.ovl;
    }
  };

  /* ═════ 21. Dynamic Zoom ═════ */
  const EASE = { lin: (t) => t, in: (t) => t * t, out: (t) => 1 - (1 - t) * (1 - t), io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) };
  D.dynzoom = {
    controls: [R("t", "Клипийн явц", 0, 1, 0.01, 0.6, "", (n) => Math.round(n * 100) + "%"),
               SEL("ease", "Ease", [["lin", "Linear"], ["in", "Ease In"], ["out", "Ease Out"], ["io", "Ease In and Out"]], "io"),
               CHK("swap", "Swap (эхлэл, төгсгөл солих)", false), BTN("play", "▶ Тоглуулах")],
    init(stage, S) {
      stage.classList.add("ez-black");
      const i = img(S.src); stage.appendChild(i);
      const mini = el("div", { class: "ez-mini" }, [img(S.src), el("i", { class: "g" }), el("i", { class: "r" }), el("i", { class: "c" })]);
      stage.appendChild(mini);
      return { i, mini };
    },
    update(v, before, st, ctl, act) {
      if (act === "play" && !st.anim) {
        const t0 = performance.now();
        const step = (now) => { const t = Math.min(1, (now - t0) / 3000); ctl.set("t", t); this.update(Object.assign({}, v, { t }), before, st, ctl); if (t < 1) st.anim = requestAnimationFrame(step); else st.anim = null; };
        if (G.reduced) ctl.set("t", 1); else st.anim = requestAnimationFrame(step);
      }
      const S0 = { x: 0, y: 0, w: W, h: H }, E1 = { w: W * 0.5, h: H * 0.5 };
      E1.x = Math.min(W - E1.w, Math.max(0, P.x - E1.w / 2)); E1.y = Math.min(H - E1.h, Math.max(0, P.y - E1.h / 2));
      const [a, b] = v.swap ? [E1, S0] : [S0, E1];
      const k = EASE[v.ease](v.t);
      const cur = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, w: a.w + (b.w - a.w) * k, h: a.h + (b.h - a.h) * k };
      const sc = W / cur.w;
      st.i.style.transformOrigin = "0 0";
      st.i.style.transform = before ? "none" : "scale(" + sc + ") translate(" + (-cur.x / W * 100) + "%," + (-cur.y / H * 100) + "%)";
      const put = (n, r) => Object.assign(n.style, { left: pctX(r.x), top: pctY(r.y), width: pctX(r.w), height: pctY(r.h) });
      const [g, r, c] = st.mini.querySelectorAll("i");
      put(g, a); put(r, b); put(c, cur);
      st.mini.hidden = before;
    }
  };

  /* ═════ 22. Open FX Overlay — гэрлийн толбо ═════ */
  D.ofx = {
    controls: [R("x", "Center X", 0, W, 1, 470), R("y", "Center Y", 0, H, 1, 70), R("br", "Brightness", 0, 1.5, 0.01, 1), CHK("ovl", "Viewer ▭ ⌄ → Open FX Overlay", true)],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const fl = el("div", { class: "ly ez-flare" }); stage.appendChild(fl);
      const h = el("div", { class: "ez-handle" }); stage.appendChild(h);
      return { fl, h };
    },
    update(v, before, st) {
      const x = v.x / W * 100, y = v.y / H * 100;
      st.fl.style.background = "radial-gradient(circle at " + x + "% " + y + "%, rgba(255,240,210," + 0.95 * v.br + ") 0, rgba(255,190,110," + 0.45 * v.br + ") 5%, rgba(255,150,60," + 0.12 * v.br + ") 16%, transparent 34%)," +
        "linear-gradient(" + (y - 50) * 0.3 + "deg, transparent " + (y - 1) + "%, rgba(255,210,160," + 0.28 * v.br + ") " + y + "%, transparent " + (y + 1) + "%)";
      st.fl.hidden = before;
      Object.assign(st.h.style, { left: x + "%", top: y + "%" });
      st.h.hidden = before || !v.ovl;
    }
  };

  /* ═════ 23. Fusion Overlay — Fusion гарчиг ═════ */
  D.fusionovl = {
    controls: [R("x", "Center X", 0.1, 0.9, 0.005, 0.32), R("y", "Center Y", 0.1, 0.9, 0.005, 0.78), R("s", "Size", 0.5, 2, 0.01, 1), CHK("ovl", "Viewer ▭ ⌄ → Fusion Overlay", true)],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const t = el("div", { class: "ez-title" }, [el("span", { text: "ЭЭЖИЙН ДУУ" })]); stage.appendChild(t);
      const h = el("div", { class: "ez-fh" }); stage.appendChild(h);
      return { t, h };
    },
    update(v, before, st) {
      Object.assign(st.t.style, { left: v.x * 100 + "%", top: v.y * 100 + "%", fontSize: 6.2 * v.s + "cqw" });
      Object.assign(st.h.style, { left: v.x * 100 + "%", top: v.y * 100 + "%" });
      st.t.hidden = before; st.h.hidden = before || !v.ovl;
    }
  };

  /* ═════ 24. Annotations — хулганаар зурах ═════ */
  D.annotations = {
    abLabels: ["Deliver (эцсийн файл)", "Viewer (засвар)"], hint: "Кадар дээр хулганаар зураарай",
    controls: [SEL("tool", "Хэрэгсэл", [["pen", "Чөлөөт шугам"], ["arrow", "Сум"]], "arrow"),
               SEL("col", "Өнгө", [["#ff4d3d", "Улаан"], ["#ffd23d", "Шар"], ["#3dd6ff", "Цэнхэр"], ["#ffffff", "Цагаан"]], "#ff4d3d"), BTN("clr", "Цэвэрлэх")],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const c = G.canvas(W * 2, H * 2); c.className = "ly ez-draw"; stage.appendChild(c);
      const tag = el("span", { class: "ez-tag", text: "◆ Marker — Annotation" }); stage.appendChild(tag);
      const st = { c, ctx: c.getContext("2d"), strokes: [], tag, v: null };
      /* эхний жишээ сум */
      st.strokes.push({ tool: "arrow", col: "#ff4d3d", pts: [[180, 80], [335, 170]] });
      const pos = (e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
      let cur = null;
      c.addEventListener("pointerdown", (e) => { if (c.hidden) return; c.setPointerCapture(e.pointerId); cur = { tool: st.v.tool, col: st.v.col, pts: [pos(e)] }; st.strokes.push(cur); e.preventDefault(); });
      c.addEventListener("pointermove", (e) => { if (!cur) return; const p = pos(e); if (cur.tool === "arrow") cur.pts[1] = p; else cur.pts.push(p); paint(st); });
      c.addEventListener("pointerup", () => { cur = null; });
      c.addEventListener("pointercancel", () => { cur = null; });
      return st;
    },
    update(v, before, st, ctl, act) {
      st.v = v;
      if (act === "clr") st.strokes = [];
      st.c.hidden = before; st.tag.hidden = before;
      paint(st);
    }
  };
  function paint(st) {
    const x = st.ctx; x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, W, H);
    x.lineCap = x.lineJoin = "round"; x.lineWidth = 3.5;
    st.strokes.forEach((s) => {
      x.strokeStyle = x.fillStyle = s.col; x.beginPath();
      if (s.tool === "arrow") {
        if (s.pts.length < 2) return;
        const [[x0, y0], [x1, y1]] = s.pts, a = Math.atan2(y1 - y0, x1 - x0);
        x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
        x.beginPath(); x.moveTo(x1, y1); x.lineTo(x1 - 16 * Math.cos(a - 0.45), y1 - 16 * Math.sin(a - 0.45)); x.lineTo(x1 - 16 * Math.cos(a + 0.45), y1 - 16 * Math.sin(a + 0.45)); x.closePath(); x.fill();
      } else { s.pts.forEach(([px, py], k) => (k ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke(); }
    });
  }

  /* ═════ 25. Smart Reframe ═════ */
  const ASPECT = { "9:16": 9 / 16, "1:1": 1, "4:5": 4 / 5 };
  D.reframe = {
    abLabels: ["Голоос тайрсан", "Smart Reframe"],
    controls: [SEL("ar", "Шинэ харьцаа", [["9:16", "9:16 — босоо"], ["1:1", "1:1 — дөрвөлжин"], ["4:5", "4:5"]], "9:16"),
               SEL("mode", "Object of Interest", [["auto", "Auto"], ["ref", "Reference Point"]], "auto"),
               R("rx", "Reference Point · X", 0, W, 1, 150)],
    init(stage, S) {
      stage.appendChild(img(S.src, "ez-dim"));
      const win = el("div", { class: "ez-win" }, [img(S.src)]); stage.appendChild(win);
      const lab = el("span", { class: "ez-tag" }); stage.appendChild(lab);
      const dot = el("div", { class: "ez-ref" }); stage.appendChild(dot);
      return { win, lab, dot };
    },
    update(v, before, st, ctl) {
      ctl.disable("rx", v.mode !== "ref");
      const w = H * ASPECT[v.ar];
      const cx = before ? W / 2 : v.mode === "auto" ? P.x : v.rx;
      const x0 = Math.max(0, Math.min(W - w, cx - w / 2));
      Object.assign(st.win.style, { left: pctX(x0), width: pctX(w) });
      const inner = st.win.firstChild; Object.assign(inner.style, { width: (W / w * 100) + "%", left: (-x0 / w * 100) + "%" });
      const cut = P.x + P.r * 0.6 > x0 + w || P.x - P.r * 0.6 < x0;
      st.lab.textContent = (before ? "Голоос тайрсан " : "Smart Reframe ") + v.ar + (cut ? " — гариг таслагдав" : " — гариг хүрээнд");
      Object.assign(st.dot.style, { left: pctX(v.rx), top: "50%" });
      st.dot.hidden = before || v.mode !== "ref";
    }
  };

  /* ═════ 26. Jog Wheel ═════ */
  D.jog = {
    noAB: true,
    controls: [R("f", "● -г чирэх (кадар)", -24, 24, 1, 0, "", (n) => (n > 0 ? "+" : "") + n)],
    init(stage, S) {
      stage.classList.add("ez-black");
      const i = img(S.src); stage.appendChild(i);
      const tc = el("span", { class: "ez-tc" }); stage.appendChild(tc);
      const jw = el("div", { class: "ez-jw" }, [el("span", { text: "‹" }), el("i"), el("span", { text: "›" })]); stage.appendChild(jw);
      return { i, tc, jw };
    },
    update(v, before, st) {
      const base = 1 * FPS + 16, f = base + v.f;
      const tc = "01:00:" + String(Math.floor(f / FPS)).padStart(2, "0") + ":" + String(((f % FPS) + FPS) % FPS).padStart(2, "0");
      st.tc.textContent = tc;
      st.i.style.transform = "scale(1.08) translateX(" + (-v.f * 0.12) + "%)";
      st.jw.querySelector("i").style.transform = "translateX(" + v.f * 0.9 + "px)";
    }
  };
})(window.RM);
