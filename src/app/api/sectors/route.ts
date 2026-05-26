import { NextResponse } from "next/server";
import { getQuotes, WATCHLIST, SECTOR_NAMES } from "@/lib/yahoo";

export async function GET() {
  const quotes = await getQuotes(WATCHLIST["ETF Settoriali"]);

  const sectors = quotes.map(q => ({
    sector: SECTOR_NAMES[q.ticker] || q.ticker,
    ticker: q.ticker,
    changePct: +q.changePct.toFixed(2),
    volume: q.volume,
    volRatio: q.volRatio,
  })).sort((a, b) => b.changePct - a.changePct);

  return NextResponse.json(sectors);
}
