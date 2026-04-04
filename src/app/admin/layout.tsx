import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminProviders } from "./providers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const metadata = {
  title: {
    template: "%s — SOWA Admin",
    default: "SOWA Admin",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return (
    <AdminProviders>
      <div className="flex h-screen overflow-hidden bg-surface">
        <AdminSidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
