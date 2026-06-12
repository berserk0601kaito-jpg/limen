# LIMEN — World Bible

> *limen* (Latin): the threshold; the doorstep; the point at which a stimulus becomes perceptible.

This document is internal. It is never shown on the site. It is the only place where anything is explained.

---

## 0. What LIMEN is

LIMEN is a place that publishes one signal each day and offers no reason for doing so.

It is not a blog. It is not an art project that announces itself as an art project. It is not a puzzle with a solution. It is closer to an instrument that was left running — a gauge on the wall of an empty room, still taking readings.

Do not write a single sentence anywhere on the site that tells the visitor what LIMEN is. The visitor must arrive at the threshold and decide, alone, whether to step over it. The only thing the site does is *continue*. Continuation is the entire meaning. Something keeps recording, and no one will say what it is recording, or for whom.

The correct emotional register: the feeling of finding a notebook that isn't yours, opened to a page mid-sentence, in handwriting that is calm and certain. Nothing is threatening you. That is precisely why it is unsettling.

---

## 1. The signal

Each day the site shows exactly one object:

```json
{
  "date": "2026-06-12",
  "sequence": "0031",
  "number": "94712",
  "fragment": "—still losing altitude when the windows",
  "color": "#2C1854"
}
```

Five fields. No sixth field will ever be added. Scarcity is load-bearing. The moment LIMEN explains, comments, or decorates, it dies.

---

## 2. Tone definition

### 2.1 Permitted

- **Stillness.** Quiet observation. The voice of something that has watched for a long time and is in no hurry.
- **Precision without context.** Exact numbers, exact nouns, exact verbs — attached to nothing the reader can verify.
- **The middle of things.** Arrivals into a scene already underway; departures before resolution.
- **The domestic made strange.** Windows, water, stairs, hallways, weather, light through curtains. Ordinary objects observed one degree too closely.
- **Physical sensation.** Cold, pressure, weight, the texture of surfaces. The body, but never named as "I."
- **Restraint.** One image is worth more than three. A fragment that almost resolves and then stops.

### 2.2 Forbidden

- **First-person confession.** No "I feel," no "my heart," no diary voice. The fragment is overheard, not spoken to you.
- **Explanation.** Never tell the reader what something means or why it matters.
- **Resolution.** No fragment is allowed to be a complete, satisfying sentence with a beginning and an end.
- **Whimsy, irony, cleverness, jokes.** No winking. LIMEN has no sense of humor and is not aware of you.
- **Horror tropes.** No blood, monsters, screaming, ghosts, gore, "darkness consumed." The dread is structural, not gory.
- **Brand voice.** No marketing, no calls to action, no "welcome," no "thank you for visiting."
- **Named people, real places, real dates of events, pop-culture references.** Nothing that anchors the signal to the known world.
- **Emoji, exclamation marks, ALL CAPS, hashtags.**

---

## 3. Writing the `fragment`

The fragment is the soul of the signal. Everything else is instrumentation around it.

### 3.1 Length and rhythm

- **7 to 12 words.** Count them. Outside this range it is wrong.
- It must read aloud in a single calm breath.
- Favor a falling cadence — the last word should feel like a step missed in the dark, not a drumroll.

### 3.2 Grammar (the most important rule)

A fragment is **never a complete sentence.** It is a slice cut from a longer utterance that the reader will never see the rest of. Achieve this by one of:

1. **Begin mid-sentence** — open with a lowercase word, a conjunction, or an em dash:
   - `—still losing altitude when the windows`
   - `and the water had already reached the second stair`
2. **End mid-sentence** — stop before the clause completes, no terminal punctuation:
   - `the corridor was longer on the way back than`
3. **Both** — a fragment with no shore on either side:
   - `—counted seventeen of them before the lights in the`

Capitalization: usually lowercase first letter (it is a continuation). Capitalize only proper-noun-shaped invented words, and use those sparingly.
Terminal punctuation: almost never a period. A trailing comma, a dangling preposition, or simply nothing.

### 3.3 Vocabulary

- Plain, hard, Anglo-Saxon nouns and verbs: *water, glass, stair, cold, wire, hum, snow, hand, door, light.*
- Concrete over abstract. Never "sadness." Show the thing that would make someone sad and then leave.
- One precise number per fragment is allowed and encouraged (*seventeen, the third, by 4 a.m.*). It implies a record-keeper.
- Avoid adjectives stacked in pairs. One modifier, chosen well.

### 3.4 The seven textures

Rotate among these so the corpus never feels like one mood repeated. No two consecutive days share a texture.

1. **Altitude / falling** — planes, towers, descent, things losing height.
2. **Water / submersion** — rising water, flooded rooms, the sea, condensation.
3. **Cold / weather** — snow, frost, wind, the temperature of glass.
4. **Counting / instruments** — measurements, dials, tallies, signals, frequencies.
5. **Architecture / interior** — corridors, stairs, doors, rooms that are wrong.
6. **Absence / aftermath** — empty chairs, cooling food, the just-departed.
7. **Light / signal** — lamps, screens, flares, the moment light fails.

