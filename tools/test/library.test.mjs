/* Хөдөлгөөний сангийн 60 хөдөлгөөн бүр camera.html дээр ӨӨР камерын
   хөдөлгөөн үүсгэж байгааг, мөн харагдацын товчнуудыг шалгана.
   Playwright байхгүй бол алгасна. */
import { readFileSync } from 'node:fs';

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright/index.js']) {
  try { const m = await import(p); chromium = m.chromium || (m.default && m.default.chromium); break } catch (e) { }
}
if (!chromium) { console.log('⏭  Playwright алга — сангийн тестийг алгаслаа'); process.exit(0); }

const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HERE = new URL('.', import.meta.url).pathname;
const ROOT = HERE.replace(/tools\/test\/$/, '');
const PAGE = 'file://' + ROOT + 'camera.html';

const lib = readFileSync(ROOT + 'camera-movements.html', 'utf8');
const a = lib.indexOf('var AUTO = {'), b = lib.indexOf('};', a);
const AUTO = Function('return ' + lib.slice(a + 'var AUTO = '.length, b + 1))();

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++ };

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
await page.goto(PAGE);
await page.waitForTimeout(1200);

console.log('1. Сангийн 60 хөдөлгөөн');
const res = await page.evaluate((AUTO) => {
  const r3 = v => Math.round(v * 1000) / 1000;
  setPeople(2);
  const S0 = cloneS(state);
  const out = {};
  for (const id in AUTO) {
    Object.assign(state, cloneS(S0)); state.target.copy(S0.target);
    autoTarget = false; shakeAmt = 0; document.getElementById('anim').value = 'idle';
    let r = null, err = '';
    try { r = promptToCamera(AUTO[id] + ', 6 seconds'); } catch (e) { err = e.message; }
    const span = Math.max(1, fEnd - fStart);
    const sig = keys.map(k => [r3((k.frame - fStart) / span), r3(k.theta), r3(k.phi), r3(k.radius), r3(k.fov), r3(k.roll || 0),
      r3(k.target.x), r3(k.target.y), r3(k.target.z)]);
    diagnose();
    out[id] = { ok: !!r, err, n: keys.length, motion: JSON.stringify(sig) + '|shake=' + r3(shakeAmt),
      tags: techTags.slice(), anim: document.getElementById('anim').value,
      rec: r ? r.recognised : [], issues: issues.map(i => i.id) };
  }
  return out;
}, AUTO);

const ids = Object.keys(res);
const failed = ids.filter(i => !res[i].ok);
ok(failed.length === 0, '60 хөдөлгөөн бүгд танигдсан' + (failed.length ? ' — ТАНИГДААГҮЙ: ' + failed.join(', ') : ''));
const groups = {};
ids.forEach(i => { (groups[res[i].motion] = groups[res[i].motion] || []).push(i); });
const dupes = Object.values(groups).filter(g => g.length > 1);
const distinct = Object.keys(groups).length;
console.log('   өвөрмөц хөдөлгөөн: ' + distinct + ' / 60');
dupes.forEach(g => console.log('   ⚠ ижил хөдөлгөөн: ' + g.join(' = ')));
ok(distinct >= 57, 'дор хаяж 57 өөр хөдөлгөөн (static / time-lapse / rack focus зориудаар адил)');
const fullGroups = {};
ids.forEach(i => { const k = res[i].motion + '|' + res[i].tags.join(','); (fullGroups[k] = fullGroups[k] || []).push(i); });
ok(Object.keys(fullGroups).length === 60, 'промтын үгээрээ 60 бүгд ялгаатай');
ok(ids.every(i => res[i].n >= 2), 'бүгд дор хаяж 2 кадртай');
const dupIssue = ids.filter(i => res[i].issues.includes('dup'));
ok(dupIssue.length === 0, 'оношилгоо «давхар фрейм» алдаа өгөөгүй' + (dupIssue.length ? ': ' + dupIssue.join(', ') : ''));

