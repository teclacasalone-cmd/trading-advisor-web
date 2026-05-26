// Strategia consigliata — basata su analisi storica dei mercati
// Questi sono i prezzi di riferimento al momento della creazione della strategia
// Il sistema confronta con i dati reali per verificare se la strategia regge

export interface StrategyPick {
  ticker: string;
  name: string;
  category: "ITALIA" | "USA" | "CRYPTO" | "ETF";
  referencePrice: number; // prezzo al momento della strategia
  currency: "EUR" | "USD";
  action: "COMPRA" | "ACCUMULA" | "MONITORA";
  priority: "ALTA" | "MEDIA" | "BASSA";
  thesis: string; // perché comprare
  risks: string; // cosa può andare storto
  targetPrice: number; // obiettivo
  stopLoss: number; // dove tagliare
  dividendYield: number; // % dividendo annuo stimato
  timeHorizon: string;
  maxBudgetPerOp: number; // max € per operazione
}

export interface StrategyCheck {
  pick: StrategyPick;
  currentPrice: number;
  changePct: number; // % variazione dal prezzo di riferimento
  status: "CONFERMATA" | "IN LINEA" | "ATTENZIONE" | "STOP LOSS" | "TARGET RAGGIUNTO";
  verdict: string; // spiegazione
  analystConsensus: string | null;
  stillBuy: boolean; // ancora da comprare?
}

export const STRATEGY_DATE = "2025-05-26";

