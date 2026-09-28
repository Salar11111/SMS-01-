import { defineModel } from "@/lib/define-model";

export interface IClass {
  id: string;
  name: string;
  section: string;
  academicYearId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Class = defineModel(
  "Class",
  {
    name: { type: String, required: true },
    section: { type: String, required: true },
    academicYearId: { type: String, required: true },
  },
  {
    indexes: [{ fields: { name: 1, section: 1, academicYearId: 1 }, unique: true }],
    virtuals: [
      {
        name: "academicYear",
        ref: "AcademicYear",
        localField: "academicYearId",
        foreignField: "_id",
        justOne: true,
      },
    ],
  },
);
