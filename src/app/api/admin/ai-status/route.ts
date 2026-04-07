import { NextResponse } from "next/server";

export async function GET() {
  const enabled = process.env.AI_SUMMARY_ENABLED === "true";
  const hasKey = !!(
    process.env.CLAUDE_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY
  );

  return NextResponse.json({ available: enabled && hasKey });
}
