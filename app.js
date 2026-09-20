/* ══════════════════════════════════════════════════════════════
   1st Studio — Camera Director
   Blender маягийн 3D камер найруулагч + AI видео промт үүсгэгч
   ══════════════════════════════════════════════════════════════ */
'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

/* ─────────── 1. Рендерер ба тайз ─────────── */
const canvas = $('vp');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.autoClear = false;

/* renderer.outputEncoding = sRGB тул three.js өнгийг шугаман гэж үзээд гэрэлтүүлдэг.
   Blender-ийн албан ёсны өнгийг ЯГ тэр чигээр нь гаргахын тулд эхлээд шугаман
   орон зай руу хөрвүүлж өгнө. Ингэснээр дэлгэц дээрх пиксел яг #3d3d3d болно. */
const srgb = hex => new THREE.Color(hex).convertSRGBToLinear();

const scene = new THREE.Scene();
const viewCam = new THREE.PerspectiveCamera(50, 1, 0.05, 400);   // чөлөөт харагдац
const shotCam = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 400); // бичлэгийн камер

const hemi = new THREE.HemisphereLight(0x6fb7dc, 0x151a12, .55); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xf5c07a, 1.15);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
sun.shadow.camera.far = 60; sun.shadow.bias = -0.0012;
scene.add(sun);
const rim = new THREE.DirectionalLight(0x88aadd, 0.0);
rim.position.set(-6, 4, -6); scene.add(rim);

const world = new THREE.Group(); scene.add(world);        // дүр + объект
const overlay3d = new THREE.Group(); scene.add(overlay3d); // тор, тэнхлэг, гизмо

let grid = null;
function setGrid(c1, c2, exact) {
  if (grid) { overlay3d.remove(grid); grid.geometry.dispose(); }
  grid = new THREE.GridHelper(40, 40, exact ? srgb(c1) : c1, exact ? srgb(c2) : c2);
  grid.position.y = 0.001;
  grid.material.transparent = true; grid.material.opacity = .55;
  overlay3d.add(grid);
}
function axisLine(dir, color) {
  const p = dir === 'x' ? [new THREE.Vector3(-20, .002, 0), new THREE.Vector3(20, .002, 0)]
                        : [new THREE.Vector3(0, .002, -20), new THREE.Vector3(0, .002, 20)];
  overlay3d.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: .8 })));
}
/* Blender: tui.xaxis #ff3352 ба yaxis #8bdc00 -г grid_axis_brightness 0.46-аар бүдгэрүүлсэн нь */
axisLine('x', srgb(0x751726)); axisLine('z', srgb(0x406500));

const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.ShadowMaterial({ opacity: .35 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

/* ─────────── 2. Орчин ─────────── */
const ENVS = {
  /* Blender 5.2-ийн үндсэн 3D харагдац: space_view3d.back #3d3d3d (градиент УНТРААЛТТАЙ), grid #545454 */
  blender: { nm: 'Blender харагдац', bg: 0x3d3d3d, fog: [70, 260], exact: true, hemi: [0xdfdfdf, 0x2a2a2a, .72], sun: [0xffffff, 1.0, [4.5, 8, 5]], grid: [0x545454, 0x545454], sh: .22, rim: 0.08, en: 'a clean neutral grey studio backdrop with soft even lighting' },
  night: { nm: 'Шөнийн студи', bg: 0x121820, fog: [22, 70], hemi: [0x6fb7dc, 0x151a12, .55], sun: [0xf5c07a, 1.15, [5, 8, 4]], grid: [0x3a4c5e, 0x232f3a], sh: .35, rim: 0.35, en: 'a dark studio with moody rim lighting' },
  dusk:  { nm: 'Үдшийн тал',   bg: 0x2f1d22, fog: [18, 66], hemi: [0xff9a5a, 0x241410, .5],  sun: [0xff8850, 1.5, [9, 3.2, -3]], grid: [0x5a4034, 0x2f2119], sh: .42, rim: 0.18, en: 'the Mongolian steppe at golden-hour dusk' },
  snow:  { nm: 'Цасан өдөр',   bg: 0xa7bccb, fog: [24, 90], hemi: [0xe8f1f8, 0x8fa0b0, .95], sun: [0xffffff, 1.2, [4, 9, 5]],  grid: [0x7f93a4, 0xb0bfca], sh: .22, rim: 0.1,  en: 'an overcast snowfield with soft diffused light' },
  dawn:  { nm: 'Үүрийн гэгээ', bg: 0x24303f, fog: [20, 80], hemi: [0x9fc0e8, 0x2a2620, .7],  sun: [0xffd8a8, 1.05, [-8, 2.4, 6]], grid: [0x46586c, 0x28323d], sh: .3,  rim: 0.3,  en: 'cool blue dawn light with long soft shadows' },
  noir:  { nm: 'Хар цагаан',   bg: 0x0c0c0c, fog: [16, 48], hemi: [0x8899aa, 0x0a0a0a, .28], sun: [0xffffff, 2.1, [7, 5, -6]], grid: [0x2c2c2c, 0x1a1a1a], sh: .55, rim: 0.55, en: 'high-contrast black-and-white noir lighting with hard shadows' },
  void:  { nm: 'Цайвар студи', bg: 0x9a9a9a, fog: [40, 140], hemi: [0xffffff, 0x999999, 1.15], sun: [0xffffff, .85, [5, 10, 6]], grid: [0x7a7a7a, 0x8c8c8c], sh: .18, rim: 0.05, en: 'a clean neutral grey cyclorama studio' }
};
let envId = 'blender';
function applyEnv(id) {
  envId = id; const e = ENVS[id];
  /* Дэвсгэрийг WebGL шууд арчдаг (шейдэргүй) тул хөрвүүлэхгүй — яг тэр өнгө гарна.
     Манан харин шейдэрээр дамждаг тул шугаман орон зайд өгөх ёстой. */
  scene.background = new THREE.Color(e.bg);
  scene.fog = new THREE.Fog(srgb(e.bg).getHex(), e.fog[0], e.fog[1]);
  hemi.color.set(e.hemi[0]); hemi.groundColor.set(e.hemi[1]); hemi.intensity = e.hemi[2];
  sun.color.set(e.sun[0]); sun.intensity = e.sun[1]; sun.position.set.apply(sun.position, e.sun[2]);
  rim.intensity = e.rim;
  setGrid(e.grid[0], e.grid[1], e.exact);
  floor.material.opacity = e.sh;
  document.querySelectorAll('[data-env]').forEach(b => b.classList.toggle('on', b.dataset.env === id));
}

/* ─────────── 3. Дүр ба объект ─────────── */
const MAXP = 8;
const PALETTE = [0xd8963c, 0x5fa8d3, 0x7bc47f, 0xcf6b6b, 0xb08ad0, 0xd9c05a, 0x5fbfb0, 0xc98a5e];
const people = [], props = [];
let pCounter = 0, oCounter = 0;

function limb(r1, r2, h) { const g = new THREE.CylinderGeometry(r1, r2, h, 10); g.translate(0, -h / 2, 0); return g; }

function makePerson(idx) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: PALETTE[idx % PALETTE.length], roughness: .82, metalness: .02 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x232b36, roughness: .9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8b48f, roughness: .75 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const legL = add(new THREE.Mesh(limb(.068, .078, .52), dark), -.1, .52, 0);
  const legR = add(new THREE.Mesh(limb(.068, .078, .52), dark), .1, .52, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.155, .2, .64, 14), mat), 0, .84, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .06, 14), dark), 0, .53, 0); // бүс
  add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .13, .12, 12), skin), 0, 1.2, 0); // хүзүү
  const armL = add(new THREE.Mesh(limb(.052, .046, .52), mat), -.245, 1.13, 0);
  const armR = add(new THREE.Mesh(limb(.052, .046, .52), mat), .245, 1.13, 0);
  armL.rotation.z = .13; armR.rotation.z = -.13;
  const head = add(new THREE.Mesh(new THREE.SphereGeometry(.145, 16, 14), skin), 0, 1.42, 0);
  add(new THREE.Mesh(new THREE.ConeGeometry(.038, .1, 8), skin), 0, 1.42, .14).rotation.x = Math.PI / 2; // хамар = чиглэл
  const hair = add(new THREE.Mesh(new THREE.SphereGeometry(.152, 16, 12, 0, TAU, 0, 1.15), dark), 0, 1.43, 0);
  g.userData = {
    kind: 'person', name: 'Дүр.' + String(++pCounter).padStart(3, '0'),
    limbs: { legL, legR, armL, armR, head }, phase: Math.random() * TAU, ci: idx, vis: true
  };
  return g;
}

const PROP_NM = { tree: 'Мод', rock: 'Чулуу', box: 'Хайрцаг', ger: 'Гэр', fire: 'Гал', pole: 'Багана', model: 'Загвар' };
function makeProp(type) {
  const g = new THREE.Group();
  const add = m => { m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  if (type === 'tree') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(.09, .13, .8, 8), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: .95 }))).position.y = .4;
    add(new THREE.Mesh(new THREE.ConeGeometry(.6, 1.0, 9), new THREE.MeshStandardMaterial({ color: 0x2f5d3a, roughness: .88 }))).position.y = 1.15;
    add(new THREE.Mesh(new THREE.ConeGeometry(.42, .78, 9), new THREE.MeshStandardMaterial({ color: 0x37704a, roughness: .88 }))).position.y = 1.7;
  } else if (type === 'rock') {
    const r = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.45, 0), new THREE.MeshStandardMaterial({ color: 0x6b7684, roughness: .96, flatShading: true })));
    r.scale.set(1, .66, .88); r.position.y = .29; r.rotation.y = Math.random() * 3;
  } else if (type === 'ger') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, .95, 20), new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: .95 }))).position.y = .475;
    add(new THREE.Mesh(new THREE.ConeGeometry(1.22, .62, 20), new THREE.MeshStandardMaterial({ color: 0xdcd6c8, roughness: .95 }))).position.y = 1.26;
    add(new THREE.Mesh(new THREE.BoxGeometry(.5, .78, .06), new THREE.MeshStandardMaterial({ color: 0xd8963c, roughness: .7 }))).position.set(0, .39, 1.14);
  } else if (type === 'fire') {
    for (let i = 0; i < 7; i++) {
      const s = add(new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 0), new THREE.MeshStandardMaterial({ color: 0x59616b, roughness: 1, flatShading: true })));
      const a = i / 7 * TAU; s.position.set(Math.sin(a) * .38, .08, Math.cos(a) * .38);
    }
    const fl = add(new THREE.Mesh(new THREE.ConeGeometry(.2, .5, 8), new THREE.MeshBasicMaterial({ color: 0xff8a33, transparent: true, opacity: .85 })));
    fl.position.y = .3; fl.castShadow = false; g.userData.flame = fl;
    const lt = new THREE.PointLight(0xff8a33, 1.6, 9); lt.position.y = .5; g.add(lt); g.userData.light = lt;
  } else if (type === 'pole') {
    add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: .9 }))).position.y = 1.6;
    add(new THREE.Mesh(new THREE.BoxGeometry(.5, .3, .02), new THREE.MeshStandardMaterial({ color: 0x4a7ab0, roughness: .8, side: THREE.DoubleSide }))).position.set(.25, 3, 0);
  } else if (type === 'model') {
    /* Дутуу (дахин оруулаагүй) 3D загварын орлуулагч — Blender-ийн placeholder шиг */
    const m = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.8, .9),
      new THREE.MeshBasicMaterial({ color: srgb(0xffa028), wireframe: true, transparent: true, opacity: .6 }));
    m.position.y = .9; m.castShadow = false; m.receiveShadow = false;
    g.add(m);
  } else {
    add(new THREE.Mesh(new THREE.BoxGeometry(.85, .85, .85), new THREE.MeshStandardMaterial({ color: 0x4a6a8a, roughness: .7 }))).position.y = .425;
  }
  g.userData = Object.assign(g.userData || {}, { kind: type, name: PROP_NM[type] + '.' + String(++oCounter).padStart(3, '0'), vis: true });
  return g;
}

const SPAWN = [[0, 0], [-1.0, .25], [1.0, .25], [-2.0, .6], [2.0, .6], [-.5, -1.1], [.5, -1.1], [0, 1.5]];
function addPerson(x, z, ry, silent) {
  if (people.length >= MAXP) { toast('Дээд тал нь ' + MAXP + ' хүн нэмнэ — илүү нэмэх боломжгүй', 'err'); return null; }
  const p = makePerson(people.length);
  const s = SPAWN[people.length] || [Math.random() * 4 - 2, Math.random() * 4 - 2];
  p.position.set(x !== undefined ? x : s[0], 0, z !== undefined ? z : s[1]);
  p.rotation.y = ry !== undefined ? ry : (people.length === 0 ? 0 : Math.atan2(-p.position.x, -p.position.z));
  people.push(p); world.add(p);
  if (!silent) { syncAll(); commit('Хүн нэмэв'); }
  return p;
}
function removePerson(t) {
  const p = t || people[people.length - 1]; if (!p) return;
  world.remove(p); people.splice(people.indexOf(p), 1);
  if (active === p) setActive(null);
  syncAll(); commit('Хүн хасав');
}
function addProp(type, x, z, ry, silent) {
  const g = makeProp(type); const c = centroid();
  g.position.set(x !== undefined ? x : c.x + 2.2 + Math.random() * 1.2, 0, z !== undefined ? z : c.z + (Math.random() * 3 - 1.5));
  if (ry !== undefined) g.rotation.y = ry; else g.rotation.y = Math.random() * TAU;
  props.push(g); world.add(g);
  if (!silent) { setActive(g); syncAll(); commit('Объект нэмэв'); }
  return g;
}
function removeProp(p) { world.remove(p); props.splice(props.indexOf(p), 1); disposeObj(p); if (active === p) setActive(null); syncAll(); commit('Объект устгав'); }
function clearScene() {
  people.slice().forEach(p => { world.remove(p); }); people.length = 0;
  props.slice().forEach(p => { world.remove(p); disposeObj(p); }); props.length = 0;
  setActive(null);
}
const objs = () => people.concat(props);

/* ── Бай (subject): дүрүүд ба Blender-ээс оруулсан 3D загварууд ──
   Загвар нь хэт том (14м-ээс өргөн) бол «орчин» гэж үзэж, жаазлалтад тооцохгүй. */
const MODEL_MAX_SUBJ = 14;
function modelDim(o) {
  return o.userData.dim || { w: .9, h: 1.8, d: .9 };
}
/** Бай болж чадах оруулсан загварууд */
function subjModels() {
  return props.filter(o => {
    if (o.userData.kind !== 'model' || o.visible === false) return false;
    const d = modelDim(o);
    return Math.hypot(d.w * o.scale.x, d.d * o.scale.z) <= MODEL_MAX_SUBJ;
  });
}
/** Гол байн өндөр (м) — хүн байвал хүний өндөр, эс бөгөөс загварын бодит өндөр */
/** Байн гадна талд үлдэх хамгийн бага зай — камер загварын дотор орохгүй */
function minSafeRadius() {
  let r = .6;
  subjModels().forEach(m => {
    const d = modelDim(m);
    r = Math.max(r, Math.hypot(d.w * m.scale.x, d.d * m.scale.z) / 2 * 1.15);
  });
  return Math.min(r, 40);
}
function subjH() {
  if (people.length) return SUBJ_H;
  const ms = subjModels();
  if (!ms.length) return SUBJ_H;
  let h = 0;
  ms.forEach(m => { h = Math.max(h, modelDim(m).h * m.scale.y); });
  return clamp(h, .3, 12);
}
function centroid() {
  const c = new THREE.Vector3();
  const ms = subjModels();
  if (!people.length && !ms.length) return c.set(0, 1.0, 0);
  let n = 0;
  people.forEach(p => { c.add(p.position); n++; });
  ms.forEach(m => { c.add(m.position); n++; });
  c.divideScalar(n);
  c.y = people.length ? 1.05 : clamp(subjH() * .61, .35, 8);
  return c;
}
/** Дүрүүдийн хэвтээ тархалт (м) — бүлгийн кадрын өргөнд хэрэгтэй */
function spread() {
  const ms = subjModels();
  if (!ms.length) {                       /* загваргүй бол хуучин зан хэвээр */
    if (people.length < 2) return .7;
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    people.forEach(p => { x0 = Math.min(x0, p.position.x); x1 = Math.max(x1, p.position.x); z0 = Math.min(z0, p.position.z); z1 = Math.max(z1, p.position.z); });
    return Math.hypot(x1 - x0, z1 - z0) + .7;
  }
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  people.forEach(p => {
    x0 = Math.min(x0, p.position.x - .35); x1 = Math.max(x1, p.position.x + .35);
    z0 = Math.min(z0, p.position.z - .35); z1 = Math.max(z1, p.position.z + .35);
  });
  ms.forEach(m => {
    const d = modelDim(m), w = d.w * m.scale.x / 2, dp = d.d * m.scale.z / 2;
    x0 = Math.min(x0, m.position.x - w); x1 = Math.max(x1, m.position.x + w);
    z0 = Math.min(z0, m.position.z - dp); z1 = Math.max(z1, m.position.z + dp);
  });
  return Math.max(.7, Math.hypot(x1 - x0, z1 - z0));
}
function arrange(kind) {
  const n = people.length; if (!n) return;
  people.forEach((p, i) => {
    if (kind === 'line') { p.position.set((i - (n - 1) / 2) * 1.15, 0, 0); p.rotation.y = 0; }
    else if (kind === 'circle') { const a = i / n * TAU, R = Math.max(1.2, n * .34); p.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); p.rotation.y = a + Math.PI; }
    else if (kind === 'face') {
      const h = Math.ceil(n / 2), side = i < h ? -1 : 1, k = i < h ? i : i - h, m = i < h ? h : n - h;
      p.position.set((k - (m - 1) / 2) * 1.1, 0, side * 1.15); p.rotation.y = side < 0 ? 0 : Math.PI;
    }
    else if (kind === 'wedge') { const s = i % 2 ? 1 : -1, k = Math.ceil(i / 2); p.position.set(s * k * .95, 0, -k * .8); p.rotation.y = 0; }
    else { p.position.set(Math.random() * 5 - 2.5, 0, Math.random() * 5 - 2.5); p.rotation.y = Math.random() * TAU; }
  });
  syncAll(); commit('Байрлуулалт: ' + kind);
}

/* ══════════════════════════════════════════════════════════════
   3b. BLENDER-ЭЭС 3D ЗАГВАР ОРУУЛАХ  (.glb / .gltf / .obj)
   Blender: File ▸ Export ▸ glTF 2.0 (.glb) — нэг файлд бүгд багтана.
   .blend файлыг хөтөч уншиж чадахгүй тул заавал экспортлоно.
   ══════════════════════════════════════════════════════════════ */
const MODEL_MAX_MB = 80;
const MODEL_RX = /\.(glb|gltf|obj)$/i;

/** Файлуудыг төрлөөр нь ялган оруулна (.json бол төсөл) */
function importFiles(files) {
  const list = Array.from(files || []);
  if (!list.length) return;
  const proj = list.find(f => /\.json$/i.test(f.name));
  if (proj) {
    const rd = new FileReader();
    rd.onload = () => { try { loadProject(JSON.parse(rd.result)); } catch (e) { toast('JSON уншиж чадсангүй', 'err'); } };
    rd.readAsText(proj);
    return;
  }
  const models = list.filter(f => MODEL_RX.test(f.name));
  const blend = list.filter(f => /\.blend$/i.test(f.name));
  if (blend.length) toast('.blend файлыг хөтөч уншихгүй — Blender дээр File ▸ Export ▸ glTF 2.0 (.glb) гэж гаргана уу', 'err');
  else if (!models.length) toast('Зөвхөн .glb, .gltf, .obj файл оруулна', 'err');
  models.forEach(importModel);
}

function importModel(file) {
  if (file.size > MODEL_MAX_MB * 1e6) {
    toast(file.name + ' хэт том (' + (file.size / 1e6).toFixed(0) + 'МБ). ' + MODEL_MAX_MB + 'МБ хүртэл боломжтой.', 'err');
    return;
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const rd = new FileReader();
  toast('⏳ ' + file.name + ' ачаалж байна…');
  rd.onerror = () => toast('Файлыг уншиж чадсангүй', 'err');
  if (ext === 'obj') {
    rd.onload = () => {
      if (typeof THREE.OBJLoader !== 'function') { toast('OBJLoader олдсонгүй (libs/OBJLoader.js)', 'err'); return; }
      try { placeModel(new THREE.OBJLoader().parse(rd.result), file.name, true); }
      catch (e) { toast('OBJ файлыг задалж чадсангүй', 'err'); }
    };
    rd.readAsText(file);
  } else {
    rd.onload = () => {
      if (typeof THREE.GLTFLoader !== 'function') { toast('GLTFLoader олдсонгүй (libs/GLTFLoader.js)', 'err'); return; }
      try {
        new THREE.GLTFLoader().parse(rd.result, '',
          g => placeModel(g.scene || (g.scenes && g.scenes[0]), file.name, false),
          () => toast('Задалж чадсангүй. Blender дээр .glb (Embedded) хэлбэрээр гаргана уу', 'err'));
      } catch (e) { toast('Задалж чадсангүй — .glb хэлбэрээр гаргана уу', 'err'); }
    };
    rd.readAsArrayBuffer(file);
  }
}

/** Ачаалсан загварыг тайзан дээр зөв хэмжээ, байрлалд тавина */
function placeModel(root, fileName, plainMaterial) {
  if (!root) { toast('Загвар хоосон байна', 'err'); return; }
  root.position.set(0, 0, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(1);
  root.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(root);
  if (!isFinite(box.min.x) || box.isEmpty()) { toast('Загварт харагдах хэлбэр алга', 'err'); return; }
  let size = box.getSize(new THREE.Vector3());
  const h0 = Math.max(size.y, 1e-4);
  /* Хэт том, хэт жижиг бол хүний өндөрт (1.8м) тааруулна */
  const auto = (h0 > 12 || h0 < .25);
  if (auto) root.scale.setScalar(1.8 / h0);
  root.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(root);
  const c = box.getCenter(new THREE.Vector3());
  root.position.set(-c.x, -box.min.y, -c.z);           /* шалан дээр, төвд нь */
  root.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true; o.receiveShadow = true;
    if (plainMaterial || !o.material) {
      o.material = new THREE.MeshStandardMaterial({ color: 0xb3b3b3, roughness: .75 });  /* Blender Solid саарал */
    }
  });

  const g = new THREE.Group();
  g.add(root);
  const sz = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3());
  const finalH = sz.y;
  const base = fileName.replace(/\.[^.]+$/, '');
  g.userData = {
    kind: 'model', name: base + '.' + String(++oCounter).padStart(3, '0'), vis: true, file: fileName,
    h: +finalH.toFixed(2),
    /* автомат камер жаазлалтдаа ашиглана (дүрийн оронд загварын бодит хэмжээ) */
    dim: { w: +sz.x.toFixed(3), h: +sz.y.toFixed(3), d: +sz.z.toFixed(3) }
  };

  /* Төсөл нээхэд үүссэн «дутуу» орлуулагчийг олвол яг тэр байрлалд нь тавина */
  const slot = props.find(p => p.userData.kind === 'model' && p.userData.missing &&
    (p.userData.file || '').toLowerCase() === fileName.toLowerCase());
  if (slot) {
    g.position.copy(slot.position); g.rotation.y = slot.rotation.y; g.scale.copy(slot.scale);
    g.userData.name = slot.userData.name;
    disposeObj(slot); world.remove(slot); props.splice(props.indexOf(slot), 1);
  } else if (!people.length && !props.some(o => o.userData.kind === 'model')) {
    g.position.set(0, 0, 0);                 /* тайз хоосон бол төв рүү — камер шууд түүн рүү чиглэнэ */
  } else {
    const cen = centroid();
    g.position.set(clamp(cen.x + 2.4 + Math.random() * .8, -22, 22), 0, clamp(cen.z + (Math.random() * 2 - 1), -22, 22));
  }
  const first = !people.length && props.filter(o => o.userData.kind === 'model').length === 0;
  props.push(g); world.add(g);
  setActive(g); applyShading();
  if (first) { focusAll(); onCamMove(); }    /* эхний загварыг шууд багтаана */
  syncAll(); commit('Загвар оруулав: ' + fileName);
  toast('✅ ' + fileName + ' орлоо · ' + finalH.toFixed(1) + 'м' + (auto ? ' (хэмжээг тааруулав)' : '') +
    (first ? ' · автомат камер үүн рүү чиглэнэ' : '') + ' · G зөөх, S хэмжээ, R эргүүлэх', 'ok');
}

/** Санах ойг чөлөөлнө */
function disposeObj(o) {
  o.traverse(c => {
    if (c.geometry) c.geometry.dispose();
    const mats = c.material ? (Array.isArray(c.material) ? c.material : [c.material]) : [];
    mats.forEach(m => {
      Object.keys(m).forEach(k => { const v = m[k]; if (v && v.isTexture) v.dispose(); });
      m.dispose();
    });
  });
}

/** Дутуу загварууд (төсөл нээхэд дахин оруулах шаардлагатай) */
const missingModels = () => props.filter(p => p.userData.kind === 'model' && p.userData.missing);

/* ─────────── 4. Сонголт ─────────── */
let active = null;
const selRing = new THREE.Mesh(new THREE.RingGeometry(.52, .60, 40),
  new THREE.MeshBasicMaterial({ color: srgb(0xffa028), side: THREE.DoubleSide, transparent: true, opacity: .95, depthTest: false }));
selRing.rotation.x = -Math.PI / 2; selRing.visible = false; selRing.renderOrder = 5; overlay3d.add(selRing);
const dirArrow = new THREE.Mesh(new THREE.ConeGeometry(.09, .3, 4),
  new THREE.MeshBasicMaterial({ color: srgb(0xffa028), transparent: true, opacity: .95, depthTest: false }));
dirArrow.rotation.x = Math.PI / 2; dirArrow.visible = false; dirArrow.renderOrder = 5; overlay3d.add(dirArrow);

function setActive(o) {
  active = o;
  selRing.visible = !!o; dirArrow.visible = !!(o && o.userData.kind === 'person');
  refreshOutliner(); refreshNPanel();
  $('sbObj').textContent = o ? o.userData.name : '—';
}

/* ─────────── 5. Камерын төлөв ─────────── */
const EYE_Y = 1.42;                       // нүдний өндөр (шинжилгээнд)
const SUBJ_H = 1.72;                       // хүний өндөр
const state = { theta: .58, phi: 1.18, radius: 6.2, fov: 40, roll: 0, target: new THREE.Vector3(0, 1.05, 0) };

