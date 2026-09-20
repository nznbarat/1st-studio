/* Захиалгын маягтын аюулгүй байдлыг шалгана.
   1) Серверийн прокси — түлхүүр урсахгүй, хэрэглэгч чат сонгож чадахгүй
   2) Хөтөч дээрх хоёр хуудас — ботын түлхүүр БАЙХГҮЙ, зөв POST явуулна */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = new URL('../../', import.meta.url).pathname;
let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++ };

/* ── Жижиг req / res дүр ── */
function mkRes() {
  const r = { code: 200, body: null, headers: {} };
  r.setHeader = (k, v) => { r.headers[k] = v };
  r.status = c => { r.code = c; return r };
  r.json = b => { r.body = b; return r };
  r.end = () => r;
  r.send = b => { r.body = b; return r };
  return r;
}
async function call(body, env, headers, keepWarm) {
  for (const k of ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'ORDER_RATE_MAX']) delete process.env[k];
  Object.assign(process.env, env || {});
  /* keepWarm — жинхэнэ серверт модуль санах ойд үлддэгийг дуурайна
     (хурдны хязгаар тэр санах ой дээр тулгуурладаг) */
  if (!keepWarm) delete require.cache[require.resolve(ROOT + 'api/order.js')];
  const handler = require(ROOT + 'api/order.js');
  const req = { method: 'POST', body, headers: headers || {}, socket: { remoteAddress: '1.2.3.4' } };
  const res = mkRes();
  await handler(req, res);
  return res;
}

/* Жинхэнэ түлхүүрийн хэлбэртэй, гэхдээ хуурамч утга */
const TOKEN = '8123456789:AAFнууц' .replace('нууц', 'S') + 'x'.repeat(32);
const ENV = { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: '999' };
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opt) => {
  sent.push({ url, body: JSON.parse(opt.body) });
  return { ok: true, status: 200, json: async () => ({ ok: true }) };
};

console.log('1. Тохируулаагүй үед');
let r = await call({ name: 'Бараат', phone: '99112233' }, {});
ok(r.code === 501, 'тохируулаагүй бол 501 буцаана');
ok(!JSON.stringify(r.body).includes('TELEGRAM'), 'хариунд нууц нэр ч алга');

console.log('2. Хэвийн захиалга');
sent.length = 0;
r = await call({ name: 'Бараат', phone: '99112233', service: 'Бичлэг', message: 'Сайн уу' }, ENV);
ok(r.code === 200 && r.body.ok, 'амжилттай');
ok(sent.length === 1 && sent[0].url.includes(TOKEN), 'түлхүүр зөвхөн серверээс хэрэглэгдсэн');
ok(sent[0].body.chat_id === '999', 'чат нь серверийн тохиргооноос');
ok(/Бараат/.test(sent[0].body.text) && /99112233/.test(sent[0].body.text), 'мэдээлэл дамжсан');
ok(sent[0].body.parse_mode === undefined, 'parse_mode хэрэглээгүй — текст эвдэрэхгүй');

console.log('3. Хэрэглэгч чатыг сольж чадахгүй');
sent.length = 0;
r = await call({ name: 'Муу', phone: '1', chat_id: '111', chatId: '111', token: 'x' }, ENV);
ok(sent[0].body.chat_id === '999', 'хүсэлт дэх chat_id үл тоогдсон');
ok(!JSON.stringify(sent[0].body).includes('111'), 'өөр чат руу огт явуулаагүй');

console.log('4. Шаардлагатай талбар ба хавх');
r = await call({ phone: '99112233' }, ENV);
ok(r.code === 400, 'нэргүй бол 400');
r = await call({ name: 'A' }, ENV);
ok(r.code === 400, 'утасгүй бол 400');
sent.length = 0;
r = await call({ name: 'Робот', phone: '1', website: 'http://spam' }, ENV);
ok(r.code === 200 && sent.length === 0, 'робот дуугүй хаягдсан');

console.log('5. Текст цэвэрлэлт ба хязгаар');
sent.length = 0;
await call({ name: 'A\u0000\u001bB', phone: '1', message: 'x'.repeat(5000) }, ENV);
ok(!/[\u0000-\u0009\u000b-\u001f]/.test(sent[0].body.text), 'удирдах тэмдэг арилсан (мөр таслахаас бусад)');
ok(sent[0].body.text.length <= 4000, 'урт нь хязгаарлагдсан');
sent.length = 0;
await call({ name: 'A', phone: '1', message: '*тод* [холбоос](http://a) <b>' }, ENV);
ok(/\*тод\*/.test(sent[0].body.text), 'тэмдэгт тэр чигээрээ үлдсэн (тайлбарлагдаагүй)');

