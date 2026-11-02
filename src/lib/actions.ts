"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  assertTeacherOwnsAssignment,
  assertTeacherOwnsClass,
  requireRole,
  requireTeacherProfile,
  requireUser,
  signOut,
} from "@/lib/auth";
import { db } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";
import { actionError, type ActionState } from "@/lib/action-result";
import type { ZodType } from "zod";
import type { AppRole } from "@/lib/rbac";

function parseFormData<T>(schema: ZodType<T>, input: Record<string, unknown>): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Invalid input");
  return result.data;
}

function formDataToObject(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData);
}

async function recordAudit(
  input:
    | { actorId: string; action: string; entity: string; entityId: string; before?: string; after?: string }
    | { actorId: string; action: string; entity: string; entityId: string; before?: string; after?: string }[],
) {
  const rows = (Array.isArray(input) ? input : [input]).map((row) => ({
    actorId: row.actorId,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    before: row.before ?? "",
    after: row.after ?? "",
  }));
  await db.audit_createMany(rows);
}
import {
  assignTeacherToClassSchema,
  changePasswordSchema,
  createAcademicYearSchema,
  createAssignmentSchema,
  createClassSchema,
  createSubjectSchema,
  createUserSchema,
  deleteAssignmentSchema,
  endEnrollmentSchema,
  enrollStudentSchema,
  linkParentStudentSchema,
  removeTeacherAssignmentSchema,
  saveAttendanceSchema,
  saveGradesSchema,
  setUserActiveSchema,
  updateAssignmentSchema,
  updateClassSchema,
  updateUserSchema,
} from "@/lib/schemas";

async function ensureProfile(userId: string, role: AppRole, studentId?: string) {
  if (role === "TEACHER") {
    const existing = await db.teacherProfile_findUnique({ userId });
    if (!existing) await db.teacherProfile_create({ userId });
  }
  if (role === "STUDENT") {
    const existing = await db.studentProfile_findUnique({ userId });
    if (!existing) {
      await db.studentProfile_create({
        userId,
        studentId: studentId || `STU-${Date.now()}`,
      });
    }
  }
}

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { name, email, role, password, studentId } = parseFormData(
      createUserSchema,
      formDataToObject(formData),
    );
    const existing = await db.user_findUnique({ email });
    if (existing) return { error: "An account with that email already exists." };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user_create({ name, email, passwordHash, role, active: true });
    await ensureProfile(user.id, role, studentId);
    await recordAudit({
      actorId: session.user.id,
      action: "user.create",
      entity: "User",
      entityId: user.id,
      after: `${role} ${email}`,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    return actionError(error, "An account with that email already exists.");
  }
}

export async function updateUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { userId, name, role } = parseFormData(updateUserSchema, formDataToObject(formData));
    if (userId === session.user.id && role !== "ADMIN") {
      return { error: "You cannot change your own role." };
    }
    const before = await db.user_findUnique({ id: userId });
    await db.user_update({ id: userId }, { name, role });
    await ensureProfile(userId, role);
    await recordAudit({
      actorId: session.user.id,
      action: "user.update",
      entity: "User",
      entityId: userId,
      before: before ? `${before.role} ${before.name}` : "",
      after: `${role} ${name}`,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function setUserActive(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { userId, active } = parseFormData(setUserActiveSchema, formDataToObject(formData));
    if (userId === session.user.id && active === "false") {
      return { error: "You cannot deactivate your own account." };
    }
    const before = await db.user_findUnique({ id: userId });
    await db.user_update({ id: userId }, { active: active === "true" });
    await recordAudit({
      actorId: session.user.id,
      action: active === "true" ? "user.activate" : "user.deactivate",
      entity: "User",
      entityId: userId,
      before: before?.active === false ? "inactive" : "active",
      after: active === "true" ? "active" : "inactive",
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireUser();
    const { currentPassword, newPassword } = parseFormData(changePasswordSchema, formDataToObject(formData));
    const user = await db.user_findUnique({ id: session.user.id });
    if (!user?.passwordHash) return { error: "Account not found." };
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) return { error: "Current password is incorrect." };
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user_update({ id: user.id }, { passwordHash });
    await recordAudit({
      actorId: session.user.id,
      action: "user.password",
      entity: "User",
      entityId: user.id,
    });
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createAcademicYear(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { name, startDate, endDate } = parseFormData(createAcademicYearSchema, formDataToObject(formData));
    const year = await db.academicYear_create({
      name,
      isActive: false,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
    });
    const yearId = String(year.id ?? year._id);
    // Two writes, not a transaction: deactivate every other year, then activate this one.
    await db.academicYear_updateMany({ isActive: true, _id: { $ne: yearId } }, { isActive: false });
    await db.academicYear_update({ id: yearId }, { isActive: true });
    await recordAudit({
      actorId: session.user.id,
      action: "year.activate",
      entity: "AcademicYear",
      entityId: yearId,
      after: name,
    });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That academic year already exists.");
  }
}

export async function createClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { name, section, academicYearId } = parseFormData(createClassSchema, formDataToObject(formData));
    const created = await db.class_create({ name, section, academicYearId });
    await recordAudit({
      actorId: session.user.id,
      action: "class.create",
      entity: "Class",
      entityId: created.id,
      after: `${name} ${section}`,
    });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That class already exists for this year.");
  }
}

export async function updateClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { classId, name, section } = parseFormData(updateClassSchema, formDataToObject(formData));
    const [before] = await db.class_findMany({ where: { id: classId }, limit: 1 });
    await db.class_update({ id: classId }, { name, section });
    await recordAudit({
      actorId: session.user.id,
      action: "class.rename",
      entity: "Class",
      entityId: classId,
      before: before ? `${before.name} ${before.section}` : "",
      after: `${name} ${section}`,
    });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That class already exists for this year.");
  }
}

