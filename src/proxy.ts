import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { applyReadOnly } from "@/lib/read-only";
import { isLocale, matchLocale, type Locale } from "@/lib/i18n";

// Paths that are NOT localised — admin UI, API routes, and Next internals.
// Everything else sits under `/[locale]/...` and should be redirected if
// a visitor hits it without a locale prefix.
const NON_LOCALISED_PREFIXES = [
  "/admin",
  "/api",
  "/_next",
  "/favicon",
  "/icon",
  "/apple-icon",
  "/og-image",
  "/robots",
  "/sitemap",
  "/manifest",
];

function isNonLocalised(pathname: string): boolean {
  return NON_LOCALISED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}.`) || pathname.startsWith(`${p}/`),
  );
}

function extractLocale(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 && isLocale(segments[0]) ? segments[0] : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── i18n: public surface ───────────────────────────────────────────────
  // See docs/adr/0001-i18n.md. Non-localised surfaces (admin, api, static
  // assets) fall through untouched. Any other request that doesn't start
  // with a supported locale is redirected to `/{preferred}{path}` using the
  // visitor's Accept-Language header (falling back to `en`). Requests that
  // already carry a locale segment get an `x-sowa-locale` header attached
  // so the root layout — which sits above `[locale]` — can set `<html lang>`
  // without re-parsing the URL.
  if (!isNonLocalised(pathname)) {
    const current = extractLocale(pathname);
    if (!current) {
      const preferred = matchLocale(request.headers.get("accept-language"));
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
      return NextResponse.redirect(url);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-sowa-locale", current);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

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
  const isAuthEndpoint = pathname.startsWith("/api/auth/") || pathname === "/admin/login";
  if (!isAuthEndpoint && (pathname.startsWith("/api") || pathname.startsWith("/admin"))) {
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
    const target = session.user.mustChangePassword ? CHANGE_PASSWORD_PATH : "/admin";
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
  // Run on everything except Next internals and static files with an
  // extension (images, fonts, etc.). The proxy itself decides per-path
  // whether to apply i18n redirects, read-only checks, or admin auth.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
