"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import FearGreedGauge from "@/components/FearGreedGauge";
import NewsCard from "@/components/NewsCard";
import SignalBadge from "@/components/SignalBadge";

const SectorChart = dynamic(() => import("@/components/SectorChart"), { ssr: false });

type Tab = "dashboard" | "signals" | "news" | "volumes" | "analyze";

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Trading Advisor</h1>
          <p className="text-xs text-gray-400">Dati in tempo reale da Yahoo Finance</p>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {(
            [
              ["dashboard", "Dashboard"],
              ["signals", "Segnali"],
              ["news", "News & Sentiment"],
              ["volumes", "Volume Scanner"],
              ["analyze", "Analisi Asset"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "signals" && <SignalsTab />}
        {tab === "news" && <NewsTab />}
        {tab === "volumes" && <VolumesTab />}
        {tab === "analyze" && <AnalyzeTab />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        Questo tool è solo a scopo informativo. Non è consulenza finanziaria.
      </footer>
    </div>
  );
}

function DashboardTab() {
  const [newsData, setNewsData] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [indices, setIndices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/news").then(r => r.json()),
      fetch("/api/sectors").then(r => r.json()),
      fetch("/api/market?category=Indici").then(r => r.json()),
    ]).then(([news, sec, idx]) => {
      setNewsData(news);
      setSectors(sec);
      setIndices(idx);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FearGreedGauge
          score={newsData?.fearGreed?.score || 0}
          rating={newsData?.fearGreed?.rating || "N/A"}
        />
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Sentiment Notizie</h3>
          <div className={`text-3xl font-bold ${
            newsData?.sentiment?.overall === "BULLISH" ? "text-green-600" :
            newsData?.sentiment?.overall === "BEARISH" ? "text-red-600" : "text-yellow-500"
          }`}>
            {newsData?.sentiment?.overall || "N/A"}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Score medio: {newsData?.sentiment?.score || 0}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>Positive: {newsData?.sentiment?.positive || 0}</span>
            <span>Negative: {newsData?.sentiment?.negative || 0}</span>
            <span>Neutre: {newsData?.sentiment?.neutral || 0}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Indici Principali</h3>
          <div className="space-y-2">
            {indices.map((idx: any) => (
              <div key={idx.ticker} className="flex justify-between items-center">
                <span className="text-sm font-medium">{idx.ticker.replace("^", "")}</span>
                <div className="text-right">
                  <span className="text-sm">{idx.price?.toLocaleString()}</span>
                  <span className={`ml-2 text-xs font-medium ${idx.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {idx.changePct >= 0 ? "+" : ""}{idx.changePct?.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-medium mb-4">Performance Settori (oggi)</h3>
        {sectors.length > 0 ? <SectorChart data={sectors} /> : <p className="text-gray-400">Nessun dato</p>}
      </div>
    </div>
  );
}

function SignalsTab() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signals")
      .then(r => r.json())
      .then(data => { setSignals(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Calcolo segnali tecnici..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Segnali Tecnici — Azioni & Crypto</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Ticker</th>
              <th className="px-4 py-3 text-left">Prezzo</th>
              <th className="px-4 py-3 text-left">RSI</th>
              <th className="px-4 py-3 text-left">Trend</th>
              <th className="px-4 py-3 text-left">Segnale</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Motivi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {signals.map((s: any) => (
              <tr key={s.ticker} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 font-medium">{s.ticker}</td>
                <td className="px-4 py-3">${s.price}</td>
                <td className={`px-4 py-3 ${s.rsi < 30 ? "text-green-600" : s.rsi > 70 ? "text-red-600" : ""}`}>
                  {s.rsi}
                </td>
                <td className="px-4 py-3 text-xs">{s.trend}</td>
                <td className="px-4 py-3"><SignalBadge signal={s.overallSignal} /></td>
                <td className={`px-4 py-3 font-bold ${s.score > 0 ? "text-green-600" : s.score < 0 ? "text-red-600" : ""}`}>
                  {s.score > 0 ? "+" : ""}{s.score}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                  {s.reasons?.slice(0, 2).join(" | ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewsTab() {
  const [newsData, setNewsData] = useState<any>(null);
  const [filter, setFilter] = useState("Tutti");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(data => { setNewsData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Analisi notizie..." />;

  const news = newsData?.news || [];
  const filtered = filter === "Tutti" ? news : news.filter((n: any) => n.sentiment === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold">News & Sentiment</h2>
        <div className="flex gap-2">
          {["Tutti", "POSITIVO", "NEGATIVO", "NEUTRO"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        {filtered.map((n: any, i: number) => (
          <NewsCard key={i} {...n} />
        ))}
        {filtered.length === 0 && <p className="text-gray-400">Nessuna notizia con questo filtro</p>}
      </div>
    </div>
  );
}

function VolumesTab() {
  const [category, setCategory] = useState("Top Azioni");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/market?category=${encodeURIComponent(category)}`)
      .then(r => r.json())
      .then(d => {
        const sorted = d.filter((q: any) => q.volRatio > 0).sort((a: any, b: any) => b.volRatio - a.volRatio);
        setData(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-bold">Volume Scanner — Dove entrano i soldi</h2>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
        >
          {["Top Azioni", "ETF Settoriali", "Crypto"].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Ticker</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Prezzo</th>
                <th className="px-4 py-3 text-left">Variazione %</th>
                <th className="px-4 py-3 text-left">Volume</th>
                <th className="px-4 py-3 text-left">Vol vs Media</th>
                <th className="px-4 py-3 text-left">Segnale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((q: any) => (
                <tr key={q.ticker} className={q.volRatio >= 1.5 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}>
                  <td className="px-4 py-3 font-medium">{q.ticker}</td>
                  <td className="px-4 py-3">{q.name}</td>
                  <td className="px-4 py-3">${q.price?.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${q.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {q.changePct >= 0 ? "+" : ""}{q.changePct?.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">{q.volume?.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-bold ${q.volRatio >= 1.5 ? "text-yellow-600" : ""}`}>
                    {q.volRatio}x
                  </td>
                  <td className="px-4 py-3">
                    {q.volRatio >= 1.5 ? (
                      <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">
                        ANOMALO
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Normale</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyzeTab() {
  const [ticker, setTicker] = useState("AAPL");
  const [input, setInput] = useState("AAPL");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyze = useCallback(() => {
    const t = input.toUpperCase().trim();
    if (!t) return;
    setTicker(t);
    setLoading(true);
    fetch(`/api/signals?ticker=${encodeURIComponent(t)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [input]);

  useEffect(() => { analyze(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Analisi Asset</h2>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && analyze()}
          placeholder="Ticker (es. AAPL, BTC-USD)"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm flex-1"
        />
        <button
          onClick={analyze}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          Analizza
        </button>
      </div>

      {loading && <LoadingSpinner text={`Analisi ${ticker}...`} />}

      {data?.signals && !loading && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h3 className="text-2xl font-bold">{data.signals.ticker}</h3>
              <SignalBadge signal={data.signals.overallSignal} />
              <span className="text-lg">${data.signals.price}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Stat label="RSI" value={data.signals.rsi} color={data.signals.rsi < 30 ? "green" : data.signals.rsi > 70 ? "red" : "gray"} />
              <Stat label="MACD" value={data.signals.macdSignal} color={data.signals.macdSignal === "POSITIVO" ? "green" : "red"} />
              <Stat label="Trend" value={data.signals.trend} />
              <Stat label="Score" value={data.signals.score > 0 ? `+${data.signals.score}` : data.signals.score} color={data.signals.score > 0 ? "green" : data.signals.score < 0 ? "red" : "gray"} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-500">Motivazioni:</h4>
              {data.signals.reasons?.map((r: string, i: number) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-300">- {r}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {data?.error && <p className="text-red-500">{data.error}</p>}
    </div>
  );
}

function LoadingSpinner({ text = "Caricamento..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
      <span className="text-gray-500">{text}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: any; color?: string }) {
  const colorClass = color === "green" ? "text-green-600" : color === "red" ? "text-red-600" : "text-gray-800 dark:text-gray-200";
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}
