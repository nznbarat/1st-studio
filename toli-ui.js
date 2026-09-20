/* ══════════════════════════════════════════════════════════════════════
   1st Studio — Толь (нэр томъёоны лавлах) — үзүүлэгч

   Нэг л файл, хоёр газар ажиллана:
     · toli.html          — тусдаа хуудас болгон
     · camera.html (F2)   — програмын дотор давхарга болгон

   Хэрэглэх:
     toliMount(элемент, { onOpenTab, extra })
       onOpenTab(tabId) — «🎥 Энэ хэсгийг нээх» товч дарахад дуудагдана
       extra: [{ label, title, onClick }] — толгой мөрөнд нэмэх товчнууд

   Өгөгдөл: toli-data.js доторх дэлхийн хувьсагч TOLI
   Загвар: хост хуудасны Blender 5.2 өнгөний хувьсагчдыг ашиглана.
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  if (window.toliMount) return;

  /* ── Загварыг нэг л удаа оруулна ── */
  const CSS = `
.tl-wrap{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--win,#161616)}
.tl-bar{height:30px;flex:none;display:flex;align-items:center;gap:8px;padding:0 8px;background:var(--topbar,#181818)}
.tl-bar .tl-t{font-size:11.5px;font-weight:600;color:var(--txt-title,#eee);white-space:nowrap}
.tl-q{width:320px;max-width:38vw;background:var(--wid-in,#1d1d1d);border:1px solid var(--wid-out,#3d3d3d);
  border-radius:var(--r-wid,4px);padding:4px 9px;font-size:11.5px;color:var(--txt,#e6e6e6);font-family:inherit}
.tl-q:focus{border-color:var(--acc,#4772b3);background:var(--wid-in-f,#181818);outline:none}
.tl-qn{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--mute,#838383);white-space:nowrap}
.tl-sp{flex:1}
.tl-bar button{background:var(--wid,#545454);border:none;border-radius:var(--r-wid,4px);padding:4px 9px;
  font-size:11px;color:var(--txt,#e6e6e6);box-shadow:inset 0 -1px 0 rgba(0,0,0,.149);white-space:nowrap;cursor:pointer;font-family:inherit}
.tl-bar button:hover{background:var(--wid-h,#636363)}
.tl-main{flex:1;display:flex;min-height:0;gap:2px;padding:2px}
.tl-area{border-radius:var(--r-editor,6px);overflow:hidden;box-shadow:0 0 0 1px var(--rim,rgba(255,255,255,.082));
  display:flex;flex-direction:column;min-height:0}
.tl-hdr{height:24px;flex:none;display:flex;align-items:center;gap:6px;padding:0 8px;font-size:10px;
  text-transform:uppercase;letter-spacing:.09em;color:var(--txt-title,#eee);font-weight:500}
.tl-hdr .n{color:var(--mute,#838383);font-family:'JetBrains Mono',monospace;font-size:9.5px;text-transform:none;margin-left:auto}
.tl-cats{width:222px;flex:none;background:var(--outliner,#282828)}
.tl-ctree{flex:1;overflow:auto;padding:2px 0}
.tl-crow{display:flex;align-items:center;gap:7px;padding:4px 10px;cursor:pointer;white-space:nowrap;
  color:var(--dim,#c3c3c3);font-size:11.5px}
.tl-crow:nth-child(even){background:var(--ol-alt,rgba(255,255,255,.016))}
.tl-crow:hover{background:rgba(255,255,255,.05)}
.tl-crow.on{background:var(--ol-act-bg,#334d80);color:var(--ol-act,#ffaf29);font-weight:500}
.tl-crow .ic{width:16px;text-align:center;flex:none;filter:saturate(.5)}
.tl-crow .nm{flex:1;overflow:hidden;text-overflow:ellipsis}
.tl-crow .n{font-family:'JetBrains Mono',monospace;font-size:9.5px;color:var(--mute,#838383)}
.tl-crow.on .n{color:#ffd79a}
.tl-list{width:268px;flex:none;background:var(--region,#1d1d1d)}
.tl-lrows{flex:1;overflow:auto;padding:2px 0}
.tl-lrow{display:flex;flex-direction:column;gap:1px;padding:5px 10px;cursor:pointer;border-left:2px solid transparent}
.tl-lrow:nth-child(even){background:var(--ol-alt,rgba(255,255,255,.016))}
.tl-lrow:hover{background:rgba(255,255,255,.05)}
.tl-lrow.on{background:var(--acc,#4772b3);border-left-color:var(--act,#ffa028)}
.tl-lrow .m{font-size:12px;color:var(--txt,#e6e6e6);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tl-lrow.on .m{color:#fff;font-weight:500}
.tl-lrow .e{font-size:10px;color:var(--mute,#838383);font-family:'JetBrains Mono',monospace;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.tl-lrow.on .e,.tl-lrow.on .c{color:#cddcf2}
.tl-lrow .c{font-size:9px;color:var(--mute,#838383);text-transform:uppercase;letter-spacing:.06em}
.tl-empty{padding:14px 12px;color:var(--mute,#838383);font-size:11px;line-height:1.6}
.tl-det{flex:1;min-width:0;background:var(--editor,#303030)}
.tl-dhdr{height:24px;flex:none;display:flex;align-items:center;gap:8px;padding:0 10px}
.tl-dbody{flex:1;overflow-y:auto;padding:14px 18px 50px;user-select:text}
.tl-dbody.center{display:flex;align-items:center;justify-content:center;text-align:center}
.tl-wel{max-width:560px;color:var(--dim2,#a6a6a6);font-size:12.5px;line-height:1.8}
.tl-wel h2{font-size:19px;color:var(--txt-hi,#fff);margin-bottom:10px;font-weight:700}
.tl-wel b{color:var(--txt,#e6e6e6)}
.tl-title{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:3px}
.tl-title h1{font-size:23px;font-weight:700;color:var(--txt-hi,#fff);line-height:1.2;margin:0}
.tl-title .en{font-size:14px;color:var(--act,#ffa028);font-family:'JetBrains Mono',monospace;padding-bottom:3px}
.tl-sub{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;padding-bottom:11px;
  border-bottom:1px solid var(--rim,rgba(255,255,255,.082))}
.tl-tag{font-size:10px;padding:2px 8px;border-radius:10px;background:rgba(0,0,0,.122);
  border:1px solid var(--rim,rgba(255,255,255,.082));color:var(--dim2,#a6a6a6)}
.tl-tag.cat{border-color:rgba(71,114,179,.5);background:rgba(71,114,179,.16);color:#9dbdec}
.tl-kbd{font-family:'JetBrains Mono',monospace;font-size:11px;background:var(--wid,#545454);
  border:1px solid var(--wid-out,#3d3d3d);border-bottom-width:2px;border-radius:3px;padding:1px 6px;color:var(--txt-hi,#fff)}
.tl-short{font-size:14px;line-height:1.7;color:var(--txt-hi,#fff);margin-bottom:14px}
.tl-box{background:var(--panel,#3d3d3d);border:1px solid var(--panel-out,rgba(255,255,255,.067));
  border-radius:var(--r-panel,8px);overflow:hidden;margin-bottom:9px}
.tl-box>h3{display:flex;align-items:center;gap:7px;padding:6px 10px;background:var(--panel-hdr,#3d3d3d);
  font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt,#e6e6e6);cursor:pointer;margin:0}
.tl-box>h3::before{content:"▼";font-size:7px;color:var(--dim2,#a6a6a6);transition:transform .15s}
.tl-box.fold>h3::before{transform:rotate(-90deg)}
.tl-box.fold>.bd{display:none}
.tl-box .bd{padding:11px 13px;background:rgba(0,0,0,.122)}
.tl-box p{font-size:12.5px;line-height:1.8;color:var(--txt,#e6e6e6);margin:0 0 10px;max-width:80ch}
.tl-box p:last-child{margin-bottom:0}
.tl-box b{color:var(--txt-hi,#fff)}
.tl-cmd{display:flex;gap:10px;align-items:baseline;font-size:12.5px;margin-bottom:7px;flex-wrap:wrap}
.tl-cmd:last-child{margin-bottom:0}
.tl-cmd .lb{width:96px;flex:none;color:var(--dim2,#a6a6a6);font-size:11px;text-align:right}
.tl-cmd .vl{flex:1;min-width:0;color:var(--txt,#e6e6e6)}
.tl-ex{background:rgba(71,114,179,.13);border-left:2px solid var(--acc,#4772b3)}
.tl-warn{background:rgba(172,135,55,.12);border-left:2px solid var(--warn,#ac8737)}
.tl-st{background:rgba(24,134,37,.10);border-left:2px solid var(--ok,#188625)}
.tl-rel{display:flex;flex-wrap:wrap;gap:5px}
.tl-rel button,.tl-go{background:var(--wid-in,#1d1d1d);border:1px solid var(--wid-out,#3d3d3d);border-radius:11px;
  padding:3px 10px;font-size:11px;color:var(--dim,#c3c3c3);cursor:pointer;font-family:inherit}
.tl-rel button:hover,.tl-go:hover{border-color:var(--acc,#4772b3);color:var(--txt-hi,#fff)}
.tl-go{border-radius:var(--r-wid,4px);background:var(--acc,#4772b3);border-color:transparent;color:#fff;
  padding:5px 11px;font-size:11.5px;margin-top:8px}
.tl-go:hover{background:var(--acc-h,#5681c2);color:#fff}
.tl-wrap mark{background:var(--act,#ffa028);color:#1a1206;border-radius:2px;padding:0 2px}
@media (max-width:1100px){.tl-cats{width:180px}.tl-list{width:220px}}
@media (max-width:820px){
  .tl-main{flex-direction:column}
  .tl-cats{width:100%;height:104px;flex:none}
  .tl-list{width:100%;height:140px;flex:none}
  .tl-q{width:150px}
}`;

  function injectCSS() {
    if (document.getElementById('toli-ui-css')) return;
    const st = document.createElement('style');
    st.id = 'toli-ui-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ── Табын дүрсээс програмын хуудсыг таана ── */
  const TABMAP = [['🎥', 'pgCam'], ['🧍', 'pgScene'], ['✨', 'pgPrompt'], ['📦', 'pgOut'], ['🩹', 'pgFix']];
  function tabOf(studioText) {
    if (!studioText) return null;
    for (const [ico, id] of TABMAP) if (studioText.indexOf(ico) >= 0) return { id: id, ico: ico };
    return null;
  }

  const esc = t => String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const has = v => typeof v === 'string' && v.trim().length > 0;

  window.toliMount = function (root, opts) {
    opts = opts || {};
    injectCSS();
    const DATA = (typeof TOLI !== 'undefined' && TOLI) ? TOLI : { cats: [], entries: [] };
    const CATS = DATA.cats || [];
    const ALL = (DATA.entries || []).slice();
    const byId = {};
    ALL.forEach(e => { byId[e.id] = e; });
    const catOf = id => CATS.find(c => c.id === id) || { id: id, mn: id, ico: '•' };

    let curCat = 'all', curId = null, query = '', hist = [];

    root.innerHTML =
      '<div class="tl-wrap">' +
      '<div class="tl-bar">' +
      (opts.title ? '<span class="tl-t">' + esc(opts.title) + '</span>' : '') +
      '<input class="tl-q" placeholder="Хайх…  (монгол, англи аль нь ч болно)" autocomplete="off" spellcheck="false">' +
      '<span class="tl-qn"></span>' +
      '<button class="tl-rnd" title="Санамсаргүй үг (R)">🎲 Санамсаргүй</button>' +
      '<span class="tl-sp"></span>' +
      '<span class="tl-extra"></span>' +
      '</div>' +
      '<div class="tl-main">' +
      '<div class="tl-cats tl-area"><div class="tl-hdr">⌗ Ангилал <span class="n tl-catn"></span></div>' +
      '<div class="tl-ctree"></div></div>' +
      '<div class="tl-list tl-area"><div class="tl-hdr">☰ Үгс <span class="n tl-listn"></span></div>' +
      '<div class="tl-lrows"></div></div>' +
      '<div class="tl-det tl-area"><div class="tl-dhdr"><span class="tl-hdr" style="padding:0">📖 Тайлбар</span>' +
      '<span class="tl-sp"></span><span class="n tl-detn" style="font-family:\'JetBrains Mono\',monospace;font-size:9.5px;color:var(--mute,#838383)"></span></div>' +
      '<div class="tl-dbody center"></div></div>' +
      '</div></div>';

    const q = root.querySelector('.tl-q');
    const qn = root.querySelector('.tl-qn');
    const ctree = root.querySelector('.tl-ctree');
    const lrows = root.querySelector('.tl-lrows');
    const dbody = root.querySelector('.tl-dbody');
    const detn = root.querySelector('.tl-detn');

    (opts.extra || []).forEach(b => {
      const el = document.createElement('button');
      el.textContent = b.label;
      if (b.title) el.title = b.title;
      el.onclick = b.onClick;
      root.querySelector('.tl-extra').appendChild(el);
    });

    function hay(e) {
      return (e._h || (e._h = [e.mn, e.en, e.alt, e.short, e.deep, e.use, e.ex, e.blender, e.keys, e.studio]
        .filter(has).join(' ').toLowerCase()));
    }
    const matches = e => (!query || hay(e).indexOf(query) >= 0) && (curCat === 'all' || e.cat === curCat);
    function hi(text) {
      const t = esc(text);
      if (!query) return t;
      const rx = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return t.replace(rx, '<mark>$1</mark>');
    }
    const sorted = () => ALL.filter(matches).sort((a, b) => (a.mn || '').localeCompare(b.mn || '', 'mn'));

    function drawCats() {
      const counts = {};
      ALL.forEach(e => { if (!query || hay(e).indexOf(query) >= 0) counts[e.cat] = (counts[e.cat] || 0) + 1; });
      const total = Object.keys(counts).reduce((s, k) => s + counts[k], 0);
      let h = '<div class="tl-crow' + (curCat === 'all' ? ' on' : '') + '" data-tcat="all">' +
        '<span class="ic">🗀</span><span class="nm">Бүх үг</span><span class="n">' + total + '</span></div>';
      CATS.forEach(c => {
        const n = counts[c.id] || 0;
        h += '<div class="tl-crow' + (curCat === c.id ? ' on' : '') + '" data-tcat="' + c.id + '"' +
          (n ? '' : ' style="opacity:.45"') + '><span class="ic">' + (c.ico || '•') + '</span>' +
          '<span class="nm">' + esc(c.mn) + '</span><span class="n">' + n + '</span></div>';
      });
      ctree.innerHTML = h;
      root.querySelector('.tl-catn').textContent = CATS.length + ' ангилал';
    }

    function drawList() {
      const rows = sorted();
      lrows.innerHTML = rows.length ? rows.map(e =>
        '<div class="tl-lrow' + (e.id === curId ? ' on' : '') + '" data-tid="' + e.id + '">' +
        '<span class="m">' + hi(e.mn) + '</span>' +
        '<span class="e">' + hi(e.en || '') + '</span>' +
        (curCat === 'all' ? '<span class="c">' + esc(catOf(e.cat).mn) + '</span>' : '') +
        '</div>').join('')
        : '<div class="tl-empty">Илэрц алга.<br>Өөр үгээр хайж үзнэ үү, эсвэл зүүн талаас <b>«Бүх үг»</b> сонгоно уу.</div>';
      root.querySelector('.tl-listn').textContent = rows.length + ' үг';
      qn.textContent = query ? rows.length + ' илэрц' : '';
    }

    const paras = txt => String(txt || '').split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean)
      .map(p => '<p>' + hi(p) + '</p>').join('');
    function box(title, inner, cls, folded) {
      if (!inner) return '';
      return '<div class="tl-box' + (folded ? ' fold' : '') + '"><h3>' + title + '</h3>' +
        '<div class="bd' + (cls ? ' ' + cls : '') + '">' + inner + '</div></div>';
    }

    function drawDetail() {
      const e = curId ? byId[curId] : null;
      if (!e) {
        dbody.classList.add('center');
        dbody.innerHTML = ALL.length
          ? '<div class="tl-wel"><h2>📖 Толь</h2>' +
          '<p>Blender, кино камер, гэрэлтүүлэг, анимаци ба AI видеоны нэр томъёог <b>монголоор</b>, ' +
          'гүнзгий тайлбартайгаар цуглуулсан лавлах.</p>' +
          '<p>Зүүн талаас <b>ангиллаа</b> сонгоод, дунд баганаас <b>үг дээрээ дарна</b> — ' +
          'энд түүний утга, тайлал, Blender дээрх команд, хэрэглэх жишээ бүгд гарч ирнэ.</p>' +
          '<p style="color:var(--mute,#838383)">Хайлтад монгол, англи аль ч үгээр хайж болно. ' +
          '<span class="tl-kbd">/</span> хайх · <span class="tl-kbd">R</span> санамсаргүй үг</p></div>'
          : '<div class="tl-wel"><h2>Толийн өгөгдөл олдсонгүй</h2>' +
          '<p><b>toli-data.js</b> файл хажууд нь байх ёстой. Хамт хуулж тавина уу.</p></div>';
        detn.textContent = '';
        return;
      }
      dbody.classList.remove('center');
      const c = catOf(e.cat);
      let h = '<div class="tl-title"><h1>' + hi(e.mn) + '</h1>' +
        (has(e.en) ? '<span class="en">' + hi(e.en) + '</span>' : '') + '</div>';
      h += '<div class="tl-sub"><span class="tl-tag cat">' + (c.ico || '•') + ' ' + esc(c.mn) + '</span>';
      if (has(e.alt)) h += '<span class="tl-tag">бас: ' + esc(e.alt) + '</span>';
      if (has(e.keys)) h += '<span class="tl-kbd">' + esc(e.keys) + '</span>';
      h += '</div>';
      if (has(e.short)) h += '<div class="tl-short">' + hi(e.short) + '</div>';
      h += box('📘 Гүнзгий тайлбар', paras(e.deep));

      let cmd = '';
      if (has(e.blender)) cmd += '<div class="tl-cmd"><span class="lb">Blender дээр</span><span class="vl">' + hi(e.blender) + '</span></div>';
      if (has(e.keys)) cmd += '<div class="tl-cmd"><span class="lb">Товчлуур</span><span class="vl"><span class="tl-kbd">' + esc(e.keys) + '</span></span></div>';
      if (has(e.en)) cmd += '<div class="tl-cmd"><span class="lb">Англиар</span><span class="vl" style="font-family:\'JetBrains Mono\',monospace;font-size:11.5px">' + esc(e.en) + '</span></div>';
      h += box('⌨ Команд ба нэр', cmd);
      h += box('🎯 Хэзээ хэрэглэх', paras(e.use));
      h += box('💡 Жишээ', paras(e.ex), 'tl-ex');
      if (has(e.warn)) h += box('⚠ Анхаарах', paras(e.warn), 'tl-warn');
      if (has(e.studio)) {
        const t = tabOf(e.studio);
        h += box('🎥 Энэ програм дээр хаана байна', paras(e.studio) +
          (t && opts.onOpenTab ? '<button class="tl-go" data-ttab="' + t.id + '">' + t.ico + ' Тэр хэсгийг нээх</button>' : ''), 'tl-st');
      }
      const rel = (e.rel || []).filter(id => byId[id]);
      if (rel.length) h += box('🔗 Холбоотой үгс', '<div class="tl-rel">' +
        rel.map(id => '<button data-tgo="' + id + '">' + esc(byId[id].mn) + '</button>').join('') + '</div>');
      dbody.innerHTML = h;
      dbody.scrollTop = 0;
      detn.textContent = e.id;
    }

    function select(id, push) {
      if (!byId[id]) return;
      if (push !== false && curId && curId !== id) hist.push(curId);
      curId = id;
      try { localStorage.setItem('1stStudio.toli.last', id); } catch (err) { }
      if (opts.hash !== false && location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
      drawList(); drawDetail();
      const el = lrows.querySelector('.tl-lrow.on');
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
    function step(d) {
      const rows = sorted();
      if (!rows.length) return;
      let i = rows.findIndex(x => x.id === curId);
      i = i < 0 ? 0 : Math.min(rows.length - 1, Math.max(0, i + d));
      select(rows[i].id);
    }
    function random() {
      if (!ALL.length) return;
      const pool = ALL.filter(e => e.id !== curId);
      const e = pool[Math.floor(Math.random() * pool.length)] || ALL[0];
      curCat = 'all'; query = ''; q.value = '';
      drawCats(); select(e.id);
    }
    function setQuery(v) {
      query = (v || '').trim().toLowerCase();
      drawCats(); drawList();
    }

    root.addEventListener('click', ev => {
      const c = ev.target.closest('[data-tcat]');
      if (c) { curCat = c.dataset.tcat; drawCats(); drawList(); return; }
      const r = ev.target.closest('[data-tid]');
      if (r) { select(r.dataset.tid); return; }
      const g = ev.target.closest('[data-tgo]');
      if (g) { curCat = 'all'; drawCats(); select(g.dataset.tgo); return; }
      const t = ev.target.closest('[data-ttab]');
      if (t) { if (opts.onOpenTab) opts.onOpenTab(t.dataset.ttab); return; }
      const h3 = ev.target.closest('.tl-box>h3');
      if (h3) h3.parentElement.classList.toggle('fold');
    });
    q.addEventListener('input', () => setQuery(q.value));
    root.querySelector('.tl-rnd').onclick = random;

    function onKey(ev) {
      const inQ = document.activeElement === q;
      if (ev.key === 'Escape') {
        if (inQ && q.value) { ev.stopPropagation(); q.value = ''; setQuery(''); q.blur(); return true; }
        return false;
      }
      if (ev.key === '/' && !inQ) { ev.preventDefault(); q.focus(); q.select(); return true; }
      if (inQ && (ev.key === 'ArrowDown' || ev.key === 'Enter')) { ev.preventDefault(); q.blur(); step(ev.key === 'Enter' ? 0 : 1); return true; }
      if (inQ) return true;
      if (ev.key === 'ArrowDown') { ev.preventDefault(); step(1); return true; }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); step(-1); return true; }
      if (ev.key === 'ArrowLeft' || ev.key === 'Backspace') {
        const p = hist.pop(); if (p) { ev.preventDefault(); select(p, false); return true; }
        return false;
      }
      if (ev.key === 'r' || ev.key === 'R' || ev.key === 'к' || ev.key === 'К') { ev.preventDefault(); random(); return true; }
      return false;
    }

    drawCats(); drawList(); drawDetail();

    return {
      el: root, data: ALL, byId: byId, onKey: onKey,
      open(id) { if (id && byId[id]) { curCat = 'all'; drawCats(); select(id, false); } },
      last() {
        let id = null;
        try { id = localStorage.getItem('1stStudio.toli.last'); } catch (e) { }
        return byId[id] ? id : null;
      },
      focusSearch() { q.focus(); q.select(); },
      search(v) { q.value = v || ''; setQuery(v); },
      random: random,
      count: ALL.length
    };
  };
})();
