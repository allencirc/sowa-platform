import { test, expect } from "@playwright/test";

test.describe("Enterprise page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/enterprise");
  });

  test("renders hero with heading and CTAs", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /build your owe talent pipeline/i }),
    ).toBeVisible();

    const diagnosticCta = page.getByRole("link", { name: /start team assessment/i }).first();
    await expect(diagnosticCta).toBeVisible();
    await expect(diagnosticCta).toHaveAttribute("href", /\/diagnostic/);

    const trainingCta = page.getByRole("link", { name: /browse training/i }).first();
    await expect(trainingCta).toBeVisible();
    await expect(trainingCta).toHaveAttribute("href", /\/training/);
  });

  test("renders all 4 value proposition cards", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Workforce Planning" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Skills Gap Analysis" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Training Directory" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Industry Intelligence" })).toBeVisible();
  });

  test("renders How It Works with 3 steps", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /how it works/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Assess", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Plan", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Develop", exact: true })).toBeVisible();
  });

  test("renders diagnostic CTA banner", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /assess your team/i })).toBeVisible();
  });

  test("renders training directory CTA section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /enterprise training solutions/i }),
    ).toBeVisible();
    const link = page.getByRole("link", { name: /explore training directory/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /\/training/);
  });

  test("renders testimonial placeholder section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /what employers say/i })).toBeVisible();
    await expect(page.getByText("Atlantic Energy Services")).toBeVisible();
  });

  test("renders contact form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /discuss your workforce needs/i }),
    ).toBeVisible();
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("is navigable from the main header", async ({ page }) => {
    await page.goto("/en");
    const enterpriseLink = page.getByRole("navigation").getByRole("link", { name: /enterprise/i });
    await expect(enterpriseLink).toBeVisible();
    await enterpriseLink.click();
    await expect(page).toHaveURL(/\/en\/enterprise/);
  });

  test("homepage audience card links to enterprise page", async ({ page }) => {
    await page.goto("/en");
    const card = page.getByRole("link", { name: /enterprise support/i }).first();
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("href", /\/enterprise/);
  });

  test("responsive: mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en/enterprise");
    await expect(
      page.getByRole("heading", { level: 1, name: /build your owe talent pipeline/i }),
    ).toBeVisible();
    await expect(page.getByText("Workforce Planning")).toBeVisible();
  });
});
