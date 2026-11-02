import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";
import { activeAcademicYear, enrollmentsInYear, openEnrollments } from "@/lib/school";

export default async function ParentGradesPage() {
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
  if (studentIds.length === 0) {
    return (
      <div>
        <PageHeader title="Grades" />
        <Panel>
          <EmptyState message="No linked students." />
        </Panel>
      </div>
    );
  }

  const assignments =
    classIds.length === 0 ? [] : await db.assignment_findMany({ where: { classId: { in: classIds } }, select: ["id"] });
  const grades = assignments.length === 0 ? [] : await db.grade_findMany({
    where: { studentProfileId: { in: studentIds }, assignmentId: { in: assignments.map((item) => item.id) } },
    populate: { student: { user: true }, assignment: { subject: true, class: true } },
    orderBy: { assignment: { createdAt: "desc" } },
  });

  return (
    <div>
      <PageHeader title="Children’s grades" description="Scores for linked students only." />
      <Panel>
        <DataTable
          headers={["Student", "Assignment", "Subject", "Class", "Score", "Due"]}
          rows={grades.map((g) => [
            g.student?.user?.name ?? "Student",
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
