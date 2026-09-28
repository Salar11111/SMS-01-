import { defineModel } from "@/lib/define-model";

export interface ILoginAttempt {
  id: string;
  key: string;
  attempts: number;
  lockedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export const LoginAttempt = defineModel(
  "LoginAttempt",
  {
    key: { type: String, required: true, unique: true },
    attempts: { type: Number },
    lockedAt: { type: Date, default: null },
  },
);
