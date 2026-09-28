import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IParentStudent {
  id: string;
  parentId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ParentStudentSchema = new Schema<IParentStudent>({
  id: { type: String, default: () => nanoid(), required: true },
  parentId: { type: String, required: true },
  studentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ParentStudentSchema.index({ parentId: 1, studentId: 1 }, { unique: true });
ParentStudentSchema.index({ studentId: 1 });
ParentStudentSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const ParentStudent =
  models.ParentStudent || model<IParentStudent>("ParentStudent", ParentStudentSchema);
