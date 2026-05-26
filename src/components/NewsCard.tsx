"use client";

interface Props {
  title: string;
  summary: string;
  source: string;
  link: string;
  sentiment: string;
  score: number;
}

const SENTIMENT_COLORS: Record<string, { border: string; dot: string }> = {
  POSITIVO: { border: "#22c55e", dot: "#22c55e" },
  NEGATIVO: { border: "#ef4444", dot: "#ef4444" },
  NEUTRO: { border: "#64748b", dot: "#64748b" },
};

export default function NewsCard({ title, summary, source, link, sentiment, score }: Props) {
  const style = SENTIMENT_COLORS[sentiment] || SENTIMENT_COLORS.NEUTRO;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl p-4 transition-all hover:brightness-110"
      style={{
        background: "var(--surface)",
        borderLeft: `4px solid ${style.border}`,
        border: "1px solid var(--border)",
        borderLeftWidth: "4px",
        borderLeftColor: style.border,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-tight">{title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
          <span className="text-xs" style={{ color: "#94a3b8" }}>{sentiment}</span>
        </div>
      </div>
      <p className="text-xs mt-2 line-clamp-2" style={{ color: "#94a3b8" }}>{summary}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs" style={{ color: "#475569" }}>{source}</span>
        <span className="text-xs" style={{ color: "#475569" }}>Score: {score}</span>
      </div>
    </a>
  );
}
