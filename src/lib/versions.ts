import { prisma } from "./prisma";
import type { ContentType } from "@/generated/prisma/client";

/**
 * Create a new content version snapshot.
 * Automatically increments the version number for the given content.
 */
export async function createContentVersion(params: {
  contentType: ContentType;
  contentId: string;
  snapshot: Record<string, unknown>;
  changedById: string;
  changeNote?: string;
}): Promise<void> {
  const { contentType, contentId, snapshot, changedById, changeNote } = params;

  // Get the current highest version number
  const latest = await prisma.contentVersion.findFirst({
    where: { contentType, contentId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const nextVersion = (latest?.version ?? 0) + 1;

  await prisma.contentVersion.create({
    data: {
      contentType,
      contentId,
      version: nextVersion,
      snapshot: snapshot as never,
      changedById,
      changeNote: changeNote ?? null,
    },
  });
}

/**
 * Get version history for a piece of content.
 */
export async function getContentVersions(params: {
  contentType: ContentType;
  contentId: string;
  page?: number;
  limit?: number;
}) {
  const { contentType, contentId, page = 1, limit = 20 } = params;

  const [versions, total] = await Promise.all([
    prisma.contentVersion.findMany({
      where: { contentType, contentId },
      orderBy: { version: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.contentVersion.count({
      where: { contentType, contentId },
    }),
  ]);

  return {
    versions: versions.map((v) => ({
      id: v.id,
      version: v.version,
      snapshot: v.snapshot as Record<string, unknown>,
      changeNote: v.changeNote,
      changedBy: {
        id: v.changedBy.id,
        name: v.changedBy.name ?? v.changedBy.email,
        email: v.changedBy.email,
      },
      changedAt: v.changedAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a specific version by ID.
 */
export async function getContentVersion(versionId: string) {
  const version = await prisma.contentVersion.findUnique({
    where: { id: versionId },
    include: {
      changedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!version) return null;

  return {
    id: version.id,
    contentType: version.contentType,
    contentId: version.contentId,
    version: version.version,
    snapshot: version.snapshot as Record<string, unknown>,
    changeNote: version.changeNote,
    changedBy: {
      id: version.changedBy.id,
      name: version.changedBy.name ?? version.changedBy.email,
      email: version.changedBy.email,
    },
    changedAt: version.changedAt.toISOString(),
  };
}

/**
 * Define valid status transitions based on role.
 */
export const STATUS_TRANSITIONS: Record<string, Record<string, string[]>> = {
  EDITOR: {
    DRAFT: ["IN_REVIEW"],
    IN_REVIEW: [], // editors cannot approve/reject
    PUBLISHED: [],
    ARCHIVED: [],
  },
  ADMIN: {
    DRAFT: ["IN_REVIEW", "PUBLISHED"],
    IN_REVIEW: ["PUBLISHED", "DRAFT"], // approve or reject
    PUBLISHED: ["ARCHIVED", "DRAFT"],
    ARCHIVED: ["DRAFT"],
  },
};

/**
 * Check if a status transition is valid for the given role.
 */
export function isValidTransition(
  currentStatus: string,
  newStatus: string,
  role: string
): boolean {
  const transitions = STATUS_TRANSITIONS[role]?.[currentStatus];
  if (!transitions) return false;
  return transitions.includes(newStatus);
}
