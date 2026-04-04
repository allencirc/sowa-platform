"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DiagnosticResult, Skill } from "@/lib/types";

const categoryColours: Record<string, string> = {
  Technical: "#4A90D9",
  Safety: "#DC2626",
  Regulatory: "#059669",
  Digital: "#7C3AED",
  Management: "#EA580C",
};

interface ResultsChartProps {
  result: DiagnosticResult;
  allSkills: Skill[];
}

export function ResultsChart({ result, allSkills }: ResultsChartProps) {

  // Group scores by skill category and average them
  const categoryScores: Record<string, { total: number; max: number; count: number }> = {};

  for (const [slug, score] of Object.entries(result.scores)) {
    const maxScore = result.maxPossible[slug] ?? 0;
    if (maxScore === 0) continue;

    const skill = allSkills.find((s) => s.slug === slug);
    if (!skill) continue;

    if (!categoryScores[skill.category]) {
      categoryScores[skill.category] = { total: 0, max: 0, count: 0 };
    }
    categoryScores[skill.category].total += score;
    categoryScores[skill.category].max += maxScore;
    categoryScores[skill.category].count += 1;
  }

  const data = Object.entries(categoryScores).map(([category, { total, max }]) => ({
    category,
    score: Math.round((total / max) * 100),
    benchmark: 65, // Target/average benchmark line
    fill: categoryColours[category] ?? "#6B7280",
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={380}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid
            stroke="#E5E7EB"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 600 }}
            className="text-xs"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#9CA3AF", fontSize: 11 }}
            tickCount={5}
          />
          {/* Benchmark overlay */}
          <Radar
            name="Industry Benchmark"
            dataKey="benchmark"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="transparent"
          />
          {/* User score */}
          <Radar
            name="Your Score"
            dataKey="score"
            stroke="#00A878"
            strokeWidth={2.5}
            fill="#00A878"
            fillOpacity={0.15}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
