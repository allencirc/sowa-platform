import type { Skill, Course } from "./types";

// ─── Source sectors (industries people transition FROM) ────

export const SOURCE_SECTORS = [
  "Maritime",
  "Construction",
  "Oil & Gas",
  "Aerospace",
  "Nuclear",
  "Renewable Energy",
  "Defence",
  "Heavy Engineering",
] as const;

export type SourceSector = (typeof SOURCE_SECTORS)[number];

// ─── Result type ──────────────────────────────────────────

export interface SkillsBridgeResult {
  /** Skills the user already has (green / matched) */
  matchedSkills: Skill[];
  /** Skills the user needs to develop (amber / gap) */
  gapSkills: Skill[];
  /** 0–100 rounded match percentage */
  matchPercentage: number;
}

// ─── Core matching function ───────────────────────────────
// Uses the ESCO adjacentSectors and isTransferable fields
// stored on each Skill to determine transferability.

export function computeSkillsBridge(
  sourceSector: SourceSector,
  careerSkills: Skill[],
): SkillsBridgeResult {
  if (careerSkills.length === 0) {
    return { matchedSkills: [], gapSkills: [], matchPercentage: 0 };
  }

  const matchedSkills: Skill[] = [];
  const gapSkills: Skill[] = [];

  for (const skill of careerSkills) {
    if (skill.isTransferable && skill.adjacentSectors.includes(sourceSector)) {
      matchedSkills.push(skill);
    } else {
      gapSkills.push(skill);
    }
  }

  const matchPercentage = Math.round((matchedSkills.length / careerSkills.length) * 100);

  return { matchedSkills, gapSkills, matchPercentage };
}

// ─── Helper: find courses that address a gap skill ────────

export function coursesForSkill(skill: Skill, courses: Course[]): Course[] {
  return courses.filter((c) => c.skills.includes(skill.slug));
}
