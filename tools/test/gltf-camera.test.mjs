/* Blender-ээс камер (ShotCam) агуулсан .glb/.gltf оруулахад камер нь 3D загвар биш,
   ТҮЛХҮҮР КАДР болж орж ирэхийг шалгана (onGltfLoaded).
   glTF 2.0 файлуудыг энд Node дээр гараар угсарна (buffer нь base64 data: URI).
   Playwright байхгүй бол алгасна. */

let chromium;
for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright/index.js']) {
  try { const m = await import(p); chromium = m.chromium || (m.default && m.default.chromium); break } catch (e) { }
}
if (!chromium) { console.log('⏭  Playwright алга — glTF камерын тестийг алгаслаа'); process.exit(0); }

const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const HERE = new URL('.', import.meta.url).pathname;
const ROOT = HERE.replace(/tools\/test\/$/, '');
const PAGE = 'file://' + ROOT + 'camera.html';

let bad = 0;
const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) bad++ };
const near = (a, b, e) => Math.abs(a - b) < e;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const fmt = v => '(' + v.map(x => (+x).toFixed(3)).join(', ') + ')';

/* ── glTF угсрагч ── */
function binBuilder() {
  const parts = []; let len = 0;
  return {
    add(typed) {
      while (len % 4) { parts.push(Buffer.from([0])); len++; }
      const off = len;
      parts.push(Buffer.from(typed.buffer, typed.byteOffset, typed.byteLength));
      len += typed.byteLength;
      return { off, n: typed.byteLength };
    },
    done() { return Buffer.concat(parts); }
  };
}
const TYPES = { 1: 'SCALAR', 3: 'VEC3', 4: 'VEC4' };

/**
 * opts: { cube, cams:[{name, extras, translation, rotation, yfov, ortho}],
 *         target:{translation, extras}, anim:{node, times, translations, rotations},
 *         subject:bool, light:bool }
 */
