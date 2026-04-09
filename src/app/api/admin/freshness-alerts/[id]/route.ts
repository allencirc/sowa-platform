import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;
  if (action !== "resolve" && action !== "resolve_and_archive") {
    return NextResponse.json(
      { error: 'action must be "resolve" or "resolve_and_archive"' },
      { status: 400 },
    );
  }

  try {
    const alert = await prisma.freshnessAlert.findUnique({ where: { id } });
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    if (alert.resolvedAt) {
      return NextResponse.json({ error: "Alert already resolved" }, { status: 409 });
    }

    // Resolve the alert
    await prisma.freshnessAlert.update({
      where: { id },
      data: { resolvedAt: new Date(), resolvedById: session.user.id },
    });

    // Optionally archive the content
    if (action === "resolve_and_archive") {
      const modelMap: Record<string, string> = {
        CAREER: "career",
        COURSE: "course",
        EVENT: "event",
        RESEARCH: "research",
        NEWS: "newsArticle",
      };

      const modelName = modelMap[alert.contentType];
      if (modelName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any)[modelName].update({
          where: { id: alert.contentId },
          data: { status: "ARCHIVED" },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      resolved: true,
      archived: action === "resolve_and_archive",
    });
  } catch (err) {
    console.error(`PATCH /api/admin/freshness-alerts/${id} error:`, err);
    return NextResponse.json({ error: "Failed to resolve alert" }, { status: 500 });
  }
}
