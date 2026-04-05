import { test, expect } from "@playwright/test";

test.describe("API auth enforcement", () => {
  test("POST /api/skills rejects unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.post("/api/skills", {
      data: {
        slug: "e2e-test-skill",
        name: "E2E Test Skill",
        category: "TECHNICAL",
      },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("POST /api/careers rejects unauthenticated requests", async ({
    request,
  }) => {
    // Sanity check — every content-mutation POST should reject anon writes.
    // Skills was previously the outlier; this test locks the pattern in.
    const response = await request.post("/api/careers", {
      data: {
        slug: "e2e-test-career",
        title: "E2E Test Career",
        sector: "Operations & Maintenance",
        entryLevel: "Entry",
        description: "test",
        qualifications: [],
        skills: [],
      },
    });

    expect(response.status()).toBe(401);
  });
});
