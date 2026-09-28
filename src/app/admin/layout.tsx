import { DashboardShell } from "@/components/ui";
import { requirePageRole } from "@/lib/authz";
import { navFor } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageRole("ADMIN");
  return (
    <DashboardShell title="Admin" role={session.user.role} userName={session.user.name} nav={navFor("ADMIN")}>
      {children}
    </DashboardShell>
  );
}
