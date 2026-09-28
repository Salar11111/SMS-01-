import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IAssignment {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  maxScore: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  id: { type: String, default: () => nanoid(), required: true },
  title: { type: String, required: true },
  classId: { type: String, required: true },
  subjectId: { type: String, required: true },
  maxScore: { type: Number, required: true },
  dueDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AssignmentSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const Assignment = models.Assignment || model<IAssignment>("Assignment", AssignmentSchema);
