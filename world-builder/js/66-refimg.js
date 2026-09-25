/* ═════════════════════════════════════════════════════════════
   Лавлагаа зураг — Авто горимд санаатай хамт Claude‑д илгээнэ.

   • Чирж оруулах, дарж сонгох, Ctrl+V (буфер) — гурвуулаа ажиллана.
   • Урт тал нь 1568px‑ээс ихгүй болгож JPEG болгон шахна: апп‑ын бүх
     загвар (Sonnet 4.6, Haiku 4.5 гэх мэт) энэ нягтралыг бүрэн уншдаг,
     зургийн токен зардал пикселийн талбайгаас хамаардаг, мөн хүсэлт
     проксигийн хязгаарт багтана.
   • Зөвхөн энэ цонхны санах ойд хадгалагдана — төслийн JSON ба
     localStorage руу орохгүй (хэмжээ нь хөтчийн хязгаарыг дүүргэнэ).
   ═════════════════════════════════════════════════════════════ */
(function (WB) {
  "use strict";

  const R = (WB.refimg = {});
  const U = WB.util;
  const el = U.el;

  R.MAX = 3;
  R.EDGE = 1568;
  R.MAX_FILE = 40 * 1024 * 1024; /* задлахаас өмнөх хамгаалалт */
  /* Зураг бүрийн base64 төсөв. 3 зураг × 900 KB = 2.7 MB нь проксигийн
     4 MB ба Vercel‑ийн 4.5 MB хязгаарт ҮРГЭЛЖ багтана. Хатгамал, өвс,
     торго зэрэг нарийн ширхэгтэй зураг том гардаг тул чанарыг, дараа нь
     нягтралыг шат дараатай бууруулна. */
  R.MAX_B64 = 900 * 1024;
  R.STEPS = [
    [1568, 0.85], [1568, 0.75], [1568, 0.65], [1280, 0.7],
    [1280, 0.6], [1024, 0.6], [1024, 0.5], [800, 0.5]
  ];

  R.list = []; /* {id, name, w, h, data, url} */

  /** Хөтөч задалж чадах эсэх — HEIC зэрэг нь ихэнх хөтөчид уншигддаггүй. */
  function decode(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("уншиж чадсангүй"));
      };
      img.src = url;
    });
  }

  /** Файлыг 1568px хүртэл багасгаж JPEG base64 болгоно. */
  R.process = async function (file) {
    if (!file || !/^image\//.test(file.type)) throw new Error("зураг биш байна");
    if (file.size > R.MAX_FILE) throw new Error("хэт том (40 MB‑аас их)");
    const { img, url } = await decode(file);
    try {
      const w0 = img.naturalWidth, h0 = img.naturalHeight;
      if (!w0 || !h0) throw new Error("хэмжээ нь тодорхойгүй");
      let out = null;
      for (const [edge, q] of R.STEPS) {
        const k = Math.min(1, edge / Math.max(w0, h0));
        const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const cx = cv.getContext("2d");
        /* Тунгалаг PNG‑г JPEG болгоход хар дэвсгэр гарахаас сэргийлнэ */
        cx.fillStyle = "#ffffff";
        cx.fillRect(0, 0, w, h);
        cx.imageSmoothingQuality = "high";
        cx.drawImage(img, 0, 0, w, h);
        const dataURL = cv.toDataURL("image/jpeg", q);
        out = { w, h, w0, h0, q, data: dataURL.slice(dataURL.indexOf(",") + 1), url: dataURL };
        if (out.data.length <= R.MAX_B64) break;
      }
      return out;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  R.add = async function (files) {
    const arr = [...(files || [])].filter((f) => f && /^image\//.test(f.type));
    if (!arr.length) {
      U.toast("Зургийн файл олдсонгүй (JPG, PNG, WebP)", "bad");
      return 0;
    }
    let n = 0;
    for (const f of arr) {
      if (R.list.length >= R.MAX) {
        U.toast("Хамгийн ихдээ " + R.MAX + " зураг", "info");
        break;
      }
      try {
        const r = await R.process(f);
        R.list.push({ id: U.uid(), name: f.name || "буфер.jpg", w: r.w, h: r.h, data: r.data, url: r.url });
        n++;
      } catch (e) {
        U.toast("«" + (f.name || "зураг") + "» — " + e.message + ". JPG/PNG/WebP ашиглана уу", "bad");
      }
    }
    R.render();
    return n;
  };

  R.remove = function (id) {
    R.list = R.list.filter((x) => x.id !== id);
    R.render();
  };
  R.clear = function () {
    R.list = [];
    R.render();
  };

  /** API‑д илгээх блокууд. */
  R.blocks = function () {
    return R.list.map((x) => ({ media_type: "image/jpeg", data: x.data }));
  };

  /** base64 уртаас ойролцоо байт. */
  function kb(b64) {
    return Math.round((b64.length * 3) / 4 / 1024);
  }

  R.render = function () {
    const box = el("refThumbs");
    const zone = el("refZone");
    if (!box || !zone) return;
    box.innerHTML = "";
    R.list.forEach((x) => {
      const t = document.createElement("div");
      t.className = "refthumb";
      const im = document.createElement("img");
      im.src = x.url;
      im.alt = x.name;
      const meta = document.createElement("span");
      meta.textContent = x.w + "×" + x.h + " · " + kb(x.data) + " KB";
      const del = document.createElement("button");
      del.className = "refdel";
      del.title = "Хасах";
      del.textContent = "×";
      del.onclick = (e) => {
        e.stopPropagation();
        R.remove(x.id);
      };
      t.append(im, meta, del);
      box.appendChild(t);
    });
    zone.classList.toggle("has", R.list.length > 0);
    const cnt = el("refCount");
    if (cnt) cnt.textContent = R.list.length ? R.list.length + "/" + R.MAX : "";
  };

  /** Чирэх, сонгох, буфераас наах. */
  R.wire = function () {
    const zone = el("refZone");
    const input = el("refInput");
    if (!zone || !input) return;
    zone.addEventListener("click", (e) => {
      if (e.target.closest(".refthumb")) return;
      input.click();
    });
    zone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });
    input.addEventListener("change", async () => {
      await R.add(input.files);
      input.value = "";
    });
    ["dragenter", "dragover"].forEach((ev) =>
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.add("drag");
      })
    );
    ["dragleave", "drop"].forEach((ev) =>
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.remove("drag");
      })
    );
    zone.addEventListener("drop", (e) => R.add(e.dataTransfer && e.dataTransfer.files));
    /* Ctrl+V — зөвхөн Авто самбар нээлттэй үед */
    document.addEventListener("paste", (e) => {
      const panel = el("p-auto");
      if (!panel || !panel.classList.contains("on")) return;
      const files = [...((e.clipboardData && e.clipboardData.items) || [])]
        .filter((it) => it.kind === "file" && /^image\//.test(it.type))
        .map((it) => it.getAsFile())
        .filter(Boolean);
      if (!files.length) return;
      e.preventDefault();
      R.add(files);
    });
    R.render();
  };
})(window.WB);
