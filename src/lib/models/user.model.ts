import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, default: () => nanoid(), required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const User = models.User || model<IUser>("User", UserSchema);
