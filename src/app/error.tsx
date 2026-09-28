"use client";

import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Root layout error:", error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-error)]/10 mx-auto">
          <svg className="h-8 w-8 text-[var(--color-error)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-ink)]">Something went wrong</h1>
        <p className="mt-2 text-[var(--color-muted)]">We encountered an unexpected error. Please try again.</p>
        <Button onClick={reset} className="mt-6 w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}