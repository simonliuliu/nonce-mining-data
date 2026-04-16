import { getQuarterlyData, getAnnualCompanyData, getMetricBySlug, blocksToHtml } from "@/lib/notion";
import { COMPANIES, TICKERS, COLORS, PALETTE, getQuarters, getYears, enrichRows, buildAnnualData } from "@/lib/helpers";
import RankingClient from "./RankingClient";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const KNOWN = { MARA:"#F7931A", CLSK:"#00D4AA", BTDR:"#6C8EFF", CANG:"#FF6B9D" };

// Per-metric page configuration
const METRIC_META = {
  production: {
    title: "BTC Production", fullTitle: "Bitcoin Mining Companies Ranked by BTC Production",
    desc: "Compare Bitcoin production across all major public mining companies.",
    glossarySlug: "btc-production",
    barKey: "btc_production", barUnit: "BTC", barLabel: "BTC production (2025)",
    trendKey: "btc_production", trendLabel: "BTC mined",
    tableCols: ["btc_production","3m","6m","yoy","btc_per_ehs","hashrate_ehs"],
  },
  hashrate: {
    title: "Hashrate & Infrastructure", fullTitle: "Bitcoin Mining Companies Ranked by Hashrate",
    desc: "Compare operational hashrate and mining infrastructure across public miners.",
    glossarySlug: "hashrate",
    barKey: "hashrate_ehs", barUnit: "EH/s", barLabel: "Hashrate (2025, EH/s)",
    trendKey: "hashrate_ehs", trendLabel: "Hashrate (EH/s)",
    tableCols: ["hashrate_ehs","3m_hash","yoy_hash","power_capacity_mw","miner_count","efficiency_jth","miner_model"],
  },
  cost: {
    title: "Mining Cost Analysis", fullTitle: "Bitcoin Mining Companies Ranked by Production Cost",
    desc: "Compare cash cost, all-in cost, and electricity prices across Bitcoin miners.",
    glossarySlug: "cash-cost-per-btc",
    barKey: "cash_cost_per_btc", barUnit: "$/BTC", barLabel: "Cash cost per BTC (2025)",
    trendKey: "cash_cost_per_btc", trendLabel: "Cash cost ($/BTC)",
    tableCols: ["cash_cost_per_btc","all_in_cost_per_btc","electricity_price","efficiency_jth","power_capacity_mw"],
    sortAsc: true,
  },
  revenue: {
    title: "Revenue & Profitability", fullTitle: "Bitcoin Mining Companies Ranked by Revenue",
    desc: "Compare revenue, gross profit, and margins across public Bitcoin mining companies.",
    glossarySlug: "mining-revenue",
    barKey: "total_revenue_100m", barUnit: "$100M", barLabel: "Total revenue (2025, $100M)",
    trendKey: "total_revenue_100m", trendLabel: "Revenue ($100M)",
    tableCols: ["total_revenue_100m","mining_revenue_100m","cost_of_revenue_100m","gross_profit_100m","gross_margin","net_income_100m","net_margin"],
  },
  holdings: {
    title: "BTC Holdings & Treasury", fullTitle: "Bitcoin Mining Companies Ranked by BTC Holdings",
    desc: "Compare Bitcoin treasury holdings and accumulation strategies across public miners.",
    glossarySlug: "btc-holdings",
    barKey: "btc_holdings", barUnit: "BTC", barLabel: "BTC holdings (2025)",
    trendKey: "btc_holdings", trendLabel: "BTC held",
    tableCols: ["btc_holdings","btc_production","hold_prod_ratio","total_revenue_100m"],
  },
  efficiency: {
    title: "Fleet Efficiency & Equipment", fullTitle: "Bitcoin Mining Companies Ranked by Fleet Efficiency",
    desc: "Compare mining fleet efficiency, equipment models, and energy usage across miners.",
    glossarySlug: "fleet-efficiency",
    barKey: "efficiency_jth", barUnit: "J/TH", barLabel: "Fleet efficiency (2025, J/TH)",
    trendKey: "efficiency_jth", trendLabel: "J/TH",
    tableCols: ["efficiency_jth","miner_count","miner_model","power_capacity_mw","hashrate_ehs","electricity_price"],
    sortAsc: true,
  },
};

export async function generateMetadata({ params }) {
  const { metric } = await params;
  const m = METRIC_META[metric];
  if (!m) return { title: "Not Found" };
  return { title: `${m.fullTitle} — Nonce Mining Data`, description: m.desc };
}

