import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function TeacherAttendanceIndexPage() {
  const session = await auth();
  const teacher = await db.teacherProfile_findUnique({
    where: { userId: session!.user.id },
  });

  const uniqueClasses = new Map<string, { name: string; section: string }>();
  teacher?.classSubjects.forEach((cs: any) => {
    uniqueClasses.set(cs.classId, { name: cs.class.name, section: cs.class.section });
  });

  const rows = Array.from(uniqueClasses.entries()).map(([id, c]) => [
    classLabel(c.name, c.section),
    <Link key={id} className="text-[var(--accent)] underline" href={`/teacher/attendance/${id}`}>
      Take attendance
    </Link>,
  ]);

  return (
    <div>
      <PageHeader title="Attendance" description="Select a class to mark today’s attendance." />
      <Panel>
        {rows.length === 0 ? (
          <EmptyState message="No classes assigned." />
        ) : (
          <DataTable headers={["Class", "Action"]} rows={rows} />
        )}
      </Panel>
    </div>
  );
}
