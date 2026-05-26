"use client";

interface Props {
  score: number;
  rating: string;
}

export default function FearGreedGauge({ score, rating }: Props) {
  const getColor = (s: number) => {
    if (s < 25) return "text-red-600";
    if (s < 45) return "text-orange-500";
    if (s < 55) return "text-yellow-500";
    if (s < 75) return "text-green-500";
    return "text-green-700";
  };

  const getBarColor = (s: number) => {
    if (s < 25) return "bg-red-600";
    if (s < 45) return "bg-orange-500";
    if (s < 55) return "bg-yellow-500";
    if (s < 75) return "bg-green-500";
    return "bg-green-700";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Fear & Greed Index</h3>
      <div className={`text-4xl font-bold ${getColor(score)}`}>{score}</div>
      <div className="text-sm text-gray-500 mt-1">{rating}</div>
      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
        <div
          className={`h-3 rounded-full ${getBarColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Extreme Fear</span>
        <span>Extreme Greed</span>
      </div>
    </div>
  );
}
