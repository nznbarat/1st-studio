/* ═════════════════════════════════════════════════════════════
   Гарын авлагын дэлгэрэнгүй тайлбар · Mark, View, Playback цэсний командууд
   ═════════════════════════════════════════════════════════════ */
RM.dict.long({

/* ══════════ Mark ══════════ */

"mark-in": `
## Зориулалт
Mark → Mark In [k:I] нь идэвхтэй дэлгэцэд (Source эсвэл Timeline) заагчийн байрлалд **In цэг** тавина. Дэлгэрэнгүй: [[in-point]].

> Source Viewer идэвхтэй — эх клипт; Timeline Viewer идэвхтэй — timeline-д. [k:Q]-ээр солино.
`,

"mark-out": `
## Зориулалт
Mark → Mark Out [k:O] нь заагчийн байрлалд **Out цэг** тавина (Out кадар оролцоно). Дэлгэрэнгүй: [[out-point]].
`,

"mark-video-in": `
## Зориулалт
Mark → Mark Video In [k:Alt+Shift+I] нь эх клипт **зөвхөн видеоны** In цэг тавина — дууны In тусдаа. Видео, дуу өөр цэгээс эхлэх (J-cut, L-cut) хэсгийг нэг дор timeline-д оруулахад: видео In/Out, дуу In/Out тусдаа тавьж Insert.

> Дэлгэцийн Jog Bar дээр видео, дууны тэмдэг тусдаа өнгөөр харагдана. Арилгах — Clear Video In and Out [k:Alt+Shift+X].
`,

"mark-video-out": `
## Зориулалт
Mark → Mark Video Out [k:Alt+Shift+O] нь эх клипт **зөвхөн видеоны** Out цэг тавина. Mark Video In-тэй хамт split edit (дуу зургаас урт) оруулахад.
`,

"mark-audio-in": `
## Зориулалт
Mark → Mark Audio In [k:Ctrl+Alt+I] нь эх клипт **зөвхөн дууны** In цэг тавина. Дуу зургаас өмнө эхлэх J-cut: дууны In-ийг видеоны In-ээс өмнө тавиад Insert.

> Видео In тавиагүй бол видео дууны In-тэй ижил. Арилгах — Clear Audio In and Out [k:Ctrl+Alt+X].
`,

"mark-audio-out": `
## Зориулалт
Mark → Mark Audio Out [k:Ctrl+Alt+O] нь эх клипт **зөвхөн дууны** Out цэг тавина. Дуу зургаас хойш дуусах L-cut.
`,

"convert-in-and-out-to-duration-marker": `
## Зориулалт
Mark → Convert In and Out to Duration Marker нь timeline-д тэмдэглэсэн **In/Out мужийг урттай тэмдэглэгээ** болгож хувиргана — мужийг тэмдэглэгээ мэт хадгалж, дараа нь буцааж In/Out тавьж болно (Set In and Out from Duration Marker). Захиалагчид "энэ хэсэг" гэж тэмдэглэх, рендерийн мужийг хадгалах.

> Тэмдэглэгээний нэр, өнгө, тайлбар — давхар товшиж. Edit Index → Markers-т урттай тэмдэглэгээ Duration баганатай.
`,

"set-in-and-out-from-duration-marker": `
## Зориулалт
Mark → Set In and Out from Duration Marker нь заагчийн доорх (эсвэл сонгосон) **урттай тэмдэглэгээнээс In/Out цэг** үүсгэнэ. Хадгалсан мужийг рендерлэх (Deliver → In/Out Range), устгах, хуулахад.

Холбоотой: [[convert-in-and-out-to-duration-marker]], [[marker]].
`,

"clear-in": `
## Зориулалт
Mark → Clear In [k:Alt+I] нь идэвхтэй дэлгэцийн (Source эсвэл Timeline) **In цэгийг** арилгана; Out хэвээр үлдэнэ. In-ийг зөвхөн шинэ байрлалд зөөх бол арилгах шаардлагагүй — [k:I]-г дахин дарахад хуучин нь солигдоно.

> Timeline-д In үлдсэн үед Deliver "In/Out Range", Insert/Overwrite "гурван цэгийн" горимд ажиллана; санаанаас өөр үр дүнд эхлээд [k:Alt+X] (хоёуланг арилгах).
`,

"clear-out": `
## Зориулалт
Mark → Clear Out [k:Alt+O] нь идэвхтэй дэлгэцийн **Out цэгийг** арилгана; In хэвээр. Out-гүй үед In-ээс клипийн (timeline-ийн) төгсгөл хүртэл гэж тооцогдоно — Source Viewer-ээс "эндээс дуустал" оруулахад зориудаар Out арилгаж болно.

Холбоотой: [[clear-in]], [[clear-in-and-out]].
`,

"clear-in-and-out": `
## Зориулалт
Mark → Clear In and Out [k:Alt+X] нь **In, Out хоёуланг** зэрэг арилгана. Deliver-д бүтэн timeline рендерлэхийн өмнө, Insert хийхэд timeline-ийн In/Out саад болж байвал.

> Timeline-д In/Out үлдсэн бол Insert/Overwrite тэр мужид л үйлчилж, "гурван цэгийн" монтаж хийгддэг — санаанаас өөр үр дүн гарвал Alt+X.
`,

"clear-video-in-and-out": `
## Зориулалт
Mark → Clear Video In and Out [k:Alt+Shift+X] нь эх клипийн **зөвхөн видеоны** In/Out цэгийг арилгана; дууных хэвээр.
`,

"clear-audio-in-and-out": `
## Зориулалт
Mark → Clear Audio In and Out [k:Ctrl+Alt+X] нь эх клипийн **зөвхөн дууны** In/Out цэгийг арилгана; видеоных хэвээр.
`,

"mark-clip": `
## Зориулалт
Mark → Mark Clip [k:X] нь заагчийн доорх клипийн **эхлэл, төгсгөлд In/Out** автоматаар тавина (Auto Select асаалттай хамгийн дээд замын клип). Тэр клипийн уртад рендерлэх, дээр нь өөр клип Overwrite хийх, мужаар устгахад.

## Хэрэглэх алхам
1. Заагчийг клип дээр.
2. [k:X]. In/Out клипийн хилд.
3. Source Viewer-ээс өөр клип [k:F10] — яг тэр уртад дарна (B-roll солих).

> Клип сонгосон бол Mark Selection [k:Shift+A] олон клипийг хамарна. Хэд хэдэн зам давхцаж байвал дээд замын клип авагдана — тодорхой замыг бол бусдын Auto Select унтраана.
`,

"mark-selection": `
## Зориулалт
Mark → Mark Selection [k:Shift+A] нь сонгосон клип(үүд)-ийн **эхнээс төгсгөл хүртэл In/Out** тавина (олон зам, зайтай ч бүхэлд нь хамарна). Хэсгийг рендерлэх, Compound болгох, устгах мужийг зааж өгөх.

> Range Selection [k:R]-ээр мужаар сонгосон бол мөн Shift+A — мужид In/Out.
`,

"create-subclip": `
## Зориулалт
Mark → Create Subclip [k:Alt+B] нь Source Viewer-д тэмдэглэсэн **In/Out хэсгийг бие даасан клип** (subclip) болгож Media Pool-д нэмнэ. Урт бичлэгээс хэрэгтэй хэсгүүдийг тусдаа нэрлэж эмхлэх (ярилцлагын хариулт бүр, дроны шилдэг хэсэг).

## Хэрэглэх алхам
1. Source Viewer-д клип нээж In/Out.
2. [k:Alt+B] → нэр → OK. Media Pool-д subclip (тэмдэгтэй).
3. Subclip-ийг ердийн клип мэт timeline-д.

> Subclip эх файлыг заана (хуулбар биш). Subclip-ийн хязгаараас гадуур сунгах бол Media Pool-д subclip дээр баруун товч → Edit Subclip → хязгаар өөрчлөх, эсвэл "Use full clip".
`,

"keyframe-timeline-mode": `
## Зориулалт
Mark → Keyframe Timeline Mode нь timeline дээрх клипийн түлхүүр кадрын замыг (◆ тэмдгээр нээгддэг) **бүх параметрээр нэгтгэж** харуулах эсвэл **параметр тус бүрээр** (Zoom, Position, Opacity…) тусдаа мөрөөр харуулахыг сонгоно. Олон параметрийн түлхүүр кадрыг ялгаж зөөхөд тусдаа мөр.

Холбоотой: [[keyframe-editor]].
`,

"add-keyframe": `
## Зориулалт
Mark → Add Keyframe [k:Ctrl+[] нь заагчийн байрлалд сонгосон клипийн **түлхүүр кадар** тавина (Inspector-т идэвхтэй параметрүүдэд, одоогийн утгаар). Inspector-ийн ◆ дарахтай ижил, гарнаас.

## Хэрэглэх алхам
1. Клип сонгоод Inspector → параметрийн ◆ асаана (эхний түлхүүр кадар).
2. Заагчийг зөөж [k:Ctrl+[] → одоогийн утгатай түлхүүр кадар (хөдөлгөөнийг барих цэг).
3. Утга өөрчилбөл тэр цэгт өөрчлөгдөнө.

> Static Keyframe [k:Ctrl+]] — утга хадгалагдаж, өмнөх хүртэл шугаман биш "хатуу" барих. [[add-static-keyframe]].
`,

"add-static-keyframe": `
## Зориулалт
Mark → Add Static Keyframe [k:Ctrl+]] нь заагчийн байрлалд **тогтмол (static) түлхүүр кадар** тавина — энэ цэгээс дараагийн түлхүүр кадар хүртэл утга **өөрчлөгдөхгүй** барина (интерполяци биш, алхам). Хөдөлгөөнийг түр зогсоох (лого орж ирээд зогсоод, дараа гарах).

## Хэрэглэх алхам
1. Хөдөлгөөний төгсгөлд [k:Ctrl+]] — тэндээс утга тогтмол.
2. Дараагийн хөдөлгөөн эхлэх цэгт дахин [k:Ctrl+]] эсвэл ердийн [k:Ctrl+[], дараа нь утга өөрчилнө.

> Keyframe Editor-т static кадар өөр хэлбэртэй харагдана; муруй засварлагчид тэр хэсэг хавтгай шугам.
`,

"delete-keyframe": `
## Зориулалт
Mark → Delete Keyframe [k:Alt+]] нь заагч дээрх (сонгосон клипийн, идэвхтэй параметрийн) **түлхүүр кадрыг устгана**. Inspector-т заагч яг түлхүүр кадар дээр байхад ◆ улбар шар; тэр үед дарна.

> Заагч түлхүүр кадар дээр байхгүй бол юу ч устахгүй. Түлхүүр кадар руу — Inspector-ийн ◀ ▶ эсвэл [k:Alt+↑] [k:Alt+↓].
`,

"delete-all-keyframes": `
## Зориулалт
Mark → Delete All Keyframes нь сонгосон клипийн (идэвхтэй параметрийн, эсвэл бүх параметрийн — Inspector-т бүлгээр) **бүх түлхүүр кадрыг** арилгаж утгыг статик болгоно (одоогийн заагчийн утгаар). Хөдөлгөөнийг бүрэн хасаж дахин эхлэх.

> Inspector-т параметр дээр баруун товч → Remove All Keyframes — ижил; Transform бүлгийн ↺ — түлхүүр кадар + утгыг хоёуланг сэргээнэ.
`,

"add-and-modify-marker": `
## Зориулалт
Mark → Add and Modify Marker [k:Ctrl+M] нь заагчийн байрлалд **тэмдэглэгээ тавьж, шууд засварлах цонх** (нэр, тайлбар, өнгө, урт, түлхүүр үг) нээнэ. [k:M] хоёр удаа дарахтай ижил, нэг товчоор.

## Хэрэглэх алхам
1. Заагчийг байрлуулна; клип сонгосон бол клипийн тэмдэглэгээ, үгүй бол timeline-ийн.
2. [k:Ctrl+M] → Name, Notes, Color, Duration → Done.

Дэлгэрэнгүй: [[marker]].
`,

"modify-marker": `
## Зориулалт
Mark → Modify Marker [k:Shift+M] нь заагч дээрх **байгаа тэмдэглэгээний** нэр, тайлбар, өнгө, уртыг засах цонх нээнэ. Тэмдэглэгээ дээр давхар товшихтой ижил.

> Заагч яг тэмдэглэгээ дээр байх ёстой — [k:Shift+↑] [k:Shift+↓]-ээр очно.
`,

"delete-marker": `
## Зориулалт
Mark → Delete Marker [k:Alt+M] нь заагч дээрх **тэмдэглэгээг устгана**. Тэмдэглэгээг сонгоод [k:Delete] мөн адил.
`,

"delete-all-markers": `
## Зориулалт
Mark → Delete All Markers нь timeline (эсвэл сонгосон клип)-ийн **бүх тэмдэглэгээг** устгана; дэд цэсээр **өнгөөр нь** сонгож (зөвхөн улаан) устгаж болно. Захиалагчийн сэтгэгдлийн тэмдэглэгээг шийдвэрлэсний дараа цэвэрлэх.

> Буцаах — Undo л. Устгахын өмнө Edit Index → Markers → Export-оор жагсаалтыг хадгалж болно.
`,

"add-flag": `
## Зориулалт
Mark → Add Flag нь сонгосон клипэд **өнгөт туг** тавина (дэд цэсээс өнгө). Клипийг бүхэлд нь ангилах тэмдэг; Smart Bin, Edit Index-ийн шүүлтүүрт. Дэлгэрэнгүй: [[flag]].

> Timeline хэрэгслийн мөрийн ⚑ товч мөн адил; өнгө унадаг цэсээр.
`,

"clear-flags": `
## Зориулалт
Mark → Clear Flags нь сонгосон клипийн **бүх тугийг** арилгана; дэд цэсээр тодорхой өнгийг л. Media Pool, timeline хоёуланд.
`,

"set-clip-color": `
## Зориулалт
Mark → Set Clip Color нь сонгосон клипийг timeline дээр **өнгөөр будаж** ялгана (16 өнгө). Ярилцлага, B-roll, хөгжим, гарчгийг өнгөөр таних; Smart Bin-д Clip Color дүрэм; Edit Index-д Color багана.

## Хэрэглэх алхам
1. Клип(үүд) сонгоно.
2. Mark → Set Clip Color → өнгө; эсвэл клип дээр баруун товч → Clip Color.
3. Арилгах — Clear Color.

> Клипийн өнгө Media Pool-ийн клипт биш timeline-ийн клипт (тусдаа). Media Pool-д клип дээр баруун товч → Clip Color — тэнд тусдаа. Fairlight-д замын өнгө — замын толгой.
`,

/* ══════════ View ══════════ */

"bypass-color-and-fusion": `
## Зориулалт
View → Bypass Color and Fusion нь бүх клипийн **өнгөний засвар, Fusion эффектийг түр унтрааж** эх дүрсийг харуулна — харьцуулах, эсвэл тоглуулалтыг хурдасгах (Edit-д монтаж хийхэд хүнд Fusion, NR тасалдуулахгүй). Timeline Viewer-ийн дээд баруун талын тэмдэг мөн адил.

> Экспортод нөлөөлөхгүй (рендерт засвар орно). Ажил дуусаад унтраахаа мартвал дэлгэц дээр "засвар алга болсон" мэт санагдана — эхлээд үүнийг шалгана. Color хуудсанд Bypass [k:Shift+D] тусдаа.
`,

"display-broadcast-safe-exceptions": `
## Зориулалт
View → Display Broadcast Safe Exceptions нь **нэвтрүүлгийн хүрээнээс** (Project Settings → Color Management → Broadcast Safe, жишээ нь −20…120 IRE эсвэл 0–100) хэтэрсэн пиксэлийг дэлгэц дээр **зурвасаар тэмдэглэнэ**. ТВ-д хүлээлгэн өгөх файлын хууль ёсны хүрээг шалгах.

> Тэмдэглэгээ зөвхөн дэлгэцэнд; засварыг Color хуудсанд (Soft Clip, Gain) хийнэ. Broadcast Safe-ийн "Make Broadcast Safe" тохиргоо асаалттай бол Resolve автоматаар хязгаарлана (Project Settings).
`,

"source-timeline-viewer": `
## Зориулалт
View → Source/Timeline Viewer [k:Q] нь Edit хуудсанд **идэвхтэй дэлгэцийг** Source ↔ Timeline хооронд солино. Single Viewer горимд дэлгэц өөрөө солигдоно. Гарны товчлуур (I, O, Space, JKL) идэвхтэй дэлгэцэд үйлчилдэг тул Q — ажлын урсгалын үндсэн товч.

> Аль дэлгэц идэвхтэй нь дэлгэцийн хүрээний тод байдал, нэрний өнгөөр харагдана.
`,

"source-clip-source-tape": `
## Зориулалт
View → Source Clip/Source Tape [k:Shift+Q] нь Source Viewer-ийг **ганц клип** харах эсвэл Media Pool-ийн сангийн **бүх клипийг нэг урт хальс** мэт дараалуулан харах (Source Tape) горимд солино. Cut хуудасны Source Tape-ийг Edit-д.

## Хэрэглээ
- Source Tape: JKL-ээр бүх материалыг тасралтгүй гүйлгэж, In/Out тавьж Insert — клип бүрийг нээх шаардлагагүй.
- Сангийн эрэмбэ (нэр, огноо) хальсны дарааллыг тодорхойлно.
`,

"toggle-source-timeline": `
## Зориулалт
View → Toggle Source Timeline [k:Alt+Q] нь Source Viewer-т **өөр timeline-ийг клип мэт** нээж, түүнээс In/Out тавьж одоогийн timeline-д (үүрлэсэн) оруулах горимыг солино. Timeline → Load Current Timeline to Source Viewer-тэй холбоотой.

Холбоотой: [[load-current-timeline-to-source-viewer]].
`,

"zoom-around-mouse-pointer": `
## Зориулалт
View → Zoom Around Mouse Pointer нь timeline-ийг томруулахад ([k:Ctrl] + дугуй) **хулганы байрлалыг төв** болгох эсэх. Асаалттай — хулганы доорх хэсэг томорно (ихэнх монтажчийн сонголт); унтраалттай — заагчийн байрлал төв.
`,

"safe-area": `
## Зориулалт
View → Safe Area нь дэлгэц дээр **аюулгүй бүсийн** хүрээ харуулна: **Action Safe** (93%; үйлдэл багтах), **Title Safe** (90%; бичиг багтах). Хуучин ТВ, зарим дэлгэц захыг тайрдаг (overscan) тул гарчгийг Title Safe дотор.

## Дэд цэс
On/Off, Action Area, Title Area, Center, Aspect Ratio (өөр харьцааны хүрээ — 4:3, 2.39:1), Extents.

> Орчин үеийн вэб, утсанд overscan байхгүй боловч сошиалын UI (доод, дээд зурвас) гарчгийг далдалдаг — 9:16 видеонд өөрийн "safe" бүсийг Guides-ээр.

Холбоотой: [[guides]], [[titles]].
`,

"rulers": `
## Зориулалт
View → Rulers нь Timeline Viewer-ийн зах дээр **хэмжүүрийн шугам** (пиксэл) харуулна. Элементийн байрлалыг пиксэлээр нарийн тааруулах, Guides татах (шугамаас чирж).

Холбоотой: [[guides]].
`,

"guides": `
## Зориулалт
View → Guides нь Timeline Viewer дээр **зохиомжид туслах шугамууд** — гурвалын дүрэм (rule of thirds), төв тэнхлэг, өөрийн шугам (Rulers-ээс чирж). Гарчиг, лого, split screen-ийг зэрэгцүүлэх.

## Дэд цэс
Show Guides, Lock Guides, Clear Guides, Add Horizontal/Vertical Guide, Preset (Thirds, Center, Custom).

> Guides зөвхөн дэлгэцэнд; рендерт орохгүй. Fusion-ий Viewer-т өөрийн Guides (баруун товч → Guides).
`,

"show-spelling-errors-on-viewer": `
## Зориулалт
View → Show Spelling Errors on Viewer нь гарчиг (Text, Text+), хадмал дээрх **үсгийн алдааг** дэлгэц дээр доогуур зурж тэмдэглэнэ. Үйлдлийн системийн зөв бичгийн толь ашиглана.

> Монгол кирилл толь Windows-д суулгаагүй бол монгол бичвэрт бүх үг алдаа мэт тэмдэглэгдэнэ — унтраах эсвэл Windows-д монгол хэл нэмнэ. Дэлгэцэнд л; рендерт орохгүй.
`,

"show-duplicate-frames": `
## Зориулалт
View → Show Duplicate Frames нь timeline дээр **нэг эх кадрыг олон удаа ашигласан** хэсгүүдийг өнгөт зурвасаар тэмдэглэнэ. Хөгжмийн видео, олон B-roll-той монтажид санамсаргүй давтагдсан кадрыг олох; ижил өнгө — ижил эх хэсэг.

> Timeline Options (⚌) → Show Duplicate Frames мөн адил. Зориудын давталт (loop) -д мэдээж гарна.
`,

"show-file-names": `
## Зориулалт
View → Show File Names нь timeline-ийн клип дээр **клипийн нэрний оронд файлын нэрийг** бичнэ. Клипийг Media Pool-д нэр өөрчилсөн, эсвэл ижил нэртэй олон клип байхад эх файлыг ялгах.

> Нэр нь клипийн урт богино бол харагдахгүй — Timeline Options → Clip name mode, замын өндөр.
`,

"show-audio-track-layers": `
## Зориулалт
View → Show Audio Track Layers (Timeline → Layered Audio Editing-тэй холбоотой) нь нэг дууны зам дээр **давхарласан клипүүдийг** тусдаа давхарга болгож харуулна — дээд давхарга тоглогдоно. Авалт (take) харьцуулах, ADR, Foley давхарлах.

> Давхарга харагдахгүй үед доод клип нуугдсан боловч байгаа — Delete-ээр устгахад доод нь гарч ирнэ.
`,

"show-subtitle-regions": `
## Зориулалт
View → Show Subtitle Regions нь дэлгэц дээр **хадмалын байрлах хүрээг** (Region) тэмдэглэнэ — хадмалын зам Inspector → Region тохиргоотой. Хадмал гарчигтай давхцахгүй, дэлгэцийн доод хэсэгт багтах эсэхийг шалгах.
`,

"timeline-thumbnail-mode": `
## Зориулалт
View → Timeline Thumbnail Mode (мөн Timeline Options ⚌) нь timeline-ийн видео клип дээр **жижиг зургийг хэрхэн** харуулахыг сонгоно:
- **Film Strip** — клипийн дагуу олон кадар (хальс мэт).
- **Single Thumbnail** — эхний кадар л.
- **None** — зураггүй (хурдан, нэр л).

> Урт timeline, олон клипт Film Strip удаашруулна — None эсвэл Single. Дууны клипт Waveform тохиргоо тусдаа (Timeline Options → Audio Waveform).
`,

"show-current-clip-with-handles": `
## Зориулалт
View → Show Current Clip With Handles нь заагчийн доорх клипийн **ашиглагдаагүй нөөц хэсгийг** (handle — In-ээс өмнөх, Out-аас хойших эх файлын хэсэг) timeline дээр бүдэг харуулна. Клипийг хэр сунгаж болох, шилжилтэд нөөц байгаа эсэхийг харах.

> Зөвхөн харагдац; клип өөрчлөгдөхгүй. Trim горимд ирмэг чирэхэд нөөц дуусахад заагч улаан болно.
`,

"timeline-scrolling": `
## Зориулалт
View → Timeline Scrolling нь тоглуулалтын үед заагч дэлгэцийн захад хүрэхэд timeline **хэрхэн гүйхийг** сонгоно:
- **Page** — хуудсаар үсрэх (анхны).
- **Smooth** — заагч төвдөө, timeline жигд гүйнэ.
- **None** — гүйхгүй, заагч кадраас гарна.

> Smooth горим тоглуулалтад бага зэрэг ачаалал; удаан компьютерт Page.
`,

"show-preview-marks": `
## Зориулалт
View → Show Preview Marks нь Source Viewer-ээс клип оруулах гэж байхад (In/Out тавьсан) **timeline дээр орох байрлал, уртыг урьдчилан** тэмдэглэнэ (сүүдэр хэлбэрээр). Insert/Overwrite хийхээс өмнө хаана унахыг харах.
`,

"enable-multiview-edit-preview": `
## Зориулалт
View → Enable Multiview Edit Preview нь multicam эсвэл олон камерын монтажид Timeline Viewer-т **бүх өнцгийг зэрэг** (multi-view) урьдчилан харах горимыг асаана — тоглуулж байхдаа өнцгүүдийг харьцуулна.

Холбоотой: [[multicam-editing]].
`,

/* ══════════ Playback ══════════ */

"use-optimized-media-if-available": `
## Зориулалт
Playback → Use Optimized Media if Available нь Media Pool → Generate Optimized Media-аар үүсгэсэн **хөнгөвчилсөн хувилбарыг** тоглуулалтад ашиглах эсэх. Асаалттай — байвал хөнгөн файлаар; экспортод эх файл (Render Settings → Use Optimized Media сонгоогүй бол).

## Optimized ба Proxy
- **Optimized Media** — Resolve-ийн дотоод кэш формат (Project Settings → Optimized Media → format, resolution); зөвхөн энэ төсөл, энэ компьютерт.
- **Proxy Media** — тусдаа файл, зөөж болно. [[proxy-generation]].

> Хөнгөвчилсөн хувилбар Project Settings → Working Folders → Cache файлд; диск дүүрвэл Delete Optimized Media (Media Pool → баруун товч).
`,

"proxy-handling": `
## Зориулалт
Playback → Proxy Handling нь **прокси файлыг хэзээ ашиглахыг** сонгоно:
- **Prefer Proxies** — байвал прокси (хөнгөн), үгүй бол эх.
- **Prefer Camera Originals** — эх файл (прокси байсан ч).
- **Disable All Proxies** — прокси огт ашиглахгүй.

## Хэрэглээ
Монтаж — Prefer Proxies; өнгө засвар, экспортын өмнөх шалгалт — Prefer Camera Originals. Deliver → Render Settings → Advanced → Use Proxy Media — экспортод прокси ашиглах эсэх (ихэвчлэн унтраалттай).

> Дэлгэц чанар муу, "Proxy" тэмдэгтэй байвал прокси горим. Timeline Proxy Mode (нягтрал бууруулах) нь өөр тохиргоо. [[timeline-playback-resolution]].
`,

"timeline-playback-resolution": `
## Зориулалт
Playback → Timeline Proxy Resolution (Timeline Playback Resolution) нь **урьдчилан харах нягтралыг** Full / Half / Quarter болгож бууруулна — тоглуулалт олон дахин хөнгөрнө; экспортод нөлөөгүй. Удаан компьютерт хамгийн хурдан, файл үүсгэдэггүй шийдэл.

## Хэрэглэх алхам
1. Playback → Timeline Proxy Resolution → Half (4K-д Quarter).
2. Дэлгэц бага зэрэг зөөлөн харагдана; монтаж хэвийн.
3. Өнгө засвар, нарийн шалгалтад Full руу буцна.

> Дэлгэц "бүдэг" харагдвал энэ тохиргоог эхлээд шалгана. Prefer Proxies-тэй хамт хэрэглэвэл давхар.
`,

"photo-album-preview-resolution": `
## Зориулалт
Playback → Photo Album Preview Resolution нь Photo хуудасны зургийг **ямар нягтралаар урьдчилан** харуулахыг заана (Full / Half / Quarter). Олон том RAW зурагтай цомгийг хурдан гүйлгэх.

> Resolve 21-ийн Photo хуудастай холбоотой шинэ тохиргоо; экспортод нөлөөгүй. [[photo-page]].
`,

"manage-render-cache": `
## Зориулалт
Playback → Manage Render Cache (Delete Render Cache) нь диск дээрх **кэш файлуудыг** харж, сонгож устгана: All (бүгд), Unused (ашиглагдахгүй байгаа), тодорхой timeline-ийнх. Диск дүүрсэн, кэш гэмтсэн (дүрс буруу харагдах) үед.

> Кэш устгасны дараа хүнд хэсгүүд дахин тооцоологдоно (Smart горимд автоматаар). Кэшийн хавтас — Project Settings → Working Folders → Cache files.

Холбоотой: [[render-cache]].
`,

"fusion-memory-cache": `
## Зориулалт
Playback → Fusion Memory Cache нь Fusion-ий нодны үр дүнг **санах ойд (RAM) хадгалах** тохиргоо — компоузитыг дахин тоглуулахад тооцоолохгүй. Хэмжээ Preferences → System → Memory and GPU → Fusion Memory Cache (RAM-ийн хувь).

> Санах ой дүүрвэл (доод мөрийн % заалт) Fusion → Purge Cache. Диск дээрх кэш — Render Cache (Fusion Output).

Холбоотой: [[pixel-readout]], [[fusion-page]].
`,

"l": `
## Зориулалт
[k:L] нь J-K-L гурвалын **урагш тоглуулах** товч. Дараалан дарах бүрд 2x, 4x, 8x, 16x. [k:K]-тэй хамт барихад удаан гүйлгэх; [k:K] барьж [k:L] нэг дарах — нэг кадар урагш. [k:J] — ухраах.

Дэлгэрэнгүй: [[j]], [[k]], [[play-stop]].
`,

"play-again": `
## Зориулалт
Playback → Play Again [k:Alt+L] нь **сүүлд тоглуулж эхэлсэн байрлалаас** дахин тоглуулна. Огтлолтын хэсгийг олон дахин үзэж шалгахад заагчийг гараар буцаах шаардлагагүй.

> Play Around Current Frame [k:/] — заагчийн эргэн тойронд (pre/post-roll); Loop [k:Ctrl+/] — давтах.
`,

"playback-post-roll": `
## Зориулалт
Playback → Playback Post-Roll нь тоглуулалт зогссоны (эсвэл Play to In/Out, Play Around-ын) дараа **хэдэн кадар/секунд үргэлжлүүлэн** тоглуулахыг заана. Огтлолтын дараах хэсгийг бага зэрэг харах. Pre-roll — Preferences → User → Editing → Pre-roll/Post-roll.
`,

"stop-and-go-to-last-position": `
## Зориулалт
Playback → Stop and Go to Last Position нь тоглуулалтыг **зогсоод заагчийг тоглуулж эхэлсэн байрлал руу буцаана** (ердийн Stop зогссон газраа үлдээнэ). Нэг цэгээс дахин дахин үзэхэд: Space (тоглуулах) → энэ команд (буцах) → Space.

> Keyboard Customization-д товч оноовол Play Again-тай хослуулж хурдан.
`,

"play-slow": `
## Зориулалт
Playback → Play Slow [k:Shift+K] нь хэвийн хурднаас **удаан** (ойролцоогоор 1/2, дараалан дарахад улам удаан) тоглуулна, дуутай. Уруулын хөдөлгөөн, хурдан үйлдлийн яг кадрыг олох. [k:K]+[k:L] барихтай ижил.
`,

"fast-review": `
## Зориулалт
Playback → Fast Review нь Media Pool-ийн бүх сонгосон клипийг **автоматаар хурдасгаж дараалуулан** тоглуулна — урт клипийг илүү хурдан, богиныг хэвийн — олон цагийн материалыг богино хугацаанд үзэж ерөнхий ойлголт авах (Cut хуудасны Source Tape-тэй хослуулна).

> Тоглуулж байхдаа [k:M] дарж тэмдэглэгээ, [k:I]/[k:O] тавьж болно; хурд нь Cut хуудасны транспортын Fast Review товчоор.
`,

"play-around-to": `
## Зориулалт
Playback → Play Around/To дэд цэс нь заагч, огтлолтын **эргэн тойронд эсвэл хүртэл** тоглуулах командууд — огтлолт шалгах гол хэрэглүүр:
- **Play Around Current Frame** [k:/] — заагчийн өмнөх pre-roll, дараах post-roll.
- **Play Around Current Selection**, **Play Around Current Clip**.
- **Play Around In / Out**, **Play In to Out** [k:Alt+/] (тохиргооноос хамаарна).
- **Play to In / Play to Out**.

> Pre-roll, post-roll хугацаа — Preferences → User → Editing (анхны 2 сек). Trim горимд огтлолт сонгоод [k:/] — тэр огтлолтын эргэн тойрон.
`,

"step-one": `
## Зориулалт
Playback → Step One дэд цэс нь заагчийг **нэг нэгжээр** алхуулах командууд:
- **Frame Reverse / Forward** [k:←] [k:→].
- **Second Reverse / Forward** [k:Shift+←] [k:Shift+→].
- **Edit Point** — [k:↑] [k:↓] (Previous/Next Edit).
- **Keyframe**, **Marker** (Shift+↑/↓).

> Fusion, Color хуудсанд ижил товчнууд. Дуутай алхах — Preferences → Scrub audio.
`,

"jump-left": `
## Зориулалт
Playback → Jump Left [k:Ctrl+Alt+←] нь заагчийг тохируулсан **тооны кадраар зүүн тийш** үсэргэнэ (Preferences → User → Editing → Multi-frame jump; анхны 5). Секундээс бага, кадраас их алхам.
`,

"jump-right": `
## Зориулалт
Playback → Jump Right [k:Ctrl+Alt+→] нь заагчийг тохируулсан тооны кадраар **баруун тийш** үсэргэнэ.
`,

"cintel-scanner": `
## Зориулалт
Playback → Cintel Scanner нь Blackmagic **Cintel** кино хальс сканнерын (35mm, 16mm, 8mm) удирдлагын самбар — хальсыг сканнердаж Resolve-д шууд оруулах, гэрэл, тогтворжуулалт, HDR сканны тохиргоо. Сканнергүй бол саарал.

> Хальсны сэргээн засварт Cintel → Resolve FX Revival (Dust Buster, Automatic Dirt Removal, Deflicker) → Color гэсэн бүрэн урсгал Resolve-д. [[automatic-dirt-removal]], [[deflicker]].
`

});
