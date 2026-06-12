import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content')
const EPOCH = new Date('2026-06-12T00:00:00Z')

const FORMS = ['void', 'fracture', 'field', 'threshold', 'signal', 'convergence', 'erosion']
const PALETTE = [
  '#0A0A12', '#11131C', '#161B2E', '#1C2440', '#202A4A', '#23283C', '#2C1854',
  '#2A3450', '#312A4E', '#1A2E2E', '#33384F', '#3A3550', '#404A60', '#454060', '#4A4A6A',
]

function dateToSeed(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return ((y * 500 + m * 31 + d) * 7919) % 89999 + 10000
}

function generateSignal(dateStr) {
  const seed = dateToSeed(dateStr)
  const dayNum = Math.floor((new Date(dateStr + 'T00:00:00Z').getTime() - EPOCH.getTime()) / 86400000)
  const form = FORMS[dayNum % FORMS.length]
  const primary = PALETTE[seed % PALETTE.length]
  const secondary = PALETTE[(seed * 7) % PALETTE.length]
  const speed = parseFloat((0.3 + ((seed % 40) / 100)).toFixed(2))
  return { date: dateStr, seed, primary, secondary, form, speed }
}

const dateArg = process.argv[2] || new Date().toISOString().split('T')[0]
const outPath = join(CONTENT_DIR, `${dateArg}.json`)

if (existsSync(outPath)) {
  console.log(`[LIMEN] Already exists: ${dateArg}`)
  process.exit(0)
}

const signal = generateSignal(dateArg)
writeFileSync(outPath, JSON.stringify(signal, null, 2))
console.log(`[LIMEN] Generated ${dateArg}:`, JSON.stringify(signal))
