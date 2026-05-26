import { NextResponse } from "next/server";
import { getReportHistory, getAccuracyStats } from "@/lib/supabase";

export async function GET() {
  try {
    const [reports, accuracy] = await Promise.all([
      getReportHistory(50),
      getAccuracyStats(),
    ]);

    return NextResponse.json({ reports, accuracy });
  } catch (error) {
    return NextResponse.json({ reports: [], accuracy: { total: 0, correct: 0, wrong: 0, accuracy: 0, avgReturn: 0 } });
  }
}
