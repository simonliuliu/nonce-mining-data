"use client";
import Link from "next/link";
import { useState } from "react";

function PairLink({ ca, cb }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/compare/${ca.ticker.toLowerCase()}-vs-${cb.ticker.toLowerCase()}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg2)",
        border: `1px solid ${hovered ? "var(--orange)" : "var(--border)"}`,
        borderRadius: 10,
        padding: "12px 14px",
        textDecoration: "none",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontWeight: 700, color: ca.color, fontSize: 13, fontFamily: "monospace" }}>{ca.ticker}</span>
      <span style={{ color: "var(--text3)", fontSize: 11 }}>vs</span>
      <span style={{ fontWeight: 700, color: cb.color, fontSize: 13, fontFamily: "monospace" }}>{cb.ticker}</span>
      <span style={{ marginLeft: "auto", color: "var(--text3)", fontSize: 12 }}>→</span>
    </Link>
  );
}

export default function QuickCompareLinks({ pairs }) {
  if (!pairs.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
      {pairs.map(([ca, cb]) => (
        <PairLink key={`${ca.ticker}-${cb.ticker}`} ca={ca} cb={cb} />
      ))}
    </div>
  );
}
