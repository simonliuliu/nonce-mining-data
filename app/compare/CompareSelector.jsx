"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompareSelector({ companies }) {
  const router = useRouter();
  const [a, setA] = useState(companies[0]?.ticker || "");
  const [b, setB] = useState(companies[1]?.ticker || "");
  const [error, setError] = useState("");

  function handleCompare() {
    if (!a || !b) { setError("Please select two companies."); return; }
    if (a === b)  { setError("Please select two different companies."); return; }
    setError("");
    router.push(`/compare/${a.toLowerCase()}-vs-${b.toLowerCase()}`);
  }

  const selectStyle = {
    width: "100%",
    background: "var(--bg3)",
    border: "1px solid var(--border2)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text)",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 12,
        alignItems: "end",
        marginBottom: 12,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Company A</div>
          <div style={{ position: "relative" }}>
            <select value={a} onChange={e => setA(e.target.value)} style={selectStyle}>
              {companies.map(c => (
                <option key={c.ticker} value={c.ticker}>{c.company} ({c.ticker})</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text3)", fontSize: 10 }}>▾</span>
          </div>
        </div>

        <div style={{ textAlign: "center", paddingBottom: 2, fontSize: 13, fontWeight: 600, color: "var(--text3)" }}>vs</div>

        <div>
          <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Company B</div>
          <div style={{ position: "relative" }}>
            <select value={b} onChange={e => setB(e.target.value)} style={selectStyle}>
              {companies.map(c => (
                <option key={c.ticker} value={c.ticker}>{c.company} ({c.ticker})</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text3)", fontSize: 10 }}>▾</span>
          </div>
        </div>
      </div>

      {error && <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 10 }}>{error}</p>}

      <button
        onClick={handleCompare}
        style={{
          width: "100%",
          padding: "11px",
          background: "var(--orange)",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: "#000",
          cursor: "pointer",
          transition: "opacity 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        Compare →
      </button>
    </div>
  );
}
