# DaVinci Resolve — Монгол хөтөч

DaVinci Resolve-ийн интерфейсийн монгол хэл дээрх лавлах.
Программын цэс, самбар, товчлуур, тохиргоо бүрийн монгол нэр, тайлбар, хаана байдгийг цуглуулсан.

**1226 нэр томьёо · 52 ангилал · 137 товчлуур · 819 гарын авлагын дэлгэрэнгүй тайлбар · 6 ажлын урсгал · 8 хуудасны загвар · 41 нээгддэг цэс · 2 жишээтэй заавар (Fusion 28, Edit 26 хэрэгсэл)**

---

## Юу вэ, юу биш вэ

Энэ бол **Resolve-ийн монгол хувилбар биш**, программын хэлийг өөрчилдөг хэрэгсэл ч биш.

DaVinci Resolve бол Blackmagic Design компанийн хаалттай эх кодтой арилжааны программ.
Түүний интерфейсийн хэлийг гаднаас солих албан ёсны боломж байхгүй —
`Preferences → UI Settings → Language` дотор монгол хэл байдаггүй бөгөөд
хэрэглэгчийн засах боломжтой хэлний файл ч гаргадаггүй.

Тиймээс энэ хөтөч өөр замыг сонгосон: программыг өөрчлөхийн оронд **программыг ойлгуулах**.
Интерфейс англиараа хэвээр, харин утга нь монголоор ойлгогдоно.
Resolve-ийн хажууд нээж, хоёр цонхыг зэрэг барьж ажиллахад зориулагдсан.

---

## Ашиглах

Ямар ч серверийн тохиргоо шаардахгүй — цэвэр статик хуудас.

```bash
npm run serve            # → http://localhost:8080/resolve-mn/
```

эсвэл `resolve-mn/index.html`-ийг хөтөч дээрээ шууд нээнэ.

### Ганц файлын хувилбар

Хамгийн хялбар арга — бүх код нэг файлд шингэсэн хувилбарыг татаж, давхар товших.
Интернэт, сервер, суулгац шаардахгүй. USB-гээр зөөж, и-мэйлээр илгээж болно.

| Файл | Юу вэ |
|---|---|
| `resolve-mn/resolve-dotor.html` | Интерфейсийн загвар (≈1.3 MB) |
| `resolve-mn/resolve-toli.html` | Толь (≈1.2 MB) |
| `resolve-mn/resolve-fusion-zaavar.html` | Fusion хэрэгслийн мөрийн жишээтэй заавар |
| `resolve-mn/resolve-edit-zaavar.html` | Edit хуудасны хэрэгслийн мөр, viewer-ийн удирдлагын жишээтэй заавар |

Бүгдийг нь нэг хавтсанд хийвэл хооронд нь шилжих холбоос ажиллана.

Дахин угсрах:

```bash
node tools/build-resolve-mn.mjs
```

Эх файл (`index.html`, `interface.html`, `css/`, `js/`) засагдсан бол энэ командыг
дахин ажиллуулж ганц файлын хувилбарыг шинэчилнэ.

### Хоёр хэсэг

| Файл | Юу вэ |
|---|---|
| `index.html` | **Толь** — хайлт, ангилал, товчлуур, ажлын урсгалын заавар |
| `interface.html` | **Resolve дотор** — интерфейсийн хуулбар. Ямар ч хэсэг дээр товшвол монголоор тайлбарлана |
| `fusion-zaavar.html` | **Fusion хэрэгслийн мөр** — 28 товч тус бүрийн заавар, хөтөч дээр туршдаг жишээтэй |
| `edit-zaavar.html` | **Edit хэрэгслийн мөр** — timeline-ийн 18 товч, viewer-ийн 8 удирдлага, жижиг timeline дээр туршдаг жишээтэй |

### Fusion хэрэгслийн мөрийн заавар

`fusion-zaavar.html` — Fusion хуудасны Viewer ба Nodes самбарын хоорондох 28 товч тус бүрт:
юу хийдэг, **бичлэгт үзүүлэх нөлөө**, Resolve дээр алхам алхмаар, гол тохиргоо, анхаарах зүйл.
Карт бүрт хөтөч дээр шууд туршдаг жишээ: слайдер хөдөлгөхөд сансрын кадр дээр өөрчлөлт харагдана,
**Өмнө / Дараа**-аар эффектгүй хувилбартай харьцуулна (CSS, SVG шүүлтүүр, canvas-аар ойролцоо дуурайлга).
Мөн нод хэрхэн ажилладаг (оролтын өнгө), хамтдаа хэрэглэх 4 жишээ (гарчиг, дэвсгэр бүдгэрүүлэх, цас, 2.5D).
Толь, загварт эдгээр 28 нэр томьёонд **▶ Жишээтэй заавар** холбоос гарна.

Холбоос: `interface.html#fusion.merge` (хуудас.нэр томьёо), `index.html#merge`, `fusion-zaavar.html#merge` —
нийтэлсэн хувилбарт `?p=`, `?q=` хүрдэггүй тул #anchor-оор ажиллана.

