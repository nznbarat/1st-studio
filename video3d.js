/* ══════════════════════════════════════════════════════════════
   1st Studio — Видео → 3D render (багц хөрвүүлэгч)

   Суулгац шаардахгүй.  Хавтас дүүрэн клипийг нэг ижил „3D render"
   промтоор дамжуулж, эх нэрээр нь буцааж хадгална.

   Хоёр эх үүсвэр:
     • Локал ComfyUI  — төлбөргүй, өөрийн GPU дээр
     • fal.ai         — API түлхүүрээр, секунд тутам төлнө

   Терминалын хувилбар (урт видеог автоматаар хэрчдэг):
     video-to-3d/  →  python -m v2v3d run
   ══════════════════════════════════════════════════════════════ */
'use strict';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const secs = (n) => (n >= 60 ? `${Math.floor(n / 60)}:${String(Math.round(n % 60)).padStart(2, '0')}` : `${n.toFixed(1)}с`);
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

const VIDEO_EXT = /\.(mp4|mov|m4v|mkv|webm)$/i;
const NON_ASCII = /[^\x20-\x7E]/;

/* fal.ai — секунд тутмын үнэ.  Видео лавлагаатай үед лавлагааны секунд ч
   тооцогдож, нийт дүн 0.6-аар үржинэ. */
const FAL_PRICE = { '480p': 0.2205, '720p': 0.4730, '1080p': 0.9460 };
const FAL_REF_MULTIPLIER = 0.6;
const FAL_MIN_SECONDS = 4;
const FAL_MAX_SECONDS = 30;

/* ═══════════════════════════════════════════════════════════
   1. Төлөв
   ═══════════════════════════════════════════════════════════ */
const state = {
  provider: 'comfy',
  files: [],          // {id, file, name, size, duration, status, note, outName}
  running: false,
  abort: false,
  outDir: null,       // FileSystemDirectoryHandle эсвэл null (татах горим)
  workflow: null,     // ComfyUI-гийн API-форматтай график
  workflowName: '',
  targets: {},
  clientId: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
};

const SETTINGS_KEY = 'v3d-settings';
const defaults = {
  provider: 'comfy',
  styleId: '3d-render',
  customPrompt: '',
  comfyUrl: 'http://127.0.0.1:8188',
  fps: 16,
  maxFrames: 121,
  strength: '',
  falKey: '',
  falEndpoint: 'bytedance/seedance-2.5/reference-to-video',
  resolution: '720p',
  aspect: 'auto',
  duration: 'auto',
  fixedSeconds: 5,
  seed: '',
  audio: false,
  concurrency: 1,
  retries: 2,
  overwrite: false,
};

function loadSettings() {
  try {
    return Object.assign({}, defaults, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'));
  } catch (e) {
    return Object.assign({}, defaults);
  }
}
function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* хадгалах боломжгүй бол зүгээр л үргэлжилнэ */ }
}
let cfg = loadSettings();

/* ═══════════════════════════════════════════════════════════
   2. Бүртгэл (лог)
   ═══════════════════════════════════════════════════════════ */
function log(message, kind) {
  const line = el('div', 'logline' + (kind ? ' ' + kind : ''));
  const time = new Date().toTimeString().slice(0, 8);
  line.appendChild(el('span', 'logt', time));
  line.appendChild(el('span', null, ' ' + message));
  const box = $('log');
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
  while (box.childElementCount > 400) box.removeChild(box.firstChild);
}

/* ═══════════════════════════════════════════════════════════
   3. Промт
   ═══════════════════════════════════════════════════════════ */
function styleById(id) {
  return V3D_STYLES.find((s) => s.id === id) || V3D_STYLES[0];
}

/** Промтод видео лавлагаа байхгүй бол урд нь нэмнэ. */
function ensureVideoReference(prompt) {
  const text = prompt.trim();
  return /@video1|\[video1\]/i.test(text) ? text : `@Video1 — ${text}`;
}

/** Локал загварууд @Video1 гэдгийг ойлгодоггүй тул энгийн үг болгоно. */
function stripVideoReference(prompt) {
  return prompt
    .trim()
    .replace(/^[@[]Video1\]?\s*[—–\-:]?\s*/i, '')
    .replace(/[@[]Video1\]?/gi, 'the source video')
    .trim();
}

function currentPrompt() {
  const custom = cfg.customPrompt.trim();
  return ensureVideoReference(custom || styleById(cfg.styleId).prompt);
}

/* ═══════════════════════════════════════════════════════════
   4. ComfyUI-гийн workflow задлан шинжлэх
   (video-to-3d/v2v3d/comfy_workflow.py-ийн хөтөч дэх хувилбар)
   ═══════════════════════════════════════════════════════════ */
