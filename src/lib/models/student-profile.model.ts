import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";
import type { IUser } from "./user.model";

export interface IStudentProfile {
  id: string;
  userId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>({
  id: { type: String, default: () => nanoid(), required: true },
  userId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

StudentProfileSchema.index({ userId: 1 }, { unique: true });
StudentProfileSchema.index({ studentId: 1 }, { unique: true });
StudentProfileSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const StudentProfile =
  models.StudentProfile || model<IStudentProfile>("StudentProfile", StudentProfileSchema);