function clampS(s) {
  s.phi = clamp(s.phi, .05, 1.95);
  s.radius = clamp(s.radius, .55, 90);
  s.fov = clamp(s.fov, 8, 110);
  s.roll = clamp(s.roll, -.9, .9);
  s.target.y = clamp(s.target.y, .05, 9);
  return s;
}
function posOf(s) {
  const p = new THREE.Vector3(
    s.target.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta),
    s.target.y + s.radius * Math.cos(s.phi),
    s.target.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta));
  if (p.y < .08) p.y = .08;
  return p;
}
function applyCam(cam, s, shake) {
  const p = posOf(s);
  if (shake) { p.x += shake.x; p.y += shake.y; p.z += shake.z; }
  cam.position.copy(p);
  cam.fov = s.fov; cam.updateProjectionMatrix();
  cam.up.set(0, 1, 0);
  cam.lookAt(s.target);
  const r = (s.roll || 0) + (shake ? shake.r : 0);
  if (r) cam.rotateZ(r);
}
const cloneS = s => ({ theta: s.theta, phi: s.phi, radius: s.radius, fov: s.fov, roll: s.roll || 0, target: s.target.clone(), frame: s.frame });
function stateFromPT(P, T, fov, roll) {
  const d = P.clone().sub(T), r = Math.max(d.length(), .55);
  return clampS({ theta: Math.atan2(d.x, d.z), phi: Math.acos(clamp(d.y / r, -1, 1)), radius: r, fov: fov || state.fov, roll: roll || 0, target: T.clone() });
}
function lensMM(fov) { return Math.round(12 / Math.tan(fov * Math.PI / 360)); }
function fovFromMM(mm) { return Math.atan(12 / mm) * 360 / Math.PI; }

/* ─────────── 6. Оролт ба навигац ─────────── */
const ray = new THREE.Raycaster();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ptrs = new Map();
let navMode = null, moved = false, pickCand = null, grabOff = new THREE.Vector3(), pinchD = 0;
let camView = false, tool = 'sel';

const ndc = e => {
  const r = canvas.getBoundingClientRect();
  return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
};
function pickRoot(e) {
  ray.setFromCamera(ndc(e), viewCam);
  const list = objs().filter(o => o.visible);
  const hits = ray.intersectObjects(list, true);
  if (!hits.length) return null;
  let o = hits[0].object;
  while (o && list.indexOf(o) < 0) o = o.parent;
  return o;
}
function floorHit(e) {
  ray.setFromCamera(ndc(e), viewCam);
  const out = new THREE.Vector3();
  return ray.ray.intersectPlane(floorPlane, out) ? out : null;
}

/* ── Blender маягийн модал трансформ (G / R / S) ── */
let xf = null;
function startXform(mode) {
  if (!active) { toast('Эхлээд объект сонгоно уу', 'err'); return; }
  xf = {
    mode, axis: null,
    p0: active.position.clone(), r0: active.rotation.y, s0: active.scale.clone(),
    mx: lastMouse.x, my: lastMouse.y, hit0: null
  };
  const h = floorHitXY(lastMouse.x, lastMouse.y);
  if (h) xf.hit0 = h.clone();
  showXHint();
}
function endXform(cancel) {
  if (!xf) return;
  if (cancel) { active.position.copy(xf.p0); active.rotation.y = xf.r0; active.scale.copy(xf.s0); }
  xf = null; $('xhint').style.display = 'none'; syncAll();
  if (!cancel) commit('Объект засав');
}
function showXHint() {
  if (!xf) return;
  const nm = { move: 'Зөөх', rot: 'Эргүүлэх', scale: 'Хэмжээ' }[xf.mode];
  const ax = xf.axis ? ' · ' + xf.axis.toUpperCase() + ' тэнхлэг' : '';
  const el = $('xhint');
  el.textContent = nm + ax + '  —  ЗТ = батлах, Esc = цуцлах' + (xf.mode === 'move' ? ', X/Y = тэнхлэг' : '');
  el.style.display = 'block';
}
function floorHitXY(cx, cy) {
  const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), viewCam);
  const out = new THREE.Vector3();
  return ray.ray.intersectPlane(floorPlane, out) ? out : null;
}
function updXform(cx, cy) {
  if (!xf || !active) return;
  if (xf.mode === 'move') {
    const h = floorHitXY(cx, cy); if (!h) return;
    if (!xf.hit0) { xf.hit0 = h.clone(); return; }
    let dx = h.x - xf.hit0.x, dz = h.z - xf.hit0.z;
    if (xf.axis === 'x') dz = 0; if (xf.axis === 'y') dx = 0;
    active.position.x = clamp(xf.p0.x + dx, -22, 22);
    active.position.z = clamp(xf.p0.z + dz, -22, 22);
  } else if (xf.mode === 'rot') {
    active.rotation.y = xf.r0 + (cx - xf.mx) * .012;
  } else {
    const r = canvas.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    const d0 = Math.max(30, Math.hypot(xf.mx - ox, xf.my - oy)), d1 = Math.hypot(cx - ox, cy - oy);
    const k = clamp(d1 / d0, .25, 4);
    active.scale.set(xf.s0.x * k, xf.s0.y * k, xf.s0.z * k);
  }
  refreshNPanel();
}

