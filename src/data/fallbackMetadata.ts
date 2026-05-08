/**
 * Static contextual background for known Hantavirus reporting regions.
 * These are NOT case counts — they are epidemiological context notes
 * sourced from CDC and WHO published fact sheets.
 * Used only to enrich map popup tooltips.
 *
 * Sources:
 *   CDC HPS Surveillance: https://www.cdc.gov/hantavirus/surveillance/index.html
 *   ECDC Hantavirus factsheet: https://www.ecdc.europa.eu/en/hantavirus-infection
 */
export const REGION_CONTEXT: Record<string, string> = {
  US: 'Primary transmission via Sin Nombre virus in the Western US. CDC tracks Hantavirus Pulmonary Syndrome (HPS) through the NNDSS reporting system.',
  DE: 'Primarily Puumala virus (bank vole reservoir). Notable outbreak years: 2010, 2012, 2017.',
  FI: 'Highest European incidence per capita. Puumala virus is endemic in Finland.',
  SE: 'Puumala virus; cyclical outbreaks every 3–4 years in northern Sweden.',
  AR: 'Andes virus — the only hantavirus strain with documented person-to-person transmission.',
  CL: 'Andes virus. Outbreaks primarily in Patagonian regions.',
  BR: 'Multiple hantavirus strains reported across diverse biomes.',
}
