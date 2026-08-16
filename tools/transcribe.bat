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
::  Бэлэн .srt чирвэл татах, хөрвүүлэх алхмыг алгасаад зөвхөн орчуулна.
::
::  Нэмэлт файл ХЭРЭГГҮЙ — орчуулагч энэ файлын доод хэсэгт шингээстэй.
::  Түлхүүрийг эхний ажиллуулалтад асууж, anthropic-key.txt-д хадгална.
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

set "KEYFILE=%DP%anthropic-key.txt"
if "%TRANSLATE%"=="1" if not exist "%KEYFILE%" (
  echo   Орчуулга хийхийн тулд Anthropic API түлхүүр хэрэгтэй.
  echo   platform.claude.com -^> Settings -^> API Keys
  echo   ^(орчуулга хэрэггүй бол хоосон орхиод Enter дар^)
  echo.
  set /p "NEWKEY=   sk-ant-... : "
  echo.
  if not "!NEWKEY!"=="" (
    >"%KEYFILE%" echo !NEWKEY!
    echo   [OK] Түлхүүр хадгалагдлаа — дараагийн удаа асуухгүй.
    echo.
  ) else (
    set "TRANSLATE=0"
    echo   [i] Орчуулгагүйгээр үргэлжилнэ — зөвхөн англи бичвэр гарна.
    echo.
  )
)

:: ── Оролт: чирж тавьсан файл уу, эсвэл холбоос уу ──────────────────────────
set "AUDIO="
set "URL="

