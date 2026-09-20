/* Хөтөч дээр харагдсан камер Blender дээр ЯГ ТЭР чиглэлд харж байна уу?
   camera.html-ийг жинхэнэ хөтөч дээр ачаалж, экспортын KEYS-ийг уншаад
   квартернионоос урагшлах векторыг сэргээж, байтай тулгана.
   Playwright байхгүй бол алгасна. */
import { readFileSync } from 'node:fs';

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright/index.js']) {
  try { const m = await import(p); chromium = m.chromium || (m.default && m.default.chromium); break } catch (e) { }
}
if (!chromium) { console.log('⏭  Playwright алга — fidelity тестийг алгаслаа'); process.exit(0); }

const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HERE = new URL('.', import.meta.url).pathname;
const PAGE = 'file://' + HERE.replace(/tools\/test\/$/, '') + 'camera.html';

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++ };

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => {
  if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text());
});
await page.goto(PAGE);
await page.waitForTimeout(1200);

const res = await page.evaluate(() => {
  let got = null;
  const real = window.dl;
  window.dl = (n, d) => { got = d };
  document.getElementById('inPrompt').value =
    'orbit 180 degrees around the two people while dollying in, dutch angle, low angle, 35mm';
  runParse();
  addProp('box');
  exportPY();
  window.dl = real;
  const browserKeys = keys.map(k => {
    const p = posOf(k);
    return { p: [p.x, p.y, p.z], t: [k.target.x, k.target.y, k.target.z], fov: k.fov, roll: k.roll || 0 };
  });
  return { py: got, browserKeys, aspect: shotAspect() };
});
await browser.close();
if (errs.length) { console.log('  ✗ JS алдаа: ' + errs.join(' | ')); process.exit(1) }

/* KEYS-ийг Python эхээс уншина */
const body = /^KEYS = \[\n([\s\S]*?)\n\]/m.exec(res.py)[1];
const rows = [...body.matchAll(/\(\s*(\d+)\s*,\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)\s*,\s*([-\d.e+]+)\s*\)/g)]
  .map(m => ({
    f: +m[1],
    p: m[2].split(',').map(Number),
    q: m[3].split(',').map(Number),
    t: m[4].split(',').map(Number),
    lens: +m[5],
  }));

console.log('Хөтчийн кадр: ' + res.browserKeys.length + ' · экспортын кадр: ' + rows.length);
ok(rows.length === res.browserKeys.length, 'кадрын тоо таарч байна');

const qRot = (q, v) => {                       // Blender (w,x,y,z)
  const [w, x, y, z] = q, [a, b, c] = v;
  const tx = 2 * (y * c - z * b), ty = 2 * (z * a - x * c), tz = 2 * (x * b - y * a);
  return [a + w * tx + (y * tz - z * ty), b + w * ty + (z * tx - x * tz), c + w * tz + (x * ty - y * tx)];
};
const norm = v => { const l = Math.hypot(...v) || 1; return v.map(c => c / l) };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

let worstAim = 0, worstPos = 0, worstLen = 0, flips = 0;
rows.forEach((r, i) => {
  const bk = res.browserKeys[i];
  /* 1. Байрлал: хөтчийн (x,y,z) → Blender (x, −z, y) */
  const expect = [bk.p[0], -bk.p[2], bk.p[1]];
  worstPos = Math.max(worstPos, Math.hypot(r.p[0] - expect[0], r.p[1] - expect[1], r.p[2] - expect[2]));
  /* 2. Чиглэл: Blender камер локал −Z рүү харна */
  const fwd = qRot(r.q, [0, 0, -1]);
  const toT = norm([r.t[0] - r.p[0], r.t[1] - r.p[1], r.t[2] - r.p[2]]);
  worstAim = Math.max(worstAim, Math.acos(Math.max(-1, Math.min(1, dot(norm(fwd), toT)))) * 180 / Math.PI);
  /* 3. Линз: босоо FOV, sensor_height 24мм */
  const wantLens = 12 / Math.tan(bk.fov * Math.PI / 360);
  worstLen = Math.max(worstLen, Math.abs(r.lens - wantLens));
  /* 4. Квартернионы тэмдэг хөрш кадрын хооронд эргээгүй байх */
  if (i && dot(rows[i - 1].q.slice(1), r.q.slice(1)) + rows[i - 1].q[0] * r.q[0] < 0) flips++;
  /* 5. Бүх тоо хэвийн */
  if (![...r.p, ...r.q, ...r.t, r.lens].every(Number.isFinite)) bad++;
});

ok(worstPos < 1e-4, 'байрлал Blender-ийн Z-дээш систем рүү зөв (зөрүү ' + worstPos.toExponential(1) + ' м)');
ok(worstAim < 0.05, 'камер байг ЯГ харж байна (хамгийн муу зөрүү ' + worstAim.toFixed(4) + '°)');
ok(worstLen < 1e-4, 'линзний мм таарч байна (зөрүү ' + worstLen.toExponential(1) + ')');
ok(flips === 0, 'квартернионы тэмдэг эргээгүй — камер гэнэт эргэхгүй');
ok(rows.every(r => Math.abs(Math.hypot(...r.q) - 1) < 1e-4), 'квартернион нэгж урттай');

console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
