import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, errorResponse } from "@/lib/api-utils";
import { getAllCareers, getAllCourses, getUpcomingEvents, getAllSkills } from "@/lib/queries";
import type { Career, Course, Event, Skill } from "@/lib/types";

function formatCareers(careers: Career[]): string {
  return careers
    .map((c) => {
      const salary = c.salaryRange
        ? `€${c.salaryRange.min.toLocaleString()}–€${c.salaryRange.max.toLocaleString()}`
        : "Not specified";
      return `- ${c.title} | Sector: ${c.sector} | Level: ${c.entryLevel} | Salary: ${salary}\n  ${c.description}\n  Skills: ${c.skills.join(", ")}`;
    })
    .join("\n");
}

function formatCourses(courses: Course[]): string {
  return courses
    .map((c) => {
      const cost = c.cost === 0 ? "Free" : `€${c.cost}`;
      const start = c.nextStartDate
        ? new Date(c.nextStartDate).toLocaleDateString("en-IE", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "TBC";
      const nfq = c.nfqLevel ? ` | NFQ Level ${c.nfqLevel}` : "";
      return `- ${c.title} | Provider: ${c.provider} (${c.providerType}) | Format: ${c.deliveryFormat} | Duration: ${c.duration} | Cost: ${cost} | Next start: ${start}${nfq}\n  ${c.description}`;
    })
    .join("\n");
}

function formatEvents(events: Event[]): string {
  if (events.length === 0) return "No upcoming events currently scheduled.";
  return events
    .map((e) => {
      const date = new Date(e.startDate).toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const loc = e.location ? ` | Location: ${e.location}` : "";
      return `- ${e.title} | Type: ${e.type} | Date: ${date} | ${e.locationType}${loc}\n  ${e.description}`;
    })
    .join("\n");
}

function formatSkills(skills: Skill[]): string {
  const byCategory: Record<string, string[]> = {};
  for (const s of skills) {
    const cat = s.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(s.name + (s.isTransferable ? " (transferable)" : ""));
  }
  return Object.entries(byCategory)
    .map(([cat, names]) => `${cat}: ${names.join(", ")}`)
    .join("\n");
}

function buildSystemPrompt(
  careers: Career[],
  courses: Course[],
  events: Event[],
  skills: Skill[],
): string {
  return `You are the SOWA AI Assistant — the public-facing Q&A helper for the Skillnet Offshore Wind Academy (SOWA), a government-backed initiative to develop Ireland's offshore wind workforce.

Your job is to answer questions from the public about careers, training, events, and skills in Ireland's offshore wind energy (OWE) sector. You have access to SOWA's full content library below.

## Key context about Ireland's offshore wind sector
- Ireland has committed to at least 5GW of offshore wind by 2030, and 37GW by 2050
- This will create thousands of new jobs across multiple disciplines
- Many skills are transferable from adjacent sectors: oil & gas, maritime, construction, traditional energy, engineering
- The National Framework of Qualifications (NFQ) and Global Wind Organisation (GWO) standards apply
- SOWA is funded by Skillnet Ireland and works with Irish and international training providers

## SOWA Career Pathways (${careers.length} careers)
${formatCareers(careers)}

## SOWA Training Courses (${courses.length} courses)
${formatCourses(courses)}

## Upcoming Events (${events.length} events)
${formatEvents(events)}

## Skills Taxonomy (${skills.length} skills)
${formatSkills(skills)}

## Instructions
- Answer questions helpfully, referencing specific careers, courses, and events by name
- If someone asks about transitioning from another sector, identify their transferable skills and suggest specific entry points
- If someone asks about upcoming courses or events, give specific dates and details
- Suggest concrete next steps (e.g., "You could start with the GWO Basic Safety Training course which begins on...")
- Keep answers concise — aim for 2–4 short paragraphs max
- Be encouraging and practical; this is a growing sector with strong demand
- If you don't have specific information to answer a question, say so honestly and suggest they visit the SOWA website or contact the team
- Do not make up information that isn't in the content library above
- Do not discuss topics unrelated to offshore wind, energy careers, or training`;
}

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let body: { question: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (!body.question || typeof body.question !== "string" || body.question.trim().length === 0) {
    return errorResponse("Missing required field: question", 400);
  }

  if (body.question.length > 500) {
    return errorResponse("Question too long (max 500 characters)", 400);
  }

  const apiKey = process.env.CLAUDE_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResponse("AI chat is not configured", 503);
  }

  try {
    // Load current CMS content in parallel
    const [careers, courses, events, skills] = await Promise.all([
      getAllCareers(),
      getAllCourses(),
      getUpcomingEvents(),
      getAllSkills(),
    ]);

    const systemPrompt = buildSystemPrompt(careers, courses, events, skills);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: body.question.trim() }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[AI Chat] Anthropic API error:", response.status, text);
      return errorResponse("Failed to generate response", 500);
    }

    const data = await response.json();
    const content = data.content?.[0];
    if (content?.type !== "text" || !content.text) {
      throw new Error("Unexpected Anthropic response format");
    }

    return NextResponse.json({ answer: content.text });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return errorResponse("Failed to generate response", 500);
  }
}
