export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-primary)]" />
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ink)]">
          Harbor School
        </p>
      </div>
    </div>
  );
}
