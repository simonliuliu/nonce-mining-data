"use client";

import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Legend, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import Link from "next/link";

const C   = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };
const PAL = ["#F7931A","#00D4AA","#6C8EFF","#FF6B9D","#A78BFA","#F472B6","#34D399","#FBBF24","#60A5FA","#FB923C"];
const ax  = { fontSize: 11, fill: "#8b949e" };

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fN   = v => v == null ? "—" : typeof v === "number" ? Math.round(v).toLocaleString() : v;
const fDec = (v, d=1) => v == null ? "—" : Number(v).toFixed(d);
const f100M = v => v == null ? "—" : v.toFixed(2);
const fDollar = v => v == null ? "—" : `$${v.toLocaleString()}`;
const fDollarK = v => v == null ? "—" : `$${(v / 1000).toFixed(0)}K`;
const fPctVal = v => v == null ? null : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
const pctOf = (a, b) => b != null && b !== 0 ? ((a - b) / Math.abs(b)) * 100 : null;
const sumField = (rows, f) => rows.reduce((s, r) => s + (r[f] || 0), 0);
const avgField = (rows, f) => { const v = rows.map(r => r[f]).filter(x => x != null && x > 0); return v.length ? v.reduce((a,b) => a+b, 0) / v.length : null; };
const topRow = (rows, f, asc=false) => [...rows].filter(r => r[f] != null && r[f] > 0).sort((a, b) => asc ? a[f]-b[f] : b[f]-a[f])[0];

function PctBadge({ v, suffix }) {
  if (v == null) return null;
  const color = v >= 0 ? "var(--green)" : "var(--red)";
  return (
    <span style={{ fontSize: 12, color, fontFamily: "monospace", fontWeight: 500 }}>
      {fPctVal(v)}{suffix ? ` ${suffix}` : ""}
    </span>
  );
}

// ─── Per-metric card configs ──────────────────────────────────────────────────

