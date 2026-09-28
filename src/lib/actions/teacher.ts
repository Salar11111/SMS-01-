"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacherProfile, assertTeacherOwnsClass, assertTeacherOwnsAssignment } from "@/lib/authz";
import { startOfDay } from "@/lib/utils";
import { parseFormData } from "@/lib/validation";
import { createAssignmentSchema, saveAttendanceSchema, saveGradesSchema } from "@/lib/schemas";

function statusEntries(formData: FormData): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("status_")) entries[key] = String(value);
  }
  return entries;
}

function scoreEntries(formData: FormData): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("score_")) entries[key] = String(value).trim();
  }
  return entries;
}

export async function saveAttendance(formData: FormData) {
  const { session, teacher } = await requireTeacherProfile();
  const parsed = parseFormData(saveAttendanceSchema, {
    classId: formData.get("classId"),
    date: formData.get("date"),
    statuses: statusEntries(formData),
  });

  await assertTeacherOwnsClass(teacher.id, parsed.classId);
  const date = startOfDay(parsed.date);

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: parsed.classId },
    select: { studentProfileId: true },
  });
  if (enrollments.length === 0) {
    revalidatePath(`/teacher/attendance/${parsed.classId}`);
    return;
  }

  const existing = await prisma.attendanceRecord.findMany({
    where: {
      classId: parsed.classId,
      date,
      studentProfileId: { in: enrollments.map((e) => e.studentProfileId) },
    },
    select: { studentProfileId: true },
  });
  const existingIds = new Set(existing.map((r) => r.studentProfileId));

  const statusOf = (studentProfileId: string) =>
    parsed.statuses[`status_${studentProfileId}`] ?? "PRESENT";

  const toCreate = enrollments
    .filter((e) => !existingIds.has(e.studentProfileId))
    .map((e) => ({
      studentProfileId: e.studentProfileId,
      classId: parsed.classId,
      date,
      status: statusOf(e.studentProfileId),
      markedById: session.user.id,
    }));

  await prisma.$transaction(async (tx) => {
    if (toCreate.length > 0) await tx.attendanceRecord.createMany({ data: toCreate });
    await Promise.all(
      enrollments
        .filter((e) => existingIds.has(e.studentProfileId))
        .map((e) =>
          tx.attendanceRecord.updateMany({
            where: {
              studentProfileId: e.studentProfileId,
              classId: parsed.classId,
              date,
            },
            data: { status: statusOf(e.studentProfileId), markedById: session.user.id },
          }),
        ),
    );
  });

  revalidatePath(`/teacher/attendance/${parsed.classId}`);
  revalidatePath("/teacher");
}

export async function createAssignment(formData: FormData) {
  const { teacher } = await requireTeacherProfile();
  const parsed = parseFormData(createAssignmentSchema, Object.fromEntries(formData));

  const link = await prisma.classSubject.findFirst({
    where: { teacherProfileId: teacher.id, classId: parsed.classId, subjectId: parsed.subjectId },
  });
  if (!link) throw new Error("Not assigned to this class/subject");

  await prisma.assignment.create({
    data: {
      title: parsed.title,
      classId: parsed.classId,
      subjectId: parsed.subjectId,
      maxScore: parsed.maxScore,
      dueDate: parsed.dueDate ?? null,
    },
  });

  revalidatePath("/teacher/grades");
  revalidatePath(`/teacher/grades/${parsed.classId}`);
}

export async function saveGrades(formData: FormData) {
  const { teacher } = await requireTeacherProfile();
  const parsed = parseFormData(saveGradesSchema, {
    assignmentId: formData.get("assignmentId"),
    scores: scoreEntries(formData),
  });

  const assignment = await assertTeacherOwnsAssignment(teacher.id, parsed.assignmentId);

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: assignment.classId },
    select: { studentProfileId: true },
  });

  const existing = await prisma.grade.findMany({
    where: {
      assignmentId: assignment.id,
      studentProfileId: { in: enrollments.map((e) => e.studentProfileId) },
    },
    select: { studentProfileId: true },
  });
  const existingIds = new Set(existing.map((g) => g.studentProfileId));

  const scores = enrollments
    .map((e) => ({ studentProfileId: e.studentProfileId, raw: parsed.scores[`score_${e.studentProfileId}`] }))
    .filter((s): s is { studentProfileId: string; raw: string } => Boolean(s.raw));

  const toCreate = scores
    .filter((s) => !existingIds.has(s.studentProfileId))
    .map((s) => {
      const score = Number(s.raw);
      if (score < 0 || score > assignment.maxScore) {
        throw new Error(`Score out of range (0–${assignment.maxScore})`);
      }
      return { assignmentId: assignment.id, studentProfileId: s.studentProfileId, score };
    });

  await prisma.$transaction(async (tx) => {
    if (toCreate.length > 0) await tx.grade.createMany({ data: toCreate });
    await Promise.all(
      scores
        .filter((s) => existingIds.has(s.studentProfileId))
        .map((s) => {
          const score = Number(s.raw);
          if (score < 0 || score > assignment.maxScore) {
            throw new Error(`Score out of range (0–${assignment.maxScore})`);
          }
          return tx.grade.updateMany({
            where: {
              assignmentId: assignment.id,
              studentProfileId: s.studentProfileId,
            },
            data: { score },
          });
        }),
    );
  });

  revalidatePath(`/teacher/grades/${assignment.classId}`);
  revalidatePath("/teacher/grades");
}