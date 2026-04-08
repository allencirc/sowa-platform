import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { parseQuery, errorResponse } from "@/lib/api-utils";
import { ROLE_FAMILY_BY_KEY } from "@/lib/diagnostic-role-weights";
import type { RoleFamilyKey } from "@/lib/diagnostic-role-weights";

// ─── Query validation ────────────────────────────────────

const analyticsQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .optional(),
  locale: z.string().max(10).optional(),
  export: z.enum(["csv"]).optional(),
});

// ─── Skill category display names ────────────────────────

const SKILL_CATEGORIES: Record<string, string> = {
  TECHNICAL: "Technical",
  SAFETY: "Safety",
  REGULATORY: "Regulatory",
  DIGITAL: "Digital",
  MANAGEMENT: "Management",
};

// ─── GET handler ─────────────────────────────────────────

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireRole(["ADMIN", "EDITOR"]);
  } catch (err) {
    return errorResponse((err as Error).message, (err as { status: number }).status);
  }

  const url = new URL(request.url);
  const parsed = parseQuery(url, analyticsQuerySchema);
  if (parsed.error) return parsed.error;

  const { from, to, locale, export: exportFormat } = parsed.data;

  // CSV export requires ADMIN
  if (exportFormat === "csv" && user.role !== "ADMIN") {
    return errorResponse("CSV export requires ADMIN role", 403);
  }

  // Build date range filter
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (from) dateFilter.gte = new Date(`${from}T00:00:00.000Z`);
  if (to) dateFilter.lte = new Date(`${to}T23:59:59.999Z`);

  // Default to last 28 days if no range provided
  if (!from && !to) {
    dateFilter.gte = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
  }

  const where: Record<string, unknown> = {};
  if (dateFilter.gte || dateFilter.lte) where.completedAt = dateFilter;
  if (locale) where.locale = locale;

  try {
    // Fetch all matching sessions + skills for name resolution
    const [sessions, skills] = await Promise.all([
      prisma.diagnosticSession.findMany({
        where,
        orderBy: { completedAt: "asc" },
      }),
      prisma.skill.findMany({ select: { slug: true, name: true, category: true } }),
    ]);

    const skillMap = new Map(skills.map((s) => [s.slug, s]));

    // ── Completions by date ──────────────────────────────
    const byDate = new Map<string, number>();
    for (const s of sessions) {
      const day = s.completedAt.toISOString().split("T")[0];
      byDate.set(day, (byDate.get(day) ?? 0) + 1);
    }
    const completionsByDate = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // ── Average scores by skill category ─────────────────
    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    for (const cat of Object.keys(SKILL_CATEGORIES)) {
      categoryTotals[cat] = { sum: 0, count: 0 };
    }

    for (const s of sessions) {
      const scores = s.scores as Record<string, number>;
      const maxPossible = s.maxPossible as Record<string, number>;
      for (const [slug, score] of Object.entries(scores)) {
        const skill = skillMap.get(slug);
        if (!skill) continue;
        const max = maxPossible[slug] ?? 0;
        if (max <= 0) continue;
        const pct = (score / max) * 100;
        const cat = skill.category;
        if (categoryTotals[cat]) {
          categoryTotals[cat].sum += pct;
          categoryTotals[cat].count += 1;
        }
      }
    }

    const averageScoresByCategory: Record<string, number> = {};
    for (const [cat, { sum, count }] of Object.entries(categoryTotals)) {
      const label = SKILL_CATEGORIES[cat] ?? cat;
      averageScoresByCategory[label] = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
    }

    // ── Top skill gaps ───────────────────────────────────
    const gapCounts = new Map<string, number>();
    for (const s of sessions) {
      for (const slug of s.topSkillGaps) {
        gapCounts.set(slug, (gapCounts.get(slug) ?? 0) + 1);
      }
    }
    const topSkillGaps = Array.from(gapCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([slug, count]) => ({
        slug,
        name: skillMap.get(slug)?.name ?? slug,
        count,
      }));

    // ── Top role families ────────────────────────────────
    const familyCounts = new Map<string, number>();
    for (const s of sessions) {
      for (const key of s.topRoleFamilies) {
        familyCounts.set(key, (familyCounts.get(key) ?? 0) + 1);
      }
    }
    const topRoleFamilies = Array.from(familyCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([key, count]) => ({
        key,
        label: ROLE_FAMILY_BY_KEY[key as RoleFamilyKey]?.label ?? key,
        count,
      }));

    // ── Locale breakdown ─────────────────────────────────
    const localeCounts = new Map<string, number>();
    for (const s of sessions) {
      localeCounts.set(s.locale, (localeCounts.get(s.locale) ?? 0) + 1);
    }
    const localeBreakdown = Array.from(localeCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([loc, count]) => ({ locale: loc, count }));

    // ── Build response ───────────────────────────────────
    const effectiveFrom = dateFilter.gte?.toISOString().split("T")[0] ?? null;
    const effectiveTo =
      dateFilter.lte?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0];

    const payload = {
      totalCompletions: sessions.length,
      completionsByDate,
      averageScoresByCategory,
      topSkillGaps,
      topRoleFamilies,
      localeBreakdown,
      dateRange: { from: effectiveFrom, to: effectiveTo },
    };

    // ── CSV export ───────────────────────────────────────
    if (exportFormat === "csv") {
      const lines: string[] = [];
      lines.push("SOWA Diagnostic Analytics Report");
      lines.push(`Date range: ${effectiveFrom ?? "all"} to ${effectiveTo}`);
      lines.push(`Total completions: ${sessions.length}`);
      lines.push("");

      lines.push("Average Scores by Category");
      lines.push("Category,Average Score (%)");
      for (const [cat, avg] of Object.entries(averageScoresByCategory)) {
        lines.push(`${cat},${avg}`);
      }
      lines.push("");

      lines.push("Top Skill Gaps");
      lines.push("Skill,Count");
      for (const g of topSkillGaps) {
        lines.push(`"${g.name}",${g.count}`);
      }
      lines.push("");

      lines.push("Top Role Families");
      lines.push("Role Family,Count");
      for (const f of topRoleFamilies) {
        lines.push(`"${f.label}",${f.count}`);
      }
      lines.push("");

      lines.push("Locale Breakdown");
      lines.push("Locale,Count");
      for (const l of localeBreakdown) {
        lines.push(`${l.locale},${l.count}`);
      }
      lines.push("");

      lines.push("Completions by Date");
      lines.push("Date,Count");
      for (const d of completionsByDate) {
        lines.push(`${d.date},${d.count}`);
      }

      return new NextResponse(lines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="sowa-diagnostic-analytics-${effectiveTo}.csv"`,
        },
      });
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/admin/diagnostic/analytics error:", err);
    return errorResponse("Failed to fetch diagnostic analytics");
  }
}
