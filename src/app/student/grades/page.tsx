import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";
import { activeAcademicYear, enrollmentsInYear } from "@/lib/school";

export default async function StudentGradesPage() {
  const session = await auth();
  const profile = await db.studentProfile_findUnique({
    where: { userId: session!.user.id },
    populate: { enrollments: { class: { academicYear: true } } },
  });
  if (!profile) return <EmptyState message="Student profile not found." />;

  const activeYear = activeAcademicYear(profile.enrollments ?? []);
  const classIds = enrollmentsInYear(profile.enrollments, activeYear).map((enrollment) => enrollment.classId);
  const assignments =
    classIds.length === 0
      ? []
      : await db.assignment_findMany({ where: { classId: { in: classIds } }, select: ["id"] });
  const grades =
    assignments.length === 0
      ? []
      : await db.grade_findMany({
          where: { studentProfileId: profile.id, assignmentId: { in: assignments.map((item) => item.id) } },
          populate: { assignment: { subject: true, class: true } },
          orderBy: { assignment: { createdAt: "desc" } },
        });

  return (
    <div>
      <PageHeader title="My grades" description="Scores for your assignments." />
      <Panel>
        <DataTable
          headers={["Assignment", "Subject", "Class", "Score", "Due"]}
          rows={grades.map((g) => [
            g.assignment?.title ?? "—",
            g.assignment?.subject?.name ?? "—",
            classLabel(g.assignment?.class?.name ?? "", g.assignment?.class?.section ?? ""),
            `${g.score} / ${g.assignment?.maxScore ?? "—"}`,
            g.assignment?.dueDate ? formatDate(g.assignment.dueDate) : "—",
          ])}
        />
      </Panel>
    </div>
  );
}
