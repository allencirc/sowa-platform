import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";

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

const SYSTEM_PROMPT = `You are an SEO specialist for the Skillnet Offshore Wind Academy (SOWA), an Irish government-backed initiative developing Ireland's offshore wind workforce. Generate SEO metadata for web pages about offshore wind energy careers, training, events, and research.

Return ONLY valid JSON with exactly these keys:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "..."
}

Rules:
- metaTitle: max 60 characters, include primary keyword, end with " — SOWA" if space allows
- metaDescription: max 155 characters, compelling call-to-action, include primary keyword naturally
- metaKeywords: 5-8 comma-separated keywords relevant to Irish offshore wind energy

Do not include any text outside the JSON object.`;

function buildPrompt(data: GenerateSeoRequest): string {
  return `Generate SEO metadata for the following ${data.contentType} page:

Title: ${data.title}
Content: ${data.description.slice(0, 500)}

Generate optimised SEO metadata targeting the Irish offshore wind energy sector audience.`;
}

export async function POST(request: NextRequest) {
  if (process.env.AI_SUMMARY_ENABLED !== "true") {
    return errorResponse("AI features are not enabled", 403);
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

  const anthropicKey = process.env.CLAUDE_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!anthropicKey && !openaiKey) {
    return errorResponse("No AI API key configured", 503);
  }

  try {
    const userPrompt = buildPrompt(body);
    let raw: string;

    if (anthropicKey) {
      raw = await callAnthropic(anthropicKey, userPrompt);
    } else {
      raw = await callOpenAI(openaiKey!, userPrompt);
    }

    const seo = parseSeoResponse(raw);
    return NextResponse.json(seo);
  } catch (err) {
    console.error("[Generate SEO] Failed:", err);
    return errorResponse("Failed to generate SEO metadata", 500);
  }
}

function parseSeoResponse(raw: string): SeoResult {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);

  return {
    metaTitle: String(parsed.metaTitle || "").slice(0, 60),
    metaDescription: String(parsed.metaDescription || "").slice(0, 155),
    metaKeywords: String(parsed.metaKeywords || "").slice(0, 500),
  };
}

async function callAnthropic(apiKey: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.content?.[0];
  if (content?.type !== "text" || !content.text) {
    throw new Error("Unexpected Anthropic response format");
  }

  return content.text;
}

async function callOpenAI(apiKey: string, userPrompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 256,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content;
  if (!message) {
    throw new Error("Unexpected OpenAI response format");
  }

  return message;
}