function buildGltf(o) {
  const bb = binBuilder();
  const bufferViews = [], accessors = [];
  const acc = (typed, comp, count, ctype, extra) => {
    const { off, n } = bb.add(typed);
    bufferViews.push({ buffer: 0, byteOffset: off, byteLength: n });
    accessors.push(Object.assign({ bufferView: bufferViews.length - 1, componentType: ctype, count, type: TYPES[comp] }, extra || {}));
    return accessors.length - 1;
  };
  const nodes = [], meshes = [], cameras = [], animations = [];
  const g = { asset: { version: '2.0', generator: 'test' }, scene: 0, scenes: [{ nodes: [] }], nodes, meshes, accessors, bufferViews, buffers: [] };
  let cubeMesh = -1;
  if (o.cube || o.subject) {
    /* 1×1×1 шоо, x,z ∈ [−.5,.5], y ∈ [0,1] — placeModel-ийн хувиргалт identity болно */
    const P = [], I = [];
    for (let i = 0; i < 8; i++) P.push((i & 1) ? .5 : -.5, (i & 2) ? 1 : 0, (i & 4) ? .5 : -.5);
    const faces = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
    faces.forEach(f => I.push(f[0], f[1], f[2], f[0], f[2], f[3]));
    const pa = acc(new Float32Array(P), 3, 8, 5126, { min: [-.5, 0, -.5], max: [.5, 1, .5] });
    const ia = acc(new Uint16Array(I), 1, 36, 5123);
    meshes.push({ name: 'Cube', primitives: [{ attributes: { POSITION: pa }, indices: ia }] });
    cubeMesh = 0;
  }
  if (o.cube) { nodes.push({ name: 'Cube', mesh: cubeMesh }); g.scenes[0].nodes.push(nodes.length - 1); }
  (o.cams || []).forEach(c => {
    cameras.push(c.ortho
      ? { type: 'orthographic', name: c.name, orthographic: { xmag: 1, ymag: 1, znear: .1, zfar: 100 } }
      : { type: 'perspective', name: c.name, perspective: { yfov: c.yfov || .6, znear: .1, zfar: 100 } });
    const nd = { name: c.name, camera: cameras.length - 1, translation: c.translation, rotation: c.rotation };
    if (c.extras) nd.extras = c.extras;
    nodes.push(nd); g.scenes[0].nodes.push(nodes.length - 1);
  });
  if (o.target) {
    const nd = { name: 'CAM_TARGET_REF', translation: o.target.translation };
    if (o.target.extras) nd.extras = o.target.extras;
    nodes.push(nd); g.scenes[0].nodes.push(nodes.length - 1);
  }
  if (o.subject) {
    nodes.push({ name: 'Subject_01', mesh: cubeMesh, translation: [4, 0, 0], extras: { '1st_role': 'subject' } });
    g.scenes[0].nodes.push(nodes.length - 1);
  }
  if (o.light) {
    g.extensionsUsed = ['KHR_lights_punctual'];
    g.extensions = { KHR_lights_punctual: { lights: [{ type: 'point', color: [1, .5, .2], intensity: 500, name: 'Lamp' }] } };
    nodes.push({ name: 'Lamp', translation: [0, 3, 0], extensions: { KHR_lights_punctual: { light: 0 } } });
    g.scenes[0].nodes.push(nodes.length - 1);
  }
  if (o.anim) {
    const a = o.anim, ni = nodes.findIndex(n => n.name === a.node);
    const ta = acc(new Float32Array(a.times), 1, a.times.length, 5126, { min: [a.times[0]], max: [a.times[a.times.length - 1]] });
    const pa = acc(new Float32Array(a.translations.flat()), 3, a.times.length, 5126);
    const ra = acc(new Float32Array(a.rotations.flat()), 4, a.times.length, 5126);
    animations.push({
      name: a.node + 'Action',
      channels: [{ sampler: 0, target: { node: ni, path: 'translation' } }, { sampler: 1, target: { node: ni, path: 'rotation' } }],
      samplers: [{ input: ta, output: pa, interpolation: 'LINEAR' }, { input: ta, output: ra, interpolation: 'LINEAR' }]
    });
  }
  if (cameras.length) g.cameras = cameras;
  if (animations.length) g.animations = animations;
  const buf = bb.done();
  if (buf.length) g.buffers.push({ byteLength: buf.length, uri: 'data:application/octet-stream;base64,' + buf.toString('base64') });
  else delete g.buffers;
  return JSON.stringify(g);
}

/* ── хөтөч ── */
const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_CERT|fonts\.g/.test(m.text())) errs.push(m.text()); });
await page.goto(PAGE);
await page.waitForTimeout(1200);

/* Хуудсан дээр GLTFLoader-оор задлаад onGltfLoaded-ыг дуудна */
const load = (json, name) => page.evaluate(([json, name]) => new Promise(res => {
  new THREE.GLTFLoader().parse(json, '', g => { try { onGltfLoaded(g, name); res(true); } catch (e) { res('EXC ' + e.message); } }, e => res('ERR ' + String(e && e.message || e)));
}), [json, name]);
const snap = () => page.evaluate(() => ({
  n: keys.length, fStart, fEnd, fps, interp, autoTarget, props: props.length,
  models: props.filter(p => p.userData.kind === 'model').length,
  toast: document.getElementById('toast').textContent, toastCls: document.getElementById('toast').className,
  histI, histLen: hist.length,
  k0: keys.length ? { p: posOf(keys[0]).toArray(), t: keys[0].target.toArray(), fov: keys[0].fov, roll: keys[0].roll, frame: keys[0].frame } : null,
  kl: keys.length ? { p: posOf(keys[keys.length - 1]).toArray(), frame: keys[keys.length - 1].frame } : null,
  frames: keys.map(k => k.frame)
}));
/* Камерын квартернион = applyCam-тай адил: up=Y, lookAt(T), rotateZ(roll) */
const quatOf = (P, T, roll) => page.evaluate(([P, T, roll]) => {
  const c = new THREE.PerspectiveCamera(); c.position.set(P[0], P[1], P[2]); c.up.set(0, 1, 0);
  c.lookAt(new THREE.Vector3(T[0], T[1], T[2])); c.rotateZ(roll); return c.quaternion.toArray();
}, [P, T, roll]);

