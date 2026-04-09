import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, parseQuery, errorResponse } from "@/lib/api-utils";
import { tokenQuerySchema, updatePreferencesSchema } from "@/lib/validations";
import { syncSubscription } from "@/lib/hubspot";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = parseQuery(url, tokenQuerySchema);
  if (parsed.error) return parsed.error;

  const { token } = parsed.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscription) {
      return errorResponse("Subscription not found", 404);
    }

    return NextResponse.json({
      email: subscription.email,
      name: subscription.name,
      topics: subscription.topics,
      frequency: subscription.frequency,
      verified: subscription.verified,
    });
  } catch (err) {
    console.error("Preferences fetch error:", err);
    return errorResponse("Failed to fetch preferences");
  }
}

export async function PUT(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = await parseBody(request, updatePreferencesSchema);
  if (parsed.error) return parsed.error;

  const { token, topics, frequency } = parsed.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscription) {
      return errorResponse("Subscription not found", 404);
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { topics, frequency },
    });

    // Re-sync to HubSpot (non-blocking)
    syncSubscription({
      email: updated.email,
      topics: updated.topics,
      frequency: updated.frequency,
      verified: updated.verified,
    }).catch((err) => {
      console.error("[Subscribe] HubSpot sync failed:", err);
    });

    return NextResponse.json({
      message: "Preferences updated",
      topics: updated.topics,
      frequency: updated.frequency,
    });
  } catch (err) {
    console.error("Preferences update error:", err);
    return errorResponse("Failed to update preferences");
  }
}
