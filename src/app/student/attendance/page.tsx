import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";
import { activeAcademicYear, dateBounds, enrollmentsInYear } from "@/lib/school";

export default async function StudentAttendancePage() {
  const session = await auth();
  const profile = await db.studentProfile_findUnique({
    where: { userId: session!.user.id },
    populate: { enrollments: { class: { academicYear: true } } },
  });
  if (!profile) return <EmptyState message="Student profile not found." />;

  const activeYear = activeAcademicYear(profile.enrollments ?? []);
  const classIds = enrollmentsInYear(profile.enrollments, activeYear).map((enrollment) => enrollment.classId);
  const bounds = dateBounds(activeYear);
  const where: Record<string, unknown> = { studentProfileId: profile.id, classId: { in: classIds } };
  if (bounds) where.date = bounds;
  const records =
    classIds.length === 0
      ? []
      : await db.attendanceRecord_findMany({
          where,
          populate: { class: true },
          orderBy: { date: "desc" },
        });

  return (
    <div>
      <PageHeader title="My attendance" description="Your recorded attendance by class." />
      <Panel>
        <DataTable
          headers={["Date", "Class", "Status"]}
          rows={records.map((r) => [
            formatDate(r.date),
            classLabel(r.class?.name ?? "", r.class?.section ?? ""),
            r.status,
          ])}
        />
      </Panel>
    </div>
  );
}
