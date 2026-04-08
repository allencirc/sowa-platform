import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseQuery, errorResponse } from "@/lib/api-utils";
import { fetchGa4Overview } from "@/lib/integrations/ga4";
import {
  fetchCampaignPerformance,
  fetchContentPerformance,
  fetchUserJourney,
  type CampaignRow,
  type ContentRow,
} from "@/lib/integrations/ga4-reports";
import { prisma } from "@/lib/prisma";
import { REPORT_TEMPLATES, type ReportId } from "@/lib/report-templates";
import Papa from "papaparse";

const querySchema = z.object({
  format: z.enum(["csv", "pdf"]).default("csv"),
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
    await requireRole(["ADMIN"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const url = new URL(request.url);
  const result = parseQuery(url, querySchema);
  if (result.error) return result.error;

  const { format, report, from, to, days } = result.data;
  const reportId = report as ReportId;
  const dateRange =
    from && to
      ? { startDate: from, endDate: to }
      : { startDate: `${days ?? 28}daysAgo`, endDate: "today" };

  try {
    const exportRows = await getExportRows(reportId, dateRange, from, to);

    if (format === "pdf") {
      const pdfBuffer = await generatePdf(reportId, exportRows, from, to);
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="sowa-${reportId}-${dateStr()}.pdf"`,
        },
      });
    }

    // CSV
    const template = REPORT_TEMPLATES[reportId];
    const csv = Papa.unparse({
      fields: template.csvColumns.map((c) => c.header),
      data: exportRows.map((row) => template.csvColumns.map((c) => row[c.key] ?? "")),
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sowa-${reportId}-${dateStr()}.csv"`,
      },
    });
  } catch (err) {
    console.error("Analytics export error:", err);
    return errorResponse("Failed to export analytics report");
  }
}

function dateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Build flat row arrays for each report type
// ---------------------------------------------------------------------------

async function getExportRows(
  report: ReportId,
  dateRange: { startDate: string; endDate: string },
  from?: string,
  to?: string,
): Promise<Record<string, string | number>[]> {
  switch (report) {
    case "overview": {
      const ga4 = await fetchGa4Overview(dateRange);
      if (ga4.status !== "ok") return [];
      const r = ga4.report;
      return [
        { metric: "Sessions", value: r.overview.sessions },
        { metric: "Active Users", value: r.overview.activeUsers },
        { metric: "Page Views", value: r.overview.screenPageViews },
        {
          metric: "Avg. Session Duration (s)",
          value: Math.round(r.overview.averageSessionDuration),
        },
        {
          metric: "Engagement Rate",
          value: `${(r.overview.engagementRate * 100).toFixed(1)}%`,
        },
        {
          metric: "Diagnostic Completions",
          value: r.diagnosticCompletions,
        },
        { metric: "Diagnostic Starts", value: r.diagnosticStarts },
        { metric: "Outbound Clicks", value: r.outboundClicks },
        { metric: "Newsletter Signups", value: r.newsletterSignups },
      ];
    }

    case "campaign": {
      const result = await fetchCampaignPerformance(dateRange);
      if (result.status !== "ok") return [];
      return result.rows.map((r: CampaignRow) => ({
        source: r.source,
        medium: r.medium,
        campaign: r.campaign,
        sessions: r.sessions,
        activeUsers: r.activeUsers,
        conversions: r.conversions,
        engagementRate: `${(r.engagementRate * 100).toFixed(1)}%`,
      }));
    }

    case "content": {
      const result = await fetchContentPerformance(dateRange);
      if (result.status !== "ok") return [];
      return result.rows.map((r: ContentRow) => ({
        path: r.path,
        title: r.title,
        views: r.views,
        activeUsers: r.activeUsers,
        avgDuration: Math.round(r.avgDuration),
        engagementRate: `${(r.engagementRate * 100).toFixed(1)}%`,
        bounceRate: `${(r.bounceRate * 100).toFixed(1)}%`,
      }));
    }

    case "journey": {
      const result = await fetchUserJourney(dateRange);
      if (result.status !== "ok") return [];
      return result.data.landingPages.map((r) => ({
        landingPage: r.landingPage,
        sessions: r.sessions,
        activeUsers: r.activeUsers,
        engagementRate: `${(r.engagementRate * 100).toFixed(1)}%`,
      }));
    }

    case "registration": {
      return fetchRegistrationExportRows(from, to);
    }
  }
}

async function fetchRegistrationExportRows(
  from?: string,
  to?: string,
): Promise<Record<string, string | number>[]> {
  const where: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const grouped = await prisma.registration.groupBy({
    by: ["type", "contentId", "status"],
    _count: true,
    where,
  });

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

  for (const row of grouped) {
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

  return [...contentMap.values()]
    .map((c) => ({
      title: titleMap.get(c.contentId) ?? c.contentId,
      type: c.type,
      total: c.total,
      confirmed: c.confirmed,
      pending: c.pending,
      cancelled: c.cancelled,
    }))
    .sort((a, b) => (b.total as number) - (a.total as number));
}

// ---------------------------------------------------------------------------
// PDF generation (jspdf + jspdf-autotable)
// ---------------------------------------------------------------------------

async function generatePdf(
  reportId: ReportId,
  rows: Record<string, string | number>[],
  from?: string,
  to?: string,
): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape" });
  const template = REPORT_TEMPLATES[reportId];

  // Header
  doc.setFontSize(18);
  doc.setTextColor(12, 35, 64); // primary color
  doc.text("SOWA Analytics Report", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(75, 85, 99); // text-secondary
  doc.text(template.label, 14, 28);

  const rangeStr = from && to ? `${from} to ${to}` : "Last 28 days";
  doc.setFontSize(10);
  doc.text(`Date range: ${rangeStr}`, 14, 35);
  doc.text(`Generated: ${new Date().toLocaleString("en-IE")}`, 14, 41);

  // Table
  const headers = template.csvColumns.map((c) => c.header);
  const body = rows.map((row) => template.csvColumns.map((c) => String(row[c.key] ?? "")));

  autoTable(doc, {
    startY: 48,
    head: [headers],
    body,
    headStyles: {
      fillColor: [12, 35, 64],
      textColor: 255,
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [247, 249, 252] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`SOWA Platform — Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }

  return Buffer.from(doc.output("arraybuffer"));
}
