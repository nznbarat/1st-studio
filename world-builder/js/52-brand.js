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

  /* ── туслахууд ──────────────────────────────────────────── */
  function txt(f) {
    return ((f && (f.en || f.mn)) || "").trim().replace(/\s*\.?\s*$/, "");
  }
  function joinParts(arr) {
    const body = arr.filter(Boolean).join(". ");
    return body ? body : "";
  }

  /** Брэнд файлын хэсэг бүр бөглөгдсөн эсэх. */
  B.ready = function () {
    const b = S.P.brand;
    const missing = [];
    if (!(b.meta.niche || "").trim()) missing.push("Сувгийн ниш");
    S.BRAND_FIELDS.forEach((d) => {
      if (d.need && !(b.f[d.k].mn || "").trim()) missing.push(d.lb);
    });
    return { ok: missing.length === 0, missing: missing };
  };

  /** Брэнд файл огт хөндөгдөөгүй юу? (хоосон бол сануулга гаргахгүй) */
  B.untouched = function () {
    const b = S.P.brand;
    if ((b.meta.niche || "").trim()) return false;
    return !S.BRAND_FIELDS.some((d) => (b.f[d.k].mn || "").trim());
  };

  /* ── 2‑р давхарга: промт болгонд шингэдэг визуал мөр ────── */
  B.visualLine = function () {
    const b = S.P.brand;
    if (!b) return "";
    return joinParts([txt(b.f.look), txt(b.f.light), txt(b.f.palette), txt(b.f.camera)]);
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
    const subj = (subject != null ? subject : b.frameSubject || "").trim();
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
    b.locked = !!on;
    b.lockedAt = on ? Date.now() : 0;
    S.touch();
  };

  /**
   * Юу үүсгэхийн өмнөх сануулга. Брэнд файл хоосон бол чимээгүй.
   * @returns {string} хоосон бол асуудалгүй
   */
  B.gate = function () {
    if (B.untouched()) return "";
    const b = S.P.brand;
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
    L.push("Channel: " + ((b.meta.niche || "").trim() || "(тодорхойлоогүй)"));
    if ((b.meta.titleFmt || "").trim()) L.push("Proven title format: " + b.meta.titleFmt.trim());
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
    if (b.locked) {
      L.push(
        "Style is LOCKED — approved on a single reference frame" +
          (b.lockedAt ? " (" + new Date(b.lockedAt).toISOString().slice(0, 10) + ")" : "") +
          "."
      );
      if ((b.ref || "").trim()) L.push("Reference frame: " + b.ref.trim());
    } else {
      L.push("Style is NOT locked yet — generate ONE still image first and wait for approval.");
    }

    L.push("", "=== LAYER 3 · VOICE ===");
    if (txt(b.f.voice)) L.push("Narrator tone: " + txt(b.f.voice) + ".");
    if (txt(b.f.words)) L.push("Signature phrasing: " + txt(b.f.words) + ".");
    if (txt(b.f.nowords)) L.push("Never say: " + txt(b.f.nowords) + ".");
    if (txt(b.f.audio)) L.push("Audio palette: " + txt(b.f.audio) + ".");

    L.push("", "=== LAYER 4 · CHECKPOINT ===");
    if (b.checkpoint !== false) {
      L.push(
        "Before generating ANY image or video, propose the direction first:",
        "  - the exact look you will render,",
        "  - the pacing decision (shot count, shot lengths, transitions),",
        "  - one still frame to approve.",
        "Wait for my approval. Do not render the full sequence unprompted."
      );
    } else {
      L.push("(Хяналтын цэг унтраалттай — AI шууд үүсгэнэ.)");
    }
    return L.join("\n");
  };

  /** Автомат горимд монгол текст зохиоход өгөх брэнд контекст. */
  B.autoContext = function () {
    const b = S.P.brand;
    if (!b || B.untouched() || S.P.opts.brandOn === false) return "";
    const L = ["", "Сувгийн брэнд файл — доорхийг ЗААВАЛ баримтална:"];
    if ((b.meta.niche || "").trim()) L.push("- Ниш: " + b.meta.niche.trim());
    if ((b.meta.titleFmt || "").trim()) L.push("- Гарчгийн формат: " + b.meta.titleFmt.trim());
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
    const niche = (b.meta.niche || "").trim();
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
      "- Формат:\n{\n" +
      '  "titleFmt": "энэ нишид ажилладаг гарчгийн давтагдах загвар, нэг мөр",\n' +
      keys +
      "\n}\n\nСувгийн ниш: " +
      niche;

    const o = await WB.api.askJSON(prompt, 2200);
    if (!o || typeof o !== "object") throw new Error("хариу таарсангүй");

    S.pushHistory();
    if (typeof o.titleFmt === "string" && o.titleFmt.trim() && !(b.meta.titleFmt || "").trim()) {
      b.meta.titleFmt = o.titleFmt.trim();
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

  /** Батлагдсан гарчгийн форматаар N ангийн гарчиг санал болгоно. */
  B.titles = async function (count) {
    const b = S.P.brand;
    const niche = (b.meta.niche || "").trim();
    if (!niche) throw new Error("Эхлээд сувгийнхаа нишийг бичнэ үү.");
    const n = Math.max(3, Math.min(12, count || 5));

    const prompt =
      "Та YouTube контентын судлаач. Доорх сувагт зориулж " + n + " ангийн гарчиг санал болго.\n\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON массив буцаа: [\"гарчиг\", …]. Өөр юу ч бүү бич.\n" +
      "- Бүх гарчиг МОНГОЛ хэлээр.\n" +
      "- Сэдэв бүр бие даасан, тухайн ангийг ганцаараа авч үзэхэд ойлгомжтой.\n" +
      "- Ил тод сониуч байдал үүсгэ, гэхдээ худал амлалт (clickbait) бүү өг.\n" +
      (b.meta.titleFmt ? '- Гарчгийн формат: "' + b.meta.titleFmt.trim() + '" — үүнийг баримтал.\n' : "") +
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
    const idea = (P.logline.mn || b.meta.niche || "").trim();
    if (!idea) throw new Error("Эхлээд логлайн эсвэл сувгийн ниш бичнэ үү.");

    const prompt =
      "Та кино найруулагч. Доорх брэнд файл ба санаан дээр үндэслэн " +
      "ЮУ Ч ҮҮСГЭХЭЭС ӨМНӨ найруулгын чиглэлээ санал болго.\n\n" +
      "Шаардлага:\n" +
      "- Зөвхөн JSON объект буцаа. Формат:\n" +
      '{ "look": "яг ямар харагдацаар үүсгэхээ 2-3 өгүүлбэрээр",\n' +
      '  "pacing": "кадрын тоо, кадрын урт, шилжилтийн шийдэл",\n' +
      '  "frame": "эхлээд баталгаажуулах ГАНЦ туршилтын кадрын агуулга, нэг өгүүлбэр",\n' +
      '  "risk": "энэ чиглэлийн хамгийн эмзэг тал, нэг өгүүлбэр" }\n' +
      "- Бүх утга МОНГОЛ хэлээр, тодорхой шийдэл болгож бич. Асуулт бүү тавь.\n" +
      "- Брэнд файлаас гажсан зүйл бүү санал болго.\n\n" +
      B.autoContext() +
      "\nСанаа: " + idea;

    const o = await WB.api.askJSON(prompt, 1500);
    if (!o || typeof o !== "object") throw new Error("хариу таарсангүй");
    b.direction = o;
    S.touch();
    return o;
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
    bar.className = "lockbar " + (b.locked ? "ok" : r.ok ? "warn" : "idle");
    const when = b.lockedAt ? new Date(b.lockedAt).toLocaleDateString("mn-MN") : "";
    if (b.locked) {
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

    bindPlain(el("brandNiche"), () => b.meta.niche, (v) => (b.meta.niche = v));
    bindPlain(el("brandTitleFmt"), () => b.meta.titleFmt, (v) => (b.meta.titleFmt = v));
    bindPlain(el("brandTopics"), () => b.meta.topics, (v) => (b.meta.topics = v));
    bindPlain(el("brandRef"), () => b.ref, (v) => (b.ref = v));
    bindPlain(el("frameSubject"), () => b.frameSubject, (v) => (b.frameSubject = v));

    fieldsInto("brandLookFields", 2);
    fieldsInto("brandVoiceFields", 3);

    const lockChk = el("lockChk");
    if (lockChk) {
      lockChk.checked = !!b.locked;
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
    const rows = [
      ["Харагдац", d.look],
      ["Хэмнэл", d.pacing],
      ["Эхлээд баталгаажуулах кадр", d.frame],
      ["Эмзэг тал", d.risk]
    ];
    box.classList.add("on");
    box.innerHTML = rows
      .filter((r) => r[1])
      .map((r) => '<div class="issue tip"><b>' + U.esc(r[0]) + ":</b> " + U.esc(r[1]) + "</div>")
      .join("");
  }
  B.paintDirection = paintDirection;
})(window.WB);
