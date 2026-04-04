import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { updateEventSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";

const eventTypeToEnum: Record<string, string> = {
  Workshop: "WORKSHOP", Webinar: "WEBINAR", Conference: "CONFERENCE",
  Networking: "NETWORKING", Training: "TRAINING", Roadshow: "ROADSHOW",
};
const locationTypeToEnum: Record<string, string> = {
  Physical: "PHYSICAL", Virtual: "VIRTUAL", Hybrid: "HYBRID",
};
const eventTypeDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(eventTypeToEnum).map(([k, v]) => [v, k])
);
const locationTypeDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(locationTypeToEnum).map(([k, v]) => [v, k])
);

type AnyRecord = Record<string, unknown>;

function mapEvent(row: AnyRecord) {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    type: eventTypeDisplay[row.type as string] ?? row.type,
    startDate: (row.startDate as Date).toISOString(),
    endDate: row.endDate ? (row.endDate as Date).toISOString() : undefined,
    locationType: locationTypeDisplay[row.locationType as string] ?? row.locationType,
    location: (row.location as string) ?? undefined,
    description: row.description as string,
    capacity: (row.capacity as number) ?? undefined,
    image: (row.image as string) ?? undefined,
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
    const row = await prisma.event.findUnique({ where: { slug } });
    if (!row) return errorResponse("Event not found", 404);
    return NextResponse.json(mapEvent(row as unknown as AnyRecord));
  } catch (err) {
    console.error(`GET /api/events/${slug} error:`, err);
    return errorResponse("Failed to fetch event");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try { user = await requireRole(["ADMIN", "EDITOR"]); } catch { return errorResponse("Unauthorized", 401); }

  const { slug } = await params;

  const rawBody = await request.clone().json();
  const changeNote: string = rawBody.changeNote ?? "Updated";

  const parsed = await parseBody(request, updateEventSchema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const row = await prisma.event.update({
      where: { slug },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && {
          type: (eventTypeToEnum[data.type] ?? data.type) as never,
        }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && {
          endDate: data.endDate ? new Date(data.endDate) : null,
        }),
        ...(data.locationType !== undefined && {
          locationType: (locationTypeToEnum[data.locationType] ?? data.locationType) as never,
        }),
        ...(data.location !== undefined && { location: data.location ?? null }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.capacity !== undefined && { capacity: data.capacity ?? null }),
        ...(data.image !== undefined && { image: data.image ?? null }),
      },
    });

    const mapped = mapEvent(row as unknown as AnyRecord);
    await createContentVersion({
      contentType: "EVENT",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote,
    });

    return NextResponse.json(mapped);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return errorResponse("Event not found", 404);
    }
    console.error(`PUT /api/events/${slug} error:`, err);
    return errorResponse("Failed to update event");
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
    await prisma.event.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to delete does not exist")) {
      return errorResponse("Event not found", 404);
    }
    console.error(`DELETE /api/events/${slug} error:`, err);
    return errorResponse("Failed to delete event");
  }
}
