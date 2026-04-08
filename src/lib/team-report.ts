/**
 * Team assessment aggregation & AI report generation.
 *
 * Aggregates anonymised TeamResponse scores into team-level insights
 * and generates AI-powered training recommendations.
 */

import { generateText, getAIProvider } from "./ai";

// ─── Types ──────────────────────────────────────────────

export interface TeamResponseData {
  scores: Record<string, number>;
  maxPossible: Record<string, number>;
  topRoleFamilies: string[];
  topSkillGaps: string[];
}

export interface AggregatedTeamData {
  teamName: string;
  responseCount: number;
  avgScores: Record<string, number>; // skill slug → avg percentage 0–100
  stdDevScores: Record<string, number>; // skill slug → std deviation
  topTeamGaps: Array<{
    skill: string;
    avgPercent: number;
    severity: "high" | "medium" | "low";
  }>;
  roleFamilyDistribution: Record<string, number>; // family label → count
  topGapFrequency: Record<string, number>; // skill slug → times it appeared in top gaps
}

// ─── Skill display names (used in AI prompt) ────────────

const SKILL_DISPLAY_NAMES: Record<string, string> = {
  "industry-knowledge": "Industry Knowledge",
  "safety-protocols": "Safety Protocols",
  "working-at-height": "Working at Height",
  "technical-foundation": "Technical Foundation",
  "electrical-systems": "Electrical Systems",
  "mechanical-maintenance": "Mechanical Maintenance",
  "marine-operations": "Marine Operations",
  "project-management": "Project Management",
  "data-analysis": "Data Analysis",
  "regulatory-compliance": "Regulatory Compliance",
  "commercial-management": "Commercial Management",
  "safety-management": "Safety Management",
  "environmental-assessment": "Environmental Assessment",
  "engineering-design": "Engineering Design",
  "scada-systems": "SCADA Systems",
  "python-programming": "Python Programming",
};

