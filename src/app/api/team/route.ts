import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { createTeamAssessmentSchema } from "@/lib/validations";
import { sendEmail, teamCreated } from "@/lib/email";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = await parseBody(request, createTeamAssessmentSchema);
  if (parsed.error) return parsed.error;

  const { teamName, managerEmail, responseThreshold, expiresAt } = parsed.data;

  try {
    // Abuse prevention: max 10 teams per email per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.teamAssessment.count({
      where: { managerEmail, createdAt: { gte: oneDayAgo } },
    });
    if (recentCount >= 10) {
      return errorResponse("Maximum 10 team assessments per email per day", 429);
    }

    const team = await prisma.teamAssessment.create({
      data: {
        teamName,
        managerEmail,
        responseThreshold,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const origin =
      request.headers.get("origin") ??
      process.env.NEXTAUTH_URL ??
      "https://sowa.skillnetireland.ie";
    const teamLink = `${origin}/en/diagnostic/assessment?team=${team.token}`;
    const reportLink = `${origin}/en/enterprise/team-report/${team.managerToken}`;

    // Send confirmation email (fire-and-forget)
    const email = teamCreated(teamName, teamLink, reportLink);
    sendEmail(managerEmail, email.subject, email.html).catch((err) => {
      console.error("[Team] Email send failed:", err);
    });

    return NextResponse.json({
      token: team.token,
      managerToken: team.managerToken,
      teamLink,
      reportLink,
    });
  } catch (err) {
    console.error("POST /api/team error:", err);
    return errorResponse("Failed to create team assessment");
  }
}
