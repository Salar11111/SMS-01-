import { describe, it, expect } from "vitest";
import { APP_ROLES, ROLE_HOME, canAccessRolePath, formatRole } from "@/lib/rbac";

describe("rbac", () => {
  describe("APP_ROLES", () => {
    it("contains all four roles", () => {
      expect(APP_ROLES).toEqual(["ADMIN", "TEACHER", "STUDENT", "PARENT"]);
    });
  });

  describe("ROLE_HOME", () => {
    it("maps each role to correct path", () => {
      expect(ROLE_HOME.ADMIN).toBe("/admin");
      expect(ROLE_HOME.TEACHER).toBe("/teacher");
      expect(ROLE_HOME.STUDENT).toBe("/student");
      expect(ROLE_HOME.PARENT).toBe("/parent");
    });
  });

  describe("canAccessRolePath", () => {
    it("allows admin to access admin paths", () => {
      expect(canAccessRolePath("ADMIN", "/admin")).toBe(true);
      expect(canAccessRolePath("ADMIN", "/admin/users")).toBe(true);
    });

    it("denies non-admin access to admin paths", () => {
      expect(canAccessRolePath("TEACHER", "/admin")).toBe(false);
      expect(canAccessRolePath("STUDENT", "/admin/users")).toBe(false);
      expect(canAccessRolePath("PARENT", "/admin")).toBe(false);
    });

    it("allows teacher to access teacher paths", () => {
      expect(canAccessRolePath("TEACHER", "/teacher")).toBe(true);
      expect(canAccessRolePath("TEACHER", "/teacher/grades")).toBe(true);
    });

    it("allows student to access student paths", () => {
      expect(canAccessRolePath("STUDENT", "/student")).toBe(true);
      expect(canAccessRolePath("STUDENT", "/student/grades")).toBe(true);
    });

    it("allows parent to access parent paths", () => {
      expect(canAccessRolePath("PARENT", "/parent")).toBe(true);
    });

    it("allows any role to access non-role paths", () => {
      expect(canAccessRolePath("ADMIN", "/login")).toBe(true);
      expect(canAccessRolePath("TEACHER", "/")).toBe(true);
      expect(canAccessRolePath("STUDENT", "/about")).toBe(true);
    });
  });

  describe("formatRole", () => {
    it("formats role names correctly", () => {
      expect(formatRole("ADMIN")).toBe("Admin");
      expect(formatRole("TEACHER")).toBe("Teacher");
      expect(formatRole("STUDENT")).toBe("Student");
      expect(formatRole("PARENT")).toBe("Parent");
    });
  });
});