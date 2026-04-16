"use client";
// Horizontal nav strip shown at the TOP of every ranking page
// Users see all 6 dimensions immediately without scrolling

import Link from "next/link";
import { usePathname } from "next/navigation";

const RANKINGS = [
  { key: "production", label: "BTC Production", icon: "⛏" },
  { key: "hashrate",   label: "Hashrate",        icon: "⚡" },
  { key: "holdings",  label: "BTC Holdings",     icon: "🏦" },
  { key: "cost",      label: "Cost per BTC",     icon: "💰" },
  { key: "revenue",   label: "Revenue",          icon: "💵" },
  { key: "efficiency",label: "Fleet Efficiency", icon: "🔋" },
];

export default function RankingNavStrip() {
  const pathname = usePathname();
  // e.g. /rankings/production → active = "production"
  const active = pathname?.split("/rankings/")[1]?.split("/")[0] || "";

  return (
    <div style={{
      display: "flex",
      gap: 6,
      overflowX: "auto",
      paddingBottom: 2,
      marginBottom: 24,
      // Hide scrollbar but allow scroll on mobile
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
      {RANKINGS.map(r => {
        const isActive = active === r.key;
        return (
          <Link
            key={r.key}
            href={`/rankings/${r.key}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              whiteSpace: "nowrap",
              textDecoration: "none",
              flexShrink: 0,
              background: isActive ? "var(--orange)" : "var(--bg2)",
              color: isActive ? "#000" : "var(--text2)",
              border: `1px solid ${isActive ? "var(--orange)" : "var(--border)"}`,
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 12 }}>{r.icon}</span>
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
