import { defineModel } from "@/lib/define-model";

export interface ITeacherProfile {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TeacherProfile = defineModel(
  "TeacherProfile",
  {
    userId: { type: String, required: true, unique: true },
  },
  {
    virtuals: [
      { name: "user", ref: "User", localField: "userId", foreignField: "_id", justOne: true },
      { name: "classSubjects", ref: "ClassSubject", localField: "_id", foreignField: "teacherProfileId" },
    ],
  },
);
