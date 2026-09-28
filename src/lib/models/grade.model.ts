import { defineModel } from "@/lib/define-model";

export interface IGrade {
  id: string;
  assignmentId: string;
  studentProfileId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Grade = defineModel(
  "Grade",
  {
    assignmentId: { type: String, required: true },
    studentProfileId: { type: String, required: true },
    score: { type: Number, required: true },
  },
  {
    indexes: [
      { fields: { assignmentId: 1, studentProfileId: 1 }, unique: true },
      { fields: { assignmentId: 1 } },
      { fields: { studentProfileId: 1 } },
    ],
    virtuals: [
      {
        name: "assignment",
        ref: "Assignment",
        localField: "assignmentId",
        foreignField: "_id",
        justOne: true,
      },
      {
        name: "student",
        ref: "StudentProfile",
        localField: "studentProfileId",
        foreignField: "_id",
        justOne: true,
      },
    ],
  },
);
