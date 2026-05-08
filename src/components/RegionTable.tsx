import { OutbreakRecord } from '../types/outbreak'
import { formatCount, formatCFR, calcCFR } from '../lib/epidemiology'

interface RegionRow {
  location: string
  source: string
  cases?: number
  deaths?: number
  latestPeriod?: string
}

function buildRows(records: OutbreakRecord[]): RegionRow[] {
  const map = new Map<string, RegionRow>()

  const sorted = [...records].sort((a, b) => {
    const aScore = (a.epiYear ?? 0) * 100 + (a.epiWeek ?? 0)
    const bScore = (b.epiYear ?? 0) * 100 + (b.epiWeek ?? 0)
    return bScore - aScore
  })

  for (const r of sorted) {
    const key = `${r.locationName}::${r.source}`
    if (!map.has(key)) {
      map.set(key, {
        location: r.locationName,
        source: r.source,
        cases: r.cases,
        deaths: r.deaths,
        latestPeriod: r.periodLabel,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.cases ?? 0) - (a.cases ?? 0))
}

export function RegionTable({ records }: { records: OutbreakRecord[] }) {
  const rows = buildRows(records)

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-8 text-center">
        <p className="font-mono text-sm text-slate-500">No region data available.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-900">
            {['Location', 'Source', 'Cases (current week)', 'Deaths', 'CFR', 'Latest Period'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-medium uppercase tracking-wider text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cfr = calcCFR(row.cases, row.deaths)
            return (
              <tr
                key={i}
                className="border-b border-slate-800/50 bg-slate-950 hover:bg-slate-900 transition-colors"
              >
                <td className="px-3 py-2 text-slate-200">{row.location}</td>
                <td className="px-3 py-2 text-slate-500">{row.source}</td>
                <td className="px-3 py-2 text-cyan-400">{formatCount(row.cases)}</td>
                <td className="px-3 py-2 text-red-400">{formatCount(row.deaths)}</td>
                <td className="px-3 py-2 text-amber-400">{formatCFR(cfr)}</td>
                <td className="px-3 py-2 text-slate-400">{row.latestPeriod ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
