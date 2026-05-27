import { NextResponse } from "next/server";
import { getQuotes, ASSET_NAMES } from "@/lib/yahoo";
import { STRATEGY_PICKS } from "@/lib/strategy";
import { getAllPredictions } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Ticker da monitorare: strategia + ultime previsioni
    const strategyTickers = STRATEGY_PICKS.map(p => p.ticker);
    const predictions = await getAllPredictions(30);
    const predictionTickers = predictions.map((p: any) => p.ticker);
    const allTickers = [...new Set([...strategyTickers, ...predictionTickers])];

    // 2. Prezzi attuali
    const quotes = await getQuotes(allTickers);
    const quoteMap = new Map(quotes.map(q => [q.ticker, q]));

    // 3. Mappa previsioni più recenti per ticker
    const latestPrediction = new Map<string, any>();
    for (const pred of predictions) {
      if (!latestPrediction.has(pred.ticker)) {
        latestPrediction.set(pred.ticker, pred);
      }
    }

    // 4. Mappa strategia per ticker
    const strategyMap = new Map(STRATEGY_PICKS.map(p => [p.ticker, p]));

    // 5. Costruisci dati live
    const liveData = allTickers.map(ticker => {
      const quote = quoteMap.get(ticker);
      if (!quote || quote.price <= 0) return null;

      const pred = latestPrediction.get(ticker);
      const strat = strategyMap.get(ticker);

      // Variazione dalla previsione
      let vsPredizioneePct = 0;
      let predPrice = 0;
      let predAction = "";
      let predDate = "";
      if (pred) {
        predPrice = Number(pred.price_at_prediction);
        vsPredizioneePct = predPrice > 0 ? +((quote.price - predPrice) / predPrice * 100).toFixed(2) : 0;
        predAction = pred.action;
        predDate = pred.created_at;
      }

      // Variazione dalla strategia
      let vsStrategiaPct = 0;
      let stratPrice = 0;
      let stratAction = "";
      let stratTarget = 0;
      let stratStop = 0;
      if (strat) {
        stratPrice = strat.referencePrice;
        vsStrategiaPct = stratPrice > 0 ? +((quote.price - stratPrice) / stratPrice * 100).toFixed(2) : 0;
        stratAction = strat.action;
        stratTarget = strat.targetPrice;
        stratStop = strat.stopLoss;
      }

      // Stato attuale
      let liveStatus = "STABILE";
      if (quote.changePct > 2) liveStatus = "IN SALITA";
      else if (quote.changePct > 0.5) liveStatus = "LEGGERO RIALZO";
      else if (quote.changePct < -2) liveStatus = "IN DISCESA";
      else if (quote.changePct < -0.5) liveStatus = "LEGGERO RIBASSO";

      // Alert
      let alert = "";
      if (strat) {
        if (quote.price >= stratTarget) alert = "TARGET RAGGIUNTO";
        else if (quote.price <= stratStop) alert = "STOP LOSS";
        else if (quote.changePct > 3) alert = "FORTE RIALZO OGGI";
        else if (quote.changePct < -3) alert = "FORTE RIBASSO OGGI";
      }
      if (quote.volRatio >= 1.5) {
        alert += (alert ? " | " : "") + `VOLUME ${quote.volRatio}x`;
      }

      return {
        ticker,
        name: ASSET_NAMES[ticker] || quote.name || ticker,
        price: quote.price,
        changePct: +quote.changePct.toFixed(2),
        volume: quote.volume,
        volRatio: quote.volRatio,
        liveStatus,
        alert,
        // vs Previsione
        predPrice,
        predAction,
        predDate,
        vsPredizioneePct,
        // vs Strategia
        stratPrice,
        stratAction,
        stratTarget,
        stratStop,
        vsStrategiaPct,
        // Categorizzazione
        isStrategy: !!strat,
        isPrediction: !!pred,
        category: strat?.category || "ALTRO",
      };
    }).filter(Boolean);

    // Ordina: alert prima, poi per variazione %
    liveData.sort((a: any, b: any) => {
      if (a.alert && !b.alert) return -1;
      if (!a.alert && b.alert) return 1;
      return Math.abs(b.changePct) - Math.abs(a.changePct);
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      data: liveData,
      marketOpen: isMarketOpen(),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error), data: [], timestamp: new Date().toISOString(), marketOpen: false });
  }
}

function isMarketOpen(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();
  // Lun-Ven, Borsa Italiana: 7:00-15:30 UTC (9:00-17:30 CET)
  // USA: 13:30-20:00 UTC (15:30-22:00 CET)
  if (day === 0 || day === 6) return false;
  if (hour >= 7 && hour < 20) return true;
  return false;
}
