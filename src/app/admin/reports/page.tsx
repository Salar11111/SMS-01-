import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, Stat } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function AdminReportsPage() {
  const classes = await prisma.class.findMany({
    include: {
      academicYear: true,
      _count: { select: { enrollments: true, attendance: true } },
      attendance: { select: { status: true } },
    },
    orderBy: { name: "asc" },
  });

  const totalEnrollment = classes.reduce((sum, c) => sum + c._count.enrollments, 0);
  const allAttendance = classes.flatMap((c) => c.attendance);
  const present = allAttendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const rate =
    allAttendance.length === 0 ? "—" : `${Math.round((present / allAttendance.length) * 100)}%`;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Basic enrollment and attendance summaries." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total enrollments" value={totalEnrollment} />
        <Stat label="Overall attendance (present/late)" value={rate} />
      </div>
      <Panel title="By class">
        <DataTable
          headers={["Class", "Year", "Students", "Attendance records", "Present/late %"]}
          rows={classes.map((c) => {
            const ok = c.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE")
              .length;
            const pct =
              c.attendance.length === 0
                ? "—"
                : `${Math.round((ok / c.attendance.length) * 100)}%`;
            return [
              classLabel(c.name, c.section),
              c.academicYear.name,
              String(c._count.enrollments),
              String(c._count.attendance),
              pct,
            ];
          })}
        />
      </Panel>
    </div>
  );
}
