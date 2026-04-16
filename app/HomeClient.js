"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";

const TIPS = {
  "BTC mined": "Total Bitcoin self-mined during the period. Does not include purchased BTC.",
  "3M%":       "Quarter-over-quarter change in BTC production (vs previous quarter).",
  "YoY%":      "Year-over-year change in BTC production (vs same period last year).",
  "6M%":       "Change in BTC production over two periods (vs two quarters ago).",
  "BTC held":  "Total Bitcoin on balance sheet at period end, including mined and purchased.",
  "Hashrate":  "Operational computing power in EH/s. Higher = more capacity.",
  "Elec. price": "Average electricity cost per kWh.",
  "Cash cost": "Direct cash cost to mine one BTC. Lower is better.",
  "Power":     "Total electrical power capacity (MW).",
  "Miners":    "Total mining rigs deployed.",
  "J/TH":      "Fleet efficiency — Joules per Terahash. Lower = better.",
  "Mining rev.": "Mining revenue ($100M).",
  "Revenue":   "Total revenue ($100M).",
  "Gross profit": "Revenue minus direct costs ($100M).",
  "Net income": "Bottom-line profit/loss ($100M).",
  "Source":    "Filing period. Click to view SEC document.",
};

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,.5)" }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: "#e6edf3" }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: "#e6edf3", fontFamily: "monospace" }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</div>)}
    </div>
  );
}

function Pct({ v }) {
  if (v == null) return <span style={{ color: "#484f58" }}>—</span>;
  const c = v > 0 ? "#00D4AA" : v < 0 ? "#FF5252" : "#8b949e";
  return <span style={{ color: c, fontFamily: "monospace", fontSize: 12 }}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
}

function Th({ children, tip, right }) {
  const [pos, setPos] = useState(null);
  return (
    <th className={right ? "r" : ""} style={{ cursor: tip ? "help" : "default" }}
      onMouseEnter={e => { if (tip) { const b = e.currentTarget.getBoundingClientRect(); setPos({ x: b.left + b.width / 2, y: b.top }); } }}
      onMouseLeave={() => setPos(null)}>
      <span style={{ borderBottom: tip ? "1px dashed #484f58" : "none", paddingBottom: 1 }}>{children}</span>
      {pos && tip && (
        <div style={{
          position: "fixed", left: pos.x, top: pos.y - 8, transform: "translate(-50%, -100%)",
          background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px",
          fontSize: 12, color: "#e6edf3", width: 260, lineHeight: 1.5, zIndex: 9999,
          boxShadow: "0 4px 20px rgba(0,0,0,.6)", whiteSpace: "normal", fontWeight: 400, pointerEvents: "none",
        }}>{tip}</div>
      )}
    </th>
  );
}

function Sel({ items, current, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="period-selector" ref={ref}>
      <button className="period-trigger" onClick={() => setOpen(!open)}>
        {current}
        <svg viewBox="0 0 12 12" style={{ width: 12, height: 12 }}><path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {open && <div className="period-dropdown">{items.map(i => (
        <button key={i} className={`period-dropdown-item ${i === current ? "active" : ""}`}
          onClick={() => { onChange(i); setOpen(false); }}>{i}</button>
      ))}</div>}
    </div>
  );
}

function HBarChart({ data, dataKey, title, unit }) {
  const sorted = [...data].filter(d => d[dataKey] > 0).sort((a, b) => b[dataKey] - a[dataKey]).slice(0, 15);
  return (
    <div className="chart-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--text2)" }}>{title}</div>
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 28 + 40)}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 5, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#8b949e" }} />
          <YAxis type="category" dataKey="ticker" tick={{ fontSize: 11, fill: "#e6edf3", fontWeight: 500 }} width={52} />
          <ReTooltip content={<ChartTip />} cursor={false} />
          <Bar dataKey={dataKey} name={unit} radius={[0, 4, 4, 0]} barSize={16}>
            {sorted.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function useBtcData() {
  const [price, setPrice] = useState(null);
  const [supply, setSupply] = useState(null);
  useEffect(() => {
    async function f() {
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false");
        if (r.ok) {
          const j = await r.json();
          setPrice(Math.round(j?.market_data?.current_price?.usd || 0));
          setSupply(Math.round(j?.market_data?.circulating_supply || 0));
          return;
        }
      } catch (e) {}
      try {
        const r = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
        if (r.ok) { const j = await r.json(); setPrice(Math.round(parseFloat(j?.data?.amount))); }
      } catch (e) {}
    }
    f(); const t = setInterval(f, 60000); return () => clearInterval(t);
  }, []);
  return { price, supply };
}

