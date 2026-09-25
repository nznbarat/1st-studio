/* ═════════════════════════════════════════════════════════════
   SEEDANCE 2.5 — үзэгдэл бүрийг олон кадрын видео промт болгоно.

   Бүтэц (нийтлэг гарын авлагуудын дагуу):
     Format → Subject → Setting → Style → Shot 1…N → Continuity
     → Audio → Constraints
   • Кадр бүр «Shot N (эхлэл–төгсгөл)», камер + үйлдэл, «Hard cut.»
   • Нэг үүсгэлт ≤ 15 секунд — урт үзэгдлийг хэд хэдэн клипэд хуваана.
   • Брэнд «зүсэлтгүй / no cuts» гэж заасан бол «Hard cut»‑ийн оронд
     тасралтгүй шилжилт хэрэглэнэ.
   • Сэдэв, орчныг эхэнд НЭГ удаа бичнэ; кадрууд зөвхөн өөрчлөгдөж
     буй зүйлээ хэлнэ (өнгөлсөн бие даасан промт биш, түүхий кадр).
   • Монгол үсэг промт руу хэзээ ч орохгүй (B.toEN хамгаалалт).
   Офлайн ажиллана — AI дуудлага хийхгүй, байгаа өгөгдлөөс угсарна.
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const SD = (WB.seedance = {});
  const S = WB.state;
  const PR = WB.prompt;

  SD.MAX_CLIP = 15;     /* сек, нэг үүсгэлтийн дээд урт */
  SD.MAX_IMAGES = 9;    /* нэг үүсгэлтэд хавсаргах зургийн дээд тоо */
  SD.MAX_VIDEOS = 3;
  SD.DEFAULT_SHOT = 3;  /* кадрын урт тодорхойгүй бол */
  SD.SINGLE_SHOT = 5;   /* кадаргүй үзэгдлийн урт */

  function en(field) {
    const t = field ? field.en || field.mn || "" : "";
    return WB.brand.toEN(t).trim().replace(/\s*\.\s*$/, "");
  }
  function sentence(t) {
    t = String(t || "").trim();
    return t ? t.replace(/[.;,\s]*$/, "") + "." : "";
  }

  /** «3s», «3с», «2.5 sec», «4» → секунд. */
  SD.durOf = function (sh) {
    const m = /(\d+(?:[.,]\d+)?)/.exec(String((sh && sh.dur) || ""));
    const v = m ? parseFloat(m[1].replace(",", ".")) : SD.DEFAULT_SHOT;
    return Math.max(1, Math.min(SD.MAX_CLIP, v || SD.DEFAULT_SHOT));
  };

  /** Брэндийн камерын дүрэм зүсэлтийг хориглосон уу. */
  SD.noCut = function () {
    const rule = (S.P.brand && (S.P.brand.f.camera.en || S.P.brand.f.camera.mn)) || "";
    return /\b(no|without)\s+(hard\s+)?cuts?\b|\bsingle continuous take\b|зүсэлтгүй|огтлолгүй|огтлол хийхгүй/i.test(rule);
  };

  function subjectOf(scene) {
    return (scene.castIds || [])
      .map((id) => S.P.cast.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => {
        const d = [en(c.f.look), en(c.f.cloth)].filter(Boolean).join(", ");
        const nm = PR.nameEN(c.name);
        return nm && d ? nm + " — " + d : nm || d;
      })
      .filter(Boolean)
      .join("; ");
  }
  function settingOf(scene) {
    const l = S.P.locs.find((x) => x.id === scene.locId);
    if (!l) return "";
    return [en(l.f.look), en(l.f.time), en(l.f.mood)].filter(Boolean).join(", ");
  }
  function styleLine() {
    const o = S.P.opts;
    const parts = [];
    if (o.brandOn !== false && WB.brand) parts.push(...WB.brand.visualParts());
    const st = PR.styleText(o);
    if (st) parts.push(st);
    return parts.join(". ");
  }
  function audioLine() {
    const b = S.P.brand;
    const a = b && S.P.opts.brandOn !== false ? WB.brand.toEN(b.f.audio.en || b.f.audio.mn || "").trim() : "";
    return a || "natural ambient sound of the setting only, no music";
  }
  function constraintsLine() {
    const base = "no on-screen text, no subtitles, no watermark, no logo";
    /* Брэндийн хориглосон зүйлсийг «avoid»‑оор тусгаарлана — эс бөгөөс
       «no logo, modern buildings» гэж зөвшөөрсөн мэт уншигдана. */
    const avoid = [S.P.opts.brandOn !== false && WB.brand ? WB.brand.avoidLine() : "", (S.P.opts.negative || "").trim()]
      .map((t) => WB.brand.toEN(t))
      .filter(Boolean)
      .join(", ");
    return avoid ? base + "; avoid " + avoid : base;
  }

  /**
   * @ лавлагаа — промтын ЭХЭНД, дөрвөлжин хаалтан дотор: [@image1].
   * Дугаар нь файл хуулах дарааллыг дагана ([@image1], [@image2] …,
   * [@video1]). Лавлагаа бүрд НЭГ нарийн үүрэг өгч, юуг хуулахгүйг
   * заана — эс бөгөөс загвар өөрөө таамаглана.
   * @returns {{lines:string[], files:{tag:string, what:string, from:string}[]}}
   */
  SD.refs = function (scene, idx) {
    const o = S.P.opts;
    const out = { lines: [], files: [] };
    if (o.seedRefs === false) return out;
    let img = 0, vid = 0;
    const addImg = (line, what, from) => {
      if (img >= SD.MAX_IMAGES) return;
      img++;
      const tag = "[@image" + img + "]";
      out.lines.push(tag + " " + line);
      out.files.push({ tag: tag, what: what, from: from });
    };
    const addVid = (line, what, from) => {
      if (vid >= SD.MAX_VIDEOS) return;
      vid++;
      const tag = "[@video" + vid + "]";
      out.lines.push(tag + " " + line);
      out.files.push({ tag: tag, what: what, from: from });
    };

    (scene.castIds || [])
      .map((id) => S.P.cast.find((c) => c.id === id))
      .filter(Boolean)
      .forEach((c) => {
        const nm = PR.nameEN(c.name);
        addImg(
          "defines " + (nm ? nm + "'s" : "the character's") + " face, hairstyle and wardrobe only — do not copy its background.",
          (c.name || "Дүр") + " — дүрийн зураг",
          "«Бусад промт» → " + (c.name || "дүр") + " · ДҮРИЙН ЗУРАГ"
        );
      });
    const loc = S.P.locs.find((x) => x.id === scene.locId);
    if (loc) {
      addImg(
        "defines the setting, light and colour palette only — do not copy any people from it.",
        (loc.name || "Байршил") + " — байршлын зураг",
        "«Бусад промт» → " + (loc.name || "байршил") + " · БАЙРШЛЫН ЗУРАГ"
      );
    }
    const b = S.P.brand;
    if (b && b.locked && o.brandOn !== false) {
      addImg(
        "defines the colour grade, film grain and lighting style only — do not copy its subjects or composition.",
        "Брэндийн түгжсэн фрэйм",
        (b.ref || "").trim() || "Алхам 1 · Брэнд → баталсан кадр"
      );
    }
    if (idx > 0) {
      addVid(
        "is the previous clip — continue seamlessly from its last frame; do not repeat its action.",
        "Өмнөх клипийн үр дүн",
        "энэ үзэгдлийн клип " + idx + "‑ийн гарсан видео"
      );
    }
    if (o.seedCamVideo) {
      addVid(
        "provides the camera motion only — do not copy its subject or location.",
        "Камерын хөдөлгөөний лавлагаа бичлэг",
        "Camera Director‑ын урьдчилсан харагдац (дэлгэц бичлэг)"
      );
    }
    return out;
  };

  /** Кадруудыг ≤ 15 секундийн клипэд хуваана. */
  SD.clips = function (scene) {
    const shots = (scene.shots || []).map((sh) => ({ sh, d: SD.durOf(sh) }));
    if (!shots.length) return [[{ sh: null, d: SD.SINGLE_SHOT }]];
    const out = [];
    let cur = [], sum = 0;
    shots.forEach((x) => {
      if (cur.length && sum + x.d > SD.MAX_CLIP) {
        out.push(cur);
        cur = [];
        sum = 0;
      }
      cur.push(x);
      sum += x.d;
    });
    if (cur.length) out.push(cur);
    return out;
  };

  function fmtT(t) {
    return (Math.round(t * 10) / 10).toString();
  }

  /** Нэг клипийн Seedance 2.5 промт. */
  SD.prompt = function (scene, clip, idx, total) {
    const ar = S.P.opts.ar || "16:9";
    const dur = clip.reduce((a, x) => a + x.d, 0);
    const noCut = SD.noCut();
    const L = SD.refs(scene, idx).lines.slice();
    L.push(
      "Format: " + clip.length + (clip.length === 1 ? " shot, " : " shots, ") + fmtT(dur) + " seconds, " + ar +
        (noCut && clip.length > 1 ? ", one continuous take with no cuts" : "") +
        (total > 1 ? " (part " + (idx + 1) + " of " + total + ")" : "") + "."
    );
    const subj = subjectOf(scene);
    if (subj) L.push("Subject: " + sentence(subj));
    const set = settingOf(scene);
    if (set) L.push("Setting: " + sentence(set));
    const st = styleLine();
    if (st) L.push("Style: " + sentence(st));

    let t = 0;
    clip.forEach((x, i) => {
      const t0 = t, t1 = t + x.d;
      t = t1;
      const cam = x.sh ? (x.sh.cam || "").trim() : "";
      const body = x.sh ? en(x.sh.body) : en(scene.body);
      const last = i === clip.length - 1;
      const tail = last ? "" : noCut ? " Continue in the same take, no cut." : " Hard cut.";
      L.push("Shot " + (i + 1) + " (" + fmtT(t0) + "–" + fmtT(t1) + "s): " + (cam ? cam + " — " : "") + sentence(body) + tail);
    });

    if (subj || clip.length > 1)
      L.push("Continuity: keep the same faces, wardrobe, lighting and colour palette in every shot.");
    L.push("Audio: " + sentence(audioLine()));
    L.push("Constraints: " + sentence(constraintsLine()));
    return L.join("\n");
  };

  /** Бүх үзэгдлийн Seedance блокууд (Промт самбарт). */
  SD.blocks = function () {
    const out = [];
    S.P.scenes.forEach((s, i) => {
      if (!(s.body.en || s.body.mn || (s.shots || []).length)) return;
      const clips = SD.clips(s);
      clips.forEach((clip, k) => {
        const dur = clip.reduce((a, x) => a + x.d, 0);
        out.push({
          id: "seed:" + s.id + ":" + k,
          title: (s.name || "Үзэгдэл " + (i + 1)) + (clips.length > 1 ? " · клип " + (k + 1) + "/" + clips.length : ""),
          tag: "SEEDANCE 2.5 · " + clip.length + " кадр · " + fmtT(dur) + "с",
          text: SD.prompt(s, clip, k, clips.length),
          files: SD.refs(s, k).files
        });
      });
    });
    return out;
  };

  SD.asText = function () {
    const lines = ["# " + (S.P.title || "Нэргүй төсөл") + " — Seedance 2.5", ""];
    SD.blocks().forEach((b) => {
      lines.push("## " + b.title + "  [" + b.tag + "]");
      if (b.files.length) {
        lines.push("Хавсаргах (энэ дарааллаар):");
        b.files.forEach((f) => lines.push("  " + f.tag + " = " + f.what + "  ← " + f.from));
        lines.push("");
      }
      lines.push(b.text, "");
    });
    return lines.join("\n");
  };
})(window.WB);
