/* ═════════════════════════════════════════════════════════════
   БРЭНД ФАЙЛ — сувгийн гарын үсэг ба 4 давхаргат промтын бүтэц.

   Гурван зарчим дээр суурилна:

   1. НЭГ ФРЭЙМ ДҮРЭМ — бүтэн видео үүсгэхээсээ ӨМНӨ ганц зураг
      үүсгэж стилээ тогтооно. Зураг засах нь видео засахаас
      олон дахин хямд, хурдан. Тогтоосон стилээ «түгжинэ».

   2. БРЭНД ФАЙЛ — сувгийн харагдац, гэрэл, палетт, камерын дүрэм,
      хоолойны өнгө аяс, дуу авианы палеттыг нэг дор бичиж
      үзэгдэл болгонд автоматаар шингээнэ. Үүнгүй бол AI үргэлж
      хамгийн ердийн (=хамгийн аюулгүй) хувилбар руу орно.

   3. 4 ДАВХАРГАТ БҮТЭЦ:
        1 · Судалгаа — ниш, батлагдсан гарчгийн формат, сэдвүүд
        2 · Харагдац — нэг фрэйм дээр тогтоосон визуал
        3 · Хоолой   — өгүүлэгчийн өнгө аяс, үг хэллэг, дуу авиа
        4 · Хяналт   — юу ч үүсгэхээс өмнө чиглэлээ харуулах
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const B = (WB.brand = {});
  const U = WB.util;
  const S = WB.state;
  const el = U.el;

  /** Давхаргын тодорхойлолт — UI ба баримтжуулалтад хоёуланд нь. */
  B.LAYERS = [
    {
      n: 1,
      key: "research",
      lb: "Судалгаа",
      why: "Батлагдсан сэдэв, батлагдсан гарчгийн формат. Таамаг биш, өгөгдөл."
    },
    {
      n: 2,
      key: "look",
      lb: "Харагдац",
      why: "Нэг фрэйм дээр тогтоосон визуал. Энэ давхарга промт болгонд шингэнэ."
    },
    {
      n: 3,
      key: "voice",
      lb: "Хоолой",
      why: "Өгүүлэгчийн өнгө аяс, үг хэллэг, дуу авианы палетт. Сувгийн чих."
    },
    {
      n: 4,
      key: "check",
      lb: "Хяналт",
      why: "Юу ч үүсгэхээс өмнө чиглэлээ харуулах. Кредит хэмнэдэг ганц дүрэм."
    }
  ];

  /**
   * Хэтрүүлгээс сэргийлэх дүрэм — монгол текст зохиодог бүх AI дуудлагад.
   * «аврага хүмүүс» мэт гарчгийг үгчлэн ойлгож хүмүүсийг «зургаа дахин
   * өндөр» болгодог байсан.
   */
  B.REAL_RULE =
    "- Бодит байдлаас бүү хазай: хүний биеийн хэмжээ, харьцаа, тоо ширхэг бодит байна. " +
    "«зургаа дахин өндөр», «тэнгэр шүргэсэн» мэт хэтрүүлэг, санаанд үгчлэн ойлгох зүйрлэл бүү бич. " +
    "Нишийн болон гарчгийн «аврага», «агуу» мэт үгийг утгаар нь (алдартай, хүндтэй) ойлго — биеийн хэмжээ гэж бүү ойлго.\n";

  /* ── туслахууд ──────────────────────────────────────────── */
  const CYR = /[а-яөүё]/i;

  /**
   * Англи промтод монгол текст хэзээ ч орохгүй. Кирилл агуулсан бол
   * (талбар хараахан орчуулагдаагүй, эсвэл AI англи хувилбар өгөөгүй)
   * офлайн толиор тэр дороо орчуулна.
   */
  B.toEN = function (s) {
    const t = String(s == null ? "" : s).trim();
    if (!t || !CYR.test(t)) return t;
    return WB.tr && WB.tr.offline ? WB.tr.offline(t).en.trim() : t;
  };

  function txt(f) {
    return B.toEN((f && (f.en || f.mn)) || "").replace(/\s*\.?\s*$/, "");
  }
  /** Судалгааны талбар — mn (AI‑д монголоор өгөх) */
  function metaMN(k) {
    const v = S.P.brand.meta[k];
    return ((v && v.mn) || "").trim();
  }
  /** Судалгааны талбар — en (мастер промтод) */
  function metaEN(k) {
    const v = S.P.brand.meta[k];
    return B.toEN((v && (v.en || v.mn)) || "");
  }
  function joinParts(arr) {
    const body = arr.filter(Boolean).join(". ");
    return body ? body : "";
  }

  /** Брэнд файлын хэсэг бүр бөглөгдсөн эсэх. */
  B.ready = function () {
    const b = S.P.brand;
    const missing = [];
    if (!metaMN("niche")) missing.push("Сувгийн ниш");
    S.BRAND_FIELDS.forEach((d) => {
      if (d.need && !(b.f[d.k].mn || "").trim()) missing.push(d.lb);
    });
    return { ok: missing.length === 0, missing: missing };
  };

  /** Брэнд файл огт хөндөгдөөгүй юу? (хоосон бол сануулга гаргахгүй) */
  B.untouched = function () {
    const b = S.P.brand;
    if (metaMN("niche") || metaMN("titleFmt")) return false;
    return !S.BRAND_FIELDS.some((d) => (b.f[d.k].mn || "").trim());
  };

  /* ── 2‑р давхарга: промт болгонд шингэдэг визуал мөр ────── */
  B.visualLine = function () {
    const b = S.P.brand;
    if (!b) return "";
    return joinParts([txt(b.f.look), txt(b.f.light), txt(b.f.palette), txt(b.f.camera)]);
  };

  /** Харагдацын давхаргын хэсгүүд: [харагдац, гэрэл, палетт, камер]. */
  B.visualParts = function () {
    const b = S.P.brand;
    if (!b) return [];
    return [txt(b.f.look), txt(b.f.light), txt(b.f.palette), txt(b.f.camera)].filter(Boolean);
  };

  /**
   * Текстэд ХАРАХАН байхгүй брэндийн хэсгүүд. Таслалаар салгасан хэллэг
   * бүрийг шалгана — өнгөлсөн промт «35mm anamorphic film grain»‑ийг
   * агуулсан бол дахин залгахгүй, харин «statuesque stillness» байхгүй
   * бол түүнийг л нэмнэ.
   */
  B.missingVisual = function (text) {
    const low = String(text || "").toLowerCase();
    return B.visualParts()
      .map((seg) =>
        seg
          .split(/\s*,\s*/)
          .filter((atom) => atom && !low.includes(atom.toLowerCase()))
          .join(", ")
      )
      .filter(Boolean)
      .join(". ");
  };

  /** Сөрөг промтод нэмэгдэх «хэзээ ч гаргахгүй» мөр. */
  B.avoidLine = function () {
    const b = S.P.brand;
    return b ? txt(b.f.avoid) : "";
  };

  /** 3‑р давхарга: өгүүлэгчийн мөр (дуу оруулга, скриптэд). */
  B.voiceLine = function () {
    const b = S.P.brand;
    if (!b) return "";
    return joinParts([txt(b.f.voice), txt(b.f.audio)]);
  };

  /** Промт өнгөлөх үед AI‑д өгөх богино сануулга. */
  B.polishHint = function () {
    if (S.P.opts.brandOn === false) return "";
    return B.visualLine();
  };

  /* ── 1. НЭГ ФРЭЙМ ДҮРЭМ ─────────────────────────────────── */
  /**
   * Ганц туршилтын кадрын промт. Видео биш — ЗУРАГ.
   * Стиль зөв эсэхийг хамгийн хямд аргаар шалгах цорын ганц зам.
   */
  B.oneFramePrompt = function (subject) {
    const b = S.P.brand;
    const subj = subject != null ? B.toEN(subject) : txt(b.frameSubject);
    const visual = B.visualLine();
    if (!visual && !subj) return "";
    const parts = [];
    if (subj) parts.push(subj);
    if (visual) parts.push(visual);
    parts.push("single still frame, no motion, no text, no logo");
    let out = joinParts(parts) + ".";
    if (S.P.opts.ar) out += " --ar " + S.P.opts.ar;
    return WB.gram && WB.gram.tidy ? WB.gram.tidy(out) : out;
  };

  /** Стилийг «түгжих» — нэг фрэйм баталгаажсаны дараа. */
  B.lock = function (on) {
    const b = S.P.brand;
    S.pushHistory();
    b.locked = !!on;
    b.lockedAt = on ? Date.now() : 0;
    b.lockSnap = on ? S.lockSnap(b) : null;
    S.touch();
  };

  /** Түгжсэний дараа өөрчлөгдсөн харагдацын мөрүүдийн нэр. */
  B.lockDrift = function () {
    const keys = S.lockDrift(S.P.brand);
    return keys.map((k) => (S.BRAND_FIELDS.find((d) => d.k === k) || { lb: k }).lb);
  };

  /**
   * Стиль үнэхээр түгжигдсэн үү — түгжсэн ба тэр үеэс хойш харагдац
   * өөрчлөгдөөгүй. Өөрчлөгдсөн бол баталсан кадр хуучирсан гэсэн үг.
   */
  B.isLocked = function () {
    const b = S.P.brand;
    return !!(b && b.locked && !S.lockDrift(b).length);
  };

  /** Огноо — орон нутгийн цагаар (UTC биш), YYYY-MM-DD. */
  function ymd(ts) {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  /**
   * Юу үүсгэхийн өмнөх сануулга. Брэнд файл хоосон бол чимээгүй.
   * @returns {string} хоосон бол асуудалгүй
   */
  B.gate = function () {
    if (B.untouched()) return "";
    const b = S.P.brand;
    const drift = B.lockDrift();
    if (b.locked && drift.length) {
      return (
        "Стилийг түгжсэний дараа брэндийн " + drift.join(", ") + " өөрчлөгдсөн тул " +
        "баталсан кадр хуучирсан. Шинэ харагдацаар ганц зураг гаргаж шалгаад " +
        "дахин баталгаажуулбал кредит хэмнэнэ. Үргэлжлүүлэх үү?"
      );
    }
    if (!b.locked) {
      return (
        "Стиль нэг фрэйм дээр хараахан тогтоогүй байна. " +
        "Бүтэн видео үүсгэхээсээ өмнө ганц зураг гаргаж шалгах нь " +
        "кредит ба цаг хоёуланг нь хэмнэдэг. Үргэлжлүүлэх үү?"
      );
    }
    return "";
  };

  /* ── 3. 4 ДАВХАРГАТ БҮТЭН ПРОМТ ─────────────────────────── */
  /**
   * Claude Code / Veo / Higgsfield рүү шууд хуулж өгөх мастер промт.
   * Дөрвөн давхарга нэг дор — энэ бол «сувгийн үйлдвэрийн тохиргоо».
   */
  B.masterPrompt = function () {
    const b = S.P.brand;
    const P = S.P;
    const L = [];

    L.push("=== LAYER 1 · RESEARCH ===");
    L.push("Channel: " + (metaEN("niche") || "(not defined)"));
    if (metaEN("titleFmt")) L.push("Proven title format: " + metaEN("titleFmt"));
    if ((b.meta.topics || "").trim()) {
      L.push("Topic queue:");
      b.meta.topics
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((t) => L.push("  - " + t));
    }

    L.push("", "=== LAYER 2 · LOOK (locked on one frame) ===");
    if (txt(b.f.look)) L.push("Visual signature: " + txt(b.f.look) + ".");
    if (txt(b.f.light)) L.push("Lighting: " + txt(b.f.light) + ".");
    if (txt(b.f.palette)) L.push("Palette: " + txt(b.f.palette) + ".");
    if (txt(b.f.camera)) L.push("Camera: " + txt(b.f.camera) + ".");
    if (txt(b.f.avoid)) L.push("Never render: " + txt(b.f.avoid) + ".");
    L.push("Aspect ratio: " + (P.opts.ar || "16:9") + ".");
    if (B.isLocked()) {
      L.push(
        "Style is LOCKED — approved on a single reference frame" +
          (b.lockedAt ? " (" + ymd(b.lockedAt) + ")" : "") +
          "."
      );
      if ((b.ref || "").trim()) L.push("Reference frame: " + b.ref.trim());
    } else if (b.locked) {
      L.push(
        "Style CHANGED after it was locked — the approved frame is out of date. " +
          "Generate ONE new still image with this look and wait for approval before any video."
      );
    } else {
      L.push("Style is NOT locked yet — generate ONE still image first and wait for approval.");
    }

    L.push("", "=== LAYER 3 · VOICE ===");
    if (txt(b.f.voice)) L.push("Narrator tone: " + txt(b.f.voice) + ".");
    if (txt(b.f.words)) L.push("Signature phrasing: " + txt(b.f.words) + ".");
    if (txt(b.f.nowords)) L.push("Never say: " + txt(b.f.nowords) + ".");
    if (txt(b.f.audio)) L.push("Audio palette: " + txt(b.f.audio) + ".");

    L.push("", "=== LAYER 4 · CHECKPOINT ===");
    const d = b.direction;
    if (d) {
      const de = (k) => (d[k] ? txt(d[k]) : "");
      L.push("Approved direction:");
      if (de("look")) L.push("  Look: " + de("look") + ".");
      if (de("pacing")) L.push("  Pacing: " + de("pacing") + ".");
      if (de("frame")) L.push("  Frame to approve first: " + de("frame") + ".");
      if (de("risk")) L.push("  Known risk: " + de("risk") + ".");
      L.push("");
    }
    if (b.checkpoint !== false) {
      L.push(
        "Before generating ANY image or video, propose the direction first:",
        "  - the exact look you will render,",
        "  - the pacing decision (shot count, shot lengths, transitions),",
        "  - one still frame to approve.",
        "Wait for my approval. Do not render the full sequence unprompted."
      );
    } else {
      L.push("(Checkpoint disabled — generate directly without waiting for approval.)");
    }
    return L.join("\n");
  };

  /**
   * Машинд уншигдах брэнд файл — Camera Director болон бусад
   * хэрэгсэл яг ижил өгөгдлийг уншина. Дэлгэцийн харьцаа мөн орно.
   */
  B.asJSON = function () {
    return {
      app: "1st-studio-brand",
      v: 1,
      title: S.P.title || "",
      ar: S.P.opts.ar || "16:9",
      exported: new Date().toISOString(),
      brand: U.clone(S.P.brand)
    };
  };

  /** Автомат горимд монгол текст зохиоход өгөх брэнд контекст. */
  B.autoContext = function () {
    const b = S.P.brand;
    if (!b || B.untouched() || S.P.opts.brandOn === false) return "";
    const L = ["", "Сувгийн брэнд файл — доорхийг ЗААВАЛ баримтална:"];
    if (metaMN("niche")) L.push("- Ниш: " + metaMN("niche"));
    if (metaMN("titleFmt")) L.push("- Гарчгийн формат: " + metaMN("titleFmt"));
    if ((b.f.look.mn || "").trim()) L.push("- Визуал гарын үсэг: " + b.f.look.mn.trim());
    if ((b.f.palette.mn || "").trim()) L.push("- Өнгөний палетт: " + b.f.palette.mn.trim());
    if ((b.f.camera.mn || "").trim()) L.push("- Камерын дүрэм: " + b.f.camera.mn.trim());
    if ((b.f.voice.mn || "").trim()) L.push("- Өгүүлэгчийн өнгө аяс: " + b.f.voice.mn.trim());
    if ((b.f.words.mn || "").trim()) L.push("- Хэрэглэх үг хэллэг: " + b.f.words.mn.trim());
    if ((b.f.nowords.mn || "").trim()) L.push("- ХЭРЭГЛЭХГҮЙ үг хэллэг: " + b.f.nowords.mn.trim());
    if ((b.f.avoid.mn || "").trim()) L.push("- Дүр зурагт гаргахгүй: " + b.f.avoid.mn.trim());
    return L.join("\n") + "\n";
  };

  /* ── AI туслахууд ───────────────────────────────────────── */

  /** Нэг өгүүлбэр нишээс бүтэн брэнд файл зохионо (монголоор). */
  B.draft = async function () {
    const b = S.P.brand;
    const niche = metaMN("niche");
    if (!niche) throw new Error("Эхлээд сувгийнхаа нишийг нэг өгүүлбэрээр бичнэ үү.");

    const keys = S.BRAND_FIELDS.map(
      (d) => '  "' + d.k + '": "' + d.hint + '"'
    ).join(",\n");

    const prompt =
      "Та YouTube сувгийн урлагийн найруулагч бөгөөд брэнд стратегич. " +
      "Доорх ниш дээр үндэслэн уг сувгийн ӨВӨРМӨЦ брэнд файлыг зохио.\n\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON объект буцаа. Тайлбар, код блокын хашилтгүй.\n" +
      "- Бүх утга МОНГОЛ хэлээр, богино (8–20 үг), маш тодорхой, харагдахуйц.\n" +
      "- Ерөнхий үг бүү хэрэглэ («гоё», «сайхан», «мэргэжлийн»). Өнгө, материал, " +
      "линз, гэрлийн чиглэл, багажийн нэр гэх мэт бодит зүйл нэрлэ.\n" +
      "- Энэ суваг бусдаас ЯЛГАРАХ ёстой. Хамгийн ердийн хувилбарыг бүү сонго.\n" +
      B.REAL_RULE +
      "- Формат:\n{\n" +
      '  "titleFmt": "энэ нишид ажилладаг гарчгийн давтагдах загвар, нэг мөр",\n' +
      keys +
      "\n}\n\nСувгийн ниш: " +
      niche;

    const o = await WB.api.askJSON(prompt, 2200);
    if (!o || typeof o !== "object") throw new Error("хариу таарсангүй");

    S.pushHistory();
    if (typeof o.titleFmt === "string" && o.titleFmt.trim() && !metaMN("titleFmt")) {
      b.meta.titleFmt.mn = o.titleFmt.trim();
      b.meta.titleFmt.en = "";
      b.meta.titleFmt.src = "";
    }
    let n = 0;
    S.BRAND_FIELDS.forEach((d) => {
      const v = o[d.k];
      if (typeof v === "string" && v.trim()) {
        b.f[d.k].mn = v.trim();
        b.f[d.k].en = "";
        b.f[d.k].src = "";
        n++;
      }
    });
    S.touch();
    return n;
  };

  /** Брэндийн бүх мөр — Авто → Брэнд сонгогчид. */
  const META_HINT = {
    niche: "сувгийн ниш — нэг өгүүлбэр",
    titleFmt: "энэ сувгийн давтагдах гарчгийн загвар, нэг мөр"
  };
  B.rows = function () {
    const b = S.P.brand;
    return S.BRAND_META_FIELDS.map((d) => ({ k: d.k, lb: d.lb, layer: 1, hint: META_HINT[d.k], field: b.meta[d.k] }))
      .concat(S.BRAND_FIELDS.map((d) => ({ k: d.k, lb: d.lb, layer: d.layer, hint: d.hint, field: b.f[d.k] })));
  };
  function rowEmpty(r) {
    return !((r.field.mn || "").trim() || (r.field.en || "").trim());
  }
  B.rowEmpty = rowEmpty;

  /**
   * Авто → Брэнд: Авто‑гийн зохиосон ертөнц ба лавлагаа зургаас брэндийн
   * мөрүүдийг бөглөнө. `keys` өгвөл яг тэдгээрийг (бөглөгдсөн байсан ч)
   * ДАРЖ бичнэ — хэрэглэгч сонгогчоос өөрөө сонгосон. `keys` өгөөгүй бол
   * харагдацын давхаргын хоосон мөрүүдийг л бөглөнө.
   * @returns {{filled:string[], overwritten:string[], full?:boolean}}
   */
  B.fromWorld = async function (images, imageNames, keys) {
    const b = S.P.brand;
    const P = S.P;
    images = images || [];
    const rows = B.rows();
    const want = keys
      ? rows.filter((r) => keys.includes(r.k))
      : rows.filter((r) => r.layer === 2 && rowEmpty(r));
    if (!want.length) return { filled: [], overwritten: [], full: !keys };

    const world = [];
    if (P.logline.mn) world.push("Логлайн: " + P.logline.mn);
    P.cast.forEach((c) => {
      const d = [c.f.look.mn, c.f.cloth.mn, c.f.voice.mn].filter(Boolean).join("; ");
      if (d) world.push("Дүр " + (c.name || "") + ": " + d);
    });
    P.locs.forEach((l) => {
      const d = [l.f.look.mn, l.f.time.mn, l.f.mood.mn].filter(Boolean).join("; ");
      if (d) world.push("Байршил " + (l.name || "") + ": " + d);
    });
    P.scenes.slice(0, 6).forEach((sc) => sc.body.mn && world.push("Үзэгдэл: " + sc.body.mn));
    const cams = [...new Set(P.scenes.flatMap((sc) => sc.shots.map((sh) => sh.cam)).filter(Boolean))].slice(0, 8);
    if (cams.length) world.push("Кадрын камерууд: " + cams.join("; "));
    if (!world.length && !images.length) {
      throw new Error("Эхлээд Авто‑гоор ертөнц бүтээх эсвэл лавлагаа зураг оруулна уу.");
    }

    const fmt = want.map((r) => '  "' + r.k + '": "' + r.hint + '"').join(",\n");
    const prompt =
      "Та урлагийн найруулагч, брэнд стратегич. " +
      (images.length ? "Хавсаргасан " + images.length + " лавлагаа зураг ба д" : "Д") +
      "оорх ертөнцөөс YouTube сувгийн БРЭНД ФАЙЛЫН дараах талбаруудыг гарга.\n\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON объект буцаа. Тайлбар, код блокын хашилтгүй.\n" +
      "- Бүх утга МОНГОЛ хэлээр, богино (8–20 үг), бодит: өнгө, материал, линз, гэрлийн чиглэл, багажийн нэр.\n" +
      "- Бодитоор " + (images.length ? "зурагт харагдаж буй эсвэл " : "") + "ертөнцөд бичигдсэн зүйлээс гарга" +
      (images.length ? " — харагдац, гэрэл, палеттыг ЗУРГААС ав" : "") +
      "; хоолой, дуу авианы талбарыг ертөнцийн уур амьсгалд тохируулж санал болго.\n" +
      "- Энэ бол нэг ангийн биш, СУВГИЙН тогтмол хэв маяг — бүх ангид давтагдах зүйлийг бич.\n" +
      "- «гоё», «мэргэжлийн» зэрэг ерөнхий үг бүү хэрэглэ.\n" +
      B.REAL_RULE +
      "- Формат:\n{\n" + fmt + "\n}\n\n" +
      "Ертөнц:\n" + (world.join("\n") || "(зөвхөн зураг)");

    const o = await WB.api.askJSON(prompt, 1800, images.length ? { images: images } : undefined);
    if (!o || typeof o !== "object") throw new Error("хариу таарсангүй");

    S.pushHistory();
    const filled = [];
    const overwritten = [];
    want.forEach((r) => {
      const v = o[r.k];
      if (typeof v !== "string" || !v.trim()) return;
      (rowEmpty(r) ? filled : overwritten).push(r.lb);
      /* Шинэ монгол текст — англи талыг дахин орчуулахаар түгжээг тайлна
         (Camera Director эсвэл гар засвараар түгжигдсэн байсан ч). */
      r.field.mn = v.trim();
      r.field.en = "";
      r.field.src = "";
      r.field.unk = [];
      r.field.auto = true;
    });
    if (images.length && !(b.ref || "").trim() && imageNames && imageNames.length) {
      b.ref = "Авто‑гийн лавлагаа зураг: " + imageNames.join(", ");
    }
    S.touch();
    return { filled: filled, overwritten: overwritten };
  };

  /** Батлагдсан гарчгийн форматаар N ангийн гарчиг санал болгоно. */
  B.titles = async function (count) {
    const b = S.P.brand;
    const niche = metaMN("niche");
    if (!niche) throw new Error("Эхлээд сувгийнхаа нишийг бичнэ үү.");
    const n = Math.max(3, Math.min(12, count || 5));

    const prompt =
      "Та YouTube контентын судлаач. Доорх сувагт зориулж " + n + " ангийн гарчиг санал болго.\n\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON массив буцаа: [\"гарчиг\", …]. Өөр юу ч бүү бич.\n" +
      "- Бүх гарчиг МОНГОЛ хэлээр.\n" +
      "- Сэдэв бүр бие даасан, тухайн ангийг ганцаараа авч үзэхэд ойлгомжтой.\n" +
      "- Ил тод сониуч байдал үүсгэ, гэхдээ худал амлалт (clickbait) бүү өг.\n" +
      (metaMN("titleFmt") ? '- Гарчгийн формат: "' + metaMN("titleFmt") + '" — үүнийг баримтал.\n' : "") +
      (b.f.voice.mn ? "- Сувгийн өнгө аяс: " + b.f.voice.mn.trim() + "\n" : "") +
      "\nСувгийн ниш: " + niche;

    const arr = await WB.api.askJSON(prompt, 1200);
    if (!Array.isArray(arr)) throw new Error("жагсаалт ирсэнгүй");
    return arr.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim());
  };

  /**
   * 4‑р давхарга: юу ч үүсгэхээс өмнө чиглэл санал болгуулах.
   * Хариу нь бодит шийдэл байх ёстой — «юу хиймээр байна?» гэсэн асуулт биш.
   */
  B.direction = async function () {
    const b = S.P.brand;
    const P = S.P;
    const idea = (P.logline.mn || "").trim() || metaMN("niche");
    if (!idea) throw new Error("Эхлээд логлайн эсвэл сувгийн ниш бичнэ үү.");

    const prompt =
      "Та кино найруулагч. Доорх брэнд файл ба санаан дээр үндэслэн " +
      "ЮУ Ч ҮҮСГЭХЭЭС ӨМНӨ найруулгын чиглэлээ санал болго.\n\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON объект буцаа. Формат:\n" +
      '{ "look": "яг ямар харагдацаар үүсгэхээ 2-3 өгүүлбэрээр",\n' +
      '  "pacing": "кадрын тоо, кадрын урт, шилжилтийн шийдэл",\n' +
      '  "frame": "эхлээд баталгаажуулах ГАНЦ туршилтын кадрын агуулга, нэг өгүүлбэр",\n' +
      '  "risk": "энэ чиглэлийн хамгийн эмзэг тал, нэг өгүүлбэр",\n' +
      '  "look_en": "look‑ийн англи хувилбар",\n' +
      '  "pacing_en": "pacing‑ийн англи хувилбар",\n' +
      '  "frame_en": "frame‑ийн англи хувилбар — AI зураг үүсгэгчид өгөхөд бэлэн",\n' +
      '  "risk_en": "risk‑ийн англи хувилбар" }\n' +
      "- «_en» талбарууд нь монгол эхийнхээ ЯГ орчуулга байна, шинэ зүйл бүү нэм.\n" +
      "- Монгол талбарууд бүгд МОНГОЛ, тодорхой шийдэл болгож бич. Асуулт бүү тавь.\n" +
      "- Брэнд файлаас гажсан зүйл бүү санал болго.\n" +
      B.REAL_RULE + "\n" +
      B.autoContext() +
      "\nСанаа: " + idea;

    const o = await WB.api.askJSON(prompt, 2200);
    if (!o || typeof o !== "object") throw new Error("хариу таарсангүй");
    S.pushHistory();
    b.direction = S.fixDirection(o);
    S.touch();
    return b.direction;
  };

  /* ═════════════════ ДЭЛГЭЦ ═════════════════════════════════ */

  function bindPlain(node, get, set) {
    if (!node) return;
    if (node.value !== get()) node.value = get();
    node.oninput = () => {
      set(node.value);
      S.touch();
    };
  }

  function fieldsInto(boxId, layer) {
    const box = el(boxId);
    if (!box) return;
    box.innerHTML = "";
    const b = S.P.brand;
    S.BRAND_FIELDS.filter((d) => d.layer === layer).forEach((d) => {
      box.appendChild(WB.ui.dualField(b.f[d.k], "brand", d.lb, d.ph));
    });
  }

  /** Түгжээний мөр — нэг фрэйм дүрмийн одоогийн байдал. */
  function paintLock() {
    const bar = el("lockBar");
    if (!bar) return;
    const b = S.P.brand;
    const r = B.ready();
    const drift = B.lockDrift();
    bar.className = "lockbar " + (drift.length ? "warn" : b.locked ? "ok" : r.ok ? "warn" : "idle");
    const when = b.lockedAt ? new Date(b.lockedAt).toLocaleDateString("mn-MN") : "";
    if (drift.length) {
      bar.innerHTML =
        "<b>⚠ Түгжээ хуучирсан</b><span>" +
        U.esc(when) +
        " түгжсэний дараа өөрчлөгдсөн: <b>" +
        U.esc(drift.join(", ")) +
        "</b>. Шинэ туршилтын кадр гаргаж шалгаад дахин түгжинэ үү — тэр болтол промтод «түгжсэн» гэж бичигдэхгүй." +
        '</span><span class="lockact"><button class="tbtn2 acc" data-lock="relock">🔒 Шинэ харагдацаар түгжих</button>' +
        '<button class="tbtn2" data-lock="unlock">🔓 Түгжээ тайлах</button></span>';
      bar.querySelector('[data-lock="relock"]').onclick = () => {
        B.lock(true);
        B.render();
      };
      bar.querySelector('[data-lock="unlock"]').onclick = () => {
        B.lock(false);
        B.render();
      };
    } else if (b.locked) {
      bar.innerHTML =
        "<b>🔒 Стиль тогтсон</b><span>" +
        U.esc(when) +
        " — энэ харагдац бүх промтод автоматаар шингэж байна." +
        "</span>";
    } else if (r.ok) {
      bar.innerHTML =
        "<b>🔓 Түгжээгүй</b><span>Брэнд файл бөглөгдсөн. Одоо доорх туршилтын кадрыг " +
        "нэг зураг болгож үүсгээд, таалагдвал «Стиль тогтоосон» гэж тэмдэглэ.</span>";
    } else {
      bar.innerHTML =
        "<b>◻ Эхлээгүй</b><span>Дутуу: " +
        U.esc(r.missing.slice(0, 4).join(", ")) +
        (r.missing.length > 4 ? " …" : "") +
        "</span>";
    }
  }

  B.render = function () {
    const b = S.P.brand;
    if (!b || !el("p-brand")) return;

    bindPlain(el("brandTopics"), () => b.meta.topics, (v) => (b.meta.topics = v));
    bindPlain(el("brandRef"), () => b.ref, (v) => (b.ref = v));
    const frameBox = el("frameSubjectField");
    if (frameBox) {
      frameBox.innerHTML = "";
      frameBox.appendChild(
        WB.ui.dualField(
          b.frameSubject,
          "brand",
          "Туршилтын кадрын агуулга — нэг өгүүлбэр",
          "хөгшин анчин үүрийн бүрийд говийн хадан дээр ганцаараа зогсоно"
        )
      );
    }

    const metaBox = el("brandMetaFields");
    if (metaBox) {
      metaBox.innerHTML = "";
      S.BRAND_META_FIELDS.forEach((d) => {
        metaBox.appendChild(WB.ui.dualField(b.meta[d.k], "brand", d.lb, d.ph));
      });
    }
    fieldsInto("brandLookFields", 2);
    fieldsInto("brandVoiceFields", 3);

    const lockChk = el("lockChk");
    if (lockChk) {
      lockChk.checked = B.isLocked();
      lockChk.onchange = () => {
        B.lock(lockChk.checked);
        paintLock();
        B.paintOutputs();
      };
    }
    const dirChk = el("dirChk");
    if (dirChk) {
      dirChk.checked = b.checkpoint !== false;
      dirChk.onchange = () => {
        b.checkpoint = dirChk.checked;
        S.touch();
        B.paintOutputs();
      };
    }

    paintLock();
    B.paintOutputs();
    paintDirection();
  };

  /** Гаралтын хоёр блокийг (нэг фрэйм + мастер промт) шинэчилнэ. */
  B.paintOutputs = function () {
    const fo = el("frameOut");
    if (fo) {
      const p = B.oneFramePrompt();
      fo.textContent = p || "Брэнд файлын «Харагдац» хэсгийг бөглөөд туршилтын кадраа бичнэ үү.";
      fo.classList.toggle("dimmed", !p);
    }
    const mo = el("masterOut");
    if (mo) mo.textContent = B.masterPrompt();
    const lockChk = el("lockChk");
    if (lockChk) lockChk.checked = B.isLocked();
    paintLock();
  };

  function paintDirection() {
    const box = el("dirOut");
    if (!box) return;
    const d = S.P.brand.direction;
    if (!d) {
      box.classList.remove("on");
      box.innerHTML = "";
      return;
    }
    box.classList.add("on");
    box.innerHTML = "";
    S.DIRECTION_FIELDS.forEach((x) => {
      box.appendChild(WB.ui.dualField(d[x.k], "brand", x.lb.replace("Чиглэл · ", ""), ""));
    });
  }
  B.paintDirection = paintDirection;

  /** Санал болгосон чиглэлийг устгана — мастер промтоос мөн хасагдана. */
  B.clearDirection = function () {
    S.pushHistory();
    S.P.brand.direction = null;
    S.touch();
    paintDirection();
    B.paintOutputs();
  };
})(window.WB);
