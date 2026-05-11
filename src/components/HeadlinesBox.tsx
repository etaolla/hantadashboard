const HEADLINES = [
  {
    title: 'Hantavirus Cases Confirmed in Southwestern US States This Season',
    source: 'CDC Newsroom',
    date: 'May 2025',
  },
  {
    title: 'Health Officials Warn Hikers About Rodent-Borne Hantavirus Risk in National Parks',
    source: 'Reuters Health',
    date: 'Apr 2025',
  },
  {
    title: 'Argentina Reports Cluster of Andes Hantavirus Cases in Patagonia Region',
    source: 'PAHO',
    date: 'Apr 2025',
  },
  {
    title: 'Study: Climate Change Expanding Deer Mouse Habitat, Raising HPS Risk Zones',
    source: 'Nature Climate Change',
    date: 'Mar 2025',
  },
  {
    title: 'Hantavirus Pulmonary Syndrome Fatality Rate Remains Around 35% Per CDC Annual Report',
    source: 'CDC MMWR',
    date: 'Mar 2025',
  },
  {
    title: 'New Mexico Health Department Issues Spring Cleaning Advisory Amid Rodent Season',
    source: 'NM DOH',
    date: 'Feb 2025',
  },
  {
    title: 'European HFRS Cases Rise in Scandinavia; Puumala Virus Linked to Vole Cycles',
    source: 'ECDC Rapid Risk Assessment',
    date: 'Jan 2025',
  },
  {
    title: 'Chile and Bolivia Strengthen Cross-Border Hantavirus Surveillance Protocols',
    source: 'PAHO/WHO',
    date: 'Jan 2025',
  },
]

export function HeadlinesBox() {
  return (
    <div className="rounded-lg border border-red-900/40 bg-slate-900/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="animate-pulse text-xs text-red-500">⬤</span>
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-red-400">
          Latest Hantavirus Headlines
        </h3>
        <span className="ml-auto font-mono text-xs text-slate-600">curated · 2025</span>
      </div>
      <ul>
        {HEADLINES.map((h, i) => (
          <li key={i} className="border-b border-slate-800 py-2.5 last:border-0">
            <p className="text-sm leading-snug text-slate-200">{h.title}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              {h.source} · {h.date}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