function buildCards(metric, enrichedByQuarter, annualAllRows, annualYearsList, quarters, btcPrice) {
  const lq  = quarters[quarters.length - 1] || "";
  const lq2 = quarters[quarters.length - 2] || "";
  const ly  = annualYearsList[annualYearsList.length - 1] || "";
  const py  = String(Number(ly) - 1);

  const lqRows  = enrichedByQuarter[lq]  || [];
  const lq2Rows = enrichedByQuarter[lq2] || [];
  const lyRows  = annualAllRows[ly]       || [];
  const pyRows  = annualAllRows[py]       || [];

  switch (metric) {

    case "production": {
      const lqTotal   = sumField(lqRows,  "btc_production");
      const lq2Total  = sumField(lq2Rows, "btc_production");
      const lyTotal   = sumField(lyRows,  "btc_production");
      const pyTotal   = sumField(pyRows,  "btc_production");
      const lqCount   = lqRows.filter(r => r.btc_production > 0).length;
      const avgProd   = lqCount > 0 ? lqTotal / lqCount : null;
      const lq2Count  = lq2Rows.filter(r => r.btc_production > 0).length;
      const prevAvg   = lq2Count > 0 ? sumField(lq2Rows,"btc_production") / lq2Count : null;
      const btcEhsPairs = lqRows.filter(r => r.btc_production > 0 && r.hashrate_ehs > 0);
      const avgBtcEhs = btcEhsPairs.length > 0
        ? btcEhsPairs.reduce((s, r) => s + r.btc_production / r.hashrate_ehs, 0) / btcEhsPairs.length : null;
      return [
        {
          label: `Total BTC mined (${ly || "Annual"})`,
          value: fN(lyTotal),
          pct: pctOf(lyTotal, pyTotal),
          pctSuffix: "vs prev year",
          color: "var(--orange)",
        },
        {
          label: `Total BTC mined (${lq || "Latest Q"})`,
          value: fN(lqTotal),
          pct: pctOf(lqTotal, lq2Total),
          pctSuffix: "vs prev quarter",
        },
        {
          label: "Avg BTC / EH/s",
          value: avgBtcEhs != null ? avgBtcEhs.toFixed(2) : "—",
          sub: "Production efficiency",
        },
        {
          label: "Avg production per company",
          value: fN(avgProd),
          pct: pctOf(avgProd, prevAvg),
          pctSuffix: "vs prev quarter",
        },
      ];
    }

    case "hashrate": {
      const lqTotal  = sumField(lqRows,  "hashrate_ehs");
      const lq2Total = sumField(lq2Rows, "hashrate_ehs");
      const lyMax    = sumField(lyRows,  "hashrate_ehs");
      const top      = topRow(lqRows, "hashrate_ehs");
      const avgH     = avgField(lqRows, "hashrate_ehs");
      const prevAvgH = avgField(lq2Rows, "hashrate_ehs");
      return [
        {
          label: `Combined hashrate (${lq || "Latest Q"})`,
          value: `${fDec(lqTotal)} EH/s`,
          pct: pctOf(lqTotal, lq2Total),
          pctSuffix: "vs prev quarter",
          color: "var(--orange)",
        },
        {
          label: "Largest miner",
          value: top?.ticker || "—",
          sub: top?.hashrate_ehs ? `${top.hashrate_ehs} EH/s` : null,
        },
        {
          label: "Avg hashrate per company",
          value: avgH != null ? `${fDec(avgH)} EH/s` : "—",
          pct: pctOf(avgH, prevAvgH),
          pctSuffix: "vs prev quarter",
        },
        {
          label: "Companies tracked",
          value: lqRows.filter(r => r.hashrate_ehs > 0).length,
          sub: `In ${lq}`,
        },
      ];
    }

    case "holdings": {
      const lqTotal  = sumField(lqRows,  "btc_holdings");
      const lq2Total = sumField(lq2Rows, "btc_holdings");
      const lyTotal  = sumField(lyRows,  "btc_holdings");
      const top      = topRow(lqRows, "btc_holdings");
      const avgH     = avgField(lqRows, "btc_holdings");
      const holdProd = lqRows.filter(r => r.btc_holdings > 0 && r.btc_production > 0)
        .map(r => r.btc_holdings / r.btc_production);
      const avgHoldProd = holdProd.length > 0 ? holdProd.reduce((s,v) => s+v, 0) / holdProd.length : null;
      return [
        {
          label: `Total BTC held (${lq || "Latest Q"})`,
          value: fN(lqTotal),
          pct: pctOf(lqTotal, lq2Total),
          pctSuffix: "vs prev quarter",
          color: "var(--orange)",
        },
        {
          label: "Largest treasury",
          value: top?.ticker || "—",
          sub: top?.btc_holdings ? `${fN(top.btc_holdings)} BTC` : null,
        },
        {
          label: "Avg holdings per company",
          value: fN(avgH),
          sub: `In ${lq}`,
        },
        {
          label: "Avg hold-to-production ratio",
          value: avgHoldProd != null ? `${avgHoldProd.toFixed(1)}×` : "—",
          sub: "Holdings ÷ quarterly production",
        },
      ];
    }

    case "cost": {
      const lqCost   = avgField(lqRows, "cash_cost_per_btc");
      const lq2Cost  = avgField(lq2Rows, "cash_cost_per_btc");
      const cheapest = topRow(lqRows, "cash_cost_per_btc", true);
      const lqAllIn  = avgField(lqRows, "all_in_cost_per_btc");
      const margin   = (btcPrice && lqCost) ? ((btcPrice - lqCost) / btcPrice * 100) : null;
      return [
        {
          label: "Avg cash cost / BTC",
          value: lqCost != null ? fDollar(Math.round(lqCost)) : "—",
          pct: pctOf(lqCost, lq2Cost),
          pctSuffix: "vs prev quarter",
          color: "var(--orange)",
        },
        {
          label: "BTC spot price",
          value: btcPrice ? `$${(btcPrice / 1000).toFixed(1)}K` : "...",
          sub: margin != null ? `${margin.toFixed(0)}% gross mining margin` : null,
          subColor: margin != null ? (margin >= 0 ? "var(--green)" : "var(--red)") : null,
        },
        {
          label: "Lowest cost producer",
          value: cheapest?.ticker || "—",
          sub: cheapest?.cash_cost_per_btc ? fDollar(cheapest.cash_cost_per_btc) + " / BTC" : null,
          subColor: "var(--green)",
        },
        {
          label: "Avg all-in cost / BTC",
          value: lqAllIn != null ? fDollar(Math.round(lqAllIn)) : "—",
          sub: "Includes depreciation & overhead",
        },
      ];
    }

    case "revenue": {
      const lqRev    = sumField(lqRows, "total_revenue_100m");
      const lq2Rev   = sumField(lq2Rows, "total_revenue_100m");
      const lyRev    = sumField(lyRows, "total_revenue_100m");
      const pyRev    = sumField(pyRows, "total_revenue_100m");
      const lqGross  = sumField(lqRows, "gross_profit_100m");
      const grossMgn = lqRev > 0 ? (lqGross / lqRev * 100) : null;
      const profitable = lqRows.filter(r => (r.gross_profit_100m || 0) > 0).length;
      const lqNetInc = sumField(lqRows, "net_income_100m");
      return [
        {
          label: `Total revenue (${ly || "Annual"})`,
          value: lyRev > 0 ? `$${(lyRev * 100).toFixed(0)}M` : "—",
          pct: pctOf(lyRev, pyRev),
          pctSuffix: "vs prev year",
          color: "var(--orange)",
        },
        {
          label: `Total revenue (${lq || "Latest Q"})`,
          value: lqRev > 0 ? `$${(lqRev * 100).toFixed(0)}M` : "—",
          pct: pctOf(lqRev, lq2Rev),
          pctSuffix: "vs prev quarter",
        },
        {
          label: "Combined gross margin",
          value: grossMgn != null ? `${grossMgn.toFixed(1)}%` : "—",
          sub: `${profitable} of ${lqRows.length} companies profitable`,
          subColor: profitable > 0 ? "var(--green)" : "var(--red)",
        },
        {
          label: `Combined net income (${lq || "Latest Q"})`,
          value: lqNetInc != null ? `$${(lqNetInc * 100).toFixed(0)}M` : "—",
          sub: lqNetInc != null ? (lqNetInc >= 0 ? "Net profit" : "Net loss") : null,
          subColor: lqNetInc != null ? (lqNetInc >= 0 ? "var(--green)" : "var(--red)") : null,
        },
      ];
    }

    case "efficiency": {
      const lqEff    = avgField(lqRows, "efficiency_jth");
      const lq2Eff   = avgField(lq2Rows, "efficiency_jth");
      const best     = topRow(lqRows, "efficiency_jth", true);
      const worst    = topRow([...lqRows].reverse(), "efficiency_jth", false);
      const lqPower  = sumField(lqRows, "power_capacity_mw");
      const lqMiners = sumField(lqRows, "miner_count");
      return [
        {
          label: "Best fleet efficiency",
          value: best?.efficiency_jth != null ? `${best.efficiency_jth} J/TH` : "—",
          sub: best?.ticker,
          subColor: "var(--green)",
          color: "var(--green)",
        },
        {
          label: "Avg fleet efficiency",
          value: lqEff != null ? `${fDec(lqEff)} J/TH` : "—",
          pct: pctOf(lqEff, lq2Eff),
          pctSuffix: "vs prev quarter",
        },
        {
          label: "Combined power capacity",
          value: lqPower > 0 ? `${fN(lqPower)} MW` : "—",
          sub: `${lqRows.filter(r => r.power_capacity_mw > 0).length} companies reported`,
        },
        {
          label: "Total miners deployed",
          value: lqMiners > 0 ? fN(lqMiners) : "—",
          sub: "Active mining rigs",
        },
      ];
    }

    default: return [];
  }
}

