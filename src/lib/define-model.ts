import mongoose, { Schema, model, models, type Model } from "mongoose";
import { nanoid } from "nanoid";

mongoose.set("bufferTimeoutMS", 30000);

export type VirtualRef = {
  name: string;
  ref: string;
  localField: string;
  foreignField: string;
  justOne?: boolean;
};

/** Lean school document: string nanoid id, stored fields, and populated relations. */
export interface SchoolDocument {
  _id: string;
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  active: boolean;
  userId: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherProfileId: string;
  studentProfileId: string;
  parentId: string;
  assignmentId: string;
  academicYearId: string;
  section: string;
  title: string;
  status: string;
  score: number;
  maxScore: number;
  attempts: number;
  lockedAt: Date | null;
  date: Date;
  dueDate: Date | null;
  enrolledAt: Date;
  key: string;
  academicYear: SchoolDocument;
  user: SchoolDocument;
  class: SchoolDocument;
  subject: SchoolDocument;
  teacher: SchoolDocument;
  student: SchoolDocument;
  parent: SchoolDocument;
  assignment: SchoolDocument;
  studentProfile: SchoolDocument | null;
  teacherProfile: SchoolDocument | null;
  enrollments: SchoolDocument[];
  attendance: SchoolDocument[];
  grades: SchoolDocument[];
  classSubjects: SchoolDocument[];
  _count: { enrollments: number; attendance: number };
}

export function defineModel(
  name: string,
  definition: mongoose.SchemaDefinition,
  options?: {
    indexes?: { fields: Record<string, 1 | -1>; unique?: boolean }[];
    virtuals?: VirtualRef[];
  },
): Model<SchoolDocument> {
  if (process.env.NODE_ENV !== "production" && models[name]) {
    mongoose.deleteModel(name);
  }
  if (models[name]) return models[name] as Model<SchoolDocument>;

  const schema = new Schema(
    {
      _id: { type: String, default: () => nanoid() },
      ...definition,
    },
    { timestamps: true },
  );
  (schema as unknown as { set: (key: string, value: unknown) => void }).set("strictPopulate", false);
  schema.set("toJSON", { virtuals: true });
  schema.set("toObject", { virtuals: true });

  for (const virtual of options?.virtuals ?? []) {
    schema.virtual(virtual.name, {
      ref: virtual.ref,
      localField: virtual.localField,
      foreignField: virtual.foreignField,
      justOne: virtual.justOne ?? false,
    });
  }

  for (const index of options?.indexes ?? []) {
    schema.index(index.fields, index.unique ? { unique: true } : undefined);
  }

  return model(name, schema) as unknown as Model<SchoolDocument>;
}
