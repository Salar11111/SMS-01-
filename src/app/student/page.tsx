import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { PageHeader, Panel, DataTable, Stat, EmptyState, SectionLabel, Badge } from "@/components/ui";
import { classLabel } from "@/lib/utils";
import { CalendarCheck, ClipboardList, GraduationCap, Award } from "lucide-react";

export default async function StudentHomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Student";

  const profile = await db.studentProfile_findUnique({
    where: { userId: session!.user.id },
  });

  if (!profile) {
    return <EmptyState message="Student profile not found." />;
  }

  const present = profile.attendance.filter(
(a: any) => a.status === "PRESENT" || a.status === "LATE",
   ).length;
   const rate =
     profile.attendance.length === 0
       ? "—"
       : `${Math.round((present / profile.attendance.length) * 100)}%`;

   const avgScore =
     profile.grades.length === 0
       ? "—"
       : `${Math.round(
           (profile.grades.reduce((sum: any, g: any) => sum + g.score, 0) /
             profile.grades.length) *
             100,
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
rows={profile.enrollments.map((e: any) => [
             classLabel(e.class.name, e.class.section),
             e.class.academicYear.name,
           ])}
        />
      </Panel>
    </div>
  );
}