const C = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };
const PAL = ["#F7931A","#00D4AA","#6C8EFF","#FF6B9D","#A78BFA","#F472B6","#34D399","#FBBF24","#60A5FA","#FB923C"];

export default function HomeClient({
  chartData, enrichedByQuarter, annualAllRows, annualYearsList,
  quarters, latestQ, btcMined2025, totalBtcHeld, avgCashCost,
}) {
  const [mode, setMode] = useState("quarter");
  const lq = quarters[quarters.length - 1];
  const ly = annualYearsList[annualYearsList.length - 1] || "2025";
  const [sel, setSel] = useState(lq);
  const items = mode === "annual" ? annualYearsList : quarters;
  const cur = mode === "annual"
    ? (annualYearsList.includes(sel) ? sel : ly)
    : (quarters.includes(sel) ? sel : lq);
  const rows = mode === "annual" ? (annualAllRows[cur] || []) : (enrichedByQuarter[cur] || []);

  const { price: btcPrice, supply: btcSupply } = useBtcData();
  const costVsPrice = (avgCashCost && btcPrice) ? ((btcPrice - avgCashCost) / avgCashCost) * 100 : null;
  const holdPct = (totalBtcHeld && btcSupply) ? ((totalBtcHeld / btcSupply) * 100) : null;

  return (
    <>
      {/* 4 charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <HBarChart data={chartData} dataKey="btc" title="BTC production (2025, all companies)" unit="BTC" />
        <HBarChart data={chartData} dataKey="hashrate" title="Hashrate comparison (2025, EH/s)" unit="EH/s" />
        <HBarChart data={chartData} dataKey="holdings" title="BTC holdings comparison (2025)" unit="BTC" />
        <HBarChart data={chartData} dataKey="revenue" title="Revenue comparison (2025, $100M)" unit="$100M" />
      </div>

      {/* 4 metric cards */}
      <div className="metric-grid" style={{ marginBottom: 28 }}>
        <div className="metric-card">
          <div className="metric-label">BTC mined (2025 total)</div>
          <div className="metric-value" style={{ color: "var(--orange)" }}>{btcMined2025?.toLocaleString() || "—"}</div>
          <div className="metric-sub">All tracked companies</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Miners BTC held (total)</div>
          <div className="metric-value">{totalBtcHeld ? totalBtcHeld.toLocaleString() : "—"}</div>
          {holdPct != null && <div className="metric-sub">{holdPct.toFixed(2)}% of circulating supply</div>}
        </div>
        <div className="metric-card">
          <div className="metric-label">BTC spot price</div>
          <div className="metric-value">{btcPrice ? `$${(btcPrice / 1000).toFixed(1)}K` : "..."}</div>
          {costVsPrice != null && (
            <div className="metric-sub" style={{ color: costVsPrice >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
              {costVsPrice >= 0 ? `${costVsPrice.toFixed(0)}% above avg cost` : `${Math.abs(costVsPrice).toFixed(0)}% below avg cost`}
            </div>
          )}
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg cash cost</div>
          <div className="metric-value">{avgCashCost ? `$${(avgCashCost / 1000).toFixed(0)}K` : "—"}</div>
          <div className="metric-sub">Per BTC mined</div>
        </div>
      </div>

      {/* Company Rankings table */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Company Rankings</h2>
        <span style={{ fontSize: 13, color: "var(--text3)" }}>Tracking {rows.length} companies · {cur}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", background: "var(--bg2)", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden" }}>
          <button onClick={() => { setMode("annual"); setSel(ly); }} className={`mode-btn ${mode === "annual" ? "active" : ""}`}>Annual</button>
          <button onClick={() => { setMode("quarter"); setSel(lq); }} className={`mode-btn ${mode === "quarter" ? "active" : ""}`}>Quarterly</button>
        </div>
        <Sel items={items} current={cur} onChange={setSel} />
      </div>

      <div className="table-wrap">
        <table style={{ minWidth: 1600 }}>
          <thead><tr>
            <Th>#</Th>
            <Th>Company</Th>
            {/* BTC mined + its change cols together */}
            <Th tip={TIPS["BTC mined"]} right>BTC mined</Th>
            <Th tip={TIPS["3M%"]} right>3M%</Th>
            <Th tip={TIPS["YoY%"]} right>YoY%</Th>
            <Th tip={TIPS["6M%"]} right>6M%</Th>
            {/* Then BTC held */}
            <Th tip={TIPS["BTC held"]} right>BTC held</Th>
            <Th tip={TIPS["Hashrate"]} right>Hashrate</Th>
            <Th tip={TIPS["Elec. price"]} right>Elec. price</Th>
            <Th tip={TIPS["Cash cost"]} right>Cash cost</Th>
            <Th tip={TIPS["Power"]} right>Power (MW)</Th>
            <Th tip={TIPS["Miners"]} right>Miners</Th>
            <Th tip={TIPS["J/TH"]} right>J/TH</Th>
            <Th tip={TIPS["Mining rev."]} right>Mining rev.</Th>
            <Th tip={TIPS["Revenue"]} right>Revenue</Th>
            <Th tip={TIPS["Gross profit"]} right>Gross profit</Th>
            <Th tip={TIPS["Net income"]} right>Net income</Th>
            <Th tip={TIPS["Source"]}>Source</Th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.ticker || r.company}>
                <td style={{ color: "var(--text3)" }}>{i + 1}</td>
                <td style={{ position: "sticky", left: 0, background: "var(--bg)", zIndex: 2, minWidth: 140 }}>
                  <Link href={`/company/${r.ticker}`} className="cl" style={{ color: C[r.ticker] || PAL[i % PAL.length] }}>
                    {r.company} {r.ticker ? `(${r.ticker})` : ""}
                  </Link>
                </td>
                {/* BTC mined + its 3 change cols */}
                <td className="r m">{r.btc_production != null ? r.btc_production.toLocaleString() : "—"}</td>
                <td className="r"><Pct v={r.qoqProd} /></td>
                <td className="r"><Pct v={r.yoyProd} /></td>
                <td className="r"><Pct v={r.momProd} /></td>
                {/* Rest of cols */}
                <td className="r m">{r.btc_holdings != null ? r.btc_holdings.toLocaleString() : "—"}</td>
                <td className="r m">{r.hashrate_ehs ? `${r.hashrate_ehs} EH/s` : "—"}</td>
                <td className="r m">{r.electricity_price ? `$${r.electricity_price}` : "—"}</td>
                <td className="r m">{r.cash_cost_per_btc ? `$${r.cash_cost_per_btc.toLocaleString()}` : "—"}</td>
                <td className="r m">{r.power_capacity_mw ? r.power_capacity_mw.toLocaleString() : "—"}</td>
                <td className="r m">{r.miner_count ? r.miner_count.toLocaleString() : "—"}</td>
                <td className="r m">{r.efficiency_jth || "—"}</td>
                <td className="r m">{r.mining_revenue_100m != null ? r.mining_revenue_100m.toFixed(2) : "—"}</td>
                <td className="r m">{r.total_revenue_100m != null ? r.total_revenue_100m.toFixed(2) : "—"}</td>
                <td className="r m">{r.gross_profit_100m != null ? r.gross_profit_100m.toFixed(2) : "—"}</td>
                <td className={`r m ${(r.net_income_100m || 0) >= 0 ? "pos" : "neg"}`}>
                  {r.net_income_100m != null ? r.net_income_100m.toFixed(2) : "—"}
                </td>
                <td style={{ fontSize: 12 }}>
                  {r.source_url ? <a href={r.source_url} target="_blank" rel="noopener">{r.sourceDate || "SEC"}</a> : (r.sourceDate || "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
