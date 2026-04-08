import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { transferableSkillsSchema } from "@/lib/validations";
import { getTransferableSkills } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const url = new URL(request.url);
  const sectorParam = url.searchParams.get("sector") ?? undefined;

  const parsed = transferableSkillsSchema.safeParse({ sector: sectorParam });
  if (!parsed.success) {
    return errorResponse("Invalid sector parameter", 400);
  }

  try {
    const skills = await getTransferableSkills(parsed.data.sector);
    return NextResponse.json({ data: skills, total: skills.length });
  } catch (err) {
    console.error("GET /api/skills/transferable error:", err);
    return errorResponse("Failed to fetch transferable skills");
  }
}
