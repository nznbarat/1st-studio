/* ═════════════════════════════════════════════════════════════
   51 · Fusion, Color, Fairlight, Deliver хуудас
   Байрлал бүрийг хэрэглэгчийн бодит Resolve Studio 21-ийн
   дэлгэцээс (2026-09-18) уншиж барьсан.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";
  const S = RM.sim, H = S._h;

  /* ═══════════ FUSION ═══════════ */
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
      <b class="hs" data-t="bin">S…</b><span class="hs" data-t="thumbnail-view">▦ ⌄</span><span class="hs" data-t="help-search">⌕</span><span>⇅ …</span>
      <span class="hs" data-t="zoom-slider">100% ⌄</span><span class="hs" data-t="viewer-mode">▣ ⌄ ▭ ⌄</span>
      <span class="sp"></span>
      <span class="hs" data-t="viewer-mode">▭ …</span><span class="hs" data-t="zoom-slider">Fit ⌄</span>
      <span class="hs" data-t="viewer-mode">▣ ⌄ ▭ ⌄</span>
      <b class="hs" data-t="mediaout">MediaOut1</b><span class="hs" data-t="viewer-mode">▭ ⌄</span><span>D…</span>
    </div>
    <div class="rs-body"><div class="fu-split">
      <div class="fu-left">
        <div class="rs-top">
          <div class="pane hs" data-t="bin" style="width:178px;flex-shrink:0">
            <div class="pane-b">${H.BINS(H.BIN_LIST.slice(1), "Seedance")}</div>
          </div>
          <div class="pane hs" data-t="media-pool" style="width:340px;flex-shrink:0">
            <div class="pane-h hs" data-t="bin"><span>Master / Seedance</span></div>
            <div class="pane-b">${H.THUMBS(2)}</div>
          </div>
          <div class="pane vw hs" data-t="viewer-1-2">
            <div class="pane-b" style="display:flex;flex-direction:column">
              <div class="vw-screen dark"><span class="vw-info hs" data-t="resolution">[Main]: 3840x2160 float32</span><div class="img"></div></div>
              <div class="vw-foot">
                <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0">
                  <div class="tk"><span>0</span></div><div class="tk"><span>100</span></div><div class="tk"><span>200</span></div>
                  <div class="tk"><span>300</span></div><div class="tk"><span>400</span></div><div class="tk"><span>500</span></div>
                  <div class="tk"><span>600</span></div><div class="tk"><span>700</span></div></div>
                <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
                ${H.TRANSPORT("0.0", '<span class="tc hs" data-t="timecode">0.0</span><span class="tc hs" data-t="duration">720.0</span><span class="hs" data-t="mute">🔈</span><span class="sp"></span>')}
              </div>
            </div>
          </div>
        </div>
        <div class="fu-tools hs" data-t="show-toolbar">
          <span class="ft hs" data-t="background-node" title="Background">▦</span><span class="ft hs" data-t="mediain" title="MediaIn">▣</span>
          <span class="ft hs" data-t="text-plus-node" title="Text+">T</span><span class="ft hs" data-t="paint" title="Paint">✎</span>
          <span class="div"></span>
          <span class="ft hs" data-t="particle-emitter" title="Particles">∵</span><span class="ft hs" data-t="displace" title="Displace">≋</span>
          <span class="ft hs" data-t="brightness-contrast" title="Brightness/Contrast">◑</span><span class="ft hs" data-t="color-corrector-fusion" title="Color Corrector">◍</span>
          <span class="div"></span>
          <span class="ft hs" data-t="merge" title="Merge">⊕</span><span class="ft hs" data-t="transform-fusion" title="Transform">⊹</span>
          <span class="ft hs" data-t="blur-fusion" title="Blur">◌</span><span class="ft hs" data-t="glow" title="Glow">✸</span><span class="ft hs" data-t="defocus" title="Defocus">◉</span>
          <span class="div"></span>
          <span class="ft hs" data-t="rectangle-mask" title="Rectangle">▭</span><span class="ft hs" data-t="ellipse-mask" title="Ellipse">◯</span>
          <span class="ft hs" data-t="polygon-mask" title="Polygon">⬠</span><span class="ft hs" data-t="b-spline-mask" title="B-Spline">⌒</span><span class="ft hs" data-t="matte-control" title="Matte Control">◪</span>
          <span class="div"></span>
          <span class="ft hs" data-t="tracker" title="Tracker">⊹</span><span class="ft hs" data-t="planar-tracker" title="Planar Tracker">▱</span><span class="ft hs" data-t="delta-keyer" title="Delta Keyer">◈</span>
          <span class="div"></span>
          <span class="ft hs" data-t="shape-3d" title="Shape 3D">⬢</span><span class="ft hs" data-t="camera-3d" title="Camera 3D">⬡</span><span class="ft hs" data-t="renderer-3d" title="Renderer 3D">⬣</span>
        </div>
        <div class="pane hs" data-t="node-graph" style="flex:1;min-height:0;border-top:1px solid var(--rs-line)">
          <div class="pane-h"><b>Nodes</b><span class="sp"></span><span class="hs" data-t="node-label">⋯</span></div>
          <div class="pane-b"><div class="node-canvas">
            <div class="wire y" style="left:172px;top:40px;width:calc(100% - 340px)"></div>
            <div class="node sel hs" data-t="mediain" style="left:66px;top:28px;width:160px"><span class="nl">${H.CLIP_SHORT}</span></div>
            <div class="node hs" data-t="mediaout" style="right:70px;top:28px;width:150px"><span class="nl">MediaOut1</span></div>
          </div></div>
        </div>
        <div class="rs-status hs" data-t="pixel-readout">
          <span class="hs" data-t="position-viewer">Position&nbsp; X 0.94512&nbsp; 2422&nbsp;&nbsp; Y −0.33804&nbsp; −483</span>
          <span class="hs" data-t="canvas-rgba">Canvas&nbsp; R 0&nbsp;&nbsp; G 0&nbsp;&nbsp; B 0&nbsp;&nbsp; A 0</span>
          <span class="sp"></span><span class="hs" data-t="render-cache">10% — 3178 MB</span>
        </div>
      </div>
      <div class="pane insp hs" data-t="inspector-fusion" style="width:270px">
        <div class="pane-h"><b>Inspector</b><span class="sp"></span><span>▭ ⋯</span></div>
        <div class="insp-tabs"><div class="act">Tools</div><div>Modifiers</div></div>
        <div class="pane-b">
          <div class="insp-sec hs" data-t="mediain">
            <div class="t"><span class="tog on"></span> MediaIn1: ${H.CLIP_SHORT} <span class="sp"></span><span class="mini">● ⌄ ▭ ⊠ ⟲</span></div>
            <div class="insp-row hs" data-t="clip"><span class="lb">Clip Name</span><b class="val">dreamina-2026-09-17-3642-Photor</b></div>
          </div>
          <div class="insp-tabs three"><div class="act">▨<br>Image</div><div>♫<br>Audio</div><div>⚙<br>Settings</div></div>
          <div class="insp-sec">
            <div class="insp-row hs" data-t="clip"><span class="lb">Process Mode</span><b class="val dd">Full Frames ⌄</b></div>
            <div class="insp-row hs" data-t="media-pool"><span class="lb">Media Source</span><b class="val dd">Timeline ⌄</b></div>
            <div class="insp-row hs" data-t="layer-node"><span class="lb">Layer</span><b class="val dd">0 ⌄</b></div>
          </div>
          <div class="insp-sec hs" data-t="input-color-space"><div class="t">› Source Color Space</div></div>
          <div class="insp-sec hs" data-t="gamma"><div class="t">› Source Gamma Space</div></div>
        </div>
      </div>
    </div></div>
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
      <span class="hs" data-t="zoom-slider">9% ⌄</span><span class="hs" data-t="viewer-mode">▭ ▦ ▭ ▭</span>
      <span class="sp"></span>
      <b class="hs" data-t="timeline">SE…0s ⌄</b><span class="tc hs" data-t="timecode">00:00:00:00 ⌄</span>
      <span class="hs" data-t="viewer-mode">▭ ⌄ ▦ ⌄ ⚙ ⌄</span><span class="hs" data-t="reset">⟲</span><span class="hs" data-t="full-screen-window">⛶</span><span>…</span>
      <span class="hs" data-t="selection-mode">↖ ⌄</span><span class="hs" data-t="node-editor">⚌ ⌄</span>
      <b class="hs" data-t="corrector-node">Clip ⌄</b>
      <span class="hs" data-t="node-editor">⬡ ⌄</span><span>…</span>
      <span class="sp"></span>
      <span class="hs" data-t="openfx">Library</span><b class="hs" data-t="openfx" style="border-bottom:2px solid var(--rs-red);padding-bottom:2px">Settings</b>
      <span class="hs" data-t="help-search">⌕</span><span>…</span>
    </div>
    <div class="rs-body">
      <div class="cl-top">
        <div class="pane vw hs" data-t="viewer" style="flex:0 0 49%">
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
        <div class="cl-thumb sel hs" data-t="grade"><span class="cap">H.264 High L5.0</span></div>
      </div>

      <div class="pal-rail hs" data-t="primaries">
        <span class="pi hs" data-t="camera-raw" title="Camera Raw">◉</span><span class="pi hs" data-t="shot-match" title="Color Match">▦</span>
        <span class="pi act hs" data-t="color-wheels" title="Color Wheels">◑</span><span class="pi hs" data-t="hdr-palette" title="HDR">✸</span>
        <span class="pi hs" data-t="splitter-combiner" title="RGB Mixer">⁂</span><span class="pi hs" data-t="motion-effects" title="Motion Effects">⧗</span>
        <span class="pi hs" data-t="curves" title="Curves">∿</span><span class="pi hs" data-t="color-warper" title="Color Warper">⬚</span>
        <span class="pi hs" data-t="qualifier" title="Qualifier">◌</span><span class="pi hs" data-t="power-window" title="Windows">▭</span>
        <span class="pi hs" data-t="window-tracker" title="Tracker">⊹</span><span class="pi hs" data-t="magic-mask" title="Magic Mask">✦</span>
        <span class="pi hs" data-t="blur-sharpen-mist" title="Blur">◍</span><span class="pi hs" data-t="matte" title="Key">◪</span>
        <span class="pi hs" data-t="node-sizing" title="Sizing">⤢</span><span class="pi hs" data-t="switch-eye-to" title="Stereo 3D">3D</span>
        <span class="sp"></span>
        <span class="pi hs" data-t="keyframe-editor" title="Keyframes">◆</span><span class="pi hs" data-t="scopes" title="Scopes">∿</span><span class="pi hs" data-t="metadata" title="Info">ⓘ</span>
      </div>

      <div class="cl-bottom">
        <div class="pane" style="flex:0 0 49%">
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
        <div class="pane scopes hs" data-t="scopes" style="flex:1">
          <div class="pane-h"><b>Scopes</b><span class="sp"></span>
            <b class="hs" data-t="parade">Parade ⌄</b><span class="hs" data-t="scopes">⚌ ⛶ …</span></div>
          <div class="pane-b" style="display:flex">
            <div class="scope-scale">${["1023","896","768","640","512","384","256","128","0"].map((v) => `<span>${v}</span>`).join("")}</div>
            <div class="scope-box parade hs" data-t="parade"><div class="grid"></div><div class="tr r"></div><div class="tr g"></div><div class="tr b"></div></div>
          </div>
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
            <div class="cl-thumb sel hs" data-t="clip"><span class="cap">H.264 High L5.0</span></div>
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
