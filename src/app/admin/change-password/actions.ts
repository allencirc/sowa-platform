"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isReadOnly, READ_ONLY_MESSAGE } from "@/lib/read-only";

export interface ChangePasswordState {
  error?: string;
  success?: boolean;
}

// Reject the documented default so the rotation is meaningful.
const FORBIDDEN_PASSWORDS = new Set(["changeme123", "password", "admin"]);

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .max(128, "New password is too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => !FORBIDDEN_PASSWORDS.has(d.newPassword.toLowerCase()), {
    message: "Choose a password that is not on the common-defaults list",
    path: ["newPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "New password must differ from the current password",
    path: ["newPassword"],
  });

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  // Defence in depth: proxy blocks mutating /admin traffic in READ_ONLY
  // mode, but Server Actions can bypass proxy matchers (see Next 16 proxy
  // docs), so the action refuses directly too.
  if (isReadOnly()) {
    return { error: READ_ONLY_MESSAGE };
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const parsed = schema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { error: "Account is not configured for password login" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
    },
  });

  // Force a fresh login so the JWT is reissued without the
  // mustChangePassword flag — the simplest way to guarantee the
  // token can never be re-used to bypass the rotation requirement.
  await signOut({ redirectTo: "/admin/login?passwordChanged=1" });

  return { success: true };
}
