"use client";
// Horizontal nav strip shown at the TOP of every metric page
// Users see all 8 metric pages at a glance

import Link from "next/link";
import { usePathname } from "next/navigation";

const METRICS = [
  { slug: "btc-production",     label: "BTC Production",    icon: "⛏" },
  { slug: "hashrate",           label: "Hashrate",          icon: "⚡" },
  { slug: "btc-holdings",       label: "BTC Holdings",      icon: "🏦" },
  { slug: "cash-cost-per-btc",  label: "Cash Cost",         icon: "💰" },
  { slug: "all-in-cost-per-btc",label: "All-in Cost",       icon: "📊" },
  { slug: "fleet-efficiency",   label: "Fleet Efficiency",  icon: "🔋" },
  { slug: "power-capacity",     label: "Power Capacity",    icon: "🏭" },
  { slug: "revenue",            label: "Revenue",           icon: "💵" },
];

export default function MetricsNavStrip() {
  const pathname = usePathname();
  const active = pathname?.split("/metrics/")[1]?.split("/")[0] || "";

  return (
    <div style={{
      display: "flex",
      gap: 6,
      overflowX: "auto",
      paddingBottom: 2,
      marginBottom: 24,
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
      {METRICS.map(m => {
        const isActive = active === m.slug;
        return (
          <Link
            key={m.slug}
            href={`/metrics/${m.slug}`}
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
              background: isActive ? "rgba(247,147,26,0.15)" : "var(--bg2)",
              color: isActive ? "var(--orange)" : "var(--text2)",
              border: `1px solid ${isActive ? "var(--orange)" : "var(--border)"}`,
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 12 }}>{m.icon}</span>
            {m.label}
          </Link>
        );
      })}
    </div>
  );
}
