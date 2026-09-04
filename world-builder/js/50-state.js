/* ═════════════════════════════════════════════════════════════
   Төслийн төлөв: автомат хадгалалт, буцаах (undo), сан.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const S = (WB.state = {});
  const U = WB.util;

  /** Хос хэлний талбар. mn — монгол, en — англи, auto — автоматаар шинэчлэх эсэх */
  const F = (S.F = function (mn, en) {
    return { mn: mn || "", en: en || "", auto: true, unk: [], src: "" };
  });

  S.CAST_FIELDS = [
    { k: "look", lb: "Царай, бие бялдар", ph: "24 настай залуу эмэгтэй, урт хар үс сүлжсэн, хурц хүрэн нүд, туранхай царай" },
    { k: "cloth", lb: "Хувцас, хэрэглэл", ph: "хөх торгон дээл, мөнгөн бүстэй, өвлийн арьсан гутал, мөрөндөө нум" },
    { k: "person", lb: "Зан чанар, төрх", ph: "тайван боловч зөрүүд, ярихдаа нүд рүү шууд харна" },
    { k: "voice", lb: "Дуу хоолой", ph: "намуухан, бага зэрэг сөөнгө залуу эмэгтэй хоолой" }
  ];
  S.LOC_FIELDS = [
    { k: "look", lb: "Харагдах байдал", ph: "намрын хээр тал, шар хатсан өвс, алсад хөх уулс" },
    { k: "time", lb: "Цаг үе, гэрэл", ph: "нар жаргах үе, алтан гэрэл, урт зөөлөн сүүдэр" },
    { k: "mood", lb: "Уур амьсгал", ph: "нам гүм, ганцаардмал, бага зэрэг нууцлаг" },
    { k: "detail", lb: "Нарийн деталь", ph: "салхинд давалгаалах өвс, холын гэрийн утаа, морины мөр" }
  ];

  /* ── Брэнд файл: сувгийн гарын үсэг ──────────────────────
     layer 2 — харагдац (промт болгонд шингэнэ)
     layer 3 — хоолой (скрипт, дуу оруулгад шингэнэ)
     need    — «Нэг фрэйм дүрэм»‑ийг түгжихэд заавал шаардлагатай  */
  S.BRAND_FIELDS = [
    {
      k: "look", layer: 2, need: true, lb: "Визуал гарын үсэг",
      ph: "бодит кино дүрслэл, 35мм хальсны ширхэг, гүехэн фокус, бага зэрэг гар камерын хөдөлгөөн",
      hint: "сувгийн ерөнхий харагдац — техник, материал, өнгө аяс"
    },
    {
      k: "light", layer: 2, need: true, lb: "Гэрэлтүүлэг",
      ph: "нам дор алтан гэрэл, хатуу урт сүүдэр, арын туяа, утаан дундах гэрлийн багана",
      hint: "гэрлийн чиглэл, зөөлөн/хатуу, цагийн үе"
    },
    {
      k: "palette", layer: 2, need: true, lb: "Өнгөний палетт",
      ph: "бүдэг хүрэн, шатсан улбар шар, гүн индиго, цайвар элсэн өнгө",
      hint: "3–4 нэрлэсэн өнгө, давамгайлах нь эхэнд"
    },
    {
      k: "camera", layer: 2, need: true, lb: "Камерын дүрэм",
      ph: "удаан дөхөж орох кадр, зогсонги трипод, огцом зүсэлт байхгүй, нүдний түвшин",
      hint: "хөдөлгөөн, өндөр, линз, хэмнэл"
    },
    {
      k: "avoid", layer: 2, need: false, lb: "Хэзээ ч гаргахгүй",
      ph: "орчин үеийн хувцас, машин, неон өнгө, дэлгэц дээрх текст, лого",
      hint: "энэ сувагт хэзээ ч харагдах ёсгүй зүйлс"
    },
    {
      k: "voice", layer: 3, need: true, lb: "Өгүүлэгчийн өнгө аяс",
      ph: "намуухан, өөртөө итгэлтэй, богино өгүүлбэр, яарахгүй, сүржин үггүй",
      hint: "хоолойны өнгө, өгүүлбэрийн урт, хурд"
    },
    {
      k: "words", layer: 3, need: false, lb: "Хэрэглэдэг үг, хэллэг",
      ph: "«энэ л мөч», «одоо ажигла», «жаахан ухаж үзье»",
      hint: "сувгийн давтагддаг 3–5 хэллэг"
    },
    {
      k: "nowords", layer: 3, need: false, lb: "Хэрэглэдэггүй үг",
      ph: "«гайхалтай», «хувьсгал», «шок», хэт сэтгэл хөдлөлийн хэллэг",
      hint: "хориотой үг, хэллэг"
    },
    {
      k: "audio", layer: 3, need: false, lb: "Дуу авианы палетт",
      ph: "морин хуурын ганц шугам, гүн sub bass, амьсгалын өргөлт, 3 секундын sting",
      hint: "хөгжмийн зэмсэг, темп, sting, чимээний давхарга"
    }
  ];

  S.STYLE_PRESETS = [
    { id: "anime", lb: "Аниме", v: "anime style, clean line art, vivid colours, cel shading" },
    { id: "cine", lb: "Кино гэрэлтүүлэг", v: "cinematic lighting, film grain, shallow depth of field, anamorphic" },
    { id: "photo", lb: "Бодит дүрслэл", v: "photorealistic, natural light, ultra detailed, 35mm" },
    { id: "mn", lb: "Монгол өнгө аяс", v: "Mongolian cultural setting, traditional deel garments, steppe landscape" },
    { id: "ink", lb: "Уран зураг", v: "painterly, ink and wash, textured brushwork" },
    { id: "noir", lb: "Ноар", v: "high contrast noir lighting, deep shadows, moody" },
    { id: "epic", lb: "Эпик", v: "epic wide composition, dramatic scale, volumetric light" },
    { id: "retro", lb: "Ретро кино", v: "1970s film stock, faded colours, soft halation" }
  ];

  S.TARGETS = [
    { id: "image", lb: "Зураг — Midjourney / Nano Banana / Seedream" },
    { id: "video", lb: "Видео — Kling / Runway / Veo / Seedance" },
    { id: "higgs", lb: "Higgsfield — камерын хөдөлгөөнтэй" },
    { id: "sora", lb: "Sora — урт өгүүлэмжтэй" }
  ];

  /** Хоосон брэнд файл. */
  S.blankBrand = function () {
    const f = {};
    S.BRAND_FIELDS.forEach((d) => (f[d.k] = F("")));
    return {
      meta: { niche: "", titleFmt: "", topics: "" },
      f: f,
      frameSubject: "",
      ref: "",
      locked: false,
      lockedAt: 0,
      checkpoint: true,
      direction: null
    };
  };

  S.blank = function () {
    return {
      v: 3,
      id: U.uid(),
      title: "Нэргүй төсөл",
      logline: F(),
      brand: S.blankBrand(),
      scenes: [],
      cast: [],
      locs: [],
      custom: {},
      opts: {
        styles: ["anime"],
        target: "image",
        ar: "16:9",
        negative: "",
        continuity: true,
        autoTranslate: true,
        brandOn: true
      },
      updated: Date.now()
    };
  };

  S.P = S.blank();
  WB.tr.customRef = S.P.custom;

  /* ── шилжилтийн нийцтэй болголт (хуучин файл нээх) ──────── */
  S.normalize = function (d) {
    const p = S.blank();
    if (!d || typeof d !== "object") return p;
    p.id = d.id || p.id;
    p.title = d.title || p.title;
    p.logline = fixField(d.logline);
    p.brand = fixBrand(d.brand);
    p.custom = d.custom && typeof d.custom === "object" ? d.custom : {};
    p.scenes = (Array.isArray(d.scenes) ? d.scenes : []).map((s) => ({
      id: s.id || U.uid(),
      name: s.name || "",
      body: fixField(s.body),
      pro: s.pro || "",
      castIds: Array.isArray(s.castIds) ? s.castIds : [],
      locId: s.locId || "",
      shots: Array.isArray(s.shots)
        ? s.shots.map((sh) => ({
            id: sh.id || U.uid(),
            cam: sh.cam || "",
            dur: sh.dur || "",
            pro: sh.pro || "",
            body: fixField(sh.body)
          }))
        : []
    }));
    p.cast = (Array.isArray(d.cast) ? d.cast : []).map((c) => ({
      id: c.id || U.uid(),
      name: c.name || "",
      pro: c.pro || "",
      f: fixFieldSet(c.f, S.CAST_FIELDS)
    }));
    p.locs = (Array.isArray(d.locs) ? d.locs : []).map((l) => ({
      id: l.id || U.uid(),
      name: l.name || "",
      pro: l.pro || "",
      f: fixFieldSet(l.f, S.LOC_FIELDS)
    }));
    if (d.opts && typeof d.opts === "object") Object.assign(p.opts, d.opts);
    p.updated = d.updated || Date.now();
    return p;
  };
  function fixField(f) {
    if (!f || typeof f !== "object") return F(typeof f === "string" ? f : "");
    return { mn: f.mn || "", en: f.en || "", auto: f.auto !== false, unk: f.unk || [], src: f.src || "" };
  }
  function fixBrand(b) {
    const out = S.blankBrand();
    if (!b || typeof b !== "object") return out;
    if (b.meta && typeof b.meta === "object") {
      out.meta.niche = b.meta.niche || "";
      out.meta.titleFmt = b.meta.titleFmt || "";
      out.meta.topics = b.meta.topics || "";
    }
    out.f = fixFieldSet(b.f, S.BRAND_FIELDS);
    out.frameSubject = b.frameSubject || "";
    out.ref = b.ref || "";
    out.locked = !!b.locked;
    out.lockedAt = b.lockedAt || 0;
    out.checkpoint = b.checkpoint !== false;
    out.direction = b.direction && typeof b.direction === "object" ? b.direction : null;
    return out;
  }
  function fixFieldSet(obj, defs) {
    const out = {};
    defs.forEach((d) => (out[d.k] = fixField(obj && obj[d.k])));
    return out;
  }

  /* ── бүх талбарыг нэг жагсаалтаар ───────────────────────── */
  S.allFields = function (kinds) {
    const P = S.P;
    const out = [];
    const want = (k) => !kinds || kinds.includes(k);
    if (want("logline")) out.push({ field: P.logline, kind: "logline", label: "Логлайн" });
    if (want("brand"))
      S.BRAND_FIELDS.forEach((d) =>
        out.push({ field: P.brand.f[d.k], kind: "brand", label: "Брэнд · " + d.lb })
      );
    if (want("scene"))
      P.scenes.forEach((s, i) => out.push({ field: s.body, kind: "scene", label: s.name || "Үзэгдэл " + (i + 1) }));
    if (want("char"))
      P.cast.forEach((c, i) =>
        S.CAST_FIELDS.forEach((f) =>
          out.push({ field: c.f[f.k], kind: "char", label: (c.name || "Дүр " + (i + 1)) + " · " + f.lb })
        )
      );
    if (want("loc"))
      P.locs.forEach((l, i) =>
        S.LOC_FIELDS.forEach((f) =>
          out.push({ field: l.f[f.k], kind: "loc", label: (l.name || "Байршил " + (i + 1)) + " · " + f.lb })
        )
      );
    if (want("shot"))
      P.scenes.forEach((s) => s.shots.forEach((sh) => out.push({ field: sh.body, kind: "shot", label: s.name })));
    return out;
  };

  /** Орчуулах шаардлагатай талбарууд (монгол бичигтэй, авто, англи нь хоцорсон). */
  S.pending = function (kinds, force) {
    return S.allFields(kinds).filter((t) => {
      const f = t.field;
      if (!(f.mn || "").trim()) return false;
      if (!force && !f.auto) return false;
      if (!force && f.en && f.src) return false;
      return true;
    });
  };

  /* ── автомат хадгалалт ──────────────────────────────────── */
  const AUTOSAVE_KEY = "autosave";
  S.touch = function () {
    S.P.updated = Date.now();
    S.autosave();
    WB.emit("state:changed", S.P);
  };
  S.autosave = U.debounce(function () {
    WB.store.set(AUTOSAVE_KEY, S.P);
    WB.emit("state:saved", S.P.updated);
  }, 700);

  S.restore = function () {
    const d = WB.store.get(AUTOSAVE_KEY, null);
    if (!d) return false;
    S.P = S.normalize(d);
    WB.tr.customRef = S.P.custom;
    return true;
  };

  S.replace = function (data) {
    S.pushHistory();
    S.P = S.normalize(data);
    WB.tr.customRef = S.P.custom;
    S.touch();
    WB.emit("state:replaced", S.P);
  };

  S.reset = function () {
    S.replace(S.blank());
  };

  /* ── буцаах / дахин хийх ────────────────────────────────── */
  const past = [];
  const future = [];
  const HIST_MAX = 40;
  S.pushHistory = function () {
    try {
      past.push(JSON.stringify(S.P));
      if (past.length > HIST_MAX) past.shift();
      future.length = 0;
      WB.emit("history", { undo: past.length, redo: future.length });
    } catch (e) {}
  };
  S.undo = function () {
    if (!past.length) return false;
    future.push(JSON.stringify(S.P));
    S.P = S.normalize(JSON.parse(past.pop()));
    WB.tr.customRef = S.P.custom;
    S.touch();
    WB.emit("state:replaced", S.P);
    WB.emit("history", { undo: past.length, redo: future.length });
    return true;
  };
  S.redo = function () {
    if (!future.length) return false;
    past.push(JSON.stringify(S.P));
    S.P = S.normalize(JSON.parse(future.pop()));
    WB.tr.customRef = S.P.custom;
    S.touch();
    WB.emit("state:replaced", S.P);
    WB.emit("history", { undo: past.length, redo: future.length });
    return true;
  };

  /* ── төслийн сан (хөтөч дотор) ──────────────────────────── */
  const LIB = "proj:";
  S.saveToLibrary = function () {
    WB.store.set(LIB + S.P.id, { title: S.P.title, updated: Date.now(), data: S.P });
    return true;
  };
  S.library = function () {
    return WB.store
      .keys(LIB)
      .map((k) => {
        const rec = WB.store.get(k, null);
        return rec ? { key: k, id: k.slice(LIB.length), title: rec.title, updated: rec.updated } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.updated - a.updated);
  };
  S.openFromLibrary = function (key) {
    const rec = WB.store.get(key, null);
    if (!rec || !rec.data) return false;
    S.replace(rec.data);
    return true;
  };
  S.deleteFromLibrary = function (key) {
    WB.store.del(key);
  };

  /* ── файл руу гаргах / оруулах ──────────────────────────── */
  S.download = function (filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };

  S.exportJSON = function () {
    S.download(U.slug(S.P.title) + ".json", JSON.stringify(S.P, null, 1), "application/json");
  };

  /* ── шинэ элемент үүсгэх ────────────────────────────────── */
  S.newScene = function (name, mn) {
    return { id: U.uid(), name: name || "", body: F(mn || ""), pro: "", castIds: [], locId: "", shots: [] };
  };
  S.newCast = function (name, values) {
    const f = {};
    S.CAST_FIELDS.forEach((d) => (f[d.k] = F((values && values[d.k]) || "")));
    return { id: U.uid(), name: name || "", pro: "", f: f };
  };
  S.newLoc = function (name, values) {
    const f = {};
    S.LOC_FIELDS.forEach((d) => (f[d.k] = F((values && values[d.k]) || "")));
    return { id: U.uid(), name: name || "", pro: "", f: f };
  };
})(window.WB);
