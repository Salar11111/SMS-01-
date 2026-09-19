import { prisma } from "@/lib/prisma";
import {
  createAcademicYear,
  createClass,
  createSubject,
  assignTeacherToClass,
} from "@/lib/actions/admin";
import { PageHeader, Panel, DataTable, Field, SubmitButton } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function AdminClassesPage() {
  const [years, classes, subjects, teachers, assignments] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { name: "desc" } }),
    prisma.class.findMany({
      include: { academicYear: true, _count: { select: { enrollments: true } } },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.teacherProfile.findMany({ include: { user: true } }),
    prisma.classSubject.findMany({
      include: {
        class: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Classes & subjects" description="Set up the academic structure." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Add academic year">
          <form action={createAcademicYear} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1">
              <Field label="Year name" name="name" required defaultValue="2026-2027" />
            </div>
            <SubmitButton>Add year</SubmitButton>
          </form>
        </Panel>

        <Panel title="Add subject">
          <form action={createSubject} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1">
              <Field label="Subject name" name="name" required />
            </div>
            <SubmitButton>Add subject</SubmitButton>
          </form>
        </Panel>
      </div>

      <Panel title="Create class">
        <form action={createClass} className="grid gap-3 sm:grid-cols-4">
          <Field label="Class name" name="name" required defaultValue="Grade 10" />
          <Field label="Section" name="section" required defaultValue="B" />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--ink)]">Academic year</span>
            <select
              name="academicYearId"
              required
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
            >
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <SubmitButton>Create class</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="Assign teacher to class subject">
        <form action={assignTeacherToClass} className="grid gap-3 sm:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--ink)]">Class</span>
            <select
              name="classId"
              required
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {classLabel(c.name, c.section)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--ink)]">Subject</span>
            <select
              name="subjectId"
              required
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--ink)]">Teacher</span>
            <select
              name="teacherProfileId"
              required
              className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <SubmitButton>Assign</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="Classes">
        <DataTable
          headers={["Class", "Year", "Students"]}
          rows={classes.map((c) => [
            classLabel(c.name, c.section),
            c.academicYear.name,
            String(c._count.enrollments),
          ])}
        />
      </Panel>

      <Panel title="Teacher assignments">
        <DataTable
          headers={["Class", "Subject", "Teacher"]}
          rows={assignments.map((a) => [
            classLabel(a.class.name, a.class.section),
            a.subject.name,
            a.teacher.user.name,
          ])}
        />
      </Panel>
    </div>
  );
}
