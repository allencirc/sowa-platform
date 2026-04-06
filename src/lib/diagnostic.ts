import type {
  Career,
  Course,
  DiagnosticQuestion,
  DiagnosticResult,
  DiagnosticGap,
  RoleFamilyFit,
  Skill,
} from "./types";
import { ROLE_FAMILIES } from "./diagnostic-role-weights";

// Maps q8 interest area values to relevant career slugs
export const interestToCareerMap: Record<string, string[]> = {
  technical: ["offshore-wind-turbine-technician", "blade-technician", "onshore-wind-technician"],
  engineering: ["owe-project-engineer", "electrical-engineer-substations"],
  marine: ["marine-coordinator", "offshore-logistics-manager"],
  hse: ["hse-advisor-offshore-wind"],
  digital: ["offshore-wind-data-analyst"],
  management: ["owe-commercial-manager", "offshore-installation-manager"],
  policy: ["consenting-and-environmental-specialist"],
  unsure: [
    "offshore-wind-turbine-technician",
    "onshore-wind-technician",
    "offshore-wind-data-analyst",
  ],
};

/**
 * Calculate diagnostic results.
 * All reference data is passed in so this function stays synchronous
 * and can run on the client.
 */
export function calculateResults(
  answers: Record<string, string | string[]>,
  data?: {
    questions: DiagnosticQuestion[];
    allSkills: Skill[];
    allCareers: Career[];
    allCourses: Course[];
  },
): DiagnosticResult {
  // When called from client, data must be provided.
  // Fallback: import from JSON for backwards compat during build/seed.
  let questions: DiagnosticQuestion[];
  let allSkills: Skill[];
  let allCareers: Career[];
  let allCourses: Course[];

  if (data) {
    questions = data.questions;
    allSkills = data.allSkills;
    allCareers = data.allCareers;
    allCourses = data.allCourses;
  } else {
    // Synchronous fallback using JSON imports for client/build
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const questionsJson = require("./data/diagnosticQuestions.json");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const skillsJson = require("./data/skills.json");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const careersJson = require("./data/careers.json");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const coursesJson = require("./data/courses.json");
    questions = questionsJson.questions as DiagnosticQuestion[];
    allSkills = skillsJson as Skill[];
    allCareers = careersJson as Career[];
    allCourses = coursesJson as Course[];
  }

  // Track scores and max possible per skill
  const scores: Record<string, number> = {};
  const maxPossible: Record<string, number> = {};

  // Initialize all assessed skills to 0
  const assessedSkillSlugs = new Set<string>();
  for (const q of questions) {
    if (q.scoreImpact) {
      for (const slug of Object.keys(q.scoreImpact)) {
        assessedSkillSlugs.add(slug);
      }
    }
    if (q.options) {
      for (const opt of q.options) {
        if (opt.scoreImpact) {
          for (const slug of Object.keys(opt.scoreImpact)) {
            assessedSkillSlugs.add(slug);
          }
        }
      }
    }
  }

  for (const slug of assessedSkillSlugs) {
    scores[slug] = 0;
    maxPossible[slug] = 0;
  }

  // Calculate scores from answers
  for (const q of questions) {
    const answer = answers[q.id];
    if (answer === undefined) continue;

    if (q.type === "scale" && q.scoreImpact) {
      const value = typeof answer === "string" ? parseInt(answer, 10) : 0;
      const maxValue = q.scaleMax ?? 5;
      for (const [skill, weight] of Object.entries(q.scoreImpact)) {
        scores[skill] = (scores[skill] ?? 0) + value * weight;
        maxPossible[skill] = (maxPossible[skill] ?? 0) + maxValue * weight;
      }
    } else if (q.type === "single_choice" && q.options) {
      const bestScores: Record<string, number> = {};
      for (const opt of q.options) {
        if (opt.scoreImpact) {
          for (const [skill, pts] of Object.entries(opt.scoreImpact)) {
            bestScores[skill] = Math.max(bestScores[skill] ?? 0, pts);
          }
        }
      }
      for (const [skill, pts] of Object.entries(bestScores)) {
        maxPossible[skill] = (maxPossible[skill] ?? 0) + pts;
      }

      const selected = q.options.find((o) => o.value === answer);
      if (selected?.scoreImpact) {
        for (const [skill, pts] of Object.entries(selected.scoreImpact)) {
          scores[skill] = (scores[skill] ?? 0) + pts;
        }
      }
    } else if (q.type === "multiple_choice" && q.options) {
      const selectedValues = Array.isArray(answer) ? answer : [answer];

      for (const opt of q.options) {
        if (opt.value === "none") continue;
        if (opt.scoreImpact) {
          for (const [skill, pts] of Object.entries(opt.scoreImpact)) {
            maxPossible[skill] = (maxPossible[skill] ?? 0) + pts;
          }
        }
      }

      for (const val of selectedValues) {
        const opt = q.options.find((o) => o.value === val);
        if (opt?.scoreImpact) {
          for (const [skill, pts] of Object.entries(opt.scoreImpact)) {
            scores[skill] = (scores[skill] ?? 0) + pts;
          }
        }
      }
    }
  }

  // Identify gaps
  const gaps: DiagnosticGap[] = [];
  for (const slug of assessedSkillSlugs) {
    const max = maxPossible[slug] ?? 0;
    if (max === 0) continue;
    const score = scores[slug] ?? 0;
    const pct = score / max;

    const skill = allSkills.find((s) => s.slug === slug);
    if (!skill) continue;

    let severity: DiagnosticGap["severity"];
    if (pct < 0.33) severity = "high";
    else if (pct < 0.66) severity = "medium";
    else severity = "low";

    gaps.push({ skill, score, maxScore: max, severity });
  }

  gaps.sort((a, b) => {
    const pctA = a.score / a.maxScore;
    const pctB = b.score / b.maxScore;
    return pctA - pctB;
  });

  const topGaps = gaps.slice(0, 3);

  // Recommend careers based on q8 interest area + scores
  const interestArea = typeof answers["q8"] === "string" ? answers["q8"] : "unsure";
  const relevantCareerSlugs = interestToCareerMap[interestArea] ?? interestToCareerMap["unsure"];

  const recommendedCareers = relevantCareerSlugs
    .map((slug) => allCareers.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .slice(0, 3);

  // Recommend courses that address gaps
  const gapSkillSlugs = new Set(topGaps.map((g) => g.skill.slug));

  const scoredCourses = allCourses
    .map((course) => {
      let relevance = 0;
      for (const skillSlug of course.skills) {
        if (gapSkillSlugs.has(skillSlug)) relevance += 2;
      }
      for (const career of recommendedCareers) {
        if (course.careerRelevance.includes(career.slug)) relevance += 1;
      }
      if (course.cost === 0) relevance += 1;
      return { course, relevance };
    })
    .filter((c) => c.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);

  const recommendedCourses = scoredCourses.map((c) => c.course).slice(0, 5);

  const roleFamilyFit = computeRoleFamilyFit(scores, maxPossible, allSkills);

  return {
    scores,
    maxPossible,
    gaps,
    recommendedCareers,
    recommendedCourses,
    roleFamilyFit,
  };
}

/**
 * Compute role-family fit scores from the user's skill percentages.
 *
 * This is a pure function sitting on top of calculateResults' scores /
 * maxPossible output. It does NOT re-run the scoring engine or touch
 * gap severity — callers can opt in to role-first presentation without
 * affecting the existing gap-first flow.
 *
 * Confidence is a weighted average of skill percentages:
 *   confidence = Σ (pct_skill × weight_skill) / Σ weight_skill
 * where pct_skill is 0–1 and weight_skill comes from ROLE_FAMILIES.
 * Only skills that were actually assessed (maxPossible > 0) contribute,
 * so a missing skill reduces the denominator rather than silently
 * scoring 0.
 *
 * Reasoning bullets are deterministic English strings derived from the
 * highest-contributing skills — static, accessible, SEO-friendly, and
 * available even when the AISummary service is unavailable.
 */
export function computeRoleFamilyFit(
  scores: Record<string, number>,
  maxPossible: Record<string, number>,
  allSkills: Skill[],
): RoleFamilyFit[] {
  const skillByName = new Map(allSkills.map((s) => [s.slug, s]));

  const fits: RoleFamilyFit[] = ROLE_FAMILIES.map((family) => {
    let weightedSum = 0;
    let totalWeight = 0;
    const contributions: Array<{
      slug: string;
      label: string;
      pct: number;
      weight: number;
      contribution: number;
    }> = [];

    for (const [slug, weight] of Object.entries(family.skillWeights)) {
      const max = maxPossible[slug] ?? 0;
      if (max === 0) continue; // skill not assessed — skip, don't penalise
      const pct = (scores[slug] ?? 0) / max;
      weightedSum += pct * weight;
      totalWeight += weight;
      contributions.push({
        slug,
        label: skillByName.get(slug)?.name ?? slug,
        pct,
        weight,
        contribution: pct * weight,
      });
    }

    const confidence = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

    // Reasoning: pick the top 3 weighted contributions and describe them.
    contributions.sort((a, b) => b.contribution - a.contribution);
    const topContribs = contributions.slice(0, 3);
    const reasoning: string[] = [];
    for (const c of topContribs) {
      if (c.pct >= 0.75) {
        reasoning.push(`Strong score on ${c.label} (${Math.round(c.pct * 100)}%)`);
      } else if (c.pct >= 0.5) {
        reasoning.push(`Solid foundation in ${c.label} (${Math.round(c.pct * 100)}%)`);
      } else if (c.pct >= 0.25) {
        reasoning.push(
          `Emerging strength in ${c.label} (${Math.round(c.pct * 100)}%) — worth building`,
        );
      } else {
        reasoning.push(
          `Developing area: ${c.label} (${Math.round(c.pct * 100)}%) — a focused course could unlock this family`,
        );
      }
    }
    if (reasoning.length === 0) {
      reasoning.push("No relevant skills were assessed for this family yet.");
    }

    const careerSlugs = interestToCareerMap[family.interestArea] ?? [];

    return {
      family: family.key,
      label: family.label,
      tagline: family.tagline,
      confidence,
      reasoning,
      careerSlugs,
    };
  });

  fits.sort((a, b) => b.confidence - a.confidence);
  return fits;
}
