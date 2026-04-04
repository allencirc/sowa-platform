import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await auth();

  // Already logged in — skip the login page
  if (pathname === "/admin/login" && session?.user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Protect all /admin routes except /admin/login
  if (pathname !== "/admin/login" && !session?.user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
