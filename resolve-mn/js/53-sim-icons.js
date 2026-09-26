/* ═════════════════════════════════════════════════════════════
   53 · Загварын дүрсүүд (SVG)

   Resolve Studio 21-ийн дэлгэцийн зурагнаас (2026-09-25) хэлбэр бүрийг
   нь дагаж гараар зурсан SVG. Blackmagic-ийн эх зургийг хуулаагүй —
   ижил хэлбэр, харьцаа, өнгөтэй шинээр зурсан.
   Үндсэн өнгө нь currentColor (товчны өнгө), бараан дэвсгэр нь тогтмол.
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const S = (RM.sim = RM.sim || {});
  const DK = "#26262a";     /* товчны доторх бараан дүүргэлт */
  const FL = "#1a1a1d";     /* 3D дүрсний шал */
  const sw = (w) => `fill="none" stroke="currentColor" stroke-width="${w}"`;
  const svg = (body, vb) => `<svg viewBox="${vb || "0 0 28 24"}" width="${vb ? 22 : 22}" height="${vb ? 16 : 19}" aria-hidden="true">${body}</svg>`;
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor"/>`;
  const pt = (x, y) => `<circle cx="${x}" cy="${y}" r="1.45" fill="${DK}" stroke="currentColor" stroke-width="1"/>`;
  const FLOOR = `<path d="M2 18.5 14 13.5 26 18.5 14 23.5z" fill="${FL}"/>`;

  /* тогтмол "санамсаргүй" тоо — дүрс бүр ижил гарна */
  const rnd = (i) => { const v = Math.sin(i * 12.9898) * 43758.5453; return v - Math.floor(v); };

  /* FastNoise — жижиг нүднүүдийн сүүдэр */
  let noise = `<defs><filter id="rmFnBlur" x="0" y="0" width="100%" height="100%"><feGaussianBlur stdDeviation=".45"/></filter>
    <clipPath id="rmFnClip"><rect x="4" y="4.5" width="20" height="15"/></clipPath></defs><g filter="url(#rmFnBlur)" clip-path="url(#rmFnClip)">`;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 12; c++) {
    noise += `<rect x="${(4 + c * 1.67).toFixed(2)}" y="${(4.5 + r * 1.67).toFixed(2)}" width="1.7" height="1.7" fill="currentColor" opacity="${(0.1 + 0.75 * rnd(r * 12 + c + 1)).toFixed(2)}"/>`;
  }
  noise += "</g>";

  /* Color Corrector — цэгүүдийн цагираг */
  let ring = dot(14, 12, 1.6);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, rr = [1.6, 1.15, 1.4, 1.0, 1.5][i % 5];
    ring += dot((14 + Math.cos(a) * 7.6).toFixed(2), (12 + Math.sin(a) * 7.6).toFixed(2), rr);
  }

  /* Brightness / Contrast — туяа */
  let rays = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays += dot((14 + Math.cos(a) * 8.4).toFixed(2), (12 + Math.sin(a) * 8.4).toFixed(2), i % 2 ? 0.9 : 1.2);
  }

  /* Channel Booleans — цэгэн дүүргэлт */
  let dots = "";
  for (let y = 10.8; y < 20; y += 1.7) for (let x = 11.3; x < 23.5; x += 1.7) dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r=".45" fill="currentColor" opacity=".7"/>`;

  const scatter = (list) => list.map(([x, y, r]) => dot(x, y, r)).join("");

  S.ICON = {
    /* ── 1. Үүсгэгч, текст, будалт ── */
    "background-node": svg(`<rect x="3.5" y="4.5" width="21" height="15" rx="1" fill="${DK}" stroke="currentColor" stroke-width="1.3"/>
      <path d="M6 18 9.4 7.2M9 18l2.8-8.4M12 18l2.1-6.3M15 18l1.5-4.3M18 18l.9-2.4M21 18l.3-.9" ${sw(1.2)}/>`),
    "fastnoise": svg(noise),
    "text-plus-node": svg(`<rect x="5" y="2.5" width="18" height="19" rx="1.5" fill="#38383e"/>
      <path d="M8.5 6.5h11v3.4h-.9l-.5-1.8h-3v9.3l1.5.5v.6h-5.2v-.6l1.5-.5V8.1h-3l-.5 1.8h-.9z" fill="currentColor"/>`),
    "paint": svg(`<path d="M24.5 2.5 15 12.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M15.8 11.2 12.6 14.4c-1.3 1.3-1.1 3.6-3.2 4.8 2.6.7 5.4-.3 6.7-2.2.9-1.2 1-2.3 1.9-3.3z" fill="currentColor"/>
      <path d="M3 21c1.5-2.6 3.7-3.8 4.6-2.8.8.9-1.3 2.5-.3 3 .9.4 2.3-.5 3.4-1.2" ${sw(1.2)} stroke-linecap="round" opacity=".55"/>`),

    /* ── 2. Өнгө, бүдгэрүүлэлт ── */
    "color-corrector-fusion": svg(ring),
    "color-curves-fusion": svg(`<rect x="5" y="3.5" width="18" height="17" ${sw(1)} opacity=".75"/>
      <path d="M11 3.5v17M17 3.5v17M5 9.2h18M5 14.8h18" ${sw(0.7)} opacity=".45"/>
      <path d="M5 20.5C12 20.5 13 3.5 23 3.5" ${sw(1.5)}/>`),
    "brightness-contrast": svg(`<circle cx="14" cy="12" r="4.6" ${sw(1.6)}/><path d="M14 7.4a4.6 4.6 0 0 1 0 9.2z" fill="currentColor"/>${rays}`),
    "blur-fusion": svg(`<path d="M14 2.8C11 7.2 8 10.8 8 14.8a6 6 0 0 0 12 0c0-4-3-7.6-6-12z" fill="currentColor"/>
      <path d="M11 15.2a3.2 3.2 0 0 0 2.4 3" fill="none" stroke="${DK}" stroke-width="1.3" stroke-linecap="round"/>`),

    /* ── 3. Нийлүүлэх, хувиргах ── */
    "merge": svg(`<rect x="10.5" y="3.5" width="14" height="11" rx=".8" ${sw(1.1)} opacity=".6"/>
      <rect x="8" y="7" width="14" height="12" rx=".8" fill="#2e2e33" stroke="currentColor" stroke-width="1.3"/>
      <path d="M3 9.5v6h6.5M7.4 13.3l2.4 2.2-2.4 2.2" ${sw(1.3)}/>`),
    "multimerge": svg(`<rect x="12.5" y="3" width="13" height="11" rx=".8" ${sw(1)} opacity=".45"/>
      <rect x="10.5" y="5" width="13" height="12" rx=".8" ${sw(1)} opacity=".7"/>
      <rect x="8.5" y="7.5" width="14" height="12" rx=".8" fill="#2e2e33" stroke="currentColor" stroke-width="1.3"/>
      <path d="M3 5.5v11.5h7M3 11h7M8 9l2.2 2L8 13M8 15l2.2 2L8 19" ${sw(1.2)}/>`),
    "channel-booleans": svg(`<rect x="3.5" y="3" width="15" height="11" fill="#5c5c62"/>
      <rect x="9.5" y="9" width="15" height="12" fill="${DK}" stroke="currentColor" stroke-width="1.2"/>${dots}`),
    "matte-control": svg(`<rect x="4" y="2.5" width="20" height="13" fill="#7a7a80"/><path d="M4 2.5h12L4 15.5z" fill="#8f8f95"/>
      <circle cx="13" cy="8.8" r="4" fill="#141417"/>
      <path d="M5 20.5h18" ${sw(1)}/>${dot(13, 20.5, 1.5)}`),
    "transform-fusion": svg(`<rect x="6" y="6.5" width="16" height="12" rx="1" fill="#2e2e33" stroke="currentColor" stroke-width="1.3"/>
      <path d="M17.5 3.2a5 5 0 0 1 7 4.3M22.4 6.2l2.1 1.8 1.6-2.3M10.5 21.8a5 5 0 0 1-7-4.3M5.6 18.8 3.5 17l-1.6 2.3" ${sw(1.3)}/>`),

    /* ── 4. Маск ── */
    "rectangle-mask": svg(`<rect x="7" y="5" width="14" height="14" ${sw(1.2)}/>${pt(7, 5)}${pt(21, 5)}${pt(7, 19)}${pt(21, 19)}`),
    "ellipse-mask": svg(`<circle cx="14" cy="12" r="7" ${sw(1.2)}/>${pt(14, 5)}${pt(21, 12)}${pt(14, 19)}${pt(7, 12)}`),
    "polygon-mask": svg(`<path d="M12 12 17.5 4M12 12l11 3.5M12 12 4 17.5M12 12l.5 9" ${sw(1.1)}/>${pt(12, 12)}${pt(17.5, 4)}${pt(23, 15.5)}${pt(4, 17.5)}${pt(12.5, 21)}`),
    "b-spline-mask": svg(`<path d="M4 19C8 7.5 20 7.5 24 19" ${sw(1.2)}/>${pt(4, 19)}${pt(9.5, 7)}${pt(18.5, 7)}${pt(24, 19)}`),
    "multipoly": svg(`<path d="M3 9c3-4.5 6 3 9 0s6-4.5 9 0l3-1.5M3 17c3 4.5 6-3 9 0s6 4.5 9 0l3 1.5" ${sw(1.1)}/>
      ${pt(3, 9)}${pt(12, 8.2)}${pt(21, 8)}${pt(25, 7)}${pt(3, 17)}${pt(12, 17.8)}${pt(24.5, 18.5)}`),

    /* ── 5. Бөөмс ── */
    "particle-emitter": svg(`<path d="M4 19.5 10 16.5 17 18.5 11 21.5z" ${sw(1)}/>
      ${scatter([[10, 18.4, 1], [11.5, 15, .9], [13.5, 13, 1], [10, 11.5, .8], [15.5, 10, .9], [12.5, 8, .8], [17.5, 7, .9], [14.5, 5, .8], [19.5, 4, .8], [17, 2.8, .7], [20.5, 9.2, .8], [18.5, 12.3, .8], [8.5, 14.2, .7], [22, 6, .7]])}`),
    "pdirectionalforce": svg(`${scatter([[8, 3, .9], [11, 2.4, .8], [14, 3.4, .9], [17, 2.4, .8], [20, 3.4, .9], [10, 6, .8], [13, 5.4, .9], [16, 6, .8], [19, 6, .8], [22.5, 5.5, .7]])}
      <path d="M9 21a4 4 0 1 1 3.2-6.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M19 10.5v10M14 15.5h10M17.6 11.9l1.4-1.4 1.4 1.4M17.6 19.1l1.4 1.4 1.4-1.4M15.4 14.1 14 15.5l1.4 1.4M22.6 14.1l1.4 1.4-1.4 1.4" ${sw(1)}/>`),
    "prender": svg(`<rect x="7" y="4" width="16" height="11" fill="#303035"/>
      <path d="M4 8V3h4.5M24 15v5h-4.5" ${sw(1.2)}/>
      ${scatter([[10, 6.5, .8], [13, 5.5, .8], [16.5, 7, .9], [12, 9, .8], [15, 9.8, .8], [18.5, 8.5, .8], [20.5, 10.8, .8], [17.5, 12.3, .8], [14, 12, .7], [20, 5.5, .7]])}
      <path d="M4 21.5 11 14" ${sw(1.1)} stroke-dasharray="1.2 1.6"/>`),

    /* ── 6. 3D ── */
    "image-plane-3d": svg(`${FLOOR}<path d="M10 17.5V7l8.5-3.5v10.8z" fill="currentColor"/><path d="M10 17.5 18.5 14.3" stroke="${DK}" stroke-width=".8"/>`),
    "shape-3d": svg(`${FLOOR}<path d="M5.5 15.5 9.5 4.5l4 11z" fill="currentColor" opacity=".8"/>
      <path d="M16 9.5 20 8l4 1.5v5L20 16l-4-1.5z" fill="currentColor" opacity=".7"/><path d="M16 9.5 20 11l4-1.5M20 11v5" stroke="${DK}" stroke-width=".8" fill="none"/>
      <circle cx="14" cy="15.5" r="4.3" fill="currentColor"/>`),
    "text-3d": svg(`${FLOOR}<path d="M9.5 3.8h11.2l-.5 3.5h-.8l-.2-1.7h-3.2l-1.3 10.2 1.4.5-.1.8h-4.9l.1-.8 1.5-.5 1.3-10.2h-3.1l-.6 1.7h-.8z" fill="currentColor"/>
      <path d="M20.7 3.8l.8.8-.5 3.5h-.8M15.3 16.3l.8.6" stroke="currentColor" stroke-width=".9" fill="none" opacity=".6"/>`),
    "merge-3d": svg(`${FLOOR}<path d="M4 8.5v6h6.5M8.2 12.3l2.4 2.2-2.4 2.2" ${sw(1.4)}/><circle cx="18" cy="13.8" r="4.6" fill="currentColor"/>`),
    "camera-3d": svg(`${FLOOR}<path d="M5.5 7.5 14.5 5.5l5 2v8l-9 2-5-2z" fill="#2e2e33" stroke="currentColor" stroke-width="1.2"/>
      <path d="M19.5 9.5l4.5-2.2v8.2l-4.5-1.7z" ${sw(1.2)}/><rect x="8.2" y="9.3" width="4" height="3" ${sw(1)}/>`),
    "spot-light": svg(`${FLOOR}<path d="M5.5 7.8 9.5 6v8.4l-4-1.6z" fill="currentColor"/><circle cx="12.8" cy="10.2" r="4.3" fill="#2e2e33" stroke="currentColor" stroke-width="1.5"/>
      <path d="M19 6.3l2.6-1.6M20 10.2h3.2M19 14.1l2.6 1.6M12.8 16.8v2.4" ${sw(1.3)} stroke-linecap="round"/>`),
    "renderer-3d": svg(`${FLOOR}<path d="M4 8V3.5h4.5M24 8V3.5h-4.5" ${sw(1.2)}/>
      <path d="M8 13.5a6 6 0 0 1 12 0z" fill="currentColor"/><path d="M8 13.5h12a6 6 0 0 1-12 0z" fill="#56565c"/>`),

    /* ── Fusion Inspector ── */
    "insp-image": svg(`<rect x="3" y="2" width="22" height="15" fill="${DK}" stroke="currentColor" stroke-width="1.2"/>${dot(9, 6.5, 1.5)}
      <path d="M1.5 12 7 9.5l6 3.5 6-4.5 7.5 5.5" ${sw(1.2)}/>`, "0 0 28 20"),
    "insp-audio": svg(`<rect x="3" y="2" width="19" height="15" fill="${DK}" stroke="currentColor" stroke-width="1.2" opacity=".8"/>
      <path d="M7.5 7h3M9 5.5v3M14.5 3.5h2.6M15.8 2.2v2.6M10.5 12h2.6M11.8 10.7v2.6" ${sw(1)}/>
      <path d="M17.5 17.5 24.5 5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>`, "0 0 28 20"),
    "insp-settings": svg(`<rect x="3" y="2" width="20" height="14" fill="#3a3a40" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="21.5" cy="14.5" r="3.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="1.4 1.5"/>
      <circle cx="21.5" cy="14.5" r="2.7" fill="currentColor"/><circle cx="21.5" cy="14.5" r="1.1" fill="#1e1e22"/>`, "0 0 28 20"),
    "hdr-versions": svg(`<rect x="3" y="7" width="13" height="10" ${sw(1.2)}/><path d="M6.5 7V3.5h13v10H16" ${sw(1.2)}/>`, "0 0 24 20"),
    "hdr-pin": svg(`<path d="M13 2.5l7 7-2.2.6-3.4 3.4-.2 3.5-7.2-7.2 3.5-.2 3.4-3.4z" fill="currentColor"/><path d="M8.6 13.4 3.5 18.5" ${sw(1.6)} stroke-linecap="round"/>`, "0 0 24 20"),
    "hdr-lock": svg(`<rect x="5" y="9" width="13" height="9" rx="1.2" ${sw(1.4)}/><path d="M8 9V6a3.5 3.5 0 0 1 7 0" ${sw(1.4)}/>`, "0 0 24 20"),
    "hdr-reset": svg(`<path d="M5.5 10a6.5 6.5 0 1 0 2-4.7" ${sw(1.4)}/><path d="M5 2.5v4h4" ${sw(1.4)}/><path d="M12 7v6M9 10h6" ${sw(1.3)}/>`, "0 0 24 20"),

    /* ═══ Edit хуудасны timeline хэрэгслийн мөр (2026-09-26-ны зургаас, зүүнээс баруун) ═══ */
    "timeline-view-options": svg(`<path d="M4 6h15M4 10.5h15M4 15h8" ${sw(1.6)}/><path d="M14.5 16.5l3 3 6.5-7" ${sw(1.8)} stroke-linecap="round" stroke-linejoin="round"/>`),
    "show-keyframe-tray": svg(`<path d="M10 5.5 16.5 12 10 18.5 3.5 12z" ${sw(1.4)}/><path d="M18 5.5 24.5 12 18 18.5 11.5 12z" fill="currentColor" opacity=".85"/>`),
    "voiceover": svg(`<rect x="10.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M7.5 11.5a6.5 6.5 0 0 0 13 0M14 18v3.5M10.5 21.5h7" ${sw(1.5)} stroke-linecap="round"/>`),
    "selection-mode": svg(`<path d="M9 3v16.5l4.2-4.1 3.1 6.1 2.7-1.3-3.1-6h5.8z" fill="currentColor"/>`),
    "trim-edit-mode": svg(`<rect x="3" y="6" width="8.5" height="12" ${sw(1.4)}/><rect x="16.5" y="6" width="8.5" height="12" ${sw(1.4)}/><path d="M14 3.5v17" ${sw(1.6)}/><path d="M11.5 10l2 2-2 2M16.5 10l-2 2 2 2" ${sw(1.2)}/>`),
    "blade": svg(`<rect x="3" y="8" width="22" height="8.5" rx="1.5" ${sw(1.4)}/><path d="M7 12.2h3M12.5 12.2h3M18 12.2h3" stroke="currentColor" stroke-width="2.4"/><path d="M3 12.2h1.2M23.8 12.2H25" ${sw(1)}/>`),
    "dynamic-trim-mode-slip": svg(`<path d="M14 3.5v17" ${sw(1.6)}/><path d="M9.5 8l-4 4 4 4M18.5 8l4 4-4 4" ${sw(1.6)} stroke-linecap="round" stroke-linejoin="round"/><path d="M3 5v14M25 5v14" ${sw(1)} stroke-dasharray="1.6 1.6"/>`),
    "insert": svg(`<rect x="10" y="2" width="8" height="6.5" fill="currentColor"/><path d="M14 9v3.5M12 11l2 2 2-2" ${sw(1.3)}/><rect x="2" y="14" width="9.5" height="7.5" ${sw(1.4)}/><rect x="16.5" y="14" width="9.5" height="7.5" ${sw(1.4)}/><path d="M12.5 17.7h3" ${sw(1)} stroke-dasharray="1 1"/>`),
    "overwrite": svg(`<rect x="3" y="12" width="22" height="9.5" ${sw(1.4)}/><rect x="9.5" y="2.5" width="9" height="7" ${sw(1.4)}/><rect x="9.5" y="12" width="9" height="9.5" fill="currentColor" opacity=".85"/><path d="M14 9.5v2.5" ${sw(1.4)}/>`),
    "replace": svg(`<rect x="3" y="13" width="22" height="8.5" ${sw(1.4)}/><rect x="9.5" y="2.5" width="9" height="7" fill="currentColor" opacity=".85"/><path d="M6.5 11V6.5h2.5M21.5 11V6.5H19" ${sw(1.3)}/><path d="M5 9.5l1.5 1.8 1.5-1.8M20 9.5l1.5 1.8 1.5-1.8" ${sw(1.1)}/>`),
    "snapping": svg(`<path d="M19.5 5.5a8 8 0 1 0 1.8 8.6" ${sw(2.2)} stroke-linecap="round"/><path d="M17.5 3.5l3.5 1.8-1.4 3.6" ${sw(1.6)} stroke-linecap="round" stroke-linejoin="round"/>`),
    "linked-selection": svg(`<path d="M12.2 15.8l-2.6 2.6a3.4 3.4 0 0 1-4.8-4.8l3.6-3.6a3.4 3.4 0 0 1 4.8 0" ${sw(2)} stroke-linecap="round"/><path d="M15.8 8.2l2.6-2.6a3.4 3.4 0 0 1 4.8 4.8l-3.6 3.6a3.4 3.4 0 0 1-4.8 0" ${sw(2)} stroke-linecap="round"/>`),
    "position-lock": svg(`<rect x="7" y="10.5" width="14" height="10.5" rx="1.4" ${sw(1.5)}/><path d="M10 10.5V7.5a4 4 0 0 1 8 0v3" ${sw(1.5)}/><path d="M10 14h8M10 17.5h8" ${sw(1.2)}/>`),
    "flag": svg(`<path d="M9 3.5h11v16l-5.5-3.6L9 19.5z" fill="#3a8cf2"/>`),
    "marker": svg(`<path d="M8.5 4.5h11v9.5L14 19.5l-5.5-5.5z" fill="#3a8cf2"/>`),
    "full-extent-zoom": svg(`<rect x="2.5" y="4.5" width="19" height="12" ${sw(1.4)}/><path d="M5.5 8.5h13M5.5 12.5h8" ${sw(1.2)}/><circle cx="20" cy="15.5" r="3.6" fill="${DK}" ${sw(1.6)}/><path d="M22.6 18.1l3 3" ${sw(2)} stroke-linecap="round"/>`),
    "detail-zoom": svg(`<path d="M3 6h14M3 10h10M3 14h8M3 18h8" ${sw(1.3)}/><circle cx="18.5" cy="14.5" r="4" ${sw(1.6)}/><path d="M21.4 17.4l3.2 3.2" ${sw(2)} stroke-linecap="round"/>`),
    "custom-zoom": svg(`<path d="M3 7h22M5 7v4M9 7v2.5M13 7v4M17 7v2.5M21 7v4" ${sw(1.2)}/><circle cx="18.5" cy="15.5" r="3.6" fill="${DK}" ${sw(1.6)}/><path d="M21.1 18.1l3 3" ${sw(2)} stroke-linecap="round"/>`),
    /* ═══ Color viewer — wipe-ийн хэлбэр (2026-09-26-ны зургаас) ═══ */
    "horizontal-wipe": svg(`<path d="M14 4v16" ${sw(1.8)}/><path d="M10.5 8.5 7 12l3.5 3.5z" fill="currentColor"/><path d="M17.5 8.5 21 12l-3.5 3.5z" fill="currentColor"/>`),
    "vertical-wipe": svg(`<path d="M5 12h18" ${sw(1.8)}/><path d="M10.5 9.5 14 5.5l3.5 4zM10.5 14.5 14 18.5l3.5-4z" fill="currentColor"/>`),
    "diagonal-wipe": svg(`<path d="M7 5.5h7l7 13h-7z" fill="currentColor" opacity=".55"/><path d="M6 4.5l16 15" ${sw(1.8)}/>`),
    "mix-wipe": svg(`<path d="M4 6l9 6-9 6zM24 6l-9 6 9 6z" fill="currentColor"/>`),
    "alpha-wipe": svg(`<rect x="5" y="6" width="9" height="12" fill="currentColor"/>` + [0, 1, 2].map((r) => [0, 1, 2].map((c) => ((r + c) % 2 ? "" : `<rect x="${14 + c * 3}" y="${6 + r * 4}" width="3" height="4" fill="currentColor" opacity=".7"/>`)).join("")).join("")),
    "ab-wipe": svg(`<text x="14" y="16" text-anchor="middle" font-size="10" font-family="Inter,Arial,sans-serif" fill="currentColor">A/B</text>`),
    "box-wipe": svg(`<rect x="4" y="6" width="20" height="12" rx="1" ${sw(1.4)}/><rect x="12" y="9" width="8" height="5" fill="currentColor"/><rect x="6" y="9" width="5" height="6" fill="currentColor" opacity=".45"/>`),
    "venetian-blind-wipe": svg(`<rect x="4" y="5" width="20" height="14" ${sw(1.2)}/><path d="M4 8.5h20M4 12h20M4 15.5h20" ${sw(1.2)}/>`),
    "checker-board-wipe": svg(`<rect x="4" y="5" width="20" height="14" ${sw(1.2)}/>` + [0, 1, 2].map((r) => [0, 1, 2, 3, 4].map((c) => ((r + c) % 2 ? `<rect x="${4 + c * 4}" y="${5 + r * 4.67}" width="4" height="4.67" fill="currentColor" opacity=".6"/>` : "")).join("")).join("")),
    "jog-wheel": svg(`<path d="M7 8.5 3.5 12 7 15.5M21 8.5l3.5 3.5-3.5 3.5" ${sw(1.5)} stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="12" r="3.2" fill="currentColor"/>`)
  };

  /* Нэр → SVG; байхгүй бол тэмдэгт буцаана */
  S.icon = (key, fallback) => S.ICON[key] || fallback || "";
})(window.RM);