console.log('2. Тусгай техникүүд зөв утгатай');
const T = res;
ok(T['whip-pan-right'].motion !== T['pan-right'].motion && T['whip-pan-right'].tags.includes('whip pan'), 'whip pan ≠ pan, тэмдэгтэй');
ok(T['crash-zoom-in'].tags.includes('crash zoom'), 'crash zoom тэмдэгтэй');
ok(T['bullet-time'].n >= 4 && T['bullet-time'].tags.includes('bullet time'), 'bullet time: хүлээгээд тойрно');
ok(T['quake'].motion.includes('shake=1'), 'газар хөдлөлт = хамгийн хүчтэй доргио');
ok(T['pov-run'].motion.includes('shake=0.85') && T['pov-run'].anim === 'walk', 'POV гүйлт: доргио + алхаа');
ok(T['tracking'].anim === 'walk' && T['follow'].anim === 'walk', 'дагах шотууд дүрийг алхуулна');
ok(T['static'].anim === 'idle' && !T['static'].motion.includes('shake=0.'), 'static: доргиогүй, алхаагүй');
ok(T['time-lapse'].tags.includes('time-lapse') && T['rack-focus'].tags.some(t => /rack focus/.test(t)), 'time-lapse / rack focus промтын тэмдэгтэй');
ok(T['pedestal-up'].motion !== T['crane-up'].motion, 'pedestal ≠ crane');
ok(T['slider-right'].motion !== T['truck-right'].motion, 'slider ≠ truck');
ok(T['follow'].motion !== T['tracking'].motion && T['side-tracking'].motion !== T['tracking'].motion, 'араас / хажуугаас / зэрэгцэн дагах гурвуулаа өөр');
ok(T['fast-zoom-in'].motion !== T['slow-zoom-in'].motion, 'хурдан zoom ≠ удаан zoom (хугацааны хуваарь)');
ok(T['ots-push'].rec.some(x => /OTS/.test(x)), 'мөрөн дээгүүр (OTS) танигдсан');

console.log('3. Сангаас ирэх холбоос (техникийн нэр промтод орно)');
await page.goto(PAGE + '#p=' + encodeURIComponent('crash zoom in, 6 seconds') + '&d=6&n=2&env=dusk&t=' + encodeURIComponent('Crash zoom in'));
await page.waitForTimeout(1200);
const bridge = await page.evaluate(() => ({ tags: techTags.slice(), prompt: document.getElementById('promptOut').textContent, n: keys.length, env: envId }));
ok(bridge.tags[0] === 'Crash zoom in', 'сангийн нэр эхэнд орсон: ' + bridge.tags.join(', '));
ok(/Camera technique: Crash zoom in/.test(bridge.prompt), 'промтод «Camera technique: Crash zoom in» байна');
ok(bridge.env === 'dusk' && bridge.n >= 2, 'орчин, кадрууд үүссэн');

console.log('4. Харагдацын товчнууд');
await page.goto(PAGE);
await page.waitForTimeout(1000);
const views = await page.evaluate(async () => {
  const out = {};
  const btns = [...document.querySelectorAll('#vphdr .vb[data-view]')];
  for (const b of btns) { b.click(); out[b.textContent.trim()] = { th: +state.theta.toFixed(3), phi: +state.phi.toFixed(3) }; }
  return { labels: btns.map(b => b.textContent.trim()), out };
});
const near = (a, b) => Math.abs(a - b) < .01;
const wrap = t => { while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI; return t; };
ok(views.labels.join(' ') === 'Урд Ард Баруун Зүүн Дээр Доор Багтаах', 'товчнууд: ' + views.labels.join(' · '));
ok(near(wrap(views.out['Урд'].th), 0), 'Урд → theta 0');
ok(near(Math.abs(wrap(views.out['Ард'].th)), Math.PI), 'Ард → theta π (эсрэг тал)');
ok(near(wrap(views.out['Баруун'].th), Math.PI / 2), 'Баруун → theta +90°');
ok(near(wrap(views.out['Зүүн'].th), -Math.PI / 2), 'Зүүн → theta −90°');
ok(views.out['Дээр'].phi < .1, 'Дээр → дээрээс');
ok(views.out['Доор'].phi > 1.9, 'Доор → доороос');

await browser.close();
if (errs.length) { console.log('  ✗ JS алдаа: ' + errs.slice(0, 3).join(' | ')); bad++ }
console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
