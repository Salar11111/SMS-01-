import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, Stat } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function AdminReportsPage() {
  const [classes, attendanceGroups] = await Promise.all([
    prisma.class.findMany({
      include: {
        academicYear: true,
        _count: { select: { enrollments: true, attendance: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.attendanceRecord.groupBy({
      by: ["classId", "status"],
      _count: true,
    }),
  ]);

  const byClass = new Map<
    string,
    { total: number; present: number }
  >();
  for (const g of attendanceGroups) {
    const entry = byClass.get(g.classId) ?? { total: 0, present: 0 };
    entry.total += g._count;
    if (g.status === "PRESENT" || g.status === "LATE") entry.present += g._count;
    byClass.set(g.classId, entry);
  }

  const totals = { enrollment: 0, attendance: 0, present: 0 };
  for (const c of classes) {
    totals.enrollment += c._count.enrollments;
    totals.attendance += c._count.attendance;
    totals.present += byClass.get(c.id)?.present ?? 0;
  }
  const rate =
    totals.attendance === 0 ? "—" : `${Math.round((totals.present / totals.attendance) * 100)}%`;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Basic enrollment and attendance summaries." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Total enrollments" value={totals.enrollment} />
        <Stat label="Overall attendance (present/late)" value={rate} />
      </div>
      <Panel title="By class">
        <DataTable
          headers={["Class", "Year", "Students", "Attendance records", "Present/late %"]}
          rows={classes.map((c) => {
            const entry = byClass.get(c.id);
            const pct =
              (entry?.total ?? 0) === 0
                ? "—"
                : `${Math.round(((entry?.present ?? 0) / (entry?.total ?? 1)) * 100)}%`;
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