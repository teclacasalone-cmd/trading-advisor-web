import { NextResponse } from "next/server";
import { fetchNews, summarizeSentiment, getFearGreedIndex } from "@/lib/news";

export async function GET() {
  const [news, fearGreed] = await Promise.all([
    fetchNews(),
    getFearGreedIndex(),
  ]);

  const sentiment = summarizeSentiment(news);

  return NextResponse.json({ news, sentiment, fearGreed });
}
