import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseQuery, paginatedResponse, errorResponse } from "@/lib/api-utils";
import { subscriberFiltersSchema } from "@/lib/validations";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN", "EDITOR", "VIEWER"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const url = new URL(request.url);
  const result = parseQuery(url, subscriberFiltersSchema);
  if (result.error) return result.error;

  const { page, limit, topic, verified, search } = result.data;

  const where: Prisma.SubscriptionWhereInput = {};

  if (topic) {
    where.topics = { has: topic };
  }

  if (verified !== undefined) {
    where.verified = verified;
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [subscribers, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return paginatedResponse(subscribers, total, page, limit);
  } catch (err) {
    console.error("Subscribers list error:", err);
    return errorResponse("Failed to fetch subscribers");
  }
}
