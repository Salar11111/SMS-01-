import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-sm">
        <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Harbor School
        </p>
        <h1 className="mt-1 text-lg text-[var(--muted)]">Sign in to your account</h1>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-6 rounded-md bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
          <p className="font-semibold text-[var(--ink)]">Demo accounts</p>
          <p className="mt-1">Password for all: password123</p>
          <ul className="mt-2 space-y-0.5">
            <li>admin@school.edu</li>
            <li>teacher@school.edu</li>
            <li>student@school.edu</li>
            <li>parent@school.edu</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
