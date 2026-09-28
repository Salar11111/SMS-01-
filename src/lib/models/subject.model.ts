import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface ISubject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  id: { type: String, default: () => nanoid(), required: true },
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SubjectSchema.index({ name: 1 }, { unique: true });
SubjectSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const Subject = models.Subject || model<ISubject>("Subject", SubjectSchema);
