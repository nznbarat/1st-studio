/* ═════════════════════════════════════════════════════════════
   50 · Resolve интерфейсийн хуулбар — нийтлэг хэсэг ба
        Media, Photo, Cut, Edit хуудас

   Байрлал бүрийг хэрэглэгчийн DaVinci Resolve Studio 21-ийн
   бодит дэлгэцийн зургаас (2026-09-18) уншиж барьсан.

   Товших хэсэг бүр  class="hs" data-t="<толины id>"
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const S = (RM.sim = RM.sim || {});
  const H = (S._h = {});

  /* Төслийн нэр — хэрэглэгчийн дэлгэцтэй адил. Хүсвэл энд солино. */
  H.PROJECT = "Ээжийн дуу";
  H.TIMELINE = "SEEDANCE_v1_30s";
  H.CLIP = "dreamina-2026-09-17-3642-Photorealistic cinematic sci-fi shot, 30….mp4";
  H.CLIP_SHORT = "dreamina-2026-09…";

  /* ── цэсний мөр — бүх 13 цэс баталгаажсан ── */
  H.MENU = () => `
    <div class="rs-menu">
      <span class="logo">◈ DaVinci Resolve</span>
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
      <span class="sp"></span>
      <span class="wc">–</span><span class="wc">▢</span><span class="wc">✕</span>
    </div>`;

  /* ── хэрэгслийн мөр: зүүн товч … төслийн нэр + Edited … баруун товч ── */
  H.TOOLS = (left, right, edited) => `
    <div class="rs-tools hs" data-t="interface-toolbar">
      ${left}
      <span class="sp"></span>
      <span class="rs-project hs" data-t="project">${H.PROJECT}${edited === false ? "" :
        '<span class="edited hs" data-t="edited-indicator">Edited</span>'}</span>
      <span class="sp"></span>
      ${right}
    </div>`;

  H.TG = (id, icon, label, act) =>
    `<span class="tg ${act ? "act" : ""} hs" data-t="${id}"><span class="ic">${icon}</span>${label}</span>`;

  /* ── хуудасны мөр — дараалал, шошгогүй дүрс баталгаажсан ── */
  H.PAGES = (active) => {
    const list = [
      ["media",     "▤", "Media",     "media-page"],
      ["photo",     "◎", "Photo",     "photo-page"],
      ["cut",       "◨", "Cut",       "cut-page"],
      ["edit",      "≡", "Edit",      "edit-page"],
      ["fusion",    "✧", "Fusion",    "fusion-page"],
      ["color",     "◌", "Color",     "color-page"],
      ["fairlight", "♪", "Fairlight", "fairlight-page"],
      ["deliver",   "➚", "Deliver",   "deliver-page"]
    ];
    return `
    <div class="rs-pages hs" data-t="page-bar">
      <span class="rs-brand">◈ DaVinci Resolve Studio 21</span>
      ${list.map(([id, ic, nm, term]) => `
        <span class="pg hs ${id === active ? "act" : ""}" data-t="${term}" data-go="${id}" title="${nm}">
          <span class="ic">${ic}</span></span>`).join("")}
      <span class="right">
        <span class="rb hs" data-t="project-manager" title="Project Manager">⌂</span>
        <span class="rb hs" data-t="project-settings" title="Project Settings">⚙</span>
      </span>
    </div>`;
  };

  /* ── дэлгэцийн зураг ── */
  H.SCREEN = (cls) => `<div class="vw-screen"><div class="img ${cls || ""}"></div></div>`;

  /* ── тоглуулалтын товчнууд ── */
  H.TRANSPORT = (tc, extra) => `
    <div class="vw-ctrl hs" data-t="transport-controls">
      ${extra || ""}
      <span class="hs" data-t="go-to" title="Эхлэл рүү">⏮</span>
      <span class="hs" data-t="j" title="Ухраах">◀</span>
      <span class="hs" data-t="k" title="Зогсоох">■</span>
      <span class="hs play" data-t="play-stop" title="Тоглуулах">▶</span>
      <span class="hs" data-t="go-to" title="Төгсгөл рүү">⏭</span>
      <span class="hs" data-t="loop-unloop" title="Давтах">↻</span>
      ${tc ? `<span class="sp"></span><span class="tc hs" data-t="timecode">${tc}</span>` : ""}
    </div>`;

  /* ── Media Pool-ын bins мод ── */
  H.BINS = (list, active) => `
    <div class="mp-bins">
      <div class="mp-bin-h hs" data-t="bin">▤ Bins<span class="sp"></span>+</div>
      <div class="mp-bin hs" data-t="bin">▾ Master</div>
      ${list.map((n) => `<div class="mp-bin sub ${n === active ? "act" : ""} hs" data-t="bin">${n}</div>`).join("")}
      <div class="mp-bin-h hs" data-t="smart-bin" style="margin-top:8px">✦ Smart Bins<span class="sp"></span>+</div>
      <div class="mp-bin sub hs" data-t="keyword">Keywords</div>
      <div class="mp-bin sub hs" data-t="power-bin">› Collections</div>
    </div>`;

  H.BIN_LIST = ["01_Holog_Tom", "02_Suirel_Asteroid", "03_Eej_Huu", "04_Avrah_holog",
                "05_Tovchluur_Shilen", "06_Cockpit_Joloodloh", "07_Huvtsas_EVA",
                "08_Test_Export", "09_Reference_Busad", "Seedance"];

  H.THUMBS = (n) => `
    <div class="mp-grid">
      <div class="mp-clip a hs" data-t="clip" data-n="${H.CLIP_SHORT}"><span class="badge">♫</span></div>
      <div class="mp-clip tl hs" data-t="timeline" data-n="${H.TIMELINE}"><span class="badge">▤</span></div>
      ${n > 2 ? '<div class="mp-clip hs" data-t="clip" data-n="COCKPIT_v3"></div>' : ""}
    </div>`;

  /* ═══════════ MEDIA ═══════════ */
  S.media = () => `
  <div class="rs" data-page="media">
    ${H.MENU()}
    ${H.TOOLS(
      `<span class="tg hs" data-t="panel-toggle">⌄</span>
       ${H.TG("media-storage", "▤", "Media Storage", true)}
       ${H.TG("clone-tool", "⧉", "Clone Tool")}`,
      `${H.TG("audio-sync", "♫", "Audio")}
       ${H.TG("metadata-editor", "ⓘ", "Metadata")}
       ${H.TG("inspector", "◧", "Inspector")}
       ${H.TG("capture", "◉", "Capture")}
       <span class="tg hs" data-t="viewer-mode">▭</span>`)}
    <div class="rs-row2">
      <span class="hs" data-t="panel-toggle">▯ ⌄</span><span class="hs" data-t="go-to">‹ ›</span>
      <span class="slider hs" data-t="thumbnail-view"></span>
      <span class="hs" data-t="list-view">⇅ ▦ ☰</span><span class="hs" data-t="help-search">⌕</span><span>…</span>
      <span class="sp"></span>
      <span class="hs" data-t="zoom-slider">16% ⌄</span>
      <span class="sp"></span>
      <span class="tc hs" data-t="timecode">00:00:00:00</span><span class="hs" data-t="viewer-mode">▭ ⌄</span><span>…</span>
    </div>
    <div class="rs-body">
      <div class="rs-top" style="flex:0 0 46%">
        <div class="pane hs" data-t="media-storage" style="width:235px;flex-shrink:0">
          <div class="pane-b"><div class="tree">
            <div class="hs" data-t="media-storage">› ▤ C:\\Users\\ulaan\\Video…</div>
            <div class="hs" data-t="media-storage">› ▤ C:\\ (Usage: 43%)</div>
            <div class="hs" data-t="media-storage">› ▤ Data (D:\\) (Usage: 10%)</div>
          </div></div>
        </div>
        <div class="pane hs" data-t="media-storage" style="width:430px;flex-shrink:0;background:var(--rs-pane)"></div>
        <div class="pane vw hs" data-t="source-viewer">
          <div class="pane-b" style="display:flex;flex-direction:column">
            ${H.SCREEN("black")}
            <div class="vw-foot">
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("", '<span class="hs" data-t="viewer-mode">▭ ⌄</span><span class="hs" data-t="mute">🔈</span><span class="hs" data-t="in-point">‹ ● ›</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
      </div>
      <div class="rs-row2 hs" data-t="media-pool">
        <span class="hs" data-t="panel-toggle">▯ ⌄</span><span>‹ ›</span>
        <span class="hs" data-t="audio-sync">⧖</span><span class="hs" data-t="proxy-generation">▦ ⌄</span>
        <span class="hs" data-t="relink">⟲</span><span class="hs" data-t="blackmagic-cloud-account">☁</span>
        <b class="hs" data-t="bin" style="margin-left:14px">Seedance</b>
        <span class="sp"></span>
        <span class="hs" data-t="thumbnail-view">▦ ⌄</span><span class="hs" data-t="list-view">▭ ⌄</span>
        <span class="hs" data-t="help-search">⌕</span><span class="hs" data-t="list-view">⇅</span><span>…</span>
      </div>
      <div class="rs-top" style="flex:1">
        <div class="pane hs" data-t="bin" style="width:235px;flex-shrink:0">
          <div class="pane-b">${H.BINS(H.BIN_LIST.slice(1), "Seedance")}</div>
        </div>
        <div class="pane hs" data-t="media-pool">
          <div class="pane-h hs" data-t="bin"><span>Master / Seedance</span></div>
          <div class="pane-b">${H.THUMBS(2)}</div>
        </div>
      </div>
    </div>
    ${H.PAGES("media")}
  </div>`;

  /* ═══════════ PHOTO ═══════════ */
  S.photo = () => `
  <div class="rs" data-page="photo">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("media-pool", "▤", "Media Pool", true)}
       ${H.TG("effects-library", "✦", "Effects")}
       <span class="tg act hs mi" data-t="photo-album-menu"><span class="ic">▨</span>Photo Album ⌄</span>`,
      `${H.TG("quick-export", "⇧", "Quick Export")}
       ${H.TG("metadata", "ⓘ", "Metadata")}
       ${H.TG("capture", "◉", "Capture")}
       ${H.TG("inspector", "◧", "Inspector")}`)}
    <div class="rs-row2">
      <span class="hs" data-t="panel-toggle">▯ ⌄</span><span class="hs" data-t="new-bin">▫ ⌄</span>
      <span class="hs" data-t="audio-sync">⧖</span><span class="hs" data-t="import-media">▦ ⌄</span>
      <b class="hs" data-t="bin">Seeda…</b>
      <span class="hs" data-t="thumbnail-view">▦ ⌄</span><span class="hs" data-t="help-search">⌕</span>
      <span class="hs" data-t="photo-rating">♡</span><span class="hs" data-t="list-view">⇅</span>
      <span class="hs" data-t="lightbox">▭ ▭</span>
      <span class="hs" data-t="zoom-slider">50% ⌄</span>
      <span class="sp"></span><span class="hs" data-t="viewer-mode">⌄</span><span class="sp"></span>
      <span class="hs" data-t="viewer-mode">▭ ▦ ▭ ⌄ ▭ ⌄</span><span class="hs" data-t="reset">⟲</span><span>▭</span>
    </div>
    <div class="rs-body">
      <div class="rs-top">
        <div class="pane hs" data-t="media-pool" style="width:545px;flex-shrink:0">
          <div class="pane-h hs" data-t="bin"><span>Master / Seedance</span></div>
          <div class="pane-b"></div>
        </div>
        <div class="pane vw hs" data-t="viewer">
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen" style="background:var(--rs-viewer)"></div>
            <div class="ph-tools">
              <span class="hs" data-t="inspector">⚌</span>
              <span class="sp"></span>
              <span class="hs" data-t="photo-rating">▨♡ ▨ ▨✕</span>
              <span class="hs" data-t="photo-album">-- ⌄</span>
              <span class="stars hs" data-t="photo-rating">★ ★ ★ ★ ★</span>
              <span class="hs" data-t="photo-flag">○ ⌄</span>
              <span class="hs" data-t="photo-flag">⚑ ⌄</span>
            </div>
          </div>
        </div>
      </div>
      <div class="ph-album hs" data-t="photo-album">
        <div class="ph-filters hs" data-t="photo-filters">
          <div class="fh">● Filters</div>
          <div class="fi"><span class="hs" data-t="photo-rating">♡</span><span class="hs" data-t="photo-rating">★</span></div>
          <div class="fi"><span class="hs" data-t="photo-flag">⚑</span><span class="hs" data-t="conform-lock-enabled">⊠</span></div>
          <div class="fi"><span class="hs" data-t="keyword">◇</span><span class="hs" data-t="list-view">⇅</span></div>
        </div>
        <div class="ph-empty">
          <h3>Create an Album</h3>
          <p>Drag photos into the Photo Album to start editing</p>
        </div>
      </div>
    </div>
    ${H.PAGES("photo")}
  </div>`;

  /* ═══════════ CUT ═══════════ */
  S.cut = () => `
  <div class="rs" data-page="cut">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("media-pool", "▤", "Media Pool", true)}
       ${H.TG("sync-bin", "⧉", "Sync Bin")}
       ${H.TG("transition", "◫", "Transitions")}
       ${H.TG("titles", "T", "Titles")}
       ${H.TG("effects-library", "✦", "Effects")}
       ${H.TG("keyframe-editor", "◆", "Keyframes")}`,
      `${H.TG("quick-export", "⇧", "Quick Export")}
       ${H.TG("full-screen-window", "⛶", "Full Screen")}
       ${H.TG("mixer", "⇅", "Mixer")}
       ${H.TG("inspector", "◧", "Inspector")}`)}
    <div class="rs-row2">
      <span class="hs" data-t="panel-toggle">▯ ⌄</span><span class="hs" data-t="new-bin">▫ ▫ ⧖ ☁ …</span>
      <span class="sp"></span><span class="hs" data-t="thumbnail-view">▦ ⌄</span><span class="hs" data-t="help-search">⌕</span><span>⇅ …</span>
      <span class="hs" data-t="viewer-mode">▭ ▭ ▭</span><span class="hs" data-t="viewer-mode">▦ ▦ ▭</span>
      <span class="sp"></span>
      <b class="hs" data-t="timeline">${H.TIMELINE} ⌄</b>
      <span class="hs" data-t="duration">◷ 00:00:30:01</span>
      <span class="hs" data-t="viewer-mode">▭ ⌄ ▦ ⌄ ⚙ ⌄</span><span class="hs" data-t="reset">⟲</span>
      <span class="hs" data-t="mute">🔈</span>
    </div>
    <div class="rs-body">
      <div class="rs-top" style="flex:0 0 40%">
        <div class="pane hs" data-t="media-pool" style="width:41%;flex-shrink:0">
          <div class="pane-h hs" data-t="bin"><span>Master / Seedance</span></div>
          <div class="pane-b">${H.THUMBS(2)}</div>
        </div>
        <div class="pane vw hs" data-t="viewer">
          <div class="pane-b" style="display:flex">
            <div style="flex:1;display:flex;flex-direction:column">
              <div class="vw-screen"><span class="vw-mark l hs" data-t="in-point">⇥</span><div class="img"></div><span class="vw-mark r hs" data-t="out-point">⇥</span></div>
            </div>
            <div class="meter-v hs" data-t="loudness-meter">
              <span>0</span><span>-5</span><span>-10</span><span>-15</span><span>-20</span><span>-30</span><span>-40</span><span>-50</span>
            </div>
          </div>
        </div>
      </div>
      <div class="cut-transport hs" data-t="transport-controls">
        <span class="hs" data-t="smart-insert">⊟</span><span class="hs" data-t="append-to-end">⊞</span>
        <span class="gap"></span>
        <span class="hs" data-t="ripple-overwrite">⊡</span><span class="hs" data-t="close-up">⊙</span>
        <span class="hs" data-t="place-on-top">⊕</span><span class="hs" data-t="source-overwrite">⊛</span>
        <span class="hs" data-t="fit-to-fill">⊠</span><span class="hs" data-t="replace">⊗</span>
        <span class="gap"></span>
        <span class="hs" data-t="transition-button">◇</span><span class="hs" data-t="speed-ramp">⟋</span>
        <span class="hs" data-t="trim-editor">⇹</span>
        <span class="gap"></span>
        <span class="hs" data-t="in-point">◁</span><span class="hs" data-t="marker">●</span><span class="hs" data-t="out-point">▷</span>
        <span class="hs" data-t="go-to">⏮</span><span class="hs" data-t="j">◀</span><span class="hs" data-t="k">■</span>
        <span class="hs play" data-t="play-stop">▶</span><span class="hs" data-t="go-to">⏭</span><span class="hs" data-t="loop-unloop">↻</span>
        <span class="sp"></span>
        <span class="hs" data-t="next-edit">⇥</span><span class="hs" data-t="previous-edit">⇤</span>
        <span class="tc hs" data-t="timecode">TCG 01:00:00:00</span><span class="hs" data-t="timeline-menu">≡</span>
      </div>
      <div class="cut-upper hs" data-t="dual-timeline">
        <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:34px">
          <div class="tk"><span>01:00:00:00</span></div><div class="tk"><span>01:00:05:00</span></div>
          <div class="tk"><span>01:00:10:00</span></div><div class="tk"><span>01:00:15:00</span></div>
          <div class="tk"><span>01:00:20:00</span></div><div class="tk"><span>01:00:25:00</span></div>
        </div>
        <div class="tl-row" style="height:26px"><div class="tl-head hs" data-t="track" style="width:34px"><span class="nm">V1</span></div>
          <div class="tl-lane"><div class="clip cutv hs" data-t="clip" style="width:100%"></div></div></div>
      </div>
      <div class="cut-lower hs" data-t="dual-timeline">
        <div class="cut-tools">
          <span class="hs" data-t="source-track-selector">⚌</span><span class="hs" data-t="track">⧈</span><span class="hs" data-t="track-lock">⊠</span>
          <div class="sp"></div>
          <span class="hs" data-t="selection-mode">⧉</span><span class="hs" data-t="trim-edit-mode">⇹</span>
          <span class="hs" data-t="blade">✂</span><span class="hs" data-t="marker">●</span><span class="hs" data-t="snapping">◈</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;min-width:0">
          <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0;background:var(--rs-sub)">
            <div class="tk"><span>00:59:56:00</span></div><div class="tk"><span>00:59:58:00</span></div>
            <div class="tk red"><span>01:00:00:00</span></div><div class="tk"><span>01:00:02:00</span></div>
          </div>
          <div class="tl-tracks" style="background:var(--rs-sub)">
            <div class="tl-play" style="left:50%"></div>
            <div class="tl-row" style="height:60%;border:0"><div class="tl-lane" style="padding-left:50%;background:none">
              <div class="clip v thumbs hs" data-t="clip" style="width:100%;height:calc(100% - 20px)"><span class="cn"></span></div></div></div>
            <div class="tl-row aud" style="height:34%;border:0"><div class="tl-lane" style="padding-left:50%;background:none">
              <div class="clip a hs" data-t="clip" style="width:100%"><span class="cn">◌ 30:01</span><span class="wf"></span></div></div></div>
          </div>
        </div>
      </div>
    </div>
    ${H.PAGES("cut")}
  </div>`;

  /* ═══════════ EDIT ═══════════
     Хэрэглэгч Resolve-ийн үндсэн хос дэлгэцтэй байхыг сонгосон.
     (Өөрийнх нь Resolve дээр Single Viewer Mode асаалттай байсан.) */
  S.edit = () => `
  <div class="rs" data-page="edit">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("media-pool", "▤", "Media Pool", true)}
       ${H.TG("effects-library", "✦", "Effects", true)}
       ${H.TG("edit-index", "≣", "Index")}
       ${H.TG("sound-library", "♫", "Sound Library")}
       ${H.TG("keyframe-editor", "◆", "Keyframes")}`,
      `${H.TG("quick-export", "⇧", "Quick Export")}
       ${H.TG("mixer", "⇅", "Mixer")}
       ${H.TG("metadata", "ⓘ", "Metadata")}
       ${H.TG("inspector", "◧", "Inspector", true)}
       <span class="tg hs" data-t="viewer-mode">▭</span>`)}
    <div class="rs-row2">
      <span class="hs" data-t="panel-toggle">▯ ⌄</span><span>‹ ›</span><span class="hs" data-t="audio-sync">⧖</span>
      <span class="hs" data-t="import-media">▦ ⌄</span><span class="hs" data-t="blackmagic-cloud-account">☁</span>
      <b class="hs" data-t="bin">Se…</b><span class="hs" data-t="thumbnail-view">▦ ⌄</span>
      <span class="hs" data-t="help-search">⌕</span><span>⇅ …</span>
      <span class="sp"></span>
      <span class="hs" data-t="zoom-slider">14% ⌄</span><span class="hs" data-t="viewer-mode">▭ ▭ ▭</span>
      <span class="sp"></span>
      <span class="hs" data-t="viewer-mode">▭ ⌄ ▦ ⌄ ⚙ ⌄</span><span class="hs" data-t="reset">⟲ …</span>
      <span class="hs" data-t="viewer-mode">▭ ▯</span>
      <b class="hs" data-t="timeline-viewer" style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${H.CLIP}</b><span>…</span>
    </div>
    <div class="rs-body">
      <div class="rs-top" style="flex:0 0 48%">
        <div class="ed-left">
          <div class="pane" style="flex:0 0 58%">
            <div class="pane-b" style="display:flex">
              <div style="width:178px;flex-shrink:0;border-right:1px solid var(--rs-line);overflow:hidden">
                ${H.BINS(H.BIN_LIST.slice(0, 7), "")}
              </div>
              <div style="flex:1;display:flex;flex-direction:column">
                <div class="pane-h hs" data-t="bin"><span>Master / Seedance</span></div>
                ${H.THUMBS(2)}
              </div>
            </div>
          </div>
          <div class="pane hs" data-t="effects-library" style="flex:1;border-top:1px solid var(--rs-line)">
            <div class="pane-b" style="display:flex">
              <div class="fx-tree">
                <div class="fx-h hs" data-t="effects-library">▾ Toolbox</div>
                <div class="fx-i hs" data-t="transition">Video Transitions</div>
                <div class="fx-i hs" data-t="crossfade">Audio Transitions</div>
                <div class="fx-i hs" data-t="titles">Titles</div>
                <div class="fx-i hs" data-t="generator">Generators</div>
                <div class="fx-i hs" data-t="effects">Effects</div>
                <div class="fx-h hs" data-t="openfx">▾ Resolve FX</div>
                <div class="fx-h hs" data-t="favorite-keywords">▾ Favorites</div>
                <div class="fx-i hs" data-t="openfx">Resolve FX</div>
              </div>
              <div class="fx-list">
                <div class="fx-sec hs" data-t="crossfade">Cross Fade <span>⌃</span></div>
                <div class="fx-row hs" data-t="crossfade"><i></i>Cross Fade +3 dB</div>
                <div class="fx-row hs" data-t="crossfade"><i></i>Cross Fade −3 dB</div>
                <div class="fx-row hs" data-t="crossfade"><i class="red"></i>Cross Fade 0 dB</div>
                <div class="fx-sec hs" data-t="cross-dissolve">Dissolve <span>⌃</span></div>
                <div class="fx-row hs" data-t="add"><i></i>Additive Dissolve</div>
                <div class="fx-row hs" data-t="blur-fusion"><i></i>Blur Dissolve</div>
                <div class="fx-row hs" data-t="cross-dissolve"><i class="red"></i>Cross Dissolve</div>
                <div class="fx-row hs" data-t="dip-to-color-dissolve"><i></i>Dip To Color Dissolve</div>
              </div>
            </div>
          </div>
        </div>
        <div class="pane vw hs" data-t="source-viewer" style="flex:1">
          <div class="vw-head"><span class="tc">00:00:30:01</span><span class="sp"></span><b class="hs" data-t="source-viewer">Source</b><span class="sp"></span><span class="tc">01:00:04:12</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen"><span class="vw-mark l hs" data-t="in-point">⇥</span><div class="img"></div><span class="vw-mark r hs" data-t="out-point">⇥</span></div>
            <div class="vw-foot">
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("", '<span class="hs" data-t="viewer-mode">▭ ⌄</span><span class="hs" data-t="in-point">‹ ● ›</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
        <div class="pane vw hs" data-t="timeline-viewer" style="flex:1">
          <div class="vw-head"><span class="tc">00:00:30:01</span><span class="sp"></span><b class="hs" data-t="timeline">${H.TIMELINE} ⌄</b><span class="sp"></span><span class="tc">01:00:00:00</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen"><span class="vw-mark l hs" data-t="in-point">⇥</span><div class="img"></div><span class="vw-mark r hs" data-t="out-point">⇥</span></div>
            <div class="vw-foot">
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("", '<span class="hs" data-t="viewer-mode">▭ ⌄</span><span class="hs" data-t="in-point">‹ ● ›</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
        <div class="pane insp hs" data-t="inspector" style="width:270px">
          <div class="insp-tabs six">
            <div class="act hs" data-t="inspector">▣<br>Video</div><div class="hs" data-t="mixer">♫<br>Audio</div>
            <div class="hs" data-t="effects">✦<br>Effects</div><div class="hs" data-t="transition">◫<br>Transition</div>
            <div class="hs" data-t="camera-raw">▨<br>Image</div><div class="hs" data-t="metadata">▤<br>File</div>
          </div>
          <div class="pane-b">
            <div class="insp-sec hs" data-t="transform">
              <div class="t"><span class="tog on"></span> Transform <span class="sp"></span><span class="mini">⚌ ◆ ⟲</span></div>
              ${["Zoom","zoom","1.000","1.000"].length ? `
              <div class="insp-row hs" data-t="zoom"><span class="lb">Zoom</span><span class="xy">X <b>1.000</b> ⧉ Y <b>1.000</b></span><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="position"><span class="lb">Position</span><span class="xy">X <b>0.000</b> Y <b>0.000</b></span><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="rotation-angle"><span class="lb">Rotation Angle</span><span class="sl" style="--p:50%"></span><b>0.000</b><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="anchor-point"><span class="lb">Anchor Point</span><span class="xy">X <b>0.000</b> Y <b>0.000</b></span><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="pitch-yaw"><span class="lb">Pitch</span><span class="sl" style="--p:50%"></span><b>0.000</b><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="pitch-yaw"><span class="lb">Yaw</span><span class="sl" style="--p:50%"></span><b>0.000</b><span class="kf">◆ ⟲</span></div>
              <div class="insp-row hs" data-t="flip"><span class="lb">Flip</span><span class="xy">⇔ ⇕</span><span class="kf">⟲</span></div>` : ""}
            </div>
            <div class="insp-sec hs" data-t="smart-reframe"><div class="t">› AI Smart Reframe</div></div>
            <div class="insp-sec hs" data-t="crop"><div class="t"><span class="tog on"></span> Cropping <span class="sp"></span><span class="mini">⚌ ◆ ⟲</span></div></div>
            <div class="insp-sec hs" data-t="dynamic-zoom"><div class="t">› Dynamic Zoom</div></div>
            <div class="insp-sec hs" data-t="composite-mode"><div class="t">› Composite</div></div>
            <div class="insp-sec hs" data-t="speed-change"><div class="t">› Speed Change</div></div>
            <div class="insp-sec hs" data-t="stabilization"><div class="t">› Stabilization</div></div>
            <div class="insp-sec hs" data-t="lens-correction"><div class="t">› Lens Correction</div></div>
          </div>
        </div>
      </div>

      <div class="rs-tlbar hs" data-t="toolbar-timeline">
        <span class="hs" data-t="help-search">⌕ ⌄</span><span>…</span>
        <span class="sp"></span>
        <span class="tl hs" data-t="timeline-menu">⚌</span><span class="tl hs" data-t="track">◈</span><span class="tl hs" data-t="record-voiceover">🎙</span>
        <span class="div"></span>
        <span class="tl act hs" data-t="selection-mode">↖</span><span class="tl hs" data-t="trim-edit-mode">⇹</span>
        <span class="tl hs" data-t="dynamic-trim">⧎</span><span class="tl hs" data-t="blade">✂</span>
        <span class="div"></span>
        <span class="tl hs" data-t="insert">⊟</span><span class="tl hs" data-t="overwrite">⊡</span><span class="tl hs" data-t="replace">⊗</span>
        <span class="div"></span>
        <span class="tl act hs" data-t="snapping">∩</span><span class="tl act hs" data-t="linked-selection">∞</span><span class="tl hs" data-t="sync-lock">⊠</span>
        <span class="div"></span>
        <span class="tl hs" data-t="flag">⚑</span><span class="tl hs" data-t="marker">◆ ⌄</span>
        <span class="div"></span>
        <span class="tl hs" data-t="zoom-to-fit">⤢</span><span class="tl hs" data-t="zoom-in-timeline">⊕</span><span class="tl hs" data-t="zoom-out-timeline">⊖</span>
        <span class="zoom hs" data-t="zoom-slider">−<span class="zb"></span>+</span>
        <span class="sp"></span>
        <span class="tl hs" data-t="mute">🔈</span>
      </div>

      <div class="rs-tl">
        <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0">
          <div class="tl-bigtc hs" data-t="timecode">01:00:00:00</div>
          <div class="tk"><span>01:00:00:00</span></div><div class="tk"><span>01:00:08:00</span></div>
          <div class="tk"><span>01:00:16:00</span></div><div class="tk"><span>01:00:24:00</span></div>
          <div class="tk"><span>01:00:32:00</span></div>
        </div>
        <div class="tl-tracks">
          <div class="tl-play" style="left:318px"></div>
          <div class="tl-row" style="height:64px">
            <div class="tl-head wide hs" data-t="track">
              <span class="badge v hs" data-t="track-destination">V1</span>
              <span class="ib hs" data-t="track-lock">⊠</span><span class="ib hs" data-t="auto-select">⧉</span><span class="ib hs" data-t="video-track-enable">▣</span>
              <span class="tname"><b>Video 1</b><small>1 Clip</small></span>
            </div>
            <div class="tl-lane">
              <div class="clip v thumbs hs" data-t="clip" style="width:82%"><span class="cn">${H.CLIP} &nbsp;30:01</span></div>
            </div>
          </div>
          <div class="tl-row aud" style="height:60px">
            <div class="tl-head wide hs" data-t="track">
              <span class="badge a hs" data-t="track-destination">A1</span>
              <span class="ib hs" data-t="track-lock">⊠</span><span class="ib hs" data-t="auto-select">⧉</span>
              <span class="ib hs" data-t="solo">S</span><span class="ib hs" data-t="mute">M</span>
              <span class="ib hs" data-t="stereo" style="font-size:8px">2.0</span>
              <span class="tname"><b>Audio 1</b><small>1 Clip</small></span>
            </div>
            <div class="tl-lane">
              <div class="clip a hs" data-t="clip" style="width:82%"><span class="wf"></span><span class="cn">${H.CLIP} &nbsp;30:01</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${H.PAGES("edit")}
  </div>`;

})(window.RM);
