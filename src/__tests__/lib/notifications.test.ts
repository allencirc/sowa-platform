import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before imports
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    notificationPreference: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/content-author", () => ({
  getContentAuthor: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
  contentSubmittedForReview: vi.fn(() => ({
    subject: "Review Required",
    html: "<p>Review</p>",
  })),
  contentApproved: vi.fn(() => ({
    subject: "Approved",
    html: "<p>Approved</p>",
  })),
  contentRejected: vi.fn(() => ({
    subject: "Rejected",
    html: "<p>Rejected</p>",
  })),
  contentPublished: vi.fn(() => ({
    subject: "Published",
    html: "<p>Published</p>",
  })),
}));

import { notifyStatusChange } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getContentAuthor } from "@/lib/content-author";
import { sendEmail } from "@/lib/email";

const mockPrisma = vi.mocked(prisma);
const mockGetAuthor = vi.mocked(getContentAuthor);
const mockSendEmail = vi.mocked(sendEmail);

describe("notifyStatusChange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("IN_REVIEW transition", () => {
    it("notifies all admins when content is submitted for review", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "admin1", email: "admin1@sowa.ie" },
        { id: "admin2", email: "admin2@sowa.ie" },
      ] as never);
      mockPrisma.user.findUnique.mockResolvedValue({
        name: "Editor Jane",
        email: "jane@sowa.ie",
      } as never);
      mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);

      await notifyStatusChange({
        contentType: "CAREER",
        contentId: "c1",
        contentTitle: "Wind Tech",
        oldStatus: "DRAFT",
        newStatus: "IN_REVIEW",
        actorId: "editor1",
      });

      expect(mockSendEmail).toHaveBeenCalledTimes(2);
      expect(mockSendEmail).toHaveBeenCalledWith(
        "admin1@sowa.ie",
        "Review Required",
        "<p>Review</p>",
      );
      expect(mockSendEmail).toHaveBeenCalledWith(
        "admin2@sowa.ie",
        "Review Required",
        "<p>Review</p>",
      );
    });

    it("skips admins with CONTENT_SUBMITTED disabled", async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: "admin1", email: "admin1@sowa.ie" },
      ] as never);
      mockPrisma.user.findUnique.mockResolvedValue({ name: "Editor", email: "e@sowa.ie" } as never);
      mockPrisma.notificationPreference.findUnique.mockResolvedValue({
        enabled: false,
      } as never);

      await notifyStatusChange({
        contentType: "CAREER",
        contentId: "c1",
        contentTitle: "Wind Tech",
        oldStatus: "DRAFT",
        newStatus: "IN_REVIEW",
        actorId: "editor1",
      });

      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  describe("rejection (IN_REVIEW → DRAFT)", () => {
    it("notifies the original author with rejection note", async () => {
      mockGetAuthor.mockResolvedValue({ id: "author1", email: "author@sowa.ie", name: "Author" });
      mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);

      await notifyStatusChange({
        contentType: "COURSE",
        contentId: "c2",
        contentTitle: "Safety Course",
        oldStatus: "IN_REVIEW",
        newStatus: "DRAFT",
        rejectionNote: "Needs more detail",
        actorId: "admin1",
      });

      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith("author@sowa.ie", "Rejected", "<p>Rejected</p>");
    });
  });

  describe("PUBLISHED transition", () => {
    it("notifies the author on publish", async () => {
      mockGetAuthor.mockResolvedValue({ id: "author1", email: "author@sowa.ie", name: "Author" });
      mockPrisma.notificationPreference.findUnique.mockResolvedValue(null);

      await notifyStatusChange({
        contentType: "EVENT",
        contentId: "e1",
        contentTitle: "Wind Conf 2026",
        oldStatus: "IN_REVIEW",
        newStatus: "PUBLISHED",
        actorId: "admin1",
      });

      // Should send both approved and published
      expect(mockSendEmail).toHaveBeenCalledTimes(2);
      expect(mockSendEmail).toHaveBeenCalledWith("author@sowa.ie", "Approved", "<p>Approved</p>");
      expect(mockSendEmail).toHaveBeenCalledWith("author@sowa.ie", "Published", "<p>Published</p>");
    });

    it("skips when no author found", async () => {
      mockGetAuthor.mockResolvedValue(null);

      await notifyStatusChange({
        contentType: "NEWS",
        contentId: "n1",
        contentTitle: "Article",
        oldStatus: "DRAFT",
        newStatus: "PUBLISHED",
        actorId: "admin1",
      });

      expect(mockSendEmail).not.toHaveBeenCalled();
    });
  });

  it("never throws even when dependencies error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.user.findMany.mockRejectedValue(new Error("DB down"));

    await expect(
      notifyStatusChange({
        contentType: "CAREER",
        contentId: "c1",
        contentTitle: "Test",
        oldStatus: "DRAFT",
        newStatus: "IN_REVIEW",
        actorId: "x",
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
