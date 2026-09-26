/* ═════════════════════════════════════════════════════════════
   51 · Fusion, Color, Fairlight, Deliver хуудас
   Байрлал бүрийг хэрэглэгчийн бодит Resolve Studio 21-ийн
   дэлгэцээс (2026-09-18) уншиж барьсан.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";
  const S = RM.sim, H = S._h;

  /* ═══════════ FUSION ═══════════ */
  /* Fusion хэрэгслийн мөр — 28 товч, 4|4|5|5|3|7 бүлэг (2026-09-25-ны зургууд).
     [толины id, дүрс, tooltip, доод мөрийн тайлбар]. 28 товч бүгд tooltip-оор баталгаажсан.
     id нь null бол нэр нь хараахан баталгаажаагүй товч (одоогоор байхгүй). */
  const FU_TOOLS = [
    [["background-node", "▥", "Background", "Background - Creates a four-point gradient frame"],
     ["fastnoise", "▩", "FastNoise", "FastNoise - Applies a faster version of Perlin noise"],
     ["text-plus-node", "T", "Text+", "Text+ - Text+"],
     ["paint", "✎", "Paint", "Paint - Animated Paint System"]],
    [["color-corrector-fusion", "◍", "Color Corrector", "Color Corrector - Full color correction"],
     ["color-curves-fusion", "⟋", "Color Curves", "Color Curves - Allows changes to channel color curves"],
     ["brightness-contrast", "☼", "Brightness / Contrast", "Brightness / Contrast - Applies Brightness and Contrast"],
     ["blur-fusion", "◖", "Blur", "Blur - Blurs images"]],
    [["merge", "⧉", "Merge", "Merge - Layers one image over another, with rotation, scaling and offset"],
     ["multimerge", "⧈", "MultiMerge", "MultiMerge - Multi-input Merge"],
     ["channel-booleans", "⊟", "Channel Booleans", "Channel Booleans - Allows Boolean combinations of foreground channels with the background"],
     ["matte-control", "◪", "Matte Control", "Matte Control - Applies Blurring and Contrast to the Matte"],
     ["transform-fusion", "⟳", "Transform", "Transform - Applies rotation, scaling and mirroring effects"]],
    [["rectangle-mask", "▭", "Rectangle", "Rectangle - Creates a rectangular mask"],
     ["ellipse-mask", "◯", "Ellipse", "Ellipse - Creates an elliptical mask"],
     ["polygon-mask", "⬠", "Polygon", "Polygon - Draw a Polyline"],
     ["b-spline-mask", "⌒", "BSpline", "BSpline - Draw a BSpline Polyline"],
     ["multipoly", "〰", "MultiPoly", "MultiPoly - Multi-layer Polygon Mask"]],
    [["particle-emitter", "⁂", "pEmitter", "pEmitter - Generates Particles"],
     ["pdirectionalforce", "⁘", "pDirectionalForce", "pDirectionalForce - pDirectionalForce"],
     ["prender", "⋰", "pRender", "pRender - Renders Particles"]],
    [["image-plane-3d", "▱", "Image Plane 3D", "Image Plane 3D - Converts an image to a textured plane"],
     ["shape-3d", "⬢", "Shape 3D", "Shape 3D - Generate a Shape"],
     ["text-3d", "Ṯ", "Text 3D", "Text 3D - Text3D"],
     ["merge-3d", "⚭", "Merge 3D", "Merge 3D - Merge 3D Data"],
     ["camera-3d", "⬡", "Camera 3D", "Camera 3D - Creates a standard camera"],
     ["spot-light", "✺", "Spot Light", "Spot Light - Generate a Spot Light"],
     ["renderer-3d", "◓", "Renderer 3D", "Renderer 3D - Renders 3D Scene"]]
  ];
  const FU_TOOLBAR = () => FU_TOOLS.map((g) => g.map(([id, ic, name, st]) => id
    ? `<span class="ft hs" data-t="${id}" title="${name}" data-status="${st}">${S.icon(id, ic)}</span>`
    : `<span class="ft hs" data-t="fusion-toolbar" title="Нэр нь хараахан баталгаажаагүй">${ic}</span>`
  ).join("")).join('<span class="div"></span>');

  /* Media Pool — Master сангийн хавтаснууд (2026-09-25-ны зураг, нэр нь зурагт таслагдсан хэвээр) */
  const FU_FOLDERS = ["01_Holog_T…", "02_Suirel_A…", "03_Eej_Huu", "04_Avrah_h…", "05_Tovchlu…",
                      "06_Cockpit…", "07_Huvtsas…", "08_Test_Ex…", "09_Referen…", "10_Green_S…"];

  /* ═══════════ FUSION ═══════════
     2026-09-25-ны зургууд: Inspector дээд эгнээнд (хагас өндөр), хэрэгслийн мөр,
     Nodes, төлөвийн мөр бүтэн өргөнөөр. MediaIn1 сонгогдсон. */
  S.fusion = () => `
  <div class="rs" data-page="fusion">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("media-pool", "▤", "Media Pool", true)}
       ${H.TG("effects-library", "✦", "Effects")}
       ${H.TG("clips-panel", "▥", "Clips")}
       ${H.TG("node-graph", "⬡", "Nodes", true)}`,
      `${H.TG("spline-editor", "∿", "Spline")}
       ${H.TG("keyframe-editor", "◆", "Keyframes")}
       ${H.TG("metadata", "ⓘ", "Metadata")}
       ${H.TG("inspector-fusion", "◧", "Inspector", true)}`, false)}
    <div class="rs-row2">
      <span class="hs" data-t="panel-toggle">▯ ⌄</span><span>‹ ›</span><span class="hs" data-t="audio-sync">⧖</span>
      <span class="hs" data-t="import-media">▦ ⌄</span><span class="hs" data-t="blackmagic-cloud-account">☁</span>
      <span>…</span><span class="hs" data-t="thumbnail-view">▦ ⌄</span><span class="hs" data-t="help-search">⌕</span><span>⇅ ⋯</span>
      <span class="hs" data-t="zoom-slider">100% ⌄</span><span class="hs" data-t="viewer-mode">▣ ⌄ ▭ ⌄</span>
      <span class="sp"></span>
      <span class="hs" data-t="viewer-mode">▭ ⋯</span><span class="hs" data-t="zoom-slider">Fit ⌄</span>
      <span class="hs" data-t="viewer-mode">▣ ⌄ ▭ ⌄</span>
      <b class="hs" data-t="mediaout">MediaOut1</b><span class="hs" data-t="viewer-mode">▭ ⌄</span><span>Default ⌄</span><span>◍ ⌄</span><span>▦</span>
    </div>
    <div class="rs-body fu-body">
      <div class="rs-top" style="flex:0 0 55%">
        <div class="pane hs" data-t="bin" style="width:118px;flex-shrink:0">
          <div class="pane-b"><div class="mp-bins fu-bins">
            <div class="mp-bin-h hs" data-t="bin">▤ Bins<span class="sp"></span>+</div>
            <div class="mp-bin act hs" data-t="bin">› Master</div>
            <div class="sp"></div>
            <div class="mp-bin-h hs" data-t="smart-bin">✦ Smart Bins<span class="sp"></span>+</div>
            <div class="mp-bin sub hs" data-t="keyword">Keywords</div>
            <div class="mp-bin sub hs" data-t="power-bin">› Collections</div>
          </div></div>
        </div>
        <div class="pane hs" data-t="media-pool" style="width:210px;flex-shrink:0">
          <div class="pane-h hs" data-t="bin"><span>Master</span></div>
          <div class="pane-b"><div class="fu-folders">
            ${FU_FOLDERS.map((n) => `<div class="fu-folder hs" data-t="bin"><i></i><span>${n}</span></div>`).join("")}
          </div></div>
        </div>
        <div class="pane vw hs" data-t="viewer-1-2">
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen dark"><span class="vw-info hs" data-t="resolution">[Main]: 3840x2160 float32</span><div class="img"></div></div>
            <div class="vw-foot">
              <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0">
                ${[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700].map((n) => `<div class="tk"><span>${n}</span></div>`).join("")}
                <div class="tl-play" style="left:87.5%"></div></div>
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("630.0", '<span class="tc hs" data-t="timecode">0.0</span><span class="tc hs" data-t="duration">720.0</span><span class="hs" data-t="mute">🔈</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
        <div class="pane insp fu-insp hs" data-t="inspector-fusion" style="width:318px">
          <div class="pane-h"><b>Inspector</b><span class="sp"></span><span>▭ ⋯</span></div>
          <div class="insp-tabs"><div class="act hs" data-t="tools-fusion-inspector">Tools</div><div class="off hs" data-t="modifiers-fusion-inspector">Modifiers</div></div>
          <div class="pane-b">
            <div class="insp-sec hs" data-t="mediain">
              <div class="t fu-hdr"><span class="fu-tog"><i></i></span><span class="nm">MediaIn1: dreamina-2026-09-1</span><span class="bdot"></span><span class="chev">⌄</span><span class="sp"></span>
                <span class="hic dim">${S.icon("hdr-versions")}</span><span class="hic">${S.icon("hdr-pin")}</span><span class="hic">${S.icon("hdr-lock")}</span><span class="hic">${S.icon("hdr-reset")}</span></div>
              <div class="insp-row hs" data-t="clip-name-mediain"><span class="lb">Clip Name</span><b class="val">dreamina-2026-09-17-3642-Photor</b></div>
            </div>
            <div class="insp-tabs three fu-itabs">
              <div class="act hs" data-t="image-mediain" data-tab="mi:image">${S.icon("insp-image")}<br>Image</div>
              <div class="hs" data-t="audio-mediain" data-tab="mi:audio" data-status="Audio">${S.icon("insp-audio")}<br>Audio</div>
              <div class="hs" data-t="settings-fusion-inspector" data-tab="mi:settings">${S.icon("insp-settings")}<br>Settings</div>
            </div>
            <div data-tabpane="mi:image">
              <div class="insp-sec">
                <div class="insp-row hs" data-t="process-mode"><span class="lb">Process Mode</span><b class="val dd">Full Frames ⌄</b></div>
                <div class="insp-row hs" data-t="media-source-mediain"><span class="lb">Media Source</span><b class="val dd">Timeline ⌄</b></div>
                <div class="insp-row hs" data-t="layer-mediain"><span class="lb">Layer</span><b class="val dd">0 ⌄</b></div>
              </div>
              <div class="insp-sec hs" data-t="source-color-space"><div class="t">› Source Color Space</div></div>
              <div class="insp-sec hs" data-t="source-gamma-space"><div class="t">› Source Gamma Space</div></div>
            </div>
            <div data-tabpane="mi:audio" hidden>
              <div class="insp-sec">
                <div class="insp-row hs" data-t="audiotrack-mediain"><span class="lb">AudioTrack</span><b class="val dd">Timeline Audio [SEEDANCE_v1_30s] ⌄</b></div>
                <div class="insp-row hs" data-t="sound-offset"><span class="lb">Sound Offset</span><span class="sl ticks"></span><b>0.0</b></div>
              </div>
              <div class="insp-sec hs" data-t="audiocache"><div class="t">⌄ AudioCache</div>
                <div class="insp-btn hs" data-t="purge-audio-cache">Purge Audio Cache</div></div>
            </div>
            <div data-tabpane="mi:settings" hidden>
              <div class="insp-sec"><div class="t">⌄ Settings</div>
                <div class="insp-chk hs" data-t="apply-mask-inverted"><i></i>Apply Mask Inverted<span class="sp"></span><span class="kfd">◆</span></div>
                <div class="insp-chk hs" data-t="multiply-by-mask"><i></i>Multiply by Mask<span class="sp"></span><span class="kfd">◆</span></div>
                <div class="insp-chk hs" data-t="hide-incoming-connections"><i></i>Hide Incoming Connections</div>
              </div>
              <div class="insp-sec"><div class="t">⌄ Layers</div>
                <div class="insp-row hs" data-t="main-layer-name"><span class="lb">Main Layer Name</span><b class="val in"></b></div>
                <div class="insp-row hs" data-t="effect-mask-layer"><span class="lb">Effect Mask Layer</span><b class="val dd">Auto ⌄</b><span class="kfd">◆</span></div>
              </div>
              <div class="insp-sec hs" data-t="comments-fusion-inspector"><div class="t">⌄ Comments</div><div class="insp-note"></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="fu-tools hs" data-t="fusion-toolbar">${FU_TOOLBAR()}</div>
      <div class="pane hs" data-t="node-graph" style="flex:1;min-height:0;border-top:1px solid var(--rs-line)">
        <div class="pane-h"><b>Nodes</b><span class="sp"></span><span class="hs" data-t="node-label">⋯</span></div>
        <div class="pane-b"><div class="node-canvas">
          <div class="wire y" style="left:172px;top:40px;width:calc(57% - 172px)"></div>
          <div class="node nsel hs" data-t="mediain" style="left:40px;top:28px;width:132px"><span class="nl">dreamina-2026-09-17…</span></div>
          <div class="node hs" data-t="mediaout" style="left:57%;top:28px;width:130px"><span class="nl">MediaOut1</span></div>
        </div></div>
      </div>
      <div class="rs-status hs" data-t="status-bar-fusion">
        <span class="st-hint"></span>
        <span class="ro hs" data-t="position-viewer">Position&nbsp; X 0.94512&nbsp; 2422&nbsp;&nbsp; Y −0.33804&nbsp; −483</span>
        <span class="ro hs" data-t="canvas-rgba">Canvas&nbsp; R 0&nbsp;&nbsp; G 0&nbsp;&nbsp; B 0&nbsp;&nbsp; A 0</span>
        <span class="sp"></span><span class="hs" data-t="render-cache">9% - 2973 MB</span>
      </div>
    </div>
    ${H.PAGES("fusion")}
  </div>`;

  /* ═══════════ COLOR ═══════════ */
  const WHEEL = (id, name, vals) => `
    <div class="wheel hs" data-t="${id}">
      <div class="wh-top"><span class="hs" data-t="reset">⊹</span><b>${name}</b><span class="hs" data-t="reset">⟲</span></div>
      <div class="rng"></div>
      <div class="wv">${vals.map((v) => `<span>${v}</span>`).join("")}</div>
      <div class="wsl hs" data-t="bars"></div>
    </div>`;


  /* ── Color viewer-ийн wipe-ийн мөр (2026-09-26): [id, tooltip, класс] — A/B саарал, tooltip гараагүй ── */
  const CL_WIPE = [["horizontal-wipe", "Horizontal"], ["vertical-wipe", "Vertical"], ["diagonal-wipe", "Diagonal"],
    ["mix-wipe", "Mix", "act"], ["alpha-wipe", "Alpha"], ["wipe-style-toolbar-color-viewer", "A/B — tooltip гараагүй", "dim"],
    ["box-wipe", "Box"], ["venetian-blind-wipe", "Venetian Blind"], ["checker-board-wipe", "Checker Board"]];

  /* ── Tracker - Window самбар (2026-09-26) ── */
  const CL_TRACKER = () => `
          <div class="cp-pane trk" data-tabpane="cp:tracker" hidden>
            <div class="pane-h"><b class="hs" data-t="window-tracker">Tracker - Window</b><span class="sp"></span>
              <span class="hs on" data-t="tracker-mode-buttons" title="Window">⊕</span><span class="hs" data-t="tracker-mode-buttons" title="Stabilizer">▣</span><span class="hs" data-t="tracker-mode-buttons" title="FX">fx</span>
              <span class="hs" data-t="clear-all-tracking-points" title="Clear All Tracking Points">⟲</span><span class="hs mi" data-t="tracker-options-menu">…</span></div>
            <div class="trk-bar">
              <span class="hs" data-t="tracker-transport">⇤ ◀ ‖ ⇄ ▶ ⇥</span>
              <span class="trk-ck hs" data-t="pan-tilt-zoom-rotate-3d-tracker"><i></i><b style="color:#3ec28f">Pan</b><i></i><b style="color:#6f8ff0">Tilt</b><i></i><b style="color:#e04fc7">Zoom</b><i></i><b style="color:#e3d25a">Rotate</b><i></i><b style="color:#4fb6e0">3D</b></span>
              <span class="trk-seg hs" data-t="clip-frame-tracker"><b class="on">Clip</b><b>Frame</b></span>
            </div>
            <div class="trk-graph hs" data-t="tracker-graph">
              <div class="trk-ru">${["00:00:00:00", "00:00:04:18", "00:00:09:12", "00:00:14:05", "00:00:18:23", "00:00:23:17"].map((t) => `<span>${t}</span>`).join("")}</div>
              <div class="trk-ph"></div>
              <div class="trk-val"><b style="color:#3ec28f">0.00</b><b style="color:#6f8ff0">0.00</b><b style="color:#e04fc7">0.00</b><b style="color:#e3d25a">0.00</b></div>
            </div>
            <div class="trk-foot">
              <span class="hs" data-t="interactive-mode"><i class="cb"></i> Interactive Mode</span>
              <span class="dim hs" data-t="interactive-mode-tools" title="Insert">⬚</span><span class="dim hs" data-t="interactive-mode-tools" title="Set Point">↖</span><span class="dim hs" data-t="interactive-mode-tools" title="Delete">🗑</span><span class="sp"></span>
              <b class="dd mi hs" data-t="tracker-method-menu">Cloud Tracker ⌄</b>
            </div>
          </div>`;

  /* ── Keyframes самбар (Color, 2026-09-26) ── */
  const CL_KEYFRAMES = () => `
          <div class="cp-pane kfc" data-tabpane="cr:keyframes" hidden>
            <div class="pane-h"><b class="hs" data-t="keyframes-panel-color">Keyframes</b><span class="sp"></span>
              <b class="hs mi" data-t="keyframes-filter-color">All ⌄</b><span class="kfc-zoom hs" data-t="keyframes-panel-color"><i></i></span></div>
            <div class="kfc-body">
              <div class="kfc-names">
                <div class="kfc-tc hs" data-t="timecode">00:00:30:00</div>
                <div class="kfc-n master hs" data-t="master-keyframes">Master</div>
                ${[1, 2, 3, 4].map((n) => `<div class="kfc-n hs" data-t="corrector-keyframes"><span class="ic">● ▪ ◆ ›</span>Corrector ${n}</div>`).join("")}
                <div class="kfc-n hs" data-t="sizing-keyframes"><span class="ic">● ▪ ◆ ›</span>Sizing</div>
              </div>
              <div class="kfc-lanes">
                <div class="kfc-ru"><span>00:00:00:00</span><span>00:00:10:08</span><span>00:00:20:16</span></div>
                <div class="kfc-l master"><i></i></div>${"<div class=\"kfc-l\"><i></i></div>".repeat(5)}
              </div>
            </div>
          </div>`;

  S.color = () => `
  <div class="rs" data-page="color">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("gallery", "▨", "Gallery")}
       ${H.TG("lut-browser", "▩", "LUTs")}
       ${H.TG("media-pool", "▤", "Media Pool")}
       ${H.TG("clips-panel", "▥", "Clips ⌄")}`,
      `${H.TG("quick-export", "⇧", "Quick Export")}
       ${H.TG("mini-timeline", "⚌", "Timeline")}
       ${H.TG("node-editor", "⬡", "Nodes")}
       ${H.TG("openfx", "✦", "Effects")}
       ${H.TG("lightbox", "▦", "Lightbox")}`, false)}
    <div class="rs-row2">
      <span class="hs" data-t="zoom-slider">12.5% ⌄</span><span class="hs act" data-t="image-wipe" data-tab="vr:wipe">◧</span><span class="hs" data-t="split-screen" data-tab="vr:split">▦</span><span class="hs" data-t="highlight" data-tab="vr:hl">◐</span>
      <span class="sp"></span>
      <b class="hs" data-t="timeline">SE…0s ⌄</b><span class="tc hs" data-t="timecode">00:00:00:00 ⌄</span>
      <span class="hs" data-t="viewer-mode">▭ ⌄ ▦ ⌄ ⚙ ⌄</span><span class="hs" data-t="reset">⟲</span><span class="hs" data-t="full-screen-window">⛶</span><span>…</span>
      <span class="hs" data-t="selection-mode">↖ ⌄</span><span class="hs" data-t="node-editor">⚌ ⌄</span>
      <b class="hs" data-t="corrector-node">Clip ⌄</b>
      <span class="hs" data-t="node-editor">⬡ ⌄</span><span>…</span>
      <span class="sp"></span>
      <span class="hs mi" data-t="resolve-fx-blur">Library</span><b class="hs" data-t="openfx" style="border-bottom:2px solid var(--rs-red);padding-bottom:2px">Settings</b>
      <span class="hs" data-t="help-search">⌕</span><span>…</span>
    </div>
    <div class="rs-body">
      <div class="cl-top">
        <div class="pane vw hs" data-t="viewer" style="flex:0 0 49%">
          <div class="cl-wipe hs" data-t="wipe-style-toolbar-color-viewer" data-tabpane="vr:wipe">${CL_WIPE.map(([id, tip, cls]) =>
            `<span class="wb ${cls || ""} hs" data-t="${id}" title="${tip}">${S.icon(id === "wipe-style-toolbar-color-viewer" ? "ab-wipe" : id)}</span>`).join("")}</div>
          <div class="cl-wipe" data-tabpane="vr:split" hidden><b class="dd mi hs" data-t="split-screen-mode-menu">Version ⌄</b></div>
          <div class="cl-wipe hs" data-t="highlight-mode-buttons" data-tabpane="vr:hl" hidden><span class="wb act hs" data-t="highlight-mode-buttons">■</span><span class="wb hs" data-t="highlight-mode-buttons">◧</span><span class="wb hs" data-t="highlight-mode-buttons" style="font-size:9px">A/B</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen dark"><div class="img" style="width:36%"></div></div>
            <div class="vw-foot">
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("01:00:00:00", '<span class="hs" data-t="picker">✎ ⌄</span><span class="hs" data-t="viewer-overlay">▭</span><span class="hs" data-t="mute">🔈</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
        <div class="pane nodes hs" data-t="node-editor" style="flex:0 0 24%">
          <div class="pane-b"><div class="node-canvas cl">
            <span class="ndot in"></span>
            <div class="cnode hs" data-t="corrector-node" style="left:44px;top:66px"><div class="th"></div><span>01</span></div>
            <div class="cnode hs" data-t="serial-node" style="left:124px;top:170px"><div class="th"></div><span>02 ⊘</span></div>
            <div class="cnode hs" data-t="serial-node" style="left:216px;top:66px"><div class="th"></div><span>03 ⊘</span></div>
            <div class="cnode sel hs" data-t="serial-node" style="left:320px;top:170px"><div class="th"></div><span>04 ⊘ ✎</span></div>
            <span class="ndot out"></span>
            <div class="npager hs" data-t="node-graph-order">● ○</div>
          </div></div>
        </div>
        <div class="pane insp hs" data-t="openfx" style="flex:1">
          <div class="pane-b">
            <div class="insp-sec hs" data-t="vignette">
              <div class="t"><span class="tog on"></span> Vignette <span class="sp"></span><span class="mini">🗑 ⟲</span></div>
              <div class="insp-row hs" data-t="operating-mode"><span class="lb">Operating Mode</span><b class="val dd">Basic ⌄</b><span class="kf">⟲</span></div>
              <div class="t sub">⌄ Shape</div>
              <div class="insp-row hs" data-t="vignette"><span class="lb">Size</span><span class="sl" style="--p:85%"></span><b>0.905</b><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="anamorphism"><span class="lb">Anamorphism</span><span class="sl" style="--p:55%"></span><b>1.780</b><span class="kf">◆ ⟲</span></div>
              <div class="t sub">⌄ Appearance</div>
              <div class="insp-row hs" data-t="softness"><span class="lb">Softness</span><span class="sl" style="--p:70%"></span><b>0.705</b><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="vignette"><span class="lb">Color</span><span class="swatch"></span><span class="hs" data-t="picker">✎</span><span class="kf">◆ ⟲</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="cl-strip hs" data-t="clips-panel">
        <span class="cbadge hs" data-t="thumbnail-timeline">01</span><span class="hs" data-t="track" style="margin-left:80px">V1</span>
        <div class="cl-thumb csel hs" data-t="grade"><span class="cap">H.264 High L5.0</span></div>
      </div>

      <div class="pal-rail hs" data-t="primaries">
        <span class="pi hs" data-t="camera-raw" title="Camera Raw">◉</span><span class="pi hs" data-t="shot-match" title="Color Match">▦</span>
        <span class="pi act hs" data-t="color-wheels" data-tab="cp:wheels" title="Color Wheels">◑</span><span class="pi hs" data-t="hdr-palette" title="HDR">✸</span>
        <span class="pi hs" data-t="splitter-combiner" title="RGB Mixer">⁂</span><span class="pi hs" data-t="motion-effects" title="Motion Effects">⧗</span>
        <span class="pi hs" data-t="curves" title="Curves">∿</span><span class="pi hs" data-t="color-warper" title="Color Warper">⬚</span>
        <span class="pi hs" data-t="qualifier" title="Qualifier">◌</span><span class="pi hs" data-t="power-window" title="Windows">▭</span>
        <span class="pi hs" data-t="window-tracker" data-tab="cp:tracker" title="Tracker">⊹</span><span class="pi hs" data-t="magic-mask" title="Magic Mask">✦</span>
        <span class="pi hs" data-t="blur-sharpen-mist" title="Blur">◍</span><span class="pi hs" data-t="matte" title="Key">◪</span>
        <span class="pi hs" data-t="node-sizing" title="Sizing">⤢</span><span class="pi hs" data-t="switch-eye-to" title="Stereo 3D">3D</span>
        <span class="sp"></span>
        <span class="pi hs" data-t="keyframes-panel-color" data-tab="cr:keyframes" title="Keyframes">◆</span><span class="pi act hs" data-t="scopes" data-tab="cr:scopes" title="Scopes">∿</span><span class="pi hs" data-t="metadata" title="Info">ⓘ</span>
      </div>

      <div class="cl-bottom">
        <div class="pane" style="flex:0 0 49%">
          <div class="cp-pane" data-tabpane="cp:wheels">
          <div class="pane-h"><b>Primaries - Color Wheels</b><span class="sp"></span>
            <span class="hs" data-t="color-wheels">◉</span><span class="hs" data-t="bars">▮▮</span><span class="hs" data-t="log-wheels">◐</span><span class="hs" data-t="reset">⟲</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="cw-row">
              <span class="hs" data-t="auto-balance">Ⓐ</span><span class="hs" data-t="white-balance-picker">✎</span>
              <span class="sp"></span>
              <span class="hs" data-t="temperature">Temp <b>0.0</b></span><span class="hs" data-t="tint">Tint <b>0.00</b></span>
              <span class="hs" data-t="contrast">Contrast <b>1.000</b></span><span class="hs" data-t="pivot">Pivot <b>0.435</b></span>
              <span class="hs" data-t="midtone-detail">Mid/Detail <b>0.00</b></span>
            </div>
            <div class="wheels">
              ${WHEEL("lift", "Lift", ["0.00", "0.00", "0.00", "0.00"])}
              ${WHEEL("gamma", "Gamma", ["0.00", "0.00", "0.00", "0.00"])}
              ${WHEEL("gain", "Gain", ["1.00", "1.00", "1.00", "1.00"])}
              ${WHEEL("offset", "Offset", ["25.00", "25.00", "25.00"])}
            </div>
            <div class="cw-row bottom">
              <span class="hs" data-t="color-boost">Color Boost <b>0.00</b></span>
              <span class="hs" data-t="shadows-highlights">Shadows <b>0.00</b></span>
              <span class="hs" data-t="shadows-highlights">Highlights <b>0.00</b></span>
              <span class="hs" data-t="saturation">Saturation <b>50.00</b></span>
              <span class="hs" data-t="hue">Hue <b>50.00</b></span>
              <span class="hs" data-t="lum-mix">Lum Mix <b>100.00</b></span>
            </div>
          </div>
          </div>
          ${CL_TRACKER()}
        </div>
        <div class="pane scopes" style="flex:1">
          <div class="cp-pane hs" data-t="scopes" data-tabpane="cr:scopes">
          <div class="pane-h"><b>Scopes</b><span class="sp"></span>
            <b class="hs" data-t="parade">Parade ⌄</b><span class="hs" data-t="scopes">⚌ ⛶ …</span></div>
          <div class="pane-b" style="display:flex">
            <div class="scope-scale">${["1023","896","768","640","512","384","256","128","0"].map((v) => `<span>${v}</span>`).join("")}</div>
            <div class="scope-box parade hs" data-t="parade"><div class="grid"></div><div class="tr r"></div><div class="tr g"></div><div class="tr b"></div></div>
          </div>
          </div>
          ${CL_KEYFRAMES()}
        </div>
      </div>
    </div>
    ${H.PAGES("color")}
  </div>`;

  /* ═══════════ FAIRLIGHT ═══════════ */
  S.fairlight = () => `
  <div class="rs" data-page="fairlight">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("media-pool", "▤", "Media Pool")}
       ${H.TG("effects-library", "✦", "Effects")}
       ${H.TG("edit-index", "≣", "Index")}
       ${H.TG("link-group", "⊞", "Groups")}
       ${H.TG("sound-library", "♫", "Sound Library")}
       ${H.TG("adr", "◉", "ADR")}`,
      `${H.TG("mixer", "⇅", "Mixer", true)}
       ${H.TG("loudness-meter", "▮▮", "Meters", true)}
       ${H.TG("metadata", "ⓘ", "Metadata")}
       ${H.TG("inspector", "◧", "Inspector")}`, false)}
    <div class="rs-body">
      <div class="fl-meters hs" data-t="loudness-meter">
        <div class="fl-track-meters hs" data-t="channel-strip">
          ${Array.from({ length: 24 }, (_, i) => `<div class="m"><i></i><i></i></div>`).join("")}
          <div class="scale"><span>0</span><span>-5</span><span>-10</span><span>-15</span><span>-20</span><span>-30</span><span>-40</span><span>-50</span></div>
        </div>
        <div class="fl-bus hs" data-t="main-bus"><b>Bus 1</b><div class="m"><i></i><i></i></div></div>
        <div class="fl-cr hs" data-t="monitoring"><b>Control Room</b><small>TP <span class="hs" data-t="true-peak">-100</span></small><div class="m"><i></i><i></i></div></div>
        <div class="fl-loud hs" data-t="loudness">
          <b>Loudness</b><small>BS.1770-1 (LU) …</small>
          <div class="ld"><span>M</span><span>S</span><span>I</span></div>
          <div class="ld-r hs" data-t="lufs"><span>Short</span><span>Short Max</span><span>Range</span><span>Integrated</span></div>
          <div class="ld-b"><span class="hs" data-t="loudness">Pause</span><span class="hs" data-t="reset">Reset</span><span class="sp"></span><span>⚌</span></div>
        </div>
        <div class="fl-view hs" data-t="fairlight-viewer"><div class="img"></div><span class="hs" data-t="viewer-mode">▭</span></div>
      </div>
      <div class="fl-transport hs" data-t="transport-controls">
        <span class="tc big hs" data-t="timecode">01:00:00:00</span>
        <b class="hs" data-t="timeline">${H.TIMELINE} ⌄</b>
        <span class="sp"></span>
        <span class="hs" data-t="fast-reverse">◀◀</span><span class="hs" data-t="fast-forward">▶▶</span><span class="hs play" data-t="play-stop">▶</span>
        <span class="hs" data-t="k">■</span><span class="hs" data-t="record-voiceover">●</span><span class="hs" data-t="loop-unloop">↻</span>
        <span class="hs" data-t="automation">⚙◦</span><span class="hs" data-t="automation">⚙◦</span>
        <span class="sp"></span>
        <span class="hs" data-t="main-bus">Bus 1</span><span>→</span><span class="hs" data-t="monitoring">Auto</span>
        <span class="hs" data-t="monitoring">🔈</span><span class="slider hs" data-t="fader"></span><span class="dim hs" data-t="dim">DIM</span>
      </div>
      <div class="rs-tlbar hs" data-t="toolbar-timeline">
        <span class="tl hs" data-t="edit-index">⚌</span><span class="tl hs" data-t="waveform-editing">▦</span>
        <span class="sp" style="max-width:220px"></span>
        <span class="tl act hs" data-t="selection-mode">↖</span><span class="tl hs" data-t="range-selection-mode">✛</span>
        <span class="tl hs" data-t="waveform-editing">I</span><span class="tl hs" data-t="paint">✎</span>
        <span class="div"></span>
        <span class="tl hs" data-t="blade">✂</span><span class="tl hs" data-t="link-clips">⊸</span><span class="tl hs" data-t="linked-selection">∞</span><span class="tl hs" data-t="crossfade">◫</span>
        <span class="div"></span>
        <span class="tl hs" data-t="flag">⚑ ⌄</span><span class="tl hs" data-t="marker">◆ ⌄</span>
        <span class="div"></span>
        <span class="tl hs" data-t="zoom-audio-waveform">∿</span><span class="hs" data-t="zoom-slider">⇕ <span class="zb"></span></span>
        <span class="hs" data-t="zoom-slider">⇔ <span class="zb"></span></span>
      </div>
      <div class="fl-split">
        <div class="fl-left">
          <div class="fl-io hs" data-t="in-point"><span>⇥</span><span class="tc">01:00:00:00</span></div>
          <div class="fl-io hs" data-t="out-point"><span>⇤</span><span class="tc">01:00:00:00</span></div>
          <div class="fl-io hs" data-t="duration"><span>◷</span><span class="tc">00:00:00:00</span></div>
          <div class="fl-track hs" data-t="track">
            <div class="r1"><span class="badge a hs" data-t="track-destination">A1</span><b>Audio 1</b></div>
            <div class="r2"><span class="fv hs" data-t="fader">0.0</span><span class="ib hs" data-t="track-lock">⊠</span>
              <span class="ib hs" data-t="record-voiceover">R</span><span class="ib hs" data-t="solo">S</span><span class="ib hs" data-t="mute">M</span></div>
            <div class="mm"><i></i><i></i></div>
          </div>
          <div class="fl-track hs" data-t="main-bus">
            <div class="r1"><span class="badge b">B1</span><b>Bus 1</b></div>
            <div class="r2"><span class="fv hs" data-t="fader">0.0</span><span class="sp"></span><span class="ib hs" data-t="mute">M</span></div>
            <div class="mm"><i></i><i></i></div>
          </div>
        </div>
        <div class="fl-tl">
          <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0">
            ${["01:00:00:00","01:00:18:00","01:00:36:00","01:00:54:00","01:01:12:00","01:01:30:00","01:01:48:00","01:02:06:00","01:02:24:00","01:02:42:00"]
              .map((t) => `<div class="tk"><span>${t}</span></div>`).join("")}
          </div>
          <div class="tl-tracks" style="background:var(--rs-pane)">
            <div class="tl-play" style="left:0"></div>
            <div class="tl-row" style="height:74px"><div class="tl-lane" style="background:none;align-items:flex-start;padding-top:6px">
              <div class="clip a fl hs" data-t="waveform-editing" style="width:17%"><span class="wf"></span><span class="cn">dreamina-2026-0…shot, 30….mp4</span></div></div></div>
            <div class="tl-row" style="height:74px"><div class="tl-lane" style="background:none"></div></div>
          </div>
        </div>
        <div class="pane mixer hs" data-t="mixer" style="width:256px;flex-shrink:0">
          <div class="pane-h"><b>Mixer</b><span class="sp"></span><span>…</span></div>
          <div class="mx">
            <div class="mx-lbl"><span></span><span>Input</span><span>Track FX</span><span>Order</span></div>
            ${[["A1","Audio 1","a"],["Bus1","Bus 1","b"]].map(([n, nm, k]) => `
            <div class="mx-col hs" data-t="${k === "b" ? "main-bus" : "channel-strip"}">
              <span class="mx-h">${n}</span>
              <span class="mx-box hs" data-t="patch-input-output">${k === "b" ? "" : "No Input"}</span>
              <span class="mx-box hs" data-t="dialogue-leveler">${k === "b" ? "" : "Dial Lev"}</span>
              <span class="mx-box hs" data-t="eq"><b class="fx">FX</b> <b class="dy">DY</b> <b class="eq">EQ</b></span>
              <span class="mx-name hs" data-t="track">${nm}</span>
              <span class="mx-rsm">${k === "b" ? '<i class="hs" data-t="mute">M</i>' : '<i class="hs" data-t="record-voiceover">R</i><i class="hs" data-t="solo">S</i><i class="hs" data-t="mute">M</i>'}</span>
              <span class="mx-pan hs" data-t="pan">⌒</span>
              <span class="mx-fv">0.0</span>
              <div class="mx-fader hs" data-t="fader"><div class="fs"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>30</span><span>40</span><span>50</span></div><i></i></div>
            </div>`).join("")}
          </div>
        </div>
      </div>
    </div>
    ${H.PAGES("fairlight")}
  </div>`;

  /* ═══════════ DELIVER ═══════════ */
  const RS = (id, lb, val, kind) => `
    <div class="rs-set hs" data-t="${id}"><span class="lb">${lb}</span>
      ${kind === "dd" ? `<b class="val dd">${val} ⌄</b>` : kind === "cb" ? `<span class="cb">☐</span><span>${val}</span>` : `<b class="val">${val}</b>`}</div>`;

  S.deliver = () => `
  <div class="rs" data-page="deliver">
    ${H.MENU()}
    ${H.TOOLS(
      `<span class="tg hs" data-t="panel-toggle">⌄</span>
       ${H.TG("render-settings", "⚙", "Render Settings", true)}
       ${H.TG("tape", "▭", "Tape")}
       ${H.TG("clips-panel", "▥", "Clips ⌄")}`,
      `${H.TG("render-queue", "▤", "Render Queue", true)}
       <span class="tg hs" data-t="viewer-mode">▭</span>`, false)}
    <div class="rs-body"><div class="rs-top">
      <div class="pane hs" data-t="render-settings" style="width:33%;flex-shrink:0">
        <div class="pane-h"><b>Render Settings - Custom Export</b><span class="sp"></span><span>…</span></div>
        <div class="pane-b dl">
          <div class="rs-set hs" data-t="render-presets"><span class="lb">Preset</span><b class="val dd big">◉ Custom Export ⌄</b></div>
          <div class="rs-set hs" data-t="deliverable"><span class="lb">File Name</span><b class="val in">Untitled <span class="sp"></span>+</b></div>
          <div class="rs-set hs" data-t="deliverable"><span class="lb">Location</span><b class="val in">D:\\0110tusul\\06_export</b><span class="btn hs" data-t="deliverable">Browse</span></div>
          <div class="rs-set hs" data-t="single-clip"><span class="lb">Render</span><span class="rad on">●</span> Single clip <span class="rad hs" data-t="individual-clips">○</span> Individual clips</div>
          <div class="insp-tabs three"><div class="act">Video</div><div class="hs" data-t="audio-codec">Audio</div><div class="hs" data-t="deliverable">File</div></div>
          <div class="rs-set hs" data-t="deliverable"><span class="cb on">☑</span> Export Video</div>
          ${RS("format", "Format", "MP4", "dd")}
          ${RS("codec", "Codec", "H.265", "dd")}
          ${RS("encoder", "Encoder", "Auto", "dd")}
          ${RS("network-optimization", "", "Network Optimization", "cb")}
          ${RS("resolution-render", "Resolution", "Timeline Resolution", "dd")}
          <div class="rs-set hs" data-t="resolution-render"><span class="lb"></span><b class="val in dim">3840</b> × <b class="val in dim">2160</b></div>
          ${RS("vertical-video", "", "Use vertical resolution", "cb")}
          ${RS("frame-rate-render", "Frame rate", "Timeline Frame Rate", "dd")}
          <div class="rs-set hs" data-t="frame-rate-render"><span class="lb"></span><span class="dimtxt">24 frames per second</span></div>
          ${RS("chapters-from-markers", "", "Chapters from Markers", "cb")}
          ${RS("encoding-profile", "Encoding Profile", "Main", "dd")}
          <div class="rs-set hs" data-t="key-frames-codec"><span class="lb">Key Frames</span><span class="rad on">●</span> Automatic</div>
        </div>
        <div class="dl-foot hs" data-t="estimated-file-size">
          <span>Estimated File Size</span><b>376 MB</b><span class="sp"></span>
          <span class="btn wide hs" data-t="add-to-render-queue">Add to Render Queue</span>
        </div>
      </div>
      <div class="pane vw hs" data-t="timeline-viewer" style="flex:1">
        <div class="rs-row2" style="border-top:0">
          <span class="hs" data-t="zoom-slider">14% ⌄</span><span class="hs" data-t="viewer-mode">▭</span>
          <span class="sp"></span>
          <b class="hs" data-t="timeline">${H.TIMELINE} ⌄</b><span class="tc hs" data-t="timecode">00:00:00:00 ⌄</span>
          <span class="hs" data-t="viewer-mode">▭ ⌄</span><span class="hs" data-t="reset">⟲</span><span>…</span>
        </div>
        <div class="dl-inout hs" data-t="in-point">
          <span>IN</span><b class="tc">01:00:00:00</b><span>OUT</span><b class="tc hs" data-t="out-point">01:00:30:00</b>
          <span class="sp"></span><span>DURATION</span><b class="tc hs" data-t="duration">00:00:30:01</b>
        </div>
        <div class="pane-b" style="display:flex;flex-direction:column;flex:1">
          <div class="vw-screen dark"><div class="img" style="width:70%"></div></div>
          <div class="vw-foot">
            <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
            ${H.TRANSPORT("", '<span class="tc hs" data-t="timecode">01:00:00:00</span><span class="hs" data-t="mute">🔈</span><span class="sp"></span>')}
          </div>
          <div class="cl-strip hs" data-t="clips-panel" style="border-top:1px solid var(--rs-line)">
            <span class="cbadge hs" data-t="thumbnail-timeline">01</span><span class="hs" data-t="track" style="margin-left:80px">V1</span>
            <div class="cl-thumb csel hs" data-t="clip"><span class="cap">H.264 High L5.0</span></div>
          </div>
          <div class="rs-tlbar hs" data-t="render-in-place" style="border-bottom:0">
            <span class="tl hs" data-t="timeline-menu">⚌</span><span class="sp"></span>
            <span class="hs" data-t="single-clip">Render</span><b class="val dd hs" data-t="single-clip">Entire Timeline ⌄</b>
            <span class="zoom hs" data-t="zoom-slider">−<span class="zb"></span>+</span><span class="sp"></span>
            <span class="tl hs" data-t="mute">♫</span>
          </div>
          <div class="rs-tl" style="height:150px;flex-shrink:0">
            <div class="tl-ruler narrow hs" data-t="timeline-ruler" style="padding-left:0">
              <div class="tl-bigtc hs" data-t="timecode">01:00:00:00</div>
              <div class="tk"><span>01:00:00:00</span></div><div class="tk"><span>01:00:08:00</span></div>
              <div class="tk"><span>01:00:16:00</span></div><div class="tk"><span>01:00:24:00</span></div><div class="tk"><span>01:00:32</span></div>
            </div>
            <div class="tl-tracks">
              <div class="tl-play" style="left:318px"></div>
              <div class="tl-row" style="height:52px"><div class="tl-head wide hs" data-t="track"><span class="badge v">V1</span><span class="ib hs" data-t="video-track-enable">▣</span></div>
                <div class="tl-lane"><div class="clip v thumbs hs" data-t="clip" style="width:92%"><span class="cn">${H.CLIP} &nbsp;30:01</span></div></div></div>
              <div class="tl-row aud" style="height:52px"><div class="tl-head wide hs" data-t="track"><span class="badge a">A1</span><span class="ib hs" data-t="solo">S</span><span class="ib hs" data-t="mute">M</span><span class="ib hs" data-t="stereo" style="font-size:8px">2.0</span></div>
                <div class="tl-lane"><div class="clip a hs" data-t="clip" style="width:92%"><span class="wf"></span><span class="cn">${H.CLIP} &nbsp;30:01</span></div></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="pane hs" data-t="render-queue" style="width:23%;flex-shrink:0">
        <div class="pane-h"><b>Render Queue</b><span class="sp"></span><span>…</span></div>
        <div class="pane-b rq">
          <div class="job hs" data-t="render-queue">
            <div class="jh">⋮ <b>Job 1</b><span class="ok">Completed in 00:00:03</span><span class="sp"></span>✎ ✕</div>
            <div class="jb"><div class="jt"></div><div><b>${H.PROJECT} | COCKPIT_ASSEMBLY_v1</b><small>…ad_Previz\\out\\preview\\cockpit_v3_15s.mp4</small></div></div>
          </div>
          <div class="job hs" data-t="render-queue">
            <div class="jh">⋮ <b>Job 2</b><span class="ok">Completed in 00:00:11</span><span class="sp"></span>✎ ✕</div>
            <div class="jb"><div class="jt"></div><div><b>${H.PROJECT} | ${H.TIMELINE}</b><small>…usul\\06_export\\${H.TIMELINE}_4K.mp4</small></div></div>
          </div>
        </div>
        <div class="dl-foot" style="justify-content:flex-end"><span class="btn wide hs" data-t="render-all">Render All</span></div>
      </div>
    </div></div>
    ${H.PAGES("deliver")}
  </div>`;

})(window.RM);
