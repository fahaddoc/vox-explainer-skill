// TEMPLATE (vox-explainer skill). Adapt COMMON (topic, length), the facts prompt (topic questions) and the visual searches.
// FIRST_VIDEO=false (default) runs only the facts + visual tracks: the style guide, the TTS research and the shared SFX/music
// kit already exist, and re-running those tracks would OVERWRITE research/vox-style-guide.md and audio/CREDITS.md.
const FIRST_VIDEO = false
export const meta = {
  name: 'vox-research',
  description: 'Parallel research for a Vox-style Hinglish explainer: style guide, verified shipping-container facts, open-source Hindi/Urdu TTS, free visual + audio assets',
  phases: [
    { title: 'Research', detail: 'style guide, facts, TTS, visual assets, audio assets' },
    { title: 'Verify', detail: 'adversarial fact checks + license checks' },
  ],
}

const ROOT = '/Users/shahfahad/vox-studio'
const COMMON = `
Context: we are producing a ~4-4.5 minute Vox-style motion-graphics explainer for a faceless YouTube channel (monetized, so every asset/model must be legally OK for COMMERCIAL use). Topic: "The Shipping Container: how a boring metal box built the modern world". Narration language: Hindi/Urdu (Hinglish, written in Roman Urdu). On-screen labels in English. Renderer: Remotion (React) at 1920x1080 30fps on an Apple M1 Pro, 16 GB RAM. Disk is often nearly full (check 'df -h ~' first): never download anything larger than 50 MB, total downloads for your task must stay under 150 MB.
Tool hygiene (important): keep every single tool call short (< 60 s). Use curl with --max-time 45 -L. Do not run long installs. Do not pip/npm install anything. Prefer primary sources.
Project root: ${ROOT}
`

const STR = { type: 'string' }
const ARR_STR = { type: 'array', items: STR }

const STYLE_SCHEMA = {
  type: 'object',
  properties: {
    summary: STR,
    principles: { type: 'array', items: { type: 'object', properties: { rule: STR, how_to_implement_in_remotion: STR, source: STR }, required: ['rule', 'how_to_implement_in_remotion'] } },
    pacing: { type: 'object', properties: { avg_shot_seconds: STR, max_static_seconds: STR, notes: STR }, required: ['avg_shot_seconds', 'notes'] },
    palette_guidance: STR,
    font_recommendations_open_license: ARR_STR,
    easing_and_motion: ARR_STR,
    sound_design: ARR_STR,
    signature_devices: ARR_STR,
    anti_patterns: ARR_STR,
    sources: ARR_STR,
  },
  required: ['summary', 'principles', 'pacing', 'easing_and_motion', 'sound_design', 'signature_devices', 'anti_patterns', 'sources'],
}

const FACTS_SCHEMA = {
  type: 'object',
  properties: {
    facts: { type: 'array', items: { type: 'object', properties: { id: STR, claim: STR, key_number: STR, why_it_matters_for_story: STR, sources: ARR_STR }, required: ['id', 'claim', 'sources'] } },
    story_beats_suggestion: ARR_STR,
  },
  required: ['facts', 'story_beats_suggestion'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    verdicts: { type: 'array', items: { type: 'object', properties: { id: STR, verdict: { type: 'string', enum: ['confirmed', 'corrected', 'unverifiable', 'refuted'] }, corrected_claim: STR, evidence: STR, sources: ARR_STR }, required: ['id', 'verdict', 'evidence'] } },
  },
  required: ['verdicts'],
}

const TTS_SCHEMA = {
  type: 'object',
  properties: {
    candidates: { type: 'array', items: { type: 'object', properties: {
      name: STR, rank: { type: 'number' }, repo_or_hf_id: STR, code_license: STR, weights_license: STR, commercial_use_ok: { type: 'boolean' },
      languages_relevant: STR, input_script_needed: STR, runs_on_apple_silicon_how: STR, approx_download_mb: { type: 'number' },
      install_cmd: STR, minimal_python_example: STR, voices_or_speaker_control: STR, quality_notes: STR, sources: ARR_STR }, required: ['name', 'rank', 'code_license', 'weights_license', 'commercial_use_ok', 'input_script_needed', 'install_cmd', 'minimal_python_example', 'sources'] } },
    excluded: { type: 'array', items: { type: 'object', properties: { name: STR, reason: STR }, required: ['name', 'reason'] } },
  },
  required: ['candidates', 'excluded'],
}

const ASSET_SCHEMA = {
  type: 'object',
  properties: {
    assets: { type: 'array', items: { type: 'object', properties: {
      local_path: STR, depicts: STR, source_page_url: STR, license: STR, attribution_text: STR, width: { type: 'number' }, height: { type: 'number' } }, required: ['local_path', 'depicts', 'source_page_url', 'license'] } },
    notes: STR,
  },
  required: ['assets'],
}

