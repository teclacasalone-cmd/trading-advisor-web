"use client";

interface Props {
  title: string;
  summary: string;
  source: string;
  link: string;
  sentiment: string;
  score: number;
}

const SENTIMENT_STYLE: Record<string, { bg: string; dot: string }> = {
  POSITIVO: { bg: "border-l-green-500", dot: "bg-green-500" },
  NEGATIVO: { bg: "border-l-red-500", dot: "bg-red-500" },
  NEUTRO: { bg: "border-l-gray-400", dot: "bg-gray-400" },
};

export default function NewsCard({ title, summary, source, link, sentiment, score }: Props) {
  const style = SENTIMENT_STYLE[sentiment] || SENTIMENT_STYLE.NEUTRO;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-white dark:bg-gray-800 border-l-4 ${style.bg} rounded-lg p-4 shadow hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-tight">{title}</h4>
        <div className="flex items-center gap-1 shrink-0">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className="text-xs text-gray-500">{sentiment}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{summary}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400">{source}</span>
        <span className="text-xs text-gray-400">Score: {score}</span>
      </div>
    </a>
  );
}
