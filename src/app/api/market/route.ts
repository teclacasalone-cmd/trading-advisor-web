import { NextResponse } from "next/server";
import { getQuotes, WATCHLIST, SECTOR_NAMES } from "@/lib/yahoo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "Top Azioni";

  const tickers = WATCHLIST[category] || WATCHLIST["Top Azioni"];
  const quotes = await getQuotes(tickers);

  // Aggiungi nomi settori per ETF
  const enriched = quotes.map(q => ({
    ...q,
    name: SECTOR_NAMES[q.ticker] || q.name,
  }));

  return NextResponse.json(enriched);
}