console.log('6. Хурдны хязгаар');
let last = null;
globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) });
for (let i = 0; i < 6; i++) {
  last = await call({ name: 'A', phone: '1' },
    Object.assign({ ORDER_RATE_MAX: '3' }, ENV), null, i > 0);
}
ok(last.code === 429, 'хэт олон бол 429');
ok(/хүлээ/i.test(last.body.error), 'монголоор ойлгомжтой хэлсэн');

console.log('7. Telegram алдаа гарвал');
globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({ description: 'Unauthorized: bot token is invalid' }) });
r = await call({ name: 'A', phone: '1' }, ENV);
ok(r.code === 502, '502 буцаасан');
ok(!/token|Unauthorized/i.test(JSON.stringify(r.body)), 'Telegram-ийн алдааг хэрэглэгчид дамжуулаагүй');
globalThis.fetch = realFetch;

console.log('8. Хуудсанд нууц түлхүүр үлдээгүй');
for (const f of ['index.html', 'index2.html', 'order.js']) {
  const src = readFileSync(ROOT + f, 'utf8');
  ok(!/api\.telegram\.org/.test(src), f + ' — Telegram руу шууд хандахаа больсон');
  ok(!/\d{8,}:[A-Za-z0-9_-]{30,}/.test(src), f + ' — ботын түлхүүр алга');
  ok(!/chat_id/.test(src), f + ' — чатын дугаар алга');
}

console.log('8б. Түлхүүр буруу наалдсан үед');
globalThis.fetch = async (url, opt) => { sent.push({ url, body: JSON.parse(opt.body) }); return { ok: true, status: 200, json: async () => ({ ok: true }) } };
const GOOD = TOKEN;
sent.length = 0;
r = await call({ name: 'A', phone: '1' }, { TELEGRAM_BOT_TOKEN: ' ' + GOOD + '\n', TELEGRAM_CHAT_ID: ' 5887820817 ' });
ok(r.code === 200, 'хоосон зай, мөр таслалттай ч ажилласан');
ok(sent[0] && sent[0].url.indexOf(GOOD) > 0 && !/\s/.test(sent[0].url), 'хаяг цэвэр — зай үлдээгүй');
ok(sent[0] && sent[0].body.chat_id === '5887820817', 'чатын дугаар цэвэрлэгдсэн');
sent.length = 0;
r = await call({ name: 'A', phone: '1' }, { TELEGRAM_BOT_TOKEN: '"' + GOOD + '"', TELEGRAM_CHAT_ID: '5887820817' });
ok(r.code === 200 && sent.length === 1, 'хашилттай хуулсан ч ажилласан');
sent.length = 0;
r = await call({ name: 'A', phone: '1' }, { TELEGRAM_BOT_TOKEN: 'буруу-түлхүүр', TELEGRAM_CHAT_ID: '5887820817' });
ok(r.code === 502 && sent.length === 0, 'хэлбэр буруу бол Telegram руу дэмий залгахгүй');
sent.length = 0;
r = await call({ name: 'A', phone: '1' }, { TELEGRAM_BOT_TOKEN: GOOD, TELEGRAM_CHAT_ID: 'хаяг' });
ok(r.code === 502 && sent.length === 0, 'чатын дугаар буруу бол мөн зогсоно');
globalThis.fetch = realFetch;

