import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseQuery, paginatedResponse, errorResponse } from "@/lib/api-utils";
import { registrationFiltersSchema } from "@/lib/validations";
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
  const result = parseQuery(url, registrationFiltersSchema);
  if (result.error) return result.error;

  const { page, limit, type, contentId, status, dateFrom, dateTo, search, sortBy, order } =
    result.data;

  const where: Prisma.RegistrationWhereInput = {};

  if (type) where.type = type;
  if (contentId) where.contentId = contentId;
  if (status) where.status = status;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { organisation: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        orderBy: { [sortBy || "createdAt"]: order || "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registration.count({ where }),
    ]);

    return paginatedResponse(registrations, total, page, limit);
  } catch (err) {
    console.error("Registration list error:", err);
    return errorResponse("Failed to fetch registrations");
  }
}