// ─── Tooltip / chart helpers ──────────────────────────────────────────────────

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,.5)" }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#e6edf3" }}>{label}</div>
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color || p.stroke, display: "inline-block", flexShrink: 0, marginTop: 1 }} />
          <span style={{ color: "#8b949e" }}>{p.name}:</span>
          <span style={{ color: "#e6edf3", fontFamily: "monospace" }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
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
      {pos && tip && <div style={{ position: "fixed", left: pos.x, top: pos.y - 8, transform: "translate(-50%,-100%)", background: "#0d1117", border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#e6edf3", width: 250, lineHeight: 1.5, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.6)", whiteSpace: "normal", fontWeight: 400, pointerEvents: "none" }}>{tip}</div>}
    </th>
  );
}

function Sel({ items, current, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="period-selector" ref={ref}>
      <button className="period-trigger" onClick={() => setOpen(!open)}>
        {current}
        <svg viewBox="0 0 12 12" style={{ width: 12, height: 12 }}><path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {open && <div className="period-dropdown">{items.map(i => (
        <button key={i} className={`period-dropdown-item ${i === current ? "active" : ""}`} onClick={() => { onChange(i); setOpen(false); }}>{i}</button>
      ))}</div>}
    </div>
  );
}

function useBtcPrice() {
  const [p, setP] = useState(null);
  useEffect(() => {
    (async () => {
      try { const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"); if (r.ok) { const j = await r.json(); setP(j?.bitcoin?.usd); } } catch (e) {}
    })();
  }, []);
  return p;
}

// ─── Column definitions per metric ───────────────────────────────────────────

const COL_DEFS = {
  btc_production:      { label: "BTC mined",   tip: "Total Bitcoin self-mined in the period.", right: true, render: r => fN(r.btc_production) },
  btc_holdings:        { label: "BTC held",     tip: "Total BTC on balance sheet at period end.", right: true, render: r => fN(r.btc_holdings) },
  hashrate_ehs:        { label: "Hashrate",     tip: "Operational hashrate (EH/s).", right: true, render: r => r.hashrate_ehs ? `${r.hashrate_ehs} EH/s` : "—" },
  cash_cost_per_btc:   { label: "Cash cost",    tip: "Direct cash cost per BTC mined.", right: true, render: r => r.cash_cost_per_btc ? fDollar(r.cash_cost_per_btc) : "—" },
  all_in_cost_per_btc: { label: "All-in cost",  tip: "Total cost per BTC including depreciation & overhead.", right: true, render: r => r.all_in_cost_per_btc ? fDollar(r.all_in_cost_per_btc) : "—" },
  electricity_price:   { label: "Elec. price",  tip: "Average electricity cost ($/kWh).", right: true, render: r => r.electricity_price ? `$${r.electricity_price}` : "—" },
  power_capacity_mw:   { label: "Power (MW)",   tip: "Total electrical power capacity.", right: true, render: r => r.power_capacity_mw ? fN(r.power_capacity_mw) : "—" },
  miner_count:         { label: "Miners",       tip: "Total mining rigs deployed.", right: true, render: r => r.miner_count ? fN(r.miner_count) : "—" },
  efficiency_jth:      { label: "J/TH",         tip: "Fleet efficiency — lower is better.", right: true, render: r => r.efficiency_jth || "—" },
  miner_model:         { label: "Model",        tip: "Primary miner models in fleet.", right: false, render: r => { const m = r.miner_model; return Array.isArray(m) ? m.join(", ") : (m || "—"); } },
  total_revenue_100m:  { label: "Revenue",      tip: "Total revenue ($100M).", right: true, render: r => f100M(r.total_revenue_100m) },
  mining_revenue_100m: { label: "Mining rev.",  tip: "Mining revenue ($100M).", right: true, render: r => f100M(r.mining_revenue_100m) },
  cost_of_revenue_100m:{ label: "Cost of rev.", tip: "Direct costs ($100M).", right: true, render: r => f100M(r.cost_of_revenue_100m) },
  gross_profit_100m:   { label: "Gross profit", tip: "Revenue minus direct costs ($100M).", right: true, render: r => f100M(r.gross_profit_100m) },
  net_income_100m:     { label: "Net income",   tip: "Bottom-line profit/loss ($100M).", right: true, cls: r => (r.net_income_100m || 0) >= 0 ? "pos" : "neg", render: r => f100M(r.net_income_100m) },
  gross_margin:        { label: "Gross margin", tip: "Gross profit / Revenue.", right: true, render: r => r.gross_profit_100m != null && r.total_revenue_100m ? `${((r.gross_profit_100m / r.total_revenue_100m) * 100).toFixed(1)}%` : "—" },
  net_margin:          { label: "Net margin",   tip: "Net income / Revenue.", right: true, cls: r => (r.net_income_100m || 0) >= 0 ? "pos" : "neg", render: r => r.net_income_100m != null && r.total_revenue_100m ? `${((r.net_income_100m / r.total_revenue_100m) * 100).toFixed(1)}%` : "—" },
  hold_prod_ratio:     { label: "Hold/Prod",    tip: "BTC held divided by BTC mined. Higher = more accumulation.", right: true, render: r => r.btc_holdings && r.btc_production ? (r.btc_holdings / r.btc_production).toFixed(1) + "×" : "—" },
  btc_per_ehs:         { label: "BTC/EH/s",     tip: "Production efficiency: BTC mined per EH/s of hashrate.", right: true, render: r => r.btc_production && r.hashrate_ehs ? (r.btc_production / r.hashrate_ehs).toFixed(1) : "—" },
  "3m":  { label: "3M%",  tip: "Quarter-over-quarter BTC production change.", right: true, render: r => <Pct v={r.qoqProd} /> },
  "6m":  { label: "6M%",  tip: "Change over two quarters (BTC production).", right: true, render: r => <Pct v={r.momProd} /> },
  yoy:   { label: "YoY%", tip: "Year-over-year BTC production change.", right: true, render: r => <Pct v={r.yoyProd} /> },
  "3m_hash": { label: "3M%",  tip: "Quarter-over-quarter hashrate change.", right: true, render: r => <Pct v={r.qoqHash} /> },
  yoy_hash:  { label: "YoY%", tip: "Year-over-year hashrate change.", right: true, render: r => <Pct v={r.yoyHash} /> },
};

const DEFAULT_META = {
  title: "", fullTitle: "", desc: "", glossarySlug: "",
  barUnit: "", barLabel: "", trendLabel: "", tableCols: [], sortAsc: false,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function RankingClient({
  metric = "production",
  meta: metaProp,
  barData = [],
  trendData = [],
  summary = {},
  enrichedByQuarter = {},
  annualAllRows = {},
  annualYearsList = [],
  quarters = [],
}) {
  const meta = metaProp || DEFAULT_META;
  const [mode, setMode] = useState("quarter");
  const lq = quarters.length > 0 ? quarters[quarters.length - 1] : "";
  const ly = annualYearsList.length > 0 ? annualYearsList[annualYearsList.length - 1] : "2025";
  const [sel, setSel] = useState(lq);
  const items = mode === "annual" ? annualYearsList : quarters;
  const cur = mode === "annual" ? (annualYearsList.includes(sel) ? sel : ly) : (quarters.includes(sel) ? sel : lq);
  const rows = mode === "annual" ? (annualAllRows[cur] || []) : (enrichedByQuarter[cur] || []);

  const btcPrice = metric === "cost" ? useBtcPrice() : null;

  // Build cards from live data
  const cards = buildCards(metric, enrichedByQuarter, annualAllRows, annualYearsList, quarters, btcPrice);
  const cols = (meta.tableCols || []).map(k => COL_DEFS[k]).filter(Boolean);
  const trendKeys = ["MARA", "CLSK", "BTDR", "CANG"];
  const trendColors = C;

  return (
    <>
      <h1 className="section-title">{meta.fullTitle}</h1>
      <p className="section-sub">
        {meta.desc} · <Link href={`/metrics/${meta.glossarySlug}`}>What is {meta.title}? →</Link>
      </p>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="chart-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--text2)" }}>{meta.barLabel}</div>
          <ResponsiveContainer width="100%" height={Math.max(220, barData.length * 28 + 40)}>
            <BarChart data={barData} layout="vertical" margin={{ left: 5, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis type="number" tick={ax} />
              <YAxis type="category" dataKey="ticker" tick={{ fontSize: 11, fill: "#e6edf3", fontWeight: 500 }} width={52} />
              <ReTooltip content={<Tip />} cursor={false} />
              <Bar dataKey="value" name={meta.barUnit} radius={[0, 4, 4, 0]} barSize={16}>
                {barData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "var(--text2)" }}>{meta.trendLabel} — quarterly trend</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="quarter" tick={ax} />
              <YAxis tick={ax} />
              <ReTooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {metric === "cost" && btcPrice && (
                <ReferenceLine y={btcPrice} stroke="#F7931A" strokeDasharray="5 5" label={{ value: "BTC price", fill: "#F7931A", fontSize: 11 }} />
              )}
              {trendKeys.map(k => <Line key={k} type="monotone" dataKey={k} stroke={trendColors[k]} strokeWidth={2} dot={{ r: 3 }} connectNulls />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metric cards */}
      <div className="metric-grid" style={{ marginBottom: 24 }}>
        {cards.map((c, i) => (
          <div key={i} className="metric-card">
            <div className="metric-label">{c.label}</div>
            <div className="metric-value" style={{ color: c.color || "var(--text)" }}>{c.value}</div>
            {c.pct != null && (
              <div style={{ marginTop: 2 }}>
                <PctBadge v={c.pct} />{" "}
                {c.pctSuffix && <span style={{ fontSize: 11, color: "var(--text3)" }}>{c.pctSuffix}</span>}
              </div>
            )}
            {c.sub && !c.pct && (
              <div className="metric-sub" style={{ color: c.subColor || "var(--text2)" }}>{c.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Detailed rankings</h2>
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
        <table style={{ minWidth: Math.max(700, cols.length * 110 + 200) }}>
          <thead><tr>
            <Th>#</Th>
            <Th>Company</Th>
            {cols.map((c, i) => <Th key={i} tip={c.tip} right={c.right}>{c.label}</Th>)}
            <Th tip="Filing period. Click to view SEC document.">Source</Th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.ticker || r.company}>
                <td style={{ color: "var(--text3)" }}>{i + 1}</td>
                <td style={{ position: "sticky", left: 0, background: "var(--bg)", zIndex: 2, minWidth: 130 }}>
                  <Link href={`/company/${r.ticker}`} className="cl" style={{ color: C[r.ticker] || PAL[i % PAL.length] }}>
                    {r.company} {r.ticker ? `(${r.ticker})` : ""}
                  </Link>
                </td>
                {cols.map((c, ci) => (
                  <td key={ci} className={`${c.right ? "r" : ""} m ${c.cls ? c.cls(r) : ""}`}>{c.render(r)}</td>
                ))}
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
