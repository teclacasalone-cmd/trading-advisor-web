import { NextResponse } from "next/server";
import { generateFullReport } from "@/lib/advisor";
import { saveReport, savePredictions } from "@/lib/supabase";

export const maxDuration = 60;

export async function GET() {
  try {
    const report = await generateFullReport();

    // Salva in Supabase (non blocca se fallisce)
    try {
      const reportId = await saveReport({
        market_condition: report.marketCondition,
        fear_greed_score: report.fearGreed.score,
        vix: report.vix,
        sentiment: report.sentiment,
        ai_briefing: report.aiBriefing || "",
        summary: report.summary,
      });

      if (reportId && report.recommendations.length > 0) {
        await savePredictions(
          reportId,
          report.recommendations
            .filter((r: any) => r.action === "COMPRA" || r.action === "ASPETTA")
            .map((r: any) => ({
              ticker: r.ticker,
              name: r.name,
              action: r.action,
              price_at_prediction: r.currentPrice,
              target_price: r.targetPrice,
              stop_loss: r.stopLoss,
              expected_return: r.expectedReturn,
              confidence: r.confidence,
              reasons: r.reasons,
            }))
        );
      }
    } catch {}

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Errore generazione report", details: String(error) },
      { status: 500 }
    );
  }
}
