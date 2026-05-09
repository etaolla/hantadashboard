import { OutbreakRecord, ApiResult } from '../types/outbreak'
import { safeInt } from '../lib/epidemiology'
import { US_STATE_COORDS } from '../data/countryCoordinates'

const CDC_ENDPOINT = 'https://data.cdc.gov/resource/chmz-4uae.json'
const SOURCE_URL = 'https://data.cdc.gov/NNDSS/NNDSS-TABLE-1O-Hansen-s-disease-to-Hantavirus-pulm/chmz-4uae'

const SKIP_AREAS = new Set([
  'US RESIDENTS', 'NEW ENGLAND', 'MIDDLE ATLANTIC', 'EAST NORTH CENTRAL',
  'WEST NORTH CENTRAL', 'SOUTH ATLANTIC', 'EAST SOUTH CENTRAL',
  'WEST SOUTH CENTRAL', 'MOUNTAIN', 'PACIFIC', 'US TERRITORIES',
  'NON-US RESIDENTS', 'TOTAL', 'NEW YORK CITY',
])

type SocrataRow = Record<string, string | number | undefined>



export async function fetchCDCData(): Promise<ApiResult<OutbreakRecord[]>> {
  const fetchedAt = new Date().toISOString()

  try {
    const params = new URLSearchParams({ $limit: '50000' })
    const url = `${CDC_ENDPOINT}?${params.toString()}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error('CDC API returned HTTP ' + response.status + ' ' + body)
    }

    const rows: SocrataRow[] = await response.json()

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('CDC API returned no data')
    }

    const records: OutbreakRecord[] = []

    for (const row of rows) {
      const stateName = String(row['reporting_area'] ?? '')
      if (!stateName || SKIP_AREAS.has(stateName)) continue

      const year = safeInt(row['mmwr_year'])
      const week = safeInt(row['mmwr_week'])
      if (!year || !week) continue

      const coords = US_STATE_COORDS[stateName]

     const hpsWeek = safeInt(row['hantavirus_pulmonary_syndrome_4'])
      const nonHpsWeek = safeInt(row['hantavirus_infection_non_4'])

  const hpsYtd = safeInt(row['hantavirus_pulmonary_syndrome_6'])
const nonHpsYtd = safeInt(row['hantavirus_infection_non_6'])

// Use current week count if present, otherwise 0
const totalCases = (hpsWeek ?? 0) + (nonHpsWeek ?? 0)

// Only include rows that have any YTD activity (filters out completely empty rows)
const hasActivity = (hpsYtd ?? 0) + (nonHpsYtd ?? 0) > 0 || totalCases > 0
if (!hasActivity) continue

      const record: OutbreakRecord = {
        source: 'CDC',
        disease: 'Hantavirus (HPS + non-HPS)',
        locationName: stateName,
        countryCode: 'US',
        admin1: stateName,
        latitude: coords?.lat,
        longitude: coords?.lng,
        epiYear: year,
        epiWeek: week,
        periodLabel: year + ' Week ' + week,
        cases: totalCases,
        sourceUrl: SOURCE_URL,
        raw: row,
      }

      records.push(record)
    }

    if (records.length === 0) {
      return {
        data: [],
        error: 'Dataset fetched but no state-level records parsed.',
        source: 'CDC',
        fetchedAt,
      }
    }

    return { data: records, error: null, source: 'CDC', fetchedAt }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      data: null,
      error: 'CDC fetch failed: ' + message,
      source: 'CDC',
      fetchedAt,
    }
  }
}
