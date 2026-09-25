/* ═══ 15 · Жишээтэй заавартай нэр томьёонууд ═══
   Эдгээрийн картанд (толь) болон тайлбарт (загвар) "Жишээтэй заавар" холбоос гарна.
   Эх нь fusion-zaavar.html — Fusion хэрэгслийн мөрийн 28 товч. */
(function (RM) {
  "use strict";
  RM.guideFusion = ["background-node", "fastnoise", "text-plus-node", "paint",
    "color-corrector-fusion", "color-curves-fusion", "brightness-contrast", "blur-fusion",
    "merge", "multimerge", "channel-booleans", "matte-control", "transform-fusion",
    "rectangle-mask", "ellipse-mask", "polygon-mask", "b-spline-mask", "multipoly",
    "particle-emitter", "pdirectionalforce", "prender",
    "image-plane-3d", "shape-3d", "text-3d", "merge-3d", "camera-3d", "spot-light", "renderer-3d"];
  RM.guideLink = (id) => RM.guideFusion.indexOf(id) !== -1 ? "fusion-zaavar.html#" + id : null;
})(window.RM);
