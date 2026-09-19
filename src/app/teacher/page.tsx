import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function TeacherHomePage() {
  const session = await auth();
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      classSubjects: {
        include: {
          class: { include: { _count: { select: { enrollments: true } } } },
          subject: true,
        },
      },
    },
  });

  const rows =
    teacher?.classSubjects.map((cs) => [
      classLabel(cs.class.name, cs.class.section),
      cs.subject.name,
      String(cs.class._count.enrollments),
      <span key={cs.id} className="flex gap-2">
        <Link className="text-[var(--accent)] underline" href={`/teacher/attendance/${cs.classId}`}>
          Attendance
        </Link>
        <Link className="text-[var(--accent)] underline" href={`/teacher/grades/${cs.classId}`}>
          Grades
        </Link>
      </span>,
    ]) ?? [];

  return (
    <div>
      <PageHeader title="My classes" description="Classes and subjects assigned to you." />
      <Panel>
        {rows.length === 0 ? (
          <EmptyState message="No class assignments yet. Ask an admin to assign you." />
        ) : (
          <DataTable headers={["Class", "Subject", "Students", "Actions"]} rows={rows} />
        )}
      </Panel>
    </div>
  );
}
