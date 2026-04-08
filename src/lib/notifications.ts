/**
 * Content workflow notification orchestrator.
 * Connects status transitions to email notifications,
 * respecting per-user notification preferences.
 *
 * This module never throws — all errors are caught and logged.
 */

import { prisma } from "./prisma";
import { getContentAuthor } from "./content-author";
import {
  sendEmail,
  contentSubmittedForReview,
  contentApproved,
  contentRejected,
  contentPublished,
} from "./email";
import type { ContentType } from "@/generated/prisma/client";

export const NOTIFICATION_EVENTS = [
  "CONTENT_SUBMITTED",
  "CONTENT_APPROVED",
  "CONTENT_REJECTED",
  "CONTENT_PUBLISHED",
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

/**
 * Check whether a user has a given notification enabled.
 * Defaults to enabled if no preference row exists.
 */
async function isNotificationEnabled(userId: string, event: NotificationEvent): Promise<boolean> {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_event: { userId, event } },
  });
  return pref?.enabled ?? true;
}

interface StatusChangeParams {
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  oldStatus: string;
  newStatus: string;
  rejectionNote?: string;
  actorId: string;
}

/**
 * Fire-and-forget notification dispatch for content status changes.
 * Call with `void notifyStatusChange(...)` to avoid floating promise warnings.
 */
export async function notifyStatusChange(params: StatusChangeParams): Promise<void> {
  try {
    const { contentType, contentId, contentTitle, oldStatus, newStatus, rejectionNote, actorId } =
      params;

    // ── Submitted for review (any → IN_REVIEW) ─────────────
    if (newStatus === "IN_REVIEW") {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, email: true },
      });

      // Resolve actor name for the template
      const actor = await prisma.user.findUnique({
        where: { id: actorId },
        select: { name: true, email: true },
      });
      const authorName = actor?.name ?? actor?.email ?? "A team member";

      const template = contentSubmittedForReview(contentTitle, contentType, authorName);

      for (const admin of admins) {
        if (await isNotificationEnabled(admin.id, "CONTENT_SUBMITTED")) {
          void sendEmail(admin.email, template.subject, template.html);
        }
      }
      return;
    }

    // ── Rejected (IN_REVIEW → DRAFT with rejectionNote) ────
    if (oldStatus === "IN_REVIEW" && newStatus === "DRAFT" && rejectionNote) {
      const author = await getContentAuthor(contentType, contentId);
      if (author && (await isNotificationEnabled(author.id, "CONTENT_REJECTED"))) {
        const template = contentRejected(contentTitle, contentType, rejectionNote);
        void sendEmail(author.email, template.subject, template.html);
      }
      return;
    }

    // ── Published (IN_REVIEW → PUBLISHED or DRAFT → PUBLISHED) ──
    if (newStatus === "PUBLISHED") {
      const author = await getContentAuthor(contentType, contentId);
      if (!author) return;

      // If coming from IN_REVIEW, also send approval notification
      if (oldStatus === "IN_REVIEW") {
        if (await isNotificationEnabled(author.id, "CONTENT_APPROVED")) {
          const approvedTpl = contentApproved(contentTitle, contentType);
          void sendEmail(author.email, approvedTpl.subject, approvedTpl.html);
        }
      }

      if (await isNotificationEnabled(author.id, "CONTENT_PUBLISHED")) {
        const publishedTpl = contentPublished(contentTitle, contentType);
        void sendEmail(author.email, publishedTpl.subject, publishedTpl.html);
      }
      return;
    }
  } catch (err) {
    console.error("[Notifications] Error dispatching notification:", err);
  }
}
