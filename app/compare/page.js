// app/compare/page.js — Server Component
import { getQuarterlyData } from "@/lib/notion";
import { buildMetadata } from "@/lib/seo";
import CompareSelector from "./CompareSelector";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Compare Bitcoin Mining Companies",
  description: "Compare any two public Bitcoin mining companies side-by-side. Data from SEC filings.",
  path: "/compare",
});

const INCLUDED = [
  "BTC Production",
  "BTC Holdings",
  "Hashrate (EH/s)",
  "Cash Cost / BTC",
  "Energy Cost / BTC",
  "Fleet Efficiency (J/TH)",
  "Power Capacity (MW)",
  "Mining Rigs",
];

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
    .map(r => ({ ticker: r.ticker, company: r.company }));

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
          Compare
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Compare Bitcoin Mining Companies
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
          Select any two companies to compare their BTC production, hashrate, and cost efficiency side-by-side.
          Data sourced from SEC filings.
        </p>
      </div>

      {/* Selector */}
      <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "24px",
        maxWidth: 600,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
          Choose two companies to compare
        </div>
        {companies.length >= 2
          ? <CompareSelector companies={companies} />
          : <p style={{ color: "var(--text3)", fontSize: 13 }}>Not enough company data yet.</p>
        }
      </div>

      {/* What's included — with green checkmarks */}
      <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        maxWidth: 600,
      }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
          What's included
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
          {INCLUDED.map(label => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)" }}>
              {/* Green checkmark */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="7" fill="rgba(76,175,80,0.15)" />
                <path d="M4 7l2 2 4-4" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
