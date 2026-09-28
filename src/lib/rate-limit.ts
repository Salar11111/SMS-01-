import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function isLoginBlocked(key: string): Promise<boolean> {
  const attempt = await prisma.loginAttempt.findUnique({ where: { key } });
  if (!attempt) return false;
  if (attempt.attempts < MAX_ATTEMPTS) return false;
  if (!attempt.lockedAt) return false;
  const expired = Date.now() - attempt.lockedAt.getTime() >= LOCK_DURATION_MS;
  if (expired) {
    await prisma.loginAttempt.update({
      where: { id: attempt.id },
      data: { attempts: 0, lockedAt: null },
    });
    return false;
  }
  return true;
}

export async function recordLoginFailure(key: string): Promise<void> {
  const attempt = await prisma.loginAttempt.upsert({
    where: { key },
    create: { key, attempts: 1 },
    update: { attempts: { increment: 1 } },
  });
  if (attempt.attempts >= MAX_ATTEMPTS && !attempt.lockedAt) {
    await prisma.loginAttempt.update({
      where: { id: attempt.id },
      data: { lockedAt: new Date() },
    });
  }
}

export async function resetLoginAttempts(key: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { key } });
}