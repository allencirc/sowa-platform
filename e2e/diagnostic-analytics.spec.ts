import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * E2E tests for the admin diagnostic analytics dashboard.
 *
 * These tests require a running server with an authenticated admin session.
 * In CI, the admin login is handled via the storage state saved by the
 * global setup (if configured), or we log in manually.
 */

const ADMIN_URL = "/admin/analytics/diagnostic";
const LOGIN_URL = "/admin/login";

// Helper: log in as admin if not already authenticated
async function ensureAdminLogin(page: import("@playwright/test").Page) {
  await page.goto(ADMIN_URL);

  // If redirected to login, authenticate
  if (page.url().includes("/login")) {
    await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL ?? "admin@sowa.ie");
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD ?? "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/);
    await page.goto(ADMIN_URL);
  }
}

test.describe("Diagnostic Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminLogin(page);
  });

  test("page loads with correct heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /diagnostic insights/i })).toBeVisible();
  });

  test("renders date range filter buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "7 days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "28 days" })).toBeVisible();
    await expect(page.getByRole("button", { name: "90 days" })).toBeVisible();
  });

  test("renders metric cards", async ({ page }) => {
    // Wait for the loading spinner to disappear
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });

    // Check that metric cards are rendered
    await expect(page.getByText("Total completions")).toBeVisible();
    await expect(page.getByText("Top role family")).toBeVisible();
    await expect(page.getByText("Top skill gap")).toBeVisible();
    await expect(page.getByText("Locales")).toBeVisible();
  });

  test("chart containers render SVG elements", async ({ page }) => {
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });

    // Recharts renders SVG elements inside ResponsiveContainer divs
    const svgCount = await page.locator(".recharts-responsive-container svg").count();
    // We expect at least the radar chart to always render (even with no data)
    expect(svgCount).toBeGreaterThanOrEqual(1);
  });

  test("date range filter changes data", async ({ page }) => {
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });

    // Click the 7 days button
    await page.click('button:has-text("7 days")');

    // Should show loading state briefly, then re-render
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });

    // Page should still be functional
    await expect(page.getByText("Total completions")).toBeVisible();
  });

  test("CSV export button is visible for admin", async ({ page }) => {
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
  });

  test("CSV export triggers download", async ({ page }) => {
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });

    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Export CSV")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain("diagnostic-analytics");
  });

  test("accessibility: no WCAG 2.1 AA violations", async ({ page }) => {
    await page.waitForSelector('[class*="animate-spin"]', { state: "hidden", timeout: 10000 });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe("Diagnostic Insights navigation", () => {
  test("analytics page links to diagnostic insights", async ({ page }) => {
    await page.goto("/admin/analytics");
    if (page.url().includes("/login")) {
      await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL ?? "admin@sowa.ie");
      await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD ?? "admin123");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
      await page.goto("/admin/analytics");
    }

    const link = page.getByRole("link", { name: /diagnostic insights/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/admin\/analytics\/diagnostic/);
  });
});
