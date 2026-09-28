import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { ROLE_HOME, canAccessRolePath, type AppRole } from "@/lib/rbac";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role as AppRole | undefined;

  const isAuthPage = pathname.startsWith("/login");
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/parent");

  if (isAuthPage) {
    if (isLoggedIn && role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
    return NextResponse.next();
  }

  if (isProtected) {
    if (!isLoggedIn || !role) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (!canAccessRolePath(role, pathname)) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/admin/:path*", "/teacher/:path*", "/student/:path*", "/parent/:path*"],
};