export const STRATEGY_PICKS: StrategyPick[] = [
  // === ITALIA ===
  {
    ticker: "ISP.MI",
    name: "Intesa Sanpaolo",
    category: "ITALIA",
    referencePrice: 4.0,
    currency: "EUR",
    action: "COMPRA",
    priority: "ALTA",
    thesis: "Dividendo ~7%, utili record, buyback aggressivi. La banca più solida d'Italia. Con €100 compri ~25 azioni e incassi ~€7/anno di dividendi.",
    risks: "Taglio tassi BCE comprime i margini. Recessione Italia. NPL (crediti deteriorati).",
    targetPrice: 4.8,
    stopLoss: 3.4,
    dividendYield: 7.0,
    timeHorizon: "12-24 mesi",
    maxBudgetPerOp: 100,
  },
  {
    ticker: "ENI.MI",
    name: "ENI",
    category: "ITALIA",
    referencePrice: 13.5,
    currency: "EUR",
    action: "COMPRA",
    priority: "ALTA",
    thesis: "Dividendo ~7%, transizione energetica, Plenitude (rinnovabili). Prezzo accessibile, business stabile.",
    risks: "Crollo petrolio sotto $50. Transizione energetica troppo lenta. Geopolitica.",
    targetPrice: 16.0,
    stopLoss: 11.5,
    dividendYield: 7.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 100,
  },
  {
    ticker: "ENEL.MI",
    name: "Enel",
    category: "ITALIA",
    referencePrice: 6.8,
    currency: "EUR",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Utility che beneficia del taglio tassi. Dividendo ~6%. Debito in calo. Rinnovabili in crescita.",
    risks: "Regolamentazione, debito ancora alto, ritardi investimenti.",
    targetPrice: 8.0,
    stopLoss: 5.8,
    dividendYield: 6.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 100,
  },
  {
    ticker: "A2A.MI",
    name: "A2A",
    category: "ITALIA",
    referencePrice: 2.1,
    currency: "EUR",
    action: "ACCUMULA",
    priority: "MEDIA",
    thesis: "Utility economica, puoi comprare molte azioni con poco. Dividendo ~5%. Economia circolare e rinnovabili.",
    risks: "Titolo piccolo, meno liquidità. Dipendenza mercato italiano.",
    targetPrice: 2.6,
    stopLoss: 1.7,
    dividendYield: 5.0,
    timeHorizon: "12-24 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "LDO.MI",
    name: "Leonardo",
    category: "ITALIA",
    referencePrice: 22.0,
    currency: "EUR",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Difesa europea in crescita, ordini NATO record. Riarmo europeo è un megatrend multi-anno.",
    risks: "Dipendenza contratti governativi, ritardi produzione, pace in Ucraina riduce urgenza.",
    targetPrice: 28.0,
    stopLoss: 18.0,
    dividendYield: 1.5,
    timeHorizon: "12-24 mesi",
    maxBudgetPerOp: 100,
  },

  // === USA ===
  {
    ticker: "PYPL",
    name: "PayPal",
    category: "USA",
    referencePrice: 65.0,
    currency: "USD",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Scontata del 70% dai massimi ($310). Margini in miglioramento, Venmo cresce. Turnaround in corso.",
    risks: "Competizione da Apple Pay, Square, Stripe. Crescita rallentata.",
    targetPrice: 85.0,
    stopLoss: 55.0,
    dividendYield: 0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 100,
  },
  {
    ticker: "INTC",
    name: "Intel",
    category: "USA",
    referencePrice: 28.0,
    currency: "USD",
    action: "MONITORA",
    priority: "MEDIA",
    thesis: "Ristrutturazione in corso, CHIPS Act finanziamenti, prezzo ai minimi storici. Alto rischio/alto rendimento.",
    risks: "Esecuzione del turnaround incerta. AMD e NVDA dominano. Perdite foundry.",
    targetPrice: 40.0,
    stopLoss: 20.0,
    dividendYield: 1.5,
    timeHorizon: "18-24 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "PFE",
    name: "Pfizer",
    category: "USA",
    referencePrice: 26.0,
    currency: "USD",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Post-COVID ha perso il 60%. Pipeline forte (oncologia), dividendo ~6%. Prezzo a livelli pre-COVID.",
    risks: "Pipeline fallisce. Calo ricavi COVID più rapido del previsto.",
    targetPrice: 35.0,
    stopLoss: 22.0,
    dividendYield: 6.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 80,
  },
  {
    ticker: "KO",
    name: "Coca-Cola",
    category: "USA",
    referencePrice: 62.0,
    currency: "USD",
    action: "ACCUMULA",
    priority: "BASSA",
    thesis: "Difensiva per eccellenza. Dividendo costante da 60+ anni. Porto sicuro quando i mercati tremano.",
    risks: "Crescita lenta. Dollaro forte pesa sui ricavi internazionali.",
    targetPrice: 70.0,
    stopLoss: 55.0,
    dividendYield: 3.0,
    timeHorizon: "24+ mesi",
    maxBudgetPerOp: 100,
  },
  {
    ticker: "BAC",
    name: "Bank of America",
    category: "USA",
    referencePrice: 37.0,
    currency: "USD",
    action: "ACCUMULA",
    priority: "MEDIA",
    thesis: "Grande banca USA, beneficia dell'economia forte. Dividendo ~3%. Warren Buffett la tiene in portafoglio.",
    risks: "Recessione USA. Crisi immobiliare. Taglio tassi comprime margini.",
    targetPrice: 45.0,
    stopLoss: 30.0,
    dividendYield: 3.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 80,
  },

  // === CRYPTO ===
  {
    ticker: "XRP-USD",
    name: "XRP (Ripple)",
    category: "CRYPTO",
    referencePrice: 0.55,
    currency: "USD",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Caso SEC risolto. Uso reale per pagamenti cross-border. Prezzo molto economico. Partnership bancarie.",
    risks: "Mercato crypto in bear. Regolamentazione. Concorrenza stablecoin.",
    targetPrice: 1.2,
    stopLoss: 0.35,
    dividendYield: 0,
    timeHorizon: "6-12 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "ADA-USD",
    name: "Cardano",
    category: "CRYPTO",
    referencePrice: 0.45,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "Blockchain solida, community forte, smart contracts. Prezzo bassissimo, alto potenziale se il mercato riparte.",
    risks: "Adozione lenta. Concorrenza Ethereum/Solana. Bear market crypto.",
    targetPrice: 1.0,
    stopLoss: 0.25,
    dividendYield: 0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 40,
  },
  {
    ticker: "LINK-USD",
    name: "Chainlink",
    category: "CRYPTO",
    referencePrice: 14.0,
    currency: "USD",
    action: "ACCUMULA",
    priority: "MEDIA",
    thesis: "Oracle leader per DeFi. Fondamentale infrastruttura blockchain. Adozione istituzionale (SWIFT partnership).",
    risks: "Bear market crypto. Token economics (inflazione supply).",
    targetPrice: 25.0,
    stopLoss: 9.0,
    dividendYield: 0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 60,
  },
];

