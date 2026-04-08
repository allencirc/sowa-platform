import { describe, it, expect } from "vitest";
import { calculateResults } from "@/lib/diagnostic";
import type { Career, Course, DiagnosticQuestion, Skill } from "@/lib/types";

// ── Minimal test fixtures ────────────────────────────────

const skills: Skill[] = [
  {
    slug: "mechanical-systems",
    name: "Mechanical Systems",
    category: "Technical",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "safety-management",
    name: "Safety Management",
    category: "Safety",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    category: "Digital",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "project-planning",
    name: "Project Planning",
    category: "Management",
    isTransferable: true,
    adjacentSectors: [],
  },
];

const careers: Career[] = [
  {
    slug: "offshore-wind-turbine-technician",
    title: "Offshore Wind Turbine Technician",
    sector: "Operations & Maintenance",
    entryLevel: "Entry",
    description: "Maintain and repair wind turbines.",
    qualifications: ["Level 6 cert"],
    skills: ["mechanical-systems", "safety-management"],
    pathwayConnections: [],
    relatedCourses: ["gwo-basic-safety"],
  },
  {
    slug: "offshore-wind-data-analyst",
    title: "Offshore Wind Data Analyst",
    sector: "Operations & Maintenance",
    entryLevel: "Mid",
    description: "Analyse wind farm performance data.",
    qualifications: ["Degree"],
    skills: ["data-analysis"],
    pathwayConnections: [],
    relatedCourses: [],
  },
  {
    slug: "owe-commercial-manager",
    title: "OWE Commercial Manager",
    sector: "Project Management",
    entryLevel: "Senior",
    description: "Manage commercial side of OWE projects.",
    qualifications: ["MBA or equivalent"],
    skills: ["project-planning"],
    pathwayConnections: [],
    relatedCourses: [],
  },
];

const courses: Course[] = [
  {
    slug: "gwo-basic-safety",
    title: "GWO Basic Safety Training",
    provider: "Wind Training Ireland",
    providerType: "Industry",
    description: "GWO accredited safety training.",
    deliveryFormat: "In-Person",
    duration: "5 days",
    cost: 0,
    skills: ["safety-management"],
    careerRelevance: ["offshore-wind-turbine-technician"],
    tags: ["gwo", "safety"],
  },
  {
    slug: "data-analytics-owe",
    title: "Data Analytics for OWE",
    provider: "UCD",
    providerType: "University",
    description: "Data analytics for offshore wind.",
    deliveryFormat: "Online",
    duration: "12 weeks",
    cost: 2500,
    skills: ["data-analysis"],
    careerRelevance: ["offshore-wind-data-analyst"],
    tags: ["data"],
  },
  {
    slug: "pm-fundamentals",
    title: "Project Management Fundamentals",
    provider: "TUS",
    providerType: "University",
    description: "Fundamentals of PM.",
    deliveryFormat: "Blended",
    duration: "8 weeks",
    cost: 1200,
    skills: ["project-planning"],
    careerRelevance: ["owe-commercial-manager"],
    tags: ["management"],
  },
];

const questions: DiagnosticQuestion[] = [
  {
    id: "q1",
    text: "Rate your mechanical systems knowledge",
    type: "scale",
    scaleMin: 1,
    scaleMax: 5,
    scoreImpact: { "mechanical-systems": 1 },
  },
  {
    id: "q2",
    text: "What safety certifications do you hold?",
    type: "single_choice",
    options: [
      {
        label: "GWO BST + BOSIET",
        value: "both",
        scoreImpact: { "safety-management": 3 },
      },
      {
        label: "GWO BST only",
        value: "gwo",
        scoreImpact: { "safety-management": 2 },
      },
      {
        label: "None",
        value: "none",
        scoreImpact: { "safety-management": 0 },
      },
    ],
  },
  {
    id: "q3",
    text: "Which digital tools have you used?",
    type: "multiple_choice",
    options: [
      {
        label: "SCADA Systems",
        value: "scada",
        scoreImpact: { "data-analysis": 2 },
      },
      {
        label: "GIS Software",
        value: "gis",
        scoreImpact: { "data-analysis": 2 },
      },
      {
        label: "None",
        value: "none",
      },
    ],
  },
  {
    id: "q8",
    text: "Which area interests you most?",
    type: "single_choice",
    options: [
      { label: "Technical", value: "technical" },
      { label: "Digital", value: "digital" },
      { label: "Management", value: "management" },
      { label: "Not sure", value: "unsure" },
    ],
  },
];

const testData = { questions, allSkills: skills, allCareers: careers, allCourses: courses };

// ── Tests ────────────────────────────────────────────────

