/* ═════════════════════════════════════════════════════════════
   10 · Нэр томьёоны сан — бүртгэл, индекс, хайлт
   dict/*.js файлууд RM.dict.add({...}) дуудаж өөрсдийгөө бүртгүүлнэ.

   Нэг мөрийн бүтэц:
     [ англи нэр, монгол нэр, тайлбар, товчлуур?, байрлал? ]
   ═════════════════════════════════════════════════════════════ */
(function (RM) {
  "use strict";

  const D = (RM.dict = RM.dict || {});

  D.cats  = [];                    /* [{id,label,icon,page,count}] */
  D.rows  = [];                    /* бүх нэр томьёо, хавтгайгаар */
  D.byId  = Object.create(null);   /* id → мөр */
  D.dupes = [];                    /* давхардсан англи нэр (хөгжүүлэлтийн шалгалт) */

  /* Resolve-ийн долоон хуудас — өнгө, дараалал */
  D.pages = [
    { id: "erunhii",   label: "Ерөнхий",   icon: "◈", hue: 200 },
    { id: "media",     label: "Media",     icon: "▤", hue: 150 },
    { id: "cut",       label: "Cut",       icon: "◨", hue:  35 },
    { id: "edit",      label: "Edit",      icon: "✂", hue:  35 },
    { id: "fusion",    label: "Fusion",    icon: "⬡", hue: 265 },
    { id: "color",     label: "Color",     icon: "◐", hue: 330 },
    { id: "fairlight", label: "Fairlight", icon: "♪", hue: 100 },
    { id: "deliver",   label: "Deliver",   icon: "▶", hue:  15 },
    { id: "tehnik",    label: "Техник",    icon: "⚙", hue: 210 }
  ];

  function slug(s) {
    /* "+" нь Text+ шиг нэрэнд утга агуулдаг тул хадгална */
    return RM.norm(s)
      .replace(/\+/g, "-plus")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /** Ангилал бүртгэх. */
  D.add = function (cat) {
    const list = cat.terms || [];
    let n = 0;

    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      if (!t || !t[0] || !t[1]) continue;

      const en = String(t[0]).trim();
      let id = slug(en) || "t" + D.rows.length;

      /* Давхцвал мөрийг хаяхгүй — ялгаатай id өгч хадгална.
         Ингэснээр өгөгдөл чимээгүй алдагдахаас сэргийлнэ. */
      if (D.byId[id]) {
        D.dupes.push(en + " (" + cat.id + ")");
        let k = 2;
        while (D.byId[id + "-" + k]) k++;
        id = id + "-" + k;
      }

      const row = {
        id:    id,
        en:    en,
        mn:    String(t[1]).trim(),
        desc:  t[2] ? String(t[2]).trim() : "",
        key:   t[3] ? String(t[3]).trim() : "",
        loc:   t[4] ? String(t[4]).trim() : "",
        cat:   cat.id,
        page:  cat.page || "erunhii",
        _hay:  ""
      };
      /* Хайлтын индекс — нэг мөр болгож урьдчилан бэлдэнэ.
         Ангилал, хуудасны нэрийг ч оруулснаар "товчлуур", "fairlight" гэх мэт
         бүлгийн нэрээр хайхад тухайн бүлгийн бүх мөр олдоно. */
      const pageLabel = (D.pages.find((x) => x.id === row.page) || {}).label || "";
      row._hay = RM.norm([row.en, row.mn, row.desc, row.key, row.loc,
                          cat.label, pageLabel].join(" ⋄ "));

      D.byId[id] = row;
      D.rows.push(row);
      n++;
    }

    const found = D.cats.find((c) => c.id === cat.id);
    if (found) found.count += n;
    else D.cats.push({
      id:    cat.id,
      label: cat.label,
      icon:  cat.icon || "•",
      page:  cat.page || "erunhii",
      note:  cat.note || "",
      count: n
    });
    return n;
  };

  D.size = function () { return D.rows.length; };

  D.page = function (id) { return D.pages.find((p) => p.id === id) || D.pages[0]; };
  D.cat  = function (id) { return D.cats.find((c) => c.id === id) || null; };

  /** Хуудас тус бүрийн нэр томьёоны тоо. */
  D.pageCount = function (pageId) {
    let n = 0;
    for (let i = 0; i < D.rows.length; i++) if (D.rows[i].page === pageId) n++;
    return n;
  };

  /**
   * Хайлт. Англи, монгол, тайлбар, товчлуур — бүгдээс хайна.
   * Оноо: англи/монгол нэрний яг таарц хамгийн дээр.
   */
  D.search = function (q, opts) {
    opts = opts || {};
    const limit = opts.limit || 400;
    const page  = opts.page && opts.page !== "all" ? opts.page : null;
    const cat   = opts.cat  && opts.cat  !== "all" ? opts.cat  : null;
    const query = RM.norm(q);
    /* Олон үгээр хайхад бүх үг агуулсан мөрийг олно —
       "ногоон дэлгэц" гэж бичихэд хоёр үг тус тусдаа байсан ч олдоно. */
    const words = query ? query.split(/\s+/).filter(Boolean) : [];
    const multi = words.length > 1;
    const out   = [];

    for (let i = 0; i < D.rows.length; i++) {
      const r = D.rows[i];
      if (page && r.page !== page) continue;
      if (cat  && r.cat  !== cat)  continue;

      let score = 0;
      if (!query) {
        score = 1;
      } else {
        const en = RM.norm(r.en), mn = RM.norm(r.mn);
        if (en === query || mn === query)              score = 100;
        else if (en.startsWith(query) || mn.startsWith(query)) score = 80;
        else if (en.includes(query)   || mn.includes(query))   score = 60;
        else if (RM.norm(r.key).includes(query))       score = 40;
        else if (r._hay.includes(query))               score = 20;
        else if (multi && words.every((w) => r._hay.includes(w))) score = 10;
        else continue;
      }
      out.push({ row: r, score: score });
    }

    if (query) out.sort((a, b) => b.score - a.score || a.row.en.localeCompare(b.row.en));

    return { total: out.length, items: out.slice(0, limit).map((x) => x.row) };
  };

})(window.RM);
