import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { createSubscriptionSchema } from "@/lib/validations";
import { sendEmail, subscriptionVerification } from "@/lib/email";
import { syncSubscription } from "@/lib/hubspot";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = await parseBody(request, createSubscriptionSchema);
  if (parsed.error) return parsed.error;

  const { email, name, topics, frequency, gdprConsent } = parsed.data;

  try {
    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({ where: { email } });

    if (existing?.verified) {
      return errorResponse("This email is already subscribed.", 409);
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const unsubscribeToken = crypto.randomBytes(32).toString("hex");

    const subscription = await prisma.subscription.upsert({
      where: { email },
      update: {
        name: name || null,
        topics,
        frequency,
        gdprConsent,
        verificationToken,
        unsubscribeToken,
        verified: false,
      },
      create: {
        email,
        name: name || null,
        topics,
        frequency,
        gdprConsent,
        verificationToken,
        unsubscribeToken,
      },
    });

    // Send verification email
    const baseUrl = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";
    const verifyLink = `${baseUrl}/api/subscribe/verify?token=${verificationToken}`;
    const topicLabels = topics.map((t) => t.charAt(0) + t.slice(1).toLowerCase());
    const { subject, html } = subscriptionVerification(verifyLink, topicLabels);
    await sendEmail(email, subject, html);

    // Sync to HubSpot (non-blocking)
    syncSubscription({
      email,
      topics,
      frequency,
      verified: false,
    }).catch((err) => {
      console.error("[Subscribe] HubSpot sync failed:", err);
    });

    return NextResponse.json(
      { message: "Verification email sent", id: subscription.id },
      { status: 201 },
    );
  } catch (err) {
    console.error("Subscription error:", err);
    return errorResponse("Failed to process subscription");
  }
}
