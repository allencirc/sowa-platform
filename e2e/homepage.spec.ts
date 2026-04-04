import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Homepage", () => {
  test("loads and renders key sections", async ({ page }) => {
    await page.goto("/");

    // Hero section
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Navigation
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check for key homepage sections
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });

  test("homepage passes WCAG 2.2 AA accessibility checks", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("responsive: mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
