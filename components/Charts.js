"use client";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, ReferenceLine, Cell,
} from "recharts";

// Notion-style: 低饱和度单色渐进，不用彩虹色
// 图表只需区分不同公司，不需要强烈视觉冲突
const CHART_COLORS = [
  "#EFE6D0", // orange — 主品牌色，第一名
  "#9b9b9b", // 其余都是不同深度的灰蓝色
  "#7d8fa3",
  "#6b7a8d",
  "#5e6e7f",
  "#526070",
  "#475262",
  "#3c4554",
  "#323947",
  "#292e3a",
];

const ax = { fontSize: 11, fill: "#555555" };

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#141414",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      boxShadow: "0 8px 24px rgba(0,0,0,.7)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#e8e8e8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      {payload.filter(p => p.value != null).map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: 2, background: p.color || p.stroke, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#9b9b9b", fontSize: 11, minWidth: 80 }}>{p.name}</span>
          <span style={{ color: "#e8e8e8", fontFamily: "DM Mono, monospace", fontSize: 12 }}>
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// 包装组件：统一 padding 和标题样式
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

export function CompanyProductionChart({ data, color }) {
  return (
    <W title="BTC production & holdings" height={260}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Bar yAxisId="left" dataKey="production" name="BTC mined" fill={color} fillOpacity={0.75} radius={[2,2,0,0]} />
        <Line yAxisId="right" type="monotone" dataKey="holdings" name="BTC held" stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} dot={{ r: 2, fill: "rgba(255,255,255,0.4)" }} connectNulls />
      </ComposedChart>
    </W>
  );
}

export function CompanyHashrateChart({ data, color }) {
  return (
    <W title="Hashrate & power capacity" height={240}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Bar yAxisId="left" dataKey="hashrate" name="Hashrate (EH/s)" fill={color} fillOpacity={0.75} radius={[2,2,0,0]} />
        <Line yAxisId="right" type="monotone" dataKey="power_mw" name="Power (MW)" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} dot={{ r: 2 }} connectNulls />
      </ComposedChart>
    </W>
  );
}

export function CompanyCostChart({ data, color }) {
  return (
    <W title="Cash cost per BTC" height={240}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Bar dataKey="cash_cost" name="Cash cost/BTC" fill={color} fillOpacity={0.75} radius={[2,2,0,0]} />
        <Line type="monotone" dataKey="all_in_cost" name="All-in cost/BTC" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={{ r: 2 }} connectNulls />
      </ComposedChart>
    </W>
  );
}

export function CompanyEfficiencyChart({ data, color }) {
  return (
    <W title="Fleet efficiency (J/TH)" height={220}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="quarter" tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left"  tick={ax} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={ax} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} cursor={false} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9b9b9b" }} />
        <Line yAxisId="left" type="monotone" dataKey="efficiency" name="J/TH" stroke={color} strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
        <Bar yAxisId="right" dataKey="miner_count" name="Miners" fill="rgba(255,255,255,0.08)" radius={[2,2,0,0]} />
      </ComposedChart>
    </W>
  );
}

// Revenue 和 Margin 已不使用，保留导出避免 import 报错
export function CompanyRevenueChart() { return null; }
export function CompanyMarginChart()  { return null; }

// 首页和 Rankings 用的横向 bar chart 数据颜色方案
// 第一名用橙色，其余递减灰度
export function getBarColor(index) {
  return CHART_COLORS[Math.min(index, CHART_COLORS.length - 1)];
}
