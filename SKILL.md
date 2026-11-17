---
name: vox-explainer
description: End-to-end pipeline for faceless Hinglish (Roman Urdu) Vox-style motion-graphics explainer videos for YouTube, built in ~/vox-studio. It covers topic research with verified facts, a Roman Urdu script with Devanagari TTS pairs, the open-source Maya2 voice, Whisper word timing, paper-collage Remotion shots synced to words, SFX and music mix, naive-viewer clarity QA, the 1080p render, and a YouTube upload brief for GPT. Use it whenever the user wants a new explainer, documentary-style, "Vox style" or "faceless YouTube" video, or a Hindi/Urdu/Hinglish narrated animation. Also use it to redo, fix or re-render a vox-studio video, change a shot or label, fix a mispronounced word, or prepare an upload (title, description, thumbnail, captions, a brief for GPT), even when the user doesn't say "skill" or "pipeline". Not for web explainer graphics inside articles (that is explainer-visuals) and not for the Coo Coo Tots kids channel.
---

# Vox explainer: faceless Hinglish video pipeline

This produces a Vox-style explainer (default ~4-4.5 min: 650-750 Roman Urdu words, ~50 lines, like the container video; confirm the length at the stage-0 gate): paper-collage motion graphics, a calm male documentary narrator speaking Hinglish (Roman Urdu on screen in captions, Devanagari fed to the TTS), plain-English on-screen labels, music + SFX, and a 1080p MP4 ready for YouTube. Everything runs locally and free (open-source TTS, CC0/CC-BY/public-domain assets, Remotion).

The first video ("The Shipping Container", Nov 2026) is the reference implementation. All tools, the engine and the lessons below come from it. Its slug is `shipping_container` (final file `renders/shipping_container_final.mp4`). When in doubt, look at how it was done there: `script/build_v2.py`, `script/build_shots_v2.py`, `engine/src/scenes/V*.tsx`, `renders/YOUTUBE_UPLOAD_FOR_GPT.md`. These sit at their live paths under `~/vox-studio/` until the next video's stage 0; after that they are under `~/vox-studio/archive/shipping_container/` (same layout).

## The bar (read this before anything else)

The owner rejected v1 of the first video even though the animation was good. The reasons:
1. **The explanation was confusing.** Above all, it never made clear *why* the container made shipping cheaper. Jargon (TEU, standard, patent), choppy verbless fragments and too many numbers.
2. **Words were mispronounced** by the TTS (New York → "Niyu Yok", horn → "hon", McLean → "Maakleen").
3. **The hook was weak.**

v2 passed after a script rewrite built around one cause-and-effect chain, a shock-number hook, a pronunciation pass, and a QA step where role-played naive viewers had to explain the "why" in their own words.

So the priorities, in order: **clarity of the core WHY > correct facts > clean pronunciation > hook > animation polish.** A technically perfect render with a muddled explanation is a failed video. Never call a video "final" because tech checks passed; say what was and wasn't checked.

## Project layout

```
~/vox-studio/
  tools/            pipeline tools (shared across videos)
  engine/           Remotion 4 project (shared): src/components, src/lib, theme.ts, SCENES.md = engine contract
    src/scenes/     per-video shots V01.tsx… + parts/V_<batch>.tsx helpers
    src/storyboard.ts, src/entries/<batch>.tsx, src/data/timeline.json   (generated per video)
    public/img, public/audio/mix.wav                                      (per video)
  research/         facts-raw.md, facts-verdicts.md (authoritative), vox-style-guide.md (shared, 821 lines)
  script/           build_<slug>.py → script.json + script-<slug>.md (owner read), build_shots_<slug>.py → shots.json, storyboard.md, video_meta.json
  audio/            tts/ (per video), music/, sfx/ (shared kit), cues.json, CREDITS.md
  assets/raw/       downloaded source images + CREDITS.md
  renders/          final mp4, transcript.srt/vtt, youtube_description*.txt, thumb/, upload brief
  review/           stills + QA frames
  archive/<slug>/   previous videos' per-video files
  .venv (numpy, scipy, pyloudnorm, PIL, mlx_whisper)   .venv-mlx (mlx_audio for Maya2 + mlx_whisper)
```

Hardware: M1 Pro, 16 GB RAM, disk often nearly full. This shapes several rules below.

## Pipeline

