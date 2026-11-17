"""Script builder template. Copy to ~/vox-studio/script/build_<slug>.py, fill TITLE, SLUG, WHY, TITLE_OPTIONS,
SECTION_NAMES and L, then run it with ~/vox-studio/.venv/bin/python. Writes script/script.json (read by TTS, align,
storyboard and description tools) and script/script-<slug>.md (the owner-read version, Roman Urdu + on-screen text).

Each line is a tuple: (section, facts, pause, onscreen, visual, pairs)
  section  key from SECTION_NAMES (drives chapters + acts)
  facts    'F03,F07' ids from research/facts-verdicts.md ('' if the line states no fact)
  pause    silence after the line, seconds (0.3 normal, 0.45-0.7 before a reveal or a new section)
  onscreen short plain English for the screen ('' = none); only numbers the VO says in this line
  visual   what the picture does, on which word
  pairs    T('roman|देवनागरी  roman|देवनागरी ...'): two spaces between pairs; numbers, money and years spelled
           out in Devanagari words; tricky English spelled for the sound (see references/script-and-voice.md)
"""
import json, os

ROOT = os.environ.get('VOX_ROOT', '/Users/shahfahad/vox-studio')
SLUG = 'my_topic'                      # same slug as OUT=<slug>_final.mp4
TITLE = 'My Topic'                     # heading of the owner-read file
WHY = 'one sentence the viewer must be able to repeat after watching (the causal chain)'
TITLE_OPTIONS = ['Roman Urdu title with the hook number', 'alternative', 'alternative']
SECTION_NAMES = {'hook': 'Hook', 'problem': 'Masla', 'mechanism': 'Kaise kaam kiya', 'proof': 'Saboot',
                 'world': 'Duniya par asar', 'twist': 'Lekin...', 'outro': 'Aakhir mein'}

T = lambda s: [p.split('|') for p in s.split('  ')]

L = [
    # ------------------------------------------------------------ HOOK (start mid-surprise, no greeting)
    ('hook', 'F01', 0.45, '1956 · LOADING COST: $5.83 / TON',
     'Heap of loose cargo slaps in; price card pins on "$5.83".',
     T('1956|उन्नीस सौ छप्पन  mein,|में,  jahaz|जहाज़  par|पर  ek|एक  ton|टन  maal|माल  chadhane|चढ़ाने  ka|का  kharcha|ख़र्चा  tha:|था,  $5.83.|पाँच डॉलर तिरासी सेंट।')),
    # ... one tuple per spoken line
]

lines = []
for i, (sec, facts, pause, onscreen, visual, pairs) in enumerate(L, 1):
    assert sec in SECTION_NAMES, (i, sec)
    for p in pairs:
        assert len(p) == 2 and p[0] and p[1], (i, p)  # a single space instead of two between pairs breaks this
    lines.append({'id': f'L{i:02d}', 'section': sec, 'roman': ' '.join(p[0] for p in pairs), 'onscreen': onscreen,
                  'visual': visual, 'facts': [f for f in facts.split(',') if f], 'pause': pause, 'pairs': pairs})

json.dump({'title_options': TITLE_OPTIONS, 'slug': SLUG, 'why': WHY, 'lines': lines},
          open(f'{ROOT}/script/script.json', 'w'), ensure_ascii=False, indent=2)

md = [f'# {TITLE}: script\n\nRoman Urdu VO. Neeche chhote font mein jo English text hai, wo screen pe aayega.\n\n**WHY:** {WHY}\n']
prev = None
for l in lines:
    if l['section'] != prev:
        md.append(f"\n## {SECTION_NAMES[l['section']]}\n"); prev = l['section']
    md.append(f"**{l['id']}** {l['roman']}" + (f"  \n<sub>screen: {l['onscreen']}</sub>\n" if l['onscreen'] else '\n'))
open(f'{ROOT}/script/script-{SLUG}.md', 'w').write('\n'.join(md) + '\n')

n = sum(len(l['pairs']) for l in lines)
print(f'{len(lines)} lines, {n} words, ~{n / 2.74:.0f}s of VO incl. pauses (container pace: 710 words -> 259 s) '
      f'-> script/script.json, script/script-{SLUG}.md')
