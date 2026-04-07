import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth-utils";
import { getContentVersion, createContentVersion } from "@/lib/versions";
import type { ContentType } from "@/generated/prisma/client";

const CONTENT_TYPE_TO_MODEL = {
  CAREER: "career",
  COURSE: "course",
  EVENT: "event",
  RESEARCH: "research",
  NEWS: "newsArticle",
} as const;

// Fields that should never be overwritten during a restore
const IMMUTABLE_FIELDS = new Set([
  "id",
  "slug",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "deletedById",
]);

function getPrismaModel(contentType: string) {
  const model = CONTENT_TYPE_TO_MODEL[contentType as keyof typeof CONTENT_TYPE_TO_MODEL];
  if (!model) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

const restoreVersionSchema = z.object({
  versionId: z.string().min(1),
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

  const parsed = await parseBody(request, restoreVersionSchema);
  if (parsed.error) return parsed.error;

  const { versionId } = parsed.data;

  try {
    const version = await getContentVersion(versionId);
    if (!version) {
      return errorResponse("Version not found", 404);
    }

    const model = getPrismaModel(version.contentType);
    if (!model) {
      return errorResponse("Invalid content type", 400);
    }

    // Extract restorable fields from snapshot
    const snapshot = version.snapshot as Record<string, unknown>;
    const restorableFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(snapshot)) {
      if (!IMMUTABLE_FIELDS.has(key)) {
        restorableFields[key] = value;
      }
    }

    // Update the record with the snapshot data
    const updated = await model.update({
      where: { id: version.contentId },
      data: restorableFields,
    });

    // Create a new version snapshot to record the restore
    await createContentVersion({
      contentType: version.contentType as ContentType,
      contentId: version.contentId,
      snapshot: updated as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: `Restored from version ${version.version}`,
    });

    return NextResponse.json({
      message: `Restored to version ${version.version}`,
      contentType: version.contentType,
      contentId: version.contentId,
    });
  } catch (err) {
    console.error("POST /api/admin/versions/restore error:", err);
    return errorResponse("Failed to restore version");
  }
}
