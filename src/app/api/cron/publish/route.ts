import { NextRequest, NextResponse } from "next/server";
import { runScheduledPublishing } from "@/lib/scheduled-publish";

/**
 * Vercel Cron endpoint — runs every 15 minutes.
 * Auto-publishes scheduled content and auto-archives stale events.
 *
 * Secured via CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * automatically. Set the CRON_SECRET env var in your Vercel project settings.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScheduledPublishing();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Cron /api/cron/publish error:", err);
    return NextResponse.json({ error: "Failed to process scheduled publishing" }, { status: 500 });
  }
}
