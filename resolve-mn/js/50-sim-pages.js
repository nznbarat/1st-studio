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
       <span class="tg hs" data-t="keyframe-editor" data-toggle="keyframes"><span class="ic">◆</span>Keyframes</span>`,
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
        <span class="hs" data-t="insert-video-only">▣</span><span class="hs" data-t="insert-audio-only">♪</span>
        <span class="gap"></span>
        <span class="hs" data-t="smart-insert">⊟</span><span class="hs" data-t="append-to-end">⊞</span>
        <span class="hs" data-t="ripple-overwrite">⊡</span><span class="hs" data-t="close-up">⊙</span>
        <span class="hs" data-t="place-on-top">⊕</span><span class="hs" data-t="source-overwrite">⊛</span>
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
        <!-- Дээд timeline-ийн зүүн булан (2026-09-19-ний зургууд): ⚌ Timeline Options (tooltip баталгаажсан,
             18 тохиргооны мөр), ⇤≡ Timeline Actions (15 мөр, tooltip баталгаажсан),
             3 дахь товч Trim Start/End to Playhead, Resync Clip цэс нээнэ. -->
        <div class="cut-tools up">
          <div class="row"><span class="hs mi" data-t="timeline-options">⚌</span><span class="hs mi" data-t="timeline-actions">⇤≡</span><span class="hs mi" data-t="trim-resync-menu-cut">⇥≡</span></div>
        </div>
        <div class="tl-col">
          <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:34px">
            <div class="tk"><span>01:00:00:00</span></div><div class="tk"><span>01:00:05:00</span></div>
            <div class="tk"><span>01:00:10:00</span></div><div class="tk"><span>01:00:15:00</span></div>
            <div class="tk"><span>01:00:20:00</span></div><div class="tk"><span>01:00:25:00</span></div>
          </div>
          <div class="tl-row" style="height:26px"><div class="tl-head hs" data-t="track" style="width:34px"><span class="nm">V1</span></div>
            <div class="tl-lane"><div class="clip cutv hs" data-t="clip" style="width:100%"></div></div></div>
        </div>
      </div>
      <div class="cut-lower hs" data-t="dual-timeline">
        <!-- Доод timeline-ийн зүүн булан — 5 товч, tooltip бүр баталгаажсан:
             Ripple On · Dynamic Trim Mode (Slip) · Split Clip · Add Marker · Keyframes -->
        <div class="cut-tools">
          <div class="row"><span class="hs on" data-t="ripple-on">▣</span><span class="hs" data-t="dynamic-trim-mode-slip">⇹</span>
            <span class="hs" data-t="split-clip">✂</span><span class="hs mk" data-t="marker">⬟</span><span class="hs" data-t="keyframe-editor" data-toggle="keyframes">◈</span></div>
          <div class="sp"></div>
          <!-- Замын толгойн 5 товч, tooltip бүр баталгаажсан: Enlarge · Lock · Solo Track On · Mute · Disable Track -->
          <div class="thead"><span class="hs" data-t="enlarge-track">⇕</span><span class="hs" data-t="lock-track">🔒</span><span class="hs" data-t="solo-track-on">🎧</span><span class="hs" data-t="mute-track">🔊</span><span class="hs" data-t="disable-track">▤</span><span class="nm hs" data-t="track">V1</span></div>
          <div class="thead"><span class="nm hs" data-t="track">A1</span></div>
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
      <!-- Keyframes самбар (2026-09-19-ний зураг): Keyframes товчоор нээгдэнэ.
           Толгойн Keyframe Curves / Keyframe Lanes tooltip, хоёр "…" цэс баталгаажсан. -->
      <div class="kf-panel hs" data-t="keyframe-editor" data-panel="keyframes">
        <div class="kf-side">
          <div class="kf-head"><span class="hs" data-t="keyframe-curves">↝</span><span class="hs" data-t="keyframe-lanes">≣</span>
            <span class="lbl hs" data-t="parameters-keyframes">Parameters</span><span class="sp"></span>
            <span class="dots hs mi" data-t="keyframe-parameters-menu">…</span></div>
          <div class="kf-row hs" data-t="clip">⌄ dreamina-2026-09-17-3642-Pho…</div>
        </div>
        <div class="kf-main">
          <div class="kf-head"><span class="sp"></span><span class="dots hs mi" data-t="keyframe-timeline-menu">…</span></div>
          <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0;background:var(--rs-sub)">
            <div class="tk"><span></span></div><div class="tk"><span></span></div><div class="tk red"><span></span></div><div class="tk"><span></span></div>
          </div>
          <div class="kf-lane"><div class="tl-play" style="left:50%"></div></div>
        </div>
      </div>
    </div>
    ${H.PAGES("cut")}
  </div>`;

  /* ═══════════ EDIT ═══════════
     Хэрэглэгч Resolve-ийн үндсэн хос дэлгэцтэй байхыг сонгосон.
     (Өөрийнх нь Resolve дээр Single Viewer Mode асаалттай байсан.) */
  /* ── Edit хуудас — 2026-09-26-ны зургууд: timeline хэрэгслийн мөрийн tooltip бүр,
     viewer-ийн ▭⌄ жагсаалт, Inspector-ийн Video/Audio таб, Effects-ийн шилжилтийн жагсаалт,
     Mixer самбар, Quick Export ба Blackmagic Cloud Folder цонх ── */

  /* Timeline хэрэгслийн мөр: [id, дүрс (SVG байхгүй үед), tooltip, нэмэлт класс] — зүүнээс баруун */
  const ED_TOOLS = [
    [["timeline-view-options", "⚌", "", "mi"], ["show-keyframe-tray", "◈", "Show Keyframe Tray"], ["voiceover", "🎙", "Voiceover"]],
    [["selection-mode", "↖", "Selection Mode - A", "act red"], ["trim-edit-mode", "⇹", "Trim Edit Mode - T"],
     ["blade", "✂", "Blade Edit Mode - B"], ["dynamic-trim-mode-slip", "⧎", "Dynamic Trim Mode (Slip) - W"]],
    [["insert", "⊟", "Insert Clip - F9"], ["overwrite", "⊡", "Overwrite Clip - F10"], ["replace", "⊗", "Replace Clip - F11"]],
    [["snapping", "∩", "Snapping - N"], ["linked-selection", "∞", "Linked Selection - Ctrl+Shift+L"], ["position-lock", "⊠", "Position Lock"]],
    [["flag", "⚑", ""], ["flag-color-menu", "⌄", "", "mi dd"], ["marker", "◆", ""], ["marker-color-menu", "⌄", "", "mi dd"]],
    [["full-extent-zoom", "⤢", "Full Extent Zoom", "act"], ["detail-zoom", "⊕", "Detail Zoom"], ["custom-zoom", "⊖", "Custom Zoom"]]
  ];
  const ED_TOOLBAR = () => ED_TOOLS.map((g) => g.map(([id, ic, tip, cls]) =>
    `<span class="tl ${cls || ""} hs" data-t="${id}"${tip ? ` title="${tip}"` : ""}>${/dd/.test(cls || "") ? ic : S.icon(id, ic)}</span>`
  ).join("")).join('<span class="div"></span>');

  /* Effects → Video Transitions — бүлэг бүрийн мөр (зурагт харагдсанаар) */
  const ED_FX = [
    ["crossfade", "Cross Fade", [["crossfade", "Cross Fade +3 dB"], ["crossfade", "Cross Fade −3 dB"], ["crossfade", "Cross Fade 0 dB", 1]]],
    ["cross-dissolve", "Dissolve", [["additive-dissolve", "Additive Dissolve"], ["blur-dissolve", "Blur Dissolve"], ["cross-dissolve", "Cross Dissolve", 1],
      ["dip-to-color-dissolve", "Dip To Color Dissolve"], ["non-additive-dissolve", "Non-Additive Dissolve"], ["smooth-cut", "Smooth Cut"]]],
    ["iris-transitions", "Iris", ["Arrow", "Cross", "Diamond", "Eye", "Hexagon", "Oval", "Pentagon", "Square"].map((n) => ["iris-transitions", n + " Iris"])],
    ["motion-transitions", "Motion", ["Barn Door", "Push", "Slide", "Split"].map((n) => ["motion-transitions", n])],
    ["shape-transitions", "Shape", ["Box", "Heart", "Star", "Triangle Left", "Triangle Right"].map((n) => ["shape-transitions", n])],
    ["wipe-transitions", "Wipe", ["Band", "Center", "Clock", "Edge", "Radial", "Spiral", "Venetian Blind", "X"].map((n) => ["wipe-transitions", n + " Wipe"])],
    ["fusion-transitions", "Fusion Transitions", ["Block Glitch", "Box Twist", "Box Wipe", "Brightness Flash", "Camera Shake", "Checker Wipe", "Circle Spin"].map((n) => ["fusion-transitions", n])]
  ];
  const ED_FXLIST = () => ED_FX.map(([sid, title, rows]) =>
    `<div class="fx-sec hs" data-t="${sid}">${title} <span>⌃</span></div>` +
    rows.map(([id, n, red]) => `<div class="fx-row hs" data-t="${id}"><i${red ? ' class="red"' : ""}></i>${n}</div>`).join("")
  ).join("");

  const ROW = (id, lb, body, kf) => `<div class="insp-row hs" data-t="${id}"><span class="lb">${lb}</span>${body}<span class="kf">${kf == null ? "◆ ⟲" : kf}</span></div>`;
  const SEC = (id, title, on, mini) => `<div class="insp-sec hs" data-t="${id}"><div class="t"><span class="tog${on ? " on" : ""}"></span> ${title} <span class="sp"></span><span class="mini">${mini || "⚌ ⟲"}</span></div></div>`;
  const EQ_BANDS = [["B1", "⌒", "50", "", ""], ["B2", "⊐", "500", "0.0", ""], ["B3", "◇", "239", "0.0", "1.0"],
                    ["B4", "◇", "1.2K", "0.0", "1.0"], ["B5", "◇", "3.5K", "0.0", "1.0"], ["B6", "⌒", "10.0K", "", ""]];

  S.edit = () => `
  <div class="rs" data-page="edit">
    ${H.MENU()}
    ${H.TOOLS(
      `${H.TG("media-pool", "▤", "Media Pool", true)}
       ${H.TG("effects-library", "✦", "Effects", true)}
       ${H.TG("edit-index", "≣", "Index")}
       ${H.TG("sound-library", "♫", "Sound Library")}
       ${H.TG("keyframe-editor", "◆", "Keyframes")}`,
      `<span class="tg hs" data-t="quick-export" data-toggle="quickexport"><span class="ic">⇧</span>Quick Export</span>
       <span class="tg hs" data-t="mixer" data-toggle="mixer"><span class="ic">⇅</span>Mixer</span>
       ${H.TG("metadata", "ⓘ", "Metadata")}
       ${H.TG("inspector", "◧", "Inspector", true)}
       <span class="tg hs" data-t="viewer-mode">▭</span>`)}
    <div class="rs-row2">
      <span class="hs" data-t="panel-toggle">▯ ⌄</span><span>‹ ›</span><span class="hs" data-t="audio-sync">⧖</span>
      <span class="hs mi" data-t="ai-analysis-menu-media-pool">▦ ⌄</span><span class="hs" data-t="blackmagic-cloud-folder" data-toggle="cloudfolder">☁</span>
      <b class="hs" data-t="bin">M…</b><span class="hs mi" data-t="media-pool-view-menu">▦ ⌄</span>
      <span class="hs" data-t="media-pool-search-bar" data-toggle="mpsearch">⌕</span><span class="hs mi" data-t="media-pool-sort-menu">⇅</span><span class="hs mi" data-t="media-pool-options-menu">…</span>
      <span class="sp"></span>
      <span class="hs" data-t="zoom-slider">14% ⌄</span><span class="hs" data-t="viewer-mode">▭ ▭ ▭</span>
      <span class="sp"></span>
      <span class="hs" data-t="viewer-guides-menu" data-toggle="guides">⛶ ⌄</span><span class="hs mi" data-t="proxy-menu-viewer">▦ ⌄</span><span class="hs mi" data-t="timeline-resolution-menu-viewer">✧ ⌄</span><span class="hs" data-t="reset">⊘</span><span class="hs mi" data-t="viewer-options-menu-edit">…</span>
      <span class="hs" data-t="viewer-mode">▭ ▯</span>
      <b class="hs" data-t="timeline-viewer" style="max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${H.CLIP}</b><span>…</span>
    </div>
    <div class="rs-body">
      <div class="rs-top" style="flex:0 0 48%">
        <div class="ed-left">
          <div class="pane" style="flex:0 0 58%">
            <div class="mp-search hs" data-t="media-pool-search-bar" data-panel="mpsearch">
              <div class="mps-r"><span class="hs" data-t="media-pool-search-bar">◫ ⌄</span><span class="mps-in"></span>
                <span class="hs" data-t="create-smart-bin" data-toggle="smartbin">⊞</span><span class="hs" data-t="ai-search-params">⚇ ⌄</span></div>
              <div class="mps-r"><span class="hs" data-t="search-in-media-pool">Search In <b>All Bins ⌄</b></span><span class="sp"></span>
                <span class="hs" data-t="display-media-pool-search">Display <b>Full Clips ⌄</b></span></div>
            </div>
            <div class="pane-b" style="display:flex">
              <div style="width:178px;flex-shrink:0;border-right:1px solid var(--rs-line);overflow:hidden">
                ${H.BINS(H.BIN_LIST.slice(0, 7), "")}
              </div>
              <div style="flex:1;display:flex;flex-direction:column">
                <div class="pane-h hs" data-t="bin"><span>Master</span></div>
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
                <div class="fx-i hs" data-t="titles">› Titles</div>
                <div class="fx-i hs" data-t="generator">› Generators</div>
                <div class="fx-i hs" data-t="effects">› Effects</div>
                <div class="fx-h hs" data-t="openfx">▾ Resolve FX</div>
                <div class="fx-h hs" data-t="favorite-keywords">▾ Favorites</div>
                <div class="fx-i hs" data-t="openfx">› Resolve FX</div>
              </div>
              <div class="fx-list scroll">${ED_FXLIST()}</div>
            </div>
          </div>
        </div>
        <div class="pane vw hs" data-t="source-viewer" style="flex:1">
          <div class="vw-head"><span class="tc">00:00:30:01</span><span class="sp"></span><b class="hs" data-t="source-viewer">Source</b><span class="sp"></span><span class="tc">01:00:04:12</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen"><span class="vw-mark l hs" data-t="in-point">⇥</span><div class="img"></div><span class="vw-mark r hs" data-t="out-point">⇥</span></div>
            <div class="vw-foot">
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("", '<span class="hs" data-t="viewer-mode">▭ ⌄</span><span class="hs" data-t="jog-wheel" title="Jog Wheel">‹ ● ›</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
        <div class="pane vw hs" data-t="timeline-viewer" style="flex:1">
          <div class="vw-head"><span class="tc">00:00:30:01</span><span class="sp"></span><b class="hs" data-t="timeline">${H.TIMELINE} ⌄</b><span class="sp"></span><span class="tc">01:00:01:16</span></div>
          <div class="pane-b" style="display:flex;flex-direction:column">
            <div class="vw-screen"><span class="vw-mark l hs" data-t="in-point">⇥</span><div class="img"></div><span class="vw-mark r hs" data-t="out-point">⇥</span></div>
            <div class="vw-foot">
              <div class="vw-jog hs" data-t="jog-bar"><div class="bar"></div></div>
              ${H.TRANSPORT("", '<span class="hs mi" data-t="viewer-overlay-menu-edit">▭ ⌄</span><span class="hs" data-t="jog-wheel" title="Jog Wheel">‹ ● ›</span><span class="sp"></span>')}
            </div>
          </div>
        </div>
        <div class="pane insp hs" data-t="inspector" style="width:270px">
          <div class="insp-tabs six">
            <div class="act hs" data-t="inspector" data-tab="ei:video">▣<br>Video</div><div class="hs" data-t="mixer" data-tab="ei:audio">♫<br>Audio</div>
            <div class="off hs" data-t="effects">✦<br>Effects</div><div class="off hs" data-t="transition">◫<br>Transition</div>
            <div class="off hs" data-t="camera-raw">▨<br>Image</div><div class="hs" data-t="metadata">▤<br>File</div>
          </div>
          <div class="pane-b ed-insp" data-tabpane="ei:video">
            <div class="insp-sec hs" data-t="transform">
              <div class="t"><span class="tog on"></span> Transform <span class="sp"></span><span class="mini">⚌ ◆ ⟲</span></div>
              ${ROW("zoom", "Zoom", '<span class="xy">X <b>1.000</b> ⧉ Y <b>1.000</b></span>')}
              ${ROW("position", "Position", '<span class="xy">X <b>0.000</b> Y <b>0.000</b></span>')}
              ${ROW("rotation-angle", "Rotation Angle", '<span class="sl" style="--p:50%"></span><b>0.000</b>')}
              ${ROW("anchor-point", "Anchor Point", '<span class="xy">X <b>0.000</b> Y <b>0.000</b></span>')}
              ${ROW("pitch-yaw", "Pitch", '<span class="sl" style="--p:50%"></span><b>0.000</b>')}
              ${ROW("pitch-yaw", "Yaw", '<span class="sl" style="--p:50%"></span><b>0.000</b>')}
              ${ROW("flip", "Flip", '<span class="xy">⇔ ⇕</span>', "⟲")}
            </div>
            <div class="insp-sec hs" data-t="smart-reframe"><div class="t">› AI Smart Reframe</div></div>
            ${SEC("crop", "Cropping", true, "⚌ ◆ ⟲")}
            ${SEC("dynamic-zoom", "Dynamic Zoom", false)}
            <div class="insp-sec hs" data-t="composite-mode">
              <div class="t"><span class="tog on"></span> Composite <span class="sp"></span><span class="mini">⚌ ◆ ⟲</span></div>
              ${ROW("composite-mode", "Composite Mode", '<span class="val dd">Normal ⌄</span>', "⟲")}
              ${ROW("opacity", "Opacity", '<span class="sl" style="--p:100%"></span><b>100.00</b>')}
            </div>
            ${SEC("speed-change", "Speed Change", false, "⚌ ◆ ⟲")}
            ${SEC("stabilization", "Stabilization", true)}
            ${SEC("lens-correction", "Lens Correction", true, "⚌ ◆ ⟲")}
            ${SEC("retime-and-scaling", "Retime and Scaling", true)}
            ${SEC("ai-super-scale", "AI Super Scale", true)}
          </div>
          <div class="pane-b ed-insp" data-tabpane="ei:audio" hidden>
            <div class="insp-sec"><div class="t sub">⋮ дээд хэсэг зурагт гараагүй</div>
              ${ROW("semi-tones", "Semi Tones", '<span class="sl" style="--p:50%"></span><b>0</b>', "⟲")}
              ${ROW("cents", "Cents", '<span class="sl" style="--p:50%"></span><b>0</b>', "⟲")}
            </div>
            ${SEC("speed-change", "Speed Change", false)}
            <div class="insp-sec hs" data-t="equalizer-inspector">
              <div class="t"><span class="tog"></span> Equalizer <span class="sp"></span><span class="mini">⚌ ⟲</span></div>
              <div class="eq-graph"><span>0</span><span>−30</span><span>−60</span><i></i></div>
              <div class="eq-bands">${EQ_BANDS.map(([b, sh, hz, db, q]) =>
                `<div class="eq-b hs" data-t="${q ? "q-eq" : "equalizer-inspector"}"><b>${b}</b><span class="eq-sh">${sh} ⌄</span><span>${hz}</span><span>${db || "&nbsp;"}</span><span>${q || "&nbsp;"}</span></div>`).join("")}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rs-tlbar hs" data-t="toolbar-timeline">
        <span class="hs" data-t="help-search">⌕ ⌄</span><span>…</span>
        <span class="sp"></span>
        ${ED_TOOLBAR()}
        <span class="zoom hs" data-t="zoom-slider">−<span class="zb"></span>+</span>
        <span class="sp"></span>
        <span class="tl hs" data-t="mute">🔈</span>
      </div>

      <div class="ed-tlwrap">
      <div class="rs-tl">
        <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0">
          <div class="tl-bigtc hs" data-t="timecode">01:00:01:16</div>
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
      <div class="mx-panel hs" data-t="mixer" data-panel="mixer">
        <div class="mx-h"><b>Mixer</b><span>⋯</span></div>
        <div class="mx-strips">
          ${[["A1", true], ["Bus1", false]].map(([n, solo]) => `
          <div class="mx-s hs" data-t="${n === "A1" ? "mixer" : "main-bus"}">
            <div class="mx-n">${n}</div>
            <div class="mx-sm">${solo ? '<span class="hs" data-t="solo">S</span>' : ""}<span class="hs" data-t="mute">M</span></div>
            <div class="mx-v">0.0</div>
            <div class="mx-f"><i class="fd"></i><i class="mt"></i><span class="sc">0<br>5<br>10<br>15<br>20<br><br>30<br><br>40<br>50</span></div>
          </div>`).join("")}
        </div>
      </div>
      </div>
    </div>
    ${H.PAGES("edit")}

    <div class="rs-pop guides hs" data-t="viewer-guides-menu" data-panel="guides">
      <div class="gd-h">Social Media</div>
      <div class="gd-row hs" data-t="social-media-guides">${["1:1", "4:5", "9:16", "1.91:1", "16:9"].map((r, i) => `<span class="gd${i === 4 ? " on" : ""}"><i class="r${i}"></i>${r}</span>`).join("")}</div>
      <div class="gd-h">Broadcast and Film</div>
      <div class="gd-row hs" data-t="broadcast-and-film-guides">${["Default", "1.33", "1.77", "1.85", "2.35", "2.39", "2.40"].map((r, i) => `<span class="gd${i === 0 ? " on" : ""}"${i === 0 ? ' title="Timeline Aspect Ratio"' : ""}><i class="b${i}"></i>${r}</span>`).join("")}</div>
      <div class="gd-h">Safe Area Guides</div>
      <div class="gd-row hs" data-t="safe-area-guides">${["Extents", "Action", "Title", "Center"].map((r, i) => `<span class="gd${i === 0 ? " on" : ""}"><i class="s${i}"></i>${r}</span>`).join("")}</div>
      <div class="gd-h">Ruler Guides</div>
      <div class="gd-row"><span class="gd hs" data-t="rulers"><i class="g0"></i>Rulers</span><span class="gd hs" data-t="guides"><i class="g1"></i>Guides</span></div>
    </div>

    <div class="rs-dlg sb hs" data-t="create-smart-bin" data-panel="smartbin">
      <div class="dlg-t l">Create Smart Bin</div>
      <div class="sb-body">
        <div class="sb-r"><span class="lb">Name:</span><span class="in red">Smart Bin 1</span><span class="sp"></span><span class="hs" data-t="show-in-all-projects"><span class="cb"></span> Show in all projects</span></div>
        <div class="sb-r hs" data-t="smart-bin-rules"><span class="lb">Match</span><span class="dd off">All ⌄</span> of the following rules:</div>
        <div class="sb-r rule hs" data-t="ai-search-params"><span class="cb on"></span><span class="dd">AI Search Params ⌄</span><span class="dd">Search Option ⌄</span><span class="dd off">is ⌄</span><span class="dd w">Search All ⌄</span><span class="pm">− +</span></div>
        <div class="sb-r rule hs" data-t="ai-search-params"><span class="cb on"></span><span class="dd">AI Search Params ⌄</span><span class="dd">Show Results Option ⌄</span><span class="dd off">is ⌄</span><span class="dd w">For All Faces ⌄</span><span class="pm">− +</span></div>
      </div>
      <div class="dlg-btns"><span class="sp"></span><span class="btn hs" data-t="create-smart-bin" data-toggle="smartbin">Cancel</span><span class="btn red hs" data-t="create-smart-bin">Create</span></div>
    </div>

    <div class="rs-dlg qe hs" data-t="quick-export" data-panel="quickexport">
      <div class="dlg-t">Quick Export</div>
      <div class="qe-body">
        <div class="qe-l">
          <div class="qe-h"><span>Export Settings</span><span>▦ ☰</span></div>
          <div class="qe-grid">
            ${[["h-264-master", "H.264 Master", "H.264", 1], ["hyperdeck-quick-export", "HyperDeck", "H.264"], ["h-265-master", "H.265 Master", "H.265"],
               ["prores-422-hq", "ProRes 422 HQ", "ProRes"], ["youtube-preset", "YouTube", "▶"], ["vimeo-quick-export", "Vimeo", "v"],
               ["tiktok-quick-export", "TikTok", "♪"], ["presentations-quick-export", "Presentations", "▣"], ["dropbox-quick-export", "Dropbox", "◆"],
               ["replay-quick-export", "Replay", "«"]].map(([id, n, ic, sel]) =>
              `<div class="qe-p${sel ? " sel" : ""} hs" data-t="${id}"><span class="qe-ic">${ic}</span>${n}</div>`).join("")}
          </div>
        </div>
        <div class="qe-r hs" data-t="h-264-master">
          <div class="qe-h"><span>H.264 Master</span></div>
          <div class="qe-f"><small>Filename</small><b>${H.TIMELINE}</b></div>
          <div class="qe-kv">
            <div><small>Resolution</small>3840 x 2160</div><div><small>Video Codec</small>H.264</div><div><small>Frame Rate</small>24 fps</div>
            <div><small>Audio</small>Stereo</div><div><small>Audio Codec</small>AAC</div><div><small>Duration</small>31s</div>
          </div>
          <div class="qe-lim hs" data-t="limit-data-rate"><span class="cb"></span>Limit data rate to <span class="in">80000</span> Kb/s</div>
          <div class="dlg-btns"><span class="btn hs" data-t="quick-export" data-toggle="quickexport">Cancel</span><span class="btn red hs" data-t="quick-export">Export</span></div>
        </div>
      </div>
    </div>

    <div class="rs-dlg bc hs" data-t="blackmagic-cloud-folder" data-panel="cloudfolder">
      <div class="bc-top"><b>Blackmagic Cloud Folder</b><span>Blackmagicdesign</span></div>
      <div class="bc-body">
        <div class="bc-r hs" data-t="blackmagic-cloud-folder"><span class="lb">Blackmagic Cloud Folder</span><span class="in">No Folder Selected</span><span class="btn">Select</span></div>
        <div class="bc-r hs" data-t="download-folder-location"><span class="lb">Download Folder Location</span><span class="in">C:\\Users\\…\\DaVinci Resolve Media</span><span class="btn">Browse</span></div>
        <div class="bc-r hs" data-t="sync-proxies-only"><span class="lb">For Media Files</span><span class="rd"></span>Sync Proxies Only</div>
        <div class="bc-r hs" data-t="sync-proxies-and-used-originals"><span class="lb"></span><span class="rd on"></span>Sync Proxies and Used Originals</div>
      </div>
      <div class="dlg-btns"><span class="btn hs" data-t="go-to-blackmagic-cloud">Go to Blackmagic Cloud</span><span class="sp"></span>
        <span class="btn hs" data-t="blackmagic-cloud-folder" data-toggle="cloudfolder">Cancel</span><span class="btn off hs" data-t="blackmagic-cloud-folder">Download</span></div>
    </div>
  </div>`;

})(window.RM);
