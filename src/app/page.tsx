import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/rbac";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--hero)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(120,200,180,0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.12), transparent 35%), linear-gradient(160deg, #0f3d3a 0%, #163a4a 55%, #1c2f38 100%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight sm:text-6xl">
          Harbor School
        </p>
        <h1 className="mt-4 max-w-xl text-2xl font-light text-white/90 sm:text-3xl">
          Manage enrollment, attendance, and grades in one place.
        </h1>
        <p className="mt-4 max-w-lg text-white/70">
          Role-based access for administrators, teachers, students, and parents.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[var(--hero)] hover:bg-white/90"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
