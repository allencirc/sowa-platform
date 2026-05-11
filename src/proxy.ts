import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { applyReadOnly } from "@/lib/read-only";
import { isLocale, matchLocale, type Locale } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// CSP nonce helper
// ---------------------------------------------------------------------------

/**
 * Build a Content-Security-Policy header with a per-request nonce.
 *
 * `'unsafe-eval'` is retained on script-src ONLY because React Flow
 * (@xyflow/react) uses `new Function()` internally for its layout engine.
 * Remove it once React Flow ships a CSP-safe build.
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net https://snap.licdn.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "img-src 'self' data: blob: https://images.unsplash.com https://www.google-analytics.com https://www.facebook.com https://px.ads.linkedin.com https://*.public.blob.vercel-storage.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "media-src 'self' https://*.public.blob.vercel-storage.com",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.facebook.com https://px.ads.linkedin.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Attach the CSP header and x-nonce to any outgoing response. */
function withCsp(response: NextResponse, nonce: string): NextResponse {
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("x-nonce", nonce);
  // When the prototype is gated behind the preview wall, also de-list it from
  // search engines — defence-in-depth alongside the 401 returned to bots.
  if (process.env.PREVIEW_WALL === "true") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

// ---------------------------------------------------------------------------
// Preview wall (basic-auth gate)
// ---------------------------------------------------------------------------

// Paths that must remain reachable without basic-auth credentials.
// /api/cron/* is authenticated by Vercel cron via CRON_SECRET (see vercel.json).
const PREVIEW_WALL_BYPASS_PREFIXES = ["/api/cron"];

const PREVIEW_WALL_BODY = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SOWA Prototype — Restricted</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 1.5rem; line-height: 1.55; color: #1A1A2E; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #0C2340; }
    a { color: #4A90D9; }
    button { font: inherit; padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid currentColor; background: transparent; cursor: pointer; }
    @media (prefers-color-scheme: dark) { body { color: #F7F9FC; } h1 { color: #F7F9FC; } }
  </style>
</head>
<body>
  <h1>This prototype is currently restricted.</h1>
  <p>The SOWA platform prototype is paused from public access while the tender is under review.</p>
  <p><button onclick="location.reload()">Try signing in again</button></p>
</body>
</html>`;

/**
 * Check the basic-auth preview wall. Returns a 401 response if the request
 * should be rejected, or `null` if it should pass through.
 *
 * Activated only when `PREVIEW_WALL=true`. Credentials come from `PREVIEW_USER`
 * and `PREVIEW_PASS`. /api/cron/* is bypassed so Vercel cron keeps working.
 */
function checkPreviewWall(request: NextRequest): NextResponse | null {
  if (process.env.PREVIEW_WALL !== "true") return null;

  const { pathname } = request.nextUrl;
  if (PREVIEW_WALL_BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  const user = process.env.PREVIEW_USER;
  const pass = process.env.PREVIEW_PASS;
  if (!user || !pass) {
    return new NextResponse("Preview wall is enabled but credentials are not configured.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(":");
      if (idx > -1 && decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass) {
        return null;
      }
    } catch {
      // Malformed Authorization header — fall through to 401.
    }
  }

  return new NextResponse(PREVIEW_WALL_BODY, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="SOWA Prototype", charset="UTF-8"',
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

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
  // Preview wall runs first: when PREVIEW_WALL=true, every request needs
  // basic-auth credentials (PREVIEW_USER/PREVIEW_PASS) except /api/cron/*.
  const wallResponse = checkPreviewWall(request);
  if (wallResponse) return wallResponse;

  const { pathname } = request.nextUrl;

  // Generate a per-request nonce for CSP.
  const nonce = crypto.randomUUID();

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
      return withCsp(NextResponse.redirect(url), nonce);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-sowa-locale", current);
    requestHeaders.set("x-nonce", nonce);
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
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
    if (readOnly) return withCsp(readOnly, nonce);
  }

  // /api routes do their own auth; proxy only handles /admin from here on.
  if (!pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    return withCsp(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
  }

  const session = await auth();
  const CHANGE_PASSWORD_PATH = "/admin/change-password";

  // Already logged in — skip the login page
  if (pathname === "/admin/login" && session?.user) {
    const target = session.user.mustChangePassword ? CHANGE_PASSWORD_PATH : "/admin";
    return withCsp(NextResponse.redirect(new URL(target, request.url)), nonce);
  }

  // Protect all /admin routes except /admin/login
  if (pathname !== "/admin/login" && !session?.user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withCsp(NextResponse.redirect(loginUrl), nonce);
  }

  // Force password rotation before any other admin route is reachable.
  // The only escape hatches are the change-password page itself and signing out.
  if (
    session?.user?.mustChangePassword &&
    pathname !== CHANGE_PASSWORD_PATH &&
    pathname !== "/admin/login"
  ) {
    return withCsp(NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url)), nonce);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  return withCsp(NextResponse.next({ request: { headers: requestHeaders } }), nonce);
}

export const config = {
  // Run on everything except Next internals and static files with an
  // extension (images, fonts, etc.). The proxy itself decides per-path
  // whether to apply i18n redirects, read-only checks, or admin auth.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
