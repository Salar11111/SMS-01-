export const APP_ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_HOME: Record<AppRole, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

export function canAccessRolePath(userRole: AppRole, path: string): boolean {
  if (path.startsWith("/admin")) return userRole === "ADMIN";
  if (path.startsWith("/teacher")) return userRole === "TEACHER";
  if (path.startsWith("/student")) return userRole === "STUDENT";
  if (path.startsWith("/parent")) return userRole === "PARENT";
  return true;
}

export function formatRole(role: AppRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
