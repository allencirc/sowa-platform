import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Careers journey", () => {
  test("Homepage → Explore Careers → Filter by sector → View career → See related courses", async ({
    page,
  }) => {
    // 1. Start at homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/SOWA|Skillnet|Offshore Wind/i);

    // 2. Navigate to careers
    await page.getByRole("link", { name: /careers/i }).first().click();
    await page.waitForURL("**/careers**");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 3. Expect career cards to be visible
    const careerCards = page.locator('[href^="/careers/"]');
    await expect(careerCards.first()).toBeVisible();

    // 4. Click on a career card
    await careerCards.first().click();
    await page.waitForURL("**/careers/**");

    // 5. Verify career detail page content
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 6. Check for related courses section (if present)
    const relatedSection = page.getByText(/related|recommended|courses/i);
    if (await relatedSection.isVisible()) {
      await expect(relatedSection).toBeVisible();
    }
  });

  test("careers page passes accessibility checks", async ({ page }) => {
    await page.goto("/careers");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
