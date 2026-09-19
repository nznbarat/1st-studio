/* ═════════════════════════════════════════════════════════════
   Гарын авлагын дэлгэрэнгүй тайлбар · Fusion, Color, Fairlight, Workspace, Help цэс
   ═════════════════════════════════════════════════════════════ */
RM.dict.long({

/* ══════════ Fusion ══════════ */

"fusion-settings": `
## Зориулалт
Fusion → Fusion Settings нь **энэ компоузитын** тохиргоо: кадрын давтамж, нягтрал, Global In/Out, өнгөний гүн (8/16 бит, float), Motion Blur (Quality, Shutter Angle), Proxy, Frame Format. Ихэвчлэн timeline-ийн тохиргоог автоматаар авдаг; Fusion Composition-д гараар.

> Timeline дээрх клипийн Fusion нь Edit-ийн нягтралыг дагадаг; өөрчлөх шаардлага ховор. 3D, бөөмийн ажилд Motion Blur-ийг энд бүхэлд нь асааж болно.
`,

"reset-composition": `
## Зориулалт
Fusion → Reset Composition нь компоузитын **бүх нодыг устгаж**, зөвхөн MediaIn1 → MediaOut1 үлдээнэ. Эхнээс нь эхлэх, туршилтыг цэвэрлэх.

> Буцаах — Undo л. Хадгалахыг хүсвэл эхлээд нодуудыг сонгоод баруун товч → Macro / Copy, эсвэл Fusion → Export.
`,

"macro-editor": `
## Зориулалт
Fusion → Macro Editor нь сонгосон **хэд хэдэн нодыг нэг макро** (дахин ашиглах багц) болгож, аль параметрийг гадагш (Inspector-т) гаргахыг сонгох цонх. Өөрийн гарчиг, эффектийн загвар үүсгэж Effects Library-д нэмэх.

## Хэрэглэх алхам
1. Нодуудыг сонгоно → баруун товч → **Macro → Create Macro** (Macro Editor нээгдэнэ).
2. Нод бүрийн параметрүүдийн чагт — гадагш харагдах (жишээ нь Text, Color, Size).
3. Нэр → Close → Save. Файл Macros хавтсанд (.setting).
4. Effects Library → Fusion → Macros-аас дуудна. **Templates** хавтсанд (Edit/Titles, Transitions, Effects, Generators) хадгалбал Edit хуудасны Effects Library-д Fusion Title/Transition болж гарна.

> Макро нь нодуудыг "хайрцаглана"; засах бол нод дээр баруун товч → Edit Macro. Хамтрагчид .setting файлаар зөөнө.
`,

"import-fusion": `
## Зориулалт
Fusion → Import нь бэлэн **Fusion компоузит** (.comp — Fusion Studio), нодын багц (.setting), **Alembic/FBX** 3D загвар, USD зэргийг одоогийн урсгалд оруулна.

## Дэд цэс
- **Composition** — .comp файлын нодууд.
- **FBX / Alembic / USD** — 3D объект, камерын хөдөлгөөн (FBX Mesh 3D, Alembic Mesh 3D нод).
- **PSD** — Photoshop давхарга бүр нод.
- **SVG** — вектор хэлбэр (Text+/Shape).

> Fusion Studio-гийн .comp-д MediaIn байхгүй (Loader нодтой) — Resolve-д Loader-ыг MediaIn-ээр солино.
`,

"render-all-savers": `
## Зориулалт
Fusion → Render All Savers нь компоузит доторх бүх **Saver** нодыг (файл бичигч — EXR, PNG, MOV) ажиллуулж диск дээр файл бичнэ. Resolve-д ихэвчлэн MediaOut → timeline → Deliver ашигладаг; Saver нь Fusion Studio-гийн урсгал, эсвэл Fusion-оос шууд зургийн дараалал гаргахад.

## Хэрэглэх алхам
1. Нод → Saver (Effects Library → Fusion → I/O → Saver); Filename, Format.
2. Fusion → Render All Savers → Render Settings (муж, чанар) → Start.

> Saver нь timeline-д нөлөөгүй; MediaOut1 хэвээр байх ёстой. Alpha-тай PNG/EXR гаргахад тохиромжтой.
`,

/* ══════════ Color ══════════ */

"grade-version": `
## Зориулалт
Color → Grade Version (Local / Remote Versions) нь нэг клипт **хэд хэдэн засварын хувилбар** үүсгэж, хооронд солих дэд цэс: Create New Version, Load Version, Rename, Delete, Next/Previous Version. Захиалагчид хоёр хувилбар үзүүлэх, туршилт хадгалах.

## Local ба Remote
- **Local** — timeline-ийн тухайн клипт л.
- **Remote** — ижил эх клипийн (Media Pool) бүх хуулбарт нийтлэг (бүх timeline-д).
Клип дээр баруун товч → Local Versions / Remote Versions.

> Хувилбар солиход нодны мод бүхэлдээ солигдоно. Хувилбарын нэр Clips эгнээнд харагдана (тохиргоогоор).

Холбоотой: [[grade]].
`,

"still": `
## Зориулалт
Color → Still дэд цэс (мөн [k:Alt+G] тэмдэглэгдсэн) нь Gallery-ийн **хадгалсан кадартай** ажиллах командууд: **Grab Still** ([k:Ctrl+Alt+G]) — одоогийн кадрыг засвартай нь хадгалах; **Grab All Stills** — timeline-ийн бүх клипээс (эхний/дунд кадар); **Grab Missing Stills**; **Apply Grade**; Wipe-ийн командууд.

Дэлгэрэнгүй: [[gallery]], [[grade]].

> Alt+G товчлуур таны цэсний зурагт бичигдсэн; яг аль дэд команд (Grab Still эсвэл Still дэд цэс) гэдгийг Resolve дээрээ Color цэсээс шалгана уу.
`,

"apply-grade": `
## Зориулалт
Color → Apply Grade нь Gallery-д сонгосон Still-ийн **бүх засварыг** (нодны мод) одоогийн клипт хуулна — Still дээр дунд товч дарахтай ижил. Одоогийн нодууд солигдоно (дарна).

> Нэмж залгах бол Append Node Graph. [[append-node-graph]]. Олон клипт нэг дор — клипүүдийг сонгоод Apply Grade.
`,

"apply-active-layer": `
## Зориулалт
Color → Apply Active Layer нь Still-ийн засвараас **зөвхөн идэвхтэй (сонгосон) нодын/давхаргын** засварыг одоогийн клипийн сонгосон нодод хуулна — бүх модыг биш, нэг нодын тохиргоог. Нэг клипийн "Арьс" нодыг нөгөө клипийн ижил нодод.

> Нодоос нод руу шууд — эх нодыг [k:Alt] дараад зорилтот нод дээр чирэх (нод хуулах).
`,

"append-node-graph": `
## Зориулалт
Color → Append Node Graph нь Still (эсвэл хуулсан grade)-ийн нодуудыг одоогийн клипийн нодны модын **ард нэмж залгана** — байгаа засварыг дарахгүй. Ерөнхий тэнцвэрийг хийсэн клипт "Look"-ийн нодуудыг нэмэх.

> Timeline-ийн олон клипт нэг дор: клипүүдийг сонгоод Still дээр баруун товч → Append Node Graph.
`,

"step-timeline-wipe": `
## Зориулалт
Color → Step Timeline Wipe (Next/Previous) нь Viewer-ийн **Timeline Wipe** (одоогийн клипийг timeline-ийн өөр клиптэй хагасаар харьцуулах) горимд лавлагаа клипийг **клип клипээр алхуулна**. Дараалсан кадруудын өнгийг харьцуулж тааруулах.

## Хэрэглэх алхам
1. Viewer → Wipe горим → Timeline (Gallery-ийн Still биш, timeline-ийн клип).
2. Step Timeline Wipe Next/Previous — лавлагаа солино.
3. Wipe-ийн чиглэл, байрлал — Viewer-ийн дээд талын товч.
`,

"preview-memory": `
## Зориулалт
Color → Preview Memory [k:Alt+Shift+P] нь Memories-д (A–H үүр) хадгалсан засварыг **түр зуур** одоогийн клипт тавьж харуулна; товчийг суллахад (эсвэл дахин дарахад) буцна. Хуулахгүйгээр харьцуулах.

Холбоотой: [[memories]], [[original-memory]].
`,

"original-memory": `
## Зориулалт
Color → Original Memory [k:Alt+Shift+O] нь засвар ороогүй **эх дүрсийг түр** харуулна (бүх нод унтраасан мэт) — засварын өмнө/дараа харьцуулах. [k:Shift+D] (Bypass) -тэй төстэй, харин Memory-ийн механизмаар.

> Клипийн эх байдал руу бүрмөсөн буцаах бол Reset → All Grades and Nodes. [[reset]].
`,

"memories": `
## Зориулалт
Color → Memories нь засварыг **түр хадгалах A–H найман үүр** — Gallery-гүйгээр хурдан хадгалж, дуудах. Save Memory A–H / Load Memory A–H командууд, товчлуур (Alt/Alt+Shift + тоо; яг товчийг Color цэсээс харна).

## Хэрэглэх алхам
1. Клип дээр засвар → Color → Memories → Save Memory A.
2. Өөр клип → Load Memory A — засвар орно.
3. Preview Memory [k:Alt+Shift+P] — түр харах.

> Memories төслийн сессид (нээлттэй байх хугацаанд) хадгалагдана; удаан хадгалах бол Gallery Still. [[gallery]].
`,

"apply-grade-from-one-clip-prior": `
## Зориулалт
Color → Apply Grade from One Clip Prior [k:Shift+=] нь **нэг өмнөх клипийн** засварыг одоогийн клипт хуулна. Дараалсан ижил кадруудыг (нэг камер, нэг гэрэл) тэнцүүлэх хамгийн хурдан арга: клип бүр дээр [k:↓] → [k:Shift+=].

> Одоогийн нодууд солигдоно (дарна). Хоёр өмнөх — [k:Shift+-]. [[apply-grade-from-two-clips-prior]].
`,

"apply-grade-from-two-clips-prior": `
## Зориулалт
Color → Apply Grade from Two Clips Prior [k:Shift+-] нь **хоёр өмнөх клипийн** засварыг хуулна. Ярилцлагад А, Б өнцөг ээлжилдэг (A B A B): Б клип дээр хоёр өмнөх Б-ийн засварыг авна.
`,

"ripple-node-changes-to-selected-clips": `
## Зориулалт
Color → Ripple Node Changes to Selected Clips нь одоогийн клипийн **сонгосон нодод хийсэн өөрчлөлтийг** сонгосон бусад клипийн **ижил байрлалын нодод** тараана (бүх засварыг биш, нэг нодыг). Олон клипт ижил бүтэцтэй нод (жишээ нь 05 Вингет) байхад түүнийг нэг дор засах.

## Хэрэглэх алхам
1. Клипүүдийг Clips эгнээнд сонгоно (Ctrl+товшилт); одоогийн клип дээр нодыг засна.
2. Color → Ripple Node Changes to Selected Clips.

> Нодны дугаар/байрлал таарахгүй бол буруу нод руу орно — Shared Node ашиглах нь илүү найдвартай (нод дээр баруун товч → Save as Shared Node).
`,

"ripple-grade": `
## Зориулалт
Color → Ripple Grade (Ripple Grade Change) нь одоогийн клипийн **бүх засварыг** сонгосон бүх клипэд тараана — grade хуулахтай ижил, харин "өөрчлөлтийг" тараах дэд горимтой: Exact (яг ижил утга), Relative (харьцангуй), Absolute. Бүлэг клипийн засварыг нэг дор.

> Group (клипүүдийг Group-д оруулж Group Pre/Post-Clip нод) — олон клипт нийтлэг засварын илүү цэгцтэй арга.
`,

"append-node-to-selected-clips": `
## Зориулалт
Color → Append Node to Selected Clips нь сонгосон бүх клипийн нодны модын **ард шинэ (хоосон) нод** нэмнэ — дараа нь Shared Node эсвэл Ripple-ээр нэг дор засварлана. Бүх клипт нэг вингетийн нод үүсгэх.

> Timeline node (Node Editor → Timeline) нь бүх клипт нэг нод нэмэхээс илүү хялбар — бүх timeline-д нэг вингет, LUT.
`,

"active-playhead": `
## Зориулалт
Color → Active Playhead нь Color хуудасны Clips эгнээ/timeline-д **олон заагч** (Multiple Playheads — хэд хэдэн клипийг зэрэг харьцуулах) горимд аль заагчийг **идэвхтэй** (засварлагдах) болгохыг сонгоно.

> Multiple Playheads — Clips эгнээний ⋯ → Add Playhead; Viewer split screen-ээр харьцуулна. Ердийн ажилд нэг заагч.
`,

"resolve-live": `
## Зориулалт
Color → Resolve Live нь зураг авалтын талбайд камерын **SDI дохиог шууд** (DeckLink/UltraStudio) Color хуудсанд авч, бодит цагт өнгө засаж (look үзүүлэх), Still-ийг цагийн кодтой хадгалах горим. Оператор, найруулагчид гэрэлтүүлгийн үр дүнг засвартай харуулах.

> Studio; SDI оролтын төхөөрөмж шаардана. Хадгалсан Still-ийг дараа нь эх материалтай (цагийн кодоор) тааруулж засварт ашиглана.
`,

"printer-light": `
## Зориулалт
Color → Printer Lights [k:Ctrl+Alt+Grave] (Grave — Tab товчны дээрх ~ товч; асаах/унтраах) нь кино хальсны лабораторийн уламжлалт **printer light** нэгжээр Offset-ийг (R, G, B тусдаа, эсвэл Y) **алхмаар** нэмэх, хасах: нэг алхам = 1/12 stop (тохируулж болно). Хуучин колористуудын ажлын арга; тоон товчлуурын гар (numpad) -аар хурдан.

## Хэрэглэх алхам
1. [k:Ctrl+Alt+Grave] — Printer Lights горим асаана (numpad-ийн товчнууд тэр горимд).
2. Numpad: 7/4 — Red +/−, 8/5 — Green, 9/6 — Blue, +/− — Master (бүх сувагт). (Цэсэнд яг товчнуудыг харна.)
3. Дуусаад дахин [k:Ctrl+Alt+Grave].

> Утга Offset дугуйд тусна. Preferences → User → Color → Printer light step (1/12, 1/6…). Дараалсан кадруудыг "нэг гэрлээр" тэгшлэхэд тоон гараар хурдан.
`,

"multimaster-trim-manager": `
## Зориулалт
Color → MultiMaster Trim Manager нь нэг мастер засвараас **SDR, HDR (Rec.709, HDR10, Dolby Vision, HDR Vivid) олон гаралтын хувилбарыг** нэг дор удирдах цонх (Studio, Resolve 20-иос) — хувилбар бүрд trim (нарийвчилсан засвар), мета, экспортын тохиргоо.

> HDR мастер ажилд; ердийн SDR ажилд шаардлагагүй. Нарийн урсгалыг албан ёсны гарын авлагын HDR бүлгээс.

Холбоотой: [[dolby-vision]], [[hdr10-plus]].
`,

"hdr10-plus": `
## Зориулалт
HDR10+ нь Samsung, Amazon-ы санаачилсан **динамик мета** (үзэгдэл бүрийн гэрлийн мэдээлэл) дамжуулдаг HDR стандарт — Dolby Vision-ийн нээлттэй (лицензгүй) өрсөлдөгч. Color → HDR10+ дэд цэс: Analyze (мета тооцоолох), Export metadata (JSON), Trim.

## Ажлын урсгал (Studio)
1. Project Settings → Color Management → HDR10+ асаана.
2. HDR timeline (PQ, Rec.2100) дээр засна.
3. Color → HDR10+ → Analyze All Shots.
4. Deliver → HDR10+ мета JSON, эсвэл MP4/MOV-д шингээх.

> HDR10 (статик мета — MaxCLL, MaxFALL) нь HDR10+-аас ялгаатай; YouTube HDR-д HDR10 хангалттай.
`,

"hdr-vivid": `
## Зориулалт
HDR Vivid нь Хятадын **UWA (UHD World Association)** -ийн динамик мета бүхий HDR стандарт (GY/T 358). Color → HDR Vivid дэд цэс: Analyze, мета экспорт. Хятадын стриминг, ТВ-д хүлээлгэн өгөх ажилд.

> Монголын ердийн ажилд шаардлагагүй; Dolby Vision, HDR10+ -тай ижил зарчим. [[dolby-vision]].
`,

"amf": `
## Зориулалт
AMF (ACES Metadata File) нь **ACES** (Academy Color Encoding System) өнгөний удирдлагын тохиргоог (Input Transform, Look, Output Transform, ACES хувилбар) программ хооронд дамжуулах **стандарт XML файл**. Color → AMF: Import (клипт хэрэглэх), Export (одоогийн ACES тохиргоог гаргах).

## Хэрэглээ
- ACES төсөлд VFX студи, өөр колористтой ижил өнгөний хөрвүүлэлт хуваалцах.
- Project Settings → Color Management → Color science → ACEScct/ACEScc — ACES горимд л утгатай.

> DaVinci YRGB (энгийн) төсөлд AMF хамаагүй. ACES-ийн ойлголтыг албан ёсны гарын авлагын ACES бүлгээс.
`,

/* ══════════ Fairlight ══════════ */

"bus-format": `
## Зориулалт
Fairlight → Bus Format нь дууны **шугамуудыг** (Main, Sub, Aux, VCA) үүсгэх, нэрлэх, сувгийн бүтэц (Mono, Stereo, 5.1, 7.1, Atmos) тохируулах цонх. Stems (яриа/хөгжим/эффект), 5.1 холилт, олон Main (стерео + 5.1) бэлдэх.

## Хэрэглэх алхам
1. Fairlight → Bus Format → **+ Add Bus** → Type (Main/Sub/Aux/VCA), Format (Stereo/5.1), Name (DX, MX, FX).
2. OK. Mixer-ийн баруун захад шинэ шугамын зурвас.
3. Fairlight → Bus Assign — замуудыг шугамд оноох. [[bus-assign]].
4. Deliver → Audio → Output Track — аль шугамыг экспортлох.

Холбоотой: [[main-bus]].
`,

"bus-assign": `
## Зориулалт
Fairlight → Bus Assign нь зам бүр **аль шугам (Bus) руу** дуугаа илгээхийг хүснэгтээр тохируулна: мөр — зам, багана — шугам; чагтаар. Sub bus (DX, MX, FX) → Main 1 гэсэн урсгал.

## Хэрэглэх алхам
1. Fairlight → Bus Assign.
2. Зам бүрийн мөрөнд шугамын чагт (нэг зам олон шугамд ч болно).
3. Sub bus-ийг Main руу оноох (Sub → Main 1).
4. OK.

> Шугамд оноогдоогүй зам сонсогдохгүй, экспортод орохгүй. Mixer-ийн зурвасын Bus хэсэгт ч ганц ганцаар онооно.
`,

"presets-library": `
## Зориулалт
Fairlight → Presets Library нь **эффект, EQ, Dynamics, зам, шугамын хадгалсан тохиргоонуудын** сан — нэг замын EQ+Compressor-ыг preset болгож бусад төсөлд дуудна. Ярианы стандарт боловсруулалтын гинжийг хадгалах.

## Хэрэглээ
- Замын зурвас дээр баруун товч → Save Track Preset / Load.
- Эффектийн цонхонд Preset унадаг цэс → Save.
- Presets Library-д нэр, бүлэг, устгах.
`,

"vca-assign": `
## Зориулалт
Fairlight → VCA Assign нь замуудыг **VCA fader** (Bus Format-д үүсгэсэн) -д онооно. VCA нь дууг дамжуулдаггүй, зөвхөн оноосон замуудын фадерыг **зэрэг удирддаг** мастер фадер — замын өөрийн фадер хэвээр, харьцаа хадгалагдана; Automation-той.

## Link Group-тэй ялгаа
- **Link Group** — замын фадеруудыг холбоно; нэгийг чирэхэд бусад хөдөлнө. [[link-group]].
- **VCA** — тусдаа фадер; замууд хөдлөхгүй, нийт түвшин өөрчлөгдөнө; Automation бичиж болно. Том холилтод (олон хөгжмийн зам) VCA цэгцтэй.
- **Sub bus** — дууг нийлүүлж эффект нэг дор. [[main-bus]].
`,

"test-tones": `
## Зориулалт
Fairlight → Test Tones нь чанга яригч, хэмжүүр, гадаад төхөөрөмжийг тохируулах **стандарт сорилын дохио** (1 kHz sine −20 dBFS, pink noise, white noise, sweep) үүсгэж Main/шугамд гаргана. Хяналтын түвшин калибрлах (SPL хэмжүүрээр 79–85 dB), сувгийн холболт шалгах (L/R солигдсон эсэх).

> Timeline-д сорилын дуу оруулах бол Effects Library → Generators (Fairlight) → Test Tone.
`,

"synchronization-settings": `
## Зориулалт
Fairlight → Synchronization Settings нь гадаад төхөөрөмжтэй (дек, DAW, Pro Tools, гадаад цагийн код) **цагийн код, дуугаар синк** хийх тохиргоо: LTC/MTC оролт, Word Clock, Sync source, offset. Студийн олон төхөөрөмжийн орчинд.

> Ганц компьютерийн ажилд хөндөх шаардлагагүй. Дууны төхөөрөмжийн sample rate (48 kHz) төслийнхтэй таарахгүй бол энд биш Preferences → Video and Audio I/O.
`,

"input-monitor-style": `
## Зориулалт
Fairlight → Input Monitor Style нь бичлэгийн үед **оролтын дууг хэрхэн сонсохыг** заана:
- **Input** — үргэлж оролт (микрофон).
- **Auto** — Record Arm асаалттай, тоглуулж байхад timeline, зогссон/бичиж байхад оролт.
- **Record** — зөвхөн бичиж байхад оролт.
- **Mute** — оролт сонсохгүй.
- **Repro** — timeline (бичсэн дуу) л.

> Микрофон чихэвчинд сонсогдож "эргэлт" (feedback) үүсэх бол Mute/Repro; ADR-д Auto тохиромжтой.
`,

"exclusive-solo": `
## Зориулалт
Fairlight → Exclusive Solo нь Solo-гийн горим: асаалттай үед нэг замыг Solo хийхэд **бусад бүх Solo автоматаар унтарна** (нэг л зам Solo). Унтраалттай — олон зам зэрэг Solo. Замуудыг ээлжлэн ганцаарчлан шалгахад асаана.

Холбоотой: [[solo]].
`,

"immersive-audio": `
## Зориулалт
Fairlight → Immersive Audio нь **Dolby Atmos**, Auro-3D, MPEG-H, SMPTE ST 2098 зэрэг гурван хэмжээст (дээд чанга яригчтай, объектод суурилсан) дууны форматын тохиргоо — Atmos Renderer, bed/object, экспорт. Studio; кино театр, стриминг мастерт.

> Ердийн стерео, 5.1 ажилд шаардлагагүй. Atmos холилтод Dolby Atmos Renderer, 7.1.4 монитор шаардана — албан ёсны гарын авлагын Immersive Audio бүлэг.
`,

"batch-fade": `
## Зориулалт
Fairlight → Batch Fade (эсвэл клип дээр баруун товч) нь сонгосон **олон клипт нэг дор fade in/out** тавина — урт (кадар/мс), муруй (Linear, Log, Exp, S). Ярианы бүх клипт 2 кадрын fade — тас чимээг арилгах стандарт алхам.

## Хэрэглэх алхам
1. Timeline дээр дууны клипүүдийг сонгоно ([k:Ctrl+A] дуу зам дээр).
2. Batch Fade → Fade In 2 кадар, Fade Out 2 кадар → Apply.
`,

"view-clip-info-display": `
## Зориулалт
Fairlight → View Clip Info Display нь timeline-ийн дууны клип дээр **ямар мэдээлэл** бичигдэхийг сонгоно: клипийн нэр, файлын нэр, эхлэх цагийн код, урт, зам… Олон авалт, ADR-д авалтын нэрийг харах.
`,

"show-clip-gain-line": `
## Зориулалт
Fairlight → Show Clip Gain Line нь дууны клип дээр **түвшний шугамыг** (clip gain) харуулж, хулганаар чирж өөрчлөх, [k:Alt] товшиж түлхүүр кадар нэмэх боломж олгоно. Edit хуудасны клипийн Volume шугамтай ижил.

> Шугам харагдахгүй бол энэ тохиргоо унтраалттай, эсвэл замын өндөр хэт бага. Түвшинг тоогоор — Inspector → Volume.

Холбоотой: [[fader]], [[waveform-editing]].
`,

/* ══════════ Workspace ══════════ */

"switch-to-page": `
## Зориулалт
Workspace → Switch to Page дэд цэс нь **найман хуудас** руу шилжинэ: Media [k:Shift+2], Cut [k:Shift+3], Edit [k:Shift+4], Fusion [k:Shift+5], Color [k:Shift+6], Fairlight [k:Shift+7], Deliver [k:Shift+8], Photo (Resolve 21). Хуудасны мөр нуугдсан үед цэсээр.

> Толины богино тайлбарт "долоон" гэж байсныг Photo хуудас нэмэгдсэнтэй уялдуулан "найман" болгосон. Photo-гийн товчлуурыг Keyboard Customization-оос шалгана.

Холбоотой: [[page-bar]].
`,

"show-page": `
## Зориулалт
Workspace → Show Page нь хуудасны мөрөнд **аль хуудсыг харуулахыг** чагтаар сонгоно — хэрэглэдэггүй хуудсыг (Fairlight, Photo) нууж мөрийг цэвэрлэх. Нуусан хуудас руу Shift+тоо-гоор ч орохгүй байж болно.

> Хуудас "алга болсон" бол энд чагт байгаа эсэхийг шалгана.
`,

"show-page-navigation": `
## Зориулалт
Workspace → Show Page Navigation нь программын доод **хуудасны мөрийг** нуух/гаргах. Нуухад дэлгэцийн доод хэсэг timeline-д. Хуудас солих — Shift+тоо.

Холбоотой: [[page-bar]].
`,

"show-panel-in-workspace": `
## Зориулалт
Workspace → Show Panel in Workspace нь тухайн хуудасны **самбаруудыг** (Media Pool, Effects, Index, Inspector, Mixer, Metadata…) цэсээр нээж хаана — Interface Toolbar-ийн товчнуудтай ижил, товчлуур оноож болно.

Холбоотой: [[panel-toggle]], [[interface-toolbar]].
`,

"active-panel-selection": `
## Зориулалт
Workspace → Active Panel Selection нь гарны товчлуур **аль самбарт үйлчлэхийг** (Media Pool, Timeline, Viewer…) заана — жишээ нь Ctrl+A Media Pool-д эсвэл timeline-д. Хулганаар самбар дээр товшиход автоматаар идэвхжинэ; цэсээр гарнаас.
`,

"media-pool-windows": `
## Зориулалт
Workspace → Media Pool Windows нь Media Pool-ыг (эсвэл тодорхой санг) **тусдаа хөвөгч цонх** болгож нээнэ — хоёр дахь монитор дээр, эсвэл хоёр санг зэрэгцүүлж харах. Цонх бүр өөрийн сан, харагдацтай.
`,

"dual-screen": `
## Зориулалт
Workspace → Dual Screen → On нь **хоёр монитор** дээр ажиллах горим: хуудас бүрд хоёр дахь дэлгэцэнд томоор гаргах зүйл өөр (Edit — timeline эсвэл Media Pool/Viewer; Color — Gallery+Scopes+Viewer; Fairlight — Mixer). Dual Screen → Layout — хоёр дахь дэлгэцийн агуулга.

> Preferences → System → General → Primary display — аль монитор үндсэн. Workspace → Primary Display — солих.
`,

"viewer-mode-workspace": `
## Зориулалт
Workspace → Viewer Mode нь дэлгэцийн горим: Source/Timeline, Single Viewer, Offline, Cinema Viewer, Enhanced Viewer, Full Screen Viewer. Дэлгэрэнгүй: [[viewer-mode]].
`,

"single-viewer-mode": `
## Зориулалт
Workspace → Viewer Mode → Single Viewer Mode нь Edit хуудсанд **нэг дэлгэц** — Source ба Timeline-ийг [k:Q]-ээр ээлжлэн харуулна. Жижиг (зөөврийн) дэлгэцэнд timeline-д зай гаргах.

> Энэ загвар Resolve-ийн анхны хос дэлгэцийн горимыг харуулж байгаа; таны Resolve-д ганц дэлгэц харагдаж байвал энэ горим асаалттай.

Холбоотой: [[viewer-mode]], [[source-timeline-viewer]].
`,

"layout-presets": `
## Зориулалт
Workspace → Layout Presets нь самбаруудын **байрлал, хэмжээг нэрлэж хадгалаад** (Save Layout as Preset) дараа нь дуудна (Load Preset). "Монтаж", "Өнгө", "Илтгэл" зэрэг зохион байгуулалт; хуудас бүрд тусдаа. Import/Export — өөр компьютер руу.

> Preset дуудахад Interface Toolbar-ийн самбарын төлөв, хэмжээ буцна. Эвдэрсэн байрлалд Reset UI Layout. [[reset-ui-layout]].
`,

"reset-ui-layout": `
## Зориулалт
Workspace → Reset UI Layout нь тухайн хуудасны самбаруудыг **үйлдвэрийн анхны байрлал, хэмжээнд** буцаана. Самбар "алга болсон", хэт жижиг, хоёр дахь дэлгэц салсны дараа цонх харагдахгүй үед — эхний шийдэл.

> Тохиргоо (Preferences), төсөл өөрчлөгдөхгүй; зөвхөн харагдац. Layout Preset хадгалсан бол буцааж дуудна.
`,

"data-burn-in": `
## Зориулалт
Workspace → Data Burn-In нь дүрсэн дээр **цагийн код, клипийн нэр, файлын нэр, reel, тэмдэглэл, лого, тайлбар** зэргийг хэвлэх (burn-in) тохиргоо. Захиалагчид үзүүлэх хувилбарт (цагийн кодоор сэтгэгдэл авах), "ХУВИЛБАР — ТАРААХГҮЙ" усан тэмдэг, dailies.

## Хэрэглэх алхам
1. Workspace → Data Burn-In → Project (бүх timeline) / Timeline (энэ).
2. Чагт: Record Timecode, Source Timecode, Clip Name, Custom Text 1, Logo…
3. Байрлал, фонт, хэмжээ, өнгө, дэвсгэр, Opacity.
4. Дэлгэцэнд шууд харагдана; Deliver-д рендерт орно (Render Settings → Advanced → Data Burn-In чагт).

> Эцсийн файлд орохгүй байхын тулд рендерийн өмнө унтраах эсвэл Deliver-ийн чагтыг шалгана.
`,

"keyword-manager": `
## Зориулалт
Workspace → Keyword Manager нь төслийн **бүх түлхүүр үгийг** нэг цонхонд: нэр солих (бүх клипт тусна), нэгтгэх (ижил утгатай хоёр үгийг), устгах, хэдэн клипт хэрэглэгдсэн. Олон хүн бичсэн зөрүүтэй үгсийг ("дрон", "Дрон", "drone") нэгтгэх.

Холбоотой: [[keyword]], [[favorite-keywords]].
`,

"manage-faces": `
## Зориулалт
Workspace → Manage Faces (Studio) нь DaVinci Neural Engine-ээр **танисан царайнуудыг** нэрлэж, нэгтгэж, эмхлэх цонх. Media Pool → клипүүд → баруун товч → Analyze Clips for People хийсний дараа "People" Smart Bin-үүд царай бүрээр үүснэ; энд нэр өгвөл Smart Bin нэртэй болно.

> Preferences → User → Editing → Smart Bins → People асаалттай байх. Олон ярилцлагатай төсөлд хүнээр хайхад.
`,

"timecode-window": `
## Зориулалт
Workspace → Timecode Window нь заагчийн **цагийн кодыг том хэмжээтэй тусдаа цонхонд** харуулна (хэмжээ өөрчилж болно). ADR, дууны бичлэг, хоёр дахь дэлгэц, хажуугийн хүнд харуулах.
`,

"remote-grading": `
## Зориулалт
Workspace → Remote Grading [k:Ctrl+G] нь интернэтээр **өөр байршлын Resolve-тэй** холбогдож, колорист засвар хийхэд захиалагчийн (ижил медиатай) Resolve дээр бодит цагт тусгагдах горим. Хоёр тал ижил төсөл, медиатай; нэг нь сервер, нөгөө нь клиент.

## Ctrl+G дарахад гарах цонх — "Remote Grading Client"
- **Remote Machine** — холбогдох нөгөө компьютерийн IP хаяг эсвэл нэр.
- **Port** — 15000 (анхны утга; нөгөө талын Resolve ижил портоор хүлээж авна).
- **Disconnected / Connected** — холболтын төлөв.
- **Connect** — холбогдох; **Cancel** — хаах.
Санамсаргүй дарсан бол **Cancel** — юу ч өөрчлөгдөхгүй.

## Хэрхэн ажилладаг
1. Хоёр компьютерт ижил төсөл (Export/Import .drp), ижил медиа (ижил зам эсвэл Path Mapping).
2. Захиалагчийн тал (сервер) — Resolve нээгээд Project Settings → General Options → Remote Grading server-ийг зөвшөөрнө; сүлжээний 15000 портыг нээнэ.
3. Колористын тал — [k:Ctrl+G] → Remote Machine-д серверийн IP → Connect.
4. Колористын засвар бүр (нод, дугуй, маск) нөгөө талд шууд тусна; захиалагч өөрийн мониторт харна.

> Studio; сүлжээний тохиргоо (порт нээх, VPN) шаардана. Ердийн хамтын ажиллагаанд Blackmagic Cloud Presentations, Remote Monitoring эсвэл Frame.io илүү хялбар. [[remote-monitoring]].
`,

"remote-monitoring": `
## Зориулалт
Workspace → Remote Monitoring (Studio) нь дэлгэцийн дүрсийг **интернэтээр стриминг** хийж, өөр газрын хүн (захиалагч, найруулагч) DaVinci Remote Monitor апп (iPad, Mac, Windows) -аар бодит цагт үзэх горим. Blackmagic ID-аар холбогдоно, чанар HEVC 10-бит хүртэл.

> Хоёр тал Blackmagic Cloud данстай; Preferences → Remote Monitoring. Тоглуулалтыг колорист удирдана, үзэгч зөвхөн харна.
`,

"remote-rendering": `
## Зориулалт
Workspace → Remote Rendering (Studio) нь Render Queue-ийн ажлыг **сүлжээний өөр компьютер** (Resolve суулгасан, ижил төслийн сан, ижил медиа зам) дээр гүйцэтгүүлнэ — өөрийн компьютер чөлөөтэй үлдэнэ. Render Queue → ажил дээр баруун товч → Remote Render → компьютер сонгоно.

> Хоёр компьютер сүлжээний (PostgreSQL) төслийн санд, медиа ижил замаар (эсвэл Path Mapping). Ганц компьютерт хамаагүй.
`,

"monitor-calibration": `
## Зориулалт
Workspace → Monitor Calibration нь мэргэжлийн лавлагаа мониторыг **калибрлах** (Light Illusion ColourSpace, Calman зэрэг программтай холбогдож, Resolve-оос сорилын өнгөт зурвас гаргах) хэрэглүүр. Калибрлалтын LUT-ийг Project Settings → Color Management → 3D LUT → Monitor LUT-д.

> Ердийн компьютерийн дэлгэцийг Windows/macOS-ийн калибрлалтаар; Resolve-ийн энэ цэс тусгай төхөөрөмжтэй (DeckLink + гадаад монитор) урсгалд.
`,

"console": `
## Зориулалт
Workspace → Console [k:F6] нь Resolve-ийн **скриптийн консол** — Lua эсвэл Python код шууд бичиж, Resolve-ийн API (Resolve, ProjectManager, Project, MediaPool, Timeline объект) -г туршина. Автоматжуулалт хөгжүүлэх, тохиргоо унших.

## Жишээ (Lua)
resolve = Resolve(); pm = resolve:GetProjectManager(); p = pm:GetCurrentProject(); print(p:GetName())

> Гадны программаас (өөр Python процесс) холбогдох боломж — Preferences → System → General → External scripting using → Local/Network (Studio). Консол өөрөө үнэгүй хувилбарт ч ажиллана.

Холбоотой: [[scripting]].
`,

"scripting": `
## Зориулалт
Workspace → Scripting нь Resolve-ийг **Python эсвэл Lua** скриптээр удирдах боломж: Scripts дэд цэсээс суулгасан скриптүүд (Utility, Edit, Color, Comp хавтас), Console. Дахин давтагдах ажлыг (олон timeline экспорт, нэр солих, маркераас хадмал) автоматжуулах.

## Скрипт хаана
Windows: C:/ProgramData/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/… (Utility, Edit, Color, Deliver, Comp). Тэнд .py/.lua файл хуулбал Workspace → Scripts-т гарна.

## Гадны программаас
Preferences → System → General → **External scripting using** → Local (Studio) — DaVinciResolveScript модулиар өөр Python процессоос холбогдоно. Үнэгүй хувилбарт зөвхөн Resolve доторх скрипт.

> API нь UI-г (цэс, tooltip) удирддаггүй — төсөл, timeline, клип, рендерийг л. Интерфейсийг өөрчлөх (монголчлох) боломж API-д байхгүй.

Холбоотой: [[console]], [[workflow-integrations]].
`,

"workflow-integrations": `
## Зориулалт
Workspace → Workflow Integrations (Studio) нь гуравдагч талын **нэмэлт цонхнуудыг** (Workflow Integration Plugins — HTML/JS дээр суурилсан, Resolve-ийн API-тай) нээнэ: ShotGrid, ftrack, өөрийн бүтээсэн самбар. Resolve дотор вэб цонх мэт ажиллана.

## Суулгах
Windows: C:/ProgramData/Blackmagic Design/DaVinci Resolve/Support/Workflow Integration Plugins/<com.company.plugin>/ хавтаст manifest.xml + index.html. Resolve дахин нээхэд цэсэнд гарна.

> Энэ бол Resolve-ийн дотор монгол толь бичгийг цонх болгож нээх бодит арга (толийг plugin болгож). API нь UI-г уншдаггүй тул "товшсон элементийн тайлбар" биш, хажуугийн хайлтын цонх хэлбэрээр.

Холбоотой: [[scripting]].
`,

/* ══════════ Help ══════════ */

"davinci-resolve-reference-manual": `
## Зориулалт
Help → DaVinci Resolve Reference Manual нь Blackmagic-ийн **албан ёсны бүрэн гарын авлагыг** (PDF, 4000+ хуудас, англи) нээнэ. Энэ монгол толины эх сурвалж; нарийн параметр, ховор боломжийг тэндээс. Хувилбар бүрд шинэчлэгддэг.

> Blackmagic-ийн вэб (Support → DaVinci Resolve) -ээс мөн татна. Хайлт — PDF-ийн Ctrl+F; бүлгүүд хуудсаар (Edit, Fusion, Color, Fairlight, Deliver).
`,

"davinci-resolve-training": `
## Зориулалт
Help → DaVinci Resolve Training нь Blackmagic-ийн **үнэгүй сургалтын** хуудас — "The Beginner's Guide to DaVinci Resolve", "Colorist Guide", "Fairlight Guide", "Fusion Guide" номууд (PDF, англи), дасгалын медиа, видео хичээл, албан ёсны гэрчилгээний шалгалт.

> Номууд дасгалын файлтай — хичээл бүрийг Resolve дээр давтаж хийх. Энэ загвар (Resolve дотор) тэдгээртэй зэрэгцүүлж ашиглахад зориулагдсан.
`,

"davinci-control-panels-setup": `
## Зориулалт
Help → DaVinci Control Panels Setup нь Blackmagic-ийн **физик өнгө засварын самбар** (Micro Panel, Mini Panel, Advanced Panel, Micro Color Panel), Speed Editor, Editor Keyboard-ыг холбож, драйвер, шинэчлэлт, сүлжээний тохиргоо хийх программыг нээнэ.

> Самбар танигдахгүй бол энэ программаас Firmware шинэчлэх; USB/Ethernet холболт. Самбаргүй бол хамаагүй.
`,

"welcome-to-davinci-resolve": `
## Зориулалт
Help → Welcome to DaVinci Resolve нь программыг анх нээхэд гардаг **танилцуулах цонх** — шинэ боломжууд, сургалтын холбоос, хурдан эхлэх заавар. Дахин үзэхэд.
`,

"create-diagnostics-log-on-desktop": `
## Зориулалт
Help → Create Diagnostics Log on Desktop нь Resolve-ийн **бүртгэлийн файлууд** (log), системийн мэдээлэл, GPU, драйвер, төслийн сангийн төлөвийг нэг архив (.zip) болгож ширээн дээр үүсгэнэ. Blackmagic-ийн техникийн дэмжлэг, форумд асуудал мэдэгдэхэд хавсаргана.

> Резolve унтарч байгаа, рендер алдаа, GPU алдааг мэдээлэхэд заавал. Хувийн медиа файл орохгүй; төслийн нэр, зам орно.
`,

"deactivate-license": `
## Зориулалт
Help → Deactivate License нь **Studio лицензийг энэ компьютерээс салгана** (Blackmagic-ийн сервертэй холбогдож). Лиценз түлхүүр хязгаартай тооны компьютерт (ихэвчлэн 2) идэвхжих тул шинэ компьютер руу шилжих, компьютер солих, Windows дахин суулгахын **өмнө** заавал.

## Хэрэглэх алхам
1. Интернэт холболттой байх.
2. Help → Deactivate License → баталгаажуулна. Resolve үнэгүй хувилбар болно.
3. Шинэ компьютер дээр Resolve Studio суулгаад лицензийн түлхүүрээр идэвхжүүлнэ (Activate).

> Салгахгүйгээр компьютер эвдэрвэл идэвхжүүлэлтийн тоо дуусч болно — Blackmagic-ийн дэмжлэгтэй холбогдож сэргээнэ. USB dongle лицензэд энэ шаардлагагүй (dongle-оо зөөнө).

Холбоотой: [[davinci-resolve-studio]].
`

});
