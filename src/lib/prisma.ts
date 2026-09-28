import mongoose from "mongoose";
import {
  User,
  StudentProfile,
  TeacherProfile,
  ParentStudent,
  AcademicYear,
  Class,
  Subject,
  ClassSubject,
  Enrollment,
  AttendanceRecord,
  Assignment,
  Grade,
  LoginAttempt,
} from "./models";

function getModel(modelName: string) {
  return mongoose.model(modelName);
}

async function runTransaction<T>(
  fn: (tx: any) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

function buildPopulate(populate: Record<string, boolean | string | object>): any[] {
  const result: any[] = [];
  for (const [key, value] of Object.entries(populate)) {
    if (value === true) {
      result.push(key);
    } else if (typeof value === "string") {
      result.push({ path: key, select: value });
    } else {
      result.push({ path: key, populate: buildPopulate(value as Record<string, boolean | string | object>) });
    }
  }
  return result;
}

function parseOrderBy(orderBy: Record<string, string> | Array<Record<string, string>>): any[] {
  if (Array.isArray(orderBy)) {
    return orderBy.map((o) => {
      for (const [key, val] of Object.entries(o)) {
        return { [key]: val === "asc" ? 1 : -1 };
      }
      return {};
    });
  }
  const result: any = {};
  for (const [key, val] of Object.entries(orderBy)) {
    result[key] = val === "asc" ? 1 : -1;
  }
  return result;
}

async function runAggregate(pipeline: any[]): Promise<any[]> {
  return getModel("AttendanceRecord").aggregate(pipeline).exec();
}

const db = {
  // User
  async user_create(data: Record<string, unknown>) {
    return User.create(data);
  },
  async user_findUnique(where: Record<string, unknown>) {
    return User.findOne(where).lean();
  },
  async user_findMany(params: any = {}) {
    const { where, orderBy, select, populate } = params;
    let query = User.find(where || {});
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    if (select) {
      const keys = Object.keys(select);
      query = query.select(keys);
    }
    if (populate) query = query.populate(buildPopulate(populate));
    return query.lean();
  },
  async user_count(where?: Record<string, unknown>) {
    return User.countDocuments(where).exec();
  },
  async user_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return User.updateMany(where, data).exec();
  },
  async user_getClassStats(classId: string) {
    return User.aggregate([
      { $match: { _id: classId } },
      { $project: { name: 1, email: 1, role: 1 } },
    ]).exec();
  },

  // StudentProfile
  async studentProfile_findUnique(where: Record<string, unknown>) {
    return StudentProfile.findOne(where).populate("user").lean();
  },
  async studentProfile_findMany(params: any = {}) {
    const { where, orderBy, populate } = params;
    let query = StudentProfile.find(where || {});
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    if (populate) query = query.populate(buildPopulate(populate));
    return query.lean();
  },
  async studentProfile_create(data: Record<string, unknown>) {
    return StudentProfile.create(data);
  },
  async studentProfile_count(where?: Record<string, unknown>) {
    return StudentProfile.countDocuments(where).exec();
  },

  // TeacherProfile
  async teacherProfile_findUnique(where: Record<string, unknown>) {
    return TeacherProfile.findOne(where).populate("user").lean();
  },
  async teacherProfile_findMany(params: any = {}) {
    const { where, populate } = params;
    let query = TeacherProfile.find(where || {});
    if (populate) query = query.populate(buildPopulate(populate));
    return query.lean();
  },
  async teacherProfile_create(data: Record<string, unknown>) {
    return TeacherProfile.create(data);
  },
  async teacherProfile_count(where?: Record<string, unknown>) {
    return TeacherProfile.countDocuments(where).exec();
  },

  // ParentStudent
  async parentStudent_upsert(where: Record<string, unknown>, createData: Record<string, unknown>, updateData: Record<string, unknown>) {
    const existing = await ParentStudent.findOne(where).lean();
    if (existing) {
      return ParentStudent.findOneAndUpdate(where, updateData, { new: true }).lean();
    }
    return ParentStudent.create({ ...createData, ...where });
  },
  async parentStudent_findMany(params: any = {}) {
    const { where, populate, orderBy } = params;
    let query = ParentStudent.find(where || {});
    if (populate) query = query.populate(buildPopulate(populate));
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },

  // AcademicYear
  async academicYear_updateMany(where: Record<string, unknown>, data: Record<string, unknown>) {
    return AcademicYear.updateMany(where, data).exec();
  },
  async academicYear_create(data: Record<string, unknown>) {
    return AcademicYear.create(data);
  },
  async academicYear_findMany(params: any = {}) {
    const { where, orderBy, populate } = params;
    let query = AcademicYear.find(where || {});
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    if (populate) query = query.populate(buildPopulate(populate));
    return query.lean();
  },

  // Class
  async class_create(data: Record<string, unknown>) {
    return Class.create(data);
  },
  async class_findMany(params: any = {}) {
    const { where, populate, orderBy } = params;
    let query = Class.find(where || {});
    if (populate) {
      const pop: any[] = [];
      for (const [key, value] of Object.entries(populate)) {
        if (key === "_count") {
          if (value && typeof value === "object" && "select" in value) {
            pop.push({ path: "", options: { } });
          }
        } else {
          if (value === true) pop.push(key);
          else if (typeof value === "object") pop.push({ path: key, populate: buildPopulate(value as Record<string, boolean | string | object>) });
        }
      }
      if (pop.length > 0) query = query.populate(pop);
    }
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },
  async class_count(where?: Record<string, unknown>) {
    return Class.countDocuments(where).exec();
  },
  async class_getWithCount(classId: string) {
    return Class.aggregate([
      { $match: { _id: classId } },
      {
        $lookup: {
          from: "enrollments",
          localField: "_id",
          foreignField: "classId",
          as: "enrollments",
        },
      },
      {
        $project: { name: 1, section: 1, academicYearId: 1, _count: { enrollments: { $size: "$enrollments" } } },
      },
    ]).exec();
  },

  // Subject
  async subject_create(data: Record<string, unknown>) {
    return Subject.create(data);
  },
  async subject_findMany(params: any = {}) {
    const { where, orderBy } = params;
    let query = Subject.find(where || {});
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },

  // ClassSubject
  async classSubject_upsert(where: Record<string, unknown>, createData: Record<string, unknown>, updateData: Record<string, unknown>) {
    const existing = await ClassSubject.findOne(where).lean();
    if (existing) {
      return ClassSubject.findOneAndUpdate(where, updateData, { new: true }).lean();
    }
    return ClassSubject.create({ ...createData, ...where });
  },
  async classSubject_findFirst(where: Record<string, unknown>) {
    return ClassSubject.findOne(where).lean();
  },
  async classSubject_findMany(params: any = {}) {
    const { where, populate, orderBy } = params;
    let query = ClassSubject.find(where || {});
    if (populate) query = query.populate(buildPopulate(populate));
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },

  // Enrollment
  async enrollment_findMany(params: any = {}) {
    const { where, populate, select, orderBy } = params;
    let query = Enrollment.find(where || {});
    if (populate) query = query.populate(buildPopulate(populate));
    if (select) query = query.select(select);
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },
  async enrollment_upsert(where: Record<string, unknown>, createData: Record<string, unknown>, updateData: Record<string, unknown>) {
    const existing = await Enrollment.findOne(where).lean();
    if (existing) {
      return Enrollment.findOneAndUpdate(where, updateData, { new: true }).lean();
    }
    return Enrollment.create({ ...createData, ...where });
  },
  async enrollment_count(where?: Record<string, unknown>) {
    return Enrollment.countDocuments(where).exec();
  },

  // AttendanceRecord
  async attendanceRecord_findMany(params: any = {}) {
    const { where, populate, select, orderBy } = params;
    let query = AttendanceRecord.find(where || {});
    if (populate) query = query.populate(buildPopulate(populate));
    if (select) query = query.select(select);
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },
  async attendanceRecord_createMany(data: Record<string, unknown>[]) {
    return AttendanceRecord.insertMany(data);
  },
async attendanceRecord_updateMany(data: Record<string, unknown>) {
     return (AttendanceRecord as any).updateMany(data).exec();
   },
  async attendanceRecord_count(where?: Record<string, unknown>) {
    return AttendanceRecord.countDocuments(where).exec();
  },
  async attendanceRecord_groupBy(params: any) {
    const { by, _count } = params;
    const pipeline: any[] = [{ $group: { _id: {}, ...{} } }];
    const groupStage: any = { _id: {} };
    const countStage: any = {};
    for (const key of by) {
      groupStage._id[key] = `$${key}`;
    }
    if (_count) {
      for (const field of Object.keys(_count)) {
        groupStage[`_count.${field}`] = { $sum: 1 };
      }
    }
    pipeline[0] = { $group: groupStage };
    return AttendanceRecord.aggregate(pipeline).exec();
  },

  // Assignment
  async assignment_create(data: Record<string, unknown>) {
    return Assignment.create(data);
  },
  async assignment_findUnique(where: Record<string, unknown>) {
    return Assignment.findOne(where).lean();
  },

  async assignment_findMany(where?: Record<string, unknown>) {
     return Assignment.find(where || {}).lean();
   },

   // Grade
  async grade_create(data: Record<string, unknown>) {
    return Grade.create(data);
  },
  async grade_createMany(data: Record<string, unknown>[]) {
    return Grade.insertMany(data);
  },
  async grade_findMany(params: any = {}) {
    const { where, populate, select, orderBy } = params;
    let query = Grade.find(where || {});
    if (populate) query = query.populate(buildPopulate(populate));
    if (select) query = query.select(select);
    if (orderBy) query = query.sort(parseOrderBy(orderBy));
    return query.lean();
  },
async grade_updateMany(data: Record<string, unknown>) {
     return (Grade as any).updateMany(data).exec();
   },

  // LoginAttempt
  async loginAttempt_findUnique(where: Record<string, unknown>) {
    return LoginAttempt.findOne(where).lean();
  },
  async loginAttempt_upsert(where: Record<string, unknown>, createData: Record<string, unknown>, updateData: Record<string, unknown>) {
    const existing = await LoginAttempt.findOne(where).lean();
    if (existing) {
      return LoginAttempt.findOneAndUpdate(where, updateData, { new: true }).lean();
    }
    return LoginAttempt.create({ ...createData, ...where });
  },
  async loginAttempt_update(where: Record<string, unknown>, data: Record<string, unknown>) {
    return LoginAttempt.findOneAndUpdate(where, data, { new: true }).lean();
  },
  async loginAttempt_deleteMany(where: Record<string, unknown>) {
    return LoginAttempt.deleteMany(where).exec();
  },

  // Transaction
  async $transaction(fn: (tx: any) => Promise<any>) {
    return runTransaction(fn);
  },
};

export { db };
export default db;
