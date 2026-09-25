/* ═════════════════════════════════════════════════════════════
   72 · Fusion заавар — хөтөч дээрх жишээнүүд

   Хэрэгсэл бүрийн нөлөөг хөтөчийн CSS шүүлтүүр, SVG шүүлтүүр, canvas-аар
   ойролцоогоор дуурайлгана. Fusion-ий бодит тооцоолол биш — юу өөрчлөгддөгийг
   нүдээр ойлгуулах зорилготой.

   Бүтэц:  G.demos[нэр] = { controls: [...], init(stage, S) → st, update(v, before, st, ctl) }
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const G = RM.fz, el = G.el, W = G.W, H = G.H, P = G.planet;
  const D = (G.demos = {});
  let uid = 0;
  const nid = (p) => "fz" + p + ++uid;

  const img = (src, cls, style) => el("img", { src, class: "ly " + (cls || ""), alt: "", draggable: "false", style });
  const layer = (cls, style) => el("div", { class: "ly " + (cls || ""), style });
  const svgNS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs) => { const n = document.createElementNS(svgNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

  /* SVG шүүлтүүр — хуудсанд нэг удаа үүсгэж, id-гаар нь хэрэглэнэ */
  function filterDef(stage, build) {
    const id = nid("f");
    const svg = svgEl("svg", { width: 0, height: 0, class: "defs", "aria-hidden": "true" });
    const f = svgEl("filter", { id, "color-interpolation-filters": "sRGB", x: "-5%", y: "-5%", width: "110%", height: "110%" });
    build(f);
    svg.appendChild(svgEl("defs", {})).appendChild(f);
    stage.appendChild(svg);
    return { id, f };
  }

  const R = (id, label, min, max, step, value, unit) => ({ id, label, type: "range", min, max, step, value, unit });
  const SEL = (id, label, options, value) => ({ id, label, type: "select", options, value });
  const CHK = (id, label, value) => ({ id, label, type: "check", value });
  const BTN = (id, label) => ({ id, label, type: "button" });

  /* ═════ 1. Background ═════ */
  const CORNERS = [[245, 168, 60], [111, 183, 220], [122, 63, 176], [47, 181, 154]];
  D.background = {
    controls: [
      SEL("type", "Type", [["solid", "Solid Color"], ["h", "Horizontal"], ["v", "Vertical"], ["four", "Four Corner"]], "four"),
      SEL("mode", "Merge · Apply Mode", [["soft-light", "Soft Light"], ["overlay", "Overlay"], ["normal", "Normal"], ["multiply", "Multiply"]], "soft-light"),
      R("blend", "Merge · Blend", 0, 1, 0.01, 0.75)
    ],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const c = G.canvas(160, 90); c.className = "ly smooth"; stage.appendChild(c);
      return { c };
    },
    update(v, before, st) {
      const ctx = st.c.getContext("2d"), id = ctx.createImageData(160, 90), d = id.data;
      for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
        const u = x / 159, w = y / 89, o = (y * 160 + x) * 4;
        for (let k = 0; k < 3; k++) {
          const tl = CORNERS[0][k], tr = CORNERS[1][k], bl = CORNERS[2][k], br = CORNERS[3][k];
          d[o + k] = v.type === "solid" ? tl : v.type === "h" ? tl + (tr - tl) * u : v.type === "v" ? tl + (bl - tl) * w
            : (tl * (1 - u) + tr * u) * (1 - w) + (bl * (1 - u) + br * u) * w;
        }
        d[o + 3] = 255;
      }
      ctx.putImageData(id, 0, 0);
      st.c.style.mixBlendMode = v.mode;
      st.c.style.opacity = v.blend;
      st.c.hidden = before;
    }
  };

  /* ═════ 2. FastNoise ═════ */
  function hash3(x, y, z) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440670441);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  const fade = (t) => t * t * (3 - 2 * t);
  function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
    let r = 0;
    for (let c = 0; c < 8; c++) {
      const dx = c & 1, dy = (c >> 1) & 1, dz = (c >> 2) & 1;
      r += hash3(xi + dx, yi + dy, zi + dz) * (dx ? xf : 1 - xf) * (dy ? yf : 1 - yf) * (dz ? zf : 1 - zf);
    }
    return r;
  }
  const NCOL = { smoke: [235, 240, 250], fire: [255, 150, 40], teal: [90, 205, 235] };
  D.noise = {
    controls: [
      R("detail", "Detail", 1, 7, 1, 4), R("scale", "Scale", 1, 12, 0.1, 4),
      R("contrast", "Contrast", 0.5, 3, 0.05, 1.6), R("bright", "Brightness", -0.4, 0.4, 0.01, -0.05),
      R("seethe", "Seethe Rate", 0, 1, 0.01, 0.35),
      SEL("color", "Color", [["smoke", "Цагаан утаа"], ["fire", "Улбар шар туяа"], ["teal", "Хөх манан"]], "smoke")
    ],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const c = G.canvas(128, 72); c.className = "ly smooth"; c.style.mixBlendMode = "screen"; stage.appendChild(c);
      const st = { c, t: 0, visible: false, raf: 0, v: null, before: false };
      const loop = () => {
        st.raf = 0;
        if (!st.visible || st.before || !st.v || st.v.seethe <= 0 || G.reduced) return;
        st.t += st.v.seethe * 0.03; draw(st); st.raf = requestAnimationFrame(loop);
      };
      st.kick = () => { if (!st.raf) st.raf = requestAnimationFrame(loop); };
      G.whenVisible(stage, (on) => { st.visible = on; if (on) st.kick(); });
      return st;
    },
    update(v, before, st) {
      st.v = v; st.before = before; st.c.hidden = before;
      draw(st); st.kick();
    }
  };
  function draw(st) {
    const v = st.v, ctx = st.c.getContext("2d"), id = ctx.createImageData(128, 72), d = id.data;
    const f = 5 / v.scale, col = NCOL[v.color];
    for (let y = 0; y < 72; y++) for (let x = 0; x < 128; x++) {
      let n = 0, a = 0.5, fr = 1, norm = 0;
      for (let o = 0; o < v.detail; o++) { n += a * noise3(x / 128 * f * 1.78 * fr, y / 72 * f * fr, st.t * fr + o * 7.1); norm += a; a *= 0.5; fr *= 2; }
      let t = (n / norm - 0.5) * v.contrast + 0.5 + v.bright;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const i = (y * 128 + x) * 4;
      d[i] = col[0] * t; d[i + 1] = col[1] * (v.color === "fire" ? t * t : t); d[i + 2] = col[2] * (v.color === "fire" ? t * t * t : t); d[i + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
  }

  /* ═════ 3. Text+ ═════ */
  D.text = {
    controls: [
      R("size", "Size", 3, 12, 0.1, 7.5), R("track", "Tracking", -0.05, 0.4, 0.01, 0.08),
      CHK("outline", "Shading · Outline", false), CHK("shadow", "Shading · Shadow", true),
      SEL("color", "Fill", [["#ffffff", "Цагаан"], ["#f5a83c", "Улбар шар"]], "#ffffff")
    ],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const t = el("div", { class: "ly fz-title" }, [el("span", { text: "ЭЭЖИЙН ДУУ" })]);
      stage.appendChild(t);
      return { t, s: t.firstChild };
    },
    update(v, before, st) {
      const s = st.s.style;
      s.fontSize = v.size + "cqw"; s.letterSpacing = v.track + "em"; s.color = v.color;
      s.webkitTextStroke = v.outline ? "0.12cqw #111" : "0";
      s.textShadow = v.shadow ? "0.35cqw 0.45cqw 0.6cqw rgba(0,0,0,.75)" : "none";
      st.t.hidden = before;
    }
  };

  /* ═════ 4. Paint ═════ */
  D.paint = {
    controls: [
      SEL("mode", "Apply Mode", [["clone", "Clone"], ["color", "Color"]], "clone"),
      R("size", "Brush Size", 3, 44, 1, 20)
    ],
    init(stage) {
      const c = G.canvas(); c.className = "ly"; stage.appendChild(c);
      return { c };
    },
    update(v, before, st) {
      const S = G.scene, ctx = st.c.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      if (v.mode === "clone") {
        ctx.drawImage(S.dirty, 0, 0);
        if (before) return;
        const m = G.canvas(), x = m.getContext("2d");
        x.lineWidth = v.size; x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#fff";
        x.beginPath(); G.scratch.forEach(([px, py], i) => (i ? x.lineTo(px + 2, py) : x.moveTo(px + 2, py))); x.stroke();
        x.globalCompositeOperation = "source-in"; x.drawImage(S.full, 0, 0);
        ctx.drawImage(m, 0, 0);
      } else {
        ctx.drawImage(S.full, 0, 0);
        if (before) return;
        ctx.save();
        ctx.strokeStyle = "rgba(245,168,60,.92)"; ctx.lineWidth = v.size; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(70, 300); ctx.bezierCurveTo(160, 220, 230, 330, 330, 250); ctx.stroke();
        ctx.lineWidth = v.size * 0.6; ctx.strokeStyle = "rgba(111,183,220,.9)";
        ctx.beginPath(); ctx.moveTo(520, 60); ctx.quadraticCurveTo(580, 30, 610, 90); ctx.stroke();
        ctx.restore();
      }
    }
  };

  /* ═════ 5. Color Corrector ═════ */
  D.cc = {
    controls: [
      R("hue", "Hue", -180, 180, 1, 0, "°"), R("sat", "Saturation", 0, 2, 0.01, 1.3), R("gain", "Gain", 0.5, 1.6, 0.01, 1.05),
      SEL("tint", "Tint", [["warm", "Дулаан (улбар шар)"], ["cool", "Хүйтэн (хөх)"], ["none", "Байхгүй"]], "warm"),
      R("str", "Tint · Strength", 0, 1, 0.01, 0.4)
    ],
    init(stage, S) {
      const i = img(S.src); stage.appendChild(i);
      const t = layer("", "mix-blend-mode:soft-light"); stage.appendChild(t);
      return { i, t };
    },
    update(v, before, st) {
      st.i.style.filter = before ? "none" : "hue-rotate(" + v.hue + "deg) saturate(" + v.sat + ") brightness(" + v.gain + ")";
      st.t.style.background = v.tint === "warm" ? "#e8892e" : "#2e86e8";
      st.t.style.opacity = v.str;
      st.t.hidden = before || v.tint === "none";
    }
  };

  /* ═════ 6. Color Curves ═════ */
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
  function curveTables(v) {
    const n = 17, r = [], g = [], b = [];
    for (let i = 0; i < n; i++) {
      const x = i / (n - 1), base = x + v.s * (x * x * (3 - 2 * x) - x);
      r.push(clamp01(base + v.red * 4 * x * (1 - x))); g.push(clamp01(base)); b.push(clamp01(base + v.blue * (1 - x) * (1 - x)));
    }
    return { r, g, b };
  }
  D.curves = {
    controls: [
      R("s", "S-муруй (контраст)", 0, 1, 0.01, 0.55), R("red", "Red · дунд цэг", -0.25, 0.25, 0.01, 0.06),
      R("blue", "Blue · сүүдэр өргөх", 0, 0.3, 0.01, 0.12)
    ],
    init(stage, S) {
      const fd = filterDef(stage, (f) => {
        const ct = svgEl("feComponentTransfer", {});
        ["R", "G", "B"].forEach((c) => ct.appendChild(svgEl("feFunc" + c, { type: "table", tableValues: "0 1" })));
        f.appendChild(ct);
      });
      const i = img(S.src); stage.appendChild(i);
      const graph = svgEl("svg", { viewBox: "0 0 100 100", class: "fz-graph", "aria-hidden": "true" });
      graph.innerHTML = '<rect x="0" y="0" width="100" height="100" fill="#0d1117" stroke="#3a4450"/>' +
        '<path d="M25 0V100M50 0V100M75 0V100M0 25H100M0 50H100M0 75H100" stroke="#25303a" stroke-width=".8"/>' +
        '<path d="M0 100L100 0" stroke="#3a4450" stroke-dasharray="2 2"/>';
      const lines = ["#e06060", "#6ccf7a", "#6aa8ff"].map((c) => { const p = svgEl("polyline", { fill: "none", stroke: c, "stroke-width": 1.8 }); graph.appendChild(p); return p; });
      return { i, fns: fd.f.querySelectorAll("feFuncR,feFuncG,feFuncB"), id: fd.id, graph, lines };
    },
    extra: (st) => st.graph,
    update(v, before, st) {
      const t = curveTables(v);
      [t.r, t.g, t.b].forEach((arr, k) => {
        st.fns[k].setAttribute("tableValues", arr.map((x) => x.toFixed(4)).join(" "));
        st.lines[k].setAttribute("points", arr.map((y, i) => (i / 16 * 100).toFixed(1) + "," + (100 - y * 100).toFixed(1)).join(" "));
      });
      st.i.style.filter = before ? "none" : "url(#" + st.id + ")";
    }
  };

  /* ═════ 7. Brightness / Contrast ═════ */
  D.bc = {
    controls: [
      R("gain", "Gain", 0.5, 1.8, 0.01, 1.12), R("lift", "Lift", -0.2, 0.25, 0.005, 0.03), R("gamma", "Gamma", 0.5, 2, 0.01, 1.2),
      R("con", "Contrast", 0.6, 1.6, 0.01, 1.1), R("sat", "Saturation", 0, 2, 0.01, 1.1)
    ],
    init(stage, S) {
      const fd = filterDef(stage, (f) => {
        const ct = svgEl("feComponentTransfer", {});
        ["R", "G", "B"].forEach((c) => ct.appendChild(svgEl("feFunc" + c, { type: "gamma", amplitude: 1, exponent: 1, offset: 0 })));
        f.appendChild(ct);
      });
      const i = img(S.src); stage.appendChild(i);
      return { i, fns: fd.f.querySelectorAll("feFuncR,feFuncG,feFuncB"), id: fd.id };
    },
    update(v, before, st) {
      st.fns.forEach((fn) => { fn.setAttribute("amplitude", v.gain * (1 - v.lift)); fn.setAttribute("exponent", 1 / v.gamma); fn.setAttribute("offset", v.lift); });
      st.i.style.filter = before ? "none" : "url(#" + st.id + ") contrast(" + v.con + ") saturate(" + v.sat + ")";
    }
  };

  /* ═════ 8. Blur ═════ */
  D.blur = {
    controls: [
      R("x", "X Blur Size", 0, 16, 0.1, 5), CHK("lock", "Lock X/Y", true), R("y", "Y Blur Size", 0, 16, 0.1, 5),
      R("blend", "Blend", 0, 1, 0.01, 1)
    ],
    init(stage, S) {
      const fd = filterDef(stage, (f) => f.appendChild(svgEl("feGaussianBlur", { stdDeviation: "5 5" })));
      stage.appendChild(img(S.src));
      const b = img(S.src); stage.appendChild(b);
      return { b, g: fd.f.firstChild, id: fd.id };
    },
    update(v, before, st, ctl) {
      if (v.lock && v.y !== v.x) { ctl.set("y", v.x); v.y = v.x; }
      ctl.disable("y", v.lock);
      st.g.setAttribute("stdDeviation", v.x + " " + v.y);
      st.b.style.filter = "url(#" + st.id + ")";
      st.b.style.opacity = v.blend;
      st.b.hidden = before;
    }
  };

  /* ═════ 9. Merge ═════ */
  D.merge = {
    controls: [
      R("cx", "Center X", 0, 1, 0.01, 0.76), R("cy", "Center Y", 0, 1, 0.01, 0.3), R("size", "Size", 0.2, 2, 0.01, 0.8),
      R("angle", "Angle", -180, 180, 1, -12, "°"),
      SEL("mode", "Apply Mode", [["normal", "Normal"], ["screen", "Screen"], ["multiply", "Multiply"], ["overlay", "Overlay"], ["difference", "Difference"]], "normal"),
      R("blend", "Blend", 0, 1, 0.01, 1)
    ],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const fg = el("img", { src: S.logoSrc, class: "fz-fg", alt: "", draggable: "false" }); stage.appendChild(fg);
      return { fg };
    },
    update(v, before, st) {
      const s = st.fg.style;
      s.left = v.cx * 100 + "%"; s.top = v.cy * 100 + "%";
      s.transform = "translate(-50%,-50%) rotate(" + v.angle + "deg) scale(" + v.size + ")";
      s.mixBlendMode = v.mode; s.opacity = v.blend;
      st.fg.hidden = before;
    }
  };

  /* ═════ 10. MultiMerge ═════ */
  D.multimerge = {
    controls: [
      CHK("l1", "Layer 1 · Лого", true), CHK("l2", "Layer 2 · Гарчиг", true), CHK("l3", "Layer 3 · Гэрлийн туяа (Screen)", true),
      SEL("order", "Дараалал (доороос дээш)", [["123", "1 → 2 → 3 · туяа хамгийн дээр"], ["321", "3 → 2 → 1 · лого хамгийн дээр"]], "123")
    ],
    init(stage, S) {
      stage.appendChild(img(S.src));
      const a = el("img", { src: S.logoSrc, class: "fz-fg", alt: "", draggable: "false", style: "left:80%;top:26%;transform:translate(-50%,-50%) scale(.72)" });
      const b = el("div", { class: "ly fz-title" }, [el("span", { text: "ЭЭЖИЙН ДУУ", style: "font-size:7cqw;letter-spacing:.08em" })]);
      const c = layer("fz-leak");
      [a, b, c].forEach((n) => stage.appendChild(n));
      return { L: [a, b, c] };
    },
    update(v, before, st) {
      const on = [v.l1, v.l2, v.l3];
      st.L.forEach((n, i) => { n.hidden = before || !on[i]; n.style.zIndex = v.order === "123" ? 2 + i : 4 - i; });
    }
  };

  /* ═════ 11. Channel Booleans ═════ */
  const MAT = {
    none: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0",
    swap: "0 0 1 0 0  0 1 0 0 0  1 0 0 0 0  0 0 0 1 0",
    green: "0 1 0 0 0  0 1 0 0 0  0 1 0 0 0  0 0 0 1 0",
    luma: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.2 2.3 .45 0 -.08"
  };
  D.channels = {
    controls: [
      SEL("op", "Operation", [["luma", "Гэрэлтэлт → To Alpha"], ["swap", "Red ↔ Blue"], ["green", "Green → R, G, B"], ["none", "Copy (хэвээр)"]], "luma")
    ],
    checker: true,
    init(stage, S) {
      const fd = filterDef(stage, (f) => f.appendChild(svgEl("feColorMatrix", { type: "matrix", values: MAT.none })));
      const i = img(S.src); stage.appendChild(i);
      return { i, m: fd.f.firstChild, id: fd.id };
    },
    update(v, before, st) {
      st.m.setAttribute("values", MAT[v.op]);
      st.i.style.filter = before ? "none" : "url(#" + st.id + ")";
    }
  };

  /* ═════ 12. Matte Control ═════ */
  D.matte = {
    controls: [
      SEL("view", "Viewer", [["matte", "Matte — Alpha суваг"], ["comp", "Composite — өнгөөр"]], "matte"),
      R("blur", "Matte Blur", 0, 24, 0.5, 6), R("ce", "Matte Contract / Expand", -40, 40, 1, 0), CHK("inv", "Invert Matte", false)
    ],
    checker: true,
    init(stage, S) {
      const m = img(""); stage.appendChild(m);
      const c = img(S.src); stage.appendChild(c);
      return { m, c };
    },
    update(v, before, st) {
      const url = G.maskURL((x) => x.arc(P.x, P.y, Math.max(4, P.r + (before ? 0 : v.ce)), 0, Math.PI * 2), before ? 0 : v.blur, !before && v.inv);
      st.m.src = url; G.setMask(st.c, url);
      st.m.hidden = v.view !== "matte"; st.c.hidden = v.view !== "comp";
    }
  };

  /* ═════ 13. Transform ═════ */
  D.transform = {
    controls: [
      R("cx", "Center X", 0, 1, 0.01, 0.5), R("cy", "Center Y", 0, 1, 0.01, 0.5), R("size", "Size", 0.3, 2, 0.01, 1.15),
      R("angle", "Angle", -180, 180, 1, 8, "°"), CHK("fh", "Flip Horizontally", false), CHK("fv", "Flip Vertically", false)
    ],
    checker: true,
    init(stage, S) { const i = img(S.src); stage.appendChild(i); return { i }; },
    update(v, before, st) {
      st.i.style.transform = before ? "none" :
        "translate(" + (v.cx - 0.5) * 100 + "%," + (v.cy - 0.5) * 100 + "%) rotate(" + v.angle + "deg) scale(" + v.size * (v.fh ? -1 : 1) + "," + v.size * (v.fv ? -1 : 1) + ")";
    }
  };

  /* ═════ 14–18. Маскууд ═════ */
  const EFF = { blur: "blur(4px) brightness(1.05)", gray: "grayscale(1) contrast(1.1)", dark: "brightness(.3)" };
  const effCtl = SEL("eff", "Маск залгасан нод", [["gray", "Хар цагаан"], ["blur", "Blur"], ["dark", "Бараан (виньетт)"]], "gray");
  const softCtl = R("soft", "Soft Edge", 0, 30, 0.5, 6);
  const invCtl = CHK("inv", "Invert", false);
  const POLY_A = [[258, 150], [330, 92], [462, 70], [598, 118], [634, 196], [600, 270], [470, 318], [322, 290], [262, 226]];
  const POLY_B = [[0, 20], [70, 20], [300, 300], [300, 340], [210, 340], [0, 110]];

  function ellipsePts(cx, cy, rx, ry) { const a = []; for (let i = 0; i < 64; i++) { const t = i / 64 * Math.PI * 2; a.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]); } return a; }
  function roundRectPts(cx, cy, w, h, r) {
    r = Math.min(r, w / 2, h / 2); const a = [], x0 = cx - w / 2, y0 = cy - h / 2, x1 = cx + w / 2, y1 = cy + h / 2;
    [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]].forEach(([x, y, s]) => {
      for (let i = 0; i <= 8; i++) { const t = (s + i * 90 / 8) * Math.PI / 180; a.push([x + Math.cos(t) * r, y + Math.sin(t) * r]); }
    });
    return a;
  }
  function bsplinePts(pts) {
    const out = [], n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    for (let i = 0; i < n; i++) {
      const p0 = mid(pts[i], pts[(i + 1) % n]), c = pts[(i + 1) % n], p1 = mid(c, pts[(i + 2) % n]);
      for (let k = 0; k < 10; k++) { const t = k / 10; out.push([(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]]); }
    }
    return out;
  }
  const trace = (x, shapes) => shapes.forEach((pts) => { pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); });
  const dPath = (shapes) => shapes.map((pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z").join("");

  function maskDemo(extra, shapesOf, handlesOf) {
    return {
      controls: [effCtl].concat(extra, [softCtl, invCtl]),
      init(stage, S) {
        stage.appendChild(img(S.src));
        const e = img(S.src); stage.appendChild(e);
        const o = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", class: "ly fz-outline", "aria-hidden": "true" });
        const path = svgEl("path", { d: "", fill: "none" }); o.appendChild(path);
        const cmp = svgEl("path", { d: "", fill: "none", class: "cmp" }); o.appendChild(cmp);
        const g = svgEl("g", {}); o.appendChild(g);
        stage.appendChild(o);
        return { e, o, path, cmp, g };
      },
      update(v, before, st) {
        const shapes = shapesOf(v);
        G.setMask(st.e, G.maskURL((x) => trace(x, shapes), v.soft, v.inv));
        st.e.style.filter = EFF[v.eff];
        st.path.setAttribute("d", dPath(shapes));
        st.cmp.setAttribute("d", v.cmpPoly ? dPath([POLY_A]) : "");
        st.g.innerHTML = "";
        (handlesOf ? handlesOf(v) : []).forEach(([x, y]) => st.g.appendChild(svgEl("rect", { x: x - 4, y: y - 4, width: 8, height: 8 })));
        st.e.hidden = before; st.o.style.display = before ? "none" : "";
      }
    };
  }
  D["mask-rect"] = maskDemo(
    [R("cx", "Center X", 0.2, 0.85, 0.01, 0.66), R("w", "Width", 0.1, 1, 0.01, 0.42), R("h", "Height", 0.1, 1, 0.01, 0.62), R("r", "Corner Radius", 0, 1, 0.01, 0.2)],
    (v) => [roundRectPts(v.cx * W, H * 0.55, v.w * W, v.h * H, v.r * Math.min(v.w * W, v.h * H) / 2)],
    (v) => { const x0 = v.cx * W - v.w * W / 2, x1 = v.cx * W + v.w * W / 2, y0 = H * 0.55 - v.h * H / 2, y1 = H * 0.55 + v.h * H / 2; return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; });
  D["mask-ellipse"] = maskDemo(
    [R("cx", "Center X", 0.2, 0.85, 0.01, 0.66), R("w", "Width", 0.1, 1.2, 0.01, 0.42), R("h", "Height", 0.1, 1.2, 0.01, 0.68)],
    (v) => [ellipsePts(v.cx * W, H * 0.54, v.w * W / 2, v.h * H / 2)],
    (v) => [[v.cx * W, H * 0.54 - v.h * H / 2], [v.cx * W + v.w * W / 2, H * 0.54], [v.cx * W, H * 0.54 + v.h * H / 2], [v.cx * W - v.w * W / 2, H * 0.54]]);
  D["mask-polygon"] = maskDemo([], () => [POLY_A], () => POLY_A);
  D["mask-bspline"] = maskDemo([CHK("cmpPoly", "Polygon-той харьцуулах", false)], () => [bsplinePts(POLY_A)], () => POLY_A);
  D["mask-multipoly"] = maskDemo([CHK("a", "Layer 1 · гариг", true), CHK("b", "Layer 2 · цонхны төмөр", true)],
    (v) => [v.a ? POLY_A : null, v.b ? POLY_B : null].filter(Boolean),
    (v) => (v.a ? POLY_A : []).concat(v.b ? POLY_B : []));

  /* ═════ 19–21. Бөөмс ═════ */
  function particleDemo(mode) {
    const common = mode === "force"
      ? [R("num", "Number", 1, 12, 1, 5), R("str", "Strength", 0, 0.25, 0.005, 0.07), R("dir", "Direction", 0, 360, 1, 20, "°")]
      : mode === "render"
      ? [CHK("mblur", "Motion Blur", true), CHK("pre", "Pre-Generate Frames", true), BTN("restart", "Кадр 0-ээс эхлүүлэх")]
      : [R("num", "Number", 1, 30, 1, 10), R("life", "Lifespan", 15, 200, 1, 90), R("vel", "Velocity", 0.5, 8, 0.1, 3.2),
         R("ang", "Angle", -180, 0, 1, -62, "°"), R("vari", "Angle Variance", 0, 90, 1, 16, "°"), R("size", "Size", 0.5, 4, 0.1, 1.6)];
    return {
      controls: common.concat(G.reduced ? [BTN("play", "▶ Тоглуулах / зогсоох")] : []),
      init(stage, S) {
        stage.appendChild(img(S.src));
        const c = G.canvas(); c.className = "ly"; c.style.mixBlendMode = "screen"; stage.appendChild(c);
        let arrow = null;
        if (mode === "force") { arrow = el("div", { class: "fz-arrow", "aria-hidden": "true" }, [el("i")]); stage.appendChild(arrow); }
        const st = { c, arrow, ps: [], rnd: G.prng(11), visible: false, raf: 0, v: null, before: false, playing: !G.reduced, frame: 0 };
        const loop = () => {
          st.raf = 0;
          if (!st.visible || st.before || !st.playing || !st.v) return;
          step(st); render(st); st.raf = requestAnimationFrame(loop);
        };
        st.kick = () => { if (!st.raf) st.raf = requestAnimationFrame(loop); };
        G.whenVisible(stage, (on) => { st.visible = on; if (on) st.kick(); });
        return st;
      },
      update(v, before, st, ctl, act) {
        const first = !st.v;
        st.v = v; st.before = before; st.c.hidden = before;
        if (st.arrow) { st.arrow.hidden = before; st.arrow.style.transform = "rotate(" + v.dir + "deg)"; st.arrow.firstChild.style.width = 18 + v.str * 260 + "px"; }
        if (act === "play") st.playing = !st.playing;
        if (first || act === "restart") restart(st);
        render(st); st.kick();
      }
    };
    function cfg(v) {
      if (mode === "force") return { num: v.num, life: 400, vel: 0.9, ang: 90, vari: 18, size: 1.8, snow: true, ax: Math.cos(v.dir * Math.PI / 180) * v.str, ay: Math.sin(v.dir * Math.PI / 180) * v.str };
      if (mode === "render") return { num: 9, life: 110, vel: 3, ang: -60, vari: 22, size: 1.6, ax: 0, ay: 0.035 };
      return { num: v.num, life: v.life, vel: v.vel, ang: v.ang, vari: v.vari, size: v.size, ax: 0, ay: 0 };
    }
    function restart(st) {
      st.ps = []; st.frame = 0;
      const pre = mode === "render" ? st.v.pre : true;
      if (pre) for (let i = 0; i < 150; i++) step(st);
    }
    function step(st) {
      const c = cfg(st.v), rnd = st.rnd;
      for (let i = 0; i < c.num; i++) {
        const a = (c.ang + (rnd() * 2 - 1) * c.vari) * Math.PI / 180, sp = c.vel * (0.6 + rnd() * 0.8);
        const x = c.snow ? rnd() * (W + 200) - 100 : 150 + (rnd() - 0.5) * 14, y = c.snow ? -8 : 322 + (rnd() - 0.5) * 8;
        st.ps.push({ x, y, px: x, py: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: c.life * (0.7 + rnd() * 0.6), s: c.size * (0.6 + rnd() * 0.8) });
      }
      st.ps = st.ps.filter((p) => {
        p.px = p.x; p.py = p.y; p.vx += c.ax; p.vy += c.ay; p.x += p.vx; p.y += p.vy; p.age++;
        return p.age < p.life && p.x > -140 && p.x < W + 140 && p.y > -40 && p.y < H + 40;
      });
      if (st.ps.length > 2600) st.ps.splice(0, st.ps.length - 2600);
      st.frame++;
    }
    function render(st) {
      const ctx = st.c.getContext("2d"), snow = mode === "force", blur = mode === "render" && st.v.mblur;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const p of st.ps) {
        const k = 1 - p.age / p.life;
        if (snow) ctx.fillStyle = "rgba(235,242,255," + (0.35 + 0.5 * k).toFixed(2) + ")";
        else ctx.fillStyle = ctx.strokeStyle = "rgba(255," + (150 + 90 * k | 0) + "," + (60 + 120 * k * k | 0) + "," + (0.25 + 0.7 * k).toFixed(2) + ")";
        if (blur) { ctx.lineWidth = p.s; ctx.beginPath(); ctx.moveTo(p.x - p.vx * 3.5, p.y - p.vy * 3.5); ctx.lineTo(p.x, p.y); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }
  D["p-emitter"] = particleDemo("emitter");
  D["p-force"] = particleDemo("force");
  D["p-render"] = particleDemo("render");

  /* ═════ 22–28. 3D ═════ */
  const view3d = (stage, cls) => {
    const v = el("div", { class: "ly fz-3d " + (cls || "") });
    v.appendChild(el("div", { class: "fz-floor" }));
    const world = el("div", { class: "fz-world" }); v.appendChild(world);
    stage.appendChild(v);
    return { v, world };
  };
  const FACES = [["front", 0.95], ["right", 0.66], ["back", 0.4], ["left", 0.5], ["top", 1.12], ["bottom", 0.3]];
  function cube(cls, src) {
    const c = el("div", { class: "fz-cube " + (cls || "") });
    FACES.forEach(([n, l]) => c.appendChild(el("i", { class: "f " + n, "data-l": l, style: (src ? "background-image:url(" + src + ");" : "") + "--l:" + l })));
    return c;
  }

  D.plane3d = {
    controls: [R("ry", "Rotation Y", -70, 70, 1, 30, "°"), R("rx", "Rotation X", -45, 45, 1, -6, "°"), R("tz", "Translation Z", -400, 200, 1, -60)],
    init(stage, S) {
      const s = view3d(stage);
      const p = el("img", { src: S.src, class: "fz-plane", alt: "", draggable: "false" }); s.world.appendChild(p);
      return { p };
    },
    update(v, before, st) {
      st.p.style.transform = before ? "translate(-50%,-50%)" : "translate(-50%,-50%) translateZ(" + v.tz + "px) rotateY(" + v.ry + "deg) rotateX(" + v.rx + "deg)";
    }
  };

  D.shape3d = {
    controls: [
      SEL("shape", "Shape", [["cube", "Cube"], ["sphere", "Sphere"]], "cube"),
      R("ry", "Rotation Y", -180, 180, 1, 35, "°"), R("rx", "Rotation X", -60, 60, 1, -18, "°"),
      SEL("mat", "Material", [["gray", "Саарал материал"], ["tex", "Бичлэг — бүтэц болгож наах"]], "gray")
    ],
    init(stage, S) {
      const s = view3d(stage);
      const c1 = cube("", null), c2 = cube("tex", S.src);
      const sp = el("div", { class: "fz-sphere" });
      [c1, c2, sp].forEach((n) => s.world.appendChild(n));
      sp.style.setProperty("--src", "url(" + S.src + ")");
      return { c1, c2, sp, world: s.world };
    },
    update(v, before, st) {
      const tex = v.mat === "tex", rot = "translate(-50%,-50%) rotateX(" + v.rx + "deg) rotateY(" + v.ry + "deg)";
      st.c1.hidden = before || v.shape !== "cube" || tex; st.c2.hidden = before || v.shape !== "cube" || !tex;
      st.sp.hidden = before || v.shape !== "sphere";
      st.c1.style.transform = st.c2.style.transform = rot;
      st.sp.classList.toggle("tex", tex);
      st.sp.style.backgroundPosition = "0 0, " + (v.ry / 360 * 100).toFixed(1) + "% 50%";
    }
  };

  D.text3d = {
    controls: [R("depth", "Extrusion Depth", 0, 24, 1, 12), R("ry", "Rotation Y", -45, 45, 1, -18, "°"), R("rx", "Rotation X", -30, 30, 1, 10, "°"),
      SEL("col", "Material", [["gold", "Алтан"], ["silver", "Мөнгөлөг"]], "gold")],
    init(stage, S) {
      stage.appendChild(img(S.src, "", "filter:brightness(.55)"));
      const wrap = el("div", { class: "ly fz-3d plain" });
      const t = el("div", { class: "fz-t3d", text: "ЭЭЖИЙН ДУУ" }); wrap.appendChild(t); stage.appendChild(wrap);
      return { t };
    },
    update(v, before, st) {
      const gold = v.col === "gold", face = gold ? "#f3c768" : "#e4e8ee", side = gold ? [150, 98, 30] : [110, 118, 130];
      const d = before ? 0 : v.depth, sh = [];
      for (let i = 1; i <= d; i++) { const k = 1 - i / (d + 6); sh.push((i * 0.09).toFixed(2) + "cqw " + (i * 0.09).toFixed(2) + "cqw 0 rgb(" + side.map((c) => (c * k) | 0).join(",") + ")"); }
      sh.push("0 0 2cqw rgba(0,0,0,.6)");
      st.t.style.color = face; st.t.style.textShadow = sh.join(",");
      st.t.style.transform = before ? "translate(-50%,-50%)" : "translate(-50%,-50%) rotateY(" + v.ry + "deg) rotateX(" + v.rx + "deg)";
    }
  };

  D.merge3d = {
    controls: [CHK("a", "Image Plane 3D", true), CHK("b", "Shape 3D", true), CHK("c", "Text 3D", true), R("ry", "Merge 3D · Rotation Y", -60, 60, 1, -22, "°")],
    init(stage, S) {
      const s = view3d(stage);
      const grp = el("div", { class: "fz-grp" }); s.world.appendChild(grp);
      const a = el("img", { src: S.src, class: "fz-plane back", alt: "", draggable: "false" });
      const b = cube("small", null);
      const c = el("div", { class: "fz-t3d small", text: "ЭЭЖ" });
      [a, b, c].forEach((n) => grp.appendChild(n));
      return { grp, a, b, c };
    },
    update(v, before, st) {
      st.a.hidden = !v.a; st.b.hidden = !v.b; st.c.hidden = !v.c;
      st.grp.style.transform = "rotateY(" + (before ? 0 : v.ry) + "deg)";
      st.c.style.textShadow = Array.from({ length: 8 }, (_, i) => ((i + 1) * 0.08).toFixed(2) + "cqw " + ((i + 1) * 0.08).toFixed(2) + "cqw 0 #8a5a1c").join(",");
    }
  };

  const LAYERS = [["bgSrc", -900], ["planetSrc", -320], ["strutSrc", 0]];
  D.camera3d = {
    controls: [R("aov", "Angle of View", 20, 100, 1, 55, "°"), R("cx", "Translation X (камер)", -140, 140, 1, 60), R("cz", "Translation Z (dolly)", -160, 160, 1, 0)],
    init(stage, S) {
      const box = el("div", { class: "ly fz-cam" }), world = el("div", { class: "fz-world" });
      const L = LAYERS.map(([k, z]) => { const i = el("img", { src: S[k], class: "fz-lay", alt: "", draggable: "false" }); i.dataset.z = z; world.appendChild(i); return i; });
      box.appendChild(world); stage.appendChild(box);
      return { box, world, L, stage };
    },
    update(v, before, st) {
      const w = st.stage.clientWidth || 640;
      const p = (w / 2) / Math.tan((before ? 55 : v.aov) * Math.PI / 360), p0 = (w / 2) / Math.tan(55 * Math.PI / 360);
      st.box.style.perspective = p.toFixed(0) + "px";
      st.L.forEach((i) => { const z = +i.dataset.z * w / 640; i.style.transform = "translateZ(" + z + "px) scale(" + ((p0 - z) / p0 * 1.16).toFixed(3) + ")"; });
      st.world.style.transform = before ? "none" : "translate3d(" + (-v.cx * w / 640) + "px,0," + (v.cz * w / 640) + "px)";
    }
  };

  D.spot = {
    controls: [CHK("light", "Renderer 3D · Lighting", true), R("int", "Intensity", 0, 1.6, 0.01, 1.15), R("cone", "Cone Angle", 10, 60, 1, 26, "°"),
      R("pen", "Penumbra Angle", 0, 40, 1, 14, "°"), R("x", "Байрлал X", 0.1, 0.9, 0.01, 0.66),
      SEL("col", "Color", [["#ffffff", "Цагаан"], ["#ffb35c", "Дулаан"], ["#6ab4ff", "Хүйтэн"]], "#ffb35c")],
    init(stage, S) {
      const base = img(S.src); stage.appendChild(base);
      const lit = img(S.src); stage.appendChild(lit);
      const tint = layer("", "mix-blend-mode:overlay"); stage.appendChild(tint);
      const cone = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", class: "ly fz-outline" });
      const cp = svgEl("path", { d: "", fill: "none", "stroke-dasharray": "5 5" }); cone.appendChild(cp); stage.appendChild(cone);
      return { base, lit, tint, cone, cp };
    },
    update(v, before, st) {
      const on = v.light && !before;
      st.base.style.filter = on ? "brightness(.26)" : "none";
      st.lit.hidden = st.tint.hidden = !on; st.cone.style.display = on ? "" : "none";
      const cx = v.x * 100, rx = v.cone * 0.9, ry = v.cone * 1.35, inner = Math.max(0, 100 - v.pen * 2.4);
      const m = "radial-gradient(ellipse " + rx + "% " + ry + "% at " + cx + "% 56%, #000 " + (inner * 0.6).toFixed(0) + "%, transparent 100%)";
      [st.lit, st.tint].forEach((n) => { n.style.webkitMaskImage = n.style.maskImage = m; });
      st.lit.style.filter = "brightness(" + v.int + ")";
      st.tint.style.background = v.col; st.tint.style.opacity = v.col === "#ffffff" ? 0 : 0.55;
      const X = v.x * W, Y = 0.56 * H, dx = rx / 100 * W;
      st.cp.setAttribute("d", "M" + X + " -6L" + (X - dx) + " " + Y + "M" + X + " -6L" + (X + dx) + " " + Y);
    }
  };

  D.renderer = {
    controls: [CHK("light", "Lighting", true), CHK("shadow", "Shadows", true), SEL("out", "Viewer · суваг", [["rgb", "RGB (өнгө)"], ["z", "Z (гүн)"]], "rgb")],
    init(stage, S) {
      const s = view3d(stage, "scene");
      const back = el("img", { src: S.src, class: "fz-plane back2", alt: "", draggable: "false" });
      const sh = el("div", { class: "fz-shadow" });
      const cb = cube("mid", null);
      [back, sh, cb].forEach((n) => s.world.appendChild(n));
      return { v: s.v, sh, cb };
    },
    update(v, before, st) {
      const light = v.light && !before;
      st.v.classList.toggle("flat", !light);
      st.v.classList.toggle("zpass", v.out === "z" && !before);
      st.sh.hidden = !(v.shadow && light) || v.out === "z";
    }
  };
})(window.RM);
