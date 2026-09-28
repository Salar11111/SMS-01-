import { describe, it, expect } from "vitest";
import { startOfDay, dateInputValue, formatDate, classLabel, isSafeCallbackUrl } from "@/lib/utils";

describe("utils", () => {
  describe("startOfDay", () => {
    it("returns midnight UTC for given date", () => {
      const date = new Date("2026-09-27T15:30:00.000Z");
      const result = startOfDay(date);
      expect(result.toISOString()).toBe("2026-09-27T00:00:00.000Z");
    });

    it("defaults to current date", () => {
      const result = startOfDay();
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
    });
  });

  describe("dateInputValue", () => {
    it("returns YYYY-MM-DD format", () => {
      const date = new Date("2026-09-27T15:30:00.000Z");
      expect(dateInputValue(date)).toBe("2026-09-27");
    });
  });

  describe("formatDate", () => {
    it("formats date string", () => {
      const result = formatDate("2026-09-27T00:00:00.000Z");
      expect(result).toContain("Sep");
      expect(result).toContain("27");
      expect(result).toContain("2026");
    });

    it("formats Date object", () => {
      const result = formatDate(new Date("2026-09-27T00:00:00.000Z"));
      expect(result).toContain("Sep");
    });
  });

  describe("classLabel", () => {
    it("formats class name with section", () => {
      expect(classLabel("Grade 10", "B")).toBe("Grade 10 — Section B");
    });
  });

  describe("isSafeCallbackUrl", () => {
    it("returns true for valid relative URL", () => {
      expect(isSafeCallbackUrl("/admin")).toBe(true);
      expect(isSafeCallbackUrl("/teacher/grades")).toBe(true);
    });

    it("returns false for absolute URLs", () => {
      expect(isSafeCallbackUrl("https://evil.com")).toBe(false);
      expect(isSafeCallbackUrl("http://localhost:3000/admin")).toBe(false);
    });

    it("returns false for protocol-relative URLs", () => {
      expect(isSafeCallbackUrl("//evil.com")).toBe(false);
    });

    it("returns false for null/undefined", () => {
      expect(isSafeCallbackUrl(null)).toBe(false);
      expect(isSafeCallbackUrl(undefined)).toBe(false);
    });
  });
});