/* ═══ A. Анимацитай ShotCam + CAM_TARGET_REF + Cube ═══ */
console.log('A. Анимацитай камер + бай + загвар');
const TGT = [0, .5, 0], ROLL = .3, YFOV = .6;
const KP = [[3, 1.5, 4], [0, 2, 5], [-3, 1.5, 4]], KT = [0, 1, 2];
const KQ = [];
for (const P of KP) KQ.push(await quatOf(P, TGT, ROLL));
const jsonA = buildGltf({
  cube: true, target: { translation: TGT, extras: { '1st_role': 'target' } },
  cams: [{ name: 'ShotCam', extras: { '1st_role': 'cam' }, translation: KP[0], rotation: KQ[0], yfov: YFOV }],
  anim: { node: 'ShotCam', times: KT, translations: KP, rotations: KQ }
});
const before = await page.evaluate(() => {
  clearScene();
  fStart = 1; fEnd = 120; document.getElementById('fStart').value = 1; document.getElementById('fEnd').value = 120;
  interp = 'smooth'; document.getElementById('interp').value = 'smooth';
  const a = cloneS(state); a.frame = 1; const b = cloneS(state); b.theta += 1; b.frame = 60;
  keys = [a, b]; activeK = 0; syncAll(); commit('тест эхлэл', true);
  return { keys: JSON.stringify(keys.map(k => [k.theta, k.phi, k.radius, k.fov, k.roll, k.target.toArray(), k.frame])), histI, props: props.length };
});
const rA = await load(jsonA, 'shot.glb');
ok(rA === true, 'файл задарч onGltfLoaded ажиллав' + (rA === true ? '' : ': ' + rA));
const A = await snap();
const FPS = A.fps;
ok(A.n >= 3 && A.n <= 24, 'кадрын тоо 3..24: ' + A.n);
ok(A.fEnd - A.fStart === Math.round(2 * FPS), 'fEnd−fStart = ' + Math.round(2 * FPS) + ' (2 сек × ' + FPS + ' fps): ' + (A.fEnd - A.fStart));
ok(A.k0 && dist(A.k0.p, KP[0]) < 1e-3, 'эхний кадрын байрлал = P0 ' + fmt(A.k0.p));
ok(A.k0 && dist(A.k0.t, TGT) < 1e-3, 'эхний кадрын бай = CAM_TARGET_REF ' + fmt(A.k0.t));
ok(A.k0 && near(A.k0.fov, YFOV * 180 / Math.PI, .05), 'fov = ' + (YFOV * 180 / Math.PI).toFixed(2) + '°: ' + A.k0.fov.toFixed(3));
ok(A.k0 && near(A.k0.roll, ROLL, .01), 'roll = ' + ROLL + ': ' + A.k0.roll.toFixed(4));
ok(A.kl && dist(A.kl.p, KP[2]) < 1e-3, 'сүүлийн кадр = P(2с) ' + fmt(A.kl.p));
ok(A.k0.frame === A.fStart && A.kl.frame === A.fEnd, 'кадрууд fStart..fEnd мужид: ' + A.frames.join(','));
ok(A.frames.every((f, i) => !i || f > A.frames[i - 1]), 'фреймүүд эрс өсөж байна');
ok(A.interp === 'linear', 'интерполяци linear');
ok(A.autoTarget === false, 'auto-target унтарсан');
ok(A.models === before.props + 1 && A.props === before.props + 1, 'загвар яг 1-ээр нэмэгдэв');
ok(A.histI === before.histI + 1, 'нэг commit (undo алхам) бүртгэгдэв');
ok(/камер орлоо/.test(A.toast) && /ok/.test(A.toastCls), 'toast: ' + A.toast);
/* Үнэнч байдал: дундах фреймүүд дээр байрлал шугаман интерполяцитай ±5см */
const Pt = t => { const i = Math.min(Math.floor(t), 1), u = t - i; return KP[i].map((v, k) => v + (KP[i + 1][k] - v) * u); };
for (const t of [.5, 1, 1.5]) {
  const f = A.fStart + t * FPS;
  const p = await page.evaluate(f => posOf(sampleFrame(f)).toArray(), f);
  ok(dist(p, Pt(t)) < .05, 't=' + t + 'с (фрейм ' + f + '): ' + fmt(p) + ' ≈ ' + fmt(Pt(t)) + ' · зөрүү ' + dist(p, Pt(t)).toFixed(4));
}
const undone = await page.evaluate(() => {
  undo();
  return { keys: JSON.stringify(keys.map(k => [k.theta, k.phi, k.radius, k.fov, k.roll, k.target.toArray(), k.frame])), props: props.length, interp };
});
ok(undone.keys === before.keys, 'Ctrl+Z хуучин кадруудыг сэргээв');
ok(undone.props === before.props, 'Ctrl+Z загварыг ч буцаав');

