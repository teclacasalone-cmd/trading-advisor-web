"use client";

const SIGNAL_STYLES: Record<string, { bg: string; text: string }> = {
  "FORTE ACQUISTO": { bg: "#16a34a", text: "#fff" },
  "ACQUISTO": { bg: "#22c55e", text: "#fff" },
  "COMPRA": { bg: "#22c55e", text: "#0f0e2a" },
  "ASPETTA": { bg: "#eab308", text: "#0f0e2a" },
  "TIENI": { bg: "#3b82f6", text: "#fff" },
  "NEUTRO": { bg: "#64748b", text: "#fff" },
  "VENDITA": { bg: "#ef4444", text: "#fff" },
  "VENDI": { bg: "#ef4444", text: "#fff" },
  "FORTE VENDITA": { bg: "#dc2626", text: "#fff" },
};

export default function SignalBadge({ signal }: { signal: string }) {
  const style = SIGNAL_STYLES[signal] || { bg: "#64748b", text: "#fff" };
  return (
    <span
      className="px-2 py-1 rounded-md text-xs font-black"
      style={{ background: style.bg, color: style.text }}
    >
      {signal}
    </span>
  );
}
