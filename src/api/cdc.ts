import { OutbreakRecord, ApiResult } from '../types/outbreak'
import { safeInt } from '../lib/epidemiology'
import { US_STATE_COORDS } from '../data/countryCoordinates'

const CDC_ENDPOINT = 'https://data.cdc.gov/resource/chmz-4uae.json'
const SOURCE_URL = 'https://data.cdc.gov/NNDSS/NNDSS-TABLE-1O-Hansen-s-disease-to-Hantavirus-pulm/chmz-4uae'

const SKIP_AREAS = new Set([
  'US RESIDENTS', 'NEW ENGLAND', 'MIDDLE ATLANTIC', 'EAST NORTH CENTRAL',
  'WEST NORTH CENTRAL', 'SOUTH ATLANTIC', 'EAST SOUTH CENTRAL',
  'WEST SOUTH CENTRAL', 'MOUNTAIN', 'PACIFIC', 'US TERRITORIES',
  'NON-US RESIDENTS', 'TOTAL', 'NEW YORK CITY'
])

type SocrataRow = Record<string, string | number | undefined>

function isSuppressed(val: string | number | undefined): boolean {
  return val === 'N' || val === 'U' || val === '-' || val == null || val === ''
}

export async function fetchCDCData(): Promise<ApiResult<OutbreakRecord[]>> {
  const fetchedAt = new Date().toISOString()

  try {
    const params = new URLSearchParams({ $limit: '50000' })
    const url = `${CDC_ENDPOINT}?${params.toString()}`

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`CDC API returned HTTP ${response.status} ${body}`)
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

      const hpsCurrent = isSuppressed(row['hantavirus_pulmonary_syndrome_1'])
        ? undefined
        : safeInt(row['hantavirus_pulmonary_syndrome_4']) ?? 0

      const nonHpsCurrent = isSuppressed(row['hantavirus_infection_non_1'])
        ? undefined
        : safeInt(row['hantavirus_infection_non_4']) ?? 0

      const totalCases =
        hpsCurrent != null || nonHpsCurrent != null
          ? (hpsCurrent ?? 0) + (nonHpsCur
