/**
 * Content freshness detection and alert management.
 *
 * Detects published content that has become stale, expired, or outdated
 * and upserts persistent alerts in the database.
 */

import { prisma } from "@/lib/prisma";
import type { AlertType, ContentType, FreshnessAlert } from "@/generated/prisma/client";

// ─── Types ───────────────────────────────────────────────

export interface FreshnessAlertItem {
  contentType: ContentType;
  contentId: string;
  slug: string;
  title: string;
  alertType: AlertType;
  detectedAt: Date;
}

export interface UpsertResult {
  created: number;
  existing: number;
  reopened: number;
}

export interface AlertFilters {
  contentType?: ContentType;
  alertType?: AlertType;
  resolved?: boolean;
  page?: number;
  limit?: number;
}

// ─── Detection ───────────────────────────────────────────

/**
 * Detect all published content that is stale, expired, or outdated.
 * Accepts an optional `now` parameter for deterministic testing.
 */
export async function detectStaleContent(now: Date = new Date()): Promise<FreshnessAlertItem[]> {
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const twentyFourMonthsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

  const [courses, eventsWithEnd, eventsNoEnd, research, news, careers] = await Promise.all([
    // Courses with past nextStartDate
    prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        nextStartDate: { lt: now },
      },
      select: { id: true, slug: true, title: true },
    }),

    // Events with past endDate
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        endDate: { lt: now },
      },
      select: { id: true, slug: true, title: true },
    }),

    // Events with no endDate but past startDate
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        endDate: null,
        startDate: { lt: now },
      },
      select: { id: true, slug: true, title: true },
    }),

    // Research older than 24 months
    prisma.research.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        publicationDate: { lt: twentyFourMonthsAgo },
      },
      select: { id: true, slug: true, title: true },
    }),

    // News older than 12 months
    prisma.newsArticle.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        date: { lt: twelveMonthsAgo },
      },
      select: { id: true, slug: true, title: true },
    }),

    // Careers not updated in 6+ months
    prisma.career.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        updatedAt: { lt: sixMonthsAgo },
      },
      select: { id: true, slug: true, title: true },
    }),
  ]);

  const items: FreshnessAlertItem[] = [];

  for (const c of courses) {
    items.push({
      contentType: "COURSE",
      contentId: c.id,
      slug: c.slug,
      title: c.title,
      alertType: "EXPIRED_DATE",
      detectedAt: now,
    });
  }

  // Combine both event queries and deduplicate by id
  const allEvents = new Map<string, (typeof eventsWithEnd)[number]>();
  for (const e of eventsWithEnd) allEvents.set(e.id, e);
  for (const e of eventsNoEnd) allEvents.set(e.id, e);
  for (const e of allEvents.values()) {
    items.push({
      contentType: "EVENT",
      contentId: e.id,
      slug: e.slug,
      title: e.title,
      alertType: "EXPIRED_DATE",
      detectedAt: now,
    });
  }

  for (const r of research) {
    items.push({
      contentType: "RESEARCH",
      contentId: r.id,
      slug: r.slug,
      title: r.title,
      alertType: "OUTDATED",
      detectedAt: now,
    });
  }

  for (const n of news) {
    items.push({
      contentType: "NEWS",
      contentId: n.id,
      slug: n.slug,
      title: n.title,
      alertType: "STALE",
      detectedAt: now,
    });
  }

  for (const c of careers) {
    items.push({
      contentType: "CAREER",
      contentId: c.id,
      slug: c.slug,
      title: c.title,
      alertType: "STALE",
      detectedAt: now,
    });
  }

  return items;
}

// ─── Upsert ──────────────────────────────────────────────

/**
 * Upsert freshness alerts: create new, skip existing unresolved, re-open resolved.
 */
export async function upsertAlerts(items: FreshnessAlertItem[]): Promise<UpsertResult> {
  let created = 0;
  let existing = 0;
  let reopened = 0;

  for (const item of items) {
    const found = await prisma.freshnessAlert.findUnique({
      where: {
        contentType_contentId_alertType: {
          contentType: item.contentType,
          contentId: item.contentId,
          alertType: item.alertType,
        },
      },
    });

    if (!found) {
      await prisma.freshnessAlert.create({ data: item });
      created++;
    } else if (found.resolvedAt === null) {
      existing++;
    } else {
      // Previously resolved but re-detected — reopen
      await prisma.freshnessAlert.update({
        where: { id: found.id },
        data: { detectedAt: item.detectedAt, resolvedAt: null, resolvedById: null },
      });
      reopened++;
    }
  }

  return { created, existing, reopened };
}

// ─── Queries ─────────────────────────────────────────────

/**
 * Count unresolved alerts grouped by alertType.
 */
export async function getUnresolvedAlertCounts(): Promise<Record<string, number>> {
  const groups = await prisma.freshnessAlert.groupBy({
    by: ["alertType"],
    where: { resolvedAt: null },
    _count: true,
  });

  const counts: Record<string, number> = {
    EXPIRED_DATE: 0,
    STALE: 0,
    OUTDATED: 0,
  };

  for (const g of groups) {
    counts[g.alertType] = g._count;
  }

  return counts;
}

/**
 * List freshness alerts with optional filtering and pagination.
 */
export async function getAlerts(
  filters: AlertFilters = {},
): Promise<{ alerts: FreshnessAlert[]; total: number }> {
  const { contentType, alertType, resolved = false, page = 1, limit = 25 } = filters;

  const where: Record<string, unknown> = {};
  if (contentType) where.contentType = contentType;
  if (alertType) where.alertType = alertType;
  if (!resolved) where.resolvedAt = null;

  const [alerts, total] = await Promise.all([
    prisma.freshnessAlert.findMany({
      where,
      orderBy: { detectedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { resolvedBy: { select: { name: true, email: true } } },
    }),
    prisma.freshnessAlert.count({ where }),
  ]);

  return { alerts, total };
}