/* ═══ B. Зөвхөн камер (mesh-гүй) ═══ */
console.log('B. Зөвхөн камертай файл');
const jsonB = buildGltf({
  cams: [{ name: 'ShotCam', extras: { '1st_role': 'cam' }, translation: KP[0], rotation: KQ[0], yfov: YFOV }],
  anim: { node: 'ShotCam', times: KT, translations: KP, rotations: KQ }
});
const bB = await snap();
const rB = await load(jsonB, 'cam-only.glb');
const B = await snap();
ok(rB === true, 'задарлаа');
ok(B.props === bB.props, 'props өөрчлөгдөөгүй (' + B.props + ')');
ok(B.n >= 3 && dist(B.k0.p, KP[0]) < 1e-3, 'кадрууд орсон: ' + B.n);
ok(!/err/.test(B.toastCls) && /камер орлоо/.test(B.toast), '«хэлбэр алга» алдаа гараагүй: ' + B.toast);
ok(errs.length === 0, 'JS алдаагүй');

/* ═══ C. Камергүй загвар ═══ */
console.log('C. Камергүй загвар (хуучин зам)');
const jsonC = buildGltf({ cube: true });
const bC = await snap();
const rC = await load(jsonC, 'cube.glb');
const C = await snap();
ok(rC === true, 'задарлаа');
ok(JSON.stringify(C.frames) === JSON.stringify(bC.frames) && C.n === bC.n, 'кадрууд өөрчлөгдөөгүй');
ok(C.props === bC.props + 1 && C.models === bC.models + 1, 'props +1');
ok(/орлоо/.test(C.toast) && /ok/.test(C.toastCls), 'toast: ' + C.toast);

/* ═══ D. Хасалт: subject mesh + гэрэл ═══ */
console.log('D. Лавлах объект ба гэрлийг хасах');
const jsonD = buildGltf({
  cube: true, subject: true, light: true,
  cams: [{ name: 'ShotCam', extras: { '1st_role': 'cam' }, translation: KP[0], rotation: KQ[0], yfov: YFOV }]
});
const lightsBefore = await page.evaluate(() => { let n = 0; scene.traverse(o => { if (o.isLight) n++; }); return n; });
const rD = await load(jsonD, 'lit.glb');
const D = await page.evaluate(() => {
  const g = props[props.length - 1];
  const sz = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).toArray();
  let lights = 0; scene.traverse(o => { if (o.isLight) lights++; });
  let lamp = false, subj = false; g.traverse(o => { if (o.isLight || o.name === 'Lamp') lamp = true; if (/^Subject_01/.test(o.name) || o.userData['1st_role'] === 'subject') subj = true; });
  return { sz, lights, lamp, subj, kind: g.userData.kind };
});
ok(rD === true && D.kind === 'model', 'загвар орлоо');
ok(D.sz.every(v => near(v, 1, 1e-3)), 'загварын хэмжээ = зөвхөн Cube ' + fmt(D.sz));
ok(D.lights === lightsBefore && !D.lamp, 'файлын гэрэл тайзанд ороогүй (' + D.lights + ' = ' + lightsBefore + ')');
ok(!D.subj, 'subject mesh загварын бүлэгт алга');

