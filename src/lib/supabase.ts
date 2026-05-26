const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";

async function supaFetch(path: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...options.headers,
    },
  });

  if (!res.ok) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// === REPORTS ===
export async function saveReport(report: {
  market_condition: string;
  fear_greed_score: number;
  vix: number;
  sentiment: string;
  ai_briefing: string;
  summary: string;
}): Promise<string | null> {
  const data = await supaFetch("reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
  return data?.[0]?.id || null;
}

// === PREDICTIONS ===
export async function savePredictions(reportId: string, predictions: {
  ticker: string;
  name: string;
  action: string;
  price_at_prediction: number;
  target_price: number;
  stop_loss: number;
  expected_return: number;
  confidence: number;
  reasons: string[];
}[]) {
  const rows = predictions.map(p => ({ ...p, report_id: reportId }));
  await supaFetch("predictions", {
    method: "POST",
    body: JSON.stringify(rows),
  });
}

// === STRATEGY CHECKS ===
export async function saveStrategyChecks(checks: {
  ticker: string;
  reference_price: number;
  current_price: number;
  change_pct: number;
  status: string;
  still_buy: boolean;
}[]) {
  await supaFetch("strategy_checks", {
    method: "POST",
    body: JSON.stringify(checks),
  });
}

// === VERIFY OLD PREDICTIONS ===
export async function getUnverifiedPredictions(): Promise<any[]> {
  const data = await supaFetch(
    "predictions?verified_at=is.null&order=created_at.desc&limit=100",
    { method: "GET" }
  );
  return data || [];
}

export async function verifyPrediction(id: string, currentPrice: number, priceAtPrediction: number, targetPrice: number, stopLoss: number) {
  const actualReturn = ((currentPrice - priceAtPrediction) / priceAtPrediction) * 100;

  // Una previsione è corretta se:
  // - COMPRA/ACQUISTO e il prezzo è salito (o raggiunto target)
  // - VENDI e il prezzo è sceso
  // - ASPETTA e il prezzo non si è mosso molto
  let correct = false;
  if (actualReturn > 0) correct = true; // salito = previsione buy corretta
  if (currentPrice >= targetPrice) correct = true; // target raggiunto
  if (currentPrice <= stopLoss) correct = false; // stop loss toccato

  await supaFetch(`predictions?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      verified_at: new Date().toISOString(),
      price_at_verification: currentPrice,
      actual_return: +actualReturn.toFixed(2),
      prediction_correct: correct,
    }),
  });

  return { actualReturn: +actualReturn.toFixed(2), correct };
}

// === STORICO E ACCURATEZZA ===
export async function getAccuracyStats(): Promise<{
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
  avgReturn: number;
}> {
  const verified = await supaFetch(
    "predictions?verified_at=not.is.null&select=prediction_correct,actual_return",
    { method: "GET" }
  );

  if (!verified || verified.length === 0) {
    return { total: 0, correct: 0, wrong: 0, accuracy: 0, avgReturn: 0 };
  }

  const correct = verified.filter((p: any) => p.prediction_correct).length;
  const avgReturn = verified.reduce((sum: number, p: any) => sum + (p.actual_return || 0), 0) / verified.length;

  return {
    total: verified.length,
    correct,
    wrong: verified.length - correct,
    accuracy: +(correct / verified.length * 100).toFixed(1),
    avgReturn: +avgReturn.toFixed(2),
  };
}

export async function getReportHistory(limit = 20): Promise<any[]> {
  const data = await supaFetch(
    `reports?order=created_at.desc&limit=${limit}`,
    { method: "GET" }
  );
  return data || [];
}
