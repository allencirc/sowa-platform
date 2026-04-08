import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseQuery, errorResponse } from "@/lib/api-utils";
import { registrationFiltersSchema } from "@/lib/validations";
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
  const result = parseQuery(url, registrationFiltersSchema);
  if (result.error) return result.error;

  const { type, contentId, status, dateFrom, dateTo, search } = result.data;

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
    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "ID",
      "Type",
      "Content ID",
      "Name",
      "Email",
      "Phone",
      "Organisation",
      "Role",
      "Dietary Requirements",
      "Additional Notes",
      "GDPR Consent",
      "Status",
      "Attended At",
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

    const rows = registrations.map((r) =>
      [
        r.id,
        r.type,
        r.contentId,
        r.name,
        r.email,
        r.phone,
        r.organisation,
        r.role,
        r.dietaryRequirements,
        r.additionalNotes,
        r.gdprConsent ? "Yes" : "No",
        r.status,
        r.attendedAt ? r.attendedAt.toISOString() : "",
        r.createdAt.toISOString(),
      ]
        .map(escapeCSV)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("Registration export error:", err);
    return errorResponse("Failed to export registrations");
  }
}
