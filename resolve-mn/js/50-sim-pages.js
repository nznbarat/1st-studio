/* ═════════════════════════════════════════════════════════════
   50 · Resolve интерфейсийн хуулбар — хуудас бүрийн бүтэц

   Товших боломжтой хэсэг бүр  class="hs" data-t="<толины id>"
   гэсэн тэмдэглэгээтэй. Тайлбарыг RM.dict.byId-аас шууд авна —
   давхардуулж бичихгүй.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const S = (RM.sim = RM.sim || {});

  /* ── дахин давтагддаг хэсгүүд ── */

  const MENU = (extra) => `
    <div class="rs-menu">
      <span class="logo">DaVinci Resolve</span>
      <span class="mi hs" data-t="file-menu">File</span>
      <span class="mi hs" data-t="edit-menu">Edit</span>
      <span class="mi hs" data-t="trim-menu">Trim</span>
      <span class="mi hs" data-t="timeline-menu">Timeline</span>
      <span class="mi hs" data-t="clip-menu">Clip</span>
      <span class="mi hs" data-t="mark-menu">Mark</span>
      <span class="mi hs" data-t="view-menu">View</span>
      <span class="mi hs" data-t="playback-menu">Playback</span>
      <span class="mi hs" data-t="fusion-page">Fusion</span>
      <span class="mi hs" data-t="color-page">Color</span>
      <span class="mi hs" data-t="fairlight-page">Fairlight</span>
      <span class="mi hs" data-t="workspace-menu">Workspace</span>
      <span class="mi hs" data-t="help-menu">Help</span>
    </div>`;

  const PAGES = (active) => {
    /* Дараалал ба шошгогүй харагдацыг хэрэглэгчийн Resolve Studio 21-ийн
       дэлгэцээс шалгаж баталсан: Photo нь Media, Cut хоёрын хооронд байрлана. */
    const list = [
      ["media",     "▤", "Media",     "media-page"],
      ["photo",     "▨", "Photo",     "photo-page"],
      ["cut",       "◨", "Cut",       "cut-page"],
      ["edit",      "✂", "Edit",      "edit-page"],
      ["fusion",    "✧", "Fusion",    "fusion-page"],
      ["color",     "◐", "Color",     "color-page"],
      ["fairlight", "♪", "Fairlight", "fairlight-page"],
      ["deliver",   "➚", "Deliver",   "deliver-page"]
    ];
    return `
    <div class="rs-pages hs" data-t="page-bar">
      <span class="rs-brand">◈ DaVinci Resolve Studio 21</span>
      ${list.map(([id, ic, nm, term]) => `
        <span class="pg hs ${id === active ? "act" : ""} ${id === "photo" ? "new" : ""}"
              data-t="${term}" data-go="${id}" title="${nm}">
          <span class="ic">${ic}</span>
        </span>`).join("")}
      <span class="right">
        <span class="rb hs" data-t="project-manager" title="Project Manager">⌂</span>
        <span class="rb hs" data-t="project-settings" title="Project Settings">⚙</span>
      </span>
    </div>`;
  };

  const VIEWER = (title, termId, warm, tc) => `
    <div class="pane vw hs" data-t="${termId}">
      <div class="pane-h"><b>${title}</b><span class="sp"></span>
        <span class="hs" data-t="viewer-mode">◱</span></div>
      <div class="pane-b" style="display:flex;flex-direction:column">
        <div class="vw-screen"><div class="img ${warm ? "warm" : ""}"></div></div>
        <div class="vw-foot">
          <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
          <div class="vw-ctrl hs" data-t="transport-controls">
            <span class="tc hs" data-t="timecode">${tc}</span>
            <span class="mk hs" data-t="in-point">[</span>
            <span>◀◀</span><span>◀</span><span style="font-size:14px">▶</span><span>▶</span><span>▶▶</span>
            <span class="mk hs" data-t="out-point">]</span>
            <span class="mk hs" data-t="marker">⚑</span>
          </div>
        </div>
      </div>
    </div>`;

  const MEDIAPOOL = () => `
    <div class="pane mp hs" data-t="media-pool">
      <div class="pane-h"><b>Media Pool</b><span class="sp"></span>
        <span class="hs" data-t="thumbnail-view">▦</span>
        <span class="hs" data-t="list-view">☰</span>
        <span class="hs" data-t="metadata">ⓘ</span></div>
      <div class="pane-b"><div class="mp-split">
        <div class="mp-bins">
          <div class="mp-bin act hs" data-t="bin">▾ Master</div>
          <div class="mp-bin hs" data-t="bin">&nbsp;&nbsp;▪ Видео</div>
          <div class="mp-bin hs" data-t="bin">&nbsp;&nbsp;▪ Дуу</div>
          <div class="mp-bin hs" data-t="smart-bin">&nbsp;&nbsp;✦ Ухаалаг</div>
          <div class="mp-bin hs" data-t="power-bin">&nbsp;&nbsp;⚡ Power</div>
        </div>
        <div class="mp-grid">
          <div class="mp-clip hs"   data-t="clip" data-n="A001"></div>
          <div class="mp-clip hs"   data-t="clip" data-n="A002"></div>
          <div class="mp-clip b hs" data-t="clip" data-n="B001"></div>
          <div class="mp-clip hs"   data-t="clip" data-n="A003"></div>
          <div class="mp-clip a hs" data-t="audio-waveform" data-n="Дуу"></div>
          <div class="mp-clip b hs" data-t="clip" data-n="B002"></div>
        </div>
      </div></div>
    </div>`;

  /* ═══════════ EDIT ═══════════ */

  S.edit = () => `
  <div class="rs" data-page="edit">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg act hs" data-t="media-pool"><span class="ic">▤</span>Media Pool</span>
      <span class="tg hs" data-t="effects-library"><span class="ic">✦</span>Effects</span>
      <span class="tg hs" data-t="edit-index"><span class="ic">≣</span>Edit Index</span>
      <span class="tg hs" data-t="sound-library"><span class="ic">♫</span>Sound Library</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="mixer"><span class="ic">⇅</span>Mixer</span>
      <span class="tg hs" data-t="metadata"><span class="ic">ⓘ</span>Metadata</span>
      <span class="tg act hs" data-t="inspector"><span class="ic">◧</span>Inspector</span>
    </div>

    <div class="rs-body">
      <div class="rs-top">
        ${MEDIAPOOL()}
        ${VIEWER("Source", "source-viewer", false, "01:00:04:12")}
        ${VIEWER("Timeline", "timeline-viewer", true, "01:00:12:08")}
        <div class="pane insp hs" data-t="inspector">
          <div class="pane-h"><b>Inspector</b></div>
          <div class="pane-b">
            <div class="insp-tabs">
              <div class="act">Video</div><div>Audio</div><div>Effects</div><div>File</div>
            </div>
            <div class="insp-sec hs" data-t="transform">
              <div class="t">▾ Transform</div>
              <div class="insp-row hs" data-t="zoom"><span class="lb">Zoom</span>
                <span class="sl" style="--p:50%"></span><span class="vl">1.000</span></div>
              <div class="insp-row hs" data-t="position"><span class="lb">Position</span>
                <span class="sl" style="--p:50%"></span><span class="vl">0.00</span></div>
              <div class="insp-row hs" data-t="rotation-angle"><span class="lb">Rotation</span>
                <span class="sl" style="--p:50%"></span><span class="vl">0.00</span></div>
              <div class="insp-row hs" data-t="anchor-point"><span class="lb">Anchor</span>
                <span class="sl" style="--p:50%"></span><span class="vl">0.00</span></div>
            </div>
            <div class="insp-sec hs" data-t="crop">
              <div class="t">▾ Cropping</div>
              <div class="insp-row hs" data-t="softness"><span class="lb">Softness</span>
                <span class="sl" style="--p:12%"></span><span class="vl">0.00</span></div>
            </div>
            <div class="insp-sec hs" data-t="dynamic-zoom"><div class="t">▸ Dynamic Zoom</div></div>
            <div class="insp-sec hs" data-t="composite-mode">
              <div class="t">▾ Composite</div>
              <div class="insp-row hs" data-t="opacity"><span class="lb">Opacity</span>
                <span class="sl" style="--p:100%"></span><span class="vl">100</span></div>
            </div>
            <div class="insp-sec hs" data-t="speed-change"><div class="t">▸ Speed Change</div></div>
            <div class="insp-sec hs" data-t="stabilization"><div class="t">▸ Stabilization</div></div>
          </div>
        </div>
      </div>

      <div class="rs-tlbar hs" data-t="toolbar-timeline">
        <span class="tl hs" data-t="timeline-menu">≡</span>
        <span class="div"></span>
        <span class="tl act hs" data-t="selection-mode">↖</span>
        <span class="tl hs" data-t="trim-edit-mode">⇹</span>
        <span class="tl hs" data-t="dynamic-trim">⧎</span>
        <span class="tl hs" data-t="blade">✂</span>
        <span class="div"></span>
        <span class="tl act hs" data-t="snapping">∩</span>
        <span class="tl act hs" data-t="linked-selection">∞</span>
        <span class="tl hs" data-t="sync-lock">⇵</span>
        <span class="div"></span>
        <span class="tl hs" data-t="flag">⚑</span>
        <span class="tl hs" data-t="marker">◆</span>
        <span class="tl hs" data-t="clip-color">◑</span>
        <span class="sp"></span>
        <span class="zoom hs" data-t="zoom-slider">−<span class="zb"></span>+</span>
        <span class="tl hs" data-t="timeline-view-options">⚙</span>
      </div>

      <div class="rs-tl">
        <div class="tl-ruler hs" data-t="timeline-ruler">
          <div class="tk"><span>01:00:00:00</span></div><div class="tk"><span>10:00</span></div>
          <div class="tk"><span>20:00</span></div><div class="tk"><span>30:00</span></div>
          <div class="tk"><span>40:00</span></div><div class="tk"><span>50:00</span></div>
        </div>
        <div class="tl-tracks">
          <div class="tl-play"></div>
          <div class="tl-row">
            <div class="tl-head hs" data-t="track">
              <span class="nm">V2</span>
              <span class="ib hs" data-t="track-destination">◧</span>
              <span class="ib on hs" data-t="auto-select">◎</span>
              <span class="ib hs" data-t="track-lock">⊠</span>
            </div>
            <div class="tl-lane">
              <div style="width:88px"></div>
              <div class="clip v hs" data-t="titles" style="width:110px"><span class="cn">Гарчиг</span></div>
              <div style="width:60px"></div>
              <div class="clip v hs" data-t="adjustment-clip" style="width:130px"><span class="cn">Adjustment</span></div>
            </div>
          </div>
          <div class="tl-row">
            <div class="tl-head hs" data-t="track">
              <span class="nm">V1</span>
              <span class="ib hs" data-t="track-destination">◧</span>
              <span class="ib on hs" data-t="auto-select">◎</span>
              <span class="ib hs" data-t="track-lock">⊠</span>
            </div>
            <div class="tl-lane">
              <div class="clip v hs" data-t="clip" style="width:120px"><span class="cn">A001</span>
                <span class="hs" data-t="video-fade-handle"
                      style="position:absolute;top:1px;left:1px;width:7px;height:7px;border-radius:50%;background:#cfd8de"></span></div>
              <div class="clip v sel hs" data-t="clip" style="width:150px"><span class="cn">A002 — сонгосон</span></div>
              <div class="gap hs" data-t="gap"></div>
              <div class="clip v hs" data-t="compound-clip" style="width:105px"><span class="cn">Нийлмэл</span></div>
              <div class="clip v hs" data-t="clip" style="width:96px"><span class="cn">B001</span></div>
            </div>
          </div>
          <div class="tl-row aud">
            <div class="tl-head hs" data-t="track">
              <span class="nm">A1</span>
              <span class="ib hs" data-t="mute">M</span>
              <span class="ib hs" data-t="solo">S</span>
              <span class="ib hs" data-t="track-lock">⊠</span>
            </div>
            <div class="tl-lane">
              <div class="clip a hs" data-t="clip" style="width:272px"><span class="cn">Яриа</span><span class="wf"></span></div>
              <div class="clip a hs" data-t="crossfade" style="width:205px"><span class="cn">Орчны дуу</span><span class="wf"></span></div>
            </div>
          </div>
          <div class="tl-row aud">
            <div class="tl-head hs" data-t="track">
              <span class="nm">A2</span>
              <span class="ib hs" data-t="mute">M</span>
              <span class="ib hs" data-t="solo">S</span>
              <span class="ib hs" data-t="track-lock">⊠</span>
            </div>
            <div class="tl-lane">
              <div class="clip a hs" data-t="clip" style="width:430px"><span class="cn">Хөгжим</span><span class="wf"></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${PAGES("edit")}
  </div>`;

  /* ═══════════ COLOR ═══════════ */

  S.color = () => `
  <div class="rs" data-page="color">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg act hs" data-t="gallery"><span class="ic">▨</span>Gallery</span>
      <span class="tg hs" data-t="lut-browser"><span class="ic">▩</span>LUTs</span>
      <span class="tg hs" data-t="media-pool"><span class="ic">▤</span>Media Pool</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="lightbox"><span class="ic">▦</span>Lightbox</span>
      <span class="tg hs" data-t="scopes"><span class="ic">◲</span>Scopes</span>
      <span class="tg hs" data-t="openfx"><span class="ic">✦</span>OpenFX</span>
      <span class="tg act hs" data-t="node-editor"><span class="ic">⬡</span>Nodes</span>
    </div>

    <div class="rs-body">
      <div class="cl-top">
        <div class="pane gal hs" data-t="gallery">
          <div class="pane-h"><b>Gallery</b></div>
          <div class="pane-b"><div class="gal-grid">
            <div class="gal-still hs" data-t="still"></div>
            <div class="gal-still s2 hs" data-t="still"></div>
            <div class="gal-still s3 hs" data-t="still"></div>
            <div class="gal-still hs" data-t="apply-grade"></div>
          </div></div>
        </div>

        ${VIEWER("Viewer", "viewer", true, "01:00:12:08")}

        <div class="pane nodes hs" data-t="node-editor">
          <div class="pane-h"><b>Nodes</b><span class="sp"></span>
            <span class="hs" data-t="node-label">⌨</span></div>
          <div class="pane-b"><div class="node-canvas">
            <div class="wire" style="left:70px;top:46px;width:36px"></div>
            <div class="wire" style="left:164px;top:46px;width:36px"></div>
            <div class="node on hs" data-t="corrector-node" style="left:12px;top:25px">
              <span class="thumb"></span><span class="lbl">01 Тэнцвэр</span></div>
            <div class="node hs" data-t="serial-node" style="left:106px;top:25px">
              <span class="thumb"></span><span class="lbl">02 Ялгарал</span></div>
            <div class="node hs" data-t="parallel-node" style="left:200px;top:25px">
              <span class="thumb"></span><span class="lbl">03 Арьс</span></div>
            <div class="node hs" data-t="layer-node" style="left:106px;top:106px">
              <span class="thumb"></span><span class="lbl">04 Төрх</span></div>
            <div class="node hs" data-t="source-node" style="left:200px;top:106px">
              <span class="thumb"></span><span class="lbl">05 Вингет</span></div>
          </div></div>
        </div>
      </div>

      <div class="cl-strip hs" data-t="clips-panel">
        <div class="cl-thumb hs" data-t="thumbnail-timeline"><span>01</span></div>
        <div class="cl-thumb act hs" data-t="grade"><span>02 ●</span></div>
        <div class="cl-thumb hs" data-t="thumbnail-timeline"><span>03 ●</span></div>
        <div class="cl-thumb hs" data-t="version"><span>04</span></div>
        <div class="cl-thumb hs" data-t="shot-match"><span>05</span></div>
        <div class="cl-thumb hs" data-t="thumbnail-timeline"><span>06</span></div>
        <div class="cl-thumb hs" data-t="mini-timeline" style="flex:1;min-width:60px"><span>Бяцхан timeline</span></div>
      </div>

      <div class="cl-bottom">
        <div class="pane" style="flex:1">
          <div class="pal-rail hs" data-t="primaries">
            <span class="pi hs" data-t="camera-raw" title="Camera Raw">◉</span>
            <span class="pi act hs" data-t="color-wheels" title="Color Wheels">◑</span>
            <span class="pi hs" data-t="color-warper" title="Color Warper">⬚</span>
            <span class="pi hs" data-t="curves" title="Curves">∿</span>
            <span class="pi hs" data-t="qualifier" title="Qualifier">◌</span>
            <span class="pi hs" data-t="power-window" title="Windows">▭</span>
            <span class="pi hs" data-t="window-tracker" title="Tracker">⊹</span>
            <span class="pi hs" data-t="magic-mask" title="Magic Mask">✦</span>
            <span class="pi hs" data-t="blur-sharpen-mist" title="Blur">◍</span>
            <span class="pi hs" data-t="matte" title="Key">◪</span>
            <span class="pi hs" data-t="hdr-palette" title="HDR">✸</span>
            <span class="pi hs" data-t="noise-reduction" title="Motion Effects">◈</span>
          </div>
          <div class="pane-h"><b>Color Wheels</b><span class="sp"></span>
            <span class="hs" data-t="bars">▮</span>
            <span class="hs" data-t="log-wheels">Log</span>
            <span class="hs" data-t="reset">↺</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="wheels">
              <div class="wheel hs" data-t="lift"><div class="rng"></div><span class="nm">Lift</span><span class="vl">0.00</span></div>
              <div class="wheel hs" data-t="gamma"><div class="rng"></div><span class="nm">Gamma</span><span class="vl">0.00</span></div>
              <div class="wheel hs" data-t="gain"><div class="rng"></div><span class="nm">Gain</span><span class="vl">1.00</span></div>
              <div class="wheel hs" data-t="offset"><div class="rng"></div><span class="nm">Offset</span><span class="vl">25.00</span></div>
            </div>
            <div style="display:flex;gap:8px;padding:0 16px 8px;font-size:10px;color:var(--rs-dim);flex-wrap:wrap;flex-shrink:0">
              <span class="hs" data-t="contrast" style="padding:3px 7px;border:1px solid #3a3a3a;border-radius:3px">Contrast 1.00</span>
              <span class="hs" data-t="pivot" style="padding:3px 7px;border:1px solid #3a3a3a;border-radius:3px">Pivot 0.435</span>
              <span class="hs" data-t="saturation" style="padding:3px 7px;border:1px solid #3a3a3a;border-radius:3px">Sat 50.0</span>
              <span class="hs" data-t="hue" style="padding:3px 7px;border:1px solid #3a3a3a;border-radius:3px">Hue 50.0</span>
              <span class="hs" data-t="temperature" style="padding:3px 7px;border:1px solid #3a3a3a;border-radius:3px">Temp 0.0</span>
              <span class="hs" data-t="tint" style="padding:3px 7px;border:1px solid #3a3a3a;border-radius:3px">Tint 0.0</span>
            </div>
          </div>
        </div>

        <div class="pane scopes hs" data-t="scopes">
          <div class="pane-h"><b>Scopes</b><span class="sp"></span>
            <span class="hs" data-t="parade">P</span>
            <span class="hs" data-t="vectorscope">V</span>
            <span class="hs" data-t="histogram">H</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="scope-box hs" data-t="waveform"><div class="grid"></div><div class="trace"></div></div>
          </div>
        </div>
      </div>

      <div class="kf hs" data-t="keyframe-editor">
        <span>Keyframes</span><span class="lane"></span>
        <span class="hs" data-t="ease-in-ease-out">Ease</span>
      </div>
    </div>
    ${PAGES("color")}
  </div>`;

})(window.RM);
