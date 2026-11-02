import { db } from "@/lib/prisma";
import { classLabel } from "@/lib/utils";

type Ended = { endedAt?: Date | string | null };

type YearShape = {
  id?: string;
  name?: string;
  isActive?: boolean;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
};

type WithYear = Ended & {
  class?: { academicYear?: YearShape | null } | null;
};

export const openEnrollmentFilter = { endedAt: null };

export function openEnrollments<T extends Ended>(rows: T[] | null | undefined): T[] {
  return (rows ?? []).filter((row) => row.endedAt == null);
}

export function activeAcademicYear<T extends WithYear>(rows: T[]) {
  return rows.find((row) => row.class?.academicYear?.isActive)?.class?.academicYear ?? null;
}

export function enrollmentsInYear<T extends WithYear>(rows: T[] | null | undefined, year: { id?: string } | null): T[] {
  const open = openEnrollments(rows);
  if (!year?.id) return open;
  return open.filter((row) => row.class?.academicYear?.id === year.id);
}

export type AttendanceBucket = {
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
};

export type AttendanceGroup = {
  classId?: unknown;
  status?: unknown;
  count?: unknown;
};

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function dateBounds(
  year: { startDate?: Date | string | null; endDate?: Date | string | null } | null | undefined,
): { gte?: Date; lte?: Date } | null {
  if (!year) return null;
  const range: { gte?: Date; lte?: Date } = {};
  if (year.startDate) {
    const start = new Date(year.startDate);
    if (!Number.isNaN(start.getTime())) range.gte = start;
  }
  if (year.endDate) {
    const end = new Date(year.endDate);
    if (!Number.isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
  }
  return range.gte || range.lte ? range : null;
}

export function summarizeAttendance(groups: AttendanceGroup[]): Map<string, AttendanceBucket> {
  const byClass = new Map<string, AttendanceBucket>();
  for (const group of groups) {
    const classId = String(group.classId ?? "");
    const entry = byClass.get(classId) ?? { total: 0, present: 0, late: 0, absent: 0, excused: 0 };
    const count = Number(group.count ?? 0);
    entry.total += count;
    if (group.status === "PRESENT") entry.present += count;
    if (group.status === "LATE") entry.late += count;
    if (group.status === "ABSENT") entry.absent += count;
    if (group.status === "EXCUSED") entry.excused += count;
    byClass.set(classId, entry);
  }
  return byClass;
}

export function percent(part: number, total: number): string {
  if (total === 0) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

export type ClassReportRow = {
  className: string;
  year: string;
  students: number;
  present: string;
  late: number;
  absent: number;
  excused: number;
  average: string;
};

export async function loadClassReport(yearId?: string) {
  const years = await db.academicYear_findMany({ orderBy: { name: "desc" } });
  const selected =
    years.find((year) => year.id === yearId) ?? years.find((year) => year.isActive) ?? years[0] ?? null;
  const classes = selected
    ? await db.class_findMany({
        where: { academicYearId: selected.id },
        populate: { academicYear: true },
        orderBy: { name: "asc" },
      })
    : [];
  const classIds = classes.map((klass) => klass.id);
  const bounds = dateBounds(selected);
  const attendanceWhere: Record<string, unknown> = { classId: { in: classIds } };
  if (bounds) attendanceWhere.date = bounds;
  const [groups, averages] =
    classIds.length === 0
      ? [[], []]
      : await Promise.all([
          db.attendanceRecord_groupBy({ by: ["classId", "status"], where: attendanceWhere }),
          db.grade_averageByClass({
            classIds,
            from: bounds?.gte,
            to: bounds?.lte,
          }),
        ]);

  const byClass = summarizeAttendance(groups);
  const averageByClass = new Map(averages.map((row) => [row.classId, row.average]));
  const totals = { enrollment: 0, present: 0, late: 0, absent: 0, excused: 0, attendance: 0 };
  for (const klass of classes) {
    totals.enrollment += klass._count?.enrollments ?? 0;
    const entry = byClass.get(klass.id);
    totals.attendance += entry?.total ?? 0;
    totals.present += entry?.present ?? 0;
    totals.late += entry?.late ?? 0;
    totals.absent += entry?.absent ?? 0;
    totals.excused += entry?.excused ?? 0;
  }

  const rows: ClassReportRow[] = classes.map((klass) => {
    const entry: AttendanceBucket = byClass.get(klass.id) ?? {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
    };
    const average = averageByClass.get(klass.id);
    return {
      className: classLabel(klass.name, klass.section),
      year: klass.academicYear?.name ?? selected?.name ?? "—",
      students: klass._count?.enrollments ?? 0,
      present: percent(entry.present, entry.total),
      late: entry.late,
      absent: entry.absent,
      excused: entry.excused,
      average: average == null ? "—" : `${Math.round(average)}%`,
    };
  });

  return { years, selected, totals, rows };
}

export function reportCsv(rows: ClassReportRow[]): string {
  const header = ["Class", "Year", "Students", "Present %", "Late", "Absent", "Excused", "Grade average"];
  const lines = rows.map((row) =>
    [row.className, row.year, row.students, row.present, row.late, row.absent, row.excused, row.average]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}
