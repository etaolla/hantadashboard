import { OutbreakRecord, ApiResult } from '../types/outbreak'
import { safeInt } from '../lib/epidemiology'
import { US_STATE_COORDS } from '../data/countryCoordinates'

const CDC_ENDPOINT = 'https://data.cdc.gov/resource/chmz-4uae.json'
const SOURCE_URL = 'https://data.cdc.gov/NNDSS/NNDSS-TABLE-1O-Hansen-s-disease-to-Hantavirus-pulm/chmz-4uae'

const HANTAVIRUS_TERMS = [
  'hantavirus pulmonary syndrome',
  'hantavirus infection',
  'hantavirus',
]

interface SocrataRow {
  [key: string]: string | number | undefined
}

function isHantavirus(row: SocrataRow): boolean {
  return Object.values(row).some(val =>
    typeof val === 'string' &&
    HANTAVIRUS_TERMS.some(term => val.toLowerCase().includes(term))
  )
}

function isSuppressed(flag?: string | number): boolean {
  return flag === 'U' || flag === 'N' || flag === '-'
}

export async function fetchCDCData(): Promise<ApiResult<OutbreakRecord[]>> {
  const fetchedAt = new Date().toISOString()

  try {
    const params = new URLSearchParams({
      $limit: '5000',
    })

    const url = `${CDC_ENDPOINT}?${params.toString()}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`CDC API returned HTTP ${response.status} ${body}`)
    }

    const rows: SocrataRow[] = await response.json()

    if (!Array.isArray(rows)) {
      throw new Error('CDC API did not return an array')
    }

    const hantaRows = rows.filter(r => isHantavirus(r))

    if (hantaRows.length === 0) {
      return {
        data: [],
        error: 'No Hantavirus records found in CDC dataset chmz-4uae.',
        source: 'CDC',
        fetchedAt,
      }
    }

    const records: OutbreakRecord[] = hantaRows.map(row => {
      const year = safeInt(row['mmwr_year'])
      const week = safeInt(row['mmwr_week'])
      const stateName = String(row['reporting_area'] ?? row['label'] ?? 'Unknown')
      const coords = US_STATE_COORDS[stateName]

      const currentWeekFlag = row['current_week_flag'] ?? row['label_1']
      const currentWeek = isSuppressed(currentWeekFlag)
        ? undefined
        : safeInt(row['current_week'] ?? row['cases'])

      return {
        source: 'CDC',
        disease: 'Hantavirus Pulmonary Syndrome (CDC)',
        locationName: stateName,
        countryCode: 'US',
        admin1: stateName,
        latitude: coords?.lat,
        longitude: coords?.lng,
        epiYear: year,
        epiWeek: week,
        periodLabel: year && week ? `${year} Week ${week}` : undefined,
        cases: currentWeek,
        sourceUrl: SOURCE_URL,
        raw: row,
      } satisfies OutbreakRecord
    })

    return { data: records, error: null, source: 'CDC', fetchedAt }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      data: null,
      error: `CDC fetch failed: ${message}`,
      source: 'CDC',
      fetchedAt,
    }
  }
}
