"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportAdvisoryPDF(report: any) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("it-IT");

  // Header
  doc.setFillColor(15, 14, 42);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(91, 138, 245);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Trading Advisor", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report generato il ${now}`, 14, 26);
  doc.text(`Fear & Greed: ${report.fearGreed?.score || "N/A"}/100 | Sentiment: ${report.sentiment || "N/A"} | VIX: ${report.vix?.toFixed(1) || "N/A"}`, 14, 33);

  let y = 48;

  // Condizione mercato
  doc.setTextColor(91, 138, 245);
  doc.setFontSize(14);
  doc.text("Condizione Mercato", 14, y);
  y += 7;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(report.marketCondition || "", 14, y, { maxWidth: 180 });
  y += 10;

  // AI Briefing
  if (report.aiBriefing) {
    doc.setTextColor(91, 138, 245);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Briefing AI", 14, y);
    y += 7;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(report.aiBriefing, 180);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 5;
  }

  // Raccomandazioni COMPRA
  const buys = (report.recommendations || []).filter((r: any) => r.action === "COMPRA");
  if (buys.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("COMPRA", 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["Ticker", "Nome", "Prezzo", "Target", "Stop Loss", "Guadagno %", "Conf.", "Budget"]],
      body: buys.map((r: any) => [
        r.ticker,
        r.name?.substring(0, 15) || "",
        `$${r.currentPrice}`,
        `$${r.targetPrice}`,
        `$${r.stopLoss}`,
        `${r.expectedReturn > 0 ? "+" : ""}${r.expectedReturn}%`,
        `${r.confidence}%`,
        r.affordable ? "OK" : "Over",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 250, 245] },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Raccomandazioni ASPETTA
  const waits = (report.recommendations || []).filter((r: any) => r.action === "ASPETTA");
  if (waits.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(234, 179, 8);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ASPETTA", 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["Ticker", "Nome", "Prezzo", "Target", "Stop Loss", "Guadagno %", "Conf."]],
      body: waits.map((r: any) => [
        r.ticker,
        r.name?.substring(0, 15) || "",
        `$${r.currentPrice}`,
        `$${r.targetPrice}`,
        `$${r.stopLoss}`,
        `${r.expectedReturn > 0 ? "+" : ""}${r.expectedReturn}%`,
        `${r.confidence}%`,
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [234, 179, 8], textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [255, 252, 240] },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Da evitare
  if (report.avoidList?.length > 0) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DA EVITARE", 14, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    for (const item of report.avoidList) {
      doc.text(`• ${item.ticker}: ${item.reason}`, 14, y, { maxWidth: 180 });
      y += 5;
    }
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Questo report è solo a scopo informativo. Non è consulenza finanziaria professionale.", 14, 285);

  doc.save(`trading-advisor-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function exportStrategyPDF(data: any) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("it-IT");

  // Header
  doc.setFillColor(15, 14, 42);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(91, 138, 245);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("La Mia Strategia", 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Confronto del ${now} | Strategia dal ${data.strategyDate}`, 14, 28);

  let y = 43;

  // Stats
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Confermate: ${data.stats.confirmed} | Da comprare: ${data.stats.stillBuy} | Attenzione: ${data.stats.warnings} | Target raggiunti: ${data.stats.targets}`, 14, y);
  y += 10;

  // AI Commentary
  if (data.aiCommentary) {
    doc.setTextColor(91, 138, 245);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Verdetto AI", 14, y);
    y += 6;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.aiCommentary, 180);
    doc.text(lines, 14, y);
    y += lines.length * 4.5 + 5;
  }

  // Tabella confronto
  if (y > 200) { doc.addPage(); y = 20; }

  autoTable(doc, {
    startY: y,
    head: [["Ticker", "Nome", "Rif.", "Attuale", "Var. %", "Status", "Comprare?"]],
    body: (data.checks || []).map((c: any) => [
      c.pick.ticker,
      c.pick.name?.substring(0, 12) || "",
      `${c.pick.currency === "EUR" ? "€" : "$"}${c.pick.referencePrice}`,
      c.currentPrice > 0 ? `${c.pick.currency === "EUR" ? "€" : "$"}${c.currentPrice}` : "N/D",
      `${c.changePct > 0 ? "+" : ""}${c.changePct}%`,
      c.status,
      c.stillBuy ? "SI" : "NO",
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [91, 138, 245], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [240, 245, 255] },
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Questo report è solo a scopo informativo. Non è consulenza finanziaria professionale.", 14, 285);

  doc.save(`strategia-${new Date().toISOString().split("T")[0]}.pdf`);
}
