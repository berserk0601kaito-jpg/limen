import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

// ===== Configuration =====
const EPOCH_DATE = new Date('2026-06-12T00:00:00Z')

// ===== Type Definitions =====
interface Signal {
  date: string
  sequence: string
  number: string
  fragment: string
  color: string
}

// ===== Utility Functions =====

/**
 * Calculate sequence number (days since epoch + 1, zero-padded to 4 digits)
 */
function calculateSequence(date: Date): string {
  const daysSinceEpoch = Math.floor((date - EPOCH_DATE) / (24 * 60 * 60 * 1000))
  const seqNum = daysSinceEpoch + 1
  return String(seqNum).padStart(4, '0')
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Load all existing signals from content/seeds.json
 */
async function loadExistingSignals(): Promise<Signal[]> {
  try {
    const seedsPath = path.join(process.cwd(), '..', '..', 'content', 'seeds.json')
    const data = await fs.readFile(seedsPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

/**
 * Get the previous day's texture
 */
function getPreviousTexture(signals: Signal[], targetDate: Date): string {
  const textures = [
    'altitude/falling',
    'water/submersion',
    'cold/weather',
    'counting/instruments',
    'architecture/interior',
    'absence/aftermath',
    'light/signal'
  ]

  // Find the signal for yesterday
  const yesterday = new Date(targetDate)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayStr = formatDate(yesterday)

  const prevSignal = signals.find(s => s.date === yesterdayStr)
  if (prevSignal && signals.length > 0) {
    // Rotate texture based on sequence position
    return textures[(signals.length - 1) % textures.length]
  }

  // Default: if no signals exist, use first texture
  return textures[0]
}

/**
 * Extract all used colors from existing signals
 */
function getUsedColors(signals: Signal[]): string[] {
  return signals.map(s => s.color)
}

/**
 * Call Claude API to generate a signal
 */
async function generateSignal(
  date: string,
  sequence: string,
  previousTexture: string,
  usedColors: string[]
): Promise<Signal> {
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
  let signal: Signal
  try {
    signal = JSON.parse(content.text)
  } catch (e) {
    throw new Error(`Failed to parse Claude response as JSON: ${content.text}`)
  }

  // Validate the signal
  if (!signal.date || !signal.sequence || !signal.number || !signal.fragment || !signal.color) {
    throw new Error('Signal missing required fields')
  }

  return signal
}

/**
 * Save signal to file
 * NOTE: In production on Vercel, the filesystem is read-only. This code is for development.
 * For production, consider using:
 * - Vercel KV (Redis)
 * - GitHub API to commit to the repository
 * - A database (Supabase, PlanetScale, etc.)
 */
async function saveSignal(signal: Signal): Promise<string> {
  try {
    const contentDir = path.join(process.cwd(), '..', '..', 'content')
    const filepath = path.join(contentDir, `${signal.date}.json`)

    // Try to create directory if it doesn't exist
    try {
      await fs.mkdir(contentDir, { recursive: true })
    } catch {
      // Ignore errors - directory may already exist or be read-only
    }

    await fs.writeFile(filepath, JSON.stringify(signal, null, 2) + '\n')
    return filepath
  } catch (error) {
    // On Vercel, the filesystem is read-only, so this will fail in production
    console.warn(`Note: Could not save to filesystem: ${error instanceof Error ? error.message : String(error)}`)
    console.warn('In production, you should use Vercel KV, GitHub API, or a database instead.')
    return 'NOT_SAVED_PRODUCTION'
  }
}

/**
 * Check if signal already exists
 */
async function signalExists(date: string): Promise<boolean> {
  try {
    const filepath = path.join(process.cwd(), '..', '..', 'content', `${date}.json`)
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

// ===== API Handler =====

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET authentication
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.warn('[LIMEN API] CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring('Bearer '.length)
    if (token !== cronSecret) {
      return NextResponse.json(
        { error: 'Invalid CRON_SECRET' },
        { status: 401 }
      )
    }

    // 2. Get today's date and calculate sequence
    const targetDate = new Date()
    const dateStr = formatDate(targetDate)
    const sequence = calculateSequence(targetDate)

    console.log(`[LIMEN API] Generating signal for ${dateStr} (sequence ${sequence})`)

    // 3. Check if signal already exists
    if (await signalExists(dateStr)) {
      console.log(`[LIMEN API] Signal already exists for ${dateStr}. Skipping.`)
      return NextResponse.json({
        ok: true,
        date: dateStr,
        sequence,
        message: 'Signal already exists'
      })
    }

    // 4. Load existing signals
    const signals = await loadExistingSignals()

    // 5. Get previous texture and used colors
    const previousTexture = getPreviousTexture(signals, targetDate)
    const usedColors = getUsedColors(signals)

    console.log(`[LIMEN API] Previous texture: ${previousTexture}`)
    console.log(`[LIMEN API] Used colors: ${usedColors.length}`)

    // 6. Verify API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      )
    }

    // 7. Call Claude API
    console.log(`[LIMEN API] Calling Claude API (Opus 4.8)...`)
    const signal = await generateSignal(dateStr, sequence, previousTexture, usedColors)

    console.log(`[LIMEN API] Generated signal:`, JSON.stringify(signal))

    // 8. Save signal
    const savedPath = await saveSignal(signal)
    console.log(`[LIMEN API] Saved to ${savedPath}`)

    // 9. Return success response
    return NextResponse.json({
      ok: true,
      date: signal.date,
      sequence: signal.sequence,
      number: signal.number,
      fragment: signal.fragment,
      color: signal.color,
      savedPath
    })
  } catch (error) {
    console.error('[LIMEN API] Error:', error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        ok: false
      },
      { status: 500 }
    )
  }
}

/**
 * Optional: Allow manual testing via GET request (useful for debugging)
 * In production, ensure this endpoint is protected or disabled.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'GET requests must include Authorization header with Bearer {CRON_SECRET}' },
      { status: 401 }
    )
  }

  const token = authHeader.substring('Bearer '.length)
  if (token !== cronSecret) {
    return NextResponse.json(
      { error: 'Invalid CRON_SECRET' },
      { status: 401 }
    )
  }

  // Forward to POST handler
  return POST(request)
}
