/* Claude-гүйгээр UI-г шалгах жижиг сервер.
   Статик файл + /api/claude хуурамч хариу.
   Ажиллуулах:  node tools/test/mock-server.mjs [порт] */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const PORT = +(process.argv[2] || process.env.MOCK_PORT || 8137);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml'
};

/* Хуурамч Claude — ирсэн текстээс ямар даалгавар болохыг таана */
export function fakeReply(body) {
  const msg = ((body.messages || [])[0] || {}).content || '';
  if (/Reply with: ok/.test(msg)) return 'ok';
  if (/Propose THREE/.test(msg)) {
    return JSON.stringify([
      { title: 'Дотно ойрын кадр', command: 'close-up then dolly in, slow', duration: 7, people: 2, env: 'night', why: 'Сэтгэл хөдлөлийг ойроос харуулна.' },
      { title: 'Өргөн, удаан тойрог', command: 'wide shot then orbit 180 degrees clockwise, slow', duration: 12, people: 2, env: 'dusk', why: 'Орчныг бүтнээр нь танилцуулна.' },
      { title: 'Эрч хүчтэй', command: 'handheld then whip pan then push in, fast', duration: 3, people: 2, env: 'noir', why: 'Хурцадмал мэдрэмж төрүүлнэ.' }
    ]);
  }
  if (/Return JSON exactly like|Give a DIFFERENT treatment/.test(msg)) {
    return '```json\n' + JSON.stringify({
      command: 'wide shot then orbit 90 degrees clockwise then dolly in, slow',
      duration: 8, people: 2, env: 'dusk',
      scene: 'two riders on the open steppe at dusk',
      explain: 'Эхлээд холоос өргөн харуулаад, дараа нь баруун тийш тойрч аажим ойртоно. Ингэснээр орчин болон баатар хоёуланг нь үзүүлнэ.'
    }) + '\n```';
  }
  if (/Rewrite it as one polished/.test(msg)) {
    return 'A cinematic wide shot of two Mongolian riders on the open steppe at dusk, the camera slowly orbiting clockwise before easing into a gentle push-in, warm low sun raking across dry grass, 35mm anamorphic, shallow depth of field, fine film grain.';
  }
  if (/нэр томъёо/.test(msg)) {
    return 'Богино тайлбар.\n\nЯагаад хэрэгтэй вэ гэдгийн тухай.\n\nЖишээ нь морь унасан хүн шиг.';
  }
  return 'ok';
}

export const orders = [];
const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.url.split('?')[0] === '/api/claude') {
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    let raw = '';
    for await (const c of req) raw += c;
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (e) { }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (process.env.MOCK_NOPROXY) {
      res.writeHead(501);
      res.end(JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY тохируулаагүй байна.' } }));
      return;
    }
    if (body.ping) { res.end(JSON.stringify({ ok: true, model: 'claude-sonnet-5' })); return; }
    if (process.env.MOCK_FAIL) {
      res.writeHead(+process.env.MOCK_FAIL);
      res.end(JSON.stringify({ error: { message: 'mock failure' } }));
      return;
    }
    res.end(JSON.stringify({
      content: [{ type: 'text', text: fakeReply(body) }],
      usage: { input_tokens: 120, output_tokens: 240 }
    }));
    return;
  }
  if (req.url.split('?')[0] === '/api/order') {
    let raw = '';
    for await (const c of req) raw += c;
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch (e) { }
    orders.push(body);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (process.env.ORDER_FAIL) {
      res.writeHead(+process.env.ORDER_FAIL);
      res.end(JSON.stringify({ error: 'тохируулаагүй байна' }));
      return;
    }
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  const path = decodeURIComponent(req.url.split('?')[0]);
  const rel = normalize(path === '/' ? '/camera.html' : path).replace(/^(\.\.[/\\])+/, '');
  try {
    const data = await readFile(join(ROOT, rel));
    res.setHeader('Content-Type', TYPES[extname(rel)] || 'application/octet-stream');
    res.end(data);
  } catch (e) { res.writeHead(404).end('not found'); }
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  server.listen(PORT, () => console.log('mock server → http://localhost:' + PORT));
}
export { server, PORT };
