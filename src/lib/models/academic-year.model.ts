import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IAcademicYear {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYear>({
  id: { type: String, default: () => nanoid(), required: true },
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AcademicYearSchema.index({ name: 1 }, { unique: true });
AcademicYearSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const AcademicYear =
  models.AcademicYear || model<IAcademicYear>("AcademicYear", AcademicYearSchema);
