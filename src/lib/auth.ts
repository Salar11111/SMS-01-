import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/prisma";
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
        if (await isLoginBlocked(key)) return null;

        const user = await db.user_findUnique({ email: key });
        const valid =
          user &&
          user.active !== false &&
          (await bcrypt.compare(password, user.passwordHash));
        if (!valid) {
          await recordLoginFailure(key);
          return null;
        }

        await resetLoginAttempts(key);

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.name as string,
          role: user.role as AppRole,
        };
      },
    }),
  ],
});