export function getSkillDisplayName(slug: string): string {
  return (
    SKILL_DISPLAY_NAMES[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// ─── Aggregation ─────────────────────────────────────────

export function aggregateTeamResults(
  teamName: string,
  responses: TeamResponseData[],
): AggregatedTeamData {
  const responseCount = responses.length;
  if (responseCount === 0) {
    return {
      teamName,
      responseCount: 0,
      avgScores: {},
      stdDevScores: {},
      topTeamGaps: [],
      roleFamilyDistribution: {},
      topGapFrequency: {},
    };
  }

  // Collect all skill slugs
  const allSlugs = new Set<string>();
  for (const r of responses) {
    for (const slug of Object.keys(r.scores)) allSlugs.add(slug);
    for (const slug of Object.keys(r.maxPossible)) allSlugs.add(slug);
  }

  // Compute per-skill percentages across all responses
  const skillPercentages: Record<string, number[]> = {};
  for (const slug of allSlugs) {
    skillPercentages[slug] = [];
    for (const r of responses) {
      const score = r.scores[slug] ?? 0;
      const max = r.maxPossible[slug] ?? 0;
      if (max > 0) {
        skillPercentages[slug].push((score / max) * 100);
      }
    }
  }

  // Average and std dev
  const avgScores: Record<string, number> = {};
  const stdDevScores: Record<string, number> = {};
  for (const [slug, pcts] of Object.entries(skillPercentages)) {
    if (pcts.length === 0) continue;
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    avgScores[slug] = Math.round(avg * 10) / 10;
    const variance = pcts.reduce((sum, p) => sum + (p - avg) ** 2, 0) / pcts.length;
    stdDevScores[slug] = Math.round(Math.sqrt(variance) * 10) / 10;
  }

  // Top team gaps (sorted by lowest avg)
  const topTeamGaps = Object.entries(avgScores)
    .map(([skill, avgPercent]) => ({
      skill,
      avgPercent,
      severity: (avgPercent < 33 ? "high" : avgPercent < 66 ? "medium" : "low") as
        | "high"
        | "medium"
        | "low",
    }))
    .sort((a, b) => a.avgPercent - b.avgPercent);

  // Role family distribution
  const roleFamilyDistribution: Record<string, number> = {};
  for (const r of responses) {
    if (r.topRoleFamilies.length > 0) {
      const topFamily = r.topRoleFamilies[0];
      roleFamilyDistribution[topFamily] = (roleFamilyDistribution[topFamily] ?? 0) + 1;
    }
  }

  // Gap frequency — how often each skill appears as a top gap
  const topGapFrequency: Record<string, number> = {};
  for (const r of responses) {
    for (const gap of r.topSkillGaps) {
      topGapFrequency[gap] = (topGapFrequency[gap] ?? 0) + 1;
    }
  }

  return {
    teamName,
    responseCount,
    avgScores,
    stdDevScores,
    topTeamGaps,
    roleFamilyDistribution,
    topGapFrequency,
  };
}

// ─── AI Report Generation ────────────────────────────────

const TEAM_REPORT_SYSTEM_PROMPT = `You are a workforce development advisor for the Skillnet Offshore Wind Academy (SOWA), Ireland's national initiative to build the offshore wind energy workforce.

You are writing a team-level training needs analysis report for a manager who has had their team complete a skills diagnostic assessment. The results are anonymised and aggregated — you cannot identify individual team members.

Your report should:
1. Summarise the team's overall readiness for offshore wind roles
2. Identify the team's collective strengths (skills scoring above 66%)
3. Highlight the team's critical skill gaps (skills scoring below 33%)
4. Recommend 3-5 specific training priorities, ordered by impact
5. For each priority, recommend a SPECIFIC course from the "Available SOWA Platform Courses" list below — use the exact course title, provider name, cost, and format. Explain why that course addresses the gap.
6. Note any interesting patterns (e.g., strong technical but weak regulatory skills)
7. Provide an actionable 90-day development plan outline with specific course enrolment milestones

Keep the tone professional but practical. Use clear headings. The audience is a team manager or HR professional, not a technical expert.

Ireland's offshore wind targets: 5GW by 2030, 37GW by 2050. The sector is growing rapidly and skilled teams are a competitive advantage.

Format the response as markdown with ## headings.`;

export interface CourseForReport {
  title: string;
  provider: string;
  skills: string[];
  cost?: number;
  duration?: string;
  deliveryFormat?: string;
}

export async function generateTeamReport(
  aggregated: AggregatedTeamData,
  courses?: CourseForReport[],
): Promise<string> {
  // Check if AI is available
  if (!getAIProvider()) {
    return generateFallbackReport(aggregated);
  }

  // Build the user prompt with aggregated data
  const strengths = aggregated.topTeamGaps
    .filter((g) => g.severity === "low")
    .map((g) => `- ${getSkillDisplayName(g.skill)}: ${g.avgPercent.toFixed(0)}%`)
    .join("\n");

  const gaps = aggregated.topTeamGaps
    .filter((g) => g.severity === "high" || g.severity === "medium")
    .slice(0, 8)
    .map(
      (g) =>
        `- ${getSkillDisplayName(g.skill)}: ${g.avgPercent.toFixed(0)}% (${g.severity} gap, std dev: ${aggregated.stdDevScores[g.skill]?.toFixed(0) ?? "N/A"}%)`,
    )
    .join("\n");

  const roleDistribution = Object.entries(aggregated.roleFamilyDistribution)
    .sort(([, a], [, b]) => b - a)
    .map(([family, count]) => `- ${family}: ${count} team member(s)`)
    .join("\n");

  const mostCommonGaps = Object.entries(aggregated.topGapFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(
      ([skill, count]) =>
        `- ${getSkillDisplayName(skill)}: appeared in ${count}/${aggregated.responseCount} individual top gaps`,
    )
    .join("\n");

  // Pre-filter and rank courses by relevance to team gaps
  const gapSlugs = new Set(
    aggregated.topTeamGaps
      .filter((g) => g.severity === "high" || g.severity === "medium")
      .map((g) => g.skill),
  );

  const rankedCourses = (courses ?? [])
    .map((c) => {
      const relevance = c.skills.filter((s) => gapSlugs.has(s)).length;
      return { ...c, relevance };
    })
    .filter((c) => c.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);

  const courseList =
    rankedCourses.length > 0
      ? rankedCourses
          .map((c) => {
            const costStr = c.cost === 0 ? "Free" : `€${c.cost}`;
            const parts = [`"${c.title}" by ${c.provider}`];
            parts.push(`${costStr}, ${c.deliveryFormat ?? "TBC"}, ${c.duration ?? "TBC"}`);
            parts.push(`Covers: ${c.skills.map(getSkillDisplayName).join(", ")}`);
            return `- ${parts.join(" | ")}`;
          })
          .join("\n")
      : "No matching courses found in the directory.";

  const userPrompt = `## Team Assessment Results for "${aggregated.teamName}"

**Team size:** ${aggregated.responseCount} respondents

### Team Strengths (scoring ≥66%)
${strengths || "None identified"}

### Team Skill Gaps
${gaps || "None identified"}

### Most Common Individual Gaps
${mostCommonGaps || "None"}

### Role Family Distribution (top fit per person)
${roleDistribution || "Not enough data"}

### Available SOWA Platform Courses
${courseList}

Please write the team training needs analysis report.`;

  try {
    return await generateText(TEAM_REPORT_SYSTEM_PROMPT, userPrompt, 1500);
  } catch (err) {
    console.error("[TeamReport] AI generation failed, using fallback:", err);
    return generateFallbackReport(aggregated);
  }
}

/**
 * Deterministic fallback report when AI is unavailable.
 */
function generateFallbackReport(aggregated: AggregatedTeamData): string {
  const gaps = aggregated.topTeamGaps.filter(
    (g) => g.severity === "high" || g.severity === "medium",
  );
  const strengths = aggregated.topTeamGaps.filter((g) => g.severity === "low");

  let report = `## Team Assessment Summary: ${aggregated.teamName}\n\n`;
  report += `**${aggregated.responseCount} team member(s)** completed the assessment.\n\n`;

  if (strengths.length > 0) {
    report += `## Team Strengths\n\n`;
    for (const s of strengths.slice(0, 5)) {
      report += `- **${getSkillDisplayName(s.skill)}**: ${s.avgPercent.toFixed(0)}% average score\n`;
    }
    report += "\n";
  }

  if (gaps.length > 0) {
    report += `## Priority Development Areas\n\n`;
    for (const g of gaps.slice(0, 5)) {
      report += `- **${getSkillDisplayName(g.skill)}**: ${g.avgPercent.toFixed(0)}% average score (${g.severity} priority)\n`;
    }
    report += "\n";
    report += `## Recommended Next Steps\n\n`;
    report += `1. Focus training investment on the top ${Math.min(3, gaps.length)} skill gaps identified above\n`;
    report += `2. Browse the SOWA training directory for accredited courses that address these competencies\n`;
    report += `3. Consider team-wide training for gaps affecting the majority of respondents\n`;
    report += `4. Re-assess in 90 days to measure progress\n`;
  }

  return report;
}
