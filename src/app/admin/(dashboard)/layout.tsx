import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Debug: check what cookies are available
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const authCookies = allCookies
    .filter((c) => c.name.includes("auth"))
    .map((c) => ({ name: c.name, valueLen: c.value.length }));

  const session = await auth();

  if (!session?.user) {
    // Temporarily show debug info instead of redirecting
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Auth Debug (temporary)</h1>
        <p><strong>Session:</strong> {JSON.stringify(session)}</p>
        <p className="mt-2"><strong>Auth cookies found:</strong> {JSON.stringify(authCookies)}</p>
        <p className="mt-2"><strong>Total cookies:</strong> {allCookies.length}</p>
        <p className="mt-4">
          <a href="/api/auth/signin?callbackUrl=/admin" className="text-blue-600 underline">
            Go to sign in
          </a>
        </p>
      </div>
    );
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
