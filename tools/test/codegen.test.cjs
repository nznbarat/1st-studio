/* Ирмэгийн тохиолдол бүрд ЗӨВ Python үүсч байгааг шалгана.
   (Өмнө нь NaN, Infinity, хашилтаар төгссөн промт скриптийг унагадаг байсан.) */
const { render, pyNum, pyStr, pyName, pyInt, OUT } = require('./pygen.cjs');
const fs = require('fs'), cp = require('child_process');

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++; };

console.log('1. Тоо хөрвүүлэлт');
ok(pyNum(NaN) === '0.0', 'NaN → 0.0');
ok(pyNum(Infinity) === '0.0', 'Infinity → 0.0');
ok(pyNum(-Infinity) === '0.0', '-Infinity → 0.0');
ok(pyNum(undefined) === '0.0', 'undefined → 0.0');
ok(pyNum(-0) === '0.0', '-0 → 0.0');
ok(pyNum(3) === '3.0', 'бүхэл тоо float болно');
ok(pyNum(1.23456789) === '1.234568', '6 орон хүртэл');
ok(pyNum(1e21) === '1000000000.0', 'экспонент хэлбэр гарахгүй');
ok(pyNum(-1e21) === '-1000000000.0', 'сөрөг том тоо ч хязгаарлагдана');
ok(!/e/i.test([1e-9, 1e21, 5e-7, 1e-300].map(pyNum).join(' ')), 'ямар ч тоонд e үсэг гарахгүй');
ok(pyNum(1e-9) === '0.0', 'маш жижиг тоо 0 болно');

console.log('2. Текст хөрвүүлэлт');
ok(pyStr('a"b') === '"a\\"b"', 'хашилт escape');
ok(pyStr('a\\b') === '"a\\\\b"', 'налуу зураас escape');
ok(pyStr('a\nb') === '"a\\nb"', 'шинэ мөр escape');
ok(pyName('') === '"Object"', 'хоосон нэр');
ok(JSON.parse(pyName('x'.repeat(200))).length === 59, 'нэр 59 байтаар таслагдана');
ok(pyName('a\u0007b') === '"a b"', 'удирдах тэмдэг арилна');
ok(new TextEncoder().encode(JSON.parse(pyName('ү'.repeat(200)))).length <= 59, 'кирилл нэр 59 БАЙТ дотор');
ok(pyInt(NaN, 1, 240, 24) === '24', 'pyInt: NaN → анхдагч');
ok(pyInt(1e9, 2, 16384, 1920) === '16384', 'pyInt: дээд хязгаар');
ok(pyInt(-5, 1, 240, 24) === '1', 'pyInt: доод хязгаар');

console.log('3. Үүссэн Python бүрэн зөв эсэх');
const CASES = {
  'энгийн': {},
  'хоосон жагсаалт': { kdata: '', pdata: '', rdata: '', promptTxt: '' },
  'NaN утга': { kdata: '    (1, (' + [NaN, Infinity, -0].map(pyNum).join(', ') + '), (1.0, 0.0, 0.0, 0.0), (0.0, 0.0, 0.0), ' + pyNum(NaN) + '),' },
  'хашилтаар төгссөн промт': { promptTxt: 'баатар "' },
  'гурван хашилттай промт': { promptTxt: 'he said """hi""" ok' },
  'налуугаар төгссөн промт': { promptTxt: 'ends with \\' },
  'кирилл промт': { promptTxt: 'Удаан эргэлт — 35мм-ээс 50мм рүү' },
  'олон мөрт промт': { promptTxt: 'мөр1\r\nмөр2\rмөр3\nмөр4' },
  'Python мэт промт': { promptTxt: '""")\nimport os\nos.system("rm -rf /")\n#' },
  'хашилттай нэр': { rdata: '    (' + pyName('uid1') + ', ' + pyName('say "hi".glb_01') + ', "model", 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0),' },
  'босоо формат': { aspect: 9 / 16 },
  'дөрвөлжин': { aspect: 1 },
};
for (const [name, o] of Object.entries(CASES)) {
  const f = OUT('case.py');
  let py; try { py = render(o) } catch (e) { ok(false, name + ' — үүсгэхэд алдаа: ' + e.message); continue }
  fs.writeFileSync(f, py);
  const r = cp.spawnSync('python3', ['-m', 'py_compile', f], { encoding: 'utf8' });
  if (r.status !== 0) { ok(false, name + ' — Python алдаа: ' + (r.stderr || '').trim().split('\n').pop()); continue }
  const r2 = cp.spawnSync('python3', ['-c',
    'import ast,sys\n' +
    't=ast.parse(open(sys.argv[1],encoding="utf-8").read())\n' +
    'for n in t.body:\n' +
    '  if isinstance(n,ast.Assign) and getattr(n.targets[0],"id","") in ("KEYS","SUBJECTS","PROPS","FPS","RES_X","RES_Y"):\n' +
    '    ast.literal_eval(n.value)\n' +
    'print("ok")', f], { encoding: 'utf8' });
  ok(r2.status === 0, name + (r2.status === 0 ? '' : ' — өгөгдөл уншигдахгүй: ' + (r2.stdout + r2.stderr).trim()));
}

console.log('4. Босоо / дөрвөлжин нягтрал тэгш тоо байх');
for (const ar of [9 / 16, 1, 16 / 9, 2.39, 4 / 5]) {
  const py = render({ aspect: ar });
  const x = +/^RES_X\s*=\s*(\d+)/m.exec(py)[1], y = +/^RES_Y\s*=\s*(\d+)/m.exec(py)[1];
  ok(x % 2 === 0 && y % 2 === 0 && x > 0 && y > 0, 'харьцаа ' + ar.toFixed(2) + ' → ' + x + '×' + y);
}

console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
