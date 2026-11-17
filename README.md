# vox-explainer (Claude Code skill)

A Claude Code skill for making faceless, Vox-style motion-graphics explainer videos for YouTube, narrated in Hinglish (Roman Urdu). It covers:

- research with adversarially verified facts
- a script built around one causal "why"
- an open-source Maya2 TTS voice and Whisper word timing
- paper-collage Remotion shots synced to words
- music and SFX mix
- naive-viewer clarity QA
- the 1080p render
- a YouTube upload brief

## Install

```bash
git clone git@github.com:fahaddoc/vox-explainer-skill.git ~/.claude/skills/vox-explainer
```

Claude Code picks it up from `~/.claude/skills/`. Then ask for a new explainer video ("nayi Vox video banao: <topic>").

## Layout

- `SKILL.md`: stages, owner gates, the quality bar, on-screen language rules, gotchas
- `references/`: commands per stage, script and voice rules, the shots/engine contract, the QA and fix loop, the upload package
- `workflows/`: Workflow-tool templates (research, script panel, critique, shot builds, QA, fixes). Adapt the topic text before running.
- `scripts/new_video.sh`: archives the previous video's files (copy only, never deletes)
- `scripts/build_script_template.py`: script builder (writes `script.json` and an owner-read markdown file)

## Requirements

The skill drives the tools and the Remotion engine in a local `~/vox-studio` project (Python venvs with mlx-audio, mlx-whisper, pyloudnorm, plus Node/Remotion). That project is not part of this repo. The paths assume macOS on Apple Silicon.
