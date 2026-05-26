import { NextResponse } from "next/server";
import { generateFullReport } from "@/lib/advisor";

export const maxDuration = 60;

export async function GET() {
  try {
    const report = await generateFullReport();
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { error: "Errore generazione report", details: String(error) },
      { status: 500 }
    );
  }
}
