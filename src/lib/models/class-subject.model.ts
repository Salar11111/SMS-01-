import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherProfileId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSubjectSchema = new Schema<IClassSubject>({
  id: { type: String, default: () => nanoid(), required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  teacherProfileId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ClassSubjectSchema.index({ classId: 1, subjectId: 1 }, { unique: true });
ClassSubjectSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const ClassSubject =
  models.ClassSubject || model<IClassSubject>("ClassSubject", ClassSubjectSchema);