### Толины дөрвөн харагдац

| Харагдац | Юу хийдэг |
|---|---|
| **Хайлт** | Англи нэрээр нь, монголоор нь, тайлбар доторх үгээр, эсвэл товчлуураар хайна. Олон үг бичвэл бүгдийг агуулсан мөрийг олно. |
| **Хуудсаар** | Resolve-ийн ажлын орон зайгаар нь ангилж үзүүлнэ. Ангилал дээр товшвол шүүгдсэн хайлт руу үсэрнэ. |
| **Товчлуур** | Толь даяарх бүх товчлуурыг бүлэглэн харуулна. Товчлуур дээр товшвол хуулагдана. |
| **Хөтөч** | Хамгийн олон асуудаг ажлуудыг эхнээс нь дуустал алхам алхмаар. |

### Товчлуурууд

Толь дээр:
- `/` — хаанаас ч хайлтын мөр рүү шилжинэ
- `Esc` — хайлтыг цэвэрлэнэ

Загвар дээр:
- `←` `→` — Resolve-ийн хуудас хооронд шилжинэ
- `Esc` — сонголтыг цуцална

### Хичээлийн горим (хоёр заавар хоёулаа)

Хэрэглэгчийн хүсэлтээр **нэг хуудсанд нэг хичээл**: нүүр хуудсанд танилцуулга ба хичээлийн жагсаалт
(`#hicheel`), товч бүр тусдаа хуудас (`#blade`, `#merge` …) — дээр нь «Хичээл 3 / 27 · бүлэг» ба явцын
зурвас, бүлгийн эхний хичээлд бүлгийн тайлбар, доор нь **‹ Өмнөх · ☰ · Дараах ›**. Гарын ← → товчоор
шилжинэ. Толь, загварын «▶ Жишээтэй заавар» холбоос тухайн хичээлийг шууд нээнэ.

### Edit хэрэгслийн мөрийн заавар

`edit-zaavar.html` — Edit хуудасны timeline-ийн хэрэгслийн мөр (Timeline View Options, Show Keyframe Tray,
Voiceover · Selection, Trim, Blade, Dynamic Trim (Slip) · Insert, Overwrite, Replace · Snapping, Linked
Selection, Position Lock · туг, тэмдэглэгээ · Full Extent/Detail/Custom Zoom) ба viewer-ийн ▭ ⌄ удирдлага
(Transform, Crop, Dynamic Zoom, Open FX, Fusion Overlay, Annotations, Smart Reframe), Jog Wheel — 26 карт.
Карт бүрт **бичлэгт үзүүлэх нөлөөний шошго** (Монтажийг өөрчилнө · Дүрсийг өөрчилнө · Дуу нэмнэ ·
Тэмдэглэл · Зөвхөн харагдац · Хамгаалалт). Жишээ нь жижиг timeline: A · B · C клип, заагч, хоосон зай,
клип бүрийн «эх 2.0–8.0» (slip, roll-ийн ялгаа харагдана), timeline-ийн нийт урт — ripple, insert
уртыг өөрчилдөг, overwrite, roll өөрчилдөггүйг шууд харуулна. Viewer-ийн жишээнд бариулыг
сансрын кадр дээр; Annotations-д хулганаар зурна. 4 хамтын жишээ (ярилцлага цэвэрлэх, хөгжмийн
цохилтоор огтлох, B-roll, босоо хувилбар).

### Интерфейсийн загвар

`interface.html` нь Resolve-ийн найман хуудсыг (Media, Photo, Cut, Edit, Fusion, Color,
Fairlight, Deliver) хуулбарлан харуулна. Нийт **768 товших цэг** (419 өвөрмөц нэр томьёо) —
цэг бүр толины нэр томьёотой шууд холбогдсон тул тайлбар давхардаж бичигдээгүй.
Өнгө нь Resolve Studio 21-ийн дэлгэцийн зургаас хэмжсэн бодит утга
(`css/sim.css` доторх `--rs-*` хувьсагчид).

- Дэлгэц дээрх ямар ч хэсэг дээр товшвол баруун талд монгол нэр, тайлбар,
  товчлуур, байрлал нь гарч ирнэ.
- **Цэг харуулах** товч бүх идэвхтэй хэсгийг тодруулна — юу товшиж болохыг олоход.
- Баруун талын жагсаалт нь тухайн хуудасны бүх цэгийг ангиллаар нь харуулна.
- Доод талын хуудасны мөр нь бодит Resolve шиг ажиллана.
- **13 цэс дарахад үнэхээр нээгдэнэ** — 323 мөр, товчлууртайгаа. Бусад 28 унждаг жагсаалт (хэрэгслийн мөр, viewer, Media Pool, Tracker, Nodes) — нийт 41 цэс, 574 мөр.
- **Edit цэсний командууд хуудаснаас хамаарч саарал болно** — бодит программ шиг,
  Fusion, Color, Fairlight хуудсан дээр цэсийг нээсэн зургаас мөр бүрээр:
  Fusion — 5 мөр идэвхтэй (Undo, Redo, History, Select All, Deselect All);
  Color — 11 (Copy, Paste, Paste Attributes/Value, Dolby Vision, Delete, Ripple Delete…);
  Fairlight — 19 (Cut/Copy/Paste бүх хувилбар, Remove Attributes, Duplicate Selection
  `Ctrl+Shift+D`…); Photo — 7 (Paste Attributes, Insert…); Deliver — 7 (Delete Selected,
  Ripple Delete…). Саарал мөр дээр товшвол аль хуудсанд идэвхтэйг тайлбарлана.
