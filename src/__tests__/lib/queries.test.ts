import { describe, it, expect, beforeEach } from "vitest";
import { prismaMock } from "../mocks/prisma";
import {
  getAllCareers,
  getCareerBySlug,
  getCareersBySector,
  getAllCourses,
  getCourseBySlug,
  getFilteredCourses,
  getAllEvents,
  getUpcomingEvents,
  getAllResearch,
  getFeaturedResearch,
  getAllSkills,
  getDiagnosticQuestions,
  globalSearch,
  getAllNews,
} from "@/lib/queries";

// ── Fixture factories ────────────────────────────────────

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
    skills: [{ skill: { slug: "mechanical-systems" } }],
    pathwayFrom: [
      {
        to: { slug: "senior-tech" },
        type: "PROGRESSION",
        timeframe: "3-5 years",
      },
    ],
    relatedCourses: [{ course: { slug: "gwo-basic-safety" } }],
    ...overrides,
  };
}

function makeCourseRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "co1",
    slug: "gwo-basic-safety",
    title: "GWO Basic Safety Training",
    provider: "Wind Training Ireland",
    providerType: "INDUSTRY",
    description: "GWO accredited safety training.",
    entryRequirements: null,
    deliveryFormat: "IN_PERSON",
    location: "Cork",
    nfqLevel: null,
    duration: "5 days",
    cost: 0,
    costNotes: "Skillnet funded",
    nextStartDate: new Date("2025-09-15"),
    accredited: true,
    certificationAwarded: "GWO BST",
    tags: ["gwo", "safety"],
    status: "PUBLISHED",
    skills: [{ skill: { slug: "safety-management" } }],
    careerRelevance: [{ career: { slug: "turbine-tech" } }],
    ...overrides,
  };
}

function makeEventRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "e1",
    slug: "wind-conference",
    title: "Offshore Wind Conference",
    type: "CONFERENCE",
    startDate: new Date("2025-10-15T09:00:00Z"),
    endDate: new Date("2025-10-15T17:00:00Z"),
    locationType: "PHYSICAL",
    location: "Dublin",
    description: "Annual conference.",
    capacity: 200,
    image: null,
    status: "PUBLISHED",
    ...overrides,
  };
}

function makeResearchRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "r1",
    slug: "owe-skills-gap",
    title: "OWE Skills Gap Analysis",
    author: "Dr. Smith",
    organisation: "SEAI",
    publicationDate: new Date("2025-03-01"),
    summary: "Analysis of OWE skills gaps.",
    categories: ["policy", "workforce"],
    isFeatured: true,
    image: null,
    status: "PUBLISHED",
    ...overrides,
  };
}

function makeSkillRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "s1",
    slug: "mechanical-systems",
    name: "Mechanical Systems",
    category: "TECHNICAL",
    ...overrides,
  };
}

// ── Career queries ───────────────────────────────────────

describe("Career queries", () => {
  it("getAllCareers maps DB rows to frontend types", async () => {
    const row = makeCareerRow();
    (prismaMock.career.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      row,
    ]);

    const result = await getAllCareers();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("turbine-tech");
    expect(result[0].sector).toBe("Operations & Maintenance");
    expect(result[0].entryLevel).toBe("Entry");
    expect(result[0].salaryRange).toEqual({ min: 35000, max: 55000 });
    expect(result[0].skills).toEqual(["mechanical-systems"]);
    expect(result[0].pathwayConnections).toEqual([
      { to: "senior-tech", type: "progression", timeframe: "3-5 years" },
    ]);
    expect(result[0].relatedCourses).toEqual(["gwo-basic-safety"]);
  });

  it("getCareerBySlug returns mapped career or undefined", async () => {
    (prismaMock.career.findFirst as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue(
      makeCareerRow(),
    );

    const result = await getCareerBySlug("turbine-tech");
    expect(result?.title).toBe("Turbine Technician");

    (prismaMock.career.findFirst as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue(
      null,
    );
    const missing = await getCareerBySlug("nonexistent");
    expect(missing).toBeUndefined();
  });

  it("getCareersBySector maps sector string to enum", async () => {
    (prismaMock.career.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeCareerRow(),
    ]);

    await getCareersBySector("Operations & Maintenance");

    expect(prismaMock.career.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sector: "OPERATIONS_MAINTENANCE",
        }),
      }),
    );
  });
});

// ── Course queries ───────────────────────────────────────

