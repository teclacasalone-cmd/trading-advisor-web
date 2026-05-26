"use client";

interface Props {
  score: number;
  rating: string;
}

export default function FearGreedGauge({ score, rating }: Props) {
  const getColor = (s: number) => {
    if (s < 25) return "#ef4444";
    if (s < 45) return "#f97316";
    if (s < 55) return "#eab308";
    if (s < 75) return "#22c55e";
    return "#16a34a";
  };

  return (
    <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h3 className="text-xs font-bold mb-2" style={{ color: "#94a3b8" }}>Fear & Greed Index</h3>
      <div className="text-4xl font-black" style={{ color: getColor(score) }}>{score}</div>
      <div className="text-sm mt-1" style={{ color: "#94a3b8" }}>{rating}</div>
      <div className="w-full rounded-full h-3 mt-3" style={{ background: "var(--surface-light)" }}>
        <div
          className="h-3 rounded-full transition-all"
          style={{ width: `${score}%`, background: getColor(score) }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: "#475569" }}>
        <span>Extreme Fear</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  );
}
