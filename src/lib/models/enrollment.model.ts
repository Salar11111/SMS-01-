import { defineModel } from "@/lib/define-model";

export interface IEnrollment {
  id: string;
  studentProfileId: string;
  classId: string;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const Enrollment = defineModel(
  "Enrollment",
  {
    studentProfileId: { type: String, required: true },
    classId: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  {
    indexes: [
      { fields: { studentProfileId: 1, classId: 1 }, unique: true },
      { fields: { classId: 1 } },
    ],
    virtuals: [
      {
        name: "student",
        ref: "StudentProfile",
        localField: "studentProfileId",
        foreignField: "_id",
        justOne: true,
      },
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
    ],
  },
);
