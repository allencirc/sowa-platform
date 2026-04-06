"use client";

import { type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserRole } from "@/generated/prisma/client";

export function withRole<P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: UserRole[],
) {
  function RoleGuard(props: P) {
    const { user, isLoading, isAuthenticated } = useCurrentUser();
    const router = useRouter();

    if (isLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
      router.replace("/admin");
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  RoleGuard.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return RoleGuard;
}
