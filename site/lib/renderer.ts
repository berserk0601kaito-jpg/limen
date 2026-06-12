import type { Signal, FormType } from './content'

// mulberry32 seeded PRNG
function mkRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (v: number, d = 2): string => v.toFixed(d)

// ─── SVG FORM GENERATORS ────────────────────────────────────────────────────

function voidForm(r: () => number, p: string, s: string, spd: number): string {
  let css = '', el = ''
  for (let i = 0; i < 5; i++) {
    const cx = f(20 + r() * 60), cy = f(20 + r() * 60)
    const rx = f(10 + r() * 30), ry = f(10 + r() * 30)
    const op = 0.12 + r() * 0.35
    const dur = f(spd * (10 + r() * 10), 1)
    const del = f(r() * 6, 1)
    const col = r() > 0.5 ? p : s
    css += `@keyframes V${i}{0%,100%{opacity:${f(op)}}50%{opacity:${f(op * 0.2)}}}.V${i}{animation:V${i} ${dur}s ${del}s ease-in-out infinite}`
    el += `<ellipse class="V${i}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}"/>`
  }
  return `<style>${css}</style>${el}`
}

function fractureForm(r: () => number, p: string, s: string, spd: number): string {
  let css = '', el = ''
  const cx = 40 + r() * 20, cy = 40 + r() * 20
  const count = 6 + Math.floor(r() * 5)
  const PI2 = Math.PI * 2
  for (let i = 0; i < count; i++) {
    const a1 = (i / count) * PI2 + r() * 0.4
    const a2 = ((i + 1) / count) * PI2 + r() * 0.4
    const r1 = 18 + r() * 28, r2 = 18 + r() * 28
    const jx = cx + (r() - 0.5) * 10, jy = cy + (r() - 0.5) * 10
    const x1 = cx + Math.cos(a1) * r1, y1 = cy + Math.sin(a1) * r1
    const x2 = cx + Math.cos(a2) * r2, y2 = cy + Math.sin(a2) * r2
    const op = 0.18 + r() * 0.52
    const dur = f(spd * (10 + r() * 8), 1)
    const del = f(r() * 7, 1)
    const col = r() > 0.5 ? p : s
    css += `@keyframes F${i}{0%,100%{opacity:${f(op)}}50%{opacity:${f(op * 0.18)}}}.F${i}{animation:F${i} ${dur}s ${del}s ease-in-out infinite}`
    el += `<polygon class="F${i}" points="${f(jx)},${f(jy)} ${f(x1)},${f(y1)} ${f(x2)},${f(y2)}" fill="${col}"/>`
  }
  return `<style>${css}</style>${el}`
}

function fieldForm(r: () => number, p: string, s: string, spd: number): string {
  let css = '', el = ''
  const cols = 9 + Math.floor(r() * 7), rows = 9 + Math.floor(r() * 7)
  const cw = 100 / cols, rh = 100 / rows
  const dur = f(spd * 11, 1)
  css += `@keyframes FW{0%,100%{opacity:0.02}50%{opacity:0.48}}`
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (r() < 0.35) continue
      const x = f(col * cw + cw * (0.1 + r() * 0.1))
      const y = f(row * rh + rh * (0.1 + r() * 0.1))
      const size = f(Math.min(cw, rh) * (0.15 + r() * 0.35))
      const del = f(((col + row) / (cols + rows)) * parseFloat(dur), 1)
      const clr = r() > 0.55 ? p : s
      el += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${clr}" style="opacity:0.02;animation:FW ${dur}s ${del}s ease-in-out infinite"/>`
    }
  }
  return `<style>${css}</style>${el}`
}

function thresholdForm(r: () => number, p: string, s: string, spd: number): string {
  const y1 = 25 + r() * 20, y2 = 55 + r() * 20
  const mid = (y1 + y2) / 2 + (r() - 0.5) * 22
  const op1 = f(0.45 + r() * 0.35), op2 = f(0.22 + r() * 0.3)
  const dur = f(spd * 15, 1), dur2 = f(spd * 12, 1)
  const d = `M0,${f(y1)} Q50,${f(mid)} 100,${f(y2)} L100,100 L0,100 Z`
  return `<style>
@keyframes TA{0%,100%{opacity:${op1}}50%{opacity:${f(parseFloat(op1)*0.25)}}}
@keyframes TB{0%,100%{opacity:${op2}}50%{opacity:${f(parseFloat(op2)*0.2)}}}
.TA{animation:TA ${dur}s ease-in-out infinite}.TB{animation:TB ${dur2}s 2s ease-in-out infinite}
</style>
<rect class="TA" x="0" y="0" width="100" height="100" fill="${p}"/>
<path class="TB" d="${d}" fill="${s}"/>
<line x1="0" y1="${f(y1)}" x2="100" y2="${f(y2)}" stroke="#0a0a0a" stroke-width="0.2" opacity="0.35"/>`
}

