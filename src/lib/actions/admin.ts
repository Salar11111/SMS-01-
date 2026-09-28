"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/authz";
import { parseFormData, formDataToObject } from "@/lib/validation";
import { actionError, type ActionState } from "@/lib/action-result";
import type { AppRole } from "@/lib/rbac";
import {
  assignTeacherToClassSchema,
  changePasswordSchema,
  createAcademicYearSchema,
  createClassSchema,
  createSubjectSchema,
  createUserSchema,
  enrollStudentSchema,
  linkParentStudentSchema,
  setUserActiveSchema,
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
    await requireRole("ADMIN");
    const { name, email, role, password, studentId } = parseFormData(
      createUserSchema,
      formDataToObject(formData),
    );
    const existing = await db.user_findUnique({ email });
    if (existing) return { error: "An account with that email already exists." };

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user_create({ name, email, passwordHash, role, active: true });
    await ensureProfile(user.id, role, studentId);
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
    await db.user_update({ id: userId }, { name, role });
    await ensureProfile(userId, role);
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
    await db.user_update({ id: userId }, { active: active === "true" });
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
    if (!user) return { error: "Account not found." };
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) return { error: "Current password is incorrect." };
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user_update({ id: user.id }, { passwordHash });
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function createAcademicYear(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const { name } = parseFormData(createAcademicYearSchema, formDataToObject(formData));
    const year = await db.academicYear_create({ name, isActive: false });
    const yearId = String(year.id ?? year._id);
    await db.academicYear_updateMany({ isActive: true, _id: { $ne: yearId } }, { isActive: false });
    await db.academicYear_update({ id: yearId }, { isActive: true });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That academic year already exists.");
  }
}

export async function createClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const { name, section, academicYearId } = parseFormData(createClassSchema, formDataToObject(formData));
    await db.class_create({ name, section, academicYearId });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That class already exists for this year.");
  }
}

export async function createSubject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const { name } = parseFormData(createSubjectSchema, formDataToObject(formData));
    await db.subject_create({ name });
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error, "That subject already exists.");
  }
}

export async function assignTeacherToClass(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const { classId, subjectId, teacherProfileId } = parseFormData(
      assignTeacherToClassSchema,
      formDataToObject(formData),
    );
    await db.classSubject_upsert(
      { classId, subjectId },
      { classId, subjectId, teacherProfileId },
      { teacherProfileId },
    );
    revalidatePath("/admin/classes");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function enrollStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const { studentProfileId, classId } = parseFormData(enrollStudentSchema, formDataToObject(formData));
    await db.enrollment_upsert({ studentProfileId, classId }, { studentProfileId, classId }, {});
    revalidatePath("/admin/enrollment");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function linkParentStudent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const { parentId, studentId } = parseFormData(linkParentStudentSchema, formDataToObject(formData));
    await db.parentStudent_upsert({ parentId, studentId }, { parentId, studentId }, {});
    revalidatePath("/admin/enrollment");
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
