import { Wind } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "./ChangePasswordForm";

export const metadata = {
  title: "Change Password — SOWA Admin",
};

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const forced = session.user.mustChangePassword;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-surface-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Wind className="h-7 w-7 text-text-inverse" />
            </div>
            <h1 className="text-2xl font-bold text-primary">
              {forced ? "Set a new password" : "Change password"}
            </h1>
            {forced && (
              <p className="mt-2 text-sm text-text-secondary">
                This account is still using the seeded default password. Choose
                a new password of at least 12 characters before continuing.
              </p>
            )}
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
