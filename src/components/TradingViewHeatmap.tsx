"use client";

import { useEffect, useRef } from "react";

interface Props {
  exchange?: string;
  height?: number;
}

export default function TradingViewHeatmap({ exchange = "SPX500", height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: exchange,
      grouping: "sector",
      blockSize: "market_cap_basic",
      blockColor: "change",
      locale: "it",
      symbolUrl: "",
      colorTheme: "dark",
      hasTopBar: true,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: height,
    });

    containerRef.current.appendChild(script);
  }, [exchange]);

  return (
    <div className="tradingview-widget-container" style={{ height }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
