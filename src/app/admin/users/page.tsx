import { prisma } from "@/lib/prisma";
import { createUser } from "@/lib/actions/admin";
import { PageHeader, Panel, DataTable, Field, SubmitButton } from "@/components/ui";
import { formatRole, type AppRole } from "@/lib/rbac";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studentProfile: { select: { studentId: true } },
      teacherProfile: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Create accounts and assign roles." />

      <Panel title="Create user">
        <form action={createUser} className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" name="name" required />
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-[var(--color-ink)]">Role</span>
            <select
              name="role"
              required
              className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
            >
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="PARENT">Parent</option>
            </select>
          </label>
          <Field label="Student ID (students only)" name="studentId" />
          <div className="flex items-end">
            <SubmitButton>Create user</SubmitButton>
          </div>
        </form>
      </Panel>

      <Panel title="All users">
        <DataTable
          headers={["Name", "Email", "Role", "Extra"]}
          rows={users.map((u) => [
            u.name,
            u.email,
            formatRole(u.role as AppRole),
            u.studentProfile?.studentId || (u.teacherProfile ? "Teacher profile" : "—"),
          ])}
        />
      </Panel>
    </div>
  );
}
