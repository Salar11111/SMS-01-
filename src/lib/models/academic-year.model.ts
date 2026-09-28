import { defineModel } from "@/lib/define-model";

export interface IAcademicYear {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AcademicYear = defineModel("AcademicYear", {
  name: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
});
