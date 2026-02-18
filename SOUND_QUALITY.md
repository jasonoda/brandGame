# Improving Mobile Sound Quality

Mobile audio can sound poor due to:

1. **Low bitrate MP3s** – If your MP3s were encoded at 64–96 kbps, they will sound tinny on mobile speakers and headphones. The quality is baked in; re-encoding from MP3 to higher bitrate does not improve it and can make it worse.
2. **Suspended AudioContext (iOS)** – Safari suspends the Web Audio context until user interaction. We now resume it on first tap/click.
3. **Format choice** – WebM (Opus/Vorbis) often sounds better than MP3 at similar file sizes on mobile. Howler recommends WebM as the primary format with MP3 fallback.

## What We've Already Done (Code)

- **AudioContext resume** – On first tap/click, `Howler.ctx.resume()` is called so iOS Safari uses the Web Audio API correctly.
- **Preload** – Sounds are preloaded so playback is ready when triggered.

## Upgrading Your Audio Files (Best Improvement)

To improve quality, you need **original, uncompressed sources** (WAV or FLAC), then re-encode them:

### 1. Check Your MP3 Bitrate

If you have ffprobe (from ffmpeg):

```powershell
ffprobe -v error -show_entries format=bit_rate -of default=noprint_wrappers=1 sounds/click.mp3
```

If bitrate is below 128 kbps, the files are likely too compressed for good mobile playback.

### 2. Re-encode from Original WAV/FLAC

If you have original `.wav` or `.flac` files, use ffmpeg:

**High-quality MP3 (192 kbps):**

```powershell
ffmpeg -i original/click.wav -b:a 192k -ar 44100 sounds/click.mp3
```

**WebM (often better on mobile, add as first format for Howler):**

```powershell
ffmpeg -i original/click.wav -c:a libopus -b:a 128k -ar 48000 sounds/click.webm
```

Then update your Howl config to prefer WebM:

```js
new Howl({ src: ['sounds/click.webm', 'sounds/click.mp3'] });
```

### 3. Batch Script (scripts/upgrade-sounds.ps1)

Run `scripts/upgrade-sounds.ps1` after placing your WAV files in `sounds/originals/`. See the script for details.

## Reference Bitrates

| Use Case       | MP3   | WebM/Opus |
|----------------|-------|-----------|
| Sound effects  | 128k  | 96k       |
| Music / rewards| 192k  | 128k      |
| Loops (wheel)  | 192k  | 128k      |
