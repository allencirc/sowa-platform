import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth-utils";
import { getContentVersion } from "@/lib/versions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireAuth();
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const { id } = await params;

  try {
    const version = await getContentVersion(id);
    if (!version) {
      return errorResponse("Version not found", 404);
    }
    return NextResponse.json(version);
  } catch (err) {
    console.error(`GET /api/versions/${id} error:`, err);
    return errorResponse("Failed to fetch version");
  }
}
