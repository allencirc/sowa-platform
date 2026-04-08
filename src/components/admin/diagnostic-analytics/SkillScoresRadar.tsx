"use client";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

interface Props {
  data: Record<string, number>;
}

export function SkillScoresRadar({ data }: Props) {
  const chartData = Object.entries(data).map(([category, score]) => ({
    category,
    score,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "#4b5563" }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
        <Radar
          name="Average score (%)"
          dataKey="score"
          stroke="#00A878"
          fill="#00A878"
          fillOpacity={0.2}
        />
        <Radar
          name="Benchmark (65%)"
          dataKey={() => 65}
          stroke="#9ca3af"
          strokeDasharray="5 5"
          fill="none"
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
