/* app.js дотор шингэсэн BLENDER_TPL-ийг гаргаж, exportPY-тай ЯГ ижил
   орлуулалт хийж, үүссэн Python-ийг шалгах жижиг тэнхим. */
const fs = require('fs'), path = require('path'), os = require('os');
const OUTDIR = process.env.TPLOUT || fs.mkdtempSync(path.join(os.tmpdir(), '1st-py-'));
const OUT = f => path.join(OUTDIR, f);
module.exports = module.exports || {};
function tpl() {
  const src = fs.readFileSync(require('path').join(__dirname, '..', '..', 'app.js'), 'utf8');
  const a = src.indexOf('const BLENDER_TPL = [');
  const b = src.indexOf("].join('\\n');", a);
  if (a < 0 || b < 0) throw new Error('BLENDER_TPL not found');
  return eval(src.slice(a + 'const BLENDER_TPL = '.length, b + "].join('\\n')".length));
}
/* pyNum / pyStr / pyName-ийг app.js-ээс ЯГ ТЭР ХЭВЭЭР нь авч шалгана */
function fromApp(names) {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
  let code = '';
  for (const n of names) {
    const a = src.indexOf('function ' + n + '(');
    if (a < 0) throw new Error('app.js дотроос ' + n + ' олдсонгүй');
    let i = src.indexOf('{', a), depth = 0, j = i;
    for (; j < src.length; j++) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') { depth--; if (!depth) break; }
    }
    code += src.slice(a, j + 1) + '\n';
  }
  return new Function(code + 'return {' + names.join(',') + '};')();
}
const { pyNum, pyStr, pyName } = fromApp(['pyNum', 'pyStr', 'pyName']);

function render(o) {
  o = o || {};
  let py = tpl();
  const put = (tag, val) => { const rx = new RegExp('^[ \\t]*.*#@' + tag + '$', 'm'); if (!rx.test(py)) return; py = py.replace(rx, () => val); };
  const ar = o.aspect ?? 16 / 9;
  const resX = ar >= 1 ? 1920 : Math.max(2, Math.round(1080 * ar) & ~1);
  const resY = ar >= 1 ? Math.max(2, Math.round(1920 / ar) & ~1) : 1080;
  put('DATE', '#  Үүсгэсэн: 2026-09-20T00:00:00.000Z');
  put('FPS', 'FPS          = ' + (o.fps ?? 24));
  put('FRAME_START', 'FRAME_START  = ' + (o.fStart ?? 1));
  put('FRAME_END', 'FRAME_END    = ' + (o.fEnd ?? 120));
  put('RES_X', 'RES_X        = ' + resX);
  put('RES_Y', 'RES_Y        = ' + resY);
  put('INTERP', 'INTERPOLATION = "' + (o.interp ?? 'BEZIER') + '"');
  put('KEYS', o.kdata ?? ('    (1, (' + [0, -4, 1.6].map(pyNum).join(', ') + '), (0.707107, 0.707107, 0.0, 0.0), (0.0, 0.0, 1.05), 35.0),'));
  put('SUBJECTS', o.pdata ?? ('    (' + pyName('Subject_01') + ', 0.0, 0.0, 0.0, 1.0),'));
  put('PROPS', o.rdata ?? ('    (' + pyName('chair_01') + ', "box", 1.2, 0.4, 0.0, 0.3, 1.0, 0.8, 0.8, 0.9),'));
  const pr = (o.promptTxt ?? 'Slow orbit.').replace(/\r\n?/g, '\n');
  put('PROMPT', pr ? pr.split('\n').map(l => '    ' + pyStr(l) + ',').join('\n') : '');
  return py;
}
module.exports = { render, pyNum, pyStr, pyName, OUTDIR, OUT };
if (require.main === module) { fs.writeFileSync(OUT('sample-export.py'), render({})); console.log('ok'); }
