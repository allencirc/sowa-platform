import { test as base, expect } from "@playwright/test";

/**
 * Shared Playwright test fixture.
 *
 * - Pre-seeds the `sowa_consent` cookie (see src/lib/analytics.ts) so the
 *   consent banner never renders during tests. On a fresh context the
 *   banner is fixed-position and intercepts pointer events, causing click
 *   targets to be obscured in journey tests. Each spec that needs a clean
 *   pointer path should import `test` from here instead of "@playwright/test".
 */
export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    const url = new URL(baseURL ?? "http://localhost:3000");
    const value = encodeURIComponent(
      JSON.stringify({
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
      })
    );
    await context.addCookies([
      {
        name: "sowa_consent",
        value,
        domain: url.hostname,
        path: "/",
        httpOnly: false,
        secure: url.protocol === "https:",
        sameSite: "Lax",
      },
    ]);
    await use(context);
  },
});

export { expect };
