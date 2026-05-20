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
// 同量纲双柱图：cash cost / BTC 和 energy cost / BTC 并排展示
// 两柱用同色不同透明度，配合自定义 Legend 让图例和柱子视觉完全一致
//
// 自定义 Legend：手动画出色块，应用与 Bar 一致的 fillOpacity
// （recharts 默认 Legend 忽略 Bar 的 fillOpacity，所以图例看起来同色）
function CostChartLegend({ color }) {
  const item = (label, opacity) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9b9b9b" }}>
      <span style={{
        display: "inline-block",
        width: 14,
        height: 14,
        background: color,
        opacity,
        borderRadius: 2,
      }} />
      {label}
    </span>
  );
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: 24,
      paddingTop: 8,
    }}>
      {item("Cash cost/BTC",   0.85)}
      {item("Energy cost/BTC", 0.45)}
    </div>
  );
}

export function CompanyCostChart({ data, color }) {
  return (
    <W title="Cash cost & energy cost per BTC" height={240}>
      <ComposedChart data={data} barCategoryGap="25%" barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend content={<CostChartLegend color={color} />} />
        <Bar
          dataKey="cash_cost"
          name="Cash cost/BTC"
          fill={color}
          fillOpacity={0.85}
          radius={[2, 2, 0, 0]}
          maxBarSize={MAX_BAR}
        />
        <Bar
          dataKey="energy_cost"
          name="Energy cost/BTC"
          fill={color}
          fillOpacity={0.45}
          radius={[2, 2, 0, 0]}
          maxBarSize={MAX_BAR}
        />
      </ComposedChart>
    </W>
  );
}

// ─── Efficiency ───────────────────────────────────────────────
// 单一指标：fleet efficiency (J/TH)。原 Miners 柱图已移除。
export function CompanyEfficiencyChart({ data, color }) {
  return (
    <W title="Fleet efficiency (J/TH)" height={220}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Line
          type="monotone"
          dataKey="efficiency"
          name="J/TH"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 2.5 }}
          connectNulls
        />
      </ComposedChart>
    </W>
  );
}

// Revenue & Margin 已不使用，保留导出避免 import 报错
export function CompanyRevenueChart() { return null; }
export function CompanyMarginChart()  { return null; }
