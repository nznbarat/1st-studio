/* ═════════════════════════════════════════════════════════════
   51 · Үлдсэн хуудсууд — Media, Cut, Fusion, Fairlight, Deliver, Photo
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";
  const S = RM.sim;

  /* 50-sim-pages.js доторх дотоод туслахуудыг давтахгүйн тулд
     энгийн хувилбарыг энд дахин тодорхойлно. */
  const MENU = () => `
    <div class="rs-menu">
      <span class="logo">DaVinci Resolve</span>
      <span class="mi hs" data-t="file-menu">File</span>
      <span class="mi hs" data-t="edit-menu">Edit</span>
      <span class="mi hs" data-t="timeline-menu">Timeline</span>
      <span class="mi hs" data-t="clip-menu">Clip</span>
      <span class="mi hs" data-t="mark-menu">Mark</span>
      <span class="mi hs" data-t="view-menu">View</span>
      <span class="mi hs" data-t="playback-menu">Playback</span>
      <span class="mi hs" data-t="workspace-menu">Workspace</span>
      <span class="mi hs" data-t="help-menu">Help</span>
    </div>`;

  const PAGES = (active) => {
    const list = [
      ["media","▤","Media","media-page"], ["cut","◨","Cut","cut-page"],
      ["edit","✂","Edit","edit-page"], ["fusion","⬡","Fusion","fusion-page"],
      ["color","◐","Color","color-page"], ["fairlight","♪","Fairlight","fairlight-page"],
      ["deliver","▶","Deliver","deliver-page"], ["photo","▨","Photo","photo-page"]
    ];
    return `<div class="rs-pages hs" data-t="page-bar">
      ${list.map(([id, ic, nm, term]) => `
        <span class="pg hs ${id === active ? "act" : ""} ${id === "photo" ? "new" : ""}"
              data-t="${term}" data-go="${id}"><span class="ic">${ic}</span><span class="nm">${nm}</span></span>`).join("")}
      <span class="right"><span class="rb hs" data-t="project-manager">⌂</span>
        <span class="rb hs" data-t="project-settings">⚙</span></span></div>`;
  };

  const SCREEN = (warm) => `
    <div class="vw-screen"><div class="img ${warm ? "warm" : ""}"></div></div>`;

  /* ═══════════ MEDIA ═══════════ */
  S.media = () => `
  <div class="rs" data-page="media">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg act hs" data-t="media-storage"><span class="ic">▤</span>Media Storage</span>
      <span class="tg hs" data-t="clone-tool"><span class="ic">⎘</span>Clone Tool</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="audio-sync"><span class="ic">♫</span>Audio</span>
      <span class="tg act hs" data-t="metadata-editor"><span class="ic">ⓘ</span>Metadata</span>
    </div>
    <div class="rs-body"><div class="rs-top">
      <div class="pane hs" data-t="media-storage" style="width:180px;flex-shrink:0">
        <div class="pane-h"><b>Media Storage</b></div>
        <div class="pane-b"><div style="padding:6px 8px;font-size:10.5px;color:var(--rs-dim);line-height:2">
          <div>▾ ▤ D:\\</div><div>&nbsp;&nbsp;▾ ▸ Төсөл</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;▸ Камер A</div><div>&nbsp;&nbsp;&nbsp;&nbsp;▸ Камер B</div>
          <div>&nbsp;&nbsp;&nbsp;&nbsp;▸ Дуу</div><div>&nbsp;&nbsp;&nbsp;&nbsp;▸ Хөгжим</div>
        </div></div>
      </div>
      ${["Source", "source-viewer"].length ? `
      <div class="pane vw hs" data-t="source-viewer">
        <div class="pane-h"><b>Viewer</b></div>
        <div class="pane-b" style="display:flex;flex-direction:column">${SCREEN(false)}
          <div class="vw-foot"><div class="vw-ctrl hs" data-t="transport-controls">
            <span class="tc hs" data-t="timecode">01:00:04:12</span>
            <span>◀◀</span><span style="font-size:14px">▶</span><span>▶▶</span></div></div>
        </div></div>` : ""}
      <div class="pane hs" data-t="metadata-editor" style="width:214px;flex-shrink:0">
        <div class="pane-h"><b>Metadata</b></div>
        <div class="pane-b">
          <div class="insp-sec"><div class="t">▾ Shot &amp; Scene</div>
            <div class="insp-row hs" data-t="shot"><span class="lb">Shot</span><span class="vl">14</span></div>
            <div class="insp-row hs" data-t="take"><span class="lb">Take</span><span class="vl">3</span></div>
            <div class="insp-row hs" data-t="camera"><span class="lb">Camera</span><span class="vl">A</span></div>
            <div class="insp-row hs" data-t="reel-name"><span class="lb">Reel</span><span class="vl">A001</span></div>
          </div>
          <div class="insp-sec hs" data-t="keyword"><div class="t">▾ Keywords</div>
            <div style="font-size:10px;color:var(--rs-dim);padding:2px 0">говь · нар жаргах · дрон</div></div>
          <div class="insp-sec hs" data-t="transcribe-audio"><div class="t">▸ Audio Transcription</div></div>
        </div>
      </div>
    </div>
    <div class="rs-tlbar"><span class="tl hs" data-t="scene-cut-detection">⧉</span>
      <span class="tl hs" data-t="proxy-generation">⇩</span>
      <span class="tl hs" data-t="optimized-media">⚡</span><span class="sp"></span>
      <span class="tl hs" data-t="thumbnail-view">▦</span><span class="tl hs" data-t="list-view">☰</span></div>
    <div class="rs-tl hs" data-t="media-pool" style="height:150px">
      <div class="pane-h"><b>Media Pool</b></div>
      <div style="flex:1;display:flex">
        <div class="mp-bins" style="width:110px">
          <div class="mp-bin act hs" data-t="bin">▾ Master</div>
          <div class="mp-bin hs" data-t="bin">&nbsp;&nbsp;▪ Видео</div>
          <div class="mp-bin hs" data-t="smart-bin">&nbsp;&nbsp;✦ Ухаалаг</div>
        </div>
        <div class="mp-grid" style="grid-template-columns:repeat(6,1fr)">
          <div class="mp-clip hs" data-t="clip" data-n="A001"></div>
          <div class="mp-clip hs" data-t="clip" data-n="A002"></div>
          <div class="mp-clip b hs" data-t="clip" data-n="B001"></div>
          <div class="mp-clip hs" data-t="sub-clip" data-n="Дэд"></div>
          <div class="mp-clip a hs" data-t="audio-waveform" data-n="Дуу"></div>
          <div class="mp-clip hs" data-t="offline-clip" data-n="Тасарсан"></div>
        </div>
      </div>
    </div></div>
    ${PAGES("media")}
  </div>`;

  /* ═══════════ CUT ═══════════ */
  S.cut = () => `
  <div class="rs" data-page="cut">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg act hs" data-t="media-pool"><span class="ic">▤</span>Media Pool</span>
      <span class="tg hs" data-t="sync-bin"><span class="ic">⧉</span>Sync Bin</span>
      <span class="tg hs" data-t="effects-library"><span class="ic">✦</span>Effects</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="quick-export"><span class="ic">⇧</span>Quick Export</span>
    </div>
    <div class="rs-body"><div class="rs-top">
      <div class="pane hs" data-t="source-tape" style="width:230px;flex-shrink:0">
        <div class="pane-h"><b>Source Tape</b></div>
        <div class="pane-b"><div class="mp-grid">
          <div class="mp-clip hs" data-t="clip" data-n="01"></div><div class="mp-clip hs" data-t="clip" data-n="02"></div>
          <div class="mp-clip b hs" data-t="clip" data-n="03"></div><div class="mp-clip hs" data-t="clip" data-n="04"></div>
        </div></div>
      </div>
      <div class="pane vw hs" data-t="viewer">
        <div class="pane-h"><b>Viewer</b><span class="sp"></span>
          <span class="hs" data-t="fast-review">▶▶</span><span class="hs" data-t="boring-detector">⚠</span></div>
        <div class="pane-b" style="display:flex;flex-direction:column">${SCREEN(true)}
          <div class="vw-foot"><div class="vw-ctrl hs" data-t="transport-controls">
            <span class="tc hs" data-t="timecode">01:00:12:08</span><span class="mk hs" data-t="in-point">[</span>
            <span>◀◀</span><span style="font-size:14px">▶</span><span>▶▶</span>
            <span class="mk hs" data-t="out-point">]</span></div></div>
        </div>
      </div>
    </div>
    <div class="rs-tlbar hs" data-t="toolbar-timeline">
      <span class="tl hs" data-t="smart-insert">⊟</span>
      <span class="tl hs" data-t="append-to-end">⊞</span>
      <span class="tl hs" data-t="ripple-overwrite">⊡</span>
      <span class="tl hs" data-t="close-up">⊙</span>
      <span class="tl hs" data-t="place-on-top">⊕</span>
      <span class="tl hs" data-t="source-overwrite">⊛</span>
      <span class="div"></span>
      <span class="tl hs" data-t="transition-button">◇</span>
      <span class="tl hs" data-t="speed-ramp">⟋</span>
      <span class="tl hs" data-t="trim-editor">⇹</span>
      <span class="sp"></span>
      <span class="tl hs" data-t="audio-trim">♫</span>
    </div>
    <div class="rs-tl hs" data-t="dual-timeline">
      <div class="tl-ruler hs" data-t="timeline-ruler" style="padding-left:0">
        <div class="tk"><span>Бүтэн timeline</span></div><div class="tk"></div><div class="tk"></div><div class="tk"></div></div>
      <div class="tl-row" style="height:26px">
        <div class="tl-lane" style="gap:1px">
          <div class="clip v hs" data-t="clip" style="width:60px"></div>
          <div class="clip v hs" data-t="clip" style="width:90px"></div>
          <div class="clip v sel hs" data-t="clip" style="width:70px"></div>
          <div class="clip v hs" data-t="clip" style="width:120px"></div>
          <div class="clip v hs" data-t="clip" style="width:80px"></div>
        </div>
      </div>
      <div class="tl-tracks" style="border-top:2px solid #2a2a2a">
        <div class="tl-play" style="left:34%"></div>
        <div class="tl-row"><div class="tl-head hs" data-t="track"><span class="nm">V1</span></div>
          <div class="tl-lane">
            <div class="clip v hs" data-t="clip" style="width:190px"><span class="cn">A002</span></div>
            <div class="clip v sel hs" data-t="clip" style="width:240px"><span class="cn">A003 — ойртуулсан</span></div>
          </div></div>
        <div class="tl-row aud"><div class="tl-head hs" data-t="track"><span class="nm">A1</span></div>
          <div class="tl-lane"><div class="clip a hs" data-t="clip" style="width:420px"><span class="cn">Яриа</span><span class="wf"></span></div></div></div>
      </div>
    </div></div>
    ${PAGES("cut")}
  </div>`;

  /* ═══════════ FUSION ═══════════ */
  S.fusion = () => `
  <div class="rs" data-page="fusion">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg hs" data-t="bins-fusion"><span class="ic">▤</span>Bins</span>
      <span class="tg act hs" data-t="node-graph"><span class="ic">⬡</span>Nodes</span>
      <span class="tg hs" data-t="spline-editor"><span class="ic">∿</span>Spline</span>
      <span class="tg hs" data-t="keyframe-editor"><span class="ic">◆</span>Keyframes</span>
      <span class="sp"></span>
      <span class="tg act hs" data-t="inspector-fusion"><span class="ic">◧</span>Inspector</span>
    </div>
    <div class="rs-body">
      <div class="rs-top">
        <div class="pane vw hs" data-t="viewer-1-2"><div class="pane-h"><b>Viewer 1</b></div>
          <div class="pane-b">${SCREEN(false)}</div></div>
        <div class="pane vw hs" data-t="viewer-1-2"><div class="pane-h"><b>Viewer 2</b></div>
          <div class="pane-b">${SCREEN(true)}</div></div>
        <div class="pane insp hs" data-t="inspector-fusion">
          <div class="pane-h"><b>Inspector</b></div>
          <div class="pane-b">
            <div class="insp-sec hs" data-t="delta-keyer"><div class="t">▾ DeltaKeyer1</div>
              <div class="insp-row hs" data-t="matte"><span class="lb">Matte</span>
                <span class="sl" style="--p:60%"></span><span class="vl">0.60</span></div>
              <div class="insp-row hs" data-t="spill-suppression"><span class="lb">Spill</span>
                <span class="sl" style="--p:80%"></span><span class="vl">0.80</span></div>
            </div>
            <div class="insp-sec hs" data-t="matte-control"><div class="t">▸ Matte Control</div></div>
            <div class="insp-sec hs" data-t="merge"><div class="t">▸ Merge1</div></div>
          </div>
        </div>
      </div>
      <div class="pane hs" data-t="node-graph" style="height:230px;flex-shrink:0;border-top:1px solid var(--rs-line)">
        <div class="pane-h"><b>Nodes</b><span class="sp"></span>
          <span class="hs" data-t="add-tool">＋</span><span class="hs" data-t="group">▣</span></div>
        <div class="pane-b"><div class="node-canvas">
          <div class="wire" style="left:78px;top:46px;width:44px"></div>
          <div class="wire" style="left:180px;top:46px;width:44px"></div>
          <div class="wire" style="left:282px;top:46px;width:44px"></div>
          <div class="wire" style="left:180px;top:130px;width:44px"></div>
          <div class="node hs" data-t="mediain" style="left:20px;top:25px"><span class="thumb"></span><span class="lbl">MediaIn1</span></div>
          <div class="node on hs" data-t="delta-keyer" style="left:122px;top:25px"><span class="thumb"></span><span class="lbl">DeltaKeyer1</span></div>
          <div class="node hs" data-t="merge" style="left:224px;top:25px"><span class="thumb"></span><span class="lbl">Merge1</span></div>
          <div class="node hs" data-t="mediaout" style="left:326px;top:25px"><span class="thumb"></span><span class="lbl">MediaOut1</span></div>
          <div class="node hs" data-t="background-node" style="left:122px;top:110px"><span class="thumb"></span><span class="lbl">Background1</span></div>
          <div class="node hs" data-t="text-plus-node" style="left:224px;top:110px"><span class="thumb"></span><span class="lbl">Text1</span></div>
        </div></div>
      </div>
    </div>
    ${PAGES("fusion")}
  </div>`;

  /* ═══════════ FAIRLIGHT ═══════════ */
  S.fairlight = () => `
  <div class="rs" data-page="fairlight">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg hs" data-t="media-pool"><span class="ic">▤</span>Media Pool</span>
      <span class="tg hs" data-t="sound-library"><span class="ic">♫</span>Sound Library</span>
      <span class="tg hs" data-t="adr"><span class="ic">◉</span>ADR</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="loudness-meter"><span class="ic">▮</span>Meters</span>
      <span class="tg act hs" data-t="mixer"><span class="ic">⇅</span>Mixer</span>
    </div>
    <div class="rs-body">
      <div class="rs-top">
        <div class="pane" style="flex:1">
          <div class="pane-h"><b>Timeline</b></div>
          <div class="pane-b"><div class="tl-tracks">
            <div class="tl-play" style="left:calc(92px + 30%)"></div>
            ${[["A1", "Яриа", 320], ["A2", "Орчны дуу", 400], ["A3", "Эффект", 250], ["A4", "Хөгжим", 430]]
              .map(([n, t, w]) => `
              <div class="tl-row aud">
                <div class="tl-head hs" data-t="track"><span class="nm">${n}</span>
                  <span class="ib hs" data-t="mute">M</span><span class="ib hs" data-t="solo">S</span>
                  <span class="ib hs" data-t="automation">A</span></div>
                <div class="tl-lane"><div class="clip a hs" data-t="waveform-editing" style="width:${w}px">
                  <span class="cn">${t}</span><span class="wf"></span></div></div>
              </div>`).join("")}
            <div class="tl-row aud"><div class="tl-head hs" data-t="folder-track"><span class="nm">▤</span>
              <span style="font-size:9px;color:var(--rs-dim)">Хавтас</span></div>
              <div class="tl-lane"><span style="font-size:9px;color:var(--rs-dim2);padding-left:6px">Resolve 21 — замуудыг хураах</span></div></div>
          </div></div>
        </div>
        <div class="pane hs" data-t="mixer" style="width:330px;flex-shrink:0">
          <div class="pane-h"><b>Mixer</b></div>
          <div class="pane-b"><div style="display:flex;gap:1px;height:100%;background:var(--rs-line)">
            ${["A1", "A2", "A3", "A4", "Bus 1", "Main"].map((n, i) => `
              <div class="hs" data-t="${i === 5 ? "main-bus" : i === 4 ? "sub-mix-bus" : "channel-strip"}"
                   style="flex:1;background:var(--rs-pane);display:flex;flex-direction:column;
                          align-items:center;gap:4px;padding:6px 2px;font-size:9px;color:var(--rs-dim)">
                <span style="color:var(--rs-txt)">${n}</span>
                <span class="hs" data-t="eq" style="width:26px;height:16px;background:#2c2c2c;border:1px solid #3d3d3d;
                      border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:8px">EQ</span>
                <span class="hs" data-t="compressor" style="width:26px;height:16px;background:#2c2c2c;
                      border:1px solid #3d3d3d;border-radius:2px;display:flex;align-items:center;
                      justify-content:center;font-size:7px">Dyn</span>
                <span class="hs" data-t="pan" style="width:22px;height:22px;border-radius:50%;
                      border:1px solid #4a4a4a;background:#2a2a2a"></span>
                <span class="hs" data-t="fader" style="flex:1;width:9px;background:#1b1b1b;border:1px solid #383838;
                      border-radius:3px;position:relative;min-height:40px">
                  <i style="position:absolute;left:-3px;top:38%;width:13px;height:8px;background:#9a9a9a;
                     border-radius:2px;display:block"></i></span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:8px">${i === 5 ? "0.0" : "−6.0"}</span>
              </div>`).join("")}
          </div></div>
        </div>
      </div>
      <div class="kf hs" data-t="loudness">
        <span>Loudness</span>
        <span class="hs" data-t="lufs" style="font-family:'JetBrains Mono',monospace">−14.2 LUFS</span>
        <span class="hs" data-t="true-peak" style="font-family:'JetBrains Mono',monospace">−1.3 dBTP</span>
        <span class="lane"></span>
      </div>
    </div>
    ${PAGES("fairlight")}
  </div>`;

  /* ═══════════ DELIVER ═══════════ */
  S.deliver = () => `
  <div class="rs" data-page="deliver">
    ${MENU()}
    <div class="rs-tools hs" data-t="interface-toolbar">
      <span class="tg act hs" data-t="render-settings"><span class="ic">⚙</span>Render Settings</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="render-queue"><span class="ic">≣</span>Render Queue</span>
    </div>
    <div class="rs-body"><div class="rs-top">
      <div class="pane hs" data-t="render-settings" style="width:236px;flex-shrink:0">
        <div class="pane-h"><b>Render Settings</b></div>
        <div class="pane-b">
          <div style="display:flex;gap:3px;padding:6px;flex-wrap:wrap">
            <span class="hs" data-t="youtube-preset" style="padding:3px 7px;background:#3a3a3a;border-radius:3px;font-size:9px">YouTube</span>
            <span class="hs" data-t="render-presets" style="padding:3px 7px;background:#2a2a2a;border-radius:3px;font-size:9px">Vimeo</span>
            <span class="hs" data-t="prores" style="padding:3px 7px;background:#2a2a2a;border-radius:3px;font-size:9px">ProRes</span>
            <span class="hs" data-t="custom-export" style="padding:3px 7px;background:#2a2a2a;border-radius:3px;font-size:9px">Custom</span>
          </div>
          <div class="insp-tabs"><div class="act">Video</div><div>Audio</div><div>File</div><div>Subtitle</div></div>
          <div class="insp-sec">
            <div class="insp-row hs" data-t="single-clip"><span class="lb">Гаралт</span><span class="vl">Single</span></div>
            <div class="insp-row hs" data-t="format"><span class="lb">Format</span><span class="vl">MP4</span></div>
            <div class="insp-row hs" data-t="codec"><span class="lb">Codec</span><span class="vl">H.264</span></div>
            <div class="insp-row hs" data-t="resolution-render"><span class="lb">Resolution</span><span class="vl">1920×1080</span></div>
            <div class="insp-row hs" data-t="frame-rate-render"><span class="lb">Frame rate</span><span class="vl">25</span></div>
            <div class="insp-row hs" data-t="quality"><span class="lb">Quality</span><span class="vl">Auto</span></div>
            <div class="insp-row hs" data-t="bit-rate"><span class="lb">Bit rate</span><span class="vl">20000</span></div>
          </div>
          <div class="insp-sec hs" data-t="audio-codec"><div class="t">▾ Audio</div>
            <div class="insp-row hs" data-t="audio-bit-rate"><span class="lb">AAC</span><span class="vl">320 kb/s</span></div></div>
          <div class="insp-sec hs" data-t="subtitle-export"><div class="t">▸ Subtitle Settings</div></div>
          <div class="insp-sec hs" data-t="add-to-render-queue">
            <div class="t" style="justify-content:center;background:#3a4a5a;border-radius:3px;padding:5px;color:#dce6ee">
              Add to Render Queue</div></div>
        </div>
      </div>
      <div class="pane vw hs" data-t="timeline-viewer">
        <div class="pane-h"><b>Viewer</b></div>
        <div class="pane-b" style="display:flex;flex-direction:column">${SCREEN(true)}
          <div class="vw-foot"><div class="vw-ctrl hs" data-t="transport-controls">
            <span class="tc hs" data-t="timecode">01:02:34:11</span>
            <span>◀◀</span><span style="font-size:14px">▶</span><span>▶▶</span></div></div></div>
      </div>
      <div class="pane hs" data-t="render-queue" style="width:210px;flex-shrink:0">
        <div class="pane-h"><b>Render Queue</b></div>
        <div class="pane-b"><div style="padding:7px;display:flex;flex-direction:column;gap:5px">
          <div class="hs" data-t="master-file" style="background:#272727;border:1px solid #383838;border-radius:3px;padding:6px;font-size:9.5px">
            <b style="color:var(--rs-txt)">Job 1 — Мастер</b><br>ProRes 422 HQ · 1080p</div>
          <div class="hs" data-t="deliverable" style="background:#272727;border:1px solid #383838;border-radius:3px;padding:6px;font-size:9.5px">
            <b style="color:var(--rs-txt)">Job 2 — YouTube</b><br>H.264 · 1080p25</div>
          <div class="hs" data-t="render-all" style="background:#3a4a5a;border-radius:3px;padding:6px;text-align:center;
               font-size:10px;color:#dce6ee;margin-top:4px">Render All</div>
        </div></div>
      </div>
    </div>
    <div class="rs-tl" style="height:104px">
      <div class="tl-ruler hs" data-t="timeline-ruler"><div class="tk"><span>01:00:00:00</span></div>
        <div class="tk"></div><div class="tk"></div><div class="tk"></div></div>
      <div class="tl-tracks"><div class="tl-play"></div>
        <div class="tl-row"><div class="tl-head hs" data-t="track"><span class="nm">V1</span></div>
          <div class="tl-lane"><div class="clip v hs" data-t="clip" style="width:180px"></div>
            <div class="clip v hs" data-t="clip" style="width:150px"></div>
            <div class="clip v hs" data-t="clip" style="width:210px"></div></div></div>
        <div class="tl-row aud"><div class="tl-head hs" data-t="track"><span class="nm">A1</span></div>
          <div class="tl-lane"><div class="clip a hs" data-t="clip" style="width:545px"><span class="wf"></span></div></div></div>
      </div>
    </div></div>
    ${PAGES("deliver")}
  </div>`;

  /* ═══════════ PHOTO ═══════════
     Энэ хуудсыг Resolve 21-д шинээр нэмсэн. Би бодит программ дээр
     шалгаж чадаагүй тул хуурамч байрлал зохиохоос татгалзаж,
     баримтаар баталсан зүйлийг л бичив. */
  S.photo = () => `
  <div class="rs" data-page="photo">
    ${MENU()}
    <div class="rs-tools"><span class="tg act hs" data-t="photo-page"><span class="ic">▨</span>Photo</span>
      <span class="sp"></span>
      <span class="tg hs" data-t="lightbox"><span class="ic">▦</span>Lightbox</span></div>
    <div class="rs-body"><div class="simple"><div class="ph">
      <span class="big">▨</span>
      <h3>Photo хуудас — Resolve 21-д шинэ</h3>
      <p>Энэ бол Resolve-ийн түүхэн дэх анхны бүрэн шинэ хуудас. Гэрэл зургийг оруулж,
         цомогт эмхэлж, үнэлгээ өгч, засварлаж, экспортлоно. Color хуудасны нодны хөдөлгүүр
         дээр ажилладаг тул муруй, сонгогч, хүчит цонх, бүтэн нодны засварлагч — бүгд зурган дээр ажиллана.</p>
      <p style="color:var(--rs-dim2);border-top:1px solid var(--rs-line2);padding-top:11px;margin-top:5px">
         Бусад хуудсыг эндээс шууд харж болно. Энэ хуудасны байрлалыг би бодит программ дээр
         шалгаж чадаагүй тул зохиомол зураг гаргалгүй, баталсан зүйлийг л бичлээ.
         Та Studio дээрээ хараад хэлбэл нэмнэ.</p>
      <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;justify-content:center">
        <span class="hs" data-t="photo-album" style="padding:5px 11px;border:1px solid var(--rs-line2);
              border-radius:4px;font-size:10.5px;color:var(--rs-txt)">Photo Album</span>
        <span class="hs" data-t="lightbox" style="padding:5px 11px;border:1px solid var(--rs-line2);
              border-radius:4px;font-size:10.5px;color:var(--rs-txt)">Lightbox</span>
        <span class="hs" data-t="raw" style="padding:5px 11px;border:1px solid var(--rs-line2);
              border-radius:4px;font-size:10.5px;color:var(--rs-txt)">Raw</span>
        <span class="hs" data-t="node-editor" style="padding:5px 11px;border:1px solid var(--rs-line2);
              border-radius:4px;font-size:10.5px;color:var(--rs-txt)">Node Editor</span>
      </div>
    </div></div></div>
    ${PAGES("photo")}
  </div>`;

})(window.RM);
