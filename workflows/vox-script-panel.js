// TEMPLATE (vox-explainer skill). This panel produced the container video's v1 script, which the owner rejected; the BRIEF
// below now carries the v2 lessons. Topic-specific text to replace for a new video: BRIEF (PROJECT, topic examples, company
// names, the Hoboken legend line, the BOX motif), ANGLES (A/B/C briefs), the number spellings in the Devanagari prompt.
export const meta = {
  name: 'vox-script-panel',
  description: 'Write the Hinglish (Roman Urdu) Vox-style script: 3 competing drafts, 3-lens judge panel, synthesis, Devanagari TTS conversion',
  phases: [
    { title: 'Draft', detail: '3 independent angles' },
    { title: 'Judge', detail: 'retention, visual, language lenses' },
    { title: 'Synthesize', detail: 'winner + grafted best lines' },
    { title: 'Devanagari', detail: 'TTS text pairs per word' },
  ],
}

const R = '/Users/shahfahad/vox-studio'
const BRIEF = `
PROJECT: A ~2:40 (2.5-3 min) Vox-style motion-graphics explainer for a faceless YouTube channel. Topic: "The Shipping Container: how a boring metal box built the modern world".
AUDIENCE: Pakistan + India, watching on phones. Narration in Hinglish written in ROMAN URDU (Latin script), spoken by a calm, confident male documentary narrator TTS voice. On-screen labels are English.
READ FIRST: ${R}/research/facts-verdicts.md (AUTHORITATIVE: what may be claimed and the safe wording), ${R}/research/facts-raw.md (sources, story beats) and sections 1, 6, 10 of ${R}/research/vox-style-guide.md (section 8 is about the first video; skip it).
LESSONS FROM A REJECTED SCRIPT (they override anything below):
- Build everything around ONE causal chain the viewer can repeat back (the WHY). State it first as why_sentence. The mechanism section must spell it out step by step, each step with a concrete picture. The first video was rejected because it never made the WHY clear.
- Full spoken sentences of 6-14 words. NO verbless fragments (\"Ek dabba. Ek size. Poori duniya.\" confused viewers).
- At most ONE new number per line, and only numbers that serve the WHY or the hook. Too many numbers was a rejection reason.
- No jargon or abbreviations in the VO (no TEU/ISO/patent-type words); say it plainly in Urdu/Hindi. Proper nouns only when they carry the story (the TTS mangles English names).
HARD RULES:
- Use ONLY facts allowed by facts-verdicts.md. Never invent numbers, quotes, dates or anecdotes. Avoid [CHECK] numbers unless you soften them ("lagbhag", "kuch cents"). Do not present the 1937 Hoboken legend as fact (call it a kahani if used). No fabricated quotes.
- Language: natural spoken Hindustani the way a Pakistani/Indian YouTube explainer talks: simple everyday Urdu/Hindi + common English words (ship, container, port, cost, economy, trade, system, idea, truck, driver, standard, size, record, global). Avoid heavy Sanskrit Hindi (no "vyavastha", "pranali") and heavy Persian/Arabic Urdu (no "tijarat-e-bahri"). Use "aap". Roman Urdu spelling should be common and readable (e.g. "hai", "mein", "aur", "lekin", "sirf", "dabba", "jahaz", "duniya", "sasta").
- Sentences short (mostly 6-14 words), punchy, rhythmic, made to be SPOKEN. Rhetorical questions and contrasts work well. Each line = one visual beat.
- Write to the picture: every line needs a concrete visual that IS the explanation (map, document highlight, chart, counter, collage photo, isometric container stacks, ship size comparison). The recurring visual motif is THE BOX (one orange box among grey ones). If a line has no picture, rewrite it.
- Hook within the first 8-10 seconds: no greeting ("Assalam o alaikum dosto" banned), no channel intro, no "is video mein hum dekhenge". Start in the middle of something surprising.
- Neutral and factual about South Asia (list Karachi, Mumbai/JNPA, Colombo as facts; no rivalry framing, no politics, no religion, no borders talk).
- No mention of Vox or any brand as sponsor. Company names only where factual (Sea-Land, Ideal-X, Ever Given, MSC Irina).
- Length: 650-750 Roman Urdu words, about 50 lines (~4-4.5 min; the container v2 was 710 words = 4:19 of VO) unless the owner set another length. End with a strong kicker line, then ONE short closing line that could sit over an end screen (no begging; e.g. a curiosity line). Digits are fine in Roman text (1956, 58, 24,346, $9.6 billion); they get spelled out later.
`

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    why_sentence: { type: 'string' },
    angle: { type: 'string' },
    title_ideas: { type: 'array', items: { type: 'string' } },
    lines: { type: 'array', items: { type: 'object', properties: {
      roman: { type: 'string' }, visual: { type: 'string' }, onscreen: { type: 'string' }, facts: { type: 'array', items: { type: 'string' } } },
      required: ['roman', 'visual', 'onscreen', 'facts'] } },
    word_count: { type: 'number' },
  },
  required: ['angle', 'why_sentence', 'title_ideas', 'lines', 'word_count'],
}