const TARGET_NAMES = ['video', 'prompt', 'negative', 'seed', 'frames', 'width', 'height', 'fps', 'strength'];
const VIDEO_CLASSES = ['LoadVideo', 'VHS_LoadVideo', 'LoadVideoUpload', 'VHS_LoadVideoPath'];
const VIDEO_INPUTS = ['file', 'video', 'video_path'];
const TEXT_INPUTS = ['text', 'prompt', 'string'];
const SEED_INPUTS = ['seed', 'noise_seed'];
const FRAME_INPUTS = ['length', 'num_frames', 'frame_count', 'video_frames'];
const FPS_INPUTS = ['fps', 'frame_rate'];

const isLink = (value) => Array.isArray(value) && value.length === 2 && typeof value[0] === 'string';

function sortedNodes(workflow) {
  return Object.entries(workflow).sort((a, b) => {
    const x = parseInt(a[0], 10);
    const y = parseInt(b[0], 10);
    if (isNaN(x) || isNaN(y)) return String(a[0]).localeCompare(String(b[0]));
    return x - y;
  });
}

function findInput(workflow, names, classes, predicate) {
  for (const wantClass of [true, false]) {
    if (wantClass && (!classes || !classes.length)) continue;
    for (const [nodeId, node] of sortedNodes(workflow)) {
      const classType = node.class_type || '';
      if (wantClass && classes.indexOf(classType) === -1) continue;
      const inputs = node.inputs || {};
      for (const name of names) {
        if (!(name in inputs) || isLink(inputs[name])) continue;
        if (predicate && !predicate(classType, inputs[name])) continue;
        return { nodeId, input: name, classType };
      }
    }
  }
  return null;
}

function textInputOf(node) {
  for (const name of TEXT_INPUTS) {
    const value = (node.inputs || {})[name];
    if (typeof value === 'string') return name;
  }
  return null;
}

/** positive/negative оролттой зангилаанаас текстийн эх сурвалж руу мөшгинө. */
function findConditioning(workflow) {
  for (const [, node] of sortedNodes(workflow)) {
    const inputs = node.inputs || {};
    if (!(isLink(inputs.positive) && isLink(inputs.negative))) continue;
    const found = ['positive', 'negative'].map((slot) => {
      const targetId = inputs[slot][0];
      const target = workflow[targetId] || {};
      const name = textInputOf(target);
      return name ? { nodeId: targetId, input: name, classType: target.class_type || '' } : null;
    });
    if (found[0]) return found;
  }
  const texts = [];
  for (const [nodeId, node] of sortedNodes(workflow)) {
    const name = textInputOf(node);
    if (name) texts.push({ nodeId, input: name, classType: node.class_type || '' });
  }
  return [texts[0] || null, texts[1] || null];
}

function resolveTargets(workflow) {
  const found = {};

  const video =
    findInput(workflow, VIDEO_INPUTS, VIDEO_CLASSES) ||
    findInput(workflow, VIDEO_INPUTS, [], (c, v) => typeof v === 'string');
  if (video) found.video = video;

  const [positive, negative] = findConditioning(workflow);
  if (positive) found.prompt = positive;
  if (negative) found.negative = negative;

  const seed = findInput(workflow, SEED_INPUTS, ['KSampler', 'KSamplerAdvanced', 'RandomNoise']);
  if (seed) found.seed = seed;
  const frames = findInput(workflow, FRAME_INPUTS, []);
  if (frames) found.frames = frames;
  const fps = findInput(workflow, FPS_INPUTS, []);
  if (fps) found.fps = fps;

  const width = findInput(workflow, ['width'], [], (c, v) => typeof v === 'number');
  if (width && 'height' in (workflow[width.nodeId].inputs || {})) {
    found.width = width;
    found.height = { nodeId: width.nodeId, input: 'height', classType: width.classType };
  }

  const strength = findInput(workflow, ['strength'], [], (c) => /vace/i.test(c));
  if (strength) found.strength = strength;
  return found;
}

function applyValues(workflow, values, targets) {
  const result = JSON.parse(JSON.stringify(workflow));
  for (const name of Object.keys(values)) {
    const target = targets[name];
    const value = values[name];
    if (!target || value === null || value === undefined || value === '') continue;
    const node = result[target.nodeId];
    if (!node) continue;
    node.inputs = node.inputs || {};
    node.inputs[target.input] = value;
  }
  return result;
}

/** Секундыг кадрын тоо болгоно.  Wan-д 4n+1 (81, 121 …) хэлбэр таарна. */
function framesFor(seconds, fps) {
  const raw = Math.max(1, seconds) * fps;
  const steps = Math.max(1, Math.round((raw - 1) / 4));
  return steps * 4 + 1;
}

