interface ErrorPanelProps {
  title: string
  message: string
  sourceUrl?: string
}

export function ErrorPanel({ title, message, sourceUrl }: ErrorPanelProps) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-950/10 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg text-red-400">⚠</span>
        <div>
          <p className="font-mono text-sm font-semibold text-red-400">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{message}</p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block font-mono text-xs text-blue-400 underline hover:text-blue-300"
            >
              {sourceUrl}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function UnavailablePanel({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 p-8">
      <div className="text-center">
        <p className="font-mono text-2xl text-slate-600">○</p>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}
