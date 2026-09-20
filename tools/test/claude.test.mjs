/* Claude холболтын UI-г хуурамч сервер дээр шалгана.
   Playwright байхгүй бол алгасна. */
import { server, PORT, fakeReply } from './mock-server.mjs';

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright/index.js']) {
  try { const m = await import(p); chromium = m.chromium || (m.default && m.default.chromium); break } catch (e) { }
}
if (!chromium) { console.log('⏭  Playwright алга — Claude тестийг алгаслаа'); process.exit(0); }

const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
await new Promise(r => server.listen(PORT, r));
const URL = 'http://localhost:' + PORT + '/camera.html';

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++ };

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => {
  if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text());
});
await page.goto(URL);
await page.waitForTimeout(800);

console.log('1. Холболт');
await page.waitForFunction(() => window.CLA && CLA.state.mode !== 'unknown', null, { timeout: 8000 });
ok(await page.evaluate(() => CLA.state.mode) === 'proxy', 'прокси олдож, автоматаар холбогдсон');
await page.click('#ptabs [data-page="pgAI"]');
ok(await page.isVisible('#pgAI'), '🤖 таб нээгдэж байна');
ok(/Холбогдсон/.test(await page.textContent('#aiStat')), 'байдал «Холбогдсон» гэж харагдана');
ok(!await page.isVisible('.ai-keybox'), 'прокси үед түлхүүрийн хэсэг нуугдсан');

console.log('2. Монголоор бичээд камер үүсгэх');
await page.fill('#aiWish', 'Хоёр морьтон үдшийн талд зогсож байна. Холоос харуулаад дараа нь ойртоорой.');
await page.click('#pgAI [data-act="aiMake"]');
await page.waitForFunction(() => document.querySelector('#aiOut .ai-cmd'), null, { timeout: 15000 });
const st = await page.evaluate(() => ({
  keys: keys.length, people: people.length, env: envId,
  inp: document.getElementById('inPrompt').value,
  page: document.querySelector('.page.on').id,
  explain: (document.querySelector('#aiOut .ai-exp') || {}).textContent || ''
}));
ok(st.keys >= 3, st.keys + ' түлхүүр кадр үүссэн');
ok(st.people === 2, 'дүрийн тоо 2 болсон');
ok(st.env === 'dusk', 'орчин «үдэш» болсон');
ok(/orbit 90 degrees clockwise/.test(st.inp), 'тушаал танигч руу зөв дамжсан');
ok(/8 seconds/.test(st.inp), 'үргэлжлэх хугацаа дамжсан');
ok(st.page === 'pgPrompt', 'промтын таб руу шилжсэн');
ok(/аажим ойртоно/.test(st.explain), 'монгол тайлбар харагдаж байна');

console.log('3. Гурван санал');
await page.click('#ptabs [data-page="pgAI"]');
await page.click('#pgAI [data-act="aiIdeas"]');
await page.waitForFunction(() => document.querySelectorAll('#aiOut .ai-card').length === 3, null, { timeout: 15000 });
ok(true, '3 санал гарсан');
await page.click('#aiOut [data-act="aiPick"][data-idea="2"]');
await page.waitForTimeout(400);
const pick = await page.evaluate(() => ({ inp: document.getElementById('inPrompt').value, env: envId, shake: shakeAmt }));
ok(/whip pan/.test(pick.inp), '3 дахь саналыг сонгоход тушаал нь орсон');
ok(pick.env === 'noir', 'саналын орчин тохирсон');
ok(pick.shake > 0, 'handheld доргио идэвхжсэн');

console.log('4. Промт сайжруулах');
await page.click('#ptabs [data-page="pgPrompt"]');
await page.click('#pgPrompt [data-act="aiPrompt"]');
await page.waitForFunction(() => /anamorphic/.test(document.getElementById('aiPromptOut').textContent), null, { timeout: 15000 });
ok(true, 'сайжруулсан промт ирсэн');
ok(await page.isVisible('#aiPromptBtns'), 'Хуулах / Авах товчнууд гарсан');
await page.click('#pgPrompt [data-act="aiPromptUse"]');
await page.waitForTimeout(300);
ok(/anamorphic/.test(await page.inputValue('#sceneTxt')), '«Үүнийг авах» дүр зургийн тайлбарт орсон');

console.log('5. Толь дээрээс асуух');
await page.keyboard.press('F2');
await page.waitForTimeout(600);
ok(await page.isVisible('#toli'), 'Толь нээгдсэн');
const hasAsk = await page.evaluate(() => !!document.querySelector('#toli [data-task]'));
ok(hasAsk, '«Claude-аас асуух» товч гарсан');
if (hasAsk) {
  await page.click('#toli [data-task]');
  await page.waitForFunction(() => document.querySelector('#toli .tl-ai .ai-exp'), null, { timeout: 15000 });
  ok(true, 'Claude-ийн тайлбар Толь дотор гарсан');
}
await page.keyboard.press('Escape');

