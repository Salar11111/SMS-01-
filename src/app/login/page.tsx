import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { auth } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/rbac";
import { School, Shield } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id && session.user.role) redirect(ROLE_HOME[session.user.role]);

  return (
    <div className="relative min-h-screen overflow-hidden gradient-hero">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="page-rise w-full">
          <Link href="/" className="mx-auto mb-6 flex w-fit flex-col items-center gap-3 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-lg transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
              <School className="h-7 w-7 text-[var(--color-primary-foreground)]" />
            </div>
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--color-ink)]">
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

          <div className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-panel)] p-8 shadow-[var(--shadow-xl)]">
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

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-slate-muted)]">
            <Shield className="h-3.5 w-3.5 text-[var(--color-primary)]" />
            <span>Secure login with role-based access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
