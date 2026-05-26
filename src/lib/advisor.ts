import { getQuotes, getHistory, computeSignals, WATCHLIST, ASSET_NAMES, type QuoteData, type HistoryPoint, type TechnicalSignals } from "./yahoo";
import { fetchNews, summarizeSentiment, getFearGreedIndex } from "./news";

export interface Recommendation {
  ticker: string;
  name: string;
  action: "COMPRA" | "VENDI" | "TIENI" | "ASPETTA";
  confidence: number; // 0-100
  currentPrice: number;
  entryPrice: string; // prezzo consigliato di entrata
  targetPrice: number;
  stopLoss: number;
  expectedReturn: number; // %
  holdingPeriod: string;
  riskLevel: "BASSO" | "MEDIO" | "ALTO";
  reasons: string[];
  timing: string;
  sector: string;
}

export interface AdvisoryReport {
  date: string;
  marketCondition: string;
  fearGreed: { score: number; rating: string };
  sentiment: string;
  recommendations: Recommendation[];
  sectorsToWatch: { sector: string; trend: string; reason: string }[];
  avoidList: { ticker: string; reason: string }[];
  summary: string;
}

// Supporto e resistenza semplificati
function findSupport(history: HistoryPoint[]): number {
  const lows = history.slice(-20).map(h => h.low);
  return Math.min(...lows);
}

function findResistance(history: HistoryPoint[]): number {
  const highs = history.slice(-20).map(h => h.high);
  return Math.max(...highs);
}

