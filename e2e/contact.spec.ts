import { test, expect } from "@playwright/test";

test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/contact");
  });

  test("renders the contact form with all fields", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /contact us/i })).toBeVisible();
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-organisation")).toBeVisible();
    await expect(page.locator("#contact-subject")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByRole("button", { name: /send message/i }).click();

    // Should show at least one error (name is required)
    await expect(page.getByText(/name is required/i)).toBeVisible();
  });

  test("submits successfully with valid data", async ({ page }) => {
    await page.locator("#contact-name").fill("Test User");
    await page.locator("#contact-email").fill("test@example.com");
    await page.locator("#contact-subject").selectOption("GENERAL");
    await page.locator("#contact-message").fill("This is a test message for the contact form.");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /send message/i }).click();

    // Wait for success message
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10_000 });
  });

  test("is navigable from the main header", async ({ page }) => {
    await page.goto("/en");
    const contactLink = page.getByRole("navigation").getByRole("link", { name: /contact/i });
    await expect(contactLink).toBeVisible();
    await contactLink.click();
    await expect(page).toHaveURL(/\/en\/contact/);
  });
});