const ANGLES = [
  { key: 'A', name: 'mystery-hook', brief: 'ANGLE A "Mystery hook": open on the viewer\'s own things (phone, T-shirt, chai) and a surprising cost/journey fact, pose the question "kaise?", then reveal the box. Curiosity-gap structure with 2-3 open loops that pay off. Strong "before vs after" contrast in the middle.' },
  { key: 'B', name: 'character-story', brief: 'ANGLE B "Character story": a narrative arc around Malcom McLean (a trucker, not a sailor): problem he saw, the bet, Ideal-X, the fight with unions and rivals, the giveaway of the standard, Vietnam proving it, then the world he made. End on the horns kicker (F28). Keep it tight and visual, not a biography.' },
    { key: 'C', name: 'before-after-mechanism', brief: 'ANGLE C "Before/after mechanism": open on the shock contrast (before vs after, one number pair), then walk the viewer through how things worked BEFORE, step by step, and what exactly changed, until the WHY is obvious; then consequences and a twist. Few numbers, each tied to the mechanism.' },
]

phase('Draft')
const drafts = (await parallel(ANGLES.map(a => () => agent(
  `${BRIEF}\n${a.brief}\nWrite the complete script as lines (roman = narration line, visual = exact picture/animation description synced to that line, onscreen = the short English on-screen text/number for that line or "" , facts = fact IDs used). Count the Roman words honestly.`,
  { label: `draft:${a.name}`, phase: 'Draft', schema: DRAFT_SCHEMA }
).then(d => d ? { ...d, key: a.key } : null)))).filter(Boolean)
log(`drafts ready: ${drafts.map(d => d.key + '=' + d.word_count + 'w').join(', ')}`)

const show = drafts.map(d => `=== DRAFT ${d.key} (${d.word_count} words)\n` + d.lines.map((l, i) => `${i}. ${l.roman}\n    [visual] ${l.visual}\n    [screen] ${l.onscreen} [facts ${l.facts.join(',')}]`).join('\n')).join('\n\n')

const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: {
      draft: { type: 'string' }, hook: { type: 'number' }, retention_pacing: { type: 'number' }, clarity: { type: 'number' },
      visualizability: { type: 'number' }, language_naturalness: { type: 'number' }, accuracy: { type: 'number' }, total: { type: 'number' }, notes: { type: 'string' } },
      required: ['draft', 'total', 'notes'] } },
    winner: { type: 'string' },
    best_lines: { type: 'array', items: { type: 'object', properties: { draft: { type: 'string' }, line_index: { type: 'number' }, why: { type: 'string' } }, required: ['draft', 'line_index', 'why'] } },
    must_fix: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'winner', 'best_lines', 'must_fix'],
}

const LENSES = [
  { key: 'retention', p: 'You are a YouTube retention editor for Hinglish explainer channels (think the best Indian/Pakistani faceless explainers). Judge hook strength in the first 10 s, open loops, pacing, payoff, re-hooks every ~30 s, and the ending. Score each 1-10 per criterion.' },
  { key: 'visual', p: 'You are a Vox-style motion-graphics director. Judge whether every line has a concrete, explanatory visual (not decoration), whether the box motif recurs, map/ground alternation, variety of devices, and whether visuals are feasible to animate in code (Remotion, no stock video). Score each 1-10 per criterion.' },
  { key: 'language', p: 'You are a native Urdu/Hindi speaker and script doctor for TTS narration. Judge naturalness of the Roman Urdu Hinglish (would a real Pakistani/Indian narrator say this?), sentence rhythm for a TTS voice, readability of Roman spelling, and factual accuracy against facts-raw.md (open the file and check every number/date/name). Flag any invented or wrong fact. Score each 1-10 per criterion.' },
]

phase('Judge')
const judgements = (await parallel(LENSES.map(L => () => agent(
  `${BRIEF}\n${L.p}\nScore ALL drafts on: hook, retention_pacing, clarity, visualizability, language_naturalness, accuracy (1-10 each) and total (sum). Pick a winner, list the best individual lines from ANY draft worth grafting (draft letter + line index + why), and list must_fix issues (concrete).\n\n${show}`,
  { label: `judge:${L.key}`, phase: 'Judge', schema: JUDGE_SCHEMA }
).then(j => j ? { ...j, lens: L.key } : null)))).filter(Boolean)

