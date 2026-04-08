"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface Props {
  data: { key: string; label: string; count: number }[];
}

const COLORS = [
  "#0c2340", // primary
  "#00A878", // secondary
  "#4A90D9", // accent
  "#F59E0B", // warning/electrical
  "#7C3AED", // survey-design
  "#EA580C", // project-management
];

export function RoleFamiliesPie({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
          label={(props: { name?: string; percent?: number }) => {
            const name = String(props.name ?? "");
            const pct = typeof props.percent === "number" ? props.percent : 0;
            return `${name.split(" ")[0]} ${(pct * 100).toFixed(0)}%`;
          }}
          labelLine={{ stroke: "#9ca3af" }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: unknown) => [String(value ?? ""), "Recommendations"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