const LICENSE_VERDICT = {
  type: 'object',
  properties: { checks: { type: 'array', items: { type: 'object', properties: { item: STR, license_confirmed: { type: 'boolean' }, commercial_ok: { type: 'boolean' }, actual_license: STR, attribution_required: STR, evidence: STR }, required: ['item', 'license_confirmed', 'commercial_ok', 'evidence'] } } },
  required: ['checks'],
}

const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out }

const TRACKS_ALL = [
  {
    key: 'style',
    schema: STYLE_SCHEMA,
    prompt: `${COMMON}
TASK: Research how proper Vox-style motion graphics are made and what makes them look professional, then turn it into an IMPLEMENTABLE style guide for a code-based renderer (Remotion/React, no After Effects).
Look for: Vox's own behind-the-scenes / "how we make" videos and articles (e.g. Vox video team, Joss Fong, Christophe Haubursin, Johnny Harris when at Vox, Vox Borders, Vox Atlas, Vox "Earworm"), motion-design breakdowns (School of Motion, Motion Array, Envato tutorials named "Vox style"), and analyses of the style.
Cover concretely: collage/cut-out paper look (white stroke around photo cutouts, drop shadows, paper/grain textures, halftone), the highlighter-on-document device, map animations (route lines drawing on, pulsing pins, labels), chart builds, kinetic typography, the 2.5D parallax camera push, how scenes transition (match cuts, whip/slide, camera travel across a big canvas), shot length / pacing numbers, easing curves (give cubic-bezier values or spring settings), colour palette approach (limited palette + 1 accent), font choices (recommend only OPEN-licensed fonts like Google Fonts OFL that look close), and SOUND DESIGN (whooshes on moves, paper/slide sounds on cutouts, clicks/pops on labels, risers, music bed choice, ducking levels in dB, loudness target for YouTube in LUFS).
Also list anti-patterns that make amateur "Vox-like" videos look cheap.
Write the full guide as markdown to ${ROOT}/research/vox-style-guide.md (with source URLs), then return the structured summary.`,
  },
  {
    key: 'facts',
    schema: FACTS_SCHEMA,
    prompt: `${COMMON}
TASK: Gather 22-28 hard, specific, story-worthy facts for the script about the shipping container's history and impact. Each fact needs at least 2 reputable sources (books like Marc Levinson "The Box", academic papers, port authority / UNCTAD / World Bank / Maersk / MSC official pages, reputable news). Include exact numbers with units and years.
Must cover: break-bulk shipping before containers (how long loading took, cost per ton, labour, theft/pilferage), Malcom McLean (trucker, 1956 Ideal-X Newark -> Houston, number of containers on board, cost per ton before vs after), standardisation (ISO sizes, TEU/FEU definitions, twistlock/corner castings), Vietnam War logistics (Cam Ranh Bay) role, how ports changed (Newark/Elizabeth vs Manhattan/Brooklyn piers; dock-worker employment collapse), ship size growth over time (Ideal-X 58 boxes -> today's largest ships ~24,000+ TEU, name the ship), how cheap shipping is today (cost to ship one item e.g. a T-shirt / phone / bottle of wine from Asia to Europe/US, or freight share of retail price), share of world trade by value/volume moving by sea and in containers, number of containers in existence, the 2021 Ever Given Suez blockage (days blocked, trade value held per day), and a South Asia angle (Karachi Port / Port Qasim, Colombo, JNPT Mumbai container throughput in TEU with year).
Most important: a MECHANISM section. Explain step by step how things worked BEFORE, what exactly changed, and what got faster or cheaper, and by how much (sourced). Then propose ONE why-sentence a viewer could repeat after watching. Keep numbers few and tied to that mechanism. Mark any number you are unsure of in the claim text.
FILE FORMAT (tools parse it): one block per fact, heading \`### F01: <short title> [VERIFIED]\` or \`[CHECK]\` (two-digit ids), then the claim, key number, why it matters and the source URLs inside that block; finish with \`## Mechanism\` and \`## Story beats\` sections.
Also give 6-9 suggested story beats (hook -> problem -> invention -> resistance -> standardisation -> explosion -> today -> twist/kicker).
Write the facts with sources to ${ROOT}/research/facts-raw.md and return them structured.`,
  },
  {
    key: 'tts',
    schema: TTS_SCHEMA,
    prompt: `${COMMON}
TASK: Find the best OPEN-SOURCE text-to-speech options for natural Hindi/Urdu (Hindustani, Hinglish-style narration with some English words) that run LOCALLY on an Apple M1 Pro (16 GB) with Python, and whose code AND model weights allow COMMERCIAL use (monetized YouTube).
Evaluate at least: Kokoro-82M (hexgrad, Hindi voices hf_alpha/hf_beta/hm_omega/hm_psi), ai4bharat Indic Parler-TTS (does it support Urdu? speaker names?), Resemble AI Chatterbox Multilingual (Hindi?), IndicF5, k2-fsa OmniVoice, Piper hi_IN voices (check the voice dataset license), mlx-audio supported models, Sarvam open models (Bulbul?), Veena / Svara or other 2025-2026 Indic TTS releases, and any open Urdu TTS. EXCLUDE non-commercial ones (e.g. Meta MMS-TTS CC-BY-NC, Coqui XTTS CPML) and say why.
For each candidate: exact HF id / repo, code license, weights license (check the model card's license field), whether input must be Devanagari / Urdu Nastaliq / romanized, how to run on Apple Silicon (MPS, MLX, CPU), approximate download size, a minimal working Python example (from the official README), speaker/voice control, and any quality notes from users/benchmarks (naturalness for Hindi narration).
Rank them for: a calm, confident, documentary-narrator Hindi/Urdu male or female voice. Write the report to ${ROOT}/research/tts-options.md and return structured data.`,
  },
  {
    key: 'visual',
    schema: ASSET_SCHEMA,
    prompt: `${COMMON}
TASK: Find and DOWNLOAD 14-22 high-resolution images that are PUBLIC DOMAIN or CC0 (CC-BY acceptable only if nothing else exists; NO CC-BY-SA, NO NC, NO "editorial only") for a Vox-style collage explainer about the shipping container.
Good sources: Wikimedia Commons (check the file's license template carefully), Library of Congress (FSA/OWI and other "no known restrictions" collections), US National Archives, US Navy / DoD / NOAA / NASA (US federal works are public domain), Smithsonian Open Access (CC0), Rawpixel public domain, Unsplash/Pexels are NOT acceptable (not CC0, restrictions on collage resale is fine but keep to PD/CC0 for safety).
Wanted subjects: (1) break-bulk era longshoremen loading sacks/crates by hand at docks (1900s-1950s), (2) cargo nets / slings being lifted, (3) a 1950s-60s cargo ship or early container ship, (4) Malcom McLean portrait if any PD/CC0 exists (else skip), (5) container ship at sea modern (top-down or side), (6) container port with gantry cranes, (7) stacked colorful containers, (8) a single standard 20ft/40ft container, (9) Vietnam-era military cargo / Cam Ranh Bay port, (10) a truck carrying a container, (11) Earth at night / Blue Marble from NASA, (12) Suez Canal / Ever Given satellite image (Copernicus Sentinel is CC-BY-like attribution — check), (13) a vintage paper texture or old newspaper/ledger page that is PD (for backgrounds), (14) old world map PD (for a parchment map look).
Download each original (or a >=1600px rendition) into ${ROOT}/assets/raw/ with descriptive snake_case names. Use the Wikimedia API (e.g. https://commons.wikimedia.org/w/api.php?action=query&titles=File:...&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=2400&format=json) to get license metadata + a sized URL. Set a User-Agent header like "vox-studio-research/1.0 (personal project)". Verify each file opens (use 'sips -g pixelWidth -g pixelHeight file'). Delete any download that fails or is under 1000px wide.
Write ${ROOT}/assets/raw/CREDITS.md listing every file with source page, license, attribution text. FORMAT (tools/make_description.py parses it): one section per file, a heading line '## <n>. <raw filename>', then bullets including '- **Credit line (paste-ready):** <text>', '- **License:** ...' and '- **Source:** <url>'. Return structured data.`,
  },
  {
    key: 'audio',
    schema: ASSET_SCHEMA,
    prompt: `${COMMON}
TASK: Find and DOWNLOAD sound effects and 1-2 music beds that are CC0 / public domain (or a royalty-free licence that explicitly allows commercial YouTube use without Content ID claims and without attribution trouble) for a Vox-style explainer's premium sound design.
Wanted SFX (short, clean, dry): soft whooshes (3-5 variants, short + medium), paper slide / paper rustle / paper cutout placement, soft UI pop / click / tick (for labels and numbers), a typewriter key or stamp hit, a camera shutter, low boom/impact (subtle, cinematic), a riser (2-4 s), metal container clank / door, ship horn (distant), crane/port ambience, ocean/harbour ambience, cash register or coin ding, map pin drop. Music: 1-2 calm, minimal, documentary-explainer beds (piano/plucks/light electronic, 90-110 BPM, 2.5+ minutes or loopable).
Good sources: Kenney.nl audio packs (CC0, direct zip downloads, small), OpenGameArt CC0 section, Wikimedia Commons audio (check licence), freesound.org only if a direct download without login is possible (usually not), Free Music Archive / ccMixter tracks marked CC0 or CC-BY (CC-BY OK for music if attribution is simple), Pixabay content licence is acceptable as fallback but note it. Avoid YouTube Audio Library (cannot fetch).
Download into ${ROOT}/audio/sfx/ and ${ROOT}/audio/music/ (unzip packs, keep only the useful files; delete zips). Convert nothing. Check each with 'ffprobe -hide_banner' (duration, sample rate). Keep total under 120 MB.
Write ${ROOT}/audio/CREDITS.md with every file, source page, licence and attribution. Return structured data (local_path, depicts = what the sound is + duration, source_page_url, license, attribution_text).`,
  },
]
const TRACKS = FIRST_VIDEO ? TRACKS_ALL : TRACKS_ALL.filter(t => ['facts', 'visual'].includes(t.key))
log(`research tracks: ${TRACKS.map(t => t.key).join(', ')}`)

