"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import Link from "next/link";
import { getT } from "@/lib/i18n";
import MultiColorBar from "@/components/MultiColorBar";
import { PALETTE } from "@/components/MultiColorBar";
import SourcesTooltip from "@/components/SourcesTooltip";

// 折线图使用低饱和度协调色板，与柱状图统一风格
const LINE_PALETTE = [
  "#7EA8BE","#8DB5A0","#BE9B7E","#9E8FBF",
  "#7EBEAE","#BEAC7E","#BE7E8F","#8FA8BE",
];
// ticker → palette index (stable mapping)
const TICKER_LIST = ["BTDR","CLSK","RIOT","ABTC","CAN","WULF","FUFU","SLNH",
  "MARA","CORZ","HUT","IREN","HIVE","BITF","CIFR","CANG"];
const TICKER_COLORS = Object.fromEntries(
  TICKER_LIST.map((tk, i) => [tk, LINE_PALETTE[i % LINE_PALETTE.length]])
);
const PAL = Object.values(TICKER_COLORS);
const ax  = { fontSize: 11, fill: "#5a5a5a" };

// ─── Sort: null → bottom ──────────────────────────────────────
function sortRows(rows, field, sortAsc) {
  return [...rows].sort((a, b) => {
    const av = a[field], bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return sortAsc ? av - bv : bv - av;
  });
}

// ─── Formatters ───────────────────────────────────────────────
const fN    = v => v == null ? "—" : Math.round(v).toLocaleString();
const fDec  = (v, d=1) => v == null ? "—" : Number(v).toFixed(d);
const fD    = v => v == null ? "—" : `$${v.toLocaleString()}`;
const f100M = v => v == null ? "—" : v.toFixed(2);
const fPct  = v => v == null ? null : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;

