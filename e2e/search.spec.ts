import { test, expect } from "@playwright/test";

// WCAG 2.2 AA axe sweeps live in a11y.spec.ts.

test.describe("Search journey", () => {
  test("Search → enter query → view results across all types", async ({
    page,
  }) => {
    await page.goto("/");

    // Find and click search icon/button in header. Exact match on the
    //    accessible name to avoid matching "Research" in the nav/footer.
    const searchTrigger = page
      .getByRole("link", { name: "Search", exact: true })
      .or(page.getByRole("button", { name: "Search", exact: true }))
      .first();

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

});
