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
        <XAxis type="number" tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="sector" width={100} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
        <Bar dataKey="changePct">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.changePct >= 0 ? "#22c55e" : "#ef4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
