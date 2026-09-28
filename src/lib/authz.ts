import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { ROLE_HOME, type AppRole } from "@/lib/rbac";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session;
}

export async function requireRole(...roles: AppRole[]) {
  const session = await requireUser();
  if (!roles.includes(session.user.role)) throw new ForbiddenError();
  return session;
}

export async function requirePageRole(role: AppRole) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== role) redirect(ROLE_HOME[session.user.role]);
  return session;
}

export async function requireTeacherProfile() {
  const session = await requireRole("TEACHER");
  const teacher = await db.teacherProfile_findUnique({ userId: session.user.id });
  if (!teacher) throw new Error("Teacher profile missing");
  return { session, teacher };
}

export async function assertTeacherOwnsClass(teacherProfileId: string, classId: string) {
  const link = await db.classSubject_findFirst({ teacherProfileId, classId });
  if (!link) throw new Error("Not assigned to this class");
  return link;
}

export async function assertTeacherOwnsAssignment(teacherProfileId: string, assignmentId: string) {
  const assignment = await db.assignment_findUnique({ id: assignmentId });
  if (!assignment) throw new Error("Assignment not found");
  await assertTeacherOwnsClass(teacherProfileId, assignment.classId);
  return assignment;
}
