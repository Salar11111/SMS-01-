export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        <p className="text-[var(--color-muted)]">Loading Harbor School…</p>
      </div>
    </div>
  );
}