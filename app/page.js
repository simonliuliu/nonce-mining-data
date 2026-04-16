import { getQuarterlyData, getAnnualCompanyData, getAllCompanyProfiles } from "@/lib/notion";
import { TICKERS, COLORS, PALETTE, COMPANIES, getQuarters, getYears, enrichRows, buildAnnualData, fmt, fmtM } from "@/lib/helpers";
import HomeClient from "./HomeClient";
import Link from "next/link";

export const revalidate = 3600;

const KNOWN = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };

export default async function HomePage() {
  // ── Fetch all data ──
  const [data, annualRaw, profiles] = await Promise.all([
    getQuarterlyData(),
    getAnnualCompanyData().catch(() => []),
    getAllCompanyProfiles().catch(() => []),
  ]);

  const quarters = getQuarters(data);
  const years = getYears(data);
  const latestQ = quarters[quarters.length - 1] || "";
  const latest = data.filter(r => r.quarter === latestQ);

  // ── Annual 2025 data for charts ──
  const seen2025 = new Map();
  for (const r of annualRaw) {
    if (r.fiscal_year === 2025 && r.ticker) {
      if (!seen2025.has(r.ticker) || (r.btc_production || 0) > (seen2025.get(r.ticker).btc_production || 0)) {
        seen2025.set(r.ticker, r);
      }
    }
  }
  const all2025 = Array.from(seen2025.values()).sort((a, b) => (b.btc_production || 0) - (a.btc_production || 0));

  const chartData = all2025.filter(r => r.btc_production > 0).map((r, i) => ({
    ticker: r.ticker, company: r.company,
    btc: r.btc_production || 0,
    hashrate: r.hashrate_ehs || 0,
    holdings: r.btc_holdings || 0,
    revenue: r.total_revenue_100m || 0,
    color: KNOWN[r.ticker] || PALETTE[i % PALETTE.length],
  }));

  // ── avgCashCost: use latest available value per company (not only latest quarter) ──
  // Some companies only report cash cost in certain quarters
  const costByCompany = {};
  for (const r of [...data].sort((a, b) => b.quarter.localeCompare(a.quarter))) {
    if (r.cash_cost_per_btc != null && r.cash_cost_per_btc > 0 && !costByCompany[r.company]) {
      costByCompany[r.company] = r.cash_cost_per_btc;
    }
  }
  const costVals = Object.values(costByCompany);
  const avgCashCost = costVals.length > 0
    ? Math.round(costVals.reduce((s, v) => s + v, 0) / costVals.length)
    : null;

  const btcMined2025 = all2025.reduce((s, r) => s + (r.btc_production || 0), 0);
  const totalBtcHeld = all2025.reduce((s, r) => s + (r.btc_holdings || 0), 0);

  // ── Quarterly enriched rows ──
  const enrichedByQuarter = {};
  for (const q of quarters) enrichedByQuarter[q] = enrichRows(data, q);

  // ── Annual rows (from quarterly DB aggregation, matches enrichRows structure) ──
  const annualFromQ = buildAnnualData(data);
  const annualYearsList = [...new Set(annualFromQ.map(r => r.quarter))].sort();

  // Build annualAllRows matching HomeClient's expected structure
  const annualAllRows = {};
  const byYearTicker = {};
  for (const r of annualRaw) {
    if (!r.ticker || !r.fiscal_year) continue;
    const yk = String(r.fiscal_year);
    if (!byYearTicker[yk]) byYearTicker[yk] = {};
    const existing = byYearTicker[yk][r.ticker];
    if (!existing || (r.btc_production || 0) > (existing.btc_production || 0)) {
      byYearTicker[yk][r.ticker] = r;
    }
  }

  const annualYearsFromDB = Object.keys(byYearTicker).sort();
  // Merge: prefer annualDB years, fallback to quarterly-aggregated
  const allAnnualYears = [...new Set([...annualYearsList, ...annualYearsFromDB])].sort();

  for (const y of allAnnualYears) {
    const fromDB = byYearTicker[y] ? Object.values(byYearTicker[y]) : [];
    const fromQ = annualFromQ.filter(r => r.quarter === y);

    // Use DB rows if available, else fall back to quarterly aggregation
    const baseRows = fromDB.length > 0 ? fromDB : fromQ.map(r => ({ ...r, fiscal_year: y }));

    const prevY = String(Number(y) - 1);
    const prevData = byYearTicker[prevY] || {};

    annualAllRows[y] = baseRows.map((r) => {
      const prev = prevData[r.ticker];
      const yoy = (field) => {
        if (!prev || r[field] == null || prev[field] == null || prev[field] === 0) return null;
        return ((r[field] - prev[field]) / Math.abs(prev[field])) * 100;
      };
      const lastQ = quarters.filter(q => q.startsWith(y)).sort().pop();
      const qIdx = quarters.indexOf(lastQ);
      const qRow = data.find(d => d.ticker === r.ticker && d.quarter === lastQ);
      const prevQ1 = qIdx >= 1 ? data.find(d => d.ticker === r.ticker && d.quarter === quarters[qIdx - 1]) : null;
      const prevQ2 = qIdx >= 2 ? data.find(d => d.ticker === r.ticker && d.quarter === quarters[qIdx - 2]) : null;
      const calc = (f, base, cmp) => base?.[f] != null && cmp?.[f] != null && cmp[f] !== 0
        ? ((base[f] - cmp[f]) / Math.abs(cmp[f])) * 100 : null;

      return {
        company: r.company, ticker: r.ticker,
        btc_production: r.btc_production, btc_holdings: r.btc_holdings,
        hashrate_ehs: r.hashrate_ehs, electricity_price: r.electricity_price,
        cash_cost_per_btc: r.cash_cost_per_btc, power_capacity_mw: r.power_capacity_mw,
        miner_count: r.miner_count, efficiency_jth: r.efficiency_jth,
        mining_revenue_100m: r.mining_revenue_100m, total_revenue_100m: r.total_revenue_100m,
        gross_profit_100m: r.gross_profit_100m, net_income_100m: r.net_income_100m,
        source_url: null, sourceDate: y,
        yoyProd: yoy("btc_production"), yoyHash: yoy("hashrate_ehs"), yoyHold: yoy("btc_holdings"),
        qoqProd: calc("btc_production", qRow, prevQ1),
        momProd: calc("btc_production", qRow, prevQ2),
        qoqHash: calc("hashrate_ehs", qRow, prevQ1),
        qoqHold: calc("btc_holdings", qRow, prevQ1),
      };
    }).sort((a, b) => (b.btc_production || 0) - (a.btc_production || 0));
  }

  const mergedAnnualYearsList = Object.keys(annualAllRows).sort();

  return (
    <>
      <section style={{ margin: "0 0 28px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Bitcoin Mining Company Data & Analytics
        </h1>
        <p style={{ fontSize: 16, color: "var(--text2)", maxWidth: 720, lineHeight: 1.7 }}>
          Track the financial and operational performance of every major public Bitcoin mining company.
          Production, hashrate, costs, revenue, and profitability — all sourced from SEC filings and standardized for comparison.
        </p>
      </section>

      <HomeClient
        chartData={chartData}
        enrichedByQuarter={enrichedByQuarter}
        annualAllRows={annualAllRows}
        annualYearsList={mergedAnnualYearsList}
        quarters={quarters}
        latestQ={latestQ}
        btcMined2025={btcMined2025}
        totalBtcHeld={totalBtcHeld}
        avgCashCost={avgCashCost}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 28 }}>
        <div className="text-block">
          <h3>📊 What we track</h3>
          <p>{all2025.length > 0 ? all2025.length : COMPANIES.length}+ public mining companies across 10+ metrics, updated quarterly from SEC filings.</p>
        </div>
        <div className="text-block">
          <h3>📁 Data sources</h3>
          <p>SEC 10-K, 10-Q, 6-K, 20-F filings, official IR, and press releases. <Link href="/methodology">See methodology →</Link></p>
        </div>
        <div className="text-block">
          <h3>🔍 Why trust this data</h3>
          <p>Every data point links to its SEC filing. Estimated figures are clearly marked. <Link href="/faq">Common questions →</Link></p>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Explore by metric</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 28 }}>
        {[
          { href: "/rankings/production", label: "BTC Production", desc: "Who mines the most?" },
          { href: "/rankings/hashrate",   label: "Hashrate",       desc: "Operational computing power" },
          { href: "/rankings/holdings",   label: "BTC Holdings",   desc: "Largest Bitcoin treasuries" },
          { href: "/rankings/cost",       label: "Production Cost", desc: "Cheapest producers" },
          { href: "/rankings/revenue",    label: "Revenue",        desc: "Top line comparison" },
          { href: "/rankings/efficiency", label: "Fleet Efficiency", desc: "Energy per terahash" },
        ].map(m => (
          <Link key={m.href} href={m.href} className="text-block" style={{ textDecoration: "none" }}>
            <h3 style={{ color: "var(--orange)", fontSize: 14 }}>{m.label} →</h3>
            <p style={{ margin: 0, fontSize: 13 }}>{m.desc}</p>
          </Link>
        ))}
      </div>

      {profiles.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Company profiles</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginBottom: 28 }}>
            {profiles.map(p => (
              <Link key={p.ticker} href={`/company/${p.ticker}`} className="text-block" style={{ textDecoration: "none" }}>
                <h3 style={{ color: KNOWN[p.ticker] || "var(--text)" }}>{p.company} ({p.ticker})</h3>
                <p style={{ margin: 0, fontSize: 13 }}>{p.description?.slice(0, 120)}{p.description?.length > 120 ? "..." : ""}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="cta-banner">
        <h3>Want real-time mining analytics?</h3>
        <p>Nonce.app gives you live data, alerts, and portfolio tracking for Bitcoin miners</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
