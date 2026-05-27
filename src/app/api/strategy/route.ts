import { NextResponse } from "next/server";
import { STRATEGY_PICKS, STRATEGY_RULES, STRATEGY_DATE, STRATEGY_LESSONS, checkStrategy } from "@/lib/strategy";
import { getQuotes, getAnalystData } from "@/lib/yahoo";
import { askGemini } from "@/lib/gemini";
import { saveStrategyChecks, getAccuracyStats, getReportHistory } from "@/lib/supabase";

export const maxDuration = 60;

export async function GET() {
  try {
    // 1. Prendi prezzi attuali di tutti i ticker della strategia
    const tickers = STRATEGY_PICKS.map(p => p.ticker);
    const quotes = await getQuotes(tickers);
    const priceMap = new Map(quotes.map(q => [q.ticker, q.price]));

    // 2. Prendi consensus analisti
    const analystMap = new Map<string, string>();
    for (const ticker of tickers) {
      const ad = await getAnalystData(ticker);
      if (ad) {
        analystMap.set(ticker, `${ad.recommendation.toUpperCase()} — target ${ad.targetPrice} (${ad.upside > 0 ? "+" : ""}${ad.upside}%, ${ad.numAnalysts} analisti)`);
      }
    }

    // 3. Confronto
    const checks = checkStrategy(STRATEGY_PICKS, priceMap, analystMap);

    // 4. AI commentary
    const confirmed = checks.filter(c => c.status === "CONFERMATA" || (c.status === "IN LINEA" && c.stillBuy));
    const warnings = checks.filter(c => c.status === "ATTENZIONE" || c.status === "STOP LOSS");
    const targets = checks.filter(c => c.status === "TARGET RAGGIUNTO");

    let aiCommentary = "";
    try {
      const prompt = `Sei un consulente finanziario. Confronta la strategia di investimento con i dati reali di oggi e dai un verdetto in italiano (max 250 parole).

STRATEGIA creata il ${STRATEGY_DATE}, confrontata con prezzi di oggi:

CONFERMATE (da comprare):
${confirmed.map(c => `${c.pick.ticker} (${c.pick.name}): era ${c.pick.currency}${c.pick.referencePrice}, ora ${c.pick.currency}${c.currentPrice} (${c.changePct > 0 ? "+" : ""}${c.changePct}%)`).join("\n") || "Nessuna"}

ATTENZIONE/STOP LOSS:
${warnings.map(c => `${c.pick.ticker}: era ${c.pick.currency}${c.pick.referencePrice}, ora ${c.pick.currency}${c.currentPrice} (${c.changePct > 0 ? "+" : ""}${c.changePct}%)`).join("\n") || "Nessuna"}

TARGET RAGGIUNTI:
${targets.map(c => `${c.pick.ticker}: target ${c.pick.currency}${c.pick.targetPrice} raggiunto, ora a ${c.pick.currency}${c.currentPrice}`).join("\n") || "Nessuno"}

LEZIONI DALLA STRATEGIA PRECEDENTE:
${STRATEGY_LESSONS.join("\n")}

Rispondi con:
1. VERDETTO GENERALE: la strategia sta funzionando? Quali pattern si confermano?
2. COSA FARE OGGI: quali azioni comprare/vendere adesso, con prezzi concreti
3. NICCHIA: tra le nuove pick di nicchia, quali sono le più promettenti?
4. AGGIUSTAMENTI: cosa cambiare, basandoti sulle lezioni apprese`;

      aiCommentary = await askGemini(prompt);
    } catch {}

    // Salva in Supabase
    let accuracy = { total: 0, correct: 0, wrong: 0, accuracy: 0, avgReturn: 0 };
    let history: any[] = [];
    try {
      await saveStrategyChecks(
        checks.filter((c: any) => c.currentPrice > 0).map((c: any) => ({
          ticker: c.pick.ticker,
          reference_price: c.pick.referencePrice,
          current_price: c.currentPrice,
          change_pct: c.changePct,
          status: c.status,
          still_buy: c.stillBuy,
        }))
      );
      accuracy = await getAccuracyStats();
      history = await getReportHistory(5);
    } catch {}

    return NextResponse.json({
      date: new Date().toISOString(),
      strategyDate: STRATEGY_DATE,
      checks,
      rules: STRATEGY_RULES,
      aiCommentary,
      accuracy,
      history,
      stats: {
        total: checks.length,
        confirmed: confirmed.length,
        warnings: warnings.length,
        targets: targets.length,
        stillBuy: checks.filter(c => c.stillBuy).length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