export default async function RankingPage({ params }) {
  const { metric } = await params;
  const meta = METRIC_META[metric];
  if (!meta) notFound();

  let data = [], annual = [], quarters = [], years = [], annualData = [];
  try {
    data = await getQuarterlyData();
    quarters = getQuarters(data);
    years = getYears(data);
    annualData = buildAnnualData(data);
  } catch(e) { console.error("[Rankings] Quarterly data fetch failed:", e.message); }

  try { annual = await getAnnualCompanyData(); } catch(e) {}

  // Build bar chart data (all companies, 2025)
  const byYearTicker = {};
  for (const r of annual) {
    if (!r.ticker || !r.fiscal_year) continue;
    const yk = String(r.fiscal_year);
    if (!byYearTicker[yk]) byYearTicker[yk] = {};
    if (!byYearTicker[yk][r.ticker] || (r.btc_production||0) > (byYearTicker[yk][r.ticker].btc_production||0)) {
      byYearTicker[yk][r.ticker] = r;
    }
  }
  const all2025 = byYearTicker["2025"] ? Object.values(byYearTicker["2025"]) : [];
  const barData = all2025
    .filter(r => r[meta.barKey] != null && r[meta.barKey] > 0)
    .sort((a,b) => meta.sortAsc ? (a[meta.barKey] - b[meta.barKey]) : (b[meta.barKey] - a[meta.barKey]))
    .map((r, i) => ({
      ticker: r.ticker, company: r.company,
      value: r[meta.barKey],
      color: KNOWN[r.ticker] || PALETTE[i % PALETTE.length],
    }));

  // Build trend data (quarterly, 4 companies with line series)
  const trendData = quarters.map(q => {
    const row = { quarter: q };
    for (const c of COMPANIES) {
      const rec = data.find(r => r.company === c && r.quarter === q);
      row[TICKERS[c]] = rec?.[meta.trendKey] || null;
    }
    return row;
  });

  // Summary stats for cards
  const vals2025 = all2025.map(r => r[meta.barKey]).filter(v => v != null && v > 0);
  const summary = {
    total: vals2025.reduce((s,v) => s+v, 0),
    avg: vals2025.length > 0 ? vals2025.reduce((s,v) => s+v, 0) / vals2025.length : 0,
    max: vals2025.length > 0 ? Math.max(...vals2025) : 0,
    min: vals2025.length > 0 ? Math.min(...vals2025) : 0,
    count: vals2025.length,
    topCompany: barData[0]?.company || "—",
    topTicker: barData[0]?.ticker || "",
  };

  // Additional stats per metric type
  if (metric === "revenue") {
    const margins = all2025.filter(r => r.gross_profit_100m != null && r.total_revenue_100m);
    summary.profitableCount = margins.filter(r => r.gross_profit_100m > 0).length;
    summary.lossCount = margins.filter(r => r.gross_profit_100m <= 0).length;
    summary.avgMargin = margins.length > 0
      ? margins.reduce((s,r) => s + (r.gross_profit_100m/r.total_revenue_100m)*100, 0) / margins.length : 0;
  }
  if (metric === "holdings") {
    summary.totalHeld = all2025.reduce((s,r) => s + (r.btc_holdings||0), 0);
  }

  // Enriched rows for table
  const enrichedByQuarter = {};
  for (const q of quarters) enrichedByQuarter[q] = enrichRows(data, q);

  // Annual all-company rows with YoY
  const annualYearsList = [...new Set(annual.map(r => String(r.fiscal_year)).filter(Boolean))].sort();
  const annualAllRows = {};
  for (const y of annualYearsList) {
    const rows = byYearTicker[y] ? Object.values(byYearTicker[y]) : [];
    const prevData = byYearTicker[String(Number(y)-1)] || {};
    annualAllRows[y] = rows.map(r => {
      const prev = prevData[r.ticker];
      const yoy = (f) => prev && r[f] != null && prev[f] != null && prev[f] !== 0 ? ((r[f]-prev[f])/Math.abs(prev[f]))*100 : null;
      return { ...r, company: r.company, ticker: r.ticker, sourceDate: y,
        yoyProd: yoy("btc_production"), yoyHash: yoy("hashrate_ehs"), yoyHold: yoy("btc_holdings"),
        yoyRev: yoy("total_revenue_100m"), yoyCost: yoy("cash_cost_per_btc"),
        qoqProd: null, momProd: null, qoqHash: null, qoqHold: null,
      };
    }).sort((a,b) => {
      const av = a[meta.barKey], bv = b[meta.barKey];
      if (av == null) return 1; if (bv == null) return -1;
      return meta.sortAsc ? (av - bv) : (bv - av);
    });
  }

  // Glossary text
  let glossaryHtml = "";
  try {
    const mg = await getMetricBySlug(meta.glossarySlug);
    if (mg?.blocks) glossaryHtml = blocksToHtml(mg.blocks);
  } catch(e) {}

  // Other ranking links
  const otherMetrics = Object.entries(METRIC_META).filter(([k]) => k !== metric);

  return (
    <>
      <RankingClient
        metric={metric}
        meta={meta}
        barData={barData}
        trendData={trendData}
        summary={summary}
        enrichedByQuarter={enrichedByQuarter}
        annualAllRows={annualAllRows}
        annualYearsList={annualYearsList}
        quarters={quarters}
      />

      {/* Glossary text */}
      {glossaryHtml && (
        <div className="text-block prose" style={{ marginTop: 8 }}>
          <h3>About {meta.title}</h3>
          <div dangerouslySetInnerHTML={{ __html: glossaryHtml }} />
          <p><Link href={`/metrics/${meta.glossarySlug}`}>Read full metric definition →</Link></p>
        </div>
      )}

      {/* Related rankings */}
      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 10 }}>Other rankings</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {otherMetrics.map(([k, v]) => (
          <Link key={k} href={`/rankings/${k}`} className="tag" style={{ padding: "6px 14px" }}>{v.title}</Link>
        ))}
        <Link href="/methodology" className="tag" style={{ padding: "6px 14px" }}>Methodology</Link>
      </div>

      <div className="cta-banner">
        <h3>Track {meta.title.toLowerCase()} in real-time</h3>
        <p>Nonce.app provides live data, alerts, and analysis tools</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
