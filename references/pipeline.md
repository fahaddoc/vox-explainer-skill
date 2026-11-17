# Pipeline commands, stage by stage

All paths are relative to `~/vox-studio` unless absolute. `PY=.venv/bin/python`, `PYM=.venv-mlx/bin/python`. Run long steps (TTS, full render) in the background and continue with other work.

## 0. New video setup

```bash
~/.claude/skills/vox-explainer/scripts/new_video.sh shipping_container        # dry run (zsh script; run it directly, not with bash)
~/.claude/skills/vox-explainer/scripts/new_video.sh shipping_container --go   # copies per-video files to ~/vox-studio/archive/shipping_container/
```
The slug is the CURRENT video's (the first one is `shipping_container`). The script only **copies**; its output lists what to clear, what to keep and what to edit. **Gate:** clear nothing until the owner confirms (a) the archive looks right and (b) the old video is uploaded. The GPT upload brief points at files in `renders/`. After the upload, `touch renders/.uploaded` silences the script's warning. The container video's v1 was archived by hand to `archive/v1/`.

Ask the owner at this gate: topic + angle, target length (default ~4-4.5 min, 650-750 words), music bed (keep "Bigger Questions" or pick another CC track), and whether the hero motif changes. Carry over by default: paper-collage look, palette tokens, fonts, the Anirban voice, pacing, SFX kit, mix levels. Change per topic: the hero object (keep the rust accent), the chapter-card design, archival photos.

