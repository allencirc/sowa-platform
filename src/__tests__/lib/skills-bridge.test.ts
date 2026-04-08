import { describe, it, expect } from "vitest";
import {
  computeSkillsBridge,
  coursesForSkill,
  SOURCE_SECTORS,
  type SourceSector,
} from "@/lib/skills-bridge";
import type { Skill, Course } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────

function makeSkill(slug: string, name: string, opts: Partial<Skill> = {}): Skill {
  return {
    slug,
    name,
    category: "Technical",
    isTransferable: false,
    adjacentSectors: [],
    ...opts,
  };
}

function makeCourse(slug: string, skillSlugs: string[]): Course {
  return {
    slug,
    title: slug,
    provider: "Test Provider",
    providerType: "Private",
    description: "",
    deliveryFormat: "Online",
    duration: "5 days",
    cost: 0,
    skills: skillSlugs,
    careerRelevance: [],
    tags: [],
  };
}

// ─── Tests ────────────────────────────────────────────────

describe("computeSkillsBridge", () => {
  it("returns 100% match when all career skills are transferable from the source sector", () => {
    const skills: Skill[] = [
      makeSkill("safety-protocols", "Safety Protocols", {
        isTransferable: true,
        adjacentSectors: ["Maritime"],
      }),
      makeSkill("marine-operations", "Marine Operations", {
        isTransferable: true,
        adjacentSectors: ["Maritime"],
      }),
    ];

    const result = computeSkillsBridge("Maritime", skills);

    expect(result.matchPercentage).toBe(100);
    expect(result.matchedSkills).toHaveLength(2);
    expect(result.gapSkills).toHaveLength(0);
  });

  it("returns 0% match when no skills are transferable from the source sector", () => {
    const skills: Skill[] = [
      makeSkill("industry-knowledge", "OWE Industry Knowledge", {
        isTransferable: false,
        adjacentSectors: [],
      }),
      makeSkill("grid-connection", "Grid Connection", {
        isTransferable: true,
        adjacentSectors: ["Renewable Energy"],
      }),
    ];

    const result = computeSkillsBridge("Construction", skills);

    expect(result.matchPercentage).toBe(0);
    expect(result.matchedSkills).toHaveLength(0);
    expect(result.gapSkills).toHaveLength(2);
  });

  it("correctly splits matched and gap skills for partial match", () => {
    const skills: Skill[] = [
      makeSkill("safety-protocols", "Safety Protocols", {
        isTransferable: true,
        adjacentSectors: ["Oil & Gas", "Nuclear"],
      }),
      makeSkill("risk-assessment", "Risk Assessment", {
        isTransferable: true,
        adjacentSectors: ["Oil & Gas"],
      }),
      makeSkill("industry-knowledge", "OWE Industry Knowledge", {
        isTransferable: false,
        adjacentSectors: [],
      }),
    ];

    const result = computeSkillsBridge("Oil & Gas", skills);

    expect(result.matchPercentage).toBe(67); // 2/3 rounded
    expect(result.matchedSkills).toHaveLength(2);
    expect(result.matchedSkills.map((s) => s.slug)).toEqual([
      "safety-protocols",
      "risk-assessment",
    ]);
    expect(result.gapSkills).toHaveLength(1);
    expect(result.gapSkills[0].slug).toBe("industry-knowledge");
  });

  it("handles empty career skills gracefully", () => {
    const result = computeSkillsBridge("Maritime", []);

    expect(result.matchPercentage).toBe(0);
    expect(result.matchedSkills).toHaveLength(0);
    expect(result.gapSkills).toHaveLength(0);
  });

  it("treats non-transferable skills as gaps even if adjacentSectors matches", () => {
    const skills: Skill[] = [
      makeSkill("fake-skill", "Fake Skill", {
        isTransferable: false,
        adjacentSectors: ["Maritime"], // has the sector, but not transferable
      }),
    ];

    const result = computeSkillsBridge("Maritime", skills);

    expect(result.matchPercentage).toBe(0);
    expect(result.gapSkills).toHaveLength(1);
  });

  it.each(SOURCE_SECTORS)("produces valid results for sector: %s", (sector) => {
    const skills: Skill[] = [
      makeSkill("safety-protocols", "Safety Protocols", {
        isTransferable: true,
        adjacentSectors: [
          "Maritime",
          "Construction",
          "Oil & Gas",
          "Aerospace",
          "Nuclear",
          "Renewable Energy",
          "Defence",
          "Heavy Engineering",
        ],
      }),
      makeSkill("industry-knowledge", "OWE Industry Knowledge", {
        isTransferable: false,
        adjacentSectors: [],
      }),
    ];

    const result = computeSkillsBridge(sector as SourceSector, skills);

    expect(result.matchPercentage).toBeGreaterThanOrEqual(0);
    expect(result.matchPercentage).toBeLessThanOrEqual(100);
    expect(result.matchedSkills.length + result.gapSkills.length).toBe(skills.length);
  });

  it("rounds match percentage correctly", () => {
    const skills: Skill[] = [
      makeSkill("a", "A", { isTransferable: true, adjacentSectors: ["Maritime"] }),
      makeSkill("b", "B", { isTransferable: true, adjacentSectors: ["Maritime"] }),
      makeSkill("c", "C", { isTransferable: false, adjacentSectors: [] }),
    ];

    const result = computeSkillsBridge("Maritime", skills);
    expect(result.matchPercentage).toBe(67); // 2/3 = 66.67 → 67
  });
});

describe("coursesForSkill", () => {
  it("returns courses that include the skill slug", () => {
    const skill = makeSkill("safety-protocols", "Safety Protocols");
    const courses = [
      makeCourse("gwo-basic", ["safety-protocols", "working-at-height"]),
      makeCourse("electrical-cert", ["electrical-systems"]),
      makeCourse("safety-advanced", ["safety-protocols"]),
    ];

    const result = coursesForSkill(skill, courses);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.slug)).toEqual(["gwo-basic", "safety-advanced"]);
  });

  it("returns empty array when no courses match", () => {
    const skill = makeSkill("industry-knowledge", "OWE Industry Knowledge");
    const courses = [makeCourse("gwo-basic", ["safety-protocols"])];

    expect(coursesForSkill(skill, courses)).toHaveLength(0);
  });
});
