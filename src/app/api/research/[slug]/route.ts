import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { updateResearchSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

type AnyRecord = Record<string, unknown>;

function mapResearch(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    author: row.author as string,
    organisation: row.organisation as string,
    publicationDate: (row.publicationDate as Date).toISOString().split("T")[0],
    summary: row.summary as string,
    categories: (row.categories as string[]) ?? [],
    isFeatured: (row.isFeatured as boolean) ?? undefined,
    image: (row.image as string) ?? undefined,
    status: (row.status as string) ?? "DRAFT",
    publishAt: row.publishAt ? (row.publishAt as Date).toISOString() : null,
    rejectionNote: (row.rejectionNote as string) ?? null,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;

  try {
    const row = await prisma.research.findUnique({ where: { slug } });
    if (!row) return errorResponse("Research not found", 404);
    return NextResponse.json(mapResearch(row as unknown as AnyRecord));
  } catch (err) {
    console.error(`GET /api/research/${slug} error:`, err);
    return errorResponse("Failed to fetch research");
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const { slug } = await params;
  const parsed = await parseBody(request, updateResearchSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  // Extract changeNote from request body (not in Zod schema)
  let changeNote: string | undefined;
  try {
    const rawBody = await request.clone().json();
    changeNote = rawBody.changeNote;
  } catch {
    // ignore
  }

  try {
    const row = await prisma.research.update({
      where: { slug },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.author !== undefined && { author: data.author }),
        ...(data.organisation !== undefined && { organisation: data.organisation }),
        ...(data.publicationDate !== undefined && {
          publicationDate: new Date(data.publicationDate),
        }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.categories !== undefined && { categories: data.categories }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.image !== undefined && { image: data.image ?? null }),
      },
    });

    const mapped = mapResearch(row as unknown as AnyRecord);

    // Create version on every save
    await createContentVersion({
      contentType: "RESEARCH",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote,
    });

    return NextResponse.json(mapped);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return errorResponse("Research not found", 404);
    }
    console.error(`PUT /api/research/${slug} error:`, err);
    return errorResponse("Failed to update research");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;

  try {
    await prisma.research.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to delete does not exist")) {
      return errorResponse("Research not found", 404);
    }
    console.error(`DELETE /api/research/${slug} error:`, err);
    return errorResponse("Failed to delete research");
  }
}
