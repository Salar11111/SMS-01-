import type { NextAuthConfig } from "next-auth";

export type SessionRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: SessionRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as SessionRole;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
