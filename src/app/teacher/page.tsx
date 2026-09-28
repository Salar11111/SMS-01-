import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState, SectionLabel, Badge } from "@/components/ui";
import { classLabel } from "@/lib/utils";
import { ArrowRight, CalendarCheck, FileSignature } from "lucide-react";

export default async function TeacherHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Teacher";

  const teacher = await db.teacherProfile_findUnique({
    where: { userId: session!.user.id },
  });

  const rows =
    teacher?.classSubjects.map((cs: any) => [
      classLabel(cs.class.name, cs.class.section),
      cs.subject.name,
      String(cs.class._count.enrollments),
      <span key={cs.id} className="flex gap-3">
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
          href={`/teacher/attendance/${cs.classId}`}
        >
          <CalendarCheck className="h-3.5 w-3.5" /> Attendance
        </Link>
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-terracotta)] hover:underline"
          href={`/teacher/grades/${cs.classId}`}
        >
          <FileSignature className="h-3.5 w-3.5" /> Grades
        </Link>
      </span>,
    ]) ?? [];

  return (
    <div>
      <PageHeader
        title={`Good day, ${firstName}`}
        description="Classes and subjects assigned to you."
      />

      {/* Quick actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link href="/teacher/attendance" className="card card-hover group flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-soft)] text-[var(--color-success)]">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-ink)]">Take Attendance</p>
              <p className="text-sm text-[var(--color-slate-muted)]">Mark presence for your classes</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--color-slate-light)] transition-all group-hover:text-[var(--color-primary)] group-hover:translate-x-1" />
        </Link>
        <Link href="/teacher/grades" className="card card-hover group flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]">
              <FileSignature className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-ink)]">Manage Grades</p>
              <p className="text-sm text-[var(--color-slate-muted)]">Create assignments and enter scores</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--color-slate-light)] transition-all group-hover:text-[var(--color-primary)] group-hover:translate-x-1" />
        </Link>
      </div>

      <SectionLabel>My classes</SectionLabel>
      <Panel>
        {rows.length === 0 ? (
          <EmptyState
            message="No class assignments yet. Ask an admin to assign you."
            action={
              <Link href="/login" className="btn-secondary">
                Refresh
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <Badge variant="primary">{rows.length} Classes</Badge>
            </div>
            <DataTable headers={["Class", "Subject", "Students", "Actions"]} rows={rows} />
          </>
        )}
      </Panel>
    </div>
  );
}
