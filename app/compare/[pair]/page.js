// app/compare/[pair]/page.js
// Dynamic compare page — param name is "pair" (not "slug") to avoid Next.js routing conflicts

import { getQuarterlyData } from "@/lib/notion";
import { PALETTE, buildAnnualData } from "@/lib/helpers";
import { buildMetadata, breadcrumbSchema, JsonLd } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const KNOWN_COLORS = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };

function pairToTickers(pair) {
  const parts = pair.toLowerCase().split("-vs-");
  if (parts.length !== 2) return null;
  return [parts[0].toUpperCase(), parts[1].toUpperCase()];
}

function colorOf(ticker, allCompanies) {
  return KNOWN_COLORS[ticker] || allCompanies.find(c => c.ticker === ticker)?.color || "#8b949e";
}

const fmt    = v => v == null ? "—" : typeof v === "number" ? v.toLocaleString() : v;
const fmtM   = v => v == null ? "—" : `$${(v * 100).toFixed(1)}M`;
const fmtD   = v => v == null ? "—" : `$${v.toLocaleString()}`;
const fmtEh  = v => v == null ? "—" : `${v} EH/s`;
const fmtMW  = v => v == null ? "—" : `${fmt(v)} MW`;
const fmtJTH = v => v == null ? "—" : `${v} J/TH`;
const fmtKwh = v => v == null ? "—" : `$${v}/kWh`;

function winner(a, b, lowerBetter = false) {
  if (a == null && b == null) return null;
  if (a == null) return "b";
  if (b == null) return "a";
  if (lowerBetter) return a < b ? "a" : a > b ? "b" : null;
  return a > b ? "a" : a < b ? "b" : null;
}

export async function generateMetadata({ params }) {
  const { pair } = await params;
  const tickers = pairToTickers(pair);
  if (!tickers) return { title: "Not Found" };
  const [tkA, tkB] = tickers;
  return buildMetadata({
    title: `${tkA} vs ${tkB} — Bitcoin Mining Comparison`,
    description: `Compare ${tkA} and ${tkB} across BTC production, hashrate, cost per BTC, revenue, and profitability. Data sourced from SEC filings.`,
    path: `/compare/${pair}`,
  });
}

