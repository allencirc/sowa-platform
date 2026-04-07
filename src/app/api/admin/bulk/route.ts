import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
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

function getPrismaModel(contentType: keyof typeof CONTENT_TYPE_TO_MODEL) {
  const model = CONTENT_TYPE_TO_MODEL[contentType];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

const bulkSchema = z.object({
  action: z.enum(["updateStatus", "delete", "restore"]),
  contentType: z.enum(["CAREER", "COURSE", "EVENT", "RESEARCH", "NEWS"]),
  ids: z.array(z.string().min(1)).min(1).max(50),
  status: z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
});

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

  const parsed = await parseBody(request, bulkSchema);
  if (parsed.error) return parsed.error;

  const { action, contentType, ids, status } = parsed.data;

  if (action === "updateStatus" && !status) {
    return errorResponse("Status is required for updateStatus action", 400);
  }

  const model = getPrismaModel(contentType);

  try {
    let updated = 0;

    switch (action) {
      case "updateStatus": {
        const result = await model.updateMany({
          where: { id: { in: ids }, deletedAt: null },
          data: { status },
        });
        updated = result.count;

        // Create version snapshots for each updated item
        const items = await model.findMany({
          where: { id: { in: ids } },
        });
        for (const item of items) {
          await createContentVersion({
            contentType: contentType as ContentType,
            contentId: item.id,
            snapshot: item as unknown as Record<string, unknown>,
            changedById: user.id!,
            changeNote: `Bulk status change to ${status}`,
          });
        }
        break;
      }

      case "delete": {
        const result = await model.updateMany({
          where: { id: { in: ids }, deletedAt: null },
          data: { deletedAt: new Date(), deletedById: user.id },
        });
        updated = result.count;
        break;
      }

      case "restore": {
        const result = await model.updateMany({
          where: { id: { in: ids }, deletedAt: { not: null } },
          data: { deletedAt: null, deletedById: null },
        });
        updated = result.count;
        break;
      }
    }

    return NextResponse.json({ updated });
  } catch (err) {
    console.error("POST /api/admin/bulk error:", err);
    return errorResponse("Failed to perform bulk action");
  }
}
