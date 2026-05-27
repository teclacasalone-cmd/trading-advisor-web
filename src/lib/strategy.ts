// Strategia consigliata — AGGIORNATA 2026-05-27 con prezzi reali
// Basata su: risultati strategia precedente + prezzi reali + nuove opportunità

export interface StrategyPick {
  ticker: string;
  name: string;
  category: "ITALIA" | "USA" | "CRYPTO" | "ETF" | "NICCHIA";
  referencePrice: number;
  currency: "EUR" | "USD";
  action: "COMPRA" | "ACCUMULA" | "MONITORA" | "PRENDI PROFITTI";
  priority: "ALTA" | "MEDIA" | "BASSA";
  thesis: string;
  risks: string;
  targetPrice: number;
  stopLoss: number;
  dividendYield: number;
  timeHorizon: string;
  maxBudgetPerOp: number;
  previousResult?: string; // risultato dalla strategia precedente
}

export interface StrategyCheck {
  pick: StrategyPick;
  currentPrice: number;
  changePct: number;
  status: "CONFERMATA" | "IN LINEA" | "ATTENZIONE" | "STOP LOSS" | "TARGET RAGGIUNTO";
  verdict: string;
  analystConsensus: string | null;
  stillBuy: boolean;
}

export const STRATEGY_DATE = "2026-05-27";

