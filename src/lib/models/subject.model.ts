import { defineModel } from "@/lib/define-model";

export interface ISubject {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Subject = defineModel("Subject", {
  name: { type: String, required: true, unique: true },
});
