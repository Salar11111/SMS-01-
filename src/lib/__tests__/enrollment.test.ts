import { describe, expect, it } from "vitest";
import { activeAcademicYear, enrollmentsInYear, openEnrollments } from "@/lib/school";

describe("enrollment history", () => {
  const rows = [
    {
      classId: "open",
      endedAt: null,
      class: { academicYear: { id: "year-1", isActive: true, name: "2026" } },
    },
    {
      classId: "closed",
      endedAt: new Date("2026-10-01T00:00:00.000Z"),
      class: { academicYear: { id: "year-1", isActive: true, name: "2026" } },
    },
    {
      classId: "old",
      endedAt: null,
      class: { academicYear: { id: "year-0", isActive: false, name: "2025" } },
    },
  ];

  it("drops ended enrollments and keeps a missing end date", () => {
    expect(openEnrollments(rows).map((row) => row.classId)).toEqual(["open", "old"]);
    expect(openEnrollments(undefined)).toEqual([]);
  });

  it("keeps the active year and leaves closed enrollments out of it", () => {
    const year = activeAcademicYear(openEnrollments(rows));
    expect(year?.id).toBe("year-1");
    expect(enrollmentsInYear(rows, year).map((row) => row.classId)).toEqual(["open"]);
  });
});