function signalForm(r: () => number, p: string, s: string, spd: number): string {
  let css = '', el = ''
  const count = 25 + Math.floor(r() * 20)
  const bw = 100 / count
  for (let i = 0; i < count; i++) {
    const x = i * bw + bw * 0.1
    const h = 5 + r() * 72, y = (100 - h) / 2
    const w = bw * (0.15 + r() * 0.4)
    const op = 0.12 + r() * 0.48
    const col = r() > 0.5 ? p : s
    const dur = f(spd * (8 + r() * 10), 1)
    const del = f(r() * 5, 1)
    css += `@keyframes S${i}{0%,100%{opacity:${f(op)}}50%{opacity:${f(op*0.12)}}}.S${i}{animation:S${i} ${dur}s ${del}s ease-in-out infinite}`
    el += `<rect class="S${i}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${col}"/>`
  }
  return `<style>${css}</style>${el}`
}

function convergenceForm(r: () => number, p: string, s: string, spd: number): string {
  let css = '', el = ''
  const fx = 30 + r() * 40, fy = 30 + r() * 40
  const count = 20 + Math.floor(r() * 18)
  const PI2 = Math.PI * 2
  for (let i = 0; i < count; i++) {
    const angle = r() * PI2
    const dist = 55 + r() * 40
    const x2 = fx + Math.cos(angle) * dist
    const y2 = fy + Math.sin(angle) * dist
    const op = 0.04 + r() * 0.28
    const sw = f(0.05 + r() * 0.22)
    const col = r() > 0.5 ? p : s
    const dur = f(spd * (10 + r() * 12), 1)
    const del = f(r() * 7, 1)
    css += `@keyframes C${i}{0%,100%{opacity:${f(op)}}50%{opacity:${f(op*0.08)}}}.C${i}{animation:C${i} ${dur}s ${del}s ease-in-out infinite}`
    el += `<line class="C${i}" x1="${f(fx)}" y1="${f(fy)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="${sw}"/>`
  }
  return `<style>${css}</style>${el}`
}

function erosionForm(r: () => number, p: string, s: string, spd: number): string {
  let css = '', el = ''
  const PI2 = Math.PI * 2
  const sides = 14
  const pts1: string[] = [], pts2: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * PI2
    const r1 = 25 + r() * 15, r2 = 16 + r() * 14
    pts1.push(`${f(50 + Math.cos(angle) * r1)},${f(50 + Math.sin(angle) * r1)}`)
    pts2.push(`${f(50 + Math.cos(angle) * r2)},${f(50 + Math.sin(angle) * r2)}`)
  }
  const op = f(0.42 + r() * 0.3)
  const op2 = f(0.18 + r() * 0.22)
  const dur = f(spd * 14, 1)
  css += `@keyframes E1{0%,100%{opacity:${op}}50%{opacity:${f(parseFloat(op)*0.18)}}}`
  css += `@keyframes E2{0%{opacity:0.03}50%{opacity:${op2}}100%{opacity:0.03}}`
  el += `<polygon style="animation:E1 ${dur}s ease-in-out infinite" points="${pts1.join(' ')}" fill="${p}"/>`
  el += `<polygon style="animation:E2 ${f(parseFloat(dur)*1.2,1)}s 1.5s ease-in-out infinite" points="${pts2.join(' ')}" fill="${s}"/>`
  return `<style>${css}</style>${el}`
}

const FORMS: Record<FormType, (r: () => number, p: string, s: string, spd: number) => string> = {
  void: voidForm,
  fracture: fractureForm,
  field: fieldForm,
  threshold: thresholdForm,
  signal: signalForm,
  convergence: convergenceForm,
  erosion: erosionForm,
}

function buildSVG(signal: Signal): string {
  const r = mkRng(signal.seed + 1)
  const inner = FORMS[signal.form](r, signal.primary, signal.secondary, signal.speed)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block"><rect width="100" height="100" fill="#0a0a0a"/>${inner}</svg>`
}

