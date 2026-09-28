import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { isLoginBlocked, recordLoginFailure, resetLoginAttempts } from "@/lib/rate-limit";
import type { AppRole } from "@/lib/rbac";

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
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
        if (await isLoginBlocked(key)) return null;

        const user = await prisma.user.findUnique({ where: { email: key } });
        const valid = user && (await bcrypt.compare(password, user.passwordHash));
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
      },
    }),
  ],
});
