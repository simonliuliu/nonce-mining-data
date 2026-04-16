"use client";
import { useState } from "react";
import { fmt, fmtM } from "@/lib/helpers";
import {
  CompanyProductionChart, CompanyHashrateChart,
  CompanyRevenueChart, CompanyMarginChart,
  CompanyCostChart, CompanyEfficiencyChart,
} from "@/components/Charts";
import Link from "next/link";

const TABS = [
  { id: "market",  label: "Market Data",    icon: "📊" },
  { id: "about",   label: "About",          icon: "🏢" },
  { id: "filings", label: "Filings & Data", icon: "📋" },
  { id: "faq",     label: "FAQ",            icon: "❓" },
];

const CATEGORY_COLORS = {
  "Company Analysis": "#F7931A",
  "Industry Report":  "#00D4AA",
  "Guide":            "#6C8EFF",
  "Data Update":      "#FF6B9D",
};
const PLACEHOLDER_BG = {
  "Company Analysis": "linear-gradient(135deg, #1a1200, #2a1f00)",
  "Industry Report":  "linear-gradient(135deg, #001a16, #002a22)",
  "Guide":            "linear-gradient(135deg, #0a0f1a, #0f1a2a)",
  "Data Update":      "linear-gradient(135deg, #1a001a, #2a0022)",
};

