import { SourceStatus } from '../types/outbreak'
import { SourceBadge } from './SourceBadge'

const SOURCE_DETAILS = [
  {
    source: 'CDC' as const,
    name: 'CDC / NNDSS Weekly Data',
    url: 'https://data.cdc.gov/resource/634h-66fb',
    provides: 'US weekly Hantavirus case counts by state (MMWR week/year). No death counts in this dataset.',
    limitations:
      'Counts of 1–4 cases are suppressed per reporting policy (shown as "U"). Deaths are not tracked in NNDSS weekly tables. Covers both Hantavirus Pulmonary Syndrome (HPS) and non-HPS infection separately.',
  },
  {
    source: 'ECDC' as const,
    name: 'ECDC Surveillance Atlas',
    url: 'https://atlas.ecdc.europa.eu/public/index.aspx',
    provides: 'EU/EEA Hantavirus annual case counts by country.',
    limitations:
      'The Atlas export requires a browser session token — CORS prevents direct fetch. Manual CSV download required. See instructions below.',
  },
  {
    source: 'WHO' as const,
    name: 'WHO Global Health Observatory',
    url: 'https://ghoapi.azureedge.net/api/',
    provides: 'N/A — no Hantavirus indicator found in GHO.',
    limitations:
      'A search of the GHO indicator list returned zero Hantavirus-specific results. WHO publishes Hantavirus context in regional PDF reports only.',
  },
  {
    source: 'Global.health' as const,
    name: 'Global.health Line-List',
    url: 'https://global.health',
    provides: 'Granular case line-list — unavailable without authentication.',
    limitations: 'Authentication required. No anonymous API endpoint identified for Hantavirus.',
  },
]

export function SourcePanel({ statuses }: { statuses: SourceStatus[] }) {
  const statusMap = new Map(statuses.map(s => [s.source, s]))

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
      <h2 className="mb-1 font-mono text-sm font-semibold uppercase tracking-widest text-slate-400">
        Data Sources & Methodology
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        Hantavirus surveillance is not globally standardized. There is no unified real-time
        reporting infrastructure comparable to COVID-19. Each source covers a different geography,
        case definition, and reporting cadence. All "N/A" labels on this dashboard reflect genuine
        data gaps — no values are estimated or imputed.
      </p>

      <div className="space-y-4">
        {SOURCE_DETAILS.map(s => {
          const status = statusMap.get(s.source)
          return (
            <div key={s.source} className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-200">{s.name}</span>
                {status && (
                  <SourceBadge
                    source={s.source}
                    status={status.status}
                    recordCount={status.recordCount}
                    message={status.message}
                  />
                )}
              </div>
              <p className="mb-1 text-xs text-slate-400">
                <span className="font-semibold text-cyan-400">Provides: </span>
                {s.provides}
              </p>
              <p className="mb-2 text-xs text-slate-500">
                <span className="font-semibold text-amber-400">Limitations: </span>
                {s.limitations}
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-blue-400 underline hover:text-blue-300"
              >
                {s.url}
              </a>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-950/10 p-4">
        <p className="font-mono text-xs font-semibold text-amber-400">
          Adding ECDC Data (Manual)
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 font-mono text-xs text-slate-400">
          <li>Go to https://atlas.ecdc.europa.eu/public/index.aspx</li>
          <li>Select Disease → "Hantavirus infection"</li>
          <li>Set your date range and geographic scope</li>
          <li>Click Export → CSV</li>
          <li>
            Save to <code className="text-cyan-400">public/data/ecdc_hantavirus.csv</code>
          </li>
          <li>
            Uncomment the fetch block in <code className="text-cyan-400">src/api/ecdc.ts</code> and implement the CSV parser
          </li>
          <li>Rebuild and redeploy</li>
        </ol>
      </div>
    </div>
  )
}