// ─── HIDDEN TEXT LAYERS (Type B / C) ────────────────────────────────────────

const LAYER1 = [
  '—still losing altitude when the windows began to',
  'and the water had already reached the second stair',
  'frost on the inside of the glass by morning,',
  'counted seventeen before the dial stopped moving',
  'the corridor was longer on the way back than',
  '—the last reading before the instrument went dark',
  'ice working along the rail toward the',
  'the bed unmade, the radio between two stations and',
  '—the signal lamp flaring twice, then nothing',
  'something had been in the lower rooms while',
  'wings level for once, the ground rising to meet',
  'all the clocks in the house reading different times and',
  'the light through the far window was wrong for',
  'snow had come in under the door while',
  'the needle past the last mark and climbing still',
]

const LAYER2 = [
  '∅ ∅ ∅', '· · · · · · · ·', '— — — — —',
  '⌊ ⌋ ⌊', '◈ ◈', '∴ ∴ ∴', '≠ ≠',
  '∞', '∅∅∅∅∅∅', '— ∅ —',
]

const LAYER3 = ['◈', '⌉', '∴', '≠', '∞', '∅', '⌊', '·', '—']

function buildHiddenLayers(seed: number): string {
  const r = mkRng(seed + 3)
  const frag = LAYER1[Math.floor(r() * LAYER1.length)]
  const sym = LAYER2[Math.floor(r() * LAYER2.length)]
  const glyph = LAYER3[Math.floor(r() * LAYER3.length)]
  const els: string[] = []

  // Layer 1: visible ~200-400% zoom (3-5px)
  for (let i = 0; i < 4 + Math.floor(r() * 3); i++) {
    const x = f(5 + r() * 82), y = f(5 + r() * 82)
    const size = (3 + r() * 2).toFixed(1)
    const op = f(0.06 + r() * 0.09)
    const text = i === 0 ? frag : LAYER1[Math.floor(r() * LAYER1.length)]
    els.push(`<div style="position:absolute;left:${x}%;top:${y}%;font-size:${size}px;color:#7a7a9a;opacity:${op};white-space:nowrap;font-family:'Geist Mono',ui-monospace,monospace;line-height:1;pointer-events:none">${text}</div>`)
  }

  // Layer 2: visible ~500-900% zoom (0.8-1.4px)
  for (let i = 0; i < 6 + Math.floor(r() * 5); i++) {
    const x = f(2 + r() * 88), y = f(2 + r() * 88)
    const size = (0.8 + r() * 0.6).toFixed(1)
    const op = f(0.05 + r() * 0.06)
    const text = i === 0 ? sym : LAYER2[Math.floor(r() * LAYER2.length)]
    els.push(`<div style="position:absolute;left:${x}%;top:${y}%;font-size:${size}px;color:#9a9ab8;opacity:${op};white-space:nowrap;font-family:'Geist Mono',ui-monospace,monospace;line-height:1;pointer-events:none">${text}</div>`)
  }

  // Layer 3: visible ~1500%+ zoom (0.2-0.4px)
  for (let i = 0; i < 10 + Math.floor(r() * 8); i++) {
    const x = f(r() * 94), y = f(r() * 94)
    const size = (0.2 + r() * 0.2).toFixed(2)
    const op = f(0.04 + r() * 0.05)
    els.push(`<div style="position:absolute;left:${x}%;top:${y}%;font-size:${size}px;color:#c0c0d8;opacity:${op};white-space:nowrap;font-family:'Geist Mono',ui-monospace,monospace;line-height:1;pointer-events:none">${glyph}</div>`)
  }

  return `<div style="position:absolute;inset:0;overflow:hidden">${els.join('')}</div>`
}

// ─── PAGE COMPOSITOR ─────────────────────────────────────────────────────────

// Type determined by seed % 3:
//   0 = Type A: SVG visual only
//   1 = Type B: zoom-reveal text only
//   2 = Type C: SVG + hidden text hybrid

export function generatePage(signal: Signal): string {
  const type = signal.seed % 3
  let content = ''

  if (type === 0 || type === 2) {
    content += buildSVG(signal)
  } else {
    // Type B: pure dark background
    content += `<div style="position:absolute;inset:0;background:#0a0a0a"></div>`
  }

  if (type === 1 || type === 2) {
    content += buildHiddenLayers(signal.seed)
  }

  return `<div style="position:absolute;inset:0">${content}</div>`
}
