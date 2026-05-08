export function calcCFR(cases?: number, deaths?: number): number | undefined {
  if (cases == null || deaths == null) return undefined
  if (cases === 0) return undefined
  return (deaths / cases) * 100
}

export function safeInt(val: unknown): number | undefined {
  if (val == null || val === '' || val === 'N' || val === 'U' || val === '-') return undefined
  const n = Number(val)
  return isNaN(n) ? undefined : Math.round(n)
}

export function sumOptional(vals: (number | undefined)[]): number | undefined {
  const defined = vals.filter((v): v is number => v != null)
  if (defined.length === 0) return undefined
  return defined.reduce((a, b) => a + b, 0)
}

export function formatCFR(cfr?: number): string {
  if (cfr == null) return 'N/A'
  return `${cfr.toFixed(1)}%`
}

export function formatCount(n?: number): string {
  if (n == null) return 'N/A'
  return n.toLocaleString()
}

export function trendIcon(
  current?: number,
  previous?: number,
): '↑' | '↓' | '→' | '—' {
  if (current == null || previous == null) return '—'
  if (current > previous) return '↑'
  if (current < previous) return '↓'
  return '→'
}
