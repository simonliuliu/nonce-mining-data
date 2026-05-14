"use client";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell,
} from "recharts";

// 低饱和度协调色板
export const PALETTE = [
  "#7EA8BE", "#8DB5A0", "#BE9B7E", "#9E8FBF",
  "#7EBEAE", "#BEAC7E", "#BE7E8F", "#8FA8BE",
  "#A8BE8F", "#BF9E8A", "#8F9EBE", "#BE8FA8",
  "#9BBE8F", "#BE8F8F",
];

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const color = payload[0]?.fill || "#9b9b9b";
  return (
    <div style={{ background:"#141414", border:"1px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"8px 12px", fontSize:12, boxShadow:"0 6px 20px rgba(0,0,0,.7)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
        <span style={{ width:6, height:6, borderRadius:2, background:color, display:"inline-block", flexShrink:0 }} />
        <span style={{ color:"#9b9b9b", fontSize:11 }}>{label}</span>
      </div>
      <span style={{ color:"#e8e8e8", fontFamily:"DM Mono, monospace", fontWeight:600, fontSize:13 }}>
        {typeof val === "number" ? val.toLocaleString() : val}
      </span>
    </div>
  );
}

export default function MultiColorBar({ data, dataKey, title, height }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const sorted = [...data]
    .filter(d => d[dataKey] != null && d[dataKey] > 0)
    .sort((a, b) => b[dataKey] - a[dataKey])
    .slice(0, 14);

  if (!sorted.length) return (
    <div className="chart-card" style={{ padding:16, display:"flex", alignItems:"center", justifyContent:"center", minHeight:160 }}>
      <span style={{ color:"var(--text3)", fontSize:12 }}>No data</span>
    </div>
  );

  const chartHeight = height || Math.max(160, sorted.length * 26 + 40);

  return (
    <div className="chart-card" style={{ padding:"16px 16px 12px" }}>
      <div style={{ fontSize:11, fontWeight:500, color:"#9b9b9b", marginBottom:14, letterSpacing:"0.04em", textTransform:"uppercase" }}>
        {title}
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          /* 左右 margin 对称，让柱状图在卡片里居中 */
          margin={{ left: 8, right: 20, top: 2, bottom: 2 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize:10, fill:"#555" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            type="category" dataKey="ticker"
            tick={{ fontSize:11, fill:"#9b9b9b", fontWeight:500 }}
            width={46}
            axisLine={false} tickLine={false}
          />
          <ReTooltip content={<Tip />} cursor={false} />
          <Bar dataKey={dataKey} radius={[0,3,3,0]} barSize={13} onMouseEnter={(_,i) => setHoveredIndex(i)}>
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={hoveredIndex === null ? 0.78 : hoveredIndex === i ? 1 : 0.35}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