if not "%~1"=="" (
  :: Чирж тавьсан зүйл — локал файл бол шууд хөрвүүлнэ
  if exist "%~1" (
    :: Бэлэн .srt чирсэн бол алхам 1-2-ыг алгасаад шууд орчуулна
    if /i "%~x1"==".srt" (
      set "SRTFILE=%~f1"
      echo   Хадмал:  %~nx1
      goto :translate
    )
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
:: faster-whisper гаралтыг оролтын нэрээр нэрлэдэг
for %%A in ("!AUDIO!") do set "SRTFILE=%OUTDIR%\%%~nA.srt"

:translate
if not "%TRANSLATE%"=="1" goto :finish

if not exist "!SRTFILE!" (
  echo.
  echo   [!] .srt олдсонгүй: !SRTFILE!
  echo       Орчуулгыг алгаслаа.
  goto :finish
)

echo.
echo   [3/3] Claude-аар %TR_LANG% болгож байна...

set "TR_SRT=!SRTFILE!"
set "TR_KEYFILE=%KEYFILE%"

:: Орчуулагч энэ файлын доод хэсэгт тэмдгийн ард шингээстэй байдаг.
:: Batch тэр мөрүүд хүртэл хэзээ ч хүрдэггүй (өмнө нь exit /b хийдэг).
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$b=[IO.File]::ReadAllText('%~f0');$i=$b.LastIndexOf('#PSSTART');if($i -lt 0){Write-Host '  [X] PS heseg oldsongui';exit 1};iex $b.Substring($i)"

if errorlevel 1 (
  echo.
  echo   [!] Орчуулга бүтсэнгүй — англи бичвэр бэлэн хэвээр байна.
  echo       Түлхүүрээ шалгана уу: %KEYFILE%
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


#PSSTART
# 1st Studio - .srt orchuulagch (transcribe.bat dotroos duudagdana)
$Srt   = $env:TR_SRT
$Lang  = if ($env:TR_LANG)  { $env:TR_LANG }  else { "Mongolian" }
$Model = if ($env:TR_MODEL) { $env:TR_MODEL } else { "claude-opus-5" }
$Key   = ""
$Chunk = 25

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# ── Түлхүүр олох ────────────────────────────────────────────────────────────
if (-not $Key) { $Key = $env:ANTHROPIC_API_KEY }
if (-not $Key) {
  $keyFile = $env:TR_KEYFILE
  if ($keyFile -and (Test-Path $keyFile)) { $Key = (Get-Content $keyFile -Raw).Trim() }
}
if (-not $Key) {
  Write-Host ""
  Write-Host "  [X] Anthropic tulhuur oldsongui." -ForegroundColor Red
  Write-Host "      Энэ хавтсанд anthropic-key.txt файл үүсгээд sk-ant-... гэж бич,"
  Write-Host "      эсвэл ANTHROPIC_API_KEY орчны хувьсагч тохируул."
  exit 1
}

if (-not (Test-Path $Srt)) {
  Write-Host "  [X] Файл олдсонгүй: $Srt" -ForegroundColor Red
  exit 1
}

# ── SRT задлах ──────────────────────────────────────────────────────────────
$raw = [System.IO.File]::ReadAllText((Resolve-Path $Srt), [System.Text.Encoding]::UTF8)
$raw = $raw -replace "`r`n", "`n"

$cues = New-Object System.Collections.ArrayList
foreach ($block in ($raw -split "`n`n+")) {
  if ([string]::IsNullOrWhiteSpace($block)) { continue }
  $lines = $block -split "`n"

  $ti = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '-->') { $ti = $i; break }
  }
  if ($ti -lt 0 -or $ti -ge $lines.Count - 1) { continue }

  $text = (($lines[($ti + 1)..($lines.Count - 1)]) -join ' ').Trim()
  if (-not $text) { continue }

  [void]$cues.Add([pscustomobject]@{
    Timing = $lines[$ti].Trim()
    Src    = $text
    Dst    = ""
  })
}

if ($cues.Count -eq 0) {
  Write-Host "  [X] .srt дотроос хадмал танигдсангүй." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "  $($cues.Count) мөр · $Model → $Lang" -ForegroundColor Cyan

# ── Claude руу нэг багц илгээх ──────────────────────────────────────────────
$system = @"
You translate video subtitles into $Lang.
Use natural, fluent spoken register — the way a person would actually say it.
Rules:
- The input is numbered subtitle lines. Return EXACTLY the same number of lines,
  each prefixed with its original [n] marker, in the same order.
- Translate each line on its own, but use surrounding lines for context —
  subtitle lines often split a sentence mid-way.
- Never merge, split, reorder, or drop lines. Never add commentary.
- Keep proper nouns, product names, and technical identifiers unchanged.
"@

function Invoke-Claude([string]$UserText) {
  $payload = @{
    model      = $Model
    max_tokens = 8000
    system     = $system
    messages   = @(@{ role = "user"; content = $UserText })
  } | ConvertTo-Json -Depth 6 -Compress

  # PS 5.1 нь мөрийг ISO-8859-1-ээр илгээдэг тул UTF-8 байт болгож өгнө
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

  # Invoke-RestMethod нь хариуны charset заагаагүй үед ISO-8859-1 гэж уншдаг тул
  # монгол үсэг эвдэрдэг. Тиймээс түүхий байтыг нь аваад өөрсдөө UTF-8 болгоно.
  $r = Invoke-WebRequest -Uri "https://api.anthropic.com/v1/messages" -Method Post `
    -Headers @{
      "x-api-key"         = $Key
      "anthropic-version" = "2023-06-01"
    } `
    -ContentType "application/json; charset=utf-8" `
    -Body $bytes -UseBasicParsing

  $json = [System.Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
  $resp = $json | ConvertFrom-Json
  return (($resp.content | ForEach-Object { $_.text }) -join "")
}

function Read-Numbered([string]$Reply, [int]$Count) {
  $out = New-Object string[] $Count
  $hit = 0
  foreach ($m in [regex]::Matches($Reply, '(?s)\[(\d+)\]\s*(.*?)(?=\r?\n\[\d+\]|$)')) {
    $n = [int]$m.Groups[1].Value
    if ($n -ge 1 -and $n -le $Count) {
      $out[$n - 1] = $m.Groups[2].Value.Trim()
      $hit++
    }
  }
  if ($hit -eq 0) {
    # Дугаар огт олдсонгүй — мөрөөр нь салгах нөөц зам
    $plain = ($Reply -split "`n") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    for ($i = 0; $i -lt $Count -and $i -lt $plain.Count; $i++) { $out[$i] = $plain[$i] }
  }
  return $out
}

# ── Багц бүрээр орчуулах ────────────────────────────────────────────────────
$done = 0
for ($start = 0; $start -lt $cues.Count; $start += $Chunk) {
  $end   = [Math]::Min($start + $Chunk, $cues.Count) - 1
  $batch = $cues[$start..$end]

  $numbered = ($batch | ForEach-Object -Begin { $i = 0 } -Process {
    $i++; "[$i] $($_.Src)"
  }) -join "`n"

  try {
    $reply = Invoke-Claude $numbered
    $texts = Read-Numbered $reply $batch.Count

    # Гээгдсэн мөр байвал зөвхөн тэднийг дахин асууна
    $gaps = @()
    for ($i = 0; $i -lt $batch.Count; $i++) { if (-not $texts[$i]) { $gaps += $i } }
    if ($gaps.Count -gt 0 -and $gaps.Count -le [Math]::Ceiling($batch.Count / 2)) {
      $retry  = ($gaps | ForEach-Object { "[$($_ + 1)] $($batch[$_].Src)" }) -join "`n"
      $again  = Read-Numbered (Invoke-Claude $retry) $batch.Count
      foreach ($g in $gaps) { if ($again[$g]) { $texts[$g] = $again[$g] } }
    }

    for ($i = 0; $i -lt $batch.Count; $i++) {
      $batch[$i].Dst = if ($texts[$i]) { $texts[$i] } else { $batch[$i].Src }
    }
  }
  catch {
    Write-Host ""
    Write-Host "  [X] Орчуулга тасарлаа: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "      Орчуулагдсан хэсэг хадгалагдана." -ForegroundColor Yellow
    for ($i = 0; $i -lt $batch.Count; $i++) {
      if (-not $batch[$i].Dst) { $batch[$i].Dst = $batch[$i].Src }
    }
    break
  }

  $done += $batch.Count
  $pct = [Math]::Round(($done / $cues.Count) * 100)
  Write-Host "`r  Орчуулж байна...  $done / $($cues.Count)  ($pct%)" -NoNewline -ForegroundColor Green
}
Write-Host ""

# ── Бичих ───────────────────────────────────────────────────────────────────
$dir  = Split-Path -Parent (Resolve-Path $Srt)
$base = [System.IO.Path]::GetFileNameWithoutExtension($Srt)
$code = if ($Lang -eq "Mongolian") { "mn" } else { $Lang.Substring(0, [Math]::Min(2, $Lang.Length)).ToLower() }

$outSrt = Join-Path $dir "$base.$code.srt"
$outTxt = Join-Path $dir "$base.$code.txt"

$sb = New-Object System.Text.StringBuilder
for ($i = 0; $i -lt $cues.Count; $i++) {
  [void]$sb.AppendLine([string]($i + 1))
  [void]$sb.AppendLine($cues[$i].Timing)
  [void]$sb.AppendLine($cues[$i].Dst)
  [void]$sb.AppendLine()
}

$utf8 = New-Object System.Text.UTF8Encoding $false     # BOM-гүй — тоглуулагчид найдвартай
[System.IO.File]::WriteAllText($outSrt, $sb.ToString(), $utf8)

$plainTxt = ($cues | ForEach-Object {
  $t = ($_.Timing -split '-->')[0].Trim() -replace ',\d+$', ''
  "[$t] $($_.Dst)"
}) -join "`r`n"
[System.IO.File]::WriteAllText($outTxt, $plainTxt, $utf8)

Write-Host ""
Write-Host "  [OK] $outSrt" -ForegroundColor Green
Write-Host "  [OK] $outTxt" -ForegroundColor Green
exit 0
