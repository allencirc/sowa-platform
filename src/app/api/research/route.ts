import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  parseQuery,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-utils";
import {
  researchFiltersSchema,
  createResearchSchema,
  draftResearchSchema,
} from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";
import { uniqueSlug } from "@/lib/unique-slug";

type AnyRecord = Record<string, unknown>;

function mapResearch(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    author: row.author as string,
    organisation: row.organisation as string,
    publicationDate: (row.publicationDate as Date).toISOString().split("T")[0],
    summary: row.summary as string,
    categories: (row.categories as string[]) ?? [],
    isFeatured: (row.isFeatured as boolean) ?? undefined,
    image: (row.image as string) ?? undefined,
    status: (row.status as string) ?? "DRAFT",
    publishAt: row.publishAt ? (row.publishAt as Date).toISOString() : null,
    rejectionNote: (row.rejectionNote as string) ?? null,
  };
}

const SORTABLE_FIELDS = ["title", "publicationDate", "author", "createdAt"];

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), researchFiltersSchema);
  if (parsed.error) return parsed.error;

  const { page, limit, sortBy, order, category, featured, search } = parsed.data;

  try {
    const where: Record<string, unknown> = {};

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    if (statusFilter) {
      where.status = statusFilter;
    }

    if (category) {
      where.categories = { has: category };
    }
    if (featured !== undefined) {
      where.isFeatured = featured;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { organisation: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sortBy && SORTABLE_FIELDS.includes(sortBy)
        ? { [sortBy]: order }
        : { publicationDate: "desc" };

    const [rows, total] = await Promise.all([
      prisma.research.findMany({
        where: where as never,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.research.count({ where: where as never }),
    ]);

    const data = rows.map((r) => mapResearch(r as unknown as AnyRecord));
    return paginatedResponse(data, total, page, limit);
  } catch (err) {
    console.error("GET /api/research error:", err);
    return errorResponse("Failed to fetch research");
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

  const isDraft = new URL(request.url).searchParams.get("draft") === "true";
  const schema = isDraft ? draftResearchSchema : createResearchSchema;
  const parsed = await parseBody(request, schema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const slug = await uniqueSlug(data.slug, "research");

    const row = await prisma.research.create({
      data: {
        slug,
        title: data.title,
        author: data.author ?? "",
        organisation: data.organisation ?? "",
        publicationDate: data.publicationDate ? new Date(data.publicationDate) : new Date(),
        summary: data.summary ?? "",
        categories: data.categories ?? [],
        isFeatured: data.isFeatured ?? false,
        image: data.image ?? null,
        status: "DRAFT" as never,
      },
    });

    const mapped = mapResearch(row as unknown as AnyRecord);

    // Create initial version
    await createContentVersion({
      contentType: "RESEARCH",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: "Initial creation",
    });

    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return errorResponse("A research item with this slug already exists", 409);
    }
    console.error("POST /api/research error:", err);
    return errorResponse("Failed to create research");
  }
}
