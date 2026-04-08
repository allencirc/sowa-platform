"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface Props {
  data: { slug: string; name: string; count: number }[];
}

export function SkillGapsBar({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 12, fill: "#6B7280" }} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#4b5563" }} width={95} />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
        <Bar dataKey="count" name="Users with gap" fill="#4A90D9" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
