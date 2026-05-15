"use client";
import { useState } from "react";
import { getT } from "@/lib/i18n";
import {
  CompanyProductionChart,
  CompanyHashrateChart,
  CompanyCostChart,
  CompanyEfficiencyChart,
} from "@/components/Charts";
import Link from "next/link";

// 数字格式化辅助
const fmt = v => v == null ? "—" : typeof v === "number" ? v.toLocaleString() : v;
const fmtD = v => v == null ? "—" : `$${Number(v).toLocaleString()}`;

function SectionLabel({ children, small, style }) {
  return (
    <div style={{
      fontSize: small ? 10 : 11,
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
  ticker,
  color,
  ts,
  data,
  latest,
  profile,
  methodologyHtml,
  faqHtml,
  related,
  peers,
  locale = "en",
}) {
  const t = getT(locale);
  const [active, setActive] = useState("market");

  // 3 个 Tab（去掉了 Filings，因为表格已经放进 Market Data 里了）
  const TABS = [
    { id: "market", label: t("company.tabs.market") },
    { id: "about",  label: t("company.tabs.about")  },
    { id: "faq",    label: t("company.tabs.faq")    },
  ];

  // Quick facts 字段
  const quickFacts = [
    { key: "ticker",       label: t("company.fields.ticker"),       value: ticker },
    { key: "headquarters", label: t("company.fields.headquarters"), value: profile?.headquarters },
    { key: "founded",      label: t("company.fields.founded"),      value: profile?.founded },
    { key: "website",      label: t("company.fields.website"),      value: profile?.website, isLink: true },
  ].filter(f => f.value);

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

      {/* ══════════════════════════════════════
          TAB 1: Market Data
          包含：Key Metrics + Charts + ★季度历史表格★ + Related Research
          ══════════════════════════════════════ */}
      {active === "market" && (
        <div style={{ paddingTop: 20 }}>

          {/* Key metrics cards */}
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-label">
                {t("company.fields.btcMined")} ({latest?.quarter})
              </div>
              <div className="metric-value" style={{ color }}>
                {fmt(latest?.btc_production)}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t("company.fields.holdings")}</div>
              <div className="metric-value">{fmt(latest?.btc_holdings)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t("company.fields.hashrate")}</div>
              <div className="metric-value">
                {latest?.hashrate_ehs ? `${latest.hashrate_ehs} EH/s` : "—"}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t("company.fields.cashCost")}</div>
              <div className="metric-value">
                {latest?.cash_cost_per_btc ? fmtD(latest.cash_cost_per_btc) : "—"}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t("company.fields.power")}</div>
              <div className="metric-value">
                {latest?.power_capacity_mw ? `${latest.power_capacity_mw.toLocaleString()} MW` : "—"}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">{t("company.fields.efficiency")}</div>
              <div className="metric-value">
                {latest?.efficiency_jth ? `${latest.efficiency_jth} J/TH` : "—"}
              </div>
            </div>
          </div>

          {/* Mining Operations charts */}
          <SectionLabel>{t("company.sections.mining")}</SectionLabel>
          <div className="chart-grid">
            <CompanyProductionChart data={ts} color={color} />
            <CompanyHashrateChart data={ts} color={color} />
          </div>

          {/* Cost Analysis charts */}
          <SectionLabel>{t("company.sections.cost")}</SectionLabel>
          <div className="chart-grid">
            <CompanyCostChart data={ts} color={color} />
            <CompanyEfficiencyChart data={ts} color={color} />
          </div>

          {/* ══════════════════════════════════════
              ★★★ 季度历史数据表格 — 直接放在图表下方 ★★★
              ══════════════════════════════════════ */}
          <SectionLabel>
            {locale === "zh" ? "📋 历史季度数据" : "📋 Historical Quarterly Data"}
          </SectionLabel>

          <p style={{ fontSize: 13, color: "var(--text2)", margin: "0 0 14px" }}>
            {locale === "zh"
              ? <>季度数据来源于 SEC 10-Q、10-K 财报。<Link href={`/${locale}/methodology`} style={{ color }}>查看方法论 →</Link></>
              : <>Quarterly data sourced from SEC 10-Q and 10-K filings. <Link href={`/${locale}/methodology`} style={{ color }}>See methodology →</Link></>
            }
          </p>

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
                      <td className="r m">
                        {r.hashrate_ehs ? `${r.hashrate_ehs} EH/s` : "—"}
                      </td>
                      <td className="r m">
                        {r.cash_cost_per_btc ? fmtD(r.cash_cost_per_btc) : "—"}
                      </td>
                      <td className="r m">
                        {r.energy_cost_per_btc ? fmtD(r.energy_cost_per_btc) : "—"}
                      </td>
                      <td className="r m">
                        {r.power_capacity_mw ? r.power_capacity_mw.toLocaleString() : "—"}
                      </td>
                      <td className="r m">{r.efficiency_jth || "—"}</td>
                      <td style={{ fontSize: 12 }}>
                        {r.source_url ? (
                          <a
                            href={r.source_url}
                            target="_blank"
                            rel="noopener"
                            style={{ color }}
                          >
                            {sd || r.quarter}
                          </a>
                        ) : (
                          sd || "—"
                        )}
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

          {/* Related Research */}
          {related.length > 0 && (
            <>
              <SectionLabel>{t("company.sections.research")}</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
              }}>
                {related.map(a => (
                  <Link
                    key={a.slug}
                    href={`/${locale}/articles/${a.slug}`}
                    className="article-card"
                    style={{ textDecoration: "none" }}
                  >
                    <div className="article-card-title">{a.title}</div>
                    {a.meta_description && (
                      <div className="article-card-desc">{a.meta_description}</div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 2: About
          ══════════════════════════════════════ */}
      {active === "about" && (
        <div style={{ paddingTop: 20 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 12,
          }}>
            {/* Overview */}
            {profile?.description && (
              <div className="text-block">
                <SectionLabel small style={{ margin: "0 0 10px" }}>
                  {t("company.sections.overview")}
                </SectionLabel>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>
                  {profile.description}
                </p>
              </div>
            )}

            {/* Business Model */}
            {profile?.business_model && (
              <div className="text-block">
                <SectionLabel small style={{ margin: "0 0 10px" }}>
                  {t("company.sections.bizModel")}
                </SectionLabel>
                <p style={{ margin: 0, lineHeight: 1.75, fontSize: 14 }}>
                  {profile.business_model}
                </p>
              </div>
            )}

            {/* Quick Facts */}
            {quickFacts.length > 0 && (
              <div className="text-block">
                <SectionLabel small style={{ margin: "0 0 10px" }}>
                  {t("company.sections.quickFacts")}
                </SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {quickFacts.map(({ key, label, value, isLink }) => (
                    <div key={key} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                      <span style={{ color: "var(--text3)", width: 100, flexShrink: 0 }}>{label}</span>
                      {isLink ? (
                        <a href={value} target="_blank" rel="noopener" style={{ color }}>
                          {String(value).replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span>{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Methodology */}
          {methodologyHtml && (
            <div className="text-block" style={{ marginTop: 12 }}>
              <SectionLabel small style={{ margin: "0 0 10px" }}>
                {t("company.sections.methodology")}
              </SectionLabel>
              <div className="prose" dangerouslySetInnerHTML={{ __html: methodologyHtml }} />
            </div>
          )}

          {/* Peers */}
          {peers.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SectionLabel small style={{ margin: "0 0 10px" }}>
                {t("company.sections.peers")}
              </SectionLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {peers.map(p => (
                  <Link
                    key={p}
                    href={`/${locale}/company/${p}`}
                    className="tag"
                    style={{ padding: "6px 14px" }}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 3: FAQ
          ══════════════════════════════════════ */}
      {active === "faq" && (
        <div style={{ paddingTop: 20, maxWidth: 740 }}>
          {faqHtml ? (
            <div className="text-block prose">
              <div dangerouslySetInnerHTML={{ __html: faqHtml }} />
            </div>
          ) : (
            <div className="text-block" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "var(--text2)", margin: 0, fontSize: 15 }}>
                {locale === "zh" ? "暂无 FAQ 内容" : "No FAQ content yet"}
              </p>
              <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
                {locale === "zh"
                  ? <>在 Notion 该公司 Profile 页面的 <code>---</code> 分隔符之后添加内容即可显示。</>
                  : <>Add content after the <code>---</code> divider in this company's Notion Profile page.</>
                }
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
