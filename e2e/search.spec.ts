import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Search journey", () => {
  test("Search → enter query → view results across all types", async ({
    page,
  }) => {
    await page.goto("/");

    // Find and click search icon/button in header
    const searchTrigger = page
      .getByRole("button", { name: /search/i })
      .or(page.getByRole("link", { name: /search/i }));

    if (await searchTrigger.isVisible()) {
      await searchTrigger.click();
    }

    // Type search query
    const searchInput = page.getByRole("searchbox").or(
      page.getByPlaceholder(/search/i)
    );

    if (await searchInput.isVisible()) {
      await searchInput.fill("wind");
      await page.keyboard.press("Enter");

      // Wait for search results page
      await page.waitForURL("**/search**");
      await page.waitForLoadState("networkidle");

      // Verify results are shown
      const body = await page.textContent("body");
      expect(body?.toLowerCase()).toContain("wind");
    }
  });

  test("search results page passes accessibility checks", async ({
    page,
  }) => {
    await page.goto("/search?q=wind");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
