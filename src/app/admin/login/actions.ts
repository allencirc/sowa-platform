"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    // signIn throws NEXT_REDIRECT on success — this is expected
    // signIn throws AuthError on invalid credentials
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    // Re-throw NEXT_REDIRECT and other non-auth errors
    throw error;
  }

  // This line should never be reached due to redirect
  return {};
}