---

## 4. "Beautiful, but it makes you anxious" — how to actually do it

Beauty and dread are produced by the *same gesture*, not balanced against each other. The technique:

- **Calm voice, wrong content.** The sentence is composed and elegant; what it describes should not be calm. The gap between the two is the dread.
- **Specificity without grounding.** "Seventeen of them" is frightening precisely because you cannot ask *seventeen what.* Precision implies a watcher; missing context implies you are not the watcher.
- **The interrupted clause.** A mind completes patterns. By cutting the sentence, LIMEN forces the reader to finish it — and the reader always finishes it worse than any author could.
- **No one is addressing you.** The beauty is overheard, not offered. Things that aren't meant for us are the most unsettling things to find.
- **Continuation as menace.** The fact that tomorrow there will be another one, and the day after, with no end declared, is the slow horror underneath the pretty surface.

---

## 5. `color`

The color is the room the fragment is shown in. It must be cold, dark, and never cheerful.

### 5.1 Selection criteria

- **Range:** roughly `#000000` to `#4a4a6a`. Dark always.
- **Hue family:** deep blues, blue-violets, slate, near-blacks with a cold cast, the occasional bruised plum or cold teal. **No warm hues** — no reds, oranges, yellows, warm browns. A trace of cold green is permitted (drowned, not spring).
- **Saturation:** low to moderate. Nothing neon, nothing candy.
- **Each color is unique** across the corpus. No exact hex repeats.
- Loosely, the darker colors suit the heavier fragments (falling, submersion, absence); slightly lighter slates suit counting/signal. This is a tendency, not a law.

### 5.2 Reference palette (drawn from, not limited to)

```
#0A0A12  near-black, cold cast
#11131C  ink
#161B2E  deep navy
#1C2440  midnight
#202A4A  drowned blue
#23283C  slate dark
#2C1854  bruised violet
#2A3450  steel dusk
#312A4E  plum shadow
#1A2E2E  drowned teal
#33384F  ash blue
#3A3550  cold mauve
#404A60  far slate
#454060  dust violet
#4A4A6A  the upper bound — fog at night
```

---

## 6. `number` (the five-digit reading)

A five-digit integer accompanies each signal. Its job is to *look like an instrument reading* — consistent in shape, opaque in meaning.

### 6.1 Rules for visual consistency

- **Always exactly 5 digits.** Range `10000`–`99999`. Never a leading zero (that would make it look like a code, not a reading).
- **No obvious patterns.** Avoid `12345`, `11111`, `54321`, round numbers like `50000`, repeated-pair gimmicks. It should look like it was *measured*, not chosen.
- **No relationship to `sequence` or `date`.** Resist any temptation to encode the day. If a clever visitor reverse-engineers a formula, the spell breaks. The number must survive forensic attention and reveal nothing.
- **Mild drift is fine, structure is not.** Numbers may wander across the range freely. They should not trend, cluster, or count.

The number is a fever chart for a patient who does not exist.

---

## 7. `sequence` — what it counts

`sequence` is a zero-padded four-digit counter that increments by one each day, beginning at `0001`. That much is mechanical. What it *counts* is deliberately never stated. Hold several readings at once and commit to none:

- **A.** Days the instrument has been running since it was switched on — and no one remembers switching it on.
- **B.** Iterations remaining before something completes. (At `9999`, then what? The site does not say.)
- **C.** The index of a transmission in a sequence whose origin and recipient are both unknown.
- **D.** Simply proof of continuity — evidence that yesterday happened, the way a ring proves a tree's year.
- **E.** Nothing. A number that increments because incrementing is what it does. The most frightening reading of all.

Never resolve this. If asked, LIMEN does not answer.

---

## 8. Prohibitions (explicit, non-negotiable)

1. No explanatory text anywhere on the site — no about, no FAQ, no captions, no footer.
2. No author name, no byline, no signature, no contact, no SNS links.
3. No analytics-shaped "share" prompts, no newsletter signup, no calls to action.
4. No fragment that is a grammatically complete, self-contained sentence.
5. No first person ("I", "me", "my") and no second person address ("you", "your").
6. No terminal periods/exclamation/question marks closing a fragment (rare em-dash or comma only).
7. No warm colors; no hex outside the `#000000`–`#4a4a6a` cold range; no repeated hex.
8. No number with a visible pattern or any derivable link to date/sequence.
9. No humor, irony, references to real people/places/brands/media.
10. No horror gore, no supernatural nouns ("ghost", "demon", "blood").
11. No two consecutive days sharing a texture (see 3.4).
12. Never break the fourth wall. LIMEN is unaware it is being read.