// Volatilità (deviazione standard dei rendimenti)
function calcVolatility(history: HistoryPoint[]): number {
  const returns = [];
  for (let i = 1; i < history.length; i++) {
    returns.push((history[i].close - history[i - 1].close) / history[i - 1].close);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100; // annualizzata
}

// Trend degli ultimi N giorni
function trendStrength(history: HistoryPoint[], days: number): number {
  const slice = history.slice(-days);
  if (slice.length < 2) return 0;
  return ((slice[slice.length - 1].close - slice[0].close) / slice[0].close) * 100;
}

// Calcola performance per periodo
function calcPerformance(history: HistoryPoint[], days: number): number {
  if (history.length < days) return 0;
  const start = history[history.length - days].close;
  const end = history[history.length - 1].close;
  return ((end - start) / start) * 100;
}

function generateRecommendation(
  ticker: string,
  quote: QuoteData,
  signals: TechnicalSignals,
  history: HistoryPoint[],
  marketSentiment: string,
  fearGreedScore: number
): Recommendation | null {
  const price = quote.price;
  if (price <= 0 || history.length < 30) return null;

  const support = findSupport(history);
  const resistance = findResistance(history);
  const volatility = calcVolatility(history);
  const trend7d = trendStrength(history, 7);
  const trend30d = trendStrength(history, 30);
  const volRatio = quote.volRatio;

  let action: Recommendation["action"] = "TIENI";
  let confidence = 50;
  let targetPrice = price;
  let stopLoss = price;
  let holdingPeriod = "1-3 mesi";
  let entryPrice = `${price.toFixed(2)} (prezzo attuale)`;
  const reasons: string[] = [];
  let timing = "Valutare nei prossimi giorni";

  // === Logica di raccomandazione ===

  // COMPRA: segnale tecnico forte + condizioni favorevoli
  if (signals.score >= 2) {
    action = "COMPRA";
    confidence = 60 + Math.min(signals.score * 5, 25);

    // Target basato su resistenza e trend
    const upside = ((resistance - price) / price) * 100;
    if (upside > 3) {
      targetPrice = resistance;
    } else {
      // Se vicino a resistenza, target più alto basato su momentum
      targetPrice = price * (1 + (volatility / 100) * 0.5);
    }

    stopLoss = Math.max(support, price * 0.95); // max -5%

    if (signals.rsi < 35) {
      reasons.push(`RSI in zona ipervenduto (${signals.rsi}) — ottimo punto di ingresso`);
      confidence += 5;
      entryPrice = `${price.toFixed(2)} (entrare ora, RSI favorevole)`;
      timing = "Entrare ora o al prossimo ritracciamento";
    }

    if (volRatio > 1.3) {
      reasons.push(`Volume ${volRatio}x sopra la media — forte interesse compratori`);
      confidence += 5;
    }

    if (trend7d < -3 && trend30d > 0) {
      reasons.push("Ritracciamento a breve termine in trend rialzista — opportunità di acquisto");
      entryPrice = `${(price * 0.98).toFixed(2)} (aspettare leggero calo)`;
      timing = "Aspettare un piccolo ritracciamento per entrare";
    }

    if (marketSentiment === "BULLISH") {
      reasons.push("Sentiment di mercato positivo supporta il rialzo");
      confidence += 3;
    }

    if (fearGreedScore < 30) {
      reasons.push("Fear & Greed in Extreme Fear — storicamente ottimo momento per comprare");
      confidence += 5;
    }

  // ASPETTA: segnale positivo ma timing non ideale
  } else if (signals.score === 1) {
    action = "ASPETTA";
    confidence = 45;
    targetPrice = resistance;
    stopLoss = support;
    entryPrice = `${(support * 1.01).toFixed(2)} (aspettare test del supporto a ${support.toFixed(2)})`;
    timing = "Aspettare conferma: rottura resistenza o test supporto";
    reasons.push("Segnali misti — attendere conferma direzionale");

    if (trend30d > 5) {
      reasons.push(`Trend mensile positivo (+${trend30d.toFixed(1)}%) ma serve un pullback per entrare`);
    }

  // VENDI: segnale negativo
  } else if (signals.score <= -2) {
    action = "VENDI";
    confidence = 55 + Math.min(Math.abs(signals.score) * 5, 20);
    targetPrice = support;
    stopLoss = resistance;
    reasons.push("Indicatori tecnici negativi — ridurre esposizione");

    if (signals.rsi > 70) {
      reasons.push(`RSI ipercomprato (${signals.rsi}) — probabile correzione`);
      confidence += 5;
    }

    if (trend7d > 5 && signals.rsi > 65) {
      reasons.push("Rally recente insostenibile — prendere profitti");
      timing = "Vendere nelle prossime sessioni";
    }

    if (marketSentiment === "BEARISH") {
      reasons.push("Sentiment negativo aggiunge pressione ribassista");
      confidence += 3;
    }
  } else {
    // TIENI
    action = "TIENI";
    confidence = 40;
    targetPrice = resistance;
    stopLoss = support;
    reasons.push("Mercato laterale — mantenere posizione e monitorare");
    timing = "Nessuna azione richiesta, monitorare settimanalmente";
  }

  // Calcolo expected return
  const expectedReturn = +((targetPrice - price) / price * 100).toFixed(1);

  // Holding period basato su volatilità
  if (volatility > 40) {
    holdingPeriod = "1-2 settimane";
  } else if (volatility > 25) {
    holdingPeriod = "2-4 settimane";
  } else {
    holdingPeriod = "1-3 mesi";
  }

  // Risk level
  let riskLevel: Recommendation["riskLevel"] = "MEDIO";
  if (volatility > 40 || ticker.includes("-USD")) riskLevel = "ALTO";
  else if (volatility < 15) riskLevel = "BASSO";

  // Cap confidence
  confidence = Math.min(confidence, 90);

  // Aggiungi motivi tecnici
  for (const r of signals.reasons.slice(0, 2)) {
    if (!reasons.some(existing => existing.includes(r.split(" ")[0]))) {
      reasons.push(r);
    }
  }

  return {
    ticker,
    name: quote.name,
    action,
    confidence,
    currentPrice: price,
    entryPrice,
    targetPrice: +targetPrice.toFixed(2),
    stopLoss: +stopLoss.toFixed(2),
    expectedReturn,
    holdingPeriod,
    riskLevel,
    reasons,
    timing,
    sector: ASSET_NAMES[ticker] || "",
  };
}

export async function generateFullReport(): Promise<AdvisoryReport> {
  // 1. Dati di mercato
  const [newsItems, fearGreed] = await Promise.all([
    fetchNews(),
    getFearGreedIndex(),
  ]);

  const sentimentData = summarizeSentiment(newsItems);
  const marketSentiment = sentimentData.overall;

  // 2. Analisi di tutti i ticker (tutti i mercati)
  const allTickers = [
    ...WATCHLIST["Top Azioni USA"],
    ...WATCHLIST["FTSE MIB"],
    ...WATCHLIST["Crypto"],
    ...WATCHLIST["ETF Settoriali"],
    ...WATCHLIST["Commodities"],
    ...WATCHLIST["Forex"],
  ];
  const quotes = await getQuotes(allTickers);
  const quoteMap = new Map(quotes.map(q => [q.ticker, q]));

  const recommendations: Recommendation[] = [];
  const avoidList: { ticker: string; reason: string }[] = [];

  for (const ticker of allTickers) {
    const quote = quoteMap.get(ticker);
    if (!quote || quote.price <= 0) continue;

    try {
      const history = await getHistory(ticker);
      if (history.length < 30) continue;

      const signals = computeSignals(ticker, history);
      const rec = generateRecommendation(ticker, quote, signals, history, marketSentiment, fearGreed.score);

      if (rec) {
        if (rec.action === "VENDI" && rec.confidence > 60) {
          avoidList.push({ ticker, reason: rec.reasons[0] || "Segnali negativi" });
        }
        recommendations.push(rec);
      }
    } catch {
      continue;
    }
  }

  // Ordina: COMPRA prima (per confidence), poi ASPETTA, poi TIENI, poi VENDI
  const actionOrder = { COMPRA: 0, ASPETTA: 1, TIENI: 2, VENDI: 3 };
  recommendations.sort((a, b) => {
    const orderDiff = actionOrder[a.action] - actionOrder[b.action];
    if (orderDiff !== 0) return orderDiff;
    return b.confidence - a.confidence;
  });

  // 3. Settori da osservare
  const sectorQuotes = await getQuotes(WATCHLIST["ETF Settoriali"]);
  const sectorsToWatch = sectorQuotes
    .filter(q => Math.abs(q.changePct) > 0.5)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 5)
    .map(q => ({
      sector: ASSET_NAMES[q.ticker] || q.ticker,
      trend: q.changePct > 0 ? "RIALZO" : "RIBASSO",
      reason: q.changePct > 0
        ? `+${q.changePct.toFixed(1)}% oggi, volume ${q.volRatio}x`
        : `${q.changePct.toFixed(1)}% oggi, possibile debolezza`,
    }));

  // 4. Market condition summary
  let marketCondition = "NEUTRO";
  if (fearGreed.score > 60 && marketSentiment === "BULLISH") {
    marketCondition = "RIALZISTA — Buon momento per posizionarsi";
  } else if (fearGreed.score < 35 && marketSentiment === "BEARISH") {
    marketCondition = "RIBASSISTA — Cautela, ma possibili opportunità contrarian";
  } else if (fearGreed.score < 25) {
    marketCondition = "PANICO — Storicamente ottimo per acquisti di lungo periodo";
  } else if (fearGreed.score > 75) {
    marketCondition = "EUFORIA — Attenzione, possibile correzione in arrivo";
  } else {
    marketCondition = "STABILE — Selezionare singoli titoli con segnali forti";
  }

  // 5. Summary
  const buys = recommendations.filter(r => r.action === "COMPRA");
  const sells = recommendations.filter(r => r.action === "VENDI");

  let summary = `Analisi completata su ${recommendations.length} asset. `;
  if (buys.length > 0) {
    summary += `${buys.length} opportunità di acquisto identificate (top: ${buys.slice(0, 3).map(b => b.ticker).join(", ")}). `;
  }
  if (sells.length > 0) {
    summary += `${sells.length} asset da vendere/evitare. `;
  }
  summary += `Mercato: ${marketCondition.split("—")[0].trim()}, Fear & Greed: ${fearGreed.score}/100.`;

  return {
    date: new Date().toISOString(),
    marketCondition,
    fearGreed,
    sentiment: marketSentiment,
    recommendations,
    sectorsToWatch,
    avoidList,
    summary,
  };
}