- **File цэс Media хуудсанд** — timeline-тэй холбоотой мөрүүд (New/Close Timeline,
  Timeline Backup, Quick Export, Reconform) саарал; Revert — хадгалаагүй өөрчлөлт байхгүй
  үед; Single/Multiple User — Local төслийн санд саарал. Тайлбар нь шалтгааныг нэрлэнэ.
- **Color → Effects → Library** таб дээр товшиход Resolve FX Blur бүлгийн бодит жагсаалт
  (Box Blur, CineFocus, Directional Blur, Gaussian Blur, Lens Blur, Mosaic Blur) нээгдэнэ.
- **Fusion хуудасны хэрэгслийн мөр** — 28 товч, 6 бүлэг (4-4-5-5-3-7), бүгд tooltip-оор баталгаажсан.
  Товч дээр хулганаа тавихад доод мөрөнд Resolve-ийн бодит тайлбар гарна (жишээ нь «Merge - Layers one
  image over another…»). Дүрс бүрийг зурагнаас хэлбэрийг нь дагаж SVG-ээр зурсан (js/53-sim-icons.js).
- **Fusion Inspector** — MediaIn нодын Image / Audio / Settings таб товшиход агуулга нь солигдоно.
- **Cut хуудасны ⚌ "Timeline Options" товч** 18 тохиргооны бодит жагсаалт нээнэ (Ripple On, Snap,
  Display Clip…, Edit Using Ch…, Fixed Playhead, Boring Detector); хажуугийн ⇤≡ "Timeline Actions" товч 15 командын
  жагсаалт (Create Subtitles from Audio … Add Transition to All Edits; Voice Convert саарал). 3 дахь товч
  Trim Start/End to Playhead, Resync Clip цэс нээнэ. Доод timeline-ийн 5 товч (Ripple On,
  Dynamic Trim Mode (Slip), Split Clip, Add Marker, Keyframes), замын толгойн 5 товч
  (Enlarge, Lock, Solo, Mute, Disable Track), Insert Video/Audio Only — tooltip-оор баталгаажсан.
  Keyframes товч доод Keyframes самбарыг нээнэ: Keyframe Curves / Lanes, Parameters … цэс
  (6 мөр), баруун … цэс (Enables Snapping, Loop Type, Legacy Speed Mode).
- **Edit хуудас** (2026-09-26-ны зургууд) — timeline хэрэгслийн мөрийн товч бүр Resolve-ийн дарааллаар,
  SVG дүрстэй, tooltip-тэй (`Selection Mode - A` … `Custom Zoom`). ⚌ Timeline View Options (13 мөр,
  Track Height гүйлгэгч, Set as Default View товч), туг ⌄ / marker ⌄ (Clear All + 16 өнгө),
  viewer-ийн ▭ ⌄ (Transform … Smart Reframe, 8 мөр), ‹ ● › Jog Wheel. Inspector-ийн Video / Audio таб
  (Composite, Retime and Scaling, AI Super Scale; Semi Tones, Cents, 6 зурвастай Equalizer).
  Effects → Dissolve, Iris, Motion, Shape, Wipe, Fusion Transitions жагсаалт. Дээд мөрийн **Quick Export**
  (10 бэлдэц, H.264 Master-ийн тохиргоо) ба **Mixer** (A1, Bus1) нээгдэнэ. Media Pool-ийн AI шинжилгээ ⌄,
  харагдац ▦ ⌄, ⌕ хайлтын мөр (Search In, Display), ⇅ эрэмбэ (25 мөр), … тохиргоо (13 мөр),
  **Create Smart Bin**, ☁ **Blackmagic Cloud Folder** цонх. Viewer-ийн толгойн ⛶ Guides самбар
  (Social Media, Broadcast and Film, Safe Area, Ruler), прокси ⌄, timeline-ийн нягтрал ⌄, … цэс.
