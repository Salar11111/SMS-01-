import { test, expect } from "@playwright/test";

test("teacher can open a class and save attendance", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("teacher@school.edu");
  await page.getByLabel(/password/i).fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/teacher/);
  await page.goto("/teacher/attendance");
  const open = page.getByRole("link", { name: /take attendance/i }).first();
  await expect(open).toBeVisible();
  await open.click();
  await expect(page.getByRole("button", { name: /save attendance/i })).toBeVisible();
  await page.getByRole("button", { name: /save attendance/i }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
});
