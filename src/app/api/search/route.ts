import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, parseQuery, errorResponse, paginatedResponse } from "@/lib/api-utils";
import { searchSchema } from "@/lib/validations";

const sectorDisplay: Record<string, string> = {
  OPERATIONS_MAINTENANCE: "Operations & Maintenance",
  MARINE_OPERATIONS: "Marine Operations",
  SURVEY_DESIGN: "Survey & Design",
  HSE: "Health, Safety & Environment",
  ELECTRICAL: "Electrical",
  POLICY_REGULATION: "Policy & Regulation",
  PROJECT_MANAGEMENT: "Project Management",
};

interface SearchResult {
  type: "career" | "course" | "event" | "research" | "news";
  slug: string;
  title: string;
  excerpt: string;
}

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  const parsed = parseQuery(new URL(request.url), searchSchema);
  if (parsed.error) return parsed.error;

  const { q, page, limit, type } = parsed.data;

  try {
    const results: SearchResult[] = [];

    // Search across requested types (or all if none specified)
    const searchTypes = type ? [type] : ["career", "course", "event", "research", "news"];

    const insensitive = { mode: "insensitive" as const };
    const promises: Promise<void>[] = [];

    if (searchTypes.includes("career")) {
      promises.push(
        prisma.career
          .findMany({
            where: {
              status: "PUBLISHED" as never,
              OR: [
                { title: { contains: q, ...insensitive } },
                { description: { contains: q, ...insensitive } },
              ],
            },
            select: { slug: true, title: true, description: true },
          })
          .then((careers) => {
            for (const c of careers) {
              results.push({
                type: "career",
                slug: c.slug,
                title: c.title,
                excerpt: c.description.slice(0, 150) + "...",
              });
            }
          }),
      );
    }

    if (searchTypes.includes("course")) {
      promises.push(
        prisma.course
          .findMany({
            where: {
              status: "PUBLISHED" as never,
              OR: [
                { title: { contains: q, ...insensitive } },
                { description: { contains: q, ...insensitive } },
                { provider: { contains: q, ...insensitive } },
              ],
            },
            select: { slug: true, title: true, description: true },
          })
          .then((courses) => {
            for (const c of courses) {
              results.push({
                type: "course",
                slug: c.slug,
                title: c.title,
                excerpt: c.description.slice(0, 150) + "...",
              });
            }
          }),
      );
    }

    if (searchTypes.includes("event")) {
      promises.push(
        prisma.event
          .findMany({
            where: {
              status: "PUBLISHED" as never,
              OR: [
                { title: { contains: q, ...insensitive } },
                { description: { contains: q, ...insensitive } },
              ],
            },
            select: { slug: true, title: true, description: true },
          })
          .then((events) => {
            for (const e of events) {
              results.push({
                type: "event",
                slug: e.slug,
                title: e.title,
                excerpt: e.description.slice(0, 150) + "...",
              });
            }
          }),
      );
    }

    if (searchTypes.includes("research")) {
      promises.push(
        prisma.research
          .findMany({
            where: {
              status: "PUBLISHED" as never,
              OR: [
                { title: { contains: q, ...insensitive } },
                { summary: { contains: q, ...insensitive } },
                { organisation: { contains: q, ...insensitive } },
              ],
            },
            select: { slug: true, title: true, summary: true },
          })
          .then((items) => {
            for (const r of items) {
              results.push({
                type: "research",
                slug: r.slug,
                title: r.title,
                excerpt: r.summary.slice(0, 150) + "...",
              });
            }
          }),
      );
    }

    if (searchTypes.includes("news")) {
      promises.push(
        prisma.newsArticle
          .findMany({
            where: {
              status: "PUBLISHED" as never,
              OR: [
                { title: { contains: q, ...insensitive } },
                { excerpt: { contains: q, ...insensitive } },
              ],
            },
            select: { slug: true, title: true, excerpt: true },
          })
          .then((articles) => {
            for (const a of articles) {
              results.push({
                type: "news",
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt.slice(0, 150) + "...",
              });
            }
          }),
      );
    }

    await Promise.all(promises);

    // Paginate the combined results
    const total = results.length;
    const paged = results.slice((page - 1) * limit, page * limit);

    return paginatedResponse(paged, total, page, limit);
  } catch (err) {
    console.error("GET /api/search error:", err);
    return errorResponse("Search failed");
  }
}
