import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState } from "@/components/ui";
import { classLabel } from "@/lib/utils";

export default async function ParentHomePage() {
  const session = await auth();
  const links = await prisma.parentStudent.findMany({
    where: { parentId: session!.user.id },
    include: {
      student: {
        include: {
          user: true,
          enrollments: { include: { class: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your children"
        description="Students linked to your parent account."
      />
      {links.length === 0 ? (
        <Panel>
          <EmptyState message="No students linked yet. Ask an admin to link your account." />
        </Panel>
      ) : (
        links.map((l) => (
          <Panel key={l.id} title={`${l.student.user.name} (${l.student.studentId})`}>
            <DataTable
              headers={["Enrolled class"]}
              rows={l.student.enrollments.map((e) => [
                classLabel(e.class.name, e.class.section),
              ])}
            />
          </Panel>
        ))
      )}
    </div>
  );
}
