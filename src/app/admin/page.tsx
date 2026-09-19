import { prisma } from "@/lib/prisma";
import { PageHeader, Stat } from "@/components/ui";

export default async function AdminHomePage() {
  const [users, classes, enrollments, attendance] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.enrollment.count(),
    prisma.attendanceRecord.count(),
  ]);

  return (
    <div>
      <PageHeader title="Overview" description="School-wide snapshot for the active academic year." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={users} />
        <Stat label="Classes" value={classes} />
        <Stat label="Enrollments" value={enrollments} />
        <Stat label="Attendance records" value={attendance} />
      </div>
    </div>
  );
}