export const STRATEGY_PICKS: StrategyPick[] = [
  // =============================================
  // ITALIA — Aggiornata con prezzi reali 2026
  // =============================================
  {
    ticker: "ISP.MI",
    name: "Intesa Sanpaolo",
    category: "ITALIA",
    referencePrice: 5.71,
    currency: "EUR",
    action: "ACCUMULA",
    priority: "ALTA",
    thesis: "Dividendo ~6%, buyback attivi. Ha già fatto +43% dalla strategia precedente. Ancora solida per dividendi e accumulo.",
    risks: "Già salita molto. Taglio tassi BCE comprime margini. Possibile ritracciamento.",
    targetPrice: 6.50,
    stopLoss: 5.00,
    dividendYield: 6.0,
    timeHorizon: "6-12 mesi",
    maxBudgetPerOp: 100,
    previousResult: "+42.7% — TARGET RAGGIUNTO nella strategia precedente",
  },
  {
    ticker: "ENI.MI",
    name: "ENI",
    category: "ITALIA",
    referencePrice: 23.17,
    currency: "EUR",
    action: "PRENDI PROFITTI",
    priority: "MEDIA",
    thesis: "Ha fatto +72% dalla strategia precedente. Dividendo ancora buono ~5%. Valutare di prendere parte dei profitti e tenere una posizione ridotta.",
    risks: "Petrolio volatile. Già molto salita. Possibile correzione.",
    targetPrice: 26.00,
    stopLoss: 20.00,
    dividendYield: 5.0,
    timeHorizon: "6-12 mesi",
    maxBudgetPerOp: 100,
    previousResult: "+71.6% — TARGET RAGGIUNTO",
  },
  {
    ticker: "ENEL.MI",
    name: "Enel",
    category: "ITALIA",
    referencePrice: 9.83,
    currency: "EUR",
    action: "PRENDI PROFITTI",
    priority: "MEDIA",
    thesis: "Ha fatto +44%. Utility solida ma ora più cara. Prendere profitti parziali, tenere per dividendo.",
    risks: "Valutazione più alta dopo il rally. Debito ancora rilevante.",
    targetPrice: 11.00,
    stopLoss: 8.50,
    dividendYield: 5.0,
    timeHorizon: "12 mesi",
    maxBudgetPerOp: 100,
    previousResult: "+44.5% — TARGET RAGGIUNTO",
  },
  {
    ticker: "A2A.MI",
    name: "A2A",
    category: "ITALIA",
    referencePrice: 2.31,
    currency: "EUR",
    action: "COMPRA",
    priority: "ALTA",
    thesis: "Ancora economica, +10% ma lontana dal target. Utility con dividendo ~5%, economia circolare. Ottimo rapporto rischio/rendimento.",
    risks: "Titolo piccolo, meno liquidità. Dipendenza mercato italiano.",
    targetPrice: 2.80,
    stopLoss: 1.95,
    dividendYield: 5.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 60,
    previousResult: "+9.9% — IN LINEA, ancora da accumulare",
  },
  {
    ticker: "LDO.MI",
    name: "Leonardo",
    category: "ITALIA",
    referencePrice: 52.63,
    currency: "EUR",
    action: "PRENDI PROFITTI",
    priority: "MEDIA",
    thesis: "Ha fatto +139%! Difesa europea boom. Alzare stop loss e prendere profitti parziali. Trend difesa ancora forte.",
    risks: "Già triplicata. Pace in Ucraina potrebbe frenare. Valutazione elevata.",
    targetPrice: 60.00,
    stopLoss: 45.00,
    dividendYield: 1.0,
    timeHorizon: "6 mesi",
    maxBudgetPerOp: 100,
    previousResult: "+139.2% — TARGET RAGGIUNTO, miglior pick della strategia",
  },
  {
    ticker: "PFE",
    name: "Pfizer",
    category: "USA",
    referencePrice: 25.85,
    currency: "USD",
    action: "COMPRA",
    priority: "ALTA",
    thesis: "Stabile, vicina al prezzo di riferimento (-0.6%). Pipeline oncologica forte, dividendo ~6%. Ancora un'occasione.",
    risks: "Calo ricavi COVID. Pipeline potrebbe deludere.",
    targetPrice: 35.00,
    stopLoss: 22.00,
    dividendYield: 6.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 80,
    previousResult: "-0.6% — CONFERMATA, stesso prezzo, ancora da comprare",
  },
  {
    ticker: "PYPL",
    name: "PayPal",
    category: "USA",
    referencePrice: 44.16,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "Ha toccato lo stop loss della strategia precedente (-32%). Il turnaround è più lento del previsto. Solo se rimbalza sopra $50.",
    risks: "Competizione feroce. Crescita piatta. Potrebbe scendere ancora.",
    targetPrice: 55.00,
    stopLoss: 38.00,
    dividendYield: 0,
    timeHorizon: "12 mesi",
    maxBudgetPerOp: 60,
    previousResult: "-32.1% — STOP LOSS colpito. Lezione: i turnaround sono rischiosi",
  },
  {
    ticker: "KO",
    name: "Coca-Cola",
    category: "USA",
    referencePrice: 80.46,
    currency: "USD",
    action: "ACCUMULA",
    priority: "MEDIA",
    thesis: "Ha fatto +30%. Difensiva per eccellenza. Dividendo costante da 60+ anni. Continuare ad accumulare, porto sicuro.",
    risks: "Già salita. Crescita lenta. Dollaro forte.",
    targetPrice: 90.00,
    stopLoss: 72.00,
    dividendYield: 3.0,
    timeHorizon: "12-24 mesi",
    maxBudgetPerOp: 100,
    previousResult: "+29.8% — TARGET RAGGIUNTO",
  },
  {
    ticker: "BAC",
    name: "Bank of America",
    category: "USA",
    referencePrice: 52.20,
    currency: "USD",
    action: "PRENDI PROFITTI",
    priority: "MEDIA",
    thesis: "Ha fatto +41%. Alzare stop loss. Economia USA tiene ma banche sensibili a recessione.",
    risks: "Recessione. Taglio tassi comprime margini. Già salita molto.",
    targetPrice: 58.00,
    stopLoss: 46.00,
    dividendYield: 2.5,
    timeHorizon: "6-12 mesi",
    maxBudgetPerOp: 80,
    previousResult: "+41.1% — TARGET RAGGIUNTO",
  },

  // =============================================
  // CRYPTO — Aggiornata
  // =============================================
  {
    ticker: "XRP-USD",
    name: "XRP (Ripple)",
    category: "CRYPTO",
    referencePrice: 1.33,
    currency: "USD",
    action: "PRENDI PROFITTI",
    priority: "MEDIA",
    thesis: "Ha fatto +142%! Prendere profitti. Se scende sotto $1 potrebbe essere occasione per rientrare.",
    risks: "Già triplicata. Regolamentazione. Bear market crypto possibile.",
    targetPrice: 1.80,
    stopLoss: 1.00,
    dividendYield: 0,
    timeHorizon: "3-6 mesi",
    maxBudgetPerOp: 60,
    previousResult: "+142.3% — TARGET RAGGIUNTO",
  },
  {
    ticker: "LINK-USD",
    name: "Chainlink",
    category: "CRYPTO",
    referencePrice: 9.41,
    currency: "USD",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Scesa del -33% ma i fondamentali sono intatti. Oracle leader per DeFi, SWIFT partnership. Prezzo scontato.",
    risks: "Bear market crypto. Supply inflation.",
    targetPrice: 15.00,
    stopLoss: 7.00,
    dividendYield: 0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 60,
    previousResult: "-32.8% — ATTENZIONE, ma fondamentali ok",
  },
  {
    ticker: "ADA-USD",
    name: "Cardano",
    category: "CRYPTO",
    referencePrice: 0.24,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "Ha colpito stop loss (-47%). Aspettare segnali di ripresa. Solo se BTC riparte.",
    risks: "Adozione lenta. Concorrenza. Bear market.",
    targetPrice: 0.50,
    stopLoss: 0.15,
    dividendYield: 0,
    timeHorizon: "12+ mesi",
    maxBudgetPerOp: 30,
    previousResult: "-46.7% — STOP LOSS colpito",
  },

  // =============================================
  // NICCHIA — Nuove opportunità
  // =============================================
  {
    ticker: "BAMI.MI",
    name: "Banco BPM",
    category: "NICCHIA",
    referencePrice: 10.50,
    currency: "EUR",
    action: "COMPRA",
    priority: "ALTA",
    thesis: "Banca media italiana, dividendo alto ~7%, OPA UniCredit in corso (potenziale premio). Prezzo basso, alto rendimento.",
    risks: "OPA potrebbe fallire. Sensibile a tassi. NPL.",
    targetPrice: 13.00,
    stopLoss: 8.50,
    dividendYield: 7.0,
    timeHorizon: "6-12 mesi",
    maxBudgetPerOp: 100,
  },
  {
    ticker: "HER.MI",
    name: "Hera",
    category: "NICCHIA",
    referencePrice: 4.20,
    currency: "EUR",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Utility di nicchia sottovalutata. Economia circolare, gestione rifiuti, gas. Dividendo ~4%. Stabile e economica.",
    risks: "Crescita lenta. Regolamentazione. Meno liquida delle big.",
    targetPrice: 5.00,
    stopLoss: 3.50,
    dividendYield: 4.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "SRG.MI",
    name: "Snam",
    category: "NICCHIA",
    referencePrice: 5.40,
    currency: "EUR",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Infrastruttura gas italiana, monopolio naturale. Dividendo ~5%. Stabile, difensiva, beneficia idrogeno verde.",
    risks: "Transizione energetica potrebbe ridurre domanda gas. Crescita lenta.",
    targetPrice: 6.20,
    stopLoss: 4.60,
    dividendYield: 5.0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 80,
  },
  {
    ticker: "CPR.MI",
    name: "Campari",
    category: "NICCHIA",
    referencePrice: 5.80,
    currency: "EUR",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Lusso italiano nel beverage. Scontata del 50% dai massimi. Brand globali (Aperol, Campari). Recovery play.",
    risks: "Calo consumi spirits. Debito da acquisizioni. Cambio management.",
    targetPrice: 7.50,
    stopLoss: 4.80,
    dividendYield: 1.5,
    timeHorizon: "12-24 mesi",
    maxBudgetPerOp: 80,
  },
  {
    ticker: "PLTR",
    name: "Palantir",
    category: "NICCHIA",
    referencePrice: 30.00,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "Leader AI per governi e enterprise. Crescita forte ma valutazione alta. Solo su ritracciamento significativo.",
    risks: "P/E altissimo. Dipendenza contratti governativi. Volatile.",
    targetPrice: 40.00,
    stopLoss: 22.00,
    dividendYield: 0,
    timeHorizon: "12 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "SOFI",
    name: "SoFi Technologies",
    category: "NICCHIA",
    referencePrice: 12.00,
    currency: "USD",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Fintech in crescita, ora profittevole. Banca digitale per millennials. Prezzo basso, alto potenziale.",
    risks: "Competizione bancaria. Sensibile a recessione. Volatile.",
    targetPrice: 18.00,
    stopLoss: 9.00,
    dividendYield: 0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "MARA",
    name: "MARA Holdings (Bitcoin mining)",
    category: "NICCHIA",
    referencePrice: 20.00,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "Proxy per Bitcoin. Se BTC sale, MARA sale 2-3x. Leva sul prezzo del BTC senza comprare BTC direttamente.",
    risks: "Estremamente volatile. Correlata 100% a BTC. Può perdere 50%+ in bear market.",
    targetPrice: 35.00,
    stopLoss: 14.00,
    dividendYield: 0,
    timeHorizon: "6-12 mesi",
    maxBudgetPerOp: 40,
  },
  {
    ticker: "RKLB",
    name: "Rocket Lab",
    category: "NICCHIA",
    referencePrice: 25.00,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "SpaceX per i piccoli. Unica alternativa quotata per il settore spaziale. Contratti NASA e militari in crescita.",
    risks: "Non ancora profittevole. Settore capital-intensive. Volatile.",
    targetPrice: 35.00,
    stopLoss: 18.00,
    dividendYield: 0,
    timeHorizon: "18-24 mesi",
    maxBudgetPerOp: 50,
  },
  {
    ticker: "GRAB",
    name: "Grab Holdings",
    category: "NICCHIA",
    referencePrice: 5.50,
    currency: "USD",
    action: "COMPRA",
    priority: "MEDIA",
    thesis: "Super-app del Sud-Est asiatico (ride-hailing, food delivery, pagamenti). 700M utenti. Ora profittevole. Prezzo bassissimo.",
    risks: "Mercato emergente. Competizione locale. Cambio valutario.",
    targetPrice: 8.00,
    stopLoss: 4.00,
    dividendYield: 0,
    timeHorizon: "12-18 mesi",
    maxBudgetPerOp: 60,
  },
  {
    ticker: "IONQ",
    name: "IonQ (Quantum Computing)",
    category: "NICCHIA",
    referencePrice: 35.00,
    currency: "USD",
    action: "MONITORA",
    priority: "BASSA",
    thesis: "Leader nel quantum computing. Settore nascente, potenziale enorme. Amazon e Microsoft sono partner.",
    risks: "Non profittevole. Tecnologia ancora sperimentale. Potrebbe crollare 50%+.",
    targetPrice: 50.00,
    stopLoss: 22.00,
    dividendYield: 0,
    timeHorizon: "24+ mesi",
    maxBudgetPerOp: 40,
  },
];

