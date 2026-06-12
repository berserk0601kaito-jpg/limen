import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const EPOCH = new Date('2026-06-12T00:00:00Z')
const FORMS = ['void', 'fracture', 'field', 'threshold', 'signal', 'convergence', 'erosion'] as const
const PALETTE = [
  '#0A0A12', '#11131C', '#161B2E', '#1C2440', '#202A4A', '#23283C', '#2C1854',
  '#2A3450', '#312A4E', '#1A2E2E', '#33384F', '#3A3550', '#404A60', '#454060', '#4A4A6A',
]

function formatDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dateToSeed(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  return ((y * 500 + m * 31 + d) * 7919) % 89999 + 10000
}

function generateSignal(dateStr: string) {
  const seed = dateToSeed(dateStr)
  const dayNum = Math.floor((new Date(dateStr + 'T00:00:00Z').getTime() - EPOCH.getTime()) / 86400000)
  const form = FORMS[dayNum % FORMS.length]
  const primary = PALETTE[seed % PALETTE.length]
  const secondary = PALETTE[(seed * 7) % PALETTE.length]
  const speed = parseFloat((0.3 + ((seed % 40) / 100)).toFixed(2))
  return { date: dateStr, seed, primary, secondary, form, speed }
}

async function signalExists(dateStr: string): Promise<boolean> {
  try {
    await fs.access(path.join(process.cwd(), '..', '..', 'content', `${dateStr}.json`))
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dateStr = formatDate(new Date())

  if (await signalExists(dateStr)) {
    return NextResponse.json({ ok: true, date: dateStr, message: 'already exists' })
  }

  const signal = generateSignal(dateStr)

  try {
    const contentDir = path.join(process.cwd(), '..', '..', 'content')
    await fs.mkdir(contentDir, { recursive: true })
    await fs.writeFile(path.join(contentDir, `${dateStr}.json`), JSON.stringify(signal, null, 2))
  } catch {
    // Vercel production filesystem is read-only; use GitHub Actions instead
  }

  return NextResponse.json({ ok: true, ...signal })
}

export async function GET(request: NextRequest) {
  return POST(request)
}
