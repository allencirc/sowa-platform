import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma";

vi.mock("@/lib/api-utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/api-utils")>();
  return {
    ...original,
    applyRateLimit: vi.fn().mockReturnValue(null),
  };
});

function makeRequest(url: string, options: RequestInit = {}) {
  return new Request(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  }) as unknown as import("next/server").NextRequest;
}

describe("GET /api/diagnostic/questions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns diagnostic questions", async () => {
    (prismaMock.diagnosticQuestion.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "q1",
        text: "Rate your knowledge",
        type: "SCALE",
        options: null,
        scaleMin: 1,
        scaleMax: 5,
        scaleLabels: { "1": "Beginner", "5": "Expert" },
        scoreImpact: { "mechanical-systems": 1 },
      },
    ]);

    const { GET } = await import("@/app/api/diagnostic/questions/route");
    const request = makeRequest("http://localhost:3000/api/diagnostic/questions");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // API may wrap in { data: [...] } or return array directly
    const items = Array.isArray(data) ? data : data.data;
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe("scale");
  });
});

describe("POST /api/diagnostic/results", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for missing answers", async () => {
    const { POST } = await import("@/app/api/diagnostic/results/route");
    const request = makeRequest("http://localhost:3000/api/diagnostic/results", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("calculates and returns diagnostic results", async () => {
    // Mock all the data the diagnostic engine needs
    (prismaMock.diagnosticQuestion.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: "q1",
        text: "Rate knowledge",
        type: "SCALE",
        options: null,
        scaleMin: 1,
        scaleMax: 5,
        scaleLabels: null,
        scoreImpact: { "mechanical-systems": 1 },
      },
      {
        id: "q8",
        text: "Interest area",
        type: "SINGLE_CHOICE",
        options: [
          { label: "Technical", value: "technical", scoreImpact: null },
        ],
        scaleMin: null,
        scaleMax: null,
        scaleLabels: null,
        scoreImpact: null,
      },
    ]);
    (prismaMock.skill.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { slug: "mechanical-systems", name: "Mechanical Systems", category: "TECHNICAL" },
    ]);
    (prismaMock.career.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        slug: "offshore-wind-turbine-technician",
        title: "Turbine Tech",
        sector: "OPERATIONS_MAINTENANCE",
        entryLevel: "ENTRY",
        description: "Desc",
        salaryMin: 35000,
        salaryMax: 55000,
        keyResponsibilities: [],
        qualifications: ["Cert"],
        workingConditions: null,
        growthOutlook: null,
        skills: [],
        pathwayFrom: [],
        relatedCourses: [],
      },
    ]);
    (prismaMock.course.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const { POST } = await import("@/app/api/diagnostic/results/route");
    const request = makeRequest("http://localhost:3000/api/diagnostic/results", {
      method: "POST",
      body: JSON.stringify({ answers: { q1: "3", q8: "technical" } }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.scores).toBeDefined();
    expect(data.gaps).toBeDefined();
    expect(data.recommendedCareers).toBeDefined();
  });
});
