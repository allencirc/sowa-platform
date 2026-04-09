import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQuery, errorResponse } from "@/lib/api-utils";
import { tokenQuerySchema } from "@/lib/validations";
import { sendEmail, subscriptionConfirmed } from "@/lib/email";
import { syncSubscription } from "@/lib/hubspot";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = parseQuery(url, tokenQuerySchema);
  if (parsed.error) return parsed.error;

  const { token } = parsed.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { verificationToken: token },
    });

    if (!subscription) {
      const baseUrl = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";
      return NextResponse.redirect(new URL("/en/subscription/error", baseUrl));
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { verified: true },
    });

    // Send confirmation email
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";
    const preferencesLink = `${baseUrl}/en/subscription/preferences?token=${subscription.unsubscribeToken}`;
    const unsubscribeLink = `${baseUrl}/api/subscribe/unsubscribe?token=${subscription.unsubscribeToken}`;
    const { subject, html } = subscriptionConfirmed(preferencesLink, unsubscribeLink);
    await sendEmail(subscription.email, subject, html);

    // Update HubSpot (non-blocking)
    syncSubscription({
      email: subscription.email,
      topics: subscription.topics,
      frequency: subscription.frequency,
      verified: true,
    }).catch((err) => {
      console.error("[Subscribe] HubSpot sync failed:", err);
    });

    return NextResponse.redirect(new URL("/en/subscription/confirmed", baseUrl));
  } catch (err) {
    console.error("Verification error:", err);
    return errorResponse("Failed to verify subscription");
  }
}
