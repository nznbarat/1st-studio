/* 🎬 Previz видео экспорт — хөтчөөс шууд (renderFrames / renderVideoBlob / renderFramesZip).
   Шотын камерын харагдацыг фрейм фреймээр рендерлэж MediaRecorder-оор видео,
   эсвэл STORE ZIP доторх PNG цуваа болгохыг шалгана.
   Playwright байхгүй бол алгасна. */

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright/index.js']) {
  try { const m = await import(p); chromium = m.chromium || (m.default && m.default.chromium); break } catch (e) { }
}
if (!chromium) { console.log('⏭  Playwright алга — previz видеоны тестийг алгаслаа'); process.exit(0); }

const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HERE = new URL('.', import.meta.url).pathname;
const ROOT = HERE.replace(/tools\/test\/$/, '');
const PAGE = 'file://' + ROOT + 'camera.html';

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++ };
const near = (a, b, e) => Math.abs(a - b) < e;

/* ── CRC-32 (Node талд бие даан) ── */
const CRC_T = new Uint32Array(256);
for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); CRC_T[i] = c >>> 0; }
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };

/* ── ZIP уншигч (EOCD → төв лавлах → локал толгой) ── */
function parseZip(buf) {
  let e = -1;
  for (let i = buf.length - 22; i >= 0; i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) return null;
  const count = buf.readUInt16LE(e + 10), cdLen = buf.readUInt32LE(e + 12), cdOff = buf.readUInt32LE(e + 16);
  const entries = []; let p = cdOff;
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) return null;
    const flags = buf.readUInt16LE(p + 8), method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16);
    const csize = buf.readUInt32LE(p + 20), usize = buf.readUInt32LE(p + 24);
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nl).toString('utf8');
    /* локал толгой */
    const lhOk = buf.readUInt32LE(lho) === 0x04034b50;
    const lnl = buf.readUInt16LE(lho + 26), lxl = buf.readUInt16LE(lho + 28);
    const dataOff = lho + 30 + lnl + lxl;
    const data = buf.subarray(dataOff, dataOff + csize);
    entries.push({ name, flags, method, crc, csize, usize, lhOk, data, lcrc: buf.readUInt32LE(lho + 14) });
    p += 46 + nl + xl + cl;
  }
  return { count, cdLen, cdOff, entries, eocdAt: e };
}

/* ── хөтөч ── */
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage();
page.on('dialog', d => d.accept());
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
await page.goto(PAGE);
await page.waitForTimeout(1200);

const setup = (f1) => page.evaluate(f1 => {
  clearScene(); keys = []; activeK = -1;
  fps = 24; document.getElementById('fps').value = 24;
  fStart = 1; fEnd = f1; document.getElementById('fStart').value = 1; document.getElementById('fEnd').value = f1;
  setPeople(2); document.getElementById('anim').value = 'walk';
  document.getElementById('aspect').value = '16:9';
  const a = cloneS(state); a.frame = 1; const b = cloneS(state); b.theta += 1.2; b.frame = f1;
  keys = [a, b]; activeK = 0; setFrame(1); syncAll();
  /* dl() тагнуул — татаж авсан эсэхийг мэдэх */
  window.__dl = []; window.dl = (name, data) => { window.__dl.push({ name, size: data && data.size }); };
}, f1);
const snap = () => page.evaluate(() => ({
  rendering, cancelRender, px: renderer.getPixelRatio(), cw: canvas.width, ch: canvas.height,
  want: Math.floor(canvas.clientWidth * renderer.getPixelRatio()), wantH: Math.floor(canvas.clientHeight * renderer.getPixelRatio()),
  hv: helpers.visible, ov: overlay3d.visible, elapsed, curFrame, playing,
  bar: getComputedStyle(document.getElementById('renderBar')).display, barShow: document.getElementById('renderBar').classList.contains('show'),
  toast: document.getElementById('toast').textContent, toastCls: document.getElementById('toast').className, dl: window.__dl
}));

