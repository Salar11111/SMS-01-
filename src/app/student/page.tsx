import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, Stat, EmptyState, SectionLabel, Badge } from "@/components/ui";
import { classLabel } from "@/lib/utils";
import { activeAcademicYear, dateBounds, enrollmentsInYear } from "@/lib/school";
import { CalendarCheck, ClipboardList, GraduationCap, Award } from "lucide-react";

export default async function StudentHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Student";

  const profile = await db.studentProfile_findUnique({
    where: { userId: session!.user.id },
    populate: { enrollments: { class: { academicYear: true } } },
  });

  if (!profile) {
    return <EmptyState message="Student profile not found." />;
  }

  const activeYear = activeAcademicYear(profile.enrollments ?? []);
  const termEnrollments = enrollmentsInYear(profile.enrollments, activeYear);
  const classIds = termEnrollments.map((enrollment: { classId: string }) => enrollment.classId);
  const bounds = dateBounds(activeYear);
  const attendanceWhere: Record<string, unknown> = {
    studentProfileId: profile.id,
    classId: { in: classIds },
  };
  if (bounds) attendanceWhere.date = bounds;
  const [attendance, assignments] =
    classIds.length === 0
      ? [[], []]
      : await Promise.all([
          db.attendanceRecord_findMany({ where: attendanceWhere }),
          db.assignment_findMany({ where: { classId: { in: classIds } }, select: ["id", "maxScore"] }),
        ]);
  const grades =
    assignments.length === 0
      ? []
      : await db.grade_findMany({
          where: { studentProfileId: profile.id, assignmentId: { in: assignments.map((item) => item.id) } },
          populate: { assignment: true },
        });
  profile.enrollments = termEnrollments;
  profile.attendance = attendance;
  profile.grades = grades;

  const present = profile.attendance.filter((record) => record.status === "PRESENT").length;
  const rate =
    profile.attendance.length === 0 ? "—" : `${Math.round((present / profile.attendance.length) * 100)}%`;

  const graded = profile.grades.filter((grade) => (grade.assignment?.maxScore ?? 0) > 0);
  const avgScore =
    graded.length === 0
      ? "—"
      : `${Math.round(
          graded.reduce((sum, grade) => sum + (grade.score / (grade.assignment?.maxScore ?? 1)) * 100, 0) /
            graded.length,
        )}%`;

  return (
    <div>
      <PageHeader
        title={`Hello, ${firstName}`}
        description={`Student ID: ${profile.studentId}`}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Enrolled Classes"
          value={profile.enrollments.length}
          icon={<GraduationCap className="h-5 w-5" />}
        />
        <Stat
          label="Attendance Rate"
          value={rate}
          icon={<CalendarCheck className="h-5 w-5" />}
          trend={profile.attendance.length > 0 ? "up" : "neutral"}
          trendLabel={rate}
        />
        <Stat
          label="Grade Entries"
          value={profile.grades.length}
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <Stat
          label="Average Score"
          value={avgScore}
          icon={<Award className="h-5 w-5" />}
        />
      </div>

      <SectionLabel>My classes</SectionLabel>
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <Badge variant="primary">{profile.enrollments.length} Enrolled</Badge>
          <Badge variant="success">{rate} Attendance</Badge>
        </div>
        <DataTable
          headers={["Class", "Year"]}
          rows={profile.enrollments.map((enrollment) => [
            classLabel(enrollment.class?.name ?? "", enrollment.class?.section ?? ""),
            enrollment.class?.academicYear?.name ?? "—",
          ])}
        />
      </Panel>
    </div>
  );
}
