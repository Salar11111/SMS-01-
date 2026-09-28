import { nanoid } from "nanoid";
import type { Model } from "mongoose";
import { connectDB } from "@/lib/db-connect";
import type { SchoolDocument } from "@/lib/define-model";
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
      { $match: { classId: { $in: ids } } },
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

async function readMany(
  model: Model<SchoolDocument>,
  params: unknown,
  hidePassword = false,
): Promise<SchoolDocument[]> {
  const args = unwrapArgs(params);
  let query = model.find(normalizeWhere(args.where));
  const sort = mongoSort(args.orderBy);
  if (sort) query = query.sort(sort);
  const fields = selectFields(args.select);
  if (fields) query = query.select(fields);
  else if (hidePassword) query = query.select("-passwordHash");
  const populate = buildPopulate(args.populate);
  if (populate.length > 0) query = query.populate(populate);
  const docs = asDocuments(await query.lean(LEAN));
  await attachClassCounts(docs);
  if (!sort && args.orderBy) return sortInMemory(docs, args.orderBy);
  return docs;
}

async function readOne(model: Model<SchoolDocument>, params: unknown): Promise<SchoolDocument | null> {
  const args = unwrapArgs(params);
  let query = model.findOne(normalizeWhere(args.where));
  const populate = buildPopulate(args.populate);
  if (populate.length > 0) query = query.populate(populate);
  const doc = asDocument(await query.lean(LEAN));
  if (doc) await attachClassCounts(doc);
  return doc;
}

async function createOne(model: Model<SchoolDocument>, data: Record<string, unknown>): Promise<SchoolDocument> {
  const created = await model.create(data);
  return created as unknown as SchoolDocument;
}

async function updateOne(
  model: Model<SchoolDocument>,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<SchoolDocument | null> {
  return asDocument(
    await model.findOneAndUpdate(normalizeWhere(where), data, { new: true }).lean(LEAN),
  );
}

async function updateMany(
  model: Model<SchoolDocument>,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  return model.updateMany(normalizeWhere(where), data).exec();
}

async function upsert(
  model: Model<SchoolDocument>,
  where: Record<string, unknown>,
  createData: Record<string, unknown>,
  updateData: Record<string, unknown>,
): Promise<SchoolDocument> {
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
    ) as SchoolDocument;
  }
  const existing = await model.findOne(filter).lean(LEAN);
  if (existing) {
    if (Object.keys(updateData).length === 0) return asDocument(existing) as SchoolDocument;
    return asDocument(await model.findOneAndUpdate(filter, updateData, { new: true }).lean(LEAN)) as SchoolDocument;
  }
  return createOne(model, { ...createData, ...where });
}

