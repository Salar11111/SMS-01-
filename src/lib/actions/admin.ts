"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
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

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash,
      ...(role === "TEACHER" ? { teacherProfile: { create: {} } } : {}),
      ...(role === "STUDENT"
        ? {
            studentProfile: {
              create: { studentId: studentId || `STU-${Date.now()}` },
            },
          }
        : {}),
    },
  });

  revalidatePath("/admin/users");
}

export async function createAcademicYear(formData: FormData) {
  await requireRole("ADMIN");
  const { name } = parseFormData(createAcademicYearSchema, formDataToObject(formData));

  await prisma.$transaction([
    prisma.academicYear.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.academicYear.create({ data: { name, isActive: true } }),
  ]);
  revalidatePath("/admin/classes");
}

export async function createClass(formData: FormData) {
  await requireRole("ADMIN");
  const { name, section, academicYearId } = parseFormData(createClassSchema, formDataToObject(formData));
  await prisma.class.create({ data: { name, section, academicYearId } });
  revalidatePath("/admin/classes");
}

export async function createSubject(formData: FormData) {
  await requireRole("ADMIN");
  const { name } = parseFormData(createSubjectSchema, formDataToObject(formData));
  await prisma.subject.create({ data: { name } });
  revalidatePath("/admin/classes");
}

export async function assignTeacherToClass(formData: FormData) {
  await requireRole("ADMIN");
  const { classId, subjectId, teacherProfileId } = parseFormData(assignTeacherToClassSchema, formDataToObject(formData));

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId, subjectId } },
    create: { classId, subjectId, teacherProfileId },
    update: { teacherProfileId },
  });
  revalidatePath("/admin/classes");
}

export async function enrollStudent(formData: FormData) {
  await requireRole("ADMIN");
  const { studentProfileId, classId } = parseFormData(enrollStudentSchema, formDataToObject(formData));

  await prisma.enrollment.upsert({
    where: {
      studentProfileId_classId: { studentProfileId, classId },
    },
    create: { studentProfileId, classId },
    update: {},
  });
  revalidatePath("/admin/enrollment");
}

export async function linkParentStudent(formData: FormData) {
  await requireRole("ADMIN");
  const { parentId, studentId } = parseFormData(linkParentStudentSchema, formDataToObject(formData));

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId, studentId } },
    create: { parentId, studentId },
    update: {},
  });
  revalidatePath("/admin/enrollment");
}