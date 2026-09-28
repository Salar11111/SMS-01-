import { defineModel } from "@/lib/define-model";

export interface IAttendanceRecord {
  id: string;
  studentProfileId: string;
  classId: string;
  date: Date;
  status: string;
  markedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AttendanceRecord = defineModel(
  "AttendanceRecord",
  {
    studentProfileId: { type: String, required: true },
    classId: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true },
    markedById: { type: String, required: true },
  },
  {
    indexes: [
      { fields: { studentProfileId: 1, classId: 1, date: 1 }, unique: true },
      { fields: { classId: 1, date: 1 } },
      { fields: { studentProfileId: 1 } },
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
