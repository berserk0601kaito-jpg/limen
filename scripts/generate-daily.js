#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// ===== Configuration =====
const EPOCH_DATE = new Date('2026-06-12T00:00:00Z')
const TEXTURES = [
  'altitude/falling',
  'water/submersion',
  'cold/weather',
  'counting/instruments',
  'architecture/interior',
  'absence/aftermath',
  'light/signal'
]

// ===== Utility Functions =====

/**
 * Parse command-line argument or use today's date
 */
function getTargetDate() {
  const arg = process.argv[2]
  if (arg) {
    const parsed = new Date(`${arg}T00:00:00Z`)
    if (isNaN(parsed.getTime())) {
      console.error(`Invalid date: ${arg}. Use YYYY-MM-DD format.`)
      process.exit(1)
    }
    return parsed
  }
  return new Date()
}

/**
 * Calculate sequence number (days since epoch + 1, zero-padded to 4 digits)
 */
function calculateSequence(date) {
  const daysSinceEpoch = Math.floor((date - EPOCH_DATE) / (24 * 60 * 60 * 1000))
  const seqNum = daysSinceEpoch + 1
  return String(seqNum).padStart(4, '0')
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Load all existing signals to extract texture history and used colors
 */
async function loadExistingSignals() {
  const seedsPath = path.join(rootDir, 'content', 'seeds.json')
  try {
    const data = await fs.readFile(seedsPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

/**
 * Get the previous day's texture
 */
function getPreviousTexture(signals, targetDate) {
  // Find the signal for yesterday
  const yesterday = new Date(targetDate)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = formatDate(yesterday)

  const prevSignal = signals.find(s => s.date === yesterdayStr)
  if (prevSignal) {
    // Try to infer texture from fragment
    // For now, return a default or the last one from sequence
    // Since we don't store texture, we'll pick from the list
    // In practice, this should be improved
    return signals.length > 0 ? TEXTURES[(signals.length - 1) % TEXTURES.length] : TEXTURES[0]
  }
  // Default: if no signals exist, use first texture
  return TEXTURES[0]
}

/**
 * Extract all used colors from existing signals
 */
function getUsedColors(signals) {
  return signals.map(s => s.color)
}

/**
 * Call Claude API to generate a signal
 */
async function generateSignal(date, sequence, previousTexture, usedColors) {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const systemPrompt = `You are the recording instrument behind LIMEN — a site that publishes exactly one
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

Output ONLY the JSON object. No prose, no code fence, no commentary before or after.`

  const userPrompt = `date: ${date}
sequence: ${sequence}
previous_texture: ${previousTexture}
used_colors: ${JSON.stringify(usedColors)}

Produce today's signal. Use date and sequence exactly as given. Choose a texture
different from previous_texture. Choose a color not present in used_colors. Output only
the JSON object.`

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 300,
    temperature: 1.0,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt
      }
    ]
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API')
  }

  // Parse JSON from response
  let signal
  try {
    signal = JSON.parse(content.text)
  } catch (e) {
    console.error('Failed to parse Claude response as JSON:', content.text)
    throw e
  }

  // Validate the signal
  if (!signal.date || !signal.sequence || !signal.number || !signal.fragment || !signal.color) {
    throw new Error('Signal missing required fields')
  }

  return signal
}

/**
 * Save signal to content/YYYY-MM-DD.json
 */
async function saveSignal(signal) {
  const filepath = path.join(rootDir, 'content', `${signal.date}.json`)
  await fs.writeFile(filepath, JSON.stringify(signal, null, 2) + '\n')
  return filepath
}

/**
 * Check if signal already exists for the target date
 */
async function signalExists(date) {
  const filepath = path.join(rootDir, 'content', `${date}.json`)
  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

// ===== Main =====

async function main() {
  try {
    // 1. Get target date
    const targetDate = getTargetDate()
    const dateStr = formatDate(targetDate)

    console.log(`[LIMEN] Generating signal for ${dateStr}...`)

    // 2. Check if signal already exists
    if (await signalExists(dateStr)) {
      console.log(`[LIMEN] Signal already exists for ${dateStr}. Skipping.`)
      process.exit(0)
    }

    // 3. Load existing signals
    const signals = await loadExistingSignals()

    // 4. Calculate sequence
    const sequence = calculateSequence(targetDate)
    console.log(`[LIMEN] Sequence: ${sequence}`)

    // 5. Get previous texture and used colors
    const previousTexture = getPreviousTexture(signals, targetDate)
    const usedColors = getUsedColors(signals)

    console.log(`[LIMEN] Previous texture: ${previousTexture}`)
    console.log(`[LIMEN] Used colors count: ${usedColors.length}`)

    // 6. Call Claude API
    console.log(`[LIMEN] Calling Claude API (Opus 4.8)...`)
    const signal = await generateSignal(dateStr, sequence, previousTexture, usedColors)

    console.log(`[LIMEN] Generated signal:`)
    console.log(JSON.stringify(signal, null, 2))

    // 7. Validate signal fields
    if (signal.date !== dateStr) {
      console.warn(`[LIMEN] Warning: date mismatch (expected ${dateStr}, got ${signal.date})`)
    }
    if (signal.sequence !== sequence) {
      console.warn(`[LIMEN] Warning: sequence mismatch (expected ${sequence}, got ${signal.sequence})`)
    }

    // 8. Save signal
    const savedPath = await saveSignal(signal)
    console.log(`[LIMEN] Saved to ${savedPath}`)

    // 9. Success
    console.log(`[LIMEN] Signal generation complete.`)
    process.exit(0)
  } catch (error) {
    console.error(`[LIMEN] Error: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

main()
