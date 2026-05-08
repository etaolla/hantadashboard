import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartPoint, TimeRange } from '../types/outbreak'
import { TimeRangeToggle } from './TimeRangeToggle'
import { UnavailablePanel } from './ErrorPanel'

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
          {p.name}: <span className="font-bold">{p.value?.toLocaleString() ?? 'N/A'}</span>
        </p>
      ))}
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
  const hasData = data.length > 0 && data.some(d => d.cases != null)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
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
            <Area
              type="monotone"
              dataKey="cases"
              name="Cases"
              stroke="#22d3ee"
              strokeWidth={1.5}
              fill="url(#casesGrad)"
              dot={false}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
