import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { generateWeeklyReportHtml } from "@/lib/report-email";

/**
 * Vercel Cron endpoint — runs every Monday at 8 AM UTC.
 * Sends a weekly analytics summary email to the admin team.
 *
 * Recipients are configured via the REPORT_EMAIL_RECIPIENTS env var
 * (comma-separated list of email addresses).
 *
 * Secured via CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * automatically.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipientsRaw = process.env.REPORT_EMAIL_RECIPIENTS;
  if (!recipientsRaw) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "REPORT_EMAIL_RECIPIENTS is not configured",
    });
  }

  const recipients = recipientsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "No valid recipients",
    });
  }

  try {
    const report = await generateWeeklyReportHtml();
    if (!report) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Report generation returned null",
      });
    }

    await Promise.all(recipients.map((to) => sendEmail(to, report.subject, report.html)));

    return NextResponse.json({
      ok: true,
      sentTo: recipients.length,
    });
  } catch (err) {
    console.error("Cron /api/cron/weekly-report error:", err);
    return NextResponse.json({ error: "Failed to send weekly report" }, { status: 500 });
  }
}
