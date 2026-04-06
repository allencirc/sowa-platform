import { prisma } from "@/lib/prisma";
import { createContentVersion } from "@/lib/versions";
import type { ContentStatus, ContentType } from "@/generated/prisma/client";

/**
 * Auto-publish scheduled content and auto-archive stale events.
 * Shared between the PUT /api/content-status endpoint and the Vercel Cron route.
 */
export async function runScheduledPublishing() {
  const now = new Date();
  let publishedCount = 0;

  const models = [
    { model: prisma.career, type: "CAREER" as ContentType },
    { model: prisma.course, type: "COURSE" as ContentType },
    { model: prisma.event, type: "EVENT" as ContentType },
    { model: prisma.research, type: "RESEARCH" as ContentType },
    { model: prisma.newsArticle, type: "NEWS" as ContentType },
  ];

  for (const { model, type } of models) {
    const items = await (
      model as never as {
        findMany: (args: {
          where: Record<string, unknown>;
        }) => Promise<{ id: string; slug: string }[]>;
      }
    ).findMany({
      where: {
        status: "IN_REVIEW",
        publishAt: { lte: now },
      },
    });

    for (const item of items) {
      await (
        model as never as {
          update: (args: {
            where: { id: string };
            data: Record<string, unknown>;
          }) => Promise<Record<string, unknown>>;
        }
      ).update({
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

  return { publishedCount, archivedCount };
}
