# Hantavirus Outbreak Intelligence Dashboard

A professional dark-themed global Hantavirus surveillance dashboard.
Runs entirely on GitHub Pages — no backend, no API keys, no secrets.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # output → dist/
npm run preview    # preview production build locally
```

## GitHub Pages Deployment

1. Go to **Settings → Pages** in your repository
2. Set Source to **GitHub Actions**
3. Edit `.github/workflows/deploy.yml` — change `VITE_BASE_PATH` to match your repo name:
   ```yaml
   VITE_BASE_PATH: /your-repo-name/
   ```
4. Push to `main` — the workflow deploys automatically

## Data Sources

| Source | Geography | Granularity | Deaths | Live? |
|--------|-----------|-------------|--------|-------|
| CDC NNDSS (`634h-66fb`) | United States | Weekly by state | ✗ Not in dataset | ✅ Yes |
| ECDC Surveillance Atlas | EU/EEA | Annual by country | ✓ | ⚠ Manual CSV required |
| WHO GHO | Global | — | — | ✗ No indicator exists |
| Global.health | Global | Line-list | ✓ | ✗ Auth required |

### Adding ECDC Data

1. Visit https://atlas.ecdc.europa.eu/public/index.aspx
2. Select "Hantavirus infection"
3. Export → CSV
4. Save to `public/data/ecdc_hantavirus.csv`
5. Uncomment the fetch logic in `src/api/ecdc.ts`
6. Rebuild and redeploy

## Known Limitations

- **Deaths = N/A** — CDC NNDSS weekly tables do not include deaths
- **CFR = N/A** — requires death data
- **ECDC = CORS blocked** — manual download required (see above)
- **WHO = no indicator** — verified against live GHO API
- **Suppressed counts** — CDC hides counts of 1–4 cases ("U" flag); stored as undefined, not zero
- **No real-time streaming** — data refreshes on page load; CDC publishes weekly

## Architecture

```
src/
  api/        One adapter per source; returns ApiResult<OutbreakRecord[]>
  components/ Presentational only; no data fetching
  data/       Static coordinate and context lookup tables
  lib/        Pure functions: normalize, dates, epidemiology math
  pages/      Dashboard.tsx — orchestrates data and layout
  types/      Shared TypeScript interfaces
```
