/* ═══ 90 · Эхлүүлэлт ═══ */
(function (RM) {
  "use strict";
  function boot() {
    RM.ui.buildRail();
    RM.ui.buildFilters();
    RM.ui.bind();
    RM.ui.renderResults();
    RM.ui.go(RM.ui.state.view);

    if (RM.dict.dupes.length) {
      console.warn("Давхардсан нэр томьёо:", RM.dict.dupes);
    }
    console.log("DaVinci Resolve — Монгол хөтөч v" + RM.version +
                " · " + RM.dict.size() + " нэр томьёо, " + RM.dict.cats.length + " ангилал");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.RM);
