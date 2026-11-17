# Workflow templates

These are the Workflow-tool scripts that produced "The Shipping Container" (Nov 2026), updated with what the owner taught us. They are **templates**: copy one to `~/vox-studio/workflows/<slug>-<stage>.js` (that folder is archived with the video by `scripts/new_video.sh`), adapt the topic-specific parts, then run it with the Workflow tool (`scriptPath`). Run unchanged on a new topic, they would research and judge the container story.

Before launching one, tell the owner in one line what it does, roughly how many agents it runs and how long it takes (research ~15-25 min, build ~45-60 min, QA ~15 min, fixes ~50 min). It's fine to do this as part of the stage-0 question.

| File | Stage | What to adapt | What stays |
|---|---|---|---|
| `vox-research.js` | 1 Research | `COMMON` (topic, length), the facts prompt (topic questions), the visual searches. `FIRST_VIDEO` stays `false`, so only the facts and visual tracks run; `true` would also rebuild the style guide, TTS research and SFX kit and overwrite their shared files. | schemas, adversarial fact + licence verify, the facts-raw.md and CREDITS.md formats the tools parse |
| `vox-script-panel.js` | 2 Script | `BRIEF` (PROJECT line, topic examples, company names, the container-specific legend line, the hero-object motif), the three `ANGLES` briefs, the number spellings in the Devanagari prompt | the v2 lessons block (one WHY chain, no fragments, ≤1 new number per line, no jargon), 3 drafts → 3 judges → synthesis with `why_sentence` + `hook_options` → Devanagari pairs |
| `script-critique.js` | 2 Critique | `CTX` **and the topic text inside every lens prompt**: the fact checker and the pronunciation reviewer name container facts and words (McLean, Houston…). Replace them with the new topic's facts and risky words. | naive-viewer personas (student, shopkeeper), fact checker, Hinglish/pronunciation reviewer, a skeptic per edit |
| `build-shots.js` | 5 Shots | `BATCHES` (from shots.json), `CTX` (video name). Drop the v1-reuse notes (`archive/v1`, re-keying old `p.w`) for a fresh video. | one builder per batch → fresh-eyes reviewer → fixer, the file-ownership rules |
| `final-qa.js` | 7 QA | `CTX` (video name, duration, what the owner rejected before), `SEGS` (~68 s each, covering the full duration), the viewer roles' "WHY" question | 4 segment reviewers + 2 naive viewers, a skeptic per blocker/major |
| `qa-fixes.js` | 7 Fixes | `TASKS` (one per owner: files owned + exact required changes), the wording rules in `BASE` | fix → independent checker → one repair round |

Rules baked into every prompt (keep them):
- Agents keep each tool call under ~90 s (they stall out after 180 s without progress) and never rewrite a big file in one call.
- No web-UI design skills, no code-graph tools (this is a video, and vox-studio isn't a git repo).
- QA and verify agents are read-only; only fixers edit, and only the files they own.
- `facts-verdicts.md` is authoritative for anything shown or said.
