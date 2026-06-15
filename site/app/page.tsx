import { getTodaySignal, getSponsorConfig } from '@/lib/content'
import { generatePage } from '@/lib/renderer'

export const dynamic = 'force-dynamic'

export default function Home() {
  const signal = getTodaySignal()
  const sponsor = getSponsorConfig()
  const html = generatePage(signal, sponsor)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ position: 'absolute', inset: 0 }}
      />
      {signal.sponsored && signal.sponsorUrl && (
        <a
          href={signal.sponsorUrl}
          className="link-sponsor"
          target="_blank"
          rel="noopener noreferrer"
        >
          ◈
        </a>
      )}
      <a href="/archive" className="link-archive">◦</a>
    </div>
  )
}
