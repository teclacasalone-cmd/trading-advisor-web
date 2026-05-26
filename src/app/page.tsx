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
  // Stato condiviso — persiste quando cambi tab
  const [advisoryReport, setAdvisoryReport] = useState<any>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [newsData, setNewsData] = useState<any>(null);
  const [signalsData, setSignalsData] = useState<any[]>([]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Ticker tape */}
      <TradingViewTicker />

      {/* Header */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--accent)" }}>
              Trading Advisor
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Il tuo consulente finanziario AI</p>
          </div>
          {/* Decorative globe hint */}
          <div className="hidden md:block w-16 h-16 rounded-full opacity-30" style={{
            background: "radial-gradient(circle at 30% 30%, #c5f82a, #06b6d4, #0f0e2a)",
            border: "1px solid rgba(255,255,255,0.1)",
          }} />
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 pb-3 overflow-x-auto">
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
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
              style={{
                background: tab === key ? "var(--accent)" : "transparent",
                color: tab === key ? "#0f0e2a" : "#94a3b8",
                border: tab === key ? "none" : "1px solid var(--border)",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "advisory" && <AdvisoryTab report={advisoryReport} setReport={setAdvisoryReport} loading={advisoryLoading} setLoading={setAdvisoryLoading} />}
        {tab === "mercati" && <MercatiTab />}
        {tab === "signals" && <SignalsTab data={signalsData} setData={setSignalsData} />}
        {tab === "news" && <NewsTab data={newsData} setData={setNewsData} />}
        {tab === "volumes" && <VolumesTab />}
        {tab === "analyze" && <AnalyzeTab />}
      </main>

      <footer className="text-center text-xs py-6 px-4" style={{ color: "#475569" }}>
        Questo tool è solo a scopo informativo e didattico. Non è consulenza finanziaria professionale. Investi solo ciò che puoi permetterti di perdere.
      </footer>
    </div>
  );
}

