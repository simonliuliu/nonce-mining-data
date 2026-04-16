"use client";
import Link from "next/link";
import { useState } from "react";

function MetricCard({ m }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg2)",
        border: `1px solid ${hovered ? m.color : "var(--border)"}`,
        borderRadius: 12,
        padding: "18px 20px",
        height: "100%",
        transition: "border-color 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Link href={`/metrics/${m.slug}`} style={{ textDecoration: "none", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 20 }}>{m.icon}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: m.color }}>{m.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "monospace" }}>{m.unit}</div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65, margin: "0 0 14px" }}>
          {m.desc}
        </p>
      </Link>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Link href={`/metrics/${m.slug}`} style={{ fontSize: 12, color: m.color, textDecoration: "none" }}>
          Learn more →
        </Link>
        <Link href={m.rankingUrl} style={{ fontSize: 12, color: "var(--text3)", textDecoration: "none", marginLeft: "auto" }}>
          Rankings →
        </Link>
      </div>
    </div>
  );
}

export default function MetricCards({ metrics }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: 14,
      marginBottom: 32,
    }}>
      {metrics.map(m => <MetricCard key={m.slug} m={m} />)}
    </div>
  );
}
