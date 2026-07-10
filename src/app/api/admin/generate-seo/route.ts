import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { generateText, parseJSONResponse } from "@/lib/ai";
import { getSiteSettings } from "@/lib/queries";
import type { SiteSettings } from "@/lib/theme-defaults";

interface GenerateSeoRequest {
  title: string;
  description: string;
  contentType: string;
}

interface SeoResult {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

function buildSystemPrompt(settings: SiteSettings): string {
  return `You are an SEO specialist for the ${settings.siteFullName} (${settings.siteName}), an Irish government-backed initiative developing Ireland's ${settings.sectorName} workforce. Generate SEO metadata for web pages about ${settings.sectorName} careers, training, events, and research.

Return ONLY valid JSON with exactly these keys:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "..."
}

Rules:
- metaTitle: max 60 characters, include primary keyword, end with " — ${settings.siteName}" if space allows
- metaDescription: max 155 characters, compelling call-to-action, include primary keyword naturally
- metaKeywords: 5-8 comma-separated keywords relevant to the Irish ${settings.sectorName} sector

Do not include any text outside the JSON object.`;
}

function buildPrompt(data: GenerateSeoRequest): string {
  return `Generate SEO metadata for the following ${data.contentType} page:

Title: ${data.title}
Content: ${data.description.slice(0, 500)}

Generate optimised SEO metadata targeting the Irish sector audience.`;
}

export async function POST(request: NextRequest) {
  if (process.env.AI_SUMMARY_ENABLED !== "true") {
    return errorResponse(
      "AI features are not enabled. Set AI_SUMMARY_ENABLED=true in your environment variables.",
      403,
    );
  }

  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: GenerateSeoRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (!body.title || !body.description || !body.contentType) {
    return errorResponse("Missing required fields: title, description, contentType", 400);
  }

  try {
    const settings = await getSiteSettings();
    const raw = await generateText(buildSystemPrompt(settings), buildPrompt(body), 256);
    const parsed = parseJSONResponse<SeoResult>(raw);

    const seo: SeoResult = {
      metaTitle: String(parsed.metaTitle || "").slice(0, 60),
      metaDescription: String(parsed.metaDescription || "").slice(0, 155),
      metaKeywords: String(parsed.metaKeywords || "").slice(0, 500),
    };

    return NextResponse.json(seo);
  } catch (err) {
    console.error("[Generate SEO] Failed:", err);
    if (err instanceof Error && err.message === "No AI API key configured") {
      return errorResponse("No AI API key configured", 503);
    }
    return errorResponse("Failed to generate SEO metadata", 500);
  }
}
