"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell,
} from "recharts";
import Link from "next/link";

const TICKER_COLORS = {
  MARA:"#F7931A", CLSK:"#00D4AA", RIOT:"#FF4444", CORZ:"#FF8C42",
  HUT:"#A78BFA",  BTDR:"#6C8EFF", IREN:"#FBBF24", HIVE:"#60A5FA",
  BITF:"#F472B6", WULF:"#34D399", CAN:"#2DC4B4",  CIFR:"#FB923C",
  FUFU:"#C084FC", SLNH:"#4ADE80", CANG:"#FF6B9D", ABTC:"#A0A0A0",
};
const PAL = Object.values(TICKER_COLORS);

// ─── Dropdown quarter selector ────────────────────────────────

function PeriodDropdown({ quarters, current, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px",
          background: "var(--bg3)",
          border: "1px solid var(--border2)",
          borderRadius: 7,
          fontSize: 13, fontWeight: 500,
          color: "var(--text)",
          cursor: "pointer",
          fontFamily: "inherit",
          minWidth: 96,
          justifyContent: "space-between",
        }}
      >
        <span>{current}</span>
        <svg viewBox="0 0 10 10" style={{ width: 10, height: 10, opacity: 0.5, flexShrink: 0 }}>
          <path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0,
          background: "var(--bg2)",
          border: "1px solid var(--border2)",
          borderRadius: 8, padding: 4,
          zIndex: 300,
          boxShadow: "0 8px 24px rgba(0,0,0,.5)",
          minWidth: 110,
          maxHeight: 280, overflowY: "auto",
        }}>
          {[...quarters].reverse().map(q => (
            <button
              key={q}
              onClick={() => { onChange(q); setOpen(false); }}
              style={{
                display: "block", width: "100%",
                padding: "7px 12px",
                background: q === current ? "var(--orange-dim)" : "none",
                border: "none", borderRadius: 6,
                fontSize: 13, textAlign: "left",
                color: q === current ? "var(--orange)" : "var(--text2)",
                fontWeight: q === current ? 600 : 400,
                cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (q !== current) e.currentTarget.style.background = "var(--bg3)"; }}
              onMouseLeave={e => { if (q !== current) e.currentTarget.style.background = "none"; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chart ────────────────────────────────────────────────────

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#191919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontFamily: "DM Mono, monospace", color: "var(--text2)" }}>
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

function HBarChart({ data, dataKey, title }) {
  const sorted = [...data].filter(d => d[dataKey] != null && d[dataKey] > 0)
    .sort((a, b) => b[dataKey] - a[dataKey]).slice(0, 15);
  if (!sorted.length) return (
    <div className="chart-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
      <span style={{ color: "var(--text3)", fontSize: 13 }}>No data</span>
    </div>
  );
  return (
    <div className="chart-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 14, color: "var(--text3)", letterSpacing: "0.02em" }}>{title}</div>
      <ResponsiveContainer width="100%" height={Math.max(120, sorted.length * 24 + 32)}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 5, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="ticker" tick={{ fontSize: 11, fill: "var(--text2)", fontWeight: 500 }} width={52} axisLine={false} tickLine={false} />
          <ReTooltip content={<ChartTip />} cursor={false} />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} barSize={12}>
            {sorted.map((e, i) => (
              <Cell key={i} fill={TICKER_COLORS[e.ticker] || PAL[i % PAL.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Table helpers ────────────────────────────────────────────

function Pct({ v }) {
  if (v == null) return <span style={{ color: "var(--text3)" }}>—</span>;
  const c = v > 0 ? "var(--green)" : v < 0 ? "var(--red)" : "var(--text3)";
  return <span style={{ color: c, fontFamily: "DM Mono, monospace", fontSize: 12 }}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
}

function Th({ children, tip, right }) {
  const [pos, setPos] = useState(null);
  return (
    <th className={right ? "r" : ""} style={{ cursor: tip ? "help" : "default" }}
      onMouseEnter={e => { if (tip) { const b = e.currentTarget.getBoundingClientRect(); setPos({ x: b.left + b.width / 2, y: b.top }); } }}
      onMouseLeave={() => setPos(null)}>
      <span style={{ borderBottom: tip ? "1px dashed var(--text3)" : "none", paddingBottom: 1 }}>{children}</span>
      {pos && tip && (
        <div style={{ position: "fixed", left: pos.x, top: pos.y - 8, transform: "translate(-50%,-100%)", background: "#191919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text2)", width: 230, lineHeight: 1.5, zIndex: 9999, boxShadow: "0 12px 32px rgba(0,0,0,.6)", whiteSpace: "normal", fontWeight: 400, pointerEvents: "none" }}>
          {tip}
        </div>
      )}
    </th>
  );
}

// ─── Live BTC price ───────────────────────────────────────────

function useLiveBtcPrice() {
  const [price, setPrice] = useState(null);
  const [supply, setSupply] = useState(null);
  useEffect(() => {
    const go = async () => {
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false");
        if (r.ok) {
          const j = await r.json();
          setPrice(Math.round(j?.market_data?.current_price?.usd || 0));
          setSupply(Math.round(j?.market_data?.circulating_supply || 0));
        }
      } catch (e) {}
    };
    go();
    const t = setInterval(go, 60000);
    return () => clearInterval(t);
  }, []);
  return { price, supply };
}

// ─── Main ─────────────────────────────────────────────────────

export default function HomeClient({ enrichedByQuarter = {}, quarters = [], latestQ = "" }) {
  const [sel, setSel] = useState(latestQ);
  const cur  = quarters.includes(sel) ? sel : latestQ;
  const rows = enrichedByQuarter[cur] || [];

  const { price: btcSpotPrice, supply: btcSupply } = useLiveBtcPrice();

  const summary = useMemo(() => {
    const withProd = rows.filter(r => r.btc_production != null);
    const withCost = rows.filter(r => r.cash_cost_per_btc != null && r.cash_cost_per_btc > 0);
    const withHold = rows.filter(r => r.btc_holdings != null);
    return {
      totalMined:     withProd.reduce((s, r) => s + (r.btc_production || 0), 0),
      totalHeld:      withHold.reduce((s, r) => s + (r.btc_holdings  || 0), 0),
      avgCost:        withCost.length ? Math.round(withCost.reduce((s, r) => s + r.cash_cost_per_btc, 0) / withCost.length) : null,
      reportingCount: withProd.length,
    };
  }, [cur, rows]);

  const profitPct = (btcSpotPrice && summary.avgCost)
    ? ((btcSpotPrice - summary.avgCost) / btcSpotPrice) * 100 : null;
  const holdPct = (summary.totalHeld && btcSupply)
    ? (summary.totalHeld / btcSupply) * 100 : null;

  const chartRows = useMemo(() =>
    rows.map((r, i) => ({ ...r, color: TICKER_COLORS[r.ticker] || PAL[i % PAL.length] })),
    [cur, rows]
  );

  return (
    <>
      {/* ── Key Metric Cards ─────────────────────────────────── */}
      <div className="metric-grid" style={{ marginBottom: 28 }}>
        <div className="metric-card">
          <div className="metric-label">Total BTC mined</div>
          <div className="metric-value" style={{ color: "var(--orange)" }}>
            {summary.totalMined ? summary.totalMined.toLocaleString() : "—"}
          </div>
          <div className="metric-sub">{summary.reportingCount} companies · {cur}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total BTC held</div>
          <div className="metric-value">{summary.totalHeld ? summary.totalHeld.toLocaleString() : "—"}</div>
          <div className="metric-sub">
            {holdPct != null ? `${holdPct.toFixed(2)}% of circulating supply` : cur}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">BTC Spot Price (live)</div>
          <div className="metric-value">
            {btcSpotPrice ? `$${(btcSpotPrice / 1000).toFixed(1)}K` : "—"}
          </div>
          {profitPct != null && (
            <div className="metric-sub" style={{
              color: profitPct >= 0 ? "var(--green)" : "var(--red)",
              fontWeight: 500,
            }}>
              {profitPct >= 0 ? "▲" : "▼"} {Math.abs(profitPct).toFixed(0)}% {profitPct >= 0 ? "above" : "below"} {cur} avg cost
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg cash cost / BTC</div>
          <div className="metric-value">
            {summary.avgCost ? `$${Math.round(summary.avgCost / 1000)}K` : "—"}
          </div>
          <div className="metric-sub">{cur} · {summary.reportingCount} companies</div>
        </div>
      </div>

      {/* ── Company Rankings ──────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Company Rankings</h2>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>
            {rows.filter(r => r.btc_production != null).length} companies
          </span>
        </div>
        <PeriodDropdown quarters={quarters} current={cur} onChange={setSel} />
      </div>

      <div className="table-wrap" style={{ marginBottom: 40 }}>
        <table style={{ minWidth: 1160 }}>
          <thead><tr>
            <Th>#</Th>
            <Th>Company</Th>
            <Th tip="Total Bitcoin self-mined during the quarter." right>BTC mined</Th>
            <Th tip="Quarter-over-quarter BTC production change." right>QoQ%</Th>
            <Th tip="Year-over-year BTC production change." right>YoY%</Th>
            <Th tip="Total Bitcoin on balance sheet at period end." right>BTC held</Th>
            <Th tip="Operational hashrate in EH/s." right>Hashrate</Th>
            <Th tip="Average electricity cost per kWh." right>Elec. price</Th>
            <Th tip="现金单币成本 — 直接现金支出 / BTC" right>Cash cost</Th>
            <Th tip="单币能源成本 — 纯电力成本 / BTC" right>Energy cost</Th>
            <Th tip="Total electrical power capacity in MW." right>Power (MW)</Th>
            <Th tip="Fleet efficiency in J/TH. Lower = better." right>J/TH</Th>
            <Th>Source</Th>
          </tr></thead>
          <tbody>
            {rows.map((r, i) => {
              const hasData = r.btc_production != null;
              return (
                <tr key={r.ticker || r.company} style={{ opacity: hasData ? 1 : 0.35 }}>
                  <td style={{ color: "var(--text3)", fontFamily: "DM Mono, monospace", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ position: "sticky", left: 0, background: "var(--bg2)", zIndex: 2, minWidth: 160 }}>
                    {/* No color dot — just clean text link */}
                    <Link href={`/company/${r.ticker}`} className="cl" style={{ color: "var(--text)", fontWeight: 500 }}>
                      {r.company}{r.ticker ? ` (${r.ticker})` : ""}
                    </Link>
                  </td>
                  <td className="r m">{r.btc_production != null ? r.btc_production.toLocaleString() : "—"}</td>
                  <td className="r"><Pct v={r.qoqProd} /></td>
                  <td className="r"><Pct v={r.yoyProd} /></td>
                  <td className="r m">{r.btc_holdings != null ? r.btc_holdings.toLocaleString() : "—"}</td>
                  <td className="r m">{r.hashrate_ehs ? `${r.hashrate_ehs} EH/s` : "—"}</td>
                  <td className="r m">{r.electricity_price ? `$${r.electricity_price}` : "—"}</td>
                  <td className="r m">{r.cash_cost_per_btc ? `$${r.cash_cost_per_btc.toLocaleString()}` : "—"}</td>
                  <td className="r m">{r.energy_cost_per_btc ? `$${r.energy_cost_per_btc.toLocaleString()}` : "—"}</td>
                  <td className="r m">{r.power_capacity_mw ? r.power_capacity_mw.toLocaleString() : "—"}</td>
                  <td className="r m">{r.efficiency_jth || "—"}</td>
                  <td style={{ fontSize: 11 }}>
                    {r.source_url
                      ? <a href={r.source_url} target="_blank" rel="noopener" style={{ color: "var(--text3)" }}>{r.sourceDate || "↗"}</a>
                      : (r.sourceDate || "—")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Visual Comparison Charts ──────────────────────────── */}
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
        Visual Comparison · {cur}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <HBarChart data={chartRows} dataKey="btc_production"    title="BTC Production" />
        <HBarChart data={chartRows} dataKey="hashrate_ehs"      title="Hashrate (EH/s)" />
        <HBarChart data={chartRows} dataKey="btc_holdings"      title="BTC Holdings" />
        <HBarChart data={chartRows} dataKey="cash_cost_per_btc" title="Cash Cost / BTC" />
      </div>
    </>
  );
}