// Regole della strategia
export const STRATEGY_RULES = [
  "Mai tutto su un titolo — diversifica su almeno 4-5 asset",
  "Compra a scaglioni — dividi in 2-3 acquisti nel tempo (cost averaging)",
  "Stop loss sempre — perdi max 5-7% su ogni operazione",
  "Dividendi reinvestiti — Intesa, ENI, Enel pagano dividendi alti, reinvestili",
  "Crypto max 10-15% del portafoglio — troppo volatile per di più",
  "Non inseguire i rialzi — se un titolo è già salito molto, aspetta un pullback",
  "Controlla il VIX — sopra 25 il mercato è nervoso, sotto 15 è tranquillo",
  "Genera il report alle 8:00-9:00 (prima di Milano) o 14:00-15:00 (prima di Wall Street)",
];

// Genera il confronto tra strategia e dati reali
export function checkStrategy(
  picks: StrategyPick[],
  currentPrices: Map<string, number>,
  analystData: Map<string, string>,
): StrategyCheck[] {
  return picks.map(pick => {
    const current = currentPrices.get(pick.ticker) || 0;
    if (current === 0) {
      return {
        pick,
        currentPrice: 0,
        changePct: 0,
        status: "IN LINEA" as const,
        verdict: "Dati non disponibili",
        analystConsensus: null,
        stillBuy: false,
      };
    }

    const changePct = +((current - pick.referencePrice) / pick.referencePrice * 100).toFixed(1);
    const analyst = analystData.get(pick.ticker) || null;

    let status: StrategyCheck["status"];
    let verdict: string;
    let stillBuy: boolean;

    if (current <= pick.stopLoss) {
      status = "STOP LOSS";
      verdict = `Prezzo sotto lo stop loss (${pick.currency} ${pick.stopLoss}). VENDERE o non entrare. La tesi originale potrebbe non reggere.`;
      stillBuy = false;
    } else if (current >= pick.targetPrice) {
      status = "TARGET RAGGIUNTO";
      verdict = `Target raggiunto! Prendere profitti o alzare lo stop loss. Guadagno: ${changePct > 0 ? "+" : ""}${changePct}%.`;
      stillBuy = false;
    } else if (changePct < -10) {
      status = "ATTENZIONE";
      verdict = `In calo del ${changePct}% dal riferimento. Verificare se la tesi è ancora valida. Potrebbe essere opportunità di accumulo se i fondamentali reggono.`;
      stillBuy = true; // potrebbe essere un'opportunità
    } else if (changePct > 15) {
      status = "IN LINEA";
      verdict = `Salita del +${changePct}% — la strategia sta funzionando. Alzare lo stop loss per proteggere i profitti.`;
      stillBuy = false; // già salito troppo
    } else if (Math.abs(changePct) <= 5) {
      status = "CONFERMATA";
      verdict = `Prezzo stabile (${changePct > 0 ? "+" : ""}${changePct}%). Buon momento per entrare o accumulare secondo la strategia originale.`;
      stillBuy = pick.action !== "MONITORA";
    } else {
      status = "IN LINEA";
      verdict = `Variazione ${changePct > 0 ? "+" : ""}${changePct}%. La strategia è in linea con le aspettative.`;
      stillBuy = changePct < 10;
    }

    return { pick, currentPrice: current, changePct, status, verdict, analystConsensus: analyst, stillBuy };
  });
}
