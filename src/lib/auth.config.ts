import type { NextAuthConfig, Session } from "next-auth";

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
    async session({ session, token }): Promise<Session> {
      if (!session.user || token.invalid || !token.id) {
        return {
          ...session,
          user: { id: "", email: "", name: "", role: "STUDENT" },
        };
      }
      session.user.id = token.id as string;
      session.user.role = token.role as SessionRole;
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
