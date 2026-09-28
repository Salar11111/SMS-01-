import { describe, expect, it } from "vitest";
import {
  attemptsIncrement,
  buildPopulate,
  mapGroupRows,
  mongoSort,
  normalizeWhere,
  orderSteps,
  present,
  sortInMemory,
  unwrapArgs,
} from "@/lib/db-query";

describe("db query helpers", () => {
  it("treats a raw filter and a query object differently", () => {
    expect(unwrapArgs({ email: "a@school.edu" }).where).toEqual({ email: "a@school.edu" });
    expect(unwrapArgs({ where: { userId: "u1" }, orderBy: { name: "asc" } })).toMatchObject({
      where: { userId: "u1" },
      orderBy: { name: "asc" },
    });
  });

  it("maps id and in to Mongo operators", () => {
    expect(normalizeWhere({ id: "abc", studentProfileId: { in: ["s1"] } })).toEqual({
      _id: "abc",
      studentProfileId: { $in: ["s1"] },
    });
  });

  it("builds nested populate, match filters, and field selects", () => {
    expect(
      buildPopulate({
        student: { user: true, attendance: { where: { classId: "c1" } } },
        studentProfile: { studentId: true },
      }),
    ).toEqual([
      {
        path: "student",
        populate: [
          { path: "user" },
          { path: "attendance", match: { classId: "c1" } },
        ],
      },
      { path: "studentProfile", select: "studentId" },
    ]);
  });

  it("sorts flat fields in Mongo and nested fields in memory", () => {
    expect(mongoSort([{ name: "asc" }, { section: "desc" }])).toEqual({ name: 1, section: -1 });
    expect(mongoSort({ student: { user: { name: "asc" } } })).toBeNull();
    expect(orderSteps({ assignment: { createdAt: "desc" } })).toEqual([
      { path: ["assignment", "createdAt"], dir: -1 },
    ]);

    const rows = sortInMemory(
      [{ student: { user: { name: "Bob" } } }, { student: { user: { name: "Ada" } } }],
      { student: { user: { name: "asc" } } },
    );
    expect(rows.map((row) => row.student.user.name)).toEqual(["Ada", "Bob"]);
  });

  it("exposes string ids and report group rows", () => {
    expect(present({ _id: "nanoid-1", name: "Grade 10" })).toMatchObject({ id: "nanoid-1" });
    expect(mapGroupRows([{ _id: { classId: "c1", status: "ABSENT" }, count: 2 }])).toEqual([
      { classId: "c1", status: "ABSENT", count: 2 },
    ]);
  });

  it("increments login attempts with a Mongo operator", () => {
    expect(attemptsIncrement()).toEqual({ $inc: { attempts: 1 } });
  });
});