// === Card base ===
function Card({ children, className = "", highlight = false }: { children: React.ReactNode; className?: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{
        background: highlight ? "linear-gradient(135deg, #1a1845 0%, #1e2a4a 100%)" : "var(--surface)",
        border: `1px solid ${highlight ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </div>
  );
}

// === ADVISORY ===
function AdvisoryTab({ report, setReport, loading, setLoading }: { report: any; setReport: (r: any) => void; loading: boolean; setLoading: (l: boolean) => void }) {
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
      <Card highlight>
        <h2 className="text-2xl font-black mb-2" style={{ color: "var(--accent)" }}>
          Cosa comprare oggi?
        </h2>
        <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
          Analisi di <strong style={{ color: "var(--foreground)" }}>tutti i mercati</strong>: azioni USA, FTSE MIB, crypto, commodities, forex.
          Per ogni asset: cosa fare, quando, per quanto tempo, e quanto puoi guadagnare.
        </p>
        <button
          onClick={generate}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
          style={{ background: "var(--accent)", color: "#0f0e2a" }}
        >
          {loading ? "Analisi in corso... (1-2 minuti)" : report ? "Aggiorna Raccomandazioni" : "Genera Raccomandazioni"}
        </button>
        <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: "var(--surface-light)", color: "#94a3b8" }}>
          <strong style={{ color: "var(--accent)" }}>Quando analizzare:</strong>
          <span className="ml-1">08:00-09:00 (prima di Milano) | 14:00-15:00 (prima di Wall Street) | Crypto: sempre</span>
        </div>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </Card>

      {loading && (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--accent)" }} />
            <p style={{ color: "#94a3b8" }}>Sto analizzando tutti i mercati...</p>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>USA, Italia, Crypto, Commodities, Forex — indicatori tecnici + notizie + AI</p>
          </div>
        </Card>
      )}

      {report && !loading && (
        <>
          {/* Market overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FearGreedGauge score={report.fearGreed.score} rating={report.fearGreed.rating} />
            <Card>
              <h3 className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Condizione Mercato</h3>
              <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{report.marketCondition}</p>
              <p className="text-sm mt-2 font-medium" style={{
                color: report.sentiment === "BULLISH" ? "#22c55e" : report.sentiment === "BEARISH" ? "#ef4444" : "#eab308"
              }}>
                Sentiment: {report.sentiment}
              </p>
            </Card>
            <Card>
              <h3 className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Riepilogo</h3>
              <p className="text-sm">{report.summary}</p>
              <p className="text-xs mt-2" style={{ color: "#475569" }}>
                Aggiornato: {new Date(report.date).toLocaleString("it-IT")}
              </p>
            </Card>
          </div>

          {/* AI Briefing */}
          {report.aiBriefing && (
            <div className="rounded-xl p-6" style={{
              background: "linear-gradient(135deg, #1a1845 0%, #0f2a1a 50%, #1a1845 100%)",
              border: "1px solid var(--accent)",
            }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: "var(--accent)", color: "#0f0e2a" }}>AI</div>
                <h3 className="text-lg font-black" style={{ color: "var(--accent)" }}>Briefing AI — Il tuo consulente</h3>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#cbd5e1" }}>
                {report.aiBriefing}
              </div>
            </div>
          )}

          {/* AI News Analysis */}
          {report.aiNewsAnalysis && (
            <Card>
              <h3 className="font-bold mb-3" style={{ color: "var(--accent)" }}>Analisi AI delle Notizie</h3>
              <div className="text-sm whitespace-pre-line" style={{ color: "#94a3b8" }}>
                {report.aiNewsAnalysis}
              </div>
            </Card>
          )}

          {/* COMPRA */}
          <RecSection
            title="COMPRA — Opportunità identificate"
            color="#22c55e"
            recs={report.recommendations.filter((r: any) => r.action === "COMPRA")}
            onSelect={setSelectedTicker}
          />

          {/* ASPETTA */}
          <RecSection
            title="ASPETTA — Monitorare per ingresso"
            color="#eab308"
            recs={report.recommendations.filter((r: any) => r.action === "ASPETTA")}
            onSelect={setSelectedTicker}
          />

          {/* Chart */}
          {selectedTicker && (
            <Card>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold" style={{ color: "var(--accent)" }}>Grafico: {selectedTicker}</h3>
                <button onClick={() => setSelectedTicker(null)} className="text-sm hover:opacity-80" style={{ color: "#94a3b8" }}>Chiudi</button>
              </div>
              <TradingViewChart symbol={tvSymbol(selectedTicker)} height={500} />
            </Card>
          )}

          {/* EVITARE */}
          {report.avoidList.length > 0 && (
            <div className="rounded-xl p-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <h3 className="text-lg font-bold mb-3 text-red-400">DA EVITARE</h3>
              <div className="space-y-2">
                {report.avoidList.map((item: any) => (
                  <div key={item.ticker} className="flex items-center gap-3">
                    <span className="font-bold text-red-400">{item.ticker}</span>
                    <span className="text-sm" style={{ color: "#94a3b8" }}>{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settori */}
          {report.sectorsToWatch.length > 0 && (
            <Card>
              <h3 className="text-lg font-bold mb-3" style={{ color: "var(--accent)" }}>Settori da osservare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.sectorsToWatch.map((s: any) => (
                  <div key={s.sector} className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span className="font-medium">{s.sector}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium" style={{ color: s.trend === "RIALZO" ? "#22c55e" : "#ef4444" }}>
                        {s.trend}
                      </span>
                      <p className="text-xs" style={{ color: "#475569" }}>{s.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
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
      <h3 className="text-lg font-bold mb-3" style={{ color }}>{title}</h3>
      <div className="grid gap-4">
        {recs.map((rec: any) => (
          <RecommendationCard key={rec.ticker} rec={rec} onChartClick={() => onSelect(rec.ticker)} />
        ))}
      </div>
    </div>
  );
}

// === MERCATI ===
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
      <Card>
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--accent)" }}>Grafico Interattivo</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {quickSymbols.map(s => (
            <button
              key={s.symbol}
              onClick={() => setSelectedSymbol(s.symbol)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: selectedSymbol === s.symbol ? "var(--accent)" : "var(--surface-light)",
                color: selectedSymbol === s.symbol ? "#0f0e2a" : "#94a3b8",
                border: `1px solid ${selectedSymbol === s.symbol ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <TradingViewChart symbol={selectedSymbol} height={550} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold" style={{ color: "var(--accent)" }}>Heatmap Mercato</h2>
          <select
            value={heatmapExchange}
            onChange={e => setHeatmapExchange(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--surface-light)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            <option value="SPX500">S&P 500</option>
            <option value="NASDAQ100">Nasdaq 100</option>
            <option value="MIL">Borsa Italiana</option>
            <option value="XETR">DAX (Germania)</option>
            <option value="LSE">FTSE (Londra)</option>
          </select>
        </div>
        <TradingViewHeatmap exchange={heatmapExchange} height={500} />
      </Card>
    </div>
  );
}

// === SIGNALS ===
function SignalsTab({ data: signals, setData: setSignals }: { data: any[]; setData: (d: any[]) => void }) {
  const [loading, setLoading] = useState(signals.length === 0);

  useEffect(() => {
    if (signals.length > 0) return; // già caricati
    fetch("/api/signals")
      .then(r => r.json())
      .then(data => { setSignals(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Calcolo segnali tecnici..." />;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--accent)" }}>Segnali Tecnici — Azioni & Crypto</h2>
      <div className="rounded-xl overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-light)" }}>
              <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>Ticker</th>
              <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>Prezzo</th>
              <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>RSI</th>
              <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>Trend</th>
              <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>Segnale</th>
              <th className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>Score</th>
              <th className="px-4 py-3 text-left text-xs font-bold hidden md:table-cell" style={{ color: "#94a3b8" }}>Motivi</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((s: any) => (
              <tr key={s.ticker} className="hover:brightness-110" style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="px-4 py-3 font-bold">{s.ticker}</td>
                <td className="px-4 py-3">${s.price}</td>
                <td className="px-4 py-3" style={{ color: s.rsi < 30 ? "#22c55e" : s.rsi > 70 ? "#ef4444" : "inherit" }}>{s.rsi}</td>
                <td className="px-4 py-3 text-xs">{s.trend}</td>
                <td className="px-4 py-3"><SignalBadge signal={s.overallSignal} /></td>
                <td className="px-4 py-3 font-bold" style={{ color: s.score > 0 ? "#22c55e" : s.score < 0 ? "#ef4444" : "inherit" }}>
                  {s.score > 0 ? "+" : ""}{s.score}
                </td>
                <td className="px-4 py-3 text-xs hidden md:table-cell" style={{ color: "#94a3b8" }}>
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
function NewsTab({ data: newsData, setData: setNewsData }: { data: any; setData: (d: any) => void }) {
  const [filter, setFilter] = useState("Tutti");
  const [loading, setLoading] = useState(!newsData);

  useEffect(() => {
    if (newsData) return; // già caricato
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
        <h2 className="text-lg font-bold" style={{ color: "var(--accent)" }}>News & Sentiment</h2>
        <div className="flex gap-2">
          {["Tutti", "POSITIVO", "NEGATIVO", "NEUTRO"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-lg text-xs font-bold"
              style={{
                background: filter === f ? "var(--accent)" : "var(--surface-light)",
                color: filter === f ? "#0f0e2a" : "#94a3b8",
              }}
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
        {filtered.length === 0 && <p style={{ color: "#475569" }}>Nessuna notizia con questo filtro</p>}
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
        <h2 className="text-lg font-bold" style={{ color: "var(--accent)" }}>Volume Scanner — Dove entrano i soldi</h2>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: "var(--surface-light)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="rounded-xl overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-light)" }}>
                {["Ticker", "Nome", "Prezzo", "Variazione %", "Volume", "Vol vs Media", "Segnale"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: "#94a3b8" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((q: any) => (
                <tr key={q.ticker} style={{
                  borderBottom: "1px solid var(--border)",
                  background: q.volRatio >= 1.5 ? "rgba(197,248,42,0.05)" : "transparent",
                }}>
                  <td className="px-4 py-3 font-bold">{q.ticker}</td>
                  <td className="px-4 py-3">{q.name}</td>
                  <td className="px-4 py-3">{q.price?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: q.changePct >= 0 ? "#22c55e" : "#ef4444" }}>
                    {q.changePct >= 0 ? "+" : ""}{q.changePct?.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3">{q.volume?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: q.volRatio >= 1.5 ? "var(--accent)" : "inherit" }}>
                    {q.volRatio}x
                  </td>
                  <td className="px-4 py-3">
                    {q.volRatio >= 1.5 ? (
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "var(--accent)", color: "#0f0e2a" }}>ANOMALO</span>
                    ) : (
                      <span className="text-xs" style={{ color: "#475569" }}>Normale</span>
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--accent)" }}>Analisi Asset</h2>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && analyze()}
          placeholder="Ticker (es. AAPL, BTC-USD, ISP.MI, ENI.MI)"
          className="px-3 py-2 rounded-lg text-sm flex-1"
          style={{ background: "var(--surface-light)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        />
        <button
          onClick={analyze}
          className="px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110"
          style={{ background: "var(--accent)", color: "#0f0e2a" }}
        >
          Analizza
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {["AAPL", "NVDA", "TSLA", "BTC-USD", "ETH-USD", "ISP.MI", "UCG.MI", "ENI.MI", "RACE.MI", "GC=F", "CL=F", "EURUSD=X"].map(t => (
          <button
            key={t}
            onClick={() => setInput(t)}
            className="px-2 py-1 rounded text-xs font-medium transition-all hover:brightness-110"
            style={{ background: "var(--surface-light)", color: "#94a3b8", border: "1px solid var(--border)" }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner text="Analisi in corso..." />}

      {data?.signals && !loading && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h3 className="text-2xl font-black" style={{ color: "var(--accent)" }}>{data.signals.ticker}</h3>
              <SignalBadge signal={data.signals.overallSignal} />
              <span className="text-lg font-bold">${data.signals.price}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Stat label="RSI" value={data.signals.rsi} color={data.signals.rsi < 30 ? "#22c55e" : data.signals.rsi > 70 ? "#ef4444" : undefined} />
              <Stat label="MACD" value={data.signals.macdSignal} color={data.signals.macdSignal === "POSITIVO" ? "#22c55e" : "#ef4444"} />
              <Stat label="Trend" value={data.signals.trend} />
              <Stat label="Score" value={data.signals.score > 0 ? `+${data.signals.score}` : data.signals.score} color={data.signals.score > 0 ? "#22c55e" : data.signals.score < 0 ? "#ef4444" : undefined} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold" style={{ color: "#94a3b8" }}>Motivazioni:</h4>
              {data.signals.reasons?.map((r: string, i: number) => (
                <p key={i} className="text-sm" style={{ color: "#cbd5e1" }}>- {r}</p>
              ))}
            </div>
          </Card>

          {showChart && (
            <Card>
              <h3 className="font-bold mb-2" style={{ color: "var(--accent)" }}>Grafico {data.signals.ticker}</h3>
              <TradingViewChart symbol={tvSymbol(data.signals.ticker)} height={500} />
            </Card>
          )}
        </div>
      )}

      {data?.error && <p className="text-red-400">{data.error}</p>}
    </div>
  );
}

// === RECOMMENDATION CARD ===
function RecommendationCard({ rec, onChartClick }: { rec: any; onChartClick: () => void }) {
  const borderColors: Record<string, string> = {
    COMPRA: "#22c55e", ASPETTA: "#eab308", VENDI: "#ef4444", TIENI: "#64748b",
  };
  const riskColors: Record<string, { bg: string; text: string }> = {
    BASSO: { bg: "rgba(34,197,94,0.2)", text: "#22c55e" },
    MEDIO: { bg: "rgba(234,179,8,0.2)", text: "#eab308" },
    ALTO: { bg: "rgba(239,68,68,0.2)", text: "#ef4444" },
  };

  return (
    <div className="rounded-xl p-5" style={{
      background: "var(--surface)",
      borderLeft: `4px solid ${borderColors[rec.action] || "#64748b"}`,
      border: `1px solid var(--border)`,
      borderLeftWidth: "4px",
      borderLeftColor: borderColors[rec.action] || "#64748b",
    }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-black" style={{ color: "var(--accent)" }}>{rec.ticker}</h4>
          <span className="text-sm" style={{ color: "#94a3b8" }}>{rec.name}</span>
          <SignalBadge signal={rec.action} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onChartClick}
            className="px-3 py-1 rounded-lg text-xs font-bold hover:brightness-110"
            style={{ background: "var(--accent)", color: "#0f0e2a" }}
          >
            Grafico
          </button>
          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{
            background: riskColors[rec.riskLevel]?.bg,
            color: riskColors[rec.riskLevel]?.text,
          }}>
            Rischio {rec.riskLevel}
          </span>
          <span className="text-sm" style={{ color: "#94a3b8" }}>Confidenza: {rec.confidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Prezzo attuale</p>
          <p className="text-lg font-bold">${rec.currentPrice}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Prezzo ingresso</p>
          <p className="text-sm font-medium">{rec.entryPrice}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Target</p>
          <p className="text-lg font-bold" style={{ color: "#22c55e" }}>${rec.targetPrice}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Stop Loss</p>
          <p className="text-lg font-bold" style={{ color: "#ef4444" }}>${rec.stopLoss}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Guadagno atteso</p>
          <p className="text-lg font-bold" style={{ color: rec.expectedReturn >= 0 ? "#22c55e" : "#ef4444" }}>
            {rec.expectedReturn >= 0 ? "+" : ""}{rec.expectedReturn}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
        <div className="rounded-lg p-3" style={{ background: "var(--surface-light)" }}>
          <span style={{ color: "#94a3b8" }}>Quando entrare: </span>
          <span className="font-medium">{rec.timing}</span>
        </div>
        <div className="rounded-lg p-3" style={{ background: "var(--surface-light)" }}>
          <span style={{ color: "#94a3b8" }}>Per quanto tempo: </span>
          <span className="font-medium">{rec.holdingPeriod}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-bold" style={{ color: "#94a3b8" }}>Perché:</p>
        {rec.reasons.map((r: string, i: number) => (
          <p key={i} className="text-sm" style={{ color: "#cbd5e1" }}>• {r}</p>
        ))}
      </div>
    </div>
  );
}

// === UTILITY ===
function LoadingSpinner({ text = "Caricamento..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3" style={{ borderColor: "var(--accent)" }} />
      <span style={{ color: "#94a3b8" }}>{text}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: "#94a3b8" }}>{label}</p>
      <p className="text-lg font-bold" style={{ color: color || "var(--foreground)" }}>{value}</p>
    </div>
  );
}

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
  if (ticker.startsWith("^")) return ticker;
  return `NASDAQ:${ticker}`;
}
