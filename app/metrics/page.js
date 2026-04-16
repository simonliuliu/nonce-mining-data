// app/metrics/page.js
// Index page for all metric glossary pages
// Breadcrumb "Metrics" links here; users see all 8 metrics at a glance

import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import MetricCards from "./MetricCards";

export const metadata = buildMetadata({
  title: "Bitcoin Mining Metrics — Glossary & Definitions",
  description:
    "Definitions and explanations for every metric tracked on this site: BTC production, hashrate, cash cost per BTC, fleet efficiency, and more.",
  path: "/metrics",
});

const METRICS = [
  {
    slug: "btc-production",
    name: "BTC Production",
    unit: "BTC",
    icon: "⛏",
    desc: "Total Bitcoin self-mined by a company during a reporting period. The primary measure of operational output.",
    rankingUrl: "/rankings/production",
    color: "#F7931A",
  },
  {
    slug: "hashrate",
    name: "Hashrate",
    unit: "EH/s",
    icon: "⚡",
    desc: "Total computing power operated by a miner, measured in exahashes per second. Determines expected share of block rewards.",
    rankingUrl: "/rankings/hashrate",
    color: "#00D4AA",
  },
  {
    slug: "btc-holdings",
    name: "BTC Holdings",
    unit: "BTC",
    icon: "🏦",
    desc: "Total Bitcoin held on balance sheet at period end. Reflects treasury strategy and BTC price exposure.",
    rankingUrl: "/rankings/holdings",
    color: "#6C8EFF",
  },
  {
    slug: "cash-cost-per-btc",
    name: "Cash Cost per BTC",
    unit: "$/BTC",
    icon: "💰",
    desc: "Direct cash cost to mine one bitcoin — primarily electricity. The most-watched profitability indicator.",
    rankingUrl: "/rankings/cost",
    color: "#FF6B9D",
  },
  {
    slug: "all-in-cost-per-btc",
    name: "All-in Cost per BTC",
    unit: "$/BTC",
    icon: "📊",
    desc: "Total cost including depreciation, G&A, and overhead. The true economic cost of mining one BTC.",
    rankingUrl: "/rankings/cost",
    color: "#A78BFA",
  },
  {
    slug: "fleet-efficiency",
    name: "Fleet Efficiency",
    unit: "J/TH",
    icon: "🔋",
    desc: "Energy consumed per terahash of computing power. Lower is better — more efficient fleets earn more BTC per dollar of electricity.",
    rankingUrl: "/rankings/efficiency",
    color: "#34D399",
  },
  {
    slug: "power-capacity",
    name: "Power Capacity",
    unit: "MW",
    icon: "🏭",
    desc: "Total electrical infrastructure available for mining. Sets the physical ceiling for fleet size and hashrate.",
    rankingUrl: "/rankings/hashrate",
    color: "#FBBF24",
  },
  {
    slug: "revenue",
    name: "Revenue",
    unit: "$",
    icon: "💵",
    desc: "Total revenue from mining operations and other services. Driven by BTC production volume and spot price.",
    rankingUrl: "/rankings/revenue",
    color: "#60A5FA",
  },
];

export default function MetricsIndexPage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
        <Link href="/">Home</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>Metrics</span>
      </nav>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Metric Glossary
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          Bitcoin Mining Metrics
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Definitions, explanations, and data methodology for every metric tracked on this site.
          All data sourced from SEC filings and official company disclosures.
        </p>
      </div>

      {/* Metric cards grid — client component handles hover */}
      <MetricCards metrics={METRICS} />

      <div className="cta-banner">
        <h3>Track these metrics in real-time</h3>
        <p>Live data, alerts, and portfolio tracking with Nonce.app</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
