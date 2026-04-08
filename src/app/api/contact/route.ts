import { NextRequest, NextResponse } from "next/server";
import { parseBody, errorResponse } from "@/lib/api-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/validations";
import { syncContactInquiry } from "@/lib/hubspot";

/** Stricter rate limit for contact form: 5 submissions per minute per IP. */
const CONTACT_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

function getClientId(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function POST(request: NextRequest) {
  // Rate limit with stricter config for contact form
  const clientId = `contact:${getClientId(request)}`;
  const rl = checkRateLimit(clientId, CONTACT_RATE_LIMIT);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rl.resetAt),
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  const parsed = await parseBody(request, contactFormSchema);
  if (parsed.error) return parsed.error;

  const { name, email, organisation, subject, message } = parsed.data;

  try {
    // Sync to HubSpot (non-blocking)
    syncContactInquiry({ email, name, organisation, subject, message }).catch((err) => {
      console.error("[Contact] HubSpot sync failed:", err);
    });

    // Confirmation email stub
    console.log("[Contact] Would send confirmation email to:", email);

    return NextResponse.json({ message: "Message sent successfully", email }, { status: 201 });
  } catch (err) {
    console.error("Contact form submission error:", err);
    return errorResponse("Failed to process your message");
  }
}
