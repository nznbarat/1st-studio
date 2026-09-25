/* ═══ 90 · Эхлүүлэлт ═══ */
(function (RM) {
  "use strict";
  function boot() {
    RM.ui.buildRail();
    RM.ui.buildFilters();
    RM.ui.bind();

    /* Гаднаас ирсэн хайлт: ?q=... (интерфейсийн загвараас ийм холбоос ирдэг) */
    /* Нийтэлсэн хуудсанд ?q= хүрдэггүй тул #нэр-томьёоны-id-г ч хүлээн авна */
    let q = new URLSearchParams(location.search).get("q");
    const hid = decodeURIComponent(location.hash.slice(1));
    if (!q && hid && RM.dict.byId[hid]) q = RM.dict.byId[hid].en;
    if (q) {
      RM.ui.state.view = "hailt";
      RM.ui.state.q = q;
      const input = RM.$("#q");
      if (input) input.value = q;
      const clear = RM.$("#qclear");
      if (clear) clear.classList.add("on");
    }

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
