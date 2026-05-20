"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from "recharts";
import Link from "next/link";
import MultiColorBar from "@/components/MultiColorBar";
import SourcesTooltip from "@/components/SourcesTooltip";
import { getT } from "@/lib/i18n";

const TICKER_COLORS = {
  MARA:"#F7931A", CLSK:"#00D4AA", RIOT:"#E05555", CORZ:"#E08042",
  HUT:"#9B7FE8",  BTDR:"#6C8EFF", IREN:"#D4A017", HIVE:"#5A9FE8",
  BITF:"#D472A6", WULF:"#34C48A", CAN:"#2DC4B4",  CIFR:"#E8823C",
  FUFU:"#B07FCC", SLNH:"#4ADE80", CANG:"#FF6B9D", ABTC:"#A0A0A0",
};
const PAL = Object.values(TICKER_COLORS);

// ─── Period dropdown ──────────────────────────────────────────
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
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "var(--text)", cursor: "pointer", fontFamily: "inherit", minWidth: 96, justifyContent: "space-between" }}>
        <span>{current}</span>
        <svg viewBox="0 0 10 10" style={{ width: 10, height: 10, opacity: 0.5 }}><path d="M2 4l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 8, padding: 4, zIndex: 300, boxShadow: "0 8px 24px rgba(0,0,0,.5)", minWidth: 110, maxHeight: 280, overflowY: "auto" }}>
          {[...quarters].reverse().map(q => (
            <button key={q} onClick={() => { onChange(q); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "7px 12px", background: q === current ? "var(--orange-dim)" : "none", border: "none", borderRadius: 6, fontSize: 13, textAlign: "left", color: q === current ? "var(--orange)" : "var(--text2)", fontWeight: q === current ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}
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

// ─── Bar chart ────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#191919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ fontFamily: "DM Mono, monospace", color: "var(--text2)" }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</div>)}
    </div>
  );
}

function HBarChart({ data, dataKey, title }) {
  const sorted = [...data].filter(d => d[dataKey] != null && d[dataKey] > 0).sort((a, b) => b[dataKey] - a[dataKey]).slice(0, 15);
  if (!sorted.length) return <div className="chart-card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}><span style={{ color: "var(--text3)", fontSize: 13 }}>No data</span></div>;
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
            {sorted.map((e, i) => <Cell key={i} fill={TICKER_COLORS[e.ticker] || PAL[i % PAL.length]} fillOpacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Table Th ─────────────────────────────────────────────────
function Pct({ v }) {
  if (v == null) return <span style={{ color: "var(--text3)" }}>—</span>;
  const c = v > 0 ? "var(--green)" : v < 0 ? "var(--red)" : "var(--text3)";
  return <span style={{ color: c, fontFamily: "DM Mono, monospace", fontSize: 12 }}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
}

// ─── Sortable Th ────────────────────────────────────────────
// Props:
//   tip       — 字符串，hover 显示 tooltip 提示（保留原有功能）
//   right     — 右对齐
//   sortKey   — 字符串，传了就表示这一列可排序
//   sortState — { key, dir }，当前排序状态
//   onSort    — function(key)，点击列时调用
function Th({ children, tip, right, sortKey, sortState, onSort }) {
  const [pos, setPos] = useState(null);
  const sortable = !!sortKey && !!onSort;
  const isActive = sortable && sortState?.key === sortKey;
  const arrow    = isActive ? (sortState.dir === "asc" ? "▲" : "▼") : "";

  const handleClick = () => {
    if (sortable) onSort(sortKey);
  };

  return (
    <th
      className={right ? "r" : ""}
      onClick={handleClick}
      style={{
        cursor: sortable ? "pointer" : (tip ? "help" : "default"),
        userSelect: "none",
        // 激活时整列标题加重颜色
        color: isActive ? "var(--text)" : undefined,
      }}
      onMouseEnter={e => { if (tip) { const b = e.currentTarget.getBoundingClientRect(); setPos({ x: b.left + b.width / 2, y: b.top }); } }}
      onMouseLeave={() => setPos(null)}
    >
      <span style={{
        borderBottom: tip ? "1px dashed var(--text3)" : "none",
        paddingBottom: 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}>
        {children}
        {sortable && (
          <span style={{
            fontSize: 9,
            color: isActive ? "var(--orange, #F7931A)" : "var(--text3)",
            opacity: isActive ? 1 : 0.4,
            fontFamily: "DM Mono, monospace",
            // 占位防止激活/未激活时宽度跳动
            minWidth: 8,
            display: "inline-block",
            textAlign: "center",
          }}>
            {arrow || "▾"}
          </span>
        )}
      </span>
      {pos && tip && <div style={{ position: "fixed", left: pos.x, top: pos.y - 8, transform: "translate(-50%,-100%)", background: "#191919", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text2)", width: 230, lineHeight: 1.5, zIndex: 9999, boxShadow: "0 12px 32px rgba(0,0,0,.6)", whiteSpace: "normal", fontWeight: 400, pointerEvents: "none" }}>{tip}</div>}
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
        if (r.ok) { const j = await r.json(); setPrice(Math.round(j?.market_data?.current_price?.usd || 0)); setSupply(Math.round(j?.market_data?.circulating_supply || 0)); }
      } catch (e) {}
    };
    go(); const timer = setInterval(go, 60000); return () => clearInterval(timer);
  }, []);
  return { price, supply };
}

// ─── Main ─────────────────────────────────────────────────────
export default function HomeClient({ enrichedByQuarter = {}, quarters = [], latestQ = "", locale = "en" }) {
  const t = getT(locale);
  const [sel, setSel] = useState(latestQ);
  const cur  = quarters.includes(sel) ? sel : latestQ;
  const rows = enrichedByQuarter[cur] || [];

  const { price: btcSpotPrice, supply: btcSupply } = useLiveBtcPrice();

  // ─── 排序状态 ──────────────────────────────────────────────
  // 默认按 BTC 产量降序
  const [sortState, setSortState] = useState({ key: "btc_production", dir: "desc" });

  // 点击列标题：同一列 → 切换方向；切换列 → 默认降序
  const handleSort = (key) => {
    setSortState(prev => {
      if (prev.key === key) return { key, dir: prev.dir === "desc" ? "asc" : "desc" };
      return { key, dir: "desc" };
    });
  };

  // 对当前 rows 排序
  // 规则：
  //   - 有数据的行排前面，null 值始终排到最后（不参与升降序）
  //   - company 列按字符串比较
  //   - 其他列按数字比较
  const sortedRows = useMemo(() => {
    const { key, dir } = sortState;
    const sign = dir === "asc" ? 1 : -1;

    const isString = key === "company";

    return [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];

      // null/undefined 永远排到最后
      const aNull = av == null || av === "";
      const bNull = bv == null || bv === "";
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;

      if (isString) {
        return String(av).localeCompare(String(bv)) * sign;
      }
      return (Number(av) - Number(bv)) * sign;
    });
  }, [rows, sortState]);

  const summary = useMemo(() => {
    const withProd = rows.filter(r => r.btc_production != null);
    const withCost = rows.filter(r => r.cash_cost_per_btc != null && r.cash_cost_per_btc > 0);
    const withHold = rows.filter(r => r.btc_holdings != null);
    return {
      totalMined: withProd.reduce((s, r) => s + (r.btc_production || 0), 0),
      totalHeld:  withHold.reduce((s, r) => s + (r.btc_holdings || 0), 0),
      avgCost:    withCost.length ? Math.round(withCost.reduce((s, r) => s + r.cash_cost_per_btc, 0) / withCost.length) : null,
      reportingCount: withProd.length,
    };
  }, [cur, rows]);

  const profitPct = (btcSpotPrice && summary.avgCost) ? ((btcSpotPrice - summary.avgCost) / btcSpotPrice) * 100 : null;
  const holdPct   = (summary.totalHeld && btcSupply) ? (summary.totalHeld / btcSupply) * 100 : null;

  // chartRows 用 sortedRows 保证图表跟表格顺序一致
  const chartRows = useMemo(() => sortedRows.map((r, i) => ({ ...r, color: TICKER_COLORS[r.ticker] || PAL[i % PAL.length] })), [cur, sortedRows]);

  return (
    <>
      {/* Metric cards */}
      <div className="metric-grid" style={{ marginBottom: 28 }}>
        <div className="metric-card">
          <div className="metric-label">{t("cards.totalMined")}</div>
          <div className="metric-value" style={{ color: "var(--orange)" }}>{summary.totalMined ? summary.totalMined.toLocaleString() : "—"}</div>
          <div className="metric-sub">{t("cards.companies", { n: summary.reportingCount })} · {cur}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">{t("cards.totalHeld")}</div>
          <div className="metric-value">{summary.totalHeld ? summary.totalHeld.toLocaleString() : "—"}</div>
          <div className="metric-sub">{holdPct != null ? t("cards.ofSupply", { n: holdPct.toFixed(2) }) : cur}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">{t("cards.spotPrice")}</div>
          <div className="metric-value">{btcSpotPrice ? `$${(btcSpotPrice / 1000).toFixed(1)}K` : "—"}</div>
          {profitPct != null && (
            <div className="metric-sub" style={{ color: profitPct >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
              {profitPct >= 0
                ? t("cards.aboveCost", { n: Math.abs(profitPct).toFixed(0), q: cur })
                : t("cards.belowCost", { n: Math.abs(profitPct).toFixed(0), q: cur })}
            </div>
          )}
        </div>
        <div className="metric-card">
          <div className="metric-label">{t("cards.avgCost")}</div>
          <div className="metric-value">{summary.avgCost ? `$${Math.round(summary.avgCost / 1000)}K` : "—"}</div>
          <div className="metric-sub">{cur} · {t("cards.companies", { n: summary.reportingCount })}</div>
        </div>
      </div>

      {/* Rankings table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>{t("table.rankings")}</h2>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>{t("table.companies", { n: rows.filter(r => r.btc_production != null).length })}</span>
        </div>
        <PeriodDropdown quarters={quarters} current={cur} onChange={setSel} />
      </div>

      <div className="table-wrap" style={{ marginBottom: 40 }}>
        <table style={{ minWidth: 1160 }}>
          <thead><tr>
            <Th>#</Th>
            <Th sortKey="company"             sortState={sortState} onSort={handleSort}>{t("table.company")}</Th>
            <Th sortKey="btc_production"      sortState={sortState} onSort={handleSort} tip={t("tooltips.btcMined")}   right>{t("table.btcMined")}</Th>
            <Th sortKey="qoqProd"             sortState={sortState} onSort={handleSort} tip={t("tooltips.qoq")}        right>{t("table.qoq")}</Th>
            <Th sortKey="yoyProd"             sortState={sortState} onSort={handleSort} tip={t("tooltips.yoy")}        right>{t("table.yoy")}</Th>
            <Th sortKey="btc_holdings"        sortState={sortState} onSort={handleSort} tip={t("tooltips.btcHeld")}    right>{t("table.btcHeld")}</Th>
            <Th sortKey="hashrate_ehs"        sortState={sortState} onSort={handleSort} tip={t("tooltips.hashrate")}   right>{t("table.hashrate")}</Th>
            <Th sortKey="electricity_price"   sortState={sortState} onSort={handleSort} tip={t("tooltips.elecPrice")}  right>{t("table.elecPrice")}</Th>
            <Th sortKey="cash_cost_per_btc"   sortState={sortState} onSort={handleSort} tip={t("tooltips.cashCost")}   right>{t("table.cashCost")}</Th>
            <Th sortKey="energy_cost_per_btc" sortState={sortState} onSort={handleSort} tip={t("tooltips.energyCost")} right>{t("table.energyCost")}</Th>
            <Th sortKey="power_capacity_mw"   sortState={sortState} onSort={handleSort} tip={t("tooltips.powerMW")}    right>{t("table.powerMW")}</Th>
            <Th sortKey="efficiency_jth"      sortState={sortState} onSort={handleSort} tip={t("tooltips.jth")}        right>{t("table.jth")}</Th>
            <Th tip={t("tooltips.source")}>{t("table.source")}</Th>
          </tr></thead>
          <tbody>
            {sortedRows.map((r, i) => {
              const hasData = r.btc_production != null;
              return (
                <tr key={r.ticker || r.company} style={{ opacity: hasData ? 1 : 0.35 }}>
                  <td style={{ color: "var(--text3)", fontFamily: "DM Mono, monospace", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ minWidth: 160 }}>
                    <Link href={`/${locale}/company/${r.ticker}`} className="cl" style={{ color: "var(--text)", fontWeight: 500 }}>
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
                    <SourcesTooltip
                      sources={r.sources || (r.source_url ? [r.source_url] : [])}
                      quarter={r.sourceDate || r.quarter}
                      locale={locale}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts — 2x2 等分网格 */}
      <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>
        {locale === "zh" ? `可视化对比 · ${cur}` : `Visual Comparison · ${cur}`}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <MultiColorBar data={chartRows} dataKey="btc_production"    title={t("table.btcMined")} />
        <MultiColorBar data={chartRows} dataKey="hashrate_ehs"      title={t("table.hashrate")} />
        <MultiColorBar data={chartRows} dataKey="btc_holdings"      title={t("table.btcHeld")} />
        <MultiColorBar data={chartRows} dataKey="cash_cost_per_btc" title={t("table.cashCost")} />
      </div>
    </>
  );
}
