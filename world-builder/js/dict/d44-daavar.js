/* ═══ 44 · Дагавар үг, эцсийн нөхөлт ═══ */
/* Дагавар үгс нь орчуулгын хөдөлгүүрт WB.gram.POSTP‑оор ажилладаг —
   энд толийн хайлтад харагдахаар бас бүртгэв. */
WB.dict.add({ id:"postp", label:"Дагавар үг, байрлал заасан", icon:"🧷", w:{
"дотор":"inside","доторх":"within","дотроос":"from inside","дээр":"on","дээрх":"upon","дээрээс":"from above",
"дээгүүр":"above","доор":"beneath","доорх":"underneath","доогуур":"under","доороос":"from below",
"хажууд":"beside","хажуугаар":"past","дэргэд":"next to","ойролцоо":"near","ард":"behind","ардаас":"from behind",
"хойно":"behind","хойноос":"from behind","өмнө":"in front of","урд":"in front of","өмнөөс":"from the front",
"дунд":"among","дундуур":"through the middle of","хооронд":"between","тухай":"about","талаар":"regarding",
"руу":"toward","рүү":"toward","луу":"toward","лүү":"toward","хүртэл":"as far as","орчим":"around",
"эргэн тойронд":"all around","тойрон":"around","хамт":"together with","гадна":"outside","гадуур":"around the outside of",
"гадаа":"outside","дагуу":"along","дамжин":"through","туршид":"throughout","хажуугаас":"from the side",
"дээрээ":"on top","доороо":"underneath","цаана":"beyond","нааш":"hither","цааш":"onward","хамаагүй (үл хамаарах)":"regardless of"
}});

WB.dict.add({ id:"nohholt-1", label:"Эцсийн нөхөлт I", icon:"📕", w:{
"алхаа гишгээ":"one's gait","алхааны чимээ":"the sound of a step","хөлийн ул мөр":"the print of a foot",
"биеийн байрлал":"a body's posture","гарын хөдөлгөөн":"a movement of the hand","нүүрний хувирал":"a change of expression",
"харцны чиглэл":"the direction of a gaze","амьсгалын хэмнэл":"the rhythm of breathing",
"зүрхний хэмнэл":"the rhythm of the heart","биеийн хэл":"body language","дуу хоолойн өнгө":"the colour of a voice",
"ярианы хурд":"the pace of speech","үгийн сонголт":"the choice of words","чимээгүйн урт":"the length of a silence",
"хариултын хугацаа":"the delay before an answer","инээмсэглэлийн хэлбэр":"the shape of a smile",
"нүдний илэрхийлэл":"the expression in the eyes","хөмсөгний хөдөлгөөн":"a movement of the brows",
"уруулын татагдал":"a tightening of the lips","эрүүний чангарал":"a set jaw","мөрний байрлал":"the set of the shoulders",
"нурууны байрлал":"the line of the back","хүзүүний эргэлт":"a turn of the neck","толгойн налуу":"a tilt of the head",
"хуруунуудын байрлал":"the position of the fingers","алганы дулаан":"the warmth of a palm",
"гарын чичрэл":"a tremor in the hand","хөлийн тэвчээр":"the endurance of the legs","биеийн жин":"the weight of the body",
"биеийн хүч":"bodily strength","хөдөлгөөний уян хатан":"suppleness of movement","хөдөлгөөний хурд":"speed of movement",
"хөдөлгөөний нарийвчлал":"precision of movement","тэнцвэрээ барих":"keeping one's balance",
"тэнцвэрээ алдах":"losing one's balance","хүндийн төв":"a centre of gravity","хүчээ хэмнэх":"husbanding one's strength",
"хүчээ дуусгах":"spending one's strength","амьсгаагаа тэгшлэх":"steadying one's breath",
"зүрхээ тайвшруулах":"quieting one's heart","бодлоо цуглуулах":"collecting one's thoughts",
"анхаараа хурцлах":"sharpening one's attention","мэдрэмжээ хурцлах":"heightening the senses",
"тэвчээрээ сунгах":"stretching one's patience","хүслээ дарах":"reining in a desire",
"айдсаа даран зогсох":"standing firm against fear","эргэлзээгээ давах":"pushing past doubt",
"шийдвэртээ хүрэх":"arriving at a decision","алхмаа тавих":"taking one's step","замаа сонгох":"choosing one's road"
}});

