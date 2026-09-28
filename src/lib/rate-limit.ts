import { db } from "@/lib/prisma";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function isLoginBlocked(key: string): Promise<boolean> {
  const attempt = await db.loginAttempt_findUnique({ key });
  if (!attempt) return false;
  if (attempt.attempts < MAX_ATTEMPTS) return false;
  if (!attempt.lockedAt) return false;
  const expired = Date.now() - attempt.lockedAt.getTime() >= LOCK_DURATION_MS;
  if (expired) {
    await db.loginAttempt_update({ id: attempt.id }, { attempts: 0, lockedAt: null });
    return false;
  }
  return true;
}

export async function recordLoginFailure(key: string): Promise<void> {
  const attempt = await db.loginAttempt_upsert(
    { key },
    { key, attempts: 1 },
    { attempts: { increment: 1 } }
  );
  if (attempt.attempts >= MAX_ATTEMPTS && !attempt.lockedAt) {
    await db.loginAttempt_update({ id: attempt.id }, { lockedAt: new Date() });
  }
}

export async function resetLoginAttempts(key: string): Promise<void> {
  await db.loginAttempt_deleteMany({ key });
}
