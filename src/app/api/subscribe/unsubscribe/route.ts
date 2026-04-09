import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQuery, errorResponse } from "@/lib/api-utils";
import { tokenQuerySchema } from "@/lib/validations";
import { sendEmail, subscriptionUnsubscribed } from "@/lib/email";

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
      const baseUrl = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";
      return NextResponse.redirect(new URL("/en/subscription/error", baseUrl));
    }

    await prisma.subscription.delete({
      where: { id: subscription.id },
    });

    // Send unsubscribe confirmation
    const { subject, html } = subscriptionUnsubscribed();
    await sendEmail(subscription.email, subject, html);

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://sowa.skillnetireland.ie";
    return NextResponse.redirect(new URL("/en/subscription/unsubscribed", baseUrl));
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return errorResponse("Failed to unsubscribe");
  }
}
