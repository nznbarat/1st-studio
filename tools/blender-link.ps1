<#
.SYNOPSIS
    1st Studio — Camera Director → Blender холбогч (PowerShell).

.DESCRIPTION
    Хөтчөөс татсан "1st-studio-camera-*.py" экспортыг Blender рүү PowerShell-ээр
    дамжуулна. blender.exe-г өөрөө хайж олно (PATH, Program Files, Steam, реестр).

.EXAMPLE
    .\blender-link.ps1
    Downloads доторх сүүлийн экспортыг Blender-ийн цонхонд нээнэ.

.EXAMPLE
    .\blender-link.ps1 -Render
    Цонх нээхгүйгээр background-аар нэг фрейм PNG болгож гаргана.

.EXAMPLE
    .\blender-link.ps1 -Render -Anim
    Бүтэн дараалллыг MP4 (H.264) болгож гаргана.

.EXAMPLE
    .\blender-link.ps1 -Watch
    Downloads-ыг ажиглаж, шинэ экспорт татагдмагц автоматаар render хийнэ.

.EXAMPLE
    .\blender-link.ps1 -Blend "D:\proj\shot.blend" -Save "D:\proj\shot_cam.blend"
    Байгаа төсөл дотор камерыг суулгаад шинэ .blend болгож хадгална.

.NOTES
    Blender 5.2.0 LTS дээр шалгасан.
    Windows PowerShell 5.1 болон PowerShell 7 дээр ажиллана.
#>

