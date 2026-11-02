import { defineModel } from "@/lib/define-model";

export const User = defineModel(
  "User",
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  {
    virtuals: [
      { name: "studentProfile", ref: "StudentProfile", localField: "_id", foreignField: "userId", justOne: true },
      { name: "teacherProfile", ref: "TeacherProfile", localField: "_id", foreignField: "userId", justOne: true },
    ],
  },
);

export const StudentProfile = defineModel(
  "StudentProfile",
  {
    userId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
  },
  {
    virtuals: [
      { name: "user", ref: "User", localField: "userId", foreignField: "_id", justOne: true },
      { name: "enrollments", ref: "Enrollment", localField: "_id", foreignField: "studentProfileId" },
      { name: "attendance", ref: "AttendanceRecord", localField: "_id", foreignField: "studentProfileId" },
      { name: "grades", ref: "Grade", localField: "_id", foreignField: "studentProfileId" },
    ],
  },
);

export const TeacherProfile = defineModel(
  "TeacherProfile",
  { userId: { type: String, required: true, unique: true } },
  {
    virtuals: [
      { name: "user", ref: "User", localField: "userId", foreignField: "_id", justOne: true },
      { name: "classSubjects", ref: "ClassSubject", localField: "_id", foreignField: "teacherProfileId" },
    ],
  },
);

export const ParentStudent = defineModel(
  "ParentStudent",
  {
    parentId: { type: String, required: true },
    studentId: { type: String, required: true },
  },
  {
    indexes: [{ fields: { parentId: 1, studentId: 1 }, unique: true }, { fields: { studentId: 1 } }],
    virtuals: [
      { name: "parent", ref: "User", localField: "parentId", foreignField: "_id", justOne: true },
      { name: "student", ref: "StudentProfile", localField: "studentId", foreignField: "_id", justOne: true },
    ],
  },
);

export const AcademicYear = defineModel("AcademicYear", {
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
});

export const Class = defineModel(
  "Class",
  {
    name: { type: String, required: true },
    section: { type: String, required: true },
    academicYearId: { type: String, required: true },
  },
  {
    indexes: [{ fields: { name: 1, section: 1, academicYearId: 1 }, unique: true }],
    virtuals: [
      { name: "academicYear", ref: "AcademicYear", localField: "academicYearId", foreignField: "_id", justOne: true },
    ],
  },
);

export const Subject = defineModel("Subject", {
  name: { type: String, required: true, unique: true },
});

export const ClassSubject = defineModel(
  "ClassSubject",
  {
    classId: { type: String, required: true },
    subjectId: { type: String, required: true },
    teacherProfileId: { type: String, required: true },
  },
  {
    indexes: [{ fields: { classId: 1, subjectId: 1 }, unique: true }],
    virtuals: [
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
      { name: "subject", ref: "Subject", localField: "subjectId", foreignField: "_id", justOne: true },
      { name: "teacher", ref: "TeacherProfile", localField: "teacherProfileId", foreignField: "_id", justOne: true },
    ],
  },
);

export const Enrollment = defineModel(
  "Enrollment",
  {
    studentProfileId: { type: String, required: true },
    classId: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  {
    indexes: [
      { fields: { studentProfileId: 1, classId: 1 }, unique: true },
      { fields: { classId: 1, endedAt: 1 } },
    ],
    virtuals: [
      { name: "student", ref: "StudentProfile", localField: "studentProfileId", foreignField: "_id", justOne: true },
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
    ],
  },
);

export const AttendanceRecord = defineModel(
  "AttendanceRecord",
  {
    studentProfileId: { type: String, required: true },
    classId: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true },
    markedById: { type: String, required: true },
  },
  {
    indexes: [
      { fields: { studentProfileId: 1, classId: 1, date: 1 }, unique: true },
      { fields: { classId: 1, date: 1 } },
      { fields: { studentProfileId: 1 } },
    ],
    virtuals: [
      { name: "student", ref: "StudentProfile", localField: "studentProfileId", foreignField: "_id", justOne: true },
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
    ],
  },
);

export const Assignment = defineModel(
  "Assignment",
  {
    title: { type: String, required: true },
    classId: { type: String, required: true },
    subjectId: { type: String, required: true },
    maxScore: { type: Number, required: true },
    dueDate: { type: Date, default: null },
  },
  {
    virtuals: [
      { name: "subject", ref: "Subject", localField: "subjectId", foreignField: "_id", justOne: true },
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
      { name: "grades", ref: "Grade", localField: "_id", foreignField: "assignmentId" },
    ],
  },
);

export const Grade = defineModel(
  "Grade",
  {
    assignmentId: { type: String, required: true },
    studentProfileId: { type: String, required: true },
    score: { type: Number, required: true },
  },
  {
    indexes: [
      { fields: { assignmentId: 1, studentProfileId: 1 }, unique: true },
      { fields: { assignmentId: 1 } },
      { fields: { studentProfileId: 1 } },
    ],
    virtuals: [
      { name: "assignment", ref: "Assignment", localField: "assignmentId", foreignField: "_id", justOne: true },
      { name: "student", ref: "StudentProfile", localField: "studentProfileId", foreignField: "_id", justOne: true },
    ],
  },
);

export const LoginAttempt = defineModel("LoginAttempt", {
  key: { type: String, required: true, unique: true },
  attempts: { type: Number },
  lockedAt: { type: Date, default: null },
});

export const AuditEvent = defineModel(
  "AuditEvent",
  {
    actorId: { type: String, required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    before: { type: String, default: "" },
    after: { type: String, default: "" },
  },
  {
    indexes: [
      { fields: { entity: 1, entityId: 1, createdAt: -1 } },
      { fields: { actorId: 1 } },
      { fields: { createdAt: -1 } },
    ],
    virtuals: [{ name: "actor", ref: "User", localField: "actorId", foreignField: "_id", justOne: true }],
  },
);
