import Link from "next/link";
import { School, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] mx-auto shadow-lg">
          <School className="h-8 w-8 text-white" />
        </div>
        <p className="font-[family-name:var(--font-display)] text-7xl font-bold text-[var(--color-primary)]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-ink)] font-[family-name:var(--font-display)]">
          Page not found
        </h1>
        <p className="mt-2 text-[var(--color-slate-muted)]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    </div>
  );
}
