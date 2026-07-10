import { Suspense } from "react";
import { Wind } from "lucide-react";
import { LoginForm } from "./LoginForm";
import Link from "next/link";
import { getSiteSettings } from "@/lib/queries";

export const metadata = {
  title: "Admin Login",
};

export default async function AdminLoginPage() {
  const settings = await getSiteSettings();
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-surface-card p-8 shadow-lg">
          {/* Branding */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Wind className="h-7 w-7 text-text-inverse" />
            </div>
            <h1 className="text-2xl font-bold text-primary">{settings.siteName} Admin</h1>
            <p className="mt-1 text-sm text-text-secondary">{settings.siteFullName}</p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/" className="text-accent-dark hover:text-accent-dark transition-colors">
            &larr; Back to main site
          </Link>
        </p>
      </div>
    </div>
  );
}
