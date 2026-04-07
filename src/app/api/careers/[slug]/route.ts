import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { updateCareerSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;

  try {
    const row = await prisma.career.findUnique({
      where: { slug },
      include: careerInclude,
    });

    if (!row) {
      return errorResponse("Career not found", 404);
    }

    return NextResponse.json(mapCareer(row as unknown as AnyRecord));
  } catch (err) {
    console.error(`GET /api/careers/${slug} error:`, err);
    return errorResponse("Failed to fetch career");
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const { slug } = await params;
  const parsed = await parseBody(request, updateCareerSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  // Extract changeNote from request body (not in Zod schema)
  let changeNote: string | undefined;
  try {
    const rawBody = await request.clone().json();
    changeNote = rawBody.changeNote;
  } catch {
    // ignore
  }

  try {
    const row = await prisma.career.update({
      where: { slug },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.sector !== undefined && {
          sector: (sectorToEnum[data.sector] ?? data.sector) as never,
        }),
        ...(data.entryLevel !== undefined && {
          entryLevel: (entryLevelToEnum[data.entryLevel] ?? data.entryLevel) as never,
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.salaryRange !== undefined && {
          salaryMin: data.salaryRange?.min ?? null,
          salaryMax: data.salaryRange?.max ?? null,
        }),
        ...(data.keyResponsibilities !== undefined && {
          keyResponsibilities: data.keyResponsibilities,
        }),
        ...(data.qualifications !== undefined && {
          qualifications: data.qualifications,
        }),
        ...(data.workingConditions !== undefined && {
          workingConditions: data.workingConditions ?? null,
        }),
        ...(data.growthOutlook !== undefined && {
          growthOutlook: data.growthOutlook ?? null,
        }),
      },
      include: careerInclude,
    });

    const mapped = mapCareer(row as unknown as AnyRecord);

    // Create version on every save
    await createContentVersion({
      contentType: "CAREER",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote,
    });

    return NextResponse.json(mapped);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return errorResponse("Career not found", 404);
    }
    console.error(`PUT /api/careers/${slug} error:`, err);
    return errorResponse("Failed to update career");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const user = await requireRole(["ADMIN"]);
    const { slug } = await params;

    await prisma.career.update({
      where: { slug },
      data: { deletedAt: new Date(), deletedById: user.id },
    });
    return NextResponse.json({ message: "Moved to trash" });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return errorResponse("Career not found", 404);
    }
    if (err instanceof Error && "status" in err) {
      return errorResponse(err.message, (err as { status: number }).status);
    }
    console.error("DELETE /api/careers error:", err);
    return errorResponse("Failed to delete career");
  }
}
