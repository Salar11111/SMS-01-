import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface ILoginAttempt {
  id: string;
  key: string;
  attempts: number;
  lockedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
  id: { type: String, default: () => nanoid(), required: true },
  key: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 0 },
  lockedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

LoginAttemptSchema.index({ key: 1 }, { unique: true });
LoginAttemptSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const LoginAttempt =
  models.LoginAttempt || model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema);
