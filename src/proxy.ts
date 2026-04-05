import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { applyReadOnly } from "@/lib/read-only";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── READ_ONLY kill switch ──────────────────────────────────────────────
  // See docs/disaster-recovery.md §4.2. When READ_ONLY=true, block any
  // mutating HTTP method on API or admin surfaces with a 503 so recovery
  // can proceed without taking readers offline. Safe methods (GET/HEAD/
  // OPTIONS) fall through to the usual flow.
  //
  // Authentication endpoints are exempt so operators can still sign in to
  // run the recovery playbook. `/api/auth/*` is NextAuth (JWT strategy, so
  // no DB writes on sign-in) and `/admin/login` carries the sign-in server
  // action. The admin password-rotation action enforces READ_ONLY itself.
  const isAuthEndpoint =
    pathname.startsWith("/api/auth/") || pathname === "/admin/login";
  if (
    !isAuthEndpoint &&
    (pathname.startsWith("/api") || pathname.startsWith("/admin"))
  ) {
    const readOnly = applyReadOnly(request);
    if (readOnly) return readOnly;
  }

  // /api routes do their own auth; proxy only handles /admin from here on.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await auth();
  const CHANGE_PASSWORD_PATH = "/admin/change-password";

  // Already logged in — skip the login page
  if (pathname === "/admin/login" && session?.user) {
    const target = session.user.mustChangePassword
      ? CHANGE_PASSWORD_PATH
      : "/admin";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Protect all /admin routes except /admin/login
  if (pathname !== "/admin/login" && !session?.user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Force password rotation before any other admin route is reachable.
  // The only escape hatches are the change-password page itself and signing out.
  if (
    session?.user?.mustChangePassword &&
    pathname !== CHANGE_PASSWORD_PATH &&
    pathname !== "/admin/login"
  ) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
