import { test, expect } from "@playwright/test";

test.describe("Security headers", () => {
  test("homepage response carries the required security headers", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);

    const headers = response.headers();

    // Exact-value headers
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");

    // HSTS — must include a long max-age and subdomains
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["strict-transport-security"]).toContain("includeSubDomains");

    // Permissions-Policy — camera/microphone/geolocation disabled
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["permissions-policy"]).toContain("microphone=()");
    expect(headers["permissions-policy"]).toContain("geolocation=()");

    // CSP — core directives present, nonce-based (no unsafe-inline)
    const csp = headers["content-security-policy"];
    expect(csp).toBeTruthy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");

    // Per-request nonce must be present on script-src and style-src
    expect(csp).toMatch(/script-src[^;]*'nonce-[a-f0-9-]+'/);
    expect(csp).toMatch(/style-src[^;]*'nonce-[a-f0-9-]+'/);

    // unsafe-inline must NOT appear anywhere in the CSP
    expect(csp).not.toContain("'unsafe-inline'");
  });
});
