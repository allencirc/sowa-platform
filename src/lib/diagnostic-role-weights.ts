/**
 * Role-family fit weights for the diagnostic assessment.
 *
 * Each role family maps onto one or more careers in interestToCareerMap
 * (see src/lib/diagnostic.ts). The confidence score for a role family
 * is a weighted average of the user's skill percentages against the
 * weights below.
 *
 *   weight 0    — skill is irrelevant to this family
 *   weight 1    — nice to have
 *   weight 2    — core skill for this family
 *   weight 3    — defining skill (absence of strength here should drop confidence sharply)
 *
 * These weights are intentionally simple so the SOWA steering group can
 * review and adjust them without a developer. If a skill slug referenced
 * below is missing from the user's assessed skills it is skipped — the
 * confidence score divides by the sum of weights that actually applied.
 *
 * When adding a new role family:
 *   1. Pick a stable snake_case key.
 *   2. Provide a human-readable label and an ordered list of weighted
 *      skills.
 *   3. Add the family to the `interestToCareerMap` in diagnostic.ts so
 *      career slug recommendations stay consistent across both views.
 */

export type RoleFamilyKey =
  | "technician"
  | "engineer"
  | "marine_ops"
  | "hse"
  | "project_commercial"
  | "data_digital";

export interface RoleFamilyDefinition {
  key: RoleFamilyKey;
  label: string;
  /** Short blurb shown on the role card above reasoning bullets. */
  tagline: string;
  /** Interest area (q8) this family maps to — used to align with interestToCareerMap. */
  interestArea: string;
  /** Skill slug → weight. Higher = more important for this role family. */
  skillWeights: Record<string, number>;
}

export const ROLE_FAMILIES: RoleFamilyDefinition[] = [
  {
    key: "technician",
    label: "Technician pathway",
    tagline: "Hands-on turbine maintenance, installation, and blade repair roles.",
    interestArea: "technical",
    skillWeights: {
      // Defining skills — a technician lives and dies by these.
      "mechanical-maintenance": 3,
      "working-at-height": 3,
      "safety-protocols": 3,
      // Core skills — strong contributors.
      "electrical-systems": 2,
      "technical-foundation": 2,
      "marine-operations": 1,
      // Nice-to-have context.
      "industry-knowledge": 1,
    },
  },
  {
    key: "engineer",
    label: "Engineering pathway",
    tagline: "Design, analysis, and engineering leadership in wind farm development.",
    interestArea: "engineering",
    skillWeights: {
      "technical-foundation": 3,
      "engineering-design": 3,
      "electrical-systems": 2,
      "mechanical-maintenance": 1,
      "industry-knowledge": 2,
      "regulatory-compliance": 1,
      "data-analysis": 1,
    },
  },
  {
    key: "marine_ops",
    label: "Marine operations",
    tagline: "Vessel coordination, offshore logistics, and port-side execution.",
    interestArea: "marine",
    skillWeights: {
      "marine-operations": 3,
      "safety-protocols": 3,
      "working-at-height": 1,
      "industry-knowledge": 2,
      "safety-management": 1,
      "project-management": 1,
    },
  },
  {
    key: "hse",
    label: "Health, safety & environment",
    tagline: "Protecting people and compliance on site, vessel, and blade.",
    interestArea: "hse",
    skillWeights: {
      "safety-management": 3,
      "safety-protocols": 3,
      "regulatory-compliance": 2,
      "environmental-assessment": 2,
      "industry-knowledge": 1,
      "marine-operations": 1,
    },
  },
  {
    key: "project_commercial",
    label: "Project & commercial management",
    tagline: "Programme delivery, commercial negotiation, and stakeholder management.",
    interestArea: "management",
    skillWeights: {
      "project-management": 3,
      "commercial-management": 3,
      "industry-knowledge": 2,
      "regulatory-compliance": 1,
      "safety-management": 1,
    },
  },
  {
    key: "data_digital",
    label: "Data & digital",
    tagline: "SCADA analytics, performance data, and digital twin tooling.",
    interestArea: "digital",
    skillWeights: {
      "data-analysis": 3,
      "scada-systems": 3,
      "python-programming": 2,
      "engineering-design": 1,
      "industry-knowledge": 1,
      "technical-foundation": 1,
    },
  },
];

export const ROLE_FAMILY_BY_KEY: Record<RoleFamilyKey, RoleFamilyDefinition> = ROLE_FAMILIES.reduce(
  (acc, f) => {
    acc[f.key] = f;
    return acc;
  },
  {} as Record<RoleFamilyKey, RoleFamilyDefinition>,
);
