import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveAttendance } from "@/lib/actions/teacher";
import { PageHeader, Panel, SubmitButton } from "@/components/ui";
import { classLabel, startOfDay, formatDate } from "@/lib/utils";

export default async function TeacherAttendanceClassPage({
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

  const owned = await prisma.classSubject.findFirst({
    where: { teacherProfileId: teacher.id, classId },
  });
  if (!owned) notFound();

  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass) notFound();

  const today = startOfDay();
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          user: true,
          attendance: {
            where: { classId, date: today },
          },
        },
      },
    },
    orderBy: { student: { user: { name: "asc" } } },
  });

  const dateValue = today.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Attendance · ${classLabel(klass.name, klass.section)}`}
        description={`Marking for ${formatDate(today)}`}
      />
      <Panel>
        <form action={saveAttendance} className="space-y-4">
          <input type="hidden" name="classId" value={classId} />
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Date</span>
            <input
              type="date"
              name="date"
              defaultValue={dateValue}
              className="rounded-md border border-[var(--line)] bg-white px-3 py-2"
            />
          </label>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)]">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const current = e.student.attendance[0]?.status || "PRESENT";
                  return (
                    <tr key={e.id} className="border-b border-[var(--line)]/70">
                      <td className="py-2">{e.student.user.name}</td>
                      <td className="py-2">
                        <select
                          name={`status_${e.studentProfileId}`}
                          defaultValue={current}
                          className="rounded-md border border-[var(--line)] bg-white px-2 py-1"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {enrollments.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No students enrolled in this class.</p>
          ) : (
            <SubmitButton>Save attendance</SubmitButton>
          )}
        </form>
      </Panel>
    </div>
  );
}
