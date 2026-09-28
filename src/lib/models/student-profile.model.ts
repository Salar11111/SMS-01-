import { defineModel } from "@/lib/define-model";

export interface IStudentProfile {
  id: string;
  userId: string;
  studentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const StudentProfile = defineModel(
  "StudentProfile",
  {
    userId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
  },
  {
    virtuals: [
      { name: "user", ref: "User", localField: "userId", foreignField: "_id", justOne: true },
      { name: "enrollments", ref: "Enrollment", localField: "_id", foreignField: "studentProfileId" },
      { name: "attendance", ref: "AttendanceRecord", localField: "_id", foreignField: "studentProfileId" },
      { name: "grades", ref: "Grade", localField: "_id", foreignField: "studentProfileId" },
    ],
  },
);
