/* ═════════════════════════════════════════════════════════════
   АВТОМАТЖУУЛАЛТ — нэг товчоор логлайнаас бүтэн ертөнц.
   Алхмууд: ертөнц зохиох → орчуулах → кадр гаргах → промт өнгөлөх
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const AU = (WB.auto = {});
  const S = WB.state;
  const U = WB.util;
  const T = WB.tr;

  let cancelFlag = false;
  AU.running = false;
  AU.cancel = function () {
    cancelFlag = true;
  };
  function checkCancel() {
    if (cancelFlag) throw new Error("__cancelled__");
  }

  function step(label, done, total) {
    WB.emit("auto:step", { label: label, done: done, total: total });
  }

  AU.needAI = function () {
    if (WB.api.live()) return true;
    WB.emit("api:need", null);
    return false;
  };

  /* ── 1. ЕРТӨНЦ ЗОХИОХ ───────────────────────────────────── */
  /**
   * Санаа / логлайнаас бүтэн ертөнц гаргана.
   * @param {string} idea монголоор бичсэн санаа
   * @param {{scenes:number, cast:number, locs:number, genre:string}} cfg
   */
  AU.buildWorld = async function (idea, cfg) {
    cfg = cfg || {};
    const nScenes = Math.max(1, Math.min(20, cfg.scenes || 6));
    const nCast = Math.max(0, Math.min(10, cfg.cast || 3));
    const nLocs = Math.max(0, Math.min(10, cfg.locs || 3));
    const genre = cfg.genre ? "\nТөрөл жанр: " + cfg.genre : "";

    const prompt =
      "Та монгол кино зохиолч, урлагийн найруулагч хоёрын үүрэг гүйцэтгэнэ. " +
      "Доорх санаан дээр үндэслэн бүтэн ертөнцийг зохио." +
      genre +
      "\n\nШаардлага:\n" +
      "- Зөвхөн JSON объект буцаа. Тайлбар, код блокын хашилтгүй.\n" +
      "- Бүх текст МОНГОЛ хэлээр, харагдахуйц тодорхой дүрслэлтэй (өнгө, гэрэл, материал, хөдөлгөөн).\n" +
      "- Формат:\n" +
      "{\n" +
      '  "title": "богино төслийн нэр",\n' +
      '  "logline": "нэг өгүүлбэр логлайн",\n' +
      '  "cast": [{"name":"нэр","look":"...","cloth":"...","person":"...","voice":"..."}],\n' +
      '  "locs": [{"name":"нэр","look":"...","time":"...","mood":"...","detail":"..."}],\n' +
      '  "scenes": [{"name":"үзэгдлийн нэр","body":"2-4 өгүүлбэр дүрслэл","cast":["дүрийн нэр"],"loc":"байршлын нэр"}]\n' +
      "}\n" +
      "- cast дотор яг " + nCast + " дүр, locs дотор " + nLocs + " байршил, scenes дотор " + nScenes + " үзэгдэл байна.\n" +
      '- scenes доторх "cast" ба "loc" талбарууд нь дээр зохиосон нэрсийг ЯГ давтаж бичнэ.\n' +
      "- Үзэгдлүүд цаг хугацааны дарааллаар, эхлэл–тэмцэл–шийдэл бүхий бүтэцтэй.\n" +
      (WB.brand ? WB.brand.autoContext() : "") +
      "\nСанаа: " + idea;

    const data = await WB.api.askJSON(prompt, 6000);
    return data;
  };

  /** Гарсан ертөнцийг төлөв рүү шингээнэ (нэрээр нь холбоно). */
  AU.mergeWorld = function (data, opts) {
    opts = opts || {};
    const P = S.P;
    if (!opts.keep) {
      P.scenes = [];
      P.cast = [];
      P.locs = [];
    }
    if (data.title && (!P.title || P.title === "Нэргүй төсөл")) P.title = String(data.title).slice(0, 80);
    if (data.logline) P.logline = S.F(String(data.logline));

    (data.cast || []).forEach((c) => {
      if (!c || !c.name) return;
      if (P.cast.some((x) => x.name === c.name)) return;
      P.cast.push(S.newCast(String(c.name), c));
    });
    (data.locs || []).forEach((l) => {
      if (!l || !l.name) return;
      if (P.locs.some((x) => x.name === l.name)) return;
      P.locs.push(S.newLoc(String(l.name), l));
    });
    (data.scenes || []).forEach((s) => {
      if (!s || (!s.body && !s.name)) return;
      const sc = S.newScene(String(s.name || ""), String(s.body || ""));
      const names = Array.isArray(s.cast) ? s.cast : s.cast ? [s.cast] : [];
      sc.castIds = names
        .map((n) => (P.cast.find((c) => c.name === n) || {}).id)
        .filter(Boolean);
      const loc = P.locs.find((l) => l.name === s.loc);
      if (loc) sc.locId = loc.id;
      P.scenes.push(sc);
    });
    S.touch();
  };

  /* ── 2. КАДРЫН ЖАГСААЛТ ─────────────────────────────────── */
  AU.shotList = async function (scene, count) {
    const n = Math.max(2, Math.min(8, count || 4));
    const prompt =
      "Та кино зураглаач. Доорх үзэгдлийг " + n + " кадарт хуваа.\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON массив буцаа.\n" +
      '- Формат: [{"cam":"англи камерын заавар, ж: slow dolly in, low angle","dur":"3s","body":"монголоор тухайн кадрт юу харагдаж, юу хөдөлж байгаа"}]\n' +
      "- cam талбар АНГЛИ, body талбар МОНГОЛ хэлээр.\n" +
      "- Кадрууд давхардахгүй, үзэгдлийн явцыг бүрэн харуулна.\n\n" +
      "Үзэгдэл: " + (scene.name || "") + "\n" + (scene.body.mn || scene.body.en || "");
    const arr = await WB.api.askJSON(prompt, 2000);
    if (!Array.isArray(arr)) throw new Error("кадрын жагсаалт буруу форматтай");
    return arr.slice(0, n).map((sh) => ({
      id: U.uid(),
      cam: String(sh.cam || "").slice(0, 160),
      dur: String(sh.dur || "").slice(0, 12),
      body: S.F(String(sh.body || ""))
    }));
  };

  AU.shotsForAll = async function (count, onProgress) {
    const scenes = S.P.scenes.filter((s) => (s.body.mn || s.body.en || "").trim());
    let done = 0;
    await U.pool(
      scenes,
      2,
      async (s) => {
        checkCancel();
        try {
          s.shots = await AU.shotList(s, count);
        } catch (e) {
          /* энэ үзэгдэлд кадр гарсангүй — үлдсэнийг үргэлжлүүлнэ */
        }
        done++;
        if (onProgress) onProgress(done, scenes.length);
      }
    );
    S.touch();
  };

  /* ── 3. ДҮР / БАЙРШЛЫГ ДЭЛГЭРҮҮЛЭХ ─────────────────────── */
  AU.expand = async function (kind, item) {
    const isChar = kind === "char";
    const fields = isChar ? S.CAST_FIELDS : S.LOC_FIELDS;
    const known = fields.map((f) => f.lb + ": " + (item.f[f.k].mn || "(хоосон)")).join("\n");
    const keys = fields.map((f) => '"' + f.k + '"').join(", ");
    const desc = fields.map((f) => '"' + f.k + '" = ' + f.lb).join("; ");
    const ctx = S.P.logline.mn ? "\nТүүхийн логлайн: " + S.P.logline.mn : "";

    const prompt =
      "Та монгол кино урлагийн дүрийн зураач. Доорх " + (isChar ? "дүрийн" : "байршлын") + " мэдээллийг бүрэн гүйцээ." +
      ctx +
      "\nШаардлага:\n" +
      "- Зөвхөн JSON объект буцаа.\n" +
      "- Түлхүүрүүд: " + keys + ". Утга нь: " + desc + "\n" +
      "- Бүгд МОНГОЛ хэлээр, харагдахуйц тодорхой (өнгө, хэлбэр, материал, гэрэл).\n" +
      "- Аль хэдийн бичигдсэнийг хадгал, зөвхөн хоосныг нь дүүргэ, зөрчилдүүлэхгүй.\n" +
      "- Талбар бүр 1–2 өгүүлбэр.\n\n" +
      "Нэр: " + (item.name || "(нэргүй)") + "\n" + known;

    const o = await WB.api.askJSON(prompt, 1400);
    let changed = 0;
    fields.forEach((f) => {
      if (o[f.k] && !item.f[f.k].mn) {
        item.f[f.k] = S.F(String(o[f.k]));
        changed++;
      }
    });
    S.touch();
    return changed;
  };

  AU.expandAllEmpty = async function (onProgress) {
    const jobs = [];
    S.P.cast.forEach((c) => {
      if (S.CAST_FIELDS.some((f) => !c.f[f.k].mn)) jobs.push({ kind: "char", item: c });
    });
    S.P.locs.forEach((l) => {
      if (S.LOC_FIELDS.some((f) => !l.f[f.k].mn)) jobs.push({ kind: "loc", item: l });
    });
    let done = 0;
    await U.pool(jobs, 2, async (j) => {
      checkCancel();
      try {
        await AU.expand(j.kind, j.item);
      } catch (e) {}
      done++;
      if (onProgress) onProgress(done, jobs.length);
    });
    return jobs.length;
  };

  /* ── 4. ҮЗЭГДЛЭЭС ДҮР, БАЙРШИЛ ИЛРҮҮЛЭХ ────────────────── */
  AU.extractEntities = async function () {
    const text = S.P.scenes.map((s) => (s.name ? s.name + ": " : "") + s.body.mn).join("\n");
    if (!text.trim()) throw new Error("Эхлээд үзэгдлээ бичнэ үү.");
    const haveC = S.P.cast.map((c) => c.name).filter(Boolean).join(", ") || "(байхгүй)";
    const haveL = S.P.locs.map((l) => l.name).filter(Boolean).join(", ") || "(байхгүй)";
    const prompt =
      "Доорх монгол үзэгдлүүдээс дүр болон байршлыг ялгаж гарга.\n" +
      "Аль хэдийн бүртгэлтэй дүрүүд: " + haveC + "\nАль хэдийн бүртгэлтэй байршлууд: " + haveL + "\n" +
      "Шаардлага:\n" +
      '- Зөвхөн JSON: {"cast":[{"name":"...","look":"...","cloth":"...","person":"..."}],"locs":[{"name":"...","look":"...","time":"...","mood":"..."}]}\n' +
      "- Зөвхөн ШИНЭ, бүртгэлгүй нэрсийг оруул.\n" +
      "- Бүгд монголоор. Текстэд байгаа мэдээлэлд тулгуурла, шаардлагатай бол богиноор нөх.\n\n" +
      text;
    const o = await WB.api.askJSON(prompt, 3000);
    let added = 0;
    (o.cast || []).forEach((c) => {
      if (c && c.name && !S.P.cast.some((x) => x.name === c.name)) {
        S.P.cast.push(S.newCast(c.name, c));
        added++;
      }
    });
    (o.locs || []).forEach((l) => {
      if (l && l.name && !S.P.locs.some((x) => x.name === l.name)) {
        S.P.locs.push(S.newLoc(l.name, l));
        added++;
      }
    });
    if (added) S.touch();
    return added;
  };

  /** Үзэгдэл бүрийг дүр, байршилтай нь автоматаар холбоно (нэрээр). */
  AU.autoLink = function () {
    let n = 0;
    S.P.scenes.forEach((s) => {
      const hay = (s.name + " " + s.body.mn).toLowerCase();
      S.P.cast.forEach((c) => {
        if (!c.name) return;
        const base = c.name.toLowerCase().split(/\s+/)[0];
        if (base.length > 2 && hay.includes(base) && !s.castIds.includes(c.id)) {
          s.castIds.push(c.id);
          n++;
        }
      });
      if (!s.locId) {
        const loc = S.P.locs.find((l) => l.name && hay.includes(l.name.toLowerCase().split(/\s+/)[0]));
        if (loc) {
          s.locId = loc.id;
          n++;
        }
      }
    });
    if (n) S.touch();
    return n;
  };

  /* ── 5. ПРОМТ ӨНГӨЛӨХ ───────────────────────────────────── */
  const POLISH_HINT = {
    image:
      "a still-image generator (Midjourney / Nano Banana / Seedream). Emphasise composition, lighting, lens, art style and colour palette. No camera motion.",
    video:
      "a text-to-video generator (Kling / Runway / Veo / Seedance). Emphasise what moves, the subject's action, and one clear camera movement. Keep it one continuous shot.",
    higgs:
      "Higgsfield-style video generation. Lead with an explicit named camera movement, then subject action, then setting and lighting.",
    sora:
      "Sora-style narrative video. Describe the shot as one flowing sentence-driven paragraph with a clear beginning and end of the action."
  };

  /**
   * Бүх промтыг сонгосон хэрэгсэлд тохируулан дахин бичнэ.
   * Багцалсан дуудлага ашиглана — нэг удаад 6 промт.
   */
  AU.polishAll = async function (target, onProgress) {
    const P = S.P;
    /* Өнгөлсөн промтыг тусад нь `pro` талбарт хадгална — эх орчуулга хэвээр үлдэнэ. */
    const items = [];
    if (P.logline.en) items.push({ id: "logline", get: () => P.logline.en, set: (v) => (P.logline.en = v) });
    P.cast.forEach((c) => {
      if (c.f.look.en) items.push({ id: "c" + c.id, get: () => WB.prompt.character(c), set: (v) => (c.pro = v) });
    });
    P.locs.forEach((l) => {
      if (l.f.look.en) items.push({ id: "l" + l.id, get: () => WB.prompt.location(l), set: (v) => (l.pro = v) });
    });
    P.scenes.forEach((s) => {
      if (s.body.en) items.push({ id: "s" + s.id, get: () => WB.prompt.scene(s), set: (v) => (s.pro = v) });
      s.shots.forEach((sh) => {
        if (sh.body.en) items.push({ id: "h" + sh.id, get: () => WB.prompt.shot(sh, s), set: (v) => (sh.pro = v) });
      });
    });
    if (!items.length) throw new Error("Өнгөлөх промт алга. Эхлээд агуулгаа бөглөж орчуулаарай.");

    const groups = [];
    for (let i = 0; i < items.length; i += 6) groups.push(items.slice(i, i + 6));
    let done = 0;

    for (const grp of groups) {
      checkCancel();
      const body = grp.map((it) => "### " + it.id + "\n" + it.get()).join("\n\n");
      const prompt =
        "Rewrite each AI generation prompt below so it works better with " +
        (POLISH_HINT[target] || POLISH_HINT.image) +
        "\nRules:\n" +
        "- Keep every concrete detail from the original; add precision, never invent contradictions.\n" +
        "- Keep Mongolian cultural terms and their clarifiers intact.\n" +
        "- One paragraph each, under 110 words, English only.\n" +
        (WB.brand && WB.brand.polishHint()
          ? "- Honour the channel style exactly, never drift from it: " + WB.brand.polishHint() + ".\n"
          : "") +
        '- Return ONLY a JSON object mapping each id to its rewritten prompt: {"id":"text"}.\n\n' +
        body;
      try {
        const obj = await WB.api.askJSON(prompt, 4000);
        grp.forEach((it) => {
          const v = obj[it.id];
          if (typeof v === "string" && v.trim()) it.set(v.trim());
        });
      } catch (e) {
        /* энэ багц бүтсэнгүй */
      }
      done += grp.length;
      if (onProgress) onProgress(Math.min(done, items.length), items.length);
    }
    S.touch();
    return items.length;
  };

  /** Өнгөлөлтийг цуцалж, анхны орчуулга руу буцаана. */
  AU.clearPolish = function () {
    const P = S.P;
    let n = 0;
    P.cast.forEach((c) => c.pro && ((c.pro = ""), n++));
    P.locs.forEach((l) => l.pro && ((l.pro = ""), n++));
    P.scenes.forEach((s) => {
      if (s.pro) {
        s.pro = "";
        n++;
      }
      s.shots.forEach((sh) => sh.pro && ((sh.pro = ""), n++));
    });
    if (n) S.touch();
    return n;
  };

  /* ── 6. ТУУШТАЙ БАЙДЛЫН ШАЛГАЛТ ─────────────────────────── */
  AU.continuityCheck = async function () {
    const P = S.P;
    const dump = [
      "ЛОГЛАЙН: " + P.logline.mn,
      "",
      "ДҮРҮҮД:",
      ...P.cast.map((c) => "- " + c.name + ": " + S.CAST_FIELDS.map((f) => c.f[f.k].mn).filter(Boolean).join("; ")),
      "",
      "БАЙРШЛУУД:",
      ...P.locs.map((l) => "- " + l.name + ": " + S.LOC_FIELDS.map((f) => l.f[f.k].mn).filter(Boolean).join("; ")),
      "",
      "ҮЗЭГДЛҮҮД:",
      ...P.scenes.map((s, i) => i + 1 + ". " + (s.name || "") + " — " + s.body.mn)
    ].join("\n");

    const prompt =
      "Доорх кино төслийг уншаад зөрчил, тааруухан газруудыг ол.\n" +
      "Шаардлага:\n" +
      '- Зөвхөн JSON массив: [{"level":"алдаа|санамж|санал","where":"хаана","text":"монголоор тайлбар"}]\n' +
      "- Хамгийн ноцтой 8‑аас илүүгүйг сонго.\n" +
      "- Дүрийн харагдац, хувцас, цаг үе, гэрэл, орон зайн зөрчилд онцгой анхаар.\n" +
      "- Бүх текст монголоор.\n\n" +
      dump;
    const arr = await WB.api.askJSON(prompt, 2500);
    return Array.isArray(arr) ? arr.slice(0, 10) : [];
  };

  /* ── 7. БҮРЭН АВТО ГҮЙЛТ ────────────────────────────────── */
  /**
   * @param {{idea:string, scenes:number, cast:number, locs:number, genre:string,
   *          shots:number, polish:boolean, keep:boolean, target:string}} cfg
   */
  AU.pipeline = async function (cfg) {
    if (AU.running) throw new Error("Автомат гүйлт аль хэдийн явж байна.");
    if (!AU.needAI()) throw new Error("Энэ боломж Claude холболт шаардана.");
    AU.running = true;
    cancelFlag = false;
    const total = 4 + (cfg.shots ? 1 : 0) + (cfg.polish ? 1 : 0);
    let n = 0;

    try {
      S.pushHistory();

      step("Ертөнц зохиож байна…", ++n, total);
      const world = await AU.buildWorld(cfg.idea, cfg);
      checkCancel();
      AU.mergeWorld(world, { keep: cfg.keep });
      WB.emit("state:replaced", S.P);

      step("Дүр, байршлыг үзэгдэлтэй холбож байна…", ++n, total);
      AU.autoLink();

      step("Англи руу орчуулж байна…", ++n, total);
      await T.run(S.pending(null, true), (d, t) => step("Орчуулга " + d + "/" + t, n, total));
      checkCancel();
      S.touch();
      WB.emit("state:replaced", S.P);

      if (cfg.shots) {
        step("Кадрын жагсаалт гаргаж байна…", ++n, total);
        await AU.shotsForAll(cfg.shots, (d, t) => step("Кадр " + d + "/" + t, n, total));
        checkCancel();
        await T.run(S.pending(["shot"], true), (d, t) => step("Кадрын орчуулга " + d + "/" + t, n, total));
        WB.emit("state:replaced", S.P);
      }

      if (cfg.polish) {
        step("Промтуудыг өнгөлж байна…", ++n, total);
        await AU.polishAll(cfg.target || S.P.opts.target, (d, t) => step("Өнгөлөлт " + d + "/" + t, n, total));
        WB.emit("state:replaced", S.P);
      }

      step("Бэлэн боллоо ✓", total, total);
      return true;
    } catch (e) {
      if (e.message === "__cancelled__") {
        step("Зогсоолоо", n, total);
        return false;
      }
      throw e;
    } finally {
      AU.running = false;
      cancelFlag = false;
      S.touch();
    }
  };
})(window.WB);