export const STRATEGY_RULES = [
  "Mai tutto su un titolo — diversifica su almeno 5-6 asset",
  "Compra a scaglioni — dividi in 2-3 acquisti nel tempo (cost averaging)",
  "Stop loss sempre — perdi max 5-7% su ogni operazione",
  "Prendi profitti parziali — quando un titolo fa +30%, vendi metà e tieni il resto",
  "Dividendi reinvestiti — ISP, ENI, Enel pagano dividendi alti, reinvestili",
  "Crypto max 10-15% del portafoglio — troppo volatile per di più",
  "Nicchia max 20% — alto potenziale ma alto rischio",
  "Non inseguire i rialzi — se un titolo è già salito molto, aspetta un pullback",
  "Impara dagli errori — PayPal e ADA hanno colpito stop loss: i turnaround sono rischiosi",
  "Controlla il VIX — sopra 25 cautela, sotto 15 puoi essere più aggressivo",
];

// Lezioni dalla strategia precedente (per il prompt AI)
export const STRATEGY_LESSONS = [
  "VINCENTE: Difesa (Leonardo +139%) — il riarmo europeo è un megatrend forte",
  "VINCENTE: Banche italiane (Intesa +43%, BofA +41%) — utili record e buyback funzionano",
  "VINCENTE: Utilities (Enel +44%) — taglio tassi le ha spinte",
  "VINCENTE: Dividendi alti (ISP, ENI, KO) — il dividendo protegge anche quando il titolo non sale",
  "PERDENTE: PayPal (-32%) — i turnaround tech sono rischiosi, evitare chi perde market share",
  "PERDENTE: Cardano (-47%) — le altcoin senza uso reale crollano in bear market",
  "VINCENTE: Intel (+341%) — il turnaround ha funzionato grazie ai finanziamenti CHIPS Act",
  "LEZIONE: Le azioni con dividendo alto hanno perso meno di quelle senza dividendo",
  "LEZIONE: Le nicchia europee (Leonardo) hanno sovraperformato le big tech USA",
];