phase('Research')
const results = await pipeline(
  TRACKS,
  t => agent(t.prompt, { label: `research:${t.key}`, phase: 'Research', schema: t.schema }),
  async (res, t) => {
    if (!res) return { key: t.key, res: null }
    if (t.key === 'facts') {
      const groups = chunk(res.facts || [], 4)
      const ver = await parallel(groups.map((g, i) => () => agent(
        `${COMMON}
TASK: You are an adversarial fact-checker. Try to REFUTE each claim below using independent reputable sources (do not just re-open the sources given; search independently). For each: verdict 'confirmed' only if 2 independent reputable sources agree with the specific number/year; 'corrected' if the real figure differs (give corrected_claim with the right number + source); 'refuted' if wrong; 'unverifiable' if you cannot find 2 sources. Default to 'unverifiable' when uncertain. Keep it tight: max ~8 web lookups total.
Claims:
${g.map(f => `- [${f.id}] ${f.claim} (key number: ${f.key_number || 'n/a'}) | given sources: ${(f.sources || []).join(' , ')}`).join('\n')}`,
        { label: `verify:facts-${i + 1}`, phase: 'Verify', schema: VERDICT_SCHEMA }
      )))
      return { key: t.key, res, verify: ver.filter(Boolean).flatMap(v => v.verdicts || []) }
    }
    if (t.key === 'tts') {
      const top = (res.candidates || []).filter(c => c.commercial_use_ok).sort((a, b) => a.rank - b.rank).slice(0, 4)
      const ver = await parallel(top.map(c => () => agent(
        `${COMMON}
TASK: Adversarially verify the licence claims for this TTS model. Open the actual HF model card / repo LICENSE. Claims: code licence = "${c.code_license}", weights licence = "${c.weights_license}", commercial use OK = ${c.commercial_use_ok}, model id = "${c.repo_or_hf_id}", supports Hindi and/or Urdu = "${c.languages_relevant}". Also note any training-data licence caveat (e.g. dataset is CC-BY-NC) that a cautious YouTuber should know. Default license_confirmed=false if you cannot open the licence text. Max ~5 lookups.`,
        { label: `verify:tts-${c.name}`.slice(0, 40), phase: 'Verify', schema: LICENSE_VERDICT }
      )))
      return { key: t.key, res, verify: ver.filter(Boolean).flatMap(v => v.checks || []) }
    }
    if (t.key === 'visual' || t.key === 'audio') {
      const groups = chunk(res.assets || [], 5)
      const ver = await parallel(groups.map((g, i) => () => agent(
        `${COMMON}
TASK: Adversarially verify the licence of each downloaded asset below by opening its source page (for Wikimedia use the API extmetadata LicenseShortName / UsageTerms / Copyrighted fields). We need commercial use in a monetized YouTube video, collage/edited. Flag anything CC-BY-SA, NC, ND, "editorial", "personal use", unknown, or where the PD claim is doubtful (e.g. photo by a private company). Max ~8 lookups.
Assets:
${g.map(a => `- ${a.local_path} | ${a.depicts} | ${a.source_page_url} | claimed: ${a.license}`).join('\n')}`,
        { label: `verify:${t.key}-${i + 1}`, phase: 'Verify', schema: LICENSE_VERDICT }
      )))
      return { key: t.key, res, verify: ver.filter(Boolean).flatMap(v => v.checks || []) }
    }
    return { key: t.key, res }
  }
)

const out = {}
for (const r of results.filter(Boolean)) out[r.key] = r
const missing = TRACKS.map(t => t.key).filter(k => !out[k] || !out[k].res)
if (missing.length) log(`Tracks with no result: ${missing.join(', ')}`)
return out
