import { defineModel } from "@/lib/define-model";

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

export const Assignment = defineModel(
  "Assignment",
  {
    title: { type: String, required: true },
    classId: { type: String, required: true },
    subjectId: { type: String, required: true },
    maxScore: { type: Number, required: true },
    dueDate: { type: Date, default: null },
  },
  {
    virtuals: [
      { name: "subject", ref: "Subject", localField: "subjectId", foreignField: "_id", justOne: true },
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
      { name: "grades", ref: "Grade", localField: "_id", foreignField: "assignmentId" },
    ],
  },
);
