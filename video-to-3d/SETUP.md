# Алхам алхмаар: тэгээс эхлээд эхний render хүртэл

Энэ бол `video-to-3d` хэрэгслийг **анх удаа ажиллуулах** заавар.

Хоёр зам байгаа:

| | **А зам — fal.ai** | **Б зам — локал ComfyUI** |
|---|---|---|
| Бэлтгэлийн хугацаа | ~10 минут | ~1–2 цаг (ихэнх нь татах) |
| Өртөг | секунд тутам ≈ $0.28 | **төлбөргүй** |
| Юу хэрэгтэй | API түлхүүр | NVIDIA GPU 12GB+ |

**Зөвлөмж:** эхлээд **А зам**-аар 1 клип хөрвүүлж хэрэгсэл хэрхэн ажилладгийг
нүдээр хараарай (≈ $3). Дараа нь Б зам руу тайван шилжинэ. Ингэвэл асуудал
гарахад „хэрэгсэл буруу юу, ComfyUI буруу юу" гэж эргэлзэхгүй.

---

# 0. Урьдчилсан шалгалт

```bash
nvidia-smi          # GPU болон драйвер харагдах ёстой
python --version    # 3.9-ээс дээш   (Linux/mac дээр python3)
ffmpeg -version     # суулгаагүй бол 1-р алхам
git --version
```

`nvidia-smi` дээр **MiB / Total** гэсэн тоог тэмдэглэж аваарай — 12000 MiB-ээс
дээш байвал Б зам бүрэн ажиллана.

---

# 1-р алхам. Python ба ffmpeg

### Windows

