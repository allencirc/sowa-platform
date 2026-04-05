import { test, expect } from "@playwright/test";

// WCAG 2.2 AA axe sweeps live in a11y.spec.ts (every public route × desktop + mobile).

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

  test("responsive: mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