- **Color хуудас** (2026-09-26) — viewer-ийн дээд мөрийн ◧ Show Reference Wipe / ▦ Split Screen / ◐ Highlight
  (нэг нь идэвхтэй, доор нь өөрийн мөр): wipe-ийн 9 хэлбэр (Horizontal, Vertical, Diagonal, Mix, Alpha, A/B,
  Box, Venetian Blind, Checker Board), Split Screen-ийн «Version ⌄» (11 мөр), Highlight-ийн 3 товч.
  Палитрын Tracker дүрс → **Tracker - Window** самбар (6 мөрдөлтийн товч, Pan/Tilt/Zoom/Rotate/3D,
  Clip/Frame, график, Interactive Mode + Insert/Set Point/Delete, Cloud Tracker ⌄ — Cloud, Point,
  AI IntelliTrack), Window/Stabilizer/FX, Clear All Tracking Points. Keyframes дүрс → **Keyframes** самбар
  (Master, Corrector 1–4, Sizing). Nodes-ийн ↖ ⌄ (Selection, Hand Mode), нод нэмэх ⌄
  (Add Serial, Parallel, Layer); Settings-т Film Grain (Presets, Composite Type, Opacity, Grain Params).
- **Photo хуудасны "Photo Album ⌄" товч** бодит шүүлтүүрийн жагсаалт нээнэ
  (Sort by, All/Selected/Graded/Ungraded Photos, People, Magic Mask … Create Smart Filter).
  Цэс нээлттэй байхад хажуугийн цэсэн дээр хулгана тултал шилжинэ.
  Мөр дээр товшвол тухайн командын монгол тайлбар гарна.
- URL-аар шууд нээж болно: `interface.html?p=color&t=qualifier`

**Энэ бол сурах зориулалттай хуулбар, программ өөрөө биш.** Найман хуудасны
байрлал, самбар, хэрэгслийн мөрийг 2026-09-18-ны Resolve Studio 21-ийн бодит
дэлгэцийн зургуудаас (Photo хуудас ч мөн адил) дахин барьсан; пиксел нэг бүрээр
адил биш, харин самбар, товч, нэр бүр бодит байрлалдаа.

### Гарын авлагын дэлгэрэнгүй тайлбар

Нэр томьёо бүрийн богино тайлбарын доор **Гарын авлага** хэсэг нээгдэнэ —
Blackmagic-ийн албан ёсны гарын авлагын хэв маягтай: зориулалт, хаана байрладаг,
хэрэглэх алхам, анхаарах зүйл, холбоотой нэр томьёо руу холбоос.

- Загварт: тайлбарын самбарт шууд харагдана; холбоос дээр товшвол тэр нэр томьёог
  дэлгэц дээр олж сонгоно.
- Толинд: карт бүрийн **▸ Гарын авлага** мөрөөр нээгдэнэ; холбоос хайлт руу үсэрнэ.
- Хамрах хүрээ: загварын бүх товших цэг (290), 13 цэсний бүх команд (225),
  AI (Neural Engine) ба сэргээн засварын 36 хэрэглүүр, Photo Album, Resolve FX Blur,
  Cut хуудасны Timeline Options ба Timeline Actions цэс, товчнууд, Keyframes самбар, Fusion хэрэгслийн мөр, MediaIn Inspector — нийт 656.
  Үлдсэн 400 нэр томьёо богино тайлбартай; дараагийн шатанд.
- Бичлэгийн хэлбэр: `js/long/*.js` файлд `RM.dict.long({ id: "бичвэр" })`.
  Мини-markdown: хоосон мөр — догол, `## ` — дэд гарчиг, `- ` / `1. ` — жагсаалт,
  `> ` — анхааруулга, `**тод**`, `[k:Ctrl+S]` — товчлуур, `[[id]]` — холбоос.
- Resolve 20–21-д нэмэгдсэн, дэлгэцийн зургаар баталгаажуулаагүй хэрэглүүрт
  "албан ёсны гарын авлагаас баталгаажуулна уу" гэж тэмдэглэсэн.

---

## Бүтэц

