import { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: string | ReactNode
  subtext?: string
  source?: string
  accent?: 'red' | 'amber' | 'green' | 'cyan' | 'default'
  unavailable?: boolean
}

const ACCENT_BORDER: Record<string, string> = {
  red:     'border-red-500/30 bg-red-950/20',
  amber:   'border-amber-500/30 bg-amber-950/20',
  green:   'border-green-500/30 bg-green-950/20',
  cyan:    'border-cyan-500/30 bg-cyan-950/20',
  default: 'border-slate-700 bg-slate-900/60',
}

const VALUE_COLOR: Record<string, string> = {
  red:     'text-red-400',
  amber:   'text-amber-400',
  green:   'text-green-400',
  cyan:    'text-cyan-400',
  default: 'text-slate-100',
}

export function MetricCard({
  label,
  value,
  subtext,
  source,
  accent = 'default',
  unavailable = false,
}: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${ACCENT_BORDER[accent]}`}>
      <p className="mb-1 font-mono text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p
        className={`font-mono text-2xl font-bold tabular-nums ${
          unavailable ? 'text-slate-600' : VALUE_COLOR[accent]
        }`}
      >
        {unavailable ? '—' : value}
      </p>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
      {source && <p className="mt-2 font-mono text-xs text-slate-600">src: {source}</p>}
    </div>
  )
}
