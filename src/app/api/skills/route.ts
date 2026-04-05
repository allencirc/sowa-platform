import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  parseQuery,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-utils";
import { skillFiltersSchema, createSkillSchema } from "@/lib/validations";
import { requireRole, AuthError } from "@/lib/auth-utils";

const skillCategoryToEnum: Record<string, string> = {
  Technical: "TECHNICAL",
  Safety: "SAFETY",
  Regulatory: "REGULATORY",
  Digital: "DIGITAL",
  Management: "MANAGEMENT",
};
const skillCategoryDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(skillCategoryToEnum).map(([k, v]) => [v, k])
);

type AnyRecord = Record<string, unknown>;

function mapSkill(row: AnyRecord) {
  return {
    slug: row.slug as string,
    name: row.name as string,
    category: skillCategoryDisplay[row.category as string] ?? row.category,
  };
}

const SORTABLE_FIELDS = ["name", "category", "createdAt"];

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), skillFiltersSchema);
  if (parsed.error) return parsed.error;

  const { page, limit, sortBy, order, category, search } = parsed.data;

  try {
    const where: Record<string, unknown> = {};

    if (category) {
      where.category = (skillCategoryToEnum[category] ?? category) as never;
    }
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const orderBy: Record<string, string> =
      sortBy && SORTABLE_FIELDS.includes(sortBy)
        ? { [sortBy]: order }
        : { name: "asc" };

    const [rows, total] = await Promise.all([
      prisma.skill.findMany({
        where: where as never,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.skill.count({ where: where as never }),
    ]);

    const data = rows.map((r) => mapSkill(r as unknown as AnyRecord));
    return paginatedResponse(data, total, page, limit);
  } catch (err) {
    console.error("GET /api/skills error:", err);
    return errorResponse("Failed to fetch skills");
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN", "EDITOR"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const parsed = await parseBody(request, createSkillSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const row = await prisma.skill.create({
      data: {
        slug: data.slug,
        name: data.name,
        category: (skillCategoryToEnum[data.category] ?? data.category) as never,
      },
    });

    return NextResponse.json(mapSkill(row as unknown as AnyRecord), { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return errorResponse("A skill with this slug already exists", 409);
    }
    console.error("POST /api/skills error:", err);
    return errorResponse("Failed to create skill");
  }
}
