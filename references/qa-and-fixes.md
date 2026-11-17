# QA and the fix loop

Run QA on a render (draft or final), never only on stills: real renders surface sync, transitions and pacing that stills hide. The container video ran two full QA rounds (v1 final, v2 final) and one fix round with checkers.

## Inputs for QA agents

```bash
F=renders/<file>.mp4
mkdir -p review/final/frames review/final/extra
ffmpeg -v error -i $F -vf "select='not(mod(n\,45))',scale=960:-1" -vsync vfr -q:v 3 review/final/frames/f_%03d.jpg   # exact 0, 1.5, 3.0 … s
```
Then rename each frame to `t<seconds>_<shotId>.jpg` (shot = the one with from ≤ t·30 < to in shots.json). Write `review/final/transcript_by_time.txt`: one row per line, `start-end shot id: roman | onscreen | facts`, from `timeline.json` + `script.json`. (Avoid `-vf fps=2/3`: it samples ~0.75 s late, so frames are mislabelled and sync looks early.)

Contact sheets of a time range help you look yourself (PIL grid, 4 columns, time label on each tile). Always look at the hook and the WHY section yourself before reading the agents' reports.

## QA workflow (template: `workflows/final-qa.js`)

Reviewer agents (read-only, structured findings: t, shot, severity blocker/major/minor, category, what, fix, evidence):
- **4 segment reviewers**, each about 68 s of the video. Order of importance: clarity → fact → typo → text-vs-VO → glitch (half-drawn, cut-off, overlaps, map land/ocean inversion) → readability → sync (confirm with exact `-ss` extracts at word times) → pacing (static > 2.5 s).
- **2 naive viewers** for the whole video (student, 19, Lahore; shopkeeper, 45, Karachi, little English). They answer: (a) would you keep watching after 15 s; (b) WHY did <the thing> happen, in your own words (if they can't explain it, that is a blocker, and they name the moments that failed); (c) where you got lost or bored. They also flag English on-screen words a Pakistani viewer won't get quickly.
- **Adversarial verify** of every blocker/major: an independent skeptic extracts its own frames and tries to refute. Only real=true findings go forward. In the v2 QA a "major" pacing issue was correctly refuted (it was an intended build-up), and the chart contradiction was confirmed.

Severity: blocker = factual error, misleading visual, broken frame; major = clearly noticeable flaw; minor = polish. Run your own findings through a pushback gate too: a concrete failure scenario plus evidence, or drop it.

## Turning findings into fixes

1. Group verified findings by batch (a finding that names several shots goes to every batch it touches) → `review/final/fix_findings.json`.
2. **Do the cross-batch text changes yourself first** (label renames shared by several shots, e.g. chip titles and bill rows), so parallel fixers can't disagree.
3. Decide the wording centrally and put exact strings in the fix prompts ("$0.16", never "16¢"; no "lift" as a noun; LABOUR / SHIP WAITING).
4. Fix workflow (template: `workflows/qa-fixes.js`): pipeline per owner → **fixer** (owns specific files, renders stills, reports) → **independent checker** (renders its own stills, ok=false if a required change is missing or a new defect exists) → one **repair** round if the checker failed. Give the core-WHY shots to a single owner even if they span batches.
5. Fix the small leftovers yourself (cosmetic issues from checkers: leader dots under bars, chips touching edges).
6. Typecheck the whole project, re-render, then extract exact frames at every fixed moment and look at them as one sheet.

What not to do with findings:
- Don't change the VO to fix a visual problem. The VO is recorded and re-recording shifts every timing. VO changes are only for real script errors, and they mean re-running TTS for those lines, assembling, aligning, regenerating the storyboard and re-keying shots.
- Don't park clear wins as questions to the owner. Implement them with a sensible default; ask only about real trade-offs.

## Final report to the owner (Roman Urdu)

- File path, duration, resolution, loudness, decode OK.
- What changed since the last version they saw, in plain words.
- What was checked (frame review, clarity test, fix checkers, your own frame look) and **what was not** (e.g. nobody watched it in real time with audio; full re-QA after fixes not run). Ask them to watch the hook and the WHY section first.
- Residual minors in one line each, only if a viewer could notice them.
- Licences/policy reminders (see SKILL.md) and disk status.
