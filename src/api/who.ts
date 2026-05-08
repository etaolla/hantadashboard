/**
 * WHO Global Health Observatory Adapter — STUB
 *
 * Status: No Hantavirus indicator found in GHO.
 *
 * Verified by querying:
 *   GET https://ghoapi.azureedge.net/api/Indicator?$filter=contains(IndicatorName,'anta')
 *   → 0 results
 *
 * WHO does not maintain a standalone Hantavirus incidence indicator in GHO.
 */

import { OutbreakRecord, ApiResult } from '../types/outbreak'

export async function fetchWHOData(): Promise<ApiResult<OutbreakRecord[]>> {
  return {
    data: null,
    error:
      'WHO GHO does not publish a Hantavirus-specific indicator. ' +
      'No Hantavirus timeseries is available via the GHO OData API. ' +
      'WHO regional situation reports are available as PDFs only.',
    source: 'WHO',
    fetchedAt: new Date().toISOString(),
  }
}
