import { test, expect } from "@playwright/test";

test.describe("Admin Settings — Theme Customisation", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin settings (assumes admin auth is handled by test setup or cookies)
    await page.goto("/admin/settings");
  });

  test("displays theme customisation sections", async ({ page }) => {
    // Wait for settings to load (loader disappears)
    await page.waitForSelector("text=Brand Colors", { timeout: 10000 });

    // Verify all theme sections are visible
    await expect(page.getByText("Brand Colors")).toBeVisible();
    await expect(page.getByText("Typography")).toBeVisible();
    await expect(page.getByText("Branding")).toBeVisible();
    await expect(page.getByText("Footer & Social Links")).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole("button", { name: /Save Changes/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reset to Defaults/i })).toBeVisible();
  });

  test("color pickers are interactive", async ({ page }) => {
    await page.waitForSelector("text=Brand Colors", { timeout: 10000 });

    // Check that color inputs exist (9 total: 3 groups x 3 variants)
    const colorInputs = page.locator('input[type="color"]');
    await expect(colorInputs).toHaveCount(9);

    // Check that hex text inputs exist alongside color pickers
    const hexInputs = page.locator('input[placeholder="#000000"]');
    expect(await hexInputs.count()).toBeGreaterThanOrEqual(9);
  });

  test("font selectors show curated options", async ({ page }) => {
    await page.waitForSelector("text=Typography", { timeout: 10000 });

    // Find the heading font select
    const headingSelect = page.locator("select").first();
    const options = headingSelect.locator("option");

    // Should have at least the default + curated fonts
    expect(await options.count()).toBeGreaterThan(10);
  });

  test("shows live font preview", async ({ page }) => {
    await page.waitForSelector("text=Typography", { timeout: 10000 });

    // Preview section should exist
    await expect(page.getByText("Heading Preview")).toBeVisible();
    await expect(page.getByText("The quick brown fox jumps over the lazy dog")).toBeVisible();
  });

  test("social link inputs are present", async ({ page }) => {
    await page.waitForSelector("text=Footer & Social Links", { timeout: 10000 });

    // Check for social media input placeholders
    await expect(page.getByPlaceholder("Twitter / X URL")).toBeVisible();
    await expect(page.getByPlaceholder("LinkedIn URL")).toBeVisible();
    await expect(page.getByPlaceholder("Facebook URL")).toBeVisible();
    await expect(page.getByPlaceholder("YouTube URL")).toBeVisible();
    await expect(page.getByPlaceholder("Instagram URL")).toBeVisible();
  });
});
