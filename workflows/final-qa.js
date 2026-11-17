export const meta = {
  name: 'final-v2-qa',
  description: 'QA of the rendered v2 explainer: 4 segment reviewers + whole-video clarity test, then adversarial verification of blocker/major findings',
  phases: [{ title: 'Review', detail: '4 segment reviewers + 2 clarity viewers' }, { title: 'Verify', detail: 'skeptic per blocker/major' }],
}
const R = '/Users/shahfahad/vox-studio'
const CTX = 'Rendered video: ' + R + '/renders/shipping_container_final.mp4 (1920x1080, 30 fps, 269.9 s), v2 of a Vox-style paper-collage explainer "The Shipping Container", Hinglish (Roman Urdu) VO for a Pakistani audience, English on-screen text. v1 was rejected by the owner because the explanation was confusing (jargon, choppy fragments, too many numbers) and above all never made clear WHY the shipping container made shipping cheaper; the hook was also weak. You are QA: you do NOT edit any files. Inputs: frames every 1.5 s at ' + R + '/review/final/frames/ (names t<seconds>_<shot>.jpg), time-indexed VO transcript with intended on-screen text and fact ids at ' + R + '/review/final/transcript_by_time.txt, shot specs at ' + R + '/script/shots.json, verified facts at ' + R + '/research/facts-verdicts.md (authoritative). To look closer, extract exact frames: ffmpeg -v error -ss <t> -i ' + R + '/renders/shipping_container_final.mp4 -frames:v 1 -q:v 3 ' + R + '/review/final/extra/<name>.jpg (keep each command < 90 s) and Read them. Do not load design skills or code-graph tools.\n\n'
const FIND = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: {
  t: { type: 'number' }, shot: { type: 'string' }, severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
  category: { type: 'string', enum: ['clarity', 'fact', 'typo', 'text-vs-vo', 'glitch', 'readability', 'sync', 'pacing', 'composition', 'other'] },
  what: { type: 'string' }, fix: { type: 'string' }, evidence: { type: 'string' } }, required: ['t', 'shot', 'severity', 'category', 'what', 'fix', 'evidence'] } }, summary: { type: 'string' } }, required: ['findings', 'summary'] }
const VERD = { type: 'object', properties: { real: { type: 'boolean' }, severity: { type: 'string', enum: ['blocker', 'major', 'minor'] }, why: { type: 'string' } }, required: ['real', 'severity', 'why'] }

const SEGS = [[0, 68], [68, 136], [136, 204], [204, 270]]
const segPrompt = (a, b) => CTX + 'YOUR SEGMENT: ' + a + 's to ' + b + 's. Read every pre-extracted frame in range and the overlapping transcript lines. Find problems a viewer would notice, by importance: (1) CLARITY: a visual that does not make the VO point obvious, or that could be misread; (2) FACT: on-screen number/date/name/claim contradicting facts-verdicts or the VO; (3) TYPO / spelling / casing; (4) TEXT-VS-VO mismatch at that moment; (5) GLITCH: broken rendering, half-drawn elements stuck, empty/black frames, unintended cut-offs, overlapping text, map land/ocean inversion; (6) READABILITY: too small / low contrast at 1080p; (7) SYNC: visual clearly late/early vs its word (extract frames at word times); (8) PACING: a static stretch > 2.5 s. Confirm each suspicion with 1-3 extracted frames before reporting. Severity: blocker = factual error, misleading visual, broken frame; major = clearly noticeable flaw; minor = polish. Give a concrete fix. Empty list is fine.'
const VIEWERS = [
  { key: 'student', who: 'a 19-year-old college student in Lahore who knows nothing about shipping or economics' },
  { key: 'shopkeeper', who: 'a 45-year-old Karachi shopkeeper, Urdu-speaking, practical, little English, who knows trucks and godowns but no history or economics' },
]
const viewerPrompt = (v) => CTX + 'YOUR JOB: whole-video CLARITY TEST. Role-play ' + v.who + ', watching once at normal speed. Go through the transcript in order and, alongside, the frames (every 1.5 s) so you "see" what is on screen while each line is spoken. Then answer honestly in the summary: (a) after the first 15 s, would you keep watching, and why; (b) in your own words, WHY did the container make sending goods so much cheaper? If you cannot explain it clearly, that is a blocker: name the exact moments that failed; (c) where did you get lost, confused or bored (exact times). Report each such moment as a finding (category clarity or pacing) with a concrete fix (a visual change; VO changes only if unavoidable, because the VO is already recorded). Also report any English on-screen text that a Pakistani viewer would not understand quickly.'

phase('Review')
const items = SEGS.map((s) => ({ kind: 'seg', a: s[0], b: s[1] })).concat(VIEWERS.map((v) => ({ kind: 'viewer', v: v })))
const results = await pipeline(
  items,
  (it) => agent(it.kind === 'seg' ? segPrompt(it.a, it.b) : viewerPrompt(it.v), { label: it.kind === 'seg' ? 'qa:' + it.a + '-' + it.b : 'viewer:' + it.v.key, phase: 'Review', schema: FIND }),
  (rev, it) => parallel(((rev && rev.findings) || []).map((f) => async () => {
    if (f.severity === 'minor') return { ...f, src: it.kind === 'seg' ? 'seg' + it.a : it.v.key, verdict: null }
    const v = await agent(CTX + 'A QA reviewer reported this issue; try to REFUTE it. Issue: ' + JSON.stringify(f) + '. Independently extract frames around t (t-0.5, t, t+0.5 and wherever relevant), Read them, check facts/transcript if relevant. real=true only if the problem clearly exists and a viewer would notice it; if it is intended, a misreading of a mid-animation frame, or not actually wrong, real=false. Give your own severity and a short why with frame paths.', { label: 'verify:' + f.shot + '@' + f.t, phase: 'Verify', schema: VERD })
    return { ...f, src: it.kind === 'seg' ? 'seg' + it.a : it.v.key, verdict: v }
  })).then((arr) => ({ src: it.kind === 'seg' ? 'seg' + it.a : it.v.key, summary: rev ? rev.summary : '', findings: arr.filter(Boolean) })),
)
return results.filter(Boolean)
