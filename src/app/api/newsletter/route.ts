import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { syncNewsletterSubscription } from "@/lib/hubspot";

const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
  topics: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = await parseBody(request, newsletterSchema);
  if (parsed.error) return parsed.error;

  const { email, topics } = parsed.data;

  try {
    // Sync to HubSpot (non-blocking — we don't fail the request if HubSpot is down)
    syncNewsletterSubscription({ email, topics }).catch((err) => {
      console.error("[Newsletter] HubSpot sync failed:", err);
    });

    return NextResponse.json(
      { message: "Subscribed successfully", email, topics },
      { status: 201 }
    );
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return errorResponse("Failed to process subscription");
  }
}
