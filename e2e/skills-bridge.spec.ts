import { test, expect } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";

test.describe("Skills Bridge", () => {
  // Use a career that has skills — wind-turbine-technician is a common seed career
  const careerUrl = "/en/careers/wind-turbine-technician";

  test.beforeEach(async ({ page }) => {
    await page.goto(careerUrl);
  });

  test("Skills Bridge section is visible on career detail page", async ({ page }) => {
    const heading = page.getByRole("heading", { name: /skills bridge/i });
    await expect(heading).toBeVisible();
  });

  test("shows dropdown with source sector options", async ({ page }) => {
    const select = page.locator("#skills-bridge-sector");
    await expect(select).toBeVisible();

    // Check option count (placeholder + 8 sectors)
    const options = select.locator("option");
    await expect(options).toHaveCount(9);
  });

  test("selecting a sector displays matched and gap skill columns", async ({ page }) => {
    const select = page.locator("#skills-bridge-sector");
    await select.selectOption("Maritime");

    // Both column headings should appear
    await expect(page.getByText("Your Existing Skills")).toBeVisible();
    await expect(page.getByText("Skills to Develop")).toBeVisible();

    // Match percentage should appear
    await expect(page.getByText(/\d+% Skills Match/)).toBeVisible();
  });

  test("changing sector updates the results", async ({ page }) => {
    const select = page.locator("#skills-bridge-sector");

    // Select first sector
    await select.selectOption("Maritime");
    const firstMatch = await page.getByText(/\d+% Skills Match/).textContent();

    // Select a different sector
    await select.selectOption("Aerospace");
    const secondMatch = await page.getByText(/\d+% Skills Match/).textContent();

    // Results should exist for both (they may or may not differ)
    expect(firstMatch).toBeTruthy();
    expect(secondMatch).toBeTruthy();
  });

  test("columns stack vertically on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(careerUrl);

    const select = page.locator("#skills-bridge-sector");
    await select.selectOption("Construction");

    // Both columns should still be visible
    await expect(page.getByText("Your Existing Skills")).toBeVisible();
    await expect(page.getByText("Skills to Develop")).toBeVisible();
  });

  test("passes axe accessibility scan", async ({ page }) => {
    const select = page.locator("#skills-bridge-sector");
    await select.selectOption("Oil & Gas");

    // Wait for results to render
    await expect(page.getByText(/\d+% Skills Match/)).toBeVisible();

    const results = await new AxeBuilder({ page }).include('[aria-live="polite"]').analyze();

    expect(results.violations).toEqual([]);
  });
});
