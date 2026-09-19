import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.grade.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@school.edu",
      name: "School Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: "teacher@school.edu",
      name: "Alice Teacher",
      role: "TEACHER",
      passwordHash,
      teacherProfile: { create: {} },
    },
    include: { teacherProfile: true },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: "student@school.edu",
      name: "Bob Student",
      role: "STUDENT",
      passwordHash,
      studentProfile: {
        create: { studentId: "STU-001" },
      },
    },
    include: { studentProfile: true },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@school.edu",
      name: "Carol Parent",
      role: "PARENT",
      passwordHash,
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: parentUser.id,
      studentId: studentUser.studentProfile!.id,
    },
  });

  const year = await prisma.academicYear.create({
    data: { name: "2025-2026", isActive: true },
  });

  const math = await prisma.subject.create({ data: { name: "Mathematics" } });
  const english = await prisma.subject.create({ data: { name: "English" } });
  const science = await prisma.subject.create({ data: { name: "Science" } });

  const class10A = await prisma.class.create({
    data: {
      name: "Grade 10",
      section: "A",
      academicYearId: year.id,
    },
  });

  await prisma.classSubject.createMany({
    data: [
      {
        classId: class10A.id,
        subjectId: math.id,
        teacherProfileId: teacherUser.teacherProfile!.id,
      },
      {
        classId: class10A.id,
        subjectId: english.id,
        teacherProfileId: teacherUser.teacherProfile!.id,
      },
      {
        classId: class10A.id,
        subjectId: science.id,
        teacherProfileId: teacherUser.teacherProfile!.id,
      },
    ],
  });

  await prisma.enrollment.create({
    data: {
      studentProfileId: studentUser.studentProfile!.id,
      classId: class10A.id,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.attendanceRecord.create({
    data: {
      studentProfileId: studentUser.studentProfile!.id,
      classId: class10A.id,
      date: today,
      status: "PRESENT",
      markedById: teacherUser.id,
    },
  });

  const assignment = await prisma.assignment.create({
    data: {
      title: "Algebra Quiz 1",
      classId: class10A.id,
      subjectId: math.id,
      maxScore: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.grade.create({
    data: {
      assignmentId: assignment.id,
      studentProfileId: studentUser.studentProfile!.id,
      score: 88,
    },
  });

  console.log("Seed complete.");
  console.log("Demo accounts (password: password123):");
  console.log("  admin@school.edu");
  console.log("  teacher@school.edu");
  console.log("  student@school.edu");
  console.log("  parent@school.edu");
  console.log(`Admin id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
