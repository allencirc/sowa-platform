import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api-utils";

/**
 * GET /api/team/[token] — Public endpoint returning minimal team info.
 * Used by the assessment page to display the team banner.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  try {
    const team = await prisma.teamAssessment.findUnique({
      where: { token },
      select: { teamName: true, expiresAt: true },
    });

    if (!team) {
      return errorResponse("Team assessment not found", 404);
    }

    if (team.expiresAt && team.expiresAt < new Date()) {
      return errorResponse("This team assessment has expired", 410);
    }

    return NextResponse.json({
      teamName: team.teamName,
      expiresAt: team.expiresAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("GET /api/team/[token] error:", err);
    return errorResponse("Failed to fetch team info");
  }
}