```
resolve-mn/
├── index.html              толь — бүрхүүл, скриптийн дараалал
├── interface.html          интерфейсийн загвар
├── fusion-zaavar.html      Fusion хэрэгслийн мөрийн заавар
├── edit-zaavar.html        Edit хэрэгслийн мөрийн заавар
├── css/
│   ├── app.css             толины загвар (Ертөнц Бүтээгчийн өнгөний системтэй нэг)
│   ├── sim.css             Resolve-ийн харагдацыг гаргах загвар
│   └── guide.css           Fusion, Edit зааврын загвар
└── js/
    ├── 00-core.js          нэрийн орон зай, DOM туслах, хуулах, хадгалах
    ├── 10-dict.js          толины хөдөлгүүр — бүртгэл, индекс, хайлт
    ├── 15-guide-ids.js     жишээтэй заавартай нэр томьёо (Fusion 28, Edit 26) — холбоос
    ├── 20-guide.js         ажлын урсгалын өгөгдөл
    ├── 30-ui.js            толины интерфейс — хайлт, жагсаалт, хөтөч
    ├── 50-sim-pages.js     Edit, Color хуудасны бүтэц
    ├── 51-sim-more.js      Media, Cut, Fusion, Fairlight, Deliver, Photo
    ├── 52-sim-menus.js     нээгддэг цэсний агуулга
    ├── 53-sim-icons.js     дүрсүүд (SVG) — Fusion, Edit хэрэгслийн мөр, Inspector
    ├── 69-guide-ui.js      заавар хоёрын нийтлэг карт, жишээний самбар, тохиргоо
    ├── 70-fz-data.js       Fusion заавар — 28 хэрэгслийн агуулга, 4 хамтын жишээ
    ├── 71-fz-scene.js      жишээний кадр (кодоор зурсан сансар), туслахууд
    ├── 72-fz-demos.js      28 жишээ — шүүлтүүр, маск, бөөмс, 3D
    ├── 73-fz-page.js       Fusion заавар хуудсыг угсрах
    ├── 74-ez-data.js       Edit заавар — 26 хэрэгслийн агуулга, нөлөөний шошго, 4 хамтын жишээ
    ├── 75-ez-demos.js      Edit жишээ — жижиг timeline (ripple, roll, slip, insert …), viewer-ийн бариул
    ├── 76-ez-page.js       Edit заавар хуудсыг угсрах
    ├── 60-sim-ui.js        загварын харилцан үйлдэл
    ├── 90-main.js          толины эхлүүлэлт
    ├── 91-sim-main.js      загварын эхлүүлэлт
    ├── dict/
        ├── r01-erunhii.js      ерөнхий интерфейс, төсөл, тэмдэглэгээ
        ├── r02-media.js        Media хуудас
        ├── r03-cut.js          Cut хуудас
        ├── r04-edit.js         Edit — оруулах, тайрах
        ├── r05-edit2.js        Edit — хувиргалт, хурд, гарчиг
        ├── r06-fusion.js       Fusion — нод, түлхүүрлэлт
        ├── r07-fusion2.js      Fusion — 3D, бөөм, цаг
        ├── r08-color.js        Color — нод, үндсэн засвар
        ├── r09-color2.js       Color — муруй, цонх, скоп
        ├── r10-color3.js       Color — өнгөний удирдлага, LUT, HDR
        ├── r11-fairlight.js    Fairlight — трек, микшер
        ├── r12-fairlight2.js   Fairlight — дууны эффект
        ├── r13-deliver.js      Deliver — рендер
        ├── r14-tehnik.js       техникийн нэр томьёо
        ├── r15-tovchluur.js    өөр хаана ч байхгүй товчлуурууд
        ├── r16-asuudal.js      түгээмэл асуудал ба шийдэл
        ├── r17-nemelt.js       нэмэлт — түгээмэл хайгддаг ойлголтууд
        ├── r18-interface.js    цэсний мөр, дэлгэцийн эд анги
        ├── r19-tses-aguulga.js Edit, Color, Fairlight цэсний командууд
        ├── r20-tses-2.js       File, Trim, Timeline, Clip, Mark цэс
        ├── r21-tses-3.js       View, Playback, Workspace, Help, Fusion цэс
        ├── r22-interface-3.js  дэлгэцийн эд анги — 2 (Photo, Deliver, Edited…)
        ├── r23-ai-sergeen.js   AI (Neural Engine), сэргээн засварын хэрэглүүр
        ├── r24-photo.js        Photo — цомгийн шүүлтүүрийн цэс
        ├── r25-resolvefx-blur.js Resolve FX Blur (Color → Effects → Library)
        ├── r26-cut-tses.js     Cut — Timeline Options цэс, timeline-ийн товчнууд
        ├── r27-fusion-mediain.js Fusion — хэрэгслийн мөр, MediaIn Inspector
        ├── r28-edit-tses.js    Edit — timeline-ийн мөр, viewer-ийн цэс, Inspector, шилжилт
        ├── r29-edit-media-export.js Edit — AI шинжилгээ, Quick Export, Blackmagic Cloud Folder
        ├── r30-edit-mediapool-guides.js Edit — Media Pool хайлт, эрэмбэ, Smart Bin, Guides, viewer-ийн цэс
        └── r31-color-viewer-tracker.js Color — viewer-ийн wipe, Split Screen, Highlight, Tracker, Keyframes
    └── long/                   гарын авлагын дэлгэрэнгүй тайлбар (RM.dict.long)
        ├── l01–l08             загварын товших цэгүүд, хуудас, самбарууд
        ├── l07-ai-sergeen.js   AI ба сэргээн засварын хэрэглүүр
        ├── l09–l12             13 цэсний командууд
        ├── l13–l14             Photo Album цэс, Resolve FX Blur
        ├── l15-cut-tses.js     Cut хуудасны цэс, товчнууд
        ├── l16-fusion-mediain.js Fusion хэрэгслийн мөр, MediaIn Inspector
        ├── l17–l19             Edit хуудасны товч, цэс, цонх
        └── l20-color-viewer-tracker.js Color — wipe, Tracker, Keyframes
```

---

## Толийг өргөтгөх

Нэг мөрийн бүтэц:

```js
[ англи нэр, монгол нэр, тайлбар, товчлуур?, байрлал? ]
```

Сүүлийн хоёр нь заавал биш. Жишээ:

