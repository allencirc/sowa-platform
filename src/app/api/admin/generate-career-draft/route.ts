import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { generateText, parseJSONResponse } from "@/lib/ai";

interface CareerDraftRequest {
  title: string;
  sector: string;
  entryLevel: string;
}

interface CareerDraftResult {
  description: string;
  keyResponsibilities: string[];
  qualifications: string[];
  workingConditions: string;
  growthOutlook: string;
}

const SYSTEM_PROMPT = `You are a career content specialist for the Skillnet Offshore Wind Academy (SOWA), an Irish government-backed initiative developing Ireland's offshore wind energy workforce.

Generate a professional career page draft for the specified role. The content should be informative, realistic, and tailored to the Irish offshore wind energy sector.

Return ONLY valid JSON with exactly these keys:
{
  "description": "...",
  "keyResponsibilities": ["...", "..."],
  "qualifications": ["...", "..."],
  "workingConditions": "...",
  "growthOutlook": "..."
}

Rules:
- description: 2-3 concise paragraphs describing the role, its importance in the offshore wind sector, and what a typical day involves. Max 800 characters.
- keyResponsibilities: 5-7 specific, actionable bullet points. Each under 120 characters.
- qualifications: 4-6 realistic qualifications/certifications relevant to the Irish market (NFQ levels, STCW, GWO, etc. where appropriate).
- workingConditions: 1 paragraph covering typical environment, hours, travel, and physical requirements. Max 400 characters.
- growthOutlook: 1 paragraph on career progression, sector growth in Ireland, and future demand. Max 400 characters.

Do not include any text outside the JSON object.`;

function buildPrompt(data: CareerDraftRequest): string {
  return `Generate a career page draft for:

Job Title: ${data.title}
Sector: ${data.sector}
Entry Level: ${data.entryLevel}

Context: Ireland is targeting 5 GW of offshore wind capacity by 2030 and up to 37 GW by 2050. The sector is rapidly growing with major projects in the Irish and Celtic Seas. Write content appropriate for this market context.`;
}

export async function POST(request: NextRequest) {
  if (process.env.AI_SUMMARY_ENABLED !== "true") {
    return errorResponse("AI features are not enabled", 403);
  }

  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: CareerDraftRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (!body.title || !body.sector || !body.entryLevel) {
    return errorResponse("Missing required fields: title, sector, entryLevel", 400);
  }

  try {
    const raw = await generateText(SYSTEM_PROMPT, buildPrompt(body), 1024);
    const parsed = parseJSONResponse<CareerDraftResult>(raw);

    const result: CareerDraftResult = {
      description: String(parsed.description || "").slice(0, 2000),
      keyResponsibilities: Array.isArray(parsed.keyResponsibilities)
        ? parsed.keyResponsibilities.map((r) => String(r).slice(0, 200)).slice(0, 10)
        : [],
      qualifications: Array.isArray(parsed.qualifications)
        ? parsed.qualifications.map((q) => String(q).slice(0, 200)).slice(0, 10)
        : [],
      workingConditions: String(parsed.workingConditions || "").slice(0, 1000),
      growthOutlook: String(parsed.growthOutlook || "").slice(0, 1000),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[Generate Career Draft] Failed:", err);
    if (err instanceof Error && err.message === "No AI API key configured") {
      return errorResponse("No AI API key configured", 503);
    }
    return errorResponse("Failed to generate career draft", 500);
  }
}
