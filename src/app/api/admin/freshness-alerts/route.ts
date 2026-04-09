import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAlerts } from "@/lib/freshness-check";
import type { AlertType, ContentType } from "@/generated/prisma/client";

const VALID_CONTENT_TYPES = new Set(["CAREER", "COURSE", "EVENT", "RESEARCH", "NEWS"]);
const VALID_ALERT_TYPES = new Set(["EXPIRED_DATE", "STALE", "OUTDATED"]);

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
  const resolved = searchParams.get("resolved") === "true";

  const contentTypeParam = searchParams.get("contentType");
  const alertTypeParam = searchParams.get("alertType");

  const contentType =
    contentTypeParam && VALID_CONTENT_TYPES.has(contentTypeParam)
      ? (contentTypeParam as ContentType)
      : undefined;

  const alertType =
    alertTypeParam && VALID_ALERT_TYPES.has(alertTypeParam)
      ? (alertTypeParam as AlertType)
      : undefined;

  try {
    const { alerts, total } = await getAlerts({ contentType, alertType, resolved, page, limit });

    return NextResponse.json({
      ok: true,
      alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET /api/admin/freshness-alerts error:", err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
