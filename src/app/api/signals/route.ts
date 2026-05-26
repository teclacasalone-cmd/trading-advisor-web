import { NextResponse } from "next/server";
import { getHistory, computeSignals, WATCHLIST } from "@/lib/yahoo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (ticker) {
    // Singolo ticker
    const history = await getHistory(ticker);
    if (history.length < 20) {
      return NextResponse.json({ error: "Dati insufficienti" }, { status: 404 });
    }
    const signals = computeSignals(ticker, history);
    return NextResponse.json({ signals, history });
  }

  // Tutti i ticker principali
  const allTickers = [...WATCHLIST["Top Azioni"], ...WATCHLIST["Crypto"]];
  const allSignals = [];

  for (const t of allTickers) {
    try {
      const history = await getHistory(t);
      if (history.length >= 20) {
        allSignals.push(computeSignals(t, history));
      }
    } catch {
      continue;
    }
  }

  allSignals.sort((a, b) => b.score - a.score);
  return NextResponse.json(allSignals);
}
