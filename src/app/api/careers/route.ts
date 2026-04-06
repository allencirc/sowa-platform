import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  parseQuery,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-utils";
import { careerFiltersSchema, createCareerSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

// Forward maps for enum conversion
const sectorToEnum: Record<string, string> = {
  "Operations & Maintenance": "OPERATIONS_MAINTENANCE",
  "Marine Operations": "MARINE_OPERATIONS",
  "Survey & Design": "SURVEY_DESIGN",
  "Health, Safety & Environment": "HSE",
  Electrical: "ELECTRICAL",
  "Policy & Regulation": "POLICY_REGULATION",
  "Project Management": "PROJECT_MANAGEMENT",
};

const entryLevelToEnum: Record<string, string> = {
  Apprentice: "APPRENTICE",
  Entry: "ENTRY",
  Mid: "MID",
  Senior: "SENIOR",
  Leadership: "LEADERSHIP",
};

const sectorDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(sectorToEnum).map(([k, v]) => [v, k]),
);
const entryLevelDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(entryLevelToEnum).map(([k, v]) => [v, k]),
);
const pathwayTypeDisplay: Record<string, string> = {
  PROGRESSION: "progression",
  LATERAL: "lateral",
  SPECIALISATION: "specialisation",
};

const careerInclude = {
  skills: { include: { skill: true } },
  pathwayFrom: { include: { to: true } },
  relatedCourses: { include: { course: true } },
} as const;

type AnyRecord = Record<string, unknown>;

function mapCareer(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    sector: sectorDisplay[row.sector as string] ?? row.sector,
    entryLevel: entryLevelDisplay[row.entryLevel as string] ?? row.entryLevel,
    description: row.description as string,
    salaryRange:
      row.salaryMin != null && row.salaryMax != null
        ? { min: row.salaryMin as number, max: row.salaryMax as number }
        : undefined,
    keyResponsibilities: (row.keyResponsibilities as string[]) ?? [],
    qualifications: (row.qualifications as string[]) ?? [],
    workingConditions: (row.workingConditions as string) ?? undefined,
    growthOutlook: (row.growthOutlook as string) ?? undefined,
    status: (row.status as string) ?? "DRAFT",
    publishAt: row.publishAt ? (row.publishAt as Date).toISOString() : null,
    rejectionNote: (row.rejectionNote as string) ?? null,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map((s) => s.skill.slug),
    pathwayConnections: (
      (row.pathwayFrom as { to: { slug: string }; type: string; timeframe: string }[]) ?? []
    ).map((p) => ({
      to: p.to.slug,
      type: pathwayTypeDisplay[p.type] ?? p.type,
      timeframe: p.timeframe,
    })),
    relatedCourses: ((row.relatedCourses as { course: { slug: string } }[]) ?? []).map(
      (c) => c.course.slug,
    ),
  };
}

const SORTABLE_FIELDS = ["title", "sector", "entryLevel", "createdAt", "updatedAt"];

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), careerFiltersSchema);
  if (parsed.error) return parsed.error;

  const { page, limit, sortBy, order, sector, entryLevel, search } = parsed.data;
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status");

  try {
    const where: Record<string, unknown> = {};

    if (statusFilter) {
      where.status = statusFilter;
    }
    if (sector) {
      where.sector = (sectorToEnum[sector] ?? sector) as never;
    }
    if (entryLevel) {
      where.entryLevel = (entryLevelToEnum[entryLevel] ?? entryLevel) as never;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sortBy && SORTABLE_FIELDS.includes(sortBy) ? { [sortBy]: order } : { title: "asc" };

    const [rows, total] = await Promise.all([
      prisma.career.findMany({
        where: where as never,
        include: careerInclude,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.career.count({ where: where as never }),
    ]);

    const data = rows.map((r) => mapCareer(r as unknown as AnyRecord));
    return paginatedResponse(data, total, page, limit);
  } catch (err) {
    console.error("GET /api/careers error:", err);
    return errorResponse("Failed to fetch careers");
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const parsed = await parseBody(request, createCareerSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const row = await prisma.career.create({
      data: {
        slug: data.slug,
        title: data.title,
        sector: (sectorToEnum[data.sector] ?? data.sector) as never,
        entryLevel: (entryLevelToEnum[data.entryLevel] ?? data.entryLevel) as never,
        description: data.description,
        salaryMin: data.salaryRange?.min ?? null,
        salaryMax: data.salaryRange?.max ?? null,
        keyResponsibilities: data.keyResponsibilities ?? [],
        qualifications: data.qualifications,
        workingConditions: data.workingConditions ?? null,
        growthOutlook: data.growthOutlook ?? null,
        status: "DRAFT" as never,
        skills: {
          create: data.skills.map((skillSlug) => ({
            skill: { connect: { slug: skillSlug } },
          })),
        },
      },
      include: careerInclude,
    });

    const mapped = mapCareer(row as unknown as AnyRecord);

    // Create initial version
    await createContentVersion({
      contentType: "CAREER",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: "Initial creation",
    });

    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return errorResponse("A career with this slug already exists", 409);
    }
    console.error("POST /api/careers error:", err);
    return errorResponse("Failed to create career");
  }
}
