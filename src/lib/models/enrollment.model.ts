import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IEnrollment {
  id: string;
  studentProfileId: string;
  classId: string;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  id: { type: String, default: () => nanoid(), required: true },
  studentProfileId: { type: String, required: true },
  classId: { type: String, required: true },
  enrolledAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

EnrollmentSchema.index({ studentProfileId: 1, classId: 1 }, { unique: true });
EnrollmentSchema.index({ classId: 1 });
EnrollmentSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const Enrollment = models.Enrollment || model<IEnrollment>("Enrollment", EnrollmentSchema);
