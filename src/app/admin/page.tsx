import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader, Panel, Stat, SectionLabel, Badge } from "@/components/ui";
import { Users, School, CalendarCheck, ClipboardList, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminHomePage() {
  const session = await auth();
  const [users, classes, enrollments, attendance, teachers, students] = await Promise.all([
    db.user_count(),
    db.class_count(),
    db.enrollment_count(),
    db.attendanceRecord_count(),
    db.teacherProfile_count(),
    db.studentProfile_count(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] || "Admin";

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="School-wide snapshot for the active academic year."
        action={
          <Link href="/admin/users" className="btn-primary">
            Manage Users <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total Users" value={users} icon={<Users className="h-5 w-5" />} />
        <Stat label="Classes" value={classes} icon={<School className="h-5 w-5" />} />
        <Stat label="Enrollments" value={enrollments} icon={<ClipboardList className="h-5 w-5" />} />
        <Stat label="Teachers" value={teachers} icon={<Clock className="h-5 w-5" />} />
        <Stat label="Students" value={students} icon={<CalendarCheck className="h-5 w-5" />} />
        <Stat label="Attendance Records" value={attendance} icon={<ClipboardList className="h-5 w-5" />} />
      </div>

      {/* Quick Actions */}
      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {[
          { label: "Create Users", href: "/admin/users", desc: "Add teachers, students, and parents" },
          { label: "Manage Classes", href: "/admin/classes", desc: "Academic years, subjects, assignments" },
          { label: "Enrollment", href: "/admin/enrollment", desc: "Enroll students, link parents" },
          { label: "View Reports", href: "/admin/reports", desc: "Attendance and grade analytics" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="card card-hover group flex items-center justify-between p-5"
          >
            <div>
              <p className="font-semibold text-[var(--color-ink)]">{action.label}</p>
              <p className="text-sm text-[var(--color-slate-muted)]">{action.desc}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-[var(--color-slate-light)] transition-all group-hover:text-[var(--color-primary)] group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      {/* Overview panel */}
      <Panel title="Overview" variant="accent">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Badge variant="success">{users} Active Users</Badge>
          <Badge variant="primary">{classes} Classes Running</Badge>
          <Badge variant="info">{enrollments} Enrollments</Badge>
        </div>
        <p className="mt-4 text-sm text-[var(--color-slate-muted)]">
          The school management system is running smoothly. All modules — enrollment,
          attendance, grades, and reporting — are operational.
        </p>
      </Panel>
    </div>
  );
}
