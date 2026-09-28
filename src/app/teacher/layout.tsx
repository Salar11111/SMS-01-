import { DashboardShell } from "@/components/ui";
import { requirePageRole } from "@/lib/authz";
import { navFor } from "@/lib/rbac";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageRole("TEACHER");
  return (
    <DashboardShell title="Teacher" role={session.user.role} userName={session.user.name} nav={navFor("TEACHER")}>
      {children}
    </DashboardShell>
  );
}
