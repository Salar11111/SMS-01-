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

export function navFor(role: AppRole): { href: string; label: string }[] {
  const account = { href: "/account", label: "Password" };
  if (role === "ADMIN") {
    return [
      { href: "/admin", label: "Overview" },
      { href: "/admin/users", label: "Users" },
      { href: "/admin/classes", label: "Classes" },
      { href: "/admin/enrollment", label: "Enrollment" },
      { href: "/admin/reports", label: "Reports" },
      account,
    ];
  }
  if (role === "TEACHER") {
    return [
      { href: "/teacher", label: "My classes" },
      { href: "/teacher/attendance", label: "Attendance" },
      { href: "/teacher/grades", label: "Grades" },
      account,
    ];
  }
  if (role === "STUDENT") {
    return [
      { href: "/student", label: "Overview" },
      { href: "/student/attendance", label: "Attendance" },
      { href: "/student/grades", label: "Grades" },
      account,
    ];
  }
  return [
    { href: "/parent", label: "Children" },
    { href: "/parent/attendance", label: "Attendance" },
    { href: "/parent/grades", label: "Grades" },
    account,
  ];
}
