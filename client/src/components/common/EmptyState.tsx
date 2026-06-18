export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-10 text-center">
      <svg width="64" height="64" viewBox="0 0 64 64" className="text-muted-foreground/50">
        <rect x="8" y="14" width="48" height="36" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M14 24h36M14 32h24M14 40h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="text-sm font-medium">{title}</div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
