import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.unmock("@/lib/prisma");

import { disconnectDB } from "@/lib/db-connect";
import { db } from "@/lib/prisma";

const enabled = process.env.MONGO_INTEGRATION === "1" && Boolean(process.env.MONGODB_URI);

describe.skipIf(!enabled)("enrollment history on Mongo", () => {
  beforeAll(async () => {
    await disconnectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it("keeps marks after an enrollment ends and hides that student from the open roster", async () => {
    const year = await db.academicYear_create({ name: `Year ${Date.now()}`, isActive: false });
    const klass = await db.class_create({ name: "Grade 11", section: "B", academicYearId: year.id });
    const user = await db.user_create({
      email: `ada-${Date.now()}@school.edu`,
      name: "Ada",
      role: "STUDENT",
      passwordHash: "hash",
      active: true,
    });
    const student = await db.studentProfile_create({ userId: user.id, studentId: `STU-${Date.now()}` });
    const enrollment = await db.enrollment_upsert(
      { studentProfileId: student.id, classId: klass.id },
      { studentProfileId: student.id, classId: klass.id, endedAt: null },
      { endedAt: null },
    );

    await db.attendanceRecord_bulkUpsert([
      {
        studentProfileId: student.id,
        classId: klass.id,
        date: new Date("2026-10-01T00:00:00.000Z"),
        status: "PRESENT",
        markedById: user.id,
      },
    ]);
    await db.enrollment_update({ id: enrollment.id }, { endedAt: new Date("2026-10-29T00:00:00.000Z") });
    await db.audit_createMany([
      {
        actorId: user.id,
        action: "enrollment.end",
        entity: "Enrollment",
        entityId: enrollment.id,
        before: "",
        after: "2026-10-29",
      },
    ]);

    const open = await db.enrollment_findMany({ where: { classId: klass.id, endedAt: null } });
    const history = await db.enrollment_findMany({ where: { classId: klass.id } });
    const marks = await db.attendanceRecord_findMany({ where: { classId: klass.id } });
    const audits = await db.audit_findMany({ where: { entityId: enrollment.id }, limit: 10 });

    expect(open).toHaveLength(0);
    expect(history).toHaveLength(1);
    expect(history[0]?.endedAt).toBeTruthy();
    expect(marks).toHaveLength(1);
    expect(marks[0]?.status).toBe("PRESENT");
    expect(audits[0]?.action).toBe("enrollment.end");
  });
});
