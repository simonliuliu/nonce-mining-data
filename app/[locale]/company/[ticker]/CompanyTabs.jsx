"use client";
import { useState } from "react";
import { getT } from "@/lib/i18n";
import { CompanyProductionChart, CompanyHashrateChart, CompanyCostChart, CompanyEfficiencyChart } from "@/components/Charts";
import Link from "next/link";

export default function CompanyTabs({ ticker, color, ts, data, latest, profile, methodologyHtml, faqHtml, related, peers, locale = "en" }) {
  const t = getT(locale);
  const [active, setActive] = useState("market");

  const TABS = [
    { id: "market",  label: t("company.tabs.market")  },
    { id: "about",   label: t("company.tabs.about")   },
    { id: "filings", label: t("company.tabs.filings") },
    { id: "faq",     label: t("company.tabs.faq")     },
  ];

  const fmt = v => v == null ? "—" : typeof v === "number" ? v.toLocaleString() : v;

  return (
    <>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", margin: "24px 0 0", overflowX: "auto", scrollbarWidth: "none" }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? color : "var(--text2)", background: "none", border: "none", borderBottom: `2px solid ${isActive ? color : "transparent"}`, cursor: "pointer", transition: "all 0.15s", marginBottom: -1, whiteSpace: "nowrap", flexShrink: 0 }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Market Data ── */}
      {active === "market" && (
        <div style={{ paddingTop: 20 }}>
          <div className="metric-grid">
            {[
              { label: t("company.fields.btcMined"),   value: fmt(latest?.btc_production) },
              { label: t("company.fields.holdings"),   value: fmt(latest?.btc_holdings) },
              { label: t("company.fields.hashrate"),   value: latest?.hashrate_ehs ? `${latest.hashrate_ehs} EH/s` : "—" },
              { label: t("company.fields.cashCost"),   value: latest?.cash_cost_per_btc ? `$${latest.cash_cost_per_btc.toLocaleString()}` : "—" },
              { label: t("company.fields.power"),      value: latest?.power_capacity_mw ? `${latest.power_capacity_mw.toLocaleString()} MW` : "—" },
              { label: t("company.fields.efficiency"), value: latest?.efficiency_jth ? `${latest.efficiency_jth} J/TH` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="metric-card">
                <div className="metric-label">{label} ({latest?.quarter})</div>
                <div className="metric-value" style={{ fontSize: 20 }}>{value}</div>
              </div>
            ))}
          </div>

          <SectionLabel>{t("company.sections.mining")}</SectionLabel>
          <div className="chart-grid">
            <CompanyProductionChart data={ts} color={color} />
            <CompanyHashrateChart data={ts} color={color} />
          </div>

          <SectionLabel>{t("company.sections.cost")}</SectionLabel>
          <div className="chart-grid">
            <CompanyCostChart data={ts} color={color} />
            <CompanyEfficiencyChart data={ts} color={color} />
          </div>

          {related.length > 0 && (
            <>
              <SectionLabel>{t("company.sections.research")}</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {related.map(a => (
                  <Link key={a.slug} href={`/${locale}/articles/${a.slug}`} className="article-card">
                    <div className="article-card-title">{a.title}</div>
                    {a.meta_description && <div className="article-card-desc">{a.meta_description}</div>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── About ── */}
      {active === "about" && (
        <div style={{ paddingTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            {profile?.description && (
              <div className="text-block">
                <SectionLabel small>{t("company.sections.overview")}</SectionLabel>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>{profile.description}</p>
              </div>
            )}
            {profile?.business_model && (
              <div className="text-block">
                <SectionLabel small>{t("company.sections.bizModel")}</SectionLabel>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>{profile.business_model}</p>
              </div>
            )}
            {(profile?.headquarters || profile?.founded || profile?.website) && (
              <div className="text-block">
                <SectionLabel small>{t("company.sections.quickFacts")}</SectionLabel>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    [t("company.fields.ticker"),       `${ticker} · NASDAQ`],
                    profile?.headquarters && [t("company.fields.headquarters"), profile.headquarters],
                    profile?.founded      && [t("company.fields.founded"),      String(profile.founded)],
                    profile?.website      && [t("company.fields.website"),      profile.website],
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", gap: 14, fontSize: 13 }}>
                      <span style={{ color: "var(--text3)", minWidth: 100 }}>{label}</span>
                      {label === t("company.fields.website")
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
              <SectionLabel small>{t("company.sections.methodology")}</SectionLabel>
              <div className="prose" dangerouslySetInnerHTML={{ __html: methodologyHtml }} />
            </div>
          )}

          {peers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SectionLabel small>{t("company.sections.peers")}</SectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {peers.map(p => <Link key={p} href={`/${locale}/company/${p}`} className="tag">{p}</Link>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filings ── */}
      {active === "filings" && (
        <div style={{ paddingTop: 20 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("company.table.quarter")}</th>
                  <th className="r">{t("company.table.btcMined")}</th>
                  <th className="r">{t("company.table.holdings")}</th>
                  <th className="r">{t("company.table.hashrate")}</th>
                  <th className="r">{t("company.table.cashCost")}</th>
                  <th className="r">{t("company.table.energyCost")}</th>
                  <th className="r">{t("company.table.powerMW")}</th>
                  <th className="r">{t("company.table.jth")}</th>
                  <th>{t("company.table.source")}</th>
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
                        {r.source_url ? <a href={r.source_url} target="_blank" rel="noopener" style={{ color: "var(--text3)" }}>{sd || "↗"}</a> : sd || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 10 }}>
            {t("company.table.updated")}: {latest?.quarter}
          </p>
        </div>
      )}

      {/* ── FAQ ── */}
      {active === "faq" && (
        <div style={{ paddingTop: 20 }}>
          {faqHtml ? (
            <div className="text-block">
              <div className="prose" dangerouslySetInnerHTML={{ __html: faqHtml }} />
            </div>
          ) : (
            <div className="text-block" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "var(--text2)", margin: 0 }}>No FAQ content yet</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SectionLabel({ children, small }) {
  return (
    <div style={{ fontSize: small ? 10 : 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: small ? "0 0 10px" : "28px 0 12px" }}>
      {children}
    </div>
  );
}