function accentOf(cat) { return CATEGORY_COLORS[cat] || "#F7931A"; }

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({ a }) {
  const [hovered, setHovered] = useState(false);
  const accent = accentOf(a.category);
  const bg = a.cover_image
    ? `url(${a.cover_image}) center/cover no-repeat`
    : (PLACEHOLDER_BG[a.category] || "linear-gradient(135deg, #0d1117, #161b24)");

  return (
    <Link
      href={`/articles/${a.slug}`}
      style={{ display: "block", textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        borderRadius: 10,
        border: `1px solid ${hovered ? accent : "var(--border)"}`,
        overflow: "hidden",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "border-color 0.2s, transform 0.15s",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Cover banner */}
        <div style={{
          height: 110,
          background: bg,
          flexShrink: 0,
          position: "relative",
        }}>
          {!a.cover_image && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, opacity: 0.1,
            }}>₿</div>
          )}
          {a.category && (
            <div style={{ position: "absolute", top: 10, left: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: accent,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                padding: "3px 8px", borderRadius: 4,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>{a.category}</span>
            </div>
          )}
        </div>
        {/* Body */}
        <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45, marginBottom: 6, flex: 1 }}>
            {a.title}
          </div>
          {a.meta_description && (
            <div style={{
              fontSize: 12, color: "var(--text2)", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden", marginBottom: 8,
            }}>{a.meta_description}</div>
          )}
          <div style={{ fontSize: 11, color: "var(--text3)", marginTop: "auto" }}>
            {a.publish_date || "Draft"}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: "var(--text3)",
      textTransform: "uppercase", letterSpacing: "0.08em",
      margin: "24px 0 12px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompanyTabs({
  ticker, color, ts, data, latest, profile,
  methodologyHtml, faqHtml, related, peers,
}) {
  const [active, setActive] = useState("market");

  return (
    <>
      {/* Tab bar */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid var(--border)",
        margin: "24px 0 0",
        overflowX: "auto",
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
              <span style={{ marginRight: 6 }}>{tab.icon}</span>{tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ Market Data ══ */}
      {active === "market" && (
        <div style={{ paddingTop: 20 }}>
          <div className="metric-grid">
            <div className="metric-card"><div className="metric-label">BTC mined ({latest?.quarter})</div><div className="metric-value" style={{ color }}>{fmt(latest?.btc_production)}</div></div>
            <div className="metric-card"><div className="metric-label">BTC holdings</div><div className="metric-value">{fmt(latest?.btc_holdings)}</div></div>
            <div className="metric-card"><div className="metric-label">Hashrate</div><div className="metric-value">{latest?.hashrate_ehs ? `${latest.hashrate_ehs} EH/s` : "—"}</div></div>
            <div className="metric-card"><div className="metric-label">Revenue</div><div className="metric-value">{fmtM(latest?.total_revenue_100m)}</div></div>
            <div className="metric-card"><div className="metric-label">Cash cost / BTC</div><div className="metric-value">{latest?.cash_cost_per_btc ? `$${latest.cash_cost_per_btc.toLocaleString()}` : "—"}</div></div>
            <div className="metric-card"><div className="metric-label">Power capacity</div><div className="metric-value">{latest?.power_capacity_mw ? `${latest.power_capacity_mw.toLocaleString()} MW` : "—"}</div></div>
          </div>

          <SectionLabel>⛏ Mining Operations</SectionLabel>
          <div className="chart-grid">
            <CompanyProductionChart data={ts} color={color} />
            <CompanyHashrateChart data={ts} color={color} />
          </div>

          <SectionLabel>💸 Cost Analysis</SectionLabel>
          <div className="chart-grid">
            <CompanyCostChart data={ts} color={color} />
            <CompanyEfficiencyChart data={ts} color={color} />
          </div>

          <SectionLabel>💵 Revenue & Profitability</SectionLabel>
          <div className="chart-grid">
            <CompanyRevenueChart data={ts} color={color} />
            <CompanyMarginChart data={ts} color={color} />
          </div>

          {/* Related Research — card grid with cover banners */}
          {related.length > 0 && (
            <>
              <SectionLabel>📰 Related Research</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
                marginBottom: 8,
              }}>
                {related.map(a => <ArticleCard key={a.slug} a={a} />)}
              </div>
              <Link href="/articles" style={{ fontSize: 13, color: "var(--text2)" }}>
                View all research →
              </Link>
            </>
          )}
        </div>
      )}

      {/* ══ About ══ */}
      {active === "about" && (
        <div style={{ paddingTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>

            {/* Overview */}
            {profile?.description && (
              <div style={{
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "20px 22px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Overview</div>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14, color: "var(--text)" }}>{profile.description}</p>
              </div>
            )}

            {/* Business Model */}
            {profile?.business_model && (
              <div style={{
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "20px 22px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Business Model</div>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>{profile.business_model}</p>
              </div>
            )}

            {/* Quick Facts */}
            {(profile?.headquarters || profile?.founded || profile?.website) && (
              <div style={{
                background: "var(--bg2)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "20px 22px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Quick Facts</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    ["Ticker",       `${ticker} · NASDAQ`],
                    profile?.headquarters && ["Headquarters", profile.headquarters],
                    profile?.founded && ["Founded", String(profile.founded)],
                    profile?.website && ["Website", profile.website],
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                      <span style={{ color: "var(--text3)", minWidth: 100, flexShrink: 0 }}>{label}</span>
                      {label === "Website"
                        ? <a href={value} target="_blank" rel="noopener" style={{ color }}>{value.replace(/^https?:\/\//, "")}</a>
                        : <span>{value}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Methodology — full width */}
          {methodologyHtml && (
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "22px 24px", marginTop: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Data Methodology</div>
              <div className="prose" dangerouslySetInnerHTML={{ __html: methodologyHtml }} />
            </div>
          )}

          {/* Compare with Peers */}
          {peers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SectionLabel style={{ margin: "0 0 10px" }}>Compare with Peers</SectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {peers.map(p => (
                  <Link key={p} href={`/company/${p}`} className="tag" style={{ padding: "6px 14px" }}>{p}</Link>
                ))}
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
                  <th className="r">Revenue</th>
                  <th className="r">Net income</th>
                  <th className="r">Cash cost</th>
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
                      <td className="r m">{r.hashrate_ehs || "—"}</td>
                      <td className="r m">{fmtM(r.total_revenue_100m)}</td>
                      <td className={`r m ${(r.net_income_100m || 0) >= 0 ? "pos" : "neg"}`}>{fmtM(r.net_income_100m)}</td>
                      <td className="r m">{r.cash_cost_per_btc ? `$${r.cash_cost_per_btc.toLocaleString()}` : "—"}</td>
                      <td style={{ fontSize: 12 }}>
                        {r.source_url
                          ? <a href={r.source_url} target="_blank" rel="noopener" style={{ color }}>{sd || "SEC"}</a>
                          : sd || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 10 }}>Last updated: {latest?.quarter}</p>
        </div>
      )}

      {/* ══ FAQ ══ */}
      {active === "faq" && (
        <div style={{ paddingTop: 20 }}>
          {faqHtml ? (
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "24px 28px",
            }}>
              <div className="prose" dangerouslySetInnerHTML={{ __html: faqHtml }} />
            </div>
          ) : (
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "48px 24px", textAlign: "center",
            }}>
              <p style={{ color: "var(--text2)", margin: 0, fontSize: 15 }}>No FAQ content yet</p>
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
