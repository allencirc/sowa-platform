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
  const query = q.toLowerCase();

  try {
    const results: SearchResult[] = [];

    // Search across requested types (or all if none specified)
    const searchTypes = type ? [type] : ["career", "course", "event", "research", "news"];

    const promises: Promise<void>[] = [];

    if (searchTypes.includes("career")) {
      promises.push(
        prisma.career.findMany().then((careers) => {
          for (const career of careers) {
            const displaySector = sectorDisplay[career.sector] ?? career.sector;
            if (
              career.title.toLowerCase().includes(query) ||
              career.description.toLowerCase().includes(query) ||
              displaySector.toLowerCase().includes(query)
            ) {
              results.push({
                type: "career",
                slug: career.slug,
                title: career.title,
                excerpt: career.description.slice(0, 150) + "...",
              });
            }
          }
        })
      );
    }

    if (searchTypes.includes("course")) {
      promises.push(
        prisma.course.findMany().then((courses) => {
          for (const course of courses) {
            if (
              course.title.toLowerCase().includes(query) ||
              course.description.toLowerCase().includes(query) ||
              course.provider.toLowerCase().includes(query)
            ) {
              results.push({
                type: "course",
                slug: course.slug,
                title: course.title,
                excerpt: course.description.slice(0, 150) + "...",
              });
            }
          }
        })
      );
    }

    if (searchTypes.includes("event")) {
      promises.push(
        prisma.event.findMany().then((events) => {
          for (const event of events) {
            if (
              event.title.toLowerCase().includes(query) ||
              event.description.toLowerCase().includes(query)
            ) {
              results.push({
                type: "event",
                slug: event.slug,
                title: event.title,
                excerpt: event.description.slice(0, 150) + "...",
              });
            }
          }
        })
      );
    }

    if (searchTypes.includes("research")) {
      promises.push(
        prisma.research.findMany().then((items) => {
          for (const r of items) {
            if (
              r.title.toLowerCase().includes(query) ||
              r.summary.toLowerCase().includes(query) ||
              r.organisation.toLowerCase().includes(query)
            ) {
              results.push({
                type: "research",
                slug: r.slug,
                title: r.title,
                excerpt: r.summary.slice(0, 150) + "...",
              });
            }
          }
        })
      );
    }

    if (searchTypes.includes("news")) {
      promises.push(
        prisma.newsArticle.findMany().then((articles) => {
          for (const article of articles) {
            if (
              article.title.toLowerCase().includes(query) ||
              article.excerpt.toLowerCase().includes(query) ||
              article.content.toLowerCase().includes(query)
            ) {
              results.push({
                type: "news",
                slug: article.slug,
                title: article.title,
                excerpt: article.excerpt.slice(0, 150) + "...",
              });
            }
          }
        })
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
