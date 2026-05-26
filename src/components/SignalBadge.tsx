"use client";

const SIGNAL_COLORS: Record<string, string> = {
  "FORTE ACQUISTO": "bg-green-600 text-white",
  "ACQUISTO": "bg-green-400 text-white",
  "NEUTRO": "bg-gray-400 text-white",
  "VENDITA": "bg-red-400 text-white",
  "FORTE VENDITA": "bg-red-600 text-white",
};

export default function SignalBadge({ signal }: { signal: string }) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${SIGNAL_COLORS[signal] || "bg-gray-300"}`}>
      {signal}
    </span>
  );
}