/* ═══ A. 25 фрейм видео ═══ */
console.log('A. Видео 320×180, 25 фрейм (бодит цагаар)');
await setup(25);
const before = await snap();
const A = await page.evaluate(async () => {
  const t0 = performance.now();
  const r = await renderVideoBlob({ W: 320, H: 180 });
  const ms = performance.now() - t0, el = elapsed;   /* elapsed — экспорт дуусмагц */
  return r ? { size: r.blob.size, type: r.blob.type, mime: r.mime, frames: r.frames, W: r.W, H: r.H, ms, el } : { r, ms, el };
});
await page.waitForTimeout(120);   /* нэг-хоёр tick өнгөрөөнө */
const after = await snap();
ok(A.size > 0, 'blob үүсэв: ' + A.size + ' байт (' + A.mime + ')');
ok(typeof A.mime === 'string' && A.mime.indexOf('video/') === 0 && A.type === A.mime, 'mime видео: ' + A.mime);
ok(A.frames === 25, 'фрейм 25: ' + A.frames);
ok(A.ms >= 1000 && A.ms <= 1700, 'хугацаа ~1.0–1.6 с (бодит цаг): ' + (A.ms / 1000).toFixed(2) + ' с');
ok(after.rendering === false && after.cancelRender === false, 'rendering = false');
ok(after.px === before.px, 'pixel ratio сэргэв: ' + after.px);
ok(after.cw === after.want && after.ch === after.wantH, 'канвасын хэмжээ сэргэв: ' + after.cw + '×' + after.ch);
ok(after.hv === before.hv && after.ov === before.ov, 'helpers / overlay3d харагдац сэргэв');
ok(near(A.el, before.elapsed, .5), 'elapsed 1.3 с-ээр урагшлаагүй (' + before.elapsed.toFixed(2) + ' → ' + A.el.toFixed(2) + ')');
/* renderFrames шууд: гогцооны дараа elapsed яг хуучин утгаараа (await-ийн үргэлжлэл tick-ээс өмнө ажиллана) */
const A2 = await page.evaluate(async () => { const e0 = elapsed; const n = await renderFrames({ W: 64, H: 36, pace: false }, () => { }); return { e0, e1: elapsed, n, cf: curFrame }; });
ok(A2.e1 === A2.e0 && A2.n === 25, 'renderFrames: elapsed яг сэргэв (' + A2.e0.toFixed(3) + '), 25 фрейм');
ok(after.curFrame === before.curFrame, 'curFrame сэргэв: ' + after.curFrame);
ok(after.bar === 'none' && !after.barShow, 'renderBar нуугдсан');
ok(after.playing === false, 'тоглуулалт зогссон');

/* ═══ B. Цуцлах ═══ */
console.log('B. Цуцлах (cancelRender / Esc)');
await setup(121);
await page.evaluate(() => { window.__vid = renderVideoBlob({ W: 160, H: 90 }); });
await page.waitForTimeout(150);
const mid = await snap();
ok(mid.rendering === true && mid.bar === 'flex' && /Рендер/.test(await page.evaluate(() => document.getElementById('renderTxt').textContent)), 'рендер явж байна, зурвас харагдана');
await page.keyboard.press('Escape');
const B = await page.evaluate(async () => { const r = await window.__vid; return { r, rendering, toast: document.getElementById('toast').textContent, dl: window.__dl }; });
ok(B.r === null, 'үр дүн null');
ok(B.rendering === false, 'rendering = false');
ok(B.dl.length === 0, 'юу ч татагдаагүй');
ok(/цуцлагд/.test(B.toast), 'toast: ' + B.toast);
const B2 = await snap();
ok(B2.bar === 'none' && B2.cw === B2.want, 'зурвас нуугдаж, канвас сэргэв');
/* ✕ товч */
await setup(121);
await page.evaluate(() => { window.__vid = renderVideoBlob({ W: 160, H: 90 }); });
await page.waitForTimeout(120);
await page.click('#renderCancel');
const B3 = await page.evaluate(async () => ({ r: await window.__vid, rendering }));
ok(B3.r === null && B3.rendering === false, '✕ товч цуцлав');