Each stage lists what to run; exact commands, flags and gotchas are in `references/pipeline.md`. Workflow templates (multi-agent fan-outs used on the first video) are in `workflows/`; adapt their topic-specific text before running them.

| # | Stage | Output | Owner gate |
|---|---|---|---|
| 0 | New video setup: archive the previous video (`scripts/new_video.sh`), clear only after the owner's OK | clean per-video dirs | **previous video uploaded? + topic, slug, length, music, motif** |
| 1 | Research: facts + mechanism with sources, adversarial verify, asset licences | `research/facts-raw.md`, `facts-verdicts.md`, `assets/raw/` | show the why-sentence |
| 2 | Script: panel → owner picks hook → `build_<slug>.py` → clarity critique → owner reads | `script/script.json`, `script-<slug>.md` | **hook choice, then script read** |
| 3 | Voice: Maya2 best-of-N per line, Whisper check, assemble | `audio/tts/voice.wav` | **voice A/B if anything changed** |
| 4 | Align: word timings + captions | `engine/src/data/timeline.json`, `renders/transcript.srt` | — |
| 5 | Shots: shot list, storyboard, parallel builders, stills | `engine/src/scenes/V*.tsx` | — |
| 6 | Audio: music fit, SFX cues, mix | `audio/music/bed_fitted.wav`, `engine/public/audio/mix.wav` | — |
| 7 | Draft render + QA (segments + naive viewers) → fix → check | fixed shots | — |
| 8 | Final render + verification | `renders/<slug>_final.mp4` | **owner watches it** |
| 9 | Upload package: description, tags, captions, thumbnail, GPT brief | `renders/YOUTUBE_UPLOAD_FOR_GPT.md` etc. | owner uploads |

Read `references/script-and-voice.md` before stage 2, `references/shots-and-engine.md` before stage 5, `references/qa-and-fixes.md` before stage 7, and `references/youtube-upload.md` before stage 9.

### Stage notes that matter most

**Setup (0).** Ask everything in one numbered Roman Urdu message: is the previous video uploaded (the GPT brief points at `renders/`), the new topic + slug, length, music bed, hero motif. Keep by default: paper-collage look, palette, fonts, the Anirban voice, pacing, SFX kit, mix levels. Change per topic: the hero object (keep the rust accent), the chapter-card design, archival photos, `script/video_meta.json`. Say how many agents and minutes the research fan-out takes before launching it.

**Research (1).** Every on-screen number and claim must trace to `facts-verdicts.md`. Mark weak facts "[CHECK]" and soften them in the script ("lagbhag", "kuch cents") or drop them. Keep a paste-ready credit line for every downloaded asset in `assets/raw/CREDITS.md`, because the description tool reads it.

**Script (2).** Build the script around ONE causal chain the viewer must be able to repeat back. For the container: "every item was lifted by hand thousands of times → ships sat in port as long as at sea → pack once, lift the whole box → fewer workers + ship leaves sooner → port cost down." Give the owner 2-3 hook options (the shock-number hook "$5.83 → 16 cents, 97%" won). Then run a critique pass with naive-viewer personas plus a fact checker and a pronunciation reviewer before any TTS. Rules and the `script.json` schema: `references/script-and-voice.md`.

**Voice (3).** Same voice on every video (Maya2 "Anirban"); the owner notices a change. Spell tricky English words for Maya in Devanagari the way they should *sound* (table in the reference), write money and years out as words, and re-check suspect lines with Whisper on that clip alone.

**Shots (5).** One shot per visual idea, about 3-8 s, a new beat at least every ~2.5 s, and visuals that land on their word (`p.w(N)`). Builders work in parallel by batch, so ownership rules prevent edit collisions: each builder owns its shot files plus one `parts/V_<batch>.tsx`, and shared code is read-only.

**QA (7).** QA has two halves. The usual frame review (typos, facts, glitches, sync, readability) is one. The other is a **clarity test**: two role-played naive viewers (a 19-year-old Lahore student, a 45-year-old Karachi shopkeeper with little English) go through transcript + frames and must explain the WHY in their own words. That test caught a chart whose biggest, circled bar contradicted the VO, which every frame reviewer had missed. Verify every blocker/major with an adversarial skeptic before fixing.

**Final (8).** `OUT=<slug>_final.mp4 tools/render_final.sh final`, then verify with ffprobe (1920x1080, 30 fps), ebur128 (about -14 LUFS; `mix.py` limits sample peaks to -1 dBFS, which measured -0.8 dBTP after AAC on the container video, fine for YouTube), a full decode (`ffmpeg -v error -i f -f null -`), and exact-time frame checks of every fixed spot.

