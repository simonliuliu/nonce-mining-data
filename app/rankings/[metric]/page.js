// app/rankings/[metric]/page.js
import { getQuarterlyData } from "@/lib/notion";
import { TICKER_COLORS, PALETTE, getQuarters, enrichRows, getCompanies, find } from "@/lib/helpers";
import RankingClient from "./RankingClient";
import RankingNavStrip from "./RankingNavStrip";
import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// Revenue removed from config
const META_CONFIG = {
  production: {
    title: "BTC Production",
    fullTitle: "Bitcoin Mining Companies Ranked by BTC Production",
    desc: "Sorted by BTC self-mined — highest first",
    glossarySlug: "btc-production",
    barUnit: "BTC", barLabel: "BTC production (latest quarter)",
    trendLabel: "BTC production — quarterly trend (top 8)",
    field: "btc_production", sortAsc: false,
    tableCols: ["btc_production","qoq","yoy","hashrate_ehs","btc_holdings","cash_cost_per_btc"],
  },
  hashrate: {
    title: "Hashrate",
    fullTitle: "Bitcoin Mining Companies Ranked by Hashrate",
    desc: "Sorted by operational computing power (EH/s) — highest first",
    glossarySlug: "hashrate",
    barUnit: "EH/s", barLabel: "Hashrate (latest quarter, EH/s)",
    trendLabel: "Hashrate — quarterly trend (top 8)",
    field: "hashrate_ehs", sortAsc: false,
    tableCols: ["hashrate_ehs","qoq_hash","yoy_hash","btc_production","power_capacity_mw","efficiency_jth"],
  },
  holdings: {
    title: "BTC Holdings",
    fullTitle: "Bitcoin Mining Companies Ranked by BTC Holdings",
    desc: "Sorted by BTC on balance sheet — highest first",
    glossarySlug: "btc-holdings",
    barUnit: "BTC", barLabel: "BTC holdings (latest quarter)",
    trendLabel: "BTC holdings — quarterly trend (top 8)",
    field: "btc_holdings", sortAsc: false,
    tableCols: ["btc_holdings","qoq_hold","btc_production","hashrate_ehs"],
  },
  cost: {
    title: "Cash Cost per BTC",
    fullTitle: "Bitcoin Mining Companies Ranked by Cash Cost per BTC",
    desc: "Direct cash cost per BTC — lowest is best",
    glossarySlug: "cash-cost-per-btc",
    barUnit: "$/BTC", barLabel: "Cash cost per BTC (latest quarter)",
    trendLabel: "Cash cost per BTC — quarterly trend (top 8)",
    field: "cash_cost_per_btc", sortAsc: true,
    // both cost columns included
    tableCols: ["cash_cost_per_btc","energy_cost_per_btc","electricity_price","efficiency_jth","power_capacity_mw","btc_production"],
  },
  efficiency: {
    title: "Fleet Efficiency",
    fullTitle: "Bitcoin Mining Companies Ranked by Fleet Efficiency",
    desc: "Energy per terahash (J/TH) — lower is better",
    glossarySlug: "fleet-efficiency",
    barUnit: "J/TH", barLabel: "Fleet efficiency (latest quarter, J/TH)",
    trendLabel: "Fleet efficiency — quarterly trend (top 8)",
    field: "efficiency_jth", sortAsc: true,
    tableCols: ["efficiency_jth","cash_cost_per_btc","energy_cost_per_btc","power_capacity_mw","hashrate_ehs","btc_production"],
  },
};

export async function generateMetadata({ params }) {
  const { metric } = await params;
  const cfg = META_CONFIG[metric];
  if (!cfg) return { title: "Not Found" };
  return buildMetadata({
    title: cfg.fullTitle,
    description: `Compare ${cfg.title.toLowerCase()} across all major public Bitcoin mining companies. Updated quarterly from SEC filings.`,
    path: `/rankings/${metric}`,
  });
}

function buildBarData(rows, field, sortAsc) {
  return rows
    .filter(r => r[field] != null && r[field] > 0)
    .sort((a, b) => sortAsc ? (a[field]||Infinity)-(b[field]||Infinity) : (b[field]||0)-(a[field]||0))
    .map((r, i) => ({ ticker: r.ticker, company: r.company, value: r[field], color: TICKER_COLORS[r.ticker] || PALETTE[i % PALETTE.length] }));
}

function buildTrendData(data, field, quarters) {
  const companies = getCompanies(data);
  return quarters.map(q => {
    const obj = { quarter: q };
    for (const { company, ticker } of companies) {
      const r = find(data, company, q);
      obj[ticker] = r?.[field] ?? null;
    }
    return obj;
  });
}

function buildSummary(rows, field, sortAsc) {
  const vals = rows.map(r => r[field]).filter(v => v != null && v > 0);
  if (!vals.length) return { count: 0 };
  const total = vals.reduce((s, v) => s + v, 0);
  const sorted = [...rows].filter(r => r[field] > 0).sort((a, b) => sortAsc ? a[field]-b[field] : b[field]-a[field]);
  return { total, avg: total/vals.length, max: Math.max(...vals), min: Math.min(...vals), count: vals.length, topTicker: sorted[0]?.ticker || "—", topValue: sorted[0]?.[field] };
}

export default async function RankingPage({ params }) {
  const { metric } = await params;
  const cfg = META_CONFIG[metric];
  if (!cfg) notFound();

  const [data] = await Promise.all([getQuarterlyData()]);

  const quarters = getQuarters(data);
  const latestQ  = quarters[quarters.length - 1] || "";
  const latestRows = enrichRows(data, latestQ);

  const enrichedByQuarter = {};
  for (const q of quarters) enrichedByQuarter[q] = enrichRows(data, q);

  const barData   = buildBarData(latestRows, cfg.field, cfg.sortAsc);
  const trendData = buildTrendData(data, cfg.field, quarters);
  const summary   = buildSummary(latestRows, cfg.field, cfg.sortAsc);
  const companies = getCompanies(data);

  return (
    <>
      <RankingNavStrip />
      <RankingClient
        metric={metric}
        meta={cfg}
        barData={barData}
        trendData={trendData}
        summary={summary}
        enrichedByQuarter={enrichedByQuarter}
        quarters={quarters}
        companies={companies}
      />
    </>
  );
}
