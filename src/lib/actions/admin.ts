"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { parseFormData, formDataToObject } from "@/lib/validation";
import {
  assignTeacherToClassSchema,
  createAcademicYearSchema,
  createClassSchema,
  createSubjectSchema,
  createUserSchema,
  enrollStudentSchema,
  linkParentStudentSchema,
} from "@/lib/schemas";

export async function createUser(formData: FormData) {
  await requireRole("ADMIN");
  const { name, email, role, password, studentId } = parseFormData(createUserSchema, formDataToObject(formData));

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user_create({
    name,
    email,
    passwordHash,
    role,
    ...(role === "TEACHER" ? { teacherProfile: {} } : {}),
    ...(role === "STUDENT"
      ? { studentProfile: { studentId: studentId || `STU-${Date.now()}` } }
      : {}),
  });

  revalidatePath("/admin/users");
}

export async function createAcademicYear(formData: FormData) {
  await requireRole("ADMIN");
  const { name } = parseFormData(createAcademicYearSchema, formDataToObject(formData));

  await db.$transaction(async (tx) => {
    await db.academicYear_updateMany({ isActive: true }, { isActive: false });
    await db.academicYear_create({ name, isActive: true });
  });
  revalidatePath("/admin/classes");
}

export async function createClass(formData: FormData) {
  await requireRole("ADMIN");
  const { name, section, academicYearId } = parseFormData(createClassSchema, formDataToObject(formData));
  await db.class_create({ name, section, academicYearId });
  revalidatePath("/admin/classes");
}

export async function createSubject(formData: FormData) {
  await requireRole("ADMIN");
  const { name } = parseFormData(createSubjectSchema, formDataToObject(formData));
  await db.subject_create({ name });
  revalidatePath("/admin/classes");
}

export async function assignTeacherToClass(formData: FormData) {
  await requireRole("ADMIN");
  const { classId, subjectId, teacherProfileId } = parseFormData(assignTeacherToClassSchema, formDataToObject(formData));

  await db.classSubject_upsert(
    { classId, subjectId },
    { classId, subjectId, teacherProfileId },
    { teacherProfileId }
  );
  revalidatePath("/admin/classes");
}

export async function enrollStudent(formData: FormData) {
  await requireRole("ADMIN");
  const { studentProfileId, classId } = parseFormData(enrollStudentSchema, formDataToObject(formData));

  await db.enrollment_upsert(
    { studentProfileId, classId },
    { studentProfileId, classId },
    {}
  );
  revalidatePath("/admin/enrollment");
}

export async function linkParentStudent(formData: FormData) {
  await requireRole("ADMIN");
  const { parentId, studentId } = parseFormData(linkParentStudentSchema, formDataToObject(formData));

  await db.parentStudent_upsert(
    { parentId, studentId },
    { parentId, studentId },
    {}
  );
  revalidatePath("/admin/enrollment");
}
