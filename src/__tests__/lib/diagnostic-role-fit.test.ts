import { describe, it, expect } from "vitest";
import { computeRoleFamilyFit, calculateResults } from "@/lib/diagnostic";
import { ROLE_FAMILIES } from "@/lib/diagnostic-role-weights";
import type { Career, Course, DiagnosticQuestion, Skill } from "@/lib/types";

// ── Fixtures ────────────────────────────────────────────
// Covers the skills referenced by all role families so we can exercise
// every branch without relying on the production JSON.

const skills: Skill[] = [
  {
    slug: "mechanical-maintenance",
    name: "Mechanical Maintenance",
    category: "Technical",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "working-at-height",
    name: "Working at Height",
    category: "Safety",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "safety-protocols",
    name: "Safety Protocols",
    category: "Safety",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "electrical-systems",
    name: "Electrical Systems",
    category: "Technical",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "technical-foundation",
    name: "Technical Foundation",
    category: "Technical",
    isTransferable: false,
    adjacentSectors: [],
  },
  {
    slug: "marine-operations",
    name: "Marine Operations",
    category: "Technical",
    isTransferable: false,
    adjacentSectors: [],
  },
  {
    slug: "industry-knowledge",
    name: "Industry Knowledge",
    category: "Regulatory",
    isTransferable: false,
    adjacentSectors: [],
  },
  {
    slug: "engineering-design",
    name: "Engineering Design",
    category: "Technical",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "regulatory-compliance",
    name: "Regulatory Compliance",
    category: "Regulatory",
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
    slug: "safety-management",
    name: "Safety Management",
    category: "Safety",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "environmental-assessment",
    name: "Environmental Assessment",
    category: "Regulatory",
    isTransferable: false,
    adjacentSectors: [],
  },
  {
    slug: "project-management",
    name: "Project Management",
    category: "Management",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "commercial-management",
    name: "Commercial Management",
    category: "Management",
    isTransferable: true,
    adjacentSectors: [],
  },
  {
    slug: "scada-systems",
    name: "SCADA Systems",
    category: "Digital",
    isTransferable: false,
    adjacentSectors: [],
  },
  {
    slug: "python-programming",
    name: "Python Programming",
    category: "Digital",
    isTransferable: true,
    adjacentSectors: [],
  },
];

describe("computeRoleFamilyFit", () => {
  it("returns one entry per defined role family", () => {
    const scores: Record<string, number> = {};
    const max: Record<string, number> = {};
    const fit = computeRoleFamilyFit(scores, max, skills);
    expect(fit.length).toBe(ROLE_FAMILIES.length);
  });

  it("sorts role families by descending confidence", () => {
    // Max out technician skills, leave others low.
    const scores = {
      "mechanical-maintenance": 10,
      "working-at-height": 10,
      "safety-protocols": 10,
      "engineering-design": 0,
      "data-analysis": 0,
      "commercial-management": 0,
    };
    const max = {
      "mechanical-maintenance": 10,
      "working-at-height": 10,
      "safety-protocols": 10,
      "engineering-design": 10,
      "data-analysis": 10,
      "commercial-management": 10,
    };
    const fit = computeRoleFamilyFit(scores, max, skills);
    for (let i = 1; i < fit.length; i++) {
      expect(fit[i - 1].confidence).toBeGreaterThanOrEqual(fit[i].confidence);
    }
    expect(fit[0].family).toBe("technician");
  });

  it("clamps confidence to the 0–100 range", () => {
    const fit = computeRoleFamilyFit({}, {}, skills);
    for (const f of fit) {
      expect(f.confidence).toBeGreaterThanOrEqual(0);
      expect(f.confidence).toBeLessThanOrEqual(100);
    }
  });

  it("skips unassessed skills rather than counting them as zero", () => {
    // Only mechanical-maintenance is assessed, at 100%.
    // Technician has that skill at weight 3. With no other skills
    // assessed, the family confidence should be 100 — not diluted to
    // ~30 by missing skills being treated as zero.
    const fit = computeRoleFamilyFit(
      { "mechanical-maintenance": 10 },
      { "mechanical-maintenance": 10 },
      skills,
    );
    const tech = fit.find((f) => f.family === "technician");
    expect(tech?.confidence).toBe(100);
  });

  it("produces at least one reasoning bullet per family", () => {
    const fit = computeRoleFamilyFit({}, {}, skills);
    for (const f of fit) {
      expect(f.reasoning.length).toBeGreaterThanOrEqual(1);
      for (const bullet of f.reasoning) {
        expect(typeof bullet).toBe("string");
        expect(bullet.length).toBeGreaterThan(0);
      }
    }
  });

  it("generates deterministic reasoning (same input → same output)", () => {
    const scores = {
      "data-analysis": 8,
      "scada-systems": 6,
      "python-programming": 4,
    };
    const max = {
      "data-analysis": 10,
      "scada-systems": 10,
      "python-programming": 10,
    };
    const a = computeRoleFamilyFit(scores, max, skills);
    const b = computeRoleFamilyFit(scores, max, skills);
    expect(a).toEqual(b);
  });

  it("uses 'strong' phrasing for percentages >= 75%", () => {
    const fit = computeRoleFamilyFit({ "data-analysis": 10 }, { "data-analysis": 10 }, skills);
    const digital = fit.find((f) => f.family === "data_digital");
    expect(digital?.reasoning.some((r) => /strong/i.test(r))).toBe(true);
  });

  it("uses 'developing' phrasing for very low scores", () => {
    const fit = computeRoleFamilyFit({ "data-analysis": 1 }, { "data-analysis": 10 }, skills);
    const digital = fit.find((f) => f.family === "data_digital");
    expect(digital?.reasoning.some((r) => /developing|focused course/i.test(r))).toBe(true);
  });

  it("attaches career slugs aligned with interestToCareerMap", () => {
    const fit = computeRoleFamilyFit({}, {}, skills);
    const tech = fit.find((f) => f.family === "technician");
    expect(tech?.careerSlugs).toContain("offshore-wind-turbine-technician");
    const engineer = fit.find((f) => f.family === "engineer");
    expect(engineer?.careerSlugs.length).toBeGreaterThan(0);
  });
});

// Minimal calculateResults integration test to prove the new field is
// populated end-to-end without disturbing existing scoring behaviour.
describe("calculateResults returns roleFamilyFit", () => {
  const questions: DiagnosticQuestion[] = [
    {
      id: "q1",
      text: "Mechanical rating",
      type: "scale",
      scaleMin: 1,
      scaleMax: 5,
      scoreImpact: { "mechanical-maintenance": 2 },
    },
    {
      id: "q8",
      text: "Interest?",
      type: "single_choice",
      options: [
        { label: "Technical", value: "technical" },
        { label: "Digital", value: "digital" },
      ],
    },
  ];
  const careers: Career[] = [];
  const courses: Course[] = [];
  const data = { questions, allSkills: skills, allCareers: careers, allCourses: courses };

  it("includes a sorted roleFamilyFit array on the result", () => {
    const result = calculateResults({ q1: "5", q8: "technical" }, data);
    expect(result.roleFamilyFit).toBeDefined();
    expect(result.roleFamilyFit.length).toBe(ROLE_FAMILIES.length);
    for (let i = 1; i < result.roleFamilyFit.length; i++) {
      expect(result.roleFamilyFit[i - 1].confidence).toBeGreaterThanOrEqual(
        result.roleFamilyFit[i].confidence,
      );
    }
  });
});