let lastMouse = { x: 0, y: 0 };
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  lastMouse = { x: e.clientX, y: e.clientY };
  if (xf) { endXform(e.button !== 0); return; }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  moved = false; stopPlay();
  if (ptrs.size === 2) { navMode = 'pinch'; pinchD = 0; return; }
  pickCand = pickRoot(e);
  if (pickCand && e.button === 0 && !e.shiftKey) {
    navMode = 'obj';
    const h = floorHit(e);
    grabOff = h ? pickCand.position.clone().sub(h) : new THREE.Vector3();
  } else {
    navMode = (e.shiftKey || e.button === 2 || e.button === 1) ? 'pan' : 'orbit';
    if (camView) setCamView(false);
  }
});
canvas.addEventListener('pointermove', e => {
  lastMouse = { x: e.clientX, y: e.clientY };
  if (xf) { updXform(e.clientX, e.clientY); return; }
  if (!ptrs.has(e.pointerId)) return;
  const p = ptrs.get(e.pointerId);
  const dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
  if (ptrs.size === 2) {
    const a = Array.from(ptrs.values());
    const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
    if (pinchD) state.radius *= pinchD / d;
    pinchD = d; panT(dx * .5, dy * .5); clampS(state); onCamMove(); return;
  }
  if (navMode === 'obj' && pickCand) {
    const h = floorHit(e);
    if (h) {
      pickCand.position.x = clamp(h.x + grabOff.x, -22, 22);
      pickCand.position.z = clamp(h.z + grabOff.z, -22, 22);
      refreshNPanel(); if (pickCand.userData.kind === 'person') schedulePrompt();
    }
  } else if (navMode === 'pan') { panT(dx, dy); clampS(state); onCamMove(); }
  else if (navMode === 'orbit') {
    state.theta -= dx * .0058; state.phi -= dy * .0046;
    clampS(state); onCamMove();
  }
});
function endPtr(e) {
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinchD = 0;
  if (!ptrs.size) {
    if (!moved) setActive(navMode === 'obj' ? pickCand : null);
    else if (navMode === 'obj' && pickCand) commit('Объект зөөв');
    navMode = null; pickCand = null;
  }
}
canvas.addEventListener('pointerup', endPtr);
canvas.addEventListener('pointercancel', endPtr);
function panT(dx, dy) {
  const right = new THREE.Vector3().setFromMatrixColumn(viewCam.matrix, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(viewCam.matrix, 1);
  const k = state.radius * .0017;
  state.target.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
  state.target.y = clamp(state.target.y, .05, 9);
}
canvas.addEventListener('wheel', e => {
  e.preventDefault(); stopPlay(); if (camView) setCamView(false);
  if (e.ctrlKey || e.metaKey) state.fov += e.deltaY * .045;
  else state.radius *= 1 + e.deltaY * .0013;
  clampS(state); onCamMove();
}, { passive: false });
canvas.addEventListener('dblclick', e => {
  const o = pickRoot(e);
  if (o) { state.target.set(o.position.x, o.userData.kind === 'person' ? 1.2 : .8, o.position.z); setActive(o); }
  else { const h = floorHit(e); if (h) state.target.set(h.x, Math.max(.6, state.target.y), h.z); }
  onCamMove();
});
function onCamMove() { refreshNPanel(); schedulePrompt(); }

/* ─────────── 7. Түлхүүр кадр ба интерполяци ─────────── */
let keys = [];               // {theta,phi,radius,fov,roll,target,frame}
let activeK = -1;
let fStart = 1, fEnd = 120, fps = 24, curFrame = 1;
let interp = 'smooth', looping = true, playing = false, playAcc = 0;
const MAXK = 24;

const durSec = () => (fEnd - fStart) / fps;
const frameOfT = t => Math.round(lerp(fStart, fEnd, t));

/* тохируулсан хурдны муруйнууд — сегмент хоорондын хурд тасралтгүй */
const E_IN = u => -u * u * u + 2 * u * u;      // амарснаас жигд хурд руу
const E_OUT = u => -u * u * u + u * u + u;     // жигд хурднаас амралт руу
const E_SM = u => u * u * (3 - 2 * u);
function segEase(u, i, n) {
  switch (interp) {
    case 'linear': return u;
    case 'const': return 0;
    case 'in': return n === 1 ? E_IN(u) : (i === 0 ? E_IN(u) : u);
    case 'out': return n === 1 ? E_OUT(u) : (i === n - 1 ? E_OUT(u) : u);
    default:
      if (n === 1) return E_SM(u);
      if (i === 0) return E_IN(u);
      if (i === n - 1) return E_OUT(u);
      return u;
  }
}
let sp = null;
function buildSpline() {
  keys.sort((a, b) => a.frame - b.frame);
  if (keys.length < 2) { sp = null; return; }
  const th = [keys[0].theta], phi = [], r = [], fv = [], ro = [], tx = [], ty = [], tz = [];
  keys.forEach((k, i) => {
    if (i > 0) {                              // theta-г "хамгийн богино зам"-аар задлах
      let d = k.theta - th[i - 1];
      while (d > Math.PI) d -= TAU;
      while (d < -Math.PI) d += TAU;
      th.push(th[i - 1] + d);
    }
    phi.push(k.phi); r.push(k.radius); fv.push(k.fov); ro.push(k.roll || 0);
    tx.push(k.target.x); ty.push(k.target.y); tz.push(k.target.z);
  });
  sp = { th, phi, r, fv, ro, tx, ty, tz };
}
function cr(v, i, u) {   // Catmull-Rom
  const n = v.length;
  const p0 = v[Math.max(i - 1, 0)], p1 = v[i], p2 = v[Math.min(i + 1, n - 1)], p3 = v[Math.min(i + 2, n - 1)];
  const u2 = u * u, u3 = u2 * u;
  return .5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
}
function segSample(i, u) {
  const s = {
    theta: cr(sp.th, i, u), phi: cr(sp.phi, i, u), radius: cr(sp.r, i, u),
    fov: cr(sp.fv, i, u), roll: cr(sp.ro, i, u),
    target: new THREE.Vector3(cr(sp.tx, i, u), cr(sp.ty, i, u), cr(sp.tz, i, u))
  };
  if (autoTarget) s.target.copy(centroid());
  return clampS(s);
}
/** Тухайн фрейм дэх камерын төлөв */
function sampleFrame(f) {
  if (!keys.length) return cloneS(state);
  if (keys.length === 1 || !sp) { const s = cloneS(keys[0]); if (autoTarget) s.target.copy(centroid()); return s; }
  const n = keys.length;
  if (f <= keys[0].frame) return segSample(0, 0);
  if (f >= keys[n - 1].frame) return segSample(n - 2, 1);
  let i = 0;
  while (i < n - 2 && f >= keys[i + 1].frame) i++;
  const span = keys[i + 1].frame - keys[i].frame;
  let u = span > 0 ? (f - keys[i].frame) / span : 0;
  return segSample(i, segEase(clamp(u, 0, 1), i, n - 1));
}
/** Нормчилсон t (0..1) дэх төлөв — промт/экспортод */
const sampleT = t => sampleFrame(lerp(keys.length ? keys[0].frame : fStart, keys.length ? keys[keys.length - 1].frame : fEnd, clamp(t, 0, 1)));

let autoTarget = false, shakeAmt = 0;
function shakeAt(t) {
  if (!shakeAmt) return null;
  const a = shakeAmt * .09, w = t * 9.3;
  return {
    x: (Math.sin(w * 1.7) + Math.sin(w * 3.1) * .5) * a,
    y: (Math.sin(w * 2.3 + 1.2) + Math.sin(w * 4.7) * .4) * a,
    z: (Math.sin(w * 1.3 + .7)) * a * .6,
    r: Math.sin(w * 1.9 + 2.1) * a * .12
  };
}

/* ── кадрын үйлдлүүд ── */
function addKey(frame) {
  if (keys.length >= MAXK) { toast('Дээд тал нь ' + MAXK + ' түлхүүр кадр — эхлээд аль нэгийг устгана уу', 'err'); return; }
  const f = frame !== undefined ? frame : curFrame;
  const ex = keys.findIndex(k => k.frame === f);
  const s = cloneS(state); s.frame = f;
  if (ex >= 0) { keys[ex] = s; activeK = ex; toast('Фрейм ' + f + ' дээрх кадр шинэчлэгдлээ'); }
  else { keys.push(s); keys.sort((a, b) => a.frame - b.frame); activeK = keys.findIndex(k => k.frame === f); toast('◆ Түлхүүр кадр нэмэгдлээ — фрейм ' + f); }
  syncAll(); commit('Кадр нэмэв — ' + f);
}
function updKey() {
  if (activeK < 0 || !keys[activeK]) { addKey(); return; }
  const f = keys[activeK].frame; const s = cloneS(state); s.frame = f; keys[activeK] = s;
  toast('Кадр ' + (activeK + 1) + ' шинэчлэгдлээ'); syncAll(); commit('Кадр шинэчлэв');
}
function delKey(i) {
  const idx = i !== undefined ? i : activeK; if (idx < 0 || !keys[idx]) return;
  keys.splice(idx, 1); activeK = Math.min(idx, keys.length - 1); syncAll(); commit('Кадр устгав');
}
function clearKeys() { keys = []; activeK = -1; syncAll(); commit('Бүх кадр цэвэрлэв'); }
function gotoKey(i) {
  if (!keys[i]) return;
  activeK = i; stopPlay(); setFrame(keys[i].frame);
  Object.assign(state, cloneS(keys[i])); state.target.copy(keys[i].target);
  syncAll();
}
function reverseKeys() {
  if (keys.length < 2) return;
  const fs = keys.map(k => k.frame);
  keys.reverse();
  keys.forEach((k, i) => k.frame = fs[i]);
  syncAll(); commit('Кадруудыг урвуулав'); toast('Кадруудыг урвуулав');
}
/** Кадруудыг фрейм мужид жигд тараах */
function spreadKeys(list, dur) {
  const total = Math.max(2, Math.round(dur * fps));
  fStart = 1; fEnd = 1 + total;
  list.forEach((k, i) => k.frame = Math.round(lerp(fStart, fEnd, list.length === 1 ? 0 : i / (list.length - 1))));
  return list;
}

/* ─────────── 8. Тоглуулалт ─────────── */
function setFrame(f) {
  curFrame = clamp(Math.round(f), fStart, fEnd);
  $('fCur').value = curFrame;
  if (keys.length >= 1) {
    const s = sampleFrame(curFrame);
    if (camView || playing) { Object.assign(state, s); state.target.copy(s.target); }
  }
  drawTimeline();
}
function startPlay() { if (keys.length < 2) { toast('Дор хаяж 2 түлхүүр кадр хэрэгтэй', 'err'); return; } playing = true; playAcc = 0; $('btnPlay').textContent = '⏸'; $('btnPlay').classList.add('on'); }
function stopPlay() { if (!playing) return; playing = false; $('btnPlay').textContent = '▶'; $('btnPlay').classList.remove('on'); }
function togglePlay() { playing ? stopPlay() : startPlay(); }
function setCamView(on) {
  camView = on;
  $('btnCamView').classList.toggle('on', on);
  if (on) { const s = sampleFrame(curFrame); Object.assign(state, s); state.target.copy(s.target); }
  refreshNPanel();
}

/* ─────────── 9. Кадрын шинжилгээ ─────────── */
const NUM_EN = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const NUM_MN = ['дүргүй', 'ганц', 'хоёр', 'гурван', 'дөрвөн', 'таван', 'зургаан', 'долоон', 'найман'];
function subjEN() {
  const n = people.length;
  if (n) return n === 1 ? 'the subject' : 'the ' + NUM_EN[n] + ' subjects';
  return subjModels().length ? 'the subject' : 'the empty landscape';
}
function subjMN() {
  const n = people.length;
  if (n) return n === 1 ? 'дүр' : NUM_MN[n] + ' дүр';
  return subjModels().length ? 'загвар' : 'хоосон орчин';
}

const SIZES = [
  { f: 4.6, en: 'extreme close-up', ab: 'ECU', mn: 'маш ойрын кадр (ECU)' },
  { f: 2.7, en: 'close-up', ab: 'CU', mn: 'ойрын кадр (CU)' },
  { f: 1.85, en: 'medium close-up', ab: 'MCU', mn: 'дунд-ойрын (MCU)' },
  { f: 1.22, en: 'medium shot', ab: 'MS', mn: 'дунд кадр (MS)' },
  { f: .88, en: 'medium-full shot', ab: 'MFS', mn: 'дунд-бүтэн (MFS)' },
  { f: .62, en: 'full shot', ab: 'FS', mn: 'бүтэн кадр (FS)' },
  { f: .3, en: 'wide shot', ab: 'WS', mn: 'өргөн кадр (WS)' },
  { f: 0, en: 'extreme wide shot', ab: 'EWS', mn: 'маш өргөн кадр (EWS)' }
];
/** Кадрын өндөрт дүрийн эзлэх хувь → кадрын хэмжээ */
function frameFrac(s) { return subjH() / (2 * s.radius * Math.tan(s.fov * Math.PI / 360)); }
function shotSize(s) { const f = frameFrac(s); return SIZES.find(x => f > x.f) || SIZES[SIZES.length - 1]; }
function radiusForSize(ab, fov) {
  const t = SIZES.find(x => x.ab === ab); if (!t) return state.radius;
  const idx = SIZES.indexOf(t);
  const hi = idx === 0 ? 7 : SIZES[idx - 1].f;
  const f = (t.f + hi) / 2;
  return clamp(subjH() / (2 * f * Math.tan(fov * Math.PI / 360)), minSafeRadius(), 90);
}
function camAngle(s) {
  const p = posOf(s);
  const dh = Math.hypot(p.x - s.target.x, p.z - s.target.z);
  const eye = people.length ? EYE_Y : clamp(subjH() * .826, .25, 10);
  const el = Math.atan2(p.y - eye, Math.max(dh, .001)) * 180 / Math.PI;
  if (el > 58) return { en: "a bird's-eye top-down angle", mn: 'шувууны харц', ab: 'top' };
  if (el > 22) return { en: 'a high angle', mn: 'өндөр өнцөг', ab: 'high' };
  if (el < -40) return { en: "a worm's-eye extreme low angle", mn: 'маш доод өнцөг', ab: 'worm' };
  if (el < -10) return { en: 'a low angle', mn: 'доод өнцөг', ab: 'low' };
  return { en: 'eye level', mn: 'нүдний түвшин', ab: 'eye' };
}
const PHI_FOR = { top: .26, high: .82, eye: 1.50, low: 1.76, worm: 1.90 };
/** Хэн рүү чиглэсэн бэ */
function targetOf(s) {
  let best = null, bd = 1.35;
  people.forEach((p, i) => { const d = Math.hypot(p.position.x - s.target.x, p.position.z - s.target.z); if (d < bd) { bd = d; best = i; } });
  return best;
}
/** Бүх дүр кадарт багтаж байна уу */
function allInFrame(s) {
  const tan = Math.tan(s.fov * Math.PI / 360);
  const halfW = s.radius * tan * shotAspect(), halfH = s.radius * tan;
  const ms = subjModels();
  if (!people.length && ms.length) {          /* зөвхөн загвар — өндөр, өргөн хоёулаа */
    return subjH() * .55 < halfH && spread() * .55 < halfW;
  }
  if (people.length < 2) return true;
  return spread() * .55 < halfW;
}
function shotAspect() { const a = ($('aspect').value || '16:9').split(':'); return (+a[0]) / (+a[1]); }

function analyzePair(a, b, dThSum) {
  const EN = [], MN = [], KW = [];
  let dTh;
  if (dThSum !== undefined) { dTh = dThSum * 180 / Math.PI; }
  else { dTh = (b.theta - a.theta) * 180 / Math.PI; while (dTh > 180) dTh -= 360; while (dTh < -180) dTh += 360; }
  const deg = Math.round(Math.abs(dTh) / 5) * 5;
  const pa = posOf(a), pb = posOf(b);
  const posD = pa.distanceTo(pb), tD = a.target.distanceTo(b.target);
  const dy = pb.y - pa.y, rr = b.radius / Math.max(a.radius, .01), dF = b.fov - a.fov, dR = (b.roll || 0) - (a.roll || 0);

  if (Math.abs(dTh) >= 12) {
    const cw = dTh < 0, dir = cw ? 'clockwise' : 'counter-clockwise', dmn = cw ? 'цагийн зүүний дагуу' : 'цагийн зүүний эсрэг';
    EN.push(deg >= 330 ? 'sweeps a full 360° ' + dir + ' orbit around ' + subjEN()
      : 'orbits roughly ' + deg + '° ' + dir + ' around ' + subjEN());
    MN.push(deg >= 330 ? 'бүтэн 360° ' + dmn + ' тойрно' : deg + '° ' + dmn + ' тойрно');
    KW.push(deg >= 330 ? '360° ' + (cw ? 'cw' : 'ccw') + ' orbit' : 'orbit ' + deg + '° ' + (cw ? 'cw' : 'ccw'));
  }
  if (Math.abs(dy) >= .4) {
    EN.push(dy > 0 ? (dy > 1.8 ? 'cranes high up into the air' : 'booms up smoothly') : (dy < -1.8 ? 'drops steeply down toward ground level' : 'booms down smoothly'));
    MN.push(dy > 0 ? (dy > 1.8 ? 'өндөрт хөөрнө' : 'зөөлөн дээшилнэ') : (dy < -1.8 ? 'огцом доошилно' : 'зөөлөн бууна'));
    KW.push(dy > 0 ? 'crane up' : 'crane down');
  }
  if (rr < .84) { EN.push(rr < .55 ? 'pushes in hard toward ' + subjEN() : 'pushes in closer'); MN.push(rr < .55 ? 'хүчтэй ойртоно' : 'ойртоно'); KW.push('dolly in'); }
  else if (rr > 1.2) { EN.push(rr > 1.9 ? 'pulls far back to reveal the wider space' : 'pulls back'); MN.push(rr > 1.9 ? 'хол ухарч орчныг илчилнэ' : 'ухарна'); KW.push('dolly out'); }
  if (Math.abs(dF) >= 5) {
    EN.push(dF < 0 ? 'zooms into a longer ' + lensMM(b.fov) + 'mm lens' : 'zooms out to a wider ' + lensMM(b.fov) + 'mm lens');
    MN.push(dF < 0 ? lensMM(b.fov) + 'mm руу зумдана' : lensMM(b.fov) + 'mm өргөн болно');
    KW.push(dF < 0 ? 'zoom in' : 'zoom out');
  }
  if ((rr < .84 && dF > 5) || (rr > 1.2 && dF < -5)) {
    EN.push('warps the background in a dolly-zoom vertigo effect, holding ' + subjEN() + ' at a constant size in frame');
    MN.push('vertigo (dolly-zoom) — дүр хэвээр, ард нь мурийна');
    KW.push('dolly zoom vertigo');
  }
  if (Math.abs(dR) > .05) { EN.push(dR > 0 ? 'rolls into a canted dutch angle' : 'levels the horizon back out'); MN.push(dR > 0 ? 'налуу (dutch) өнцөг рүү эргэнэ' : 'тэнхлэгээ тэгшилнэ'); KW.push('dutch roll'); }
  if (posD < .4 && tD >= .5) { EN.push('pans across from a locked position onto a new point of interest'); MN.push('байрнаасаа эргэж шинэ бай руу pan хийнэ'); KW.push('pan'); }
  else if (tD >= .7) { EN.push('reframes laterally, tracking the point of interest'); MN.push('хажуу тийш дагаж жаазаа шинэчилнэ'); KW.push('tracking reframe'); }
  return { EN, MN, KW, static: !EN.length };
}
/** a / an — англи өгүүлбэрийн тодорхойгүй артикль */
function art(w) {
  const t = String(w).trim();
  const n = parseInt(t, 10);
  if (!isNaN(n) && /^\d/.test(t)) return (n === 8 || n === 11 || n === 18 || (n >= 80 && n < 90)) ? 'an' : 'a';
  return /^[aeiou]/i.test(t) ? 'an' : 'a';
}
function paceOf() {
  const d = durSec();
  return d <= 2.5 ? { en: 'fast, energetic', mn: 'хурдан, эрчтэй' }
    : d <= 6 ? { en: 'smooth, steady', mn: 'жигд, тогтвортой' }
      : { en: 'slow, graceful', mn: 'удаан, тайван' };
}

/* ─────────── 10. ПРОМТ → КАМЕР (задлан шинжлэгч) ─────────── */
const RX = {
  cw: /(clockwise|цагийн зүүний дагуу|цагийн дагуу|\bcw\b)/i,
  ccw: /(counter[\s-]*clockwise|anti[\s-]*clockwise|цагийн зүүний эсрэг|эсрэг чиглэл|\bccw\b)/i,
  orbit: /(orbit|circl|arc around|arcs? round|revolv|swirl|тойр|эрг[эиж]|тойрог|эргэн тойрон)/i,
  push: /(push in|dolly in|move in|creep in|closer|approach|advance|ойрт|дөхө|дөх|урагш|ойртож|шахах)/i,
  pull: /(pull back|pull out|dolly out|back away|move away|retreat|reverse out|ухар|холд|хойш|ухраад)/i,
  craneU: /(crane up|boom up|rise|ascend|lift|fly up|soar|дээш|өргөгд|хөөр|мандах|дээшил)/i,
  craneD: /(crane down|boom down|descend|drop down|lower|swoop down|доош|бууж|буух|шумба|доошил)/i,
  zoomI: /(zoom in|tighter lens|telephoto|long lens|зумдаж|зум ойрт|телефото|урт линз)/i,
  zoomO: /(zoom out|wider lens|wide[\s-]?angle|зум холд|өргөн өнцөг|өргөн линз)/i,
  vert: /(dolly[\s-]?zoom|vertigo|zolly|hitchcock|вертиго)/i,
  panL: /(pan left|whip left|zvvn|зүүн тийш эрг|зүүн pan)/i,
  panR: /(pan right|whip right|whip pan|баруун тийш эрг|баруун pan|огцом pan)/i,
  tiltU: /(tilt up|дээш хазай|дээш харуул)/i,
  tiltD: /(tilt down|доош хазай|доош харуул)/i,
  truckL: /(truck left|track left|strafe left|slide left|зүүн тийш гулс|зүүн тийш шилж)/i,
  truckR: /(truck right|track right|strafe right|slide right|баруун тийш гулс|баруун тийш шилж)/i,
  statik: /(static|locked[\s-]?off|no movement|motionless|still shot|tripod|хөдөлгөөнгүй|хөдлөхгүй|зогсонги|тогтмол|суурин)/i,
  hand: /(hand[\s-]?held|shaky|handheld|documentary|сэгсрэ|гар камер|чичрэ|доргио)/i,
  flyby: /(fly[\s-]?by|fly[\s-]?through|swoop past|нисэн өнгөр|нисэх|нисээд)/i,
  topd: /(top[\s-]?down|bird'?s?[\s-]?eye|overhead|aerial|drone|шувууны|дээрээс харах|нисдэг тэрэг)/i,
  low: /(low angle|worm'?s?[\s-]?eye|hero (shot|angle)|from below|доод өнцөг|доороос)/i,
  high: /(high angle|from above|өндөр өнцөг|дээд өнцөг|дээрээс)/i,
  eye: /(eye[\s-]?level|нүдний түвшин)/i,
  dutch: /(dutch|canted|tilted horizon|налуу|ташуу)/i,
  reveal: /(reveal|establish|илчил|нээн үзүүл|танилцуул)/i,
  follow: /(follow|tracking shot|trail|дага|мөрд|хөтөл)/i,
  spiral: /(spiral|helix|corkscrew|мушги|эргэлдэн)/i,
  ecu: /(extreme close[\s-]?up|\becu\b|маш ойр)/i,
  cu: /(close[\s-]?up|\bcu\b|ойрын кадр|ойрхон)/i,
  mcu: /(medium close|\bmcu\b|дунд ойр)/i,
  ms: /(medium shot|\bms\b|дунд кадр)/i,
  fs: /(full shot|full body|\bfs\b|бүтэн бие|бүтэн кадр)/i,
  ws: /(wide shot|\bws\b|өргөн кадр|өргөн план)/i,
  ews: /(extreme wide|establishing shot|\bews\b|маш өргөн|ерөнхий план)/i,
  fast: /(fast|quick|rapid|snap|whip|energetic|хурдан|шуурхай|огцом)/i,
  slow: /(slow|gentle|gradual|leisurely|удаан|аажим|зөөлөн)/i
};
/* \b нь зөвхөн латин үсэгт ажилладаг тул монгол үгсийг зай/цэг таслалаар хүрээлж шалгана */
const SPLIT = /(?:\s*,\s*then\b|\bthen\b|\band then\b|\s*→\s*|\s*->\s*|\s*;\s*|(?:^|[\s,.;])(?:дараа\s+нь|тэгээд|дараа)(?=[\s,.;]|$))\s*/i;

function parseDuration(t) {
  const m = t.match(/(\d+(?:\.\d+)?)\s*(?:s\b|sec|second|секунд|сек)/i);
  if (m) return clamp(+m[1], .5, 60);
  if (RX.fast.test(t)) return 2.5;
  if (RX.slow.test(t)) return 9;
  return null;
}
function parseDeg(t) {
  const m = t.match(/(\d{2,3})\s*(?:°|deg|degree|градус)/i);
  if (m) return clamp(+m[1], 5, 720);
  if (/\b360\b|full (orbit|circle|rotation)|бүтэн тойр/i.test(t)) return 360;
  if (/\b270\b/.test(t)) return 270;
  if (/\b180\b|half (orbit|circle)|хагас тойр/i.test(t)) return 180;
  if (/\b90\b|quarter/i.test(t)) return 90;
  if (/\b45\b/.test(t)) return 45;
  return null;
}
/** Нэг өгүүлбэрээс камерын үйлдлүүдийг ялгах */
function parseClause(txt) {
  const t = ' ' + txt.toLowerCase() + ' ';
  const ops = [];
  const push = (k, o) => ops.push(Object.assign({ k }, o));

  if (RX.statik.test(t)) push('static');
  if (RX.orbit.test(t) || RX.spiral.test(t)) {
    const deg = parseDeg(t) || (RX.spiral.test(t) ? 200 : 120);
    const dir = RX.ccw.test(t) ? 1 : -1;              // өгөгдөөгүй бол цагийн зүүний дагуу
    push('orbit', { deg, dir, spiral: RX.spiral.test(t) });
  }
  if (RX.vert.test(t)) push('vertigo', { inward: !RX.pull.test(t) });
  else {
    if (RX.push.test(t)) push('push', { amt: /hard|strong|fast|хүчтэй/i.test(t) ? .42 : .62 });
    if (RX.pull.test(t)) push('pull', { amt: /far|way|hard|хол/i.test(t) ? 2.4 : 1.7 });
    if (RX.zoomI.test(t)) push('lens', { mul: .6 });
    if (RX.zoomO.test(t)) push('lens', { mul: 1.6 });
  }
  if (RX.craneU.test(t)) push('crane', { dy: /high|soar|өндөр/i.test(t) ? 3.4 : 1.7 });
  if (RX.craneD.test(t)) push('crane', { dy: /steep|hard|огцом/i.test(t) ? -3.0 : -1.5 });
  if (RX.tiltU.test(t)) push('tilt', { d: .9 });
  if (RX.tiltD.test(t)) push('tilt', { d: -.9 });
  if (RX.panL.test(t)) push('pan', { d: -1 });
  if (RX.panR.test(t)) push('pan', { d: 1 });
  if (RX.truckL.test(t)) push('truck', { d: -1 });
  if (RX.truckR.test(t)) push('truck', { d: 1 });
  if (RX.flyby.test(t)) push('flyby');
  if (RX.dutch.test(t)) push('dutch', { r: /extreme|хүчтэй/i.test(t) ? .38 : .22 });
  // жаазлалт
  const size = RX.ecu.test(t) ? 'ECU' : RX.mcu.test(t) ? 'MCU' : RX.cu.test(t) ? 'CU'
    : RX.ews.test(t) ? 'EWS' : RX.ws.test(t) ? 'WS' : RX.fs.test(t) ? 'FS' : RX.ms.test(t) ? 'MS' : null;
  if (size) push('size', { size });
  const ang = RX.topd.test(t) ? 'top' : RX.high.test(t) ? 'high' : RX.low.test(t) ? (/(worm|extreme|маш)/i.test(t) ? 'worm' : 'low') : RX.eye.test(t) ? 'eye' : null;
  if (ang) push('angle', { a: ang });
  if (RX.reveal.test(t) && !ops.some(o => o.k === 'pull' || o.k === 'orbit' || o.k === 'crane' || o.k === 'size')) push('pull', { amt: 2.2 });
  if (RX.follow.test(t)) push('follow');
  return ops;
}
const OPMN = {
  orbit: o => Math.round(o.deg) + '° ' + (o.dir > 0 ? 'цагийн зүүний эсрэг' : 'цагийн зүүний дагуу') + ' тойрох',
  push: () => 'ойртох (dolly in)', pull: () => 'ухрах (dolly out)',
  crane: o => o.dy > 0 ? 'дээш өргөгдөх (crane up)' : 'доош буух (crane down)',
  lens: o => o.mul < 1 ? 'зум ойртуулах' : 'зум холдуулах',
  vertigo: () => 'vertigo (dolly-zoom)', tilt: o => o.d > 0 ? 'дээш хазайх' : 'доош хазайх',
  pan: o => (o.d < 0 ? 'зүүн' : 'баруун') + ' тийш pan', truck: o => (o.d < 0 ? 'зүүн' : 'баруун') + ' тийш гулсах',
  flyby: () => 'хажуугаар нисэн өнгөрөх', dutch: () => 'налуу (dutch) өнцөг',
  size: o => 'жаазлалт → ' + (SIZES.find(s => s.ab === o.size) || {}).mn, angle: o => 'өнцөг → ' + ({ top: 'шувууны харц', high: 'өндөр өнцөг', eye: 'нүдний түвшин', low: 'доод өнцөг', worm: 'маш доод өнцөг' })[o.a],
  static: () => 'хөдөлгөөнгүй (locked off)', follow: () => 'дүрийг дагах (auto-target)'
};

/** Үйлдлүүдийг камерын төлөв рүү хэрэглэх → шинэ кадруудын жагсаалт */
function applyOps(from, ops) {
  const out = [];
  let s = cloneS(from);
  const orbit = ops.find(o => o.k === 'orbit');
  const other = ops.filter(o => o.k !== 'orbit' && o.k !== 'static' && o.k !== 'follow');
  // тойролтыг 120°-аас том бол хэсэгчилж хуваана (spline чиглэлийг тодорхой болгоно)
  if (orbit) {
    const steps = Math.max(1, Math.ceil(orbit.deg / 110));
    for (let i = 1; i <= steps; i++) {
      const n = cloneS(s);
      n.theta = s.theta + orbit.dir * (orbit.deg * Math.PI / 180) * (i / steps);
      if (orbit.spiral) { n.phi = clamp(s.phi - .5 * (i / steps), .12, 1.9); n.radius = s.radius * lerp(1, .7, i / steps); }
      out.push(clampS(n));
    }
  }
  let cur = out.length ? cloneS(out[out.length - 1]) : cloneS(s);
  let touched = false;
  other.forEach(o => {
    touched = true;
    if (o.k === 'push') cur.radius *= o.amt;
    else if (o.k === 'pull') cur.radius *= o.amt;
    else if (o.k === 'crane') { cur.target.y = clamp(cur.target.y + o.dy * .25, .1, 8); cur.phi = clamp(cur.phi - o.dy * .16, .1, 1.92); }
    else if (o.k === 'lens') cur.fov = clamp(cur.fov * o.mul, 8, 110);
    else if (o.k === 'vertigo') { if (o.inward) { cur.radius *= .5; cur.fov = clamp(cur.fov * 1.85, 8, 110); } else { cur.radius *= 2; cur.fov = clamp(cur.fov * .55, 8, 110); } }
    else if (o.k === 'tilt') cur.target.y = clamp(cur.target.y + o.d, .1, 8);
    else if (o.k === 'pan' || o.k === 'truck') {
      const P = posOf(cur), F = cur.target.clone().sub(P).setY(0).normalize();
      const R = new THREE.Vector3().crossVectors(F, new THREE.Vector3(0, 1, 0)).normalize();
      if (o.k === 'pan') { const T = cur.target.clone().addScaledVector(R, o.d * 1.8); cur = stateFromPT(P, T, cur.fov, cur.roll); }
      else { cur.theta += o.d * .28; }
    }
    else if (o.k === 'flyby') { cur.theta += .95; cur.radius *= 1.5; }
    else if (o.k === 'dutch') cur.roll = o.r;
    else if (o.k === 'size') cur.radius = radiusForSize(o.size, cur.fov);
    else if (o.k === 'angle') cur.phi = PHI_FOR[o.a];
  });
  if (touched) { clampS(cur); out.push(cur); }
  return out;
}

/** Гол функц: чөлөөт бичвэрээс түлхүүр кадруудыг үүсгэх */
function promptToCamera(text) {
  const raw = (text || '').trim();
  if (!raw) { toast('Эхлээд промтоо бичнэ үү', 'err'); return null; }
  const clauses = raw.split(SPLIT).map(s => s.trim()).filter(Boolean);
  const all = raw.toLowerCase();
  const recognised = [];

  let base = cloneS(state);
  base.target.copy(centroid());
  base.roll = 0;

  // эхний өгүүлбэрийн зөвхөн жаазлалт/өнцөг → эхлэлийн байрлал
  const first = parseClause(clauses[0] || '');
  const firstStatic = first.filter(o => o.k === 'size' || o.k === 'angle');
  const firstMotion = first.filter(o => o.k !== 'size' && o.k !== 'angle' && o.k !== 'static' && o.k !== 'follow');
  if (firstStatic.length && !firstMotion.length) {
    firstStatic.forEach(o => {
      if (o.k === 'size') base.radius = radiusForSize(o.size, base.fov);
      else base.phi = PHI_FOR[o.a];
      recognised.push('Эхлэл: ' + OPMN[o.k](o));
    });
    clampS(base);
  }
  const list = [cloneS(base)];
  const startIdx = (firstStatic.length && !firstMotion.length) ? 1 : 0;
  let anyMotion = false;

  for (let i = startIdx; i < clauses.length; i++) {
    const ops = parseClause(clauses[i]);
    if (!ops.length) continue;
    if (ops.some(o => o.k === 'follow')) { autoTarget = true; recognised.push(OPMN.follow()); }
    if (ops.length === 1 && ops[0].k === 'static') { recognised.push(OPMN.static()); continue; }
    const made = applyOps(list[list.length - 1], ops.filter(o => o.k !== 'follow'));
    if (made.length) { anyMotion = true; made.forEach(m => list.push(m)); }
    ops.forEach(o => { if (OPMN[o.k] && o.k !== 'follow') recognised.push(OPMN[o.k](o)); });
  }

  if (!anyMotion && !recognised.length) { toast('Камерын хөдөлгөөн танигдсангүй — жишээ промт дарж үзнэ үү', 'err'); return null; }
  if (!anyMotion) { // зөвхөн статик тайлбар
    list.push(cloneS(list[0]));
    recognised.push('хөдөлгөөнгүй барих');
  }
  if (RX.hand.test(all)) { shakeAmt = .55; recognised.push('гар камерын доргио (handheld)'); }
  const dur = parseDuration(all) || clamp(1.6 + list.length * 1.5, 2, 14);
  spreadKeys(list, dur);
  keys = list.slice(0, MAXK);
  activeK = 0;
  buildSpline();
  setFrame(fStart);
  Object.assign(state, cloneS(keys[0])); state.target.copy(keys[0].target);
  return { recognised: recognised, dur: dur, n: keys.length };
}

/* ─────────── 11. КАМЕР → ПРОМТ ─────────── */
const STYLES = [
  { v: 'cinematic lighting, shallow depth of field, film grain, anamorphic flare', l: 'Кино' },
  { v: 'photorealistic, natural light, physically based rendering, 8k detail', l: 'Бодит' },
  { v: 'anime style, clean line art, vivid saturated colors, cel shading', l: 'Аниме' },
  { v: 'documentary realism, available light, muted colors', l: 'Баримтат' },
  { v: 'epic fantasy, volumetric god rays, dramatic contrast', l: 'Туульс' },
  { v: 'vintage 35mm film, warm halation, soft highlights', l: '35мм' }
];
function analyseAll() {
  const raw = [];
  for (let i = 0; i < keys.length - 1; i++) raw.push({ a: keys[i], b: keys[i + 1], s: analyzePair(keys[i], keys[i + 1]) });
  // дараалсан ижил чиглэлийн тойролтуудыг нэг өгүүлбэр болгож нэгтгэнэ
  const out = [];
  let i = 0;
  while (i < raw.length) {
    let j = i;
    const sig = raw[i].s.KW.join('|');
    while (j + 1 < raw.length && raw[j + 1].s.KW.join('|') === sig && sig.indexOf('orbit') === 0) j++;
    if (j > i) {
      let acc = 0;
      for (let m = i; m <= j; m++) {
        let d = raw[m].b.theta - raw[m].a.theta;
        while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
        acc += d;
      }
      out.push(analyzePair(raw[i].a, raw[j].b, acc));
    } else out.push(raw[i].s);
    i = j + 1;
  }
  // зэргэлдээ сегментэд яг давтагдсан хэллэгийг хасна
  for (let k = 1; k < out.length; k++) {
    const pv = out[k - 1], cu = out[k];
    if (cu.static || pv.static) continue;
    const keep = cu.EN.map(e => pv.EN.indexOf(e) < 0);
    if (keep.some(Boolean) && keep.some(x => !x)) {
      out[k] = {
        EN: cu.EN.filter((_, n) => keep[n]), MN: cu.MN.filter((_, n) => keep[n]),
        KW: cu.KW.filter((_, n) => keep[n]), static: false
      };
    }
  }
  return out;
}
function buildPrompt() {
  const outEl = $('promptOut'), sumEl = $('mnSum');
  if (!outEl) return;
  const sceneTxt = ($('sceneTxt') && $('sceneTxt').value || '').trim();
  const styles = Array.from(document.querySelectorAll('.stl:checked')).map(x => x.value);
  const fmt = $('pformat').value, model = $('pmodel').value;
  const p = paceOf(), dur = durSec().toFixed(1).replace(/\.0$/, '');
  const env = ENVS[envId];
  let en = '', mn = '', shots = [];

  if (keys.length < 2) {
    const s = keys.length ? keys[0] : state, sz = shotSize(s), an = camAngle(s);
    en = 'Static ' + sz.en + ' of ' + subjEN() + ' from ' + an.en + ', ' + lensMM(s.fov) + 'mm lens, camera locked off on a tripod with no movement — the composition holds identically from the first frame to the last.';
    mn = 'Одоогоор <b>хөдөлгөөнгүй</b>: ' + sz.mn + ', ' + an.mn + ', ' + lensMM(s.fov) + 'mm. Хоёр ба түүнээс дээш түлхүүр кадр нэмбэл хөдөлгөөн автоматаар тайлагдана.';
  } else {
    const A = keys[0], Z = keys[keys.length - 1];
    const szA = shotSize(A), anA = camAngle(A), szZ = shotSize(Z), anZ = camAngle(Z);
    const segs = analyseAll();
    const allStatic = segs.every(s => s.static);
    shots = keys.map((k, i) => {
      const sz = shotSize(k), an = camAngle(k), ti = targetOf(k);
      return {
        i: i + 1, frame: k.frame, t: ((k.frame - fStart) / fps).toFixed(2),
        size: sz.ab, sizeEn: sz.en, sizeMn: sz.mn, angle: an.ab, angleEn: an.en, angleMn: an.mn,
        lens: lensMM(k.fov), dist: +k.radius.toFixed(2), height: +posOf(k).y.toFixed(2),
        roll: +((k.roll || 0) * 180 / Math.PI).toFixed(1), on: ti === null ? 'group' : 'subject ' + (ti + 1)
      };
    });

    if (allStatic) {
      en = 'Static locked-off ' + szA.en + ' of ' + subjEN() + ' from ' + anA.en + ' on ' + art(lensMM(A.fov)) + ' ' + lensMM(A.fov) + 'mm lens; the camera holds the exact framing for the whole ' + dur + '-second clip with no drift.';
      mn = 'Кадрууд бараг ижил тул үр дүн нь <b>хөдөлгөөнгүй</b>: ' + szA.mn + ', ' + anA.mn + '.';
    } else {
      const segEN = segs.map(s => s.static ? 'holds the frame for a beat' : s.EN.join(', and '));
      const segMN = segs.map(s => s.static ? 'түр барина' : s.MN.join(', мөн '));
      const core = 'The camera opens on ' + art(szA.en) + ' ' + szA.en + ' of ' + subjEN() + ' from ' + anA.en + ' on ' + art(lensMM(A.fov)) + ' ' + lensMM(A.fov) + 'mm lens, then ' + segEN.join(', then ') + ', settling on ' + art(szZ.en) + ' ' + szZ.en + ' from ' + anZ.en + ' at ' + lensMM(Z.fov) + 'mm.';
      const tail = 'One continuous ' + p.en + ' stabilized camera move over ' + dur + ' seconds' + (shakeAmt ? ', with subtle handheld shake' : '') + (autoTarget ? ', keeping ' + subjEN() + ' locked in frame throughout' : '') + '.';
      const kw = segs.flatMap(s => s.static ? ['hold'] : s.KW);

      if (fmt === 'kw') {
        en = 'camera: ' + kw.join(' → ') + ' | framing: ' + szA.ab + ' → ' + szZ.ab + ' | angle: ' + anA.en + ' → ' + anZ.en +
          ' | lens: ' + lensMM(A.fov) + 'mm → ' + lensMM(Z.fov) + 'mm | ' + p.en + ', single continuous take, ' + dur + 's, ' + $('aspect').value;
      } else if (fmt === 'shots') {
        en = shots.map(s => 'SHOT ' + s.i + ' (' + s.t + 's) — ' + s.sizeEn + ', ' + s.angleEn + ', ' + s.lens + 'mm, ' + s.dist + 'm from ' + s.on + (s.roll ? ', ' + s.roll + '° dutch' : ''))
          .join('\n') + '\n\nMOVE: ' + kw.join(' → ') + '  |  ' + p.en + '  |  ' + dur + 's total';
      } else if (fmt === 'json') {
        en = JSON.stringify({
          scene: sceneTxt || undefined,
          environment: env.en,
          subjects: people.length,
          aspect_ratio: $('aspect').value,
          duration_seconds: +dur, fps: fps,
          camera: {
            movement: kw, pace: p.en, continuous_take: true,
            handheld: !!shakeAmt, subject_lock: autoTarget,
            start: { framing: szA.ab, angle: anA.ab, lens_mm: lensMM(A.fov), distance_m: +A.radius.toFixed(2) },
            end: { framing: szZ.ab, angle: anZ.ab, lens_mm: lensMM(Z.fov), distance_m: +Z.radius.toFixed(2) },
            keyframes: shots
          },
          style: styles
        }, null, 2);
      } else {
        en = core + ' ' + tail;
      }
      mn = '<b>Эхлэл:</b> ' + szA.mn + ', ' + anA.mn + ' → ' + segMN.join(' → ') + ' → <b>Төгсгөл:</b> ' + szZ.mn + ', ' + anZ.mn +
        '.<br>Хурд: ' + p.mn + ' · ' + dur + 'с · ' + keys.length + ' кадр · ' + $('aspect').value +
        (allInFrame(Z) ? '' : '<br><span style="color:var(--warn)">⚠ Төгсгөлийн кадарт бүх дүр багтахгүй байж магадгүй.</span>');
    }
  }

  // Загварын дагуу угсрах
  let txt;
  if (fmt === 'json') {
    txt = en;
  } else {
    const parts = [];
    if (sceneTxt) parts.push(sceneTxt.replace(/\.?\s*$/, '.'));
    if ($('incEnv').checked) parts.push('Setting: ' + env.en + '.');
    parts.push(en);
    if (styles.length) parts.push(styles.join(', ') + '.');
    if ($('incNeg').checked && fmt !== 'shots') parts.push('Single continuous shot, no cuts, no camera jitter, consistent subject identity, stable horizon.');
    txt = parts.join(' ');
    if (model === 'veo') txt = txt + '\n\nCamera: ' + (keys.length >= 2 ? analyseAll().flatMap(s => s.KW).join(', ') || 'static' : 'static locked off') + '. Duration: ' + dur + 's. Aspect: ' + $('aspect').value + '.';
    else if (model === 'sora') {
      /* Sora нь урсгал кино өгүүлбэрийг илүү сайн уншдаг — хугацаа, харьцааг нэг мөрөнд */
      txt = txt.replace(/\s+/g, ' ') + ' Shot length about ' + dur + ' seconds, ' + $('aspect').value +
        ' frame, filmed as one continuous take.';
    }
    else if (model === 'runway') txt = txt.replace(/\s+/g, ' ');
    else if (model === 'kling') txt = txt + '\n\n[Camera movement]: ' + (keys.length >= 2 ? analyseAll().flatMap(s => s.KW).join(' → ') : 'fixed') + '\n[Duration]: ' + dur + 's';
  }
  outEl.textContent = txt;
  sumEl.innerHTML = mn;
  $('pLen').textContent = txt.length + ' тэмдэгт';
}
let promptTimer = null;
function schedulePrompt() { if (promptTimer) return; promptTimer = setTimeout(() => { promptTimer = null; buildPrompt(); }, 90); }

/* ─────────── 12. Бэлэн хөдөлгөөнүүд ─────────── */
function baseK() { const s = cloneS(state); s.target.copy(centroid()); return s; }
function K(b, m) {
  const s = cloneS(b);
  if (m.dTheta) s.theta += m.dTheta;
  if (m.phi !== undefined) s.phi = m.phi;
  if (m.rMul) s.radius *= m.rMul;
  if (m.fov) s.fov = m.fov;
  if (m.fovMul) s.fov *= m.fovMul;
  if (m.roll !== undefined) s.roll = m.roll;
  if (m.ty !== undefined) s.target.y = m.ty;
  if (m.size) s.radius = radiusForSize(m.size, s.fov);
  return clampS(s);
}
const PRESETS = [
  { l: 'Тойрох 90°', s: 'orbit 90°', d: 5, mk: b => [K(b, {}), K(b, { dTheta: -Math.PI / 4 }), K(b, { dTheta: -Math.PI / 2 })] },
  { l: 'Тойрох 360°', s: 'full orbit', d: 10, mk: b => [K(b, {}), K(b, { dTheta: -1.57 }), K(b, { dTheta: -3.14 }), K(b, { dTheta: -4.71 }), K(b, { dTheta: -6.283 })] },
  { l: 'Dolly in', s: 'push in', d: 4, mk: b => [K(b, {}), K(b, { rMul: .42 })] },
  { l: 'Dolly out', s: 'pull back', d: 5, mk: b => [K(b, {}), K(b, { rMul: 2.3 })] },
  { l: 'Кран илчлэлт', s: 'crane up reveal', d: 6.5, mk: b => [K(b, {}), K(b, { phi: .95, rMul: 1.35 }), K(b, { phi: .34, rMul: 1.9 })] },
  { l: 'Дээрээс бууж орох', s: 'drop in', d: 6, mk: b => [K(b, { phi: .28, rMul: 2.1 }), K(b, { phi: .8, rMul: 1.3 }), K(b, {})] },
  { l: 'Баатрын өргөлт', s: 'low hero push', d: 5, mk: b => [K(b, { rMul: 1.6, phi: 1.62 }), K(b, { rMul: .72, phi: 1.06 })] },
  { l: 'Ухарч илчлэх', s: 'pull reveal', d: 7, mk: b => [K(b, { size: 'CU', fov: 34 }), K(b, { size: 'MS', fov: 42 }), K(b, { size: 'EWS', fov: 58 })] },
  { l: 'Vertigo', s: 'dolly-zoom', d: 5, mk: b => [K(b, { fovMul: .62 }), K(b, { rMul: .48, fovMul: 1.85 })] },
  { l: 'Хажуугаар нисэх', s: 'fly-by', d: 6, mk: b => [K(b, { dTheta: 1.0, rMul: 1.9 }), K(b, { rMul: .7 }), K(b, { dTheta: -1.0, rMul: 1.9 })] },
  { l: 'Дээрээс шумбах', s: 'top dive', d: 6, mk: b => [K(b, { phi: .12, rMul: 1.7 }), K(b, { phi: .7, rMul: 1.1 }), K(b, { phi: 1.2, rMul: .8 })] },
  { l: 'Огцом pan', s: 'whip pan', d: 1.5, mk: b => {
      const P = posOf(b), F = b.target.clone().sub(P).setY(0).normalize();
      const R = new THREE.Vector3().crossVectors(F, new THREE.Vector3(0, 1, 0)).normalize();
      return [stateFromPT(P, b.target.clone().addScaledVector(R, -1.6), b.fov), stateFromPT(P, b.target.clone().addScaledVector(R, 1.6), b.fov)];
    } },
  { l: 'Мушгирсан өргөлт', s: 'spiral up', d: 8, mk: b => [K(b, { phi: 1.6, rMul: 1.2 }), K(b, { dTheta: -1.7, phi: 1.1, rMul: 1.0 }), K(b, { dTheta: -3.4, phi: .55, rMul: 1.5 })] },
  { l: 'Налуу ойртолт', s: 'dutch push', d: 4.5, mk: b => [K(b, { roll: 0 }), K(b, { rMul: .55, roll: .3 })] },
  { l: 'Тойрч ойртох', s: 'arc in', d: 6, mk: b => [K(b, { dTheta: .9, rMul: 1.6 }), K(b, { dTheta: .45, rMul: 1.1 }), K(b, { size: 'MCU' })] },
  { l: 'Мөрөн дээгүүр', s: 'over shoulder', d: 5, mk: b => {
      if (people.length < 2) return [K(b, {}), K(b, { rMul: .6 })];
      const a = people[0].position, c = people[1].position;
      const dir = new THREE.Vector3(a.x - c.x, 0, a.z - c.z).normalize();
      const P = new THREE.Vector3(a.x + dir.x * .9, 1.62, a.z + dir.z * .9);
      const T = new THREE.Vector3(c.x, 1.3, c.z);
      const s1 = stateFromPT(P, T, 45), s2 = cloneS(s1); s2.radius *= .72; s2.fov = 36;
      return [s1, clampS(s2)];
    } }
];

/* ── Авто найруулга: бүрэн дараалал үүсгэнэ ── */
const DIRSTYLES = {
  intro: { l: 'Танилцуулга', d: 8, mk: b => [K(b, { phi: .34, rMul: 2.6, fov: 52 }), K(b, { phi: .8, rMul: 1.7, fov: 46 }), K(b, { dTheta: -.7, size: 'MS', fov: 40 })] },
  drama: { l: 'Драм', d: 9, mk: b => [K(b, { size: 'WS', phi: 1.35 }), K(b, { dTheta: -.9, size: 'MS' }), K(b, { dTheta: -1.5, size: 'MCU', fov: 34 }), K(b, { size: 'CU', fov: 30, roll: .12 })] },
  action: { l: 'Экшн', d: 4.5, mk: b => [K(b, { dTheta: .8, rMul: 1.5, phi: 1.55, roll: -.2 }), K(b, { size: 'MS', phi: 1.2 }), K(b, { dTheta: -.9, size: 'MCU', roll: .25 })] },
  reveal: { l: 'Илчлэлт', d: 10, mk: b => [K(b, { size: 'ECU', fov: 28 }), K(b, { size: 'MCU', fov: 36 }), K(b, { size: 'FS', fov: 46, phi: 1.2 }), K(b, { size: 'EWS', fov: 58, phi: .6 })] },
  calm: { l: 'Тайван', d: 12, mk: b => [K(b, { dTheta: .35, rMul: 1.15 }), K(b, { dTheta: -.35, rMul: .92 })] }
};
function autoDirect(styleId) {
  const st = DIRSTYLES[styleId] || DIRSTYLES.drama;
  focusAll();
  const list = st.mk(baseK());
  spreadKeys(list, st.d);
  keys = list; activeK = 0;
  buildSpline(); setFrame(fStart);
  Object.assign(state, cloneS(keys[0])); state.target.copy(keys[0].target);
  $('fStart').value = fStart; $('fEnd').value = fEnd;
  syncAll(); commit('Авто найруулга: ' + st.l);
  toast('🎬 Авто найруулга: ' + st.l + ' — ' + keys.length + ' кадр / ' + st.d + 'с');
}

/* ─────────── 13. Харагдац ─────────── */
function focusAll() {
  const c = centroid();
  state.target.copy(c);
  state.radius = clamp(2.6 + spread() * 1.15 + people.length * .18, 2.2, 40);
  clampS(state);
}
function focusSel() {
  if (!active) { focusAll(); return; }
  state.target.set(active.position.x, active.userData.kind === 'person' ? 1.2 : .8, active.position.z);
  state.radius = clamp(state.radius, 1.2, 8);
  clampS(state);
}
function setView(v, back) {
  stopPlay(); if (camView) setCamView(false);
  if (v === '1') { state.theta = back ? Math.PI : 0; state.phi = Math.PI / 2 - .04; }
  else if (v === '3') { state.theta = back ? -Math.PI / 2 : Math.PI / 2; state.phi = Math.PI / 2 - .04; }
  else if (v === '7') { state.phi = back ? 1.93 : .07; }
  else if (v === 'f') { focusAll(); }
  state.roll = 0; clampS(state); onCamMove();
}

/* ─────────── 14. Properties самбарууд ─────────── */
function box(title, inner, folded) {
  return '<div class="box' + (folded ? ' fold' : '') + '"><h3>' + title + '</h3><div class="bd">' + inner + '</div></div>';
}
function buildUI() {
  const pg = PRESETS.map((p, i) => '<button class="pbtn" data-preset="' + i + '">' + p.l + '<small>' + p.s + '</small></button>').join('');
  const dirs = Object.keys(DIRSTYLES).map(k => '<button class="pbtn" data-dir="' + k + '">' + DIRSTYLES[k].l + '<small>' + DIRSTYLES[k].d + 's</small></button>').join('');
  const envs = Object.keys(ENVS).map(k => '<button class="pbtn" data-env="' + k + '">' + ENVS[k].nm + '</button>').join('');
  const stl = STYLES.map((s, i) => '<label><input type="checkbox" class="stl" value="' + s.v + '" data-i="' + i + '"> ' + s.l + '</label>').join('');

  $('pbody').innerHTML =
    /* ── КАМЕР ── */
    '<div class="page on" id="pgCam">' +
    box('◆ Түлхүүр кадрууд',
      '<div class="g4" style="margin-bottom:7px">' +
      '<button class="w" data-act="key">＋ I</button><button class="w" data-act="upd">Шинэчлэх</button>' +
      '<button class="w" data-act="delk">− Устгах</button><button class="w" data-act="clrk">Цэвэрлэх</button></div>' +
      '<div class="kfl" id="kfList"></div>' +
      '<p class="hint">Камераа байрлуулаад <b>I</b> дарж кадр нэмнэ. Цагийн шугам дээрх <b>◆</b>-г чирж хугацааг өөрчилнө.</p>') +
    box('🎞 Бэлэн хөдөлгөөн', '<div class="g2">' + pg + '</div>' +
      '<p class="hint">Бэлэн хөдөлгөөн нь одоогийн байрлал, дүрүүдэд тааруулж кадруудыг үүсгэнэ.</p>') +
    box('🎬 Авто найруулга', '<div class="g2">' + dirs + '</div>' +
      '<p class="hint">Нэг товшилтоор бүрэн камерын дараалал + промт үүснэ.</p>') +
    box('⚙ Камерын тохиргоо',
      '<div class="r"><label>Линз</label><input type="range" id="cLens" min="10" max="200" step="1" value="35"><span class="v" id="cLensV">35mm</span></div>' +
      '<div class="r"><label>Зай</label><input type="range" id="cDist" min="0.6" max="40" step="0.05" value="6"><span class="v" id="cDistV">6.0m</span></div>' +
      '<div class="r"><label>Өндөр</label><input type="range" id="cPhi" min="0.06" max="1.94" step="0.005" value="1.2"><span class="v" id="cPhiV">—</span></div>' +
      '<div class="r"><label>Roll</label><input type="range" id="cRoll" min="-45" max="45" step="1" value="0"><span class="v" id="cRollV">0°</span></div>' +
      '<div class="r"><label>Доргио</label><input type="range" id="cShake" min="0" max="100" step="1" value="0"><span class="v" id="cShakeV">0%</span></div>' +
      '<div class="r"><label style="width:auto">&nbsp;</label><label style="width:auto;display:flex;gap:6px;align-items:center;font-size:11px;color:var(--txt);cursor:pointer">' +
      '<input type="checkbox" id="cAuto"> Дүрийг үргэлж кадарт барих (auto-target)</label></div>') +
    '</div>' +

    /* ── ТАЙЗ ── */
    '<div class="page" id="pgScene">' +
    box('🧍 Дүрүүд',
      '<div class="r"><label>Тоо</label><input type="range" id="sCount" min="0" max="' + MAXP + '" step="1" value="2"><span class="v" id="sCountV">2</span></div>' +
      '<div class="g3" style="margin-top:7px"><button class="w" data-act="a:line">Эгнээ</button><button class="w" data-act="a:circle">Тойрог</button><button class="w" data-act="a:face">Нүүр тулан</button>' +
      '<button class="w" data-act="a:wedge">Шаантаг</button><button class="w" data-act="a:rand">Санамсаргүй</button><button class="w" data-act="delPerson">− Хасах</button></div>' +
      '<div class="r" style="margin-top:9px"><label>Хөдөлгөөн</label><select class="w" id="anim">' +
      '<option value="idle">Амьсгалах (idle)</option><option value="walk">Алхах</option><option value="talk">Ярих</option><option value="off">Хөдөлгөөнгүй</option></select></div>') +
    box('🌄 Орчин', '<div class="g2">' + envs + '</div>') +
    box('📥 Blender-ээс 3D загвар',
      '<button class="big" data-act="import">📥 3D файл оруулах (.glb / .obj)</button>' +
      '<div id="modelList" style="margin-top:8px"></div>' +
      '<p class="hint">Blender дээр <b>File ▸ Export ▸ glTF 2.0 (.glb)</b> гэж гаргаад энэ товчоор оруулна. ' +
      'Файлыг цонх руу шууд <b>чирж хаяад</b> ч болно. Оруулсан загвараа <b>G</b> зөөх, <b>R</b> эргүүлэх, ' +
      '<b>S</b> хэмжээ, <b>X</b> устгана. <b>.blend</b> файлыг хөтөч уншиж чадахгүй тул заавал экспортлоорой.</p>') +
    box('🌲 Объект',
      '<div class="g3"><button class="w" data-act="p:tree">Мод</button><button class="w" data-act="p:rock">Чулуу</button><button class="w" data-act="p:box">Хайрцаг</button>' +
      '<button class="w" data-act="p:ger">Гэр</button><button class="w" data-act="p:fire">Гал</button><button class="w" data-act="p:pole">Багана</button></div>' +
      '<p class="hint">Объектыг товшиж сонгоод <b>G</b> зөөх, <b>R</b> эргүүлэх, <b>S</b> хэмжээ, <b>X</b> устгана.</p>') +
    '</div>' +

    /* ── ПРОМТ ── */
    '<div class="page" id="pgPrompt">' +
    box('✨ Промтоос камер удирдах',
      '<textarea class="w" id="inPrompt" rows="3" placeholder="Жишээ: slow 180° orbit clockwise around the two warriors, then push in to a close-up, low angle, 8 seconds"></textarea>' +
      '<button class="big gr" id="btnParse" style="margin-top:7px">⚡ Задлан шинжлээд камер үүсгэх</button>' +
      '<div class="chips" id="exChips" style="margin-top:8px"></div>' +
      '<div class="chips" id="tagChips" style="margin-top:8px"></div>' +
      '<p class="hint">Монгол, англи хоёулаа ажиллана. <b>«тэгээд / then / →»</b> гэж салгаж олон үе шаттай хөдөлгөөн бичиж болно.</p>') +
    box('🖼 Дүр зургийн тайлбар',
      '<textarea class="w" id="sceneTxt" rows="3" placeholder="two Mongolian warriors facing each other on the open steppe at dusk…"></textarea>' +
      '<div class="styles" style="margin-top:8px">' + stl + '</div>') +
    box('📝 Гарсан промт',
      '<div class="r"><label>Хэлбэр</label><select class="w" id="pformat">' +
      '<option value="cine">Кино өгүүлбэр</option><option value="kw">Товч түлхүүр үг</option>' +
      '<option value="shots">Шотын жагсаалт</option><option value="json">JSON (API)</option></select></div>' +
      '<div class="r"><label>Загвар</label><select class="w" id="pmodel">' +
      '<option value="generic">Ерөнхий</option><option value="veo">Veo</option><option value="sora">Sora</option>' +
      '<option value="runway">Runway</option><option value="kling">Kling</option></select></div>' +
      '<div class="styles" style="margin-bottom:8px"><label><input type="checkbox" id="incEnv" checked> Орчин оруулах</label>' +
      '<label><input type="checkbox" id="incNeg" checked> Тогтвортой байдлын заавар</label></div>' +
      '<div class="sum" id="mnSum"></div><div class="kbox" id="promptOut"></div>' +
      '<div style="display:flex;gap:6px;margin-top:7px"><button class="big" id="copyBtn">📋 Хуулах</button>' +
      '<button class="w" id="btnTxt" style="flex:none;padding:9px 12px">.txt</button></div>' +
      '<p class="hint" id="pLen"></p>') +
    '</div>' +

    /* ── ЭКСПОРТ ── */
    '<div class="page" id="pgOut">' +
    box('📦 Төсөл', '<div class="g3"><button class="w" data-act="save">💾 Хадгалах</button><button class="w" data-act="open">📂 Нээх</button><button class="w" data-act="new">✨ Шинэ</button></div>' +
      '<p class="hint">JSON нь кадр, дүр, объект, орчин, промтын тохиргоог бүгдийг хадгална.</p>') +
    box('🖼 Зураг', '<div class="g2"><button class="w" data-act="png">Одоогийн кадр PNG</button><button class="w" data-act="board">Storyboard PNG</button></div>' +
      '<p class="hint">PNG-г AI видео хэрэгсэлдээ <b>эхний фрейм</b> болгон өгвөл промттой хослоод үр дүн эрс сайжирна.</p>') +
    box('🔶 Blender экспорт',
      '<button class="big" data-act="py">🐍 Blender скрипт (.py) татах</button>' +
      '<p class="hint">Blender дээр <b>Scripting</b> таб → <b>Open</b> → скриптийг сонгоод <b>Run</b>. Камер, түлхүүр кадр, линзний анимаци, дүрүүдийн байрлал бүгд үүснэ (Blender 4.x / 5.x).</p>') +
    box('📊 Өгөгдөл', '<div class="g2"><button class="w" data-act="csv">Кадрын CSV</button><button class="w" data-act="txt">Промт .txt</button></div>') +
    '</div>' +

    /* ── СЭРГЭЭХ БА ЗАСАХ ── */
    '<div class="page" id="pgFix">' +
    box('🩺 Оношилгоо ба автомат засвар',
      '<div class="g2" style="margin-bottom:8px">' +
      '<button class="w" data-act="diag">🩺 Шалгах</button>' +
      '<button class="w" data-act="fixall">🩹 Бүгдийг засах</button></div>' +
      '<div class="sum" id="fixSum">Шалгалт хийгдээгүй байна.</div>' +
      '<div id="fixList"></div>' +
      '<p class="hint">Шалгалт нь эвдэрсэн тоон утга, мужаас гарсан кадр, давхарласан кадр, газрын доорх камер, кадарт багтаагүй дүр, хэт хурдан эргэлт, илүүдэл кадр зэрэг <b>24 зүйлийг</b> хардаг. Засвар бүрийг <b>Ctrl+Z</b>-ээр буцаана.</p>') +
    box('✨ Автомат сайжруулалт',
      '<button class="big gr" data-act="enhauto">⚡ Бүрэн автоматаар сайжруулах</button>' +
      '<div class="r" style="margin-top:10px"><label>Хүч</label><input type="range" id="enhAmt" min="5" max="100" step="5" value="40"><span class="v" id="enhAmtV">40%</span></div>' +
      '<div class="g2">' +
      '<button class="pbtn" data-enh="smooth">Гөлгөр болгох<small>smooth keys</small></button>' +
      '<button class="pbtn" data-enh="jit">Чичрэлт арилгах<small>de-jitter</small></button>' +
      '<button class="pbtn" data-enh="clean">Илүүдэл кадр хасах<small>clean keyframes</small></button>' +
      '<button class="pbtn" data-enh="retime">Хурдыг жигдрүүлэх<small>re-time</small></button>' +
      '<button class="pbtn" data-enh="fit">Жаазлалт засах<small>auto-frame</small></button>' +
      '<button class="pbtn" data-enh="level">Хаяа тэгшлэх<small>level horizon</small></button>' +
      '<button class="pbtn" data-enh="ease">Зөөлөн эхлэл-төгсгөл<small>ease in / out</small></button>' +
      '</div>' +
      '<div class="hint" id="enhRep">Бүрэн автомат нь: алдаа засах → чичрэлт арилгах → хаяа тэгшлэх → илүүдэл кадр хасах → жаазлалт засах → хурд жигдрүүлэх → зам гөлгөрүүлэх → зөөлөн эхлэл-төгсгөл.</div>') +
    box('⟲ Түүх — буцаах ба дахих',
      '<div class="g2" style="margin-bottom:7px">' +
      '<button class="w" id="btnUndo" data-act="undo">↶ Буцаах<i></i></button>' +
      '<button class="w" id="btnRedo" data-act="redo">↷ Дахих</button></div>' +
      '<div class="hist" id="histList"></div>' +
      '<p class="hint"><b>Ctrl+Z</b> буцаах · <b>Ctrl+Shift+Z</b> дахих. Жагсаалтын аль ч мөрийг дарж тэр агшин руу шууд буцна. <span id="histInfo"></span></p>') +
    box('💾 Авто хадгалалт ба сэргээлт',
      '<div class="r"><label>Авто хадгалах</label><label style="width:auto;display:flex;gap:6px;align-items:center;font-size:11px;cursor:pointer">' +
      '<input type="checkbox" id="asChk" checked> асаах</label>' +
      '<select class="w" id="asEvery" style="flex:none;width:96px">' +
      '<option value="15">15 секунд</option><option value="30" selected>30 секунд</option>' +
      '<option value="60">1 минут</option><option value="120">2 минут</option><option value="300">5 минут</option></select></div>' +
      '<div class="g2" style="margin:8px 0"><button class="w" data-act="asnow">💾 Одоо хадгалах</button>' +
      '<button class="w" data-act="asclear">🗑 Цэвэрлэх</button></div>' +
      '<div class="hint" id="asInfo"></div>' +
      '<div class="aslist" id="asList"></div>' +
      '<p class="hint">Хадгалалт нь таны хөтөч дотор (localStorage) хадгалагдана — интернэт шаардахгүй. Гэнэт хаагдсан ч дараагийн нээлтэд <b>«Сэргээх»</b> зурвас гарч ирнэ. Бүр найдвартай нь: <b>Ctrl+S</b>-ээр .json файл болгон компьютерт хадгалах.</p>') +
    '</div>';

  $('exChips').innerHTML = EXAMPLES.map((e, i) => '<button class="chip" data-ex="' + i + '">' + e.l + '</button>').join('');
}
const EXAMPLES = [
  { l: '360° тойрох', t: 'slow full 360 degree orbit clockwise around the subjects, eye level, 10 seconds' },
  { l: 'Ойртох CU', t: 'medium shot, then push in slowly to a close-up, 5 seconds' },
  { l: 'Кран илчлэлт', t: 'low angle hero shot, then crane up high and pull back to an extreme wide establishing shot, 8 seconds' },
  { l: 'Vertigo', t: 'dolly zoom vertigo effect on the subject, slow, 6 seconds' },
  { l: 'Дроны шумбалт', t: "bird's eye aerial, then swoop down and orbit 90 degrees counter-clockwise into a medium shot, 7 seconds" },
  { l: 'Гар камер', t: 'handheld documentary tracking shot, follow the subjects, push in to a medium close-up, fast' },
  { l: 'Монголоор', t: 'доод өнцгөөс эхэлж 180 градус цагийн зүүний дагуу тойроод, тэгээд ойртож ойрын кадр болно, 8 секунд' },
  { l: 'Налуу экшн', t: 'fast whip pan right, then dutch angle push in hard to a close-up, 3 seconds' }
];

/** Оруулсан ба дутуу загваруудын жагсаалт (🧍 таб) */
function refreshModels() {
  const el = $('modelList'); if (!el) return;
  const list = props.filter(p => p.userData.kind === 'model');
  if (!list.length) { el.innerHTML = ''; return; }
  el.innerHTML = list.map((p, i) => {
    const miss = !!p.userData.missing;
    return '<div class="arow"><span class="ic">' + (miss ? '⚠' : '📦') + '</span>' +
      '<span class="d">' + (p.userData.file || p.userData.name) +
      '<small>' + (miss ? 'файл дутуу — дахин оруулна уу' : (p.userData.h || '?') + 'м өндөр') + '</small></span>' +
      (miss ? '<button class="w" data-act="import">Оруулах</button>'
            : '<button class="w" data-mfocus="' + props.indexOf(p) + '">Очих</button>') +
      '</div>';
  }).join('');
}

/* ─────────── 15. Outliner ─────────── */
function refreshOutliner() {
  const t = $('otree'); if (!t) return;
  let h = '<div class="orow" data-o="scene"><span class="ico">🗀</span><span class="nm">Scene Collection</span></div>';
  h += '<div class="orow d1" data-o="cam"><span class="ico" style="color:#74a2ff">🎥</span><span class="nm">ShotCam · ' + keys.length + ' кадр</span></div>';
  h += '<div class="orow d1"><span class="ico">🗀</span><span class="nm">Subjects (' + people.length + ')</span></div>';
  people.forEach((p, i) => {
    h += '<div class="orow d2' + (active === p ? ' act' : '') + (p.userData.vis ? '' : ' hid') + '" data-p="' + i + '">' +
      '<span class="ico" style="color:#' + PALETTE[p.userData.ci % PALETTE.length].toString(16).padStart(6, '0') + '">●</span>' +
      '<span class="nm">' + p.userData.name + '</span><button class="eye" data-eye="p' + i + '">' + (p.userData.vis ? '👁' : '⃠') + '</button></div>';
  });
  h += '<div class="orow d1"><span class="ico">🗀</span><span class="nm">Props (' + props.length + ')</span></div>';
  props.forEach((p, i) => {
    h += '<div class="orow d2' + (active === p ? ' act' : '') + (p.userData.vis ? '' : ' hid') + '" data-r="' + i + '">' +
      '<span class="ico">▣</span><span class="nm">' + p.userData.name + '</span><button class="eye" data-eye="r' + i + '">' + (p.userData.vis ? '👁' : '⃠') + '</button></div>';
  });
  h += '<div class="orow d1"><span class="ico">☀</span><span class="nm">' + ENVS[envId].nm + '</span></div>';
  t.innerHTML = h;
  $('oCount').textContent = (people.length + props.length) + ' объект';
}
function refreshKeyList() {
  const el = $('kfList'); if (!el) return;
  if (!keys.length) { el.innerHTML = '<p class="hint" style="margin:0">Кадр алга — камераа байрлуулаад <b>I</b> дарна уу.</p>'; return; }
  el.innerHTML = keys.map((k, i) => {
    const sz = shotSize(k), an = camAngle(k);
    return '<div class="kfr' + (i === activeK ? ' on' : '') + '" data-k="' + i + '">' +
      '<span class="n">' + (i + 1) + '</span><span class="f">f' + k.frame + '</span>' +
      '<span class="d">' + sz.ab + ' · ' + an.mn + ' · ' + lensMM(k.fov) + 'mm · ' + k.radius.toFixed(1) + 'm</span>' +
      '<button class="rm" data-kdel="' + i + '">✕</button></div>';
  }).join('');
}
function refreshNPanel() {
  const s = camView ? sampleFrame(curFrame) : state;
  if (active) {
    $('nObj').textContent = active.userData.name;
    if (document.activeElement !== $('nx')) $('nx').value = active.position.x.toFixed(2);
    if (document.activeElement !== $('ny')) $('ny').value = active.position.z.toFixed(2);
    if (document.activeElement !== $('nr')) $('nr').value = (active.rotation.y * 180 / Math.PI).toFixed(0);
  } else { $('nObj').textContent = '— сонгоогүй —'; }
  const p = posOf(s), sz = shotSize(s), an = camAngle(s);
  $('nDist').textContent = s.radius.toFixed(2) + ' m';
  $('nLens').textContent = lensMM(s.fov) + ' mm';
  $('nHgt').textContent = p.y.toFixed(2) + ' m';
  $('nRoll').textContent = ((s.roll || 0) * 180 / Math.PI).toFixed(0) + '°';
  $('nSize').textContent = sz.ab;
  $('nAng').textContent = an.mn;
  const cl = $('cLens'); if (cl && document.activeElement !== cl) { cl.value = lensMM(state.fov); $('cLensV').textContent = lensMM(state.fov) + 'mm'; }
  const cd = $('cDist'); if (cd && document.activeElement !== cd) { cd.value = Math.min(40, state.radius); $('cDistV').textContent = state.radius.toFixed(1) + 'm'; }
  const cp = $('cPhi'); if (cp && document.activeElement !== cp) { cp.value = state.phi; $('cPhiV').textContent = camAngle(state).mn.split(' ')[0]; }
  const cr2 = $('cRoll'); if (cr2 && document.activeElement !== cr2) { cr2.value = Math.round((state.roll || 0) * 180 / Math.PI); $('cRollV').textContent = cr2.value + '°'; }
}
function refreshCount() {
  $('subCount').textContent = people.length + ' хүн';
  $('subMinus').disabled = people.length <= 0;
  $('subPlus').disabled = people.length >= MAXP;
  const sc = $('sCount'); if (sc) { sc.value = people.length; $('sCountV').textContent = people.length; }
}
function syncAll() {
  buildSpline(); rebuildHelpers(); refreshCount(); refreshOutliner(); refreshKeyList(); refreshNPanel(); refreshModels();
  $('sbKeys').textContent = keys.length;
  $('sbDur').textContent = durSec().toFixed(2) + 'с / ' + (fEnd - fStart) + ' фрейм';
  $('tlInfo').textContent = keys.length + ' кадр · ' + durSec().toFixed(2) + 's · ' + fps + 'fps';
  drawTimeline(); buildPrompt();
}

/* ─────────── 16. 3D туслах гизмо ─────────── */
const helpers = new THREE.Group(); overlay3d.add(helpers);
function keyColor(i) {
  /* Blender: select #ed5700 → zaxis #2890ff  (идэвхтэйг нь тусад нь #ffa028-аар зурна) */
  if (i === activeK) return srgb(0xffa028);
  return srgb(0xed5700).lerp(srgb(0x2890ff), keys.length > 1 ? i / (keys.length - 1) : 0);
}
function camGizmo(color, big) {
  const g = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ color, wireframe: true, depthTest: false, transparent: true, opacity: .95 });
  const k = big ? 1.35 : 1;
  const b = new THREE.Mesh(new THREE.BoxGeometry(.28 * k, .2 * k, .32 * k), m);
  const l = new THREE.Mesh(new THREE.ConeGeometry(.12 * k, .22 * k, 4), m);
  l.rotation.x = Math.PI / 2; l.rotation.y = Math.PI / 4; l.position.z = .27 * k;
  g.add(b, l); g.renderOrder = 4;
  return g;
}
function rebuildHelpers() {
  while (helpers.children.length) {
    const c = helpers.children[0];
    helpers.remove(c);
    if (c.geometry) c.geometry.dispose();
  }
  const okKey = k => k && isFinite(k.theta) && isFinite(k.phi) && isFinite(k.radius) && isFinite(k.fov) &&
    k.target && isFinite(k.target.x) && isFinite(k.target.y) && isFinite(k.target.z);
  keys.forEach((k, i) => {
    if (!okKey(k)) return;                      /* эвдэрсэн кадрыг зурахгүй — 🩹 таб дээр засна */
    const gz = camGizmo(keyColor(i).getHex(), i === activeK);
    const p = posOf(k); gz.position.copy(p);
    gz.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), k.target.clone().sub(p).normalize());
    helpers.add(gz);
  });
  if (keys.length >= 2 && sp && keys.every(okKey)) {
    const pts = [], N = Math.max(40, keys.length * 22);
    const f0 = keys[0].frame, f1 = keys[keys.length - 1].frame;
    for (let i = 0; i <= N; i++) pts.push(posOf(sampleFrame(lerp(f0, f1, i / N))));
    helpers.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: srgb(0x2890ff), transparent: true, opacity: .75 })));
    const tp = [];
    for (let i = 0; i <= N; i++) tp.push(sampleFrame(lerp(f0, f1, i / N)).target);
    let moves = false;
    for (let i = 1; i < keys.length; i++) if (keys[i].target.distanceTo(keys[0].target) > .25) { moves = true; break; }
    if (moves && !autoTarget) {
      const tl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tp),
        new THREE.LineDashedMaterial({ color: srgb(0xffa028), dashSize: .22, gapSize: .18, transparent: true, opacity: .35 }));
      tl.computeLineDistances();
      helpers.add(tl);
    }
  }
}

