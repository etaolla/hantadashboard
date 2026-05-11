import { useEffect, useState } from 'react'

interface Headline {
  title: string
  link: string
  pubDate: string
  source: string
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function HeadlinesBox() {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    const rssUrl = 'https://news.google.com/rss/search?q=hantavirus&hl=en-US&gl=US&ceid=US:en'
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`

    fetch(apiUrl, { signal: AbortSignal.timeout(8000) })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: { status: string; items?: Record<string, string>[] }) => {
        if (d.status === 'ok' && Array.isArray(d.items) && d.items.length > 0) {
          setHeadlines(
            d.items.slice(0, 8).map(item => ({
              title:   item.title   ?? '',
              link:    item.link    ?? '#',
              pubDate: item.pubDate ?? '',
              source:  item.author  || extractDomain(item.link ?? ''),
            }))
          )
        } else {
          setError('No headlines available right now.')
        }
      })
      .catch(() => setError('Headlines unavailable — check network or ad-blocker.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-lg border border-red-900/40 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="animate-pulse text-xs text-red-500">⬤</span>
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-red-400">
          Latest Hantavirus Headlines
        </h3>
      </div>

      {loading && (
        <p className="animate-pulse font-mono text-xs text-cyan-400">Loading headlines…</p>
      )}
      {!loading && error && (
        <p className="font-mono text-xs text-slate-500">{error}</p>
      )}

      {headlines.length > 0 && (
        <ul>
          {headlines.map((h, i) => (
            <li key={i} className="border-b border-slate-800 last:border-0">
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="-mx-2 block rounded px-2 py-2.5 transition-colors hover:bg-slate-800/50"
              >
                <p className="text-sm leading-snug text-slate-200">{h.title}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {h.source}
                  {h.pubDate ? ` · ${new Date(h.pubDate).toLocaleDateString()}` : ''}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
