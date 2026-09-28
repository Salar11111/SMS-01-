"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui";
import type { ActionState } from "@/lib/action-result";

export function ActionForm({
  action,
  className,
  children,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {state?.error ? (
        <div className="mb-3 sm:col-span-full">
          <Alert type="error">{state.error}</Alert>
        </div>
      ) : null}
      {state?.ok ? (
        <div className="mb-3 sm:col-span-full">
          <Alert type="success">Saved.</Alert>
        </div>
      ) : null}
      {children}
    </form>
  );
}
