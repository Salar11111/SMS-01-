import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), count: vi.fn() },
    teacherProfile: { findUnique: vi.fn(), count: vi.fn() },
    studentProfile: { findUnique: vi.fn(), count: vi.fn(), findMany: vi.fn() },
    class: { findMany: vi.fn(), count: vi.fn() },
    academicYear: { findMany: vi.fn() },
    subject: { findMany: vi.fn() },
    enrollment: { findMany: vi.fn(), count: vi.fn() },
    attendanceRecord: { findMany: vi.fn(), count: vi.fn() },
    parentStudent: { findMany: vi.fn() },
    classSubject: { findMany: vi.fn() },
    grade: { findMany: vi.fn() },
    assignment: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/actions/signout", () => ({
  signOutAction: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  isLoginBlocked: vi.fn().mockResolvedValue(false),
  recordLoginFailure: vi.fn(),
  resetLoginAttempts: vi.fn(),
}));

Object.defineProperty(HTMLDialogElement.prototype, "showModal", { writable: true, value: vi.fn() });
Object.defineProperty(HTMLDialogElement.prototype, "close", { writable: true, value: vi.fn() });

HTMLElement.prototype.scrollIntoView = vi.fn();