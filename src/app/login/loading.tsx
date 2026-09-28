export default function LoginLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-background)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(31,111,99,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(15,61,58,0.15), transparent 45%), linear-gradient(160deg, var(--color-surface) 0%, var(--color-background) 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full animate-pulse">
          <div className="mx-auto mb-6 h-14 w-14 animate-pulse rounded-xl bg-[var(--color-line)]" />
          <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-line)] mx-auto mb-2" />
          <div className="h-4 w-64 animate-pulse rounded bg-[var(--color-line)] mx-auto" />
          <div className="mt-8 animate-pulse rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8">
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded bg-[var(--color-line)]" />
              <div className="h-10 animate-pulse rounded bg-[var(--color-line)]" />
              <div className="h-10 animate-pulse rounded bg-[var(--color-line)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}