/* ─────────── 17. Цагийн шугам зурах ─────────── */
const tlc = $('tlc'), tctx = tlc.getContext('2d');
let tlDrag = null;
const TLPAD = 34;
function tlW() { return tlc.clientWidth; }
const f2x = f => TLPAD + (f - fStart) / Math.max(1, fEnd - fStart) * (tlW() - TLPAD - 14);
const x2f = x => fStart + (x - TLPAD) / Math.max(1, tlW() - TLPAD - 14) * (fEnd - fStart);

function drawTimeline() {
  const w = tlc.clientWidth, h = tlc.clientHeight, dpr = Math.min(devicePixelRatio, 2);
  if (!w || !h) return;
  if (tlc.width !== Math.floor(w * dpr) || tlc.height !== Math.floor(h * dpr)) {
    tlc.width = Math.floor(w * dpr); tlc.height = Math.floor(h * dpr);
  }
  tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  tctx.clearRect(0, 0, w, h);
  /* space_action.back #303030 · regions.scrubbing.back ба channels.back #1d1d1d */
  tctx.fillStyle = '#303030'; tctx.fillRect(0, 0, w, h);
  tctx.fillStyle = '#1d1d1d'; tctx.fillRect(0, 0, w, 20);
  tctx.fillStyle = '#1d1d1d'; tctx.fillRect(0, 20, TLPAD, h - 20);
  /* common.anim.channels #194e8080 — ShotCam сувгийн мөр */
  tctx.fillStyle = 'rgba(25,78,128,.5)'; tctx.fillRect(TLPAD, 28, w - TLPAD, 22);
  tctx.fillStyle = 'rgba(15,44,77,.5)'; tctx.fillRect(TLPAD, 50, w - TLPAD, 20);

  const span = Math.max(1, fEnd - fStart);
  let step = 1;
  const cand = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
  for (let i = 0; i < cand.length; i++) { if (span / cand[i] <= 14) { step = cand[i]; break; } step = cand[i]; }
  tctx.font = '9px JetBrains Mono, monospace'; tctx.textAlign = 'center'; tctx.lineWidth = 1;
  for (let f = Math.ceil(fStart / step) * step; f <= fEnd; f += step) {
    const x = f2x(f);
    tctx.strokeStyle = '#161616'; tctx.beginPath(); tctx.moveTo(x, 20); tctx.lineTo(x, h); tctx.stroke();   /* space_action.grid */
    tctx.strokeStyle = '#3d3d3d'; tctx.beginPath(); tctx.moveTo(x, 13); tctx.lineTo(x, 20); tctx.stroke();
    tctx.fillStyle = '#808080'; tctx.fillText(f, x, 10);                                                     /* regions.scrubbing.text */
  }
  // сувгийн шошго
  tctx.textAlign = 'left'; tctx.fillStyle = '#b8b8b8'; tctx.font = '9.5px Inter, sans-serif';   /* regions.channels.text */
  tctx.fillText('ShotCam', 5, 40);
  tctx.fillStyle = '#b8b8b8'; tctx.globalAlpha = .75; tctx.fillText('Subj', 5, 60); tctx.globalAlpha = 1;

  // хөдөлгөөний зурвас (кадр хоорондын хурд)
  if (keys.length >= 2) {
    const y = 52;
    for (let i = 0; i < keys.length - 1; i++) {
      const x0 = f2x(keys[i].frame), x1 = f2x(keys[i + 1].frame);
      const a = keys[i], b = keys[i + 1];
      const mag = Math.min(1, (Math.abs(b.theta - a.theta) * 1.2 + Math.abs(b.radius - a.radius) / 6 + Math.abs(posOf(b).y - posOf(a).y) / 3) / 2);
      const dt = Math.max(1, (b.frame - a.frame)) / fps;
      const sp2 = Math.min(1, mag / dt * 1.6);
      tctx.fillStyle = 'rgba(' + Math.round(80 + sp2 * 160) + ',' + Math.round(140 - sp2 * 70) + ',' + Math.round(190 - sp2 * 110) + ',.5)';
      tctx.fillRect(x0, y, Math.max(2, x1 - x0), 7);
    }
  }
  // түлхүүр кадрын алмаз
  const ky = 40;
  keys.forEach((k, i) => {
    const x = f2x(k.frame), on = i === activeK;
    tctx.save(); tctx.translate(x, ky); tctx.rotate(Math.PI / 4);
    const s = on ? 6 : 5;
    /* common.anim.keyframe #bfbfbf · keyframe_selected #ffbe33 · keyborder #000000 */
    tctx.fillStyle = on ? '#ffbe33' : '#bfbfbf';
    tctx.strokeStyle = '#000000'; tctx.lineWidth = 1;
    tctx.fillRect(-s, -s, s * 2, s * 2); tctx.strokeRect(-s, -s, s * 2, s * 2);
    tctx.restore();
    tctx.fillStyle = on ? '#ffbe33' : '#838383'; tctx.font = '8px JetBrains Mono'; tctx.textAlign = 'center';
    tctx.fillText(i + 1, x, ky + 18);
  });
  // одоогийн фрейм
  const cx = f2x(curFrame);
  tctx.strokeStyle = '#4772b3'; tctx.lineWidth = 1.5;
  tctx.beginPath(); tctx.moveTo(cx, 4); tctx.lineTo(cx, h); tctx.stroke();
  tctx.fillStyle = '#4772b3';
  tctx.font = '9.5px JetBrains Mono';                       /* хэмжихээсээ өмнө фонтоо тавина */
  const lbl = String(curFrame), tw = tctx.measureText(lbl).width + 12;
  tctx.fillRect(cx - tw / 2, 1, tw, 15);
  tctx.fillStyle = '#fff'; tctx.font = '9.5px JetBrains Mono'; tctx.textAlign = 'center';
  tctx.fillText(lbl, cx, 12);
}
function tlPick(x) {
  let best = -1, bd = 9;
  keys.forEach((k, i) => { const d = Math.abs(f2x(k.frame) - x); if (d < bd) { bd = d; best = i; } });
  return best;
}
tlc.addEventListener('pointerdown', e => {
  tlc.setPointerCapture(e.pointerId);
  const r = tlc.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  const hit = y > 26 && y < 56 ? tlPick(x) : -1;
  if (hit >= 0) { activeK = hit; tlDrag = { k: hit }; gotoKey(hit); }
  else { tlDrag = { scrub: true }; stopPlay(); setFrame(x2f(x)); if (!camView && keys.length >= 2) { const s = sampleFrame(curFrame); Object.assign(state, s); state.target.copy(s.target); } }
  drawTimeline();
});
tlc.addEventListener('pointermove', e => {
  if (!tlDrag) return;
  const r = tlc.getBoundingClientRect(), x = e.clientX - r.left;
  if (tlDrag.scrub) {
    setFrame(x2f(x));
    if (keys.length >= 2) { const s = sampleFrame(curFrame); Object.assign(state, s); state.target.copy(s.target); refreshNPanel(); }
  } else {
    const k = keys[tlDrag.k]; if (!k) return;
    k.frame = clamp(Math.round(x2f(x)), fStart, fEnd);
    keys.sort((a, b) => a.frame - b.frame);
    tlDrag.k = keys.indexOf(k); activeK = tlDrag.k;
    buildSpline(); rebuildHelpers(); refreshKeyList(); drawTimeline(); schedulePrompt();
  }
});
tlc.addEventListener('pointerup', () => { if (tlDrag && !tlDrag.scrub) commit('Кадрын хугацаа'); tlDrag = null; });
tlc.addEventListener('pointercancel', () => { if (tlDrag && !tlDrag.scrub) commit('Кадрын хугацаа'); tlDrag = null; });

