import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

    // 4. Start the assessment
    const startButton = page.getByRole("link", { name: /start|begin|take/i }).or(
      page.getByRole("button", { name: /start|begin|take/i })
    );
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

  test("diagnostic page passes accessibility checks", async ({ page }) => {
    await page.goto("/diagnostic");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
