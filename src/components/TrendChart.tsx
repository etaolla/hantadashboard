import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartPoint, TimeRange } from '../types/outbreak'
import { TimeRangeToggle } from './TimeRangeToggle'
import { UnavailablePanel } from './ErrorPanel'
import { forecastNext } from '../lib/forecast'

const C_CASES         = '#f59e0b'  // amber — infected
const C_DEATHS        = '#ef4444'  // red   — deaths
const C_FORECAST_BEST  = '#4ade80'  // green — best-case forecast
const C_FORECAST_WORST = '#fb923c'  // orange — worst-case forecast

interface TrendChartProps {
  title: string
  data: ChartPoint[]
  timeRange: TimeRange
  onTimeRangeChange: (v: TimeRange) => void
  granularity: 'weekly' | 'monthly' | 'yearly'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs shadow-xl">
      <p className="mb-1 text-slate-400">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}:{' '}
          <span className="font-bold">
            {p.value != null ? p.value.toLocaleString() : '—'}
          </span>
        </p>
      ))}
    </div>
  )
}

function Legend({
  hasDeaths,
  hasForecast,
}: {
  hasDeaths: boolean
  hasForecast: boolean
}) {
  const item = (color: string, label: string, dashed = false) => (
    <span className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
      <svg width="20" height="10">
        <line
          x1="0" y1="5" x2="20" y2="5"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '5 3' : undefined}
          strokeOpacity={dashed ? 0.7 : 1}
        />
      </svg>
      {label}
    </span>
  )

  return (
    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 px-1">
      {item(C_CASES,          'Infected (cases)')}
      {hasDeaths &&  item(C_DEATHS,         'Deaths')}
      {hasForecast && item(C_FORECAST_BEST,  'Best-case forecast', true)}
      {hasForecast && item(C_FORECAST_WORST, 'Worst-case forecast', true)}
    </div>
  )
}

export function TrendChart({
  title,
  data,
  timeRange,
  onTimeRangeChange,
  granularity,
}: TrendChartProps) {
  const hasData   = data.length > 0 && data.some(d => d.cases != null)
  const hasDeaths = data.some(d => d.deaths != null)

  // Build forecast-extended dataset
  let chartData: ChartPoint[] = data
  let hasForecast = false

  if (hasData && data.length >= 3) {
    const result = forecastNext(data.map(d => d.cases))
    if (result) {
      hasForecast = true
      const nextLabel =
        granularity === 'weekly'  ? '→ W+1' :
        granularity === 'monthly' ? '→ M+1' : '→ Next'

      // Bridge: duplicate last actual point with forecast anchors so the
      // dashed lines start exactly at the last real value.
      const last = data[data.length - 1]
      chartData = [
        ...data.slice(0, -1),
        { ...last, forecastBest: last.cases, forecastWorst: last.cases },
        { label: nextLabel, forecastBest: result.bestCase, forecastWorst: result.worstCase },
      ]
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-mono text-sm font-semibold text-slate-200">{title}</h3>
          <p className="font-mono text-xs capitalize text-slate-500">{granularity} resolution</p>
        </div>
        {granularity !== 'yearly' && (
          <TimeRangeToggle value={timeRange} onChange={onTimeRangeChange} />
        )}
      </div>

      {!hasData ? (
        <UnavailablePanel message="No chart data available for this selection." />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`casesGrad-${granularity}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C_CASES}  stopOpacity={0.28} />
                  <stop offset="95%" stopColor={C_CASES}  stopOpacity={0}    />
                </linearGradient>
                {hasDeaths && (
                  <linearGradient id={`deathsGrad-${granularity}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C_DEATHS} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={C_DEATHS} stopOpacity={0}    />
                  </linearGradient>
                )}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1e293b' }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748b', fontFamily: 'JetBrains Mono', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Infected — amber/yellow */}
              <Area
                type="monotone"
                dataKey="cases"
                name="Infected"
                stroke={C_CASES}
                strokeWidth={1.5}
                fill={`url(#casesGrad-${granularity})`}
                dot={false}
                connectNulls={false}
              />

              {/* Deaths — red (only rendered when data exists) */}
              {hasDeaths && (
                <Area
                  type="monotone"
                  dataKey="deaths"
                  name="Deaths"
                  stroke={C_DEATHS}
                  strokeWidth={1.5}
                  fill={`url(#deathsGrad-${granularity})`}
                  dot={false}
                  connectNulls={false}
                />
              )}

              {/* Forecast — dashed, lower contrast */}
              {hasForecast && (
                <>
                  <Line
                    type="monotone"
                    dataKey="forecastBest"
                    name="Best forecast"
                    stroke={C_FORECAST_BEST}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    strokeOpacity={0.65}
                    dot={false}
                    connectNulls={false}
                    legendType="none"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastWorst"
                    name="Worst forecast"
                    stroke={C_FORECAST_WORST}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    strokeOpacity={0.65}
                    dot={false}
                    connectNulls={false}
                    legendType="none"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>

          <Legend hasDeaths={hasDeaths} hasForecast={hasForecast} />
        </>
      )}
    </div>
  )
}
