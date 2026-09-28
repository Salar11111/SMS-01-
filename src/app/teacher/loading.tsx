export default function TeacherLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]">
              <span className="text-sm font-bold text-[var(--color-primary-foreground)]">H</span>
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--color-ink)]">Harbor School</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--color-line)]" />
            <div className="h-8 w-24 animate-pulse rounded bg-[var(--color-line)]" />
          </div>
        </div>
        <nav className="border-t border-[var(--color-line)]">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-24 animate-pulse rounded bg-[var(--color-line)]" />
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-6">
          <div className="h-12 w-48 animate-pulse rounded bg-[var(--color-line)]" />
          <div className="animate-pulse rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <div className="h-4 w-1/4 animate-pulse rounded bg-[var(--color-line)] mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-[var(--color-line)]" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}