import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  errorResponse,
} from "@/lib/api-utils";
import { updateCourseSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

const providerTypeToEnum: Record<string, string> = {
  University: "UNIVERSITY", ETB: "ETB", Private: "PRIVATE",
  Industry: "INDUSTRY", Skillnet_Network: "SKILLNET_NETWORK", Government: "GOVERNMENT",
};
const deliveryFormatToEnum: Record<string, string> = {
  "In-Person": "IN_PERSON", Online: "ONLINE", Blended: "BLENDED", "Self-Paced": "SELF_PACED",
};
const providerTypeDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(providerTypeToEnum).map(([k, v]) => [v, k])
);
const deliveryFormatDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(deliveryFormatToEnum).map(([k, v]) => [v, k])
);

const courseInclude = {
  skills: { include: { skill: true } },
  careerRelevance: { include: { career: true } },
} as const;

type AnyRecord = Record<string, unknown>;

function mapCourse(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    provider: row.provider as string,
    providerType: providerTypeDisplay[row.providerType as string] ?? row.providerType,
    description: row.description as string,
    entryRequirements: (row.entryRequirements as string) ?? undefined,
    deliveryFormat: deliveryFormatDisplay[row.deliveryFormat as string] ?? row.deliveryFormat,
    location: (row.location as string) ?? undefined,
    nfqLevel: (row.nfqLevel as number | null) ?? undefined,
    duration: row.duration as string,
    cost: row.cost as number,
    costNotes: (row.costNotes as string) ?? undefined,
    nextStartDate: row.nextStartDate
      ? (row.nextStartDate as Date).toISOString().split("T")[0]
      : undefined,
    accredited: (row.accredited as boolean) ?? undefined,
    certificationAwarded: (row.certificationAwarded as string) ?? undefined,
    skills: ((row.skills as { skill: { slug: string } }[]) ?? []).map(
      (s) => s.skill.slug
    ),
    careerRelevance: (
      (row.careerRelevance as { career: { slug: string } }[]) ?? []
    ).map((c) => c.career.slug),
    tags: (row.tags as string[]) ?? [],
    status: (row.status as string) ?? "DRAFT",
    publishAt: row.publishAt ? (row.publishAt as Date).toISOString() : null,
    rejectionNote: (row.rejectionNote as string) ?? null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;

  try {
    const row = await prisma.course.findUnique({
      where: { slug },
      include: courseInclude,
    });

    if (!row) return errorResponse("Course not found", 404);
    return NextResponse.json(mapCourse(row as unknown as AnyRecord));
  } catch (err) {
    console.error(`GET /api/courses/${slug} error:`, err);
    return errorResponse("Failed to fetch course");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const { slug } = await params;
  const raw = await request.clone().json();
  const changeNote = (raw as Record<string, unknown>).changeNote as string | undefined;
  const parsed = await parseBody(request, updateCourseSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const row = await prisma.course.update({
      where: { slug },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.provider !== undefined && { provider: data.provider }),
        ...(data.providerType !== undefined && {
          providerType: (providerTypeToEnum[data.providerType] ?? data.providerType) as never,
        }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.entryRequirements !== undefined && {
          entryRequirements: data.entryRequirements ?? null,
        }),
        ...(data.deliveryFormat !== undefined && {
          deliveryFormat: (deliveryFormatToEnum[data.deliveryFormat] ?? data.deliveryFormat) as never,
        }),
        ...(data.location !== undefined && { location: data.location ?? null }),
        ...(data.nfqLevel !== undefined && { nfqLevel: data.nfqLevel ?? null }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.costNotes !== undefined && { costNotes: data.costNotes ?? null }),
        ...(data.nextStartDate !== undefined && {
          nextStartDate: data.nextStartDate ? new Date(data.nextStartDate) : null,
        }),
        ...(data.accredited !== undefined && { accredited: data.accredited }),
        ...(data.certificationAwarded !== undefined && {
          certificationAwarded: data.certificationAwarded ?? null,
        }),
        ...(data.tags !== undefined && { tags: data.tags }),
      },
      include: courseInclude,
    });

    const mapped = mapCourse(row as unknown as AnyRecord);

    await createContentVersion({
      contentType: "COURSE",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote,
    });

    return NextResponse.json(mapped);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return errorResponse("Course not found", 404);
    }
    console.error(`PUT /api/courses/${slug} error:`, err);
    return errorResponse("Failed to update course");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const { slug } = await params;

  try {
    await prisma.course.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to delete does not exist")) {
      return errorResponse("Course not found", 404);
    }
    console.error(`DELETE /api/courses/${slug} error:`, err);
    return errorResponse("Failed to delete course");
  }
}
