import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IClass {
  id: string;
  name: string;
  section: string;
  academicYearId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>({
  id: { type: String, default: () => nanoid(), required: true },
  name: { type: String, required: true },
  section: { type: String, required: true },
  academicYearId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ClassSchema.index({ name: 1, section: 1, academicYearId: 1 }, { unique: true });
ClassSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const Class = models.Class || model<IClass>("Class", ClassSchema);
