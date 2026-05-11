import { useState, useEffect, useCallback } from 'react'
import { OutbreakRecord, SourceStatus, TimeRange } from '../types/outbreak'
import { fetchCDCData } from '../api/cdc'
import { fetchECDCData } from '../api/ecdc'
import { fetchWHOData } from '../api/who'
import { MetricCard } from '../components/MetricCard'
import { TrendChart } from '../components/TrendChart'
import { OutbreakMap } from '../components/OutbreakMap'
import { RegionTable } from '../components/RegionTable'
import { SourceBadge } from '../components/SourceBadge'
import { HeadlinesBox } from '../components/HeadlinesBox'
import { ErrorPanel } from '../components/ErrorPanel'
import {
  toWeeklyChartPoints,
  toMonthlyChartPoints,
  filterByTimeRange,
} from '../lib/normalize'
import { formatCount, formatCFR, calcCFR, sumOptional } from '../lib/epidemiology'
import { formatRefreshTime, getISOWeekYear } from '../lib/dates'

export function Dashboard() {
  const [records, setRecords] = useState<OutbreakRecord[]>([])
  const [statuses, setStatuses] = useState<SourceStatus[]>([
    { source: 'CDC', status: 'loading' },
    { source: 'ECDC', status: 'loading' },
    { source: 'WHO', status: 'loading' },
  ])
  const [errors, setErrors] = useState<{ title: string; message: string; url?: string }[]>([])
  const [refreshedAt, setRefreshedAt] = useState('')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')

  const updateStatus = useCallback((source: SourceStatus['source'], patch: Partial<SourceStatus>) => {
    setStatuses(prev => prev.map(s => (s.source === source ? { ...s, ...patch } : s)))
  }, [])

  useEffect(() => {
    setRefreshedAt(new Date().toISOString())

    const run = async () => {
      // CDC — primary data source
      const cdcResult = await fetchCDCData()
      if (cdcResult.data && cdcResult.data.length > 0) {
        setRecords(prev => [...prev, ...cdcResult.data!])
        updateStatus('CDC', { status: 'ok', recordCount: cdcResult.data!.length, lastFetched: cdcResult.fetchedAt })
      } else {
        updateStatus('CDC', {
          status: cdcResult.error ? 'error' : 'unavailable',
          message: cdcResult.error ?? 'No records returned',
        })
        if (cdcResult.error) {
          setErrors(prev => [...prev, {
            title: 'CDC Data Error',
            message: cdcResult.error!,
            url: 'https://data.cdc.gov/resource/634h-66fb',
          }])
        }
      }

      // ECDC — unavailable (CORS)
      const ecdcResult = await fetchECDCData()
      updateStatus('ECDC', { status: 'unavailable', message: ecdcResult.error ?? undefined })

      // WHO — no indicator
      const whoResult = await fetchWHOData()
      updateStatus('WHO', { status: 'unavailable', message: whoResult.error ?? undefined })
    }

    run()
  }, [updateStatus])

  // ── Derived stats ───────────────────────────────────────────────
  const now = new Date()
  const { week: currentWeek, year: currentYear } = getISOWeekYear(now)

  const totalCases = sumOptional(records.map(r => r.cases))
  const totalDeaths = sumOptional(records.map(r => r.deaths))
  const cfr = calcCFR(totalCases, totalDeaths)

  const weekRecords = records.filter(r => r.epiYear === currentYear && r.epiWeek === currentWeek)
  const latestWeekCases = sumOptional(weekRecords.map(r => r.cases))

  const yearRecords = records.filter(r => r.epiYear === currentYear)
  const ytdCases = sumOptional(yearRecords.map(r => r.cases))

  const uniqueLocations = new Set(records.map(r => r.locationName)).size
  const sourceCoverage = statuses.filter(s => s.status === 'ok').map(s => s.source)
  const isLoading = statuses.some(s => s.status === 'loading')

  // ── Chart data ──────────────────────────────────────────────────
  const allWeekly = toWeeklyChartPoints(records)
  const allMonthly = toMonthlyChartPoints(records)

  const weeklyData = filterByTimeRange(allWeekly, timeRange, currentYear, currentWeek)
  const monthlyData = filterByTimeRange(allMonthly, timeRange, currentYear, currentWeek)

  return (
    <div className="min-h-screen bg-[#080b0f]" style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#080b0f]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-screen-2xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="animate-pulse font-mono text-xs text-red-500">⬤</span>
                <h1 className="font-mono text-sm font-bold tracking-widest text-slate-100 sm:text-base">
                  HANTAVIRUS OUTBREAK INTELLIGENCE
                </h1>
              </div>
              <p className="font-mono text-xs text-slate-600">
                Public surveillance · CDC · ECDC · WHO · No data is estimated or fabricated
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statuses.map(s => (
                <SourceBadge key={s.source} source={s.source} status={s.status} recordCount={s.recordCount} message={s.message} />
              ))}
              {refreshedAt && (
                <span className="font-mono text-xs text-slate-700">
                  {formatRefreshTime(refreshedAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6">
        {/* Loading */}
        {isLoading && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center">
            <p className="animate-pulse font-mono text-sm text-cyan-400">
              ◌ Fetching surveillance data from CDC Socrata…
            </p>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((e, i) => (
              <ErrorPanel key={i} title={e.title} message={e.message} sourceUrl={e.url} />
            ))}
          </div>
        )}

        {/* No-data warning */}
        {!isLoading && sourceCoverage.length === 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-4">
            <p className="font-mono text-sm text-amber-400">
              ⚠ No sources returned records. The CDC Socrata endpoint may be temporarily
              unavailable. All metrics are labeled accordingly — no figures are estimated.
            </p>
          </div>
        )}

        {/* KPI Cards */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-700">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard
              label="Total Cases"
              value={formatCount(totalCases)}
              subtext="Sum of all available weekly reports"
              source="CDC"
              accent="cyan"
              unavailable={totalCases == null}
            />
            <MetricCard
              label="Total Deaths"
              value="N/A"
              subtext="Not in CDC weekly dataset"
              accent="red"
              unavailable={true}
            />
            <MetricCard
              label="Case Fatality Ratio"
              value={formatCFR(cfr)}
              subtext="Requires death data"
              accent="amber"
              unavailable={cfr == null}
            />
            <MetricCard
              label={`Week ${currentWeek} Cases`}
              value={formatCount(latestWeekCases)}
              subtext={`MMWR ${currentYear}-W${currentWeek}`}
              source="CDC"
              accent="green"
              unavailable={latestWeekCases == null}
            />
            <MetricCard
              label="YTD Cases"
              value={formatCount(ytdCases)}
              subtext={`${currentYear} year-to-date`}
              source="CDC"
              accent="cyan"
              unavailable={ytdCases == null}
            />
            <MetricCard
              label="Reporting Locations"
              value={String(uniqueLocations)}
              subtext="States / territories"
              source="CDC"
              unavailable={uniqueLocations === 0}
            />
          </div>
          <p className="mt-2 font-mono text-xs text-slate-700">
            ⚠ Deaths and CFR are unavailable from the CDC NNDSS weekly tables — these fields are
            intentionally blank, not zero.
          </p>
        </section>

        {/* Map + Headlines */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-700">
            Geographic Distribution
          </h2>
          <OutbreakMap records={records} />
          <div className="mt-4">
            <HeadlinesBox />
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-700">
            Trend Analysis · US (CDC)
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TrendChart
              title="Weekly Cases"
              data={weeklyData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              granularity="weekly"
            />
            <TrendChart
              title="Monthly Cases"
              data={monthlyData}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              granularity="monthly"
            />
          </div>
        </section>

        {/* Table */}
        <section>
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-700">
            Location Breakdown
          </h2>
          <RegionTable records={records} />
        </section>

      </main>

      <footer className="mt-12 border-t border-slate-800 px-4 py-6">
        <div className="mx-auto max-w-screen-2xl">
          <p className="font-mono text-xs text-slate-700">
            Hantavirus Outbreak Intelligence Dashboard · Data from public CDC API ·
            No data fabricated · All unavailable metrics explicitly labeled ·
            Not a substitute for official public health guidance.
          </p>
        </div>
      </footer>
    </div>
  )
}
