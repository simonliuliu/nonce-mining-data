"use client";
import { useState } from "react";
import { fmt, fmtM } from "@/lib/helpers";
import {
  CompanyProductionChart,
  CompanyHashrateChart,
  CompanyCostChart,
  CompanyEfficiencyChart,
} from "@/components/Charts";
import Link from "next/link";

// Logo from companiesmarketcap.com — works for most listed tickers
function CompanyLogo({ ticker, size = 40 }) {
  const [ok, setOk] = useState(true);
  if (!ok || !ticker) return null;
  return (
    <img
      src={`https://companiesmarketcap.com/img/company-logos/64/${ticker}.webp`}
      alt={ticker}
      onError={() => setOk(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        objectFit: "contain",
        background: "#fff",
        padding: 3,
        flexShrink: 0,
      }}
    />
  );
}

const TABS = [
  { id: "market",  label: "Market Data",    icon: "📊" },
  { id: "about",   label: "About",          icon: "🏢" },
  { id: "filings", label: "Filings & Data", icon: "📋" },
  { id: "faq",     label: "FAQ",            icon: "❓" },
];

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      color: "var(--text3)",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      margin: "28px 0 12px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function CompanyTabs({
  ticker, color, ts, data, latest, profile,
  methodologyHtml, faqHtml, related, peers,
}) {
  const [active, setActive] = useState("market");

  return (
    <>
      {/* ── Tab bar ── */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        margin: "24px 0 0",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? color : "var(--text2)",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${isActive ? color : "transparent"}`,
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: -1,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ Market Data ══ */}
      {active === "market" && (
        <div style={{ paddingTop: 20 }}>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-label">BTC mined ({latest?.quarter})</div>
              <div className="metric-value" style={{ color }}>{fmt(latest?.btc_production)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">BTC holdings</div>
              <div className="metric-value">{fmt(latest?.btc_holdings)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Hashrate</div>
              <div className="metric-value">{latest?.hashrate_ehs ? `${latest.hashrate_ehs} EH/s` : "—"}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Cash cost / BTC</div>
              <div className="metric-value">{latest?.cash_cost_per_btc ? `$${latest.cash_cost_per_btc.toLocaleString()}` : "—"}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Power capacity</div>
              <div className="metric-value">{latest?.power_capacity_mw ? `${latest.power_capacity_mw.toLocaleString()} MW` : "—"}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Fleet efficiency</div>
              <div className="metric-value">{latest?.efficiency_jth ? `${latest.efficiency_jth} J/TH` : "—"}</div>
            </div>
          </div>

          {/* Mining Operations charts */}
          <SectionLabel>⛏ Mining Operations</SectionLabel>
          <div className="chart-grid">
            <CompanyProductionChart data={ts} color={color} />
            <CompanyHashrateChart data={ts} color={color} />
          </div>

          {/* Cost Analysis charts */}
          <SectionLabel>💸 Cost Analysis</SectionLabel>
          <div className="chart-grid">
            <CompanyCostChart data={ts} color={color} />
            <CompanyEfficiencyChart data={ts} color={color} />
          </div>

          {/* Related Research */}
          {related.length > 0 && (
            <>
              <SectionLabel>📰 Related Research</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {related.map(a => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} className="article-card">
                    <div className="article-card-title">{a.title}</div>
                    {a.meta_description && <div className="article-card-desc">{a.meta_description}</div>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ About ══ */}
      {active === "about" && (
        <div style={{ paddingTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            {profile?.description && (
              <div className="text-block">
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Overview</div>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>{profile.description}</p>
              </div>
            )}
            {profile?.business_model && (
              <div className="text-block">
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Business Model</div>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>{profile.business_model}</p>
              </div>
            )}
            {(profile?.headquarters || profile?.founded || profile?.website) && (
              <div className="text-block">
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Quick Facts</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    ["Ticker", `${ticker} · NASDAQ`],
                    profile?.headquarters && ["Headquarters", profile.headquarters],
                    profile?.founded     && ["Founded",       String(profile.founded)],
                    profile?.website     && ["Website",       profile.website],
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 14, fontSize: 13 }}>
                      <span style={{ color: "var(--text3)", minWidth: 100 }}>{label}</span>
                      {label === "Website"
                        ? <a href={value} target="_blank" rel="noopener" style={{ color }}>{value.replace(/^https?:\/\//, "")}</a>
                        : <span>{value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {methodologyHtml && (
            <div className="text-block" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Data Methodology</div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: methodologyHtml }} />
            </div>
          )}

          {peers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Compare with Peers</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {peers.map(p => <Link key={p} href={`/company/${p}`} className="tag">{p}</Link>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ Filings & Data ══ */}
      {active === "filings" && (
        <div style={{ paddingTop: 20 }}>
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16 }}>
            Historical quarterly data from SEC 10-Q and 10-K filings.{" "}
            <Link href="/methodology" style={{ color }}>See methodology →</Link>
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th className="r">BTC mined</th>
                  <th className="r">Holdings</th>
                  <th className="r">Hashrate</th>
                  <th className="r">Cash cost</th>
                  <th className="r">Energy cost</th>
                  <th className="r">Power (MW)</th>
                  <th className="r">J/TH</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map(r => {
                  let sd = r.report_period || "";
                  const d = sd.lastIndexOf("-");
                  if (d > -1) sd = sd.slice(d + 1).trim();
                  return (
                    <tr key={r.quarter}>
                      <td style={{ fontWeight: 500 }}>{r.quarter}</td>
                      <td className="r m">{fmt(r.btc_production)}</td>
                      <td className="r m">{fmt(r.btc_holdings)}</td>
                      <td className="r m">{r.hashrate_ehs ? `${r.hashrate_ehs} EH/s` : "—"}</td>
                      <td className="r m">{r.cash_cost_per_btc ? `$${r.cash_cost_per_btc.toLocaleString()}` : "—"}</td>
                      <td className="r m">{r.energy_cost_per_btc ? `$${r.energy_cost_per_btc.toLocaleString()}` : "—"}</td>
                      <td className="r m">{r.power_capacity_mw ? r.power_capacity_mw.toLocaleString() : "—"}</td>
                      <td className="r m">{r.efficiency_jth || "—"}</td>
                      <td style={{ fontSize: 11 }}>
                        {r.source_url
                          ? <a href={r.source_url} target="_blank" rel="noopener" style={{ color: "var(--text3)" }}>{sd || "↗"}</a>
                          : sd || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 10 }}>
            Last updated: {latest?.quarter}
          </p>
        </div>
      )}

      {/* ══ FAQ ══ */}
      {active === "faq" && (
        <div style={{ paddingTop: 20 }}>
          {faqHtml ? (
            <div className="text-block">
              <div className="prose" dangerouslySetInnerHTML={{ __html: faqHtml }} />
            </div>
          ) : (
            <div className="text-block" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "var(--text2)", margin: 0 }}>No FAQ content yet</p>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
                Add content after the <code>---</code> divider in this company's Notion Profile page.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