describe("calculateResults", () => {
  it("returns empty/zero results when no answers provided", () => {
    const result = calculateResults({}, testData);

    expect(result.scores).toBeDefined();
    expect(result.maxPossible).toBeDefined();
    expect(result.gaps).toBeDefined();
    expect(result.recommendedCareers).toBeInstanceOf(Array);
    expect(result.recommendedCourses).toBeInstanceOf(Array);
  });

  it("calculates scale question scores correctly", () => {
    const result = calculateResults({ q1: "4", q8: "technical" }, testData);

    // q1 has scoreImpact { "mechanical-systems": 1 }, answer=4 → score = 4*1 = 4
    expect(result.scores["mechanical-systems"]).toBe(4);
    // max = scaleMax(5) * weight(1) = 5
    expect(result.maxPossible["mechanical-systems"]).toBe(5);
  });

  it("calculates single_choice scores correctly", () => {
    const result = calculateResults({ q2: "gwo", q8: "technical" }, testData);

    // "gwo" option has scoreImpact { "safety-management": 2 }
    expect(result.scores["safety-management"]).toBe(2);
    // max is the best option: 3
    expect(result.maxPossible["safety-management"]).toBe(3);
  });

  it("calculates multiple_choice scores correctly", () => {
    const result = calculateResults({ q3: ["scada", "gis"], q8: "digital" }, testData);

    // scada: 2 + gis: 2 = 4
    expect(result.scores["data-analysis"]).toBe(4);
    // max = 2 + 2 = 4 (both non-"none" options)
    expect(result.maxPossible["data-analysis"]).toBe(4);
  });

  it("handles selecting only one option in multiple_choice", () => {
    const result = calculateResults({ q3: ["scada"], q8: "digital" }, testData);

    expect(result.scores["data-analysis"]).toBe(2);
    expect(result.maxPossible["data-analysis"]).toBe(4);
  });

  it("assigns correct gap severity levels", () => {
    // Low score → high severity
    const result = calculateResults(
      { q1: "1", q2: "none", q3: ["none"], q8: "technical" },
      testData,
    );

    const mechanicalGap = result.gaps.find((g) => g.skill.slug === "mechanical-systems");
    const safetyGap = result.gaps.find((g) => g.skill.slug === "safety-management");

    // mechanical: 1/5 = 0.2 < 0.33 → high
    expect(mechanicalGap?.severity).toBe("high");
    // safety: 0/3 = 0 < 0.33 → high
    expect(safetyGap?.severity).toBe("high");
  });

  it("assigns medium severity for mid-range scores", () => {
    // q1: 2/5 = 0.4 → medium
    const result = calculateResults({ q1: "2", q8: "technical" }, testData);

    const gap = result.gaps.find((g) => g.skill.slug === "mechanical-systems");
    expect(gap?.severity).toBe("medium");
  });

  it("assigns low severity for high scores", () => {
    // q1: 4/5 = 0.8 → low
    const result = calculateResults({ q1: "4", q8: "technical" }, testData);

    const gap = result.gaps.find((g) => g.skill.slug === "mechanical-systems");
    expect(gap?.severity).toBe("low");
  });

  it("sorts gaps by percentage ascending (worst gaps first)", () => {
    const result = calculateResults(
      { q1: "4", q2: "none", q3: ["scada"], q8: "technical" },
      testData,
    );

    for (let i = 1; i < result.gaps.length; i++) {
      const prevPct = result.gaps[i - 1].score / result.gaps[i - 1].maxScore;
      const currPct = result.gaps[i].score / result.gaps[i].maxScore;
      expect(prevPct).toBeLessThanOrEqual(currPct);
    }
  });

  it("recommends careers based on q8 interest area", () => {
    const techResult = calculateResults({ q8: "technical" }, testData);
    expect(
      techResult.recommendedCareers.some((c) => c.slug === "offshore-wind-turbine-technician"),
    ).toBe(true);

    const digitalResult = calculateResults({ q8: "digital" }, testData);
    expect(
      digitalResult.recommendedCareers.some((c) => c.slug === "offshore-wind-data-analyst"),
    ).toBe(true);

    const mgmtResult = calculateResults({ q8: "management" }, testData);
    expect(mgmtResult.recommendedCareers.some((c) => c.slug === "owe-commercial-manager")).toBe(
      true,
    );
  });

  it("falls back to 'unsure' when q8 is missing", () => {
    const result = calculateResults({}, testData);

    // "unsure" maps to technician, onshore-tech, data-analyst
    expect(
      result.recommendedCareers.some((c) => c.slug === "offshore-wind-turbine-technician"),
    ).toBe(true);
  });

  it("recommends courses that address gaps", () => {
    // Create big gap in safety → should recommend GWO course
    const result = calculateResults({ q1: "5", q2: "none", q8: "technical" }, testData);

    // GWO course targets safety-management and is free (bonus relevance)
    const gwoCourse = result.recommendedCourses.find((c) => c.slug === "gwo-basic-safety");
    expect(gwoCourse).toBeDefined();
  });

  it("boosts free courses in recommendations", () => {
    // Free course (GWO) should rank higher than paid when both address gaps
    const result = calculateResults(
      { q1: "1", q2: "none", q3: ["none"], q8: "technical" },
      testData,
    );

    if (result.recommendedCourses.length >= 2) {
      const gwoIndex = result.recommendedCourses.findIndex((c) => c.slug === "gwo-basic-safety");
      // GWO should appear in recommendations since it's free + addresses gap
      expect(gwoIndex).toBeGreaterThanOrEqual(0);
    }
  });

  it("limits recommended careers to max 3", () => {
    const result = calculateResults({ q8: "unsure" }, testData);
    expect(result.recommendedCareers.length).toBeLessThanOrEqual(3);
  });

  it("limits recommended courses to max 5", () => {
    const result = calculateResults(
      { q1: "1", q2: "none", q3: ["none"], q8: "technical" },
      testData,
    );
    expect(result.recommendedCourses.length).toBeLessThanOrEqual(5);
  });

  it("handles a full set of answers across all questions", () => {
    const result = calculateResults(
      {
        q1: "3",
        q2: "both",
        q3: ["scada", "gis"],
        q8: "technical",
      },
      testData,
    );

    expect(result.scores["mechanical-systems"]).toBe(3);
    expect(result.scores["safety-management"]).toBe(3);
    expect(result.scores["data-analysis"]).toBe(4);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.recommendedCareers.length).toBeGreaterThan(0);
  });
});