WB.dict.add({ id:"nohholt-2", label:"Эцсийн нөхөлт II", icon:"📙", w:{
"өглөөний нар цонхоор":"morning sun at the window","үдийн сүүдэр богино":"short shadows at midday",
"үдшийн сүүдэр урт":"long shadows in the evening","шөнийн салхи хүйтэн":"a cold wind at night",
"үүрийн шүүдэр хүйтэн":"cold dew at dawn","өвлийн нар сул":"a weak winter sun",
"зуны нар шатаам":"a scorching summer sun","хаврын салхи хатуу":"a harsh spring wind",
"намрын агаар тунгалаг":"clear autumn air","цасны гэрэл нүд гялбуулам":"snow-glare on the eyes",
"мөсний хагарах чимээ":"the report of cracking ice","галын дулаан нүүрэнд":"the fire's heat on the face",
"хүйтэн шалны мэдрэмж":"the feel of a cold floor","дулаан хөнжлийн мэдрэмж":"the feel of a warm quilt",
"эсгийн үнэр":"the smell of felt","модны утааны үнэр":"the smell of wood smoke",
"морины хөлсний үнэр":"the smell of horse sweat","сүүний үнэр":"the smell of milk",
"хуучин авдрын үнэр":"the smell of an old chest","шинэ талхны үнэр":"the smell of new bread",
"цайны уур нүүрэнд":"tea steam on the face","аягны халуун":"the heat of a bowl",
"аягны хүйтэн ирмэг":"the cold rim of a cup","савхин бээлийн мэдрэмж":"the feel of leather gloves",
"торгоны гулгамтгай мэдрэмж":"the slip of silk","ноосны барзгар мэдрэмж":"the scratch of wool",
"чулууны хүйтэн гадаргуу":"the cold face of stone","модны дулаан гадаргуу":"the warm grain of wood",
"элсний нарийн ширхэг":"the fineness of sand","шаварны наалдамхай":"the cling of mud",
"усны хүйтэн урсгал":"the cold pull of water","салхины хүч нүүрэнд":"the push of wind on the face",
"нарны илч мөрөнд":"the sun's heat on the shoulders","борооны дусал арьсанд":"raindrops on the skin",
"цасны ширхэг сормуус дээр":"snowflakes on the lashes","тоос хоолойд":"dust in the throat",
"утаа нүдэнд":"smoke in the eyes","хүйтэн агаар уушгинд":"cold air in the lungs",
"өлсгөлөн гэдэсний мэдрэмж":"the hollow of hunger","цангасан хоолой":"a parched throat",
"ядарсан хөл":"weary legs","өвдсөн нуруу":"an aching back","хөшсөн хуруу":"stiffened fingers",
"нойрмог нүд":"heavy eyes","сэрүүн ухаан":"a clear head","хүнд толгой":"a heavy head",
"хөнгөн алхаа":"a light step","хүнд алхаа":"a heavy tread","тайван амьсгал":"an easy breath"
}});

WB.dict.add({ id:"nohholt-3", label:"Эцсийн нөхөлт III", icon:"📓", w:{
"үлдсэн цөөхөн өдөр":"the few days remaining","өнгөрсөн олон жил":"the many years gone by",
"хүлээсэн урт хугацаа":"the long wait","болзоот өдөр":"the appointed day","товлосон газар":"the appointed place",
"тохирсон цаг":"the agreed hour","сүүлчийн уулзалт":"the last meeting","анхны уулзалт":"the first meeting",
"санамсаргүй уулзалт":"a chance meeting","дахин учрал":"another encounter","удаан хүлээсэн хариу":"a long-awaited answer",
"хүлээгдээгүй мэдээ":"unexpected news","муу мэдээ":"bad news","сайн мэдээ":"good news","цуурхал тархах":"a rumour spreading",
"үнэн илрэх":"the truth coming out","нууц задрах (эцэст)":"a secret finally out","үлдсэн асуулт":"the question that remains",
"хариулаагүй асуулт":"an unanswered question","шийдэгдээгүй асуудал":"an unresolved matter",
"дуусаагүй ажил":"unfinished business","биелээгүй амлалт":"an unkept promise","биелсэн мөрөөдөл":"a dream come true",
"алдагдсан боломж":"a lost opportunity","олдсон боломж":"an opportunity found","сүүлчийн боломж":"the last chance",
"дахин боломж":"a second chance","эргэлт буцалтгүй шийдвэр":"an irrevocable decision",
"буцаах аргагүй алдаа":"an irreparable mistake","засаж болох алдаа":"a mistake that can be put right",
"хүлээн зөвшөөрсөн үнэн":"an accepted truth","үгүйсгэсэн үнэн":"a denied truth","мартагдсан нэр":"a forgotten name",
"дурсагдсан нэр":"a remembered name","үлдээсэн захиас":"a message left behind","үлдээсэн бэлэг":"a parting gift",
"үлдээсэн ул мөр":"the traces left behind","үлдээсэн хоосон газар":"the empty place left behind",
"эзгүй болсон гэр":"a house left empty","хаагдсан хаалга":"a door now shut","онгойсон зам":"a road now open",
"тодорсон ирээдүй":"a future coming clear","бүрхэг ирээдүй":"an uncertain future","шинэ өдөр":"a new day",
"шинэ эхлэлийн өглөө":"the morning of a new beginning","сүүлчийн үдэш":"a final evening",
"эцсийн харц":"a last look","эцсийн үг":"a final word","эцсийн алхам":"the final step","замын төгсгөл":"the road's end"
}});
