import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";
import { activeAcademicYear, dateBounds, enrollmentsInYear, openEnrollments } from "@/lib/school";

export default async function ParentAttendancePage() {
  const session = await auth();
  const links = await db.parentStudent_findMany({
    where: { parentId: session!.user.id },
    populate: { student: { enrollments: { class: { academicYear: true } } } },
  });
  const studentIds = links.map((l) => l.studentId);
  const activeYear = activeAcademicYear(links.flatMap((link) => openEnrollments(link.student?.enrollments)));
  const classIds = [
    ...new Set(
      links.flatMap((link) =>
        enrollmentsInYear(link.student?.enrollments, activeYear).map((enrollment) => enrollment.classId),
      ),
    ),
  ];
  const bounds = dateBounds(activeYear);
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

  const where: Record<string, unknown> = { studentProfileId: { in: studentIds }, classId: { in: classIds } };
  if (bounds) where.date = bounds;
  const records = classIds.length === 0 ? [] : await db.attendanceRecord_findMany({
    where,
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
            r.student?.user?.name ?? "Student",
            classLabel(r.class?.name ?? "", r.class?.section ?? ""),
            r.status,
          ])}
        />
      </Panel>
    </div>
  );
}
