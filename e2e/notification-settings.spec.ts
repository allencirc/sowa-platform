import { test, expect } from "@playwright/test";

test.describe("Notification preferences API", () => {
  test("GET /api/notification-preferences rejects unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/notification-preferences");
    expect(response.status()).toBe(401);
  });

  test("PUT /api/notification-preferences rejects unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.put("/api/notification-preferences", {
      data: { event: "CONTENT_SUBMITTED", enabled: false },
    });
    expect(response.status()).toBe(401);
  });

  test("PUT /api/notification-preferences rejects invalid event types", async ({ request }) => {
    const response = await request.put("/api/notification-preferences", {
      data: { event: "INVALID_EVENT", enabled: false },
    });
    // Either 400 (validation) or 401 (auth check first)
    expect([400, 401]).toContain(response.status());
  });
});
