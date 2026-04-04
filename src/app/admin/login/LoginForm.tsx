"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const authError = searchParams.get("error");
  const [csrfToken, setCsrfToken] = useState("");

  // Fetch CSRF token on mount
  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((res) => res.json())
      .then((data) => setCsrfToken(data.csrfToken))
      .catch(() => {});
  }, []);

  return (
    <form
      method="POST"
      action="/api/auth/callback/credentials"
      className="flex flex-col gap-5"
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="admin@sowa.ie"
        autoComplete="email"
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />

      {authError && (
        <div className="flex items-center gap-2 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Invalid email or password
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!csrfToken}
      >
        Sign In
      </Button>
    </form>
  );
}
