import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";

export default async function ParentGradesPage() {
  const session = await auth();
  const links = await prisma.parentStudent.findMany({
    where: { parentId: session!.user.id },
    select: { studentId: true },
  });
  const studentIds = links.map((l) => l.studentId);
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

  const grades = await prisma.grade.findMany({
    where: { studentProfileId: { in: studentIds } },
    include: {
      student: { include: { user: true } },
      assignment: { include: { subject: true, class: true } },
    },
    orderBy: { assignment: { createdAt: "desc" } },
  });

  return (
    <div>
      <PageHeader title="Children’s grades" description="Scores for linked students only." />
      <Panel>
        <DataTable
          headers={["Student", "Assignment", "Subject", "Class", "Score", "Due"]}
          rows={grades.map((g) => [
            g.student.user.name,
            g.assignment.title,
            g.assignment.subject.name,
            classLabel(g.assignment.class.name, g.assignment.class.section),
            `${g.score} / ${g.assignment.maxScore}`,
            g.assignment.dueDate ? formatDate(g.assignment.dueDate) : "—",
          ])}
        />
      </Panel>
    </div>
  );
}
