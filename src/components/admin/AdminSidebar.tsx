"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/generated/prisma/client";
import {
  LayoutDashboard,
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
    label: "Media",
    href: "/admin/media",
    icon: Image,
    roles: ["ADMIN", "EDITOR"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
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
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-primary text-text-inverse">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <Wind className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">SOWA</p>
          <p className="text-xs text-white/60">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {filteredItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-light text-white"
                      : "text-white/70 hover:bg-primary-light hover:text-white"
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
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-primary-light hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
