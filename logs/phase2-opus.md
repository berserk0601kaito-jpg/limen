# Phase 2 — Opus 4.8 Worldbuilding Log

Date: 2026-06-12
Deliverables: `world-bible.md`, `content/seeds.json` (Day 0001–0030), `prompts/daily-generator.md`

---

## Decisions and reasoning

- **The world bible is the source of truth; everything else obeys it.** I wrote it first
  so that seeds.json and the generator prompt could be derived from one fixed rule set
  rather than drifting independently. The generator's system prompt is a self-contained
  distillation of the bible so the daily API call needs no external file.

- **"Beautiful but anxious" reframed as one gesture, not a balance.** Rather than
  alternating pretty lines and scary lines, I defined the effect as *calm voice + wrong
  content + interrupted clause*. This makes the rule reproducible by a model instead of
  being a matter of taste.

- **Seven fixed textures with a no-consecutive-repeat rule.** This prevents the corpus
  from collapsing into one mood (the failure mode of generated atmospheric writing) and
  gives the daily generator a concrete, checkable constraint.

- **Number must reveal nothing under forensic attention.** I explicitly forbade any
  derivable link between `number` and `date`/`sequence`. A clever visitor reverse-
  engineering a formula would break the spell, so the numbers wander the 10000–99999
  range with no trend. I picked them by hand to avoid accidental structure.

- **`sequence` meaning left deliberately unresolved.** The bible offers five readings
  (instrument uptime / countdown / transmission index / proof of continuity / nothing)
  and forbids ever choosing one. Ambiguity is the product.

- **Validation was run programmatically.** I scripted checks for JSON validity, key
  order, date+sequence continuity, 7–12 word counts, no terminal punctuation, no
  first/second person, fragment uniqueness, 5-digit patternless numbers, cold-range
  unique colors, and texture-adjacency. First pass caught a duplicate-color region
  (days 15–30 reused the reference palette) and a typo in one number; both fixed, second
  pass is clean.

## The three most important rules in the world bible

1. **The fragment is never a complete sentence (Section 3.2).** This single rule
   generates most of the dread. A cut clause forces the reader's mind to complete it, and
   the reader always completes it worse than any author could. If this rule is violated,
   LIMEN becomes ordinary microfiction.

2. **No explanation, no author, no fourth wall (Section 8, prohibitions 1–2 and 12).**
   The site's meaning *is* its refusal to explain. The instant it describes itself or
   addresses the visitor, the threshold collapses into a normal website.

3. **Calm voice, wrong content (Section 4).** Beauty and unease must come from the same
   sentence, not from separate ones. This is the stylistic engine the daily generator
   must reproduce.

## The "flow" built into seeds.json

The 30 days are not random. Several currents run underneath the texture rotation:

- **A descent arc.** The corpus opens (Day 0001) and closes its first flight beat
  (Day 0028) on *altitude/falling* — the runway "slid sideways under the wing." Between
  them, water keeps rising: "second stair" (0002) → "over the doorsill" (0009) → "lower
  rooms" (0016) → "windowsill and rising" (0029). The world is slowly going under across
  the month, but never says so.

- **An emptying house.** The absence/aftermath days form a quiet sub-story: two cold
  plates (0006) → warm chair, still-turning cup (0013) → unmade bed, radio between
  stations (0020) → coat on the hook, kettle gone (0027). Someone is always *just* gone.

- **An instrument that won't stop.** Counting days escalate from "dial stopped moving"
  (0004) to "needle past the last mark and climbing still" (0018) to "logged at six,
  again at six, the same six" (0025) — the machine slipping from stopped, to over-range,
  to looping. This mirrors what `sequence` itself is doing.

- **Color tracks weight loosely.** The heaviest beats (last bulb out 0014 → #0A0A12;
  runway under the wing 0028 → #1A1E32) sit near the darkest end; counting/signal days
  drift toward the upper slate bound. Tendency, not formula.

None of this is stated anywhere on the site. It only emerges if a visitor reads many days
in sequence — which rewards continuity without ever confirming intent.

## Hand-off to Phase 3 (Haiku)

- **Render only; never explain.** The front end must display the five fields and nothing
  else. No about page, footer, captions, share buttons, author, or SNS links. See
  prohibitions 1–3 in the bible.
- **`color` is the page background / room.** Each signal's color should fill the view
  (full-bleed background or dominant field). Fragment text should sit in a low-contrast
  off-white/pale-cold tone — readable but never bright. Center it; lots of negative space.
- **Show `sequence` and `number` as instrument readouts** — small, monospaced or
  tabular-figure, quiet, in a corner. They are gauges, not headlines.
- **One signal per day.** The site shows today's entry. seeds.json covers Day 0001–0030
  (2026-06-12 onward). From Day 0031 on, entries come from the daily generator in
  `prompts/daily-generator.md` (model id `claude-opus-4-8`).
- **Data contract is fixed and final:** keys `date, sequence, number, fragment, color`,
  all strings, in that order. No sixth field will ever be added — do not design for one.
- **`fragment` may start with an em dash or lowercase letter and end without punctuation.**
  This is intentional; do not "fix" it, trim it, or add quotation marks.
- **Generator needs two pieces of state from the running corpus:** the previous day's
  texture and the list of already-used colors, passed into the user prompt template.
  Whatever Phase 3 builds should be able to supply those (e.g. read the latest entry and
  the full color set from stored signals).
- **No analytics, no tracking, no cookies.** Anything that addresses or measures the
  visitor breaks the world.
