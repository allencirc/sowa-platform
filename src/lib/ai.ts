/**
 * Shared AI/LLM helpers — Anthropic-first, OpenAI fallback.
 * Used by /api/admin/generate-seo and /api/admin/generate-career-draft.
 */

export interface AIProvider {
  provider: "anthropic" | "openai";
  key: string;
}

/** Return the first available AI API key, or null. */
export function getAIProvider(): AIProvider | null {
  const anthropicKey = process.env.CLAUDE_KEY || process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) return { provider: "anthropic", key: anthropicKey };

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) return { provider: "openai", key: openaiKey };

  return null;
}

/** Call whichever provider is configured and return the raw text response. */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  const ai = getAIProvider();
  if (!ai) throw new Error("No AI API key configured");

  if (ai.provider === "anthropic") {
    return callAnthropic(ai.key, systemPrompt, userPrompt, maxTokens);
  }
  return callOpenAI(ai.key, systemPrompt, userPrompt, maxTokens);
}

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: systemPrompt,
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

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
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

/** Strip markdown code fences and parse JSON from an LLM response. */
export function parseJSONResponse<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json?\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  return JSON.parse(cleaned);
}
