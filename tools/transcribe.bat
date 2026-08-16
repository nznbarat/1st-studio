@echo off
:: ============================================================================
::  1st Studio — Transcribe
::  YouTube холбоос эсвэл дуу/видео файлыг авч, англи бичвэр гаргаад,
::  Claude-аар монгол болгоно — нэг товшилтоор, эхнээс нь дуустал.
::
::  Гаралт:  transcripts\<нэр>.srt      англи
::           transcripts\<нэр>.mn.srt   монгол
::           transcripts\<нэр>.mn.txt   монгол, цагийн тэмдэгтэй
::
::  Байрлуулах газар: faster-whisper-xxl.exe болон yt-dlp.exe-тэй ИЖИЛ хавтас.
::  Ашиглах: давхар товш, эсвэл файл/шошгыг энэ дээр чирж тавь.
:: ============================================================================

setlocal enableextensions enabledelayedexpansion
chcp 65001 >nul
color 0A
title 1st Studio — Transcribe

set "DP=%~dp0"
set "OUTDIR=%DP%transcripts"

:: ── Тохируулж болох зүйлс ───────────────────────────────────────────────────
set "MODEL=medium"
set "LANG=English"
set "KEEP_AUDIO=1"

:: Бичвэр гарсны дараа Claude-аар шууд орчуулах уу (1 = тийм)
:: Түлхүүрээ энэ хавтсанд anthropic-key.txt файлд бич.
set "TRANSLATE=1"
set "TR_LANG=Mongolian"
set "TR_MODEL=claude-opus-5"

:: Хөгжмийн нэр томьёо — Whisper-т урьдчилан сануулж, буруу сонсохоос сэргийлнэ
set "IPROMPT=This is a video about music production and AI music tools. Terms that appear: Suno, Udio, ElevenLabs, DAW, stem, stems, BPM, tempo, key, mixdown, mastering, EQ, compressor, limiter, reverb, delay, sidechain, LUFS, headroom, MIDI, VST, plugin, arrangement, intro, verse, chorus, bridge, hook, riff, sample, loop, quantize, transient, waveform, timeline, track, automation, gain staging, dry, wet, prompt, seed, extend, remix, cover, persona, workspace, render, export."

echo.
echo   ============================================
echo      1st STUDIO  ·  Transcribe
echo   ============================================
echo.

:: ── Хэрэгслүүд байгаа эсэх ──────────────────────────────────────────────────
if not exist "%DP%faster-whisper-xxl.exe" (
  echo   [X] faster-whisper-xxl.exe олдсонгүй.
  echo       Энэ .bat файлыг тэр програмтай ИЖИЛ хавтсанд тавина уу.
  goto :fail
)

if not exist "%OUTDIR%" mkdir "%OUTDIR%"

:: ── Оролт: чирж тавьсан файл уу, эсвэл холбоос уу ──────────────────────────
set "AUDIO="
set "URL="

if not "%~1"=="" (
  :: Чирж тавьсан зүйл — локал файл бол шууд хөрвүүлнэ
  if exist "%~1" (
    set "AUDIO=%~1"
    echo   Файл:  %~nx1
    goto :transcribe
  )
  set "URL=%~1"
)

if "%URL%"=="" (
  echo   YouTube холбоосоо буулгаад Enter дар
  echo   ^(эсвэл дуу/видео файлыг энэ цонх руу чирж тавь^)
  echo.
  set /p "URL=   > "
)

if "%URL%"=="" (
  echo.
  echo   [X] Юу ч оруулаагүй байна.
  goto :fail
)

:: ── 1. Аудио татах ──────────────────────────────────────────────────────────
if not exist "%DP%yt-dlp.exe" (
  echo   [X] yt-dlp.exe олдсонгүй — холбоосоор татах боломжгүй.
  echo       Файлаа гараар татаад энэ .bat дээр чирж тавина уу.
  goto :fail
)

echo.
echo   [1/3] Аудио татаж байна...
echo.

