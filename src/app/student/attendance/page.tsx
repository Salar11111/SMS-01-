import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel, formatDate } from "@/lib/utils";

export default async function StudentAttendancePage() {
  const session = await auth();
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) return <EmptyState message="Student profile not found." />;

  const records = await prisma.attendanceRecord.findMany({
    where: { studentProfileId: profile.id },
    include: { class: true },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <PageHeader title="My attendance" description="Your recorded attendance by class." />
      <Panel>
        <DataTable
          headers={["Date", "Class", "Status"]}
          rows={records.map((r) => [
            formatDate(r.date),
            classLabel(r.class.name, r.class.section),
            r.status,
          ])}
        />
      </Panel>
    </div>
  );
}
