import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState, SectionLabel, Badge, Avatar } from "@/components/ui";
import { classLabel } from "@/lib/utils";
import { GraduationCap, Users } from "lucide-react";

export default async function ParentHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Parent";

  const links = await db.parentStudent_findMany({
    where: { parentId: session!.user.id },
    populate: { student: { user: true, enrollments: { class: true }, attendance: true, grades: true } },
  });

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Students linked to your parent account."
      />

      {links.length === 0 ? (
        <Panel variant="accent">
          <EmptyState
            message="No students linked yet. Ask an admin to link your account."
            icon={<Users className="h-6 w-6 text-[var(--color-slate-light)]" />}
          />
        </Panel>
      ) : (
        <div className="space-y-8">
          <SectionLabel>
            {links.length} {links.length === 1 ? "Child" : "Children"}
          </SectionLabel>

          {links.map((l) => {
            const present = l.student.attendance.filter(
(a: any) => a.status === "PRESENT" || a.status === "LATE",
             ).length;
             const rate =
               l.student.attendance.length === 0
                 ? "—"
                 : `${Math.round((present / l.student.attendance.length) * 100)}%`;

             return (
               <div key={l.id} className="card p-6">
                 <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                     <Avatar name={l.student.user.name} size="lg" />
                     <div>
                       <h3 className="text-lg font-bold text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                         {l.student.user.name}
                       </h3>
                       <p className="text-sm text-[var(--color-slate-muted)]">
                         ID: {l.student.studentId}
                       </p>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     <Badge variant="primary">
                       <GraduationCap className="h-3 w-3" />
                       {l.student.enrollments.length} Classes
                     </Badge>
                     <Badge variant={rate === "—" ? "neutral" : "success"}>
                       {rate} Attendance
                     </Badge>
                     <Badge variant="info">
                       {l.student.grades.length} Grades
                     </Badge>
                   </div>
                 </div>

                 <DataTable
                   headers={["Class"]}
                   rows={l.student.enrollments.map((e: any) => [
                     classLabel(e.class.name, e.class.section),
                   ])}
                 />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