/* ═══ C. PNG цуваа ZIP ═══ */
console.log('C. PNG цуваа .zip (6 фрейм)');
await setup(6);
const C64 = await page.evaluate(async () => {
  const b = await renderFramesZip({ W: 64, H: 36 });
  if (!b) return null;
  const ab = await b.arrayBuffer(); let s = ''; const u = new Uint8Array(ab);
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return { b64: btoa(s), type: b.type };
});
ok(!!C64, 'ZIP Blob үүсэв');
if (C64) {
  const buf = Buffer.from(C64.b64, 'base64');
  const z = parseZip(buf);
  ok(!!z, 'EOCD ба төв лавлах уншигдав');
  if (z) {
    ok(z.count === 7 && z.entries.length === 7, 'бичлэг 7 (6 png + README): ' + z.count);
    const names = z.entries.map(e => e.name);
    const want = [1, 2, 3, 4, 5, 6].map(i => 'frame_000' + i + '.png').concat('README.txt');
    ok(JSON.stringify(names) === JSON.stringify(want), 'нэрс: ' + names.join(', '));
    const e0 = z.entries[0];
    ok(e0.lhOk && e0.data[0] === 0x89 && e0.data[1] === 0x50 && e0.data[2] === 0x4E && e0.data[3] === 0x47, 'эхний файл PNG-ээр эхэлнэ');
    ok(crc32(e0.data) === e0.crc && e0.lcrc === e0.crc, 'CRC-32 таарав: ' + e0.crc.toString(16));
    ok(z.entries.every(e => e.method === 0 && e.csize === e.usize && e.csize === e.data.length), 'бүгд STORE, хэмжээ таарна');
    ok(z.entries.every(e => (e.flags & 0x800) !== 0), 'UTF-8 нэрийн туг');
    ok(z.entries.every(e => crc32(e.data) === e.crc), 'бүх бичлэгийн CRC таарна');
    const rd = z.entries[6].data.toString('utf8');
    ok(/fps: 24/.test(rd) && /64×36/.test(rd) && /1 … 6/.test(rd), 'README.txt: fps, хэмжээ, муж');
    ok(C64.type === 'application/zip' && z.eocdAt === buf.length - 22, 'mime zip, EOCD файлын төгсгөлд');
  }
}
const C2 = await snap();
ok(C2.rendering === false && C2.cw === C2.want && C2.bar === 'none', 'дараа нь бүгд сэргэв');

/* ═══ D. Хамгаалалт ═══ */
console.log('D. Хамгаалалт');
await setup(25);
const D1 = await page.evaluate(async () => { keys = [keys[0]]; activeK = 0; syncAll(); const r = await renderVideoBlob({ W: 160, H: 90 }); return { r, toast: document.getElementById('toast').textContent, cls: document.getElementById('toast').className, rendering }; });
ok(D1.r === null && /err/.test(D1.cls) && /2 түлхүүр/.test(D1.toast), '1 кадртай → null, алдаа: ' + D1.toast);
await setup(25);
const D2 = await page.evaluate(async () => { rendering = true; const r = await renderVideoBlob({ W: 160, H: 90 }); const t = document.getElementById('toast').textContent; rendering = false; return { r, t }; });
ok(D2.r === null && /Рендер явж байна/.test(D2.t), 'давхар дуудлага → null: ' + D2.t);
const D3 = await page.evaluate(async () => { rendering = true; const r = await renderFramesZip({ W: 64, H: 36 }); rendering = false; return r; });
ok(D3 === null, 'renderFramesZip ч давхар дуудлагыг хаана');

/* ═══ E. vidSize ═══ */
console.log('E. vidSize');
const E = await page.evaluate(() => {
  const sel = document.getElementById('aspect'), out = {};
  const was = sel.value;
  sel.value = '16:9'; out.a = vidSize('1080p'); out.a7 = vidSize('720p');
  sel.value = '9:16'; out.b = vidSize('1080p'); out.b7 = vidSize('720p');
  sel.value = '2.39:1'; out.c = vidSize('720p'); out.c10 = vidSize('1080p');
  sel.value = was; return out;
});
ok(E.a.W === 1920 && E.a.H === 1080, '16:9 1080p → 1920×1080: ' + E.a.W + '×' + E.a.H);
ok(E.a7.W === 1280 && E.a7.H === 720, '16:9 720p → 1280×720');
ok(E.b.W === 1080 && E.b.H === 1920, '9:16 1080p → 1080×1920: ' + E.b.W + '×' + E.b.H);
ok(E.b7.W === 720 && E.b7.H === 1280, '9:16 720p → 720×1280');
ok(E.c.W === 1720 && E.c.H === 720, '2.39:1 720p → 1720×720: ' + E.c.W + '×' + E.c.H);
ok(E.c10.W % 2 === 0 && E.c10.H === 1080, '2.39:1 1080p тэгш тоо: ' + E.c10.W + '×' + E.c10.H);

