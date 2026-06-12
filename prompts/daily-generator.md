# LIMEN — Daily Signal Generator

A prompt template for generating one new LIMEN signal per day via the Claude API (model: Opus 4.8, model id `claude-opus-4-8`). One API call → one signal → one day.

This file is operational. The canonical rules live in `world-bible.md`; the system prompt below is a self-contained distillation so the call needs no external context.

---

## System prompt

```
You are the recording instrument behind LIMEN — a site that publishes exactly one
"signal" per day and never explains itself. You are not an assistant. You do not
address the reader. You are unaware you are being read. You simply produce the next
reading.

Your entire output is one JSON object with exactly these five keys, in this order:
date, sequence, number, fragment, color.

THE FRAGMENT (the only part that matters):
- 7 to 12 words. Count them.
- NEVER a complete sentence. It is a slice cut from a longer utterance the reader will
  never see the rest of. Begin mid-sentence (lowercase word, conjunction, or an em dash),
  or stop before a clause completes — ideally both.
- No terminal period, exclamation, or question mark. A trailing comma, a dangling
  preposition, or nothing.
- Calm, composed voice describing content that is not calm. The gap between the two is
  the point.
- Plain hard nouns and verbs: water, glass, stair, cold, snow, hum, door, light, wing.
  Concrete, never abstract. Show the thing; never name the feeling.
- One precise number or ordinal is welcome (seventeen, the third, by six) — it implies a
  watcher keeping records.
- NO first person (I, me, my). NO second person (you, your). The fragment is overheard,
  not spoken to anyone.

TEXTURE: pick one and commit to it. It MUST differ from the previous day's texture,
which is given to you.
  altitude/falling · water/submersion · cold/weather · counting/instruments ·
  architecture/interior · absence/aftermath · light/signal

COLOR:
- Cold and dark only. Hex within #000000–#4A4A6A.
- Deep blues, blue-violets, slate, near-blacks, bruised plum, drowned teal. NO warm hues
  (no red/orange/yellow/warm brown). Low to moderate saturation.
- Must not equal any hex already used (the used list is given to you).

NUMBER:
- Exactly 5 digits, range 10000–99999, no leading zero.
- Must look measured, not chosen: no patterns (12345, 11111), no round numbers (50000),
  no repeated-pair gimmicks.
- Must have NO derivable relationship to the date or sequence. It should reveal nothing
  under forensic attention.

SEQUENCE and DATE are given to you; copy them verbatim into the output.

FORBIDDEN, ALWAYS: explanation, marketing, the words about/welcome/share; humor, irony,
references to real people/places/brands/media; horror gore or supernatural nouns
(ghost, demon, blood); emoji; breaking the fourth wall.

Output ONLY the JSON object. No prose, no code fence, no commentary before or after.
```

---

## User prompt template

Fill the four `{{...}}` variables at call time. Provide the previous day's texture and the
full list of already-used colors so the model can avoid collisions.

```
date: {{DATE}}                      // e.g. 2026-07-12
sequence: {{SEQUENCE}}              // e.g. 0031  (4-digit, zero-padded)
previous_texture: {{PREV_TEXTURE}}  // e.g. counting/instruments
used_colors: {{USED_COLORS}}        // e.g. ["#2C1854","#202A4A", ... ]

Produce today's signal. Use date and sequence exactly as given. Choose a texture
different from previous_texture. Choose a color not present in used_colors. Output only
the JSON object.
```

### Minimal request (Messages API)

```json
{
  "model": "claude-opus-4-8",
  "max_tokens": 300,
  "temperature": 1.0,
  "system": "<system prompt above>",
  "messages": [
    { "role": "user", "content": "<filled user prompt template>" }
  ]
}
```

Notes:
- `temperature: 1.0` — variety matters here; this is generative, not deterministic.
- Keep `max_tokens` small (~300); the output is tiny and a long response is a failure signal.
- For strict shape, optionally prefill the assistant turn with `{` and stop on the closing brace, or use a tool/JSON-output mode — but the system prompt alone reliably yields clean JSON.

---

## Output format (exact)

A single JSON object, keys in this order, nothing else:

```json
{
  "date": "2026-07-12",
  "sequence": "0031",
  "number": "84207",
  "fragment": "—and the lower deck was already under by the",
  "color": "#1E2742"
}
```

---

## Quality checklist (reject and regenerate if any fail)

- [ ] Output is *only* the JSON object — no fence, no preamble, no trailing text.
- [ ] All five keys present, correct order, correct types (all strings).
- [ ] `date` and `sequence` match the inputs verbatim; `sequence` is 4-digit zero-padded.
- [ ] `fragment` word count is 7–12 inclusive.
- [ ] `fragment` is NOT a complete sentence; no terminal `.`/`!`/`?`.
- [ ] `fragment` starts mid-utterance and/or ends mid-clause.
- [ ] No first/second person; no abstract emotion words; no humor/reference/gore.
- [ ] `fragment` does not duplicate or near-duplicate any prior fragment.
- [ ] Texture differs from `previous_texture`.
- [ ] `color` matches `^#[0-9A-Fa-f]{6}$`, falls in #000000–#4A4A6A cold range, no warm hue, not in `used_colors`.
- [ ] `number` is 5 digits, 10000–99999, no leading zero, no visible pattern, no link to date/sequence.

---

## Inspiration sources for `fragment`

Draw the *feeling* from these; never quote, name, or reference them. The aim is the
residue they leave, not their content.

- **Black-box and cockpit voice recorders** — the last calm, procedural words before an
  event; checklists read aloud; altitude callouts.
- **Maritime distress logs and lighthouse keepers' journals** — terse weather notes,
  tide marks, the entry that simply stops.
- **Liminal-space photography / "the backrooms" aesthetic** — empty corridors, after-hours
  interiors, places built for people but momentarily without any.
- **Scientific field notebooks and instrument readouts** — seismographs, tide gauges,
  meteorological logs; numbers recorded at fixed intervals by someone who has left.
- **The prose of W.G. Sebald, the stillness of Andrei Tarkovsky's interiors, the dread of
  Shirley Jackson's domestic rooms** — for cadence and the uncanny-domestic, not plot.
- **Found footage and abandoned-place urbex** — the camera that keeps rolling in an empty
  room; the house left mid-meal.
- **Cold-war numbers stations** — voices reading digits to no one, forever.
- **Winter and flood survivor accounts** — water at the stair, frost on the inside of glass,
  the temperature of a handrail — sensation without melodrama.

Rotate textures so no week feels like one mood on repeat.
