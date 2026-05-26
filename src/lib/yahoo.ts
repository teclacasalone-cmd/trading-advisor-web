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

const YAHOO_BASE = "https://query1.finance.yahoo.com";

export async function getQuotes(tickers: string[]): Promise<QuoteData[]> {
  const symbols = tickers.join(",");
  const url = `${YAHOO_BASE}/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const results = data?.quoteResponse?.result || [];

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
}

export async function getHistory(ticker: string, range = "3mo", interval = "1d"): Promise<HistoryPoint[]> {
  const url = `${YAHOO_BASE}/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 300 },
  });

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

  // MACD semplificato (EMA12 - EMA26 direction)
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

export const WATCHLIST: Record<string, string[]> = {
  "Indici Mondiali": ["^GSPC", "^DJI", "^IXIC", "^STOXX50E", "^FTSE", "^GDAXI", "^FCHI", "FTSEMIB.MI", "^N225", "^HSI"],
  "FTSE MIB": [
    "ISP.MI", "UCG.MI", "ENI.MI", "ENEL.MI", "STLAM.MI", "RACE.MI",
    "G.MI", "MB.MI", "BAMI.MI", "TIT.MI", "PRY.MI", "SRG.MI",
    "CPR.MI", "LDO.MI", "A2A.MI", "HER.MI",
  ],
  "Top Azioni USA": ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "JPM", "V", "JNJ", "WMT", "PG", "UNH", "HD", "DIS"],
  "ETF Settoriali": ["XLK", "XLF", "XLE", "XLV", "XLI", "XLY", "XLP", "XLU", "XLRE", "XLC", "XLB"],
  "Crypto": ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "ADA-USD", "DOGE-USD", "AVAX-USD", "DOT-USD"],
  "Commodities": ["GC=F", "SI=F", "CL=F", "NG=F", "HG=F", "PL=F"],
  "Forex": ["EURUSD=X", "GBPUSD=X", "USDJPY=X", "USDCHF=X", "EURGBP=X", "EURJPY=X"],
  "Obbligazioni": ["^TNX", "^TYX", "^FVX", "^IRX"],
};

export const ASSET_NAMES: Record<string, string> = {
  // Settori ETF
  XLK: "Technology", XLF: "Financial", XLE: "Energy", XLV: "Healthcare",
  XLI: "Industrial", XLY: "Consumer Discr.", XLP: "Consumer Staples",
  XLU: "Utilities", XLRE: "Real Estate", XLC: "Communication", XLB: "Materials",
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
  "^N225": "Nikkei 225", "^HSI": "Hang Seng",
};

// Backward compat
export const SECTOR_NAMES = ASSET_NAMES;
