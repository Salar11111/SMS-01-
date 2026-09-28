import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.unmock("@/lib/prisma");

vi.mock("@/lib/db-connect", () => ({
  connectDB: vi.fn(async () => ({})),
}));

import { connectDB } from "@/lib/db-connect";
import { attemptsIncrement } from "@/lib/db-query";
import { db } from "@/lib/prisma";
import { AttendanceRecord, Grade, LoginAttempt, StudentProfile, User } from "@/lib/models";

describe("data layer", () => {
  beforeEach(() => {
    vi.mocked(connectDB).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("connects before reading", async () => {
    vi.spyOn(User, "countDocuments").mockReturnValue({ exec: async () => 0 } as never);
    await db.user_count();
    expect(connectDB).toHaveBeenCalled();
  });

  it("creates a student profile as its own insert", async () => {
    vi.spyOn(StudentProfile, "create").mockResolvedValue({ _id: "student-profile" } as never);
    await db.studentProfile_create({ userId: "user-1", studentId: "STU-9" });
    expect(StudentProfile.create).toHaveBeenCalledWith({ userId: "user-1", studentId: "STU-9" });
  });

  it("passes a filter and an update when saving attendance", async () => {
    const date = new Date("2026-09-28T00:00:00.000Z");
    vi.spyOn(AttendanceRecord, "updateMany").mockReturnValue({ exec: async () => ({}) } as never);
    await db.attendanceRecord_updateMany(
      { studentProfileId: "student-1", classId: "class-1", date },
      { status: "LATE", markedById: "teacher-1" },
    );
    expect(AttendanceRecord.updateMany).toHaveBeenCalledWith(
      { studentProfileId: "student-1", classId: "class-1", date },
      { status: "LATE", markedById: "teacher-1" },
    );
  });

  it("passes a filter and an update when saving a grade", async () => {
    vi.spyOn(Grade, "updateMany").mockReturnValue({ exec: async () => ({}) } as never);
    await db.grade_updateMany(
      { assignmentId: "assignment-1", studentProfileId: "student-1" },
      { score: 91 },
    );
    expect(Grade.updateMany).toHaveBeenCalledWith(
      { assignmentId: "assignment-1", studentProfileId: "student-1" },
      { score: 91 },
    );
  });

  it("increments login attempts with $inc", async () => {
    vi.spyOn(LoginAttempt, "findOneAndUpdate").mockReturnValue({
      lean: async () => ({ _id: "attempt-1", key: "student@school.edu", attempts: 2, lockedAt: null }),
    } as never);
    await db.loginAttempt_upsert(
      { key: "student@school.edu" },
      { key: "student@school.edu", attempts: 1 },
      attemptsIncrement(),
    );
    expect(LoginAttempt.findOneAndUpdate).toHaveBeenCalledWith(
      { key: "student@school.edu" },
      expect.objectContaining({
        $inc: { attempts: 1 },
        $setOnInsert: expect.objectContaining({ key: "student@school.edu" }),
      }),
      { new: true, upsert: true },
    );
  });
});
