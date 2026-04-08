"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ReactNode } from "react";

interface Props {
  data: { date: string; count: number }[];
}

export function CompletionsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6B7280" }}
          tickFormatter={(v: string) => {
            const d = new Date(v);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }}
        />
        <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} allowDecimals={false} />
        <Tooltip
          labelFormatter={(v: ReactNode) => new Date(String(v)).toLocaleDateString("en-IE")}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Completions"
          stroke="#00A878"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
