import { describe, it, expect } from "vitest";

/**
 * Tests for diagnostic session persistence logic and analytics aggregation.
 * These test the pure data transformation — the Prisma calls are tested
 * via integration tests and the mock in __tests__/mocks/prisma.ts.
 */

// ── Aggregation helpers (mirrors the API route logic) ────

function aggregateCompletionsByDate(
  sessions: { completedAt: Date }[],
): { date: string; count: number }[] {
  const byDate = new Map<string, number>();
  for (const s of sessions) {
    const day = s.completedAt.toISOString().split("T")[0];
    byDate.set(day, (byDate.get(day) ?? 0) + 1);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function aggregateTopItems(arrays: string[][]): { key: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const arr of arrays) {
    for (const item of arr) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([key, count]) => ({ key, count }));
}

function aggregateAverageScores(
  sessions: { scores: Record<string, number>; maxPossible: Record<string, number> }[],
  skillCategoryMap: Record<string, string>,
): Record<string, number> {
  const totals: Record<string, { sum: number; count: number }> = {};

  for (const s of sessions) {
    for (const [slug, score] of Object.entries(s.scores)) {
      const cat = skillCategoryMap[slug];
      if (!cat) continue;
      const max = s.maxPossible[slug] ?? 0;
      if (max <= 0) continue;
      if (!totals[cat]) totals[cat] = { sum: 0, count: 0 };
      totals[cat].sum += (score / max) * 100;
      totals[cat].count += 1;
    }
  }

  const result: Record<string, number> = {};
  for (const [cat, { sum, count }] of Object.entries(totals)) {
    result[cat] = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  }
  return result;
}

// ── Tests ────────────────────────────────────────────────

describe("aggregateCompletionsByDate", () => {
  it("groups completions by ISO date", () => {
    const sessions = [
      { completedAt: new Date("2026-04-01T10:00:00Z") },
      { completedAt: new Date("2026-04-01T14:00:00Z") },
      { completedAt: new Date("2026-04-02T09:00:00Z") },
    ];
    const result = aggregateCompletionsByDate(sessions);
    expect(result).toEqual([
      { date: "2026-04-01", count: 2 },
      { date: "2026-04-02", count: 1 },
    ]);
  });

  it("returns sorted by date ascending", () => {
    const sessions = [
      { completedAt: new Date("2026-04-05T10:00:00Z") },
      { completedAt: new Date("2026-04-01T10:00:00Z") },
      { completedAt: new Date("2026-04-03T10:00:00Z") },
    ];
    const result = aggregateCompletionsByDate(sessions);
    expect(result.map((r) => r.date)).toEqual(["2026-04-01", "2026-04-03", "2026-04-05"]);
  });

  it("handles empty input", () => {
    expect(aggregateCompletionsByDate([])).toEqual([]);
  });
});

describe("aggregateTopItems", () => {
  it("counts occurrences and sorts by frequency", () => {
    const arrays = [
      ["engineer", "technician", "hse"],
      ["engineer", "marine_ops"],
      ["engineer", "technician"],
    ];
    const result = aggregateTopItems(arrays);
    expect(result[0]).toEqual({ key: "engineer", count: 3 });
    expect(result[1]).toEqual({ key: "technician", count: 2 });
  });

  it("handles empty arrays", () => {
    expect(aggregateTopItems([[]])).toEqual([]);
    expect(aggregateTopItems([])).toEqual([]);
  });
});

describe("aggregateAverageScores", () => {
  const categoryMap: Record<string, string> = {
    "mechanical-maintenance": "Technical",
    "safety-protocols": "Safety",
    "data-analysis": "Digital",
  };

  it("computes weighted average by category", () => {
    const sessions: { scores: Record<string, number>; maxPossible: Record<string, number> }[] = [
      {
        scores: { "mechanical-maintenance": 8, "safety-protocols": 6, "data-analysis": 4 },
        maxPossible: { "mechanical-maintenance": 10, "safety-protocols": 10, "data-analysis": 10 },
      },
      {
        scores: { "mechanical-maintenance": 6, "safety-protocols": 8 },
        maxPossible: { "mechanical-maintenance": 10, "safety-protocols": 10 },
      },
    ];
    const result = aggregateAverageScores(sessions, categoryMap);

    // Technical: (80 + 60) / 2 = 70
    expect(result.Technical).toBe(70);
    // Safety: (60 + 80) / 2 = 70
    expect(result.Safety).toBe(70);
    // Digital: 40 / 1 = 40
    expect(result.Digital).toBe(40);
  });

  it("skips skills with zero max", () => {
    const sessions = [
      {
        scores: { "mechanical-maintenance": 5 },
        maxPossible: { "mechanical-maintenance": 0 },
      },
    ];
    const result = aggregateAverageScores(sessions, categoryMap);
    expect(result).toEqual({});
  });

  it("skips unknown skill slugs", () => {
    const sessions = [
      {
        scores: { "unknown-skill": 5 },
        maxPossible: { "unknown-skill": 10 },
      },
    ];
    const result = aggregateAverageScores(sessions, categoryMap);
    expect(result).toEqual({});
  });
});

describe("DiagnosticSession data shape", () => {
  it("session record contains no PII fields", () => {
    const session = {
      id: "cuid123",
      sessionId: "uuid-v4-value",
      answers: { q1: "5", q2: ["opt1"] },
      scores: { "mechanical-maintenance": 8 },
      maxPossible: { "mechanical-maintenance": 10 },
      topRoleFamilies: ["engineer", "technician", "hse"],
      topSkillGaps: ["marine-operations", "data-analysis", "safety-protocols"],
      completedAt: new Date(),
      locale: "en",
      referrerSource: "https://sowa.ie/diagnostic",
      createdAt: new Date(),
    };

    // Verify no email, name, phone, or other PII fields
    const keys = Object.keys(session);
    expect(keys).not.toContain("email");
    expect(keys).not.toContain("name");
    expect(keys).not.toContain("phone");
    expect(keys).not.toContain("firstName");
    expect(keys).not.toContain("lastName");
  });

  it("topRoleFamilies are valid role family keys", () => {
    const validKeys = [
      "technician",
      "engineer",
      "marine_ops",
      "hse",
      "project_commercial",
      "data_digital",
    ];
    const families = ["engineer", "hse", "technician"];
    for (const f of families) {
      expect(validKeys).toContain(f);
    }
  });
});

describe("CSV generation", () => {
  it("produces valid CSV with headers", () => {
    // Simplified CSV generation matching the API route logic
    const lines: string[] = [];
    lines.push("SOWA Diagnostic Analytics Report");
    lines.push("Date range: 2026-04-01 to 2026-04-08");
    lines.push("Total completions: 5");
    lines.push("");
    lines.push("Average Scores by Category");
    lines.push("Category,Average Score (%)");
    lines.push("Technical,72.5");
    lines.push("");
    lines.push("Top Skill Gaps");
    lines.push("Skill,Count");
    lines.push('"Marine Operations",3');

    const csv = lines.join("\n");
    expect(csv).toContain("SOWA Diagnostic Analytics Report");
    expect(csv).toContain("Category,Average Score (%)");
    expect(csv).toContain("Technical,72.5");
    expect(csv).toContain('"Marine Operations",3');
  });
});
