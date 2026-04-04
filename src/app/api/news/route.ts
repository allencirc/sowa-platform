import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  parseQuery,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-utils";
import { newsFiltersSchema, createNewsSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

type AnyRecord = Record<string, unknown>;

function mapNews(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    date: (row.date as Date).toISOString().split("T")[0],
    excerpt: row.excerpt as string,
    content: row.content as string,
    category: row.category as string,
    author: row.author as string,
    image: (row.image as string) ?? undefined,
    status: (row.status as string) ?? "DRAFT",
    publishAt: row.publishAt ? (row.publishAt as Date).toISOString() : null,
    rejectionNote: (row.rejectionNote as string) ?? null,
  };
}

const SORTABLE_FIELDS = ["title", "date", "category", "createdAt"];

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), newsFiltersSchema);
  if (parsed.error) return parsed.error;

  const { page, limit, sortBy, order, category, search } = parsed.data;

  try {
    const where: Record<string, unknown> = {};

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    if (statusFilter) {
      where.status = statusFilter;
    }

    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sortBy && SORTABLE_FIELDS.includes(sortBy)
        ? { [sortBy]: order }
        : { date: "desc" };

    const [rows, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where: where as never,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsArticle.count({ where: where as never }),
    ]);

    const data = rows.map((r) => mapNews(r as unknown as AnyRecord));
    return paginatedResponse(data, total, page, limit);
  } catch (err) {
    console.error("GET /api/news error:", err);
    return errorResponse("Failed to fetch news");
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

  const parsed = await parseBody(request, createNewsSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const row = await prisma.newsArticle.create({
      data: {
        slug: data.slug,
        title: data.title,
        date: new Date(data.date),
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        author: data.author,
        image: data.image ?? null,
        status: "DRAFT" as never,
      },
    });

    const mapped = mapNews(row as unknown as AnyRecord);

    // Create initial version
    await createContentVersion({
      contentType: "NEWS",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: "Initial creation",
    });

    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return errorResponse("A news article with this slug already exists", 409);
    }
    console.error("POST /api/news error:", err);
    return errorResponse("Failed to create news article");
  }
}
