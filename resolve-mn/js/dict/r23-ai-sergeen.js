/* ── Ангилал 23 · AI (DaVinci Neural Engine) ба сэргээн засварын хэрэглүүр ──
   Resolve Studio-гийн ухаалаг хэрэглүүрүүд: дүрс сэргээх, томруулах, маск, монтаж, дуу.
   Resolve 20-д нэмэгдсэн хэрэглүүрийн байрлалыг албан ёсны гарын авлагаар баталгаажуулна уу. */

RM.dict.add({ id:"ai-durs", label:"AI — дүрсийн сэргээн засвар", icon:"✦", page:"color",
note:"DaVinci Neural Engine-д суурилсан дүрсийн хэрэглүүрүүд. Ихэнх нь Studio хувилбарт л ажиллана.", terms:[
["DaVinci Neural Engine","DaVinci мэдрэлийн сүлжээний хөдөлгүүр","Resolve Studio-гийн AI хөдөлгүүр. Magic Mask, Super Scale, Voice Isolation, Smart Reframe зэрэг ухаалаг хэрэглүүр бүгд үүн дээр ажиллана. GPU шаардана.","","Studio хувилбарт л"],
["Super Scale","Ухаалаг томруулалт","Бага нягтралтай дүрсийг AI-аар 2x, 3x, 4x томруулж нарийн ширийнийг сэргээнэ. 1080p материалыг 4K timeline-д чанартай ашиглахад.","","Media Pool → баруун товч → Clip Attributes → Video → Super Scale"],
["UltraNR","Ultra шуугиан бууруулалт","Resolve 19-өөс нэмэгдсэн AI-д суурилсан орон зайн шуугиан бууруулалтын горим. Нарийн ширийнийг хадгалж шуугианыг арилгана.","","Color → Motion Effects → Spatial NR → Mode"],
["Speed Warp","Ухаалаг хурдны хувиргалт","Удаашруулсан клипт AI-аар завсрын кадар үүсгэдэг хамгийн чанартай Optical Flow горим. Studio.","","Inspector → Retime and Scaling → Motion Estimation → Speed Warp"],
["Object Removal","Объект арилгагч","Мөрдсөн маск дотор объектыг арилгаж, орчны дүрсээр AI-аар нөхнө. Утас, тэмдэг, хүнийг кадраас хасахад.","","Color → Effects → Resolve FX Revival → Object Removal"],
["Patch Replacer","Нөхөөс солигч","Кадрын нэг хэсгийг өөр хэсгээс хуулж нөхнө. Толбо, микрофон, лого нуухад хурдан.","","Color → Effects → Resolve FX Revival → Patch Replacer"],
["Deflicker","Анивчилт арилгагч","Гэрлийн давтамж, timelapse-ийн гэрлийн хэлбэлзлийг арилгана. Timelapse, Fluoro Light гэсэн хоёр загвартай.","","Resolve FX Revival → Deflicker"],
["Dust Buster","Тоос цэвэрлэгч","Хальсны тоос, зураас зэрэг нэг кадарт гарах гэмтлийг гараар зааж арилгах хэрэглүүр.","","Resolve FX Revival → Dust Buster"],
["Automatic Dirt Removal","Автомат тоос арилгагч","Хальс, мэдрэгчийн тоос, толбыг кадар хооронд харьцуулж автоматаар арилгана.","","Resolve FX Revival → Automatic Dirt Removal"],
["Dead Pixel Fixer","Үхсэн пиксэл засагч","Мэдрэгчийн гэмтэлтэй (үргэлж гэрэлтдэг эсвэл хар) пиксэлийг хөрш пиксэлээр нөхнө.","","Resolve FX Revival → Dead Pixel Fixer"],
["Chromatic Aberration","Өнгөний зөрүү засагч","Линзний захын өнгөний зөрүүг (улаан, цэнхэр хүрээ) арилгана.","","Resolve FX Revival → Chromatic Aberration"],
["Relight","Дахин гэрэлтүүлэгч","AI-аар кадрын гүн, гадаргууг тооцоолж виртуал гэрлийн эх нэмнэ. Studio.","","Color → Effects → Resolve FX Light → Relight"],
["Beauty","Гоо сайхны эффект","Арьсыг зөөлрүүлж, толбо, үрчлээг багасгах Studio эффект. Face Refinement-ээс энгийн.","","Color → Effects → Resolve FX Refine → Beauty"],
["IntelliTrack","Ухаалаг мөрдөгч","Resolve 19-ийн AI цэгийн мөрдөгч. Color хуудасны Tracker болон Fairlight-ийн дууны тэнцвэрийг объект дагуулахад.","","Color → Tracker → IntelliTrack"],
["AI Set Extender","AI тайз өргөтгөгч","Resolve 20-ийн хэрэглүүр: кадрын хүрээг текст зааврын дагуу AI-аар үүсгэж өргөтгөнө. Studio."]
]});

