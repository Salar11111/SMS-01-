import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, Stat } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function AdminReportsPage() {
  const [classes, attendanceGroups, gradeAverages] = await Promise.all([
    db.class_findMany({
      populate: { academicYear: true },
      orderBy: { name: "asc" },
    }),
    db.attendanceRecord_groupBy({ by: ["classId", "status"] }),
    db.grade_averageByClass(),
  ]);

  const byClass = new Map<string, { total: number; present: number; late: number; absent: number }>();
  for (const group of attendanceGroups) {
    const classId = String(group.classId ?? "");
    const entry = byClass.get(classId) ?? { total: 0, present: 0, late: 0, absent: 0 };
    const count = Number(group.count ?? 0);
    entry.total += count;
    if (group.status === "PRESENT" || group.status === "LATE") entry.present += count;
    if (group.status === "LATE") entry.late += count;
    if (group.status === "ABSENT") entry.absent += count;
    byClass.set(classId, entry);
  }

  const averages = new Map(gradeAverages.map((row) => [row.classId, row.average]));

  const totals = { enrollment: 0, attendance: 0, present: 0, late: 0, absent: 0 };
  for (const klass of classes) {
    totals.enrollment += klass._count?.enrollments ?? 0;
    const entry = byClass.get(klass.id);
    totals.attendance += entry?.total ?? 0;
    totals.present += entry?.present ?? 0;
    totals.late += entry?.late ?? 0;
    totals.absent += entry?.absent ?? 0;
  }
  const rate =
    totals.attendance === 0 ? "—" : `${Math.round((totals.present / totals.attendance) * 100)}%`;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Enrollment, attendance, and grade averages by class." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total enrollments" value={totals.enrollment} />
        <Stat label="Present or late" value={rate} />
        <Stat label="Late marks" value={totals.late} />
        <Stat label="Absences" value={totals.absent} />
      </div>
      <Panel title="By class">
        <DataTable
          headers={["Class", "Year", "Students", "Present/late %", "Late", "Absent", "Grade average"]}
          rows={classes.map((klass) => {
            const entry = byClass.get(klass.id);
            const pct =
              (entry?.total ?? 0) === 0
                ? "—"
                : `${Math.round(((entry?.present ?? 0) / (entry?.total ?? 1)) * 100)}%`;
            const average = averages.get(klass.id);
            return [
              classLabel(klass.name, klass.section),
              klass.academicYear?.name ?? "—",
              String(klass._count?.enrollments ?? 0),
              pct,
              String(entry?.late ?? 0),
              String(entry?.absent ?? 0),
              average == null ? "—" : `${Math.round(average)}%`,
            ];
          })}
        />
      </Panel>
    </div>
  );
}
