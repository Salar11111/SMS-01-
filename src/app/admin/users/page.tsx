import { db } from "@/lib/prisma";
import { createUser, setUserActive, updateUser } from "@/lib/actions/admin";
import { ActionForm } from "@/components/action-form";
import { PageHeader, Panel, Field, SubmitButton } from "@/components/ui";
import { formatRole, type AppRole } from "@/lib/rbac";

const roles: AppRole[] = ["ADMIN", "TEACHER", "STUDENT", "PARENT"];

export default async function AdminUsersPage() {
  const users = await db.user_findMany({
    orderBy: { createdAt: "desc" },
    populate: { studentProfile: { studentId: true }, teacherProfile: { id: true } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Create accounts, change roles, and deactivate access." />

      <Panel title="Create user">
        <ActionForm action={createUser} className="grid gap-3 sm:grid-cols-2">
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
              {roles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
          </label>
          <Field label="Student ID (students only)" name="studentId" />
          <div className="flex items-end">
            <SubmitButton>Create user</SubmitButton>
          </div>
        </ActionForm>
      </Panel>

      <Panel title="All users">
        <div className="space-y-4">
          {users.map((user) => {
            const active = user.active !== false;
            return (
              <div
                key={user.id}
                className="grid gap-3 border-b border-[var(--color-line)] pb-4 lg:grid-cols-[1fr_auto]"
              >
                <ActionForm action={updateUser} className="grid gap-3 sm:grid-cols-4">
                  <input type="hidden" name="userId" value={user.id} />
                  <Field label="Name" name="name" required defaultValue={user.name} />
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium text-[var(--color-ink)]">Role</span>
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {formatRole(role)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="text-sm">
                    <span className="mb-1 block font-medium text-[var(--color-ink)]">Email</span>
                    <p className="py-2 text-[var(--color-slate-muted)]">{user.email}</p>
                    <p className="text-xs text-[var(--color-slate-muted)]">
                      {user.studentProfile?.studentId ||
                        (user.teacherProfile ? "Teacher profile" : active ? "Active" : "Inactive")}
                    </p>
                  </div>
                  <div className="flex items-end">
                    <SubmitButton>Save</SubmitButton>
                  </div>
                </ActionForm>
                <ActionForm action={setUserActive} className="flex items-end">
                  <input type="hidden" name="userId" value={user.id} />
                  <input type="hidden" name="active" value={active ? "false" : "true"} />
                  <SubmitButton>{active ? "Deactivate" : "Activate"}</SubmitButton>
                </ActionForm>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
