import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";

export default async function ParentAttendancePage() {
  const session = await auth();
  const links = await db.parentStudent_findMany({
    where: { parentId: session!.user.id },
  });
  const studentIds = links.map((l) => l.studentId);
  if (studentIds.length === 0) {
    return (
      <div>
        <PageHeader title="Attendance" />
        <Panel>
          <EmptyState message="No linked students." />
        </Panel>
      </div>
    );
  }

  const records = await db.attendanceRecord_findMany({
    where: { studentProfileId: { in: studentIds } },
    populate: { student: { user: true }, class: true },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <PageHeader title="Children’s attendance" description="Attendance for linked students only." />
      <Panel>
        <DataTable
          headers={["Date", "Student", "Class", "Status"]}
          rows={records.map((r) => [
            formatDate(r.date),
            r.student.user.name,
            classLabel(r.class.name, r.class.section),
            r.status,
          ])}
        />
      </Panel>
    </div>
  );
}
