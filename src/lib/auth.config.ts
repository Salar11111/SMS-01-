import type { NextAuthConfig } from "next-auth";

export type SessionRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role as SessionRole | undefined;

      const isAuthPage = pathname.startsWith("/login");
      const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/teacher") ||
        pathname.startsWith("/student") ||
        pathname.startsWith("/parent");

      if (isAuthPage) return true;
      if (isProtected) return isLoggedIn && !!role;
      return true;
    },
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
