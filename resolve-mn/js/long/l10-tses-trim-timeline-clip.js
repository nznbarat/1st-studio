/* ═════════════════════════════════════════════════════════════
   Гарын авлагын дэлгэрэнгүй тайлбар · Trim, Timeline, Clip цэсний командууд
   ═════════════════════════════════════════════════════════════ */
RM.dict.long({

/* ══════════ Trim ══════════ */

"normal-edit-mode": `
## Зориулалт
Trim → Normal Edit Mode [k:A] нь хэрэгслийн мөрийн **Selection Mode**-ийн цэсний нэр — ердийн сум. Клип сонгох, чирэх, ирмэг чирж энгийн тайрах. Дэлгэрэнгүй: [[selection-mode]].

> Бусад горимоос (Trim, Blade, Dynamic Trim, Range) буцах үндсэн товч [k:A].
`,

"focus-mode": `
## Зориулалт
Trim → Focus Mode [k:W] — ажиллаж буй хэсгийг **томруулж төвлөрүүлэх** горим (Resolve-ийн сүүлийн хувилбарт). Товчлуур нь Dynamic Trim Mode-той ижил W гэж цэсэнд бичигдсэн.

> Таны дэлгэцийн зурагт Focus Mode ба Dynamic Trim Mode хоёулаа W гэж харагдсан. Энэ нь Resolve-ийн цэсний онцлог (нэг товч, контекстээс хамаарна) эсвэл Keyboard Customization-ийн давхцал байж болно — DaVinci Resolve → Keyboard Customization → "Focus" гэж хайж шалгана уу. Хэрэв W дарахад Dynamic Trim орж байвал Focus Mode-д өөр товч оноож болно.
`,

"toggle-slip-slide-mode": `
## Зориулалт
Trim → Toggle Slip/Slide Mode [k:S] нь Trim Edit Mode [k:T] эсвэл Dynamic Trim [k:W] дотор **Slip (гулсуулах) ба Slide (шилжүүлэх)** тайралтын хооронд солино.

- **Slip** — клипийн байрлал хэвээр, доторх агуулга (In/Out) гүйнэ.
- **Slide** — клип хөрш хоёрын дунд зөөгдөж, хөршүүд урт/богино болно.

> Trim горимд клипийн дээд хагасаас чирвэл Slip, доод хагасаас чирвэл Slide — хулганаар ч солино. [[trim-edit-mode]].
`,

"select-nearest": `
## Зориулалт
Trim → Select Nearest дэд цэс нь заагчид **хамгийн ойрын** элементийг сонгоно — хулганагүй тайралтын эхлэл:
- **Select Nearest Edit Point** [k:V] — ойрын огтлолтын цэг (roll).
- **Select Nearest Edit Point Video/Audio** — зөвхөн видео эсвэл дууны огтлолт.
- **Select Nearest Clip** [k:Shift+V] — ойрын клип.
- **Select Nearest Gap** — ойрын хоосон зай.

## Хэрэглэх алхам
1. Заагчийг огтлолтын ойролцоо аваачаад [k:V].
2. [k:U] — ripple (зүүн/баруун тал) / roll солих. [[edit-point-type]].
3. [k:,] [k:.] — 1 кадраар зөөх; [k:E] — заагч хүртэл сунгах.

> Auto Select асаалттай замын огтлолт л тоологдоно.
`,

"select-all-clips-under-playhead": `
## Зориулалт
Trim → Select All Clips Under Playhead [k:Alt+Shift+V] нь заагчийн доор **бүх зам дээр давхцаж буй клипүүдийг** сонгоно. Тэр мөчийн бүх давхаргыг (видео, гарчиг, дуу, хөгжим) нэг дор зөөх, устгах, Compound болгох.

> Түгжигдсэн зам, Auto Select унтраалттай замын клип сонгогдохгүй.
`,

"edit-point-type": `
## Зориулалт
Trim → Edit Point Type [k:U] нь сонгосон огтлолтын цэгийн **тайралтын төрлийг** ээлжлүүлнэ: гарах клипийн ирмэг (ripple зүүн) → орох клипийн ирмэг (ripple баруун) → хоёулаа (roll). Дэлгэц дээр тэмдэг ногоон (ripple) / улаан (roll) солигдоно.

## Хэрэглэх алхам
1. [k:V] — ойрын огтлолт сонгоно.
2. [k:U] — төрөл солино (дараалан).
3. [k:,] [k:.] эсвэл [k:E] — тайрна.

Холбоотой: [[trim-edit-mode]], [[trim-menu]].
`,

"toggle-v-plusa-v-a": `
## Зориулалт
Trim → Toggle V+A/V/A [k:Alt+U] нь сонгосон огтлолтод **видео + дуу / зөвхөн видео / зөвхөн дуу** аль нь хамрагдахыг ээлжлүүлнэ. J-cut, L-cut (дууг зургаас урт/богино тайрах) хийхэд Linked Selection-ийг унтраахгүйгээр.

## Хэрэглэх алхам
1. [k:V] огтлолт сонгоно (V+A).
2. [k:Alt+U] → зөвхөн A.
3. [k:,] [k:.] — дууг л зөөнө; видео байрандаа.

Холбоотой: [[linked-selection]].
`,

"nudge": `
## Зориулалт
Trim → Nudge нь сонгосон клип эсвэл огтлолтын цэгийг **кадраар нарийн зөөх** командууд:
- **Nudge One Frame Left / Right** [k:,] [k:.].
- **Nudge Multiple Frames Left / Right** [k:Shift+,] [k:Shift+.] — олон кадар (анхны 5; Preferences → User → Editing → Multi-frame nudge).

## Хэрэглээ
- Клип сонгосон бол клип зөөгдөнө (Overwrite мэт — хөрш дарагдаж болно).
- Огтлолт сонгосон бол ([k:V]) тайралт хийгдэнэ (ripple/roll — [k:U]).
- Дууны клипийг 1–2 кадраар синк засах.

> Клип зөөхөд Auto Select-ийн дагуу дарж бичнэ; Undo бэлэн байлгана.
`,

"trim-start": `
## Зориулалт
Trim → Trim Start [k:Shift+[] нь заагчийн доорх клипийн **эхлэлийг заагч хүртэл тайрна** (ripple — хойшхи зөрнө). Клипийн эхний хэрэггүй хэсгийг хаях хамгийн хурдан арга: заагчийг байрлуулаад товч.

> Auto Select асаалттай бүх замын клипт үйлчилнэ. Ripple биш (зай үлдээх) тайралт бол Selection Mode-д ирмэгийг чирнэ.

> Cut хуудсанд: дээд timeline-ийн зүүн булангийн гурав дахь товчны жагсаалтад **Trim Start to Playhead** нэрээр. [[trim-resync-menu-cut]].
`,

"trim-end": `
## Зориулалт
Trim → Trim End [k:Shift+]] нь заагчийн доорх клипийн **төгсгөлийг заагч хүртэл тайрна** (ripple). Клипийн сүүлийн хэсгийг хаях.

> Cut Tail (Edit цэс) ижил тайрч, хэсгийг санах ойд хуулна.

> Cut хуудсанд: гурав дахь товчны жагсаалтад **Trim End to Playhead** нэрээр. [[trim-resync-menu-cut]].
`,

"trim-to-selection": `
## Зориулалт
Trim → Trim to Selection нь timeline дээр In/Out-аар (эсвэл Range) тэмдэглэсэн **мужийн гадна талыг тайрна** — зөвхөн муж үлдэнэ. Урт бичлэгээс нэг хэсгийг л үлдээхэд.

> Timeline бүхэлд нь үйлчилнэ (Auto Select замууд). Мужийн гадна талын бүх клип устана — Undo бэлэн.
`,

"extend-edit": `
## Зориулалт
Trim → Extend Edit [k:E] нь сонгосон огтлолтын цэгийг **заагчийн байрлал хүртэл сунгаж, богиносгоно** (roll эсвэл ripple — сонголтын төрлөөр). Хулганагүй тайралтын хамгийн хурдан арга.

## Хэрэглэх алхам
1. [k:V] — огтлолт сонгоно; [k:U] — төрөл.
2. Заагчийг хүссэн цэгт (тоглуулж, JKL).
3. [k:E]. Огтлолт заагч руу үсэрнэ.

> Ярианы завсарт огтлолт тааруулах, хөгжмийн цохилтод тааруулахад Extend Edit + Marker хослол хамгийн үр дүнтэй.
`,

"resize": `
## Зориулалт
Trim → Resize нь клипийн **уртыг хойших клипийг хөндөлгүйгээр** өөрчлөнө (Selection Mode-ийн ирмэг чирэлттэй ижил зарчим) — сунгахад хөршийг дарна, богиносгоход зай үлдэнэ. Trim горимын ripple-ээс ялгаатай.

> Trim Edit Mode [k:T] дотор [k:Shift] дараад ирмэг чирвэл Resize болно (ripple биш). Хөгжимд тааруулсан монтажид хойшхийг хөдөлгөхгүй тайрахад.
`,

"ripple-trim": `
## Зориулалт
Trim → Ripple Trim нь ирмэгийг тайрахад **хойших бүх клип хамт зөрдөг** тайралт — timeline-ийн урт өөрчлөгдөнө. Trim Edit Mode [k:T] дотор клипийн ирмэгийг чирэхэд анхны үйлдэл; Trim Start/End, Extend Edit (ripple төрөлд) мөн ripple.

## Roll-той ялгаа
[[roll]] хоёр клипийн огтлолтыг зэрэг зөөж нийт урт хадгална; Ripple нэг клипийг тайрч бусдыг зөрүүлнэ.

> Auto Select унтраалттай зам зөрөхгүй — синк алдагдах гол шалтгаан. Sync Lock, Auto Select-ийг шалгана. [[auto-select]], [[sync-lock]].
`,

"roll": `
## Зориулалт
Trim → Roll нь хоёр клипийн **хоорондох огтлолтын цэгийг зөөнө** — нэг клип уртасч, нөгөө нь богиносно; нийт урт, хойшхи клипүүд хэвээр. Ярианы огтлолтыг хэдэн кадраар нааш цааш тааруулахад аюулгүй тайралт (синк алдагдахгүй).

## Хэрэглэх алхам
1. Trim Edit Mode [k:T] → огтлолтын яг дунд (улаан тэмдэг) чирнэ; эсвэл [k:V] → [k:U] (roll) → [k:,] [k:.] / [k:E].
2. Дэлгэц хоёр хуваагдаж гарах/орох кадрыг харуулна.

> Хоёр клипт нөөц кадар (handle) байх ёстой — эх файлын төгсгөлд хүрвэл цааш зөөгдөхгүй.
`,

"slip-playhead-to": `
## Зориулалт
Trim → Slip Playhead To нь клипийн **доторх агуулгыг** заагчийн байрлалд тааруулж гулсуулна: Source Viewer-ийн заагч дээрх кадар timeline-ийн заагч дээр ирнэ (клипийн байрлал, урт хэвээр). Тодорхой мөчийг (үг, үйлдэл) тодорхой цэгт тааруулахад.

## Хэрэглэх алхам
1. Timeline дээр клип сонгоод, тэр клипийн заагчийг тааруулах цэгт.
2. Source Viewer-д (Match Frame [k:F]-ээр нээж) хүссэн кадарт заагч.
3. Trim → Slip Playhead To.

> Slip — клипийн In/Out хоёулаа зэрэг гүйнэ; эх файлын хязгаарт.
`,

"fade-in-to-playhead": `
## Зориулалт
Trim → Fade In to Playhead [k:Alt+Shift+D] нь сонгосон клипийн **эхлэлээс заагч хүртэл** бүдгэрэлт (видео — хараас, дуу — чимээгүйгээс) үүсгэнэ. Клипийн булангийн бариулыг чирэхтэй ижил, яг хугацаатай.

## Хэрэглэх алхам
1. Клип (видео эсвэл дуу) сонгоно.
2. Заагчийг fade дуусах цэгт.
3. [k:Alt+Shift+D].

> Хэд хэдэн клип сонгосон бол бүгдэд нь. Fade-ийн муруйг Inspector (Audio → Fade shape) эсвэл бариулын дунд цэгээр өөрчилнө. Fairlight → Batch Fade — олон клипт нэг урттай.
`,

"fade-out-to-playhead": `
## Зориулалт
Trim → Fade Out to Playhead [k:Alt+Shift+G] нь сонгосон клипийн **заагчаас төгсгөл хүртэл** бүдгэрэлт үүсгэнэ (хар руу / чимээгүй рүү).

## Хэрэглэх алхам
1. Клип сонгоно; заагчийг fade эхлэх цэгт.
2. [k:Alt+Shift+G].

> Timeline-ийн сүүлийн клипт Fade Out — видео хар руу, дуу чимээгүй рүү зэрэг (Linked Selection асаалттай бол хоёулаа сонгогдоно).
`,

"crossfade-selection": `
## Зориулалт
Trim → Crossfade Selection нь сонгосон огтлолтын цэг(үүд)-т **хоёр талын уусалт** (видео — Cross Dissolve, дуу — Cross Fade) үүсгэнэ. Стандарт шилжилтийн уртаар. Add Transition [k:Ctrl+T]-тэй төстэй; олон огтлолт сонгосон үед бүгдэд.

> Нөөц кадар (handle) байхгүй огтлолтод орохгүй. Дууны crossfade-ийн муруй (−3 dB) Preferences → User → Editing → Audio fade.

Холбоотой: [[crossfade]], [[cross-dissolve]].
`,

"slip-audio": `
## Зориулалт
Trim → Slip Audio нь холбоотой клипийн **зөвхөн дууг** зургаас нь тусад нь гулсуулна (Linked Selection-ийг унтраахгүйгээр). Дуу зурагтай хэдэн кадраар зөрсөн бол нарийвчлан нийлүүлэх.

## Хэрэглэх алхам
1. Клип сонгоно.
2. Trim → Slip Audio → One Frame Left/Right (эсвэл Multiple).
3. Уруулын хөдөлгөөн, цохилтын дуутай таарах хүртэл.

> Зөрүү үүссэн клипт улаан тоо (+00:00:03) гарна; баруун товч → Slip Audio to Sync — автоматаар буцаана. Гараар зөрүүлэх бол энэ команд.
`,

"slip-eye": `
## Зориулалт
Trim → Slip Eye нь **стерео 3D** клипийн зүүн эсвэл баруун нүдний зургийг тусад нь гулсуулж, хоёр нүдний синкийг засна. Ердийн 2D төсөлд утга байхгүй (саарал).
`,

/* ══════════ Timeline ══════════ */

"add-transition": `
## Зориулалт
Timeline → Add Transition [k:Ctrl+T] нь сонгосон (эсвэл заагчид ойрын) огтлолтын цэг дээр **стандарт шилжилтийг** видео, дуу хамт тавина. Анхны стандарт — Cross Dissolve (видео), Cross Fade (дуу), 1 секунд.

## Хэрэглэх алхам
1. Огтлолтын цэг дээр товшиж сонгоно ([k:V]); олон бол Shift+товшилт эсвэл Range.
2. [k:Ctrl+T].
3. Урт — ирмэг чирэх, Inspector → Transition.

## Тохиргоо
- Стандарт шилжилт солих — Effects Library → шилжилт дээр баруун товч → Set as Standard Transition.
- Урт — Preferences → User → Editing → Standard transition duration.
- Зөвхөн видео [k:Alt+T], зөвхөн дуу [k:Shift+T].

> "Insufficient handles" — нөөц кадар байхгүй; клипийн ирмэгийг богиносгоно.

Холбоотой: [[transition]], [[cross-dissolve]].
`,

"add-video-only-transition": `
## Зориулалт
Timeline → Add Video Only Transition [k:Alt+T] нь огтлолтын **зөвхөн видео** хэсэгт стандарт шилжилт тавина; дуу огтлолт хэвээр (дуу аль хэдийн crossfade-тэй, эсвэл дууг өөрөөр засах үед).
`,

"add-audio-transition": `
## Зориулалт
Timeline → Add Audio Transition [k:Shift+T] нь огтлолтын **зөвхөн дууны** хэсэгт стандарт Cross Fade тавина. Ярианы огтлолт дээр богино (3–5 кадар) crossfade хийж тас чимээ арилгах — олон огтлолт сонгоод нэг дор.

> Crossfade-ийн урт стандарт (1 сек) хэт урт байж болно; Preferences → Standard transition duration-ийг богиносгох, эсвэл тавьсны дараа Inspector → Duration.

Холбоотой: [[crossfade]].
`,

"select-transitions": `
## Зориулалт
Timeline → Select Transitions нь timeline дээрх (эсвэл мужийн) **бүх шилжилтийг** сонгоно — нэг дор устгах ([k:Delete]), урт солих (Inspector), төрөл солих. Бүх уусалтыг арилгаж энгийн огтлолт болгоход.

> Дараа нь Inspector → Transition → Duration-ийг өөрчилбөл бүх сонгосон шилжилтэд.
`,

"razor": `
## Зориулалт
Timeline → Razor [k:Ctrl+B] нь заагчийн байрлалд **бүх идэвхтэй (Auto Select) замын клипийг зэрэг огтолно** — Split Clip-тэй төстэй, харин клип сонголт хамаарахгүй бүх замд. Сценийн хил, бүх давхаргыг нэг дор хуваах.

> Түгжигдсэн зам огтлогдохгүй. Санамсаргүй огтлолтыг Join Clips [k:Alt+\\].

Холбоотой: [[split-clip]], [[blade]].
`,

"split-clip": `
## Зориулалт
Timeline → Split Clip [k:Ctrl+\\] нь заагчийн байрлалд клипийг **хоёр хуваана** — клип сонгосон бол зөвхөн түүнийг, сонгоогүй бол Auto Select асаалттай замуудын клипийг. Blade горимд орохгүй огтлох стандарт арга.

## Хэрэглэх алхам
1. Заагчийг огтлох цэгт (JKL, ←→).
2. [k:Ctrl+\\]. (\\ — Enter-ийн дээрх товч.)
3. Хэрэггүй хэсгийг сонгоод [k:Shift+Backspace].

> Огтолсон хоёр хэсэг эх файлыг заана; сунгаж болно. Буцаан нийлүүлэх — [k:Alt+\\].

Холбоотой: [[join-clips]], [[blade]], [[razor]].

> Cut хуудсанд: доод timeline-ийн хайчны товч (tooltip: **Split Clip**) заагч дээр хуваана; дээд timeline-ийн ⇤≡ командын цэсэнд **Split Clips** нэрээр. Хуваасны дараа төслийн нэрний хажууд Edited гарна. [[timeline-commands-menu-cut]].
`,

"join-clips": `
## Зориулалт
Timeline → Join Clips [k:Alt+\\] нь огтолсон **дараалсан хоёр хэсгийг** буцаан нэг клип болгоно. Зөвхөн ижил эх файлын **залгаа** (through edit — дунд нь кадар хасагдаагүй) хэсгүүд нийлнэ.

## Хэрэглэх алхам
1. Хоёр хэсгийг (эсвэл огтлолтыг) сонгоно.
2. [k:Alt+\\].

> Timeline дээр through edit нь огтлолтын тэмдэгтэй (жижиг зураас) харагдана; View → Show Through Edits, Edit Index → Show Through Edits-ээр олно. Дунд хэсэг хасагдсан бол нийлэхгүй — Undo эсвэл ирмэгийг чирж сунгана.
`,

"ai-tools": `
## Зориулалт
Timeline → AI Tools (мөн Clip → AI Tools) нь Resolve Studio-гийн **ухаалаг хэрэглүүрүүдийн дэд цэс** — транскрипц, хадмал, Smart Reframe, Scene Cut, дууны AI зэрэг Neural Engine командуудыг нэг дор.

## Дэд цэсэнд байж болох мөрүүд (хувилбараас хамаарна)
Create Subtitles from Audio, Transcribe Audio, Smart Reframe, Detect Scene Cuts, Detect Music Beats, Remove Silence, Voice Isolation, IntelliScript…

> Дэд цэсний яг агуулгыг таны Resolve 21 дээр шалгана уу — дэлгэцийн зурагт дэд цэс задарсан байдлаар харагдаагүй. Хэрэглүүр бүрийн тайлбар: [[davinci-neural-engine]].
`,

"multicam-editing": `
## Зориулалт
Timeline → Multicam Editing [k:Ctrl+Shift+\\] нь Timeline Viewer-ийг **Multicam харагдац** руу шилжүүлнэ — multicam клипийн бүх өнцөг тор хэлбэрээр; тоглуулж байхдаа өнцөг дээр товшиж (эсвэл 1–9 товч) сольж монтажлана.

## Хэрэглэх алхам
1. Multicam клипийг timeline-д тавина. [[multicam-clip]].
2. [k:Ctrl+Shift+\\] эсвэл Viewer-ийн зүүн доод цэс → Multicam.
3. Дэлгэцийн доод талд Cut / Switch горим, өнцгийн тоо (2×2, 3×3…).
4. Тоглуулж өнцөг товшино; огтлолт үүснэ.
5. Дуусаад Timeline харагдац руу буцна.

Холбоотой: [[multicam-cut]], [[multicam-switch]].
`,

"audio-operations": `
## Зориулалт
Timeline → Audio Operations (мөн Clip → Audio Operations) нь дууны **үйлдлүүдийн дэд цэс** — Normalize Audio Levels (түвшинг стандартад), Voice Isolation, Dialogue Leveler, Remove Silence, Auto Sync, Bounce зэрэг (хувилбараас хамаарна).

## Normalize Audio Levels
Клипүүд сонгоод → Normalize → горим: Sample Peak (оргилыг −1 dBFS), ITU-R BS.1770 (Loudness −23/−14 LUFS); Independent (клип бүр тусдаа) / Relative (харьцаа хадгалж). Ярианы клипүүдийг эхний тэгшлэлт.

> Дэд цэсний яг мөрүүдийг Resolve дээрээ шалгана уу. Нарийн холилт Fairlight хуудсанд.
`,

"match-frame": `
## Зориулалт
Timeline → Match Frame [k:F] нь timeline-ийн заагч дээрх кадартай **яг тохирох эх клипийн кадрыг** Source Viewer-т нээнэ (In/Out тэмдэглэгээтэй). Клип аль файлаас, аль хэсгээс авсныг олох, тэр клипээс өөр хэсэг авах.

## Хэрэглэх алхам
1. Timeline дээр клип дээр заагч; Timeline Viewer идэвхтэй.
2. [k:F]. Source Viewer-т эх клип, тэр кадар дээр.
3. Эсрэгээр — Source Viewer идэвхтэй үед [k:F]: эх клипийн кадар timeline-д хаана байгааг олно.

> Auto Select асаалттай хамгийн дээд замын клипийг авна; тодорхой клип бол сонгоод. Clip → Match Frame to Source Clip — Media Pool-ийн эх клип рүү. [[match-frame-to-source-clip]].
`,

"output-blanking": `
## Зориулалт
Timeline → Output Blanking нь гаралтад **тодорхой харьцааны хар зурвас** (letterbox/pillarbox) нэмж урьдчилан харна: 2.39:1, 2.35:1, 1.85:1, 4:3, 1:1, 9:16… Кино харьцаа, гарчгийн байрлалыг шалгах.

## Хэрэглэх алхам
1. Timeline → Output Blanking → харьцаа.
2. Timeline Viewer дээр хар зурвас гарна; гарчгийг зурвасын дотор.
3. Deliver-д зурвас файлд ордог (рендерт хамаарна) — Off-оор буцаана.

> Timeline-ийн нягтралыг өөрчлөхгүй (1920×1080 хэвээр, зурвас хар пиксэл). Бодит 2.39:1 файл (1920×804) хэрэгтэй бол Timeline Settings → Custom resolution.
`,

"load-current-timeline-to-source-viewer": `
## Зориулалт
Timeline → Load Current Timeline to Source Viewer нь одоогийн timeline-ийг **эх клип мэт** Source Viewer-т нээнэ. Тэндээс In/Out тавьж өөр timeline-д оруулбал **үүрлэсэн timeline** (nested) болно — олон хэсгийг тусдаа timeline-д хийгээд мастерт нэгтгэх.

> Үүрлэсэн timeline клип мэт харагдана; давхар товшиж (Open in Timeline) дотор нь орно. Compound Clip-тэй төстэй, харин timeline нь Media Pool-д бие даан хадгалагдана.
`,

"find-current-timeline-in-media-pool": `
## Зориулалт
Timeline → Find Current Timeline in Media Pool нь нээлттэй timeline Media Pool-ийн **аль санд** байгааг олж тодруулна. Олон сан, олон timeline-тэй төсөлд.

> Timeline дээрх клипийг олох бол Clip → Find Clip in Media Pool [k:Alt+F]. [[find-clip-in-media-pool]].
`,

/* ══════════ Clip ══════════ */

"compound-clip": `
## Зориулалт
Clip → New Compound Clip нь сонгосон **хэд хэдэн клипийг нэг клип болгож багцална** (олон зам, гарчиг, дуу хамт). Нэг нэгж мэт зөөж, эффект, хурд, шилжилт тавина; дотор нь ороод засаж болно.

## Хэрэглэх алхам
1. Клипүүд сонгоно (олон зам).
2. Баруун товч → **New Compound Clip** → нэр → Create. Timeline дээр нэг клип, Media Pool-д Compound клип.
3. Дотор засах — давхар товшилт эсвэл Clip → Open in Timeline; буцах — Viewer-ийн дээд талын timeline цэс эсвэл Media Pool.
4. Задлах — Clip → Decompose in Place. [[decompose]].

## Хэрэглээ
- Олон давхаргат гарчигт нэг шилжилт.
- Хэсгийг бүхэлд нь удаашруулах, Fusion руу оруулах.
- Timeline-ийг цэгцлэх.

> Compound клипийн доторх өөрчлөлт бүх хуулбарт (Media Pool-оос дахин тавьсан) тусна. Бие даасан хуулбар бол Decompose хийж дахин Compound. Color хуудсанд Compound нэг клип мэт засварлагдана; дотоод клипт тусдаа засвар бол дотор нь орно.
`,

"fusion-clip": `
## Зориулалт
Clip → New Fusion Clip нь сонгосон клипүүдийг Fusion хуудсанд **MediaIn1, MediaIn2… болгож нэг компоузитод** оруулах клип үүсгэнэ. Хоёр клипийг Fusion-д Merge хийх (ногоон дэлгэц + дэвсгэр), олон давхаргат эффект.

## Хэрэглэх алхам
1. Timeline дээр давхарласан клипүүдийг сонгоно (V1 дэвсгэр, V2 урд).
2. Баруун товч → New Fusion Clip. Нэг клип болно.
3. Fusion хуудас → MediaIn1 (доод зам), MediaIn2 (дээд зам) бэлэн; Merge-ээр нийлүүлнэ.

> Ердийн клипийг Fusion-д нээхэд MediaIn1 л байдаг — өөр клип хэрэгтэй бол Media Pool-оос чирнэ. Fusion Clip нь timeline-ийн давхаргыг хадгална. Задлах — Decompose in Place.

Холбоотой: [[fusion-page]], [[mediain]].
`,

"new-vfx-connect-clip": `
## Зориулалт
Clip → New VFX Connect Clip нь клипийг тусдаа **Fusion Studio** программ руу гаргаж ажиллуулаад, үр дүнг timeline-д буцаан холбох клип үүсгэнэ. Resolve-ийн дотоод Fusion хуудас хангалтгүй (Fusion Studio-гийн нэмэлт боломж, тусдаа компьютер) үед.

> Fusion Studio (тусдаа программ) суулгасан байх ёстой. Ердийн ажилд Fusion хуудас хангалттай; VFX Connect нь мэргэжлийн VFX студийн урсгал.
`,

"open-in-timeline": `
## Зориулалт
Clip → Open in Timeline нь Compound Clip, Multicam Clip, үүрлэсэн timeline-ийг **задлан timeline болгож нээнэ** — дотор нь ердийн монтаж мэт засна. Буцах — Timeline Viewer-ийн дээд талын timeline унадаг цэс эсвэл Media Pool-оос эх timeline.

> Дотор хийсэн өөрчлөлт Compound-ын бүх хуулбарт тусна. Multicam клипт — өнцгийн синкийг засах.
`,

"decompose": `
## Зориулалт
Clip → Decompose in Place нь Compound Clip, Fusion Clip, үүрлэсэн timeline-ийг **буцаан бүрэлдэхүүн клипүүд** болгож timeline дээр задална (Compound-д хийсэн эффект, хурд алдагдана). Дотоод клипүүдийг тусад нь засах, Compound-ыг хэрэггүй болсон үед.

> Decompose нь буцаагдахгүй (Undo-гоор л). Compound-ын түвшний Transform, Speed, Color grade задарсны дараа орохгүй — эхлээд Paste Attributes-аар хадгалж болно. Timeline → Flatten Compound Clips — бүх Compound-ыг нэг дор.
`,

"split-layers-in-place": `
## Зориулалт
Clip → Split Layers in Place нь олон давхаргат файлыг (**PSD**, зарим EXR) давхарга бүрийг **тусдаа зам дээр тусдаа клип** болгож задална. Photoshop-ийн давхаргуудыг тус тусад нь хөдөлгөх (parallax, гарчгийн давхарга).

> Давхаргын нэр, дараалал хадгалагдана; хольцын горим (Photoshop-ийн Blend) Composite Mode болж хөрвөхгүй байж болно — гараар тохируулна.
`,

"enable-disable-clip": `
## Зориулалт
Clip → Enable Clip [k:D] нь клипийг **устгалгүй түр далдална** (идэвхгүй — бүдэг харагдана, дэлгэц, рендерт орохгүй). Дахин [k:D] — сэргэнэ. Хувилбар харьцуулах, гарчиг түр нуух, дуу түр хаах (замын Mute-ээс ялгаатай — ганц клипт).

> Экспортын өмнө идэвхгүй клип байгаа эсэхийг шалгана — бүдэг клип рендерт орохгүй. Timeline → Video Track Enable — бүхэл замыг.

Холбоотой: [[video-track-enable]], [[mute]].
`,

"change-clip-duration": `
## Зориулалт
Clip → Change Clip Duration [k:Ctrl+D] нь клипийн **уртыг цагийн кодоор яг зааж** өгнө (жишээ нь 00:00:05:00). Зураг, гарчиг, генераторын уртыг нарийн тохируулах; видео клипт Out цэгийг тэр уртад (ripple).

## Хэрэглэх алхам
1. Клип сонгоно.
2. [k:Ctrl+D] → урт бичнэ (500 → 5 сек) → OK.

> Видео клипт эх файлын уртаас хэтэрч болохгүй. Олон клип сонгосон бол бүгдэд ижил урт (зургийн слайд шоу).
`,

"clip-speed": `
## Зориулалт
Clip → Clip Speed дэд цэс нь хурдны командууд: **Change Clip Speed** (цонх — %, fps, Duration, Reverse, Freeze Frame, Ripple, Keep Audio Pitch), **Retime Controls** [k:Ctrl+R], **Retime Curve**, **Freeze Frame**, **Reset Retime**. Дэлгэрэнгүй: [[speed-change]], [[speed-ramp]], [[optical-flow]].

> Хурд өөрчилсний дараа Inspector → Retime and Scaling → Retime Process (Optical Flow) чанарыг тодорхойлно.
`,

"fusion-referenced-compositions": `
## Зориулалт
Clip → Fusion Referenced Compositions нь нэг Fusion компоузитыг **олон клипээр хуваалцах** (reference) — нэг клипийн компоузитыг өөрчлөхөд бусад холбоотой клип ч өөрчлөгдөнө. Ижил доод гарчиг (lower third) олон газар — текст солиход бүгд.

## Хэрэглээ
- Клип дээр баруун товч → Fusion → Create Referenced Composition / Link to…
- Холбоосыг тасалж бие даасан болгох — Unlink.

> Fusion Title-ийн Inspector-ийн текст нь клип бүрд тусдаа (референсийн гадна) байж болно — хувилбараас хамаарна; Resolve дээрээ туршина.
`,

"auto-align-clips": `
## Зориулалт
Clip → Auto Align Clips нь timeline дээр сонгосон **хэд хэдэн клипийг дууны долгион эсвэл цагийн кодоор** автоматаар нийлүүлж зэрэгцүүлнэ (Media Pool-ийн Auto Sync Audio-ийн timeline хувилбар). Хоёр камер, тусдаа дууг timeline дээр шууд синк хийх.

## Хэрэглэх алхам
1. Timeline дээр өөр өөр зам дээрх клипүүдийг сонгоно (нэг үйл явдал).
2. Clip → Auto Align Clips → Based on Waveform / Timecode.
3. Клипүүд зөөгдөж зэрэгцэнэ.

Холбоотой: [[audio-sync]], [[sync-bin]].
`,

"take-selector": `
## Зориулалт
Clip → Take Selector нь нэг байрлалд **хэд хэдэн авалт (take)** давхарлаж хадгалаад, timeline дээр ээлжлэн сольж харьцуулах хэрэгсэл. Захиалагчид хувилбар үзүүлэх, шилдэг авалт сонгох.

## Хэрэглэх алхам
1. Timeline дээрх клип дээр баруун товч → **Take Selector**. Клип өргөсч, дээр нь авалтын мөр гарна.
2. Media Pool-оос өөр клипүүдийг тэр мөр рүү чирж авалт болгож нэмнэ.
3. Авалт дээр товшиж идэвхжүүлнэ; тоглуулж харьцуулна.
4. Дуусаад Clip → **Finalize Take** — сонгосон авалт үлдэж, бусад нь хасагдана. [[finalize-take]].

> Авалтуудын урт өөр бол timeline-ийн урт идэвхтэй авалтаар. Дуу мөн авалттай хамт солигдоно.
`,

"finalize-take": `
## Зориулалт
Clip → Finalize Take нь Take Selector-т **сонгосон авалтыг эцэслэж**, бусад авалтыг хасаж ердийн клип болгоно. Шийдвэр гарсны дараа timeline цэвэрлэх.

> Хасагдсан авалтууд Media Pool-д хэвээр; дахин Take Selector үүсгэж болно.
`,

"multicam-cut": `
## Зориулалт
Clip → Multicam Cut нь Multicam харагдацад өнцөг солиход **огтлолт үүсгэж** солино (шинэ огтлолтын цэг). Ердийн олон камерын монтаж — тоглуулж байхдаа өнцөг товших бүрд огтлолт.

Холбоотой: [[multicam-switch]], [[multicam-editing]].
`,

"multicam-switch": `
## Зориулалт
Clip → Multicam Switch нь Multicam харагдацад **огтлолт үүсгэхгүйгээр** одоогийн клипийн өнцгийг солино — буруу өнцөг сонгосон хэсгийг засах, огтлолтын дараах бүх хэсгийн өнцгийг нэг дор.

> Timeline дээр multicam клип дээр баруун товч → Switch Multicam Clip Angle — мөн адил; Cut горимд өнцөг товшвол огтлолт үүсдэг тул засварт Switch.
`,

"find-clip-in-media-pool": `
## Зориулалт
Clip → Find Clip in Media Pool [k:Alt+F] нь timeline дээр сонгосон клип Media Pool-ийн **аль санд, ямар нэртэй** байгааг олж тодруулна. Эх файлыг олох, ижил файлаас өөр хэсэг авах, мета өгөгдлийг харах.

> Клип дээр баруун товч → Find in Media Pool — мөн адил. Эх файлыг диск дээр олох — Media Pool-д тэр клип дээр баруун товч → Reveal in Explorer/Finder.
`,

"match-frame-to-source-clip": `
## Зориулалт
Clip → Match Frame to Source Clip нь timeline-ийн заагч дээрх кадартай тохирох **Media Pool-ийн эх клипийн** кадрыг Source Viewer-т нээнэ. Timeline → Match Frame [k:F]-тэй төстэй; Compound, Multicam доторх клипт эх файлыг олоход тустай.

Холбоотой: [[match-frame]].
`

});
