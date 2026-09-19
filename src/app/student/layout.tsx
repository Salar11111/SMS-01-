import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const nav = [
  { href: "/student", label: "Overview" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/student/grades", label: "Grades" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") redirect("/login");

  return (
    <DashboardShell title="Student" role={session.user.role} userName={session.user.name} nav={nav}>
      {children}
    </DashboardShell>
  );
}
