import { defineModel } from "@/lib/define-model";

export interface IParentStudent {
  id: string;
  parentId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ParentStudent = defineModel(
  "ParentStudent",
  {
    parentId: { type: String, required: true },
    studentId: { type: String, required: true },
  },
  {
    indexes: [{ fields: { parentId: 1, studentId: 1 }, unique: true }, { fields: { studentId: 1 } }],
    virtuals: [
      { name: "parent", ref: "User", localField: "parentId", foreignField: "_id", justOne: true },
      { name: "student", ref: "StudentProfile", localField: "studentId", foreignField: "_id", justOne: true },
    ],
  },
);
