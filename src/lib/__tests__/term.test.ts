import { describe, expect, it } from "vitest";
import { dateBounds, percent, summarizeAttendance } from "@/lib/school";

describe("term attendance summary", () => {
  it("keeps excused marks out of present and absent", () => {
    const summary = summarizeAttendance([
      { classId: "c1", status: "PRESENT", count: 8 },
      { classId: "c1", status: "LATE", count: 1 },
      { classId: "c1", status: "ABSENT", count: 2 },
      { classId: "c1", status: "EXCUSED", count: 3 },
    ]);
    expect(summary.get("c1")).toEqual({
      total: 14,
      present: 8,
      late: 1,
      absent: 2,
      excused: 3,
    });
    expect(percent(8, 14)).toBe("57%");
  });

  it("builds an inclusive date window from a year", () => {
    const bounds = dateBounds({
      startDate: "2026-08-01",
      endDate: "2027-06-15",
    });
    expect(bounds?.gte?.toISOString().slice(0, 10)).toBe("2026-08-01");
    expect(bounds?.lte?.getHours()).toBe(23);
  });
});
