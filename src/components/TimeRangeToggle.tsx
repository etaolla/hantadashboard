import { TimeRange } from '../types/outbreak'

interface TimeRangeToggleProps {
  value: TimeRange
  onChange: (v: TimeRange) => void
}

const OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '4w', label: '4 Weeks' },
  { value: '12w', label: '12 Weeks' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: 'All' },
]

export function TimeRangeToggle({ value, onChange }: TimeRangeToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-slate-700 bg-slate-900/60 p-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1 font-mono text-xs transition-colors ${
            value === opt.value
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
