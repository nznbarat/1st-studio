/* ═════════════════════════════════════════════════════════════
   Гарын авлагын дэлгэрэнгүй тайлбар · File, Edit цэсний командууд
   (Resolve Studio 21-ийн бодит цэснээс баталгаажсан мөрүүд)
   ═════════════════════════════════════════════════════════════ */
RM.dict.long({

/* ══════════ File ══════════ */

"new-project": `
## Зориулалт
File → New Project нь одоогийн төслийн санд **хоосон шинэ төсөл** үүсгэнэ. Нэр асууна; тохиргоо Project Settings-ийн анхны утгаар (эсвэл хадгалсан Preset-ээр).

## Хэрэглэх алхам
1. File → New Project → нэр бичнэ → Create.
2. Шууд Project Settings [k:Shift+9] → Timeline frame rate, resolution — материалдаа тааруулна (давтамж клип орсны дараа өөрчлөгдөхгүй).
3. [k:Ctrl+S] хадгална.

> Одоо нээлттэй төсөлд хадгалаагүй өөрчлөлт байвал эхлээд хадгалахыг асууна. Project Manager [k:Shift+0] дотор ч New Project бий; тэнд хавтас сонгож үүсгэж болно.
`,

"open-recent-project": `
## Зориулалт
File → Open Recent Project нь **саяхан ажилласан төслүүдийн** жагсаалт — нэг товшилтоор нээнэ. Project Manager руу орох шаардлагагүй.

## Хэрэглээ
- Өдөр бүр ажилладаг төслөө хурдан нээх.
- Interface Toolbar-ийн төв дэх төслийн нэр дээр товшиход мөн адил жагсаалт гарна.

> Жагсаалтад төслийн сан (Project Library) солигдсон бол зарим нь байхгүй байж болно. Төслийг өөр санд зөөсөн, устгасан бол мөр саарал.
`,

"new-smart-bin": `
## Зориулалт
File → New Smart Bin нь Media Pool-д **дүрмээр автоматаар дүүрдэг** сан үүсгэх цонх нээнэ. Media Pool-ийн Smart Bins дээр баруун товч → Add Smart Bin-тэй ижил.

## Хэрэглэх алхам
1. File → New Smart Bin.
2. Нэр; дүрмийн мөр: талбар (Keywords, Resolution, Flags…), нөхцөл, утга; + олон дүрэм; All/Any.
3. Create.

Дэлгэрэнгүй: [[smart-bin]].
`,

"new-timeline": `
## Зориулалт
File → New Timeline [k:Ctrl+N] нь Media Pool-ийн сонгосон санд **шинэ timeline** үүсгэнэ. Цонхонд нэр, эхлэх цагийн код, замын тоо, **Use Project Settings** (унтраавал энэ timeline-д өөр нягтрал, давтамж) тохируулна.

## Хэрэглэх алхам
1. Media Pool-д timeline хадгалах санг сонгоно (эмхлэлтэд "Timelines" сан).
2. [k:Ctrl+N] → нэр (v01, Босоо гэх мэт), Empty Timeline чагт (клипгүй).
3. Use Project Settings унтраа → Format таб → Resolution 1080×1920 (босоо хувилбарт).
4. Create. Timeline Viewer-т нээгдэнэ.

> Media Pool-д клипүүд сонгоод баруун товч → Create New Timeline Using Selected Clips — клипүүдийг шууд дараалуулан оруулна.

Холбоотой: [[timeline]].
`,

"close-timeline": `
## Зориулалт
File → Close Timeline нь нээлттэй timeline-ийг **хаана**, устгахгүй. Media Pool-д хэвээр; давхар товшиж дахин нээнэ. Timeline Viewer-ийн дээд талын унадаг цэсэнд олон timeline нээлттэй үед цэвэрлэхэд.

> Stack Timelines (Timeline цэс) асаалттай үед таб хэлбэрээр олон timeline нээгддэг; тухайн табыг хаана. Timeline-ийг бүрмөсөн устгах бол Media Pool-д сонгоод Delete.
`,

"close-project": `
## Зориулалт
File → Close Project нь одоогийн төслийг **хааж Project Manager руу** буцна. Хадгалаагүй өөрчлөлт байвал асууна.

## Хэрэглээ
- Өөр төсөл рүү шилжих.
- Төслийн сан (Project Library) солих.
- Санах ой чөлөөлөх (олон timeline, кэш).

> Dynamic Project Switching (Preferences → System → General) асаалттай бол хэд хэдэн төслийг зэрэг нээж, File → Switch Project-оор солино; хаах шаардлагагүй.
`,

"save-project": `
## Зориулалт
File → Save Project [k:Ctrl+S] нь одоогийн төслийг **төслийн санд хадгална**. Interface Toolbar-ийн "Edited" тэмдэг арилна.

## Зөвлөмж
- Байнга дарах дадал; том үйлдлийн (Reset, Decompose, Reconform) өмнө заавал.
- **Live Save** (Preferences → User → Project Save and Load) — өөрчлөлт бүр автоматаар хадгалагдана; гарны Ctrl+S шаардлагагүй болно.
- **Project Backups** — мөн тэнд: 10 минут тутам (тохируулж болно) автомат нөөц; Project Manager → баруун товч → Project Backups-аас сэргээнэ.

> Save Project нь төслийн бичлэгийг л хадгална — медиа файл, кэш хадгалагдахгүй (тэд диск дээрээ). Бүхэлд нь архивлах бол File → Project Archive.

Холбоотой: [[edited-indicator]], [[project]].
`,

"save-as": `
## Зориулалт
File → Save Project As [k:Ctrl+Shift+S] нь төслийн **хуулбарыг шинэ нэрээр** үүсгэж, түүн дээр үргэлжлүүлнэ. Хувилбар (v01, v02), туршилт хийхийн өмнө, захиалагчийн хувилбар салгахад.

## Хэрэглэх алхам
1. [k:Ctrl+Shift+S] → шинэ нэр → Save.
2. Одооноос шинэ төсөл дээр ажиллана; хуучин нь хадгалсан байдлаараа үлдэнэ.

> Хоёр төсөл ижил медиа файлыг заана — файл хуулагдахгүй. Timeline-ийн хувилбар л хэрэгтэй бол Save As-ийн оронд timeline-ийг Duplicate хийх нь хөнгөн.
`,

"create-timeline-backup": `
## Зориулалт
File → Create Timeline Backup [k:Ctrl+Alt+S] нь одоогийн **timeline-ийн нөөц хуулбарыг** төслийн нөөцийн санд үүсгэнэ (Media Pool-д харагдахгүй). Том өөрчлөлтийн (бүтэц солих, Decompose, Reconform) өмнө хурдан хамгаалалт.

## Сэргээх
Media Pool-д timeline дээр баруун товч → **Timelines → Restore Timeline Backup** (эсвэл Project Manager → Project Backups). Нөөц огноо, цагтай жагсаалтаас сонгоно.

> Preferences → User → Project Save and Load → Timeline Backups — автомат нөөц асаах, давтамж, хэдэн хувилбар хадгалах.
`,

"revert-to-last-saved-version": `
## Зориулалт
File → Revert to Last Saved Version нь хадгалсны дараах **бүх өөрчлөлтийг хаяж**, сүүлд хадгалсан төлөв рүү буцна. Undo олон алхмаар буцахаас хурдан.

> Буцаах боломжгүй — асуулт гарахад Yes дарсны дараа өөрчлөлт бүрмөсөн алга болно. Live Save асаалттай бол "сүүлд хадгалсан" нь саяхны төлөв тул энэ команд бараг үр дүнгүй; тэр үед Project Backups ашиглана.
`,

"import-project": `
## Зориулалт
File → Import Project нь гадны **.drp** төслийн файлыг одоогийн төслийн санд оруулна (Export Project-оор гаргасан). Өөр компьютерээс ирсэн төслийг нээхэд.

## Хэрэглэх алхам
1. File → Import Project → .drp файл сонгоно.
2. Project Manager-т төсөл гарна; нээнэ.
3. Медиа Offline (улаан) бол Media Pool → Relink — .drp-д файл байхгүй, зам л байгаа. [[relink]].

> Бүх медиатай хамт зөөх бол .drp биш **Project Archive (.dra)** — Project Manager → Restore Project Archive.
`,

"import-metadata-to": `
## Зориулалт
File → Import Metadata To нь **CSV** файлаас клипүүдийн мета өгөгдлийг (Scene, Shot, Take, Keywords, Comments…) багцаар оруулна. Excel-д бэлдсэн бүртгэл, өөр программаас экспортолсон мета.

## Хэрэглэх алхам
1. CSV-ийн эхний мөр — талбарын нэр (File Name, Scene, Shot…); мөр бүр клип.
2. File → Import Metadata To → Media Pool (бүх клип) эсвэл Selected Clips.
3. Тааруулах талбар (File Name, Reel Name, Timecode) сонгоно → Import.

> Файлын нэр CSV-тэй яг таарах ёстой. Эхлээд Export Metadata From-оор загвар CSV гаргаж, түүнийг бөглөх нь найдвартай.

Холбоотой: [[metadata]], [[export-metadata-from]].
`,

"export-project": `
## Зориулалт
File → Export Project [k:Ctrl+E] нь төслийг **.drp** файл болгож гаргана — timeline, засвар, тохиргоо, Media Pool-ийн бүтэц. Медиа файл орохгүй (зам л). Өөр компьютер, хамтрагчид зөөх, нөөцлөх.

## Хэрэглэх алхам
1. [k:Ctrl+E] → байршил, нэр → Save.
2. Хүлээн авагч File → Import Project → Relink.

## Бусад хэлбэр
- **Project Archive (.dra)** — төсөл + медиа + кэш; бүрэн зөөлт.
- **Export Timeline** (AAF, XML, EDL, OTIO) — зөвхөн timeline, өөр программ руу.
- Gallery Still (.drx) — зөвхөн grade.

> .drp жижиг (МБ-ээр); хамгийн хямд нөөц. Долоо хоног бүр гаргаж хадгалах дадал.
`,

"export-metadata-from": `
## Зориулалт
File → Export Metadata From нь Media Pool (эсвэл сонгосон) клипүүдийн мета өгөгдлийг **CSV** болгож гаргана. Excel-д бүртгэл, өөр төсөлд мета зөөх, захиалагчид жагсаалт.

## Хэрэглэх алхам
1. File → Export Metadata From → Media Pool / Selected Clips.
2. Аль талбаруудыг гаргахыг сонгоно (Metadata Preset).
3. CSV хадгална. Excel, Google Sheets-т нээнэ.

> Гараар бичсэн мета (Keywords, Comments) файлд бичигдэдэггүй тул өөр төсөлд зөөхөд энэ л арга. Буцааж Import Metadata To.
`,

"quick-export": `
## Зориулалт
File → Quick Export нь Deliver хуудас руу орохгүйгээр **бэлэн тохиргоогоор шууд** экспортлох цонх. Дэлгэрэнгүй: [[quick-export]] (загварын Cut хуудасны товч).

## Хэрэглэх алхам
1. In/Out (шаардлагатай бол).
2. File → Quick Export → загвар (H.264, H.265, YouTube, TikTok…) → Export.
3. Нэр, байршил.

> Битийн урсгал, нягтралыг өөрчлөх бол Deliver. Загвар нэмэх — Deliver → Render Settings → Save As New Preset.
`,

"project-notes": `
## Зориулалт
File → Project Notes нь төсөлд хамаарах **чөлөөт тэмдэглэл** бичих цонх — захиалагчийн хүсэлт, хийх зүйлийн жагсаалт, хувилбарын тэмдэглэл. Төсөлтэй хамт хадгалагдана.

## Хэрэглээ
- "v02: гарчиг солих, 01:23-д дуу засах" гэх мэт.
- Хамтын ажиллагааны төсөлд бусдад мэдэгдэх.
- Тодорхой цагт хамаарах тэмдэглэлд Marker-ийн тайлбар илүү тохиромжтой. [[marker]].
`,

"single-user-project": `
## Зориулалт
File → Single User Project нь төслийг **ганц хэрэглэгчийн** горимд (анхны) ажиллуулна — хамтын ажиллагааны түгжээ, зөвшөөрөл байхгүй. Multiple User Collaboration-оос буцах.

> Ердийн ажилд энэ горим. Хамтын ажиллагааны горимоос буцахад бусад хэрэглэгчийн нээлттэй байдлыг шалгана.
`,

"multiple-user-collaboration": `
## Зориулалт
File → Multiple User Collaboration нь хэд хэдэн хүн **нэг төсөл дээр зэрэг** ажиллах горим: нэг нь монтаж, нөгөө нь өнгө, гурав дахь нь дуу. Timeline, bin түвшний түгжээ; Chat; өөрчлөлт бодит цагт синк.

## Шаардлага
- Төслийн сан **PostgreSQL** (Network) эсвэл **Blackmagic Cloud** дээр — Local сан дэмжихгүй.
- Бүх хэрэглэгч Studio, ижил хувилбар.
- Медиа бүгдэд хүрэх сүлжээний диск (ижил зам, эсвэл Path Mapping).

## Хэрэглэх алхам
1. Project Manager → сүлжээний/үүлэн санд төсөл.
2. File → Multiple User Collaboration асаана.
3. Хэрэглэгч бүр нэвтэрч; timeline нээхэд түгжигдэнэ (бусад зөвхөн харна); Refresh-ээр өөрчлөлт татна.

> Ганц компьютерт хэрэггүй. Хамтын ажиллагааны нарийн тохиргоог албан ёсны гарын авлагын Collaborative Workflow бүлгээс.
`,

"media-management": `
## Зориулалт
File → Media Management нь төслийн **ашигласан медиаг цуглуулж, хуулж, тайрж, зөөх** хэрэглүүр. Төслийг архивлах, өөр диск рүү зөөх, зөвхөн ашигласан хэсгийг үлдээж зай хэмнэх.

## Сонголт
- **Copy** — файлыг шинэ хавтас руу хуулж, төслийг тийш холбоно.
- **Move** — зөөнө.
- **Transcode** — өөр формат/кодек руу хөрвүүлэх.
- **Consolidate** — зөвхөн timeline-д ашигласан хэсгийг (handle-тэй) тайрж хуулах; ашиглаагүй бүх материалыг хасна. Диск их хэмнэнэ.
- Хүрээ — Entire Project / Timelines / Clips.
- **Relink to new files** чагт.

## Хэрэглэх алхам
1. File → Media Management → Timelines → одоогийн timeline.
2. Copy + Consolidate + handles 24 кадар.
3. Зорилтот хавтас → Start.

> Consolidate-ийн дараа хасагдсан хэсэг эх файлд л үлдэнэ; хэрэв эх файлыг устгавал тайралтыг сунгах боломжгүй. Handle-ийг өгөөмөр (1–2 сек).

Холбоотой: [[relink]].
`,

"reconform-from-bins": `
## Зориулалт
File → Reconform from Bins нь timeline-ийн клипүүдийг Media Pool-ийн **сонгосон сангийн шинэ файлаар** (ижил нэр, reel, цагийн код) солино. Прокси/бага нягтралаас эх файл руу, шинэ камерын хувилбар руу шилжихэд.

## Хэрэглэх алхам
1. Шинэ (эх) файлуудыг тусдаа санд импортолно.
2. Timeline нээж File → Reconform from Bins → тэр санг сонгоно.
3. Тааруулах шалгуур (Reel Name, Timecode, File Name) → OK.
4. Timeline-ийн клип шинэ файл руу зааж, засвар хэвээр.

> Clip → Conform Lock Enabled асаалттай клип солигдохгүй. [[conform-lock-enabled]]. Нэр, цагийн код таарахгүй бол солигдохгүй — Replace Selected Clip гараар.
`,

"reconform-from-media-storage": `
## Зориулалт
File → Reconform from Media Storage нь timeline-ийн клипүүдийг **дискний хавтас** дахь файлуудаар (Media Pool-д импортлолгүйгээр) солино. Reconform from Bins-тэй ижил зарчим; эх нь хавтас.

## Хэрэглэх алхам
1. File → Reconform from Media Storage → хавтас сонгоно.
2. Тааруулах шалгуур → OK. Таарсан файлууд Media Pool-д нэмэгдэж timeline-д холбогдоно.

Холбоотой: [[reconform-from-bins]], [[relink]].
`,

"setup-ai-assistants": `
## Зориулалт
File → Setup AI Assistants нь Resolve 21-ийн **AI туслах хэрэглүүрүүдийг тохируулах** цонх — AI боломжуудын идэвхжүүлэлт, загварын сонголт, холболт. Studio хувилбарт.

## Анхаарах
> Энэ мөр таны Resolve Studio 21-ийн File цэсний дэлгэцийн зурагт байгаа тул толинд орсон. Цонхны агуулга (ямар AI туслах, орон нутгийн/үүлэн загвар, хэлний тохиргоо) Resolve 21-д шинэ тул **албан ёсны гарын авлагаас баталгаажуулна уу**; энд таамаглал бичээгүй.

Холбоотой: [[davinci-neural-engine]].
`,

"easydcp": `
## Зориулалт
File → easyDCP нь кино театрын **DCP** (Digital Cinema Package) багцыг үүсгэх, унших, KDM түлхүүр удирдах Fraunhofer easyDCP нэмэлтийн цэс. Resolve Studio-д Kakadu JPEG 2000 кодлогчоор DCP-г Deliver-ээс шууд ч гаргана (Format → DCP).

## Хэрэглээ
- Кино наадам, театрт хүлээлгэн өгөх DCP.
- Шифрлэгдсэн DCP-д KDM үүсгэх (easyDCP лиценз шаардана).

> Ердийн вэб, ТВ ажилд шаардлагагүй. DCP-ийн нягтрал 2K (2048×1080) / 4K, 24/25 fps, XYZ өнгөний орон зай, 5.1/7.1 дуу — Deliver → DCP загвар эдгээрийг тохируулна.
`,

"dolby-vision": `
## Зориулалт
Dolby Vision нь кадар (үзэгдэл) бүрд **динамик мета мэдээлэл** дамжуулдаг HDR систем — дэлгэц бүр өөрийн чадалд тааруулж харуулна. File, Edit, Color цэсэнд холбогдох командууд: лиценз/тохиргоо, шинжилгээ (Analyze), trim (SDR, HDR-ийн бага түвшний дэлгэцэд тааруулах засвар), мета экспорт.

## Ажлын урсгал (Studio)
1. Project Settings → Color Management → Dolby Vision асаах (Mastering display, Version 4.0).
2. HDR timeline (Rec.2100 PQ) дээр өнгө засна.
3. Color → Dolby Vision → **Analyze All Shots** — L1 мета.
4. Trim (Color хуудасны Dolby Vision самбар) — 100 nit, 600 nit зэрэг зорилтод гараар нарийвчилна.
5. Deliver → Dolby Vision мета (XML) экспорт, эсвэл IMF/MXF-д шингээх.

> Dolby Vision мастер хийхэд Dolby-ийн лиценз, HDR лавлагаа монитор (1000 nit+) шаардлагатай. Ердийн YouTube HDR-д HDR10 (PQ, статик мета) хангалттай.

Холбоотой: [[hdr10-plus]], [[multimaster-trim-manager]].
`,

/* ══════════ Edit ══════════ */

"undo": `
## Зориулалт
Edit → Undo [k:Ctrl+Z] нь сүүлчийн үйлдлийг **цуцална**. Resolve хуудас бүрд (Edit, Color, Fusion, Fairlight) **тусдаа буцаах түүх** хөтөлдөг — Color хуудсанд Ctrl+Z нь зөвхөн өнгөний үйлдлийг буцаана.

## Хэрэглээ
- Дараалан дарж олон алхмаар.
- Edit → **History** — жагсаалтаас дурын алхам руу. [[history]].
- Redo [k:Ctrl+Shift+Z].

> Хадгалах (Ctrl+S) нь Undo түүхийг устгадаггүй; харин төслийг хааж нээхэд түүх алга болно. Render, Media Management зэрэг файлын үйлдэл буцаагдахгүй.
`,

"redo": `
## Зориулалт
Edit → Redo [k:Ctrl+Shift+Z] нь Undo-гоор буцаасан үйлдлийг **сэргээнэ**. Undo хийсний дараа шинэ үйлдэл хийвэл Redo-гийн зам алга болно.

> Windows-ийн бусад программын Ctrl+Y энд Redo биш. Keyboard Customization-д өөрчилж болно.
`,

"history": `
## Зориулалт
Edit → History нь тухайн хуудасны **хийсэн үйлдлүүдийн жагсаалт** — дурын алхам дээр товшиж тэр төлөв рүү буцна. Олон Undo дарахаас хурдан, ямар үйлдэл хийснээ харна.

## Хэрэглэх алхам
1. Edit → History (дэд цэс) → Open History Window.
2. Жагсаалтаас мөр товшино — тэр үйлдэл хүртэлх төлөв.
3. Дараа нь шинэ үйлдэл хийвэл тэр цэгээс доошхи түүх устана.

> Fusion хуудсанд Undo түүхийг мөн Fusion → Undo/Redo-гоор, харин History цонх нь Edit хуудасны.
`,

"cut-clipboard": `
## Зориулалт
Edit → Cut [k:Ctrl+X] нь сонгосон клипийг timeline-ээс **таслаж санах ойд** хуулна; орондоо хоосон зай үлдэнэ (Lift). Дараа нь Paste-аар өөр газар тавина.

## Холбоотой
- **Ripple Cut** [k:Ctrl+Shift+X] — таслаад зайг хаана. [[ripple-cut]].
- Cut Head / Cut Tail — заагчаас клипийн эхлэл/төгсгөл хүртэлх хэсгийг.
- Paste [k:Ctrl+V], Paste Insert [k:Ctrl+Shift+V].

> Cut нь эх файлд нөлөөгүй. Таслаад наахгүй бол клип алга болно — Undo-оор буцна.
`,

"ripple-cut": `
## Зориулалт
Edit → Ripple Cut [k:Ctrl+Shift+X] нь клипийг **таслаж авахдаа** үлдсэн хоосон зайг **хааж**, хойших клипүүдийг зүүн тийш зөөнэ. Timeline богиносно. Клипийг нэг газраас нөгөө рүү зөөх хамгийн цэвэр арга (Ripple Cut → Paste Insert).

> Auto Select унтраалттай замууд зөрөхгүй — дуу зургаас салж болзошгүй; Auto Select-ийг шалгана. [[auto-select]].
`,

"cut-head": `
## Зориулалт
Edit → Cut Head нь заагчийн доорх клипийн **заагчаас өмнөх хэсгийг** таслан санах ойд авна (клип огтлогдож, толгой хэсэг нь тасарна). Клипийн эхлэлийг хурдан хаяхад: заагчийг байрлуулаад Cut Head.

> Trim → Trim Start [k:Shift+[] мөн заагч хүртэл тайрдаг боловч санах ойд хуулахгүй. Устгах л бол Trim Start хөнгөн.
`,

"cut-tail": `
## Зориулалт
Edit → Cut Tail нь заагчийн доорх клипийн **заагчаас хойших хэсгийг** таслан санах ойд авна. Клипийн төгсгөлийг хаяхад.

> Trim → Trim End [k:Shift+]] — ижил тайралт, санах ойгүй. Cut Head/Tail нь Auto Select асаалттай бүх замын клипт үйлчилнэ.
`,

"copy": `
## Зориулалт
Edit → Copy [k:Ctrl+C] нь сонгосон клип (эсвэл Inspector-ийн параметр, нод, grade) -ийг **санах ойд хуулна**. Timeline дээр Paste [k:Ctrl+V] — заагчийн байрлалд, Track Destination замд.

## Хэрэглээ
- Клип хуулах (олон timeline хооронд ч).
- Color хуудсанд клип хуулаад Ctrl+V — grade хуулна.
- Inspector параметр хуулаад Paste Attributes [k:Alt+V].
- Fusion-д нод хуулах.

> Хуулсан клип **Auto Select асаалттай, Track Destination** замд наагдана; буруу замд орвол тэмдгийг шалгана.
`,

"copy-head": `
## Зориулалт
Edit → Copy Head нь заагчийн доорх клипийн **заагчаас өмнөх хэсгийг** санах ойд хуулна (клип өөрчлөгдөхгүй). Тэр хэсгийг өөр газар давтахад.
`,

"copy-tail": `
## Зориулалт
Edit → Copy Tail нь заагчийн доорх клипийн **заагчаас хойших хэсгийг** санах ойд хуулна. Клип өөрчлөгдөхгүй.
`,

"paste": `
## Зориулалт
Edit → Paste [k:Ctrl+V] нь хуулсан клипийг **заагчийн байрлалд, Overwrite** хэлбэрээр (доорхыг дарж) тавина. Зам — хуулсан замтай харьцангуй, Track Destination-аас эхлэн.

## Холбоотой
- **Paste Insert** [k:Ctrl+Shift+V] — дарахгүй, шигтгэж түлхэнэ. [[paste-insert]].
- **Paste Attributes** [k:Alt+V] — клип биш тохиргоог. [[paste-attributes]].
- **Paste Value** [k:Alt+Shift+V] — параметрийн утга. [[paste-value]].

> Color хуудсанд Ctrl+V — grade наана (клипт). Fusion-д — нод.
`,

"paste-insert": `
## Зориулалт
Edit → Paste Insert [k:Ctrl+Shift+V] нь хуулсан клипийг заагчийн байрлалд **шигтгэж**, тэндэх клипийг хоёр хувааж, хойшхийг баруун тийш түлхэнэ (Insert-тэй ижил, санах ойноос). Клип зөөх стандарт хос: Ripple Cut → Paste Insert.

> Auto Select унтраалттай замууд түлхэгдэхгүй; синк алдагдвал Undo хийж Auto Select-ийг шалгана.
`,

"paste-attributes": `
## Зориулалт
Edit → Paste Attributes [k:Alt+V] нь хуулсан клипийн **тохиргоог** (Transform, Crop, Composite, Speed, Stabilization, Lens Correction, Retime, эффект, дууны Volume/Pan/EQ, өнгөний засвар) сонгосон клипүүдэд наана. Нэг клипийг тохируулаад олон клипт давтах гол хэрэглүүр.

## Хэрэглэх алхам
1. Загвар клипийг сонгоод [k:Ctrl+C].
2. Зорилтот клипүүдийг сонгоод [k:Alt+V].
3. Цонхонд наах шинж чанаруудыг чагтална (Video Attributes: Composition, Transform…, Audio Attributes, Plugins, Color Grade). **Keyframes** — Maintain Timing / Stretch to Fit (түлхүүр кадрын хугацаа).
4. Apply.

> Video, Audio хоёуланг сонгосон бол тус тусын шинж чанар хуулагдана. Эффектийн параметр биш эффект өөрөө хуулагдана (Plugins). Color grade хуулах бол Color хуудасны аргууд илүү. [[grade]].
`,

"paste-value": `
## Зориулалт
Edit → Paste Value [k:Alt+Shift+V] нь хуулсан **параметрийн зөвхөн тоон утгыг** заагчийн байрлалд наана — түлхүүр кадрын хөдөлгөөн дагахгүй. Inspector-т утга хуулж (параметр дээр баруун товч → Copy) өөр клипийн ижил параметрт.

> Paste Attributes бүхэл бүлгийг, түлхүүр кадартай нь. Paste Value нэг утга, нэг агшинд. Түлхүүр кадар асаалттай параметрт наавал тэр байрлалд шинэ түлхүүр кадар үүснэ.
`,

"remove-attributes": `
## Зориулалт
Edit → Remove Attributes нь сонгосон клипээс **тодорхой шинж чанарыг** (Transform, Crop, Composite, Speed, Stabilization, эффект, дуу, өнгө) сонгож **арилгана**, бусдыг үлдээнэ. Inspector-ийн бүлэг бүрийн ↺-оос хурдан, олон клипт нэг дор.

## Хэрэглэх алхам
1. Клипүүд сонгоно.
2. Edit → Remove Attributes → чагт (жишээ нь зөвхөн Speed Change, Plugins).
3. Apply.

> Color grade арилгах бол Color хуудасны Reset; Remove Attributes-ийн Color Grade чагт мөн байдаг.
`,

"duplicate-clip": `
## Зориулалт
Edit → Duplicate Clip нь сонгосон клипийн **яг адил хуулбарыг** (тохиргоо, эффект, түлхүүр кадартай) timeline дээр үүсгэнэ — ихэвчлэн дээд зам дээр эсвэл шууд ард. Давхарлах эффект (нэг клипийг Composite Mode-оор өөр дээр нь), ижил B-roll давтахад.

> Хулганаар: клипийг [k:Alt] дараад чирвэл хуулбар үүснэ (дурын байрлалд). Media Pool-д хуулбар үүсгэх бол тэнд Duplicate.
`,

"duplicate-selection": `
## Зориулалт
Edit → Duplicate Selection нь сонгосон **бүх клипийг** (олон зам) нэг дор хувилна, харьцангуй байрлал хадгалагдана. Бүтэн хэсгийг (сцен) давтахад.

> Compound Clip болгоод хуулах нь хуулбаруудыг зэрэг засварлахад (нэг Compound-ыг олон газар) тохиромжтой; Duplicate бие даасан хуулбар үүсгэнэ.
`,

"lift-delete": `
## Зориулалт
Edit → Delete (Lift) [k:Backspace] нь сонгосон клипийг **устгаад орондоо хоосон зай** үлдээнэ. Timeline-ийн урт, бусад клипийн байрлал хэвээр — хөгжимд тааруулсан монтажид синк алдагдахгүй.

## Холбоотой
- **Ripple Delete** [k:Shift+Backspace] — зайг хаана. [[ripple-delete]].
- **Delete Gaps** — бүх зайг хаана. [[delete-gaps]].
- Клип сонгоогүй үед In/Out муж байвал тэр мужийг (Auto Select замуудаас) устгана.

> Windows-ийн Delete товч Resolve-д мөн Lift (тохиргооноос хамаарна). Keyboard Customization-д шалгана.
`,

"ripple-delete": `
## Зориулалт
Edit → Ripple Delete [k:Shift+Backspace] нь клипийг **устгаад үлдсэн зайг хааж**, хойших клипүүдийг зүүн тийш зөөнэ. Timeline богиносно. Ярилцлагаас хэсэг хасах, бүдүүлэг монтажид хэрэггүй кадар хаях.

## Хэрэглэх алхам
1. Клип (эсвэл Range [k:R], эсвэл In/Out муж) сонгоно.
2. [k:Shift+Backspace].

> Auto Select унтраалттай зам (хөгжим) хөдлөхгүй — зориудаар (хөгжим байрандаа) эсвэл санамсаргүй (дуу зөрнө). Сонголтоо шалгана. [[auto-select]].
`,

"delete-gaps": `
## Зориулалт
Edit → Delete Gaps нь timeline дээрх (эсвэл сонгосон мужийн) **бүх хоосон зайг** нэг дор хааж, клипүүдийг залгана. Lift-ээр устгасан олон зай, Cut хуудасны бүдүүлэг монтажийн дараа цэвэрлэх.

## Хэрэглэх алхам
1. Timeline-д In/Out (хэсэгчлэн) эсвэл юу ч сонгохгүй (бүхэлд нь).
2. Edit → Delete Gaps.
3. Ганц зай — зай дээр товшиж сонгоод [k:Shift+Backspace].

> Дээд зам дээр гарчиг, лого байхад доод замын зайг хаавал давхаргууд зөрнө — тэр замын Auto Select-ийг унтраах эсвэл бүгдийг хамт.
`,

"select-all": `
## Зориулалт
Edit → Select All [k:Ctrl+A] нь timeline дээрх **бүх клипийг** (бүх зам, түгжигдээгүй) сонгоно. Бүгдийг зөөх, Paste Attributes, Compound Clip болгох, устгах.

## Холбоотой
- Deselect All [k:Ctrl+Shift+A]. [[deselect-all]].
- Trim → Select All Clips Under Playhead [k:Alt+Shift+V].
- Замын толгойн Auto Select — Ctrl+A-д нөлөөлдөггүй; түгжээ нөлөөлнө.

> Media Pool идэвхтэй үед Ctrl+A Media Pool-ийн клипүүдийг сонгоно; timeline дээр товшиж идэвхжүүлээд дарна.
`,

"deselect-all": `
## Зориулалт
Edit → Deselect All [k:Ctrl+Shift+A] нь **бүх сонголтыг арилгана**. Клип сонгогдсон үед Inspector, Delete зэрэг команд сонголтод үйлчилдэг тул санамсаргүй үйлдлээс сэргийлж цэвэрлэнэ. Timeline-ийн хоосон газар товшиход мөн адил.
`,

"multicam-clip": `
## Зориулалт
Multicam Clip нь хэд хэдэн камерын клипийг цагийн код эсвэл дууны долгионоор **синк хийж нэг клип** болгосон хэлбэр. Edit хуудсанд Multicam харагдацаар тоглуулж байхдаа өнцгийг товшиж солино — шууд эфирийн найруулагч мэт.

## Үүсгэх
1. Media Pool → камерын клипүүд сонгоно → баруун товч → **Create Multicam Clip**.
2. Angle Sync: Timecode / Sound / In / Out. Frame rate, зам. Create.
3. Multicam клип Media Pool-д; timeline-д тавина.

## Монтаж
1. Timeline Viewer-ийн зүүн доод унадаг цэс → **Multicam** харагдац (өнцгүүд тор хэлбэрээр).
2. Тоглуулж байхдаа өнцөг дээр товшино — огтлолт үүсч өнцөг солигдоно ([k:1]–[k:9] товч).
3. Cut (огтлох) / Switch (огтлохгүй солих) горим — Clip → Multicam Cut / Switch.
4. Дараа нь огтлолтуудыг ердийн монтаж мэт тайрна.
5. Клип дээр баруун товч → Flatten Multicam — ердийн клип болгох (шаардлагатай бол).

## Онцлог
- Multicam клип дээр баруун товч → Open in Timeline — өнцгүүдийн синкийг засах.
- Resolve 20: AI Multicam SmartSwitch — ярьж буй хүнээр автомат сэлгэлт. [[ai-multicam-smartswitch]].

> Multicam тоглуулалт хүнд (олон урсгал зэрэг) — прокси, Timeline Proxy Mode ашиглана.

Холбоотой: [[sync-bin]], [[multicam-editing]].
`,

"insert-gap": `
## Зориулалт
Edit → Insert Gap нь заагчийн байрлалд **хоосон зай** оруулж, хойших клипүүдийг баруун тийш түлхэнэ. Хожим клип оруулах зай гаргах, гарчигт зай нэмэх. Зайн урт — In/Out тавьсан бол тэр урт, үгүй бол анхны утга.

> Auto Select асаалттай замуудад л. Зайг арилгах — зай дээр товшоод Shift+Backspace, эсвэл Delete Gaps.
`,

"swap-clips-towards-left": `
## Зориулалт
Edit → Swap Clips Towards Left [k:Ctrl+Shift+,] нь сонгосон клипийг **зүүн талын хөрштэйгөө байр солино**. Дараалал өөрчлөхөд чирэхээс хурдан — олон дарж клипийг timeline-ийн эхлэл рүү "алхуулна".

> Хоёр клип ижил зам дээр залгаа байх ёстой. Дунд нь зай эсвэл шилжилт байвал үр дүн санаанаас өөр байж болно.
`,

"swap-clips-towards-right": `
## Зориулалт
Edit → Swap Clips Towards Right [k:Ctrl+Shift+.] нь сонгосон клипийг **баруун талын хөрштэйгөө байр солино**. Клипийг timeline-ийн төгсгөл рүү алхуулахад.
`,

"edit-options": `
## Зориулалт
Edit → Edit Options нь монтажийн **нарийн зан төлөвийн** дэд цэс — жишээ нь Snapping, Linked Selection, чирэх үеийн үйлдэл, Trim-ийн тохиргоо зэрэг унтраалгууд. Хувилбараас хамаарч мөрүүд өөр.

> Дэд цэсний мөр бүрийг Trim, Timeline цэсний холбогдох командтай харьцуулж, аль нь юуг хамарч байгааг Resolve дээрээ шалгана уу — энэ дэд цэсний агуулгыг дэлгэцийн зургаас бүрэн баталгаажуулаагүй.
`

});
