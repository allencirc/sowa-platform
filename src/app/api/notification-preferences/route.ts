import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-utils";
import { NOTIFICATION_EVENTS, type NotificationEvent } from "@/lib/notifications";
import { z } from "zod";

const ALL_EVENTS = NOTIFICATION_EVENTS;

/**
 * GET /api/notification-preferences
 * Returns the current user's notification preferences.
 * Missing rows default to enabled.
 */
export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const stored = await prisma.notificationPreference.findMany({
    where: { userId: user.id },
    select: { event: true, enabled: true },
  });

  const storedMap = new Map(stored.map((p) => [p.event, p.enabled]));

  const preferences = ALL_EVENTS.map((event) => ({
    event,
    enabled: storedMap.get(event) ?? true,
  }));

  return NextResponse.json({ preferences });
}

const updateSchema = z.object({
  event: z.enum(NOTIFICATION_EVENTS),
  enabled: z.boolean(),
});

/**
 * PUT /api/notification-preferences
 * Upsert a single notification preference.
 */
export async function PUT(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const parsed = await parseBody(request, updateSchema);
  if (parsed.error) return parsed.error;

  const { event, enabled } = parsed.data;

  const pref = await prisma.notificationPreference.upsert({
    where: { userId_event: { userId: user.id!, event } },
    update: { enabled },
    create: { userId: user.id!, event, enabled },
  });

  return NextResponse.json({ event: pref.event, enabled: pref.enabled });
}
