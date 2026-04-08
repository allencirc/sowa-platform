import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TeamResponse } from "@/generated/prisma/client";
import { errorResponse } from "@/lib/api-utils";
import { aggregateTeamResults, type TeamResponseData } from "@/lib/team-report";

/**
 * GET /api/team/report/[managerToken] — Private report data for the manager.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ managerToken: string }> },
) {
  const { managerToken } = await params;

  try {
    const team = await prisma.teamAssessment.findUnique({
      where: { managerToken },
      include: { responses: true },
    });

    if (!team) {
      return errorResponse("Team report not found", 404);
    }

    const responseData: TeamResponseData[] = team.responses.map((r: TeamResponse) => ({
      scores: r.scores as Record<string, number>,
      maxPossible: r.maxPossible as Record<string, number>,
      topRoleFamilies: r.topRoleFamilies,
      topSkillGaps: r.topSkillGaps,
    }));

    const aggregated = aggregateTeamResults(team.teamName, responseData);

    return NextResponse.json({
      teamName: team.teamName,
      responseCount: team.responses.length,
      threshold: team.responseThreshold,
      expiresAt: team.expiresAt?.toISOString() ?? null,
      createdAt: team.createdAt.toISOString(),
      aggregated,
      aiReport: team.aiReport,
      reportGeneratedAt: team.reportGeneratedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("GET /api/team/report/[managerToken] error:", err);
    return errorResponse("Failed to fetch team report");
  }
}