```js
RM.dict.add({ id:"миний-ангилал", label:"Гарчиг", icon:"◈", page:"edit",
note:"Энэ ангилал юуны тухай вэ.", terms:[
  ["Blade","Хутга","Клипийг заагч дээр огтолж хоёр хуваах хэрэглүүр.","B"],
  ["Safe Area","Аюулгүй бүс","Аль ч дэлгэц дээр таслагдахгүй төв хэсэг.","","View → Safe Area"]
]});
```

`page` талбар нь `erunhii`, `media`, `photo`, `cut`, `edit`, `fusion`, `color`,
`fairlight`, `deliver`, `tehnik` гэсэн утгуудын аль нэг байна.

Шинэ файл нэмбэл `index.html`-д `<script>` мөрийг нь бичихээ мартуузай —
шалгагч холбогдоогүй файлыг илрүүлж хэлнэ.

Дэлгэрэнгүй тайлбар нэмэх — `js/long/` дотор шинэ файл (id нь толинд байх ёстой):

```js
RM.dict.long({
"blade": `
## Зориулалт
Клипийг товшсон газарт **огтолж** хоёр хуваана. [k:B] товчоор горимд орно.

> Огтлолт эх файлыг хөндөхгүй. Буцаах — [[join-clips]].
`
});
```

Файлыг `index.html`, `interface.html`-ийн `<!-- long:start -->` блокт холбоно.

### Шалгах

```bash
node tools/check-resolve-mn.mjs
```

Шалгадаг зүйлс: давхардсан англи ба монгол нэр, дутуу эсвэл хэт богино тайлбар,
орчуулагдаагүй байж болзошгүй нэр, хоосон ангилал, товчлуурын хэлбэр,
`index.html` болон `interface.html`-д холбогдоогүй файл, **загварын товших цэг бүр
толинд байгаа эсэх**, **цэсний мөр бүр толинд байгаа эсэх**, гарын авлагын тайлбар
(байхгүй id-д бичигдсэн, хаагдаагүй тэмдэглэгээ, буруу холбоос, хэт богино),
түгээмэл хайлт хоосон буцаж байгаа эсэх.

---

## Resolve 21-ийн өөрчлөлт

Resolve 21-д **Photo хуудас** нэмэгдэж, уламжлалт долоон хуудас найм болсон.
Энэ бол Resolve-ийн түүхэн дэх анхны бүрэн шинэ хуудас — гэрэл зургийг
Color хуудасны нодны хөдөлгүүр дээр засварлана.

Хуудасны дараалал: **Media · Photo · Cut · Edit · Fusion · Color · Fairlight · Deliver**
— Photo нь Media, Cut хоёрын хооронд байрлана.

## Юуг бодит программ дээр баталсан бэ

Загварыг албан ёсны баримтаас гаргасан боловч дараах зүйлсийг
**бодит DaVinci Resolve Studio 21-ийн дэлгэц дээр шалгаж баталсан**:

- хуудасны мөрийн дараалал (Photo нь Media, Cut хоёрын хооронд)
- хуудасны мөр нь **шошгогүй**, зөвхөн дүрстэй; зүүн талд нь программын нэр
- цэсний мөр: `File · Edit · Trim · Timeline · Clip · Mark · View · Playback ·
  Fusion · Color · Fairlight · Workspace · Help`
- **Найман хуудасны дотоод байрлал** — 2026-09-18-ны дэлгэцийн зургуудаас:
  Media (Media Storage, Clone Tool, Capture), Photo (Photo Album, Filters,
  үнэлгээ, туг), Cut (Sync Bin, Dual Timeline, Smart Insert…), Edit (6 табтай
  Inspector, Effects-ийн Toolbox мод, `Video 1 / 1 Clip` замын толгой),
  Fusion (Bins + Media Pool, ганц дэлгэц, хэрэглүүрийн эгнээ, Nodes, пиксэлийн
  заалт), Color (Vignette-ийн Settings, 4 дугуй, Parade 1023–0, клипийн эгнээ),
  Fairlight (хэмжүүр, Bus 1, Control Room, Loudness BS.1770-1, Mixer),
  Deliver (Custom Export-ийн бүх мөр, Render Queue-ийн Job 1/2, IN/OUT/DURATION)
- **Өнгө** — палитрын бүх утгыг дэлгэцийн зургаас хэмжсэн (`--rs-bar #17191a`,
  `--rs-pane #28282e`, `--rs-vid #6b8aa3`, `--rs-aud #69977e`, `--rs-edited #e0883c` …)
- Төслийн нэр (`Ээжийн дуу`), timeline (`SEEDANCE_v1_30s`), улбар шар **Edited**
  тэмдэг, 3840×2160 24 fps, MP4/H.265 экспортын тохиргоо — бодит төслөөс
- Fusion хэрэгслийн мөр: `Media Pool · Effects · Clips · Nodes` … `Spline ·
  Keyframes · Metadata · Inspector`
