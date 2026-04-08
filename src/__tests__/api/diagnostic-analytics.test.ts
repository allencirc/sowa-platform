import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma";

// Mock auth-utils before importing the route
vi.mock("@/lib/auth-utils", () => ({
  requireRole: vi.fn(),
  requireAuth: vi.fn(),
  AuthError: class AuthError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

// Mock role weights
vi.mock("@/lib/diagnostic-role-weights", () => ({
  ROLE_FAMILY_BY_KEY: {
    technician: { label: "Technician pathway" },
    engineer: { label: "Engineering pathway" },
    hse: { label: "Health, safety & environment" },
    marine_ops: { label: "Marine operations" },
    project_commercial: { label: "Project & commercial management" },
    data_digital: { label: "Data & digital" },
  },
}));

import { GET } from "@/app/api/admin/diagnostic/analytics/route";
import { requireRole } from "@/lib/auth-utils";
import { NextRequest } from "next/server";

const mockRequireRole = vi.mocked(requireRole);

function makeRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL("http://localhost:3000/api/admin/diagnostic/analytics");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

const fakeSessions = [
  {
    id: "1",
    sessionId: "uuid-1",
    answers: {},
    scores: { "mechanical-maintenance": 8, "safety-protocols": 6 },
    maxPossible: { "mechanical-maintenance": 10, "safety-protocols": 10 },
    topRoleFamilies: ["technician", "engineer", "hse"],
    topSkillGaps: ["marine-operations", "data-analysis", "safety-protocols"],
    completedAt: new Date("2026-04-01T10:00:00Z"),
    locale: "en",
    referrerSource: null,
    createdAt: new Date("2026-04-01T10:00:00Z"),
  },
  {
    id: "2",
    sessionId: "uuid-2",
    answers: {},
    scores: { "mechanical-maintenance": 6 },
    maxPossible: { "mechanical-maintenance": 10 },
    topRoleFamilies: ["engineer", "technician", "data_digital"],
    topSkillGaps: ["marine-operations", "safety-protocols"],
    completedAt: new Date("2026-04-02T14:00:00Z"),
    locale: "en",
    referrerSource: null,
    createdAt: new Date("2026-04-02T14:00:00Z"),
  },
];

const fakeSkills = [
  { slug: "mechanical-maintenance", name: "Mechanical Maintenance", category: "TECHNICAL" },
  { slug: "safety-protocols", name: "Safety Protocols", category: "SAFETY" },
  { slug: "marine-operations", name: "Marine Operations", category: "TECHNICAL" },
  { slug: "data-analysis", name: "Data Analysis", category: "DIGITAL" },
];

describe("GET /api/admin/diagnostic/analytics", () => {
  beforeEach(() => {
    mockRequireRole.mockResolvedValue({
      id: "admin-1",
      email: "admin@sowa.ie",
      role: "ADMIN",
      mustChangePassword: false,
    });
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockRequireRole.mockRejectedValue(Object.assign(new Error("Unauthorized"), { status: 401 }));
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 403 for VIEWER role", async () => {
    mockRequireRole.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
    const res = await GET(makeRequest());
    expect(res.status).toBe(403);
  });

  it("returns analytics JSON with correct shape", async () => {
    (prismaMock.diagnosticSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      fakeSessions,
    );
    (prismaMock.skill.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(fakeSkills);

    const res = await GET(makeRequest({ from: "2026-04-01", to: "2026-04-08" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.totalCompletions).toBe(2);
    expect(json.completionsByDate).toHaveLength(2);
    expect(json.averageScoresByCategory).toBeDefined();
    expect(json.topSkillGaps).toBeDefined();
    expect(json.topRoleFamilies).toBeDefined();
    expect(json.localeBreakdown).toBeDefined();
    expect(json.dateRange).toBeDefined();
  });

  it("aggregates skill gaps correctly", async () => {
    (prismaMock.diagnosticSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      fakeSessions,
    );
    (prismaMock.skill.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(fakeSkills);

    const res = await GET(makeRequest({ from: "2026-04-01", to: "2026-04-08" }));
    const json = await res.json();

    // marine-operations appears in both sessions
    const marineGap = json.topSkillGaps.find(
      (g: { slug: string }) => g.slug === "marine-operations",
    );
    expect(marineGap?.count).toBe(2);
    expect(marineGap?.name).toBe("Marine Operations");
  });

  it("filters by locale", async () => {
    (prismaMock.diagnosticSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (prismaMock.skill.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const res = await GET(makeRequest({ locale: "ga" }));
    expect(res.status).toBe(200);

    // Verify that findMany was called with locale filter
    expect(prismaMock.diagnosticSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ locale: "ga" }),
      }),
    );
  });

  it("returns CSV for export=csv with ADMIN role", async () => {
    (prismaMock.diagnosticSession.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
      fakeSessions,
    );
    (prismaMock.skill.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(fakeSkills);

    const res = await GET(makeRequest({ from: "2026-04-01", to: "2026-04-08", export: "csv" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");

    const text = await res.text();
    expect(text).toContain("SOWA Diagnostic Analytics Report");
    expect(text).toContain("Category,Average Score (%)");
  });

  it("rejects CSV export for EDITOR role", async () => {
    mockRequireRole.mockResolvedValue({
      id: "editor-1",
      email: "editor@sowa.ie",
      role: "EDITOR",
      mustChangePassword: false,
    });

    const res = await GET(makeRequest({ export: "csv" }));
    expect(res.status).toBe(403);
  });

  it("validates date format in query params", async () => {
    const res = await GET(makeRequest({ from: "not-a-date" }));
    expect(res.status).toBe(400);
  });
});
