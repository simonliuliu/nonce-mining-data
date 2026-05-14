"use client";
import { useState } from "react";

export default function CompanyLogoHeader({ ticker, company, color, headquarters, website, btcMiner = "Bitcoin Miner" }) {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "20px 0 0" }}>
      {logoOk ? (
        <img
          src={`https://companiesmarketcap.com/img/company-logos/64/${ticker}.webp`}
          alt={ticker}
          onError={() => setLogoOk(false)}
          style={{ width: 52, height: 52, borderRadius: 12, objectFit: "contain", background: "#fff", padding: 4, flexShrink: 0, border: "1px solid var(--border)" }}
        />
      ) : (
        <div style={{ width: 52, height: 52, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color, fontFamily: "DM Mono, monospace", flexShrink: 0, border: `1px solid ${color}30` }}>
          {ticker}
        </div>
      )}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{company}</h1>
        <div style={{ fontSize: 13, color: "var(--text3)", display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
          <span style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color }}>{ticker}</span>
          <span>·</span>
          <span>{btcMiner}</span>
          {headquarters && (<><span>·</span><span>📍 {headquarters}</span></>)}
          {website && (<><span>·</span><a href={website} target="_blank" rel="noopener" style={{ color: "var(--text3)" }}>Website ↗</a></>)}
        </div>
      </div>
    </div>
  );
}
