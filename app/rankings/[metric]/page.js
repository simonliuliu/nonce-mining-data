import { getQuarterlyData, getAnnualCompanyData } from "@/lib/notion";
import { COMPANIES, TICKERS, COLORS, PALETTE, getQuarters, getYears, enrichRows, buildAnnualData } from "@/lib/helpers";
import RankingClient from "./RankingClient";
import RankingNavStrip from "./RankingNavStrip";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// ─── Meta config: maps URL metric → RankingClient's `meta` prop ─────────────

const META_CONFIG = {
  production: {
    title: "BTC Production",
    fullTitle: "Bitcoin Mining Companies Ranked by BTC Production",
    desc: "Sorted by BTC self-mined during the period — highest first",
    glossarySlug: "btc-production",
    barUnit: "BTC",
    barLabel: "BTC production comparison (latest period)",
    trendLabel: "BTC production",
    tableCols: ["btc_production", "btc_holdings", "3m", "yoy", "6m", "hashrate_ehs", "btc_per_ehs"],
    field: "btc_production",
    sortAsc: false,
  },
  hashrate: {
    title: "Hashrate",
    fullTitle: "Bitcoin Mining Companies Ranked by Hashrate",
    desc: "Sorted by operational computing power (EH/s) — highest first",
    glossarySlug: "hashrate",
    barUnit: "EH/s",
    barLabel: "Hashrate comparison (latest period, EH/s)",
    trendLabel: "Hashrate",
    tableCols: ["hashrate_ehs", "3m_hash", "yoy_hash", "btc_production", "btc_per_ehs", "power_capacity_mw", "efficiency_jth"],
    field: "hashrate_ehs",
    sortAsc: false,
  },
  holdings: {
    title: "BTC Holdings",
    fullTitle: "Bitcoin Mining Companies Ranked by BTC Holdings",
    desc: "Sorted by BTC held on balance sheet — highest first",
    glossarySlug: "btc-holdings",
    barUnit: "BTC",
    barLabel: "BTC holdings comparison (latest period)",
    trendLabel: "BTC holdings",
    tableCols: ["btc_holdings", "3m", "btc_production", "hold_prod_ratio", "hashrate_ehs"],
    field: "btc_holdings",
    sortAsc: false,
  },
  cost: {
    title: "Cash Cost per BTC",
    fullTitle: "Bitcoin Mining Companies Ranked by Cash Cost per BTC",
    desc: "Direct cash cost to mine one BTC — lowest is best",
    glossarySlug: "cash-cost-per-btc",
    barUnit: "$/BTC",
    barLabel: "Cash cost per BTC comparison (latest period)",
    trendLabel: "Cash cost per BTC",
    tableCols: ["cash_cost_per_btc", "all_in_cost_per_btc", "electricity_price", "efficiency_jth", "power_capacity_mw", "btc_production"],
    field: "cash_cost_per_btc",
    sortAsc: true,   // lower is better
  },
  revenue: {
    title: "Revenue",
    fullTitle: "Bitcoin Mining Companies Ranked by Revenue",
    desc: "Sorted by total revenue — highest first",
    glossarySlug: "mining-revenue",
    barUnit: "$100M",
    barLabel: "Revenue comparison (latest period, $100M)",
    trendLabel: "Revenue",
    tableCols: ["total_revenue_100m", "mining_revenue_100m", "gross_profit_100m", "net_income_100m", "gross_margin", "net_margin"],
    field: "total_revenue_100m",
    sortAsc: false,
  },
  efficiency: {
    title: "Fleet Efficiency",
    fullTitle: "Bitcoin Mining Companies Ranked by Fleet Efficiency",
    desc: "Energy per terahash (J/TH) — lower is better",
    glossarySlug: "fleet-efficiency",
    barUnit: "J/TH",
    barLabel: "Fleet efficiency comparison (latest period, J/TH)",
    trendLabel: "Fleet efficiency (J/TH)",
    tableCols: ["efficiency_jth", "miner_model", "miner_count", "power_capacity_mw", "hashrate_ehs", "btc_production"],
    field: "efficiency_jth",
    sortAsc: true,   // lower is better
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TICKER_COLOR = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };

function colorOf(ticker, idx) {
  return TICKER_COLOR[ticker] || PALETTE[idx % PALETTE.length];
}

/** Build bar chart data: latest period, all companies, sorted by field */
function buildBarData(rows, field, sortAsc) {
  return rows
    .filter(r => r[field] != null)
    .sort((a, b) => sortAsc
      ? (a[field] || Infinity) - (b[field] || Infinity)
      : (b[field] || 0) - (a[field] || 0))
    .map((r, i) => ({
      ticker: r.ticker,
      company: r.company,
      value: r[field],
      color: colorOf(r.ticker, i),
    }));
}

/** Build trend line data: one object per quarter, keyed by ticker */
function buildTrendData(rawData, field, quarters) {
  return quarters.map(q => {
    const obj = { quarter: q };
    for (const c of COMPANIES) {
      const r = rawData.find(d => d.company === c && d.quarter === q);
      const ticker = TICKERS[c];
      obj[ticker] = r?.[field] ?? null;
    }
    return obj;
  });
}

/** Compute summary statistics from a rows array */
function buildSummary(rows, field, metric) {
  const vals = rows.map(r => r[field]).filter(v => v != null && v > 0);
  if (!vals.length) return { total: 0, avg: 0, max: 0, min: 0, count: rows.length, topCompany: "—" };

  const total = vals.reduce((s, v) => s + v, 0);
  const avg = total / vals.length;
  const max = Math.max(...vals);
  const min = Math.min(...vals);

  // topCompany: highest for most metrics, lowest for cost/efficiency
  const sorted = [...rows].filter(r => r[field] != null && r[field] > 0);
  const top = metric === "cost" || metric === "efficiency"
    ? sorted.sort((a, b) => a[field] - b[field])[0]
    : sorted.sort((a, b) => b[field] - a[field])[0];

  // Revenue-specific extras
  const profitableCount = rows.filter(r => (r.gross_profit_100m || 0) > 0).length;
  const lossCount = rows.filter(r => (r.gross_profit_100m || 0) < 0).length;
  const marginVals = rows.filter(r => r.gross_profit_100m != null && r.total_revenue_100m).map(r => r.gross_profit_100m / r.total_revenue_100m * 100);
  const avgMargin = marginVals.length ? marginVals.reduce((s, v) => s + v, 0) / marginVals.length : 0;

  return {
    total, avg, max, min,
    count: vals.length,
    topCompany: top?.ticker || top?.company || "—",
    totalHeld: metric === "holdings" ? total : undefined,
    profitableCount, lossCount, avgMargin,
  };
}

/** Build annual rows matching enrichRows structure (for annualAllRows) */
function buildAnnualRows(rawData, annual, quarters) {
  const years = [...new Set(annual.map(r => String(r.fiscal_year)).filter(Boolean))].sort();
  const result = {};

  for (const y of years) {
    const yearData = annual.filter(r => String(r.fiscal_year) === y);
    if (!yearData.length) continue;

    // Build rows with QoQ/YoY from quarterly data
    const rows = yearData.map(r => {
      const lastQ = quarters.filter(q => q.startsWith(y)).sort().pop();
      const qIdx = quarters.indexOf(lastQ);
      const qRow = rawData.find(d => d.ticker === r.ticker && d.quarter === lastQ);
      const prevQ1 = qIdx >= 1 ? rawData.find(d => d.ticker === r.ticker && d.quarter === quarters[qIdx - 1]) : null;
      const prevQ2 = qIdx >= 2 ? rawData.find(d => d.ticker === r.ticker && d.quarter === quarters[qIdx - 2]) : null;

      const calc = (f, base, cmp) => base?.[f] != null && cmp?.[f] != null && cmp[f] !== 0
        ? ((base[f] - cmp[f]) / Math.abs(cmp[f])) * 100 : null;

      // YoY from annual
      const prevAnnual = annual.find(a => String(a.fiscal_year) === String(Number(y) - 1) && a.ticker === r.ticker);
      const yoy = (f) => r[f] != null && prevAnnual?.[f] != null && prevAnnual[f] !== 0
        ? ((r[f] - prevAnnual[f]) / Math.abs(prevAnnual[f])) * 100 : null;

      return {
        company: r.company, ticker: r.ticker,
        btc_production: r.btc_production, btc_holdings: r.btc_holdings,
        hashrate_ehs: r.hashrate_ehs, electricity_price: r.electricity_price,
        cash_cost_per_btc: r.cash_cost_per_btc, all_in_cost_per_btc: r.all_in_cost_per_btc,
        power_capacity_mw: r.power_capacity_mw, miner_count: r.miner_count,
        efficiency_jth: r.efficiency_jth, miner_model: r.miner_model,
        mining_revenue_100m: r.mining_revenue_100m, total_revenue_100m: r.total_revenue_100m,
        cost_of_revenue_100m: r.cost_of_revenue_100m,
        gross_profit_100m: r.gross_profit_100m, net_income_100m: r.net_income_100m,
        source_url: null, sourceDate: y,
        qoqProd: calc("btc_production", qRow, prevQ1),
        momProd: calc("btc_production", qRow, prevQ2),
        yoyProd: yoy("btc_production"),
        qoqHash: calc("hashrate_ehs", qRow, prevQ1),
        yoyHash: yoy("hashrate_ehs"),
        qoqHold: calc("btc_holdings", qRow, prevQ1),
      };
    }).sort((a, b) => (b.btc_production || 0) - (a.btc_production || 0));

    result[y] = rows;
  }
  return result;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { metric } = await params;
  const cfg = META_CONFIG[metric];
  if (!cfg) return { title: "Not Found" };
  return {
    title: `${cfg.fullTitle} — Nonce Mining Data`,
    description: `Compare ${cfg.title.toLowerCase()} across all major public Bitcoin mining companies. Updated quarterly from SEC filings.`,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function RankingPage({ params }) {
  const { metric } = await params;
  const cfg = META_CONFIG[metric];
  if (!cfg) notFound();

  // ── Fetch data ──
  const [rawData, annualRaw] = await Promise.all([
    getQuarterlyData(),
    getAnnualCompanyData().catch(() => []),
  ]);

  const quarters = getQuarters(rawData);
  const years = getYears(rawData);

  // ── enrichedByQuarter: { [quarter]: enrichedRows[] } ──
  const enrichedByQuarter = {};
  for (const q of quarters) {
    enrichedByQuarter[q] = enrichRows(rawData, q);
  }

  // ── annualAllRows from quarterly DB aggregation ──
  const annualFromQ = buildAnnualData(rawData);           // built from quarterly
  const annualYearsList = [...new Set(annualFromQ.map(r => r.quarter))].sort();
  const annualAllRows = {};
  for (const y of annualYearsList) {
    const rows = annualFromQ.filter(r => r.quarter === y).map(r => ({
      ...r,
      sourceDate: y,
      source_url: null,
      qoqProd: null, momProd: null, yoyProd: null,
      qoqHash: null, qoqHold: null,
    })).sort((a, b) => (b[cfg.field] || 0) - (a[cfg.field] || 0));
    annualAllRows[y] = rows;
  }

  // ── Latest quarter rows for barData & summary ──
  const latestQ = quarters[quarters.length - 1] || "";
  const latestRows = enrichedByQuarter[latestQ] || [];

  // ── Bar chart data ──
  const barData = buildBarData(latestRows, cfg.field, cfg.sortAsc);

  // ── Trend data: one point per quarter ──
  const trendData = buildTrendData(rawData, cfg.field, quarters);

  // ── Summary stats ──
  const summary = buildSummary(latestRows, cfg.field, metric);

  return (
    <>
      {/* Rankings nav strip — all 6 dimensions visible at top */}
      <RankingNavStrip />

      <RankingClient
        metric={metric}
        meta={cfg}
        barData={barData}
        trendData={trendData}
        summary={summary}
        enrichedByQuarter={enrichedByQuarter}
        annualAllRows={annualAllRows}
        annualYearsList={annualYearsList}
        quarters={quarters}
      />

      <div className="cta-banner">
        <h3>Need deeper {cfg.title.toLowerCase()} analysis?</h3>
        <p>Nonce.app provides real-time tracking and alerts</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
