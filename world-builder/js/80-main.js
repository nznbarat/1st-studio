/* ═════════════════════════════════════════════════════════════
   Холболт ба эхлүүлэлт.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const U = WB.util;
  const S = WB.state;
  const UI = WB.ui;
  const AU = WB.auto;
  const el = U.el;

  /* ── дээд мөр ───────────────────────────────────────────── */
  el("projTitle").addEventListener("input", (e) => {
    S.P.title = e.target.value;
    S.touch();
  });

  el("status").onclick = () => {
    const st = WB.api.state;
    if (st.mode === "off" || st.mode === "unknown") {
      UI.setStatus();
      WB.api.probe().then(UI.setStatus);
      U.toast("Холболтыг дахин шалгаж байна…", "info");
      return;
    }
    st.forceOffline = !st.forceOffline;
    UI.setStatus();
    U.toast(st.forceOffline ? "Офлайн толь руу шилжлээ" : "AI орчуулга идэвхжлээ", "info");
  };

  /* ── тохиргооны цонх ────────────────────────────────────── */
  const modal = el("modal");
  el("gear").onclick = () => openModal();
  el("closeModal").onclick = () => modal.classList.remove("on");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("on");
  });

  function openModal(msg) {
    modal.classList.add("on");
    const out = el("testOut");
    if (msg) {
      out.className = "on bad";
      out.textContent = msg;
    }
    el("apiKey").focus();
  }
  WB.on("api:need", () =>
    openModal("Энэ боломж Claude холболт шаардана. API түлхүүрээ оруулаад «Холболт шалгах» дарна уу.")
  );

  el("apiKey").addEventListener("input", (e) => WB.api.setKey(e.target.value));
  el("rememberKey").addEventListener("change", (e) => {
    WB.api.rememberKey(e.target.checked);
    U.toast(e.target.checked ? "Түлхүүрийг энэ хөтчид хадгална" : "Түлхүүрийг хадгалахаа болилоо", "info");
  });
  const modelSel = el("modelIn");
  WB.api.MODELS.forEach(([id, lb]) => {
    const o = document.createElement("option");
    o.value = id;
    o.textContent = lb;
    modelSel.appendChild(o);
  });
  modelSel.value = WB.api.state.model;
  modelSel.addEventListener("change", (e) => WB.api.setModel(e.target.value));

  el("testBtn").onclick = async (e) => {
    const out = el("testOut");
    await UI.withBtn(e.target, "Шалгаж байна…", async () => {
      out.className = "on";
      out.textContent = "…";
      const mode = await WB.api.probe();
      if (mode === "off") {
        out.className = "on bad";
        out.textContent =
          "✗ Холбогдож чадсангүй: " +
          (WB.api.state.lastError || "тодорхойгүй алдаа") +
          "\nТүлхүүр зөв эсэх, дансанд кредит байгаа эсэхийг шалгаарай. Офлайн толь ажилласаар байна.";
      } else {
        out.className = "on good";
        out.textContent =
          "✓ Холбогдлоо (" +
          (mode === "proxy" ? "серверийн прокси — түлхүүр шаардахгүй" : "таны API түлхүүр") +
          "). Загвар: " +
          WB.api.state.model;
      }
      UI.setStatus();
    });
  };

  /* ── 0. АВТО САМБАР ─────────────────────────────────────── */
  el("autoRun").onclick = async (e) => {
    const idea = el("autoIdea").value.trim();
    if (!idea) {
      U.toast("Эхлээд санаагаа монголоор бичнэ үү", "bad");
      el("autoIdea").focus();
      return;
    }
    if (!AU.needAI()) return;
    const cfg = {
      idea: idea,
      genre: el("autoGenre").value.trim(),
      scenes: Number(el("autoScenes").value) || 6,
      cast: Number(el("autoCast").value) || 3,
      locs: Number(el("autoLocs").value) || 3,
      shots: el("autoShots").checked ? Number(el("shotCount").value) || 4 : 0,
      polish: el("autoPolish").checked,
      keep: el("autoKeep").checked,
      target: el("targetSel").value
    };
    autoBar = UI.progress("Эхэлж байна…");
    el("autoLog").innerHTML = "";
    el("autoRun").disabled = true;
    el("autoStop").classList.add("on");
    try {
      const ok = await AU.pipeline(cfg);
      UI.renderAll();
      if (ok) {
        U.toast("Ертөнц бэлэн боллоо ✓", "good");
        UI.goto("out");
      } else U.toast("Зогсоолоо", "info");
    } catch (err) {
      U.toast("Автомат гүйлт тасарлаа: " + err.message, "bad");
    } finally {
      autoBar.done();
      autoBar = null;
      el("autoRun").disabled = false;
      el("autoStop").classList.remove("on");
    }
  };

  /* автомат гүйлтийн явцыг нэг л удаа сонсоно */
  let autoBar = null;
  WB.on("auto:step", (s) => {
    if (autoBar) autoBar.label(s.label + "  (" + s.done + "/" + s.total + ")");
    const fill = el("progressFill");
    if (fill) fill.style.width = Math.max(4, Math.round((s.done / s.total) * 100)) + "%";
    const log = el("autoLog");
    if (!log) return;
    const line = document.createElement("div");
    line.className = "logline";
    line.textContent = s.label;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  });
  el("autoStop").onclick = () => {
    AU.cancel();
    U.toast("Зогсоох хүсэлт илгээлээ…", "info");
  };

  ["autoScenes", "autoCast", "autoLocs", "shotCount"].forEach((id) => {
    const inp = el(id);
    const out = el(id + "Val");
    const upd = () => out && (out.textContent = inp.value);
    inp.addEventListener("input", upd);
    upd();
  });

  U.qsa(".genrechip").forEach((c) => {
    c.onclick = () => {
      el("autoGenre").value = c.dataset.g;
      U.qsa(".genrechip").forEach((x) => x.classList.toggle("on", x === c));
    };
  });

  /* ── алхмуудын товчлуурууд ──────────────────────────────── */
  U.qsa(".step").forEach((b) => (b.onclick = () => UI.goto(b.dataset.p)));

  el("addScene").onclick = () => {
    S.pushHistory();
    S.P.scenes.push(S.newScene());
    S.touch();
    UI.renderAll();
  };
  el("addCast").onclick = () => {
    S.pushHistory();
    S.P.cast.push(S.newCast());
    S.touch();
    UI.renderAll();
  };
  el("addLoc").onclick = () => {
    S.pushHistory();
    S.P.locs.push(S.newLoc());
    S.touch();
    UI.renderAll();
  };

  el("trAllStory").onclick = () => UI.translatePending(["logline", "scene", "shot"]);
  el("trAllCast").onclick = () => UI.translatePending(["char"]);
  el("trAllLoc").onclick = () => UI.translatePending(["loc"]);
  el("trEverything").onclick = () => UI.translatePending(null);
  el("retrAll").onclick = async () => {
    if (await U.confirm("Бүх талбарыг дахин орчуулах уу? Гараар зассан хэсэг ч дарагдана.", "Дахин орчуулах")) {
      S.pushHistory();
      UI.translatePending(null, true);
    }
  };

  el("aiScenes").onclick = async (e) => {
    if (!AU.needAI()) return;
    const lg = (S.P.logline.mn || "").trim();
    if (!lg) {
      U.toast("Эхлээд логлайнаа монголоор бичнэ үү", "bad");
      return;
    }
    await UI.withBtn(e.target, "Бодож байна…", async () => {
      S.pushHistory();
      const world = await AU.buildWorld(lg, {
        scenes: Math.min(4, Number(el("autoScenes").value) || 3),
        cast: 0,
        locs: 0
      });
      AU.mergeWorld({ scenes: world.scenes }, { keep: true });
      UI.renderAll();
      await UI.translatePending(["scene"]);
    });
  };

  el("extractBtn").onclick = async (e) => {
    if (!AU.needAI()) return;
    await UI.withBtn(e.target, "Уншиж байна…", async () => {
      S.pushHistory();
      const n = await AU.extractEntities();
      AU.autoLink();
      UI.renderAll();
      if (n) {
        await UI.translatePending(["char", "loc"]);
        U.toast(n + " шинэ дүр/байршил нэмэгдлээ", "good");
      } else U.toast("Шинэ дүр, байршил олдсонгүй", "info");
    });
  };

  el("linkBtn").onclick = () => {
    const n = AU.autoLink();
    UI.renderAll();
    U.toast(n ? n + " холбоос үүслээ" : "Шинэ холбоос олдсонгүй", n ? "good" : "info");
  };

  el("expandAll").onclick = async (e) => {
    if (!AU.needAI()) return;
    const bar = UI.progress("Дэлгэрүүлж байна…");
    await UI.withBtn(e.target, "Ажиллаж байна…", async () => {
      S.pushHistory();
      const n = await AU.expandAllEmpty((d, t) => bar.set(d, t));
      UI.renderAll();
      if (n) await UI.translatePending(["char", "loc"]);
      U.toast(n ? n + " карт дүүрлээ" : "Хоосон талбар алга", "good");
    });
    bar.done();
  };

  el("shotsAll").onclick = async (e) => {
    if (!AU.needAI()) return;
    const bar = UI.progress("Кадр гаргаж байна…");
    await UI.withBtn(e.target, "Ажиллаж байна…", async () => {
      S.pushHistory();
      await AU.shotsForAll(Number(el("shotCount").value) || 4, (d, t) => bar.set(d, t));
      UI.renderAll();
      await UI.translatePending(["shot"]);
    });
    bar.done();
  };

  /* ── промтын тохиргоо ───────────────────────────────────── */
  U.qsa(".stl").forEach((c) =>
    c.addEventListener("change", () => {
      S.P.opts.styles = U.qsa(".stl:checked").map((x) => x.value);
      S.touch();
      UI.renderOut();
    })
  );
  el("targetSel").addEventListener("change", (e) => {
    S.P.opts.target = e.target.value;
    S.touch();
    UI.renderOut();
  });
  el("arSel").addEventListener("change", (e) => {
    S.P.opts.ar = e.target.value;
    S.touch();
    UI.renderOut();
  });
  el("negIn").addEventListener("input", (e) => {
    S.P.opts.negative = e.target.value;
    S.touch();
    UI.renderOut();
  });
  el("contChk").addEventListener("change", (e) => {
    S.P.opts.continuity = e.target.checked;
    S.touch();
    UI.renderOut();
  });
  el("autoTrChk").addEventListener("change", (e) => {
    S.P.opts.autoTranslate = e.target.checked;
    S.touch();
  });

  el("polishBtn").onclick = async (e) => {
    if (!AU.needAI()) return;
    const bar = UI.progress("Өнгөлж байна…");
    await UI.withBtn(e.target, "Ажиллаж байна…", async () => {
      S.pushHistory();
      const n = await AU.polishAll(S.P.opts.target, (d, t) => bar.set(d, t));
      UI.renderAll();
      U.toast(n + " промт өнгөлөгдлөө ✓", "good");
    });
    bar.done();
  };
  el("unpolishBtn").onclick = () => {
    const n = AU.clearPolish();
    UI.renderAll();
    U.toast(n ? "Өнгөлөлт цуцлагдлаа" : "Өнгөлсөн промт алга", "info");
  };

  el("checkBtn").onclick = async (e) => {
    if (!AU.needAI()) return;
    await UI.withBtn(e.target, "Шалгаж байна…", async () => {
      const list = await AU.continuityCheck();
      const box = el("checkOut");
      box.innerHTML = "";
      box.classList.add("on");
      if (!list.length) {
        box.innerHTML = '<p class="note">Зөрчил олдсонгүй ✓</p>';
        return;
      }
      list.forEach((it) => {
        const d = document.createElement("div");
        d.className = "issue " + (it.level === "алдаа" ? "err" : it.level === "санамж" ? "warn" : "tip");
        const b = document.createElement("b");
        b.textContent = (it.where || "—") + ": ";
        d.appendChild(b);
        d.appendChild(document.createTextNode(it.text || ""));
        box.appendChild(d);
      });
    });
  };

  /* ── экспорт ────────────────────────────────────────────── */
  el("copyAll").onclick = (e) => UI.copy(WB.prompt.asText(), e.target);
  el("expMd").onclick = () => S.download(U.slug(S.P.title) + ".md", WB.prompt.asMarkdown(), "text/markdown");
  el("expCsv").onclick = () => S.download(U.slug(S.P.title) + ".csv", WB.prompt.asCSV(), "text/csv");
  el("expTxt").onclick = () => S.download(U.slug(S.P.title) + "-prompts.txt", WB.prompt.asText(), "text/plain");

  /* ── толь ───────────────────────────────────────────────── */
  el("dictSearch").addEventListener("input", U.debounce(() => UI.runDictSearch(), 160));
  el("addWord").onclick = () => {
    const cl = el("customList");
    const row = document.createElement("div");
    row.className = "drow";
    row.innerHTML =
      '<input class="mn" placeholder="монгол үг…"><span class="ar">→</span><input class="en" placeholder="english…"><button class="xbtn">✓</button>';
    const mn = row.querySelector(".mn");
    const en = row.querySelector(".en");
    row.querySelector(".xbtn").onclick = () => {
      const m = mn.value.trim().toLowerCase();
      const e = en.value.trim();
      if (m && e) {
        S.P.custom[m] = e;
        S.touch();
        UI.renderDict();
      }
    };
    en.onkeydown = (ev) => {
      if (ev.key === "Enter") row.querySelector(".xbtn").onclick();
    };
    cl.appendChild(row);
    mn.focus();
  };

  el("fillUnknown").onclick = async (e) => {
    if (!AU.needAI()) return;
    const words = [...WB.tr.unknown].filter((w) => !S.P.custom[w]);
    if (!words.length) {
      U.toast("Таниагүй үг алга", "info");
      return;
    }
    const bar = UI.progress("Толь бөглөж байна…");
    await UI.withBtn(e.target, "Ажиллаж байна…", async () => {
      const map = await WB.tr.fillUnknown(words, (d, t) => bar.set(d, t));
      let n = 0;
      for (const k in map) {
        if (!S.P.custom[k]) {
          S.P.custom[k] = map[k];
          WB.tr.unknown.delete(k);
          n++;
        }
      }
      S.touch();
      UI.renderDict();
      U.toast(n + " үг тольд нэмэгдлээ ✓", "good");
    });
    bar.done();
  };

  el("exportDict").onclick = () =>
    S.download(U.slug(S.P.title) + "-toli.json", JSON.stringify(S.P.custom, null, 1), "application/json");
  el("importDict").onclick = () => el("dictFile").click();
  el("dictFile").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const obj = JSON.parse(rd.result);
        let n = 0;
        for (const k in obj) {
          if (typeof obj[k] === "string" && obj[k].trim()) {
            S.P.custom[String(k).toLowerCase()] = obj[k].trim();
            n++;
          }
        }
        S.touch();
        UI.renderDict();
        U.toast(n + " үг оруулж ирлээ", "good");
      } catch (err) {
        U.toast("Энэ файлыг уншиж чадсангүй", "bad");
      }
    };
    rd.readAsText(f);
    e.target.value = "";
  });

  /* ── төслийн үйлдэл ─────────────────────────────────────── */
  el("newBtn").onclick = async () => {
    if (await U.confirm("Шинэ төсөл эхлүүлэх үү? Хадгалаагүй өөрчлөлт алга болно.", "Шинэ төсөл")) {
      S.reset();
      UI.renderAll();
      UI.goto("auto");
    }
  };
  el("saveBtn").onclick = () => {
    S.saveToLibrary();
    S.exportJSON();
    U.toast("Хадгаллаа — файлаар татаж, хөтөч дотор ч үлдээлээ", "good");
  };
  el("openBtn").onclick = () => el("fileIn").click();
  el("fileIn").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (!d || typeof d !== "object") throw new Error("буруу формат");
        S.replace(d);
        UI.renderAll();
        U.toast("Төсөл нээгдлээ", "good");
      } catch (err) {
        U.toast("Энэ файлыг уншиж чадсангүй. Ертөнц Бүтээгчээс хадгалсан JSON эсэхийг шалгаарай.", "bad");
      }
    };
    rd.readAsText(f);
    e.target.value = "";
  });

  el("libBtn").onclick = () => {
    const box = el("libList");
    const list = S.library();
    box.innerHTML = "";
    if (!list.length) {
      box.innerHTML = '<p class="note">Хадгалсан төсөл алга.</p>';
    } else {
      list.forEach((rec) => {
        const row = document.createElement("div");
        row.className = "librow";
        const b = document.createElement("button");
        b.className = "libopen";
        b.textContent = rec.title || "Нэргүй";
        const d = document.createElement("span");
        d.className = "libdate";
        d.textContent = new Date(rec.updated).toLocaleString("mn-MN");
        b.onclick = () => {
          S.openFromLibrary(rec.key);
          UI.renderAll();
          el("libModal").classList.remove("on");
          U.toast("Нээгдлээ: " + rec.title, "good");
        };
        const x = document.createElement("button");
        x.className = "xbtn danger";
        x.textContent = "×";
        x.onclick = async () => {
          if (await U.confirm("«" + rec.title + "» төслийг устгах уу?", "Устгах")) {
            S.deleteFromLibrary(rec.key);
            el("libBtn").onclick();
          }
        };
        row.append(b, d, x);
        box.appendChild(row);
      });
    }
    el("libModal").classList.add("on");
  };
  el("closeLib").onclick = () => el("libModal").classList.remove("on");
  el("libModal").addEventListener("click", (e) => {
    if (e.target === el("libModal")) el("libModal").classList.remove("on");
  });
  el("saveLib").onclick = () => {
    S.saveToLibrary();
    U.toast("Хөтөч дотор хадгаллаа", "good");
    el("libBtn").onclick();
  };

  el("demoBtn").onclick = () => {
    S.replace(WB.demo());
    UI.renderAll();
    UI.goto("story");
    U.toast("Жишээ ачааллаа — «Бүгдийг орчуулах» дарж үзээрэй", "good");
  };

  el("undoBtn").onclick = () => {
    if (S.undo()) {
      UI.renderAll();
      U.toast("Буцаалаа", "info");
    } else U.toast("Буцаах зүйл алга", "info");
  };
  el("redoBtn").onclick = () => {
    if (S.redo()) {
      UI.renderAll();
      U.toast("Дахин хийлээ", "info");
    } else U.toast("Дахин хийх зүйл алга", "info");
  };

  /* ── гарын товчлол ──────────────────────────────────────── */
  document.addEventListener("keydown", (e) => {
    const meta = e.ctrlKey || e.metaKey;
    if (!meta) return;
    if (e.key === "s") {
      e.preventDefault();
      S.saveToLibrary();
      U.toast("Хадгаллаа", "good");
    } else if (e.key === "z" && !e.shiftKey) {
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      e.preventDefault();
      if (S.undo()) UI.renderAll();
    } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
      if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      e.preventDefault();
      if (S.redo()) UI.renderAll();
    } else if (e.key === "Enter") {
      e.preventDefault();
      UI.translatePending(null);
    }
  });

  /* ── эвентүүд ───────────────────────────────────────────── */
  WB.on("api:busy", UI.setStatus);
  WB.on("api:mode", UI.setStatus);
  WB.on("api:usage", UI.setStatus);
  WB.on("state:saved", (ts) => {
    const n = el("savedAt");
    if (n) n.textContent = "хадгалсан " + new Date(ts).toLocaleTimeString("mn-MN");
  });

  window.addEventListener("beforeunload", (e) => {
    WB.store.set("autosave", S.P);
  });

  /* ── эхлүүлэлт ──────────────────────────────────────────── */
  function boot() {
    const brag = el("dictBrag");
    if (brag) brag.textContent = WB.dict.size().toLocaleString("en-US");
    const restored = S.restore();
    WB.tr.customRef = S.P.custom;
    UI.renderAll();
    UI.setStatus();
    const panel = restored ? WB.store.get("panel", "auto") : "auto";
    UI.goto(panel);
    if (restored) U.toast("Өмнөх төслөө сэргээлээ: " + (S.P.title || "нэргүй"), "info");

    const remembered = WB.store.get("rememberKey", false);
    el("rememberKey").checked = !!remembered;
    if (remembered && WB.api.state.key) el("apiKey").value = WB.api.state.key;

    WB.api.probe().then((mode) => {
      UI.setStatus();
      if (mode === "off") {
        U.toast("AI холбогдоогүй — " + WB.dict.size().toLocaleString("en-US") + " үгтэй офлайн толиор ажиллана", "info", 5000);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.WB);
