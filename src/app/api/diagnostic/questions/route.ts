import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";

const diagnosticTypeDisplay: Record<string, string> = {
  SINGLE_CHOICE: "single_choice",
  MULTIPLE_CHOICE: "multiple_choice",
  SCALE: "scale",
};

type AnyRecord = Record<string, unknown>;

function mapQuestion(row: AnyRecord) {
  return {
    id: row.id as string,
    text: row.text as string,
    type: diagnosticTypeDisplay[row.type as string] ?? row.type,
    options: row.options ?? undefined,
    scaleMin: (row.scaleMin as number) ?? undefined,
    scaleMax: (row.scaleMax as number) ?? undefined,
    scaleLabels: row.scaleLabels ?? undefined,
    scoreImpact: row.scoreImpact ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const rows = await prisma.diagnosticQuestion.findMany();
    const data = rows.map((r) => mapQuestion(r as unknown as AnyRecord));
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/diagnostic/questions error:", err);
    return errorResponse("Failed to fetch diagnostic questions");
  }
}
