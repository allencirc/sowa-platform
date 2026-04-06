import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { NextRequest } from "next/server";

// Auth is stubbed so the proxy never tries to read a real session during
// unit tests. The READ_ONLY path short-circuits before auth() is called.
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

async function importProxy() {
  const mod = await import("@/proxy");
  return mod.proxy;
}

function makeRequest(url: string, method = "GET"): NextRequest {
  const req = new Request(url, { method });
  // The Next.js proxy signature expects NextRequest, which exposes
  // `nextUrl`. For our tests we only read `nextUrl.pathname` and `method`,
  // so a tiny adapter is sufficient.
  Object.defineProperty(req, "nextUrl", {
    value: new URL(url),
  });
  return req as unknown as NextRequest;
}

describe("proxy READ_ONLY enforcement", () => {
  const original = process.env.READ_ONLY;

  beforeEach(() => {
    delete process.env.READ_ONLY;
    vi.resetModules();
  });

  afterEach(() => {
    if (original === undefined) {
      delete process.env.READ_ONLY;
    } else {
      process.env.READ_ONLY = original;
    }
  });

  it("allows GET /api/* when READ_ONLY is off", async () => {
    const proxy = await importProxy();
    const res = await proxy(makeRequest("https://example.com/api/careers", "GET"));
    expect(res?.status).not.toBe(503);
  });

  it("blocks POST /api/* with a 503 when READ_ONLY is on", async () => {
    process.env.READ_ONLY = "true";
    const proxy = await importProxy();
    const res = await proxy(makeRequest("https://example.com/api/careers", "POST"));
    expect(res?.status).toBe(503);
    expect(res?.headers.get("Retry-After")).toBe("300");
    const body = await res?.json();
    expect(body?.error).toBe("read_only_mode");
  });

  it("blocks DELETE /admin/* with a 503 when READ_ONLY is on", async () => {
    process.env.READ_ONLY = "true";
    const proxy = await importProxy();
    const res = await proxy(makeRequest("https://example.com/admin/careers/some-slug", "DELETE"));
    expect(res?.status).toBe(503);
  });

  it("still serves GET /admin/* readers when READ_ONLY is on", async () => {
    process.env.READ_ONLY = "true";
    const proxy = await importProxy();
    const res = await proxy(makeRequest("https://example.com/admin", "GET"));
    // No 503 — request either falls through (NextResponse.next) or is
    // redirected to login. Either way the kill switch did not trigger.
    expect(res?.status).not.toBe(503);
  });

  it("exempts /api/auth/* (NextAuth) from READ_ONLY so operators can log in", async () => {
    process.env.READ_ONLY = "true";
    const proxy = await importProxy();
    const res = await proxy(
      makeRequest("https://example.com/api/auth/callback/credentials", "POST"),
    );
    expect(res?.status).not.toBe(503);
  });

  it("exempts the /admin/login server action from READ_ONLY", async () => {
    process.env.READ_ONLY = "true";
    const proxy = await importProxy();
    const res = await proxy(makeRequest("https://example.com/admin/login", "POST"));
    expect(res?.status).not.toBe(503);
  });
});
