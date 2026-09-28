import { defineModel } from "@/lib/define-model";

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const User = defineModel(
  "User",
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  {
    virtuals: [
      {
        name: "studentProfile",
        ref: "StudentProfile",
        localField: "_id",
        foreignField: "userId",
        justOne: true,
      },
      {
        name: "teacherProfile",
        ref: "TeacherProfile",
        localField: "_id",
        foreignField: "userId",
        justOne: true,
      },
    ],
  },
);
