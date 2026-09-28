import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  createAcademicYearSchema,
  createClassSchema,
  createSubjectSchema,
  assignTeacherToClassSchema,
  enrollStudentSchema,
  linkParentStudentSchema,
  saveAttendanceSchema,
  createAssignmentSchema,
  saveGradesSchema,
} from "@/lib/schemas";

describe("schemas", () => {
  describe("createUserSchema", () => {
    it("validates valid user data", () => {
      const data = {
        name: "John Doe",
        email: "john@school.edu",
        role: "TEACHER",
        password: "password123",
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const data = {
        name: "John",
        email: "invalid-email",
        role: "TEACHER",
        password: "password123",
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const data = {
        name: "John",
        email: "john@school.edu",
        role: "TEACHER",
        password: "short",
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("rejects invalid role", () => {
      const data = {
        name: "John",
        email: "john@school.edu",
        role: "INVALID",
        password: "password123",
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("createAcademicYearSchema", () => {
    it("validates valid year name", () => {
      const result = createAcademicYearSchema.safeParse({ name: "2026-2027" });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = createAcademicYearSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("createClassSchema", () => {
    it("validates valid class data", () => {
      const result = createClassSchema.safeParse({
        name: "Grade 10",
        section: "B",
        academicYearId: "abc123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing fields", () => {
      const result = createClassSchema.safeParse({ name: "Grade 10" });
      expect(result.success).toBe(false);
    });
  });

  describe("createSubjectSchema", () => {
    it("validates valid subject", () => {
      const result = createSubjectSchema.safeParse({ name: "Mathematics" });
      expect(result.success).toBe(true);
    });
  });

  describe("assignTeacherToClassSchema", () => {
    it("validates valid assignment", () => {
      const result = assignTeacherToClassSchema.safeParse({
        classId: "class1",
        subjectId: "subject1",
        teacherProfileId: "teacher1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("enrollStudentSchema", () => {
    it("validates valid enrollment", () => {
      const result = enrollStudentSchema.safeParse({
        studentProfileId: "student1",
        classId: "class1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("linkParentStudentSchema", () => {
    it("validates valid link", () => {
      const result = linkParentStudentSchema.safeParse({
        parentId: "parent1",
        studentId: "student1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("saveAttendanceSchema", () => {
    it("validates valid attendance data", () => {
      const result = saveAttendanceSchema.safeParse({
        classId: "class1",
        date: "2026-09-27",
        statuses: { student1: "PRESENT", student2: "ABSENT" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = saveAttendanceSchema.safeParse({
        classId: "class1",
        date: "2026-09-27",
        statuses: { student1: "INVALID" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAssignmentSchema", () => {
    it("validates valid assignment", () => {
      const result = createAssignmentSchema.safeParse({
        classId: "class1",
        subjectId: "subject1",
        title: "Homework 1",
        maxScore: 100,
        dueDate: new Date("2026-10-01"),
      });
      expect(result.success).toBe(true);
    });

    it("rejects non-positive maxScore", () => {
      const result = createAssignmentSchema.safeParse({
        classId: "class1",
        subjectId: "subject1",
        title: "Homework 1",
        maxScore: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("saveGradesSchema", () => {
    it("validates valid grades", () => {
      const result = saveGradesSchema.safeParse({
        assignmentId: "assignment1",
        scores: { student1: "95", student2: "87.5" },
      });
      expect(result.success).toBe(true);
    });

    it("rejects non-numeric scores", () => {
      const result = saveGradesSchema.safeParse({
        assignmentId: "assignment1",
        scores: { student1: "abc" },
      });
      expect(result.success).toBe(false);
    });
  });
});