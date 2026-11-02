/** Caller-facing documents. A grade does not carry an email, and a user does not carry a score. */

export type UserRecord = {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  passwordHash?: string;
  studentProfile?: StudentRecord | null;
  teacherProfile?: TeacherRecord | null;
};

export type YearRecord = {
  _id: string;
  id: string;
  name: string;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
};

export type ClassRecord = {
  _id: string;
  id: string;
  name: string;
  section: string;
  academicYearId: string;
  academicYear?: YearRecord | null;
  _count?: { enrollments: number; attendance: number };
};

export type SubjectRecord = {
  _id: string;
  id: string;
  name: string;
};

export type TeacherRecord = {
  _id: string;
  id: string;
  userId: string;
  user?: UserRecord | null;
  classSubjects?: ClassSubjectRecord[];
};

export type ClassSubjectRecord = {
  _id: string;
  id: string;
  classId: string;
  subjectId: string;
  teacherProfileId: string;
  class?: ClassRecord | null;
  subject?: SubjectRecord | null;
  teacher?: TeacherRecord | null;
};

export type StudentRecord = {
  _id: string;
  id: string;
  userId: string;
  studentId: string;
  user?: UserRecord | null;
  enrollments?: EnrollmentRecord[];
  attendance?: AttendanceRecordView[];
  grades?: GradeRecord[];
};

export type EnrollmentRecord = {
  _id: string;
  id: string;
  studentProfileId: string;
  classId: string;
  enrolledAt?: Date;
  endedAt?: Date | null;
  student?: StudentRecord | null;
  class?: ClassRecord | null;
};

export type AttendanceRecordView = {
  _id: string;
  id: string;
  studentProfileId: string;
  classId: string;
  date: Date;
  status: string;
  markedById?: string;
  class?: ClassRecord | null;
  student?: StudentRecord | null;
};

export type AssignmentRecord = {
  _id: string;
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  maxScore: number;
  dueDate?: Date | null;
  createdAt?: Date;
  subject?: SubjectRecord | null;
  class?: ClassRecord | null;
  grades?: GradeRecord[];
};

export type GradeRecord = {
  _id: string;
  id: string;
  assignmentId: string;
  studentProfileId: string;
  score: number;
  assignment?: AssignmentRecord | null;
  student?: StudentRecord | null;
};

export type ParentLinkRecord = {
  _id: string;
  id: string;
  parentId: string;
  studentId: string;
  parent?: UserRecord | null;
  student?: StudentRecord | null;
};

export type LoginAttemptRecord = {
  _id: string;
  id: string;
  key: string;
  attempts: number;
  lockedAt?: Date | null;
};

export type AuditRecord = {
  _id: string;
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before: string;
  after: string;
  createdAt?: Date;
  actor?: UserRecord | null;
};
