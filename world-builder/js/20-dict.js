/* ═════════════════════════════════════════════════════════════
   Ангилсан үгсийн сан — бүртгэл ба хайлт.
   dict/*.js файлууд WB.dict.add({...}) дуудаж өөрсдийгөө бүртгүүлнэ.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const D = (WB.dict = WB.dict || {});

  D.cats = [];              /* [{id, label, icon, count}] */
  D.map = Object.create(null); /* монгол үг → {en, cat} */
  D.maxPhrase = 1;          /* хамгийн урт хэллэгийн үгийн тоо */
  D.dupes = [];             /* давхардсан түлхүүрүүд (хөгжүүлэлтийн шалгалт) */

  /** Ангилал бүртгэх. dict/*.js файл бүр нэг буюу хэд удаа дуудна. */
  D.add = function (cat) {
    const words = cat.w || cat.words || {};
    let n = 0;
    for (const key in words) {
      const mn = key.trim().toLowerCase();
      const en = words[key];
      if (!mn || !en) continue;
      if (D.map[mn]) {
        D.dupes.push(mn);
        continue;
      }
      D.map[mn] = { en: en, cat: cat.id };
      const wc = mn.split(/\s+/).length;
      if (wc > D.maxPhrase) D.maxPhrase = wc;
      n++;
    }
    const found = D.cats.find((c) => c.id === cat.id);
    if (found) found.count += n;
    else D.cats.push({ id: cat.id, label: cat.label, icon: cat.icon || "•", count: n });
    return n;
  };

  /** Суурь толины нийт үгийн тоо. */
  D.size = function () {
    return Object.keys(D.map).length;
  };

  /** Дагавар үгсийг тусад нь (эдгээр нь англид өмнө нь тавигдана). */
  D.postp = function (word) {
    return WB.gram.POSTP[word] || null;
  };

  /**
   * Нэг үг/хэллэгийг хайна. Хэрэглэгчийн нэмсэн үг үргэлж давуу эрхтэй.
   * @returns {{en:string, cat:string, tags:string[]}|null}
   */
  D.lookup = function (word, custom) {
    const w = word.toLowerCase();
    if (custom && custom[w]) return { en: custom[w], cat: "custom", tags: [] };
    if (D.map[w]) return { en: D.map[w].en, cat: D.map[w].cat, tags: [] };

    /* дагаварыг тайлж дахин оролдоно */
    const cands = WB.gram.analyze(w);
    for (const c of cands) {
      if (c.stem === w) continue;
      const hit = (custom && custom[c.stem] && { en: custom[c.stem], cat: "custom" }) || D.map[c.stem];
      if (hit) return { en: hit.en, cat: hit.cat || "custom", tags: c.tags };
    }
    return null;
  };

  /** Толь дотор хайх (монгол ба англи талаас нь хоёуланг). */
  D.search = function (q, opts) {
    opts = opts || {};
    const limit = opts.limit || 80;
    const catFilter = opts.cat && opts.cat !== "all" ? opts.cat : null;
    const query = String(q || "").trim().toLowerCase();
    const out = [];

    if (opts.custom) {
      for (const m in opts.custom) {
        if (out.length >= limit) break;
        const en = opts.custom[m];
        if (catFilter && catFilter !== "custom") break;
        if (!query || m.includes(query) || en.toLowerCase().includes(query)) {
          out.push({ mn: m, en: en, cat: "custom" });
        }
      }
    }
    for (const m in D.map) {
      if (out.length >= limit) break;
      const rec = D.map[m];
      if (catFilter && rec.cat !== catFilter) continue;
      if (!query || m.includes(query) || rec.en.toLowerCase().includes(query)) {
        out.push({ mn: m, en: rec.en, cat: rec.cat });
      }
    }
    return out;
  };

  /** Ангилал бүрийн эхний N үгийг үзүүлэх (нүүр хуудасны жагсаалт). */
  D.sample = function (catId, n) {
    const out = [];
    for (const m in D.map) {
      if (D.map[m].cat !== catId) continue;
      out.push({ mn: m, en: D.map[m].en });
      if (out.length >= (n || 12)) break;
    }
    return out;
  };

  D.catLabel = function (id) {
    if (id === "custom") return "Миний нэмсэн";
    const c = D.cats.find((x) => x.id === id);
    return c ? c.label : id;
  };
})(window.WB);
