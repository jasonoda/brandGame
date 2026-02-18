# Upgrade sounds from original WAV/FLAC to high-quality MP3 and WebM
# Place your original files in sounds/originals/ (e.g. click.wav, reward1.wav)
# Requires: ffmpeg in PATH
# Run from project root: .\scripts\upgrade-sounds.ps1

$originals = "sounds/originals"
$outMp3 = "sounds"
$mp3Bitrate = "192k"
$opusBitrate = "128k"

if (-not (Test-Path $originals)) {
    Write-Host "Creating $originals - place your WAV/FLAC files there, then run this script again."
    New-Item -ItemType Directory -Path $originals -Force | Out-Null
    exit 0
}

$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) {
    Write-Host "ffmpeg not found. Install from https://ffmpeg.org or via: winget install ffmpeg"
    exit 1
}

$files = Get-ChildItem -Path $originals -Include *.wav,*.flac -File
if ($files.Count -eq 0) {
    Write-Host "No .wav or .flac files in $originals"
    exit 0
}

foreach ($f in $files) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
    $mp3Path = Join-Path $outMp3 "$base.mp3"
    $webmPath = Join-Path $outMp3 "$base.webm"
    Write-Host "Processing $($f.Name)..."
    & ffmpeg -y -i $f.FullName -b:a $mp3Bitrate -ar 44100 $mp3Path 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  -> $mp3Path" }
    & ffmpeg -y -i $f.FullName -c:a libopus -b:a $opusBitrate -ar 48000 $webmPath 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  -> $webmPath" }
}
Write-Host "Done. Consider adding WebM as first src in Howl (e.g. src: ['sounds/click.webm','sounds/click.mp3'])"
