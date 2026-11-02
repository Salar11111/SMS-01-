import { nanoid } from "nanoid";
import type { Model } from "mongoose";
import { connectDB } from "@/lib/db-connect";
import type { SchoolDocument } from "@/lib/define-model";
import type {
  AssignmentRecord,
  AttendanceRecordView,
  AuditRecord,
  ClassRecord,
  ClassSubjectRecord,
  EnrollmentRecord,
  GradeRecord,
  LoginAttemptRecord,
  ParentLinkRecord,
  StudentRecord,
  SubjectRecord,
  TeacherRecord,
  UserRecord,
  YearRecord,
} from "@/lib/records";
import {
  attemptsIncrement,
  buildPopulate,
  collectClassDocs,
  mapGroupRows,
  mongoSort,
  normalizeWhere,
  present,
  selectFields,
  sortInMemory,
  unwrapArgs,
} from "@/lib/db-query";
import {
  AcademicYear,
  Assignment,
  AttendanceRecord,
  AuditEvent,
  Class,
  ClassSubject,
  Enrollment,
  Grade,
  LoginAttempt,
  ParentStudent,
  StudentProfile,
  Subject,
  TeacherProfile,
  User,
} from "./models";

const LEAN = { virtuals: true } as const;

async function attachClassCounts(root: unknown) {
  const classes = collectClassDocs(root);
  if (classes.length === 0) return;
  const ids = [...new Set(classes.map((klass) => String(klass.id ?? klass._id)))];
  const [enrollmentCounts, attendanceCounts] = await Promise.all([
    Enrollment.aggregate<{ _id: string; count: number }>([
      { $match: { classId: { $in: ids }, endedAt: null } },
      { $group: { _id: "$classId", count: { $sum: 1 } } },
    ]),
    AttendanceRecord.aggregate<{ _id: string; count: number }>([
      { $match: { classId: { $in: ids } } },
      { $group: { _id: "$classId", count: { $sum: 1 } } },
    ]),
  ]);
  const enrollmentMap = new Map(enrollmentCounts.map((row) => [String(row._id), row.count]));
  const attendanceMap = new Map(attendanceCounts.map((row) => [String(row._id), row.count]));
  for (const klass of classes) {
    const id = String(klass.id ?? klass._id);
    klass._count = {
      enrollments: enrollmentMap.get(id) ?? 0,
      attendance: attendanceMap.get(id) ?? 0,
    };
  }
}

function asDocument(value: unknown): SchoolDocument | null {
  if (value == null) return null;
  return present(value) as SchoolDocument;
}

function asDocuments(value: unknown): SchoolDocument[] {
  return present(value) as SchoolDocument[];
}

async function readMany<T>(
  model: Model<SchoolDocument>,
  params: unknown,
  hidePassword = false,
): Promise<T[]> {
  const args = unwrapArgs(params);
  let query = model.find(normalizeWhere(args.where));
  const sort = mongoSort(args.orderBy);
  if (sort) query = query.sort(sort);
  const fields = selectFields(args.select);
  if (fields) query = query.select(fields);
  else if (hidePassword) query = query.select("-passwordHash");
  const populate = buildPopulate(args.populate);
  if (populate.length > 0) query = query.populate(populate);
  if (typeof args.limit === "number") query = query.limit(args.limit);
  const docs = asDocuments(await query.lean(LEAN));
  await attachClassCounts(docs);
  if (!sort && args.orderBy) return sortInMemory(docs, args.orderBy) as T[];
  return docs as T[];
}

async function readOne<T>(model: Model<SchoolDocument>, params: unknown): Promise<T | null> {
  const args = unwrapArgs(params);
  let query = model.findOne(normalizeWhere(args.where));
  const populate = buildPopulate(args.populate);
  if (populate.length > 0) query = query.populate(populate);
  const doc = asDocument(await query.lean(LEAN));
  if (doc) await attachClassCounts(doc);
  return doc as T | null;
}

