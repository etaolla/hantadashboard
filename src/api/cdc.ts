/**
 * CDC Socrata NNDSS Weekly Data Adapter
 *
 * Dataset: NNDSS Table II
 * Endpoint: https://data.cdc.gov/resource/634h-66fb.json
 *
 * Verified fields present in this dataset:
 *   mmwr_year           - integer
 *   mmwr_week           - integer
 *   disease             - text
 *   reporting_area      - text (state / territory name)
 *   current_week        - number | null (suppressed when flag = "U")
 *   current_week_flag   - text ("N" = not reportable, "U" = suppressed 1-4, "-" = no report)
 *   cumulative_ytd      - number | null
 *   cumulative_ytd_flag - text
 *
 * Deaths are NOT available in this dataset.
 */

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
  mmwr_year?: string | number
  mmwr_week?: string | number
  disease?: string
  reporting_area?: string
  current_week?: string | number
  current_week_flag?: string
  cumulative_ytd?: string | number
  cumulative_ytd_flag?: string
}

function isHantavirus(disease?: string): boolean {
  if (!disease) return false
  const lower = disease.toLowerCase()
  return HANTAVIRUS_TERMS.some(term => lower.includes(term))
}

function isSuppressed(flag?: string): boolean {
  return flag === 'U' || flag === 'N' || flag === '-'
}

export async function fetchCDCData(): Promise<ApiResult<OutbreakRecord[]>> {
  const fetchedAt = new Date().toISOString()

  try {
    const params = new URLSearchParams({
      $limit: '5000',
      $order: 'mmwr_year DESC, mmwr_week DESC',
      $where: "disease like '%antavirus%'",
    })

    const url = `${CDC_ENDPOINT}?${params.toString()}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      throw new Error(`CDC API returned HTTP ${response.status}`)
    }

    const rows: SocrataRow[] = await response.json()

    if (!Array.isArray(rows)) {
      throw new Error('CDC API did not return an array')
    }

    const hantaRows = rows.filter(r => isHantavirus(r.disease))

    if (hantaRows.length === 0) {
      return {
        data: [],
        error:
          'No Hantavirus records found in CDC dataset 634h-66fb. ' +
          'The dataset may have been replaced — check https://data.cdc.gov for the current NNDSS endpoint.',
        source: 'CDC',
        fetchedAt,
      }
    }

    const records: OutbreakRecord[] = hantaRows.map(row => {
      const year = safeInt(row.mmwr_year)
      const week = safeInt(row.mmwr_week)
      const stateName = row.reporting_area ?? 'Unknown'
      const coords = US_STATE_COORDS[stateName]

      const rawCurrent = isSuppressed(row.current_week_flag)
        ? undefined
        : safeInt(row.current_week)

      return {
        source: 'CDC',
        disease: row.disease ?? 'Hantavirus (CDC)',
        locationName: stateName,
        countryCode: 'US',
        admin1: stateName,
        latitude: coords?.lat,
        longitude: coords?.lng,
        epiYear: year,
        epiWeek: week,
        periodLabel: year && week ? `${year} Week ${week}` : undefined,
        cases: rawCurrent,
        // deaths: not available in this dataset
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