console.log('8в. Шалгах хуудас (GET /api/order)');
async function get(env, telegram) {
  for (const k of ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']) delete process.env[k];
  Object.assign(process.env, env || {});
  delete require.cache[require.resolve(ROOT + 'api/order.js')];
  const handler = require(ROOT + 'api/order.js');
  globalThis.fetch = telegram || (async () => ({ ok: true, status: 200, json: async () => ({ ok: true, result: { username: 'test_bot' } }) }));
  const res = mkRes();
  await handler({ method: 'GET', headers: {}, socket: {} }, res);
  globalThis.fetch = realFetch;
  return res;
}
let h = await get({});
ok(h.code === 200 && /TELEGRAM_BOT_TOKEN/.test(h.body['дүгнэлт']), 'түлхүүр байхгүйг хэлсэн');
h = await get({ TELEGRAM_BOT_TOKEN: TOKEN });
ok(/TELEGRAM_CHAT_ID/.test(h.body['дүгнэлт']), 'чатын дугаар байхгүйг хэлсэн');
h = await get({ TELEGRAM_BOT_TOKEN: 'богино', TELEGRAM_CHAT_ID: '999' });
ok(/хэлбэр буруу/.test(h.body['дүгнэлт']), 'хэлбэр буруугийн хэлсэн');
h = await get(ENV, async () => ({ ok: false, status: 401, json: async () => ({ ok: false, description: 'Unauthorized' }) }));
ok(/хүлээж авахгүй/.test(h.body['дүгнэлт']), 'үхсэн түлхүүрийг хэлсэн');
ok(h.body.telegram === 'Unauthorized', 'Telegram-ийн шалтгааныг дамжуулсан');
let n = 0;
h = await get(ENV, async () => {
  n++;
  return n === 1
    ? { ok: true, status: 200, json: async () => ({ ok: true, result: { username: 'first_studio_bot' } }) }
    : { ok: false, status: 400, json: async () => ({ ok: false, description: 'Bad Request: chat not found' }) };
});
ok(/бичиж чадахгүй/.test(h.body['дүгнэлт']), 'START дараагүйг олсон');
ok(/START/.test(h.body['заавар']) && /first_studio_bot/.test(h.body['заавар']), 'ботын нэрээр зааж өгсөн');
h = await get(ENV);
ok(/зөв/.test(h.body['дүгнэлт']), 'бүх зүйл зөв үед тэгж хэлсэн');
ok(h.body['бот'] === '@test_bot', 'ботын нэрийг харуулсан');
ok(!JSON.stringify(h.body).includes(TOKEN), 'ХАРИУНД ТҮЛХҮҮР ОГТ АЛГА');

console.log('9. Хоёр хуудас дээр жинхэнэ хөтчөөр');
let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright/index.js']) {
  try { const m = await import(p); chromium = m.chromium || (m.default && m.default.chromium); break } catch (e) { }
}
if (!chromium) {
  console.log('  ⏭  Playwright алга — хөтчийн шалгалтыг алгаслаа');
} else {
  const { server, PORT, orders } = await import('./mock-server.mjs');
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch({
    executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  });
  const PAGES = [
    { file: 'index.html', name: '.contact-form input', fill: async p => {
        const i = await p.$$('.contact-form input');
        await i[0].fill('Бараат'); await i[1].fill('99114151'); await i[2].fill('Бичлэг');
        await p.fill('.contact-form textarea', 'Сайн уу');
        await p.click('.contact-form .submit-btn');
      } },
    { file: 'index2.html', fill: async p => {
        await p.evaluate(() => go('s-contact'));   /* энэ хуудас хэсэг хэсгээрээ нээгддэг */
        await p.waitForTimeout(400);
        await p.fill('#f-name', 'Бараат'); await p.fill('#f-phone', '99114151');
        await p.selectOption('#f-service', { index: 1 });
        await p.fill('#f-msg', 'Сайн уу');
        await p.click('.form-submit');
      } },
  ];
  for (const P of PAGES) {
    orders.length = 0;
    const page = await browser.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    const alerts = [];
    page.on('dialog', d => { alerts.push(d.message()); d.accept(); });
    const outbound = [];
    page.on('request', rq => outbound.push(rq.url()));
    await page.goto('http://localhost:' + PORT + '/' + P.file);
    await page.waitForTimeout(400);
    await P.fill(page);
    await page.waitForTimeout(600);
    ok(errs.length === 0, P.file + ' — JS алдаагүй' + (errs[0] ? ': ' + errs[0] : ''));
    ok(!outbound.some(u => /api\.telegram\.org/.test(u)), P.file + ' — Telegram руу ШУУД хандаагүй');
    ok(orders.length === 1, P.file + ' — өөрсдийн сервер рүү илгээсэн');
    if (orders[0]) {
      ok(orders[0].name === 'Бараат' && orders[0].phone === '99114151', P.file + ' — мэдээлэл зөв');
      ok(orders[0].website === '', P.file + ' — робот барих хавх хоосон');
      ok(orders[0].chat_id === undefined, P.file + ' — чат сонгох талбар явуулаагүй');
    }
    ok(alerts.some(a => /амжилттай/.test(a)), P.file + ' — амжилтыг хэлсэн');
    /* Сервер тохируулаагүй бол утас, имэйлээ харуулах ёстой */
    process.env.ORDER_FAIL = '501';
    alerts.length = 0;
    await P.fill(page);
    await page.waitForTimeout(600);
    ok(alerts.some(a => /9114 1516/.test(a) && /1ststudio\.mn/.test(a)),
      P.file + ' — сервергүй үед утас, имэйлээ харуулсан');
    delete process.env.ORDER_FAIL;
    await page.close();
  }
  await browser.close();
  server.close();
}

console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
