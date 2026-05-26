export interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  avgVolume: number;
  volRatio: number;
  high52w: number;
  low52w: number;
  marketCap: number;
}

export interface AnalystData {
  targetPrice: number;
  targetHigh: number;
  targetLow: number;
  recommendation: string; // buy, hold, sell, strong_buy, etc.
  numAnalysts: number;
  upside: number; // % rispetto al prezzo attuale
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalSignals {
  ticker: string;
  price: number;
  rsi: number;
  macdSignal: string;
  trend: string;
  volumeSignal: string;
  overallSignal: "FORTE ACQUISTO" | "ACQUISTO" | "NEUTRO" | "VENDITA" | "FORTE VENDITA";
  score: number;
  reasons: string[];
}

// Headers che funzionano da server cloud
const YAHOO_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json,text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Cache-Control": "no-cache",
};

// Primo metodo: Yahoo Finance v8 chart API (più affidabile da cloud)
async function getQuoteFromChart(ticker: string): Promise<QuoteData | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1mo&interval=1d&includePrePost=false`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 120 } });
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    if (!meta || !quotes) return null;

    const volumes = (quotes.volume || []).filter((v: number | null) => v != null);
    const lastVol = volumes.length > 0 ? volumes[volumes.length - 1] : 0;
    const avgVol = volumes.length > 5 ? volumes.slice(0, -1).reduce((a: number, b: number) => a + b, 0) / (volumes.length - 1) : lastVol || 1;

    return {
      ticker: meta.symbol || ticker,
      name: meta.shortName || meta.symbol || ticker,
      price: meta.regularMarketPrice || 0,
      change: (meta.regularMarketPrice || 0) - (meta.previousClose || meta.chartPreviousClose || 0),
      changePct: meta.previousClose ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 : 0,
      volume: lastVol,
      avgVolume: avgVol,
      volRatio: avgVol > 0 ? +(lastVol / avgVol).toFixed(2) : 1,
      high52w: meta.fiftyTwoWeekHigh || 0,
      low52w: meta.fiftyTwoWeekLow || 0,
      marketCap: 0,
    };
  } catch {
    return null;
  }
}

// Secondo metodo: Yahoo Finance v6 quoteSummary
async function getQuoteFromSummary(ticker: string): Promise<QuoteData | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v6/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=price`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 120 } });
    if (!res.ok) return null;

    const data = await res.json();
    const price = data?.quoteSummary?.result?.[0]?.price;
    if (!price) return null;

    return {
      ticker: price.symbol || ticker,
      name: price.shortName || price.symbol || ticker,
      price: price.regularMarketPrice?.raw || 0,
      change: price.regularMarketChange?.raw || 0,
      changePct: price.regularMarketChangePercent?.raw ? price.regularMarketChangePercent.raw * 100 : 0,
      volume: price.regularMarketVolume?.raw || 0,
      avgVolume: price.averageDailyVolume10Day?.raw || 1,
      volRatio: price.averageDailyVolume10Day?.raw ? +(price.regularMarketVolume?.raw / price.averageDailyVolume10Day.raw).toFixed(2) : 1,
      high52w: 0,
      low52w: 0,
      marketCap: price.marketCap?.raw || 0,
    };
  } catch {
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<QuoteData[]> {
  // Prova prima il batch v7, poi fallback uno per uno con v8 chart
  const batchResult = await getQuotesBatch(tickers);
  if (batchResult.length > 0) return batchResult;

  // Fallback: uno per uno con chart API
  const results: QuoteData[] = [];
  for (const ticker of tickers) {
    const quote = await getQuoteFromChart(ticker) || await getQuoteFromSummary(ticker);
    if (quote && quote.price > 0) results.push(quote);
  }
  return results;
}

async function getQuotesBatch(tickers: string[]): Promise<QuoteData[]> {
  try {
    const symbols = tickers.join(",");
    // Prova query2 invece di query1
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 60 } });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.quoteResponse?.result || [];
    if (results.length === 0) return [];

    return results.map((q: any) => ({
      ticker: q.symbol,
      name: q.shortName || q.symbol,
      price: q.regularMarketPrice || 0,
      change: q.regularMarketChange || 0,
      changePct: q.regularMarketChangePercent || 0,
      volume: q.regularMarketVolume || 0,
      avgVolume: q.averageDailyVolume10Day || 1,
      volRatio: q.regularMarketVolume && q.averageDailyVolume10Day
        ? +(q.regularMarketVolume / q.averageDailyVolume10Day).toFixed(2)
        : 1,
      high52w: q.fiftyTwoWeekHigh || 0,
      low52w: q.fiftyTwoWeekLow || 0,
      marketCap: q.marketCap || 0,
    }));
  } catch {
    return [];
  }
}

