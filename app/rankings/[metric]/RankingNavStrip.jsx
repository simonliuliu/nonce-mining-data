"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Revenue removed
const RANKINGS = [
  { key: "production", label: "BTC Production", icon: "⛏" },
  { key: "hashrate",   label: "Hashrate",        icon: "⚡" },
  { key: "holdings",  label: "BTC Holdings",     icon: "🏦" },
  { key: "cost",      label: "Cost per BTC",     icon: "💰" },
  { key: "efficiency",label: "Fleet Efficiency", icon: "🔋" },
];

export default function RankingNavStrip() {
  const pathname = usePathname();
  const active = pathname?.split("/rankings/")[1]?.split("/")[0] || "";

  return (
    <div style={{
      display: "flex",
      gap: 4,
      overflowX: "auto",
      paddingBottom: 2,
      marginBottom: 24,
      scrollbarWidth: "none",
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
              padding: "6px 14px",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              whiteSpace: "nowrap",
              textDecoration: "none",
              flexShrink: 0,
              background: isActive ? "var(--orange)" : "var(--bg2)",
              color: isActive ? "#000" : "var(--text2)",
              border: `1px solid ${isActive ? "var(--orange)" : "var(--border)"}`,
              transition: "all 0.15s",
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
