import { DashboardShell } from "@/components/ui";
import { requirePageRole } from "@/lib/authz";
import { navFor } from "@/lib/rbac";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageRole("PARENT");
  return (
    <DashboardShell title="Parent" role={session.user.role} userName={session.user.name} nav={navFor("PARENT")}>
      {children}
    </DashboardShell>
  );
}
