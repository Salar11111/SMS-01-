import { DashboardShell } from "@/components/ui";
import { requirePageRole } from "@/lib/authz";
import { navFor } from "@/lib/rbac";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageRole("STUDENT");
  return (
    <DashboardShell title="Student" role={session.user.role} userName={session.user.name} nav={navFor("STUDENT")}>
      {children}
    </DashboardShell>
  );
}