describe("Course queries", () => {
  it("getAllCourses maps DB rows to frontend types", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeCourseRow(),
    ]);

    const result = await getAllCourses();

    expect(result).toHaveLength(1);
    expect(result[0].deliveryFormat).toBe("In-Person");
    expect(result[0].providerType).toBe("Industry");
    expect(result[0].cost).toBe(0);
    expect(result[0].skills).toEqual(["safety-management"]);
  });

  it("getFilteredCourses applies format filter", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeCourseRow(),
    ]);

    await getFilteredCourses({ format: "In-Person" });

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryFormat: "IN_PERSON",
        }),
      }),
    );
  });

  it("getFilteredCourses applies freeOnly filter", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeCourseRow(),
    ]);

    await getFilteredCourses({ freeOnly: true });

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cost: 0,
        }),
      }),
    );
  });

  it("getFilteredCourses applies costMax filter", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);

    await getFilteredCourses({ costMax: 1000 });

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          cost: { lte: 1000 },
        }),
      }),
    );
  });

  it("getFilteredCourses applies nfqLevel filter", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);

    await getFilteredCourses({ nfqLevel: 7 });

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nfqLevel: 7,
        }),
      }),
    );
  });

  it("getFilteredCourses applies startingSoon date filter", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);

    await getFilteredCourses({ startingSoon: true });

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          nextStartDate: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      }),
    );
  });

  it("getFilteredCourses filters by topic in-memory", async () => {
    const row = makeCourseRow({ tags: ["gwo", "safety"] });
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      row,
    ]);

    const results = await getFilteredCourses({ topic: "safety" });
    expect(results).toHaveLength(1);

    const noResults = await getFilteredCourses({ topic: "blockchain" });
    expect(noResults).toHaveLength(0);
  });

  it("getFilteredCourses filters by provider in-memory", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeCourseRow(),
    ]);

    const results = await getFilteredCourses({ provider: "Wind Training" });
    expect(results).toHaveLength(1);

    const noResults = await getFilteredCourses({ provider: "Harvard" });
    expect(noResults).toHaveLength(0);
  });

  it("getFilteredCourses combines multiple filters", async () => {
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeCourseRow(),
    ]);

    await getFilteredCourses({
      format: "In-Person",
      freeOnly: true,
      topic: "safety",
    });

    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deliveryFormat: "IN_PERSON",
          cost: 0,
        }),
      }),
    );
  });
});

// ── Event queries ────────────────────────────────────────

describe("Event queries", () => {
  it("getAllEvents maps event types correctly", async () => {
    (prismaMock.event.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeEventRow(),
    ]);

    const result = await getAllEvents();

    expect(result[0].type).toBe("Conference");
    expect(result[0].locationType).toBe("Physical");
    expect(result[0].location).toBe("Dublin");
  });

  it("getUpcomingEvents orders by startDate ascending", async () => {
    (prismaMock.event.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);

    await getUpcomingEvents();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { startDate: "asc" },
        where: expect.objectContaining({
          startDate: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      }),
    );
  });
});

// ── Research queries ─────────────────────────────────────

describe("Research queries", () => {
  it("getAllResearch maps correctly", async () => {
    (prismaMock.research.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeResearchRow(),
    ]);

    const result = await getAllResearch();
    expect(result[0].organisation).toBe("SEAI");
    expect(result[0].categories).toEqual(["policy", "workforce"]);
  });

  it("getFeaturedResearch queries isFeatured", async () => {
    (prismaMock.research.findFirst as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue(
      makeResearchRow(),
    );

    const result = await getFeaturedResearch();
    expect(result?.isFeatured).toBe(true);

    expect(prismaMock.research.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
      }),
    );
  });
});

// ── Skill queries ────────────────────────────────────────

describe("Skill queries", () => {
  it("getAllSkills maps category enum", async () => {
    (prismaMock.skill.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      makeSkillRow(),
    ]);

    const result = await getAllSkills();
    expect(result[0].category).toBe("Technical");
  });
});

// ── Global search ────────────────────────────────────────

describe("globalSearch", () => {
  it("returns empty for empty query", async () => {
    const result = await globalSearch("");
    expect(result).toEqual([]);
  });

  it("returns empty for whitespace query", async () => {
    const result = await globalSearch("   ");
    expect(result).toEqual([]);
  });

  it("searches across all content types", async () => {
    (prismaMock.career.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      {
        slug: "tech",
        title: "Wind Technician",
        description: "Maintain turbines",
        sector: "OPERATIONS_MAINTENANCE",
        status: "PUBLISHED",
      },
    ]);
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);
    (prismaMock.event.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);
    (prismaMock.research.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue(
      [],
    );
    (
      prismaMock.newsArticle.findMany as ReturnType<typeof import("vitest").vi.fn>
    ).mockResolvedValue([]);

    const result = await globalSearch("wind");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("career");
    expect(result[0].slug).toBe("tech");
  });

  it("matches case-insensitively", async () => {
    (prismaMock.career.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([
      {
        slug: "tech",
        title: "WIND Technician",
        description: "Desc",
        sector: "OPERATIONS_MAINTENANCE",
        status: "PUBLISHED",
      },
    ]);
    (prismaMock.course.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);
    (prismaMock.event.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue([]);
    (prismaMock.research.findMany as ReturnType<typeof import("vitest").vi.fn>).mockResolvedValue(
      [],
    );
    (
      prismaMock.newsArticle.findMany as ReturnType<typeof import("vitest").vi.fn>
    ).mockResolvedValue([]);

    const result = await globalSearch("wind");
    expect(result).toHaveLength(1);
  });
});