const api = {
  async user_create(data: Record<string, unknown>) {
    return createOne(User, data);
  },
  async user_findUnique(where: unknown) {
    return readOne(User, where);
  },
  async user_findMany(params: unknown = {}) {
    return readMany(User, params, true);
  },
  async user_count(where?: Record<string, unknown>) {
    return User.countDocuments(normalizeWhere(where)).exec();
  },
  async user_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne(User, where, data);
  },
  async user_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(User, where, data);
  },

  async studentProfile_findUnique(where: unknown) {
    return readOne(StudentProfile, where);
  },
  async studentProfile_findMany(params: unknown = {}) {
    return readMany(StudentProfile, params);
  },
  async studentProfile_create(data: Record<string, unknown>) {
    return createOne(StudentProfile, data);
  },
  async studentProfile_count(where?: Record<string, unknown>) {
    return StudentProfile.countDocuments(normalizeWhere(where)).exec();
  },

  async teacherProfile_findUnique(where: unknown) {
    return readOne(TeacherProfile, where);
  },
  async teacherProfile_findMany(params: unknown = {}) {
    return readMany(TeacherProfile, params);
  },
  async teacherProfile_create(data: Record<string, unknown>) {
    return createOne(TeacherProfile, data);
  },
  async teacherProfile_count(where?: Record<string, unknown>) {
    return TeacherProfile.countDocuments(normalizeWhere(where)).exec();
  },

  async parentStudent_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert(ParentStudent, where, createData, updateData);
  },
  async parentStudent_findMany(params: unknown = {}) {
    return readMany(ParentStudent, params);
  },

  async academicYear_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne(AcademicYear, where, data);
  },
  async academicYear_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(AcademicYear, where, data);
  },
  async academicYear_create(data: Record<string, unknown>) {
    return createOne(AcademicYear, data);
  },
  async academicYear_findMany(params: unknown = {}) {
    return readMany(AcademicYear, params);
  },

  async class_create(data: Record<string, unknown>) {
    return createOne(Class, data);
  },
  async class_findMany(params: unknown = {}) {
    return readMany(Class, params);
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
          localField: "_id",
          foreignField: "classId",
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
    return createOne(Subject, data);
  },
  async subject_findMany(params: unknown = {}) {
    return readMany(Subject, params);
  },

  async classSubject_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert(ClassSubject, where, createData, updateData);
  },
  async classSubject_findFirst(where: unknown) {
    return readOne(ClassSubject, where);
  },
  async classSubject_findMany(params: unknown = {}) {
    return readMany(ClassSubject, params);
  },

  async enrollment_findMany(params: unknown = {}) {
    return readMany(Enrollment, params);
  },
  async enrollment_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert(Enrollment, where, createData, updateData);
  },
  async enrollment_count(where?: Record<string, unknown>) {
    return Enrollment.countDocuments(normalizeWhere(where)).exec();
  },

  async attendanceRecord_findMany(params: unknown = {}) {
    return readMany(AttendanceRecord, params);
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
  async attendanceRecord_groupBy(params: { by: string[] }) {
    const groupId: Record<string, string> = {};
    for (const key of params.by) groupId[key] = `$${key}`;
    const rows = await AttendanceRecord.aggregate<{ _id: Record<string, unknown>; count: number }>([
      { $group: { _id: groupId, count: { $sum: 1 } } },
    ]).exec();
    return mapGroupRows(rows);
  },

  async assignment_create(data: Record<string, unknown>) {
    return createOne(Assignment, data);
  },
  async assignment_findUnique(where: unknown) {
    return readOne(Assignment, where);
  },
  async assignment_findMany(params: unknown = {}) {
    return readMany(Assignment, params);
  },

  async grade_create(data: Record<string, unknown>) {
    return createOne(Grade, data);
  },
  async grade_createMany(data: Record<string, unknown>[]) {
    return Grade.insertMany(data);
  },
  async grade_findMany(params: unknown = {}) {
    return readMany(Grade, params);
  },
  async grade_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateMany(Grade, where, data);
  },
  async grade_averageByClass() {
    const rows = await Grade.aggregate<{ _id: string; average: number; count: number }>([
      {
        $lookup: {
          from: Assignment.collection.collectionName,
          localField: "assignmentId",
          foreignField: "_id",
          as: "assignment",
        },
      },
      { $unwind: "$assignment" },
      {
        $group: {
          _id: "$assignment.classId",
          average: {
            $avg: {
              $multiply: [{ $divide: ["$score", "$assignment.maxScore"] }, 100],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]).exec();
    return rows.map((row) => ({
      classId: row._id,
      average: row.average,
      count: row.count,
    }));
  },

  async loginAttempt_findUnique(where: unknown) {
    return readOne(LoginAttempt, where);
  },
  async loginAttempt_upsert(
    where: Record<string, unknown>,
    createData: Record<string, unknown>,
    updateData: Record<string, unknown>,
  ) {
    return upsert(LoginAttempt, where, createData, updateData);
  },
  async loginAttempt_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return updateOne(LoginAttempt, where, data);
  },
  async loginAttempt_deleteMany(where: Record<string, unknown>) {
    return LoginAttempt.deleteMany(normalizeWhere(where)).exec();
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