const tally = {}
for (const j of judgements) for (const s of j.scores) tally[s.draft] = (tally[s.draft] || 0) + (s.total || 0)
const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'A'
log(`judge totals: ${JSON.stringify(tally)} -> winner ${winner}`)

const FINAL_SCHEMA = {
  type: 'object',
  properties: {
    why_sentence: { type: 'string' },
    hook_options: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, roman_lines: { type: 'array', items: { type: 'string' } }, why_it_hooks: { type: 'string' } }, required: ['name', 'roman_lines', 'why_it_hooks'] } },
    title_options: { type: 'array', items: { type: 'string' } },
    lines: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, section: { type: 'string' }, roman: { type: 'string' }, visual: { type: 'string' }, onscreen: { type: 'string' },
      pause_after: { type: 'number' }, facts: { type: 'array', items: { type: 'string' } } },
      required: ['id', 'section', 'roman', 'visual', 'onscreen', 'pause_after', 'facts'] } },
    word_count: { type: 'number' },
    changes_from_winner: { type: 'array', items: { type: 'string' } },
  },
  required: ['title_options', 'why_sentence', 'hook_options', 'lines', 'word_count', 'changes_from_winner'],
}

phase('Synthesize')
const final = await agent(
  `${BRIEF}\nYou are the head writer. Produce the FINAL script. Base it on DRAFT ${winner} (panel winner), graft the best lines the judges picked from other drafts where they improve it, and fix every must_fix item. Re-check every fact against facts-verdicts.md.\nRequirements: 650-750 Roman words (or the owner's length); why_sentence first; 2-3 hook_options (short opening blocks from different angles) besides the one you use; ids L01, L02, ...; section = hook|problem|invention|resistance|standard|explosion|today|twist|outro; pause_after in seconds (0.25 normal, 0.45 sentence-group end, 0.8 section change, 1.0 before the kicker); visual must be specific enough for an animator (what appears, where, synced to which word); onscreen = short English text (<=5 words) or number, or "".\nAlso write the final script as a readable two-column markdown table to ${R}/script/script-final.md (columns: id | Roman Urdu VO | visual | on-screen).\n\nJUDGEMENTS:\n${JSON.stringify(judgements, null, 1)}\n\nDRAFTS:\n${show}`,
  { label: 'synthesize', phase: 'Synthesize', schema: FINAL_SCHEMA }
)

const DEV_SCHEMA = {
  type: 'object',
  properties: {
    lines: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string' }, pairs: { type: 'array', items: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 } } },
      required: ['id', 'pairs'] } },
    notes: { type: 'string' },
  },
  required: ['lines'],
}

phase('Devanagari')
const dev = final ? await agent(
  `You convert a Roman-Urdu (Hinglish) narration script into Devanagari text for a Hindi TTS model (Maya 2), word by word.
For EVERY line, output "pairs": one [roman_word, devanagari] pair per Roman word, in order, covering every Roman word exactly once (split the Roman line on spaces; keep punctuation attached to the Roman word, and put the matching punctuation (, । ? !) at the end of the Devanagari part; use । for sentence-final full stops).
Rules for the Devanagari side:
- Correct Hindustani spelling with nukta where Urdu sounds need it: ज़ (z), फ़ (f), ख़ (kh), ग़ (gh), क़ (q). E.g. zindagi=ज़िंदगी, fayda=फ़ायदा, khaas=ख़ास, ghalat=ग़लत, qeemat=क़ीमत, sirf=सिर्फ़, duniya=दुनिया.
- English words in Devanagari, spelled the way Indians/Pakistanis pronounce them: container=कंटेनर, ship=शिप, port=पोर्ट, economy=इकॉनमी, cost=कॉस्ट, truck=ट्रक, standard=स्टैंडर्ड, system=सिस्टम, global=ग्लोबल.
- Numbers, years, currency and units spelled OUT as spoken in Hindustani: 1956=उन्नीस सौ छप्पन, 58=अट्ठावन, 24,346=चौबीस हज़ार तीन सौ छियालीस, $5.83=पाँच डॉलर तिरासी सेंट, 16 cents=सोलह सेंट, $9.6 billion=नौ दशमलव छह बिलियन डॉलर, 80%=अस्सी परसेंट, 2.65 million=दो दशमलव छह पाँच मिलियन (or a natural spoken form). A single Roman token like "1956" may map to several Devanagari words in one pair (that is expected).
- Abbreviations should not be in the VO at all (see lessons); if one is unavoidable, spell it as spoken letters.
- Keep it natural; do not add or drop words.
Return all lines. Script:
${JSON.stringify(final.lines.map(l => ({ id: l.id, roman: l.roman })), null, 1)}`,
  { label: 'devanagari', phase: 'Devanagari', schema: DEV_SCHEMA, effort: 'high' }
) : null

return { winner, tally, judgements, final, dev }
