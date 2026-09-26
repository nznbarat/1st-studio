/* ═════════════════════════════════════════════════════════════
   54 · Color хуудасны палитрын самбарууд
   Палитрын мөрийн дүрс бүрийг товшиход доорх самбар солигдоно (data-tab="cp:…").
   Талбар, анхдагч утга бүрийг хэрэглэгчийн Resolve Studio 21-ийн
   2026-09-26-ны дэлгэцийн зургаас уншив. Primaries (Color Wheels) ба
   Tracker самбар 51-sim-more.js-д.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";
  const S = RM.sim;

  /* ── жижиг туслахууд ── */
  const cls = (c) => (c ? " " + c : "");
  const I = (id, g, c) => `<span class="hs${cls(c)}" data-t="${id}">${g}</span>`;
  const V = (id, lb, v, c) => `<span class="f hs${cls(c)}" data-t="${id}"><span class="l">${lb}</span><b class="v">${v}</b></span>`;
  const DD = (id, lb, v, c) => `<span class="f hs${cls(c)}" data-t="${id}">${lb ? `<span class="l">${lb}</span>` : ""}<b class="v dd">${v}</b></span>`;
  const CB = (id, lb, on, c) => `<span class="f hs${cls(c)}" data-t="${id}"><span class="cb${on ? " on" : ""}"></span>${lb}</span>`;
  const SL = (id, lb, v, p, c) => `<div class="sl-row hs${cls(c)}" data-t="${id}"><span>${lb}</span><b>${v}</b><i style="--p:${p}%"></i></div>`;
  const GH = (id, name, right, c) => `<div class="gh hs${cls(c)}" data-t="${id}"><b>${name}</b><span class="r">${right || "⟲"}</span></div>`;
  const PANE = (key, title, right, body, foot) => `
          <div class="cp-pane" data-tabpane="cp:${key}" hidden>
          <div class="pane-h"><b>${title}</b><span class="sp"></span>${right}</div>
          <div class="pane-b cxw"><div class="cx">${body}</div>${foot ? `<div class="cx-foot">${foot}</div>` : ""}</div>
          </div>`;
  /* босоо багана: [өнгө, дүүргэлт %, утга] */
  const VB = (list) => `<div class="vbs">${list.map(([c, h]) => `<span class="vb" style="--c:${c};--h:${h}%"><i></i></span>`).join("")}</div>
              <div class="vvals">${list.map(([c, , v]) => `<b style="--c:${c}">${v}</b>`).join("")}</div>`;
  const R = "#e0484f", G = "#3fbf5a", B = "#4d5fe0", Y = "#d8d8d8";

  /* ── 1 · Camera Raw (H.264 клип сонгосон тул бүгд саарал) ── */
  const RAW = PANE("raw", "Camera Raw", I("raw-format-camera-raw", "ARRI", "dim") + I("camera-raw", "…"), `
            <div class="col dim">
              ${DD("decode-quality", "Decode Quality", "Full res.")}
              ${DD("decode-using", "Decode Using", "Camera metadata")}
              ${CB("decode-as-monochrome", "Decode as monochrome")}
              ${CB("decode-as-logc4", "Decode as LogC4")}
            </div>
            <div class="col dim">
              ${V("color-temp-camera-raw", "Color Temp", "2000")}
              ${V("tint-camera-raw", "Tint", "0.00")}
              ${V("exposure-camera-raw", "Exposure", "0")}
              ${V("sharpness-camera-raw", "Sharpness", "10.00")}
            </div>
            <div class="col"></div>`,
    `<span class="sp"></span>${I("use-changes-use-settings", "Use Changes", "btn dim")}${I("use-changes-use-settings", "Use Settings", "btn dim")}`);

  /* ── 2 · Color Match — Calibrite ColorChecker Classic-ийн 24 нүд ── */
  const CHART = ["#7a4a3a", "#c99080", "#4f6f96", "#4c5e2e", "#7f7cb0", "#5ecbb0",
    "#e0781e", "#3f55ae", "#cf4a55", "#5a2c6a", "#9fc03a", "#eea12a",
    "#25379a", "#3f9a3e", "#b8262d", "#f2cb10", "#c04a9a", "#0a86a8",
    "#f4f4f2", "#cacaca", "#a0a0a0", "#767676", "#4c4c4c", "#262626"];
  const MATCH = PANE("match", "Color Match",
    `<b class="hs hdd" data-t="color-chart-type">Calibrite ColorChecker Classic - Legacy ⌄</b>${I("reset", "⟲")}${I("color-match-palette", "…")}`, `
            <div class="col wide hs" data-t="color-chart-swatches"><div class="swg">${CHART.map((c) => `<i style="background:${c}"></i>`).join("")}</div></div>
            <div class="col">
              <div class="fs hs" data-t="source-gamma"><span>Source Gamma</span><b class="v dd">Auto</b></div>
              <div class="fs hs" data-t="target-gamma"><span>Target Gamma</span><b class="v dd">Auto</b></div>
              <div class="fs hs" data-t="target-color-space"><span>Target Color Space</span><b class="v dd">Auto</b></div>
              <div class="f2"><span class="f hs" data-t="color-temp-color-match"><span class="l">Color Temp</span><b class="v">6500</b> K</span>
                <span class="f hs dim" data-t="white-level-color-match"><span class="l">White Level</span><b class="v">0.9</b><span class="cb"></span></span></div>
              ${I("match-color-match", "Match", "btn")}
            </div>`);

  /* ── 3 · Primaries - Color Bars (Color Wheels-ийн өөр харагдац, 51-д шигтгэнэ) ── */
  const BARGRP = (id, name, vals, pick) => `
              <div class="bgrp hs" data-t="${id}">
                <div class="wh-top"><span class="hs" data-t="${pick ? "white-balance-picker" : "reset"}">${pick ? "⊹" : ""}</span><b>${name}</b><span class="hs" data-t="reset">⟲</span></div>
                ${VB(vals)}
                <div class="wsl hs" data-t="bars"></div>
              </div>`;
  S.clBars = () => `
            <div class="wheels bars-v" data-tabpane="pm:bars" hidden>
              ${BARGRP("lift", "Lift", [[Y, 50, "0.00"], [R, 50, "0.00"], [G, 50, "0.00"], [B, 50, "0.00"]], true)}
              ${BARGRP("gamma", "Gamma", [[Y, 50, "0.00"], [R, 50, "0.00"], [G, 50, "0.00"], [B, 50, "0.00"]])}
              ${BARGRP("gain", "Gain", [[Y, 72, "1.00"], [R, 72, "1.00"], [G, 72, "1.00"], [B, 72, "1.00"]], true)}
              ${BARGRP("offset", "Offset", [[R, 50, "25.00"], [G, 50, "25.00"], [B, 50, "25.00"]])}
            </div>`;

  /* ── 4 · High Dynamic Range - Color Wheels ── */
  const HZ = (name, zone) => `
              <div class="wheel hs" data-t="hdr-zones">
                <div class="wh-top"><span class="zn">${zone || ""}</span><b>${name}</b><span class="hs" data-t="reset">⟲</span></div>
                <div class="rng sm"></div>
                <div class="hz-v hs" data-t="exp-sat-hdr"><span>Exp</span><b>0.00</b><span>Sat</span><b>1.00</b></div>
                <div class="hz-v hs" data-t="x-y-hdr"><span>X</span><b>0.00</b><span>Y</span><b>0.00</b>${zone ? `<b class="q">${zone === "-1.50" ? "0.20" : "0.22"}</b>` : ""}</div>
              </div>`;
  const HDR = PANE("hdr", "High Dynamic Range - Color Wheels",
    I("hdr-palette", "⇥", "dim") + I("hdr-zones", "◉", "on") + I("hdr-palette", "∧∨") + I("reset", "⟲") + I("hdr-palette", "…"), `
            <div class="col full">
              <div class="hz-nav hs" data-t="zone-navigation-hdr">‹ <i></i><i class="on" style="--c:#b18cff"></i><i class="on" style="--c:#6f8ff0"></i><i class="on" style="--c:#e04fc7"></i><i></i><i></i> ›</div>
              <div class="wheels">${HZ("Dark", "-1.50")}${HZ("Shadow", "+1.00")}${HZ("Light", "-1.00")}${HZ("Global")}</div>
            </div>`,
    `${V("temperature", "Temp", "0.00")}${V("tint", "Tint", "0.00")}${V("hue", "Hue", "0.00")}${V("contrast", "Cont", "1.000")}
            ${V("pivot", "Pivot", "0.000")}${V("midtone-detail", "MD", "0.00")}${V("b-ofs-black-offset", "B/Ofs", "0.000")}`);

  /* ── 5 · RGB Mixer ── */
  const OUT = (name, vals) => `
              <div class="bgrp hs" data-t="red-green-blue-output">
                <div class="wh-top"><span>⫼</span><b>${name}</b><span class="hs" data-t="reset">⟲</span></div>
                ${VB(vals)}
              </div>`;
  const RGB = PANE("rgb", "RGB Mixer", I("reset", "⟲"), `
            <div class="col full"><div class="wheels">
              ${OUT("Red Output", [[R, 80, "1.00"], [G, 50, "0.00"], [B, 50, "0.00"]])}
              ${OUT("Green Output", [[R, 50, "0.00"], [G, 80, "1.00"], [B, 50, "0.00"]])}
              ${OUT("Blue Output", [[R, 50, "0.00"], [G, 50, "0.00"], [B, 80, "1.00"]])}
            </div></div>`,
    `${I("swap-channels-rgb-mixer", `<i style="--a:${R};--b:${G}"></i><i style="--a:${G};--b:${B}"></i><i style="--a:${B};--b:${R}"></i>`, "swaps")}
            <span class="sp"></span>${CB("monochrome-rgb-mixer", "Monochrome")}${CB("preserve-luminance", "Preserve Luminance", true)}`);

  /* ── 6 · Motion Effects ── */
  const MOTION = PANE("motion", "Motion Effects", I("reset", "⟲"), `
            <div class="col">
              ${GH("temporal-nr", "Temporal NR")}
              ${DD("frames-temporal-nr", "Frames", "0")}
              ${DD("motion-estimation-type", "Mo. Est. Ty…", "Faster", "dim")}
              ${DD("motion-range", "Motion Ra…", "Medium", "dim")}
              ${GH("temporal-threshold", "Temporal Threshold")}
              <div class="dim">${V("temporal-threshold", "Luma", "0.0")}${V("temporal-threshold", "Chroma", "0.0")}
              ${V("temporal-threshold", "Motion", "50.0")}${V("blend-noise-reduction", "Blend", "0.0")}</div>
            </div>
            <div class="col">
              ${GH("spatial-nr", "Spatial NR")}
              ${DD("mode-radius-spatial-nr", "Mode", "Faster")}
              ${DD("mode-radius-spatial-nr", "Radius", "Small")}
              ${GH("spatial-threshold", "Spatial Threshold")}
              ${V("spatial-threshold", "Luma", "0.0")}${V("spatial-threshold", "Chroma", "0.0")}
              ${V("blend-noise-reduction", "Blend", "0.0")}
            </div>
            <div class="col">
              ${GH("motion-blur-motion-effects", "Motion Blur")}
              ${DD("motion-estimation-type", "Mo. Est. Ty…", "Faster")}
              ${DD("motion-range", "Motion Ra…", "Medium")}
              ${V("motion-blur-motion-effects", "Motion Blur", "0.0")}
            </div>`);

  /* ── 7 · Curves - Custom ── */
  const CH = (c, l) => `<span class="chip" style="--c:${c}">${l}</span>`;
  const CURVES = PANE("curves", "Curves - Custom",
    I("custom-curve", "◿", "on") + I("hue-vs-hue", "◌") + I("hue-vs-sat", "◍") + I("hue-vs-lum", "◎") + I("lum-vs-sat", "☼") +
    I("sat-vs-sat", "◇") + I("sat-vs-lum", "◈") + I("curves-mode-buttons", "⤢") + I("reset", "⟲") + I("curves", "…"), `
            <div class="col wide hs" data-t="custom-curve">
              <div class="curve"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><line x1="2" y1="58" x2="98" y2="2"/></svg></div>
            </div>
            <div class="col">
              <div class="gh hs" data-t="edit-curves"><b>Edit</b><span class="r">⛓ ${CH("#ddd", "Y")}${CH(R, "R")}${CH(G, "G")}${CH(B, "B")} ⟲</span></div>
              ${SL("edit-curves", "", "100", 92)}${SL("edit-curves", "", "100", 92, "r")}${SL("edit-curves", "", "100", 92, "g")}${SL("edit-curves", "", "100", 92, "b")}
              <div class="gh hs" data-t="soft-clip"><b>Soft Clip</b><span class="r">⛓ ${CH(R, "R")}${CH(G, "G")}${CH(B, "B")} ⟲</span></div>
              <div class="f2">${V("low-high-l-s-h-s-soft-clip", "Low", "50.0")}${V("low-high-l-s-h-s-soft-clip", "High", "50.0")}</div>
              <div class="f2">${V("low-high-l-s-h-s-soft-clip", "L.S.", "0.0")}${V("low-high-l-s-h-s-soft-clip", "H.S.", "0.0")}</div>
            </div>`);

  /* ── 8 · ColorSlice — долоон зүсэм ── */
  const SLC = [["Red", "#e0484f"], ["Skin", "#d9a38a"], ["Yellow", "#e3d25a"], ["Green", "#3fbf5a"], ["Cyan", "#45c6d8"], ["Blue", "#5a5ff0"], ["Magenta", "#e04fc7"]];
  const SLICE = PANE("slice", "ColorSlice", I("reset", "⟲"), `
            <div class="col full">
              <div class="f-row">${V("den-den-depth-colorslice", "Den", "0.00")}${V("den-den-depth-colorslice", "Den.Depth", "0.00")}
                <span class="sp"></span>${V("sat-sat-balance-sat-depth-colorslice", "Sat", "1.00")}${V("sat-sat-balance-sat-depth-colorslice", "Sat.Balance", "0.00")}
                ${V("sat-sat-balance-sat-depth-colorslice", "Sat.Depth", "0.00")}<span class="sp"></span>${V("hue", "Hue", "0.00")}</div>
              <div class="slices">${SLC.map(([n, c]) => `
                <div class="slc hs" data-t="colorslice-vectors">
                  <div class="wh-top"><span>◑</span><b>${n}</b><span class="hs" data-t="reset">⟲</span></div>
                  <div class="mw"></div>
                  <div class="hs" data-t="center-hue-colorslice"><span>Center</span> <b>0.000</b></div>
                  <div class="hs" data-t="center-hue-colorslice"><span>Hue</span> <b>0.000</b></div>
                  ${VB([[c, 30, "0.00"], [c, 55, "1.00"]])}
                </div>`).join("")}</div>
            </div>`);

  /* ── 9 · Color Warper - Chroma Warp ── */
  const WARPER = PANE("warper", "Color Warper - Chroma Warp",
    I("color-warper", "◇") + I("chroma-warp", "◬", "on") + I("color-warper", "▦") + I("color-warper", "⤢") + I("reset", "⟲") + I("color-warper", "…"), `
            <div class="col wide hs" data-t="chroma-warp"><div class="chrom"><i></i></div></div>
            <div class="col">
              <div class="gh"><b>Tools</b></div>
              <div class="tools hs" data-t="color-warper-tools"><span>⊕</span><span class="dim">⊕</span><span>⚲</span><span>➚</span><span class="dim">🗑</span></div>
              ${GH("pin-color-warper", "Pin", "⟲", "dim")}
              <div class="dim">${SL("pin-color-warper", "Chroma Range", "0.040", 20)}${SL("pin-color-warper", "Tonal Range Low", "1.000", 100)}
              ${SL("pin-color-warper", "Tonal Range High", "1.000", 100)}${SL("pin-color-warper", "Tonal Range Pivot", "0.500", 50)}
              ${SL("pin-color-warper", "Exposure", "0.000", 50)}</div>
            </div>`);

  /* ── 10 · Qualifier - HSL ── */
  const QG = (id, name, grad, fields, fid) => `
              <div class="qg">
                <div class="gh hs" data-t="${id}"><b><i class="dot"></i>${name}</b><span class="r">⟲</span></div>
                <div class="qbar hs" data-t="${id}" style="background:${grad}"></div>
                <div class="f-row">${fields.map(([l, v]) => V(fid, l, v)).join("")}</div>
              </div>`;
  const QUAL = PANE("qual", "Qualifier - HSL",
    I("hsl-qualifier", "◍", "on") + I("qualifier-mode-buttons", "⁂") + I("qualifier-mode-buttons", "◑") + I("qualifier-mode-buttons", "◭") + I("reset", "⟲") + I("qualifier", "…"), `
            <div class="col wide">
              <div class="tools hs" data-t="qualifier-tools"><span class="on">✎</span><span>✎−</span><span>✎+</span><span>⌁−</span><span>⌁+</span><span>↻</span></div>
              ${QG("hsl-qualifier", "Hue", "linear-gradient(90deg,#c000ff,#ff2a2a,#ffd21e,#2ad24a,#1ec8e6,#2a3cff,#c000ff)",
                [["Center", "50.0"], ["Width", "100.0"], ["Soft", "0.0"], ["Sym", "50.0"]], "center-width-soft-sym")}
              ${QG("saturation", "Saturation", "linear-gradient(90deg,#9a9a88,#8fd02a)",
                [["Low", "0.0"], ["High", "100.0"], ["L. Soft", "0.0"], ["H. Soft", "0.0"]], "low-high-l-soft-h-soft")}
              ${QG("luma", "Luminance", "linear-gradient(90deg,#000,#a8b09a)",
                [["Low", "0.0"], ["High", "100.0"], ["L. Soft", "0.0"], ["H. Soft", "0.0"]], "low-high-l-soft-h-soft")}
            </div>
            <div class="col">
              <div class="gh hs" data-t="matte-finesse"><b>Matte Finesse</b><span class="seg"><b class="on">1</b><b>2</b></span></div>
              ${SL("pre-filter", "Pre-Filter", "0.0", 0)}${SL("clean-black-white", "Clean Black", "0.0", 0)}
              ${SL("clean-black-white", "Clean White", "0.0", 0)}${SL("black-clip-white-clip", "Black Clip", "0.0", 0)}
              ${SL("black-clip-white-clip", "White Clip", "100.0", 100)}${SL("blur-radius-qualifier", "Blur Radius", "0.0", 0)}
              ${SL("in-out-ratio", "In/Out Ratio", "0.0", 50)}
            </div>`);

  /* ── 11 · Window ── */
  const WROW = (id, g) => `<div class="wrow hs" data-t="${id}"><span class="shp">${g}</span><span class="sp"></span><i>●</i><i>▢</i></div>`;
  const WINDOW = PANE("window", "Window", I("reset", "⟲") + I("power-window", "…"), `
            <div class="col wide">
              <div class="f-row nw hs" data-t="add-window-buttons"><span>⊞ Linear</span><span>⊕ Circle</span><span>⟋ Polygon</span><span>✒ Curve</span><span>▬ Gradient</span><span class="sp"></span><span class="btn">Delete</span></div>
              <div class="wlist hs" data-t="window-list">
                ${WROW("linear-window", "□")}${WROW("window-list", "○")}${WROW("polygon-window", "╱")}${WROW("curve-window", "✒")}${WROW("gradient-window", "▬")}
              </div>
            </div>
            <div class="col tight">
              ${GH("transform-window", "Transform", " ")}
              <div class="dim"><div class="f2">${V("transform-window", "Size", "50.00")}${V("transform-window", "Aspect", "50.00")}</div>
              <div class="f2">${V("transform-window", "Pan", "50.00")}${V("transform-window", "Tilt", "50.00")}</div>
              <div class="f2">${V("transform-window", "Rotate", "0.00")}${V("transform-window", "Opacity", "50.00")}</div></div>
              ${GH("softness-window", "Softness", " ")}
              <div class="dim"><div class="f2">${V("softness-window", "Soft 1", "50.00")}${V("softness-window", "Soft 2", "50.00")}</div>
              <div class="f2">${V("softness-window", "Soft 3", "50.00")}${V("softness-window", "Soft 4", "50.00")}</div>
              <div class="f2">${V("softness-window", "Inside", "50.00")}${V("softness-window", "Outside", "50.00")}</div></div>
            </div>`);

  /* ── 13 · AI Magic Mask 2 ── */
  const MASK = PANE("mask", "AI Magic Mask 2", I("reset", "⟲") + I("ai-magic-mask-2", "…"), `
            <div class="col wide mm-l">
              <div class="mm-bar"><span class="hs" data-t="magic-mask-transport">⤓ ⊢ |◀ ◀ ‖ ⇄ ▶ ▶| ⊣</span></div>
              <div class="trk-ru"><span>00:00:00:00</span><span>00:00:08:19</span><span>00:00:17:14</span></div>
              <div class="mm-empty hs" data-t="ai-magic-mask-2"><b>No Mask</b><span>Draw a point in the viewer to create a mask.</span></div>
            </div>
            <div class="col mm-r tight">
              <div class="mm-bar"><span class="hs" data-t="magic-mask-point-tools">✎+ <span class="dim">✎− ✎ ✎ ⌄</span> ◉ ⧉ ≡</span></div>
              ${GH("quality-magic-mask", "Quality")}
              <div class="f2"><span class="seg hs" data-t="quality-magic-mask"><b class="on">Faster</b><b>Better</b></span>${SL("smart-refine", "Smart Refine", "30", 30, "dim")}</div>
              <div class="f2">${DD("mode-shape-radius-iterations", "Mode", "Shrink")}${DD("mode-shape-radius-iterations", "Shape", "Circle")}</div>
              <div class="f2">${SL("mode-shape-radius-iterations", "Radius", "0", 0)}${SL("mode-shape-radius-iterations", "Iterations", "1", 10)}</div>
              <div class="f2">${SL("smoothing-magic-mask", "Smoothing", "0", 0)}${SL("denoise-qualifier", "Denoise", "0.0", 0)}</div>
              <div class="f2">${SL("blur-radius-qualifier", "Blur Radius", "0.0", 0)}${SL("in-out-ratio", "In/Out Ratio", "0.0", 50)}</div>
              <div class="f2">${SL("clean-black-white", "Clean Black", "0.0", 0)}${SL("black-clip-white-clip", "Black Clip", "0.0", 0)}</div>
              <div class="f2">${SL("clean-black-white", "Clean White", "0.0", 0)}${SL("black-clip-white-clip", "White Clip", "100.0", 100)}</div>
              ${SL("post-filter", "Post Filter", "0.0", 0)}
            </div>`);

  /* ── 14 · Blur - Blur ── */
  const BG = (id, name, v, h, dimLink) => `
              <div class="bgrp hs" data-t="${id}">
                <div class="wh-top"><span class="${dimLink ? "dim" : ""}">⛓</span><b>${name}</b><span class="hs" data-t="reset">⟲</span></div>
                ${VB([[R, h, v], [G, h, v], [B, h, v]])}
              </div>`;
  const BLUR = PANE("blur", "Blur - Blur",
    I("blur-mode-buttons", "●", "on") + I("sharpen", "▲") + I("mist", "◭") + I("reset", "⟲"), `
            <div class="col full"><div class="wheels">
              ${BG("radius-blur", "Radius", "0.50", 50)}${BG("h-v-ratio", "H/V Ratio", "0.50", 50)}${BG("scaling-blur", "Scaling", "0.25", 25, true)}
            </div></div>`,
    `<span class="sp"></span><span class="dim">${V("coring-softness-level-mix", "Coring Softness", "0.00")}${V("coring-softness-level-mix", "Level", "0.00")}
            ${V("coring-softness-level-mix", "Mix", "100.00")}</span><span class="sp"></span>`);

  /* ── 15 · Key ── */
  const KG = (id, name, icons, rows) => `
              <div class="kg hs" data-t="${id}">
                <div class="gh"><b>${name}</b><span class="r">${icons}</span></div>
                ${rows.map((r) => `<div class="f2">${r.map(([l, v]) => V(id, l, v)).join("")}</div>`).join("")}
              </div>`;
  const KEY = PANE("key", "Key", I("node-key", "Node Key", "hl") + I("reset", "⟲"), `
            <div class="col wide"><div class="keyprev hs" data-t="key-preview"><i></i></div></div>
            <div class="col tight">
              ${KG("key-input-key-palette", "Key Input", "◙ ▣", [[["Gain", "1.000"], ["Offset", "0.000"]], [["Blur R.", "0.000"], ["Blur H/V", "0.000"]]])}
              ${KG("key-output-key-palette", "Key Output", "◙", [[["Gain", "1.000"], ["Offset", "0.000"]]])}
              ${KG("qualifier-key-palette", "Qualifier", "◙ ▣", [[["Gain", "1.000"], ["Offset", "0.000"]]])}
            </div>`);

  /* ── 16 · Sizing - Input Sizing ── */
  const SIZING = PANE("sizing", "Sizing - Input Sizing",
    I("sizing-mode-buttons", "▭") + I("input-sizing", "⧈", "on") + I("sizing-mode-buttons", "▤") + I("sizing-mode-buttons", "⧉") + I("sizing-mode-buttons", "▣") +
    I("reset", "⟲") + I("sizing-palette", "…"), `
            <div class="col wide">
              ${GH("sizing-palette", "Sizing")}
              <div class="f2"><div>${V("pan-tilt-zoom-rotate-sizing", "Pan", "0.000")}${V("pan-tilt-zoom-rotate-sizing", "Tilt", "0.000")}
                ${V("pan-tilt-zoom-rotate-sizing", "Zoom", "1.000")}${V("pan-tilt-zoom-rotate-sizing", "Rotate", "0.000")}</div>
              <div>${V("width-height-pitch-yaw-sizing", "Width", "1.000")}${V("width-height-pitch-yaw-sizing", "Height", "1.000")}
                ${V("width-height-pitch-yaw-sizing", "Pitch", "0.000")}${V("width-height-pitch-yaw-sizing", "Yaw", "0.000")}
                <span class="f hs" data-t="flip-sizing"><span class="l">Flip</span><b class="v">⇹</b><b class="v">⇳</b></span></div></div>
            </div>
            <div class="col dim hs" data-t="blanking">
              ${GH("blanking", "Blanking")}
              ${V("blanking", "Top", "&nbsp;")}${V("blanking", "Right", "&nbsp;")}${V("blanking", "Bottom", "&nbsp;")}${V("blanking", "Left", "&nbsp;")}
              ${CB("blanking", "Smooth")}
            </div>`);

  /* 51-ийн Color хуудас дуудна — Primaries, Tracker-ээс бусад самбар */
  S.clPal = () => RAW + MATCH + HDR + RGB + MOTION + CURVES + SLICE + WARPER + QUAL + WINDOW + MASK + BLUR + KEY + SIZING;
})(window.RM);
