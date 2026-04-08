/**
 * Weekly analytics report email generator.
 *
 * Fetches the last 7 days of GA4 overview + registration data and renders
 * an inline-styled HTML email suitable for the admin team.
 */

import { fetchGa4Overview } from "@/lib/integrations/ga4";
import { prisma } from "@/lib/prisma";

const ADMIN_URL = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";

function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-IE").format(n);
}

function fmtPct(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

function fmtDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function metricRow(label: string, value: string, change?: string): string {
  return `
    <tr>
      <td style="padding:8px 0;color:#1A1A2E;font-size:14px;">${label}</td>
      <td style="padding:8px 0;text-align:right;font-weight:600;color:#1A1A2E;font-size:14px;">${value}</td>
      ${change ? `<td style="padding:8px 0;text-align:right;font-size:13px;color:#6B7280;">${change}</td>` : ""}
    </tr>`;
}

export async function generateWeeklyReportHtml(): Promise<{
  subject: string;
  html: string;
} | null> {
  const current = await fetchGa4Overview(7);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [regsThisWeek, regsPrevWeek, regsTotal] = await Promise.all([
    prisma.registration.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.registration.count({
      where: {
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
      },
    }),
    prisma.registration.count(),
  ]);

  const weekEnd = now.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const weekStart = sevenDaysAgo.toLocaleDateString("en-IE", {
    day: "numeric",
    month: "long",
  });

  let metricsSection = "";
  let topPagesSection = "";
  let conversionsSection = "";

  if (current.status === "ok") {
    const o = current.report.overview;

    metricsSection = `
      <h3 style="color:#0C2340;font-size:16px;margin:20px 0 8px;">Traffic Overview</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${metricRow("Sessions", fmtNum(o.sessions))}
        ${metricRow("Active Users", fmtNum(o.activeUsers))}
        ${metricRow("Page Views", fmtNum(o.screenPageViews))}
        ${metricRow("Avg. Session Duration", fmtDuration(o.averageSessionDuration))}
        ${metricRow("Engagement Rate", fmtPct(o.engagementRate))}
      </table>

      <h3 style="color:#0C2340;font-size:16px;margin:20px 0 8px;">Conversions</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${metricRow("Diagnostic Completions", fmtNum(current.report.diagnosticCompletions))}
        ${metricRow("Diagnostic Starts", fmtNum(current.report.diagnosticStarts))}
        ${metricRow("Outbound Clicks", fmtNum(current.report.outboundClicks))}
        ${metricRow("Newsletter Signups", fmtNum(current.report.newsletterSignups))}
      </table>`;

    if (current.report.topPages.length > 0) {
      const topRows = current.report.topPages
        .slice(0, 5)
        .map(
          (p) => `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#1A1A2E;">${p.title || p.path}</td>
          <td style="padding:6px 0;text-align:right;font-size:13px;font-weight:600;color:#1A1A2E;">${fmtNum(p.views)}</td>
        </tr>`,
        )
        .join("");

      topPagesSection = `
        <h3 style="color:#0C2340;font-size:16px;margin:20px 0 8px;">Top 5 Pages</h3>
        <table style="width:100%;border-collapse:collapse;">${topRows}</table>`;
    }
  } else {
    metricsSection = `
      <div style="background:#FEF3C7;border-left:4px solid #F59E0B;padding:12px 16px;border-radius:4px;margin:16px 0;">
        <p style="margin:0;color:#92400E;font-size:13px;">GA4 data is not available this week. Configure the GA4 Data API for traffic metrics.</p>
      </div>`;
  }

  // Registration section (always available from DB)
  const regChange =
    regsPrevWeek > 0
      ? `${regsThisWeek >= regsPrevWeek ? "+" : ""}${regsThisWeek - regsPrevWeek} vs prior week`
      : "";

  conversionsSection = `
    <h3 style="color:#0C2340;font-size:16px;margin:20px 0 8px;">Registrations</h3>
    <table style="width:100%;border-collapse:collapse;">
      ${metricRow("This Week", fmtNum(regsThisWeek), regChange)}
      ${metricRow("All Time", fmtNum(regsTotal))}
    </table>`;

  const body = `
    <h2 style="color:#1A1A2E;font-size:18px;margin:0 0 4px;">Weekly Analytics Summary</h2>
    <p style="color:#6B7280;margin:0 0 16px;font-size:14px;">${weekStart} – ${weekEnd}</p>

    ${metricsSection}
    ${topPagesSection}
    ${conversionsSection}

    <div style="margin-top:24px;text-align:center;">
      <a href="${ADMIN_URL}/admin/analytics"
         style="display:inline-block;background-color:#0C2340;color:#FFFFFF;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
        View Full Dashboard
      </a>
    </div>
  `;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F7F9FC;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#FFFFFF;border-radius:8px;overflow:hidden;border:1px solid #E5E7EB;">
    <div style="background-color:#0C2340;padding:24px 32px;text-align:center;">
      <h1 style="color:#FFFFFF;font-family:Inter,system-ui,sans-serif;font-size:20px;margin:0;">
        SOWA Platform — Weekly Report
      </h1>
    </div>
    <div style="padding:24px 32px;">
      ${body}
    </div>
    <div style="padding:16px 32px;text-align:center;font-size:12px;color:#6B7280;font-family:Inter,system-ui,sans-serif;">
      <p style="margin:0;">Skillnet Offshore Wind Academy</p>
      <p style="margin:4px 0 0;color:#9CA3AF;">
        This automated report is sent weekly. Configure recipients via <code>REPORT_EMAIL_RECIPIENTS</code>.
      </p>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: `SOWA Weekly Report — ${weekStart} – ${weekEnd}`,
    html,
  };
}