Topic-specific pieces that need a fresh look per video:
- `engine/src/components/SectionCard.tsx` + `Box.tsx`: the chapter card is a shipping container with an ISO-style code ("BOXU 000003 9"). That motif belongs to the container video; pick a motif that fits the new topic.
- `engine/SCENES.md` (shot naming is already `Vxx` / `parts/V_<batch>.tsx`) is partly topic-specific. Update these parts for each video: line 4 (video name), the photo list in `public/img/` (~line 33), the container-specific components (`BoxSide`, `Canal`, `ShipTop`, `IdCard` = McLean's card, `SectionCard` as a container side, `Box`/`IsoContainer`, ~lines 36-43), the palette rule "rust = THE container" (~lines 46, 51), and the SFX stem list (~line 61). The generic parts (ShotProps, ownership, verify steps, Camera/Type/WorldMap/Icons) stay.
- `script/video_meta.json` (read by `tools/make_description.py`, which refuses to run without it): hook paragraph, `chapter_names` (section → chapter title), `proc2raw` (processed image name → raw file), `extra_sources` (books etc.), `credits` (narration, music, SFX, map lines), `image_credit_label`, `closing_line`. Copy the container's from the archive and rewrite every value.
- `tools/build_cues.ts`: `BOOM_OK` = the shot ids allowed a boom (about 5 story beats).
- `tools/prep_all.sh`: the per-video image list.
- Final file name: `OUT=<slug>_final.mp4 tools/render_final.sh final`.

## 1. Research

Template: `workflows/vox-research.js`. With `FIRST_VIDEO = false` (default) it runs the facts and visual-asset agents, then adversarial verifiers for facts and licences; the style guide, TTS research and SFX kit already exist. Adapt `COMMON` (topic, length), the facts prompt and the visual searches. Outputs:
- Save the workflow's return value to `research/research_result.json`.
- `research/facts-raw.md` (written by the facts agent): one block per fact headed `### F01: <title> [VERIFIED]` or `[CHECK]` (two-digit ids), with the claim, key number, why it matters and source URLs inside the block, then `## Mechanism` (how it worked before, what changed, a proposed why-sentence) and `## Story beats`. `make_description.py` takes the first 2 URLs of each cited fact's block for the Sources list, so the format matters.
- `research/facts-verdicts.md` (you write it from the verify results): `## F01 — CONFIRMED|CORRECTED|UNVERIFIABLE|REFUTED`, then `- claim:` (safe wording), `- key number:`, `- evidence:`. **This is authoritative** for what may appear on screen or in the VO.
- Show the owner the proposed why-sentence at the end of stage 1. It anchors the script.
- `assets/raw/*` + `assets/raw/CREDITS.md`: one section per file, `## <n>. <raw filename>`, with `- **Credit line (paste-ready):** …`, licence and source URL. `make_description.py` finds image credits by the raw filename inside a `## ` section. Only CC0, CC BY, or public domain is usable for commercial use. Each download must stay under 50 MB.
- `research/vox-style-guide.md` is shared and already exists (pacing, easing, devices, anti-patterns). Reuse it.

Agent hygiene for research agents: `curl --max-time 45 -L`, no installs, tool calls under 60 s.

## 2. Script

Order:
1. `workflows/vox-script-panel.js`: 3 competing drafts → judge panel (retention, visual, language) → synthesis with `why_sentence` + 2-3 `hook_options` → Devanagari pairs.
2. **Owner picks a hook** (show the options as short Roman Urdu text).
3. Write `script/build_<slug>.py` from `scripts/build_script_template.py` (copy it, fill the lines). It writes `script/script.json` and the owner-read `script/script-<slug>.md`. Keeping the script as code means edits are list edits that diff cleanly.
4. `workflows/script-critique.js`: naive viewers, fact checker, pronunciation reviewer, a skeptic per proposed edit. Apply accepted edits in `build_<slug>.py` and re-run it.
5. **Owner reads `script-<slug>.md`.** Only then start stage 3.

Schema and writing rules: `references/script-and-voice.md`.

## 3. Voice (Maya2 MLX: the model loads in ~5 s once cached; the time goes into N takes + Whisper scoring per line)

```bash
$PYM tools/tts_lines.py script/script.json audio/tts/lines --voice Anirban --takes 3          # all lines
$PYM tools/tts_lines.py script/script.json audio/tts/lines --takes 3 --only L03,L07         # re-do some
$PYM tools/asr_check.py "<expected devanagari>" audio/tts/lines/L03.wav                       # Whisper check
$PY  tools/assemble_vo.py --script script/script.json --takes audio/tts/lines --out audio/tts # → voice.wav + vo_lines.json
```
- `tts_lines.py` scores each take by Whisper round-trip CER (digits stripped) + duration sanity + pitch drift vs the median, then writes `takes_report.json` and copies the best take to `<id>.wav`.
- `takes_report.json`: a completed run saves it nested (`{median_f0, chosen, report}`). Re-runs used to crash on that (fixed 2026-11-17: the tool now unwraps `report`). If you see a KeyError at the choose step, the old version is back.
- When the script changes, remap unchanged lines' takes to their new ids by Devanagari text instead of regenerating everything (the v2 rebuild reused 25 of 52 lines).
- A high CER on lines with numbers or English is usually Whisper writing digits/Latin. Read the ASR text before regenerating.
- `assemble_vo.py` adds a 0.6 s lead (`--lead`) and each line's designed `pause`.
- Voice consistency: `tools/prosody.py` gives pitch stats. Before building on a new take set, A/B a new line against the previous video and get the owner's OK.

## 4. Align + captions

```bash
$PY tools/align.py --script script/script.json --vo audio/tts --out engine/src/data/timeline.json --transcript renders/transcript
```
Whisper large-v3-turbo per line slice, then a char-level DP maps recognised words onto the TTS words, then the times go to the Roman display words. It writes `timeline.json` (words with s/e, lines) and `renders/transcript.srt/.vtt/.tsv` (via `tools/make_srt.py`: breaks at sentence punctuation and at commas once a cue has ≥ 4 words; soft max 10 words / 56 chars, extended by up to 2 words so a sentence end isn't orphaned, so real cues reach ~12 words / 68 chars; never overlapping). Check that the word count equals the script's. Its temp slice goes to the system temp dir (it used a session scratchpad path until 2026-11-17).

## 5. Shots

1. Shot list as code: `script/build_shots_<slug>.py` → `script/shots.json` (`shots[]`: id, lines, src, spec; `batches`; `_notes` = rules for every shot). Schema in `references/shots-and-engine.md`.
2. `$PY tools/gen_storyboard.py` → `engine/src/storyboard.ts` (shot from/to frames, TOTAL_FRAMES), `engine/src/entries/<batch>.tsx`, stub scenes for missing shots, `script/storyboard.md` (per shot: VO, onscreen, word table with GLOBAL indices + relative frames). A shot starts 3 frames (`CUT_LEAD`) before its first word; the last shot runs to VO end + 12 s (`TAIL`, end-screen space).
3. Build with `workflows/build-shots.js`: one builder per batch, then a fresh-eyes reviewer per batch, then a fixer. Builders read `engine/SCENES.md` first.
4. Stills: from `engine/`, `npx tsx ../tools/stills.ts <batch> <shotId> 0 w<idx> end` writes `review/<shot>_<frame>.jpg` (960x540, ~8 s per call). Typecheck: `npx tsc --noEmit -p .`

## 6. Music, SFX, mix

```bash
$PY tools/fit_music.py audio/music/<track>.mp3 /dev/null --target 9999 --scan          # target must exceed the track length; prints (sim, lag, at) for lags 8-64 s
$PY tools/fit_music.py audio/music/<track>.mp3 audio/music/bed_fitted.wav --target <TOTAL_FRAMES/30> --ext <k × phrase>
```
- `--ext` must be ≥ target − track length (otherwise `mix.py` loops the bed with a crossfade), and `--slack` is ignored when `--ext` is given.
- Extend by **whole musical phrases** so the track's own ending lands on the end screen. Looping a track with a fade-out leaves a 45 dB hole. The container video used Lee Rosevere "Bigger Questions" (171 s, phrase 14.75 s, `--ext 118`).
- SFX kit: CC0 files in `audio/sfx/` + the procedural kit from `$PY tools/sfx_synth.py` (→ `audio/sfx/synth/`, self-made, no licence risk). Shots export `Vxx_cues(p)`; `tools/build_cues.ts` gathers them and applies a global policy: booms only in `BOOM_OK` shots (one each), ≤1 tick per 0.1 s, ≤3 cues per 2 frames.
- `tools/mix.py` (called by `render_final.sh`) processes the VO, auto-matches buses (SFX -10 dB, music -13 dB relative to voice; per-cue gains alone are meaningless across files), ducks music under voice, normalises to -14 LUFS and limits **sample** peaks to -1 dBFS. That is not true peak: the container final measured -0.8 dBTP after AAC. For a strict -1 dBTP, lower the limiter ceiling in `mix.py` to about -1.5.

## 7–8. Render

```bash
tools/render_final.sh draft                              # cues → mix → 960x540 draft (renders/draft.mp4)
OUT=<slug>_final.mp4 tools/render_final.sh final         # 1080p, crf 17, AAC 320k, concurrency 4
$PY tools/contact_sheet.py renders/<file>.mp4 review/sheet --every 2 --cols 6
```
Final verification:
```bash
F=renders/<slug>_final.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate -of compact=p=0 $F
ffmpeg -nostats -i $F -af ebur128=peak=true -f null - 2>&1 | grep -A15 Summary | grep -E "I:|Peak:"
ffmpeg -v error -i $F -f null - && echo decode-ok
ffmpeg -v error -ss <t> -i $F -frames:v 1 review/check_<t>.jpg     # every fixed spot, exact time
```
QA and fix loop: `references/qa-and-fixes.md`.

## 9. Upload package

```bash
$PY tools/make_description.py      # renders/youtube_description.txt: title options, hook text, chapters, sources, credits
```
Then write `renders/youtube_description_only.txt` (the part after `--- DESCRIPTION ---` + 3 hashtags), `renders/youtube_tags.txt` (≤ 500 chars), and a thumbnail base, and fill the GPT brief from `references/youtube-upload.md`.

Images: `$PY tools/prep_images.py <src> <name> <bw|duo|grade|lift-bw|lift-grade> [--w 1800] [--crop x,y,w,h] [--rim 12]` (`--crop` takes fractions 0-1 of the image, e.g. `0.1,0,0.8,1`; pixel values crop out of bounds and pad black) tones archival photos for the collage look (into `engine/public/img/`). The `lift-*` modes use the Swift Vision subject lift (`tools/lift`). `tools/make_textures.py` pre-bakes paper + grain (one-time).