/* ═══ E. Хөдөлгөөнгүй камер ═══ */
console.log('E. Хөдөлгөөнгүй камер');
const jsonE = buildGltf({ cams: [{ name: 'ShotCam', translation: [2, 1, 6], rotation: await quatOf([2, 1, 6], [0, 1, 0], 0), yfov: .5 }] });
await page.evaluate(() => {
  fStart = 5; fEnd = 77; document.getElementById('fStart').value = 5; document.getElementById('fEnd').value = 77;
  interp = 'smooth'; document.getElementById('interp').value = 'smooth'; syncAll();
});
const rE = await load(jsonE, 'static.glb');
const E = await snap();
ok(rE === true && E.n === 1, 'нэг кадр: ' + E.n);
ok(E.k0 && E.k0.frame === 5, 'кадр fStart дээр (5): ' + (E.k0 && E.k0.frame));
ok(E.fStart === 5 && E.fEnd === 77 && E.interp === 'smooth', 'фрейм муж, интерполяци хэвээр: ' + E.fStart + '..' + E.fEnd + ' ' + E.interp);
ok(E.k0 && dist(E.k0.p, [2, 1, 6]) < 1e-3, 'байрлал зөв ' + fmt(E.k0.p));
ok(/хөдөлгөөнгүй/.test(E.toast), 'toast: ' + E.toast);

/* ═══ F. Roll урвуу хувиргалт ═══ */
console.log('F. Roll: applyCam → rollFromQuat');
const F = await page.evaluate(() => [-.6, 0, .45].map(roll => {
  const s = { theta: .7, phi: 1.2, radius: 5, fov: 40, roll, target: new THREE.Vector3(.3, 1.1, -.2) };
  const c = new THREE.PerspectiveCamera(); applyCam(c, s); c.updateMatrixWorld(true);
  const P = posOf(s);
  /* томьёо: dq = lookAt(P→T)⁻¹ · Q,  roll = 2·atan2(dq.z, dq.w) */
  const l = new THREE.PerspectiveCamera(); l.position.copy(P); l.up.set(0, 1, 0); l.lookAt(s.target);
  const dq = l.quaternion.clone().invert().multiply(c.quaternion);
  let r = 2 * Math.atan2(dq.z, dq.w); while (r > Math.PI) r -= 2 * Math.PI; while (r < -Math.PI) r += 2 * Math.PI;
  return { roll, r, app: rollFromQuat(P, s.target, c.quaternion), pure: Math.abs(dq.x) + Math.abs(dq.y) };
}));
F.forEach(x => ok(near(x.r, x.roll, 1e-6) && near(x.app, x.roll, 1e-6) && x.pure < 1e-9,
  'roll ' + x.roll + ' → ' + x.r.toFixed(7) + ' (dq цэвэр Z эргэлт)'));

/* ═══ G. Хэд хэдэн камер — нэрээр сонгох ═══ */
console.log('G. Хоёр камер, extras-гүй');
const jsonG = buildGltf({ cams: [
  { name: 'Camera', translation: [9, 9, 9], rotation: [0, 0, 0, 1], yfov: .6 },
  { name: 'ShotCam', translation: [2, 1, 6], rotation: await quatOf([2, 1, 6], [0, 1, 0], 0), yfov: .6 }] });
const rG = await load(jsonG, 'two.glb');
const G = await snap();
ok(rG === true && G.k0 && dist(G.k0.p, [2, 1, 6]) < 1e-3, 'ShotCam нэртэйг нь авав ' + fmt(G.k0.p));
ok(/2 камераас/.test(G.toast) && /ShotCam/.test(G.toast), 'toast тоо, нэрийг хэлэв: ' + G.toast);

await browser.close();
if (errs.length) { console.log('  ✗ JS алдаа: ' + errs.slice(0, 3).join(' | ')); bad++ }
console.log();
console.log(bad ? 'УНАСАН: ' + bad + ' ❌' : 'БҮГД ТЭНЦЛЭЭ ✅');
process.exit(bad ? 1 : 0);
