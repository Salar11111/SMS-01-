import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const nav = [
  { href: "/teacher", label: "My classes" },
  { href: "/teacher/attendance", label: "Attendance" },
  { href: "/teacher/grades", label: "Grades" },
];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") redirect("/login");

  return (
    <DashboardShell title="Teacher" role={session.user.role} userName={session.user.name} nav={nav}>
      {children}
    </DashboardShell>
  );
}
