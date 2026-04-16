"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompareSelector({ companies }) {
  // companies: [{ ticker, company, color }, ...]
  const router = useRouter();
  const [a, setA] = useState(companies[0]?.ticker || "");
  const [b, setB] = useState(companies[1]?.ticker || "");
  const [error, setError] = useState("");

  const colorOf = (ticker) => companies.find(c => c.ticker === ticker)?.color || "var(--text)";

  function handleCompare() {
    if (!a || !b) { setError("Please select two companies."); return; }
    if (a === b) { setError("Please select two different companies."); return; }
    setError("");
    const slug = `${a.toLowerCase()}-vs-${b.toLowerCase()}`;
    router.push(`/compare/${slug}`);
  }

  const selectStyle = (ticker) => ({
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 15,
    fontWeight: 600,
    color: colorOf(ticker),
    cursor: "pointer",
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
    transition: "border-color 0.15s",
  });

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 12,
        alignItems: "end",
        marginBottom: 12,
      }}>
        {/* Company A */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
            Company A
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={a}
              onChange={e => setA(e.target.value)}
              style={selectStyle(a)}
            >
              {companies.map(c => (
                <option key={c.ticker} value={c.ticker}>{c.company} ({c.ticker})</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text3)", fontSize: 12 }}>▾</span>
          </div>
        </div>

        {/* VS label */}
        <div style={{ textAlign: "center", paddingBottom: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text3)" }}>VS</span>
        </div>

        {/* Company B */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
            Company B
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={b}
              onChange={e => setB(e.target.value)}
              style={selectStyle(b)}
            >
              {companies.map(c => (
                <option key={c.ticker} value={c.ticker}>{c.company} ({c.ticker})</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text3)", fontSize: 12 }}>▾</span>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "var(--red)", marginBottom: 10 }}>{error}</p>
      )}

      <button
        onClick={handleCompare}
        style={{
          width: "100%",
          padding: "13px",
          background: "var(--orange)",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          color: "#000",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Compare →
      </button>
    </div>
  );
}
