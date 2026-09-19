"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

async function requireTeacher() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) throw new Error("Teacher profile missing");
  return { session, teacher };
}

async function assertTeacherOwnsClass(teacherProfileId: string, classId: string) {
  const link = await prisma.classSubject.findFirst({
    where: { teacherProfileId, classId },
  });
  if (!link) throw new Error("Not assigned to this class");
  return link;
}

export async function saveAttendance(formData: FormData) {
  const { session, teacher } = await requireTeacher();
  const classId = String(formData.get("classId") || "");
  const dateStr = String(formData.get("date") || "");
  if (!classId || !dateStr) throw new Error("Missing fields");

  await assertTeacherOwnsClass(teacher.id, classId);
  const date = startOfDay(new Date(dateStr));

  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    select: { studentProfileId: true },
  });

  for (const e of enrollments) {
    const status = String(formData.get(`status_${e.studentProfileId}`) || "PRESENT");
    await prisma.attendanceRecord.upsert({
      where: {
        studentProfileId_classId_date: {
          studentProfileId: e.studentProfileId,
          classId,
          date,
        },
      },
      create: {
        studentProfileId: e.studentProfileId,
        classId,
        date,
        status,
        markedById: session.user.id,
      },
      update: {
        status,
        markedById: session.user.id,
      },
    });
  }

  revalidatePath(`/teacher/attendance/${classId}`);
  revalidatePath("/teacher");
}

export async function createAssignment(formData: FormData) {
  const { teacher } = await requireTeacher();
  const classId = String(formData.get("classId") || "");
  const subjectId = String(formData.get("subjectId") || "");
  const title = String(formData.get("title") || "").trim();
  const maxScore = Number(formData.get("maxScore") || 100);
  const dueDateRaw = String(formData.get("dueDate") || "");

  if (!classId || !subjectId || !title) throw new Error("Missing fields");

  const link = await prisma.classSubject.findFirst({
    where: { teacherProfileId: teacher.id, classId, subjectId },
  });
  if (!link) throw new Error("Not assigned to this class/subject");

  await prisma.assignment.create({
    data: {
      title,
      classId,
      subjectId,
      maxScore,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    },
  });

  revalidatePath("/teacher/grades");
  revalidatePath(`/teacher/grades/${classId}`);
}

export async function saveGrades(formData: FormData) {
  const { teacher } = await requireTeacher();
  const assignmentId = String(formData.get("assignmentId") || "");
  if (!assignmentId) throw new Error("Missing assignment");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) throw new Error("Assignment not found");

  await assertTeacherOwnsClass(teacher.id, assignment.classId);

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: assignment.classId },
    select: { studentProfileId: true },
  });

  for (const e of enrollments) {
    const raw = formData.get(`score_${e.studentProfileId}`);
    if (raw === null || String(raw).trim() === "") continue;
    const score = Number(raw);
    if (Number.isNaN(score)) continue;

    await prisma.grade.upsert({
      where: {
        assignmentId_studentProfileId: {
          assignmentId,
          studentProfileId: e.studentProfileId,
        },
      },
      create: {
        assignmentId,
        studentProfileId: e.studentProfileId,
        score,
      },
      update: { score },
    });
  }

  revalidatePath(`/teacher/grades/${assignment.classId}`);
  revalidatePath("/teacher/grades");
}
