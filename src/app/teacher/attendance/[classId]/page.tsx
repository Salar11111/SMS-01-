import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { saveAttendance } from "@/lib/actions/teacher";
import { PageHeader, Panel, SubmitButton } from "@/components/ui";
import { classLabel, startOfDay, dateInputValue, formatDate } from "@/lib/utils";

export default async function TeacherAttendanceClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await auth();
  const teacher = await db.teacherProfile_findUnique({
    where: { userId: session!.user.id },
  });
  if (!teacher) notFound();

  const owned = await db.classSubject_findFirst({ teacherProfileId: teacher.id, classId });
  if (!owned) notFound();

  const klass = (await db.class_getWithCount(classId))[0];
  if (!klass) notFound();

  const today = startOfDay();
  const enrollments = await db.enrollment_findMany({
    where: { classId },
    populate: { student: { user: true, attendance: { where: { classId, date: today } } } },
    orderBy: { student: { user: { name: "asc" } } },
  });

  const dateValue = dateInputValue(today);

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
              className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
            />
          </label>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
                  <th className="pb-2">Student</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const current = e.student.attendance[0]?.status || "PRESENT";
                  return (
                    <tr key={e.id} className="border-b border-[var(--color-line)]/70">
                      <td className="py-2">{e.student.user.name}</td>
                      <td className="py-2">
                        <select
                          name={`status_${e.studentProfileId}`}
                          defaultValue={current}
                          className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1"
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
            <p className="text-sm text-[var(--color-muted)]">No students enrolled in this class.</p>
          ) : (
            <SubmitButton>Save attendance</SubmitButton>
          )}
        </form>
      </Panel>
    </div>
  );
}
