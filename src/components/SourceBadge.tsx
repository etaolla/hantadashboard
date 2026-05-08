import { DataSource, SourceStatus } from '../types/outbreak'

const SOURCE_COLORS: Record<string, string> = {
  CDC: 'text-blue-400 border-blue-700 bg-blue-950/50',
  ECDC: 'text-purple-400 border-purple-700 bg-purple-950/50',
  WHO: 'text-cyan-400 border-cyan-700 bg-cyan-950/50',
  'Global.health': 'text-yellow-400 border-yellow-700 bg-yellow-950/50',
  Manual: 'text-slate-400 border-slate-600 bg-slate-900/50',
}

const STATUS_ICONS = {
  ok: '●',
  error: '✕',
  loading: '◌',
  unavailable: '○',
}

const STATUS_COLORS = {
  ok: 'text-green-400',
  error: 'text-red-400',
  loading: 'text-amber-400 animate-pulse',
  unavailable: 'text-slate-500',
}

interface SourceBadgeProps {
  source: DataSource
  status: SourceStatus['status']
  recordCount?: number
  message?: string
}

export function SourceBadge({ source, status, recordCount, message }: SourceBadgeProps) {
  const colors = SOURCE_COLORS[source] ?? SOURCE_COLORS.Manual
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs ${colors}`}
      title={message}
    >
      <span className={STATUS_COLORS[status]}>{STATUS_ICONS[status]}</span>
      <span>{source}</span>
      {recordCount != null && status === 'ok' && (
        <span className="text-slate-500">({recordCount})</span>
      )}
    </div>
  )
}
