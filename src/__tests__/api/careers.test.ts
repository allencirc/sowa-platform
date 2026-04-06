import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma";

// Mock auth before importing routes
vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn().mockResolvedValue({ id: "user-1", role: "ADMIN" }),
  requireRole: vi.fn().mockResolvedValue({ id: "user-1", role: "ADMIN" }),
}));

vi.mock("@/lib/api-utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api-utils")>();
  return {
    ...original,
    applyRateLimit: vi.fn().mockReturnValue(null),
  };
});

vi.mock("@/lib/versions", () => ({
  createContentVersion: vi.fn().mockResolvedValue(undefined),
}));

// Dynamic import of route handlers — done after mocks are set up
async function importGET() {
  const mod = await import("@/app/api/careers/route");
  return mod.GET;
}

function makeRequest(url: string, options: RequestInit = {}) {
  return new Request(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  }) as unknown as import("next/server").NextRequest;
}

// ── Fixtures ─────────────────────────────────────────────

function makeCareerRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "c1",
    slug: "turbine-tech",
    title: "Turbine Technician",
    sector: "OPERATIONS_MAINTENANCE",
    entryLevel: "ENTRY",
    description: "Maintain turbines.",
    salaryMin: 35000,
    salaryMax: 55000,
    keyResponsibilities: ["Inspect blades"],
    qualifications: ["Level 6 Cert"],
    workingConditions: "Offshore",
    growthOutlook: "Strong",
    status: "PUBLISHED",
    createdAt: new Date(),
    updatedAt: new Date(),
    skills: [
      { skill: { slug: "mechanical-systems", name: "Mechanical Systems", category: "TECHNICAL" } },
    ],
    pathwayFrom: [],
    relatedCourses: [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────

describe("GET /api/careers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated career list", async () => {
    const row = makeCareerRow();
    (prismaMock.career.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([row]);
    (prismaMock.career.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const GET = await importGET();
    const request = makeRequest("http://localhost:3000/api/careers");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // API may return { data: [...] } or [...] depending on implementation
    const items = Array.isArray(data) ? data : data.data;
    expect(items).toHaveLength(1);
    expect(items[0].slug).toBe("turbine-tech");
  });

  it("returns 429 when rate limited", async () => {
    const { applyRateLimit } = await import("@/lib/api-utils");
    const { NextResponse } = await import("next/server");
    (applyRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      NextResponse.json({ error: "Rate limited" }, { status: 429 }),
    );

    const GET = await importGET();
    const request = makeRequest("http://localhost:3000/api/careers");
    const response = await GET(request);

    expect(response.status).toBe(429);
  });
});
