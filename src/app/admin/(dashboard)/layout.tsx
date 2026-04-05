import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { ReadOnlyBanner } from "@/components/admin/ReadOnlyBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
    <AdminShell user={user} banner={<ReadOnlyBanner />}>
      {children}
    </AdminShell>
  );
}
