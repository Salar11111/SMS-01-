import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { changePassword } from "@/lib/actions/admin";
import { ActionForm } from "@/components/action-form";
import { DashboardShell, Field, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { formatRole, navFor } from "@/lib/rbac";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.role) redirect("/login");

  return (
    <DashboardShell
      title={formatRole(session.user.role)}
      role={session.user.role}
      userName={session.user.name}
      nav={navFor(session.user.role)}
    >
      <PageHeader title="Password" description="Replace the password on your account." />
      <Panel title="Change password">
        <ActionForm action={changePassword} className="grid max-w-md gap-3">
          <Field label="Current password" name="currentPassword" type="password" required />
          <Field label="New password" name="newPassword" type="password" required />
          <div>
            <SubmitButton>Update password</SubmitButton>
          </div>
        </ActionForm>
      </Panel>
    </DashboardShell>
  );
}
