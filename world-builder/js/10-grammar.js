/* ═════════════════════════════════════════════════════════════
   Монгол хэлний энгийн морфологи — офлайн орчуулгын үндэс.
   Дагавар тайлах, эгшиг сэргээх, англи тийн ялгалыг буулгах.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const G = (WB.gram = {});

  /* ── кирилл → латин галиг ───────────────────────────────── */
  const TRANSLIT = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z", и: "i",
    й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p", р: "r", с: "s",
    т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };
  G.translit = function (w) {
    return String(w)
      .split("")
      .map((c) => {
        const low = c.toLowerCase();
        const t = TRANSLIT[low];
        if (t === undefined) return c;
        return c === low ? t : t.charAt(0).toUpperCase() + t.slice(1);
      })
      .join("");
  };

  /* ── дагавар үг (postposition) — англид урд нь тавигдана ── */
  G.POSTP = {
    дотор: "inside", доторх: "within", дотроос: "from inside",
    дээр: "on", дээрх: "upon", дээрээс: "from above", дээгүүр: "above",
    доор: "beneath", доорх: "underneath", доогуур: "under", доороос: "from below",
    хажууд: "beside", хажуугаар: "past", дэргэд: "next to", ойролцоо: "near",
    ард: "behind", ардаас: "from behind", хойно: "behind", хойноос: "from behind",
    өмнө: "in front of", урд: "in front of", өмнөөс: "from the front",
    дунд: "among", дундуур: "through the middle of", хооронд: "between",
    тухай: "about", талаар: "regarding", руу: "toward", рүү: "toward",
    луу: "toward", лүү: "toward", хүртэл: "as far as", орчим: "around",
    "эргэн тойронд": "all around", тойрон: "around", хамт: "together with",
    гадна: "outside", гадуур: "around the outside of", гадаа: "outside",
    дагуу: "along", дамжин: "through", туршид: "throughout", хажуугаас: "from the side",
    хүрэх: "reaching", "дээрээ": "on top", "доороо": "underneath", "цаана": "beyond",
    "өөд": "up toward", "уруу": "down toward", "тийш": "in the direction of",
    "нааш": "hither", "цааш": "onward", "хамаагүй": "regardless of"
  };

  /* ── дагаварын хүснэгт: {дагавар, тэмдэг} ───────────────
     тэмдэг: gen үүсгэх, dat өгөх‑орших, abl гарах, ins үйлдэх,
     com хамтрах, priv үгүйсгэх, acc заах, dir чиглэх, pl олон тоо,
     v үйл үгийн хэлбэр (утга нь нэрлэх хэлбэртээ буцна)          */
  const SUF = [
    // урт дагавраас эхэлж тайлна
    ["уудынхаа", ["pl", "gen"]], ["үүдийнхээ", ["pl", "gen"]],
    ["нуудынхаа", ["pl", "gen"]], ["нүүдийнхээ", ["pl", "gen"]],
    ["ийнхээ", ["gen"]], ["ынхаа", ["gen"]], ["нийхээ", ["gen"]], ["ныхаа", ["gen"]],
    ["уудын", ["pl", "gen"]], ["үүдийн", ["pl", "gen"]], ["нуудын", ["pl", "gen"]], ["нүүдийн", ["pl", "gen"]],
    ["уудад", ["pl", "dat"]], ["үүдэд", ["pl", "dat"]], ["нуудад", ["pl", "dat"]], ["нүүдэд", ["pl", "dat"]],
    ["уудыг", ["pl", "acc"]], ["үүдийг", ["pl", "acc"]], ["нуудыг", ["pl", "acc"]], ["нүүдийг", ["pl", "acc"]],
    ["уудаас", ["pl", "abl"]], ["үүдээс", ["pl", "abl"]],
    ["уудтай", ["pl", "com"]], ["үүдтэй", ["pl", "com"]],
    ["чуудын", ["pl", "gen"]], ["чуудыг", ["pl", "acc"]],
    ["тайгаа", ["com"]], ["тэйгээ", ["com"]], ["тойгоо", ["com"]], ["төйгөө", ["com"]],
    ["аараа", ["ins"]], ["ээрээ", ["ins"]], ["оороо", ["ins"]], ["өөрөө", ["ins"]],
    ["аасаа", ["abl"]], ["ээсээ", ["abl"]], ["оосоо", ["abl"]], ["өөсөө", ["abl"]],
    ["даа", ["dat"]], ["дээ", ["dat"]], ["доо", ["dat"]], ["дөө", ["dat"]],
    ["таа", ["dat"]], ["тээ", ["dat"]], ["тоо", ["dat"]], ["төө", ["dat"]],
    ["ууд", ["pl"]], ["үүд", ["pl"]], ["нууд", ["pl"]], ["нүүд", ["pl"]], ["чууд", ["pl"]],
    ["нар", ["pl"]], ["нэр", ["pl"]], ["нэрийн", ["pl", "gen"]],
    ["гүйгээр", ["priv"]], ["гүй", ["priv"]],
    ["лаараа", ["v"]], ["лээрээ", ["v"]],
    ["сангүй", ["v", "neg"]], ["сэнгүй", ["v", "neg"]], ["сонгүй", ["v", "neg"]], ["сөнгүй", ["v", "neg"]],
    ["даггүй", ["v", "neg"]], ["дэггүй", ["v", "neg"]], ["доггүй", ["v", "neg"]], ["дөггүй", ["v", "neg"]],
    ["маарггүй", ["v", "neg"]],
    ["сан", ["v"]], ["сэн", ["v"]], ["сон", ["v"]], ["сөн", ["v"]],
    ["даг", ["v"]], ["дэг", ["v"]], ["дог", ["v"]], ["дөг", ["v"]],
    ["лаа", ["v"]], ["лээ", ["v"]], ["лоо", ["v"]], ["лөө", ["v"]],
    ["жээ", ["v"]], ["чээ", ["v"]], ["хэд", ["v"]],
    ["аад", ["v"]], ["ээд", ["v"]], ["оод", ["v"]], ["өөд", ["v"]],
    ["вал", ["v", "cond"]], ["вэл", ["v", "cond"]], ["вол", ["v", "cond"]], ["вөл", ["v", "cond"]],
    ["маар", ["v", "want"]], ["мээр", ["v", "want"]], ["моор", ["v", "want"]], ["мөөр", ["v", "want"]],
    ["хаар", ["v"]], ["хээр", ["v"]],
    ["уулах", ["v", "caus"]], ["үүлэх", ["v", "caus"]],
    /* эзэмшлийн буцах нөхцөл: хуур+аа → «his fiddle». Үйл үгийн цагийн
       дагаваруудын ДАРАА байрлана — эс бөгөөс «дуулаа» → «дуу» болно. */
    ["аа", ["poss"]], ["ээ", ["poss"]], ["оо", ["poss"]], ["өө", ["poss"]],
    ["ийн", ["gen"]], ["ний", ["gen"]], ["ын", ["gen"]], ["ны", ["gen"]],
    ["тай", ["com"]], ["тэй", ["com"]], ["той", ["com"]], ["төй", ["com"]],
    ["аас", ["abl"]], ["ээс", ["abl"]], ["оос", ["abl"]], ["өөс", ["abl"]],
    ["аар", ["ins"]], ["ээр", ["ins"]], ["оор", ["ins"]], ["өөр", ["ins"]],
    ["ийг", ["acc"]], ["ыг", ["acc"]],
    ["луу", ["dir"]], ["лүү", ["dir"]], ["руу", ["dir"]], ["рүү", ["dir"]],
    ["на", ["v"]], ["нэ", ["v"]], ["но", ["v"]], ["нө", ["v"]],
    ["в", ["v"]], /* энгийн өнгөрсөн цаг: харав, ирэв */
    ["ж", ["v"]], ["ч", ["v"]],
    ["д", ["dat"]], ["т", ["dat"]],
    ["ий", ["gen"]],
    ["н", []], ["г", ["acc"]]
  ];

  /* Дагавар залгахад дундах богино эгшиг унана: намар→намр‑, өвөл→өвл‑ */
  G.vowelRestore = function (stem) {
    if (stem.length < 3) return [];
    const head = stem.slice(0, -1);
    const last = stem.slice(-1);
    if (/[аэоөуүийяёеы]/.test(last)) return [];
    return ["а", "э", "о", "ө", "у", "ү", "и"].map((v) => head + v + last);
  };

  /* Үйл үгийн үндсийг сэргээх оролдлого (‑х төгсгөлт хэлбэрүүд) */
  G.verbForms = function (stem) {
    return [stem + "х", stem + "ах", stem + "эх", stem + "ох", stem + "өх", stem + "ых", stem + "их"];
  };

  /**
   * Үгийг задлан шинжилнэ.
   * @returns {Array<{stem:string, tags:string[]}>} — оролдох боломжит үндэс, урьдчилсан эрэмбээр
   */
  G.analyze = function (word) {
    const out = [{ stem: word, tags: [] }];
    let layer = [{ stem: word, tags: [] }];
    for (let depth = 0; depth < 2; depth++) {
      const next = [];
      for (const cur of layer) {
        for (const [suf, tags] of SUF) {
          if (cur.stem.length > suf.length + 1 && cur.stem.endsWith(suf)) {
            const base = cur.stem.slice(0, cur.stem.length - suf.length);
            const item = { stem: base, tags: cur.tags.concat(tags) };
            next.push(item);
            /* Үйл үгийн дагавартай бол эхлээд ‑х төгсгөлтэй хэлбэрийг оролдоно.
               Эс бөгөөс «босгоно» → «босго» (босго = threshold) мэтээр буруу таарна. */
            if (item.tags.includes("v")) {
              for (const v of G.verbForms(base)) out.push({ stem: v, tags: item.tags });
              out.push(item);
              for (const v of G.vowelRestore(base)) out.push({ stem: v, tags: item.tags });
            } else {
              out.push(item);
              for (const v of G.vowelRestore(base)) out.push({ stem: v, tags: item.tags });
              out.push({ stem: base + "х", tags: item.tags.concat("v") });
            }
          }
        }
      }
      layer = next;
      if (!layer.length) break;
    }
    return out;
  };

  /* ── англи талын жижиг дүрмүүд ──────────────────────────── */
  const IRREG_PL = {
    person: "people", man: "men", woman: "women", child: "children", tooth: "teeth",
    foot: "feet", goose: "geese", mouse: "mice", ox: "oxen", sheep: "sheep",
    deer: "deer", fish: "fish", life: "lives", knife: "knives", wife: "wives",
    wolf: "wolves", leaf: "leaves", half: "halves", loaf: "loaves", thief: "thieves",
    calf: "calves", shelf: "shelves", scarf: "scarves", hoof: "hooves", elf: "elves"
  };
  const NO_PLURAL = new Set([
    "people", "children", "men", "women", "teeth", "feet", "cattle", "clothing", "hair",
    "water", "grass", "snow", "rain", "sand", "dust", "smoke", "music", "silence"
  ]);

  G.plural = function (en) {
    if (!en) return en;
    const parts = en.split(" ");
    const headIdx = parts.findIndex((p) => !/^(a|an|the|of|in|on)$/i.test(p));
    const i = headIdx < 0 ? parts.length - 1 : headIdx;
    const w = parts[i];
    if (NO_PLURAL.has(w.toLowerCase())) return en;
    if (IRREG_PL[w.toLowerCase()]) {
      parts[i] = IRREG_PL[w.toLowerCase()];
      return parts.join(" ");
    }
    if (/[^aeiou]y$/.test(w)) parts[i] = w.slice(0, -1) + "ies";
    else if (/(s|x|z|ch|sh)$/.test(w)) parts[i] = w + "es";
    else if (/[^s]$/.test(w)) parts[i] = w + "s";
    return parts.join(" ");
  };

  G.possessive = function (en) {
    if (!en) return en;
    return /s$/i.test(en) ? en + "'" : en + "'s";
  };

  /** Тийн ялгалын тэмдгүүдийг англи руу буулгана. */
  G.applyTags = function (en, tags, isVerb) {
    if (!en || !tags || !tags.length) return en;
    let s = en;
    const has = (t) => tags.includes(t);

    if (has("pl") && !isVerb) s = G.plural(s);
    if (has("neg")) s = "not " + s;

    if (isVerb) {
      if (has("want")) s = "wanting to " + s.replace(/ing\b/, "");
      if (has("cond")) s = "if " + s;
      if (has("priv")) s = "not " + s;
      return s;
    }

    if (has("priv")) return "without " + s;
    if (has("com")) return "with " + s;
    if (has("abl")) return "from " + s;
    if (has("ins")) return "with " + s;
    if (has("dir")) return "toward " + s;
    if (has("dat")) return "in " + s;
    if (has("gen")) return G.possessive(s);
    return s; /* acc болон бусад нь англид тэмдэглэгдэхгүй */
  };

  /* Англи өгүүлбэрийг цэвэрлэх */
  G.tidy = function (s) {
    return String(s || "")
      .replace(/\s+([,.;:!?])/g, "$1")
      /* Тоон дундах цэг, цэгийг бүү сал: 16:9, 2.39:1, 1.5 */
      .replace(/([,.;:!?])(?=[^\s.,;:!?)\]])/g, (m, p1, off, str) =>
        /\d/.test(str[off - 1] || "") && /\d/.test(str[off + 1] || "") ? m : m + " "
      )
      .replace(/\bof of\b/g, "of")
      .replace(/\bwith with\b/g, "with")
      .replace(/\bin in\b/g, "in")
      .replace(/\bthe the\b/g, "the")
      .replace(/ {2,}/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  /* Эхний үсгийг том болгох (өгүүлбэр тус бүр) */
  G.sentenceCase = function (s) {
    return String(s || "").replace(/(^|[.!?]\s+|\n)([a-z])/g, (m, p, c) => p + c.toUpperCase());
  };
})(window.WB);
