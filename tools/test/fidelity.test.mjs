/* Хөтөч дээр харагдсан камер Blender дээр ЯГ ТЭР байдлаар гарч байна уу?
   camera.html-ийг жинхэнэ хөтөч дээр ачаалж, экспортын KEYS-ийг уншаад
   фрейм бүрийг хөтчийн өөрийнх нь тооцоололтой тулгана.
   Playwright байхгүй бол алгасна. */

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

/** Хуудсан дээр промт ажиллуулаад .py-г буцаана */
async function shoot(prompt, tweak) {
  return page.evaluate(([prompt, tweak]) => {
    let got = null;
    const real = window.dl;
    window.dl = (n, d) => { got = d };
    document.getElementById('inPrompt').value = prompt;
    runParse();
    if (tweak) eval(tweak);          // зөвхөн тестийн дотор
    exportPY();
    window.dl = real;
    const f0 = Math.round(keys[0].frame), f1 = Math.round(keys[keys.length - 1].frame);
    const want = [];
    for (let f = f0; f <= f1; f++) {
      const s = sampleFrame(f);
      want.push({ f, r: s.radius, t: [s.target.x, s.target.y, s.target.z], fov: s.fov });
    }
    return { py: got, want, nKeys: keys.length, f0, f1, shake: shakeAmt, auto: autoTarget };
  }, [prompt, tweak || '']);
}
function readKeys(py) {
  const body = /^KEYS = \[\n([\s\S]*?)\n\]/m.exec(py)[1];
  return [...body.matchAll(/\(\s*(\d+)\s*,\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)\s*,\s*\(([^)]*)\)\s*,\s*([-\d.]+)\s*\)/g)]
    .map(m => ({ f: +m[1], p: m[2].split(',').map(Number), q: m[3].split(',').map(Number), t: m[4].split(',').map(Number), lens: +m[5] }));
}
const qRot = (q, v) => {
  const [w, x, y, z] = q, [a, b, c] = v;
  const tx = 2 * (y * c - z * b), ty = 2 * (z * a - x * c), tz = 2 * (x * b - y * a);
  return [a + w * tx + (y * tz - z * ty), b + w * ty + (z * tx - x * tz), c + w * tz + (x * ty - y * tx)];
};
const norm = v => { const l = Math.hypot(...v) || 1; return v.map(c => c / l) };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

console.log('1. Фрейм бүрээр шатаасан эсэх');
let r = await shoot('wide shot then orbit 180 degrees clockwise then dolly in, slow');
let rows = readKeys(r.py);
ok(rows.length === r.f1 - r.f0 + 1, 'фрейм бүрд түлхүүр (' + rows.length + ' = ' + r.f0 + '…' + r.f1 + ')');
ok(rows.length > r.nKeys, 'хөтчийн ' + r.nKeys + ' кадраас ' + rows.length + ' фрейм болж дэлгэрсэн');
ok(/^INTERPOLATION = "LINEAR"$/m.test(r.py), 'шатаасан үед шугаман шилжилт');

console.log('2. Тойрох үед зай хадгалагдаж байна уу (хамгийн гол алдаа)');
let worstR = 0, worstAim = 0, worstLens = 0;
rows.forEach((row, i) => {
  const w = r.want[i];
  const d = dist(row.p, row.t);
  worstR = Math.max(worstR, Math.abs(d - w.r) / Math.max(w.r, 1e-6));
  const cosA = dot(norm(qRot(row.q, [0, 0, -1])),
    norm([row.t[0] - row.p[0], row.t[1] - row.p[1], row.t[2] - row.p[2]]));
  worstAim = Math.max(worstAim, Math.acos(Math.max(-1, Math.min(1, cosA))) * 180 / Math.PI);
  worstLens = Math.max(worstLens, Math.abs(row.lens - 12 / Math.tan(w.fov * Math.PI / 360)));
});
ok(worstR < 0.002, 'камер-бай хоорондын зай яг таарч байна (хамгийн муу ' + (worstR * 100).toFixed(3) + '%)');
ok(worstAim < 0.05, 'камер байг ЯГ харж байна (' + worstAim.toFixed(4) + '°)');
ok(worstLens < 1e-4, 'линз фрейм бүрд таарч байна');

