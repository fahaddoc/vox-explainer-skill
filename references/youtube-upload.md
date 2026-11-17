# YouTube upload package

The owner usually hands the upload to GPT (Codex or ChatGPT on the same Mac). Produce a self-contained brief GPT can follow without this conversation. The container video's brief is a good example: `~/vox-studio/renders/YOUTUBE_UPLOAD_FOR_GPT.md`.

## Files to prepare (all in `renders/`)

| File | How |
|---|---|
| `<slug>_final.mp4` | final render, verified |
| `youtube_description.txt` | `tools/make_description.py` (title options, hook paragraph, chapters from sections, sources from cited facts, credits from used images). All per-video text (hook paragraph, chapter names, image map, extra sources, credits) comes from `script/video_meta.json`; write it fresh per video. |
| `youtube_description_only.txt` | everything after `--- DESCRIPTION ---`, plus 3 hashtags at the end (`#Topic #Economics #Urdu`). Check < 5000 chars and no `<` or `>` (YouTube rejects angle brackets). |
| `youtube_tags.txt` | comma-separated, ≤ 500 chars, mixing English and Roman-Urdu search terms |
| `transcript.srt` | from `align.py`. Still valid after visual-only fixes (the timeline didn't change). |
| `thumb/thumbnail_base_1280x720.jpg` | a strong hook frame, cropped to 16:9 without clipped footnotes, 1280x720, < 2 MB |
| `YOUTUBE_UPLOAD_FOR_GPT.md` | the brief, sections below |

Title: Roman Urdu, curiosity plus the topic keyword, under 100 chars (aim ≤ 80). Container example: `Ek Dabbe Ne Jahaz Bharna 97% Sasta Kaise Kiya? | Shipping Container Ki Kahani`. The number must be stated as precisely as the fact allows ("jahaz bharna" = loading, not "shipping").

## Brief sections (fill all of them)

1. **Files**: absolute paths, size/duration, the exact video file and how to recognise it (render time, byte size, a visible detail at a timestamp). Say which files NOT to upload (draft, archive).
2. **What the video is**: 4-6 bullets of the story, plus a **fact guardrail**: the exact meaning and source of every headline number, and "never exaggerate it".
3. **Title**: recommended + 3 alternatives.
4. **Description, tags, captions**: paste rules. Captions: Subtitles → Urdu → Upload file → With timing → `transcript.srt`; spot-check sync at 3 timestamps.
5. **Settings table**:
   - Audience: not made for kids. Category: Education. Language: Urdu.
   - **Altered or synthetic content: Yes** (AI voice).
   - Automatic chapters off (the description has them). License standard, embedding on.
   - Comments on with "hold potentially inappropriate".
   - End screen in the last ~10-12 s (the tail after the VO), elements placed away from the final artwork.
   - Visibility: Private first, then Public or Schedule (Pakistan evening, 7-9 pm PKT).
6. **Thumbnail rules**: 1280x720, < 2 MB, same paper-collage look, 3-4 big words, only true numbers, no real faces, AI faces or brands. "Test & compare" for 2-3 variants.
7. **Checks before Public**: 1080p processed, chapters visible, captions in sync, copyright check clean (if a claim appears, report it to the owner; don't dispute it alone), synthetic label set.
8. **Pinned comment**: one honest line, e.g. "Sources aur credits description mein hain. Agar koi number ya fact galat lage to bata dein, check kar ke theek kar dunga." No engagement bait.
9. **Do not**: re-encode/trim, change facts or credits, claim a human voice, touch monetization or channel-wide settings, put the owner's email or personal details anywhere.

If the owner decides to ship an older render (e.g. they stopped a re-render), update the brief's file check to match that exact file, and revert any un-rendered source change so the code matches what was uploaded.

## Policy notes

- YouTube asks creators to disclose realistic altered or synthetic media. An AI narrator voice is the safe "Yes".
- The July 2025 "inauthentic content" monetization rule targets mass-produced, repetitive, templated faceless videos. Original research, a new script and new animation per video are the defence; reusing the pipeline is fine, reusing content is not.
- Credits that CC BY requires: the music track + artist + licence + link; Kyutai Mimi codec (CC BY 4.0, used by Maya2); each CC BY image. Public-domain images get a courtesy credit line.
