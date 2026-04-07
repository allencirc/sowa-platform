import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  parseQuery,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-utils";
import { courseFiltersSchema, createCourseSchema, draftCourseSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";
import { uniqueSlug } from "@/lib/unique-slug";

const providerTypeToEnum: Record<string, string> = {
  University: "UNIVERSITY",
  ETB: "ETB",
  Private: "PRIVATE",
  Industry: "INDUSTRY",
  Skillnet_Network: "SKILLNET_NETWORK",
  Government: "GOVERNMENT",
};
const deliveryFormatToEnum: Record<string, string> = {
  "In-Person": "IN_PERSON",
  Online: "ONLINE",
  Blended: "BLENDED",
  "Self-Paced": "SELF_PACED",
};
const providerTypeDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(providerTypeToEnum).map(([k, v]) => [v, k]),
);
const deliveryFormatDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(deliveryFormatToEnum).map(([k, v]) => [v, k]),
);

const courseInclude = {
  skills: { include: { skill: true } },
  careerRelevance: { include: { career: true } },
} as const;

type AnyRecord = Record<string, unknown>;

function mapCourse(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    provider: row.provider as string,
    providerType: providerTypeDisplay[row.providerType as string] ?? row.providerType,
    description: row.description as string,
    entryRequirements: (row.entryRequirements as string) ?? undefined,
    deliveryFormat: deliveryFormatDisplay[row.deliveryFormat as string] ?? row.deliveryFormat,
    location: (row.location as string) ?? undefined,
    nfqLevel: (row.nfqLevel as number | null) ?? undefined,
    duration: row.duration as string,
    cost: row.cost as number,
    costNotes: (row.costNotes as string) ?? undefined,
    nextStartDate: row.nextStartDate
      ? (row.nextStartDate as Date).toISOString().split("T")[0]
      : undefined,
    accredited: (row.accredited as boolean) ?? undefined,
    certificationAwarded: (row.certificationAwarded as string) ?? undefined,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map((s) => s.skill.slug),
    careerRelevance: ((row.careerRelevance as { career: { slug: string } }[]) ?? []).map(
      (c) => c.career.slug,
    ),
    tags: (row.tags as string[]) ?? [],
    status: (row.status as string) ?? "DRAFT",
    publishAt: row.publishAt ? (row.publishAt as Date).toISOString() : null,
    rejectionNote: (row.rejectionNote as string) ?? null,
  };
}

const SORTABLE_FIELDS = ["title", "cost", "nfqLevel", "nextStartDate", "createdAt"];

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), courseFiltersSchema);
  if (parsed.error) return parsed.error;

  const {
    page,
    limit,
    sortBy,
    order,
    topic,
    format,
    costMax,
    freeOnly,
    provider,
    providerType,
    startingSoon,
    nfqLevel,
    search,
  } = parsed.data;

  try {
    const where: Record<string, unknown> = {};

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    if (statusFilter) {
      where.status = statusFilter;
    }

    if (format) {
      where.deliveryFormat = (deliveryFormatToEnum[format] ?? format) as never;
    }
    if (providerType) {
      where.providerType = (providerTypeToEnum[providerType] ?? providerType) as never;
    }
    if (freeOnly) {
      where.cost = 0;
    } else if (costMax !== undefined) {
      where.cost = { lte: costMax };
    }
    if (nfqLevel !== undefined) {
      where.nfqLevel = nfqLevel;
    }
    if (startingSoon) {
      const now = new Date();
      const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      where.nextStartDate = { gte: now, lte: threeMonths };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { provider: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sortBy && SORTABLE_FIELDS.includes(sortBy) ? { [sortBy]: order } : { title: "asc" };

    const [allRows, total] = await Promise.all([
      prisma.course.findMany({
        where: where as never,
        include: courseInclude,
        orderBy: orderBy as never,
        // If topic filter is set, we need to filter in-memory, so fetch all
        ...(topic ? {} : { skip: (page - 1) * limit, take: limit }),
      }),
      prisma.course.count({ where: where as never }),
    ]);

    let rows = allRows;

    // Topic filter is text-based (tags + skills), done in-memory
    if (topic) {
      const t = topic.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.tags.some((tag: string) => tag.toLowerCase().includes(t)) ||
          c.skills.some((s: { skill: { slug: string } }) => s.skill.slug.toLowerCase().includes(t)),
      );
    }

    // Provider name filter (text match)
    if (provider) {
      const p = provider.toLowerCase();
      rows = rows.filter((c) => c.provider.toLowerCase().includes(p));
    }

    // Apply pagination after in-memory filters if needed
    const filteredTotal = topic || provider ? rows.length : total;
    if (topic || provider) {
      rows = rows.slice((page - 1) * limit, page * limit);
    }

    const data = rows.map((r) => mapCourse(r as unknown as AnyRecord));
    return paginatedResponse(data, filteredTotal, page, limit);
  } catch (err) {
    console.error("GET /api/courses error:", err);
    return errorResponse("Failed to fetch courses");
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const isDraft = new URL(request.url).searchParams.get("draft") === "true";
  const schema = isDraft ? draftCourseSchema : createCourseSchema;
  const parsed = await parseBody(request, schema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const slug = await uniqueSlug(data.slug, "course");

    const row = await prisma.course.create({
      data: {
        slug,
        title: data.title,
        provider: data.provider ?? "",
        providerType: (providerTypeToEnum[data.providerType ?? "University"] ??
          "UNIVERSITY") as never,
        description: data.description ?? "",
        entryRequirements: data.entryRequirements ?? null,
        deliveryFormat: (deliveryFormatToEnum[data.deliveryFormat ?? "In-Person"] ??
          "IN_PERSON") as never,
        location: data.location ?? null,
        nfqLevel: data.nfqLevel ?? null,
        duration: data.duration ?? "",
        cost: data.cost ?? 0,
        costNotes: data.costNotes ?? null,
        nextStartDate: data.nextStartDate ? new Date(data.nextStartDate) : null,
        accredited: data.accredited ?? false,
        certificationAwarded: data.certificationAwarded ?? null,
        tags: data.tags ?? [],
        status: "DRAFT" as never,
        ...(data.skills?.length
          ? {
              skills: {
                create: data.skills.map((skillSlug) => ({
                  skill: { connect: { slug: skillSlug } },
                })),
              },
            }
          : {}),
        ...(data.careerRelevance?.length
          ? {
              careerRelevance: {
                create: data.careerRelevance.map((careerSlug) => ({
                  career: { connect: { slug: careerSlug } },
                })),
              },
            }
          : {}),
      },
      include: courseInclude,
    });

    const mapped = mapCourse(row as unknown as AnyRecord);

    await createContentVersion({
      contentType: "COURSE",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: "Initial creation",
    });

    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return errorResponse("A course with this slug already exists", 409);
    }
    console.error("POST /api/courses error:", err);
    return errorResponse("Failed to create course");
  }
}