## On-screen language rules (the audience is Pakistani, many with little English)

- Plain words only. Things that confused viewers: "idle", "freight", "wages", "illustrative", "≈", "¢", "held up" (means robbed), "THE CATCH", "THE FIGHT" (fight of whom against whom?), "ISO", "lift" as a noun (= elevator in PK English). Use: SHIP WAITING, LABOUR, Sea journey, (EXAMPLE), "=", "$0.16", GOODS STUCK, BUT…, WORKERS vs THE BOX, ONE WORLD STANDARD, LIFTED ONCE.
- Chapter cards must say what the chapter is about, not just set a mood.
- Never show a number the VO doesn't say in that shot (footnote sources are fine). Too many numbers was a v1 complaint.
- A chart must make the point without mental maths: if the VO says "port cost more than sea", the port bar must be visibly longer, not the sum of two shorter bars. Don't circle the thing you are de-emphasising.
- A price tag next to a product reads as that product's price. Label what the number is (SHIPPING: A FEW CENTS A SHIRT).
- Cause and effect should sit on screen together for at least ~1.5 s (FEWER WORKERS + SHIP LEAVES SOONER = PORT COST DOWN).
- Key rule text (e.g. McLean's "DON'T LIFT ITEM BY ITEM") must stay fully readable for more than a second.

## Working with the owner

- Communicate in Roman Urdu mixed with English technical terms.
- Gates in the table above are real: wait for the hook choice and the script read before spending hours on TTS and shots, and get a voice A/B before rebuilding on a new take.
- On vague feedback ("explanation confusing", "kharab", "ulta"), ask one short numbered multiple-choice question before rebuilding; guessing burns trust. The v2 rewrite started from such a question (hook A/B/C, which parts confused, voice keep/change, scope).
- The owner dislikes waiting. Run long jobs in the background, give a one-line status, and continue instead of pausing.
- The owner may be using the Mac (e.g. watching the video in QuickTime). A full render slows it down, so batch fixes into one render and don't start a render while they're reviewing unless asked. If they say stop, kill the render and its `chrome-headless-shell` children, then clear its Remotion temp dirs.
- The owner often hands the upload to GPT (Codex/ChatGPT). Stage 9 produces a self-contained brief for that.

## Operational gotchas

- **Disk:** Remotion `bundle()` copies `engine/public` (~100 MB) into `$TMPDIR/remotion-webpack-bundle-*` and never deletes it. ~500 still renders once filled 52 GB and blocked even Bash. `tools/stills.ts` now deletes its bundle; after a killed render, delete `$TMPDIR/remotion-*` (check that no Remotion process is running first). Never delete anything outside regenerable caches without asking, and never touch the owner's work repos.
- **RAM:** render with `--concurrency=4` (set in `render_final.sh`); a full 1080p render of 4.5 min takes about 15-30 min.
- **Workflow agents** die after ~180 s without progress. Tell every agent to keep each tool call under ~90 s and never rewrite a big file in one call. Tell builder/QA agents not to load web-UI design skills or code-graph tools (this is a video, and vox-studio isn't a git repo).
- **QA frames:** `ffmpeg -vf fps=2/3` samples about half a period late (a frame named 36.0 s shows ~36.75 s). Use `-vf "select='not(mod(n\,45))'"` or exact `-ss` extracts for sync judgements.
- **Fact drift in titles/thumbnails:** "97% cheaper" was the *loading cost per ton in 1956*, not shipping overall. Keep that precision in titles, thumbnails and descriptions.

## Licences and policy (put these in every final report)

- Credits required in the description: music (e.g. Lee Rosevere, CC BY 4.0), Kyutai Mimi codec (CC BY 4.0, used by Maya2), archival images (paste-ready lines from `assets/raw/CREDITS.md`). Maya2 is Apache-2.0. Self-made SFX need no credit.
- Remotion is free only for individuals and companies with ≤3 employees.
- YouTube: turn on the altered/synthetic content disclosure for the AI voice. The July 2025 "inauthentic content" policy targets mass-produced templated faceless videos, so original research, script and animation are what keep the channel safe. Don't templatise the content itself.
- If the Claude account in use is a work account, the owner should confirm that personal monetized use is OK.
