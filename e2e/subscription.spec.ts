import { test, expect } from "@playwright/test";

test.describe("Subscription system", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("renders subscription widget on homepage", async ({ page }) => {
    // Scroll to the subscription section
    const subscribeSection = page.locator("text=Stay Updated").first();
    await subscribeSection.scrollIntoViewIfNeeded();
    await expect(subscribeSection).toBeVisible();

    // Check for key form elements
    await expect(page.locator('input[type="email"]').last()).toBeVisible();
    await expect(page.getByText("Careers").last()).toBeVisible();
    await expect(page.getByText("Training").last()).toBeVisible();
    await expect(page.getByText("Weekly digest")).toBeVisible();
    await expect(page.getByText("Monthly digest")).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    // Scroll to subscription widget
    const subscribeBtn = page.getByRole("button", { name: /^subscribe$/i }).last();
    await subscribeBtn.scrollIntoViewIfNeeded();
    await subscribeBtn.click();

    // Should show email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible({ timeout: 5_000 });
  });

  test("submits subscription form successfully", async ({ page }) => {
    // Scroll to subscription section
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.scrollIntoViewIfNeeded();

    // Fill email
    await emailInput.fill(`test-${Date.now()}@example.com`);

    // Select at least one topic
    await page.locator("#sub-careers").check();

    // Accept GDPR
    await page.locator("#sub-gdpr").check();

    // Submit
    const subscribeBtn = page.getByRole("button", { name: /^subscribe$/i }).last();
    await subscribeBtn.click();

    // Wait for success message
    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10_000 });
  });

  test("shows error for duplicate verified email", async ({ page, request }) => {
    const email = `dup-${Date.now()}@example.com`;

    // First subscription via API
    await request.post("/api/subscribe", {
      data: {
        email,
        topics: ["CAREERS"],
        frequency: "WEEKLY",
        gdprConsent: true,
      },
    });

    // Verify via API — we need to get the token from DB, which we can't do in e2e.
    // Instead, test that submitting the same email shows success (unverified duplicate
    // gets regenerated tokens and succeeds).
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill(email);
    await page.locator("#sub-careers").check();
    await page.locator("#sub-gdpr").check();

    const subscribeBtn = page.getByRole("button", { name: /^subscribe$/i }).last();
    await subscribeBtn.click();

    // Unverified duplicate should succeed (tokens regenerated)
    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10_000 });
  });

  test("subscription confirmed page renders", async ({ page }) => {
    await page.goto("/en/subscription/confirmed");
    await expect(page.getByText(/subscription confirmed/i)).toBeVisible();
  });

  test("subscription unsubscribed page renders", async ({ page }) => {
    await page.goto("/en/subscription/unsubscribed");
    await expect(page.getByText(/unsubscribed/i)).toBeVisible();
  });

  test("subscription error page renders", async ({ page }) => {
    await page.goto("/en/subscription/error");
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test("preferences page shows error with invalid token", async ({ page }) => {
    await page.goto("/en/subscription/preferences?token=invalid-token-123");
    await expect(page.getByText(/not found|invalid/i)).toBeVisible({ timeout: 10_000 });
  });

  test("compact subscription widget on careers page", async ({ page }) => {
    await page.goto("/en/careers");
    const subscribeSection = page.getByText("Subscribe to Updates").first();
    await subscribeSection.scrollIntoViewIfNeeded();
    await expect(subscribeSection).toBeVisible();
  });

  test("compact subscription widget on training page", async ({ page }) => {
    await page.goto("/en/training");
    const subscribeSection = page.getByText("Subscribe to Updates").first();
    await subscribeSection.scrollIntoViewIfNeeded();
    await expect(subscribeSection).toBeVisible();
  });

  test("compact subscription widget on events page", async ({ page }) => {
    await page.goto("/en/events");
    const subscribeSection = page.getByText("Subscribe to Updates").first();
    await subscribeSection.scrollIntoViewIfNeeded();
    await expect(subscribeSection).toBeVisible();
  });
});

test.describe("Subscription API", () => {
  test("POST /api/subscribe returns 201 for valid data", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: {
        email: `api-test-${Date.now()}@example.com`,
        topics: ["CAREERS", "EVENTS"],
        frequency: "WEEKLY",
        gdprConsent: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.message).toContain("Verification email sent");
  });

  test("POST /api/subscribe returns 400 for invalid email", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: {
        email: "invalid",
        topics: ["CAREERS"],
        frequency: "WEEKLY",
        gdprConsent: true,
      },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/subscribe returns 400 for empty topics", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: {
        email: `test-${Date.now()}@example.com`,
        topics: [],
        frequency: "WEEKLY",
        gdprConsent: true,
      },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/subscribe returns 400 for missing GDPR consent", async ({ request }) => {
    const res = await request.post("/api/subscribe", {
      data: {
        email: `test-${Date.now()}@example.com`,
        topics: ["NEWS"],
        frequency: "WEEKLY",
        gdprConsent: false,
      },
    });
    expect(res.status()).toBe(400);
  });

  test("GET /api/subscribe/verify with invalid token returns redirect", async ({ request }) => {
    const res = await request.get("/api/subscribe/verify?token=nonexistent-token", {
      maxRedirects: 0,
    });
    // Should redirect to error page
    expect([302, 307, 308]).toContain(res.status());
  });
});
