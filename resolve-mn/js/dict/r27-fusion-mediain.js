/* ── Ангилал 27 · Fusion — хэрэгслийн мөр, MediaIn нодын Inspector ──
   Resolve Studio 21-ийн Fusion хуудас, 2026-09-25-ны дэлгэцийн зургууд:
   хэрэгслийн мөрийн товч бүрийн tooltip ба доод мөрийн тайлбар (28 товч, бүгд),
   MediaIn нодын Inspector — Tools / Modifiers, Image / Audio / Settings таб. */

RM.dict.add({ id:"fusion-mediain", label:"Fusion — хэрэгслийн мөр, MediaIn Inspector", icon:"✧", page:"fusion",
note:"Fusion хуудасны хэрэгслийн мөрийн баталгаажсан товчнууд ба MediaIn нодын Inspector-ийн гурван таб. Мөр бүр дэлгэцийн зургаас.", terms:[
["Fusion Toolbar","Fusion хэрэгслийн мөр","Viewer ба Nodes самбарын хоорондох 28 товчтой мөр, 6 бүлэгт хуваагдсан. Товчийг дарвал сонгосон нодын ард шинэ нод нэмнэ; хулганаа тавихад нэр нь tooltip-оор, тайлбар нь доод мөрөнд гарна.","","Fusion → Viewer-ийн доор"],
["FastNoise","Хурдан шуугиан (FastNoise)","Процедурт шуугиан үүсгэгч нод — Perlin шуугианы хурдан хувилбар. Утаа, үүл, манан, бүтэц, хөдөлгөөнт гэрэл, Displace-ийн газрын зураг үүсгэхэд. Tooltip: \"FastNoise - Applies a faster version of Perlin noise\".","","Fusion хэрэгслийн мөр → 2"],
["Color Curves (Fusion)","Өнгөний муруй (Fusion)","Улаан, ногоон, цэнхэр, альфа суваг бүрийн муруйг засах нод. Tooltip: \"Color Curves - Allows changes to channel color curves\".","","Fusion хэрэгслийн мөр → 6"],
["MultiMerge","Олон оролттой Merge","Олон дүрсийг нэг нод дотор давхарга болгон нийлүүлэх Merge. Давхарга бүрийн холилт, байрлалыг тусад нь тохируулна. Tooltip: \"MultiMerge - Multi-input Merge\".","","Fusion хэрэгслийн мөр → 10"],
["Channel Booleans","Сувгийн логик үйлдэл","Урд (foreground) ба дэвсгэрийн (background) дүрсийн сувгуудыг хооронд нь хуулах, нэмэх, хасах зэргээр холих нод. Жишээ нь нэг дүрсийн гэрэлтэлтийг нөгөөгийн альфа болгох. Tooltip: \"Channel Booleans - Allows Boolean combinations of foreground channels with the background\".","","Fusion хэрэгслийн мөр → 11"],
["MultiPoly","Олон давхаргат полигон маск","Нэг нод дотор олон полигон маскийг давхарга болгон зурж удирдах маск. Олон хэсгийг зэрэг ротоскоп хийхэд. Tooltip: \"MultiPoly - Multi-layer Polygon Mask\".","","Fusion хэрэгслийн мөр → 18"],
["pDirectionalForce","Чиглэлт хүч (бөөмс)","Бөөмсийн системд нэг чиглэлд үйлчлэх хүч (салхи, таталцал мэт) нэмэх нод. pEmitter-ийн ард холбогдоно. Tooltip: \"pDirectionalForce - pDirectionalForce\".","","Fusion хэрэгслийн мөр → 20"],
["Spot Light","Чиглэлт гэрэл (3D)","3D орчинд конус хэлбэрийн чиглэлт гэрэл үүсгэх нод — прожектор, гар чийдэн мэт. Merge 3D-д холбож, Renderer 3D-д гэрэлтүүлгийг асаана. Tooltip: \"Spot Light - Generate a Spot Light\".","","Fusion хэрэгслийн мөр → 27"],
["Tools (Fusion Inspector)","Tools таб (Fusion Inspector)","Fusion Inspector-ийн дээд талын эхний таб — сонгосон нодын өөрийн тохиргоо.","","Fusion → Inspector → Tools"],
["Modifiers (Fusion Inspector)","Modifiers таб (Fusion Inspector)","Нодын параметрт залгасан модификаторуудын (илэрхийлэл, хөдөлгөөн үүсгэгч, tracker гэх мэт) тохиргоо. Модификатор байхгүй үед саарал — таны зурагт саарал.","","Fusion → Inspector → Modifiers"],
["Clip Name (MediaIn)","Клипийн нэр (MediaIn)","MediaIn нод аль клипийг уншиж байгааг харуулна. Таны зурагт: dreamina-2026-09-17-3642-Photor…","","Fusion → Inspector → MediaIn"],
["Image (MediaIn)","Image таб (MediaIn)","MediaIn нодын дүрсний тохиргоо: Process Mode, Media Source, Layer, Source Color Space, Source Gamma Space.","","Fusion → Inspector → MediaIn → Image"],
["Audio (MediaIn)","Audio таб (MediaIn)","MediaIn нодын дууны тохиргоо: AudioTrack, Sound Offset, AudioCache.","","Fusion → Inspector → MediaIn → Audio"],
["Settings (Fusion Inspector)","Settings таб (Fusion Inspector)","Fusion-ий бараг бүх нодод байдаг нийтлэг тохиргоо: маскийн хэрэглээ, холболтын шугам, давхарга, тайлбар.","","Fusion → Inspector → Settings"],
["Process Mode","Боловсруулах горим","Дүрсийг бүтэн кадраар (Full Frames) эсвэл хагас кадраар (field) боловсруулахыг сонгоно. Таны зурагт: Full Frames.","","MediaIn → Image"],
["Media Source (MediaIn)","Медиа эх (MediaIn)","MediaIn нодын дүрс хаанаас ирэхийг заана. Таны зурагт: Timeline.","","MediaIn → Image"],
["Layer (MediaIn)","Давхарга (MediaIn)","Олон давхаргатай файлын аль давхаргыг уншихыг сонгоно гэж ойлгогдоно. Таны зурагт: 0.","","MediaIn → Image"],
["Source Color Space","Эх өнгөний орон зай","Оролтын дүрсний өнгөний орон зайг заах хумигдсан хэсэг. Шугаман (linear) урсгалд ашиглана.","","MediaIn → Image"],
["Source Gamma Space","Эх гамма орон зай","Оролтын дүрсний гамма (дамжуулах муруй)-г заах хумигдсан хэсэг. Шугаман урсгалд муруйг арилгахад.","","MediaIn → Image"],
["AudioTrack (MediaIn)","Дууны зам (MediaIn)","Fusion-д тоглуулах дууны эхийг сонгоно. Таны зурагт: Timeline Audio [SEEDANCE_v1_30s].","","MediaIn → Audio"],
["Sound Offset","Дууны шилжилт","Дууг дүрстэй харьцуулан хэдэн кадраар урагш/хойш шилжүүлнэ. Таны зурагт: 0.0.","","MediaIn → Audio"],
["AudioCache","Дууны кэш","Fusion-д тоглуулах дууны түр хадгалалтын хэсэг. Доор нь Purge Audio Cache товч.","","MediaIn → Audio"],
["Purge Audio Cache","Дууны кэшийг цэвэрлэх","Хадгалсан дууны кэшийг устгаж дахин уншуулна. Дуу тасрах, хуучин дуу сонсогдох үед.","","MediaIn → Audio → AudioCache"],
["Apply Mask Inverted","Маскийг урвуулж хэрэглэх","Нодод залгасан эффект маскийг урвуулна — нод маскийн гадна талд үйлчилнэ. Түлхүүр кадартай.","","Inspector → Settings → Settings"],
["Multiply by Mask","Маскаар үржүүлэх","Дүрсний өнгийг маскийн утгаар үржүүлж, маскаас гадна хэсгийг хар/тунгалаг болгоно. Түлхүүр кадартай.","","Inspector → Settings → Settings"],
["Hide Incoming Connections","Орох холболтыг нуух","Nodes самбарт энэ нод руу орж ирэх холболтын шугамыг нууна. Олон шугамтай нарийн схемийг цэгцлэхэд.","","Inspector → Settings → Settings"],
["Main Layer Name","Үндсэн давхаргын нэр","Нодын гаргах үндсэн давхаргын нэр. Олон давхаргатай урсгалд ашиглагдана гэж ойлгогдоно. Таны зурагт хоосон.","","Inspector → Settings → Layers"],
["Effect Mask Layer","Эффект маскийн давхарга","Эффект маскийг аль давхаргаас авахыг сонгоно гэж ойлгогдоно. Таны зурагт: Auto. Түлхүүр кадартай.","","Inspector → Settings → Layers"],
["Comments (Fusion Inspector)","Тайлбар (Fusion Inspector)","Нодын тухай тэмдэглэл бичих талбар. Багийн ажилд, нарийн схемд юу хийснээ сануулахад.","","Inspector → Settings → Comments"],
["Status Bar (Fusion)","Төлөвийн мөр (Fusion)","Fusion хуудасны доод мөр. Хэрэгслийн товч дээр хулганаа тавихад нэр, тайлбар нь зүүн талд; Viewer дээр пикселийн байрлал, өнгө; баруун талд санах ойн хэрэглээ (зурагт: 9% - 2973 MB).","","Fusion → доод мөр"]
]});
