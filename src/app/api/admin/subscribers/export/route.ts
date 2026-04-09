import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseQuery, errorResponse } from "@/lib/api-utils";
import { subscriberFiltersSchema } from "@/lib/validations";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const url = new URL(request.url);
  const result = parseQuery(url, subscriberFiltersSchema);
  if (result.error) return result.error;

  const { topic, verified, search } = result.data;

  const where: Prisma.SubscriptionWhereInput = {};
  if (topic) where.topics = { has: topic };
  if (verified !== undefined) where.verified = verified;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const subscribers = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Email",
      "Name",
      "Topics",
      "Frequency",
      "Verified",
      "GDPR Consent",
      "Created At",
    ];

    const escapeCSV = (val: string | null | undefined): string => {
      if (val == null) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = subscribers.map((s) =>
      [
        s.id,
        s.email,
        s.name,
        s.topics.join("; "),
        s.frequency,
        s.verified ? "Yes" : "No",
        s.gdprConsent ? "Yes" : "No",
        s.createdAt.toISOString(),
      ]
        .map(escapeCSV)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("Subscriber export error:", err);
    return errorResponse("Failed to export subscribers");
  }
}
