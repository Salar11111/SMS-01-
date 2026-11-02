import NextAuth, { CredentialsSignin, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { attemptsIncrement, db } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { ROLE_HOME, type AppRole } from "@/lib/rbac";

class RecordsUnavailable extends CredentialsSignin {
  code = "records_unavailable";
}

declare module "next-auth" {
  interface User {
    role: AppRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AppRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AppRole;
    invalid?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: AppRole }).role;
        token.name = user.name;
        token.email = user.email;
      }
      if (!token.id) return token;

      const dbUser = await db.user_findUnique({ id: token.id });
      if (!dbUser || dbUser.active === false) {
        token.invalid = true;
        return token;
      }
      token.invalid = false;
      token.role = dbUser.role as AppRole;
      token.name = dbUser.name;
      token.email = dbUser.email;
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (token.invalid || !token.id || !session.user) {
        return {
          ...session,
          user: { id: "", email: "", name: "", role: "STUDENT" },
        };
      }
      session.user.id = token.id;
      session.user.role = token.role as AppRole;
      session.user.name = (token.name as string) || session.user.name;
      session.user.email = (token.email as string) || session.user.email || "";
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const key = email.trim().toLowerCase();
        try {
          if (await isLoginBlocked(key)) return null;

          const user = await db.user_findUnique({ email: key });
          const valid =
            user &&
            user.passwordHash &&
            user.active !== false &&
            (await bcrypt.compare(password, user.passwordHash));
          if (!valid) {
            await recordLoginFailure(key);
            return null;
          }

          await resetLoginAttempts(key);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as AppRole,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
          console.error("Sign-in could not reach school records");
          throw new RecordsUnavailable();
        }
      },
    }),
  ],
});

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

async function isLoginBlocked(key: string): Promise<boolean> {
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

async function recordLoginFailure(key: string): Promise<void> {
  const attempt = await db.loginAttempt_upsert({ key }, { key, attempts: 1 }, attemptsIncrement());
  if (attempt.attempts >= MAX_ATTEMPTS && !attempt.lockedAt) {
    await db.loginAttempt_update({ id: attempt.id }, { lockedAt: new Date() });
  }
}

async function resetLoginAttempts(key: string): Promise<void> {
  await db.loginAttempt_deleteMany({ key });
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session;
}

export async function requireRole(...roles: AppRole[]) {
  const session = await requireUser();
  if (!roles.includes(session.user.role)) throw new ForbiddenError();
  return session;
}

export async function requirePageRole(role: AppRole) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== role) redirect(ROLE_HOME[session.user.role]);
  return session;
}

export async function requireTeacherProfile() {
  const session = await requireRole("TEACHER");
  const teacher = await db.teacherProfile_findUnique({ userId: session.user.id });
  if (!teacher) throw new Error("Teacher profile missing");
  return { session, teacher };
}

export async function assertTeacherOwnsClass(teacherProfileId: string, classId: string) {
  const link = await db.classSubject_findFirst({ teacherProfileId, classId });
  if (!link) throw new Error("Not assigned to this class");
  return link;
}

export async function assertTeacherOwnsAssignment(teacherProfileId: string, assignmentId: string) {
  const assignment = await db.assignment_findUnique({ id: assignmentId });
  if (!assignment) throw new Error("Assignment not found");
  const link = await db.classSubject_findFirst({
    teacherProfileId,
    classId: assignment.classId,
    subjectId: assignment.subjectId,
  });
  if (!link) throw new Error("Not assigned to this subject");
  return assignment;
}
