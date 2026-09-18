/* ═════════════════════════════════════════════════════════════
   Гарын авлагын дэлгэрэнгүй тайлбар · Fusion хуудас
   ═════════════════════════════════════════════════════════════ */
RM.dict.long({

"b-spline-mask": `
## Зориулалт
B-Spline маск нь цэгүүдийн **дундуур биш, хажуугаар нь** гөлгөр муруй татдаг маск. Polygon-оос ялгаатай нь бариул (handle) байхгүй, цэг цөөн, муруй үргэлж гөлгөр. Хүний бие, нүүр, үүл зэрэг булан багатай хэлбэрт тохиромжтой.

## Хэрэглэх алхам
1. Хэрэглүүрийн мөр эсвэл [k:Shift+Space] → BSpline.
2. Дэлгэц дээр цэгүүдийг товшиж хэлбэр зурна. Эхний цэг дээр товшиж хаана.
3. Цэг дээр [k:Ctrl] дараад чирвэл муруй тэр цэг рүү татагдаж, булан үүснэ (weight).
4. Inspector → Soft Edge — ирмэг зөөлрүүлэх; Invert — урвуулах; Border Width — өргөсгөх.
5. Маскыг нодын **Effect Mask** (цэнхэр) оролтод холбоно.

## Хөдөлгөөн (rotoscope)
Кадар солиод цэгийг зөөхөд түлхүүр кадар автоматаар үүснэ (Inspector → Polyline-ийн ◆ анхнаасаа асаалттай). 5–10 кадар тутамд хэлбэрийг засвал завсрын кадрууд өөрөө тооцоологдоно.

## Polygon-той ялгаа
[[polygon-mask]] — Bezier бариултай, хурц булан хийхэд сайн. B-Spline — цөөн цэгээр гөлгөр хэлбэр. Хоёуланг нэг нодод нийлүүлж (маск нодыг маск руу холбох) болно.

> Маск нь ямар ч дүрсийг өөрөө өөрчлөхгүй — зөвхөн өөр нодын үйлчлэх бүсийг заана. Маскыг дангаар нь дэлгэцэнд гаргавал хар цагаан дүрс харагдана.
`,

"background-node": `
## Зориулалт
Background нод нь **цул өнгө эсвэл градиент** үүсгэдэг эх нод. Оролт шаардахгүй. Дэвсгэр, өнгөт хүрээ, маскны дүүргэлт, Merge-ийн суурь давхарга болгон ашиглана.

## Параметр (Inspector → Color таб)
- **Type** — Solid (цул), Horizontal, Vertical, Four Corner, Gradient (дурын чиглэл, олон өнгө).
- **Color** — өнгө, Alpha. Alpha 0 бол тунгалаг дэвсгэр.
- Image таб — Width, Height, Depth (8/16 бит, float), Pixel Aspect. Анхны утга timeline-ийн нягтрал.

## Хэрэглээ
- Text+ гарчгийн ард өнгөт дэвсгэр: Background → Merge (Background) + Text+ (Foreground).
- Маскыг өнгөөр дүүргэх: Background-ийн Effect Mask-д Rectangle холбох.
- Хоосон Fusion Composition-д эхлэлийн давхарга.

## Хэрэглэх алхам
1. [k:Shift+Space] → Background, эсвэл хэрэглүүрийн мөрийн эхний товч.
2. Inspector → Type, Color тохируулна.
3. Merge-ийн шар (Background) оролтод холбоно.

> Background-ийн нягтрал бусад дүрстэй таарахгүй бол Merge-д хэмжээ зөрнө. Image таб → Auto Resolution чагт (анхны) timeline-тэй тааруулна.
`,

"blur-fusion": `
## Зориулалт
Blur нод нь дүрсийг **зөөлрүүлж бүдгэрүүлнэ**. Fusion-д хэд хэдэн төрлийн бүдгэрүүлэгч нод тусдаа байна.

## Blur нодын параметр
- **Filter** — Box (хурдан, бүдүүлэг), Bartlett, Multi-box, **Gaussian** (хамгийн зөөлөн, стандарт).
- **Blur Size** — хэмжээ. X, Y тусад нь (Lock XY унтраа).
- **Blend** — эх дүрстэй холих хувь.
- Channels — R, G, B, A тусад нь бүдгэрүүлэх (Alpha-г бүдгэрүүлж маск зөөлрүүлнэ).

## Бусад бүдгэрүүлэгч
- **Directional Blur** — нэг чиглэлд (хөдөлгөөний бүдгэрэл мэт). Type: Linear, Radial, Centered, Zoom.
- **Vector Motion Blur** — хөдөлгөөний векторын дагуу.
- **Defocus** — линзний фокус алдалт. [[defocus]].
- **VariBlur** — маскаар хэсэг бүрд өөр хэмжээгээр (гүний зураглалтай хослуулах).
- **Soft Glow**, **Glow** — гэрэлтүүлэн бүдгэрүүлэх.

## Хэрэглэх алхам
1. Бүдгэрүүлэх нодын дараа Blur холбоно (Serial).
2. Blur Size тохируулна.
3. Хэсэгчлэн — Effect Mask оролтод маск холбоно (нүүр нуух, дэвсгэр бүдгэрүүлэх).

> Blur нь ирмэг дээр тунгалаг зах үүсгэж болно. Inspector → Settings → Blend, эсвэл Transform → Edges → Duplicate/Mirror-ээр захыг сунгана.
`,

"brightness-contrast": `
## Зориулалт
Brightness Contrast (BC) нод нь **гэрэлтүүлэг, ялгарал, гамма, ханалтыг** энгийн гүйлгэгчээр өөрчилдөг нод. Color Corrector-оос хөнгөн, хурдан; түлхүүр кадраар анивчих, бүдгэрэх эффектэд тохиромжтой.

## Параметр
- **Gain** — үржүүлэх (гэрэлтэй хэсэг илүү өөрчлөгдөнө).
- **Lift** — нэмэх (харанхуй хэсэг өргөгдөнө).
- **Gamma** — дунд өнгө.
- **Contrast**, **Brightness**, **Saturation**.
- **Low / High** — оролтын хүрээ (levels).
- Channels — R, G, B, A тусад нь.
- **Pre-Divide / Post-Multiply** — тунгалаг ирмэгтэй дүрсэнд зөв ажиллуулах.

## Хэрэглээ
- Text+ эсвэл дүрсийг гэрэлтүүлэх, харанхуйлах.
- Alpha сувгийг Gain-аар өөрчилж тунгалаг болгох.
- Маскаар хэсгийг гэрэлтүүлэх (Effect Mask).

## Color хуудастай харьцуулбал
Өнгөний засварыг Color хуудсанд хийх нь зөв. Fusion-ий BC нь компоузитийн элементүүдийг (лого, гарчиг, бөөм) харагдах орчинд нь тааруулахад зориулагдсан.

> Fusion-ий нодууд анхнаасаа шугаман (linear) өнгөний орон зайд ажилладаггүй; Gain утга Color хуудасны Gain-тэй яг тохирохгүй.
`,

"camera-3d": `
## Зориулалт
Camera 3D нод нь Fusion-ий **гурван хэмжээст орчинд** камер үүсгэнэ. Merge 3D-д холбогдож, Renderer 3D энэ камераар үзэгдлийг хавтгай зураг болгоно. Камергүй бол Renderer анхны камерыг ашиглана.

## Параметр
- **Transform** — байрлал (X, Y, Z), эргэлт, Target (харах цэг).
- **Angle of View / Focal Length** — линзний өргөн. Film Gate — мэдрэгчийн хэмжээ (бодит камертай тааруулах).
- **Depth of Field** — фокусын гүн (Renderer 3D-д Enable DoF).
- **Image Plane** — камерын урд лавлагаа зураг байрлуулах (match move).

## Хэрэглэх алхам
1. Merge 3D үүсгэж Shape 3D, Text 3D зэргийг холбоно.
2. Camera 3D-г Merge 3D-ийн оролтод холбоно.
3. Renderer 3D → Camera сонгоно.
4. Viewer-т Merge 3D-г гаргаж, баруун товч → Camera → Perspective/Front/Top-оор орчныг харна; Camera 3D-г сонгож удирдана.
5. Транспортын дагуу камерын байрлалд түлхүүр кадар тавьж хөдөлгөөн үүсгэнэ.

## Камерын мөрдөлт
Camera Tracker нод (Studio) бодит бичлэгээс камерын хөдөлгөөнийг тооцоолж, Camera 3D + Point Cloud үүсгэнэ. Дараа нь 3D объектыг бодит кадарт наана.

> 3D орчны нэгж бодит биш, харьцангуй. Text 3D-ийн хэмжээ 1 нэгж = дэлгэцийн өндрийн тодорхой хувь.
`,

"color-corrector-fusion": `
## Зориулалт
Color Corrector (CC) нод нь Fusion доторх **бүрэн өнгө засварын** нод. Lift/Gamma/Gain-ийн оронд Shadows / Midtones / Highlights / Master гэсэн дөрвөн бүсэд тус тусын өнгөний дугуй, мөн Levels, Histogram, Suppress, Colorspace табтай.

## Табууд
- **Correction** — Range (Master, Shadows, Midtones, Highlights) сонгоод дугуй, Saturation, Contrast, Gain, Lift, Gamma, Brightness. Hue — өнгөний аяс эргүүлэх.
- **Ranges** — бүсүүдийн хилийг муруйгаар.
- **Levels** — оролт, гаралтын хүрээ, гамма.
- **Suppress** — тодорхой өнгийг дарах (ногоон дэлгэцийн үлдэгдэл).
- **Histogram** — өнгөний хуваарилалтыг харах, тааруулах.
- **Colorspace** — RGB, HLS, YUV гэх мэт орон зайд ажиллах.

## Хэрэглээ
- Түлхүүрлэсэн урд элементийн өнгийг дэвсгэртэй тааруулах.
- Text+, бөөмийн өнгийг орчинд оруулах.
- Маскаар хэсгийн өнгийг өөрчлөх.

> Бүхэл кадрын өнгөний засварыг Color хуудсанд хийхийг зөвлөнө — скоп, Power Window, Qualifier, галерей тэнд байна. Fusion-ий CC нь компоузитийн элементүүдэд зориулагдсан.
`,

"defocus": `
## Зориулалт
Defocus нод нь энгийн бүдгэрүүлэлтээс ялгаатай **линзний бодит фокус алдалтыг** дуурайна. Гэрлийн цэгүүд дугуй, олон өнцөгт (bokeh) болж, гэгээн хэсэг цэцэглэнэ.

## Параметр
- **Lens Type** — Gaussian (энгийн), **Lens** (бодит bokeh).
- **Defocus Size** — хэмжээ.
- **Bloom Level / Threshold** — гэгээн хэсгийн цэцэглэлт.
- Lens горимд: Lens Shape (талын тоо), Angle, Blade curvature.
- **Blend**.

## Гүнд суурилсан фокус
Depth Map (Studio, Resolve FX) эсвэл 3D рендерийн Z сувгийг Defocus-ийн маск оролтод холбож, алсын хэсгийг л бүдгэрүүлнэ. Fusion-д ижил зорилгоор **Depth Blur** нод (Z буфертэй) байна.

## Хэрэглэх алхам
1. Дүрсийн дараа Defocus холбоно.
2. Lens Type → Lens, Defocus Size тохируулна.
3. Гэрлийн цэгүүд дугуй болж байгааг шалгана; Bloom Threshold-оор гэгээн хэсгийг л цэцэглүүлнэ.

> Lens горим Gaussian-аас олон дахин удаан. Тохируулж дуусаад л Lens руу шилжих, эсвэл Proxy горимд ажиллах нь зүйтэй.
`,

"delta-keyer": `
## Зориулалт
Delta Keyer нь ногоон, цэнхэр дэлгэцийг **арилгах (chroma key) гол нод**. Resolve-ийн хамгийн чанартай түлхүүрлэгч; үс, тунгалаг зүйл, хөдөлгөөний бүдгэрэлд сайн.

## Хэрэглэх алхам
1. MediaIn (ногоон дэлгэцтэй) → Delta Keyer → Merge (Foreground). Merge-ийн Background-д дэвсгэр.
2. Delta Keyer сонгоод Inspector → **Key** таб → Background Color дуслуур: дэлгэц дээр ногоон хэсгийг **чирж** (нэг цэг биш, муж) сонгоно.
3. Viewer-т Delta Keyer-ийн Alpha сувгийг харна ([k:A] эсвэл Viewer-ийн Color/Alpha цэс). Дэвсгэр бүрэн хар, урд бүрэн цагаан байх ёстой.
4. **Matte** таб → Threshold Low/High — хар, цагааныг цэвэрлэх; Erode — ирмэг агшаах; Blur — ирмэг зөөлрүүлэх.
5. **Fringe** таб → Spill Method, Spill Suppression — ирмэгийн ногоон үлдэгдлийг арилгах.
6. **Pre-Matte** таб — түлхүүрлэхээс өмнө дэлгэцийг жигдрүүлэх (Clean Plate нодтой хамт).

## Дэмжих нодууд
- **Clean Plate** — жигд бус дэлгэцийн "цэвэр" хувилбар үүсгэж, Delta Keyer-ийн Clean Plate оролтод.
- **Matte Control** — Delta Keyer-ийн дараа маскыг засах. [[matte-control]].
- Polygon garbage matte — дэлгэцийн гадна талын зүйлийг (тулгуур, гэрэл) хасах: Delta Keyer-ийн Garbage Matte оролтод.
- Color хуудсанд ч 3D Keyer / HSL Qualifier бий, гэвч бүрэн компоузит Fusion-д.

## Анхаарах
> Түлхүүрлэлтийг Alpha сувгаар шалгана, RGB-ээр биш. Alpha-д саарал (хагас тунгалаг) хэсэг байвал тэр хэсэг дэвсгэрээр нэвт харагдана.

> Хэт их Erode, Threshold нь үсийг "тайрч" хатуу ирмэг үүсгэнэ. Аль болох бага засварыг зорино; муу гэрэлтүүлэгтэй дэлгэцийг хэд хэдэн Delta Keyer-ээр (хэсэг бүрд маск) түлхүүрлэнэ.
`,

"displace": `
## Зориулалт
Displace нод нь нэг зургийн **гэрлийн утгаар** нөгөө зургийг **гажуудуулна**. Гэрэлтэй пиксэл нэг тийш, харанхуй нөгөө тийш түлхэнэ. Ус, шил, дулааны долгион, дэлгэцийн гажуудал, ноорхой хуудасны эффектэд.

## Оролт
- Оролт (Input) — гажуудах дүрс.
- **Foreground** — шилжүүлэлтийн зураглал (displacement map). Fast Noise, градиент, эсвэл өөр дүрс.

## Параметр
- **Type** — Radial (төвөөс), **XY** (X, Y тусдаа сувгаар).
- **Lock** — X, Y-г холбох.
- **X / Y Offset**, **Refraction Strength** — хүч.
- **X / Y Channel** — Foreground-ийн аль сувгийг ашиглах (Luminance, R, G, B, Alpha).
- Edges — захын үйлдэл.

## Хэрэглэх алхам
1. Fast Noise нод үүсгэж, Seethe Rate-аар хөдөлгөөнтэй болгоно.
2. Displace → Input-д дүрс, Foreground-д Fast Noise.
3. Refraction Strength-ийг багаас эхлэн нэмнэ.

> Foreground зураглалын нягтрал Input-тай ижил байх ёстой. Fast Noise-ийн Image таб → Auto Resolution-ийг шалгана.
`,

"ellipse-mask": `
## Зориулалт
Ellipse маск нь **дугуй, зууван** хэлбэрийн маск. Вингет, гэрлийн цэг, нүүр тойрсон зөөлөн бүс, тойрог хэлбэрийн лого зэрэгт.

## Параметр
- **Center** — байрлал (харьцангуй 0–1). Дэлгэц дээр чирж болно.
- **Width / Height** — хэмжээ. Lock — дугуй хадгалах.
- **Angle** — эргэлт.
- **Soft Edge** — ирмэг зөөлрүүлэх.
- **Border Width** — өргөсгөх, агшаах.
- **Invert** — урвуулах (гадна тал).
- **Level** — маскны хүч (0–1).

## Хэрэглэх алхам
1. [k:Shift+Space] → Ellipse, эсвэл хэрэглүүрийн мөр.
2. Нодын Effect Mask (цэнхэр) оролтод холбоно.
3. Дэлгэц дээр бариулаар хэмжээ, байрлалыг тохируулна.
4. Tracker-ийн үр дүнг Center-д холбож (баруун товч → Connect To) хөдөлгөөнийг дагуулна.

## Хослуулах
Хэд хэдэн маскыг нэг нодод: маск нодуудыг дараалан холбож, Inspector → Paint Mode (Merge, Add, Subtract, Multiply…).

> Color хуудасны Power Window-ийн Circle ижил зорилготой, харин Fusion-ий маск бүх нодод үйлчилнэ; ямар ч эффектийг хэсэгчлэх түгээмэл хэрэглүүр.
`,

"fusion-page": `
## Зориулалт
Fusion [k:Shift+5] нь **дүрслэлийн эффект, хөдөлгөөнт график, компоузит** хийх хуудас. Давхарга биш **нодын урсгалаар** ажиллана: дүрс зүүнээс баруун тийш нодуудаар дамжин боловсруулагдана.

## Бүтэц
- **Дээд хэсэг** — Viewer 1, Viewer 2 (эсвэл нэг), Inspector баруун талд.
- **Дунд** — хэрэглүүрийн мөр (түгээмэл нодууд).
- **Доод** — **Node Editor** (нодны талбар), Spline / Keyframes самбар (унтраалттай).
- **Доод мөр** — пиксэлийн заалт, санах ой.

## Ажиллах зарчим
1. Edit хуудасны timeline дээрх клипийг сонгоод Fusion руу орно. MediaIn1 → MediaOut1 хоёр нод бэлэн байна.
2. Дундуур нь нод нэмнэ: [k:Shift+Space] → нэр бичих, эсвэл хэрэглүүрийн мөрөөс товшино. Сонгосон нодын ард автоматаар холбогдоно.
3. Нодыг сонгоод [k:1] — Viewer 1-д, [k:2] — Viewer 2-т харна.
4. Inspector-т параметр тохируулна. Транспортын дагуу түлхүүр кадар.
5. Edit хуудас руу буцахад үр дүн timeline дээр шууд харагдана.

## Fusion Clip ба Composition
- **Fusion Composition** (Effects Library) — хоосон компоузит, MediaIn байхгүй.
- **Fusion Clip** (клипүүд сонгоод баруун товч → New Fusion Clip) — хэд хэдэн клипийг нэг компоузитод MediaIn1, MediaIn2… болгож оруулна.

## Гол нодууд
[[mediain]], [[mediaout]], [[merge]], [[transform-fusion]], [[text-plus-node]], [[background-node]], [[delta-keyer]], [[tracker]], [[polygon-mask]].

## Гүйцэтгэл
- Fusion → Purge Cache; Playback → Render Cache → Smart (Fusion Output).
- Нод дээр баруун товч → Cache to Disk.
- Дэлгэцийн Proxy (Viewer → баруун товч → Proxy).

> Fusion-ий үр дүн Color хуудасны өмнө, Edit-ийн Transform-ийн дараа ирдэг. Дараалал: Edit Inspector → Fusion → Color → Edit-ийн Composite/Opacity.
`,

"glow": `
## Зориулалт
Glow нод нь дүрсний **гэгээн хэсгээс гэрэл цацруулна**. Неон, гэрлийн туяа, шидэт эффект, Text+ гэрэлтүүлэг.

## Параметр
- **Filter** — Box, Bartlett, Multi-box, Gaussian.
- **Glow Size** — цацралын хэмжээ.
- **Gain** — хүч.
- **Threshold** (Glow Threshold) — аль гэрлийн түвшнээс дээш цацруулах.
- **Color Scale** — гэрлийн өнгө (R, G, B тусад нь).
- **Blend**, Apply Mode.
- Channels — Alpha-г мөн цацруулах эсэх.

## Хэрэглэх алхам
1. Text+ (эсвэл дүрс) → Glow.
2. Glow Size, Gain тохируулна.
3. Text+-ийн өнгө тодорхой бол Threshold-оор дэвсгэрийг оролцуулахгүй.
4. Илүү зөөлөн — Soft Glow нод.

## Компоузитод
Ихэвчлэн элементийг **Merge-ийн өмнө** гэрэлтүүлнэ: Text+ → Glow → Merge (Foreground). Alpha-г хамт цацруулбал тунгалаг дэвсгэр дээр гэрэл харагдана.

> Хэт Gain нь цагаан руу "шатааж" нарийн ширийнийг алдуулна. Хоёр Glow (жижиг + том хэмжээтэй) давхарлавал бодит гэрэл мэт болно.
`,

"inspector-fusion": `
## Зориулалт
Fusion-ий Inspector нь **сонгосон нодын бүх параметрийг** харуулна. Нод бүр өөрийн табуудтай (Controls, Settings…), дээд хэсэгт нодын нэр, унтраалга.

## Бүтэц
- **Tools** таб — сонгосон нодын параметрүүд. Хэд хэдэн нод сонгосон бол дараалан харагдана.
- **Modifiers** таб — параметрт залгасан хувиргагчид (Follower, Perturb, Path, Expression…).
- Нодын толгой — нэр (давхар товшиж солино), унтраалга (● — нодыг түр хаах), Pin/Version тэмдгүүд.
- Параметрийн табууд — жижиг тэмдгээр (жишээ нь Text+: Text, Layout, Transform, Shading, Image, Settings).
- **Settings** таб (бүх нодод) — Blend, Motion Blur, Apply Mask, Comments.

## Параметртэй ажиллах
- Гүйлгэгчийг чирэх, тоо бичих, талбар дээр хулганаа чирэх.
- Параметрийн баруун талын ◆ — түлхүүр кадар. Баруун товч → Animate, Remove Animation, Expression, Connect To, Modify With.
- Параметрийг **чирж** өөр параметр дээр буулгавал холбоос (Connect) үүснэ.
- [k:Ctrl] + чирэх — нарийн; параметрийн нэр дээр баруун товч → Reset.

## Хэрэглээ
- MediaIn сонгоход: Clip Name, Process Mode, Media Source, Layer, Source Color/Gamma Space.
- Merge сонгоход: Center, Size, Angle, Apply Mode, Operator, Blend.

> Inspector хоосон бол нод сонгогдоогүй байна. Нод дээр нэг товшилт — сонгоно; [k:1] — дэлгэцэнд гаргана (сонголт биш). Хоёулаа хэрэгтэй.
`,

"matte": `
## Тодорхойлолт
Matte (маск, багавч) нь дүрсний **аль хэсэг харагдах, аль нь харагдахгүйг** заасан хар цагаан зураг. Цагаан — бүрэн харагдана (тунгалаг биш), хар — бүрэн тунгалаг, саарал — хагас. Fusion-д ихэвчлэн **Alpha** сувгаар дамжина.

## Хаанаас үүсдэг
- Маск нодууд — Rectangle, Ellipse, Polygon, BSpline. [[polygon-mask]].
- Түлхүүрлэгч — Delta Keyer, Luma Keyer, Chroma Keyer. [[delta-keyer]].
- Файл — PNG, EXR, ProRes 4444-ийн Alpha суваг.
- Text+, Background — өөрийн Alpha.
- Magic Mask (Color хуудас) — Fusion руу дамжуулж болно.

## Төрөл
- **Effect Mask** — нодын үйлчлэх бүсийг хязгаарлана (цэнхэр оролт).
- **Garbage Matte** — түлхүүрлэгчид "энэ хэсгийг заавал хас".
- **Solid Matte** — "энэ хэсгийг заавал үлдээ".
- **Holdout** — Merge-д урд элементийг нүхлэх.

## Alpha-г харах
Viewer → Color/Alpha цэс, эсвэл [k:A]. Цагаан/хар зөв эсэхийг үргэлж энд шалгана.

## Pre-multiplied ба Straight
Fusion-д Alpha-тай дүрс ихэвчлэн premultiplied (өнгө × alpha). Merge зөв ажиллана. Хэрэв ирмэг хар хүрээтэй харагдвал Alpha Multiply / Alpha Divide нодоор засна.

> Маскны утга дүрсийг устгадаггүй — зөвхөн харагдах байдлыг заана. Маскыг өөрчилбөл нуугдсан хэсэг буцаж гарна.
`,

"matte-control": `
## Зориулалт
Matte Control нод нь маскыг **засварлах, нэгтгэх** нод: агшаах, өргөтгөх, бүдгэрүүлэх, урвуулах, өөр дүрсийн Alpha-г хуулах.

## Оролт
- Оролт (Background) — засах дүрс.
- **Foreground** — Alpha-г нь авах өөр дүрс (Matte Combine горимд).
- Garbage Matte, Solid Matte, Effect Mask.

## Параметр
- **Matte Combine** — Foreground-ийн аль сувгийг Alpha болгох (Copy Alpha, Combine Red…) ба Combine Op (Copy, Add, Subtract, Multiply…).
- **Matte Blur** — зөөлрүүлэх.
- **Matte Contract / Expand** — агшаах (−), өргөтгөх (+).
- **Matte Gamma**, **Matte Threshold Low/High** — тодруулах.
- **Invert Matte**.
- **Post-Multiply Image** — үр дүнг premultiply хийх.

## Хэрэглээ
- Delta Keyer-ийн дараа ирмэгийг ялимгүй агшааж, зөөлрүүлэх.
- Өөр дүрсийн Alpha-г (Text+) энэ дүрсэнд хуулж, текст хэлбэрээр тайрах.
- Хэд хэдэн маскыг нэгтгэх.

> Delta Keyer-ийн Matte таб ижил Erode, Blur параметртэй. Matte Control нь түлхүүрлэгчээс гадна ямар ч Alpha-тай ажиллахад зориулагдсан.
`,

"mediain": `
## Зориулалт
MediaIn нод нь Edit timeline дээрх **клипийг Fusion руу оруулна**. Клипийг Fusion руу орох бүрд MediaIn1 автоматаар үүснэ. Fusion Clip-д клип бүр MediaIn1, MediaIn2… болно.

## Inspector
- **Image** таб — Clip Name; **Process Mode** (Full Frames, Interlaced); **Media Source** — Timeline (timeline дээрх тайралт, In/Out-тэй) эсвэл Media Pool (бүх клип); **Layer** — олон давхаргат файлын давхарга; Global In/Out, Hold First/Last Frame; Loop.
- **Source Color Space / Gamma Space** — файлын өнгөний тэмдэглэгээ.
- **Audio** таб — дууг Fusion-д сонсох.
- **Settings**.

## Media Pool-оос нэмэх
Media Pool-оос клипийг нодны талбар руу чирвэл шинэ MediaIn үүснэ. Timeline-д байхгүй дүрс (лого, бүтэц) оруулахад.

## Анхаарах
> MediaIn нь Edit хуудасны Inspector-ийн Transform-ийн **дараах** дүрсийг биш, эх клипийг (эсвэл timeline-ийн тайралтыг) авчирна. Edit-ийн Zoom, Position Fusion-д харагдахгүй; Fusion-ий үр дүн дээр Edit-ийн Transform дараа нь үйлчилнэ.

> Timeline-д клипийг тайрч богиносгосон бол MediaIn мөн богиносно (Media Source: Timeline). Тайралтаас гадуурх кадар хэрэгтэй бол Media Source → Media Pool.

Холбоотой: [[mediaout]], [[fusion-page]].
`,

"mediaout": `
## Зориулалт
MediaOut нод нь Fusion-ий **үр дүнг timeline руу буцаана**. Нодны урсгалын хамгийн сүүлийн нод үргэлж MediaOut1-д холбогдох ёстой. Холбогдоогүй бол Edit хуудсанд клип хар эсвэл эх байдлаараа харагдана.

## Дүрэм
- Нэг клипт нэг MediaOut1 л ашиглагдана. Нэмэлт MediaOut үүсгэсэн ч timeline руу зөвхөн MediaOut1 гарна.
- MediaOut-ийн Alpha суваг timeline-д тунгалаг болно — Fusion Composition-д тунгалаг дэвсгэрээр гарчиг хийхэд.
- Нягтрал — MediaOut-д ирсэн дүрсний нягтрал timeline-ийнхээс өөр бол Edit-д тааруулагдана.

## Хэрэглэх алхам
1. Сүүлийн нодын (Merge, Transform…) гаралтыг MediaOut1-ийн оролт руу чирнэ.
2. MediaOut1-ийг сонгоод [k:1] дарж Viewer-т эцсийн үр дүнг шалгана.
3. Edit хуудас руу буцна.

## Шалгах
Edit-д үр дүн харагдахгүй бол Fusion-д MediaOut1-ийн оролт хоосон эсэх (шугам байгаа эсэх), эсвэл дундах нод унтраалттай (pass-through) эсэхийг шалгана.

> MediaOut-ийн өмнө нодыг сонгоод [k:Ctrl+P] дарвал pass-through (түр алгасах) болно — үр дүнг харьцуулахад. Санамсаргүй дарсан бол нод саарал харагдана.

Холбоотой: [[mediain]].
`,

"merge": `
## Зориулалт
Merge нь Fusion-ий **хамгийн чухал нод** — хоёр дүрсийг дээр доор нь давхарлана. Гурван оролттой: **Background** (шар гурвалжин), **Foreground** (ногоон), **Effect Mask** (цэнхэр). Foreground нь Background дээр Alpha-гаараа давхарлагдана.

## Параметр
- **Center** — Foreground-ийн байрлал (харьцангуй 0–1). Дэлгэц дээр чирж болно.
- **Size**, **Angle** — Foreground-ийн хэмжээ, эргэлт.
- **Apply Mode** — Normal, Screen, Dissolve, Multiply, Overlay, Soft Light, Hard Light, Color Dodge/Burn, Darken, Lighten, Difference, Exclusion, Hue, Saturation, Color, Luminosity.
- **Operator** — Over (стандарт), In, Held Out, Atop, Xor — Alpha-гаар хэрхэн огтлох.
- **Subtractive / Additive** — premultiplied тохиргоо (ирмэг хар бол өөрчилж үзнэ).
- **Alpha Gain**, **Burn In**, **Blend** — хүч.
- Flatten Transform, Edges, Filter Method.

## Хэрэглэх алхам
1. Merge нэмнэ: Background нодыг сонгоод [k:Shift+Space] → Merge — Background руу автоматаар холбогдоно.
2. Foreground нодын гаралтыг Merge-ийн ногоон оролт руу чирнэ.
3. Хурдан арга: нэг нодын гаралтыг нөгөө нодын **гаралт** дээр чирж буулгахад Merge автоматаар үүснэ.
4. Оролт солигдсон бол Merge сонгоод [k:Ctrl+T] — Background, Foreground солино.

## Дараалал
Merge-ийг дараалан холбож олон давхарга үүсгэнэ: BG → Merge1 (FG: лого) → Merge2 (FG: текст) → MediaOut. Гаралтын нягтрал Background-аас тодорхойлогдоно.

> Foreground харагдахгүй бол Alpha байхгүй (бүрэн тунгалаг) эсвэл Background болон Foreground урвуу холбогдсон байна. [k:Ctrl+T]-ээр солино.

> 3D объектод Merge биш **Merge 3D** ашиглана; Renderer 3D-ээр 2D болгоод дараа нь ердийн Merge-д оруулна.
`,

"node-graph": `
## Зориулалт
Node Editor (нодны талбар) нь Fusion-ий **гол ажлын орон зай**. Нодуудыг байрлуулж, гаралтаас оролт руу шугамаар холбож боловсруулалтын урсгал үүсгэнэ. Дүрс зүүнээс баруун тийш урсана.

## Навигаци
- Дунд товч чирэх (эсвэл [k:Alt] + чирэх) — гүйлгэх.
- [k:Ctrl] + дугуй — томруулах. Баруун товч → Scale → Scale to Fit.
- Хоосон талбар чирж нодуудыг хүрээлэн сонгоно.

## Нод нэмэх
- [k:Shift+Space] — Select Tool хайлт. Нэрийн эхний үсгүүдийг бичээд Enter.
- Хэрэглүүрийн мөрийн товч. Сонгосон нодын ард холбогдоно.
- Нодыг шугам дээр чирж буулгавал дундуур нь орно.
- Effects Library → Fusion/OpenFX-ээс чирнэ.

## Холбох
- Нодын баруун талын **дөрвөлжин** — гаралт. Түүнээс чирж нөгөө нодын **гурвалжин** оролт руу.
- Гурвалжингийн өнгө: шар — Background/үндсэн, ногоон — Foreground, цэнхэр — Effect Mask, цагаан — бусад.
- Шугамыг сонгоод [k:Delete] — салгана.
- Нэг гаралтыг олон нод руу холбож болно.

## Нод удирдах
- [k:1] [k:2] — Viewer-т гаргах. [k:Ctrl+P] — pass-through (түр алгасах).
- [k:F2] — нэр солих. Баруун товч → Set Color — өнгө өгөх.
- [k:Ctrl+T] — Merge-ийн оролт солих.
- [k:Ctrl+C] / [k:Ctrl+V] — хуулах; [k:Ctrl+Shift+V] — Paste Instance (холбоотой хуулбар).
- Баруун товч → Group — нодуудыг бүлэглэх; Macro — дахин ашиглах загвар.
- Нод дээр ● тэмдэг — Cache to Disk.

## Байрлал
Нод сонгоод баруун товч → Arrange → Line Up. Урсгалыг зүүнээс баруун тийш, дээрээс доош цэгцтэй байлгавал ойлгоход хялбар.

> Нодны талбарт олон салангид урсгал байж болно, харин MediaOut1-д холбогдсон урсгал л timeline-д гарна.
`,

"paint": `
## Зориулалт
Paint нод нь кадар дээр **шууд зурах, хуулах (clone), арилгах** нод. Толбо, утас, микрофон, лого арилгах, кадар засах (retouch), гараар зурсан эффект.

## Хэрэглэх алхам
1. Дүрсний дараа Paint нод холбоно; Paint-ийг Viewer-т гаргана.
2. Viewer-ийн дээд талд Paint хэрэгслүүд гарна: Stroke, Polyline Stroke, Circle, Rectangle, Clone, Paint Group…
3. Inspector → **Brush Controls** — хэмжээ, зөөлрөлт; **Apply Controls** — Color (зурах), **Clone** (өөр хэсгээс хуулах), Emboss, Erase, Merge, Smear, Stamp.
4. Clone горимд [k:Alt] дараад товшиж эх цэг заана, дараа нь зурна.
5. Стрий бүр Inspector-ийн Modifiers-т жагсана; тус бүрийг засаж, устгана.

## Stroke ба Multistroke
- **Stroke** — бүх кадарт хэвээр үлдэнэ (хөдөлгөөнгүй кадарт).
- **Multistroke** — зөвхөн зурсан кадарт (кадар бүр өөр засвар — тоос, гэмтэл).
- Stroke Duration-ийг Inspector → Stroke Controls-д өөрчилнө.

## Хөдөлгөөнтэй кадар
Объект хөдөлж байвал Paint-ийн өмнө Tracker ашиглаж, Paint-ийн Center-ийг мөрдөгчид холбоно, эсвэл Planar Tracker-аар тогтворжуулж (Steady) зураад буцаана (Unsteady).

> Color хуудасны Resolve FX → Revival → Patch Replacer, Object Removal (Studio) нь энгийн толбо, объектыг илүү хурдан арилгана. Paint нь гарын нарийн удирдлага хэрэгтэй үед.
`,

"particle-emitter": `
## Зориулалт
pEmitter нь **бөөмийн системийн** эх нод — тоос, цас, бороо, оч, гал, утаа, од зэрэг олон жижиг хэсгийг үүсгэнэ. Бөөмийн нодууд "p" үсгээр эхэлдэг ба төгсгөлд нь **pRender** заавал хэрэгтэй.

## Хамгийн бага бүтэц
pEmitter → pRender → Merge (Foreground) → MediaOut.

## pEmitter параметр
- **Controls** — Number (секундэд хэдэн бөөм), Lifespan (амьдрах хугацаа), Velocity (хурд), Angle, Variance (санамсаргүй хэлбэлзэл), Rotation, Size.
- **Style** — Point, Bitmap (өөрийн зураг), Blob, Brush, Line, Point Cluster. Color, Size Over Life, Fade In/Out.
- **Region** — хаанаас цацах: Point, Line, Rectangle, Sphere, Bitmap, Mesh.
- **Sets** — бөөмийг бүлэглэж өөр хүч үйлчлүүлэх.

## Хүч, үйлдэл
pEmitter-ийн дараа pRender-ийн өмнө: **pDirectionalForce** (татах хүч — салхи, таталцал), **pTurbulence** (эмх замбараагүй хөдөлгөөн), **pFriction**, **pBounce** (тусгалт), **pKill**, **pSpawn** (бөөмөөс бөөм), **pVortex**, **pFlock**.

## pRender
- Output Mode — 2D эсвэл 3D.
- Motion Blur, Depth of Field, Sub-frame calculation.
- Pre-Generate Frames — эхний кадарт л бөөм бэлэн байлгах.

## Хэрэглэх алхам
1. pEmitter → pRender үүсгэнэ. pRender-ийг Viewer-т гаргана.
2. Number, Lifespan, Velocity, Angle Variance тохируулна.
3. Style → Bitmap-д цасны ширхэгийн зураг холбож бодит болгоно.
4. pTurbulence нэмж амьд хөдөлгөөн.
5. pRender → Merge-ийн Foreground-д (Apply Mode: Screen — хар дэвсгэр арилна).

> Бөөмийн тоо их байвал маш удаан. Тохируулж байхдаа Number-ийг багасгаж, дуусаад нэмнэ. Random Seed өөрчилбөл өөр хуваарилалт.
`,

"planar-tracker": `
## Зориулалт
Planar Tracker нь **хавтгай гадаргууг** (хана, дэлгэц, хавтан, самбар, шал) бүхэлд нь мөрдөж, түүн дээр өөр дүрс наах (Corner Pin), тогтворжуулах (Steady), маскыг дагуулах (Planar Transform) нод. Цэгийн мөрдөгчөөс перспективийн өөрчлөлтийг илүү сайн ойлгоно.

## Хэрэглэх алхам
1. MediaIn → Planar Tracker. Planar Tracker-ийг Viewer-т гаргана.
2. Дэлгэц дээр мөрдөх гадаргууг **олон өнцөгтөөр** зурна (мөрдөгдөх ялгаатай бүтэцтэй хэсэг байх ёстой; цул өнгийн дэлгэц муу мөрдөгдөнө — тэмдэг тавьсан бол сайн).
3. Inspector → **Operation Mode** → Track. **Track Forward** (▶). Кадар бүрд мөрдөнө; Reference frame-ээс хойш, урагш.
4. Мөрдөлт дууссаны дараа Operation Mode-ийг сольж ашиглана:
   - **Corner Pin** — Corner Pin 1 оролтод дүрс холбож, гадаргуу дээр наана (дэлгэц дээр видео). Дөрвөн буланг чирж тааруулна.
   - **Steady** — гадаргууг тогтмол болгоно (дараа нь дээр нь зураад Planar Transform-оор буцаана).
   - **Steady Map** — маскыг тогтворжуулах.
5. Баруун товч → **Create Planar Transform** — мөрдөлтийг тусдаа нодоор гаргаж, маск (Polygon) -д дагуулна.

## Параметр
- **Pattern** — Tracker сонгох: Point, Hybrid Point/Area.
- **Motion Type** — Translation, Translation+Rotation, +Scale, Affine, **Perspective** (бүрэн).
- **Output** — Background, Background+Foreground, Foreground.
- Tracking → Track Channel, Track Quality.

## Хэрэглээ
- Утасны дэлгэц, зурагт, зарын самбар дээр өөрийн дүрс тавих.
- Хананд лого наах.
- Хөдөлж буй нүүрэн дээрх маскыг дагуулах (Planar Transform → Polygon).

> Гадаргуу хагас далдлагдвал (гар давахад) мөрдөлт алдагдана. Тэр хэсгийг Occlusion Mask-аар хасч мөрдөнө.
`,

"polygon-mask": `
## Зориулалт
Polygon маск нь цэг цэгээр зурсан **дурын хэлбэрийн** маск. Bezier бариултай тул шулуун, муруй аль алиныг зурна. Rotoscope (объектыг кадар бүрд гараар тайрах) -ийн үндсэн хэрэглүүр.

## Зурах
1. [k:Shift+Space] → Polygon, эсвэл хэрэглүүрийн мөр. Polygon-ийг холбох нодыг сонгосон байвал Effect Mask-д автоматаар холбогдоно.
2. Дэлгэц дээр товшиж цэг тавина. Чирж тавьбал бариултай (муруй) цэг.
3. Эхний цэг дээр товшиж хаана.
4. Цэг сонгоод чирэх; [k:Shift] + бариул — нэг талыг л; давхар товшилт — шулуун/муруй солих; [k:Delete] — цэг устгах; шугам дээр товшиж цэг нэмэх.

## Параметр
- **Level** — хүч; **Soft Edge** — зөөлрөлт; **Border Width**; **Invert**.
- **Paint Mode** — өөр масктай нийлүүлэх (Merge, Add, Subtract…).
- Position, Size, Angle — бүхэлд нь.
- Right-click on shape → Publish, Show Key Points, Reduce Points.

## Rotoscope
Polyline анхнаасаа хөдөлгөөнтэй (◆ асаалттай). Кадар солиод хэлбэрийг засахад түлхүүр кадар үүснэ. Ажлын дараалал: эхлэл, төгсгөл, дунд кадарт хэлбэр зурах → дунд хэсгүүдийг шалгаж засах. Spline Editor-т хөдөлгөөнийг харна. Хөдөлгөөн их бол Planar Tracker → Planar Transform-оор ерөнхий хөдөлгөөнийг дагуулж, Polygon-оор нарийвчилна.

## Хэрэглээ
- Delta Keyer-ийн Garbage Matte (дэлгэцийн гадна талыг хасах).
- Хэсэгчлэн эффект (нэг хүнийг л гэрэлтүүлэх).
- Объектыг тайрч дэвсгэр солих.

> Studio-гийн Magic Mask (Color хуудас) хүн, объектыг автоматаар маскална; Fusion-д Magic Mask нод бас бий. Гараар Polygon зурахаас өмнө түүнийг туршина.
`,

"rectangle-mask": `
## Зориулалт
Rectangle маск нь **дөрвөлжин** хэлбэрийн маск. Хэсэгчилсэн дэлгэц, хүрээ, дүрсийг тайрах, эффектийг тэгш өнцөгт бүсэд хязгаарлахад.

## Параметр
- **Center** — байрлал.
- **Width / Height** — хэмжээ. Lock.
- **Angle** — эргэлт.
- **Corner Radius** — булан дугуйлах.
- **Soft Edge**, **Border Width**, **Invert**, **Level**.

## Хэрэглэх алхам
1. Rectangle нэмээд нодын Effect Mask оролтод холбоно.
2. Дэлгэц дээр бариулаар хэмжээ тохируулна.
3. Хэд хэдэн Rectangle-ийг Paint Mode-оор нийлүүлж, олон цонхтой дизайн үүсгэнэ.

## Crop-той ялгаа
Crop нод дүрсний нягтралыг өөрчилж тайрдаг (пиксэл хасна). Rectangle маск нягтралыг хадгалж, зөвхөн харагдах бүсийг хязгаарлана.

> Ирмэг зөөлөн, дугуй булантай хүрээг Rectangle → Corner Radius + Soft Edge-ээр хийнэ. Text+-ийн ард дэвсгэр хайрцаг мөн адил.
`,

"renderer-3d": `
## Зориулалт
Renderer 3D нод нь **гурван хэмжээст үзэгдлийг** (Merge 3D-ийн гаралт) **хавтгай 2D зураг** болгож хувиргана. 3D урсгалын төгсгөл; түүний гаралтыг ердийн Merge, MediaOut руу холбоно.

## Параметр
- **Renderer Type** — Software Renderer (нарийн, удаан), **OpenGL Renderer** (хурдан, GPU).
- **Camera** — аль Camera 3D-гээр харах.
- **Enable Lighting / Shadows** — гэрэл, сүүдэр тооцоолох (Merge 3D-д гэрлийн нод байх ёстой).
- **Output Channels** — RGBA-аас гадна Z (гүн), Normal, Coverage, Material ID… (EXR-т, Depth Blur-д).
- **Depth of Field** (OpenGL) — камерын фокус.
- **Supersampling / Antialiasing** — ирмэг зөөлрүүлэх (Software), Anti-aliasing (OpenGL).
- Image таб — нягтрал.

## Хэрэглэх алхам
1. Shape 3D, Text 3D, Image Plane 3D → Merge 3D.
2. Camera 3D, Point/Spot Light → Merge 3D.
3. Merge 3D → Renderer 3D → Merge (2D) → MediaOut.
4. Renderer 3D-г Viewer-т гаргавал камерын харагдац (2D), Merge 3D-г гаргавал чөлөөт 3D харагдац.

> Гэрэл, сүүдэр асаагаагүй бол 3D объект хавтгай, сүүдэргүй харагдана. Гэрэлтэй болгохын тулд Merge 3D-д Point Light нэмж, Renderer 3D → Enable Lighting чагт.

> Software Renderer-ийн зарим боломж (motion blur, soft shadows) OpenGL-д байхгүй, эсрэгээр OpenGL-ийн DoF Software-д байхгүй.
`,

"shape-3d": `
## Зориулалт
Shape 3D нод нь **үндсэн гурван хэмжээст биет** үүсгэнэ: Plane (хавтгай), Cube (шоо), Sphere (бөмбөг), Cylinder (цилиндр), Cone (конус), Torus (цагираг), Ico Sphere.

## Параметр
- **Shape** — төрөл.
- Хэлбэр бүрийн хэмжээ — Width/Height/Depth, Radius, Subdivision (нарийвчлал).
- **Material** — Diffuse Color, Specular, Opacity; эсвэл Material оролтод Blinn/Phong/Ward материал, дүрс (texture) холбох.
- **Transform** — байрлал, эргэлт, хэмжээ (3D).
- Visibility, Lighting (гэрлийн нөлөө), Matte.

## Хэрэглэх алхам
1. Shape 3D → Merge 3D → Renderer 3D.
2. Shape → Sphere; Material → Diffuse Color.
3. Дүрс наах — MediaIn эсвэл Text+ гаралтыг Shape 3D-ийн **Material** оролтод холбоно (бөмбөг дээр лого).
4. Point Light нэмж, Renderer → Enable Lighting.
5. Transform → Rotation-д түлхүүр кадар — эргэх бөмбөрцөг.

## Хэрэглээ
- Эргэдэг лого, дэлхийн бөмбөрцөг (Sphere + газрын зураг).
- Хавтгай дээр видео тавьж 3D орчинд эргүүлэх (Image Plane 3D илүү тохиромжтой).
- Text 3D-тэй хамт гарчгийн орчин.

> Shape 3D-г ердийн 2D Merge-д шууд холбож болохгүй — заавал Merge 3D → Renderer 3D-ээр дамжина.
`,

"show-toolbar": `
## Зориулалт
Fusion цэс → Show Toolbar нь нодны талбарын дээрх **хэрэглүүрийн мөрийг** (түгээмэл нодуудын товчнууд) нууж, гаргана. Мөр нуухад нодны талбар өндөрсөнө.

## Хэрэглүүрийн мөрийн товчнууд (зүүнээс)
Background, Fast Noise, Text+, Paint | Polygon, BSpline, Ellipse, Rectangle | Merge, Transform, Resize, Crop | Color Corrector, Brightness Contrast, Hue Curves | Blur, Glow, Sharpen | Delta Keyer, Ultra Keyer, Luma Keyer | pEmitter, pRender | Shape 3D, Text 3D, Merge 3D, Camera 3D, Renderer 3D…

## Хэрэглээ
- Товч дээр товшиход сонгосон нодын ард нод нэмэгдэнэ.
- Товчийг нодны талбар руу чирж дурын байрлалд тавина.
- Хэрэглүүрийн мөрөөс олдохгүй нод — [k:Shift+Space] хайлт, эсвэл Effects Library → Fusion → Tools.

## Мөрийг өөрчлөх
Хэрэглүүрийн мөр дээр баруун товч → Customize — өөрийн товчнууд нэмж, хасна; хэд хэдэн мөрийг хадгална.

> Мөр алга болсон бол Fusion → Show Toolbar чагт байгаа эсэхийг шалгана.
`,

"text-plus-node": `
## Зориулалт
Text+ нь Fusion-ий **хүчирхэг текст нод**. Edit хуудасны Titles → Text+ ч мөн энэ нод. Үсэг бүрийг тусад нь хөдөлгөх, 3D болгох, олон давхар контур, градиент, зам дагуулах, бичигдэх (Write On) хөдөлгөөн.

## Табууд
- **Text** — бичвэр, Font, Size, Tracking, Line Spacing, Style; **Write On** — бичигдэх хөдөлгөөн (0→1 түлхүүр кадар).
- **Layout** — Point (цэгээс), Frame (хүрээнд багтаах, автомат мөр), Path (зам дагуу), Vertical (босоо). Center, Alignment.
- **Transform** — Character, Word, Line, Text түвшинд эргэлт, хэмжээ, зөөлт (үсэг бүр эргэх).
- **Shading** — 8 давхарга: Fill (дүүргэлт), Outline (контур), Shadow (сүүдэр), Border (хүрээ). Давхарга бүрд өнгө, градиент, Softness, Offset. Давхаргыг Select Element-ээр сонгож, Enabled чагт.
- **Image** — нягтрал; **Settings**.

## Modifiers
Text талбар дээр баруун товч → **Follower** — үсэг бүрд хоцролттой хөдөлгөөн (Delay); **Character Level Styling** — үсэг сонгоод өнгө, хэмжээ өөрчлөх; Text Scramble, Time Code, Text Timer.

## Хэрэглэх алхам (гарч ирэх хөдөлгөөн)
1. Text+ → Merge (Foreground) → MediaOut.
2. Text таб → бичвэр, фонт.
3. Кадар 0-д Write On = 0 (◆), кадар 24-д Write On = 1 → үсэг дараалан бичигдэнэ.
4. Эсвэл Modifiers → Follower → Transform → Size 0→1, Delay 0.1 — үсэг тус тусдаа гарч ирнэ.

## Монгол үсэг
Кирилл фонт (Roboto, Noto Sans, Arial) — Ө, Ү шалгана. Монгол бичиг — Layout → Vertical, Font: Noto Sans Mongolian (үсэг холбоос бүрэн биш байж болно).

> Text+ олон болбол Fusion удааширна. Дууссан гарчгийг Render Cache → Smart эсвэл Render In Place-ээр хөнгөлнө.
`,

"tracker": `
## Зориулалт
Tracker нод нь кадар доторх **цэгийн хөдөлгөөнийг** (Pattern) кадар бүрд олж, тэр хөдөлгөөнийг өөр объект, маск, эффектэд дамжуулна. Хөдөлж буй нүүр дээр бүдгэрүүлэлт дагуулах, дэлгэц дээр дүрс наах, тогтворжуулах.

## Хэрэглэх алхам
1. MediaIn → Tracker. Tracker-ийг Viewer-т гаргана.
2. Дэлгэц дээр гарч ирэх **Pattern** (дотоод дөрвөлжин — мөрдөх зүйл) ба **Search** (гадаад — хаанаас хайх) хүрээг мөрдөх ялгаатай, тод цэг (нүдний өнцөг, товч, тэмдэг) дээр байрлуулна.
3. Inspector → Trackers → Add — олон цэг (эргэлт, хэмжээнд 2+ цэг).
4. **Track Forward** (▶) / Track Reverse. Мөрдөлт алдагдвал зогсоож, хүрээг зөөгөөд үргэлжлүүлнэ.
5. Inspector → **Operation** таб:
   - **None** — зөвхөн өгөгдөл (бусад нодод Connect To-гоор ашиглах).
   - **Match Move** — Foreground оролтын дүрсийг хөдөлгөөнд наах. Merge — дэвсгэртэй нийлүүлэх; Stabilize (Position, Rotation, Scaling чагт) — тогтворжуулах.
   - **Corner Positioning** — 4 цэгээр дэлгэц наах.
   - **Perspective Positioning**.
6. Өөр нодод дамжуулах: жишээ нь Ellipse-ийн Center дээр баруун товч → **Connect To → Tracker1 → Steady Position / Unsteady Position / Offset Position**.

## Параметр
- Adaptive Mode — мөрдөх хэв маягийг кадар бүрд шинэчлэх (гэрэл өөрчлөгдөхөд).
- Frames Per Path Point, Match Tolerance.

## Planar Tracker-тэй харьцуулбал
[[planar-tracker]] гадаргууг бүхэлд нь мөрдөж перспективийг ойлгоно; Tracker цэгүүдийг мөрдөнө. Хавтгай гадаргуу — Planar; жижиг цэг, олон цэгийн хөдөлгөөн — Tracker.

> Color хуудасны Tracker самбар (Cloud, Point) илүү автомат, Power Window-д зориулагдсан. Fusion-ий Tracker нь дурын нодтой холбогдох тул уян хатан.
`,

"transform-fusion": `
## Зориулалт
Transform (Xf) нод нь дүрсийг **зөөх, эргүүлэх, томруулах, толин тусгал** хийх нод. Нягтралыг өөрчлөхгүй (Resize нод өөрчилнө).

## Параметр
- **Center** — байрлал (харьцангуй: 0.5, 0.5 төв). Дэлгэц дээр чирнэ.
- **Pivot** — эргэлт, томруулалтын төв.
- **Size** — томруулалт (1.0 = эх). Use Size and Aspect / Use X and Y Size.
- **Aspect** — X/Y харьцаа.
- **Angle** — эргэлт (градус).
- **Flip Horizontally / Vertically**.
- **Edges** — захаас гадуурх хэсэг: Canvas (тунгалаг), Wrap (эргэн орох), Duplicate (захын пиксэл сунгах), Mirror.
- **Filter Method** — Nearest, Box, Bi-Linear, Bi-Cubic, Catmull-Rom… (чанар).
- **Invert Transform** — урвуу.
- Settings → Motion Blur.

## Хэрэглээ
- Merge-ийн Foreground-ийг байрлуулах (Merge-ийн Center/Size-аас илүү удирдлагатай).
- Түлхүүр кадраар хөдөлгөөн (лого нисэх).
- Tracker-ийн Unsteady Position-д Center-ийг холбож дагуулах.
- Хэд хэдэн Transform дараалан — эргэлт, зөөлтийг тусад нь удирдах.

## Бусад хувиргагч
- **Resize** — нягтрал өөрчлөх (пиксэл хасах/нэмэх).
- **Crop** — тайрах (нягтрал багасна).
- **Letterbox** — харьцаа солих.
- **Camera Shake** — санамсаргүй чичрэлт.
- **Perspective Positioner**, **Corner Positioner** — 4 булангаар.

> Fusion-ий Transform Edit хуудасны Inspector-ийн Transform-оос үл хамаарна. Fusion дотор Transform-оор зөөсний дараа Edit-ийн Zoom, Position дээр нь давхар үйлчилнэ.
`,

"viewer-1-2": `
## Зориулалт
Fusion хуудсанд **хоёр дэлгэц** зэрэг ажиллана. Аль ч нодыг аль ч дэлгэцэнд гаргаж, урсгалын өөр өөр цэгийг зэрэг харна (жишээ нь зүүнд Delta Keyer-ийн Alpha, баруунд MediaOut-ийн эцсийн үр дүн).

## Нод гаргах
- Нод сонгоод [k:1] — Viewer 1 (зүүн), [k:2] — Viewer 2 (баруун).
- Нодыг Viewer руу чирж буулгах.
- Нодын доод талын хоёр жижиг цэг — аль дэлгэцэнд гарч байгааг харуулна; товшиж солино.

## Дэлгэцийн удирдлага (дээд мөр)
- Томруулалт — Fit, 100%, [k:Ctrl] + дугуй; дунд товч чирэх — гүйлгэх.
- **Color / Alpha** — [k:A] Alpha суваг, [k:C] өнгө; R, G, B тусад нь.
- **Split** (A/B) — хоёр нодыг нэг дэлгэцэнд хагасаар харьцуулах (Viewer-ийн дээд талын A/B товч; B руу өөр нод чирнэ).
- **3D View** — Merge 3D зэрэг 3D нодод Perspective, Front, Top, камер сонгох (баруун товч → Camera).
- **Guides** — аюулгүй бүс, тор. **LUT** — харах LUT.
- **Region of Interest** — зөвхөн хэсгийг тооцоолж хурдасгах.
- **Proxy** — бага нягтралаар үзэх (баруун товч → Proxy → Auto/2/3/4).
- **Show Controls** — дэлгэц дээрх бариулуудыг нуух, гаргах.

## Нэг эсвэл хоёр дэлгэц
Дэлгэцийн дээд баруун талын товчоор Single Viewer / Dual Viewer солино. Жижиг дэлгэцэнд нэг том дэлгэц тохиромжтой.

> Дэлгэц шинэчлэгдэхгүй, хар байвал сонгосон нод унтраалттай (pass-through), эсвэл оролтгүй байна. Viewer-ийн буланд харуулж буй нодын нэр гарна.
`

});