// ─── Tooltip ─────────────────────────────────────────────────
function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#191919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,.6)" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.stroke, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#9b9b9b", fontSize: 11 }}>{p.name}:</span>
          <span style={{ color: "#ebebeb", fontFamily: "DM Mono, monospace", fontSize: 12 }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Pct badge ────────────────────────────────────────────────
function Pct({ v }) {
  if (v == null) return <span style={{ color: "var(--text3)" }}>—</span>;
  const c = v > 0 ? "var(--green)" : v < 0 ? "var(--red)" : "var(--text3)";
  return <span style={{ color: c, fontFamily: "DM Mono, monospace", fontSize: 12 }}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
}

function PctBadge({ v, suffix }) {
  if (v == null) return null;
  return <span style={{ fontSize: 12, color: v >= 0 ? "var(--green)" : "var(--red)", fontFamily: "DM Mono, monospace", fontWeight: 500 }}>{fPct(v)}{suffix ? ` ${suffix}` : ""}</span>;
}

// ─── Th ──────────────────────────────────────────────────────
function Th({ children, tip, right, stickyLeft }) {
  const [pos, setPos] = useState(null);
  const stickyStyle = stickyLeft != null ? {
    position: "sticky",
    left: stickyLeft,
    zIndex: 3,
    background: "var(--bg-inset)",
    boxShadow: "1px 0 0 var(--border, rgba(255,255,255,0.08))",
  } : {};
  return (
    <th className={right ? "r" : ""} style={{ cursor: tip ? "help" : "default", ...stickyStyle }}
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

// ─── Period selector ──────────────────────────────────────────
function PeriodSel({ items, current, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "var(--text)", cursor: "pointer", fontFamily: "inherit", minWidth: 96, justifyContent: "space-between" }}>
        <span>{current}</span>
        <svg viewBox="0 0 10 10" style={{ width: 10, height: 10, opacity: 0.5 }}><path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 8, padding: 4, zIndex: 300, boxShadow: "0 8px 24px rgba(0,0,0,.5)", minWidth: 110, maxHeight: 280, overflowY: "auto" }}>
          {[...items].reverse().map(q => (
            <button key={q} onClick={() => { onChange(q); setOpen(false); }} style={{ display: "block", width: "100%", padding: "7px 12px", background: q === current ? "var(--orange-dim)" : "none", border: "none", borderRadius: 6, fontSize: 13, textAlign: "left", color: q === current ? "var(--orange)" : "var(--text2)", fontWeight: q === current ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => { if (q !== current) e.currentTarget.style.background = "var(--bg3)"; }}
              onMouseLeave={e => { if (q !== current) e.currentTarget.style.background = "none"; }}>
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Clickable legend for trend chart ─────────────────────────
// Shows all company tickers as toggleable pills below the chart
function ToggleLegend({ tickers, hidden, onToggle }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
      {tickers.map(tk => {
        const isHidden = hidden.has(tk);
        const color = TICKER_COLORS[tk] || "#8b949e";
        return (
          <button
            key={tk}
            onClick={() => onToggle(tk)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "3px 9px",
              borderRadius: 5,
              border: `1px solid ${isHidden ? "var(--border)" : color + "60"}`,
              background: isHidden ? "transparent" : color + "15",
              cursor: "pointer",
              fontFamily: "DM Mono, monospace",
              fontSize: 11,
              fontWeight: 500,
              color: isHidden ? "var(--text3)" : color,
              opacity: isHidden ? 0.45 : 1,
              transition: "all 0.15s",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isHidden ? "var(--text3)" : color, flexShrink: 0 }} />
            {tk}
          </button>
        );
      })}
      <button
        onClick={() => onToggle("__all__")}
        style={{ padding: "3px 9px", borderRadius: 5, border: "1px solid var(--border)", background: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, color: "var(--text3)", transition: "color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "var(--text2)"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
      >
        {hidden.size > 0 ? "Show all" : "Hide all"}
      </button>
    </div>
  );
}

// ─── Column definitions (locale-aware) ───────────────────────
function buildColDefs(t) {
  return {
    btc_production:      { label: t("table.btcMined"),   tip: t("tooltips.btcMined"),   right: true, render: r => fN(r.btc_production) },
    btc_holdings:        { label: t("table.btcHeld"),    tip: t("tooltips.btcHeld"),    right: true, render: r => r.btc_holdings != null ? fN(r.btc_holdings) : "—" },
    hashrate_ehs:        { label: t("table.hashrate"),   tip: t("tooltips.hashrate"),   right: true, render: r => r.hashrate_ehs ? `${r.hashrate_ehs} EH/s` : "—" },
    cash_cost_per_btc:   { label: t("table.cashCost"),   tip: t("tooltips.cashCost"),   right: true, render: r => r.cash_cost_per_btc ? fD(r.cash_cost_per_btc) : "—" },
    energy_cost_per_btc: { label: t("table.energyCost"), tip: t("tooltips.energyCost"), right: true, render: r => r.energy_cost_per_btc ? fD(r.energy_cost_per_btc) : "—" },
    electricity_price:   { label: t("table.elecPrice"),  tip: t("tooltips.elecPrice"),  right: true, render: r => r.electricity_price ? `$${r.electricity_price}` : "—" },
    power_capacity_mw:   { label: t("table.powerMW"),    tip: t("tooltips.powerMW"),    right: true, render: r => r.power_capacity_mw ? fN(r.power_capacity_mw) : "—" },
    efficiency_jth:      { label: t("table.jth"),        tip: t("tooltips.jth"),        right: true, render: r => r.efficiency_jth || "—" },
    qoq:      { label: t("table.qoq"),  tip: t("tooltips.qoq"),      right: true, render: r => <Pct v={r.qoqProd} /> },
    yoy:      { label: t("table.yoy"),  tip: t("tooltips.yoy"),      right: true, render: r => <Pct v={r.yoyProd} /> },
    qoq_hash: { label: t("table.qoq"),  tip: t("tooltips.qoq"),      right: true, render: r => <Pct v={r.qoqHash} /> },
    yoy_hash: { label: t("table.yoy"),  tip: t("tooltips.yoy"),      right: true, render: r => <Pct v={r.yoyHash} /> },
    qoq_hold: { label: t("table.qoq"),  tip: t("tooltips.qoq"),      right: true, render: r => <Pct v={r.qoqHold} /> },
  };
}

// ─── Summary cards ────────────────────────────────────────────
// ─── Client-side helpers (quarter-reactive) ──────────────────
function buildBarData(rows, field, sortAsc) {
  return rows
    .filter(r => r[field] != null && r[field] > 0)
    .sort((a, b) => sortAsc
      ? (a[field] || Infinity) - (b[field] || Infinity)
      : (b[field] || 0) - (a[field] || 0))
    .map((r, i) => ({ ticker: r.ticker, company: r.company, value: r[field] }));
}

function buildCards(metric, enrichedByQuarter, cur, locale) {
  const lq      = cur;
  const allQ    = Object.keys(enrichedByQuarter).sort();
  const curIdx  = allQ.indexOf(cur);
  const lq2     = curIdx > 0 ? allQ[curIdx - 1] : "";
  const lqRows  = enrichedByQuarter[lq]  || [];
  const lq2Rows = enrichedByQuarter[lq2] || [];

  const sum  = (rows, f) => rows.reduce((s, r) => s + (r[f]||0), 0);
  const avg  = (rows, f) => { const v = rows.map(r=>r[f]).filter(x=>x!=null&&x>0); return v.length ? v.reduce((a,b)=>a+b,0)/v.length : null; };
  const top  = (rows, f, asc=false) => [...rows].filter(r=>r[f]!=null&&r[f]>0).sort((a,b)=>asc?a[f]-b[f]:b[f]-a[f])[0];
  const pct  = (a, b) => b!=null&&b!==0 ? ((a-b)/Math.abs(b))*100 : null;

  switch (metric) {
    case "production": {
      const isZh = locale === "zh";
      return [
        { label: `${isZh?"BTC 总产量":"Total BTC Production"} (${lq})`, value: fN(sum(lqRows,"btc_production")), pct: pct(sum(lqRows,"btc_production"),sum(lq2Rows,"btc_production")), pctSuffix: isZh?"较上季度":(locale==="zh"?"较上季度":"vs prev quarter"), color: "var(--brand)" },
        { label: isZh?"产量最高":"Top producer", value: top(lqRows,"btc_production")?.ticker||"—", sub: top(lqRows,"btc_production") ? fN(top(lqRows,"btc_production").btc_production)+" BTC" : null },
        { label: isZh?"平均产量":"Avg production", value: fN(avg(lqRows,"btc_production")), pct: pct(avg(lqRows,"btc_production"),avg(lq2Rows,"btc_production")), pctSuffix: isZh?"较上季度":(locale==="zh"?"较上季度":"vs prev quarter") },
        { label: isZh?"披露数据的公司":(locale==="zh"?"披露数据的公司":"Companies reporting"), value: lqRows.filter(r=>r.btc_production>0).length, sub: lq },
      ];
    }
    case "hashrate": return [
      { label: `Combined hashrate (${lq})`, value: `${fDec(sum(lqRows,"hashrate_ehs"))} EH/s`, pct: pct(sum(lqRows,"hashrate_ehs"),sum(lq2Rows,"hashrate_ehs")), pctSuffix: (locale==="zh"?"较上季度":"vs prev quarter"), color: "var(--orange)" },
      { label: (locale==="zh"?"算力最大":"Largest miner"), value: top(lqRows,"hashrate_ehs")?.ticker||"—", sub: top(lqRows,"hashrate_ehs") ? `${top(lqRows,"hashrate_ehs").hashrate_ehs} EH/s` : null },
      { label: (locale==="zh"?"平均算力":"Avg hashrate"), value: `${fDec(avg(lqRows,"hashrate_ehs"))} EH/s`, pct: pct(avg(lqRows,"hashrate_ehs"),avg(lq2Rows,"hashrate_ehs")), pctSuffix: (locale==="zh"?"较上季度":"vs prev quarter") },
      { label: (locale==="zh"?"披露数据的公司":"Companies reporting"), value: lqRows.filter(r=>r.hashrate_ehs>0).length, sub: `In ${lq}` },
    ];
    case "holdings": return [
      { label: `Total BTC held (${lq})`, value: fN(sum(lqRows,"btc_holdings")), pct: pct(sum(lqRows,"btc_holdings"),sum(lq2Rows,"btc_holdings")), pctSuffix: (locale==="zh"?"较上季度":"vs prev quarter"), color: "var(--orange)" },
      { label: (locale==="zh"?"持仓最多":"Largest treasury"), value: top(lqRows,"btc_holdings")?.ticker||"—", sub: top(lqRows,"btc_holdings") ? fN(top(lqRows,"btc_holdings").btc_holdings)+" BTC" : null },
      { label: (locale==="zh"?"平均持仓":"Avg holdings"), value: fN(avg(lqRows,"btc_holdings")), sub: `In ${lq}` },
      { label: (locale==="zh"?"披露数据的公司":"Companies reporting"), value: lqRows.filter(r=>r.btc_holdings!=null).length, sub: `In ${lq}` },
    ];
    case "cost": {
      const lqCash = avg(lqRows,"cash_cost_per_btc"), pqCash = avg(lq2Rows,"cash_cost_per_btc");
      const lqEnergy = avg(lqRows,"energy_cost_per_btc");
      const cheapest = top(lqRows,"cash_cost_per_btc",true);
      return [
        { label: `Avg cash cost (${lq})`, value: lqCash ? fD(Math.round(lqCash)) : "—", pct: pct(lqCash,pqCash), pctSuffix: (locale==="zh"?"较上季度":"vs prev quarter"), color: "var(--orange)" },
        { label: `Avg energy cost (${lq})`, value: lqEnergy ? fD(Math.round(lqEnergy)) : "—", sub: "Energy-only cost per BTC" },
        { label: (locale==="zh"?"成本最低":"Lowest cash cost"), value: cheapest?.ticker||"—", sub: cheapest?.cash_cost_per_btc ? fD(cheapest.cash_cost_per_btc)+"/BTC" : null, subColor: "var(--green)" },
        { label: (locale==="zh"?"披露数据的公司":"Companies reporting"), value: lqRows.filter(r=>r.cash_cost_per_btc>0).length, sub: `In ${lq}` },
      ];
    }
    case "efficiency": {
      const lqEff = avg(lqRows,"efficiency_jth"), pqEff = avg(lq2Rows,"efficiency_jth");
      const best = top(lqRows,"efficiency_jth",true);
      return [
        { label: (locale==="zh"?"最佳能效":"Best fleet efficiency"), value: best?.efficiency_jth ? `${best.efficiency_jth} J/TH` : "—", sub: best?.ticker, subColor: "var(--green)", color: "var(--green)" },
        { label: `Avg efficiency (${lq})`, value: lqEff ? `${fDec(lqEff)} J/TH` : "—", pct: pct(lqEff,pqEff), pctSuffix: (locale==="zh"?"较上季度":"vs prev quarter") },
        { label: (locale==="zh"?"合计电力":"Combined power"), value: `${fN(sum(lqRows,"power_capacity_mw"))} MW`, sub: `In ${lq}` },
        { label: (locale==="zh"?"披露数据的公司":"Companies reporting"), value: lqRows.filter(r=>r.efficiency_jth>0).length, sub: `In ${lq}` },
      ];
    }
    default: return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────
export default function RankingClient({
  metric = "production",
  meta = {},
  barData = [],
  trendData = [],
  summary = {},
  enrichedByQuarter = {},
  quarters = [],
  companies = [],
  locale = "en",
}) {
  const t   = getT(locale);
  const lq  = quarters[quarters.length - 1] || "";
  const [sel, setSel] = useState(lq);
  const cur = quarters.includes(sel) ? sel : lq;

  // All tickers that appear in trend data (top 8 by metric)
  const topTickers = useMemo(() => (
    (enrichedByQuarter[lq] || [])
      .filter(r => r[meta.field] != null && r[meta.field] > 0)
      .slice(0, 8)
      .map(r => r.ticker)
  ), [lq, meta.field, enrichedByQuarter]);

  // Which tickers are hidden (toggled off)
  const [hiddenLines, setHiddenLines] = useState(new Set());

  const toggleLine = useCallback((ticker) => {
    if (ticker === "__all__") {
      setHiddenLines(prev => prev.size > 0 ? new Set() : new Set(topTickers));
      return;
    }
    setHiddenLines(prev => {
      const next = new Set(prev);
      if (next.has(ticker)) next.delete(ticker);
      else next.add(ticker);
      return next;
    });
  }, [topTickers]);

  const rows = useMemo(() => {
    const raw = enrichedByQuarter[cur] || [];
    return sortRows(raw, meta.field, meta.sortAsc);
  }, [cur, meta.field, meta.sortAsc, enrichedByQuarter]);

  const cards = useMemo(
    () => buildCards(metric, enrichedByQuarter, cur, locale),
    [cur, metric, locale, enrichedByQuarter]
  );

  // Bar chart data: recomputed when quarter changes
  const curBarData = useMemo(() => {
    const rows = enrichedByQuarter[cur] || [];
    return buildBarData(rows, meta.field, meta.sortAsc);
  }, [cur, meta.field, meta.sortAsc, enrichedByQuarter]);
  const COL_DEFS = buildColDefs(t);
  const cols  = (meta.tableCols || []).map(k => COL_DEFS[k]).filter(Boolean);

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.02em" }}>{meta.fullTitle}</h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: 0 }}>
          {meta.desc}
          {" · "}
          <a
            href={`/${locale}/methodology`}
            style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 500 }}
          >
            {locale === "zh" ? "阅读方法论 →" : "Read methodology →"}
          </a>
        </p>
      </div>

      {/* Summary cards */}
      <div className="metric-grid" style={{ marginBottom: 20 }}>
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
            {c.sub && c.pct == null && (
              <div className="metric-sub" style={{ color: c.subColor || "var(--text2)" }}>{c.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>

        {/* Bar chart — 随季度联动 */}
        <MultiColorBar
          data={curBarData}
          dataKey="value"
          title={meta.barLabel}
          height={Math.max(200, curBarData.length * 26 + 40)}
        />

        {/* Trend chart with toggleable lines */}
        <div className="chart-card" style={{ padding: "16px 16px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", marginBottom: 14, letterSpacing: "0.02em" }}>
            {meta.trendLabel}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} />
              <ReTooltip content={<Tip />} />
              {topTickers.map(tk => (
                <Line
                  key={tk}
                  type="monotone"
                  dataKey={tk}
                  stroke={TICKER_COLORS[tk] || "#8b949e"}
                  strokeWidth={hiddenLines.has(tk) ? 0 : 2}
                  dot={hiddenLines.has(tk) ? false : { r: 3 }}
                  hide={hiddenLines.has(tk)}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {/* Clickable toggle legend */}
          <ToggleLegend tickers={topTickers} hidden={hiddenLines} onToggle={toggleLine} />
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>Detailed rankings</h2>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>
            {rows.filter(r => r[meta.field] != null).length} companies with data · {cur}
          </span>
        </div>
        <PeriodSel items={quarters} current={cur} onChange={setSel} />
      </div>

      <div className="table-wrap">
        <table style={{ minWidth: Math.max(600, cols.length * 110 + 220) }}>
          <thead>
            <tr>
              <Th stickyLeft={0}>#</Th>
              <Th stickyLeft={44}>Company</Th>
              {cols.map((c, i) => <Th key={i} tip={c.tip} right={c.right}>{c.label}</Th>)}
              <Th tip="Source filing.">Source</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.company || r.ticker} style={{ opacity: r[meta.field] == null ? 0.35 : 1 }}>
                <td style={{
                  color: "var(--text3)",
                  fontFamily: "DM Mono, monospace",
                  fontSize: 12,
                  position: "sticky",
                  left: 0,
                  zIndex: 1,
                  background: "var(--bg2)",
                  minWidth: 44,
                  width: 44,
                  boxShadow: "1px 0 0 var(--border, rgba(255,255,255,0.08))",
                }}>{i + 1}</td>
                <td style={{
                  minWidth: 140,
                  position: "sticky",
                  left: 44,
                  zIndex: 1,
                  background: "var(--bg2)",
                  boxShadow: "1px 0 0 var(--border, rgba(255,255,255,0.08))",
                }}>
                  <Link href={`/${locale}/company/${r.ticker}`} className="cl" style={{ color: "var(--text)", fontWeight: 500 }}>
                    {r.display_company || r.company}{(r.display_ticker || r.ticker) ? ` (${r.display_ticker || r.ticker})` : ""}
                  </Link>
                </td>
                {cols.map((c, ci) => (
                  <td key={ci} className={`${c.right ? "r" : ""} m ${c.cls ? c.cls(r) : ""}`}>{c.render(r)}</td>
                ))}
                <td style={{ fontSize: 11 }}>
                  <SourcesTooltip
                    sources={r.sources || (r.source_url ? [r.source_url] : [])}
                    quarter={r.sourceDate || r.quarter}
                    locale={locale}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