/* ─────────── 18. 2D Overlay (гизмо + кадрын хүрээ) ─────────── */
const ovl = $('ovl'), octx = ovl.getContext('2d');
let showOverlay = true, showGuides = true, showPip = true, shading = 'solid';

function camRect(cw, ch) {                     // камерын кадрын тэгш өнцөгт (CSS px)
  const ar = shotAspect(), m = .90;
  let w = cw * m, h = w / ar;
  if (h > ch * m) { h = ch * m; w = h * ar; }
  return { x: (cw - w) / 2, y: (ch - h) / 2 + 8, w, h };
}
function drawOverlay(cw, ch) {
  const dpr = Math.min(devicePixelRatio, 2);
  if (ovl.width !== Math.floor(cw * dpr) || ovl.height !== Math.floor(ch * dpr)) {
    ovl.width = Math.floor(cw * dpr); ovl.height = Math.floor(ch * dpr);
    ovl.style.width = cw + 'px'; ovl.style.height = ch + 'px';
  }
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  octx.clearRect(0, 0, cw, ch);

  if (camView) {
    const r = camRect(cw, ch);
    octx.strokeStyle = 'rgba(255,160,40,.9)'; octx.lineWidth = 1.5;   /* space_view3d.active */
    octx.strokeRect(r.x - .5, r.y - .5, r.w + 1, r.h + 1);
    if (showGuides) {
      octx.strokeStyle = 'rgba(255,255,255,.16)'; octx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        octx.beginPath(); octx.moveTo(r.x + r.w * i / 3, r.y); octx.lineTo(r.x + r.w * i / 3, r.y + r.h); octx.stroke();
        octx.beginPath(); octx.moveTo(r.x, r.y + r.h * i / 3); octx.lineTo(r.x + r.w, r.y + r.h * i / 3); octx.stroke();
      }
      octx.strokeStyle = 'rgba(255,255,255,.1)';
      octx.strokeRect(r.x + r.w * .05, r.y + r.h * .05, r.w * .9, r.h * .9);
      octx.strokeStyle = 'rgba(255,255,255,.28)';
      octx.beginPath(); octx.moveTo(r.x + r.w / 2 - 7, r.y + r.h / 2); octx.lineTo(r.x + r.w / 2 + 7, r.y + r.h / 2);
      octx.moveTo(r.x + r.w / 2, r.y + r.h / 2 - 7); octx.lineTo(r.x + r.w / 2, r.y + r.h / 2 + 7); octx.stroke();
    }
    /* Камерын нэрийг хүрээний ДОТОР доод талд — зүүн дээд талын HUD-тай давхцахгүй */
    octx.fillStyle = 'rgba(255,160,40,.95)'; octx.font = '600 10px JetBrains Mono, monospace'; octx.textAlign = 'left';
    octx.fillText('ShotCam · ' + $('aspect').value + ' · ' + lensMM(state.fov) + 'mm · f' + curFrame, r.x + 5, r.y + r.h - 7);
    if (playing) {
      octx.fillStyle = '#f22e23'; octx.beginPath();   /* before_current_frame */ octx.arc(r.x + r.w - 14, r.y + 12, 4.5, 0, TAU); octx.fill();
      octx.fillStyle = '#fff'; octx.font = '600 9px JetBrains Mono'; octx.textAlign = 'right';
      octx.fillText('REC', r.x + r.w - 22, r.y + 15);
    }
  }
  if (!showOverlay) return;
  // навигацийн гизмо (Blender тэмдэглэгээ: Z дээш)
  const gx = 44, gy = ch - 44, R = 26;
  const inv = new THREE.Matrix4().copy(viewCam.matrixWorld).invert();
  const AX = [
    /* tui.xaxis / yaxis / zaxis — Blender 5.2-ийн яг утгууд */
    { v: new THREE.Vector3(1, 0, 0), c: '#ff3352', l: 'X' },
    { v: new THREE.Vector3(0, 0, -1), c: '#8bdc00', l: 'Y' },
    { v: new THREE.Vector3(0, 1, 0), c: '#2890ff', l: 'Z' }
  ];
  const pts = [];
  AX.forEach(a => {
    [1, -1].forEach(s => {
      const d = a.v.clone().multiplyScalar(s).transformDirection(inv);
      pts.push({ x: gx + d.x * R, y: gy - d.y * R, z: d.z, c: a.c, l: s > 0 ? a.l : '', neg: s < 0 });
    });
  });
  pts.sort((a, b) => a.z - b.z);
  octx.lineWidth = 1.6;
  pts.forEach(p => {
    if (!p.neg) { octx.strokeStyle = p.c; octx.globalAlpha = .8; octx.beginPath(); octx.moveTo(gx, gy); octx.lineTo(p.x, p.y); octx.stroke(); }
    octx.globalAlpha = 1;
    octx.beginPath(); octx.arc(p.x, p.y, p.neg ? 4.5 : 6.5, 0, TAU);
    octx.fillStyle = p.neg ? p.c + '44' : p.c; octx.fill();   /* сөрөг тэнхлэг: тэнхлэгийн өнгө сулруулсан */
    if (p.neg) { octx.strokeStyle = p.c; octx.lineWidth = 1.2; octx.stroke(); }
    if (p.l) { octx.fillStyle = '#101010'; octx.font = '700 8.5px Inter, sans-serif'; octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillText(p.l, p.x, p.y + .5); }
  });
  octx.textBaseline = 'alphabetic'; octx.globalAlpha = 1;
}

/* ─────────── 19. Дүрийн анимаци ─────────── */
let elapsed = 0;
function animPeople() {
  const m = ($('anim') && $('anim').value) || 'idle';
  people.forEach(p => {
    const L = p.userData.limbs, t = elapsed + p.userData.phase;
    if (m === 'walk') {
      L.legL.rotation.x = Math.sin(t * 5) * .55; L.legR.rotation.x = -Math.sin(t * 5) * .55;
      L.armL.rotation.x = -Math.sin(t * 5) * .42; L.armR.rotation.x = Math.sin(t * 5) * .42;
      p.position.y = Math.abs(Math.sin(t * 5)) * .032;
    } else if (m === 'talk') {
      L.armL.rotation.x = Math.sin(t * 2.6) * .35 - .15; L.armR.rotation.x = -Math.sin(t * 2.2 + 1) * .3 - .12;
      L.head.rotation.y = Math.sin(t * 1.7) * .18; L.head.rotation.z = Math.sin(t * 1.1) * .07;
      L.legL.rotation.x = L.legR.rotation.x = 0; p.position.y = Math.sin(t * 1.6) * .006;
    } else if (m === 'idle') {
      L.armL.rotation.x = Math.sin(t * 1.4) * .055; L.armR.rotation.x = -Math.sin(t * 1.4) * .055;
      L.head.rotation.y = Math.sin(t * .6) * .1; L.head.rotation.z = 0;
      L.legL.rotation.x = L.legR.rotation.x = 0; p.position.y = Math.sin(t * 1.4) * .008 + .008;
    } else {
      L.legL.rotation.x = L.legR.rotation.x = L.armL.rotation.x = L.armR.rotation.x = 0;
      L.head.rotation.y = L.head.rotation.z = 0; p.position.y = 0;
    }
  });
  props.forEach(p => {
    if (p.userData.flame) {
      const k = 1 + Math.sin(elapsed * 11 + p.id) * .16;
      p.userData.flame.scale.set(k, 1 / k, k);
      if (p.userData.light) p.userData.light.intensity = 1.4 + Math.sin(elapsed * 13) * .35;
    }
  });
}
function applyShading() {
  const wire = shading === 'wire';
  world.traverse(o => { if (o.isMesh && o.material && 'wireframe' in o.material) o.material.wireframe = wire; });
  const rend = shading === 'rend';
  renderer.toneMapping = rend ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
  renderer.toneMappingExposure = rend ? 1.15 : 1;
  overlay3d.visible = showOverlay && !camView;
  helpers.visible = showOverlay;
}

/* ─────────── 20. Рендер гогцоо ─────────── */
const clock = new THREE.Clock();
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const px = renderer.getPixelRatio();
  if (canvas.width !== Math.floor(w * px) || canvas.height !== Math.floor(h * px)) {
    renderer.setSize(w, h, false);
  }
}
function tick() {
  requestAnimationFrame(tick);
  resize();
  const dt = Math.min(clock.getDelta(), .1);
  elapsed += dt;
  animPeople();

  if (playing && keys.length >= 2) {
    playAcc += dt * fps;
    if (playAcc >= 1) {
      let nf = curFrame + Math.floor(playAcc);
      playAcc -= Math.floor(playAcc);
      if (nf > fEnd) { if (looping) nf = fStart; else { nf = fEnd; stopPlay(); } }
      setFrame(nf);
      const s = sampleFrame(curFrame);
      Object.assign(state, s); state.target.copy(s.target);
    }
  }
  clampS(state);
  const shk = (playing || camView) ? shakeAt(elapsed) : null;
  applyCam(viewCam, state, camView ? shk : null);
  applyShading();

  if (active) {
    selRing.position.set(active.position.x, .014, active.position.z);
    const sc = active.userData.kind === 'person' ? 1 : Math.max(active.scale.x, 1);
    selRing.scale.set(sc, sc, sc);
    if (active.userData.kind === 'person') {
      dirArrow.position.set(active.position.x + Math.sin(active.rotation.y) * .75, .16, active.position.z + Math.cos(active.rotation.y) * .75);
      dirArrow.rotation.set(Math.PI / 2, 0, -active.rotation.y);
    }
  }

  const cw = canvas.clientWidth, ch = canvas.clientHeight;
  const dpr = renderer.getPixelRatio();
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, cw, ch);

  if (camView) {
    renderer.setClearColor(0x0e0e0e, 1);
    renderer.clear(true, true, true);
    const r = camRect(cw, ch);
    const ry = ch - r.y - r.h;
    viewCam.aspect = r.w / r.h; viewCam.updateProjectionMatrix();
    renderer.setScissorTest(true);
    renderer.setViewport(r.x, ry, r.w, r.h);
    renderer.setScissor(r.x, ry, r.w, r.h);
    renderer.render(scene, viewCam);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, cw, ch);
  } else {
    viewCam.aspect = cw / ch; viewCam.updateProjectionMatrix();
    renderer.clear(true, true, true);
    renderer.render(scene, viewCam);
  }

  // PiP — бичлэгийн камерын урьдчилсан харагдац
  const pipEl = $('pip');
  const wantPip = showPip && keys.length >= 2 && !camView;
  pipEl.style.display = wantPip ? 'block' : 'none';
  if (wantPip) {
    const ar = shotAspect();
    let w = Math.min(290, Math.floor(cw * .34)), h = Math.round(w / ar);
    if (h > ch * .42) { h = Math.floor(ch * .42); w = Math.round(h * ar); }
    pipEl.style.width = w + 'px'; pipEl.style.height = h + 'px';
    const s = sampleFrame(curFrame);
    applyCam(shotCam, s, shakeAt(elapsed));
    shotCam.aspect = ar; shotCam.updateProjectionMatrix();
    const hv = helpers.visible, ov = overlay3d.visible;
    helpers.visible = false; overlay3d.visible = false;
    const px = cw - w - 10, py = 34;
    renderer.setScissorTest(true);
    renderer.setViewport(px, py, w, h);
    renderer.setScissor(px, py, w, h);
    renderer.render(scene, shotCam);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, cw, ch);
    helpers.visible = hv; overlay3d.visible = ov;
  }

  drawOverlay(cw, ch);

  // HUD
  const hs = camView ? state : state;
  const sz = shotSize(hs), an = camAngle(hs), tgt = targetOf(hs);
  $('hud').innerHTML =
    '<b class="a">' + sz.mn + '</b> · ' + sz.en + '<br>' +
    an.mn + ' · <b>' + lensMM(hs.fov) + 'mm</b> · <b>' + hs.radius.toFixed(1) + 'm</b><br>' +
    'Фрейм <b>' + curFrame + '</b>/' + fEnd + ' · Кадр <b>' + keys.length + '</b>' +
    (people.length > 1 ? '<br><span class="' + (allInFrame(hs) ? 'g' : '') + '">' + (allInFrame(hs) ? '✓ бүх дүр кадарт' : '⚠ зарим дүр кадраас гарч байна') + '</span>' : '') +
    (tgt !== null && people.length > 1 ? '<br>Бай: дүр ' + (tgt + 1) : '');
}

/* ─────────── 21. Экспорт ─────────── */
function dl(name, data, mime) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.download = name; a.href = URL.createObjectURL(blob); a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Татагдлаа: ' + name, 'ok');
}
const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
/** Хувилбарын дугаар — Ctrl+Alt+S дарах бүрд 001, 002 … гэж өснө */
let saveSeq = 0;
function nextSeq() {
  if (!saveSeq) { try { saveSeq = +(lsRead('1stStudio.camera.seq') || 0) || 0; } catch (e) { saveSeq = 0; } }
  saveSeq++;
  lsWrite('1stStudio.camera.seq', String(saveSeq));
  return String(saveSeq).padStart(3, '0');
}

function serialize() {
  return JSON.stringify({
    v: 3, app: '1st-studio-camera-director', env: envId,
    fStart, fEnd, fps, interp, aspect: $('aspect').value,
    autoTarget, shakeAmt, anim: $('anim').value,
    pformat: $('pformat').value, pmodel: $('pmodel').value,
    incEnv: $('incEnv').checked, incNeg: $('incNeg').checked,
    scene: $('sceneTxt').value, inPrompt: $('inPrompt').value,
    styles: Array.from(document.querySelectorAll('.stl')).map(x => x.checked),
    ak: activeK,
    people: people.map(p => ({ x: +p.position.x.toFixed(4), z: +p.position.z.toFixed(4), ry: +p.rotation.y.toFixed(4), s: +p.scale.x.toFixed(3), v: p.userData.vis !== false })),
    props: props.map(p => ({ t: p.userData.kind, x: +p.position.x.toFixed(4), z: +p.position.z.toFixed(4), ry: +p.rotation.y.toFixed(4), s: +p.scale.x.toFixed(3), v: p.userData.vis !== false, f: p.userData.file || undefined })),
    keys: keys.map(k => ({ th: k.theta, ph: k.phi, r: k.radius, f: k.fov, ro: k.roll || 0, tx: k.target.x, ty: k.target.y, tz: k.target.z, fr: k.frame }))
  }, null, 1);
}
function loadProject(d, silent) {
  if (!d || !d.keys) { toast('Энэ файлыг таньсангүй', 'err'); return; }
  const v2 = d.v === 2;
  clearScene();
  fps = +d.fps || 24; $('fps').value = fps;
  if (v2) { fStart = 1; fEnd = 1 + Math.round((d.dur || 5) * fps); }
  else { fStart = +d.fStart || 1; fEnd = +d.fEnd || 120; }
  interp = d.interp || 'smooth'; $('interp').value = interp;
  $('aspect').value = d.aspect || '16:9';
  autoTarget = !!d.autoTarget; $('cAuto').checked = autoTarget;
  shakeAmt = +d.shakeAmt || 0; $('cShake').value = Math.round(shakeAmt * 100); $('cShakeV').textContent = Math.round(shakeAmt * 100) + '%';
  (d.people && d.people.length ? d.people : []).slice(0, MAXP).forEach(p => {
    const o = addPerson(p.x, p.z, p.ry, true);
    if (o && p.s) o.scale.setScalar(p.s);
    if (o && p.v === false) { o.userData.vis = false; o.visible = false; }
  });
  (d.props || []).forEach(p => {
    const o = addProp(p.t, p.x, p.z, p.ry, true);
    if (o && p.s) o.scale.setScalar(p.s);
    if (o && p.v === false) { o.userData.vis = false; o.visible = false; }
    if (o && p.t === 'model') {                 /* 3D файл нь JSON дотор хадгалагддаггүй */
      o.userData.file = p.f || 'model.glb';
      o.userData.missing = true;
      o.userData.name = (p.f || 'Загвар').replace(/\.[^.]+$/, '') + ' (дутуу)';
    }
  });
  applyEnv(ENVS[d.env] ? d.env : 'blender');
  $('anim').value = d.anim || 'idle';
  $('pformat').value = d.pformat || 'cine';
  $('pmodel').value = d.pmodel || 'generic';
  $('incEnv').checked = d.incEnv !== false;
  $('incNeg').checked = d.incNeg !== false;
  $('sceneTxt').value = d.scene || '';
  $('inPrompt').value = d.inPrompt || '';
  Array.from(document.querySelectorAll('.stl')).forEach((x, i) => x.checked = !!(d.styles && d.styles[i]));
  keys = (d.keys || []).slice(0, MAXK).map((k, i, arr) => clampS({
    theta: k.th, phi: k.ph, radius: k.r, fov: k.f, roll: k.ro || 0,
    target: new THREE.Vector3(k.tx, k.ty, k.tz),
    frame: k.fr !== undefined ? k.fr : Math.round(lerp(fStart, fEnd, arr.length < 2 ? 0 : i / (arr.length - 1)))
  }));
  keys.sort((a, b) => a.frame - b.frame);
  activeK = keys.length ? clamp(d.ak === undefined ? 0 : +d.ak, 0, keys.length - 1) : -1;
  $('fStart').value = fStart; $('fEnd').value = fEnd;
  setFrame(fStart);
  if (keys.length) { Object.assign(state, cloneS(keys[0])); state.target.copy(keys[0].target); }
  syncAll();
  if (!silent) {
    histReset('Нээсэн төсөл');
    const miss = missingModels();
    toast('Төсөл ачаалагдлаа' + (v2 ? ' (хуучин v2 хөрвүүлэгдлээ)' : '') +
      (miss.length ? ' · ' + miss.length + ' 3D загвар дутуу — 🧍 табаас дахин оруулна уу' : ''), miss.length ? '' : 'ok');
    diagnose(); refreshFix();
  }
}
function newProject() {
  clearScene(); keys = []; activeK = -1;
  fStart = 1; fEnd = 120; fps = 24; curFrame = 1;
  $('fStart').value = 1; $('fEnd').value = 120; $('fps').value = 24;
  autoTarget = false; shakeAmt = 0; $('cAuto').checked = false; $('cShake').value = 0; $('cShakeV').textContent = '0%';
  $('sceneTxt').value = ''; $('inPrompt').value = '';
  Array.from(document.querySelectorAll('.stl')).forEach(x => x.checked = false);
  $('tagChips').innerHTML = '';
  applyEnv('blender');
  addPerson(undefined, undefined, undefined, true);
  addPerson(undefined, undefined, undefined, true);
  arrange('face');
  focusAll(); setFrame(1); syncAll();
  histReset('Шинэ төсөл'); diagnose(); refreshFix();
  toast('Шинэ төсөл', 'ok');
}

