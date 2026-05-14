// app/compare/[pair]/page.js
import { getQuarterlyData } from "@/lib/notion";
import { PALETTE, TICKER_COLORS, getQuarters } from "@/lib/helpers";
import { buildMetadata, breadcrumbSchema, JsonLd } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

function pairToTickers(pair) {
  const parts = pair.toLowerCase().split("-vs-");
  if (parts.length !== 2) return null;
  return [parts[0].toUpperCase(), parts[1].toUpperCase()];
}

function colorOf(ticker) {
  return TICKER_COLORS[ticker] || "#8b949e";
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
    description: `Compare ${tkA} and ${tkB} across BTC production, hashrate, cost per BTC, and more. Data sourced from SEC filings.`,
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

  // Build company map from actual data
  const companyMap = new Map();
  for (const r of allData) {
    if (!r.ticker || !r.company) continue;
    if (!companyMap.has(r.ticker)) companyMap.set(r.ticker, { ticker: r.ticker, company: r.company });
  }
  const allCompanies = Array.from(companyMap.values());

  const infoA = companyMap.get(tkA);
  const infoB = companyMap.get(tkB);
  if (!infoA || !infoB) notFound();

  const colorA = colorOf(tkA);
  const colorB = colorOf(tkB);
  const nameA  = infoA.company;
  const nameB  = infoB.company;

  // Latest quarterly rows
  const rowsA   = allData.filter(r => r.ticker === tkA).sort((a, b) => b.quarter.localeCompare(a.quarter));
  const rowsB   = allData.filter(r => r.ticker === tkB).sort((a, b) => b.quarter.localeCompare(a.quarter));
  const latestA = rowsA[0];
  const latestB = rowsB[0];
  const latestQ = latestA?.quarter || latestB?.quarter || "";

  // Other pairs for navigation
  const otherPairs = [];
  for (let i = 0; i < allCompanies.length; i++) {
    for (let j = i + 1; j < allCompanies.length; j++) {
      const ca = allCompanies[i], cb = allCompanies[j];
      if ((ca.ticker === tkA && cb.ticker === tkB) || (ca.ticker === tkB && cb.ticker === tkA)) continue;
      otherPairs.push([ca, cb]);
    }
  }

  // Comparison groups — quarterly only
  const groups = [
    {
      label: "Production",
      rows: [
        { label: `BTC mined (${latestQ})`,    valA: latestA?.btc_production,    valB: latestB?.btc_production,    render: fmt,   lowerBetter: false },
        { label: `BTC holdings (${latestQ})`, valA: latestA?.btc_holdings,      valB: latestB?.btc_holdings,      render: fmt,   lowerBetter: false },
        { label: `Hashrate (${latestQ})`,     valA: latestA?.hashrate_ehs,      valB: latestB?.hashrate_ehs,      render: fmtEh, lowerBetter: false },
      ],
    },
    {
      label: "Cost & Efficiency",
      rows: [
        { label: `Cash cost / BTC (${latestQ})`,   valA: latestA?.cash_cost_per_btc,  valB: latestB?.cash_cost_per_btc,  render: fmtD,   lowerBetter: true },
        { label: `Energy cost / BTC (${latestQ})`, valA: latestA?.energy_cost_per_btc,valB: latestB?.energy_cost_per_btc,render: fmtD,   lowerBetter: true },
        { label: `Electricity price (${latestQ})`, valA: latestA?.electricity_price,  valB: latestB?.electricity_price,  render: fmtKwh, lowerBetter: true },
        { label: `Fleet efficiency (${latestQ})`,  valA: latestA?.efficiency_jth,     valB: latestB?.efficiency_jth,     render: fmtJTH, lowerBetter: true },
        { label: `Power capacity (${latestQ})`,    valA: latestA?.power_capacity_mw,  valB: latestB?.power_capacity_mw,  render: fmtMW,  lowerBetter: false },
      ],
    },
  ];

  // Score
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

      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
        <Link href="/">Home</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link href="/compare">Compare</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{tkA} vs {tkB}</span>
      </nav>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>
          {nameA} vs {nameB}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Side-by-side comparison across production, cost efficiency, and more.
          Data sourced from SEC filings. Latest quarter: {latestQ}.
        </p>
      </div>

      {/* Score cards — clean, no loud colors */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, marginBottom: 28, alignItems: "center" }}>
        <div style={{
          background: "var(--bg2)",
          border: `1px solid ${scores.a >= scores.b ? "var(--orange)" : "var(--border)"}`,
          borderRadius: 12, padding: "20px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace", marginBottom: 4 }}>{tkA}</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>{nameA}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{scores.a}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>metrics ahead</div>
          <Link href={`/company/${tkA}`} style={{ display: "block", marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
            View profile →
          </Link>
        </div>

        <div style={{ textAlign: "center", color: "var(--text3)", fontSize: 14, fontWeight: 600 }}>VS</div>

        <div style={{
          background: "var(--bg2)",
          border: `1px solid ${scores.b > scores.a ? "var(--orange)" : "var(--border)"}`,
          borderRadius: 12, padding: "20px 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "DM Mono, monospace", marginBottom: 4 }}>{tkB}</div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>{nameB}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{scores.b}</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>metrics ahead</div>
          <Link href={`/company/${tkB}`} style={{ display: "block", marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
            View profile →
          </Link>
        </div>
      </div>

      {/* Comparison tables */}
      {groups.map(group => (
        <div key={group.label} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            {group.label}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="r">{tkA}</th>
                  <th className="r">{tkB}</th>
                  <th>Edge</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, i) => {
                  const w = winner(row.valA, row.valB, row.lowerBetter);
                  return (
                    <tr key={i}>
                      <td style={{ fontSize: 13 }}>{row.label}</td>
                      <td className="r m" style={{ fontWeight: w === "a" ? 600 : 400, color: w === "a" ? "var(--text)" : "var(--text2)" }}>
                        {row.render(row.valA)}
                        {w === "a" && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--orange)" }}>▲</span>}
                      </td>
                      <td className="r m" style={{ fontWeight: w === "b" ? 600 : 400, color: w === "b" ? "var(--text)" : "var(--text2)" }}>
                        {row.render(row.valB)}
                        {w === "b" && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--orange)" }}>▲</span>}
                      </td>
                      <td style={{ fontSize: 12, color: w ? "var(--text)" : "var(--text3)", fontWeight: w ? 500 : 400 }}>
                        {w === "a" ? tkA : w === "b" ? tkB : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 24 }}>
        ▲ indicates the stronger metric. Data from SEC filings.{" "}
        <Link href="/methodology">See methodology →</Link>
      </p>

      {/* Other comparisons */}
      {otherPairs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
            Compare other companies
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {otherPairs.slice(0, 10).map(([ca, cb]) => (
              <Link
                key={`${ca.ticker}-${cb.ticker}`}
                href={`/compare/${ca.ticker.toLowerCase()}-vs-${cb.ticker.toLowerCase()}`}
                className="tag"
              >
                {ca.ticker} vs {cb.ticker}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
