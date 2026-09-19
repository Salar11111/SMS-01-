import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const nav = [
  { href: "/parent", label: "Children" },
  { href: "/parent/attendance", label: "Attendance" },
  { href: "/parent/grades", label: "Grades" },
];

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PARENT") redirect("/login");

  return (
    <DashboardShell title="Parent" role={session.user.role} userName={session.user.name} nav={nav}>
      {children}
    </DashboardShell>
  );
}
