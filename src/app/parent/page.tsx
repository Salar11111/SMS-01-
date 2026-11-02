import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, EmptyState, SectionLabel, Badge, Avatar } from "@/components/ui";
import { classLabel } from "@/lib/utils";
import { activeAcademicYear, dateBounds, enrollmentsInYear, openEnrollments } from "@/lib/school";
import { GraduationCap, Users } from "lucide-react";

export default async function ParentHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Parent";

  const links = await db.parentStudent_findMany({
    where: { parentId: session!.user.id },
    populate: { student: { user: true, enrollments: { class: { academicYear: true } } } },
  });
  const activeYear = activeAcademicYear(links.flatMap((link) => openEnrollments(link.student?.enrollments)));
  const visibleEnrollments = (enrollments: NonNullable<(typeof links)[number]["student"]>["enrollments"]) =>
    enrollmentsInYear(enrollments, activeYear);
  const classIds = [
    ...new Set(
      links.flatMap((link) =>
        visibleEnrollments(link.student?.enrollments ?? []).map((enrollment) => enrollment.classId),
      ),
    ),
  ];
  const studentIds = links.map((link) => link.studentId);
  const bounds = dateBounds(activeYear);
  const attendanceWhere: Record<string, unknown> = {
    studentProfileId: { in: studentIds },
    classId: { in: classIds },
  };
  if (bounds) attendanceWhere.date = bounds;
  const [attendance, assignments] =
    classIds.length === 0 || studentIds.length === 0
      ? [[], []]
      : await Promise.all([
          db.attendanceRecord_findMany({ where: attendanceWhere, select: ["studentProfileId", "status"] }),
          db.assignment_findMany({ where: { classId: { in: classIds } }, select: ["id"] }),
        ]);
  const grades =
    assignments.length === 0
      ? []
      : await db.grade_findMany({
          where: {
            studentProfileId: { in: studentIds },
            assignmentId: { in: assignments.map((item) => item.id) },
          },
          select: ["studentProfileId"],
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
            const enrollments = visibleEnrollments(l.student?.enrollments ?? []);
            const marks = attendance.filter((record) => record.studentProfileId === l.studentId);
            const present = marks.filter((record) => record.status === "PRESENT").length;
            const rate = marks.length === 0 ? "—" : `${Math.round((present / marks.length) * 100)}%`;
            const gradeCount = grades.filter((grade) => grade.studentProfileId === l.studentId).length;

             return (
               <div key={l.id} className="card p-6">
                 <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                     <Avatar name={l.student?.user?.name ?? "Student"} size="lg" />
                     <div>
                       <h3 className="text-lg font-bold text-[var(--color-ink)] font-[family-name:var(--font-display)]">
                         {l.student?.user?.name ?? "Student"}
                       </h3>
                       <p className="text-sm text-[var(--color-slate-muted)]">
                         ID: {l.student?.studentId ?? "—"}
                       </p>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     <Badge variant="primary">
                       <GraduationCap className="h-3 w-3" />
                       {enrollments.length} Classes
                     </Badge>
                     <Badge variant={rate === "—" ? "neutral" : "success"}>
                       {rate} Attendance
                     </Badge>
                     <Badge variant="info">
                       {gradeCount} Grades
                     </Badge>
                   </div>
                 </div>

                 <DataTable
                   headers={["Class"]}
                   rows={enrollments.map((enrollment) => [
                     classLabel(enrollment.class?.name ?? "", enrollment.class?.section ?? ""),
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
