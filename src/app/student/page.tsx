import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, Stat, EmptyState } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function StudentHomePage() {
  const session = await auth();
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      enrollments: { include: { class: { include: { academicYear: true } } } },
      attendance: true,
      grades: true,
    },
  });

  if (!profile) {
    return <EmptyState message="Student profile not found." />;
  }

  const present = profile.attendance.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE",
  ).length;
  const rate =
    profile.attendance.length === 0
      ? "—"
      : `${Math.round((present / profile.attendance.length) * 100)}%`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${session!.user.name}`}
        description={`Student ID: ${profile.studentId}`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Enrolled classes" value={profile.enrollments.length} />
        <Stat label="Attendance rate" value={rate} />
        <Stat label="Grade entries" value={profile.grades.length} />
      </div>
      <Panel title="My classes">
        <DataTable
          headers={["Class", "Year"]}
          rows={profile.enrollments.map((e) => [
            classLabel(e.class.name, e.class.section),
            e.class.academicYear.name,
          ])}
        />
      </Panel>
    </div>
  );
}
