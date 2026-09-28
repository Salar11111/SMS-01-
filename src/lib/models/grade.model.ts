import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IGrade {
  id: string;
  assignmentId: string;
  studentProfileId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGrade>({
  id: { type: String, default: () => nanoid(), required: true },
  assignmentId: { type: String, required: true },
  studentProfileId: { type: String, required: true },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GradeSchema.index({ assignmentId: 1, studentProfileId: 1 }, { unique: true });
GradeSchema.index({ assignmentId: 1 });
GradeSchema.index({ studentProfileId: 1 });
GradeSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const Grade = models.Grade || model<IGrade>("Grade", GradeSchema);
