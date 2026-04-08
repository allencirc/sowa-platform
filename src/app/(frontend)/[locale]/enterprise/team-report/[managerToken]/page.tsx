import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { TeamResponse } from "@/generated/prisma/client";
import {
  aggregateTeamResults,
  type TeamResponseData,
  getSkillDisplayName,
} from "@/lib/team-report";
import { TeamReportView } from "@/components/enterprise/TeamReportView";

export const metadata: Metadata = {
  title: "Team Assessment Report — SOWA",
  description:
    "Aggregated team skills assessment results and AI-generated training recommendations.",
  robots: { index: false, follow: false }, // Private report — no indexing
};

export default async function TeamReportPage({
  params,
}: {
  params: Promise<{ locale: string; managerToken: string }>;
}) {
  const { locale, managerToken } = await params;

  const team = await prisma.teamAssessment.findUnique({
    where: { managerToken },
    include: { responses: true },
  });

  if (!team) notFound();

  const responseData: TeamResponseData[] = team.responses.map((r: TeamResponse) => ({
    scores: r.scores as Record<string, number>,
    maxPossible: r.maxPossible as Record<string, number>,
    topRoleFamilies: r.topRoleFamilies,
    topSkillGaps: r.topSkillGaps,
  }));

  const aggregated = aggregateTeamResults(team.teamName, responseData);

  // Display-friendly enum values
  const formatDisplay: Record<string, string> = {
    IN_PERSON: "In-Person",
    ONLINE: "Online",
    BLENDED: "Blended",
    SELF_PACED: "Self-Paced",
  };

  // Fetch courses that match team gaps for the "Suggested Courses" section
  const gapSlugs = new Set(
    aggregated.topTeamGaps
      .filter((g) => g.severity === "high" || g.severity === "medium")
      .map((g) => g.skill),
  );

  let suggestedCourses: Array<{
    slug: string;
    title: string;
    provider: string;
    cost: number;
    duration: string;
    deliveryFormat: string;
    matchedSkills: string[];
  }> = [];

  if (gapSlugs.size > 0) {
    const courseRows = await prisma.course.findMany({
      include: { skills: { include: { skill: true } } },
    });

    suggestedCourses = courseRows
      .map((c) => {
        const courseSkillSlugs = c.skills.map((s) => s.skill.slug);
        const matched = courseSkillSlugs.filter((s) => gapSlugs.has(s));
        return {
          slug: c.slug,
          title: c.title,
          provider: c.provider,
          cost: c.cost,
          duration: c.duration,
          deliveryFormat: formatDisplay[c.deliveryFormat] ?? c.deliveryFormat,
          matchedSkills: matched.map(getSkillDisplayName),
          relevance: matched.length,
        };
      })
      .filter((c) => c.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 6)
      .map(({ relevance: _, ...c }) => c);
  }

  const data = {
    teamName: team.teamName,
    responseCount: team.responses.length,
    threshold: team.responseThreshold,
    expiresAt: team.expiresAt?.toISOString() ?? null,
    createdAt: team.createdAt.toISOString(),
    aggregated,
    aiReport: team.aiReport as { markdown: string } | null,
    reportGeneratedAt: team.reportGeneratedAt?.toISOString() ?? null,
    suggestedCourses,
  };

  return <TeamReportView data={data} managerToken={managerToken} locale={locale} />;
}
