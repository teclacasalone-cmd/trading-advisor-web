"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import FearGreedGauge from "@/components/FearGreedGauge";
import NewsCard from "@/components/NewsCard";
import SignalBadge from "@/components/SignalBadge";

const SectorChart = dynamic(() => import("@/components/SectorChart"), { ssr: false });
const TradingViewChart = dynamic(() => import("@/components/TradingViewChart"), { ssr: false });
const TradingViewTicker = dynamic(() => import("@/components/TradingViewTicker"), { ssr: false });
const TradingViewHeatmap = dynamic(() => import("@/components/TradingViewHeatmap"), { ssr: false });

type Tab = "advisory" | "mercati" | "signals" | "news" | "volumes" | "analyze";

const CATEGORIES = [
  "Top Azioni USA", "FTSE MIB", "Crypto", "ETF Settoriali",
  "Commodities", "Forex", "Obbligazioni", "Indici Mondiali",
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("advisory");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Ticker tape */}
      <TradingViewTicker />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Trading Advisor</h1>
          <p className="text-xs text-gray-400">Il tuo consulente finanziario AI</p>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 pb-2 overflow-x-auto">
          {(
            [
              ["advisory", "Cosa Comprare"],
              ["mercati", "Mercati & Grafici"],
              ["signals", "Tutti i Segnali"],
              ["news", "News & Sentiment"],
              ["volumes", "Volume Scanner"],
              ["analyze", "Analisi Asset"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
        {tab === "advisory" && <AdvisoryTab />}
        {tab === "mercati" && <MercatiTab />}
        {tab === "signals" && <SignalsTab />}
        {tab === "news" && <NewsTab />}
        {tab === "volumes" && <VolumesTab />}
        {tab === "analyze" && <AnalyzeTab />}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 px-4">
        Questo tool è solo a scopo informativo e didattico. Non è consulenza finanziaria professionale. Investi solo ciò che puoi permetterti di perdere.
      </footer>
    </div>
  );
}

// === ADVISORY — COSA COMPRARE ===
function AdvisoryTab() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const generate = () => {
    setLoading(true);
    setError("");
    fetch("/api/advisory")
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setReport(data);
        setLoading(false);
      })
      .catch(() => { setError("Errore di rete"); setLoading(false); });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-2">Cosa comprare oggi?</h2>
        <p className="text-sm text-gray-500 mb-4">
          Analisi di <strong>tutti i mercati</strong>: azioni USA, FTSE MIB (Italia), crypto, commodities, forex.
          Per ogni asset: cosa fare, quando, per quanto tempo, e quanto puoi guadagnare.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analisi in corso... (1-2 minuti)" : "Genera Raccomandazioni"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Sto analizzando tutti i mercati...</p>
          <p className="text-xs text-gray-400 mt-1">USA, Italia, Crypto, Commodities, Forex — indicatori tecnici + notizie + sentiment</p>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Stato del mercato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FearGreedGauge score={report.fearGreed.score} rating={report.fearGreed.rating} />
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Condizione Mercato</h3>
              <p className="text-lg font-bold">{report.marketCondition}</p>
              <p className={`text-sm mt-2 font-medium ${
                report.sentiment === "BULLISH" ? "text-green-600" :
                report.sentiment === "BEARISH" ? "text-red-600" : "text-yellow-500"
              }`}>
                Sentiment: {report.sentiment}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Riepilogo</h3>
              <p className="text-sm">{report.summary}</p>
              <p className="text-xs text-gray-400 mt-2">
                Aggiornato: {new Date(report.date).toLocaleString("it-IT")}
              </p>
            </div>
          </div>

          {/* COMPRA */}
          <RecSection
            title="COMPRA — Opportunit&agrave; identificate"
            color="text-green-600"
            recs={report.recommendations.filter((r: any) => r.action === "COMPRA")}
            onSelect={setSelectedTicker}
          />

          {/* ASPETTA */}
          <RecSection
            title="ASPETTA — Monitorare per ingresso"
            color="text-yellow-600"
            recs={report.recommendations.filter((r: any) => r.action === "ASPETTA")}
            onSelect={setSelectedTicker}
          />

          {/* Grafico TradingView se selezionato */}
          {selectedTicker && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Grafico: {selectedTicker}</h3>
                <button onClick={() => setSelectedTicker(null)} className="text-sm text-gray-400 hover:text-gray-600">Chiudi</button>
              </div>
              <TradingViewChart symbol={tvSymbol(selectedTicker)} height={500} />
            </div>
          )}

          {/* EVITARE */}
          {report.avoidList.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-3 text-red-600">DA EVITARE</h3>
              <div className="space-y-2">
                {report.avoidList.map((item: any) => (
                  <div key={item.ticker} className="flex items-center gap-3">
                    <span className="font-bold text-red-600">{item.ticker}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settori */}
          {report.sectorsToWatch.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-3">Settori da osservare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.sectorsToWatch.map((s: any) => (
                  <div key={s.sector} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                    <span className="font-medium">{s.sector}</span>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${s.trend === "RIALZO" ? "text-green-600" : "text-red-600"}`}>
                        {s.trend}
                      </span>
                      <p className="text-xs text-gray-400">{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecSection({ title, color, recs, onSelect }: { title: string; color: string; recs: any[]; onSelect: (t: string) => void }) {
  if (recs.length === 0) return null;
  return (
    <div>
      <h3 className={`text-lg font-bold mb-3 ${color}`}>{title.replace("&agrave;", "à")}</h3>
      <div className="grid gap-4">
        {recs.map((rec: any) => (
          <RecommendationCard key={rec.ticker} rec={rec} onChartClick={() => onSelect(rec.ticker)} />
        ))}
      </div>
    </div>
  );
}

// === MERCATI & GRAFICI ===
function MercatiTab() {
  const [selectedSymbol, setSelectedSymbol] = useState("NASDAQ:AAPL");
  const [heatmapExchange, setHeatmapExchange] = useState("SPX500");

  const quickSymbols = [
    { label: "S&P 500", symbol: "FOREXCOM:SPXUSD" },
    { label: "FTSE MIB", symbol: "INDEX:FTSEMIB" },
    { label: "DAX", symbol: "INDEX:DEU40" },
    { label: "Bitcoin", symbol: "BITSTAMP:BTCUSD" },
    { label: "Ethereum", symbol: "BITSTAMP:ETHUSD" },
    { label: "Oro", symbol: "TVC:GOLD" },
    { label: "Petrolio", symbol: "NYMEX:CL1!" },
    { label: "EUR/USD", symbol: "FOREXCOM:EURUSD" },
    { label: "Apple", symbol: "NASDAQ:AAPL" },
    { label: "NVIDIA", symbol: "NASDAQ:NVDA" },
    { label: "Tesla", symbol: "NASDAQ:TSLA" },
    { label: "Intesa SP", symbol: "MIL:ISP" },
    { label: "UniCredit", symbol: "MIL:UCG" },
    { label: "Ferrari", symbol: "MIL:RACE" },
    { label: "ENI", symbol: "MIL:ENI" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-bold mb-3">Grafico Interattivo</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {quickSymbols.map(s => (
            <button
              key={s.symbol}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedSymbol === s.symbol
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <TradingViewChart symbol={selectedSymbol} height={550} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Heatmap Mercato</h2>
          <select
            value={heatmapExchange}
            onChange={e => setHeatmapExchange(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="SPX500">S&P 500</option>
            <option value="NASDAQ100">Nasdaq 100</option>
            <option value="MIL">Borsa Italiana</option>
            <option value="XETR">DAX (Germania)</option>
            <option value="LSE">FTSE (Londra)</option>
          </select>
        </div>
        <TradingViewHeatmap exchange={heatmapExchange} height={500} />
      </div>
    </div>
  );
}

// === SIGNALS ===
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
                <td className={`px-4 py-3 ${s.rsi < 30 ? "text-green-600" : s.rsi > 70 ? "text-red-600" : ""}`}>{s.rsi}</td>
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

// === NEWS ===
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

// === VOLUMES ===
function VolumesTab() {
  const [category, setCategory] = useState("Top Azioni USA");
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
          {CATEGORIES.map(c => (
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
                  <td className="px-4 py-3">{q.price?.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${q.changePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {q.changePct >= 0 ? "+" : ""}{q.changePct?.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">{q.volume?.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-bold ${q.volRatio >= 1.5 ? "text-yellow-600" : ""}`}>
                    {q.volRatio}x
                  </td>
                  <td className="px-4 py-3">
                    {q.volRatio >= 1.5 ? (
                      <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded text-xs font-medium">ANOMALO</span>
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

// === ANALYZE ===
function AnalyzeTab() {
  const [input, setInput] = useState("AAPL");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const analyze = useCallback(() => {
    const t = input.toUpperCase().trim();
    if (!t) return;
    setLoading(true);
    setShowChart(false);
    fetch(`/api/signals?ticker=${encodeURIComponent(t)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); setShowChart(true); })
      .catch(() => setLoading(false));
  }, [input]);

  useEffect(() => { analyze(); }, []);

  const ticker = input.toUpperCase().trim();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Analisi Asset</h2>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && analyze()}
          placeholder="Ticker (es. AAPL, BTC-USD, ISP.MI, ENI.MI)"
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm flex-1"
        />
        <button
          onClick={analyze}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          Analizza
        </button>
      </div>

      {/* Quick buttons */}
      <div className="flex flex-wrap gap-1">
        {["AAPL", "NVDA", "TSLA", "BTC-USD", "ETH-USD", "ISP.MI", "UCG.MI", "ENI.MI", "RACE.MI", "GC=F", "CL=F", "EURUSD=X"].map(t => (
          <button key={t} onClick={() => { setInput(t); }} className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200">
            {t}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner text="Analisi in corso..." />}

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

          {showChart && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="font-bold mb-2">Grafico {data.signals.ticker}</h3>
              <TradingViewChart symbol={tvSymbol(data.signals.ticker)} height={500} />
            </div>
          )}
        </div>
      )}

      {data?.error && <p className="text-red-500">{data.error}</p>}
    </div>
  );
}

// === Card raccomandazione ===
function RecommendationCard({ rec, onChartClick }: { rec: any; onChartClick: () => void }) {
  const actionColors: Record<string, string> = {
    COMPRA: "border-l-green-500 bg-green-50 dark:bg-green-900/10",
    ASPETTA: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10",
    VENDI: "border-l-red-500 bg-red-50 dark:bg-red-900/10",
    TIENI: "border-l-gray-400",
  };

  const riskColors: Record<string, string> = {
    BASSO: "text-green-600 bg-green-100",
    MEDIO: "text-yellow-600 bg-yellow-100",
    ALTO: "text-red-600 bg-red-100",
  };

  return (
    <div className={`border-l-4 rounded-lg p-5 shadow ${actionColors[rec.action] || ""}`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-bold">{rec.ticker}</h4>
          <span className="text-sm text-gray-500">{rec.name}</span>
          <SignalBadge signal={rec.action} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onChartClick}
            className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
          >
            Grafico
          </button>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[rec.riskLevel] || ""}`}>
            Rischio {rec.riskLevel}
          </span>
          <span className="text-sm text-gray-500">Confidenza: {rec.confidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Prezzo attuale</p>
          <p className="text-lg font-bold">${rec.currentPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Prezzo ingresso</p>
          <p className="text-sm font-medium">{rec.entryPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Target</p>
          <p className="text-lg font-bold text-green-600">${rec.targetPrice}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Stop Loss</p>
          <p className="text-lg font-bold text-red-600">${rec.stopLoss}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Guadagno atteso</p>
          <p className={`text-lg font-bold ${rec.expectedReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
            {rec.expectedReturn >= 0 ? "+" : ""}{rec.expectedReturn}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded p-3">
          <span className="text-gray-500">Quando entrare: </span>
          <span className="font-medium">{rec.timing}</span>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded p-3">
          <span className="text-gray-500">Per quanto tempo: </span>
          <span className="font-medium">{rec.holdingPeriod}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500">Perché:</p>
        {rec.reasons.map((r: string, i: number) => (
          <p key={i} className="text-sm text-gray-600 dark:text-gray-300">• {r}</p>
        ))}
      </div>
    </div>
  );
}

// === Utility ===
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

// Converte ticker Yahoo → TradingView
function tvSymbol(ticker: string): string {
  if (ticker.endsWith(".MI")) return `MIL:${ticker.replace(".MI", "")}`;
  if (ticker.endsWith("-USD")) return `BITSTAMP:${ticker.replace("-USD", "")}USD`;
  if (ticker === "GC=F") return "TVC:GOLD";
  if (ticker === "SI=F") return "TVC:SILVER";
  if (ticker === "CL=F") return "NYMEX:CL1!";
  if (ticker === "NG=F") return "NYMEX:NG1!";
  if (ticker === "HG=F") return "COMEX:HG1!";
  if (ticker === "PL=F") return "NYMEX:PL1!";
  if (ticker === "EURUSD=X") return "FOREXCOM:EURUSD";
  if (ticker === "GBPUSD=X") return "FOREXCOM:GBPUSD";
  if (ticker === "USDJPY=X") return "FOREXCOM:USDJPY";
  if (ticker === "USDCHF=X") return "FOREXCOM:USDCHF";
  if (ticker === "EURGBP=X") return "FOREXCOM:EURGBP";
  if (ticker === "EURJPY=X") return "FOREXCOM:EURJPY";
  if (ticker.startsWith("^")) return ticker; // indices
  return `NASDAQ:${ticker}`;
}
