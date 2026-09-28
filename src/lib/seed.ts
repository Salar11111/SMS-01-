import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

const passwordHash = await bcrypt.hash("password123", 12);

const admin = await db.user_create({
  email: "admin@school.edu",
  name: "School Admin",
  role: "ADMIN",
  passwordHash,
});

const teacherUser = await db.user_create({
  email: "teacher@school.edu",
  name: "Alice Teacher",
  role: "TEACHER",
  passwordHash,
});
const teacherProfile = await db.teacherProfile_create({ userId: teacherUser.id });

const studentUser = await db.user_create({
  email: "student@school.edu",
  name: "Bob Student",
  role: "STUDENT",
  passwordHash,
});
const studentProfile = await db.studentProfile_create({
  userId: studentUser.id,
  studentId: "STU-001",
});

const parentUser = await db.user_create({
  email: "parent@school.edu",
  name: "Carol Parent",
  role: "PARENT",
  passwordHash,
});

const year = await db.academicYear_create({ name: "2025-2026", isActive: true });
const math = await db.subject_create({ name: "Mathematics" });
const english = await db.subject_create({ name: "English" });
const science = await db.subject_create({ name: "Science" });

const class10A = await db.class_create({ name: "Grade 10", section: "A", academicYearId: year.id });

await db.classSubject_upsert({ classId: class10A.id, subjectId: math.id }, { classId: class10A.id, subjectId: math.id, teacherProfileId: teacherProfile.id }, {});
await db.classSubject_upsert({ classId: class10A.id, subjectId: english.id }, { classId: class10A.id, subjectId: english.id, teacherProfileId: teacherProfile.id }, {});
await db.classSubject_upsert({ classId: class10A.id, subjectId: science.id }, { classId: class10A.id, subjectId: science.id, teacherProfileId: teacherProfile.id }, {});

await db.enrollment_upsert({ studentProfileId: studentProfile.id, classId: class10A.id }, { studentProfileId: studentProfile.id, classId: class10A.id }, {});

const today = startOfDay();
await db.attendanceRecord_createMany([
  { studentProfileId: studentProfile.id, classId: class10A.id, date: today, status: "PRESENT", markedById: teacherUser.id },
]);

const assignment = await db.assignment_create({
  title: "Algebra Quiz 1",
  classId: class10A.id,
  subjectId: math.id,
  maxScore: 100,
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});
await db.grade_create({ assignmentId: assignment.id, studentProfileId: studentProfile.id, score: 88 });

const parentStudent = await db.parentStudent_upsert({ parentId: parentUser.id, studentId: studentProfile.id }, { parentId: parentUser.id, studentId: studentProfile.id }, {});

console.log("Seed complete.");
