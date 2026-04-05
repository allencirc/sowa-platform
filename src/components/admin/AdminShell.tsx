"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  user: {
    name?: string | null;
    email: string;
    role: UserRole;
  };
  /**
   * Server-rendered slot for anything that should sit between the topbar and
   * the main content (currently the READ_ONLY banner). Kept as a slot so that
   * server components can be passed through a client boundary.
   */
  banner?: ReactNode;
  children: ReactNode;
}

/**
 * Client wrapper that owns the mobile-drawer state for the admin layout.
 * On `lg+` the sidebar is static and the hamburger is hidden; on narrower
 * viewports the sidebar collapses behind a hamburger so the main content
 * gets the full width.
 */
export function AdminShell({ user, banner, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close the drawer on route change so tapping a nav link feels right.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <AdminSidebar
        user={user}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar user={user} onMenuClick={() => setMobileNavOpen(true)} />
        {banner}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
