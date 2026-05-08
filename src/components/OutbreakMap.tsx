import { useEffect, useRef } from 'react'
import { OutbreakRecord } from '../types/outbreak'
import { REGION_CONTEXT } from '../data/fallbackMetadata'

interface LocationSummary {
  lat: number
  lng: number
  name: string
  totalCases: number
  totalDeaths?: number
  sources: Set<string>
  latestPeriod?: string
  countryCode?: string
}

function aggregateToLocations(records: OutbreakRecord[]): LocationSummary[] {
  const map = new Map<string, LocationSummary>()

  for (const r of records) {
    if (r.latitude == null || r.longitude == null) continue
    const key = r.locationName
    const existing = map.get(key)
    if (existing) {
      if (r.cases != null) existing.totalCases += r.cases
      if (r.deaths != null) existing.totalDeaths = (existing.totalDeaths ?? 0) + r.deaths
      existing.sources.add(r.source)
    } else {
      map.set(key, {
        lat: r.latitude,
        lng: r.longitude,
        name: r.locationName,
        totalCases: r.cases ?? 0,
        totalDeaths: r.deaths,
        sources: new Set([r.source]),
        latestPeriod: r.periodLabel,
        countryCode: r.countryCode,
      })
    }
  }

  return Array.from(map.values())
}

export function OutbreakMap({ records }: { records: OutbreakRecord[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')

      // Fix Vite breaking Leaflet's default icon path resolution
      // @ts-expect-error private leaflet internals
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [30, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      // CartoDB Dark Matter — free, no API key required
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }
      ).addTo(map)

      const locations = aggregateToLocations(records)

      for (const loc of locations) {
        const radius = Math.max(5, Math.min(24, Math.sqrt(loc.totalCases + 1) * 2.2))
        const context = REGION_CONTEXT[loc.countryCode ?? ''] ?? ''

        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius,
          color: '#e8313a',
          fillColor: '#e8313a',
          fillOpacity: 0.45,
          weight: 1.5,
        })

        marker.bindPopup(
          `<div style="font-family:monospace;font-size:12px;min-width:190px;color:#e2e8f0">
            <b style="color:#e8313a;font-size:13px">${loc.name}</b><br/>
            <span style="color:#94a3b8">Cases (current week):</span> <b>${loc.totalCases > 0 ? loc.totalCases.toLocaleString() : 'Suppressed / 0'}</b><br/>
            <span style="color:#94a3b8">Deaths:</span> <b>${loc.totalDeaths != null ? loc.totalDeaths.toLocaleString() : 'Not in dataset'}</b><br/>
            <span style="color:#94a3b8">Source:</span> ${Array.from(loc.sources).join(', ')}<br/>
            ${loc.latestPeriod ? `<span style="color:#94a3b8">Period:</span> ${loc.latestPeriod}<br/>` : ''}
            ${context ? `<hr style="border-color:#334155;margin:6px 0"/><span style="color:#64748b;font-size:11px">${context}</span>` : ''}
          </div>`,
          { className: 'hanta-popup' }
        )

        marker.addTo(map)
      }

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [records])

  return (
    <div>
      <style>{`
        .hanta-popup .leaflet-popup-content-wrapper {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.6);
        }
        .hanta-popup .leaflet-popup-tip { background: #0f172a; }
        .hanta-popup .leaflet-popup-close-button { color: #64748b; }
        .leaflet-container { background: #080b0f; }
      `}</style>
      <div ref={mapRef} className="h-96 w-full rounded-lg border border-slate-700 overflow-hidden relative z-0" />
      <p className="mt-1 font-mono text-xs text-slate-600">
        Marker size ∝ reported weekly case count · Click for details · Scroll-to-zoom disabled
      </p>
    </div>
  )
}
