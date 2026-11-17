#!/bin/zsh
# Archive the current video's per-video files before starting a new one. zsh script: run it directly, not with bash.
# usage: new_video.sh <slug-of-the-CURRENT-video> [--go]      e.g. new_video.sh shipping_container --go
#   without --go: dry run, lists what would be copied (sizes) and what to clear afterwards
#   with --go:    COPIES everything listed into ~/vox-studio/archive/<slug>/ (same relative layout). Never deletes anything.
# Clearing is left to you, AFTER the owner confirms (a) the archive looks right and (b) the old video is uploaded.
set -e
ROOT=${VOX_ROOT:-$HOME/vox-studio}   # VOX_ROOT override is for testing
SLUG=$1; GO=$2
if [[ -z "$SLUG" ]]; then echo "usage: new_video.sh <current-video-slug> [--go]"; exit 1; fi
DEST=$ROOT/archive/$SLUG
# per-video content: archive, then clear for the next video
CLEAR=(
  research/facts-raw.md research/facts-verdicts.md research/research_result.json
  script workflows
  audio/tts audio/cues.json audio/music/bed_fitted.wav
  engine/src/scenes engine/src/storyboard.ts engine/src/entries engine/src/data/timeline.json
  engine/public/img engine/public/audio/mix.wav
  assets/raw renders
)
# shared files with per-video tables inside: archive a copy, then EDIT (don't delete) them for the next video
RESET=(engine/SCENES.md tools/build_cues.ts tools/prep_all.sh)
cd $ROOT
echo "== archive '$SLUG' -> $DEST"
for p in $CLEAR $RESET; do
  if [[ -e $p ]]; then printf '  %-40s %s\n' $p "$(du -sh $p | cut -f1)"; else printf '  %-40s (missing, skipped)\n' $p; fi
done
if [[ -e renders/YOUTUBE_UPLOAD_FOR_GPT.md && ! -e renders/.uploaded ]]; then
  echo "!! renders/ holds an upload brief and no renders/.uploaded marker: ask the owner whether the video is uploaded before clearing renders/ (the brief points at those files)."
fi
if [[ "$GO" != "--go" ]]; then echo "dry run; add --go to copy"; exit 0; fi
if [[ -e $DEST ]]; then echo "ERROR: $DEST already exists; pick another slug or inspect it first"; exit 1; fi
FREE_KB=$(df -k $ROOT | tail -1 | awk '{print $4}')
NEED_KB=$(for p in $CLEAR $RESET; do [[ -e $p ]] && du -sk $p | cut -f1; done | awk '{s+=$1} END {print s+0}')
if (( NEED_KB * 2 > FREE_KB )); then echo "ERROR: need ${NEED_KB} KB, only ${FREE_KB} KB free; free space first"; exit 1; fi
for p in $CLEAR $RESET; do
  [[ -e $p ]] || continue
  mkdir -p $DEST/${p:h}
  cp -R $p $DEST/$p
done
echo "copied to $DEST ($(du -sh $DEST | cut -f1)). Nothing was deleted."
cat <<EOF
next steps, only after the owner OKs the archive and confirms the old video is uploaded:
  clear (per-video):  research/facts-raw.md facts-verdicts.md research_result.json, script/*, workflows/*,
                      audio/tts/*, audio/cues.json, audio/music/bed_fitted.wav,
                      engine/src/scenes/V*.tsx, engine/src/scenes/parts/V_*.tsx, engine/src/scenes/parts/B*_*.tsx,
                      engine/src/entries/*, engine/src/data/timeline.json, engine/public/img/*, engine/public/audio/mix.wav,
                      assets/raw/*, renders/*, review/*
  keep: engine/src/scenes/_*.tsx test scenes; engine/src/storyboard.ts until gen_storyboard.py rewrites it
        (tsc errors about missing V*.tsx until then are expected)
  edit (don't delete): engine/SCENES.md topic parts, BOOM_OK in tools/build_cues.ts, the image list in tools/prep_all.sh
  write new: script/video_meta.json (hook paragraph, chapter names, image map, sources, credits)
  final render: OUT=<new-slug>_final.mp4 tools/render_final.sh final
EOF
