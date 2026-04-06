import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-utils";
import { isValidTransition, createContentVersion } from "@/lib/versions";
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

  const { contentType, slug, newStatus, publishAt, rejectionNote, changeNote } =
    parsed.data;

  try {
    const model = getModel(contentType as ContentType);

    // Find the content by slug
    const existing = await (model as never as { findUnique: (args: { where: { slug: string } }) => Promise<{ id: string; status: string; title?: string } | null> }).findUnique({
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
        403
      );
    }

    // If rejecting (back to DRAFT from IN_REVIEW), require a note
    if (
      currentStatus === "IN_REVIEW" &&
      newStatus === "DRAFT" &&
      !rejectionNote
    ) {
      return errorResponse("Rejection note is required when rejecting content", 400);
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status: newStatus as ContentStatus,
      rejectionNote:
        newStatus === "DRAFT" && currentStatus === "IN_REVIEW"
          ? rejectionNote
          : null,
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
    const updated = await (model as never as { update: (args: { where: { slug: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>> }).update({
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
 * This can be called by a cron job or on-demand.
 */
export async function PUT(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const now = new Date();
    let publishedCount = 0;

    // Find all content with publishAt <= now that is still IN_REVIEW
    const models = [
      { model: prisma.career, type: "CAREER" as ContentType },
      { model: prisma.course, type: "COURSE" as ContentType },
      { model: prisma.event, type: "EVENT" as ContentType },
      { model: prisma.research, type: "RESEARCH" as ContentType },
      { model: prisma.newsArticle, type: "NEWS" as ContentType },
    ];

    for (const { model, type } of models) {
      const items = await (model as never as { findMany: (args: { where: Record<string, unknown> }) => Promise<{ id: string; slug: string }[]> }).findMany({
        where: {
          status: "IN_REVIEW",
          publishAt: { lte: now },
        },
      });

      for (const item of items) {
        await (model as never as { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>> }).update({
          where: { id: item.id },
          data: {
            status: "PUBLISHED" as ContentStatus,
            publishAt: null,
          },
        });

        await createContentVersion({
          contentType: type,
          contentId: item.id,
          snapshot: { status: "PUBLISHED", autoPublished: true },
          changedById: "system",
          changeNote: "Auto-published (scheduled)",
        }).catch(() => {
          // Ignore version creation errors for system auto-publish
        });

        publishedCount++;
      }
    }

    // Auto-archive PUBLISHED events whose endDate is older than 30 days
    const archiveCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let archivedCount = 0;

    const staleEvents = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        endDate: { lt: archiveCutoff },
      },
      select: { id: true, slug: true },
    });

    for (const evt of staleEvents) {
      await prisma.event.update({
        where: { id: evt.id },
        data: { status: "ARCHIVED" as ContentStatus },
      });

      await createContentVersion({
        contentType: "EVENT" as ContentType,
        contentId: evt.id,
        snapshot: { status: "ARCHIVED", autoArchived: true },
        changedById: "system",
        changeNote: "Auto-archived (endDate > 30d old)",
      }).catch(() => {
        // Ignore version creation errors for system auto-archive
      });

      archivedCount++;
    }

    return NextResponse.json({ publishedCount, archivedCount });
  } catch (err) {
    console.error("PUT /api/content-status error:", err);
    return errorResponse("Failed to process scheduled publishing");
  }
}