export function checkStrategy(
  picks: StrategyPick[],
  currentPrices: Map<string, number>,
  analystData: Map<string, string>,
): StrategyCheck[] {
  return picks.map(pick => {
    const current = currentPrices.get(pick.ticker) || 0;
    if (current === 0) {
      return {
        pick, currentPrice: 0, changePct: 0, status: "IN LINEA" as const,
        verdict: "Dati non disponibili", analystConsensus: null, stillBuy: false,
      };
    }

    const changePct = +((current - pick.referencePrice) / pick.referencePrice * 100).toFixed(1);
    const analyst = analystData.get(pick.ticker) || null;

    let status: StrategyCheck["status"];
    let verdict: string;
    let stillBuy: boolean;

    if (current <= pick.stopLoss) {
      status = "STOP LOSS";
      verdict = `Prezzo sotto lo stop loss (${pick.currency} ${pick.stopLoss}). VENDERE o non entrare.`;
      stillBuy = false;
    } else if (current >= pick.targetPrice) {
      status = "TARGET RAGGIUNTO";
      verdict = `Target raggiunto! Prendere profitti o alzare stop loss. ${changePct > 0 ? "+" : ""}${changePct}%.`;
      stillBuy = false;
    } else if (changePct < -10) {
      status = "ATTENZIONE";
      verdict = `In calo del ${changePct}%. Verificare fondamentali. Potrebbe essere opportunità se la tesi regge.`;
      stillBuy = true;
    } else if (changePct > 15) {
      status = "IN LINEA";
      verdict = `+${changePct}% — strategia funziona. Alzare stop loss.`;
      stillBuy = false;
    } else if (Math.abs(changePct) <= 5) {
      status = "CONFERMATA";
      verdict = `Prezzo stabile (${changePct > 0 ? "+" : ""}${changePct}%). Buon momento per entrare.`;
      stillBuy = pick.action === "COMPRA" || pick.action === "ACCUMULA";
    } else {
      status = "IN LINEA";
      verdict = `${changePct > 0 ? "+" : ""}${changePct}%. In linea con le aspettative.`;
      stillBuy = changePct < 10 && (pick.action === "COMPRA" || pick.action === "ACCUMULA");
    }

    return { pick, currentPrice: current, changePct, status, verdict, analystConsensus: analyst, stillBuy };
  });
}