/** Нягтрал ба харьцаанаас өргөн/өндрийг тооцно (16-д хуваагдана). */
function sizeFor(resolution, aspect) {
  const shortSide = { '480p': 480, '720p': 720, '1080p': 1080 }[resolution] || 720;
  const ratios = {
    '16:9': [16, 9], '9:16': [9, 16], '1:1': [1, 1], '4:3': [4, 3],
    '3:4': [3, 4], '21:9': [21, 9], '9:21': [9, 21],
  };
  const [w, h] = ratios[aspect] || [16, 9];
  const round16 = (v) => Math.max(16, Math.round(v / 16) * 16);
  return w >= h
    ? [round16(shortSide * w / h), round16(shortSide)]
    : [round16(shortSide), round16(shortSide * h / w)];
}

/* ═══════════════════════════════════════════════════════════
   5. Provider адаптерууд
   ═══════════════════════════════════════════════════════════ */
async function asJson(response, label) {
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${label} ${response.status}: ${body.slice(0, 300)}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

const comfy = {
  base() {
    return cfg.comfyUrl.replace(/\/+$/, '');
  },

  async check() {
    try {
      const stats = await asJson(await fetch(`${this.base()}/system_stats`), 'system_stats');
      const system = stats.system || {};
      const device = (stats.devices || [])[0] || {};
      return `ComfyUI ${system.comfyui_version || ''} · ${device.name || 'GPU тодорхойгүй'}`;
    } catch (e) {
      throw new Error(
        `${e.message}\nComfyUI асаалттай эсэх, мөн --enable-cors-header тугтай ажиллаж ` +
        'байгаа эсэхийг шалгана уу.'
      );
    }
  },

  async objectInfo() {
    return asJson(await fetch(`${this.base()}/object_info`), 'object_info');
  },

  async upload(file) {
    const form = new FormData();
    form.append('image', file, file.name);
    form.append('type', 'input');
    form.append('subfolder', 'v3d');
    form.append('overwrite', 'true');
    const info = await asJson(
      await fetch(`${this.base()}/upload/image`, { method: 'POST', body: form }),
      'upload'
    );
    const name = info.name || file.name;
    return info.subfolder ? `${info.subfolder}/${name}` : name;
  },

  buildGraph(handle, item) {
    const [width, height] = sizeFor(cfg.resolution, cfg.aspect);
    const seconds = cfg.duration === 'auto' ? item.duration : Number(cfg.fixedSeconds);
    let frames = framesFor(seconds, Number(cfg.fps));
    if (frames > Number(cfg.maxFrames)) frames = framesFor(Number(cfg.maxFrames) / Number(cfg.fps), Number(cfg.fps));
    const values = {
      video: handle,
      prompt: stripVideoReference(currentPrompt()),
      seed: cfg.seed === '' ? Math.floor(Math.random() * 2147483647) : Number(cfg.seed),
      frames: frames,
      fps: Number(cfg.fps),
      width: width,
      height: height,
      strength: cfg.strength === '' ? null : Number(cfg.strength),
    };
    return applyValues(state.workflow, values, state.targets);
  },

  async run(item, onStage) {
    if (!state.workflow) throw new Error('Workflow ачаалаагүй байна');
    onStage('байршуулж байна');
    const handle = await this.upload(item.file);

    onStage('дараалалд орлоо');
    const graph = this.buildGraph(handle, item);
    const queued = await asJson(
      await fetch(`${this.base()}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: graph, client_id: state.clientId }),
      }),
      'prompt'
    );
    const promptId = queued.prompt_id;
    if (!promptId) throw new Error('ComfyUI prompt_id буцаасангүй');

    onStage('render хийж байна');
    const deadline = Date.now() + 3600e3;
    while (Date.now() < deadline) {
      if (state.abort) throw new Error('зогсоосон');
      await sleep(2000);
      const history = (await asJson(await fetch(`${this.base()}/history/${promptId}`), 'history'))[promptId];
      if (!history) continue;
      const status = history.status || {};
      if (status.status_str === 'error') throw new Error(`ComfyUI алдаа: ${comfyErrorText(status)}`);
      const url = this.outputUrl(history.outputs || {});
      if (url) {
        onStage('татаж байна');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`татах ${response.status}`);
        return await response.blob();
      }
    }
    throw new Error('ComfyUI цаг хэтэрлээ');
  },

  outputUrl(outputs) {
    const keys = ['videos', 'gifs', 'images', 'files'];
    for (const nodeOutput of Object.values(outputs)) {
      for (const key of keys) {
        for (const item of nodeOutput[key] || []) {
          if (!item || !item.filename) continue;
          if (key === 'images' && !VIDEO_EXT.test(item.filename)) continue;
          const query = new URLSearchParams({
            filename: item.filename,
            subfolder: item.subfolder || '',
            type: item.type || 'output',
          });
          return `${this.base()}/view?${query}`;
        }
      }
    }
    return null;
  },
};

function comfyErrorText(status) {
  const messages = status.messages || [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const entry = messages[i];
    if (Array.isArray(entry) && entry.length === 2 && /error/i.test(String(entry[0]))) {
      return JSON.stringify(entry[1]).slice(0, 300);
    }
  }
  return status.status_str || 'тодорхойгүй';
}

const fal = {
  headers() {
    if (!cfg.falKey.trim()) throw new Error('fal.ai түлхүүр оруулаагүй байна');
    return { Authorization: `Key ${cfg.falKey.trim()}`, 'Content-Type': 'application/json' };
  },

  async check() {
    if (!cfg.falKey.trim()) throw new Error('fal.ai түлхүүр оруулаагүй байна');
    return `Түлхүүр бэлэн · ${cfg.falEndpoint}`;
  },

  /** Хөтчөөс файл байршуулах хамгийн найдвартай зам — data URI. */
  toDataUri(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('файл уншиж чадсангүй'));
      reader.readAsDataURL(file);
    });
  },

  durationFor(item) {
    if (cfg.duration !== 'auto') return String(clamp(Number(cfg.fixedSeconds), FAL_MIN_SECONDS, FAL_MAX_SECONDS));
    return String(clamp(Math.round(item.duration), FAL_MIN_SECONDS, FAL_MAX_SECONDS));
  },

  async run(item, onStage) {
    onStage('файл бэлдэж байна');
    const dataUri = await this.toDataUri(item.file);

    const payload = {
      prompt: currentPrompt(),
      video_urls: [dataUri],
      resolution: cfg.resolution,
      duration: this.durationFor(item),
      generate_audio: !!cfg.audio,
    };
    if (cfg.aspect !== 'auto') payload.aspect_ratio = cfg.aspect;
    if (cfg.seed !== '') payload.seed = Number(cfg.seed);

    onStage('дараалалд орлоо');
    const base = `https://queue.fal.run/${cfg.falEndpoint}`;
    const queued = await asJson(
      await fetch(base, { method: 'POST', headers: this.headers(), body: JSON.stringify(payload) }),
      'fal submit'
    );
    const requestId = queued.request_id;
    if (!requestId) throw new Error('fal request_id буцаасангүй');

    onStage('render хийж байна');
    const deadline = Date.now() + 3600e3;
    while (Date.now() < deadline) {
      if (state.abort) throw new Error('зогсоосон');
      await sleep(3000);
      const status = await asJson(
        await fetch(`${base}/requests/${requestId}/status`, { headers: this.headers() }),
        'fal status'
      );
      if (status.status === 'COMPLETED') break;
      if (status.status === 'FAILED' || status.status === 'ERROR') {
        throw new Error(`fal алдаа: ${JSON.stringify(status).slice(0, 300)}`);
      }
    }

    const result = await asJson(
      await fetch(`${base}/requests/${requestId}`, { headers: this.headers() }),
      'fal result'
    );
    const url = falVideoUrl(result);
    onStage('татаж байна');
    const response = await fetch(url);
    if (!response.ok) throw new Error(`татах ${response.status}`);
    return await response.blob();
  },
};

function falVideoUrl(result) {
  if (typeof result === 'string') return result;
  const node = result.video || result.output;
  if (node && typeof node === 'object' && node.url) return node.url;
  if (typeof node === 'string') return node;
  for (const key of ['videos', 'outputs']) {
    const items = result[key];
    if (Array.isArray(items) && items.length) {
      const first = items[0];
      if (first && typeof first === 'object' && first.url) return first.url;
      if (typeof first === 'string') return first;
    }
  }
  if (typeof result.url === 'string') return result.url;
  throw new Error('хариунаас видеоны хаяг олдсонгүй');
}

const providers = { comfy, fal };

/* ═══════════════════════════════════════════════════════════
   6. Гаралт хадгалах
   ═══════════════════════════════════════════════════════════ */
async function saveOutput(name, blob) {
  if (state.outDir) {
    const handle = await state.outDir.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return 'хавтас';
  }
  const url = URL.createObjectURL(blob);
  const link = el('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return 'татсан';
}

async function outputExists(name) {
  if (!state.outDir) return false;
  try {
    await state.outDir.getFileHandle(name, { create: false });
    return true;
  } catch (e) {
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════
   7. Файл цуглуулах
   ═══════════════════════════════════════════════════════════ */
let nextId = 1;

function probeDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    const finish = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.onloadedmetadata = () => finish(isFinite(video.duration) ? video.duration : 0);
    video.onerror = () => finish(0);
    setTimeout(() => finish(isFinite(video.duration) ? video.duration : 0), 8000);
    video.src = url;
  });
}

async function addFiles(fileList) {
  const incoming = Array.from(fileList).filter((f) => VIDEO_EXT.test(f.name));
  if (!incoming.length) {
    log('Видео файл олдсонгүй (mp4 / mov / mkv / webm)', 'warn');
    return;
  }
  incoming.sort((a, b) => a.name.localeCompare(b.name, 'mn'));

  for (const file of incoming) {
    if (state.files.some((f) => f.name === file.name && f.size === file.size)) continue;
    const item = {
      id: nextId++,
      file: file,
      name: file.name,
      size: file.size,
      duration: 0,
      status: 'хүлээж байна',
      kind: 'idle',
      note: '',
      outName: file.name.replace(/\.[^.]+$/, '') + '.mp4',
    };
    state.files.push(item);
  }
  renderFiles();

  for (const item of state.files) {
    if (item.duration) continue;
    item.duration = await probeDuration(item.file);
    renderFiles();
  }
  log(`${incoming.length} файл нэмэгдлээ — нийт ${state.files.length}`, 'ok');
  updateSummary();
}

/* Хавтас чирж оруулах (webkitGetAsEntry) */
async function readEntry(entry, out) {
  if (entry.isFile) {
    await new Promise((resolve) => entry.file((f) => { out.push(f); resolve(); }, resolve));
    return;
  }
  const reader = entry.createReader();
  for (;;) {
    const batch = await new Promise((resolve) => reader.readEntries(resolve, () => resolve([])));
    if (!batch.length) break;
    for (const child of batch) await readEntry(child, out);
  }
}

/* ═══════════════════════════════════════════════════════════
   8. Дараалал ажиллуулагч
   ═══════════════════════════════════════════════════════════ */
function setStatus(item, status, kind, note) {
  item.status = status;
  item.kind = kind || 'idle';
  if (note !== undefined) item.note = note;
  renderFiles();
}

async function processOne(item) {
  const adapter = providers[state.provider];
  if (!cfg.overwrite && (await outputExists(item.outName))) {
    setStatus(item, 'аль хэдийн байна', 'skip');
    return 'skipped';
  }

  const attempts = Number(cfg.retries) + 1;
  let delay = 2000;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const blob = await adapter.run(item, (stage) => setStatus(item, stage, 'busy'));
      const where = await saveOutput(item.outName, blob);
      setStatus(item, 'бэлэн', 'done', `${mb(blob.size)} · ${where}`);
      log(`✓ ${item.name} → ${item.outName}`, 'ok');
      return 'done';
    } catch (error) {
      if (state.abort) {
        setStatus(item, 'зогссон', 'skip');
        return 'skipped';
      }
      if (attempt === attempts) {
        setStatus(item, 'алдаа', 'err', String(error.message || error));
        log(`✗ ${item.name} — ${error.message || error}`, 'err');
        return 'error';
      }
      log(`↻ ${item.name}: ${error.message || error} — ${delay / 1000}с дараа дахин`, 'warn');
      setStatus(item, `дахин оролдоно (${attempt})`, 'warn');
      await sleep(delay);
      delay *= 2;
    }
  }
  return 'error';
}

async function runBatch() {
  if (state.running) return;
  const pending = state.files.filter((f) => f.kind !== 'done');
  if (!pending.length) {
    log('Хөрвүүлэх файл алга', 'warn');
    return;
  }
  if (state.provider === 'comfy' && !state.workflow) {
    log('Эхлээд ComfyUI-гийн workflow (API формат) ачаална уу', 'err');
    return;
  }

  if (!state.outDir && state.files.some((f) => NON_ASCII.test(f.outName))) {
    log('Анхаар: латин биш нэртэй файлууд татах горимд эх нэрээ алдана — ' +
      '„Гаралтын хавтас" сонговол бүрэн хадгалагдана', 'warn');
  }

  state.running = true;
  state.abort = false;
  toggleRunning(true);
  log(`▶ ${pending.length} файл · ${state.provider === 'comfy' ? 'локал ComfyUI' : 'fal.ai'}`, 'ok');

  const counts = { done: 0, error: 0, skipped: 0 };
  const queue = pending.slice();
  const workers = Array.from({ length: clamp(Number(cfg.concurrency), 1, 4) }, async () => {
    while (queue.length && !state.abort) {
      const item = queue.shift();
      counts[await processOne(item)]++;
      updateSummary();
    }
  });
  await Promise.all(workers);

  state.running = false;
  toggleRunning(false);
  log(`■ Дүн: бэлэн ${counts.done} · алгассан ${counts.skipped} · алдаатай ${counts.error}`,
    counts.error ? 'warn' : 'ok');
  updateSummary();
}

/* ═══════════════════════════════════════════════════════════
   9. Дэлгэц зурах
   ═══════════════════════════════════════════════════════════ */
function renderFiles() {
  const body = $('rows');
  body.textContent = '';
  for (const item of state.files) {
    const row = el('tr');
    row.appendChild(el('td', 'nm', item.name));
    row.appendChild(el('td', 'num', item.duration ? secs(item.duration) : '—'));
    row.appendChild(el('td', 'num', mb(item.size)));

    const status = el('td');
    status.appendChild(el('span', 'pill ' + item.kind, item.status));
    row.appendChild(status);

    row.appendChild(el('td', 'note', item.note || ''));

    const actions = el('td', 'act');
    const remove = el('button', 'x', '✕');
    remove.title = 'жагсаалтаас хасах';
    remove.onclick = () => {
      if (state.running) return;
      state.files = state.files.filter((f) => f.id !== item.id);
      renderFiles();
      updateSummary();
    };
    actions.appendChild(remove);
    row.appendChild(actions);
    body.appendChild(row);
  }
  $('empty').style.display = state.files.length ? 'none' : 'flex';
}

function updateSummary() {
  const total = state.files.length;
  const done = state.files.filter((f) => f.kind === 'done').length;
  const totalSeconds = state.files.reduce((sum, f) => sum + (f.duration || 0), 0);
  $('cnt').textContent = `${done}/${total}`;

  let cost = '—';
  if (state.provider === 'fal') {
    const rate = FAL_PRICE[cfg.resolution] || FAL_PRICE['720p'];
    const output = state.files.reduce((sum, f) => {
      const seconds = cfg.duration === 'auto'
        ? clamp(Math.round(f.duration || 0), FAL_MIN_SECONDS, FAL_MAX_SECONDS)
        : clamp(Number(cfg.fixedSeconds), FAL_MIN_SECONDS, FAL_MAX_SECONDS);
      return sum + seconds;
    }, 0);
    cost = '≈ $' + ((totalSeconds + output) * rate * FAL_REF_MULTIPLIER).toFixed(2);
  } else if (total) {
    cost = 'төлбөргүй';
  }
  $('cost').textContent = cost;
  $('dur').textContent = totalSeconds ? secs(totalSeconds) : '—';

  /* Хөтөч кирилл нэртэй татацын нэрийг хаядаг — хавтас руу шууд бичих
     горимд л эх нэр бүрэн хадгалагдана. */
  const cyrillic = state.files.filter((f) => NON_ASCII.test(f.outName)).length;
  const nameWarn = $('namewarn');
  if (cyrillic && !state.outDir) {
    nameWarn.style.display = 'block';
    nameWarn.innerHTML = `⚠ <b>${cyrillic}</b> файлын нэр латин биш байна. Татах горимд ` +
      'хөтөч ийм нэрийг хаядаг тул гаралт „download" болно. Эх нэрийг хадгалахын тулд ' +
      '<b>„Гаралтын хавтас"</b> сонгоно уу (Chrome / Edge).';
  } else {
    nameWarn.style.display = 'none';
  }

  const long = state.files.filter((f) => f.duration > FAL_MAX_SECONDS).length;
  const warn = $('longwarn');
  if (long && state.provider === 'fal') {
    warn.style.display = 'block';
    warn.textContent = `⚠ ${long} файл 30 секундээс урт байна. Хөтчийн хувилбар видеог хэрчихгүй — ` +
      'урт клипийг терминалын v2v3d хэрэгслээр (--long-video segment) хөрвүүлнэ үү.';
  } else if (long) {
    warn.style.display = 'block';
    warn.textContent = `⚠ ${long} файл урт байна. Кадрын дээд хязгаараар таслагдана — ` +
      'бүтнээр нь хийхийг хүсвэл терминалын v2v3d хэрэгслийг ашиглана уу.';
  } else {
    warn.style.display = 'none';
  }
}

function toggleRunning(running) {
  $('start').disabled = running;
  $('stop').disabled = !running;
  $('start').textContent = running ? '⏳ Ажиллаж байна' : '▶ Эхлүүлэх';
}

function renderTargets() {
  const box = $('targets');
  box.textContent = '';
  if (!state.workflow) {
    box.appendChild(el('div', 'dim2', 'Workflow ачаалаагүй'));
    return;
  }
  for (const name of TARGET_NAMES) {
    const target = state.targets[name];
    const row = el('div', 'trow');
    row.appendChild(el('span', 'tname', name));
    row.appendChild(el('span', target ? 'tval ok' : 'tval miss',
      target ? `${target.nodeId}.${target.input}` : '— олдсонгүй'));
    box.appendChild(row);
  }
}

/* ═══════════════════════════════════════════════════════════
   10. UI холболт
   ═══════════════════════════════════════════════════════════ */
function bindField(id, key, transform) {
  const node = $(id);
  if (!node) return;
  if (node.type === 'checkbox') node.checked = !!cfg[key];
  else node.value = cfg[key];
  const handler = () => {
    cfg[key] = node.type === 'checkbox' ? node.checked : (transform ? transform(node.value) : node.value);
    saveSettings(cfg);
    updateSummary();
    if (key === 'styleId' || key === 'customPrompt') renderPromptPreview();
  };
  node.addEventListener('change', handler);
  if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') node.addEventListener('input', handler);
}

function renderPromptPreview() {
  const custom = cfg.customPrompt.trim();
  $('preview').value = custom ? currentPrompt() : styleById(cfg.styleId).prompt;
  $('styledesc').textContent = custom ? 'Өөрийн промт хэрэглэж байна' : styleById(cfg.styleId).desc;
}

function setProvider(name) {
  state.provider = name;
  cfg.provider = name;
  saveSettings(cfg);
  $('tab-comfy').classList.toggle('on', name === 'comfy');
  $('tab-fal').classList.toggle('on', name === 'fal');
  $('panel-comfy').style.display = name === 'comfy' ? 'block' : 'none';
  $('panel-fal').style.display = name === 'fal' ? 'block' : 'none';
  updateSummary();
}

function loadWorkflowText(text, name) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    log(`Workflow JSON биш байна: ${e.message}`, 'err');
    return;
  }
  if (data.nodes && data.links) {
    log('Энэ нь UI-ийн формат. ComfyUI дотор Settings → Dev Mode асаагаад ' +
      'Workflow → Export (API) сонголтоор дахин хадгална уу.', 'err');
    return;
  }
  const bad = Object.entries(data).find(([, node]) => !node || !node.class_type);
  if (bad) {
    log(`'${bad[0]}' зангилаа буруу бүтэцтэй — API формат мөн эсэхийг шалгана уу`, 'err');
    return;
  }
  state.workflow = data;
  state.workflowName = name;
  state.targets = resolveTargets(data);
  $('wfname').textContent = name;
  renderTargets();

  const missing = ['video', 'prompt'].filter((n) => !state.targets[n]);
  if (missing.length) {
    log(`Workflow ачаалагдлаа, гэхдээ ${missing.join(', ')} цэг олдсонгүй — ` +
      'терминалын v2v3d doctor команд дэлгэрэнгүй хэлнэ', 'warn');
  } else {
    log(`Workflow ачаалагдлаа: ${name} (${Object.keys(data).length} зангилаа)`, 'ok');
  }
  try {
    localStorage.setItem('v3d-workflow', JSON.stringify({ name: name, data: data }));
  } catch (e) { /* хэтэрхий том бол хадгалахгүй */ }
}

