// app/compare/page.js — Server Component
import { getQuarterlyData } from "@/lib/notion";
import { PALETTE } from "@/lib/helpers";
import { buildMetadata } from "@/lib/seo";
import CompareSelector from "./CompareSelector";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Compare Bitcoin Mining Companies",
  description:
    "Compare any two public Bitcoin mining companies side-by-side: BTC production, hashrate, cost per BTC, revenue, and profitability. Data from SEC filings.",
  path: "/compare",
});

const KNOWN_COLORS = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };

export default async function CompareLandingPage() {
  const allData = await getQuarterlyData();

  const companyMap = new Map();
  for (const r of allData) {
    if (!r.ticker || !r.company) continue;
    if (!companyMap.has(r.ticker) || r.quarter > companyMap.get(r.ticker).quarter) {
      companyMap.set(r.ticker, r);
    }
  }

  const companies = Array.from(companyMap.values())
    .sort((a, b) => (b.btc_production || 0) - (a.btc_production || 0))
    .map((r, i) => ({
      ticker: r.ticker,
      company: r.company,
      color: KNOWN_COLORS[r.ticker] || PALETTE[i % PALETTE.length],
    }));

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Compare
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          Compare Bitcoin Mining Companies
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Select any two companies to compare their BTC production, hashrate, cost efficiency,
          and financial performance side-by-side. Data sourced from SEC filings.
        </p>
      </div>

      {/* Selector card */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px", maxWidth: 640, marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 16 }}>
          Choose two companies to compare
        </div>
        {companies.length >= 2
          ? <CompareSelector companies={companies} />
          : <p style={{ color: "var(--text3)", fontSize: 13 }}>Not enough company data yet. Add companies to Notion.</p>
        }
      </div>

      {/* What's compared */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", maxWidth: 640 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          What's included in each comparison
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["BTC Production", "BTC Holdings", "Hashrate (EH/s)", "Cash Cost / BTC",
            "Fleet Efficiency (J/TH)", "Power Capacity (MW)", "Mining Revenue", "Gross Profit", "Net Income"]
            .map(label => (
              <div key={label} style={{ fontSize: 13, color: "var(--text2)", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "var(--green)", fontSize: 10 }}>✓</span> {label}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
