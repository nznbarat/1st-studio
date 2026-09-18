/* ═════════════════════════════════════════════════════════════
   Гарын авлагын дэлгэрэнгүй тайлбар · Хуудсууд, самбарууд, Deliver-ийн бусад
   (загварын товших цэгүүдийн үлдсэн хэсэг)
   ═════════════════════════════════════════════════════════════ */
RM.dict.long({

"media-page": `
## Зориулалт
Media [k:Shift+2] нь **материал оруулах, эмхлэх, бэлтгэх** хуудас. Диск дээрх файлыг үзэж, Media Pool-д импортолж, сангаар ангилж, мета өгөгдөл оноож, дуу нийлүүлж, прокси үүсгэнэ. Монтажийн өмнөх бүх бэлтгэл энд.

## Бүтэц
- **Дээд зүүн** — Media Storage: диск, хавтасны мод. [[media-storage]].
- **Дээд төв** — файлын жагсаалт/зураг (сонгосон хавтас).
- **Дээд баруун** — Viewer: импортлохгүйгээр урьдчилан үзэх; дууны хэмжүүр.
- **Доод** — Media Pool: Bins, клипүүд. [[media-pool]].
- **Баруун** (нээвэл) — Audio (дууны суваг), Metadata, Inspector, Capture.
- Interface Toolbar — Media Storage, Clone Tool | Audio, Metadata, Inspector, Capture.

## Ажлын урсгал
1. Clone Tool-оор камерын картыг диск рүү баталгаатай хуулна. [[clone-tool]].
2. Media Storage-оос хавтсыг Media Pool руу чирнэ (сангийн бүтэц хадгалагдана).
3. Давтамж зөрсөн анхааруулгад Change (төслийн давтамжийг материалд тааруулах).
4. List View-д мета шалгах; түлхүүр үг, Scene/Shot оноох; Smart Bin.
5. Тусдаа бичсэн дууг Auto Sync Audio. [[audio-sync]].
6. Хүнд файлд Generate Proxy Media. [[proxy-generation]].
7. Шаардлагатай бол Scene Cut Detection, Transcribe Audio.

> Cut, Edit хуудасны Media Pool ижил агуулгатай; Media хуудас зөвхөн импорт, эмхлэлтэд илүү зайтай орон зай.
`,

"photo-page": `
## Зориулалт
Photo нь DaVinci Resolve 21-д нэмэгдсэн **зургийн хуудас** — RAW болон энгийн зургийг үнэлэх, шүүх, ангилах, засварлах. Media ба Cut хуудасны хооронд байрлана. Зургийг Photo Album-д цуглуулж, одны үнэлгээ, туг, шошгоор ялгаж, Media Pool руу буцаан ашиглана.

## Бүтэц (таны дэлгэцийн зурагт үндэслэв)
- **Interface Toolbar** — Media Pool, Effects, Photo Album | Quick Export, Metadata, Capture, Inspector.
- **Зүүн** — Media Pool (Master / сан).
- **Төв** — Viewer: сонгосон зураг томоор; доод мөрөнд үнэлгээ (★), дуртай (♡), туг (⚑), шошго.
- **Доод** — Photo Album: зургийн эгнээ; зүүн талд Filters. [[photo-album]], [[photo-filters]].

## Ажлын урсгал
1. Media Pool-оос зургуудыг Photo Album руу чирнэ.
2. Зураг бүрийг үзэж ★ үнэлгээ, ♡, ⚑ өгнө. [[photo-rating]], [[photo-flag]].
3. Filters-ээр шилдгүүдийг л үлдээнэ.
4. Inspector-т RAW тохиргоо, өнгө (зургийн Camera Raw, Color хуудасны хэрэглүүр) засварлана.
5. Сонгосон зургуудыг Media Pool-ийн сан руу чирж Edit timeline-д (слайд шоу, Dynamic Zoom) ашиглана, эсвэл Quick Export-оор зураг экспортлоно.

> Photo хуудас шинэ тул энд бичсэн нарийн ажиллагаа, товчлуурыг албан ёсны гарын авлагын Photo бүлгээс баталгаажуулна уу. Хуудасны товчлуур (Shift+…) мөн тодорхойгүй.
`,

"cut-page": `
## Зориулалт
Cut [k:Shift+3] нь **хурдан монтажийн** хуудас — мэдээ, сошиал, богино видеонд зориулж цөөн товшилтоор эвлүүлнэ. Edit хуудасны бүх боломж байхгүй, харин хурдны хэрэглүүрүүд: Dual Timeline, Smart Insert, Sync Bin, Source Tape, Quick Export.

## Бүтэц
- **Дээд зүүн** — Media Pool (зураг/жагсаалт), эсвэл Sync Bin, Transitions, Titles, Effects.
- **Дээд баруун** — Viewer (Source / Timeline, Source Tape горим — бүх клипийг нэг урт "хальс" мэт).
- **Дунд** — транспорт, монтажийн товчнууд: Smart Insert, Append, Ripple Overwrite, Close Up, Place on Top, Source Overwrite; шилжилт: Cut, Dissolve, Smooth Cut.
- **Доод** — Dual Timeline: дээд бүтэн, доод томруулсан. [[dual-timeline]].
- **Дээд баруун товч** — Quick Export.

## Онцлог
- **Source Tape** — Media Pool-ийн бүх клипийг дараалуулан нэг дэлгэцэнд гүйлгэж In/Out тавих.
- **Sync Bin** — олон камерын клипийг цагийн мөчөөр зэрэгцүүлэх. [[sync-bin]].
- **Boring Detector** — хэт урт, хэт богино клипийг тодруулах.
- **Smart Indicator** — заагчид ойрын огтлолт.
- Inspector-ийн Tools (Transform, Crop, Dynamic Zoom, Speed…) дэлгэц дээр.

## Edit-тэй харьцуулбал
Нарийн олон замтай монтаж, түлхүүр кадар, тайралтын горимууд Edit хуудсанд. Cut-д эхлээд бүдүүлэг эвлүүлээд Edit-д нарийвчлах нь түгээмэл; хоёулаа нэг timeline.

> Cut хуудасны timeline дээр зам хязгаарлагдмал биш, гэвч замын толгой, Auto Select, түгжээ зэрэг удирдлага Edit-д.
`,

"edit-page": `
## Зориулалт
Edit [k:Shift+4] нь **бүрэн монтажийн** хуудас — олон зам, нарийн тайралт, түлхүүр кадар, шилжилт, гарчиг, эффект, дууны үндсэн холилт. Ихэнх монтажчийн гол ажлын орон зай.

## Бүтэц
- **Дээд зүүн** — Media Pool, Effects Library, Edit Index, Sound Library (Interface Toolbar-аар).
- **Дээд төв** — Source Viewer ба Timeline Viewer (анхны Source/Timeline хос дэлгэц). [[source-viewer]], [[timeline-viewer]].
- **Дээд баруун** — Inspector (Video, Audio, Effects, Transition, Image, File), Metadata, Mixer.
- **Доод** — Timeline: замын толгой, клип, хэрэгслийн мөр. [[timeline]], [[toolbar-timeline]].

## Ажлын урсгал
1. Media Pool → клипийг Source Viewer-д, In/Out ([k:I] [k:O]).
2. Insert [k:F9] / Overwrite [k:F10] / Append [k:Shift+F12] — timeline руу.
3. Тайралт: Selection [k:A], Trim [k:T], Blade [k:B]; [k:Ctrl+\\] огтлох.
4. Шилжилт [k:Ctrl+T]; гарчиг (Effects Library → Titles); эффект.
5. Inspector → Transform, Crop, Composite, Speed, Stabilization.
6. Дуу — клипийн Volume, Mixer; нарийн холилт Fairlight-д.
7. Fusion, Color хуудсанд эффект, өнгө; буцаж Edit-д шалгах.
8. Deliver.

## Гол зарчим
- Timeline эвдрэлгүй — эх файл өөрчлөгдөхгүй.
- Идэвхтэй дэлгэц (Source/Timeline) товчлуурт нөлөөлнө ([k:Q]).
- Auto Select, Linked Selection, Snapping гурван унтраалга ихэнх "яагаад ингэв" асуултын хариу.
- [k:Ctrl+S] байнга; Live Save асаах.

> Edit хуудасны Inspector-ийн Transform, Fusion-ий Transform, Color-ийн Sizing гурав тусдаа, давхар үйлчилнэ. Нэг зорилгод нэг газар.
`,

"deliver-page": `
## Зориулалт
Deliver [k:Shift+8] нь **экспортын** хуудас — timeline-ийг видео файл, зургийн дараалал, дуу, DCP, хальс руу гаргана. Render Settings (зүүн), Viewer + timeline (төв), Render Queue (баруун).

## Бүтэц
- **Render Settings** — загвар, нэр, байршил, Single/Individual, Video/Audio/File/Subtitle таб. [[render-settings]].
- **Viewer** — урьдчилан харах; IN/OUT/DURATION.
- **Timeline** — Render: Entire Timeline / In/Out Range.
- **Render Queue** — ажлууд; Render All. [[render-queue]].
- Interface Toolbar — Render Settings, Tape, Clips | Render Queue.

## Ажлын урсгал
1. Экспортын өмнө: timeline-ийн төгсгөл ([k:Shift+Z]), Mute/Solo, унтарсан зам, Offline клип (улаан) шалгах.
2. Render Presets → YouTube 2160p (эсвэл Custom).
3. File Name, Location (Browse).
4. Video: Format MP4, Codec H.265 (эсвэл H.264), Resolution, Frame rate, Quality.
5. Audio: AAC 320 Kb/s (эсвэл Linear PCM мастерт).
6. Render: Entire Timeline.
7. Add to Render Queue → Render All.
8. Гарсан файлыг нээж шалгана.

## Хурдан хувилбар
File → **Quick Export** — Deliver руу орохгүйгээр бэлэн тохиргоогоор. [[quick-export]].

> Хуудасны экспорт GPU кодлогчоос (Encoder → NVIDIA/Intel/AMD) хамаарч 2–10 дахин хурдасна. Preferences → System → Decode Options-д GPU-г асаана.
`,

"clone-tool": `
## Зориулалт
Clone Tool (Media хуудас, Interface Toolbar) нь камерын карт, дискийг **баталгаатай (checksum) хуулах** хэрэглүүр. Ердийн хуулбар файлын гэмтлийг мэдэхгүй; Clone Tool эх ба хуулбарыг бит бүрээр харьцуулж, тайлан гаргана. Зураг авалтын дараа картаа цэвэрлэхийн өмнө заавал.

## Хэрэглэх алхам
1. Media хуудас → Clone Tool.
2. **Add Job** — шинэ ажил.
3. **Source** — картаа (эсвэл хавтас) чирнэ (Media Storage-оос).
4. **Destination** — хуулах диск, хавтас. Хэд хэдэн байршил нэмж болно (нэг дор 2 нөөц).
5. **Checksum Type** — MD5, SHA-512, xxHash (хурдан). None — шалгалтгүй.
6. **Clone** — хуулж, шалгана. Ногоон — амжилттай; улаан — зөрүү (дахин хуулах).
7. Preserve folder structure — картын бүтцийг хадгалах (заавал; BRAW, XAVC зэрэг формат хавтасны бүтцээс хамаарна).

## Зөвлөмж
- Хоёр өөр диск рүү зэрэг хуулна (3-2-1 нөөцийн дүрэм).
- Картын нэр, огноогоор хавтас нэрлэнэ (2026-09-17_CamA_001).
- Хуулбарын дараа л Media Pool-д импортолно (картаас биш, дискнээс).

> Ажил дуусаад Resolve-ийн гадуур файлын нэр, хавтсыг өөрчилбөл дараа нь Relink шаардлагатай.
`,

"metadata-editor": `
## Зориулалт
Metadata самбар (Media, Edit, Fairlight хуудсанд Interface Toolbar → Metadata) нь сонгосон клипийн **мета өгөгдлийг үзэж, засварлах** засварлагч. Камерын автомат талбар (уншигдана) болон хэрэглэгчийн талбар (бичнэ).

## Бүтэц
- Дээд — клипийн нэр, зураг, үндсэн мэдээлэл.
- **Бүлгийн унадаг цэс** — All, Shot & Scene, Clip Details, Camera, Tech Details, Audio, Production, Keywords, Reviewed By… Бүлэг бүр өөр талбартай.
- Талбарууд — Scene, Shot, Take, Angle, Description, Comments, Keywords, Clip Color, Flags, Good Take, Reel Name, Camera #, Date Recorded…
- Доод — **Preset**: харуулах талбарын багц; ⋯ → Edit Metadata Presets — өөрийн багц.

## Хэрэглэх алхам
1. Media Pool-д клип (эсвэл олон клип) сонгоно.
2. Metadata самбар → бүлэг сонгоно (жишээ нь Shot & Scene).
3. Талбар бөглөнө. Олон клип сонгосон бол бүгдэд нь бичигдэнэ (зөвхөн өөрчилсөн талбар).
4. Enter эсвэл өөр талбар руу шилжихэд хадгалагдана.

## Хэрэглээ
- Scene/Shot/Take — кино төслийн зохион байгуулалт; Media Pool → List View-д баганаар харж эрэмбэлнэ.
- Keywords → Smart Bin. [[keyword]], [[smart-bin]].
- Reel Name — конформ, EDL-д.
- File → Export/Import Metadata — CSV-ээр багцаар засах.

> Мета өгөгдөл төслийн санд хадгалагдана, файлд бичигдэхгүй. Өөр төсөлд ижил файл импортлоход гараар бичсэн мета ирэхгүй (Export Metadata → Import).

Холбоотой: [[metadata]].
`,

"capture": `
## Зориулалт
Capture (Media хуудас → Interface Toolbar → Capture) нь **хальс (tape), дек, камерын шууд оролтоос** видеог бичиж авах самбар. Blackmagic DeckLink, UltraStudio, Intensity төхөөрөмж шаардана; SDI/HDMI оролт. Хуучин хальсны архив, шууд оролтыг Resolve-д оруулахад.

## Тохиргоо
- Preferences → Video and Audio I/O → Capture and Playback device.
- Project Settings → **Capture and Playback** → Video capture format, Capture: Video and Audio, Save clips to (хавтас), Apply reel name…
- Дек удирдлага — RS-422 (Deck control) → цагийн кодоор Batch Capture.

## Хэрэглэх алхам
1. Төхөөрөмж, дек холбоно; Project Settings → Capture and Playback.
2. Media хуудас → Capture. Дээд талд оролтын дүрс харагдана.
3. **Capture Now** — шууд бичиж эхлэх; **Stop**.
4. Дек удирдлагатай бол: In/Out тавьж **Capture Clip**; олон клипт **Batch Capture** (жагсаалт).
5. Клип Media Pool-д, файл заасан хавтсанд (DNxHR, ProRes зэрэг формат).

> Ердийн файлд суурилсан камер (SD карт, SSD) -т Capture шаардлагагүй — файлыг импортолно. Capture зөвхөн дохионы (SDI/HDMI) оролт, хальс.

> Photo хуудасны Interface Toolbar дээр ч Capture товч байгаа — тэтhered (камераас шууд зураг авах) зориулалттай байж болзошгүй; гарын авлагаас баталгаажуулна.
`,

"sync-bin": `
## Зориулалт
Sync Bin (Cut хуудас) нь сонгосон сангийн **бүх клипийг цагийн кодоор зэрэгцүүлж**, timeline-ийн заагчийн мөчид аль камерт юу байгааг олон дэлгэцээр (multi-view) харуулна. Олон камерын монтажийг Multicam клип үүсгэхгүйгээр хийх Cut хуудасны арга.

## Урьдчилсан нөхцөл
Клипүүд цагийн код (jam sync) эсвэл долгионоор синк хийгдсэн байх: Media Pool → баруун товч → Auto Sync Audio → Based on Waveform. Синк хийгдээгүй бол Sync Bin хоосон эсвэл зөрүүтэй.

## Хэрэглэх алхам
1. Timeline дээр эхний камерын клипийг тавина (эсвэл бүтэн авалт).
2. Interface Toolbar → **Sync Bin**. Дээд зүүнд сангийн клипүүд; Viewer олон дэлгэц (2×2, 3×3) горимд — заагчийн мөчийн бүх өнцөг.
3. Заагчийг солих мөчид байрлуулна; timeline-д In/Out (солих хугацаа).
4. Viewer дээр хүссэн өнцгийг товшино (Source Viewer-д тэр өнцөг тэр мөчид).
5. **Source Overwrite** — тэр өнцөг дээд зам дээр, цагийн кодоор яг таарч орно. [[source-overwrite]].
6. Давтана.

## Multicam-тай харьцуулбал
Multicam клип (Media Pool → Create Multicam Clip) нь Edit хуудсанд өнцгийг тоглуулж байхдаа солино; Sync Bin нь Cut хуудсанд огтлолт огтлолтоор. Урт тоглолтод Multicam, богино ярилцлагад Sync Bin.

> Дууг нэг замаар (жишээ нь микрофоны бичлэг) үлдээж, Source Overwrite-оор зөвхөн видеог солихын тулд Source Track Selector-ийн дууг унтраана.
`,

"quick-export": `
## Зориулалт
Quick Export (File → Quick Export; Cut, Edit, Photo хуудасны Interface Toolbar-ийн товч) нь Deliver хуудас руу орохгүйгээр **бэлэн тохиргоогоор шууд экспортлох** цонх. Хурдан хувилбар, урьдчилан үзүүлэх файл, сошиалд.

## Цонх
- Загварууд: H.264, H.265, ProRes (macOS), YouTube, Vimeo, TikTok, Frame.io, Twitter/X, Dropbox… Загвар бүр нягтрал, кодек, дуу тохируулсан.
- Загвар дээр хулгана — тохиргооны товч мэдээлэл.
- **Upload directly** — YouTube, Vimeo, Frame.io данстай холбогдсон бол шууд байршуулна (Preferences → Internet Accounts).
- In/Out тавьсан бол тэр мужийг л; үгүй бол бүтэн timeline.
- **Export** → файлын нэр, байршил.

## Хэрэглэх алхам
1. Timeline дээр (шаардлагатай бол) In/Out.
2. File → Quick Export.
3. Загвар сонгоод Export. Явц гарна.

## Хязгаар
> Нягтрал, битийн урсгал, дууны кодек зэргийг нарийн тохируулах боломжгүй — Deliver хуудас. Загварыг өөрчлөх бол Deliver → Render Settings → Save As New Preset → Quick Export-д харагдана.

> Quick Export Render Queue-д ажил нэмдэггүй; шууд рендерлэнэ, дуустал хүлээнэ.

Холбоотой: [[render-presets]], [[deliver-page]].
`,

"sound-library": `
## Зориулалт
Sound Library (Edit, Fairlight хуудас → Interface Toolbar) нь **дуут эффектийн санг** хайж, сонсож, timeline-д чирдэг самбар. Blackmagic Design-ий үнэгүй Fairlight Sound Library (500+ эффект) болон өөрийн хавтсыг нэмж болно.

## Бэлтгэл
1. Blackmagic-ийн вэбээс Fairlight Sound Library-г татаж суулгана (Resolve-ийн Support хуудас).
2. Sound Library самбар → ⋯ → **Add Library** — эффектийн хавтсыг заана. Resolve файлуудыг индексжүүлнэ (мета, нэр).
3. Өөрийн WAV цуглуулгыг мөн адил нэмнэ.

## Хэрэглэх алхам
1. Хайлтын талбарт үг (door, wind, whoosh — англиар; файлын нэрээр хайна).
2. Үр дүн дээр товшиж сонсоно (audition); долгион дээр In/Out тавьж хэсгийг л.
3. Timeline-ийн дууны зам руу чирнэ, эсвэл заагчид [k:F10] Overwrite.
4. ★ — дуртайд нэмэх; Recent — сүүлд хэрэглэсэн.

## Зөвлөмж
- Дуут эффектийг тусдаа замд (FX), Sub bus-т.
- Foley Sampler (Fairlight) — дуут эффектийг гар дээр тоглож бичих.
- Зохиогчийн эрх — Blackmagic сан үнэгүй, арилжааны ажилд зөвшөөрөгдсөн.

> Сан хоосон харагдвал Add Library хийгээгүй эсвэл хавтас зөөгдсөн байна. Хавтас солиход дахин нэмнэ.
`,

"spline-editor": `
## Зориулалт
Spline Editor (Fusion хуудас → Interface Toolbar → Spline) нь түлхүүр кадрын **хөдөлгөөний муруйг** засварлах самбар. Хэвтээ — цаг, босоо — утга. Муруйн хэлбэрийг өөрчилж хөдөлгөөнийг зөөлрүүлэх, хурдасгах, давтах.

## Бүтэц
- Зүүн — параметрийн жагсаалт (нод бүрийн хөдөлгөөнтэй параметр); чагтаар харуулна.
- Төв — муруй, түлхүүр кадрын цэгүүд, бариул (Bezier).
- Доод — хэрэгслийн товч: Smooth, Linear, Step In/Out, Reverse, Loop, Ping-Pong, Ease In/Out, Zoom to Fit.

## Хэрэглэх алхам
1. Inspector-т параметрт түлхүүр кадар тавина (◆).
2. Spline самбар нээж, зүүн жагсаалтаас параметрийг чагтална.
3. Цэгүүдийг чирж утга, цаг өөрчилнө; бариулаар муруйн хэлбэр.
4. Бүх цэг сонгоод ([k:Ctrl+A]) **Smooth** (зөөлөн) эсвэл **Linear** (шулуун).
5. Ease In / Ease Out — эхлэл, төгсгөлийг зөөлрүүлэх.
6. Давтах — цэгүүд сонгоод **Loop** / **Ping-Pong** (сүүлийн цэгээс хойш давтагдана).
7. Баруун товч → Reverse — урвуу.

## Keyframes самбартай ялгаа
- **Keyframes** — түлхүүр кадрыг зөвхөн цаг хугацаагаар (хэвтээ) зөөх, сунгах; муруйгүй. Хугацаа тааруулахад.
- **Spline** — утга ба муруй. Хөдөлгөөний чанарт.

> Муруй харагдахгүй бол зүүн жагсаалтад чагт байхгүй, эсвэл Zoom to Fit хийгээгүй. Эргэлт (Angle) зэрэг том утгын муруй жижиг утгуудыг дардаг — тус тусад нь харна.
`,

"gallery": `
## Зориулалт
Gallery (Color хуудасны дээд зүүн) нь **хадгалсан кадруудын (still) сан** — кадар бүр зураг + бүрэн grade (нодны мод) агуулна. Засварыг хадгалах, өөр клипт хуулах, кадруудыг харьцуулах (wipe), төсөл хооронд зөөх.

## Бүтэц
- **Albums** (зүүн) — Stills (анхны), Timelines (timeline бүрийн автомат), PowerGrade (бүх төсөлд нийтлэг), өөрийн цомог.
- Still-үүд — зураг, дугаар (1.1.1 — timeline.clip.version), нэр.
- Дээд — Grab Still, Wipe, тохиргоо.

## Хэрэглэх алхам
1. **Grab Still** — Viewer дээр баруун товч → Grab Still ([k:Ctrl+Alt+G]), эсвэл Gallery-ийн товч. Still үүснэ.
2. **Apply Grade** — Still дээр баруун товч → Apply Grade, эсвэл Still дээр **дунд товч** — одоогийн клипт grade орно.
3. **Wipe** — Still дээр товшиход Viewer дээр эх ба Still хагасаар харагдана (харьцуулах); дэлгэцийн Image Wipe товч; Wipe чиглэл, хувь. Дахин товшиж хаана.
4. Still дээр давхар товшиж нэр, тэмдэглэл.
5. Баруун товч → **Export** (.drx + зураг) — өөр төсөл, компьютер руу; Import.
6. Still-ийг **PowerGrade** цомог руу чирвэл бүх төсөлд бэлэн (Look-ийн сан).

## Зөвлөмж
- Үзэгдэл бүрийн "hero" кадрыг Still болгож, бусад клипийг тэр Still-тэй Wipe-аар харьцуулж тааруулна.
- Gallery → ⋯ → Split Screen — олон Still-ийг нэг дэлгэцэнд.
- Still-ийн зураг Project Settings → Working Folders → Gallery stills хавтсанд (.dpx + .drx).

> Still-ийн grade хуулахад нодны мод бүхэлдээ солигдоно (дарна). Нэмэх бол баруун товч → Append Node Graph.

Холбоотой: [[grade]].
`,

"lut-browser": `
## Зориулалт
LUTs самбар (Color хуудасны дээд зүүн, Interface Toolbar → LUTs) нь суулгасан **LUT (Look-Up Table) файлуудыг** хавтсаар үзэж, урьдчилан харж, нод дээр тавьдаг самбар. LUT нь өнгөний тогтмол хувиргалт — камерын лог → Rec.709, кино "look", монитор калибрац.

## Бүтэц
- Зүүн — хавтаснууд: Blackmagic Design, ARRI, Sony, Panasonic, Film Looks, VFX IO, DaVinci CTL, өөрийн хавтас.
- Баруун — LUT-ууд зургаар (сонгосон клипийн кадарт урьдчилан хэрэглэсэн — hover-оор Viewer-т харагдана).

## Хэрэглэх алхам
1. Нод сонгоно (LUT нодын түвшинд).
2. LUTs самбараас LUT дээр **давхар товшино** эсвэл нод руу чирнэ. Нод дээр LUT тэмдэг гарна.
3. Хасах — нод дээр баруун товч → LUT → No LUT.
4. Өөрийн LUT (.cube) нэмэх — Project Settings → Color Management → **Open LUT Folder** → файлыг хуулна → LUTs самбар → баруун товч → **Update Lists**.

## Хэрэглээ
- Лог материал (S-Log3, LogC, BMD Film) → Rec.709 (камерын LUT). Color Space Transform илүү зөв. [[input-color-space]].
- Бүтээлч look (Film Looks). Ихэвчлэн Look-ийн нодод, Primaries-ийн дараа.
- Timeline node-д — бүх timeline-д нэг look.
- Viewer → 3D LUT (харах LUT, экспортод орохгүй) — Color → Viewer LUT.

## Анхаарах
> LUT нь хүрээнээс гадуурх утгыг тайрдаг (clip). Экспозицийг LUT-ийн **өмнөх** нодод засна.

> LUT-ийн оролт тодорхой орон зайг хүлээдэг (S-Log3 LUT-ыг Rec.709 материалд тавибал буруу). LUT-ийн нэр, зориулалтыг шалгана.

> Resolve FX → Color → **DCTL**, Color Space Transform — LUT-ийн уян хатан хувилбар.
`,

"mini-timeline": `
## Зориулалт
Color хуудасны **Timeline** харагдац (Interface Toolbar → Timeline) нь Edit-ийн timeline-ийг **шахсан жижиг хэлбэрээр** Clips эгнээний доор харуулна: бүх зам, клипийн урт, заагч. Clips (зурган эгнээ) -тэй ээлжлэн эсвэл хамт.

## Хэрэглээ
- Клипийн timeline дээрх байрлал, урт, аль зам дээр байгааг харах (Clips эгнээнд урт харагдахгүй).
- Заагчийг чирж клип дотор гүйлгэх (Clips эгнээ клип сонгодог, кадар сонгодоггүй).
- Дээд зам дээрх клип (гарчиг, давхарга) -ийг сонгох — Clips эгнээ бүх замын клипийг дарааллаар харуулдаг тул mini-timeline-д давхаргыг ялгах.
- Түлхүүр кадрын (Keyframes самбар) байрлалыг timeline-тэй харьцуулах.

## Хэрэглэх алхам
1. Interface Toolbar → **Timeline** (Clips-ийн хажууд).
2. Mini-timeline дээр клип дээр товшино — сонгогдоно; заагчийг чирнэ.
3. [k:Ctrl] + дугуй — томруулах.

## Хязгаар
> Mini-timeline дээр монтаж (клип зөөх, тайрах) хийхгүй — зөвхөн навигаци. Монтаж Edit хуудсанд.

> Дууны зам харагдах боловч дууны засвар энд байхгүй.

Холбоотой: [[clips-panel]], [[thumbnail-timeline]].
`,

"lift": `
## Зориулалт
Lift нь өнгөний дугуйн **сүүдэр, хар хэсгийн** бүс. Master (доод гүйлгэгч) хар цэгийг өргөж, буулгана; дугуй сүүдэрт өнгө нэмнэ. Математикаар — утга нэмэх (offset) боловч гэгээ рүү аажим буурдаг тул цагаан цэг бараг хөдлөхгүй.

## Хэрэглэх алхам
1. Waveform скоп нээнэ.
2. Lift master-ийг доош — сүүдэр харанхуйлж, Waveform-ийн доод хэсэг 0 руу дөхнө. Тайрахгүй (0-ээс доош хавтгайрахгүй).
3. Дугуйгаар сүүдрийн өнгө: Parade-д гурван графикийн **доод** хэсгийг зэрэгцүүлнэ (цэнхэр өндөр — дугуйг цэнхэрээс холдуулж шар руу).
4. Бүтээлч — сүүдэрт бага зэрэг цэнхэр/ногоон (teal) — кино маягийн харагдац.

## Анхаарах
> Lift-ийг хэт өргөвөл дүрс "бүдэг", хар цэггүй; хэт буулгавал сүүдэр тайрагдаж нарийн ширийн алдагдана.

> Log материалын хар цэг өндөр (бүдэг) байдаг — Lift буулгах эхний алхам; Color Space Transform илүү зөв.

Холбоотой: [[gamma]], [[gain]], [[offset]], [[color-wheels]].
`,

"gain": `
## Зориулалт
Gain нь өнгөний дугуйн **гэгээ, цагаан хэсгийн** бүс. Master цагаан цэгийг өргөж, буулгана; дугуй гэгээнд өнгө нэмнэ. Математикаар — үржүүлэх; сүүдэр рүү аажим буурч, хар цэг бараг хөдлөхгүй.

## Хэрэглэх алхам
1. Waveform-оор дээд хэсгийг харна.
2. Gain master дээш — гэгээ тодорч, Waveform-ийн дээд 1023 (video levels-д 940) руу дөхнө. Хавтгайрвал тайрагдсан — буцаана.
3. Дугуйгаар гэгээний өнгө: Parade-ийн **дээд** хэсгийг зэрэгцүүлнэ. Дулаан гэгээ (шар) — нарны гэрэл.
4. Highlights гүйлгэгч (доод мөр) — гэгээг л шахах (Gain-аас ялгаатай). [[shadows-highlights]].

## Анхаарах
> Тайрагдсан (клип) гэгээг Gain буулгаж сэргээхгүй — мэдээлэл байхгүй; хавтгай саарал болно. RAW-д Highlight Recovery.

> Gain нь ханалтад нөлөөлнө (гэгээ тодрох тусам өнгө цайна). Lum Mix, Saturation-аар тааруулна.

Холбоотой: [[lift]], [[gamma]], [[offset]], [[color-wheels]].
`,

"offset": `
## Зориулалт
Offset нь өнгөний дугуйн дөрөв дэх дугуй — дүрсийг **бүхэлд нь**, бүх гэрлийн түвшинд ижил хэмжээгээр шилжүүлнэ. Master — ерөнхий экспозиц (лог материалд камерын экспозицтой ойр); дугуй — бүхэлд нь өнгөний шилжилт (цагаан тэнцвэртэй ойр).

## Хэрэглээ
- **Log материалын экспозиц** — Offset master-аар Waveform-ыг бүхэлд нь дээш, доош.
- **Цагаан тэнцвэр** — Offset дугуй (Temp/Tint-тэй төстэй, бүх бүсэд).
- Printer lights — кино лабораторийн уламжлалт засварын аналог (Offset-ийг R, G, B тоогоор).
- HDR самбарын Global дугуйтай ижил үүрэг.

## Lift/Gamma/Gain-тэй харьцуулбал
Lift, Gamma, Gain бүс тус бүрд; Offset бүх бүсэд тэнцүү. Log материалд Offset-ийг эхлээд (экспозиц), дараа нь Lift/Gain (контраст).

## Хэрэглэх алхам
1. Offset master-аар Waveform-ийн ерөнхий байрлал.
2. Дугуйгаар Parade-ийн R, G, B бүхэлд нь зэрэгцүүлэх.
3. Дараа нь Lift, Gain-аар хар, цагаан цэг.

> Offset хэт хөдөлгөвөл хар, цагаан хоёулаа тайрагдана — контраст биш, шилжилт л хийдэг гэдгийг санана.

Холбоотой: [[lift]], [[gamma]], [[gain]], [[color-wheels]].
`,

"link-group": `
## Зориулалт
Link Group (Fairlight) нь хэд хэдэн замыг **нэг бүлэг болгож**, фадер, Mute, Solo, Pan-ийг зэрэг удирдана. Хөгжмийн stems (бөмбөр, басс, гитар), олон микрофоны ярилцлага, орчны дууны замуудыг нэг дор өргөж, буулгах.

## Хэрэглэх алхам
1. Mixer дээр замуудын зурвасын нэр дээр [k:Ctrl] дарж сонгоно (эсвэл timeline-ийн замын толгой).
2. Баруун товч → **Link Group** (эсвэл Fairlight → Link Group).
3. Нэр, өнгө өгнө. Холбогдсон замын зурвас дээр тэмдэг гарна.
4. Нэг фадерыг чирэхэд бүгд харьцангуй хөдөлнө (зөрүү хадгалагдана).
5. Түр салгах — [k:Alt] дараад нэг фадер.
6. Unlink — баруун товч → Unlink Group.

## Бусад бүлэглэлт
- **VCA fader** — Bus Format → VCA: тусдаа "мастер" фадер, замуудыг оноох; Automation-той.
- **Sub bus** — замуудыг нэг шугамд, эффект нэг дор (Reverb, Compressor). [[main-bus]].
- **Groups** самбар (Interface Toolbar → Groups) — ADR, Foley-ийн бүлэг.

> Link Group фадерыг л холбоно, дууг нэг шугамд нийлүүлэхгүй — бүлгээр компрессор тавих бол Sub bus.
`,

"adr": `
## Зориулалт
ADR (Automated Dialogue Replacement, Fairlight → Interface Toolbar → ADR) нь **яриаг студид дахин бичих** самбар — авалтын үед муу бичигдсэн (шуугиан, зай) мөрийг жүжигчин дэлгэц харж, эх дууг сонсож, синкээр дахин хэлнэ. Cue (мөр) жагсаалт, бичлэг, авалт сонгох.

## Гурван таб
- **List** — cue жагсаалт: мөр бүрийн In/Out, дүр, бичвэр, төлөв (Done). Cue нэмэх — timeline-д In/Out тавьж **New Cue**; бичвэрийг бичнэ. Import/Export (CSV).
- **Record** — сонгосон cue: Pre-roll (өмнөх секунд), beep (3 дохио), бичлэгийн зам, микрофон, авалт (take) жагсаалт. ● бичих — timeline тоглогдож, дохионы дараа жүжигчин хэлнэ.
- **Setup** — Pre-roll, Post-roll, Beep, Record track, Guide track (эх яриа чихэвчинд), Cue Colors.

## Хэрэглэх алхам
1. Timeline дээр дахин бичих мөрд In/Out → ADR → List → New Cue; бичвэр, дүр.
2. Setup → Record track (шинэ зам), Guide track (эх дуу), Pre-roll 3 сек, Beep.
3. Record таб → cue сонгоод ● → жүжигчин хэлнэ → ■.
4. Хэд хэдэн take; take дээр товшиж сонсоно; хамгийн сайныг **Rate** / сонгоно. Layered Audio Editing-д авалтууд давхарлан.
5. Синк — Elastic Wave (клип дээр баруун товч) -ээр уруулд яг тааруулна.
6. AI Dialogue Matcher (Resolve 20) — ADR дууг эх орчинтой тааруулах. [[ai-dialogue-matcher]].

> ADR-ийн дуу "студийн" сонсогддог — Reverb, EQ-ээр эх орчинд оруулна; Ambience Match-аар орчны дуу нэмнэ.
`,

"tape": `
## Зориулалт
Tape (Deliver хуудас → Interface Toolbar → Tape) нь timeline-ийг **хальс, дек рүү** (SDI/HDMI гаралтаар) бичих горим — Edit to Tape. Blackmagic DeckLink/UltraStudio ба RS-422 удирдлагатай дек шаардана. Нэвтрүүлэгчид хальсаар хүлээлгэн өгөх, архив.

## Горим
- **Insert** — хальсны тодорхой In/Out-д (хальс урьдчилан хар код бичигдсэн байх).
- **Assemble** — хальсны цэгээс залгаж бичих.
- **Crash Record** — удирдлагагүй, шууд бичих (Capture Now-ийн эсрэг).
- Output — Video, Audio, Timecode; Preview.

## Хэрэглэх алхам
1. Preferences → Video and Audio I/O → Playback device; Project Settings → Capture and Playback → Output format.
2. Deliver → Tape.
3. Timeline-д In/Out (эсвэл бүхэлд нь); дек дээр In цэг.
4. Insert/Assemble сонгоод **Record** (эсвэл Edit to Tape).
5. Resolve timeline-ийг бодит цагт тоглуулж бичнэ (рендерлэхгүй; хүнд эффект тасалдвал эхлээд Render Cache).

> Ердийн файлын экспортод Tape шаардлагагүй; Render Settings. Tape нь SDI/HDMI гаралттай төхөөрөмжгүй бол идэвхгүй.

Холбоотой: [[capture]].
`,

"format": `
## Зориулалт
Render Settings → Video → **Format** нь гаралтын **файлын савны (container)** төрөл. Формат нь ямар кодек, дуу, мета, хадмал агуулж чадахыг тодорхойлно; Codec сонголт форматаас хамаарна.

## Түгээмэл формат
- **MP4** — H.264, H.265, AV1; AAC дуу. Вэб, утас, сошиал. Хамгийн нийцтэй.
- **QuickTime (MOV)** — ProRes, DNxHR, H.264/H.265, Uncompressed; PCM/AAC. Мастер, Apple, монтаж хооронд.
- **MXF OP1a / OP-Atom** — DNxHD/HR, XDCAM, AVC-Intra; нэвтрүүлэг, Avid.
- **AVI** — хуучин Windows; ховор.
- **DCP, IMF** — кино театр, стриминг мастер (Studio, Kakadu).
- **Зургийн дараалал** — TIFF, DPX, EXR, PNG, JPEG — VFX, кино лаборатори; кадар бүр файл.
- **Дуу** — WAV, MP3, AAC (Audio Only).
- **HEIF/HEIC** (Photo).

## Сонгох зарчим
- YouTube, утас → MP4 + H.264/H.265.
- Дахин монтажлах, өнгө, архив → MOV ProRes 422 HQ / MXF DNxHR HQX.
- VFX-д → EXR (32/16 бит, Alpha-тай).
- Захиалагчийн техникийн шаардлага давуу.

> Windows дээр ProRes экспорт зөвхөн Studio (сүүлийн хувилбарууд); DNxHR бүх платформд. Формат солиход Codec, Audio таб дахин шалгана — тохиргоо шинэчлэгдэнэ.

Холбоотой: [[codec]], [[render-settings]].
`,

"codec": `
## Зориулалт
Render Settings → Video → **Codec** нь видеог **хэрхэн шахахыг** (компрессор) сонгоно. Формат (сав) доторх кодек нь чанар, файлын хэмжээ, тоглуулах хөнгөн байдал, дахин засварлах чадварыг тодорхойлно.

## Кодекийн төрөл
- **Хүргэлтийн (delivery)** — жижиг файл, олон нийтэд: **H.264** (AVC; хамгийн нийцтэй), **H.265** (HEVC; 2 дахин жижиг, 10 бит, HDR; хуучин төхөөрөмжид тоглохгүй байж болно), **AV1** (шинэ, Studio, тодорхой GPU).
- **Монтажийн/мастер (intermediate)** — том файл, чанар алдагдахгүй бараг, хөнгөн тоглуулалт: **ProRes** (422 Proxy, LT, 422, 422 HQ, 4444, 4444 XQ), **DNxHR** (LB, SQ, HQ, HQX, 444), GoPro CineForm, **Uncompressed**.
- **Кино** — Kakadu JPEG 2000 (DCP/IMF).
- **Зураг** — EXR (PIZ, ZIP, DWAA), TIFF, DPX, PNG.

## Тохиргоо (H.264/H.265)
- **Encoder** — Auto / NVIDIA / Intel / AMD / Native. [[encoder]].
- **Quality** — Automatic (Best/High/Medium/Low) эсвэл **Restrict to** (Kb/s) — битийн урсгал. 4K H.265 YouTube 35–45 Mb/s; 1080p H.264 15–20 Mb/s.
- **Encoding Profile** — Main / High / Main10. [[encoding-profile]].
- **Key Frames** — [[key-frames-codec]].
- Rate Control — CBR/VBR (Native).
- **Network Optimization** — [[network-optimization]].

## Сонгох зарчим
- Вэб → H.265 (10 бит бол Main10) эсвэл H.264 High.
- Мастер → ProRes 422 HQ (macOS) / DNxHR HQX (Windows).
- Alpha (тунгалаг) → ProRes 4444, DNxHR 444, PNG, EXR.

> Кодек чанар тохиргоо (Quality) -оос хамаарна: H.265 5 Mb/s нь ProRes-ээс хол муу. "Кодек" биш "битийн урсгал" чанарыг тодорхойлно.

Холбоотой: [[format]].
`,

"encoder": `
## Зориулалт
Render Settings → Video → **Encoder** нь H.264/H.265/AV1 кодлолтыг **ямар төхөөрөмж** гүйцэтгэхийг сонгоно: GPU-ийн тусгай кодлогч эсвэл процессор (программ).

## Сонголт
- **Auto** — Resolve өөрөө (GPU байвал GPU).
- **NVIDIA** (NVENC) — NVIDIA видео карт. Хурдан.
- **Intel** (Quick Sync) — Intel процессорын дотоод график.
- **AMD** (AMF/VCE) — AMD видео карт.
- **Apple** (VideoToolbox) — macOS, Apple Silicon.
- **Native** — программын кодлогч (x264-тэй төстэй). Удаан, чанар/хэмжээний харьцаа бага зэрэг сайн, тохиргоо олон (Rate Control, Multi-pass).

## Зөвлөмж
- Ердийн ажилд GPU (NVIDIA/Intel/AMD) — 3–10 дахин хурдан, чанар ялгагдахгүй.
- Хамгийн жижиг файл/чанар харьцаа шаардлагатай (архив, хязгаартай битийн урсгал) — Native, Multi-pass.
- Preferences → System → Decode Options → GPU decode-ийг ч асаах (импорт, тоглуулалт хурдасна).

## Анхаарах
> GPU кодлогч бүх Encoding Profile, битийн гүнийг дэмждэггүй (хуучин NVIDIA — H.265 10-бит үгүй; зарим Intel — 4:2:2 үгүй). Сонголт саарал бол тэр төхөөрөмж дэмжихгүй — Native.

> Рендер "Failed" болбол Encoder-ийг Native болгож дахин турш — ихэвчлэн драйвер эсвэл GPU санах ойн асуудал.
`,

"network-optimization": `
## Зориулалт
Render Settings → Video → **Network Optimization** чагт нь MP4/MOV файлын **мета мэдээллийг (moov atom) файлын эхэнд** байрлуулна ("fast start"). Вэбээр стриминг хийхэд файл бүрэн татагдахаас өмнө тоглож эхэлнэ.

## Хэрэглээ
- YouTube, Vimeo, вэб хуудас, Frame.io, Dropbox-оор шууд тоглуулах файл — асаана.
- Орон нутагт, монтажид ашиглах файл — хамаагүй.

## Анхаарах
> Хэрэв унтраалттай бол мета файлын төгсгөлд — браузер бүхэлд нь татсаны дараа тоглоно. Хэмжээ, чанарт нөлөөгүй.

> YouTube зэрэг платформ файлыг дахин кодлодог тул заавал биш; харин өөрийн вэб серверт тавих файлд чухал.
`,

"vertical-video": `
## Зориулалт
Босоо (9:16) видео — TikTok, Instagram Reels, YouTube Shorts-д. Resolve-д timeline-ийн нягтралыг босоо (1080×1920) болгож, хэвтээ материалыг **дахин хүрээлж** (Smart Reframe эсвэл гараар), босоогоор экспортлоно.

## Хоёр арга
**1. Босоо timeline** (зөв арга):
1. Media Pool → timeline дээр баруун товч → Timelines → Duplicate Timeline (хэвтээ хувилбарыг хадгална).
2. Шинэ timeline → Timeline → Timeline Settings → Use Project Settings унтраа → Resolution **1080×1920** (эсвэл Project Settings → Timeline Resolution → Custom).
3. Клипүүд төвөөс тайрагдана. Inspector → Transform → Zoom/Position-оор хүрээлэлт, эсвэл **Smart Reframe** (Studio). [[smart-reframe]].
4. Гарчгийг босоод тааруулна.
5. Deliver → Resolution → Timeline Resolution (1080×1920) — автоматаар босоо.

**2. Deliver-д Use vertical resolution** чагт — Resolution-ийн W, H-ийг солино (1920×1080 → 1080×1920). Timeline хэвтээ бол дүрс сунах/тайрагдах — Advanced Settings → Scaling. Хурдан боловч хүрээлэлт удирдахгүй.

## Зөвлөмж
- 4K хэвтээ материал босоо 1080×1920-д чанар алдахгүй (1920 босоо пиксэл хүрэлцэнэ).
- Хэвтээ ба босоо хоёр хувилбарыг нэг төсөлд хоёр timeline-ээр.
- Босоо аюулгүй бүс — платформын UI (доод 20%, дээд 10%) гарчиг тавихгүй.

Холбоотой: [[resolution-render]], [[resolution]].
`,

"chapters-from-markers": `
## Зориулалт
Render Settings → Video → Advanced → **Chapters from Markers** нь timeline-ийн тэмдэглэгээг **бүлгийн (chapter) тэмдэг** болгож файлд (MP4, MOV) шингээнэ. Тоглуулагч, платформ (Vimeo, QuickTime Player, зарим ТВ) бүлгээр үсрэх боломж олгоно.

## Хэрэглэх алхам
1. Timeline дээр бүлэг эхлэх бүрд тэмдэглэгээ [k:M]; давхар товшиж **нэр** (бүлгийн нэр) бичнэ.
2. Бүлгийн тэмдэглэгээг тодорхой **өнгөөр** (жишээ нь цэнхэр) ялгана.
3. Deliver → Video → Advanced Settings → **Chapters from Markers** чагт → өнгө сонгоно (зөвхөн тэр өнгийн тэмдэглэгээ бүлэг болно).
4. Render. Файлыг QuickTime Player-т нээж бүлгийн цэсийг шалгана.

## YouTube-д
YouTube бүлгийг файлын метагаас биш, **тайлбар дахь цагийн жагсаалтаас** (00:00 Оршил, 02:15 …) уншина. Resolve → Edit Index → Markers → Export-оор жагсаалт гаргаж, тайлбарт хуулна.

> Тэмдэглэгээний нэр хоосон бол бүлэг нэргүй. Clip marker (клипийн дотоод) биш, **timeline marker** ашиглана.

Холбоотой: [[marker]].
`,

"encoding-profile": `
## Зориулалт
Render Settings → Video → **Encoding Profile** нь H.264/H.265 кодекийн **профайл** — ямар шахалтын хэрэглүүр, битийн гүн, өнгөний дээж зөвшөөрөгдөхийг заана. Нийцтэй байдал ба чанарын тэнцвэр.

## H.264
- **Baseline** — хуучин, хамгийн нийцтэй (хуучин утас, тоглуулагч); чанар/хэмжээ муу.
- **Main** — стандарт.
- **High** — хамгийн сайн шахалт, бүх орчин үеийн төхөөрөмж. Ердийн сонголт.
- (High 10, High 4:2:2 — зарим кодлогчид.)

## H.265 (HEVC)
- **Main** — 8 бит, 4:2:0.
- **Main10** — 10 бит; HDR, лог, өнгөний зурвас (banding) багатай; YouTube HDR-д шаардлагатай. Кодлогч (GPU) дэмжих ёстой.
- Main 4:2:2 10 — зарим Intel/Apple.

## Зөвлөмж
- YouTube SDR → H.264 High эсвэл H.265 Main.
- HDR, 10-бит материал → H.265 Main10.
- Хуучин төхөөрөмжид → H.264 Main.
- **Level** (хажууд) — Auto үлдээнэ (нягтрал, давтамжаас автоматаар).

> Профайл саарал бол сонгосон Encoder дэмжихгүй — Encoder-ийг өөрчилнө (Native бүгдийг дэмжинэ).

Холбоотой: [[codec]], [[encoder]].
`

});
