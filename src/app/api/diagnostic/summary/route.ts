import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";

interface SummaryRequestBody {
  background: {
    currentSituation?: string;
    experienceLevel?: string;
    interestArea?: string;
  };
  gaps: Array<{
    skillName: string;
    severity: "high" | "medium" | "low";
    scorePercent: number;
  }>;
  recommendedCareers: Array<{
    title: string;
    sector: string;
    entryLevel: string;
  }>;
  recommendedCourses: Array<{
    title: string;
    provider: string;
    duration: string;
    cost: number;
  }>;
  overallScorePercent: number;
}

function buildPrompt(data: SummaryRequestBody): string {
  const { background, gaps, recommendedCareers, recommendedCourses, overallScorePercent } = data;

  const gapLines = gaps
    .slice(0, 3)
    .map((g) => `- ${g.skillName}: ${g.severity} gap (${g.scorePercent}% proficiency)`)
    .join("\n");

  const careerLines = recommendedCareers
    .slice(0, 3)
    .map((c) => `- ${c.title} (${c.sector}, ${c.entryLevel} level)`)
    .join("\n");

  const courseLines = recommendedCourses
    .slice(0, 3)
    .map((c) => {
      const costStr = c.cost === 0 ? "Free" : `€${c.cost}`;
      return `- ${c.title} by ${c.provider} (${c.duration}, ${costStr})`;
    })
    .join("\n");

  return `The user has completed a skills diagnostic assessment for the Irish offshore wind energy sector. Based on their results, write a personalised ~200-word career guidance summary.

User background:
- Current situation: ${background.currentSituation || "Not specified"}
- Experience level: ${background.experienceLevel || "Not specified"}
- Area of interest: ${background.interestArea || "Not specified"}
- Overall assessment score: ${overallScorePercent}%

Top skill gaps:
${gapLines || "No significant gaps identified"}

Recommended career paths:
${careerLines || "None identified"}

Recommended training courses:
${courseLines || "None identified"}

Write a friendly, encouraging paragraph that:
1. Acknowledges where the user currently stands (without being negative about gaps)
2. Highlights their strongest transferable skills based on what they scored well on
3. Identifies which career paths are most accessible to them and why
4. Suggests a specific next step (e.g., "Start with [specific course] to build your [specific skill] foundation")
5. Mentions that Ireland's offshore wind sector is growing rapidly with strong demand for skilled professionals

Keep the tone warm, practical, and motivating. Do not use bullet points — write flowing prose. Do not include any PII or make assumptions about the user's identity.`;
}

const SYSTEM_PROMPT = `You are a career guidance advisor specialising in the Irish offshore wind energy (OWE) sector. You work for the Skillnet Offshore Wind Academy (SOWA), a government-backed initiative to develop Ireland's offshore wind workforce.

You are knowledgeable about:
- Ireland's offshore wind targets (at least 5GW by 2030, 37GW by 2050)
- The key career pathways in OWE: operations & maintenance, marine operations, electrical, survey & design, HSE, policy & regulation, and project management
- Irish training providers and certification frameworks (NFQ, GWO standards)
- The transferable skills from adjacent sectors (oil & gas, maritime, construction, energy)

Your tone is encouraging, practical, and professional. You help people see a clear path forward into offshore wind careers, regardless of their starting point. You never use jargon without explanation. You are concise — around 200 words.`;

export async function POST(request: NextRequest) {
  // Feature flag check
  if (process.env.AI_SUMMARY_ENABLED !== "true") {
    return errorResponse("AI summary feature is not enabled", 403);
  }

  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: SummaryRequestBody;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  // Validate required fields
  if (!body.gaps || !body.recommendedCareers || !body.recommendedCourses) {
    return errorResponse("Missing required fields: gaps, recommendedCareers, recommendedCourses", 400);
  }

  const userPrompt = buildPrompt(body);

  // Try Anthropic API first, fall back to OpenAI
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!anthropicKey && !openaiKey) {
    return errorResponse("No AI API key configured", 503);
  }

  try {
    let summary: string;

    if (anthropicKey) {
      summary = await callAnthropic(anthropicKey, userPrompt);
    } else {
      summary = await callOpenAI(openaiKey!, userPrompt);
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[AI Summary] Generation failed:", err);
    return errorResponse("Failed to generate AI summary", 500);
  }
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
      max_tokens: 512,
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
      max_tokens: 512,
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
