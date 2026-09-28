"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Input, Button, Alert } from "@/components/ui";
import { isSafeCallbackUrl } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const callback = searchParams.get("callbackUrl");
    router.push(isSafeCallbackUrl(callback) ? callback : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        placeholder="you@school.edu"
      />
      <Input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        icon={<Lock className="h-4 w-4" />}
        placeholder="••••••••"
      />
      {error && (
        <Alert type="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        loading={loading}
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}