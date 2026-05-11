export interface ForecastResult {
  bestCase: number
  worstCase: number
}

/**
 * Fits y = a·exp(b·x) to the last `nPoints` positive values via
 * log-linear OLS (exponential quadrature regression), then returns a
 * 1-step-ahead prediction with ±1 residual-std-error bands as
 * best/worst scenarios.
 */
export function forecastNext(
  values: (number | undefined)[],
  nPoints = 10,
): ForecastResult | null {
  type Pt = { v: number; i: number }
  const pts: Pt[] = values
    .map((v, i) => ({ v, i }))
    .filter((p): p is Pt => p.v != null && p.v > 0)
    .slice(-nPoints)

  if (pts.length < 3) return null

  const n   = pts.length
  const xs  = pts.map((_, i) => i)
  const lys = pts.map(p => Math.log(p.v))

  const meanX  = xs.reduce((s, x) => s + x, 0) / n
  const meanLY = lys.reduce((s, y) => s + y, 0) / n

  let ssXX = 0, ssXY = 0
  for (let i = 0; i < n; i++) {
    ssXX += (xs[i] - meanX) ** 2
    ssXY += (xs[i] - meanX) * (lys[i] - meanLY)
  }
  if (ssXX === 0) return null

  const slope     = ssXY / ssXX
  const intercept = meanLY - slope * meanX

  let sse = 0
  for (let i = 0; i < n; i++) {
    sse += (lys[i] - (intercept + slope * xs[i])) ** 2
  }
  const stderr = Math.sqrt(sse / Math.max(1, n - 2))

  const logFwd    = intercept + slope * n
  const bestCase  = Math.max(1, Math.round(Math.exp(logFwd - stderr)))
  const worstCase = Math.max(1, Math.round(Math.exp(logFwd + stderr)))

  return { bestCase, worstCase }
}
