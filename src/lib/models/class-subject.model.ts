import { defineModel } from "@/lib/define-model";

export interface IClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  teacherProfileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ClassSubject = defineModel(
  "ClassSubject",
  {
    classId: { type: String, required: true },
    subjectId: { type: String, required: true },
    teacherProfileId: { type: String, required: true },
  },
  {
    indexes: [{ fields: { classId: 1, subjectId: 1 }, unique: true }],
    virtuals: [
      { name: "class", ref: "Class", localField: "classId", foreignField: "_id", justOne: true },
      { name: "subject", ref: "Subject", localField: "subjectId", foreignField: "_id", justOne: true },
      {
        name: "teacher",
        ref: "TeacherProfile",
        localField: "teacherProfileId",
        foreignField: "_id",
        justOne: true,
      },
    ],
  },
);
