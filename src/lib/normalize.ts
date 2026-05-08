import { OutbreakRecord, ChartPoint } from '../types/outbreak'
import { epiWeekLabel, epiWeekToApproxDate } from './dates'

export function toWeeklyChartPoints(records: OutbreakRecord[]): ChartPoint[] {
  const map = new Map<string, ChartPoint>()

  for (const r of records) {
    if (r.epiYear == null || r.epiWeek == null) continue
    const key = epiWeekLabel(r.epiYear, r.epiWeek)
    const existing = map.get(key) ?? { label: key, year: r.epiYear, week: r.epiWeek }
    if (r.cases != null) existing.cases = (existing.cases ?? 0) + r.cases
    if (r.deaths != null) existing.deaths = (existing.deaths ?? 0) + r.deaths
    map.set(key, existing)
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.year !== b.year) return (a.year ?? 0) - (b.year ?? 0)
    return (a.week ?? 0) - (b.week ?? 0)
  })
}

export function toMonthlyChartPoints(records: OutbreakRecord[]): ChartPoint[] {
  const map = new Map<string, ChartPoint>()

  for (const r of records) {
    if (r.epiYear == null || r.epiWeek == null) continue
    const approxDate = epiWeekToApproxDate(r.epiYear, r.epiWeek)
    const month = approxDate.getMonth() + 1
    const year = approxDate.getFullYear()
    const key = `${year}-${String(month).padStart(2, '0')}`
    const existing = map.get(key) ?? { label: key, year, month }
    if (r.cases != null) existing.cases = (existing.cases ?? 0) + r.cases
    if (r.deaths != null) existing.deaths = (existing.deaths ?? 0) + r.deaths
    map.set(key, existing)
  }

  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export function toYearlyChartPoints(records: OutbreakRecord[]): ChartPoint[] {
  const map = new Map<number, ChartPoint>()

  for (const r of records) {
    if (r.epiYear == null) continue
    const existing = map.get(r.epiYear) ?? { label: String(r.epiYear), year: r.epiYear }
    if (r.cases != null) existing.cases = (existing.cases ?? 0) + r.cases
    if (r.deaths != null) existing.deaths = (existing.deaths ?? 0) + r.deaths
    map.set(r.epiYear, existing)
  }

  return Array.from(map.values()).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
}

export function filterByTimeRange(
  points: ChartPoint[],
  range: '4w' | '12w' | 'ytd' | 'all',
  currentYear: number,
  currentWeek: number,
): ChartPoint[] {
  if (range === 'all') return points
  if (range === 'ytd') return points.filter(p => p.year === currentYear)

  const weeksBack = range === '4w' ? 4 : 12
  const totalWeeks = (currentYear - 2000) * 52 + currentWeek

  return points.filter(p => {
    const pTotal = ((p.year ?? 0) - 2000) * 52 + (p.week ?? 0)
    return totalWeeks - pTotal <= weeksBack
  })
}
