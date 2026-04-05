import { test, expect, devices } from "@playwright/test";

/**
 * Regression tests for the mobile navigation drawer.
 *
 * Context: A previous bug let `backdrop-blur-sm` on the sticky <header> create a
 * containing block, which trapped the fixed-position drawer inside the 64px header,
 * leaving the page with no visible menu background and text bleeding through.
 * axe-core did not catch it because it is a layout/stacking-context defect, not a
 * rule violation. These tests assert the observable invariants directly.
 */

test.use({ ...devices["Pixel 5"] });

const VIEWPORT_MIN_COVERAGE = 0.9; // drawer must cover ≥90% of viewport height

test.describe("Mobile navigation drawer", () => {
  test("opens, covers the viewport, has an opaque background, and closes", async ({
    page,
  }) => {
    await page.goto("/");

    const hamburger = page.getByRole("button", { name: /open menu/i });
    await expect(hamburger).toBeVisible();
    await hamburger.click();

    const drawer = page.getByRole("dialog", { name: /navigation menu/i });
    await expect(drawer).toBeVisible();

    // 1. Drawer must fill (essentially) the full viewport height — not be
    //    clipped to the header's height by a parent containing block.
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("viewport not set");
    const box = await drawer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThanOrEqual(2);
    expect(box!.height).toBeGreaterThanOrEqual(
      viewport.height * VIEWPORT_MIN_COVERAGE
    );

    // 2. Drawer must have a fully opaque background (no alpha < 1). This is the
    //    exact symptom of the old bug: text from the page showed through because
    //    the drawer was effectively unrendered.
    const bg = await drawer.evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    expect(bg).toMatch(/^rgba?\(/);
    const alphaMatch = bg.match(/rgba?\(([^)]+)\)/);
    const parts = alphaMatch![1].split(",").map((s) => s.trim());
    const alpha = parts.length === 4 ? parseFloat(parts[3]) : 1;
    expect(alpha).toBe(1);

    // 3. A backdrop exists and also covers the viewport.
    const backdrop = page.locator('[aria-hidden="true"].fixed.inset-0');
    const backdropBox = await backdrop.first().boundingBox();
    expect(backdropBox).not.toBeNull();
    expect(backdropBox!.height).toBeGreaterThanOrEqual(
      viewport.height * VIEWPORT_MIN_COVERAGE
    );

    // 4. Explicit close button inside the drawer works.
    const closeBtn = drawer.getByRole("button", { name: /close menu/i });
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(drawer).toBeHidden();
  });

  test("closes on Escape", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const drawer = page.getByRole("dialog", { name: /navigation menu/i });
    await expect(drawer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("closes on backdrop click", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const drawer = page.getByRole("dialog", { name: /navigation menu/i });
    await expect(drawer).toBeVisible();
    // Click in the far-left area, which is the backdrop (drawer is right-aligned).
    await page.mouse.click(10, 200);
    await expect(drawer).toBeHidden();
  });

  test("closes after navigating via a link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();
    const drawer = page.getByRole("dialog", { name: /navigation menu/i });
    await drawer.getByRole("link", { name: "Careers" }).click();
    await expect(page).toHaveURL(/\/careers$/);
    await expect(drawer).toBeHidden();
  });

  test("body scroll is locked while open and restored on close", async ({
    page,
  }) => {
    await page.goto("/");
    const getOverflow = () =>
      page.evaluate(() => document.body.style.overflow);

    expect(await getOverflow()).toBe("");
    await page.getByRole("button", { name: /open menu/i }).click();
    expect(await getOverflow()).toBe("hidden");
    await page.keyboard.press("Escape");
    expect(await getOverflow()).toBe("");
  });
});
