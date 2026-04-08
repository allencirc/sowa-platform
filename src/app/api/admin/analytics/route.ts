import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseQuery, errorResponse } from "@/lib/api-utils";
import { fetchGa4Overview } from "@/lib/integrations/ga4";
import {
  fetchCampaignPerformance,
  fetchContentPerformance,
  fetchUserJourney,
} from "@/lib/integrations/ga4-reports";
import { prisma } from "@/lib/prisma";
import type { ReportId } from "@/lib/report-templates";

const querySchema = z.object({
  report: z
    .enum(["overview", "campaign", "content", "journey", "registration"])
    .default("overview"),
  from: z.string().optional(),
  to: z.string().optional(),
  days: z.coerce.number().int().min(1).max(365).optional(),
});

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN", "EDITOR", "VIEWER"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const url = new URL(request.url);
  const result = parseQuery(url, querySchema);
  if (result.error) return result.error;

  const { report, from, to, days } = result.data;
  const dateRange =
    from && to
      ? { startDate: from, endDate: to }
      : { startDate: `${days ?? 28}daysAgo`, endDate: "today" };

  try {
    const data = await fetchReportData(report as ReportId, dateRange, from, to);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Analytics API error:", err);
    return errorResponse("Failed to fetch analytics data");
  }
}

async function fetchReportData(
  report: ReportId,
  dateRange: { startDate: string; endDate: string },
  from?: string,
  to?: string,
) {
  switch (report) {
    case "overview": {
      const ga4 = await fetchGa4Overview(dateRange);
      return ga4;
    }
    case "campaign":
      return fetchCampaignPerformance(dateRange);
    case "content":
      return fetchContentPerformance(dateRange);
    case "journey":
      return fetchUserJourney(dateRange);
    case "registration":
      return fetchRegistrationReport(from, to);
    default:
      return { status: "error", message: `Unknown report: ${report}` };
  }
}

async function fetchRegistrationReport(from?: string, to?: string) {
  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [byContent, totals] = await Promise.all([
    prisma.registration.groupBy({
      by: ["type", "contentId", "status"],
      _count: true,
      where,
    }),
    prisma.registration.count({ where }),
  ]);

  // Aggregate by contentId
  const contentMap = new Map<
    string,
    {
      type: string;
      contentId: string;
      total: number;
      confirmed: number;
      pending: number;
      cancelled: number;
    }
  >();

  for (const row of byContent) {
    const key = `${row.type}:${row.contentId}`;
    const existing = contentMap.get(key) ?? {
      type: row.type,
      contentId: row.contentId,
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
    };
    existing.total += row._count;
    if (row.status === "CONFIRMED") existing.confirmed += row._count;
    else if (row.status === "PENDING") existing.pending += row._count;
    else if (row.status === "CANCELLED") existing.cancelled += row._count;
    contentMap.set(key, existing);
  }

  // Resolve titles
  const contentIds = [...contentMap.values()];
  const eventIds = contentIds.filter((c) => c.type === "EVENT").map((c) => c.contentId);
  const courseIds = contentIds.filter((c) => c.type === "COURSE").map((c) => c.contentId);

  const [events, courses] = await Promise.all([
    eventIds.length > 0
      ? prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, title: true },
        })
      : [],
    courseIds.length > 0
      ? prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, title: true },
        })
      : [],
  ]);

  const titleMap = new Map<string, string>();
  for (const e of events) titleMap.set(e.id, e.title);
  for (const c of courses) titleMap.set(c.id, c.title);

  const rows = [...contentMap.values()]
    .map((c) => ({
      ...c,
      title: titleMap.get(c.contentId) ?? c.contentId,
    }))
    .sort((a, b) => b.total - a.total);

  return { status: "ok", rows, total: totals };
}
