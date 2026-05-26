"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface SectorData {
  sector: string;
  changePct: number;
}

export default function SectorChart({ data }: { data: SectorData[] }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis type="category" dataKey="sector" width={100} tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <Tooltip
          formatter={(v) => `${Number(v).toFixed(2)}%`}
          contentStyle={{ background: "#0f1129", border: "1px solid #1e2350", borderRadius: 8, color: "#e2e8f0" }}
        />
        <Bar dataKey="changePct">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.changePct >= 0 ? "#5b8af5" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
