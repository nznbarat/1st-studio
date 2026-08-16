<#
  1st Studio — translate-srt.ps1

  Англи .srt файлыг Claude-аар орчуулж, цагийн тэмдгийг нь хэвээр үлдээнэ.
  Гаралт:  <нэр>.mn.srt  ба  <нэр>.mn.txt

  Ашиглах:
    powershell -NoProfile -ExecutionPolicy Bypass -File translate-srt.ps1 -Srt "video.srt"

  Түлхүүрийг гурван газраас хайна (эхний олдсоныг авна):
    1. -Key параметр
    2. ANTHROPIC_API_KEY орчны хувьсагч
    3. энэ скриптийн хажууд байгаа anthropic-key.txt файл
#>

param(
  [Parameter(Mandatory = $true)][string]$Srt,
  [string]$Lang  = "Mongolian",
  [string]$Model = "claude-opus-5",
  [string]$Key   = "",
  [int]$Chunk    = 25
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# ── Түлхүүр олох ────────────────────────────────────────────────────────────
if (-not $Key) { $Key = $env:ANTHROPIC_API_KEY }
if (-not $Key) {
  $keyFile = Join-Path $PSScriptRoot "anthropic-key.txt"
  if (Test-Path $keyFile) { $Key = (Get-Content $keyFile -Raw).Trim() }
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

  $resp = Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" -Method Post `
    -Headers @{
      "x-api-key"         = $Key
      "anthropic-version" = "2023-06-01"
    } `
    -ContentType "application/json; charset=utf-8" `
    -Body $bytes

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
