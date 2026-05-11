export type DataSource = 'CDC' | 'ECDC' | 'WHO' | 'Global.health' | 'Manual'

export interface OutbreakRecord {
  source: DataSource
  disease: string
  locationName: string
  countryCode?: string
  admin1?: string
  latitude?: number
  longitude?: number
  date?: string
  epiYear?: number
  epiWeek?: number
  periodLabel?: string
  cases?: number
  deaths?: number
  recovered?: number
  hospitalized?: number
  sourceUrl: string
  raw?: unknown
}

export interface AggregatedStats {
  totalCases?: number
  totalDeaths?: number
  caseFatalityRatio?: number
  latestWeekCases?: number
  latestMonthCases?: number
  latestYearCases?: number
  latestPeriod?: string
  locationsReporting: number
  sourceCoverage: DataSource[]
}

export type TimeRange = '4w' | '12w' | 'ytd' | 'all'

export interface SourceStatus {
  source: DataSource
  status: 'ok' | 'error' | 'loading' | 'unavailable'
  message?: string
  lastFetched?: string
  recordCount?: number
}

export interface ApiResult<T> {
  data: T | null
  error: string | null
  source: DataSource
  fetchedAt: string
}

export interface ChartPoint {
  label: string
  cases?: number
  deaths?: number
  forecastBest?: number
  forecastWorst?: number
  year?: number
  week?: number
  month?: number
}
