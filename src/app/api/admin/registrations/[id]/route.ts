import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { updateRegistrationStatusSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    await requireRole(["ADMIN", "EDITOR"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const { id } = await params;

  const result = await parseBody(request, updateRegistrationStatusSchema);
  if (result.error) return result.error;

  try {
    const registration = await prisma.registration.update({
      where: { id },
      data: { status: result.data.status },
    });

    return NextResponse.json({ data: registration });
  } catch {
    return errorResponse("Registration not found", 404);
  }
}
