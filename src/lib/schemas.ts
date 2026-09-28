import { z } from "zod";
import { APP_ROLES } from "@/lib/rbac";

export const RoleSchema = z.enum(APP_ROLES);
export type { AppRole } from "@/lib/rbac";

export const AttendanceStatusSchema = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

export const emptyOptionalDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.date().optional(),
);

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.email("A valid email is required").trim().toLowerCase(),
  role: RoleSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  studentId: z.string().trim().optional(),
});

export const createAcademicYearSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const createClassSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  section: z.string().trim().min(1, "Section is required"),
  academicYearId: z.string().min(1),
});

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const assignTeacherToClassSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherProfileId: z.string().min(1),
});

export const enrollStudentSchema = z.object({
  studentProfileId: z.string().min(1),
  classId: z.string().min(1),
});

export const linkParentStudentSchema = z.object({
  parentId: z.string().min(1),
  studentId: z.string().min(1),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  role: RoleSchema,
});

export const setUserActiveSchema = z.object({
  userId: z.string().min(1),
  active: z.enum(["true", "false"]),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const saveAttendanceSchema = z.object({
  classId: z.string().min(1),
  date: z.coerce.date(),
  statuses: z.record(z.string(), AttendanceStatusSchema),
});

export const createAssignmentSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  maxScore: z.coerce.number().positive("Max score must be positive"),
  dueDate: emptyOptionalDate,
});

export const saveGradesSchema = z.object({
  assignmentId: z.string().min(1),
  scores: z.record(
    z.string(),
    z.string().trim().regex(/^\d+(\.\d+)?$/, "Score must be a number"),
  ),
});