console.log('6. Алдаа гарвал');
await page.evaluate(() => { CLA.clearCache(); });
process.env.MOCK_FAIL = '429';
await page.click('#ptabs [data-page="pgAI"]');
await page.click('#pgAI [data-act="aiMake"]');
await page.waitForFunction(() => /❌/.test(document.getElementById('aiOut').textContent), null, { timeout: 25000 });
ok(/Хэт олон хүсэлт/.test(await page.textContent('#aiOut')), 'алдааг монголоор ойлгомжтой хэлсэн');
delete process.env.MOCK_FAIL;

console.log('7. Claude-гүй ч програм ажиллана');
const p2 = await browser.newPage();
await p2.route('**/claude-api.js', r => r.fulfill({ status: 404, body: '' }));
await p2.route('**/claude-tasks.js', r => r.fulfill({ status: 404, body: '' }));
const e2 = [];
p2.on('pageerror', e => e2.push(e.message));
await p2.goto(URL);
await p2.waitForTimeout(1200);
ok(await p2.evaluate(() => typeof runParse === 'function' && typeof exportPY === 'function' && people.length >= 1),
  'файл дутуу ч камер ажиллаж байна');
await p2.click('#ptabs [data-page="pgAI"]');
ok(/олдсонгүй/.test(await p2.textContent('#aiStat')), 'дутуу файлыг эелдэг хэлсэн');
ok(e2.length === 0, 'JS алдаа гараагүй' + (e2.length ? ': ' + e2[0] : ''));

console.log('8. Өөрийн түлхүүрээр холбогдох (прокси байхгүй үед)');
process.env.MOCK_NOPROXY = '1';
const p3 = await browser.newPage();
let sentKey = '', sentHdr = false;
await p3.route('https://api.anthropic.com/**', async route => {
  const h = route.request().headers();
  sentKey = h['x-api-key'] || '';
  sentHdr = h['anthropic-dangerous-direct-browser-access'] === 'true';
  const body = JSON.parse(route.request().postData() || '{}');
  route.fulfill({
    status: sentKey === 'sk-ant-test' ? 200 : 401,
    contentType: 'application/json',
    body: sentKey === 'sk-ant-test'
      ? JSON.stringify({ content: [{ type: 'text', text: fakeReply(body) }], usage: { input_tokens: 5, output_tokens: 9 } })
      : JSON.stringify({ error: { message: 'invalid x-api-key' } })
  });
});
await p3.goto(URL);
await p3.waitForFunction(() => window.CLA && CLA.state.mode !== 'unknown', null, { timeout: 8000 });
await p3.click('#ptabs [data-page="pgAI"]');
ok(await p3.evaluate(() => CLA.state.mode) === 'off', 'прокси байхгүй бол «холбоогүй» болно');
ok(await p3.isVisible('.ai-keybox'), 'түлхүүр оруулах хэсэг гарч ирсэн');

await p3.fill('#aiKey', 'sk-ant-buruu');
await p3.click('#pgAI [data-act="aiConnect"]');
await p3.waitForFunction(() => /түлхүүр буруу|Холбоогүй/.test(document.getElementById('aiStat').textContent), null, { timeout: 15000 });
ok(/түлхүүр буруу/.test(await p3.textContent('#aiStat')), 'буруу түлхүүрийг ойлгомжтой хэлсэн');

await p3.fill('#aiKey', 'sk-ant-test');
await p3.click('#pgAI [data-act="aiConnect"]');
await p3.waitForFunction(() => CLA.state.mode === 'key', null, { timeout: 15000 });
ok(sentHdr, 'хөтчөөс шууд дуудах толгой илгээгдсэн');
ok(/Холбогдсон/.test(await p3.textContent('#aiStat')), 'өөрийн түлхүүрээр холбогдсон');
ok(!await p3.evaluate(() => CLA.store.get('key', null)), 'санах сонголтгүй үед түлхүүр хадгалагдаагүй');

await p3.check('#aiRemember');
ok(await p3.evaluate(() => CLA.store.get('key', '')) === 'sk-ant-test', 'санах сонголттой үед хадгалагдсан');
await p3.click('#pgAI [data-act="aiForget"]');
ok(!await p3.evaluate(() => CLA.store.get('key', null)), 'устгахад түлхүүр арилсан');
ok(await p3.inputValue('#aiKey') === '', 'талбар цэвэрлэгдсэн');
delete process.env.MOCK_NOPROXY;

await browser.close();
server.close();
if (errs.length) { console.log('  ✗ JS алдаа: ' + errs.slice(0, 3).join(' | ')); bad++ }
console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
