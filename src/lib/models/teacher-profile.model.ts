import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface ITeacherProfile {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherProfileSchema = new Schema<ITeacherProfile>({
  id: { type: String, default: () => nanoid(), required: true },
  userId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TeacherProfileSchema.index({ userId: 1 }, { unique: true });
TeacherProfileSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const TeacherProfile =
  models.TeacherProfile || model<ITeacherProfile>("TeacherProfile", TeacherProfileSchema);