[CmdletBinding()]
param(
    # Ажиллуулах экспортын .py. Заагаагүй бол -WatchDir доторх хамгийн сүүлийнхийг авна.
    [string]$Script,

    # Нээх .blend төсөл (заагаагүй бол Blender-ийн анхдагч тайз).
    [string]$Blend,

    # blender.exe-ийн зам (заагаагүй бол автоматаар хайна).
    [string]$BlenderPath,

    # Экспортыг хайх / ажиглах хавтас.
    [string]$WatchDir,

    # Render-ийн гаралтын хавтас.
    [string]$Out,

    # Render хийх фрейм (-1 = тайзны эхний фрейм).
    [int]$Frame = -1,

    # Render хөдөлгүүр.
    [ValidateSet('EEVEE', 'WORKBENCH', 'CYCLES')]
    [string]$Engine = 'EEVEE',

    # Үр дүнг энэ зам руу .blend болгож хадгална.
    [string]$Save,

    # Ажиглах давтамж (секунд).
    [int]$Interval = 2,

    # Цонх нээхгүй, background-аар render хийнэ.
    [switch]$Render,

    # Бүтэн дараалал → MP4 (H.264).
    [switch]$Anim,

    # Хавтсыг тасралтгүй ажиглаж, шинэ экспорт бүрийг боловсруулна.
    [switch]$Watch
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

if (-not $WatchDir) {
    $WatchDir = Join-Path ([Environment]::GetFolderPath('UserProfile')) 'Downloads'
}
if (-not $Out) {
    $desktop = [Environment]::GetFolderPath('Desktop')
    if (-not $desktop) { $desktop = [Environment]::GetFolderPath('UserProfile') }
    $Out = Join-Path $desktop '1st-studio-render'
}
# -Watch дангаараа бол цонх дараалан нээхгүйн тулд render горимд шилжинэ
if ($Watch -and -not $Render -and -not $Save) { $Render = $true }
if ($Anim -and -not $Render) { $Render = $true }

# ══════════════════════════════════════════════════════════════
#  blender.exe хайх
# ══════════════════════════════════════════════════════════════
function Find-Blender {
    param([string]$Hint)

    if ($Hint) {
        if (Test-Path -LiteralPath $Hint) { return (Resolve-Path -LiteralPath $Hint).Path }
        throw "Заасан blender.exe олдсонгүй: $Hint"
    }

    $cmd = Get-Command 'blender.exe' -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $bases = @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA) |
        Where-Object { $_ }

    $roots = @()
    foreach ($b in $bases) {
        $roots += (Join-Path $b 'Blender Foundation')
        $roots += (Join-Path $b 'Programs\Blender Foundation')
        $roots += (Join-Path $b 'Steam\steamapps\common\Blender')
    }

    $found = @()
    foreach ($root in $roots) {
        if (Test-Path -LiteralPath $root) {
            $found += Get-ChildItem -LiteralPath $root -Recurse -Depth 2 -Filter 'blender.exe' `
                -File -ErrorAction SilentlyContinue
        }
    }

    if ($found.Count -gt 0) {
        # хамгийн шинэ хувилбарыг сонгоно (Blender 5.2 > Blender 4.5)
        $best = $found | Sort-Object {
            if ($_.FullName -match 'Blender[ \\]+(\d+)\.(\d+)') {
                [int]$Matches[1] * 1000 + [int]$Matches[2]
            } else { 0 }
        } -Descending | Select-Object -First 1
        return $best.FullName
    }

    # реестрээс .blend файлын нээгчийг харна
    $reg = 'HKLM:\SOFTWARE\Classes\blendfile\shell\open\command'
    if (Test-Path $reg) {
        $val = (Get-ItemProperty -Path $reg -ErrorAction SilentlyContinue).'(default)'
        if ($val -and ($val -match '"([^"]+blender\.exe)"')) { return $Matches[1] }
    }

    throw "blender.exe олдсонгүй. -BlenderPath параметрээр замыг нь шууд зааж өгнө үү."
}

# ══════════════════════════════════════════════════════════════
#  Сүүлийн экспортыг олох
# ══════════════════════════════════════════════════════════════
function Get-LatestExport {
    param([string]$Dir)

    if (-not (Test-Path -LiteralPath $Dir)) { return $null }
    Get-ChildItem -LiteralPath $Dir -Filter '1st-studio-camera-*.py' -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
}

# ══════════════════════════════════════════════════════════════
#  Render / хадгалалтын туслах .py үүсгэх
# ══════════════════════════════════════════════════════════════
function New-HelperScript {
    param(
        [string]$OutDir,
        [string]$Stem,
        [string]$EngineId,
        [int]$AtFrame,
        [bool]$Animation,
        [bool]$DoRender,
        [string]$SavePath
    )

    $outPath = (Join-Path $OutDir $Stem).Replace('\', '/')
    $savePy = if ($SavePath) { '"' + $SavePath.Replace('\', '/') + '"' } else { 'None' }

    $lines = @(
        'import bpy',
        'scene = bpy.context.scene',
        ('scene.render.engine = "{0}"' -f $EngineId),
        ('scene.render.filepath = "{0}"' -f $outPath),
        ('FRAME = {0}' -f $AtFrame),
        ('ANIM = {0}' -f $(if ($Animation) { 'True' } else { 'False' })),
        ('DO_RENDER = {0}' -f $(if ($DoRender) { 'True' } else { 'False' })),
        ('SAVE_TO = {0}' -f $savePy),
        '',
        'if DO_RENDER:',
        '    if ANIM:',
        '        # Blender 5.x: FFMPEG сонгохын өмнө media_type-ыг VIDEO болгоно',
        '        if hasattr(scene.render.image_settings, "media_type"):',
        '            scene.render.image_settings.media_type = "VIDEO"',
        '        scene.render.image_settings.file_format = "FFMPEG"',
        '        scene.render.ffmpeg.format = "MPEG4"',
        '        scene.render.ffmpeg.codec = "H264"',
        '        scene.render.ffmpeg.constant_rate_factor = "HIGH"',
        '        scene.render.ffmpeg.ffmpeg_preset = "GOOD"',
        '        scene.render.ffmpeg.audio_codec = "NONE"',
        '        bpy.ops.render.render(animation=True)',
        '    else:',
        '        if hasattr(scene.render.image_settings, "media_type"):',
        '            scene.render.image_settings.media_type = "IMAGE"',
        '        scene.render.image_settings.file_format = "PNG"',
        '        if FRAME >= 0:',
        '            scene.frame_set(FRAME)',
        '        bpy.ops.render.render(write_still=True)',
        '    print("[1st Studio] render ->", scene.render.filepath)',
        '',
        'if SAVE_TO:',
        '    bpy.ops.wm.save_as_mainfile(filepath=SAVE_TO)',
        '    print("[1st Studio] saved ->", SAVE_TO)'
    )

    $tmp = Join-Path ([IO.Path]::GetTempPath()) ('1st-studio-helper-{0}.py' -f ([guid]::NewGuid().ToString('N')))
    [IO.File]::WriteAllLines($tmp, $lines)   # BOM-гүй UTF-8
    return $tmp
}

# ══════════════════════════════════════════════════════════════
#  Blender-ийг ажиллуулах
# ══════════════════════════════════════════════════════════════
function Invoke-Blender {
    param([string]$Exe, [string]$ShotPy)

    # 5.x дээр EEVEE-ийн нэр "BLENDER_EEVEE" (4.2–4.5 дээр "BLENDER_EEVEE_NEXT" байсан)
    $engineId = switch ($Engine) {
        'EEVEE'     { 'BLENDER_EEVEE' }
        'WORKBENCH' { 'BLENDER_WORKBENCH' }
        'CYCLES'    { 'CYCLES' }
    }

    $background = [bool]$Render -or [bool]$Save
    $argList = @()

    if ($background) { $argList += @('--background', '--factory-startup') }

    if ($Blend) {
        if (-not (Test-Path -LiteralPath $Blend)) { throw ".blend олдсонгүй: $Blend" }
        $argList += (Resolve-Path -LiteralPath $Blend).Path
    }

    # Аргументууд дарааллаараа биелдэг: эхлээд экспорт, дараа нь render тохиргоо.
    $argList += @('--python', $ShotPy)

    $helper = $null
    if ($background) {
        if (-not (Test-Path -LiteralPath $Out)) {
            New-Item -ItemType Directory -Path $Out -Force | Out-Null
        }
        $stem = if ($Anim) { 'shot.mp4' } else { 'shot_' }
        $helper = New-HelperScript -OutDir $Out -Stem $stem -EngineId $engineId `
            -AtFrame $Frame -Animation ([bool]$Anim) -DoRender ([bool]$Render) -SavePath $Save
        $argList += @('--python', $helper)
    }

    Write-Host ("  blender : {0}" -f $Exe) -ForegroundColor DarkGray
    Write-Host ("  скрипт  : {0}" -f (Split-Path $ShotPy -Leaf)) -ForegroundColor DarkGray
    if ($background) { Write-Host ("  гаралт  : {0}" -f $Out) -ForegroundColor DarkGray }

    if (-not $background) {
        # GUI: prompt-ыг чөлөөлж, цонхыг нь тусад нь нээнэ
        $quoted = $argList | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }
        Start-Process -FilePath $Exe -ArgumentList $quoted | Out-Null
        Write-Host "  ✔ Blender-ийн цонх нээгдэж байна" -ForegroundColor Green
        return 0
    }

    $code = 0
    try {
        & $Exe @argList
        $code = $LASTEXITCODE
    } finally {
        if ($helper -and (Test-Path -LiteralPath $helper)) {
            Remove-Item -LiteralPath $helper -Force -ErrorAction SilentlyContinue
        }
    }

    if ($code -ne 0) {
        Write-Host ("  ✘ Blender {0} кодоор дууслаа" -f $code) -ForegroundColor Red
    } else {
        Write-Host "  ✔ боллоо" -ForegroundColor Green
    }
    return $code
}