/** Тухайн төлөвөөр өндөр нягтралтай зураг рендерлэх */
function renderShot(s, W, H) {
  const oldPx = renderer.getPixelRatio();
  const oldW = canvas.clientWidth, oldH = canvas.clientHeight;
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  const hv = helpers.visible, ov = overlay3d.visible, rv = selRing.visible, dv = dirArrow.visible;
  helpers.visible = false; overlay3d.visible = false; selRing.visible = false; dirArrow.visible = false;
  applyCam(shotCam, s, null);
  shotCam.aspect = W / H; shotCam.updateProjectionMatrix();
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, W, H);
  renderer.clear(true, true, true);
  renderer.render(scene, shotCam);
  const url = renderer.domElement.toDataURL('image/png');
  helpers.visible = hv; overlay3d.visible = ov; selRing.visible = rv; dirArrow.visible = dv;
  renderer.setPixelRatio(oldPx);
  renderer.setSize(oldW, oldH, false);
  return url;
}
function exportPNG() {
  const ar = shotAspect();
  const W = ar >= 1 ? 1920 : 1080, H = Math.round(W / ar);
  const s = keys.length ? sampleFrame(curFrame) : cloneS(state);
  const url = renderShot(s, W, Math.round(H / 2) * 2);
  const a = document.createElement('a');
  a.download = '1st-studio-frame-' + curFrame + '-' + stamp() + '.png'; a.href = url; a.click();
  toast('PNG татагдлаа (' + W + '×' + H + ')', 'ok');
}
async function exportBoard() {
  if (keys.length < 1) { toast('Кадр алга', 'err'); return; }
  toast('Storyboard бэлдэж байна…');
  const ar = shotAspect();
  const cw = 640, chh = Math.round(cw / ar);
  const cols = Math.min(3, keys.length), rows = Math.ceil(keys.length / cols);
  const pad = 16, lab = 40, head = 56;
  const W = cols * cw + (cols + 1) * pad, H = head + rows * (chh + lab) + (rows + 1) * pad;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = '#141414'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#e8e8e8'; x.font = '600 22px Inter, sans-serif'; x.textAlign = 'left';
  x.fillText('1st Studio — Storyboard', pad, 34);
  x.fillStyle = '#8a8a8a'; x.font = '13px JetBrains Mono, monospace'; x.textAlign = 'right';
  x.fillText(keys.length + ' кадр · ' + durSec().toFixed(1) + 's · ' + fps + 'fps · ' + $('aspect').value, W - pad, 34);
  for (let i = 0; i < keys.length; i++) {
    const url = renderShot(keys[i], cw, chh);
    const img = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.src = url; });
    const cx = pad + (i % cols) * (cw + pad), cy = head + pad + Math.floor(i / cols) * (chh + lab + pad);
    x.drawImage(img, cx, cy, cw, chh);
    x.strokeStyle = '#3a3a3a'; x.lineWidth = 1; x.strokeRect(cx + .5, cy + .5, cw - 1, chh - 1);
    const k = keys[i], sz = shotSize(k), an = camAngle(k);
    x.fillStyle = '#ffbf47'; x.font = '600 14px Inter, sans-serif'; x.textAlign = 'left';
    x.fillText('SHOT ' + (i + 1) + ' · f' + k.frame + ' · ' + ((k.frame - fStart) / fps).toFixed(2) + 's', cx, cy + chh + 18);
    x.fillStyle = '#a8a8a8'; x.font = '12px JetBrains Mono, monospace';
    x.fillText(sz.ab + ' · ' + an.mn + ' · ' + lensMM(k.fov) + 'mm · ' + k.radius.toFixed(1) + 'm', cx, cy + chh + 34);
  }
  c.toBlob(b => dl('1st-studio-storyboard-' + stamp() + '.png', b), 'image/png');
}
function exportCSV() {
  if (!keys.length) { toast('Кадр алга', 'err'); return; }
  const rows = [['idx', 'frame', 'time_s', 'cam_x', 'cam_y', 'cam_z', 'target_x', 'target_y', 'target_z', 'lens_mm', 'fov_deg', 'roll_deg', 'distance_m', 'shot_size', 'angle']];
  keys.forEach((k, i) => {
    const p = posOf(k);
    rows.push([i + 1, k.frame, ((k.frame - fStart) / fps).toFixed(3),
      p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4),
      k.target.x.toFixed(4), k.target.y.toFixed(4), k.target.z.toFixed(4),
      lensMM(k.fov), k.fov.toFixed(2), ((k.roll || 0) * 180 / Math.PI).toFixed(2),
      k.radius.toFixed(3), shotSize(k).ab, camAngle(k).ab]);
  });
  dl('1st-studio-camera-' + stamp() + '.csv', rows.map(r => r.join(',')).join('\n'), 'text/csv;charset=utf-8');
}

/* ── Blender Python экспорт ── */
const CONV = new THREE.Matrix4().makeRotationX(Math.PI / 2);   // Three (Y дээш) → Blender (Z дээш)
function blenderKey(k) {
  const tmp = new THREE.PerspectiveCamera(k.fov, shotAspect(), .1, 100);
  applyCam(tmp, k, null);
  tmp.updateMatrixWorld(true);
  const m = new THREE.Matrix4().multiplyMatrices(CONV, tmp.matrixWorld);
  const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  m.decompose(pos, q, sc);
  const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');
  const t = k.target;
  return {
    f: k.frame,
    p: [pos.x, pos.y, pos.z],
    r: [e.x, e.y, e.z],
    t: [t.x, -t.z, t.y],
    lens: 12 / Math.tan(k.fov * Math.PI / 360)   // sensor_height 24mm, VERTICAL fit
  };
}
function exportPY() {
  if (keys.length < 1) { toast('Дор хаяж 1 түлхүүр кадр хэрэгтэй', 'err'); return; }
  const K = keys.map(blenderKey);
  const num = n => (Math.round(n * 1e6) / 1e6).toString();
  const kdata = K.map(k => '    (' + k.f + ', (' + k.p.map(num).join(', ') + '), (' + k.r.map(num).join(', ') + '), (' + k.t.map(num).join(', ') + '), ' + num(k.lens) + '),').join('\n');
  const pdata = people.map((p, i) => '    ("Subject_' + String(i + 1).padStart(2, '0') + '", ' + num(p.position.x) + ', ' + num(-p.position.z) + ', ' + num(p.rotation.y) + ', ' + num(p.scale.x) + '),').join('\n');
  const rdata = props.map((p, i) => '    ("' + p.userData.kind + '_' + String(i + 1).padStart(2, '0') + '", "' + p.userData.kind + '", ' + num(p.position.x) + ', ' + num(-p.position.z) + ', ' + num(p.rotation.y) + ', ' + num(p.scale.x) + '),').join('\n');
  const promptTxt = ($('promptOut').textContent || '').replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');

  const py = [
'# ══════════════════════════════════════════════════════════════',
'#  1st Studio — Camera Director → Blender',
'#  Үүсгэсэн: ' + new Date().toISOString(),
'#  Ашиглах: Blender → Scripting таб → Open → энэ файл → Run Script (Alt+P)',
'#  Blender 4.x / 5.x дээр ажиллана.',
'# ══════════════════════════════════════════════════════════════',
'import bpy, math',
'',
'FPS         = ' + fps,
'FRAME_START = ' + fStart,
'FRAME_END   = ' + fEnd,
'RES_X, RES_Y = ' + (shotAspect() >= 1 ? '1920, ' + Math.round(1920 / shotAspect()) : Math.round(1080 * shotAspect()) + ', 1080'),
'INTERPOLATION = "' + (interp === 'linear' ? 'LINEAR' : interp === 'const' ? 'CONSTANT' : 'BEZIER') + '"',
'',
'# (frame, camera_location, camera_rotation_euler, target_location, lens_mm)',
'KEYS = [',
kdata,
']',
'',
'# (name, x, y, rotation_z, scale)',
'SUBJECTS = [',
pdata || '',
']',
'',
'# (name, kind, x, y, rotation_z, scale)',
'PROPS = [',
rdata || '',
']',
'',
'PROMPT = """' + promptTxt + '"""',
'',
'',
'def clear_old():',
'    for name in ("ShotCam", "CAM_TARGET"):',
'        ob = bpy.data.objects.get(name)',
'        if ob:',
'            bpy.data.objects.remove(ob, do_unlink=True)',
'    col = bpy.data.collections.get("1stStudio_Layout")',
'    if col:',
'        for ob in list(col.objects):',
'            bpy.data.objects.remove(ob, do_unlink=True)',
'        bpy.data.collections.remove(col)',
'',
'',
'def fcurves_of(ob):',
'    """Blender 4.4+ slotted actions болон хуучин хувилбар хоёуланг дэмжинэ."""',
'    ad = ob.animation_data',
'    if not ad or not ad.action:',
'        return []',
'    act = ad.action',
'    try:',
'        if hasattr(act, "layers") and len(act.layers):',
'            cb = act.layers[0].strips[0].channelbag(ad.action_slot)',
'            if cb:',
'                return list(cb.fcurves)',
'    except Exception:',
'        pass',
'    try:',
'        return list(act.fcurves)',
'    except Exception:',
'        return []',
'',
'',
'def main():',
'    scene = bpy.context.scene',
'    clear_old()',
'',
'    scene.render.fps = FPS',
'    scene.frame_start = FRAME_START',
'    scene.frame_end = FRAME_END',
'    scene.render.resolution_x = RES_X',
'    scene.render.resolution_y = RES_Y',
'',
'    # ── Камерын бай (Empty) ──',
'    target = bpy.data.objects.new("CAM_TARGET", None)',
'    target.empty_display_type = "PLAIN_AXES"',
'    target.empty_display_size = 0.35',
'    scene.collection.objects.link(target)',
'',
'    # ── Камер ──',
'    cam_data = bpy.data.cameras.new("ShotCam")',
'    cam_data.sensor_fit = "VERTICAL"',
'    cam_data.sensor_width = 36.0',
'    cam_data.sensor_height = 24.0',
'    cam_data.display_size = 0.6',
'    cam = bpy.data.objects.new("ShotCam", cam_data)',
'    scene.collection.objects.link(cam)',
'    scene.camera = cam',
'    cam.rotation_mode = "XYZ"',
'',
'    for (f, loc, rot, tloc, lens) in KEYS:',
'        cam.location = loc',
'        cam.rotation_euler = rot',
'        cam.keyframe_insert("location", frame=f)',
'        cam.keyframe_insert("rotation_euler", frame=f)',
'        cam_data.lens = lens',
'        cam_data.keyframe_insert("lens", frame=f)',
'        target.location = tloc',
'        target.keyframe_insert("location", frame=f)',
'',
'    for ob in (cam, target):',
'        for fc in fcurves_of(ob):',
'            for kp in fc.keyframe_points:',
'                kp.interpolation = INTERPOLATION',
'                kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"',
'    for fc in fcurves_of(cam_data):',
'        for kp in fc.keyframe_points:',
'            kp.interpolation = INTERPOLATION',
'',
'    # ── Тайзны байрлал (лавлах хэлбэрүүд) ──',
'    layout = bpy.data.collections.new("1stStudio_Layout")',
'    scene.collection.children.link(layout)',
'',
'    for (name, x, y, rz, sc) in SUBJECTS:',
'        bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=1.72, location=(x, y, 0.86))',
'        ob = bpy.context.active_object',
'        ob.name = name',
'        ob.rotation_euler[2] = rz',
'        ob.scale = (sc, sc, sc)',
'        ob.display_type = "WIRE"',
'        for c in list(ob.users_collection):',
'            c.objects.unlink(ob)',
'        layout.objects.link(ob)',
'',
'    for (name, kind, x, y, rz, sc) in PROPS:',
'        if kind == "model":',
'            # 1st Studio дотор оруулсан 3D загвар. Энд Empty болж үүснэ —',
'            # өөрийн загвараа импортлоод үүнд parent (Ctrl+P) хийвэл яг тэр байрлалд орно.',
'            ob = bpy.data.objects.new(name, None)',
'            ob.empty_display_type = "PLAIN_AXES"',
'            ob.empty_display_size = 0.8',
'            bpy.context.scene.collection.objects.link(ob)',
'            ob.location = (x, y, 0.0)',
'        else:',
'            bpy.ops.mesh.primitive_cube_add(size=0.85, location=(x, y, 0.42))',
'            ob = bpy.context.active_object',
'            ob.display_type = "WIRE"',
'        ob.name = name',
'        ob.rotation_euler[2] = rz',
'        ob.scale = (sc, sc, sc)',
'        for c in list(ob.users_collection):',
'            c.objects.unlink(ob)',
'        layout.objects.link(ob)',
'',
'    # ── Промтыг текст блок болгон хадгалах ──',
'    txt = bpy.data.texts.get("1stStudio_Prompt") or bpy.data.texts.new("1stStudio_Prompt")',
'    txt.clear()',
'    txt.write(PROMPT)',
'',
'    scene.frame_set(FRAME_START)',
'    print("[1st Studio] %d түлхүүр кадр, %d фрейм, %d fps үүслээ." % (len(KEYS), FRAME_END - FRAME_START, FPS))',
'',
'',
'main()',
''].join('\n');
  dl('1st-studio-camera-' + stamp() + '.py', py, 'text/x-python;charset=utf-8');
}

/* ══════════════════════════════════════════════════════════════
   ХӨДӨЛГӨӨНИЙ САНГААС ИРЭХ АВТОМАТ ТУШААЛ
   camera-movements.html ▸ «Автомат камер» хэсгээс ирнэ:
     camera.html#p=<хөдөлгөөн>&d=<секунд>&n=<хүн>&env=<орчин>&s=<дүр зураг>
   ══════════════════════════════════════════════════════════════ */
function clearHash() {
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
}
/** Дүрийн тоог шууд тохируулна */
function setPeople(n) {
  n = clamp(Math.round(n) || 0, 0, MAXP);
  while (people.length < n) addPerson(undefined, undefined, undefined, true);
  while (people.length > n) { const t = people.pop(); world.remove(t); if (active === t) setActive(null); }
  if (people.length >= 2) arrange('face'); else syncAll();
}
function applyUrlAuto() {
  const raw = (location.hash || '').slice(1);
  if (!raw) return false;
  if (raw === 'manual') { clearHash(); if (manualReady()) openManual(); return true; }
  if (raw === 'toli') { clearHash(); openToli(); return true; }
  let q; try { q = new URLSearchParams(raw); } catch (e) { return false; }
  const p = q.get('p');
  if (!p) return false;
  const n = q.get('n'), env = q.get('env'), sc = q.get('s');
  if (env && ENVS[env]) applyEnv(env);
  if (n !== null && n !== '') setPeople(+n);
  if (sc) $('sceneTxt').value = sc;
  $('inPrompt').value = p;
  gotoPage('pgPrompt');
  runParse();
  focusAll(); onCamMove();
  histReset('Сангаас ирсэн хөдөлгөөн');
  diagnose(); refreshFix();
  toast('🎬 Хөдөлгөөний сангаас үүсгэлээ · ' + keys.length + ' кадр', 'ok');
  clearHash();
  return true;
}
window.addEventListener('hashchange', () => { applyUrlAuto(); });

/* ─────────── Толь — програмын дотор (F2) ─────────── */
let toli = null, toliOpen = false;
/** Толийн өгөгдөл ба үзүүлэгч ачаалагдсан эсэх */
function toliReady() { return typeof toliMount === 'function' && typeof TOLI !== 'undefined'; }
function toliInit() {
  if (toli || !toliReady()) return toli;
  toli = toliMount($('tolihost'), {
    hash: false,
    onOpenTab: id => { closeToli(); gotoPage(id); toast('📂 ' + id.replace('pg', '') + ' хэсэг нээгдлээ'); }
  });
  const last = toli.last();
  if (last) toli.open(last);
  return toli;
}
/** Толийг нээх. term өгвөл шууд тэр үгийг харуулна. */
function openToli(term) {
  if (!toliReady()) {                       /* өгөгдөл дутуу бол тусдаа хуудсаар оролдоно */
    const w = window.open('toli.html', '1stStudioToli');
    if (!w) toast('Толь олдсонгүй (toli-data.js)', 'err');
    return;
  }
  toliInit();
  if (term) { if (toli.byId[term]) toli.open(term); else toli.search(term); }
  $('toli').classList.add('show'); toliOpen = true;
}
function closeToli() { $('toli').classList.remove('show'); toliOpen = false; }

/** manual.js ачаалагдсан эсэх (файл дутуу хуулсан ч програм ажиллана) */
function manualReady() { return typeof openManual === 'function' && typeof MANUAL !== 'undefined'; }

/* ─────────── 22. Toast ─────────── */
let toastT = null;
function toast(msg, kind) {
  const el = $('toast');
  el.textContent = msg;
  el.className = 'show' + (kind ? ' ' + kind : '');
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.className = ''; }, 2200);
}

/* ─────────── 23. Үйлдэл дамжуулагч ─────────── */
function applyPreset(i) {
  const p = PRESETS[i]; if (!p) return;
  const list = p.mk(baseK());
  spreadKeys(list, p.d);
  keys = list.slice(0, MAXK); activeK = 0;
  $('fStart').value = fStart; $('fEnd').value = fEnd;
  buildSpline(); setFrame(fStart);
  Object.assign(state, cloneS(keys[0])); state.target.copy(keys[0].target);
  syncAll(); commit('Бэлэн хөдөлгөөн: ' + p.l); toast('« ' + p.l + ' » — ' + keys.length + ' кадр / ' + p.d + 'с');
}
function runParse() {
  const res = promptToCamera($('inPrompt').value);
  if (!res) { $('tagChips').innerHTML = ''; return; }
  $('fStart').value = fStart; $('fEnd').value = fEnd;
  $('cAuto').checked = autoTarget;
  $('cShake').value = Math.round(shakeAmt * 100); $('cShakeV').textContent = Math.round(shakeAmt * 100) + '%';
  $('tagChips').innerHTML = '<span class="chip tag">✓ ' + res.recognised.join('</span><span class="chip tag">✓ ') + '</span>';
  syncAll(); commit('Промтоос камер');
  toast('⚡ ' + res.n + ' түлхүүр кадр үүслээ · ' + res.dur.toFixed(1) + 'с', 'ok');
}
function doAct(a) {
  if (!a) return;
  if (a.indexOf('p:') === 0) { addProp(a.slice(2)); return; }
  if (a.indexOf('a:') === 0) { arrange(a.slice(2)); return; }
  switch (a) {
    case 'new': newProject(); break;
    case 'open': $('fileIn').click(); break;
    case 'save': dl('1st-studio-project-' + stamp() + '.json', serialize(), 'application/json'); break;
    case 'png': exportPNG(); break;
    case 'board': exportBoard(); break;
    case 'py': exportPY(); break;
    case 'csv': exportCSV(); break;
    case 'txt': dl('1st-studio-prompt-' + stamp() + '.txt', $('promptOut').textContent); break;
    case 'addPerson': addPerson(); break;
    case 'delPerson': removePerson(); break;
    case 'key': addKey(); break;
    case 'upd': updKey(); break;
    case 'delk': delKey(); break;
    case 'clrk': clearKeys(); toast('Кадрууд цэвэрлэгдлээ'); break;
    case 'camview': setCamView(!camView); break;
    case 'frameall': focusAll(); onCamMove(); break;
    case 'framesel': focusSel(); onCamMove(); break;
    case 'autodir': autoDirect('drama'); break;
    case 'reverse': reverseKeys(); break;
    /* ── сэргээх ба засах ── */
    case 'diag': runDiag(); break;
    case 'fixall': fixAll(); break;
    case 'enhauto': enhAuto(); break;
    case 'undo': undo(); break;
    case 'redo': redo(); break;
    case 'asnow': toast(asSave(true) ? '💾 Хадгаллаа' : 'Хадгалж чадсангүй', asOk ? 'ok' : 'err'); break;
    case 'asclear': asClearAll(); break;
    case 'recover': { const l = asList(); if (!l.length) { toast('Хадгалалт олдсонгүй', 'err'); break; } asRestore(0); break; }
    case 'fixtab': gotoPage('pgFix'); break;
    case 'manual': manualReady() ? openManual() : toast('manual.js файл олдсонгүй', 'err'); break;
    case 'toli': openToli(); break;
    case 'import': $('modelIn').click(); break;
    case 'toliwin': window.open('toli.html', '1stStudioToli'); break;
    case 'lib': window.open('camera-movements.html#auto', '1stStudioLib'); break;
    case 'incsave': dl('1st-studio-project-' + nextSeq() + '-' + stamp() + '.json', serialize(), 'application/json'); break;
  }
}
/** Баруун самбарын тодорхой хуудсыг нээх */
function gotoPage(id) {
  document.querySelectorAll('#ptabs button').forEach(b => b.classList.toggle('on', b.dataset.page === id));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('on', p.id === id));
  const t = document.querySelector('#ptabs [data-page="' + id + '"]');
  if (t) t.scrollIntoView({ block: 'nearest' });
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-preset],[data-dir],[data-env],[data-ex],[data-k],[data-kdel],[data-p],[data-r],[data-eye],[data-view],[data-shade],[data-tool],[data-tr],[data-pop],[data-page],[data-fix],[data-enh],[data-hist],[data-asr],[data-asd],[data-man],[data-mfocus]');
  // цэс хаах
  if (!e.target.closest('.pop') && !e.target.closest('[data-pop]')) closePops();
  if (!t) return;
  const d = t.dataset;
  if (d.eye !== undefined) {
    e.stopPropagation();
    const arr = d.eye[0] === 'p' ? people : props, o = arr[+d.eye.slice(1)];
    if (o) { o.userData.vis = !o.userData.vis; o.visible = o.userData.vis; refreshOutliner(); commit('Харагдац солив'); }
    return;
  }
  if (d.pop !== undefined) { e.stopPropagation(); const was = $(d.pop).classList.contains('show'); closePops(); if (!was) { $(d.pop).classList.add('show'); t.classList.add('open'); } return; }
  if (d.page !== undefined) {
    document.querySelectorAll('#ptabs button').forEach(b => b.classList.toggle('on', b === t));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('on', p.id === d.page));
    return;
  }
  if (d.act !== undefined) { closePops(); doAct(d.act); return; }
  if (d.preset !== undefined) { applyPreset(+d.preset); return; }
  if (d.dir !== undefined) { autoDirect(d.dir); return; }
  if (d.env !== undefined) { applyEnv(d.env); syncAll(); commit('Орчин: ' + (ENVS[d.env] ? ENVS[d.env].nm : d.env)); return; }
  if (d.fix !== undefined) { fixOne(+d.fix); return; }
  if (d.enh !== undefined) { runEnh(d.enh); return; }
  if (d.hist !== undefined) { const i = +d.hist; if (hist[i]) { histGo(i); toast('⟲ ' + hist[i].label); } return; }
  if (d.asr !== undefined) { asRestore(+d.asr); return; }
  if (d.asd !== undefined) { e.stopPropagation(); asDelete(+d.asd); return; }
  if (d.man !== undefined) { if (manualReady()) manualGo(d.man); return; }
  if (d.ex !== undefined) { $('inPrompt').value = EXAMPLES[+d.ex].t; runParse(); return; }
  if (d.k !== undefined) { gotoKey(+d.k); return; }
  if (d.kdel !== undefined) { e.stopPropagation(); delKey(+d.kdel); return; }
  if (d.p !== undefined) { setActive(people[+d.p]); return; }
  if (d.r !== undefined) { setActive(props[+d.r]); return; }
  if (d.mfocus !== undefined) { const o = props[+d.mfocus]; if (o) { setActive(o); focusSel(); onCamMove(); } return; }
  if (d.view !== undefined) { setView(d.view, e.ctrlKey); return; }
  if (d.shade !== undefined) { shading = d.shade; document.querySelectorAll('.sh').forEach(b => b.classList.toggle('on', b === t)); return; }
  if (d.tool !== undefined) {
    tool = d.tool;
    document.querySelectorAll('#tools [data-tool]').forEach(b => b.classList.toggle('on', b === t));
    if (tool !== 'sel' && active) startXform(tool === 'move' ? 'move' : tool === 'rot' ? 'rot' : 'scale');
    return;
  }
  if (d.tr !== undefined) {
    stopPlay0(d.tr);
    return;
  }
});
function closePops() { document.querySelectorAll('.pop').forEach(p => p.classList.remove('show')); document.querySelectorAll('.mnu').forEach(m => m.classList.remove('open')); }
function stopPlay0(tr) {
  if (tr === 'play') { togglePlay(); return; }
  if (tr === 'loop') { looping = !looping; $('btnLoop').classList.toggle('on', looping); return; }
  stopPlay();
  if (tr === 'start') setFrame(fStart);
  else if (tr === 'end') setFrame(fEnd);
  else if (tr === 'prev') setFrame(curFrame - 1);
  else if (tr === 'next') setFrame(curFrame + 1);
  else if (tr === 'prevk') { const k = keys.filter(k => k.frame < curFrame).pop(); if (k) gotoKey(keys.indexOf(k)); }
  else if (tr === 'nextk') { const k = keys.find(k => k.frame > curFrame); if (k) gotoKey(keys.indexOf(k)); }
  if (keys.length >= 2 && tr !== 'prevk' && tr !== 'nextk') { const s = sampleFrame(curFrame); Object.assign(state, s); state.target.copy(s.target); refreshNPanel(); }
}
document.addEventListener('click', e => { const h = e.target.closest('.box>h3'); if (h) h.parentElement.classList.toggle('fold'); });

