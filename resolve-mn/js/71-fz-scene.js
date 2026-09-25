/* ═════════════════════════════════════════════════════════════
   71 · Fusion заавар — жишээний кадр ба туслах функцууд

   Жишээнд хэрэглэгчийн бичлэгтэй төстэй сансрын кадрыг (цагирагтай гариг,
   од, мананцар, цонхны төмөр) кодоор зурна. Давхарга тус бүрийг тусад нь
   хадгалдаг — 3D камерын жишээнд parallax хийхэд.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const G = (RM.fz = RM.fz || {});
  const W = 640, H = 360;
  G.W = W; G.H = H;

  /* тогтмол санамсаргүй тоо — хуудас бүрд ижил кадр гарна */
  function prng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  G.prng = prng;

  const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w || W; c.height = h || H; return c; };
  G.canvas = canvas;

  /* гаригийн байрлал — маск, гэрлийн жишээнд ч хэрэглэнэ */
  const P = { x: 420, y: 196, r: 104, tilt: -0.28 };
  G.planet = P;

  function drawBackground(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#03050b"); g.addColorStop(1, "#0b1424");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    [[160, 90, 230, "rgba(96,70,170,.22)"], [520, 300, 260, "rgba(40,96,170,.20)"], [300, 260, 180, "rgba(170,80,120,.10)"]]
      .forEach(([x, y, r, c]) => {
        const n = ctx.createRadialGradient(x, y, 0, x, y, r);
        n.addColorStop(0, c); n.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = n; ctx.fillRect(0, 0, W, H);
      });
    const rnd = prng(7);
    for (let i = 0; i < 460; i++) {
      const x = rnd() * W, y = rnd() * H, r = 0.3 + rnd() * rnd() * 1.4, a = 0.35 + rnd() * 0.65;
      ctx.fillStyle = "rgba(235,240,255," + a.toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 9; i++) {
      const x = rnd() * W, y = rnd() * H, r = 5 + rnd() * 6;
      const s = ctx.createRadialGradient(x, y, 0, x, y, r);
      s.addColorStop(0, "rgba(255,255,255,.95)"); s.addColorStop(0.15, "rgba(200,220,255,.45)"); s.addColorStop(1, "rgba(200,220,255,0)");
      ctx.fillStyle = s; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }

  function ring(ctx, front) {
    ctx.save();
    ctx.translate(P.x, P.y); ctx.rotate(P.tilt);
    if (front) { ctx.beginPath(); ctx.rect(-400, 0, 800, 300); ctx.clip(); }
    for (let i = 0; i < 16; i++) {
      const k = 1.34 + i * 0.045, a = [0.5, 0.35, 0.6, 0.2, 0.55, 0.45, 0.15, 0.5][i % 8];
      ctx.strokeStyle = "rgba(" + (215 - i * 3) + "," + (196 - i * 4) + "," + (158 - i * 5) + "," + a + ")";
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.ellipse(0, 0, P.r * k, P.r * k * 0.23, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlanet(ctx) {
    ring(ctx, false);
    ctx.save();
    ctx.beginPath(); ctx.arc(P.x, P.y, P.r, 0, Math.PI * 2); ctx.clip();
    ctx.translate(P.x, P.y); ctx.rotate(P.tilt);
    const cols = ["#e3cfa3", "#cdb27f", "#b8955f", "#d8c08e", "#a98452", "#c7a877", "#e1ca98", "#9d7a4c"];
    const rnd = prng(3);
    for (let y = -P.r - 20; y < P.r + 20; y += 7 + rnd() * 9) {
      ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
      ctx.fillRect(-P.r - 30, y, P.r * 2 + 60, 18);
    }
    ctx.restore();
    ctx.save();
    const sh = ctx.createRadialGradient(P.x + P.r * 0.35, P.y - P.r * 0.4, P.r * 0.1, P.x, P.y, P.r * 1.05);
    sh.addColorStop(0, "rgba(255,245,220,.15)"); sh.addColorStop(0.55, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.88)");
    ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(P.x, P.y, P.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,230,190,.25)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    ring(ctx, true);
  }

  function drawStrut(ctx) {
    ctx.save();
    ctx.translate(-30, 40); ctx.rotate(0.62);
    const g = ctx.createLinearGradient(0, -40, 0, 40);
    g.addColorStop(0, "#2d323a"); g.addColorStop(0.5, "#1b1e24"); g.addColorStop(1, "#111317");
    ctx.fillStyle = g; ctx.fillRect(-60, -38, 520, 76);
    ctx.fillStyle = "rgba(170,200,230,.35)"; ctx.fillRect(-60, -38, 520, 2);
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(-60, 34, 520, 4);
    ctx.fillStyle = "#3a4048";
    for (let x = 0; x < 460; x += 46) { ctx.beginPath(); ctx.arc(x, -22, 2.6, 0, Math.PI * 2); ctx.arc(x, 22, 2.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    /* цонхны доод хүрээ */
    const f = ctx.createLinearGradient(0, H - 26, 0, H);
    f.addColorStop(0, "#23272e"); f.addColorStop(1, "#0d0f12");
    ctx.fillStyle = f; ctx.fillRect(0, H - 22, W, 22);
    ctx.fillStyle = "rgba(170,200,230,.25)"; ctx.fillRect(0, H - 22, W, 1.5);
  }

  /* Paint-ийн жишээнд: зураас ба тоос */
  const SCRATCH = [[292, -6], [298, 60], [286, 130], [296, 205], [284, 270], [290, 366]];
  G.scratch = SCRATCH;
  function drawDamage(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(240,244,250,.92)"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); SCRATCH.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.fillStyle = "rgba(235,238,245,.9)";
    [[260, 90, 4], [318, 170, 3], [275, 238, 5], [305, 300, 3]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }

  /* Merge-ийн жишээнд: тунгалаг дэвсгэртэй лого */
  function drawLogo() {
    const c = canvas(220, 220), ctx = c.getContext("2d");
    ctx.fillStyle = "rgba(245,168,60,.96)";
    ctx.beginPath(); ctx.arc(110, 110, 92, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1a1206"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(110, 110, 74, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#1a1206"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "700 58px Oswald, 'Arial Narrow', sans-serif"; ctx.fillText("1ST", 110, 100);
    ctx.font = "600 20px Inter, Arial, sans-serif"; ctx.fillText("STUDIO", 110, 146);
    return c.toDataURL("image/png");
  }

  G.build = function () {
    if (G.scene) return G.scene;
    const bg = canvas(), planet = canvas(), strut = canvas(), full = canvas(), dirty = canvas();
    drawBackground(bg.getContext("2d"));
    drawPlanet(planet.getContext("2d"));
    drawStrut(strut.getContext("2d"));
    const f = full.getContext("2d");
    f.drawImage(bg, 0, 0); f.drawImage(planet, 0, 0); f.drawImage(strut, 0, 0);
    const d = dirty.getContext("2d");
    d.drawImage(full, 0, 0); drawDamage(d);
    const url = (c) => c.toDataURL("image/jpeg", 0.9);
    G.scene = {
      full, dirty,
      src: url(full), dirtySrc: url(dirty),
      bgSrc: url(bg), planetSrc: planet.toDataURL("image/png"), strutSrc: strut.toDataURL("image/png"),
      logoSrc: drawLogo()
    };
    return G.scene;
  };

  /* ── жижиг туслахууд ── */
  G.el = function (tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "style") n.style.cssText = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    (kids || []).forEach((k) => k != null && n.appendChild(typeof k === "string" ? document.createTextNode(k) : k));
    return n;
  };

  G.fmt = function (s) {
    const esc = String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return esc.replace(/\[k:([^\]]+)\]/g, "<kbd>$1</kbd>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  };

  G.reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* Зөөлөн ирмэгтэй маск (Alpha) зурах — shadowBlur-ийн аргаар, бүх хөтөчид ажиллана */
  G.maskURL = function (drawShape, soft, invert) {
    const c = canvas(W / 2, H / 2), ctx = c.getContext("2d");
    ctx.save(); ctx.scale(0.5, 0.5);
    ctx.fillStyle = "#fff";
    if (soft > 0.3) {
      /* shadowOffset, shadowBlur нь canvas-ийн пикселээр (scale-д үл хамаарна) — хагас хэмжээтэй тул */
      ctx.shadowColor = "#fff"; ctx.shadowBlur = soft; ctx.shadowOffsetX = W * 1.5;
      ctx.translate(-W * 3, 0);
    }
    ctx.beginPath(); drawShape(ctx); ctx.fill();
    ctx.restore();
    if (invert) {
      const c2 = canvas(W / 2, H / 2), x = c2.getContext("2d");
      x.fillStyle = "#fff"; x.fillRect(0, 0, W / 2, H / 2);
      x.globalCompositeOperation = "destination-out"; x.drawImage(c, 0, 0);
      return c2.toDataURL("image/png");
    }
    return c.toDataURL("image/png");
  };

  G.setMask = function (node, url) {
    node.style.webkitMaskImage = node.style.maskImage = "url(" + url + ")";
    node.style.webkitMaskSize = node.style.maskSize = "100% 100%";
    node.style.webkitMaskRepeat = node.style.maskRepeat = "no-repeat";
  };

  /* Харагдах үед л хөдөлгөөн тоглуулах */
  G.whenVisible = function (node, onChange) {
    if (!("IntersectionObserver" in window)) { onChange(true); return; }
    new IntersectionObserver((es) => es.forEach((e) => onChange(e.isIntersecting)), { rootMargin: "80px" }).observe(node);
  };
})(window.RM);
