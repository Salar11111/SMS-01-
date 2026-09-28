import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/ui";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/enrollment", label: "Enrollment" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  return (
    <DashboardShell title="Admin" role={session.user.role} userName={session.user.name} nav={nav}>
      {children}
    </DashboardShell>
  );
}
