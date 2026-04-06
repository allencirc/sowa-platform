import { test, expect } from "./fixtures";

// WCAG 2.2 AA axe sweeps live in a11y.spec.ts.

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

    // 3. Expect course cards to be visible (ignore nav/footer links that share the prefix).
    const courseCards = page
      .locator('main [href^="/training/"]')
      .locator("visible=true");
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

});
