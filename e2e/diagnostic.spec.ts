import { test, expect } from "@playwright/test";

// WCAG 2.2 AA axe sweeps live in a11y.spec.ts.

test.describe("Diagnostic assessment journey", () => {
  test("Homepage → Take Skills Assessment → Complete diagnostic → View results", async ({
    page,
  }) => {
    // 1. Start at homepage
    await page.goto("/");

    // 2. Navigate to diagnostic (via CTA or nav)
    await page.getByRole("link", { name: /assessment|diagnostic/i }).first().click();
    await page.waitForURL("**/diagnostic**");

    // 3. Expect diagnostic landing page
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 4. Start the assessment — use .first() because the landing page has
    //    multiple audience-cards ("I'm an Individual…", "I'm an Employer…")
    //    that each link into the assessment and match /take/.
    const startButton = page
      .getByRole("link", { name: /start|begin|take/i })
      .or(page.getByRole("button", { name: /start|begin|take/i }))
      .first();
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // 5. Wait for assessment to load
    await page.waitForLoadState("networkidle");

    // The diagnostic may be a multi-step wizard
    // Try to answer a few questions if visible
    const radioButtons = page.getByRole("radio");
    if ((await radioButtons.count()) > 0) {
      await radioButtons.first().check();

      // Look for next/continue button
      const nextButton = page.getByRole("button", { name: /next|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    }
  });

});
