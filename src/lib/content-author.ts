/**
 * Resolve the original author of a content item by finding
 * the earliest ContentVersion (version 1 = initial creation).
 */

import { prisma } from "./prisma";
import type { ContentType } from "@/generated/prisma/client";

export async function getContentAuthor(
  contentType: ContentType,
  contentId: string,
): Promise<{ id: string; email: string; name: string | null } | null> {
  const firstVersion = await prisma.contentVersion.findFirst({
    where: { contentType, contentId },
    orderBy: { version: "asc" },
    include: {
      changedBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return firstVersion?.changedBy ?? null;
}
