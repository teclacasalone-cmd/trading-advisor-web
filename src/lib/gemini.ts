const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function askGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) return "";

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!res.ok) return "";

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
}

export async function generateMarketBriefing(
  fearGreedScore: number,
  fearGreedRating: string,
  newsSentiment: string,
  topNews: string[],
  sectorPerformance: string[],
  buySignals: string[],
  sellSignals: string[],
): Promise<string> {
  const prompt = `Sei un consulente finanziario esperto. Analizza questi dati di mercato e scrivi un briefing conciso in italiano (max 300 parole) con consigli pratici.

DATI DI MERCATO OGGI:
- Fear & Greed Index: ${fearGreedScore}/100 (${fearGreedRating})
- Sentiment notizie: ${newsSentiment}

NOTIZIE PRINCIPALI:
${topNews.slice(0, 8).map((n, i) => `${i + 1}. ${n}`).join("\n")}

PERFORMANCE SETTORI:
${sectorPerformance.join(", ")}

SEGNALI DI ACQUISTO:
${buySignals.length > 0 ? buySignals.join(", ") : "Nessuno forte"}

SEGNALI DI VENDITA:
${sellSignals.length > 0 ? sellSignals.join(", ") : "Nessuno forte"}

Scrivi il briefing con:
1. SITUAZIONE MERCATO: cosa sta succedendo oggi e perché
2. OPPORTUNITÀ: dove entrare e perché (con motivazione dalle notizie)
3. RISCHI: cosa evitare e perché
4. STRATEGIA CONSIGLIATA: cosa fare questa settimana

Sii diretto e pratico. Parla in prima persona come un consulente che si rivolge al cliente.`;

  return askGemini(prompt);
}

export async function analyzeNewsWithAI(headlines: string[]): Promise<string> {
  if (headlines.length === 0) return "";

  const prompt = `Sei un analista finanziario. Analizza queste notizie e spiega in italiano (max 200 parole) come impattano i mercati. Sii pratico: cosa significano per chi investe?

NOTIZIE:
${headlines.slice(0, 10).map((h, i) => `${i + 1}. ${h}`).join("\n")}

Rispondi con:
- IMPATTO PRINCIPALE: qual è la notizia più rilevante e perché
- SETTORI COINVOLTI: quali settori beneficiano o soffrono
- AZIONE SUGGERITA: cosa fare in base a queste notizie`;

  return askGemini(prompt);
}

export async function explainRecommendation(
  ticker: string,
  action: string,
  price: number,
  targetPrice: number,
  reasons: string[],
  recentNews: string[],
): Promise<string> {
  const prompt = `Sei un consulente finanziario. Spiega in italiano (max 150 parole) perché consigli di ${action} ${ticker} a $${price} con target $${targetPrice}.

INDICATORI TECNICI:
${reasons.join("\n")}

NOTIZIE RECENTI SU QUESTO ASSET:
${recentNews.length > 0 ? recentNews.join("\n") : "Nessuna notizia specifica"}

Spiega in modo semplice perché questa è una buona operazione, quali sono i rischi, e quando uscire. Parla come un consulente che spiega al cliente.`;

  return askGemini(prompt);
}
