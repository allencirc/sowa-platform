import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, parseQuery, errorResponse } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-utils";
import { getContentVersions } from "@/lib/versions";
import { versionFiltersSchema, ContentTypeEnum } from "@/lib/validations";
import { z } from "zod";

const querySchema = versionFiltersSchema.extend({
  contentType: ContentTypeEnum,
  contentId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireAuth();
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const parsed = parseQuery(new URL(request.url), querySchema);
  if (parsed.error) return parsed.error;

  const { contentType, contentId, page, limit } = parsed.data;

  try {
    const result = await getContentVersions({
      contentType: contentType as never,
      contentId,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/versions error:", err);
    return errorResponse("Failed to fetch versions");
  }
}