:: Цэвэр түр хавтас руу татна — ингэснээр татсан файлыг нэрийг нь мэдэхгүйгээр
:: олж чадна. yt-dlp-ийн хувилбар бүр дээр ажиллана.
:: --restrict-filenames  →  кирилл/тусгай тэмдэгтгүй нэр (batch-д аюулгүй)
set "TMPDIR=%OUTDIR%\_audio"
if exist "%TMPDIR%" rd /s /q "%TMPDIR%"
mkdir "%TMPDIR%"

"%DP%yt-dlp.exe" -f bestaudio/best --no-playlist --restrict-filenames ^
  -o "%TMPDIR%\%%(title).80s.%%(ext)s" "%URL%"

if errorlevel 1 (
  echo.
  echo   [X] Татаж чадсангүй. Холбоос зөв эсэх, интернэт холболтоо шалгана уу.
  echo       Насны хязгаартай / хувийн видео байж болно.
  goto :fail
)

:: Түр хавтас дахь цорын ганц файлыг авна
for /f "usebackq delims=" %%F in (`dir /b /a-d "%TMPDIR%" 2^>nul`) do (
  set "AUDIO=%TMPDIR%\%%F"
  goto :got_audio
)

echo.
echo   [X] Татсан файл олдсонгүй.
goto :fail

:got_audio

echo.
echo   [OK] !AUDIO!

:transcribe
:: ── 2. Бичвэр болгох ────────────────────────────────────────────────────────
echo.
echo   [2/3] Бичвэр болгож байна  ^(загвар: %MODEL%, хэл: %LANG%^)
echo         Эхний удаа загвар татагдана — хэдэн минут орно.
echo.

"%DP%faster-whisper-xxl.exe" "!AUDIO!" ^
  -m %MODEL% ^
  -l %LANG% ^
  -f srt txt ^
  -o "%OUTDIR%" ^
  --initial_prompt "%IPROMPT%" ^
  -pp

if errorlevel 1 (
  echo.
  echo   [X] Хөрвүүлэлт амжилтгүй боллоо. Дээрх алдааг уншина уу.
  goto :fail
)

:: ── 3. Монгол болгох ────────────────────────────────────────────────────────
if not "%TRANSLATE%"=="1" goto :finish
if not exist "%DP%translate-srt.ps1" (
  echo.
  echo   [!] translate-srt.ps1 олдсонгүй — зөвхөн англи бичвэр бэлэн боллоо.
  goto :finish
)

:: faster-whisper гаралтыг оролтын нэрээр нэрлэдэг
for %%A in ("!AUDIO!") do set "SRTFILE=%OUTDIR%\%%~nA.srt"

if not exist "!SRTFILE!" (
  echo.
  echo   [!] .srt олдсонгүй: !SRTFILE!
  echo       Орчуулгыг алгаслаа.
  goto :finish
)

echo.
echo   [3/3] Claude-аар %TR_LANG% болгож байна...

powershell -NoProfile -ExecutionPolicy Bypass -File "%DP%translate-srt.ps1" ^
  -Srt "!SRTFILE!" -Lang "%TR_LANG%" -Model "%TR_MODEL%"

if errorlevel 1 (
  echo.
  echo   [!] Орчуулга бүтсэнгүй — англи бичвэр бэлэн хэвээр байна.
  echo       Түлхүүрээ шалгана уу: %DP%anthropic-key.txt
)

:finish
:: ── Дуусав ──────────────────────────────────────────────────────────────────
if "%KEEP_AUDIO%"=="0" if defined URL (
  if exist "%OUTDIR%\_audio" rd /s /q "%OUTDIR%\_audio"
)

echo.
echo   ============================================
echo      БЭЛЭН
echo   ============================================
echo.
echo   Гаралт:  %OUTDIR%
echo.
if "%TRANSLATE%"=="1" (
  echo     ^<нэр^>.srt        — англи
  echo     ^<нэр^>.mn.srt     — монгол  ^(видеонд шууд ачаална^)
  echo     ^<нэр^>.mn.txt     — монгол, цагийн тэмдэгтэй
) else (
  echo     ^<нэр^>.srt        — англи
  echo.
  echo   Монгол болгох: .srt-г subtitles.html руу чирж оруул.
)
echo.

start "" "%OUTDIR%"
pause
color
exit /b 0

:fail
echo.
pause
color
exit /b 1