export async function getHistory(ticker: string, range = "3mo", interval = "1d"): Promise<HistoryPoint[]> {
  try {
    // Usa query2 che è più permissivo
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=false`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp || [];
    const ohlcv = result.indicators?.quote?.[0] || {};

    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      open: +(ohlcv.open?.[i] || 0).toFixed(2),
      high: +(ohlcv.high?.[i] || 0).toFixed(2),
      low: +(ohlcv.low?.[i] || 0).toFixed(2),
      close: +(ohlcv.close?.[i] || 0).toFixed(2),
      volume: ohlcv.volume?.[i] || 0,
    })).filter((p: HistoryPoint) => p.close > 0);
  } catch {
    return [];
  }
}

// Calcolo RSI
function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;

  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return +(100 - 100 / (1 + rs)).toFixed(1);
}

// SMA
function sma(data: number[], period: number): number {
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function computeSignals(ticker: string, history: HistoryPoint[]): TechnicalSignals {
  const closes = history.map(h => h.close);
  const volumes = history.map(h => h.volume);
  const reasons: string[] = [];
  let score = 0;

  const price = closes[closes.length - 1];
  const rsi = calcRSI(closes);

  // RSI
  if (rsi < 30) { score += 2; reasons.push(`RSI ipervenduto (${rsi})`); }
  else if (rsi < 40) { score += 1; reasons.push(`RSI basso (${rsi})`); }
  else if (rsi > 70) { score -= 2; reasons.push(`RSI ipercomprato (${rsi})`); }
  else if (rsi > 60) { score -= 1; reasons.push(`RSI alto (${rsi})`); }

  // SMA trend
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  let trend = "LATERALE";

  if (price > sma20 && sma20 > sma50) {
    score += 2; trend = "RIALZISTA";
    reasons.push("Prezzo sopra SMA20 e SMA50 (trend rialzista)");
  } else if (price < sma20 && sma20 < sma50) {
    score -= 2; trend = "RIBASSISTA";
    reasons.push("Prezzo sotto SMA20 e SMA50 (trend ribassista)");
  } else if (price > sma20) {
    score += 1; trend = "MODERATO RIALZO";
    reasons.push("Prezzo sopra SMA20");
  } else {
    score -= 1; trend = "MODERATO RIBASSO";
    reasons.push("Prezzo sotto SMA20");
  }

  // MACD semplificato
  const ema12 = sma(closes, 12);
  const ema26 = sma(closes, 26);
  const macdVal = ema12 - ema26;
  const macdSignal = macdVal > 0 ? "POSITIVO" : "NEGATIVO";
  if (macdVal > 0) { score += 1; reasons.push("MACD positivo (momentum rialzista)"); }
  else { score -= 1; reasons.push("MACD negativo (momentum ribassista)"); }

  // Volume
  const volNow = volumes[volumes.length - 1];
  const volAvg = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volRatio = volAvg > 0 ? volNow / volAvg : 1;
  let volumeSignal = "NORMALE";
  if (volRatio > 1.5) {
    volumeSignal = "ALTO";
    reasons.push(`Volume ${volRatio.toFixed(1)}x sopra la media`);
  }

  // Segnale finale
  let overallSignal: TechnicalSignals["overallSignal"];
  if (score >= 3) overallSignal = "FORTE ACQUISTO";
  else if (score >= 1) overallSignal = "ACQUISTO";
  else if (score <= -3) overallSignal = "FORTE VENDITA";
  else if (score <= -1) overallSignal = "VENDITA";
  else overallSignal = "NEUTRO";

  return { ticker, price, rsi, macdSignal, trend, volumeSignal, overallSignal, score, reasons };
}

// Dati analisti (consensus broker — stessi dati di Fineco)
export async function getAnalystData(ticker: string): Promise<AnalystData | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v6/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=financialData`;
    const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const fd = data?.quoteSummary?.result?.[0]?.financialData;
    if (!fd) return null;

    const targetPrice = fd.targetMeanPrice?.raw || 0;
    const currentPrice = fd.currentPrice?.raw || 0;
    const recommendation = fd.recommendationKey || "none";
    const numAnalysts = fd.numberOfAnalystOpinions?.raw || 0;

    if (targetPrice === 0 || currentPrice === 0 || numAnalysts === 0) return null;

    return {
      targetPrice: +targetPrice.toFixed(2),
      targetHigh: +(fd.targetHighPrice?.raw || targetPrice).toFixed(2),
      targetLow: +(fd.targetLowPrice?.raw || targetPrice).toFixed(2),
      recommendation,
      numAnalysts,
      upside: +((targetPrice - currentPrice) / currentPrice * 100).toFixed(1),
    };
  } catch {
    return null;
  }
}

