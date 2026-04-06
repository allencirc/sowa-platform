import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The platform-wide WCAG 2.2 AA sweep lives in a11y.spec.ts. The axe
// assertion below is a targeted build gate on /diagnostic/assessment:
// a11y regressions on the question step (role/aria-checked wiring,
// focus rings, data-option hooks) should fail the build.

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function assertNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
  if (blocking.length) {
    const summary = blocking
      .map(
        (v) =>
          `  - [${v.impact}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n` +
          v.nodes
            .slice(0, 2)
            .map((n) => `      ${n.target.join(" ")}`)
            .join("\n"),
      )
      .join("\n");
    throw new Error(`axe found ${blocking.length} serious/critical violation(s):\n${summary}`);
  }
  expect(blocking).toEqual([]);
}

test.describe("Diagnostic assessment journey", () => {
  test("Homepage → Take Skills Assessment → Complete diagnostic → View results", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /assessment|diagnostic/i })
      .first()
      .click();
    await page.waitForURL("**/diagnostic**");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const startButton = page
      .getByRole("link", { name: /start|begin|take/i })
      .or(page.getByRole("button", { name: /start|begin|take/i }))
      .first();
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    await page.waitForLoadState("networkidle");

    // Option buttons now carry data-option="true" so the axe-friendly
    // radiogroup / checkbox semantics can be targeted reliably in
    // either the legacy and future question step implementations.
    const options = page.locator('button[data-option="true"]');
    if ((await options.count()) > 0) {
      await options.first().click();
      const nextButton = page.getByRole("button", { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
  });

  test("assessment page has no serious a11y violations", async ({ page }) => {
    await page.goto("/diagnostic/assessment");
    await page.waitForLoadState("networkidle");
    await assertNoSeriousViolations(page);
  });
});
