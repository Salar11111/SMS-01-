import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAssignment, saveGrades } from "@/lib/actions/teacher";
import { PageHeader, Panel, Field, SubmitButton, DataTable } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";

export default async function TeacherGradebookPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await auth();
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!teacher) notFound();

  const subjects = await prisma.classSubject.findMany({
    where: { teacherProfileId: teacher.id, classId },
    include: { subject: true, class: true },
  });
  if (subjects.length === 0) notFound();

  const klass = subjects[0].class;
  const [enrollments, assignments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { classId },
      include: { student: { include: { user: true } } },
      orderBy: { student: { user: { name: "asc" } } },
    }),
    prisma.assignment.findMany({
      where: {
        classId,
        subjectId: { in: subjects.map((s) => s.subjectId) },
      },
      include: {
        subject: true,
        grades: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Gradebook · ${classLabel(klass.name, klass.section)}`}
        description="Create assignments and enter scores."
      />

      <Panel title="New assignment">
        <form action={createAssignment} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input type="hidden" name="classId" value={classId} />
          <Field label="Title" name="title" required />
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Subject</span>
            <select
              name="subjectId"
              required
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
            >
              {subjects.map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subject.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Max score" name="maxScore" type="number" required defaultValue="100" />
          <Field label="Due date" name="dueDate" type="date" />
          <div className="flex items-end">
            <SubmitButton>Create</SubmitButton>
          </div>
        </form>
      </Panel>

      {assignments.map((a) => (
        <Panel
          key={a.id}
          title={`${a.title} · ${a.subject.name} (max ${a.maxScore})`}
          action={
            a.dueDate ? (
              <span className="text-sm text-[var(--color-muted)]">Due {formatDate(a.dueDate)}</span>
            ) : null
          }
        >
          <form action={saveGrades} className="space-y-3">
            <input type="hidden" name="assignmentId" value={a.id} />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => {
                    const existing = a.grades.find((g) => g.studentProfileId === e.studentProfileId);
                    return (
                      <tr key={e.id} className="border-b border-[var(--color-line)]/70">
                        <td className="py-2">{e.student.user.name}</td>
                        <td className="py-2">
                          <input
                            type="number"
                            step="0.01"
                            name={`score_${e.studentProfileId}`}
                            defaultValue={existing?.score ?? ""}
                            className="w-28 rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <SubmitButton>Save grades</SubmitButton>
          </form>
        </Panel>
      ))}

      {assignments.length === 0 && (
        <Panel>
          <DataTable headers={[]} rows={[]} />
        </Panel>
      )}
    </div>
  );
}
