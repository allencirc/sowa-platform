import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  applyRateLimit,
  parseBody,
  parseQuery,
  errorResponse,
  paginatedResponse,
} from "@/lib/api-utils";
import { eventFiltersSchema, createEventSchema, draftEventSchema } from "@/lib/validations";
import { requireRole } from "@/lib/auth-utils";
import { createContentVersion } from "@/lib/versions";
import { uniqueSlug } from "@/lib/unique-slug";

const eventTypeToEnum: Record<string, string> = {
  Workshop: "WORKSHOP",
  Webinar: "WEBINAR",
  Conference: "CONFERENCE",
  Networking: "NETWORKING",
  Training: "TRAINING",
  Roadshow: "ROADSHOW",
};
const locationTypeToEnum: Record<string, string> = {
  Physical: "PHYSICAL",
  Virtual: "VIRTUAL",
  Hybrid: "HYBRID",
};
const eventTypeDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(eventTypeToEnum).map(([k, v]) => [v, k]),
);
const locationTypeDisplay: Record<string, string> = Object.fromEntries(
  Object.entries(locationTypeToEnum).map(([k, v]) => [v, k]),
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

const SORTABLE_FIELDS = ["title", "startDate", "type", "createdAt"];

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), eventFiltersSchema);
  if (parsed.error) return parsed.error;

  const { page, limit, sortBy, order, type, locationType, upcoming, search } = parsed.data;

  try {
    const where: Record<string, unknown> = {};

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");
    if (statusFilter) {
      where.status = statusFilter;
    }

    if (type) {
      where.type = (eventTypeToEnum[type] ?? type) as never;
    }
    if (locationType) {
      where.locationType = (locationTypeToEnum[locationType] ?? locationType) as never;
    }
    if (upcoming) {
      where.startDate = { gte: new Date() };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sortBy && SORTABLE_FIELDS.includes(sortBy) ? { [sortBy]: order } : { startDate: "asc" };

    const [rows, total] = await Promise.all([
      prisma.event.findMany({
        where: where as never,
        orderBy: orderBy as never,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where: where as never }),
    ]);

    const data = rows.map((r) => mapEvent(r as unknown as AnyRecord));
    return paginatedResponse(data, total, page, limit);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return errorResponse("Failed to fetch events");
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const isDraft = new URL(request.url).searchParams.get("draft") === "true";
  const schema = isDraft ? draftEventSchema : createEventSchema;
  const parsed = await parseBody(request, schema);
  if (parsed.error) return parsed.error;

  const data = parsed.data;

  try {
    const slug = await uniqueSlug(data.slug, "event");

    const row = await prisma.event.create({
      data: {
        slug,
        title: data.title,
        type: (eventTypeToEnum[data.type ?? "Workshop"] ?? "WORKSHOP") as never,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        locationType: (locationTypeToEnum[data.locationType ?? "Physical"] ?? "PHYSICAL") as never,
        location: data.location ?? null,
        description: data.description ?? "",
        capacity: data.capacity ?? null,
        image: data.image ?? null,
        status: "DRAFT" as never,
      },
    });

    const mapped = mapEvent(row as unknown as AnyRecord);
    await createContentVersion({
      contentType: "EVENT",
      contentId: row.id,
      snapshot: mapped as unknown as Record<string, unknown>,
      changedById: user.id!,
      changeNote: "Initial creation",
    });
    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return errorResponse("An event with this slug already exists", 409);
    }
    console.error("POST /api/events error:", err);
    return errorResponse("Failed to create event");
  }
}
