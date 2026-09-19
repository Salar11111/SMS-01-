import Link from "next/link";
import { signOut } from "@/lib/auth";
import { formatRole, type AppRole } from "@/lib/rbac";

type NavItem = { href: string; label: string };

export function DashboardShell({
  title,
  role,
  userName,
  nav,
  children,
}: {
  title: string;
  role: AppRole;
  userName: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
              Harbor School
            </p>
            <p className="text-sm text-[var(--muted)]">
              {title} · {formatRole(role)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:inline">{userName}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink)] hover:bg-[var(--surface)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
