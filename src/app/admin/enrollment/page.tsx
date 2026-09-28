import { db } from "@/lib/prisma";
import { enrollStudent, linkParentStudent } from "@/lib/actions/admin";
import { ActionForm } from "@/components/action-form";
import { PageHeader, Panel, DataTable, SubmitButton } from "@/components/ui";
import { classLabel } from "@/lib/utils";

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
        description="Enroll students in classes and link parents to children."
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
                    {s.user.name} ({s.studentId})
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
                    {classLabel(c.name, c.section)} · {c.academicYear.name}
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
                    {s.user.name} ({s.studentId})
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
          headers={["Student", "Class", "Enrolled"]}
          rows={enrollments.map((e) => [
            `${e.student.user.name} (${e.student.studentId})`,
            classLabel(e.class.name, e.class.section),
            e.enrolledAt.toLocaleDateString(),
          ])}
        />
      </Panel>

      <Panel title="Parent–student links">
        <DataTable
          headers={["Parent", "Student"]}
          rows={links.map((l) => [
            l.parent.name,
            `${l.student.user.name} (${l.student.studentId})`,
          ])}
        />
      </Panel>
    </div>
  );
}
