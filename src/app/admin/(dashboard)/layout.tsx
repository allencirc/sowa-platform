import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/queries";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReadOnlyBanner } from "@/components/admin/ReadOnlyBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()]);

  // Proxy handles the redirect — if we get here without a session, just show nothing
  if (!session?.user) {
    return null;
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return (
    <AdminShell user={user} siteName={settings.siteName} banner={<ReadOnlyBanner />}>
      {children}
    </AdminShell>
  );
}