/* ═══ F. UI — товч, цэс ═══ */
console.log('F. UI');
const F = await page.evaluate(() => ({
  res: document.getElementById('vidRes') && document.getElementById('vidRes').value,
  btn: !!document.querySelector('#pgOut [data-act="video"]') && !!document.querySelector('#pgOut [data-act="frames"]'),
  menu: !!document.querySelector('#popFile [data-act="video"]') && !!document.querySelector('#popFile [data-act="frames"]')
}));
ok(F.res === '1080p', 'анхдагч нягтрал 1080p');
ok(F.btn && F.menu, '📦 таб ба Файл цэсэнд товчнууд бий');

/* ═══ G. Рендер явж байхад UI түгжигдэнэ ═══ */
console.log('G. Рендер явж байхад UI түгжигдэнэ');
await setup(121);
await page.evaluate(() => { window.__vid = renderVideoBlob({ W: 320, H: 180 }); });
await page.waitForTimeout(220);
const G = await page.evaluate(() => {
  const before = [canvas.width, canvas.height];
  doAct('png'); const t1 = document.getElementById('toast').textContent;
  startPlay(); const pl = playing;
  return { before, after: [canvas.width, canvas.height], t1, pl,
    cls: document.body.classList.contains('rendering'),
    pe: getComputedStyle(document.getElementById('dock')).pointerEvents, dl: window.__dl.length, rendering };
});
ok(G.rendering && G.before[0] === 320 && G.after[0] === 320 && G.after[1] === 180, 'PNG товч рендерийн канвасыг эвдээгүй (' + G.after.join('×') + ')');
ok(/Рендер явж байна/.test(G.t1) && G.dl === 0, 'doAct хаагдсан: ' + G.t1);
ok(G.pl === false, 'тоглуулалт эхлээгүй');
ok(G.cls && G.pe === 'none', 'док түгжигдсэн (body.rendering, pointer-events: none)');
await page.keyboard.press('Escape');
await page.evaluate(async () => { await window.__vid; });
const G2 = await page.evaluate(() => ({ cls: document.body.classList.contains('rendering'), pe: getComputedStyle(document.getElementById('dock')).pointerEvents, rendering }));
ok(!G2.cls && G2.pe !== 'none' && !G2.rendering, 'дараа нь док чөлөөлөгдөв');

/* ═══ H. Видеоны урт = фрейм / fps (сүүлийн фрейм урттай) ═══ */
console.log('H. Видеоны урт = фрейм / fps');
await setup(48);
const Hr = await page.evaluate(async () => {
  const r = await renderVideoBlob({ W: 320, H: 180 });
  if (!r) return null;
  const url = URL.createObjectURL(r.blob);
  const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.src = url;
  const dur = await new Promise(res => {
    const t = setTimeout(() => res(-2), 8000);
    v.onerror = () => { clearTimeout(t); res(-1); };
    v.onloadedmetadata = () => {
      if (isFinite(v.duration)) { clearTimeout(t); return res(v.duration); }
      /* MediaRecorder-ийн WebM урт бичдэггүй — төгсгөл рүү нь гүйлгэж мэднэ */
      v.ontimeupdate = () => { if (isFinite(v.duration)) { clearTimeout(t); v.ontimeupdate = null; res(v.duration); } };
      v.currentTime = 1e6;
    };
  });
  URL.revokeObjectURL(url);
  return { frames: r.frames, secs: r.secs, dur, mime: r.mime };
});
ok(Hr && Hr.frames === 48, '48 фрейм бичигдэв');
ok(Hr && Hr.dur > 0 && near(Hr.dur, 48 / 24, 1.5 / 24), 'видеоны урт ' + (Hr ? Hr.dur.toFixed(3) : '?') + ' с ≈ 2.000 с (сүүлийн фрейм урттай)');
ok(Hr && Hr.secs > 1.8 && Hr.secs < 4, 'бодит хугацаа хэмжигдсэн: ' + (Hr ? Hr.secs.toFixed(2) : '?') + ' с');

await browser.close();
if (errs.length) { console.log('  ✗ JS алдаа: ' + errs.slice(0, 3).join(' | ')); bad++ }
console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
