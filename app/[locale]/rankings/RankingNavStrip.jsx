"use client";
import Link from "next/link";
import { getT } from "@/lib/i18n";

const RANKINGS = [
  { key:"production", icon:"⛏" }, { key:"hashrate", icon:"⚡" },
  { key:"holdings",   icon:"🏦" }, { key:"cost",     icon:"💰" },
  { key:"efficiency", icon:"🔋" },
];

export default function RankingNavStrip({ locale = "en", activeMetric = "" }) {
  const t = getT(locale);
  return (
    <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2, marginBottom:24, scrollbarWidth:"none" }}>
      {RANKINGS.map(r => {
        const isActive = activeMetric === r.key;
        return (
          <Link key={r.key} href={`/${locale}/rankings/${r.key}`} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"6px 14px", borderRadius:7,
            fontSize:13, fontWeight: isActive ? 600 : 400,
            whiteSpace:"nowrap", textDecoration:"none", flexShrink:0,
            background: isActive ? "var(--brand)" : "var(--bg2)",
            color: isActive ? "#0a1820" : "var(--text2)",
            border: `1px solid ${isActive ? "var(--brand)" : "var(--border)"}`,
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize:12 }}>{r.icon}</span>
            {t(`rankings.${r.key}.title`)}
          </Link>
        );
      })}
    </div>
  );
}