async function checkWorkflowAgainstServer() {
  if (!state.workflow) {
    log('Эхлээд workflow ачаална уу', 'warn');
    return;
  }
  let objectInfo;
  try {
    objectInfo = await comfy.objectInfo();
  } catch (e) {
    log(`Сервертэй холбогдож чадсангүй: ${e.message}`, 'err');
    return;
  }
  let errors = 0;
  for (const [nodeId, node] of sortedNodes(state.workflow)) {
    const spec = objectInfo[node.class_type];
    if (!spec) {
      log(`[${nodeId}] '${node.class_type}' зангилаа сервер дээр алга`, 'err');
      errors++;
      continue;
    }
    const declared = Object.assign({}, (spec.input || {}).required, (spec.input || {}).optional);
    for (const [name, value] of Object.entries(node.inputs || {})) {
      if (isLink(value)) continue;
      const entry = declared[name];
      if (!entry) continue;
      const options = Array.isArray(entry) && Array.isArray(entry[0]) ? entry[0] : null;
      if (options && typeof value === 'string' && options.indexOf(value) === -1) {
        log(`[${nodeId}] ${node.class_type}.${name} = '${value}' олдсонгүй. ` +
          `Байгаа нь: ${options.slice(0, 3).join(', ')}${options.length > 3 ? ' …' : ''}`, 'err');
        errors++;
      }
    }
  }
  log(errors ? `Шалгалт: ${errors} алдаа` : '✓ Workflow сервертэй бүрэн таарч байна',
    errors ? 'err' : 'ok');
}

