"use client";

import { useEffect, useRef } from "react";

interface Props {
  symbol: string;
  height?: number;
}

export default function TradingViewChart({ symbol, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "Europe/Rome",
      theme: "light",
      style: "1",
      locale: "it",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      studies: [
        "RSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
        "MACD@tv-basicstudies",
        "BollingerBands@tv-basicstudies",
      ],
    });

    containerRef.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