1. **Python** — [python.org/downloads](https://www.python.org/downloads/) →
   суулгахдаа **„Add python.exe to PATH"** гэснийг заавал тэмдэглэнэ.
2. **ffmpeg** — PowerShell дээр:

```powershell
winget install Gyan.FFmpeg
```

Дараа нь PowerShell-ээ **хааж дахин нээгээд** `ffmpeg -version` шалгана.

### Linux

```bash
sudo apt update && sudo apt install -y python3 python3-pip ffmpeg git
```

### macOS

```bash
brew install python ffmpeg git
```

---

# 2-р алхам. Хэрэгслээ татах

```bash
git clone https://github.com/nznbarat/1st-studio.git
cd 1st-studio
git checkout claude/video-to-3d-render-script-q2b77o
cd video-to-3d
```

> Салбар нь `main` руу нэгдсэн бол `git checkout` шаардлагагүй.

Гадны Python сан **шаардахгүй** — стандарт сангаар л ажиллана.
(fal.ai ашиглах үед л `pip install fal-client` хэрэгтэй.)

---

# 3-р алхам. Юу ч суулгахгүйгээр шалгах

Эдгээр нь интернэт, түлхүүр, GPU шаардахгүй:

```bash
python -m v2v3d styles                 # 10 загвар харагдах ёстой
python -m unittest discover -s tests   # 60 тест ногоон байх ёстой
```

Одоо өөрийн видеонуудаа нэг хавтсанд хийгээд **төлөвлөгөөг** хараарай:

```bash
python -m v2v3d plan -i "C:\видео\миний_клипүүд"
```

Файл бүрийн урт, хэдэн хэсэгт хуваагдах, ойролцоо өртөг харагдана.
**Энэ алхам мөнгө зарцуулахгүй.**

---

# 4-р алхам (А зам). fal.ai-аар нэг клип турших

```bash
pip install fal-client
```

[fal.ai](https://fal.ai) дээр бүртгүүлж түлхүүрээ аваад:

```powershell
# Windows PowerShell
$env:FAL_KEY="түлхүүрээ_энд"
```

```bash
# Linux / macOS
export FAL_KEY="түлхүүрээ_энд"
```

Хамгийн хямд тохиргоогоор нэг файл:

```bash
python -m v2v3d run -i "C:\видео\миний_клипүүд" --limit 1 --resolution 480p
```

`output/` дотор эх нэртэйгээ файл гарч ирвэл **хэрэгсэл бүрэн ажиллаж байна**.
Одоо Б зам руу орж болно.

---

# 5-р алхам (Б зам). ComfyUI суулгах

### Windows — хамгийн хялбар (portable)

1. [ComfyUI releases](https://github.com/comfyanonymous/ComfyUI/releases) хуудаснаас
   `ComfyUI_windows_portable_nvidia.7z` татна.
2. **Зайтай биш, кирилл үсэггүй зам** руу задална — жишээ нь `C:\AI\`.
3. `run_nvidia_gpu.bat` дээр давхар товшино.
4. Хөтөч дээр `http://127.0.0.1:8188` нээгдэнэ.

### Linux / macOS

```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py --listen 127.0.0.1 --port 8188
```

> ComfyUI-г ажиллуулж байх үед терминалаа хаахгүй. Хөрвүүлэлт хийхдээ
> **хоёр дахь терминал** нээж ажиллана.

---

# 6-р алхам. Wan VACE моделиудыг татах

VACE бол видеог **хөдөлгөөний лавлагаа** болгож ашигладаг Wan-ы хувилбар —
яг л Seedance-ийн video reference шиг ажиллана.

ComfyUI-ийн албан ёсны заавраас (`docs.comfy.org` → Tutorials → Video → Wan VACE)
холбоосуудыг аваад дараах хавтсуудад хийнэ:

| Юу | Хаана хийх |
|---|---|
| VACE diffusion модель (`wan2.1_vace_14B_*.safetensors`) | `ComfyUI/models/diffusion_models/` |
| Текст кодлогч (`umt5_xxl_*.safetensors`) | `ComfyUI/models/text_encoders/` |
| VAE (`wan_2.1_vae.safetensors`) | `ComfyUI/models/vae/` |

**Картныхаа санах ойд тааруулж сонгоно:**

| VRAM | Аль хувилбар |
|---|---|
| 24GB+ | `14B_fp16` |
| 16GB | `14B_fp8` |
| 12GB | `1.3B` эсвэл `14B_fp8` + `--resolution 480p` |

Windows portable дээр зам нь:
`C:\AI\ComfyUI_windows_portable\ComfyUI\models\diffusion_models\`

> Файлын нэр таны татсантай яг таарах албагүй. 8-р алхмын `doctor` команд
> **серверт байгаа бодит нэрсийг** хэлж өгнө — санаа зовох хэрэггүй.

---

# 7-р алхам. ComfyUI дотор **гараар** нэг клип туршина ⚠️

**Энэ алхмыг битгий алгасаарай.** Хэрэгсэл нь ComfyUI-г л удирддаг, тиймээс
ComfyUI дээр гараар ажиллахгүй байгаа юм автоматаар ч ажиллахгүй.

1. ComfyUI дээр дээд талын **Workflow → Browse Templates** → `Wan VACE`
   загварыг нээнэ (эсвэл Video ангиллаас video-to-video-г сонгоно).
2. Богино клип (3–5 секунд) оруулж, промтод жишээ нь
   `untextured grey 3D clay render, no textures, soft studio light` гэж бичнэ.
3. **Queue** дарж хүлээнэ. Эхний удаа модель ачаалахад 2–5 минут нэмж болно.
4. Гарсан үр дүн танд таалагдах хүртэл `steps`, `cfg`, `strength`-ыг тохируулна.

Ажиллаж эхэлмэгц:

**Settings (⚙) → Dev Mode → асаах** → дараа нь
**Workflow → Export (API)** → `миний.json` нэрээр хадгална.

> Энэ файл бол таны „жор". Хэрэгсэл үүнийг авч видео, промт, seed-ыг нь
> клип бүрт сольж дахин дахин ажиллуулна.

---

# 8-р алхам. `doctor` — ажиллуулахаас өмнөх шалгалт

ComfyUI асаалттай байхад, хоёр дахь терминал дээр:

```bash
cd 1st-studio/video-to-3d
python -m v2v3d doctor --workflow "C:\зам\миний.json"
```

Гарах ёстой зүйл:

```
Оруулах цэгүүд (авто-танилт):
  video     6.file (LoadVideo)
  prompt    4.text (CLIPTextEncode)
  seed      10.seed (KSampler)
  frames    8.length (WanVaceToVideo)
  ...
✅ Workflow сервер дээрх зангилаа, моделиудтай бүрэн таарч байна.
```

| Юу гарвал | Юу хийх |
|---|---|
| `❌ '...' зангилаа сервер дээр алга` | тухайн custom node дутуу — ComfyUI Manager-ээр суулгах |
| `❌ модель олдсонгүй. Байгаа нь: ...` | санал болгосон нэрийг ComfyUI дотроо сонгоод дахин Export (API) |
| `❌ video цэг олдсонгүй` | `--map video=ЗАНГИЛАА.ОРОЛТ` гэж гараар заах |
| `⚠️` сануулга | ихэнхдээ асуудалгүй — ажиллуулж үзээд болно |

---

# 9-р алхам. Эхний нэг файл

```bash
python -m v2v3d run --provider comfy \
  --workflow "C:\зам\миний.json" \
  -i "C:\видео\миний_клипүүд" \
  --limit 1 --resolution 480p --chunk-seconds 5
```

Терминал дээр ингэж харагдана:

```
📦 1 файл — хөрвүүлэх 1, хэсэг 3, ойролцоо өртөг $0.00
   ▸ клип.mp4 [1/3] 0.0–5.0с
   ▸ клип.mp4 [2/3] 5.0–10.0с
   ▸ клип.mp4 [3/3] 10.0–12.0с
✅ клип.mp4 → output/клип.mp4
```

ComfyUI-гийн терминал дээр явц харагдана. Хэсэг тутам 3–10 минут.

---

# 10-р алхам. Бүх багц

Үр дүн таалагдвал:

```bash
python -m v2v3d run --provider comfy \
  --workflow "C:\зам\миний.json" \
  -i "C:\видео\миний_клипүүд" \
  --style blockout --resolution 720p
```

- Дундуур зогсоовол (`Ctrl+C`) — **ижил тушаалаа дахин өгөхөд үргэлжилнэ**.
  Бэлэн болсон файлуудыг алгасна.
- Явц `output/_manifest.json` дотор бүртгэгдэнэ.
- Дахин хийлгэх бол `--overwrite`.

---

# Хугацааны ойролцоо тооцоо (RTX 4090, 480p, 5с хэсэг)

| Ажил | Хугацаа |
|---|---|
| Нэг хэсэг (5с) | 3–6 минут |
| Нэг клип (15с = 3 хэсэг) | 10–20 минут |
| 20 клип | 4–7 цаг |

Шөнөжингөө ажиллуулах нь хэвийн. Компьютер унтахгүй байхаар тохируулаарай.

---

# Түгээмэл асуудлууд

| Шинж тэмдэг | Шийдэл |
|---|---|
| `ffmpeg олдсонгүй` | 1-р алхам. Эсвэл `set V2V3D_FFMPEG=C:\зам\ffmpeg.exe` |
| `ComfyUI сервер хариу өгсөнгүй` | ComfyUI асаалттай эсэх, порт 8188 мөн эсэх |
| `CUDA out of memory` | `--resolution 480p`, `--chunk-seconds 3`, `--set 10.steps=8` |
| Хэсэг хооронд өнгө үсэрч байна | `--seed 12345`, `--chunk-seconds 15`, `--style-image ref.png` |
| Гаралт эх видеонд огт төстэй биш | 7-р алхам руу буц — ComfyUI дээр гараар шалга |
| Маш удаан | `--resolution 480p`, `--set 10.steps=8`, эсвэл 1.3B модель |
| Кирилл нэртэй файл алдаа өгч байна | ажиллана — гэхдээ ComfyUI-ийн зам дээр кирилл байвал болохгүй |

---

# Хамгийн богино хураангуй

```bash
# нэг удаа
git clone https://github.com/nznbarat/1st-studio.git
cd 1st-studio/video-to-3d
# ComfyUI суулгах → моделиуд татах → нэг клип гараар турших → Export (API)

# бүр болгонд
python -m v2v3d doctor --workflow миний.json          # шалгах
python -m v2v3d plan -i ~/videos --provider comfy      # төлөвлөх
python -m v2v3d run  -i ~/videos --provider comfy \
       --workflow миний.json --style blockout          # хөрвүүлэх
```

Дэлгэрэнгүй сонголтууд: [README.md](README.md)
