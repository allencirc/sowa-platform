"use client";

import { Menu } from "lucide-react";
import type { UserRole } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/Badge";

const roleBadgeVariant: Record<UserRole, "primary" | "secondary" | "accent"> = {
  ADMIN: "primary",
  EDITOR: "secondary",
  VIEWER: "accent",
};

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email: string;
    role: UserRole;
  };
  onMenuClick: () => void;
}

export function AdminTopbar({ user, onMenuClick }: AdminTopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-surface-card px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-2 rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-primary lg:hidden"
        aria-label="Open navigation"
        aria-controls="admin-sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <span className="min-w-0 truncate text-sm text-text-secondary">
          {user.name || user.email}
        </span>
        <Badge variant={roleBadgeVariant[user.role]}>{user.role}</Badge>
      </div>
    </header>
  );
}