function downloadReport() {
  const report = {
    created: new Date().toISOString(),
    provider: state.provider,
    endpoint: state.provider === 'comfy' ? cfg.comfyUrl : cfg.falEndpoint,
    style: cfg.styleId,
    prompt: currentPrompt(),
    resolution: cfg.resolution,
    files: state.files.map((f) => ({
      name: f.name, output: f.outName, duration: Math.round(f.duration * 10) / 10,
      status: f.status, kind: f.kind, note: f.note,
    })),
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  saveOutput('v3d-tailan.json', blob);
}

function init() {
  /* Загварын жагсаалт */
  const select = $('style');
  for (const style of V3D_STYLES) {
    const option = el('option', null, style.name);
    option.value = style.id;
    select.appendChild(option);
  }

  bindField('style', 'styleId');
  bindField('custom', 'customPrompt');
  bindField('comfyUrl', 'comfyUrl');
  bindField('fps', 'fps', Number);
  bindField('maxFrames', 'maxFrames', Number);
  bindField('strength', 'strength');
  bindField('falKey', 'falKey');
  bindField('falEndpoint', 'falEndpoint');
  bindField('resolution', 'resolution');
  bindField('aspect', 'aspect');
  bindField('duration', 'duration');
  bindField('fixedSeconds', 'fixedSeconds', Number);
  bindField('seed', 'seed');
  bindField('audio', 'audio');
  bindField('concurrency', 'concurrency', Number);
  bindField('retries', 'retries', Number);
  bindField('overwrite', 'overwrite');

  $('duration').addEventListener('change', () => {
    $('fixedwrap').style.display = cfg.duration === 'auto' ? 'none' : 'flex';
  });
  $('fixedwrap').style.display = cfg.duration === 'auto' ? 'none' : 'flex';

  renderPromptPreview();
  setProvider(cfg.provider || 'comfy');
  toggleRunning(false);
  renderTargets();
  renderFiles();
  updateSummary();

  /* Өмнөх workflow-г сэргээх */
  try {
    const saved = JSON.parse(localStorage.getItem('v3d-workflow') || 'null');
    if (saved && saved.data) {
      state.workflow = saved.data;
      state.workflowName = saved.name;
      state.targets = resolveTargets(saved.data);
      $('wfname').textContent = saved.name + ' (сэргээсэн)';
      renderTargets();
    }
  } catch (e) { /* алдаатай бол зүгээр орхино */ }

  /* Товчнууд */
  $('tab-comfy').onclick = () => setProvider('comfy');
  $('tab-fal').onclick = () => setProvider('fal');
  $('start').onclick = runBatch;
  $('stop').onclick = () => {
    state.abort = true;
    log('Зогсоох хүсэлт илгээлээ — идэвхтэй ажил дуусмагц зогсоно', 'warn');
  };
  $('clear').onclick = () => {
    if (state.running) return;
    state.files = [];
    renderFiles();
    updateSummary();
  };
  $('report').onclick = downloadReport;
  $('checkwf').onclick = checkWorkflowAgainstServer;

  const ping = async () => {
    try {
      log(await providers[state.provider].check(), 'ok');
    } catch (e) {
      log(String(e.message || e), 'err');
    }
  };
  $('ping').onclick = ping;
  $('pingFal').onclick = ping;

  $('pickFiles').onclick = () => $('fileInput').click();
  $('fileInput').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };
  $('pickDir').onclick = () => $('dirInput').click();
  $('dirInput').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };

  $('pickOut').onclick = async () => {
    if (!window.showDirectoryPicker) {
      log('Энэ хөтөч хавтас сонгохыг дэмжихгүй — файлууд татагдана (Chrome/Edge санал болгоно)', 'warn');
      return;
    }
    try {
      state.outDir = await window.showDirectoryPicker({ mode: 'readwrite' });
      $('outname').textContent = state.outDir.name;
      log(`Гаралтын хавтас: ${state.outDir.name}`, 'ok');
      updateSummary();
    } catch (e) { /* хэрэглэгч цуцалсан */ }
  };

  $('wfBtn').onclick = () => $('wfInput').click();
  $('wfInput').onchange = async (e) => {
    const file = e.target.files[0];
    if (file) loadWorkflowText(await file.text(), file.name);
    e.target.value = '';
  };

  /* Чирж оруулах */
  const drop = $('drop');
  ['dragenter', 'dragover'].forEach((type) =>
    drop.addEventListener(type, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((type) =>
    drop.addEventListener(type, (e) => { e.preventDefault(); drop.classList.remove('over'); }));

  drop.addEventListener('drop', async (e) => {
    const items = Array.from(e.dataTransfer.items || []);
    const entries = items.map((i) => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
    if (entries.length) {
      const collected = [];
      for (const entry of entries) await readEntry(entry, collected);
      const workflow = collected.find((f) => /\.json$/i.test(f.name));
      if (workflow && state.provider === 'comfy') loadWorkflowText(await workflow.text(), workflow.name);
      await addFiles(collected);
      return;
    }
    await addFiles(e.dataTransfer.files || []);
  });

  if (location.protocol === 'https:' && cfg.comfyUrl.startsWith('http://')) {
    log('Анхаар: https хуудаснаас локал ComfyUI руу хандахыг зарим хөтөч хориглодог. ' +
      'ZIP татаад camera.html шиг файлаар нээвэл найдвартай.', 'warn');
  }
  log('Бэлэн. Хавтсаа доош чирж оруулна уу.', 'ok');
}

document.addEventListener('DOMContentLoaded', init);