async function createOne<T>(model: Model<SchoolDocument>, data: Record<string, unknown>): Promise<T> {
  const created = await model.create(data);
  const plain =
    created && typeof (created as { toObject?: () => unknown }).toObject === "function"
      ? (created as { toObject: (options?: { virtuals?: boolean }) => unknown }).toObject({ virtuals: true })
      : created;
  return asDocument(plain) as T;
}

async function updateOne<T>(
  model: Model<SchoolDocument>,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<T | null> {
  return asDocument(
    await model.findOneAndUpdate(normalizeWhere(where), data, { new: true }).lean(LEAN),
  ) as T | null;
}

async function updateMany(
  model: Model<SchoolDocument>,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  return model.updateMany(normalizeWhere(where), data).exec();
}

async function upsert<T>(
  model: Model<SchoolDocument>,
  where: Record<string, unknown>,
  createData: Record<string, unknown>,
  updateData: Record<string, unknown>,
): Promise<T> {
  const filter = normalizeWhere(where);
  const operators = Object.keys(updateData).some((key) => key.startsWith("$"));
  if (operators) {
    return asDocument(
      await model
        .findOneAndUpdate(
          filter,
          { ...updateData, $setOnInsert: { _id: nanoid(), ...filter } },
          { new: true, upsert: true },
        )
        .lean(LEAN),
    ) as T;
  }
  const existing = await model.findOne(filter).lean(LEAN);
  if (existing) {
    if (Object.keys(updateData).length === 0) return asDocument(existing) as T;
    return asDocument(await model.findOneAndUpdate(filter, updateData, { new: true }).lean(LEAN)) as T;
  }
  return createOne<T>(model, { ...createData, ...where });
}

const api = {
  async user_create(data: Record<string, unknown>) {
    return createOne<UserRecord>(User, data);
  },
  async user_findUnique(where: unknown) {
    return readOne<UserRecord>(User, where);
  },
  async user_findMany(params: unknown = {}) {
    return readMany<UserRecord>(User, params, true);
  },
  async user_count(where?: Record<string, unknown>) {
    return User.countDocuments(normalizeWhere(where)).exec();
  },
  async user_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne<UserRecord>(User, where, data);
  },
  async user_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(User, where, data);
  },

  async studentProfile_findUnique(where: unknown) {
    return readOne<StudentRecord>(StudentProfile, where);
  },
  async studentProfile_findMany(params: unknown = {}) {
    return readMany<StudentRecord>(StudentProfile, params);
  },
  async studentProfile_create(data: Record<string, unknown>) {
    return createOne<StudentRecord>(StudentProfile, data);
  },
  async studentProfile_count(where?: Record<string, unknown>) {
    return StudentProfile.countDocuments(normalizeWhere(where)).exec();
  },

  async teacherProfile_findUnique(where: unknown) {
    return readOne<TeacherRecord>(TeacherProfile, where);
  },
  async teacherProfile_findMany(params: unknown = {}) {
    return readMany<TeacherRecord>(TeacherProfile, params);
  },
  async teacherProfile_create(data: Record<string, unknown>) {
    return createOne<TeacherRecord>(TeacherProfile, data);
  },
  async teacherProfile_count(where?: Record<string, unknown>) {
    return TeacherProfile.countDocuments(normalizeWhere(where)).exec();
  },

  async parentStudent_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert<ParentLinkRecord>(ParentStudent, where, createData, updateData);
  },
  async parentStudent_findMany(params: unknown = {}) {
    return readMany<ParentLinkRecord>(ParentStudent, params);
  },

  async academicYear_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne<YearRecord>(AcademicYear, where, data);
  },
  async academicYear_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(AcademicYear, where, data);
  },
  async academicYear_create(data: Record<string, unknown>) {
    return createOne<YearRecord>(AcademicYear, data);
  },
  async academicYear_findMany(params: unknown = {}) {
    return readMany<YearRecord>(AcademicYear, params);
  },

  async class_create(data: Record<string, unknown>) {
    return createOne<ClassRecord>(Class, data);
  },
  async class_findMany(params: unknown = {}) {
    return readMany<ClassRecord>(Class, params);
  },
  async class_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne<ClassRecord>(Class, where, data);
  },
  async class_count(where?: Record<string, unknown>) {
    return Class.countDocuments(normalizeWhere(where)).exec();
  },
  async class_getWithCount(classId: string) {
    const rows = await Class.aggregate([
      { $match: { _id: classId } },
      {
        $lookup: {
          from: Enrollment.collection.collectionName,
          let: { classId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$classId", "$$classId"] },
                endedAt: null,
              },
            },
          ],
          as: "enrollments",
        },
      },
      {
        $project: {
          id: "$_id",
          name: 1,
          section: 1,
          academicYearId: 1,
          _count: { enrollments: { $size: "$enrollments" } },
        },
      },
    ]).exec();
    return rows;
  },

  async subject_create(data: Record<string, unknown>) {
    return createOne<SubjectRecord>(Subject, data);
  },
  async subject_findMany(params: unknown = {}) {
    return readMany<SubjectRecord>(Subject, params);
  },

  async classSubject_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert<ClassSubjectRecord>(ClassSubject, where, createData, updateData);
  },
  async classSubject_findFirst(where: unknown) {
    return readOne<ClassSubjectRecord>(ClassSubject, where);
  },
  async classSubject_findMany(params: unknown = {}) {
    return readMany<ClassSubjectRecord>(ClassSubject, params);
  },
  async classSubject_delete(where: Record<string, unknown>) {
    return ClassSubject.deleteOne(normalizeWhere(where)).exec();
  },

  async enrollment_findMany(params: unknown = {}) {
    return readMany<EnrollmentRecord>(Enrollment, params);
  },
  async enrollment_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert<EnrollmentRecord>(Enrollment, where, createData, updateData);
  },
  async enrollment_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne<EnrollmentRecord>(Enrollment, where, data);
  },
  async enrollment_count(where?: Record<string, unknown>) {
    return Enrollment.countDocuments(normalizeWhere(where)).exec();
  },

  async attendanceRecord_findMany(params: unknown = {}) {
    return readMany<AttendanceRecordView>(AttendanceRecord, params);
  },
  async attendanceRecord_createMany(data: Record<string, unknown>[]) {
    return AttendanceRecord.insertMany(data);
  },
  async attendanceRecord_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(AttendanceRecord, where, data);
  },
  async attendanceRecord_count(where?: Record<string, unknown>) {
    return AttendanceRecord.countDocuments(normalizeWhere(where)).exec();
  },
  async attendanceRecord_groupBy(params: { by: string[]; where?: Record<string, unknown> }) {
    const groupId: Record<string, string> = {};
    for (const key of params.by) groupId[key] = `$${key}`;
    const match = normalizeWhere(params.where);
    const pipeline: Record<string, unknown>[] = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    pipeline.push({ $group: { _id: groupId, count: { $sum: 1 } } });
    const rows = await AttendanceRecord.aggregate<{ _id: Record<string, unknown>; count: number }>(
      pipeline as never,
    ).exec();
    return mapGroupRows(rows);
  },
  async attendanceRecord_bulkUpsert(
    rows: { studentProfileId: string; classId: string; date: Date; status: string; markedById: string }[],
  ) {
    if (rows.length === 0) return { ok: true };
    return AttendanceRecord.bulkWrite(
      rows.map((row) => ({
        updateOne: {
          filter: { studentProfileId: row.studentProfileId, classId: row.classId, date: row.date },
          update: {
            $set: { status: row.status, markedById: row.markedById },
            $setOnInsert: { _id: nanoid() },
          },
          upsert: true,
        },
      })),
      { ordered: true },
    );
  },

  async assignment_create(data: Record<string, unknown>) {
    return createOne<AssignmentRecord>(Assignment, data);
  },
  async assignment_findUnique(where: unknown) {
    return readOne<AssignmentRecord>(Assignment, where);
  },
  async assignment_findMany(params: unknown = {}) {
    return readMany<AssignmentRecord>(Assignment, params);
  },
  async assignment_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne<AssignmentRecord>(Assignment, where, data);
  },
  async assignment_delete(where: Record<string, unknown>) {
    return Assignment.deleteOne(normalizeWhere(where)).exec();
  },

  async grade_create(data: Record<string, unknown>) {
    return createOne<GradeRecord>(Grade, data);
  },
  async grade_createMany(data: Record<string, unknown>[]) {
    return Grade.insertMany(data);
  },
  async grade_findMany(params: unknown = {}) {
    return readMany<GradeRecord>(Grade, params);
  },
  async grade_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(Grade, where, data);
  },
  async grade_deleteMany(where: Record<string, unknown>) {
    return Grade.deleteMany(normalizeWhere(where)).exec();
  },
  async grade_bulkUpsert(rows: { assignmentId: string; studentProfileId: string; score: number }[]) {
    if (rows.length === 0) return { ok: true };
    return Grade.bulkWrite(
      rows.map((row) => ({
        updateOne: {
          filter: { assignmentId: row.assignmentId, studentProfileId: row.studentProfileId },
          update: {
            $set: { score: row.score },
            $setOnInsert: { _id: nanoid() },
          },
          upsert: true,
        },
      })),
      { ordered: true },
    );
  },
  async grade_averageByClass(filter?: { classIds?: string[]; from?: Date; to?: Date }) {
    const match: Record<string, unknown> = {};
    if (filter?.classIds) match["assignment.classId"] = { $in: filter.classIds };
    if (filter?.from || filter?.to) {
      const createdAt: Record<string, Date> = {};
      if (filter.from) createdAt.$gte = filter.from;
      if (filter.to) createdAt.$lte = filter.to;
      match["assignment.createdAt"] = createdAt;
    }
    const pipeline: Record<string, unknown>[] = [
      {
        $lookup: {
          from: Assignment.collection.collectionName,
          localField: "assignmentId",
          foreignField: "_id",
          as: "assignment",
        },
      },
      { $unwind: "$assignment" },
    ];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    pipeline.push({
      $group: {
        _id: "$assignment.classId",
        average: {
          $avg: {
            $multiply: [{ $divide: ["$score", "$assignment.maxScore"] }, 100],
          },
        },
        count: { $sum: 1 },
      },
    });
    const rows = await Grade.aggregate<{ _id: string; average: number; count: number }>(pipeline as never).exec();
    return rows.map((row) => ({
      classId: row._id,
      average: row.average,
      count: row.count,
    }));
  },

  async loginAttempt_findUnique(where: unknown) {
    return readOne<LoginAttemptRecord>(LoginAttempt, where);
  },
  async loginAttempt_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert<LoginAttemptRecord>(LoginAttempt, where, createData, updateData);
  },
  async loginAttempt_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne<LoginAttemptRecord>(LoginAttempt, where, data);
  },
  async loginAttempt_deleteMany(where: Record<string, unknown>) {
    return LoginAttempt.deleteMany(normalizeWhere(where)).exec();
  },

  async audit_createMany(
    rows: { actorId: string; action: string; entity: string; entityId: string; before: string; after: string }[],
  ) {
    if (rows.length === 0) return [];
    return AuditEvent.insertMany(rows);
  },
  async audit_findMany(params: unknown = {}) {
    return readMany<AuditRecord>(AuditEvent, params);
  },
};

function withConnection<T extends object>(methods: T): T {
  return new Proxy(methods, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== "function") return value;
      return async (...args: unknown[]) => {
        await connectDB();
        return value.apply(target, args);
      };
    },
  });
}

export const db = withConnection(api);
export { attemptsIncrement };
export default db;
