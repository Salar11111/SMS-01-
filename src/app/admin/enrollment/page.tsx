import { db } from "@/lib/prisma";
import { enrollStudent, endEnrollment, linkParentStudent } from "@/lib/actions";
import { ActionForm } from "@/components/action-form";
import { PageHeader, Panel, DataTable, SubmitButton } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";

export default async function AdminEnrollmentPage() {
  const [students, classes, parents, enrollments, links] = await Promise.all([
    db.studentProfile_findMany({ populate: { user: true }, orderBy: { studentId: "asc" } }),
    db.class_findMany({ populate: { academicYear: true }, orderBy: { name: "asc" } }),
    db.user_findMany({ where: { role: "PARENT" }, orderBy: { name: "asc" } }),
    db.enrollment_findMany({
      populate: { student: { user: true }, class: true },
      orderBy: { enrolledAt: "desc" },
    }),
    db.parentStudent_findMany({
      populate: { parent: true, student: { user: true } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enrollment"
        description="Enroll students in classes. Ending an enrollment keeps the history and the marks already recorded."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Enroll student">
          <ActionForm action={enrollStudent} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--color-ink)]">Student</span>
              <select
                name="studentProfileId"
                required
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name ?? "Student"} ({s.studentId})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--color-ink)]">Class</span>
              <select
                name="classId"
                required
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {classLabel(c.name, c.section)} · {c.academicYear?.name ?? "—"}
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton>Enroll</SubmitButton>
          </ActionForm>
        </Panel>

        <Panel title="Link parent to student">
          <ActionForm action={linkParentStudent} className="space-y-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--color-ink)]">Parent</span>
              <select
                name="parentId"
                required
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
              >
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--color-ink)]">Student</span>
              <select
                name="studentId"
                required
                className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name ?? "Student"} ({s.studentId})
                  </option>
                ))}
              </select>
            </label>
            <SubmitButton>Link</SubmitButton>
          </ActionForm>
        </Panel>
      </div>

      <Panel title="Current enrollments">
        <DataTable
          headers={["Student", "Class", "Enrolled", ""]}
          rows={enrollments
            .filter((enrollment) => enrollment.endedAt == null)
            .map((enrollment) => [
              `${enrollment.student?.user?.name ?? "Student"} (${enrollment.student?.studentId ?? "—"})`,
              classLabel(enrollment.class?.name ?? "", enrollment.class?.section ?? ""),
              enrollment.enrolledAt ? formatDate(enrollment.enrolledAt) : "—",
              <ActionForm key={enrollment.id} action={endEnrollment}>
                <input type="hidden" name="enrollmentId" value={enrollment.id} />
                <SubmitButton>End enrollment</SubmitButton>
              </ActionForm>,
            ])}
        />
      </Panel>

      <Panel title="Enrollment history">
        <DataTable
          headers={["Student", "Class", "Ended", ""]}
          rows={enrollments
            .filter((enrollment) => enrollment.endedAt != null)
            .map((enrollment) => [
              `${enrollment.student?.user?.name ?? "Student"} (${enrollment.student?.studentId ?? "—"})`,
              classLabel(enrollment.class?.name ?? "", enrollment.class?.section ?? ""),
              enrollment.endedAt ? formatDate(enrollment.endedAt) : "—",
              <ActionForm key={enrollment.id} action={enrollStudent}>
                <input type="hidden" name="studentProfileId" value={enrollment.studentProfileId} />
                <input type="hidden" name="classId" value={enrollment.classId} />
                <SubmitButton>Re-enroll</SubmitButton>
              </ActionForm>,
            ])}
        />
      </Panel>

      <Panel title="Parent–student links">
        <DataTable
          headers={["Parent", "Student"]}
          rows={links.map((link) => [
            link.parent?.name ?? "Parent",
            `${link.student?.user?.name ?? "Student"} (${link.student?.studentId ?? "—"})`,
          ])}
        />
      </Panel>
    </div>
  );
}
