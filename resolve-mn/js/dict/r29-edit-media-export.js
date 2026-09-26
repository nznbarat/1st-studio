/* ── Ангилал 29 · Edit хуудас — Media Pool-ийн цэс, Quick Export, Blackmagic Cloud Folder ──
   Resolve Studio 21-ийн Edit хуудас, 2026-09-26-ны дэлгэцийн зургууд:
   Media Pool-ийн AI шинжилгээний ⌄ жагсаалт (3 мөр), харагдацын ⌄ жагсаалт (3 мөр + гүйлгэгч),
   ☁ товчоор нээгдэх Blackmagic Cloud Folder цонх, дээд мөрийн Quick Export цонх (10 бэлдэц). */

RM.dict.add({ id:"edit-media-export", label:"Edit — Media Pool, Quick Export, Cloud", icon:"⇧", page:"edit",
note:"Edit хуудасны Media Pool-ийн дээд мөрийн унждаг жагсаалтууд, Blackmagic Cloud Folder цонх, Quick Export цонхны бэлдэц, талбар. Мөр бүр дэлгэцийн зургаас баталгаажсан.", terms:[
["AI Analysis Menu (Media Pool)","AI шинжилгээний цэс","Media Pool-ийн дээд мөрийн ⌄ жагсаалт: Perform AI Analysis in all Clips (зурагт чагттай), Perform AI Analysis in Selected Clips, Audio Transcription.","","Edit → Media Pool → дээд мөр ⌄"],
["Perform AI Analysis in all Clips","Бүх клипэд AI шинжилгээ","Media Pool-ийн бүх клипийг DaVinci Neural Engine-ээр шинжилж, агуулгаар (хүн, объект, үйлдэл, яриа) хайж олох боломжтой болгоно. Зурагт чагттай — асаалттай байх горим гэж ойлгогдоно.","","AI шинжилгээний ⌄ цэс"],
["Perform AI Analysis in Selected Clips","Сонгосон клипэд AI шинжилгээ","Зөвхөн сонгосон клипүүдийг AI-аар шинжилнэ — том төсөлд хугацаа хэмнэнэ.","","AI шинжилгээний ⌄ цэс"],
["Audio Transcription","Яриаг бичвэр болгох (Media Pool)","Клипийн яриаг бичвэр (transcript) болгоно — яриагаар хайх, бичвэрээс засварлах, хадмал үүсгэхэд. Зурагт саарал (клип сонгоогүй үед идэвхгүй бололтой).","","AI шинжилгээний ⌄ цэс"],
["Media Pool View Menu","Media Pool-ийн харагдацын цэс","Media Pool-ийн ▦ ⌄ жагсаалт: Metadata View, Thumbnail View (зурагт чагттай), List View, доор нь зургийн хэмжээний гүйлгэгч.","","Edit → Media Pool → дээд мөр ▦ ⌄"],
["Metadata View","Мэдээллийн карт харагдац","Клип бүрийг зураг ба гол мэдээлэл (нэр, урт, огноо, камер, тэмдэглэл)-тэй карт болгож харуулна — олон клипээс сонгоход.","","Media Pool-ийн харагдацын цэс"],
["Blackmagic Cloud Folder","Blackmagic Cloud хавтас","Media Pool-ийн ☁ товчоор нээгдэх цонх. Blackmagic Cloud дээрх хавтсыг сонгож, түүний файлыг компьютер руу татах, синк хийх тохиргоо.","","Edit → Media Pool → дээд мөр ☁"],
["Download Folder Location","Татах хавтасны байрлал","Blackmagic Cloud-оос татсан файл компьютерийн аль хавтсанд хадгалагдахыг заана (зурагт: хэрэглэгчийн хавтас\\DaVinci Resolve Media). Browse — өөрчлөх.","","Blackmagic Cloud Folder цонх"],
["Sync Proxies Only","Зөвхөн прокси синк хийх","Cloud-оос зөвхөн жижиг прокси файлыг татна — хурдан, диск бага эзэлнэ; эцсийн гаргалтад эх файл хэрэгтэй.","","Blackmagic Cloud Folder цонх → For Media Files"],
["Sync Proxies and Used Originals","Прокси ба хэрэглэсэн эх файлыг синк хийх","Прокси болон timeline-д хэрэглэсэн эх файлуудыг татна — эцсийн чанартай гаргах боломжтой. Зурагт сонгогдсон.","","Blackmagic Cloud Folder цонх → For Media Files"],
["Go to Blackmagic Cloud","Blackmagic Cloud руу очих","Хөтөчөөр Blackmagic Cloud-ийн сайтыг нээж, хавтас, төсөл, эрхийг удирдана.","","Blackmagic Cloud Folder цонх"],
["H.264 Master","H.264 мастер","Quick Export-ийн анхдагч бэлдэц (зурагт сонгогдсон): H.264, timeline-ийн нягтрал (зурагт 3840 x 2160), 24 fps, AAC стерео. Ерөнхий хэрэглээний жижиг, чанартай файл.","","Quick Export цонх"],
["H.265 Master","H.265 мастер","Quick Export-ийн бэлдэц: H.265 (HEVC) — H.264-өөс ойролцоогоор хоёр дахин жижиг файлд ижил чанар. Хуучин төхөөрөмж тоглуулахгүй байж магадгүй.","","Quick Export цонх"],
["HyperDeck (Quick Export)","HyperDeck бэлдэц","Blackmagic HyperDeck бичигч, тоглуулагч дээр шууд тоглох форматаар гаргах бэлдэц. Яг тохиргоо баталгаажаагүй.","","Quick Export цонх"],
["Vimeo (Quick Export)","Vimeo бэлдэц","Vimeo-д тохирсон форматаар гаргаж, данстай холбосон бол шууд байршуулна.","","Quick Export цонх"],
["TikTok (Quick Export)","TikTok бэлдэц","TikTok-т тохирсон форматаар гаргаж, данстай холбосон бол шууд байршуулна. Босоо timeline-д тохиромжтой.","","Quick Export цонх"],
["Presentations (Quick Export)","Presentations бэлдэц","Blackmagic Cloud-ийн Presentations руу байршуулж, захиалагч хөтөчөөр үзэж сэтгэгдэл үлдээх бэлдэц. Яг ажиллагаа баталгаажаагүй.","","Quick Export цонх"],
["Dropbox (Quick Export)","Dropbox бэлдэц","Гаргасан файлыг холбосон Dropbox данс руу шууд байршуулах бэлдэц.","","Quick Export цонх"],
["Replay (Quick Export)","Replay бэлдэц","Quick Export-ийн «Replay» бэлдэц. Нэрнээсээ Blackmagic-ийн Replay (шууд нэвтрүүлгийн давталт) ажлын урсгалтай холбоотой гэж ойлгогдоно — баталгаажаагүй.","","Quick Export цонх"],
["Limit Data Rate","Өгөгдлийн хурдыг хязгаарлах","Quick Export-ийн «Limit data rate to … Kb/s» чагт. Асаавал видеоны битийн хурдыг заасан утгаар (зурагт 80000 Kb/s) хязгаарлана — файл жижгэрч, чанар бага зэрэг буурна. Зурагт унтраалттай.","","Quick Export цонх"]
]});
