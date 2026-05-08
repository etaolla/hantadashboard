/**
 * ECDC Surveillance Atlas Adapter — STUB
 *
 * Status: CORS-blocked from browser / GitHub Pages.
 *
 * The ECDC Atlas (https://atlas.ecdc.europa.eu) provides EU/EEA Hantavirus
 * data but requires a session token that cannot be obtained client-side.
 *
 * To add ECDC data manually:
 *   1. Visit https://atlas.ecdc.europa.eu/public/index.aspx
 *   2. Select Disease: "Hantavirus infection"
 *   3. Export → CSV
 *   4. Place file at public/data/ecdc_hantavirus.csv
 *   5. Uncomment the fetch logic below and implement parseECDCCsv()
 */

import { OutbreakRecord, ApiResult } from '../types/outbreak'

export async function fetchECDCData(): Promise<ApiResult<OutbreakRecord[]>> {
  const fetchedAt = new Date().toISOString()

  // Uncomment once public/data/ecdc_hantavirus.csv is available:
  // try {
  //   const response = await fetch('./data/ecdc_hantavirus.csv')
  //   if (!response.ok) throw new Error(`HTTP ${response.status}`)
  //   const text = await response.text()
  //   const records = parseECDCCsv(text)
  //   return { data: records, error: null, source: 'ECDC', fetchedAt }
  // } catch (err) {
  //   const message = err instanceof Error ? err.message : 'Unknown error'
  //   return { data: null, error: `ECDC fetch failed: ${message}`, source: 'ECDC', fetchedAt }
  // }

  return {
    data: null,
    error:
      'ECDC data is not available via direct API from a browser due to CORS restrictions. ' +
      'See the Source & Methodology panel for manual download instructions.',
    source: 'ECDC',
    fetchedAt,
  }
}
