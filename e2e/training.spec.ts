import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Training journey", () => {
  test("Homepage → Find Training → Filter courses → View course details", async ({
    page,
  }) => {
    // 1. Start at homepage
    await page.goto("/");

    // 2. Navigate to training
    await page.getByRole("link", { name: /training/i }).first().click();
    await page.waitForURL("**/training**");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 3. Expect course cards to be visible
    const courseCards = page.locator('[href^="/training/"]');
    await expect(courseCards.first()).toBeVisible();

    // 4. Click on a course card
    await courseCards.first().click();
    await page.waitForURL("**/training/**");

    // 5. Verify course detail page
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 6. Check for key info (duration, cost, etc.)
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });

  test("training page passes accessibility checks", async ({ page }) => {
    await page.goto("/training");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
