"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/lib/rbac";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "") as AppRole;
  const password = String(formData.get("password") || "");
  const studentId = String(formData.get("studentId") || "").trim();

  if (!name || !email || !password || !role) {
    throw new Error("Missing required fields");
  }

  const passwordHash = await bcrypt.hash(password, 10);

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
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name required");
  await prisma.academicYear.create({ data: { name, isActive: true } });
  revalidatePath("/admin/classes");
}

export async function createClass(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const section = String(formData.get("section") || "").trim();
  const academicYearId = String(formData.get("academicYearId") || "");
  if (!name || !section || !academicYearId) throw new Error("Missing fields");
  await prisma.class.create({ data: { name, section, academicYearId } });
  revalidatePath("/admin/classes");
}

export async function createSubject(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name required");
  await prisma.subject.create({ data: { name } });
  revalidatePath("/admin/classes");
}

export async function assignTeacherToClass(formData: FormData) {
  await requireAdmin();
  const classId = String(formData.get("classId") || "");
  const subjectId = String(formData.get("subjectId") || "");
  const teacherProfileId = String(formData.get("teacherProfileId") || "");
  if (!classId || !subjectId || !teacherProfileId) throw new Error("Missing fields");

  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId, subjectId } },
    create: { classId, subjectId, teacherProfileId },
    update: { teacherProfileId },
  });
  revalidatePath("/admin/classes");
}

export async function enrollStudent(formData: FormData) {
  await requireAdmin();
  const studentProfileId = String(formData.get("studentProfileId") || "");
  const classId = String(formData.get("classId") || "");
  if (!studentProfileId || !classId) throw new Error("Missing fields");

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
  await requireAdmin();
  const parentId = String(formData.get("parentId") || "");
  const studentId = String(formData.get("studentId") || "");
  if (!parentId || !studentId) throw new Error("Missing fields");

  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId, studentId } },
    create: { parentId, studentId },
    update: {},
  });
  revalidatePath("/admin/enrollment");
}