export async function removeTeacherAssignment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { classSubjectId } = parseFormData(removeTeacherAssignmentSchema, formDataToObject(formData));
    const link = await db.classSubject_findFirst({ id: classSubjectId });
    await db.classSubject_delete({ id: classSubjectId });
    await recordAudit({
      actorId: session.user.id,
      action: "assignment.removeTeacher",
      entity: "ClassSubject",
      entityId: classSubjectId,
      before: link ? `${link.classId} ${link.subjectId}` : "",
    });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { name } = parseFormData(createSubjectSchema, formDataToObject(formData));
    const subject = await db.subject_create({ name });
    await recordAudit({
      actorId: session.user.id,
      action: "subject.create",
      entity: "Subject",
      entityId: subject.id,
      after: name,
    });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That subject already exists.");
  }
}

export async function assignTeacherToClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { classId, subjectId, teacherProfileId } = parseFormData(
      assignTeacherToClassSchema,
      formDataToObject(formData),
    );
    const previous = await db.classSubject_findFirst({ classId, subjectId });
    const link = await db.classSubject_upsert(
      { classId, subjectId },
      { classId, subjectId, teacherProfileId },
      { teacherProfileId },
    );
    await recordAudit({
      actorId: session.user.id,
      action: "assignment.assignTeacher",
      entity: "ClassSubject",
      entityId: link.id,
      before: previous?.teacherProfileId ?? "",
      after: teacherProfileId,
    });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function enrollStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { studentProfileId, classId } = parseFormData(enrollStudentSchema, formDataToObject(formData));
    const [existing] = await db.enrollment_findMany({ where: { studentProfileId, classId }, limit: 1 });
    const enrollment = await db.enrollment_upsert(
      { studentProfileId, classId },
      { studentProfileId, classId, endedAt: null },
      { endedAt: null },
    );
    if (!existing || existing.endedAt) {
      await recordAudit({
        actorId: session.user.id,
        action: existing?.endedAt ? "enrollment.reopen" : "enrollment.create",
        entity: "Enrollment",
        entityId: enrollment.id,
        after: classId,
      });
    }
    revalidatePath("/admin/enrollment");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function endEnrollment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { enrollmentId } = parseFormData(endEnrollmentSchema, formDataToObject(formData));
    const [enrollment] = await db.enrollment_findMany({ where: { id: enrollmentId }, limit: 1 });
    if (!enrollment) return { error: "Enrollment not found." };
    if (!enrollment.endedAt) {
      const endedAt = new Date();
      await db.enrollment_update({ id: enrollmentId }, { endedAt });
      await recordAudit({
        actorId: session.user.id,
        action: "enrollment.end",
        entity: "Enrollment",
        entityId: enrollmentId,
        after: endedAt.toISOString(),
      });
    }
    revalidatePath("/admin/enrollment");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function linkParentStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await requireRole("ADMIN");
    const { parentId, studentId } = parseFormData(linkParentStudentSchema, formDataToObject(formData));
    const link = await db.parentStudent_upsert({ parentId, studentId }, { parentId, studentId }, {});
    await recordAudit({
      actorId: session.user.id,
      action: "parent.link",
      entity: "ParentStudent",
      entityId: link.id,
      after: studentId,
    });
    revalidatePath("/admin/enrollment");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

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

