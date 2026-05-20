"use client";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, ReferenceLine,
} from "recharts";

const ax = { fontSize: 11, fill: "#5a5a5a" };

// ★ 全局柱子最大宽度（px）
// 类目少时柱子不会变得过粗；类目多时这个限制不会生效，柱子按算法自然变窄
const MAX_BAR = 56;

// ─── Tooltip ──────────────────────────────────────────────────

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#191919",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "12px 16px",
      fontSize: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,.6)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 8, color: "#ebebeb", fontSize: 12 }}>{label}</div>
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.stroke, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#9b9b9b", minWidth: 90, fontSize: 11 }}>{p.name}</span>
          <span style={{ color: "#ebebeb", fontFamily: "DM Mono, monospace", fontWeight: 500, fontSize: 12 }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// 统一的卡片容器
function W({ title, children, height = 260 }) {
  return (
    <div className="chart-card" style={{ padding: "16px 16px 10px" }}>
      <div style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#9b9b9b",
        marginBottom: 14,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Production & Holdings ────────────────────────────────────
export function CompanyProductionChart({ data, color }) {
  return (
    <W title="BTC production & holdings" height={260}>
      <ComposedChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Bar
          yAxisId="left"
          dataKey="production"
          name="BTC mined"
          fill={color}
          fillOpacity={0.75}
          radius={[2, 2, 0, 0]}
          maxBarSize={MAX_BAR}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="holdings"
          name="BTC held"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={1.5}
          dot={{ r: 2, fill: "rgba(255,255,255,0.4)" }}
          connectNulls
        />
      </ComposedChart>
    </W>
  );
}

// ─── Hashrate & Power ─────────────────────────────────────────
export function CompanyHashrateChart({ data, color }) {
  return (
    <W title="Hashrate & power capacity" height={240}>
      <ComposedChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Bar
          yAxisId="left"
          dataKey="hashrate"
          name="Hashrate (EH/s)"
          fill={color}
          fillOpacity={0.75}
          radius={[2, 2, 0, 0]}
          maxBarSize={MAX_BAR}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="power_mw"
          name="Power (MW)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5}
          dot={{ r: 2 }}
          connectNulls
        />
      </ComposedChart>
    </W>
  );
}

// ─── Cost ─────────────────────────────────────────────────────
export function CompanyCostChart({ data, color }) {
  return (
    <W title="Cash cost per BTC" height={240}>
      <ComposedChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Bar
          dataKey="cash_cost"
          name="Cash cost/BTC"
          fill={color}
          fillOpacity={0.75}
          radius={[2, 2, 0, 0]}
          maxBarSize={MAX_BAR}
        />
        <Line
          type="monotone"
          dataKey="all_in_cost"
          name="All-in cost/BTC"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.5}
          dot={{ r: 2 }}
          connectNulls
        />
      </ComposedChart>
    </W>
  );
}

// ─── Efficiency ───────────────────────────────────────────────
export function CompanyEfficiencyChart({ data, color }) {
  return (
    <W title="Fleet efficiency (J/TH)" height={220}>
      <ComposedChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="efficiency"
          name="J/TH"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 2.5 }}
          connectNulls
        />
        <Bar
          yAxisId="right"
          dataKey="miner_count"
          name="Miners"
          fill="rgba(255,255,255,0.08)"
          radius={[2, 2, 0, 0]}
          maxBarSize={MAX_BAR}
        />
      </ComposedChart>
    </W>
  );
}

// Revenue & Margin 已不使用，保留导出避免 import 报错
export function CompanyRevenueChart() { return null; }
export function CompanyMarginChart()  { return null; }
