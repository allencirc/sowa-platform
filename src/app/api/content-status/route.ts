import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-utils";
import { isValidTransition, createContentVersion } from "@/lib/versions";
import { runScheduledPublishing } from "@/lib/scheduled-publish";
import { notifyStatusChange } from "@/lib/notifications";
import { z } from "zod";
import { ContentStatusEnum, ContentTypeEnum } from "@/lib/validations";
import type { ContentStatus, ContentType } from "@/generated/prisma/client";

const statusUpdateSchema = z.object({
  contentType: ContentTypeEnum,
  slug: z.string().min(1),
  newStatus: ContentStatusEnum,
  publishAt: z.string().datetime().optional().nullable(),
  rejectionNote: z.string().optional().nullable(),
  changeNote: z.string().optional(),
});

// Map content type to Prisma model
function getModel(contentType: ContentType) {
  switch (contentType) {
    case "CAREER":
      return prisma.career;
    case "COURSE":
      return prisma.course;
    case "EVENT":
      return prisma.event;
    case "RESEARCH":
      return prisma.research;
    case "NEWS":
      return prisma.newsArticle;
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

  const parsed = await parseBody(request, statusUpdateSchema);
  if (parsed.error) return parsed.error;

  const { contentType, slug, newStatus, publishAt, rejectionNote, changeNote } = parsed.data;

  try {
    const model = getModel(contentType as ContentType);

    // Find the content by slug
    const existing = await (
      model as never as {
        findUnique: (args: {
          where: { slug: string };
        }) => Promise<{ id: string; status: string; title?: string } | null>;
      }
    ).findUnique({
      where: { slug },
    });

    if (!existing) {
      return errorResponse("Content not found", 404);
    }

    const currentStatus = existing.status;

    // Check if transition is valid
    if (!isValidTransition(currentStatus, newStatus, user.role)) {
      return errorResponse(
        `Cannot transition from ${currentStatus} to ${newStatus} with role ${user.role}`,
        403,
      );
    }

    // If rejecting (back to DRAFT from IN_REVIEW), require a note
    if (currentStatus === "IN_REVIEW" && newStatus === "DRAFT" && !rejectionNote) {
      return errorResponse("Rejection note is required when rejecting content", 400);
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status: newStatus as ContentStatus,
      rejectionNote: newStatus === "DRAFT" && currentStatus === "IN_REVIEW" ? rejectionNote : null,
    };

    // Handle scheduled publishing
    if (newStatus === "PUBLISHED" && publishAt) {
      const publishDate = new Date(publishAt);
      if (publishDate > new Date()) {
        // Schedule for future — keep as IN_REVIEW until publish time
        updateData.status = "IN_REVIEW" as ContentStatus;
        updateData.publishAt = publishDate;
      } else {
        updateData.publishAt = null;
      }
    } else {
      updateData.publishAt = null;
    }

    // Update the content
    const updated = await (
      model as never as {
        update: (args: {
          where: { slug: string };
          data: Record<string, unknown>;
        }) => Promise<Record<string, unknown>>;
      }
    ).update({
      where: { slug },
      data: updateData,
    });

    // Create version for status change
    await createContentVersion({
      contentType: contentType as ContentType,
      contentId: existing.id,
      snapshot: updated as Record<string, unknown>,
      changedById: user.id!,
      changeNote: changeNote ?? `Status changed: ${currentStatus} → ${newStatus}`,
    });

    // Fire-and-forget email notifications
    void notifyStatusChange({
      contentType: contentType as ContentType,
      contentId: existing.id,
      contentTitle: existing.title ?? slug,
      oldStatus: currentStatus,
      newStatus,
      rejectionNote: rejectionNote ?? undefined,
      actorId: user.id!,
    });

    return NextResponse.json({
      status: updated.status,
      publishAt: updated.publishAt,
      rejectionNote: updated.rejectionNote,
    });
  } catch (err) {
    console.error("POST /api/content-status error:", err);
    return errorResponse("Failed to update status");
  }
}

/**
 * Check and auto-publish content with scheduled publishAt dates.
 * This can be called on-demand. For automatic scheduling, use the
 * Vercel Cron route at /api/cron/publish instead.
 */
export async function PUT(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const result = await runScheduledPublishing();
    return NextResponse.json(result);
  } catch (err) {
    console.error("PUT /api/content-status error:", err);
    return errorResponse("Failed to process scheduled publishing");
  }
}
