import { format, parseISO, startOfWeek, getISOWeek, getYear } from 'date-fns'

export function toIsoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function epiWeekLabel(year: number, week: number): string {
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function epiWeekToApproxDate(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const dow = jan4.getDay() || 7
  const startOfW1 = new Date(jan4)
  startOfW1.setDate(jan4.getDate() - (dow - 1))
  const result = new Date(startOfW1)
  result.setDate(result.getDate() + (week - 1) * 7)
  return result
}

export function formatRefreshTime(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy HH:mm')
  } catch {
    return iso
  }
}

export function currentIsoTimestamp(): string {
  return new Date().toISOString()
}

export function getISOWeekYear(d: Date): { week: number; year: number } {
  return {
    week: getISOWeek(d),
    year: getYear(startOfWeek(d, { weekStartsOn: 1 })),
  }
}