export async function saveAttendance(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const { session, teacher } = await requireTeacherProfile();
  const parsed = parseFormData(saveAttendanceSchema, {
    classId: formData.get("classId"),
    date: formData.get("date"),
    statuses: statusEntries(formData),
  });

  await assertTeacherOwnsClass(teacher.id, parsed.classId);
  const date = startOfDay(parsed.date);

  const enrollments = await db.enrollment_findMany({
    where: { classId: parsed.classId, endedAt: null },
    select: ["studentProfileId"],
  });
  if (enrollments.length === 0) {
    revalidatePath(`/teacher/attendance/${parsed.classId}`);
    return { ok: true };
  }

  const existing = await db.attendanceRecord_findMany({
    where: { classId: parsed.classId, date, studentProfileId: { in: enrollments.map((e) => e.studentProfileId) } },
    select: ["id", "studentProfileId", "status"],
  });
  const previous = new Map(existing.map((record) => [record.studentProfileId, record]));
  const statusOf = (studentProfileId: string) => parsed.statuses[`status_${studentProfileId}`] ?? "PRESENT";
  const rows = enrollments.map((enrollment) => ({
    studentProfileId: enrollment.studentProfileId,
    classId: parsed.classId,
    date,
    status: statusOf(enrollment.studentProfileId),
    markedById: session.user.id,
  }));
  await db.attendanceRecord_bulkUpsert(rows);
  await recordAudit(
    rows.flatMap((row) => {
      const prior = previous.get(row.studentProfileId);
      if (prior && prior.status === row.status) return [];
      return [
        {
          actorId: session.user.id,
          action: prior ? "attendance.update" : "attendance.create",
          entity: "AttendanceRecord",
          entityId: prior?.id || `${row.classId}:${row.studentProfileId}`,
          before: prior?.status ?? "",
          after: row.status,
        },
      ];
    }),
  );

  revalidatePath(`/teacher/attendance/${parsed.classId}`);
  revalidatePath("/teacher");
  return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createAssignment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const { teacher } = await requireTeacherProfile();
  const parsed = parseFormData(createAssignmentSchema, Object.fromEntries(formData));

  const link = await db.classSubject_findFirst({
    teacherProfileId: teacher.id,
    classId: parsed.classId,
    subjectId: parsed.subjectId,
  });
  if (!link) throw new Error("Not assigned to this class/subject");

  await db.assignment_create({
    title: parsed.title,
    classId: parsed.classId,
    subjectId: parsed.subjectId,
    maxScore: parsed.maxScore,
    dueDate: parsed.dueDate ?? null,
  });

  revalidatePath("/teacher/grades");
  revalidatePath(`/teacher/grades/${parsed.classId}`);
  return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateAssignment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { teacher, session } = await requireTeacherProfile();
    const parsed = parseFormData(updateAssignmentSchema, Object.fromEntries(formData));
    const assignment = await assertTeacherOwnsAssignment(teacher.id, parsed.assignmentId);
    await db.assignment_update(
      { id: assignment.id },
      { title: parsed.title, maxScore: parsed.maxScore, dueDate: parsed.dueDate ?? null },
    );
    await recordAudit({
      actorId: session.user.id,
      action: "assignment.update",
      entity: "Assignment",
      entityId: assignment.id,
      before: assignment.title,
      after: parsed.title,
    });
    revalidatePath(`/teacher/grades/${assignment.classId}`);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteAssignment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { teacher, session } = await requireTeacherProfile();
    const parsed = parseFormData(deleteAssignmentSchema, Object.fromEntries(formData));
    const assignment = await assertTeacherOwnsAssignment(teacher.id, parsed.assignmentId);
    await db.grade_deleteMany({ assignmentId: assignment.id });
    await db.assignment_delete({ id: assignment.id });
    await recordAudit({
      actorId: session.user.id,
      action: "assignment.delete",
      entity: "Assignment",
      entityId: assignment.id,
      before: assignment.title,
    });
    revalidatePath(`/teacher/grades/${assignment.classId}`);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveGrades(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
  const { session, teacher } = await requireTeacherProfile();
  const parsed = parseFormData(saveGradesSchema, {
    assignmentId: formData.get("assignmentId"),
    scores: scoreEntries(formData),
  });

  const assignment = await assertTeacherOwnsAssignment(teacher.id, parsed.assignmentId);

  const enrollments = await db.enrollment_findMany({
    where: { classId: assignment.classId, endedAt: null },
    select: ["studentProfileId"],
  });

  const existing = await db.grade_findMany({
    where: { assignmentId: assignment.id, studentProfileId: { in: enrollments.map((e) => e.studentProfileId) } },
    select: ["id", "studentProfileId", "score"],
  });
  const previous = new Map(existing.map((grade) => [grade.studentProfileId, grade]));

  const rows = enrollments
    .map((enrollment) => ({
      studentProfileId: enrollment.studentProfileId,
      raw: parsed.scores[`score_${enrollment.studentProfileId}`],
    }))
    .filter((row) => Boolean(row.raw))
    .map((row) => {
      const score = Number(row.raw);
      if (score < 0 || score > assignment.maxScore) {
        throw new Error(`Score out of range (0–${assignment.maxScore})`);
      }
      return { studentProfileId: row.studentProfileId, score };
    });

  await db.grade_bulkUpsert(
    rows.map((row) => ({
      assignmentId: assignment.id,
      studentProfileId: row.studentProfileId,
      score: row.score,
    })),
  );
  await recordAudit(
    rows.flatMap((row) => {
      const prior = previous.get(row.studentProfileId);
      if (prior && prior.score === row.score) return [];
      return [
        {
          actorId: session.user.id,
          action: prior ? "grade.update" : "grade.create",
          entity: "Grade",
          entityId: prior?.id || `${assignment.id}:${row.studentProfileId}`,
          before: prior ? String(prior.score) : "",
          after: String(row.score),
        },
      ];
    }),
  );

  revalidatePath(`/teacher/grades/${assignment.classId}`);
  revalidatePath("/teacher/grades");
  return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
