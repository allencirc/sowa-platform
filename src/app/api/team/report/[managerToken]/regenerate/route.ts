import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TeamResponse } from "@/generated/prisma/client";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { aggregateTeamResults, generateTeamReport, type TeamResponseData } from "@/lib/team-report";

/**
 * POST /api/team/report/[managerToken]/regenerate — Regenerate AI report.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ managerToken: string }> },
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { managerToken } = await params;

  try {
    const team = await prisma.teamAssessment.findUnique({
      where: { managerToken },
      include: { responses: true },
    });

    if (!team) {
      return errorResponse("Team report not found", 404);
    }

    if (team.responses.length === 0) {
      return errorResponse("No responses yet — cannot generate a report", 400);
    }

    const responseData: TeamResponseData[] = team.responses.map((r: TeamResponse) => ({
      scores: r.scores as Record<string, number>,
      maxPossible: r.maxPossible as Record<string, number>,
      topRoleFamilies: r.topRoleFamilies,
      topSkillGaps: r.topSkillGaps,
    }));

    const aggregated = aggregateTeamResults(team.teamName, responseData);

    // Fetch courses for AI context
    const courseRows = await prisma.course.findMany({
      include: { skills: { include: { skill: true } } },
    });
    const courses = courseRows.map((c) => ({
      title: c.title,
      provider: c.provider,
      skills: c.skills.map((s) => s.skill.slug),
      cost: c.cost,
      duration: c.duration,
      deliveryFormat: c.deliveryFormat,
    }));

    const aiReport = await generateTeamReport(aggregated, courses);

    await prisma.teamAssessment.update({
      where: { id: team.id },
      data: {
        aiReport: { markdown: aiReport },
        reportGeneratedAt: new Date(),
      },
    });

    return NextResponse.json({
      aiReport: { markdown: aiReport },
      reportGeneratedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("POST /api/team/report/[managerToken]/regenerate error:", err);
    return errorResponse("Failed to regenerate report");
  }
}
