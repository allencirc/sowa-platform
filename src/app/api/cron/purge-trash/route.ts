import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Vercel Cron endpoint — runs daily.
 * Auto-purges items that have been in the trash for more than 30 days.
 *
 * Secured via CRON_SECRET: Vercel sends `Authorization: Bearer <CRON_SECRET>`
 * automatically. Set the CRON_SECRET env var in your Vercel project settings.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where = { deletedAt: { lt: thirtyDaysAgo } } as never;

    const [careers, courses, events, research, news] = await Promise.all([
      prisma.career.deleteMany({ where }),
      prisma.course.deleteMany({ where }),
      prisma.event.deleteMany({ where }),
      prisma.research.deleteMany({ where }),
      prisma.newsArticle.deleteMany({ where }),
    ]);

    const total = careers.count + courses.count + events.count + research.count + news.count;

    return NextResponse.json({
      ok: true,
      purged: total,
      breakdown: {
        careers: careers.count,
        courses: courses.count,
        events: events.count,
        research: research.count,
        news: news.count,
      },
    });
  } catch (err) {
    console.error("Cron /api/cron/purge-trash error:", err);
    return NextResponse.json({ error: "Failed to purge trash" }, { status: 500 });
  }
}