console.log('3. Хуучин арга бол ямар зөрүү гарах байсан бэ');
/* Зөвхөн түлхүүр кадруудыг авч, хооронд нь Blender шиг шулуунаар татвал… */
const sparse = rows.filter((_, i) => i % Math.max(1, Math.floor((rows.length - 1) / (r.nKeys - 1))) === 0);
let chord = 0;
for (let i = 1; i < sparse.length; i++) {
  const a = sparse[i - 1], b = sparse[i];
  const mid = [0, 1, 2].map(k => (a.p[k] + b.p[k]) / 2);
  const t = a.t;
  chord = Math.max(chord, 1 - dist(mid, t) / Math.max(dist(a.p, t), 1e-6));
}
ok(chord > 0.02, 'шулуунаар татвал ' + (chord * 100).toFixed(1) + '% дотогш орох байсан — шатаалт үүнийг арилгасан');

console.log('4. «Авто бай» экспортод ордог эсэх');
r = await shoot('medium shot then truck right, slow',
  'autoTarget = true; document.getElementById("cAuto").checked = true; setPeople(3); people[0].position.x = 6; syncAll();');
rows = readKeys(r.py);
ok(r.auto === true, 'авто бай асаалттай');
const cen = await page.evaluate(() => { const c = centroid(); return [c.x, -c.z, c.y] });
ok(dist(rows[0].t, cen) < 0.01, 'бай нь дүрүүдийн төв дээр (авто бай ажилласан)');
ok(dist(rows[rows.length - 1].t, cen) < 0.01, 'сүүлийн фрейм дээр ч мөн адил');

console.log('5. Гар камерын доргио экспортод ордог эсэх');
r = await shoot('handheld medium shot, static');
rows = readKeys(r.py);
ok(r.shake > 0, 'доргио идэвхжсэн');
let jitter = 0;
for (let i = 1; i < rows.length; i++) jitter = Math.max(jitter, dist(rows[i].p, rows[i - 1].p));
ok(jitter > 1e-4, 'фрейм хооронд бодит хөдөлгөөн бий (' + jitter.toFixed(5) + ' м)');

console.log('6. Нуусан объект экспортод орохгүй');
const hid = await page.evaluate(() => {
  let got = null; const real = window.dl; window.dl = (n, d) => { got = d };
  setPeople(2); addProp('box');
  props[props.length - 1].userData.vis = false; props[props.length - 1].visible = false;
  people[1].userData.vis = false; people[1].visible = false;
  exportPY(); window.dl = real;
  return got;
});
const nSub = (/^SUBJECTS = \[\n([\s\S]*?)\n\]/m.exec(hid)[1].match(/^\s*\(/gm) || []).length;
const nProp = (/^PROPS = \[\n([\s\S]*?)\n\]/m.exec(hid)[1].match(/^\s*\(/gm) || []).length;
ok(nSub === 1, 'нуусан дүр гараагүй (' + nSub + ')');
ok(nProp === 0, 'нуусан объект гараагүй (' + nProp + ')');

console.log('7. Тогтвортой таних тэмдэг');
const ids = await page.evaluate(() => {
  const grab = () => { let g = null; const r = window.dl; window.dl = (n, d) => { g = d }; exportPY(); window.dl = r; return g };
  props.length = 0; people.length = 0;
  addProp('box'); addProp('tree'); addProp('rock');
  props.forEach(p => { p.userData.vis = true; p.visible = true });
  const before = grab();
  removeProp(props[0]);                     /* эхнийхийг устгана */
  const after = grab();
  const ids = t => [...t.matchAll(/^\s*\("([^"]+)"/gm)].map(m => m[1]);
  const secB = /^PROPS = \[\n([\s\S]*?)\n\]/m.exec(before)[1];
  const secA = /^PROPS = \[\n([\s\S]*?)\n\]/m.exec(after)[1];
  return { before: ids(secB), after: ids(secA) };
});
ok(ids.before.length === 3 && ids.after.length === 2, 'нэг объект устлаа');
ok(ids.after[0] === ids.before[1] && ids.after[1] === ids.before[2],
  'үлдсэн объектын таних тэмдэг ӨӨРЧЛӨГДӨӨГҮЙ — Blender дээрх холбоос салахгүй');

await browser.close();
if (errs.length) { console.log('  ✗ JS алдаа: ' + errs.slice(0, 2).join(' | ')); bad++ }
console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
