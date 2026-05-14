"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getT } from "@/lib/i18n";

export default function CompareSelector({ companies, locale }) {
  const t = getT(locale);
  const router = useRouter();
  const [a, setA] = useState(companies[0]?.ticker || "");
  const [b, setB] = useState(companies[1]?.ticker || "");
  const [error, setError] = useState("");

  function handleCompare() {
    if (!a || !b || a === b) { setError(t("compare.sameCompany")); return; }
    setError("");
    router.push(`/${locale}/compare/${a.toLowerCase()}-vs-${b.toLowerCase()}`);
  }

  const selStyle = {
    width:"100%", background:"var(--bg3)", border:"1px solid var(--border2)",
    borderRadius:8, padding:"10px 14px", fontSize:14, fontWeight:500,
    color:"var(--text)", cursor:"pointer", appearance:"none",
    WebkitAppearance:"none", outline:"none", fontFamily:"inherit",
  };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12, alignItems:"end", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{t("compare.companyA")}</div>
          <div style={{ position:"relative" }}>
            <select value={a} onChange={e => setA(e.target.value)} style={selStyle}>
              {companies.map(c => <option key={c.ticker} value={c.ticker}>{c.company} ({c.ticker})</option>)}
            </select>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text3)", fontSize:10 }}>▾</span>
          </div>
        </div>
        <div style={{ textAlign:"center", paddingBottom:2, fontSize:13, fontWeight:500, color:"var(--text3)" }}>vs</div>
        <div>
          <div style={{ fontSize:11, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{t("compare.companyB")}</div>
          <div style={{ position:"relative" }}>
            <select value={b} onChange={e => setB(e.target.value)} style={selStyle}>
              {companies.map(c => <option key={c.ticker} value={c.ticker}>{c.company} ({c.ticker})</option>)}
            </select>
            <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"var(--text3)", fontSize:10 }}>▾</span>
          </div>
        </div>
      </div>

      {error && <p style={{ fontSize:12, color:"var(--red)", marginBottom:10 }}>{error}</p>}

      <button onClick={handleCompare} style={{
        width:"100%", padding:"12px",
        background:"var(--brand)", border:"none", borderRadius:8,
        fontSize:14, fontWeight:600, color:"#0a1820",
        cursor:"pointer", fontFamily:"inherit",
        transition:"opacity 0.15s, transform 0.1s",
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.99)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {t("compare.compareBtn")}
      </button>
    </div>
  );
}