# ══════════════════════════════════════════════════════════════
#  Гол урсгал
# ══════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "1st Studio — Blender холбогч" -ForegroundColor Cyan
Write-Host "────────────────────────────" -ForegroundColor DarkCyan

$exe = Find-Blender -Hint $BlenderPath

try {
    $ver = & $exe '--version' 2>$null | Select-Object -First 1
    if ($ver) { Write-Host ("  {0}" -f $ver.Trim()) -ForegroundColor DarkGray }
} catch { }

if ($Watch) {
    Write-Host ("  ажиглаж байна: {0}" -f $WatchDir) -ForegroundColor Yellow
    Write-Host ("  давтамж: {0}с · зогсоох: Ctrl+C" -f $Interval) -ForegroundColor DarkGray
    Write-Host ""

    $seen = $null
    $first = Get-LatestExport -Dir $WatchDir
    if ($first) { $seen = "$($first.FullName)|$($first.LastWriteTimeUtc.Ticks)" }

    while ($true) {
        Start-Sleep -Seconds $Interval
        $latest = Get-LatestExport -Dir $WatchDir
        if (-not $latest) { continue }

        $stamp = "$($latest.FullName)|$($latest.LastWriteTimeUtc.Ticks)"
        if ($stamp -eq $seen) { continue }

        Start-Sleep -Milliseconds 800   # файл бичигдэж дуусахыг хүлээнэ
        $seen = $stamp

        Write-Host ("[{0}] шинэ экспорт: {1}" -f (Get-Date -Format 'HH:mm:ss'), $latest.Name) -ForegroundColor Cyan
        try {
            Invoke-Blender -Exe $exe -ShotPy $latest.FullName | Out-Null
        } catch {
            Write-Host ("  ✘ {0}" -f $_.Exception.Message) -ForegroundColor Red
        }
        Write-Host ""
    }
}

if (-not $Script) {
    $latest = Get-LatestExport -Dir $WatchDir
    if (-not $latest) {
        throw "'$WatchDir' дотроос 1st-studio-camera-*.py олдсонгүй. -Script параметрээр замыг зааж өгнө үү."
    }
    $Script = $latest.FullName
    Write-Host ("  сүүлийн экспорт: {0}" -f $latest.Name) -ForegroundColor DarkGray
}

if (-not (Test-Path -LiteralPath $Script)) { throw "Скрипт олдсонгүй: $Script" }
$Script = (Resolve-Path -LiteralPath $Script).Path

Invoke-Blender -Exe $exe -ShotPy $Script | Out-Null
Write-Host ""
