import { Schema, model, models } from "mongoose";
import { nanoid } from "nanoid";

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

const AttendanceRecordSchema = new Schema<IAttendanceRecord>({
  id: { type: String, default: () => nanoid(), required: true },
  studentProfileId: { type: String, required: true },
  classId: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true },
  markedById: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AttendanceRecordSchema.index(
  { studentProfileId: 1, classId: 1, date: 1 },
  { unique: true }
);
AttendanceRecordSchema.index({ classId: 1, date: 1 });
AttendanceRecordSchema.index({ studentProfileId: 1 });
AttendanceRecordSchema.pre("save", function (next: any) {
  this.updatedAt = new Date();
  next();
});

export const AttendanceRecord =
  models.AttendanceRecord ||
  model<IAttendanceRecord>("AttendanceRecord", AttendanceRecordSchema);