export default async function ComparePage({ params }) {
  const { pair } = await params;
  const tickers = pairToTickers(pair);
  if (!tickers) notFound();
  const [tkA, tkB] = tickers;

  const allData = await getQuarterlyData();
  if (!allData.length) notFound();

  const companyMap = new Map();
  for (const r of allData) {
    if (!r.ticker || !r.company) continue;
    if (!companyMap.has(r.ticker)) companyMap.set(r.ticker, { ticker: r.ticker, company: r.company });
  }
  const allCompanies = Array.from(companyMap.values());

  const infoA = companyMap.get(tkA);
  const infoB = companyMap.get(tkB);
  if (!infoA || !infoB) notFound();

  const colorA = colorOf(tkA, allCompanies);
  const colorB = colorOf(tkB, allCompanies);
  const nameA  = infoA.company;
  const nameB  = infoB.company;

  const rowsA   = allData.filter(r => r.ticker === tkA).sort((a, b) => b.quarter.localeCompare(a.quarter));
  const rowsB   = allData.filter(r => r.ticker === tkB).sort((a, b) => b.quarter.localeCompare(a.quarter));
  const latestA = rowsA[0];
  const latestB = rowsB[0];
  const latestQ = latestA?.quarter || latestB?.quarter || "";

  const annualData = buildAnnualData(allData);
  const latestYear = [...new Set(annualData.map(r => r.quarter))].sort().reverse()[0] || "";
  const annualA = annualData.find(r => r.ticker === tkA && r.quarter === latestYear);
  const annualB = annualData.find(r => r.ticker === tkB && r.quarter === latestYear);

  const otherPairs = [];
  for (let i = 0; i < allCompanies.length; i++) {
    for (let j = i + 1; j < allCompanies.length; j++) {
      const ca = allCompanies[i], cb = allCompanies[j];
      if ((ca.ticker === tkA && cb.ticker === tkB) || (ca.ticker === tkB && cb.ticker === tkA)) continue;
      otherPairs.push([ca, cb]);
    }
  }

  const groups = [
    { label: "Production", rows: [
      { label: `BTC mined (${latestQ})`,          valA: latestA?.btc_production,    valB: latestB?.btc_production,    render: fmt,   lowerBetter: false },
      { label: `BTC holdings (${latestQ})`,        valA: latestA?.btc_holdings,      valB: latestB?.btc_holdings,      render: fmt,   lowerBetter: false },
      { label: `Hashrate (${latestQ})`,            valA: latestA?.hashrate_ehs,      valB: latestB?.hashrate_ehs,      render: fmtEh, lowerBetter: false },
      { label: `Annual BTC mined (${latestYear})`, valA: annualA?.btc_production,    valB: annualB?.btc_production,    render: fmt,   lowerBetter: false },
    ]},
    { label: "Cost & Efficiency", rows: [
      { label: `Cash cost / BTC (${latestQ})`,    valA: latestA?.cash_cost_per_btc, valB: latestB?.cash_cost_per_btc, render: fmtD,   lowerBetter: true },
      { label: `Electricity price (${latestQ})`,  valA: latestA?.electricity_price, valB: latestB?.electricity_price, render: fmtKwh, lowerBetter: true },
      { label: `Fleet efficiency (${latestQ})`,   valA: latestA?.efficiency_jth,    valB: latestB?.efficiency_jth,    render: fmtJTH, lowerBetter: true },
      { label: `Power capacity (${latestQ})`,     valA: latestA?.power_capacity_mw, valB: latestB?.power_capacity_mw, render: fmtMW,  lowerBetter: false },
      { label: `Mining rigs (${latestQ})`,        valA: latestA?.miner_count,       valB: latestB?.miner_count,       render: fmt,    lowerBetter: false },
    ]},
    { label: "Financials", rows: [
      { label: `Revenue (${latestQ})`,            valA: latestA?.total_revenue_100m, valB: latestB?.total_revenue_100m, render: fmtM, lowerBetter: false },
      { label: `Gross profit (${latestQ})`,       valA: latestA?.gross_profit_100m,  valB: latestB?.gross_profit_100m,  render: fmtM, lowerBetter: false },
      { label: `Net income (${latestQ})`,         valA: latestA?.net_income_100m,    valB: latestB?.net_income_100m,    render: fmtM, lowerBetter: false },
      { label: `Annual revenue (${latestYear})`,  valA: annualA?.total_revenue_100m, valB: annualB?.total_revenue_100m, render: fmtM, lowerBetter: false },
    ]},
  ];

  const scores = { a: 0, b: 0 };
  for (const g of groups) for (const row of g.rows) {
    const w = winner(row.valA, row.valB, row.lowerBetter);
    if (w === "a") scores.a++;
    if (w === "b") scores.b++;
  }

  const crumbSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: `${tkA} vs ${tkB}`, url: `/compare/${pair}` },
  ]);

  return (
    <>
      <JsonLd data={crumbSchema} />

      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
        <Link href="/">Home</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link href="/compare">Compare</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{tkA} vs {tkB}</span>
      </nav>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          <span style={{ color: colorA }}>{tkA}</span>
          <span style={{ color: "var(--text3)", margin: "0 10px" }}>vs</span>
          <span style={{ color: colorB }}>{tkB}</span>
          <span style={{ fontWeight: 400, color: "var(--text2)", fontSize: 17 }}> — Mining Comparison</span>
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 680, lineHeight: 1.7, margin: 0 }}>
          Side-by-side comparison of {nameA} and {nameB} across production, cost efficiency,
          and financial performance. Data sourced from SEC filings. Latest quarter: {latestQ}.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 28, alignItems: "center" }}>
        <div style={{ background: "var(--bg2)", border: `2px solid ${scores.a >= scores.b ? colorA : "var(--border)"}`, borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: colorA, fontFamily: "monospace" }}>{tkA}</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{nameA}</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12 }}>{scores.a}</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>metrics ahead</div>
          <Link href={`/company/${tkA}`} style={{ display: "block", marginTop: 10, fontSize: 12, color: colorA }}>View {tkA} profile →</Link>
        </div>
        <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 16, fontWeight: 700 }}>VS</div>
        <div style={{ background: "var(--bg2)", border: `2px solid ${scores.b > scores.a ? colorB : "var(--border)"}`, borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: colorB, fontFamily: "monospace" }}>{tkB}</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{nameB}</div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12 }}>{scores.b}</div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>metrics ahead</div>
          <Link href={`/company/${tkB}`} style={{ display: "block", marginTop: 10, fontSize: 12, color: colorB }}>View {tkB} profile →</Link>
        </div>
      </div>

      {groups.map(group => (
        <div key={group.label} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{group.label}</h2>
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>Metric</th>
                <th className="r" style={{ color: colorA }}>{tkA}</th>
                <th className="r" style={{ color: colorB }}>{tkB}</th>
                <th>Edge</th>
              </tr></thead>
              <tbody>
                {group.rows.map((row, i) => {
                  const w = winner(row.valA, row.valB, row.lowerBetter);
                  return (
                    <tr key={i}>
                      <td style={{ fontSize: 13 }}>{row.label}</td>
                      <td className="r m" style={{ color: w === "a" ? colorA : "inherit", fontWeight: w === "a" ? 600 : 400 }}>
                        {row.render(row.valA)}{w === "a" && <span style={{ marginLeft: 4, fontSize: 10, color: colorA }}>▲</span>}
                      </td>
                      <td className="r m" style={{ color: w === "b" ? colorB : "inherit", fontWeight: w === "b" ? 600 : 400 }}>
                        {row.render(row.valB)}{w === "b" && <span style={{ marginLeft: 4, fontSize: 10, color: colorB }}>▲</span>}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {w === "a" && <span style={{ color: colorA, fontWeight: 600 }}>{tkA}</span>}
                        {w === "b" && <span style={{ color: colorB, fontWeight: 600 }}>{tkB}</span>}
                        {!w && <span style={{ color: "var(--text3)" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 24 }}>
        ▲ indicates the stronger metric. Data from SEC 10-Q/10-K filings.{" "}
        <Link href="/methodology">See methodology →</Link>
      </p>

      {otherPairs.length > 0 && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Compare Other Companies</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {otherPairs.slice(0, 10).map(([ca, cb]) => (
              <Link key={`${ca.ticker}-${cb.ticker}`} href={`/compare/${ca.ticker.toLowerCase()}-vs-${cb.ticker.toLowerCase()}`} className="tag" style={{ padding: "5px 12px" }}>
                <span style={{ color: colorOf(ca.ticker, allCompanies) }}>{ca.ticker}</span>
                <span style={{ color: "var(--text3)", margin: "0 4px", fontSize: 11 }}>vs</span>
                <span style={{ color: colorOf(cb.ticker, allCompanies) }}>{cb.ticker}</span>
              </Link>
            ))}
          </div>
          <Link href="/compare" style={{ fontSize: 13, color: "var(--orange)" }}>All comparisons →</Link>
        </div>
      )}

      <div className="cta-banner">
        <h3>Track {tkA} and {tkB} in real-time</h3>
        <p>Live production data, side-by-side analytics, and alerts with Nonce.app</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
