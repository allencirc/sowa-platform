import { NextRequest, NextResponse } from "next/server";
import { detectStaleContent, upsertAlerts } from "@/lib/freshness-check";
import { generateFreshnessDigestHtml } from "@/lib/freshness-email";
import { sendEmail } from "@/lib/email";

/**
 * Vercel Cron endpoint — runs every Wednesday at 6 AM UTC.
 * Detects stale/expired/outdated published content and sends
 * a digest email to the admin team.
 *
 * Secured via CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * automatically.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await detectStaleContent();

    if (items.length === 0) {
      return NextResponse.json({ ok: true, alertsDetected: 0, skipped: true });
    }

    const { created, existing, reopened } = await upsertAlerts(items);

    let emailSent = false;
    const newAlerts = created + reopened;

    if (newAlerts > 0) {
      const recipientsRaw = process.env.REPORT_EMAIL_RECIPIENTS;
      if (recipientsRaw) {
        const recipients = recipientsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        if (recipients.length > 0) {
          const { subject, html } = generateFreshnessDigestHtml(items);
          await Promise.all(recipients.map((to) => sendEmail(to, subject, html)));
          emailSent = true;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      alertsDetected: items.length,
      newAlerts: created,
      reopened,
      existing,
      emailSent,
    });
  } catch (err) {
    console.error("Cron /api/cron/freshness-check error:", err);
    return NextResponse.json({ error: "Failed to run freshness check" }, { status: 500 });
  }
}
