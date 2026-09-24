/* ═════════════════════════════════════════════════════════════
   Промт угсрагч — хэсгүүдийг нэгтгэж, хэв маяг, тууштай байдлыг нэмнэ.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const PR = (WB.prompt = {});
  const S = WB.state;

  PR.NEGATIVE_DEFAULT =
    "blurry, low resolution, deformed hands, extra fingers, extra limbs, distorted face, watermark, signature, text artifacts, oversaturated, duplicate characters";

  PR.SUFFIX = {
    image: (o) => "--ar " + (o.ar || "16:9"),
    video: (o) => "",
    higgs: (o) => "",
    sora: (o) => ""
  };

  PR.styleText = function (opts) {
    const chosen = (opts && opts.styles) || [];
    return S.STYLE_PRESETS.filter((p) => chosen.includes(p.id))
      .map((p) => p.v)
      .join(", ");
  };

  /** Хэсгүүдийг нэг цэвэр догол мөр болгоно. */
  PR.join = function (parts) {
    const body = (parts || [])
      .filter(Boolean)
      .map((t) => String(t).trim().replace(/\s*\.?\s*$/, ""))
      .filter(Boolean)
      .join(". ");
    return body ? body + "." : "";
  };

  PR.character = function (c) {
    if (c.pro) return c.pro;
    return PR.join([c.name ? "Character: " + c.name : "", c.f.look.en, c.f.cloth.en, c.f.person.en]);
  };
  PR.characterFull = function (c) {
    if (c.pro) return c.pro;
    return PR.join([c.name ? "Character: " + c.name : "", c.f.look.en, c.f.cloth.en, c.f.person.en, c.f.voice.en]);
  };
  PR.location = function (l) {
    if (l.pro) return l.pro;
    return PR.join([l.name ? "Location: " + l.name : "", l.f.look.en, l.f.time.en, l.f.mood.en, l.f.detail.en]);
  };

  /** Үзэгдлийн промт — тууштай байдлын горимд дүр, байршлыг шингээнэ. */
  PR.scene = function (s, opts) {
    if (s.pro) return s.pro;
    const P = S.P;
    const o = opts || P.opts;
    const parts = [];
    if (o.continuity) {
      (s.castIds || []).forEach((id) => {
        const c = P.cast.find((x) => x.id === id);
        if (c) parts.push(PR.join([c.name ? c.name + ":" : "", c.f.look.en, c.f.cloth.en]));
      });
      const loc = P.locs.find((x) => x.id === s.locId);
      if (loc) parts.push(PR.join([loc.f.look.en, loc.f.time.en]));
    }
    parts.push(s.body.en);
    return PR.join(parts);
  };

  PR.shot = function (sh, s, opts) {
    if (sh.pro) return sh.pro;
    const o = opts || S.P.opts;
    const head = sh.cam ? sh.cam + "." : "";
    const base = o.continuity ? PR.scene(s, o) : "";
    return PR.join([head, sh.body.en || base]);
  };

  /** Хэв маяг, харьцаа, сөрөг промтыг нэмж эцсийн текст болгоно. */
  PR.decorate = function (text, opts) {
    if (!text) return "";
    const o = opts || S.P.opts;
    const style = PR.styleText(o);
    let out = text;
    if (style) out += " " + style + ".";
    /* Брэнд файлын харагдацын давхарга — сувгийн гарын үсэг. */
    if (o.brandOn !== false && WB.brand) {
      const bl = WB.brand.visualLine();
      if (bl) out += " " + bl + ".";
    }
    const suf = PR.SUFFIX[o.target] ? PR.SUFFIX[o.target](o) : "";
    if (o.target === "image" && suf) out += " " + suf;
    return WB.gram.tidy(out);
  };

  PR.negative = function (opts) {
    const o = opts || S.P.opts;
    const parts = [PR.NEGATIVE_DEFAULT];
    const avoid = o.brandOn !== false && WB.brand ? WB.brand.avoidLine() : "";
    if (avoid) parts.push(avoid);
    const extra = (o.negative || "").trim();
    if (extra) parts.push(extra);
    return parts.join(", ");
  };

  /** Гаралтын бүх блокийг цуглуулна. */
  PR.blocks = function () {
    const P = S.P;
    const out = [];
    if (P.logline.en) out.push({ id: "logline", title: "Логлайн", tag: "ТҮҮХ", text: P.logline.en, raw: P.logline.en });
    P.cast.forEach((c, i) => {
      const raw = PR.character(c);
      if (raw)
        out.push({
          id: "cast:" + c.id,
          title: c.name || "Дүр " + (i + 1),
          tag: "ДҮРИЙН ЗУРАГ",
          text: PR.decorate(raw),
          raw: raw
        });
    });
    P.locs.forEach((l, i) => {
      const raw = PR.location(l);
      if (raw)
        out.push({
          id: "loc:" + l.id,
          title: l.name || "Байршил " + (i + 1),
          tag: "БАЙРШЛЫН ЗУРАГ",
          text: PR.decorate(raw),
          raw: raw
        });
    });
    P.scenes.forEach((s, i) => {
      const raw = PR.scene(s);
      if (raw)
        out.push({
          id: "scene:" + s.id,
          title: s.name || "Үзэгдэл " + (i + 1),
          tag: P.opts.target === "image" ? "ҮЗЭГДЛИЙН ЗУРАГ" : "ВИДЕО ПРОМТ",
          text: PR.decorate(raw),
          raw: raw
        });
      s.shots.forEach((sh, j) => {
        const r = PR.shot(sh, s);
        if (r)
          out.push({
            id: "shot:" + sh.id,
            title: (s.name || "Үзэгдэл " + (i + 1)) + " · кадр " + (j + 1),
            tag: "КАДР" + (sh.dur ? " · " + sh.dur : ""),
            text: PR.decorate(r),
            raw: r,
            sub: true
          });
      });
    });
    return out;
  };

  /* ── экспортын хэлбэрүүд ────────────────────────────────── */
  PR.asText = function () {
    const P = S.P;
    const lines = ["# " + (P.title || "Нэргүй төсөл"), ""];
    PR.blocks().forEach((b) => {
      lines.push("## " + b.title + "  [" + b.tag + "]");
      lines.push(b.text);
      lines.push("");
    });
    lines.push("## Сөрөг промт (negative)");
    lines.push(PR.negative());
    return lines.join("\n");
  };

  PR.asMarkdown = function () {
    const P = S.P;
    const md = ["# " + (P.title || "Нэргүй төсөл"), ""];
    if (P.logline.mn || P.logline.en) {
      md.push("**Логлайн (MN):** " + P.logline.mn, "", "**Logline (EN):** " + P.logline.en, "");
    }
    if (P.cast.length) {
      md.push("## Дүрүүд", "");
      P.cast.forEach((c) => {
        md.push("### " + (c.name || "—"));
        S.CAST_FIELDS.forEach((f) => {
          if (c.f[f.k].mn || c.f[f.k].en) md.push("- **" + f.lb + ":** " + c.f[f.k].mn + "  \n  _" + c.f[f.k].en + "_");
        });
        md.push("");
      });
    }
    if (P.locs.length) {
      md.push("## Байршлууд", "");
      P.locs.forEach((l) => {
        md.push("### " + (l.name || "—"));
        S.LOC_FIELDS.forEach((f) => {
          if (l.f[f.k].mn || l.f[f.k].en) md.push("- **" + f.lb + ":** " + l.f[f.k].mn + "  \n  _" + l.f[f.k].en + "_");
        });
        md.push("");
      });
    }
    if (P.scenes.length) {
      md.push("## Үзэгдлүүд", "");
      P.scenes.forEach((s, i) => {
        md.push("### " + (i + 1) + ". " + (s.name || "—"));
        md.push(s.body.mn, "", "> " + PR.decorate(PR.scene(s)), "");
        s.shots.forEach((sh, j) => {
          md.push("- **Кадр " + (j + 1) + "** " + (sh.cam || "") + (sh.dur ? " (" + sh.dur + ")" : ""));
          md.push("  > " + PR.decorate(PR.shot(sh, s)));
        });
        if (s.shots.length) md.push("");
      });
    }
    md.push("## Сөрөг промт", "", "```", PR.negative(), "```");
    return md.join("\n");
  };

  PR.asCSV = function () {
    const esc = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const rows = [["type", "title", "mongolian", "english", "prompt"].map(esc).join(",")];
    const P = S.P;
    rows.push(["logline", "logline", P.logline.mn, P.logline.en, P.logline.en].map(esc).join(","));
    P.cast.forEach((c) =>
      S.CAST_FIELDS.forEach((f) =>
        rows.push(["character", (c.name || "") + " / " + f.lb, c.f[f.k].mn, c.f[f.k].en, ""].map(esc).join(","))
      )
    );
    P.locs.forEach((l) =>
      S.LOC_FIELDS.forEach((f) =>
        rows.push(["location", (l.name || "") + " / " + f.lb, l.f[f.k].mn, l.f[f.k].en, ""].map(esc).join(","))
      )
    );
    P.scenes.forEach((s, i) => {
      rows.push(["scene", s.name || "Scene " + (i + 1), s.body.mn, s.body.en, PR.decorate(PR.scene(s))].map(esc).join(","));
      s.shots.forEach((sh, j) =>
        rows.push(
          ["shot", (s.name || "Scene " + (i + 1)) + " #" + (j + 1), sh.body.mn, sh.body.en, PR.decorate(PR.shot(sh, s))]
            .map(esc)
            .join(",")
        )
      );
    });
    return "﻿" + rows.join("\n");
  };
})(window.WB);
