import { OutbreakRecord, ApiResult } from '../types/outbreak'
import { safeInt } from '../lib/epidemiology'
import { US_STATE_COORDS } from '../data/countryCoordinates'

const CDC_ENDPOINT = 'https://data.cdc.gov/resource/chmz-4uae.json'
const SOURCE_URL = 'https://data.cdc.gov/NNDSS/NNDSS-TABLE-1O-Hansen-s-disease-to-Hantavirus-pulm/chmz-4uae'

// Column name variants found in NNDSS table-specific datasets
// The exact column names depend on the dataset — we try all known variants
const HPS_COLUMNS = [
  'hantavirus_pulmonary_syndrome_current_week',
  'hantavirus_pulmonary_syndrome',
  'hantavirus_pulm_syndrome_current_week',
  'hps_current_week',
]

const FLAG_COLUMNS = [
  'hantavirus_pulmonary_syndrome_current_week_flag',
  'hantavirus_pulmonary_syndrome_flag',
  'hantavirus_pulm_syndrome_current_week_flag',
  'hps_current_week_flag',
]

type SocrataRow = Record<string, string | number | undefined>

function isSuppressed(val: string | number | undefined): boolean {
  return val === 'U' || val === 'N' || val === '-'
}

function findColumn(row: SocrataRow, candidates: string[]): string | undefined {
  return candidates.find(col => col in row)
}

function detectColumns(rows: SocrataRow[]): {
  hpsCol: string | undefined
  flagCol: string | undefined
  allCols: string[]
} {
  if (rows.length === 0) return { hpsCol: undefined, flagCol: undefined, allCols: [] }
  const allCols = Object.keys(rows[0])
  const hpsCol = findColumn(rows[0], HPS_COLUMNS) ??
    allCols.find(c => c.toLowerCase().includes('hantavirus') && c.toLowerCase().includes('current'))
  const flagCol = findColumn(rows[0], FLAG_COLUMNS) ??
    allCols.find(c => c.toLowerCase().includes('hantavirus') && c.toLowerCase().includes('flag'))
  return { hpsCol, flagCol, allCols }
}

export async function fetchCDCData(): Promise<ApiResult<OutbreakRecord[]>> {
  const fetchedAt = new Date().toISOString()

  try {
    const params = new URLSearchParams({ $limit: '5000' })
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

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('CDC API returned no data')
    }

    const { hpsCol, flagCol, allCols } = detectColumns(rows)

    // If we can't find the HPS column, report available columns for debugging
    if (!hpsCol) {
      return {
        data: null,
        error: `Could not find Hantavirus column in dataset chmz-4uae. Available columns: ${allCols.join(', ')}`,
        source: 'CDC',
        fetchedAt,
      }
    }

    const records: OutbreakRecord[] = rows
      .map(row => {
        const year = safeInt(row['mmwr_year'])
        const week = safeInt(row['mmwr_week'])
        const stateName = String(
          row['reporting_area'] ?? row['label'] ?? row['location'] ?? 'Unknown'
        )
        const coords = US_STATE_COORDS[stateName]
        const flagVal = flagCol ? row[flagCol] : undefined
        const caseVal = isSuppressed(flagVal) ? undefined : safeInt(row[hpsCol])

        return {
          source: 'CDC' as const,
          disease: 'Hantavirus Pulmonary Syndrome (CDC/NNDSS)',
          locationName: stateName,
          countryCode: 'US',
          admin
