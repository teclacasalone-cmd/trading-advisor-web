"use client";

import { useEffect, useRef } from "react";

export default function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "INDEX:DEU40", title: "DAX" },
        { proName: "INDEX:FTSEMIB", title: "FTSE MIB" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
        { proName: "FOREXCOM:EURUSD", title: "EUR/USD" },
        { proName: "TVC:GOLD", title: "Oro" },
        { proName: "NYMEX:CL1!", title: "Petrolio" },
        { proName: "NASDAQ:AAPL", title: "Apple" },
        { proName: "NASDAQ:NVDA", title: "NVIDIA" },
        { proName: "NASDAQ:MSFT", title: "Microsoft" },
        { proName: "NASDAQ:TSLA", title: "Tesla" },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      displayMode: "adaptive",
      colorTheme: "light",
      locale: "it",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container">
      <div ref={containerRef} />
    </div>
  );
}
