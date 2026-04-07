import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse, paginatedResponse } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";
import type { ContentType } from "@/generated/prisma/client";

const CONTENT_TYPE_TO_MODEL = {
  CAREER: "career",
  COURSE: "course",
  EVENT: "event",
  RESEARCH: "research",
  NEWS: "newsArticle",
} as const;

const CONTENT_TYPE_LABELS: Record<string, string> = {
  CAREER: "Career",
  COURSE: "Course",
  EVENT: "Event",
  RESEARCH: "Research",
  NEWS: "News",
};

function getPrismaModel(contentType: keyof typeof CONTENT_TYPE_TO_MODEL) {
  const model = CONTENT_TYPE_TO_MODEL[contentType];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

// GET — list all soft-deleted items across all content types
export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return errorResponse(err.message, (err as { status: number }).status);
    }
    return errorResponse("Unauthorized", 401);
  }

  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20")));
  const typeFilter = url.searchParams.get("contentType");

  try {
    const typesToQuery = typeFilter
      ? [typeFilter as keyof typeof CONTENT_TYPE_TO_MODEL]
      : (Object.keys(CONTENT_TYPE_TO_MODEL) as (keyof typeof CONTENT_TYPE_TO_MODEL)[]);

    // Fetch soft-deleted items from each content type
    const allItems: {
      id: string;
      slug: string;
      title: string;
      contentType: string;
      deletedAt: Date;
      deletedById: string | null;
    }[] = [];

    for (const ct of typesToQuery) {
      const model = getPrismaModel(ct);
      const rows = await model.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, slug: true, title: true, deletedAt: true, deletedById: true },
        orderBy: { deletedAt: "desc" },
      });
      for (const row of rows) {
        allItems.push({ ...row, contentType: ct });
      }
    }

    // Sort all items by deletedAt desc
    allItems.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

    const total = allItems.length;
    const paginated = allItems.slice((page - 1) * limit, page * limit);

    // Resolve deletedBy user names
    const userIds = [...new Set(paginated.map((i) => i.deletedById).filter(Boolean))] as string[];
    const users = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u.name ?? u.email]));

    const data = paginated.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      contentType: item.contentType,
      contentTypeLabel: CONTENT_TYPE_LABELS[item.contentType] ?? item.contentType,
      deletedAt: item.deletedAt.toISOString(),
      deletedBy: item.deletedById ? (userMap.get(item.deletedById) ?? "Unknown") : "Unknown",
    }));

    return paginatedResponse(data, total, page, limit);
  } catch (err) {
    console.error("GET /api/admin/trash error:", err);
    return errorResponse("Failed to fetch trash");
  }
}

const restoreSchema = z.object({
  contentType: z.enum(["CAREER", "COURSE", "EVENT", "RESEARCH", "NEWS"]),
  slug: z.string().min(1),
});

// POST — restore a soft-deleted item
export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN"]);
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return errorResponse(err.message, (err as { status: number }).status);
    }
    return errorResponse("Unauthorized", 401);
  }

  const parsed = await parseBody(request, restoreSchema);
  if (parsed.error) return parsed.error;

  const { contentType, slug } = parsed.data;

  try {
    const model = getPrismaModel(contentType);

    const item = await model.findUnique({ where: { slug } });
    if (!item || !item.deletedAt) {
      return errorResponse("Item not found in trash", 404);
    }

    await model.update({
      where: { slug },
      data: { deletedAt: null, deletedById: null },
    });

    // Create a version snapshot for the restore
    await createContentVersion({
      contentType: contentType as ContentType,
      contentId: item.id,
      snapshot: item as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: "Restored from trash",
    });

    return NextResponse.json({ message: "Restored successfully" });
  } catch (err) {
    console.error("POST /api/admin/trash (restore) error:", err);
    return errorResponse("Failed to restore item");
  }
}

const purgeSchema = z.object({
  contentType: z.enum(["CAREER", "COURSE", "EVENT", "RESEARCH", "NEWS"]),
  slug: z.string().min(1),
});

// DELETE — permanently delete a soft-deleted item
export async function DELETE(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN"]);
  } catch (err) {
    if (err instanceof Error && "status" in err) {
      return errorResponse(err.message, (err as { status: number }).status);
    }
    return errorResponse("Unauthorized", 401);
  }

  const parsed = await parseBody(request, purgeSchema);
  if (parsed.error) return parsed.error;

  const { contentType, slug } = parsed.data;

  try {
    const model = getPrismaModel(contentType);

    const item = await model.findUnique({ where: { slug } });
    if (!item || !item.deletedAt) {
      return errorResponse("Item not found in trash", 404);
    }

    await model.delete({ where: { slug } });

    return NextResponse.json({ message: "Permanently deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/trash (purge) error:", err);
    return errorResponse("Failed to purge item");
  }
}