export const WATCHLIST: Record<string, string[]> = {
  "Indici Mondiali": ["^GSPC", "^DJI", "^IXIC", "^STOXX50E", "^FTSE", "^GDAXI", "^FCHI", "FTSEMIB.MI", "^N225", "^HSI", "^VIX"],
  "FTSE MIB": [
    "ISP.MI", "UCG.MI", "ENI.MI", "ENEL.MI", "STLAM.MI", "RACE.MI",
    "G.MI", "MB.MI", "BAMI.MI", "TIT.MI", "PRY.MI", "SRG.MI",
    "CPR.MI", "LDO.MI", "A2A.MI", "HER.MI",
  ],
  "Azioni Accessibili": [
    // USA sotto $100
    "F", "BAC", "INTC", "PLTR", "SNAP", "SOFI", "NIO", "RIVN",
    "T", "PFE", "CSCO", "KO", "PEP", "MRK", "ABBV", "PYPL",
    // Italia sotto €100 (la maggior parte del FTSE MIB)
    "ISP.MI", "ENI.MI", "ENEL.MI", "STLAM.MI", "BAMI.MI", "TIT.MI",
    "A2A.MI", "HER.MI", "LDO.MI", "SRG.MI",
    // ETF economici
    "VWCE.DE", "IWDA.AS", "SPY5.DE",
  ],
  "Top Azioni USA": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "JNJ", "WMT", "PG", "UNH", "HD", "DIS"],
  "ETF Settoriali": ["XLK", "XLF", "XLE", "XLV", "XLI", "XLY", "XLP", "XLU", "XLRE", "XLC", "XLB"],
  "Crypto": ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "ADA-USD", "DOGE-USD", "AVAX-USD", "DOT-USD", "LINK-USD", "MATIC-USD"],
  "Commodities": ["GC=F", "SI=F", "CL=F", "NG=F", "HG=F", "PL=F"],
  "Forex": ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "USDCHF=X", "EURGBP=X", "EURJPY=X"],
  "Obbligazioni": ["^TNX", "^TYX", "^FVX", "^IRX"],
};

export const ASSET_NAMES: Record<string, string> = {
  // Settori ETF
  XLK: "Technology", XLF: "Financial", XLE: "Energy", XLV: "Healthcare",
  XLI: "Industrial", XLY: "Consumer Discr.", XLP: "Consumer Staples",
  XLU: "Utilities", XLRE: "Real Estate", XLC: "Communication", XLB: "Materials",
  // Azioni accessibili USA
  F: "Ford", BAC: "Bank of America", INTC: "Intel", PLTR: "Palantir",
  SNAP: "Snap", SOFI: "SoFi", NIO: "NIO", RIVN: "Rivian",
  T: "AT&T", PFE: "Pfizer", CSCO: "Cisco", KO: "Coca-Cola",
  PEP: "PepsiCo", MRK: "Merck", ABBV: "AbbVie", PYPL: "PayPal",
  // ETF europei
  "VWCE.DE": "Vanguard FTSE All-World", "IWDA.AS": "iShares MSCI World", "SPY5.DE": "SPDR S&P 500 EUR",
  // FTSE MIB
  "ISP.MI": "Intesa Sanpaolo", "UCG.MI": "UniCredit", "ENI.MI": "ENI",
  "ENEL.MI": "Enel", "STLAM.MI": "Stellantis", "RACE.MI": "Ferrari",
  "G.MI": "Generali", "MB.MI": "Mediobanca", "BAMI.MI": "Banco BPM",
  "TIT.MI": "Telecom Italia", "PRY.MI": "Prysmian", "SRG.MI": "Snam",
  "CPR.MI": "Campari", "LDO.MI": "Leonardo", "A2A.MI": "A2A", "HER.MI": "Hera",
  // Commodities
  "GC=F": "Oro", "SI=F": "Argento", "CL=F": "Petrolio WTI",
  "NG=F": "Gas Naturale", "HG=F": "Rame", "PL=F": "Platino",
  // Forex
  "EURUSD=X": "EUR/USD", "GBPUSD=X": "GBP/USD", "USDJPY=X": "USD/JPY",
  "USDCHF=X": "USD/CHF", "EURGBP=X": "EUR/GBP", "EURJPY=X": "EUR/JPY",
  // Obbligazioni
  "^TNX": "Treasury 10Y", "^TYX": "Treasury 30Y", "^FVX": "Treasury 5Y", "^IRX": "Treasury 3M",
  // Indici
  "^GSPC": "S&P 500", "^DJI": "Dow Jones", "^IXIC": "Nasdaq", "^STOXX50E": "Euro Stoxx 50",
  "^FTSE": "FTSE 100", "^GDAXI": "DAX", "^FCHI": "CAC 40", "FTSEMIB.MI": "FTSE MIB",
  "^N225": "Nikkei 225", "^HSI": "Hang Seng", "^VIX": "VIX (Volatilità)",
};

// Backward compat
export const SECTOR_NAMES = ASSET_NAMES;
