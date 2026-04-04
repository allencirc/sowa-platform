import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { createRegistrationSchema } from "@/lib/validations";
import { syncRegistration } from "@/lib/hubspot";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const result = await parseBody(request, createRegistrationSchema);
  if (result.error) return result.error;

  const { data } = result;

  try {
    // For EVENT registrations, check capacity
    if (data.type === "EVENT") {
      const event = await prisma.event.findFirst({
        where: { slug: data.contentId },
        select: { capacity: true },
      });

      if (!event) {
        return errorResponse("Event not found", 404);
      }

      if (event.capacity) {
        const registeredCount = await prisma.registration.count({
          where: {
            type: "EVENT",
            contentId: data.contentId,
            status: { not: "CANCELLED" },
          },
        });

        if (registeredCount >= event.capacity) {
          return errorResponse("This event has reached full capacity", 409);
        }
      }
    }

    // For COURSE registrations, verify the course exists
    if (data.type === "COURSE") {
      const course = await prisma.course.findFirst({
        where: { slug: data.contentId },
        select: { slug: true },
      });

      if (!course) {
        return errorResponse("Course not found", 404);
      }
    }

    const registration = await prisma.registration.create({
      data: {
        type: data.type,
        contentId: data.contentId,
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        organisation: data.organisation ?? null,
        role: data.role ?? null,
        dietaryRequirements: data.dietaryRequirements ?? null,
        additionalNotes: data.additionalNotes ?? null,
        gdprConsent: data.gdprConsent,
      },
    });

    // Sync to HubSpot in the background (non-blocking)
    syncRegistration({
      email: data.email,
      name: data.name,
      phone: data.phone ?? undefined,
      organisation: data.organisation ?? undefined,
      role: data.role ?? undefined,
      contentType: data.type,
      contentId: data.contentId,
    }).catch((err) => {
      console.error("[Registration] HubSpot sync failed:", err);
    });

    return NextResponse.json({ data: registration }, { status: 201 });
  } catch (err) {
    console.error("Registration creation error:", err);
    return errorResponse("Failed to create registration");
  }
}
