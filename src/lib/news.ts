export interface NewsItem {
  title: string;
  summary: string;
  link: string;
  source: string;
  published: string;
  sentiment: "POSITIVO" | "NEGATIVO" | "NEUTRO";
  score: number;
}

export interface SentimentSummary {
  overall: "BULLISH" | "BEARISH" | "NEUTRO";
  score: number;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

// Parole chiave per sentiment analysis semplice ma efficace
const POSITIVE_WORDS = new Set([
  "surge", "surges", "rally", "rallies", "gain", "gains", "rise", "rises", "jump", "jumps",
  "soar", "soars", "boost", "record", "high", "bull", "bullish", "optimism", "growth",
  "profit", "profits", "beat", "beats", "exceed", "exceeds", "upgrade", "recovery",
  "strong", "strength", "positive", "up", "higher", "best", "outperform", "breakout",
  "boom", "booming", "rebound", "rebounds", "advance", "advances",
]);

const NEGATIVE_WORDS = new Set([
  "crash", "crashes", "fall", "falls", "drop", "drops", "plunge", "plunges", "sink",
  "sinks", "decline", "declines", "loss", "losses", "bear", "bearish", "fear", "recession",
  "downturn", "sell", "selloff", "warning", "risk", "weak", "weakness", "negative",
  "down", "lower", "worst", "underperform", "collapse", "slump", "slumps", "tumble",
  "crisis", "default", "bankruptcy", "layoff", "layoffs", "cut", "cuts", "miss", "misses",
]);

function analyzeSentiment(text: string): { label: NewsItem["sentiment"]; score: number } {
  const words = text.toLowerCase().split(/\W+/);
  let pos = 0, neg = 0;

  for (const w of words) {
    if (POSITIVE_WORDS.has(w) || POSITIVE_WORDS_IT.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w) || NEGATIVE_WORDS_IT.has(w)) neg++;
  }

  const total = pos + neg;
  if (total === 0) return { label: "NEUTRO", score: 0 };

  const score = +((pos - neg) / total).toFixed(3);
  if (score > 0.15) return { label: "POSITIVO", score };
  if (score < -0.15) return { label: "NEGATIVO", score };
  return { label: "NEUTRO", score };
}

// RSS feeds finanziari — usiamo un parser RSS-to-JSON gratuito
// Parole italiane per sentiment
const POSITIVE_WORDS_IT = new Set([
  "rialzo", "crescita", "guadagno", "record", "boom", "ripresa", "ottimismo",
  "rally", "positivo", "forte", "surplus", "utile", "utili", "balzo", "rimbalzo",
  "massimo", "aumento", "acquisti", "fiducia", "espansione",
]);
const NEGATIVE_WORDS_IT = new Set([
  "ribasso", "calo", "crollo", "perdita", "crisi", "recessione", "panico",
  "negativo", "debole", "deficit", "vendite", "minimo", "rischio", "fuga",
  "contrazione", "allarme", "tensione", "guerra", "inflazione", "fallimento",
]);

const RSS_FEEDS: Record<string, string> = {
  "Il Sole 24 Ore": "https://www.ilsole24ore.com/rss/finanza.xml",
  "Il Sole 24 Ore Mercati": "https://www.ilsole24ore.com/rss/finanza--mercati.xml",
  "Yahoo Finance": "https://finance.yahoo.com/news/rssindex",
  "MarketWatch": "https://feeds.marketwatch.com/marketwatch/topstories/",
  "CNBC": "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
};

export async function fetchNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = [];

  for (const [source, feedUrl] of Object.entries(RSS_FEEDS)) {
    try {
      // Usa un servizio RSS-to-JSON gratuito
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
      const res = await fetch(apiUrl, { next: { revalidate: 300 } });

      if (!res.ok) continue;
      const data = await res.json();

      if (data.status !== "ok" || !data.items) continue;

      for (const item of data.items.slice(0, 10)) {
        const text = `${item.title || ""} ${item.description || ""}`;
        const { label, score } = analyzeSentiment(text);

        allNews.push({
          title: item.title || "",
          summary: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
          link: item.link || "",
          source,
          published: item.pubDate || "",
          sentiment: label,
          score,
        });
      }
    } catch {
      continue;
    }
  }

  return allNews.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
}

export function summarizeSentiment(news: NewsItem[]): SentimentSummary {
  if (news.length === 0) {
    return { overall: "NEUTRO", score: 0, positive: 0, negative: 0, neutral: 0, total: 0 };
  }

  const positive = news.filter(n => n.sentiment === "POSITIVO").length;
  const negative = news.filter(n => n.sentiment === "NEGATIVO").length;
  const neutral = news.filter(n => n.sentiment === "NEUTRO").length;
  const avgScore = +(news.reduce((sum, n) => sum + n.score, 0) / news.length).toFixed(3);

  let overall: SentimentSummary["overall"] = "NEUTRO";
  if (avgScore > 0.05) overall = "BULLISH";
  else if (avgScore < -0.05) overall = "BEARISH";

  return { overall, score: avgScore, positive, negative, neutral, total: news.length };
}

export async function getFearGreedIndex(): Promise<{ score: number; rating: string }> {
  try {
    const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 600 },
    });

    if (!res.ok) return { score: 0, rating: "N/A" };

    const data = await res.json();
    return {
      score: Math.round(data?.fear_and_greed?.score || 0),
      rating: data?.fear_and_greed?.rating || "N/A",
    };
  } catch {
    return { score: 0, rating: "N/A" };
  }
}
