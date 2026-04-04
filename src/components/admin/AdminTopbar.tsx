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
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-surface-card px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary">
          {user.name || user.email}
        </span>
        <Badge variant={roleBadgeVariant[user.role]}>
          {user.role}
        </Badge>
      </div>
    </header>
  );
}