RM.dict.add({ id:"ai-montaj", label:"AI — монтаж, хадмал", icon:"✦", page:"edit",
note:"Транскрипц, зохиол, хадмал, олон камерт суурилсан ухаалаг монтажийн хэрэглүүр.", terms:[
["Text-Based Editing","Бичвэрт суурилсан монтаж","Ярианы транскрипцээс үг, өгүүлбэр сонгож клип тайрах, timeline-д оруулах арга. Studio.","","Media Pool → клип → баруун товч → Audio Transcription → Transcribe"],
["Remove Silence","Чимээгүй хэсэг арилгах","Ярианы завсрын чимээгүй хэсгийг босго, хамгийн бага уртаар олж устгах эсвэл тэмдэглэгээ тавих.","","Клип дээр баруун товч → Remove Silence"],
["AI IntelliScript","AI зохиолын монтаж","Resolve 20: бичсэн зохиолыг транскрипцтэй тааруулж, зохиолын дагуу timeline-ийг автоматаар эвлүүлнэ. Studio."],
["AI Animated Subtitles","AI хөдөлгөөнт хадмал","Resolve 20: хадмалын үгийг ярианы хэмнэлээр тодруулж хөдөлгөөнт болгоно. Studio."],
["AI Multicam SmartSwitch","AI олон камерын ухаалаг сэлгэлт","Resolve 20: олон камерын клипт ярьж буй хүнийг таньж өнцгийг автоматаар сэлгэнэ. Studio."]
]});

RM.dict.add({ id:"ai-duu", label:"AI — дуу", icon:"✦", page:"fairlight",
note:"Fairlight-ийн Neural Engine хэрэглүүр. Voice Isolation, Dialogue Leveler, Music Remixer зэрэг нь дууны эффектийн ангилалд.", terms:[
["AI Voice Convert","AI дуу хоолой хувиргагч","Resolve 20: нэг хүний яриаг өөр дуу хоолойн шинжтэй болгон хувиргана. Studio."],
["AI Audio Assistant","AI дууны туслах","Resolve 20: timeline-ийн замуудыг таньж (яриа, хөгжим, эффект), түвшин, шугам, эцсийн холилтыг автоматаар үүсгэнэ. Studio."],
["AI Dialogue Matcher","AI яриа тааруулагч","Resolve 20: өөр өөр орчинд бичсэн ярианы аяс, өнгө, дуурьсалыг лавлагаа клиптэй тааруулна. Studio."],
["AI IntelliCut","AI ухаалаг тайрагч","Resolve 20: ярианы замыг дуугарагч бүрээр тусдаа зам болгож (checkerboard), чимээгүй хэсгийг арилгана. Studio."],
["AI Detect Music Beats","AI хөгжмийн цохилт илрүүлэгч","Resolve 20: хөгжмийн цохилтыг таньж тэмдэглэгээ тавина; монтажийг хэмнэлд тааруулахад. Studio.","","Media Pool → хөгжмийн клип → баруун товч"]
]});