/* ─────────── 24. Хяналтын элементүүд ─────────── */
function wireControls() {
$('subMinus').onclick = () => removePerson();
$('subPlus').onclick = () => addPerson();
$('fileIn').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { try { loadProject(JSON.parse(rd.result)); } catch (err) { toast('JSON уншиж чадсангүй', 'err'); } };
  rd.readAsText(f); e.target.value = '';
});
$('modelIn').addEventListener('change', e => { importFiles(e.target.files); e.target.value = ''; });

/* ── Файл чирж хаях ── */
let dragN = 0;
const dropEl = () => $('drop');
window.addEventListener('dragenter', e => {
  if (!e.dataTransfer || Array.from(e.dataTransfer.types || []).indexOf('Files') < 0) return;
  e.preventDefault(); dragN++; dropEl().classList.add('show');
});
window.addEventListener('dragover', e => {
  if (!e.dataTransfer || Array.from(e.dataTransfer.types || []).indexOf('Files') < 0) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
});
window.addEventListener('dragleave', e => { if (--dragN <= 0) { dragN = 0; dropEl().classList.remove('show'); } });
window.addEventListener('drop', e => {
  if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
  e.preventDefault(); dragN = 0; dropEl().classList.remove('show');
  importFiles(e.dataTransfer.files);
});

$('btnParse').onclick = runParse;
$('copyBtn').onclick = async e => {
  const txt = $('promptOut').textContent;
  try { await navigator.clipboard.writeText(txt); }
  catch (err) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
  const b = e.currentTarget, old = b.textContent;
  b.textContent = '✓ Хуулагдлаа'; b.classList.add('ok');
  setTimeout(() => { b.textContent = old; b.classList.remove('ok'); }, 1500);
};
$('btnTxt').onclick = () => doAct('txt');
$('btnOverlay').onclick = e => { showOverlay = !showOverlay; e.currentTarget.classList.toggle('on', showOverlay); };
$('btnGuides').onclick = e => { showGuides = !showGuides; e.currentTarget.classList.toggle('on', showGuides); };
$('btnPip').onclick = e => { showPip = !showPip; e.currentTarget.classList.toggle('on', showPip); };
$('aspect').onchange = () => { syncAll(); commit('Кадрын харьцаа'); };
$('fps').onchange = () => { fps = +$('fps').value; syncAll(); commit('FPS'); };
$('interp').onchange = () => { interp = $('interp').value; buildSpline(); rebuildHelpers(); schedulePrompt(); commit('Интерполяци'); };
$('fStart').onchange = () => { fStart = clamp(Math.round(+$('fStart').value) || 1, 0, fEnd - 1); $('fStart').value = fStart; setFrame(curFrame); syncAll(); commit('Эхлэх фрейм'); };
$('fEnd').onchange = () => { fEnd = clamp(Math.round(+$('fEnd').value) || 2, fStart + 1, 20000); $('fEnd').value = fEnd; setFrame(curFrame); syncAll(); commit('Төгсгөх фрейм'); };
$('fCur').onchange = () => { stopPlay(); setFrame(+$('fCur').value || fStart); if (keys.length >= 2) { const s = sampleFrame(curFrame); Object.assign(state, s); state.target.copy(s.target); refreshNPanel(); } };
$('anim').onchange = () => commit('Дүрийн хөдөлгөөн');
$('sceneTxt').addEventListener('input', () => { asDirty = true; schedulePrompt(); });
$('sceneTxt').addEventListener('change', () => commit('Дүр зургийн тайлбар'));
$('inPrompt').addEventListener('input', () => { asDirty = true; });
$('inPrompt').addEventListener('change', () => commit('Промтын бичвэр'));
$('pformat').onchange = () => { buildPrompt(); commit('Промтын хэлбэр'); };
$('pmodel').onchange = () => { buildPrompt(); commit('Промтын загвар'); };
$('incEnv').onchange = () => { buildPrompt(); commit('Промтын тохиргоо'); };
$('incNeg').onchange = () => { buildPrompt(); commit('Промтын тохиргоо'); };
document.querySelectorAll('.stl').forEach(x => x.addEventListener('change', () => { buildPrompt(); commit('Хэв маяг'); }));
$('sCount').oninput = () => {
  const n = +$('sCount').value;
  while (people.length < n) addPerson(undefined, undefined, undefined, true);
  while (people.length > n) { const t = people.pop(); world.remove(t); if (active === t) setActive(null); }
  syncAll();
};
$('cLens').oninput = () => { stopPlay(); if (camView) setCamView(false); state.fov = fovFromMM(+$('cLens').value); clampS(state); $('cLensV').textContent = $('cLens').value + 'mm'; onCamMove(); };
$('cDist').oninput = () => { stopPlay(); if (camView) setCamView(false); state.radius = +$('cDist').value; clampS(state); $('cDistV').textContent = state.radius.toFixed(1) + 'm'; onCamMove(); };
$('cPhi').oninput = () => { stopPlay(); if (camView) setCamView(false); state.phi = +$('cPhi').value; clampS(state); onCamMove(); };
$('cRoll').oninput = () => { stopPlay(); state.roll = +$('cRoll').value * Math.PI / 180; $('cRollV').textContent = $('cRoll').value + '°'; onCamMove(); };
$('cShake').oninput = () => { shakeAmt = +$('cShake').value / 100; $('cShakeV').textContent = $('cShake').value + '%'; schedulePrompt(); };
$('cShake').onchange = () => commit('Доргио');
$('cAuto').onchange = () => { autoTarget = $('cAuto').checked; buildSpline(); rebuildHelpers(); schedulePrompt(); commit('Авто бай'); };
$('sCount').onchange = () => commit('Дүрийн тоо');

/* ── Сэргээх ба засах самбарын хяналтууд ── */
$('enhAmt').oninput = () => { $('enhAmtV').textContent = $('enhAmt').value + '%'; };
$('asChk').onchange = () => { asOn = $('asChk').checked; asSaveCfg(); refreshFix(); toast(asOn ? 'Авто хадгалалт асав' : 'Авто хадгалалт унтарлаа'); };
$('asEvery').onchange = () => { asSec = +$('asEvery').value || 30; asSaveCfg(); refreshFix(); };
$('recYes').onclick = () => asRestore(0);
$('recNo').onclick = () => recBar(false);
$('toliClose').onclick = closeToli;
$('toliWin2').onclick = () => { closeToli(); window.open('toli.html', '1stStudioToli'); };
if (manualReady()) {
  $('manClose').onclick = closeManual;
  $('manQ').addEventListener('input', () => manualSearch($('manQ').value));
}
['nx', 'ny', 'nr'].forEach(id => $(id).addEventListener('change', () => {
  if (!active) return;
  active.position.x = clamp(+$('nx').value || 0, -22, 22);
  active.position.z = clamp(+$('ny').value || 0, -22, 22);
  active.rotation.y = (+$('nr').value || 0) * Math.PI / 180;
  syncAll(); commit('Байрлал гараар');
}));

}

/* ─────────── 25. Гарын товчлуур ─────────── */
document.addEventListener('keydown', e => {
  if (toliOpen) {
    if (e.key === 'Escape') { if (toli && toli.onKey(e)) return; e.preventDefault(); closeToli(); return; }
    if (e.key === 'F2') { e.preventDefault(); closeToli(); return; }
    if (toli) toli.onKey(e);
    return;
  }
  if (manualReady() && manualOpen) {
    if (e.key === 'Escape' || e.key === 'F1') { e.preventDefault(); closeManual(); return; }
    if (e.key === '/' && document.activeElement !== $('manQ')) { e.preventDefault(); $('manQ').focus(); return; }
    return;
  }
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  const inField = (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
  if (inField) {
    if (e.key === 'Escape') document.activeElement.blur();
    if (e.key === 'Enter' && document.activeElement.id === 'inPrompt' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runParse(); }
    /* Файлын болон тусламжийн товчлуур текст бичиж байхад ч ажиллана */
    const kk = e.key.toLowerCase();
    if (kk === 'f1') { e.preventDefault(); if (manualReady()) openManual(); return; }
    if (kk === 'f2') { e.preventDefault(); openToli(); return; }
    if ((e.ctrlKey || e.metaKey) && (kk === 's' || kk === 'o' || kk === 'n')) {
      e.preventDefault();
      doAct(kk === 's' ? (e.altKey ? 'incsave' : 'save') : kk === 'o' ? 'open' : 'new');
    }
    return;
  }
  const k = e.key.toLowerCase();
  if (xf) {
    if (k === 'escape') { endXform(true); e.preventDefault(); return; }
    if (k === 'enter') { endXform(false); e.preventDefault(); return; }
    if (k === 'x' || k === 'y' || k === 'z') { xf.axis = xf.axis === k ? null : (k === 'z' ? 'y' : k); showXHint(); e.preventDefault(); return; }
    return;
  }
  if (k === 'f1') { e.preventDefault(); if (manualReady()) openManual(); return; }
  if (k === 'f2') { e.preventDefault(); toliOpen ? closeToli() : openToli(); return; }
  if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); redo(); return; }
  if ((e.ctrlKey || e.metaKey) && e.altKey && k === 's') { e.preventDefault(); doAct('incsave'); return; }
  if ((e.ctrlKey || e.metaKey) && k === 's') { e.preventDefault(); doAct('save'); return; }
  if ((e.ctrlKey || e.metaKey) && k === 'o') { e.preventDefault(); doAct('open'); return; }
  if ((e.ctrlKey || e.metaKey) && k === 'n') { e.preventDefault(); newProject(); return; }

  if (k === ' ') { e.preventDefault(); togglePlay(); }
  else if (k === 'i') { e.altKey ? delKey() : addKey(); }
  else if (k === 'u') updKey();
  else if (k === 'g') { e.preventDefault(); startXform('move'); }
  else if (k === 'r') { e.preventDefault(); startXform('rot'); }
  else if (k === 's') { e.preventDefault(); startXform('scale'); }
  else if (k === 'n') $('npanel').style.display = $('npanel').style.display === 'none' ? 'block' : 'none';
  else if (k === 't') $('tools').style.display = $('tools').style.display === 'none' ? '' : 'none';
  else if (k === '0') setCamView(!camView);
  else if (k === '1' || k === '3' || k === '7') setView(k, e.ctrlKey);
  else if (k === 'f') setView('f');
  else if (k === 'home') { focusAll(); onCamMove(); }
  else if (k === '.') { focusSel(); onCamMove(); }
  else if (k === 'e') exportPNG();
  else if (k === 'p') { showPip = !showPip; $('btnPip').classList.toggle('on', showPip); }
  else if (k === 'a' && e.shiftKey) addPerson();
  else if (k === 'x' && e.shiftKey) { clearKeys(); toast('Кадрууд цэвэрлэгдлээ'); }
  else if ((k === 'x' || k === 'delete' || k === 'backspace') && active) {
    if (active.userData.kind === 'person') removePerson(active); else removeProp(active);
  }
  else if (k === 'escape') setActive(null);
  else if (k === '-' || k === '_') removePerson();
  else if (k === '=' || k === '+') addPerson();
  else if (k === 'arrowleft') { stopPlay(); stopPlay0(e.shiftKey ? 'start' : 'prev'); e.preventDefault(); }
  else if (k === 'arrowright') { stopPlay(); stopPlay0(e.shiftKey ? 'end' : 'next'); e.preventDefault(); }
  else if (k === 'arrowup') { stopPlay0('prevk'); e.preventDefault(); }
  else if (k === 'arrowdown') { stopPlay0('nextk'); e.preventDefault(); }
});
window.addEventListener('resize', () => { drawTimeline(); });

/* ══════════════════════════════════════════════════════════════
   27. ТҮҮХ — БУЦААХ / ДАХИХ   (Blender: Edit ▸ Undo / Redo)
   Өөрчлөлт бүрийн дараа commit() дуудна. Төлөв бүхэлдээ JSON
   болж хадгалагдах тул буцаахад тайз, кадр, тохиргоо бүгд сэргэнэ.
   ══════════════════════════════════════════════════════════════ */
const HIST_MAX = 80;
let hist = [], histI = -1, histLock = false, lastSnap = '';

function commit(label, force) {
  if (histLock) return;
  let s; try { s = serialize(); } catch (e) { return; }
  if (!force && s === lastSnap) return;
  lastSnap = s;
  hist = hist.slice(0, histI + 1);
  hist.push({ s: s, label: label || 'Өөрчлөлт', t: Date.now() });
  if (hist.length > HIST_MAX) hist.shift();
  histI = hist.length - 1;
  asDirty = true;
  if (hist.length > 1) recBar(false);
  refreshFix();
}
function histReset(label) {
  hist = []; histI = -1; lastSnap = '';
  commit(label || 'Нээлтийн төлөв', true);
}
function histGo(i) {
  const e = hist[i]; if (!e || i === histI) return;
  const keepView = camView ? null : cloneS(state);
  const f = curFrame;
  histLock = true;
  try { loadProject(JSON.parse(e.s), true); }
  catch (err) { histLock = false; toast('Түүхийг сэргээж чадсангүй', 'err'); return; }
  histLock = false;
  histI = i; lastSnap = e.s;
  if (keepView) { Object.assign(state, keepView); state.target.copy(keepView.target); }
  setFrame(clamp(f, fStart, fEnd));
  asDirty = true;
  syncAll(); diagnose(); refreshFix();
}
function undo() {
  if (histI <= 0) { toast('Буцаах зүйл алга'); return; }
  const l = hist[histI].label; histGo(histI - 1); toast('↶ Буцаав · ' + l);
}
function redo() {
  if (histI >= hist.length - 1) { toast('Дахих зүйл алга'); return; }
  histGo(histI + 1); toast('↷ Дахив · ' + hist[histI].label);
}

/* ══════════════════════════════════════════════════════════════
   28. АВТО ХАДГАЛАЛТ БА СЭРГЭЭЛТ
   (Blender: Save & Load ▸ Auto Save · File ▸ Recover Last Session)
   ══════════════════════════════════════════════════════════════ */
const AS_KEY = '1stStudio.camera.autosave.v3';
const AS_CFG = '1stStudio.camera.cfg.v3';
const AS_MAX = 10;
let asOn = true, asSec = 30, asDirty = false, asLastAt = 0, asOk = true, asTick = null;

let asFailAt = 0;
function asFail() { asOk = false; asFailAt = Date.now(); }
/** Санах ой нэг удаа алдаа өгсөн ч дахин оролдох боломж үлдээнэ */
function asRetry() { if (!asOk && Date.now() - asFailAt > 30000) asOk = true; return asOk; }
function lsRead(k) { try { return localStorage.getItem(k); } catch (e) { asFail(); return null; } }
function lsWrite(k, v) { try { localStorage.setItem(k, v); asOk = true; return true; } catch (e) { return false; } }
function asList() { try { return JSON.parse(lsRead(AS_KEY) || '[]') || []; } catch (e) { return []; } }
function asWrite(list) {
  for (let i = 0; i < 5; i++) {
    if (lsWrite(AS_KEY, JSON.stringify(list))) return true;
    if (list.length <= 1) break;
    list.pop();                       // зай дүүрсэн бол хамгийн хуучныг хаяна
  }
  asFail(); return false;
}
function asSaveCfg() { lsWrite(AS_CFG, JSON.stringify({ asOn: asOn, asSec: asSec })); }
/** Хадгалах үнэ цэнэтэй ажил байгаа эсэх — хоосон эхлэлийг хадгалахгүй */
function asWorthSaving() {
  return !!(keys.length || props.length || hist.length > 1 ||
    ($('sceneTxt').value || '').trim() || ($('inPrompt').value || '').trim());
}
function asSave(manual) {
  if (!asOk && !manual) return false;
  if (!manual && !asWorthSaving()) { asDirty = false; return false; }
  let data; try { data = serialize(); } catch (e) { return false; }
  const list = asList();
  if (!manual && list[0] && list[0].data === data) { asDirty = false; asLastAt = Date.now(); return false; }
  list.unshift({
    t: Date.now(), m: !!manual, k: keys.length, p: people.length, o: props.length,
    d: +durSec().toFixed(2), env: envId, data: data
  });
  while (list.length > AS_MAX) list.pop();
  const ok = asWrite(list);
  if (ok) { asDirty = false; asLastAt = Date.now(); }
  refreshFix();
  return ok;
}
function asRestore(i) {
  const e = asList()[i];
  if (!e) { toast('Хадгалалт олдсонгүй', 'err'); return; }
  let d; try { d = JSON.parse(e.data); } catch (err) { toast('Хадгалалт эвдэрсэн байна', 'err'); return; }
  if (asWorthSaving()) asSave(true);            /* одоогийн ажлыг эхлээд хадгална — алдагдахгүй */
  loadProject(d, true);
  histReset('Сэргээсэн: ' + asClock(e.t));
  syncAll(); recBar(false);
  toast('⟲ ' + asClock(e.t) + '-ийн хадгалалт сэргээгдлээ', 'ok');
}
function asDelete(i) {
  const list = asList(); if (!list[i]) return;
  list.splice(i, 1); asWrite(list); refreshFix(); toast('Хадгалалт устгагдлаа');
}
function asClearAll() {
  asWrite([]); refreshFix(); recBar(false); toast('Бүх авто хадгалалт цэвэрлэгдлээ');
}
const p2 = n => (n < 10 ? '0' : '') + n;
function asClock(t) { const d = new Date(t); return p2(d.getHours()) + ':' + p2(d.getMinutes()); }
function asWhen(t) {
  const d = new Date(t), now = new Date(), mins = Math.round((now - d) / 60000);
  if (mins < 1) return 'дөнгөж сая';
  if (mins < 60) return mins + ' мин өмнө';
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return 'өнөөдөр ' + asClock(t);
  return p2(d.getMonth() + 1) + '/' + p2(d.getDate()) + ' ' + asClock(t);
}
function asSetup() {
  try {
    const c = JSON.parse(lsRead(AS_CFG) || '{}');
    if (c.asOn !== undefined) asOn = !!c.asOn;
    if (c.asSec) asSec = clamp(+c.asSec, 10, 600);
  } catch (e) { }
  const chk = $('asChk'), sel = $('asEvery');
  if (chk) chk.checked = asOn;
  if (sel) {
    if (!Array.from(sel.options).some(o => +o.value === asSec)) {
      const o = document.createElement('option');
      o.value = String(asSec); o.textContent = asSec + ' секунд'; sel.appendChild(o);
    }
    sel.value = String(asSec);
  }
  if (asTick) clearInterval(asTick);
  asLastAt = Date.now();          /* нээсэн даруйд бичихгүй — бүтэн интервал хүлээнэ */
  asTick = setInterval(() => {
    if (!asOn || !asDirty || playing || xf) return;
    if (!asRetry()) return;
    if (Date.now() - asLastAt < asSec * 1000) return;
    asSave(false);
  }, 2000);
  window.addEventListener('beforeunload', () => { if (asOn && asOk && asDirty) asSave(false); });
}
/** Нээхэд өмнөх ажил үлдсэн бол дээд талд санал болгоно */
function asOffer() {
  const list = asList(); if (!list.length) return;
  const e = list[0];
  if (Date.now() - e.t > 14 * 24 * 3600 * 1000) return;     // 2 долоо хоногоос хуучин бол үгүй
  if (!e.k && !e.p && !e.o) return;                          // хоосон төслийг санал болгохгүй
  recBar(true, e);
}
function recBar(show, e) {
  const el = $('recbar'); if (!el) return;
  if (!show) { el.classList.remove('show'); return; }
  $('recTxt').innerHTML = 'Өмнөх ажил хадгалагдсан байна — <b>' + asWhen(e.t) + '</b> · ' +
    e.k + ' кадр · ' + e.p + ' дүр · ' + (e.d || 0).toFixed(1) + 'с';
  el.classList.add('show');
}

/* ══════════════════════════════════════════════════════════════
   29. ОНОШИЛГОО — АВТОМАТ ШАЛГАХ БА ЗАСАХ
   Blender-ийн "Clean Up" / "Clean Keyframes" -ийн адил зарчим:
   алдааг олж, нэг товшилтоор засна. Засвар бүрийг Ctrl+Z-ээр буцаана.
   ══════════════════════════════════════════════════════════════ */
let issues = [];
const isBad = v => !(typeof v === 'number' && isFinite(v));
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; };
/** Хоёр камерын төлөвийн "мэдрэгдэх" ялгаа (ойролцоогоор метр) */
function stateDist(a, b) {
  return Math.abs(angDiff(a.theta, b.theta)) * Math.max(a.radius, b.radius) * .8 +
    Math.abs(a.phi - b.phi) * Math.max(a.radius, b.radius) * .8 +
    Math.abs(a.radius - b.radius) +
    Math.abs(a.fov - b.fov) / 5 +
    a.target.distanceTo(b.target) +
    Math.abs((a.roll || 0) - (b.roll || 0)) * 2.5;
}
function sortKeys() { keys.sort((a, b) => a.frame - b.frame); }
function clampAllKeys() { keys.forEach(k => clampS(k)); }
/** Кадруудыг шинэ муж руу пропорциональ шилжүүлнэ */
function rescaleKeys(ns, ne) {
  if (keys.length < 2) { keys.forEach(k => k.frame = clamp(k.frame, ns, ne)); return; }
  const a = keys[0].frame, b = keys[keys.length - 1].frame, span = Math.max(1, b - a);
  keys.forEach(k => k.frame = Math.round(lerp(ns, ne, (k.frame - a) / span)));
  fixGaps(1);
}
/** Давхардсан / хэт ойрхон фреймүүдийг салгана */
function fixGaps(minGap) {
  sortKeys();
  const g = Math.max(1, minGap || 1);
  for (let i = 1; i < keys.length; i++) {
    if (keys[i].frame - keys[i - 1].frame < g) keys[i].frame = keys[i - 1].frame + g;
  }
  const over = keys.length ? keys[keys.length - 1].frame - fEnd : 0;
  if (over > 0) {
    if (fEnd + over - fStart <= 20000) { fEnd = fEnd + over; $('fEnd').value = fEnd; }
    else for (let i = keys.length - 1; i > 0; i--) if (keys[i].frame > fEnd) keys[i].frame = fEnd - (keys.length - 1 - i) * g;
  }
}
const ISS = (sev, id, msg, tip, fix) => ({ sev: sev, id: id, msg: msg, tip: tip || '', fix: fix || null });

