import { NextResponse } from "next/server";
import { getQuotes, WATCHLIST, ASSET_NAMES } from "@/lib/yahoo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "Top Azioni USA";

  const tickers = WATCHLIST[category] || WATCHLIST["Top Azioni USA"];
  const quotes = await getQuotes(tickers);

  const enriched = quotes.map(q => ({
    ...q,
    name: ASSET_NAMES[q.ticker] || q.name,
  }));

  return NextResponse.json(enriched);
}
