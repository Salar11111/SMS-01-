import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { School, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-hero">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--color-sage-light)] blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[var(--color-terracotta-light)] blur-3xl opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full animate-slide-up">
          {/* Logo */}
          <Link href="/" className="mx-auto mb-6 flex w-fit flex-col items-center gap-3 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] shadow-lg transition-transform group-hover:scale-105">
              <School className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--color-ink)]">
                Harbor School
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-slate-muted)]">
                Management Suite
              </p>
            </div>
          </Link>

          <p className="mb-8 text-center text-[var(--color-slate-muted)]">
            Sign in to your account
          </p>

          {/* Login card */}
          <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 shadow-[var(--shadow-xl)]">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <div className="h-12 shimmer-bg" />
                  <div className="h-12 shimmer-bg" />
                  <div className="h-12 shimmer-bg" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-slate-muted)]">
            <Shield className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span>Secure login with role-based access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
