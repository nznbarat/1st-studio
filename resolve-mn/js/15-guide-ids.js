/* ═══ 15 · Жишээтэй заавартай нэр томьёонууд ═══
   Эдгээрийн картанд (толь) болон тайлбарт (загвар) "Жишээтэй заавар" холбоос гарна.
   Эх нь fusion-zaavar.html — Fusion хэрэгслийн мөрийн 28 товч,
         edit-zaavar.html   — Edit хуудасны timeline-ийн мөр, viewer-ийн удирдлага (26). */
(function (RM) {
  "use strict";
  RM.guideFusion = ["background-node", "fastnoise", "text-plus-node", "paint",
    "color-corrector-fusion", "color-curves-fusion", "brightness-contrast", "blur-fusion",
    "merge", "multimerge", "channel-booleans", "matte-control", "transform-fusion",
    "rectangle-mask", "ellipse-mask", "polygon-mask", "b-spline-mask", "multipoly",
    "particle-emitter", "pdirectionalforce", "prender",
    "image-plane-3d", "shape-3d", "text-3d", "merge-3d", "camera-3d", "spot-light", "renderer-3d"];
  RM.guideEdit = ["selection-mode", "trim-edit-mode", "blade", "dynamic-trim-mode-slip",
    "insert", "overwrite", "replace", "snapping", "linked-selection", "position-lock",
    "flag", "marker", "full-extent-zoom", "detail-zoom", "custom-zoom",
    "timeline-view-options", "show-keyframe-tray", "voiceover",
    "transform", "crop", "dynamic-zoom", "open-fx-overlay", "fusion-overlay", "annotations", "smart-reframe", "jog-wheel"];
  RM.guideLink = (id) => RM.guideFusion.indexOf(id) !== -1 ? "fusion-zaavar.html#" + id
    : RM.guideEdit.indexOf(id) !== -1 ? "edit-zaavar.html#" + id : null;
})(window.RM);
