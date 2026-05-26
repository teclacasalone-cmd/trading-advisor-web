import { NextResponse } from "next/server";
import { getUnverifiedPredictions, verifyPrediction } from "@/lib/supabase";
import { getQuotes } from "@/lib/yahoo";
import { askGemini } from "@/lib/gemini";

export const maxDuration = 60;

export async function GET() {
  try {
    // 1. Prendi previsioni non verificate
    const unverified = await getUnverifiedPredictions();
    if (unverified.length === 0) {
      return NextResponse.json({ verified: 0, results: [], aiAnalysis: "Nessuna previsione da verificare ancora. Genera più analisi per costruire lo storico." });
    }

    // 2. Prendi prezzi attuali
    const tickers = [...new Set(unverified.map((p: any) => p.ticker))];
    const quotes = await getQuotes(tickers);
    const priceMap = new Map(quotes.map(q => [q.ticker, q.price]));

    // 3. Verifica ogni previsione (solo quelle > 24h fa)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const results: any[] = [];

    for (const pred of unverified) {
      if (pred.created_at > oneDayAgo) continue; // troppo recente

      const currentPrice = priceMap.get(pred.ticker);
      if (!currentPrice || currentPrice <= 0) continue;

      const result = await verifyPrediction(
        pred.id,
        currentPrice,
        Number(pred.price_at_prediction),
        Number(pred.target_price),
        Number(pred.stop_loss),
      );

      results.push({
        ticker: pred.ticker,
        name: pred.name,
        action: pred.action,
        predictedAt: pred.created_at,
        priceAtPrediction: Number(pred.price_at_prediction),
        currentPrice,
        actualReturn: result.actualReturn,
        correct: result.correct,
        targetPrice: Number(pred.target_price),
        confidence: pred.confidence,
      });
    }

    // 4. AI analizza i risultati
    let aiAnalysis = "";
    if (results.length > 0) {
      const correct = results.filter(r => r.correct).length;
      const wrong = results.length - correct;
      const avgReturn = results.reduce((sum, r) => sum + r.actualReturn, 0) / results.length;

      const winners = results.filter(r => r.correct).map(r => `${r.ticker} (${r.actualReturn > 0 ? "+" : ""}${r.actualReturn}%)`);
      const losers = results.filter(r => !r.correct).map(r => `${r.ticker} (${r.actualReturn > 0 ? "+" : ""}${r.actualReturn}%)`);

      const prompt = `Sei un consulente finanziario che analizza le performance delle sue previsioni passate. Scrivi in italiano (max 200 parole).

RISULTATI VERIFICA:
- Previsioni verificate: ${results.length}
- Corrette: ${correct} (${(correct/results.length*100).toFixed(0)}%)
- Errate: ${wrong}
- Rendimento medio: ${avgReturn > 0 ? "+" : ""}${avgReturn.toFixed(1)}%

VINCENTI: ${winners.join(", ") || "Nessuna"}
PERDENTI: ${losers.join(", ") || "Nessuna"}

Analizza:
1. Come stanno andando le previsioni?
2. Ci sono pattern negli errori? (es. un settore dove sbagli sempre)
3. Cosa aggiustare nella strategia per migliorare?
4. Le previsioni si stanno avverando?`;

      aiAnalysis = await askGemini(prompt);
    }

    return NextResponse.json({
      verified: results.length,
      results,
      aiAnalysis,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
