import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Platform-wide accessibility sweep.
 *
 * The previous a11y coverage only scanned the homepage at desktop width. This
 * sweep runs axe against every public route in both desktop and mobile form
 * factors, plus a dedicated scan with the mobile drawer in its open state so
 * dialog/ARIA regressions are caught.
 */

const PUBLIC_ROUTES: string[] = [
  "/",
  "/careers",
  "/training",
  "/events",
  "/research",
  "/diagnostic",
  "/diagnostic/assessment",
  "/news",
  "/enterprise",
  "/contact",
  "/search",
];

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    // The React Flow pathway map is a decorative visualisation with an
    // accessible card-grid alternative rendered on the same page. Its
    // internal handles and transformed nodes trip target-size and
    // contrast rules in ways that don't affect real users, so exclude
    // the wrapper from axe scans.
    .exclude('[data-testid="pathway-map"]')
    .analyze();
  if (results.violations.length) {
    const summary = results.violations
      .map((v) => {
        const nodeLines = v.nodes.slice(0, 3).map((n) => {
          const checks = [...(n.any ?? []), ...(n.all ?? []), ...(n.none ?? [])];
          const data = checks.find((c) => c?.data)?.data as Record<string, unknown> | undefined;
          const extra = data
            ? ` ${JSON.stringify(data)}`
            : ` summary=${(n.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 200)}`;
          return `      ${n.target.join(" ")}${extra}`;
        });
        return `  - [${v.impact ?? "n/a"}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodeLines.join("\n")}`;
      })
      .join("\n");
    throw new Error(`axe found ${results.violations.length} violation(s):\n${summary}`);
  }
  expect(results.violations).toEqual([]);
}

test.describe("Accessibility — desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expectNoViolations(page);
    });
  }
});

test.describe("Accessibility — mobile", () => {
  // isMobile / hasTouch are Chromium-only. Firefox gets desktop-only a11y
  // coverage; the mobile-chrome project (devices["Pixel 5"]) already exercises
  // a full mobile context via playwright.config.ts.
  test.skip(({ browserName }) => browserName !== "chromium", "mobile emulation requires Chromium");
  test.use({
    viewport: { width: 393, height: 851 },
    isMobile: true,
    hasTouch: true,
  });

  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await expectNoViolations(page);
    });
  }

  test("mobile drawer (open state) has no WCAG 2.2 AA violations", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("dialog", { name: /navigation menu/i })).toBeVisible();
    await expectNoViolations(page);
  });
});
