"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma/client";
import {
  LayoutDashboard,
  BarChart3,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  Newspaper,
  Users,
  Settings,
  LogOut,
  Wind,
  Image,
  ClipboardList,
  Mail,
  Trash2,
  Stethoscope,
  X,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Careers",
    href: "/admin/careers",
    icon: Briefcase,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: GraduationCap,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: Calendar,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Research",
    href: "/admin/research",
    icon: FileText,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "News",
    href: "/admin/news",
    icon: Newspaper,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Registrations",
    href: "/admin/registrations",
    icon: ClipboardList,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Subscribers",
    href: "/admin/subscribers",
    icon: Mail,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: Image,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "EDITOR", "VIEWER"],
  },
  {
    label: "Diagnostic Insights",
    href: "/admin/analytics/diagnostic",
    icon: Stethoscope,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Trash",
    href: "/admin/trash",
    icon: Trash2,
    roles: ["ADMIN"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
];

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email: string;
    role: UserRole;
  };
  /** Controls the mobile drawer. Ignored on lg+ where the sidebar is always visible. */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ user, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role));

  // Lock body scroll while the mobile drawer is open, and close on Escape.
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        id="admin-sidebar"
        role="dialog"
        aria-modal={mobileOpen ? "true" : undefined}
        aria-label="Admin navigation"
        aria-hidden={
          !mobileOpen && typeof window !== "undefined" && window.innerWidth < 1024
            ? true
            : undefined
        }
        className={cn(
          // Base: full-height column, deep ocean background
          "flex h-screen w-64 shrink-0 flex-col bg-primary text-text-inverse",
          // Desktop: static in flow
          "lg:static lg:translate-x-0",
          // Mobile: fixed drawer that slides in from the left
          "fixed inset-y-0 left-0 z-50 shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              <Wind className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">SOWA</p>
              <p className="text-xs text-white/60">Admin Panel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-primary-light hover:text-white lg:hidden"
            aria-label="Close navigation"
            tabIndex={mobileOpen ? 0 : -1}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {filteredItems.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-light text-white"
                        : "text-white/70 hover:bg-primary-light hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info + sign out */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium">{user.name || user.email}</p>
            <p className="truncate text-xs text-white/50">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-primary-light hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
