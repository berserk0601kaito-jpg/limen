import fs from 'fs'
import path from 'path'

export type FormType = 'void' | 'fracture' | 'field' | 'threshold' | 'signal' | 'convergence' | 'erosion'

export interface SponsorConfig {
  active: boolean
  name: string
  zoom_level: number
  content: string
}

const DEFAULT_SPONSOR: SponsorConfig = { active: false, name: '', zoom_level: 8, content: '' }

export function getSponsorConfig(): SponsorConfig {
  try {
    const configPath = path.join(process.cwd(), '..', 'config', 'sponsor.json')
    if (!fs.existsSync(configPath)) return DEFAULT_SPONSOR
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch {
    return DEFAULT_SPONSOR
  }
}

export interface Signal {
  date: string
  seed: number
  primary: string
  secondary: string
  form: FormType
  speed: number
  sponsored?: boolean
  sponsorUrl?: string
}

const FALLBACK: Signal = {
  date: '',
  seed: 10002,
  primary: '#2C1854',
  secondary: '#202A4A',
  form: 'void',
  speed: 0.4,
}

export function getTodaySignal(): Signal {
  try {
    const contentDir = path.join(process.cwd(), '..', 'content')
    const today = new Date().toISOString().split('T')[0]

    const dateFile = path.join(contentDir, `${today}.json`)
    if (fs.existsSync(dateFile)) {
      return JSON.parse(fs.readFileSync(dateFile, 'utf-8'))
    }

    const seedsFile = path.join(contentDir, 'seeds.json')
    if (fs.existsSync(seedsFile)) {
      const seeds: Signal[] = JSON.parse(fs.readFileSync(seedsFile, 'utf-8'))
      return seeds.find(s => s.date === today) ?? seeds[seeds.length - 1] ?? FALLBACK
    }

    return FALLBACK
  } catch {
    return FALLBACK
  }
}

export function getAllSignals(): Signal[] {
  try {
    const contentDir = path.join(process.cwd(), '..', 'content')
    const seedsFile = path.join(contentDir, 'seeds.json')
    if (!fs.existsSync(seedsFile)) return []
    const seeds: Signal[] = JSON.parse(fs.readFileSync(seedsFile, 'utf-8'))
    return [...seeds].reverse()
  } catch {
    return []
  }
}
