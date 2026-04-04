import { auth } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/client";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new AuthError("Unauthorized", 401);
  }

  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden", 403);
  }

  return user;
}