- Fusion дэлгэцийн доорх пиксэлийн заалт (Position X/Y, Canvas RGBA)
- **Цэсний мөрийн бүх 13 цэс** — File, Edit, Trim, Timeline, Clip, Mark, View,
  Playback, Fusion, Color, Fairlight, Workspace, Help. Мөр бүр, тусгаарлагч бүр,
  товчлуур бүр, дэд цэсний сум бүр. Загвар дээр эдгээр цэс үнэхээр нээгдэнэ.
  Нийт **323 мөр**.
- **134 товчлуур** — бүгд цэснээс шууд уншсан.

- **Edit цэсний саарал болох дүрэм** — Fusion, Color, Fairlight, Photo, Deliver хуудсан
  дээр цэсийг нээсэн зургаас мөр бүрээр (2026-09-19). Edit, Cut хуудсанд бүгд идэвхтэй гэж үзэв.
- **File цэсний саарал болох дүрэм** — Media хуудсан дээр нээсэн зургаас (2026-09-19).
- **Resolve FX Blur** — Color → Effects → Library-ийн 6 эффект (2026-09-19).
- **Photo Album ⌄ цэс** — Photo хуудасны шүүлтүүрийн 18 мөр (Photos in Bin саарал байсан).
- **Remote Grading** `Ctrl+G` — "Remote Grading Client" цонх: Remote Machine, Port 15000.
- **Cut хуудасны ⚌ Timeline Options цэс** — 18 мөр, 7 тусгаарлагч, 6 чагт; **⇤≡ Timeline Actions цэс** — 15 мөр,
  5 тусгаарлагч (Voice Convert саарал байсан);
  тайрах/дахин синк цэсний 3 мөр; 14 товчны tooltip; Keyframes самбарын хоёр … цэс (2026-09-19).
- **Fusion хэрэгслийн мөр** — 28 товчны tooltip, доод мөрийн тайлбар; Background, FastNoise … Renderer 3D.
  Гарын авлагаас санаж байсан жагсаалтаас ялгаатай нь: MultiMerge, MultiPoly, pDirectionalForce
  (pMerge, Resize байхгүй). **MediaIn Inspector** — Image, Audio, Settings табын бүх мөр (2026-09-25).
- **Edit хуудас** (2026-09-26, 40 орчим зураг) — timeline хэрэгслийн мөрийн 18 tooltip (Show Keyframe Tray,
  Voiceover, Selection Mode - A, Trim Edit Mode - T, Blade Edit Mode - B, Dynamic Trim Mode (Slip) - W,
  Insert Clip - F9, Overwrite Clip - F10, Replace Clip - F11, Snapping - N, Linked Selection - Ctrl+Shift+L,
  Position Lock, Full Extent / Detail / Custom Zoom), Jog Wheel; Timeline View Options, viewer ▭ ⌄, туг, marker,
  Media Pool-ийн 4 цэс, viewer-ийн толгойн 3 цэс ба Guides самбар; Quick Export, Blackmagic Cloud Folder,
  Create Smart Bin цонх; Inspector-ийн Video, Audio таб; Effects-ийн шилжилтийн жагсаалт; Mixer самбар.
- **Color хуудас** (2026-09-26) — wipe-ийн 8 tooltip (Horizontal … Checker Board), Split Screen-ийн 11 мөр,
  Tracker-ийн Window / Stabilizer / FX, Clear All Tracking Points, Insert / Set Point / Delete tooltip,
  Cloud Tracker ⌄ (Cloud Tracker, Point Tracker, AI IntelliTrack), Tracker-ийн … цэс (9 мөр), Keyframes самбарын
  мөрүүд ба All ⌄ (All, Color, Sizing), палитрын Keyframes / Scopes / Info tooltip; viewer-ийн … (20 мөр),
  Nodes-ийн харагдац ⌄ (Graph / List View) ба … (8 мөр), Effects-ийн … (3 мөр); палитрын эхний 5 дүрсний
  tooltip (Camera Raw, Color Match, Color Wheels, HDR Grade, RGB Mixer) ба дараагийн 5 (Motion Effects, Curves,
  **ColorSlice** — загварт дутуу байсныг нэмэв, Color Warper, Qualifier).