function diagnose() {
  const out = [];

  /* ── Цаг хугацааны муж ── */
  if (fEnd <= fStart) out.push(ISS('err', 'range',
    'Фреймийн муж буруу байна (төгсгөл нь эхлэлээсээ бага).',
    'Төгсгөлийн фреймийг эхлэл + 4 секунд болгож засна.',
    () => { fEnd = fStart + Math.max(2, Math.round(fps * 4)); $('fEnd').value = fEnd; }));
  if (!fps || fps < 1 || fps > 240) out.push(ISS('err', 'fps',
    'FPS утга буруу байна.', '24 fps (кино стандарт) болгоно.',
    () => { fps = 24; $('fps').value = 24; }));

  /* ── Түлхүүр кадрууд ── */
  if (!keys.length) {
    out.push(ISS('err', 'nokey', 'Түлхүүр кадр алга — хөдөлгөөн үүсэхгүй.',
      'Одоогийн камерын байрлалыг эхний кадр болгон тавина (гараар: I товч).',
      () => { addKey(fStart); }));
  } else if (keys.length === 1) {
    out.push(ISS('warn', 'onekey', 'Ганцхан түлхүүр кадртай — камер хөдлөхгүй.',
      'Сүүлийн фрейм дээр бага зэрэг ойртсон хоёр дахь кадрыг нэмнэ.',
      () => {
        const s = cloneS(keys[0]); s.frame = fEnd; s.radius = clamp(s.radius * .78, .6, 90);
        keys.push(s); sortKeys(); activeK = 0;
      }));
  }

  const nanIdx = [], oobIdx = [], clampIdx = [];
  keys.forEach((k, i) => {
    if (isBad(k.theta) || isBad(k.phi) || isBad(k.radius) || isBad(k.fov) || isBad(k.roll) ||
      !k.target || isBad(k.target.x) || isBad(k.target.y) || isBad(k.target.z) || isBad(k.frame)) { nanIdx.push(i); return; }
    if (k.frame < fStart || k.frame > fEnd) oobIdx.push(i);
    if (k.phi < .05 || k.phi > 1.95 || k.radius < .55 || k.radius > 90 ||
      k.fov < 8 || k.fov > 110 || Math.abs(k.roll) > .9 || k.target.y < .05 || k.target.y > 9) clampIdx.push(i);
  });
  if (nanIdx.length) out.push(ISS('err', 'nan',
    nanIdx.length + ' кадарт эвдэрсэн тоон утга байна (NaN / хязгааргүй).',
    'Хөрш кадруудын утгаар, эсвэл стандарт утгаар сольж засна.',
    () => {
      const okAt = j => {
        const k = keys[j];
        return k && !isBad(k.theta) && !isBad(k.phi) && !isBad(k.radius) && !isBad(k.fov) &&
          k.target && !isBad(k.target.x) && !isBad(k.target.y) && !isBad(k.target.z);
      };
      nanIdx.slice().reverse().forEach(i => {
        let a = i - 1, b = i + 1, ref = null;                 /* хамгийн ойрын БҮТЭН кадрыг олно */
        while (a >= 0 || b < keys.length) {
          if (a >= 0 && okAt(a)) { ref = keys[a]; break; }
          if (b < keys.length && okAt(b)) { ref = keys[b]; break; }
          a--; b++;
        }
        const base = ref ? cloneS(ref) : cloneS(state);
        base.frame = isBad(keys[i].frame) ? clamp(fStart + i, fStart, fEnd) : keys[i].frame;
        keys[i] = clampS(base);
      });
      fixGaps(1);
    }));
  if (oobIdx.length) out.push(ISS('err', 'oob',
    oobIdx.length + ' кадр фреймийн мужаас гадуур байна.',
    'Мужид багтаан оруулж, дарааллыг нь засна.',
    () => { keys.forEach(k => k.frame = clamp(Math.round(k.frame), fStart, fEnd)); fixGaps(2); }));
  if (clampIdx.length) out.push(ISS('warn', 'clamp',
    clampIdx.length + ' кадрын утга зөвшөөрөгдөх хязгаараас хэтэрсэн.',
    'Линз, зай, өндөр, налууг зөв хязгаарт нь буцаана.',
    () => { clampAllKeys(); }));

  /* давхардсан ба хэт ойр кадрууд */
  let dup = 0, tight = 0;
  for (let i = 1; i < keys.length; i++) {
    const g = keys[i].frame - keys[i - 1].frame;
    if (g <= 0) dup++; else if (g < 3) tight++;
  }
  if (dup) out.push(ISS('err', 'dup', dup + ' кадр нэг фрейм дээр давхарлаа.',
    'Хамгийн багадаа 2 фреймээр салгана.', () => { fixGaps(2); }));
  else if (tight) out.push(ISS('warn', 'tight', tight + ' кадр хоорондоо хэт ойрхон (3 фреймээс бага).',
    'Хөдөлгөөн огцом харагдана — 3 фреймийн зайтай болгоно.', () => { fixGaps(3); }));

  /* ── Камерын байрлал ── */
  const under = [], tooClose = [], notFit = [];
  keys.forEach((k, i) => {
    if (isBad(k.phi) || isBad(k.radius)) return;
    if (posOf(k).y < .25) under.push(i);
    if (k.radius < Math.max(people.length ? 1.05 : 0, minSafeRadius())) tooClose.push(i);
    if (!allInFrame(k)) notFit.push(i);
  });
  if (under.length) out.push(ISS('err', 'under',
    under.length + ' кадарт камер газрын доогуур / хэт нам байна.',
    'Камерыг газраас дээш өргөж, өнцгийг нь зөөлрүүлнэ.',
    () => {
      keys.forEach(k => { let n = 0; while (posOf(k).y < .35 && n++ < 60) k.phi = Math.max(.05, k.phi - .035); clampS(k); });
    }));
  if (tooClose.length) {
    const safe = Math.max(people.length ? 1.4 : 0, minSafeRadius() * 1.12);
    out.push(ISS('warn', 'close',
      tooClose.length + ' кадарт камер дүр/загварын дотуур орох магадлалтай.',
      'Зайг ' + safe.toFixed(1) + ' метр болгож татна — ойрын кадр хэвээр үлдэнэ.',
      () => { keys.forEach(k => { if (k.radius < safe) k.radius = safe; clampS(k); }); }));
  }
  if (notFit.length) out.push(ISS('warn', 'fit',
    notFit.length + ' кадарт бүх дүр кадарт багтахгүй байна.',
    'Зайг нэмж бүх дүрийг хүрээнд оруулна (авто жаазлалт).',
    () => { enhFit(); }));

  /* ── Хөдөлгөөний чанар ── */
  if (keys.length >= 2) {
    let fastSeg = 0, lensJump = 0;
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      const dt = Math.max(1, b.frame - a.frame) / fps;
      if (Math.abs(angDiff(b.theta, a.theta)) / dt > 2.4) fastSeg++;
      if (Math.abs(lensMM(b.fov) - lensMM(a.fov)) > 55 && dt < 1.2) lensJump++;
    }
    if (fastSeg) out.push(ISS('warn', 'fast',
      fastSeg + ' хэсэгт эргэлт хэт хурдан (AI видео дээр зураг хайлах эрсдэлтэй).',
      'Хугацааг уртасгаж хурдыг жигд болгоно.',
      () => { const need = Math.round((fEnd - fStart) * 1.5); fEnd = fStart + Math.min(need, 20000 - fStart); $('fEnd').value = fEnd; rescaleKeys(fStart, fEnd); enhRetime(); }));
    if (lensJump) out.push(ISS('tip', 'lens',
      lensJump + ' хэсэгт линз огцом үсэрч байна.',
      'Линзний өөрчлөлтийг зөөлрүүлнэ (дунджаар нь тараана).',
      () => { enhSmooth(.55, ['fov']); }));

    /* зигзаг / доргио */
    let jit = 0;
    for (let i = 1; i < keys.length - 1; i++) {
      const mid = { theta: keys[i - 1].theta + angDiff(keys[i + 1].theta, keys[i - 1].theta) / 2, phi: (keys[i - 1].phi + keys[i + 1].phi) / 2, radius: (keys[i - 1].radius + keys[i + 1].radius) / 2, fov: (keys[i - 1].fov + keys[i + 1].fov) / 2, roll: ((keys[i - 1].roll || 0) + (keys[i + 1].roll || 0)) / 2, target: keys[i - 1].target.clone().lerp(keys[i + 1].target, .5) };
      const d = stateDist(keys[i], mid);
      if (d > .02 && d < .28) jit++;
    }
    if (jit) out.push(ISS('tip', 'jit', jit + ' кадарт өчүүхэн чичрэлт (jitter) мэдрэгдэж байна.',
      'Мэдрэгдэхгүй жижиг хазайлтыг арилгаж, замыг гөлгөр болгоно.',
      () => { enhDeJitter(); }));

    /* илүүдэл кадр */
    let redun = 0;
    for (let i = 1; i < keys.length - 1; i++) {
      const a = keys[i - 1], b = keys[i], c = keys[i + 1];
      const u = (b.frame - a.frame) / Math.max(1, c.frame - a.frame);
      const lin = { theta: a.theta + angDiff(c.theta, a.theta) * u, phi: lerp(a.phi, c.phi, u), radius: lerp(a.radius, c.radius, u), fov: lerp(a.fov, c.fov, u), roll: lerp(a.roll || 0, c.roll || 0, u), target: a.target.clone().lerp(c.target, u) };
      if (stateDist(b, lin) < .1) redun++;
    }
    if (redun) out.push(ISS('tip', 'redun', redun + ' кадр илүүдэж байна (хөрш кадруудаасаа ялгарахгүй).',
      'Blender-ийн "Clean Keyframes"-тэй адил — хэрэггүй кадруудыг хасна.',
      () => { enhClean(.1); }));

    /* өчүүхэн санамсаргүй налуу */
    let tilt = 0;
    keys.forEach(k => { const d = Math.abs(k.roll || 0) * 180 / Math.PI; if (d > .15 && d < 2.5) tilt++; });
    if (tilt) out.push(ISS('tip', 'tilt', tilt + ' кадарт хаяа өчүүхэн налуу байна (санамсаргүй roll).',
      'Тэнгэрийн хаяаг яг тэгш болгоно.', () => { enhLevel(); }));
  }

  /* ── Хугацаа ── */
  const dur = durSec();
  if (keys.length >= 2 && dur < 1.2) out.push(ISS('warn', 'short',
    'Шот хэт богино (' + dur.toFixed(1) + 'с).',
    'Ихэнх AI видео хэрэгсэл 4–10 секундэд хамгийн сайн ажилладаг — 6 секунд болгоно.',
    () => { const ne = fStart + Math.round(fps * 6); rescaleKeys(fStart, ne); fEnd = ne; $('fEnd').value = fEnd; }));
  if (dur > 45) out.push(ISS('tip', 'long',
    'Шот хэт урт (' + dur.toFixed(0) + 'с) — AI хэрэгслүүд ихэвчлэн 10с хүртэл авдаг.',
    'Хугацааг 10 секунд болгож хумина.',
    () => { const ne = fStart + Math.round(fps * 10); rescaleKeys(fStart, ne); fEnd = ne; $('fEnd').value = fEnd; }));

  /* ── Тайз ── */
  if (!people.length && !subjModels().length) out.push(ISS('tip', 'noppl', 'Тайзан дээр нэг ч дүр алга.',
    'Хоёр дүр нэмж нүүр тулган байрлуулна.',
    () => { addPerson(undefined, undefined, undefined, true); addPerson(undefined, undefined, undefined, true); arrange('face'); }));
  let ovl2 = 0, outside = 0;
  people.forEach((p, i) => {
    if (Math.abs(p.position.x) > 22 || Math.abs(p.position.z) > 22) outside++;
    for (let j = i + 1; j < people.length; j++) {
      if (Math.hypot(p.position.x - people[j].position.x, p.position.z - people[j].position.z) < .5) ovl2++;
    }
  });
  if (outside) out.push(ISS('warn', 'outside', outside + ' дүр тайзны талбайгаас гарсан байна.',
    'Талбай дотор нь буцаан оруулна.',
    () => { people.concat(props).forEach(o => { o.position.x = clamp(o.position.x, -22, 22); o.position.z = clamp(o.position.z, -22, 22); }); }));
  if (ovl2) out.push(ISS('warn', 'ovl', ovl2 + ' хос дүр хоорондоо давхарлаа (0.5м-ээс ойр).',
    'Бие биенээсээ зайтай болгож жаахан түлхэнэ.',
    () => {
      for (let pass = 0; pass < 24; pass++) {
        let moved = false;
        for (let i = 0; i < people.length; i++) for (let j = i + 1; j < people.length; j++) {
          const a = people[i], b = people[j];
          let dx = b.position.x - a.position.x, dz = b.position.z - a.position.z;
          let d = Math.hypot(dx, dz);
          if (d < .7) {
            if (d < .001) { dx = (i % 2 ? 1 : -1) * .05; dz = .05; d = .07; }
            const push = (.72 - d) / 2;
            a.position.x -= dx / d * push; a.position.z -= dz / d * push;
            b.position.x += dx / d * push; b.position.z += dz / d * push;
            moved = true;
          }
        }
        if (!moved) break;
      }
      people.forEach(o => { o.position.x = clamp(o.position.x, -22, 22); o.position.z = clamp(o.position.z, -22, 22); });
    }));

  /* ── Промт ── */
  if (!($('sceneTxt').value || '').trim()) out.push(ISS('tip', 'scene',
    'Дүр зургийн тайлбар хоосон байна.',
    'Энэ талбар AI промтын чанарыг хамгийн их өсгөдөг — «✨ Промт» таб дээр 1–2 өгүүлбэр бичээрэй.', null));
  if (shakeAmt > .7) out.push(ISS('tip', 'shake',
    'Доргио хэт өндөр (' + Math.round(shakeAmt * 100) + '%).',
    'AI видео дээр зураг хайлах эрсдэлтэй — 45% болгож бууруулна.',
    () => { shakeAmt = .45; $('cShake').value = 45; $('cShakeV').textContent = '45%'; }));

  issues = out;
  return out;
}

/** Засагдах бүх алдааг дараалан засна */
function fixAll(silent) {
  const wasLocked = histLock;
  histLock = true;                              /* завсрын алхмуудыг түүхэнд бичихгүй */
  let before = '', done = 0;
  try { before = serialize(); } catch (e) { }
  let list = diagnose().filter(x => x.fix);
  try {
    for (let round = 0; round < 4 && list.length; round++) {
      list.forEach(x => { try { x.fix(); } catch (e) { } });
      sortKeys(); clampAllKeys(); buildSpline();
      const after = diagnose().filter(x => x.fix);
      done += Math.max(0, list.length - after.length);   /* үнэхээр арилсан зөрчлийн тоо */
      list = after;
    }
  } finally { histLock = wasLocked; }
  clampAllKeys(); sortKeys();
  if (keys.length) activeK = clamp(activeK, 0, keys.length - 1);
  syncAll();
  let changed = false;
  try { changed = serialize() !== before; } catch (e) { changed = !!done; }
  if (!silent) {
    if (changed) { commit('Автомат засвар (' + done + ')'); toast('🩹 ' + done + ' зөрчил зассан', 'ok'); }
    else toast('✓ Засах зүйл алга — бүх шалгалт цэвэр', 'ok');
  }
  diagnose(); refreshFix();
  return done;
}
function fixOne(i) {
  const x = issues[i]; if (!x || !x.fix) return;
  const wasLocked = histLock;
  histLock = true;
  try { x.fix(); }
  catch (e) { histLock = wasLocked; toast('Энэ засварыг хийж чадсангүй', 'err'); return; }
  finally { histLock = wasLocked; }
  sortKeys(); clampAllKeys();
  if (keys.length) activeK = clamp(activeK, 0, keys.length - 1);
  syncAll(); commit('Засвар: ' + x.id);
  diagnose(); refreshFix();
  toast('✓ ' + x.msg, 'ok');
}

/* ══════════════════════════════════════════════════════════════
   30. АВТОМАТ САЙЖРУУЛАЛТ (Blender: Graph Editor ▸ Key ▸ Clean / Smooth)
   ══════════════════════════════════════════════════════════════ */
/** theta-г "хамгийн богино зам"-аар дэлгэсэн массив */
function thetaChain() {
  const t = [keys[0].theta];
  for (let i = 1; i < keys.length; i++) t.push(t[i - 1] + angDiff(keys[i].theta, keys[i - 1].theta));
  return t;
}
/** Хөршүүдтэй нь дунджилж гөлгөр болгоно. only = зөвхөн тухайн талбарууд */
function enhSmooth(amt, only) {
  if (keys.length < 3) return 0;
  const a = clamp(amt === undefined ? .4 : amt, 0, 1);
  const has = f => !only || only.indexOf(f) >= 0;
  const th = thetaChain();
  const src = keys.map((k, i) => ({
    theta: th[i], phi: k.phi, radius: k.radius, fov: k.fov, roll: k.roll || 0,
    tx: k.target.x, ty: k.target.y, tz: k.target.z
  }));
  const mix = (p, q, r) => p * .25 + q * .5 + r * .25;
  let n = 0;
  for (let i = 1; i < keys.length - 1; i++) {
    const p = src[i - 1], q = src[i], r = src[i + 1], k = keys[i];
    if (has('theta')) k.theta = lerp(q.theta, mix(p.theta, q.theta, r.theta), a);
    if (has('phi')) k.phi = lerp(q.phi, mix(p.phi, q.phi, r.phi), a);
    if (has('radius')) k.radius = lerp(q.radius, mix(p.radius, q.radius, r.radius), a);
    if (has('fov')) k.fov = lerp(q.fov, mix(p.fov, q.fov, r.fov), a);
    if (has('roll')) k.roll = lerp(q.roll, mix(p.roll, q.roll, r.roll), a);
    if (has('target')) {
      k.target.set(lerp(q.tx, mix(p.tx, q.tx, r.tx), a), lerp(q.ty, mix(p.ty, q.ty, r.ty), a), lerp(q.tz, mix(p.tz, q.tz, r.tz), a));
    }
    clampS(k); n++;
  }
  return n;
}
/** Зөвхөн мэдрэгдэхгүй жижиг чичрэлтийг арилгана */
function enhDeJitter() {
  if (keys.length < 3) return 0;
  let n = 0;
  for (let i = 1; i < keys.length - 1; i++) {
    const a = keys[i - 1], b = keys[i], c = keys[i + 1];
    const mid = {
      theta: a.theta + angDiff(c.theta, a.theta) / 2, phi: (a.phi + c.phi) / 2,
      radius: (a.radius + c.radius) / 2, fov: (a.fov + c.fov) / 2,
      roll: ((a.roll || 0) + (c.roll || 0)) / 2, target: a.target.clone().lerp(c.target, .5)
    };
    const d = stateDist(b, mid);
    if (d > .02 && d < .28) {
      const w = .75;
      b.theta = b.theta + angDiff(mid.theta, b.theta) * w;
      b.phi = lerp(b.phi, mid.phi, w); b.radius = lerp(b.radius, mid.radius, w);
      b.fov = lerp(b.fov, mid.fov, w); b.roll = lerp(b.roll || 0, mid.roll, w);
      b.target.lerp(mid.target, w);
      clampS(b); n++;
    }
  }
  return n;
}
/** Хөршүүдийнхээ шугаман дундажтай ижил "хоосон" кадруудыг хасна */
function enhClean(tol) {
  if (keys.length < 3) return 0;
  const t = tol === undefined ? .12 : tol;
  let removed = 0;
  for (let i = keys.length - 2; i >= 1; i--) {
    const a = keys[i - 1], b = keys[i], c = keys[i + 1];
    const u = (b.frame - a.frame) / Math.max(1, c.frame - a.frame);
    const lin = {
      theta: a.theta + angDiff(c.theta, a.theta) * u, phi: lerp(a.phi, c.phi, u),
      radius: lerp(a.radius, c.radius, u), fov: lerp(a.fov, c.fov, u),
      roll: lerp(a.roll || 0, c.roll || 0, u), target: a.target.clone().lerp(c.target, u)
    };
    if (stateDist(b, lin) < t) { keys.splice(i, 1); removed++; }
  }
  if (removed && keys.length) activeK = clamp(activeK, 0, keys.length - 1);
  return removed;
}
/** Хугацааг хөдөлгөөний хэмжээгээр дахин хуваарилж хурдыг жигд болгоно */
function enhRetime() {
  if (keys.length < 3) return 0;
  const f0 = keys[0].frame, f1 = keys[keys.length - 1].frame, span = f1 - f0;
  if (span < keys.length * 2) return 0;
  const seg = [];
  let total = 0;
  for (let i = 0; i < keys.length - 1; i++) {
    const d = Math.max(.02, stateDist(keys[i], keys[i + 1]));
    seg.push(d); total += d;
  }
  let acc = 0;
  for (let i = 1; i < keys.length - 1; i++) {
    acc += seg[i - 1];
    keys[i].frame = Math.round(f0 + span * (acc / total));
  }
  fixGaps(2);
  return keys.length - 2;
}
/** Бүх дүрийг кадарт багтаах — зайг нэмнэ */
function enhFit() {
  if (!people.length && !subjModels().length) return 0;
  let n = 0;
  const ar = shotAspect(), sp2 = spread(), tall = subjH();
  keys.forEach(k => {
    if (allInFrame(k)) return;
    const tan = Math.tan(k.fov * Math.PI / 360);
    const needW = sp2 * .55 / (tan * ar);          /* өргөнөөр багтаах */
    const needH = tall * .55 / tan;                /* өндрөөр багтаах (загварт чухал) */
    k.radius = clamp(Math.max(needW, people.length ? 0 : needH, minSafeRadius()) * 1.12, .6, 90);
    clampS(k); n++;
  });
  return n;
}
/** Санамсаргүй өчүүхэн налууг тэглэнэ */
function enhLevel() {
  let n = 0;
  keys.forEach(k => { const d = Math.abs(k.roll || 0) * 180 / Math.PI; if (d > .15 && d < 2.5) { k.roll = 0; n++; } });
  return n;
}
/** Эхлэл ба төгсгөлийг зөөлрүүлнэ (кино маягийн ease) */
function enhEase() {
  interp = 'smooth'; $('interp').value = 'smooth';
  if (keys.length < 3) return 1;
  const f0 = keys[0].frame, f1 = keys[keys.length - 1].frame, span = f1 - f0;
  if (span < keys.length * 3) return 1;
  for (let i = 1; i < keys.length - 1; i++) {
    const u = (keys[i].frame - f0) / span;
    const e = u * u * (3 - 2 * u);                       // smoothstep
    keys[i].frame = Math.round(f0 + span * lerp(u, e, .45));
  }
  fixGaps(2);
  return 1;
}
/** Нэг товшилтын бүрэн сайжруулалт */
function enhAuto() {
  const rep = [];
  const f = fixAll(true); if (f) rep.push(f + ' алдаа засав');
  let n;
  n = enhDeJitter(); if (n) rep.push(n + ' кадрын чичрэлт арилгав');
  n = enhLevel(); if (n) rep.push(n + ' кадрын тэнгэрийн хаяа тэгшлэв');
  n = enhClean(.09); if (n) rep.push(n + ' илүүдэл кадр хасав');
  n = enhFit(); if (n) rep.push(n + ' кадрын жаазлалт засав');
  n = enhRetime(); if (n) rep.push('хугацааг жигдрүүлэв');
  n = enhSmooth(.35); if (n) rep.push('замыг гөлгөр болгов');
  enhEase(); rep.push('зөөлөн эхлэл-төгсгөл тавив');
  clampAllKeys(); sortKeys();
  if (keys.length) activeK = clamp(activeK, 0, keys.length - 1);
  syncAll(); commit('Автомат сайжруулалт');
  diagnose(); refreshFix();
  lastReport = rep;
  const el = $('enhRep'); if (el) el.innerHTML = rep.length ? '✓ ' + rep.join('<br>✓ ') : 'Сайжруулах зүйл олдсонгүй — аль хэдийн цэвэрхэн байна.';
  toast('✨ Сайжруулалт дууслаа · ' + rep.length + ' алхам', 'ok');
}
let lastReport = [];
/** Ганц сайжруулалтыг ажиллуулаад тайлагнана */
function runEnh(kind) {
  if (!keys.length) { toast('Эхлээд түлхүүр кадр хэрэгтэй', 'err'); return; }
  const amt = (+($('enhAmt') ? $('enhAmt').value : 40)) / 100;
  let n = 0, nm = '';
  switch (kind) {
    case 'smooth': n = enhSmooth(amt); nm = 'Гөлгөр болгов (' + n + ' кадр)'; break;
    case 'jit': n = enhDeJitter(); nm = 'Чичрэлт арилгав (' + n + ' кадр)'; break;
    case 'clean': n = enhClean(.06 + amt * .18); nm = 'Илүүдэл кадр хасав (' + n + ')'; break;
    case 'retime': n = enhRetime(); nm = 'Хурдыг жигдрүүлэв'; break;
    case 'fit': n = enhFit(); nm = 'Жаазлалт засав (' + n + ' кадр)'; break;
    case 'level': n = enhLevel(); nm = 'Тэнгэрийн хаяаг тэгшлэв (' + n + ' кадр)'; break;
    case 'ease': n = enhEase(); nm = 'Зөөлөн эхлэл-төгсгөл'; break;
  }
  clampAllKeys(); sortKeys();
  if (keys.length) activeK = clamp(activeK, 0, keys.length - 1);
  syncAll(); commit('Сайжруулалт: ' + kind);
  diagnose(); refreshFix();
  const el = $('enhRep'); if (el) el.textContent = '✓ ' + nm;
  toast('✨ ' + nm, 'ok');
}

/* ══════════════════════════════════════════════════════════════
   31. «Сэргээх ба засах» самбарыг шинэчлэх
   ══════════════════════════════════════════════════════════════ */
const SEVNM = { err: ['Алдаа', 'e'], warn: ['Анхааруулга', 'w'], tip: ['Зөвлөмж', 't'] };
function refreshFix() {
  const fl = $('fixList'); if (!fl) return;
  diagnose();                      /* жагсаалт ба «Засах» товчнууд үргэлж одоогийн төлөвтэй таарна */

  /* — оношилгооны жагсаалт — */
  if (!issues.length) {
    fl.innerHTML = '<div class="okline">✓ Шалгалт цэвэр — засах зүйл алга</div>';
  } else {
    fl.innerHTML = issues.map((x, i) =>
      '<div class="iss ' + x.sev + '"><span class="dot"></span>' +
      '<div class="txt"><b>' + x.msg + '</b>' + (x.tip ? '<small>' + x.tip + '</small>' : '') + '</div>' +
      (x.fix ? '<button class="w fixb" data-fix="' + i + '">Засах</button>' : '<span class="nofix">гараар</span>') +
      '</div>').join('');
  }
  const cnt = { err: 0, warn: 0, tip: 0 };
  issues.forEach(x => cnt[x.sev]++);
  const sm = $('fixSum');
  if (sm) sm.innerHTML = issues.length
    ? '<b>' + cnt.err + '</b> алдаа · <b>' + cnt.warn + '</b> анхааруулга · <b>' + cnt.tip + '</b> зөвлөмж'
    : 'Сүүлийн шалгалтад алдаа олдсонгүй.';

  /* — түүх — */
  const hl = $('histList');
  if (hl) {
    hl.innerHTML = hist.slice().reverse().map((h, ri) => {
      const i = hist.length - 1 - ri;
      return '<div class="hrow' + (i === histI ? ' on' : '') + (i > histI ? ' dim' : '') + '" data-hist="' + i + '">' +
        '<span class="n">' + (i + 1) + '</span><span class="d">' + h.label + '</span>' +
        '<span class="t">' + asClock(h.t) + '</span></div>';
    }).join('');
    const hb = $('histInfo');
    if (hb) hb.textContent = (histI + 1) + ' / ' + hist.length + ' алхам';
  }

  /* — авто хадгалалт — */
  const al = $('asList');
  if (al) {
    const list = asList();
    al.innerHTML = list.length ? list.map((e, i) =>
      '<div class="arow"><span class="ic">' + (e.m ? '💾' : '⟲') + '</span>' +
      '<span class="d">' + asWhen(e.t) + '<small>' + e.k + ' кадр · ' + e.p + ' дүр · ' + (e.d || 0).toFixed(1) + 'с</small></span>' +
      '<button class="w" data-asr="' + i + '">Сэргээх</button>' +
      '<button class="w xb" data-asd="' + i + '" title="Устгах">✕</button></div>').join('')
      : '<div class="okline dim">Хадгалалт алга</div>';
    const ai = $('asInfo');
    if (ai) ai.innerHTML = !asOk
      ? '<span style="color:var(--warn)">Энэ хөтөч дээр санах ой хаалттай тул авто хадгалалт ажиллахгүй. Ctrl+S-ээр файлд хадгална уу.</span>'
      : (asOn ? 'Асаалттай · ' + asSec + ' секунд тутам' : 'Унтраалттай') +
      (asLastAt ? ' · сүүлд ' + asClock(asLastAt) : '');
  }
  const ub = $('btnUndo'), rb = $('btnRedo');
  if (ub) ub.disabled = histI <= 0;
  if (rb) rb.disabled = histI >= hist.length - 1;
}
function runDiag() {
  diagnose(); refreshFix();
  const n = issues.length;
  toast(n ? '🩺 ' + n + ' зүйл анзаарагдлаа' : '✓ Бүх шалгалт цэвэр', n ? '' : 'ok');
}

/* ─────────── 26. Эхлүүлэх ─────────── */
buildUI();
wireControls();
applyEnv('blender');
addPerson(undefined, undefined, undefined, true);
addPerson(undefined, undefined, undefined, true);
arrange('face');
$('fps').value = 24;
$('fStart').value = fStart; $('fEnd').value = fEnd;
$('btnLoop').classList.add('on');
focusAll();
setFrame(1);
applyCam(viewCam, state, null);
syncAll();
asSetup();
histReset('Нээлтийн төлөв');
asDirty = false;
if (manualReady()) manualInit();
diagnose(); refreshFix();
if (!applyUrlAuto()) asOffer();      /* сангаас ирсэн бол шууд үүсгэнэ */
tick();
console.log('%c1st Studio — Camera Director', 'color:#ffa028;font-weight:700', 'Blender 5.2 загвар — бэлэн.');