Хараахан баталгаажуулаагүй: Fusion Inspector-ийн толгойн дүрсүүдийн (● ⌄, хувилбар, хадаас, түгжээ,
буцаах) tooltip; Source Color/Gamma Space-ийн доторх мөрүүд; Cut хуудасны дээд timeline-ийн 3 дахь товчны tooltip нэр
(цэсний агуулга нь баталгаажсан); транспорт мөрийн 6 засварын товч, тэдгээрийн баруун талын 3 + 5 товчны нэр;
Resync Clip-ийн яг үйлдэл; **Edit:** Show Keyframe Tray-ийн үйлдэл, viewer ▭ ⌄, ⚌, туг, marker товчны tooltip,
Immersive горим, Display Full / Borders / Scaled Waveforms-ийн ялгаа, Thumbnail View ›, IntelliSearch Mode ›,
Markers › дэд цэс, timeline-ийн нягтралын цэс одоогийн timeline-ийг өөрчлөх үү, viewer-ийн толгойн улаан
зураастай товч, Voiceover самбарын агуулга, Retime and Scaling, AI Super Scale-ийн доторх мөрүүд, Replay бэлдэц;
**Color:** ◧ ▦ ◐ товчны tooltip (үйлдлээр нь баталгаажсан), wipe-ийн A/B, Highlight-ийн 3 товч, Tracker-ийн 6
мөрдөлтийн товч, Keyframes-ийн мөрийн дүрс ба All ⌄, палитрын дүрс бүрийн tooltip; цэсний дэд цэснүүдийн (AI Tools, Audio Operations,
Edit Options, Go To, Sort by…) доторх мөрүүд; Resolve 20–21-д нэмэгдсэн AI хэрэглүүрийн
яг байрлал; Edit цэсний төлөв Media хуудсанд, File цэсний төлөв Media-аас бусад
хуудсанд. Зохиомол агуулга
бичээгүй — эргэлзээтэйг тайлбарт тэмдэглэсэн.

### Баталгаажуулалтаар илэрсэн алдаанууд

| Юу | Миний таамаг | Бодит байдал |
|---|---|---|
| Photo хуудасны байрлал | эцэст нь | Media, Cut хоёрын хооронд |
| Project Manager | `Shift+1` | `Shift+0` |
| Linked Selection | (болгоомжилж хассан) | `Ctrl+Shift+L` |
| Console | (товчлуургүй) | `F6` |
| Хувилбар шалгах | Help → About | Windows дээр About байхгүй — доод зүүн булангийн бичээс |
| Fusion хуудасны бүтэц | хоёр дэлгэц | ганц дэлгэц, Bins + Media Pool, хэрэглүүрийн эгнээ |
| Хуудасны мөр | шошготой | зөвхөн дүрстэй |
| Edit-ийн Inspector | 4 таб | 6 таб (Video, Audio, Effects, Transition, Image, File) |
| Switch to Page | долоон хуудас | найман (Photo нэмэгдсэн) |
| Edit-ийн дэлгэц | — | Зурагт ганц дэлгэц (Single Viewer); загварт Resolve-ийн анхны Source/Timeline хос дэлгэцийг сонгосон |
| Edit timeline-ийн 🔒 товч | Sync Lock | **Position Lock** (tooltip) |
| Color Tracker-ийн горим | Унждаг цэс, «Perspective 3D» | Толгойн 3 дүрс (Window, Stabilizer, FX), чагт нь «3D» |
| Color viewer-ийн ◧ товч | Image Wipe | **Show Reference Wipe** (Ctrl+W) — viewer-ийн … цэснээс |
| Палитрын Color Match, RGB Mixer дүрс | Shot Match, Splitter/Combiner нэр томьёо руу | Тусдаа нэр томьёо (tooltip-оор); HDR дүрсний tooltip — HDR Grade |
| Edit timeline-ийн засварын горимын дараалал | Selection, Trim, Dynamic Trim, Blade | Selection, Trim, **Blade, Dynamic Trim (Slip)** |
| Edit timeline-ийн 2, 3 дахь товч | Track, Record Voiceover | **Show Keyframe Tray**, **Voiceover** |
| Томруулалтын 3 товч | Zoom to Fit, Zoom In, Zoom Out | **Full Extent Zoom, Detail Zoom, Custom Zoom** |
| Effects-ийн Additive/Blur Dissolve | Add, Blur (Fusion) нэр томьёо руу | Тусдаа шилжилт — зөв нэр томьёо руу холбов |

Монтажийн 17 товчлуур (F9–F12, Shift+F10–F12, Ctrl+Z, Shift+Backspace гэх мэт)
шалгахад **бүгд зөв** байсан.

## Товчлуурын тухай анхааруулга

Энд бичсэн товчлуурууд бол DaVinci Resolve-ийн **үндсэн (default)** багц, Windows дээрх утга.

Хэрэглэгч өөрчилсөн, эсвэл Premiere / Final Cut / Avid загварын багц сонгосон бол өөр байна.
Шалгах газар: `DaVinci Resolve → Keyboard Customization`.

---

## Нэр томьёоны зарчим

Монгол нэрсийг сонгохдоо гурван зүйлийг баримталсан: утгыг нь оносон байх, богино байх,
аль хэдийн хэрэглэгддэг үг байвал түүнийг нь хүндэтгэх.

Зарим үгийг зориудаар орчуулаагүй үлдээсэн — *timeline*, *клип*, *нод*, *рендер*, мөн
*ProRes*, *Rec.709*, *LUFS* зэрэг стандарт, форматын нэрс.
Эдгээр нь монгол мэргэжлийн ярианд аль хэдийн бат суусан бөгөөд албан ёсны орчуулга нь
ойлгоход саад болдог.

Санал, засвар байвал нэмээрэй — толь өргөжих тусмаа хэрэгтэй болно.
