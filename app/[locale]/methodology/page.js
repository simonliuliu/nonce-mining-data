import { getT } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import Link from "next/link";

// ─── 方法论页 SEO metadata ───────────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.methodology.title / desc
//
// 关键修复：
//   ❌ 旧版：title 用 "Hash Research"（带空格），全站其他位置是 "HashResearch"
//   ❌ 旧版：没有 canonical / alternates / og 完整字段
//   ✅ 新版：使用 i18n.seo，品牌名统一 + 完整 metadata + BreadcrumbList

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  const title = t("seo.methodology.title");
  const desc  = t("seo.methodology.desc");
  const path  = `/${locale}/methodology`;

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en:          "/en/methodology",
        zh:          "/zh/methodology",
        "x-default": "/en/methodology",
      },
    },

    openGraph: {
      title,
      description: desc,
      url:         path,
      type:        "article",         // 方法论是说明性文章，用 article 类型
      siteName:    t("seo.siteName"),
      locale:      locale === "zh" ? "zh_CN" : "en_US",
      images: [{
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: title,
      }],
    },

    twitter: {
      card:        "summary_large_image",
      title,
      description: desc,
      site:        "@hash_res",
      images:      ["/og-default.png"],
    },
  };
}

const METRICS_ZH = [
  {
    term: "BTC 季度产量",
    def:  "指公司在该自然季度内自营挖矿产生、且归属于公司的 BTC。不包括客户、托管客户、合资但非公司权益部分产生的 BTC。",
  },
  {
    term: "BTC 持仓",
    def:  "指季度末公司自有的 BTC。包括已经借出但所有权仍归公司的 BTC，以及已经作为借款担保或抵押、但所有权仍归公司的 BTC。不包括尚未计入公司资产负债表、代客户持有、待分配给第三方或被投资实体持有的 BTC。",
  },
  {
    term: "算力",
    def:  "优先采用自然季度平均运营算力。若公司未披露该口径，则依次采用期末算力、已通电算力、已安装算力或已部署算力作为替代，并明确标注为替代口径。单位统一为 EH/s。",
  },
  {
    term: "电价",
    def:  "优先采用公司实际或最接近实际运营的电力价格。若未披露实际电价，则依次采用单位电力成本、平均电力成本、能源费用除以用电量、PPA 电价、托管电价、目标电价或预测电价等口径。单位统一为美元 / kWh。",
  },
  {
    term: "电力规模",
    def:  "指季度末可支持挖矿运营的电力容量。若公司未披露标准口径，则依次采用已开发容量、可用容量、已投运容量、托管容量、网络运营容量或设施容量作为替代。不采用签约容量、储备容量、规划容量或管线容量作为主口径，只作为低质量参考。单位统一为 MW。",
  },
  {
    term: "矿机能效",
    def:  "优先采用公司矿机集群或运营矿机的平均能效。若未披露该口径，则依次采用运营矿机能效、当前矿机能效或已部署矿机能效作为替代。不采用单一矿机型号参数或未来目标能效作为主口径。单位统一为 J/TH。",
  },
  {
    term: "单币能源成本",
    def:  "指公司平均每挖出 1 枚 BTC 所发生的、与挖矿直接相关的净电力或能源成本。若公司直接披露该指标，则直接采用；若未披露，则使用「与挖矿直接相关的净电力成本 ÷ 自挖 BTC 产量」计算。",
  },
  {
    term: "单币现金成本",
    def:  "指公司平均每挖出 1 枚 BTC 所发生的直接现金成本，不包括矿机折旧。若公司直接披露该指标，则直接采用；若未披露，则根据可验证的挖矿现金成本、能源成本、托管成本及其他直接运营成本推导，并剔除折旧、摊销、减值、股权激励、利息、税费及非挖矿成本。",
  },
];

const METRICS_EN = [
  {
    term: "BTC Production",
    def:  "Self-mined Bitcoin produced and attributable to the company during the quarter. Excludes BTC produced for customers, hosted customers, or JV partners.",
  },
  {
    term: "BTC Holdings",
    def:  "Bitcoin owned by the company at quarter end. Includes BTC that has been lent out but remains company-owned, and BTC pledged as collateral. Excludes BTC held on behalf of clients, pending distribution, or held by investees.",
  },
  {
    term: "Hashrate",
    def:  "Preferred metric is average operational hashrate for the calendar quarter. Where unavailable, we use end-of-period, energized, installed, or deployed hashrate as alternatives, clearly labeled. Unit: EH/s.",
  },
  {
    term: "Electricity Price",
    def:  "Preferred metric is actual or nearest-to-actual operating electricity rate. Where not disclosed, we use unit power cost, average power cost, energy expense / consumption, PPA rate, hosting rate, target rate, or forecast rate. Unit: USD / kWh.",
  },
  {
    term: "Power Capacity",
    def:  "Energized power capacity supporting mining operations at quarter end. Where standard disclosure is absent, we use developed, available, operational, hosted, or facility capacity as alternatives. Contract, reserve, planned, or pipeline capacity is not used as a primary metric. Unit: MW.",
  },
  {
    term: "Fleet Efficiency",
    def:  "Average efficiency of the company fleet or operational miners. Where not disclosed, we use operational, current, or deployed fleet efficiency. Single-model specs and future target efficiency are not used as primary metrics. Unit: J/TH.",
  },
  {
    term: "Energy Cost per BTC",
    def:  "Net electricity or energy cost directly related to mining per BTC self-mined. Where directly disclosed, we use the reported figure. Where not, we calculate as net mining electricity cost divided by self-mined BTC production.",
  },
  {
    term: "Cash Cost per BTC",
    def:  "Direct cash cost per BTC mined, excluding miner depreciation. Where directly disclosed, we use the reported figure. Where not, we derive from verifiable mining cash costs, energy costs, hosting costs and other direct operating costs, stripping out depreciation, amortization, impairment, SBC, interest, taxes, and non-mining costs.",
  },
];

const SOURCES_ZH = [
  {
    level: "P0",
    items: [
      { title: "SEC / EDGAR 或其他监管文件", desc: "包括 10-Q、10-K、20-F、6-K、8-K、Exhibit 99.1 / 99.2 等。" },
      { title: "公司 IR 新闻稿", desc: "包括季度业绩公告、月度生产更新、运营更新、股东信等。" },
      { title: "公司官网 PDF / PPT / CDN 文件", desc: "包括 earnings presentation、investor presentation、annual report、operating update deck 等。" },
    ],
  },
  {
    level: "P1",
    items: [
      { title: "官方新闻稿线路", desc: "包括 GlobeNewswire、Business Wire、PR Newswire、Accesswire、Newsfile 等。这类来源通常转载公司正式公告，可在公司官网索引缺失时作为补充验证。" },
      { title: "官方 transcript", desc: "包括公司官网或 IR 页面发布的业绩会文字稿、电话会议记录等。" },
    ],
  },
  {
    level: "P2",
    items: [
      { title: "第三方 transcript、数据网站、新闻报道", desc: "仅作为搜索线索或辅助校验，不直接作为主数据采纳。只有在所有主来源均缺失时，才可作为低质量参考，并必须在页面中明确标注。" },
    ],
  },
];

const SOURCES_EN = [
  {
    level: "P0",
    items: [
      { title: "SEC / EDGAR or other regulatory filings", desc: "Includes 10-Q, 10-K, 20-F, 6-K, 8-K, Exhibit 99.1 / 99.2, etc." },
      { title: "Company IR press releases", desc: "Includes quarterly earnings releases, monthly production updates, operational updates, shareholder letters, etc." },
      { title: "Company website PDFs / PPTs / CDN files", desc: "Includes earnings presentations, investor presentations, annual reports, operating update decks, etc." },
    ],
  },
  {
    level: "P1",
    items: [
      { title: "Wire service press releases", desc: "Includes GlobeNewswire, Business Wire, PR Newswire, Accesswire, Newsfile, etc. These typically republish official company announcements and can supplement when company website sources are missing." },
      { title: "Official earnings transcripts", desc: "Includes transcripts and call recordings published on company websites or IR pages." },
    ],
  },
  {
    level: "P2",
    items: [
      { title: "Third-party transcripts, data sites, news reports", desc: "Used only as search leads or supplementary verification, never as primary data. Only usable as low-quality reference when all primary sources are absent, and must be clearly labeled on the page." },
    ],
  },
];

export default async function MethodologyPage({ params }) {
  const { locale } = await params;
  const isZh = locale === "zh";

  const metrics = isZh ? METRICS_ZH : METRICS_EN;
  const sources = isZh ? SOURCES_ZH : SOURCES_EN;

  // ─── 面包屑结构化数据 ───────────────────────────────────
  const breadcrumbData = breadcrumbSchema([
    { name: isZh ? "首页" : "Home",          url: `/${locale}` },
    { name: isZh ? "方法论" : "Methodology", url: `/${locale}/methodology` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
        <Link href={`/${locale}`}>{isZh ? "首页" : "Home"}</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{isZh ? "方法论" : "Methodology"}</span>
      </nav>

      <div style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {isZh ? "比特币矿企通用数据方法论" : "Bitcoin Mining Data Methodology"}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
          {isZh
            ? "了解本网站如何收集、校准和标准化上市比特币矿企数据。"
            : "How HashResearch collects, normalizes and publishes Bitcoin mining company data."}
        </p>

        {/* 指标与定义 */}
        <Section title={isZh ? "指标与定义" : "Metric Definitions"}>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, marginBottom: 16 }}>
            {isZh
              ? "本网站收集上市比特币矿企的季度经营与财务指标，当前固定每家公司、每个自然季度 8 个核心指标。"
              : "We track 8 core quarterly operational and financial metrics per company per calendar quarter."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {metrics.map(m => (
              <div key={m.term} style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--brand)",
                borderRadius: "0 8px 8px 0",
                padding: "12px 16px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>
                  {m.term}
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
                  {m.def}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 数据源与优先级 */}
        <Section title={isZh ? "数据源与优先级" : "Data Sources & Priority"}>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, marginBottom: 20 }}>
            {isZh
              ? "优先使用公司和监管机构披露的原始资料。所有数据均尽量回溯至公司公告、监管文件或官方投资者材料。第三方数据仅作为辅助线索，不直接作为主数据来源，除非所有主来源均缺失，并且该数据被明确标记为低质量参考。"
              : "We prioritize original disclosures from companies and regulators. All data is sourced from company announcements, regulatory filings, or official investor materials. Third-party data is used only as a supplementary lead, never as a primary source, unless all primary sources are absent and the data is explicitly marked as low-quality reference."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sources.map(s => (
              <div key={s.level}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", marginBottom: 8, fontFamily: "DM Mono, monospace" }}>
                  {s.level}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {s.items.map(item => (
                    <div key={item.title} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--text2)", lineHeight: 1.65 }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 时间口径 */}
        <Section title={isZh ? "时间口径" : "Reporting Period"}>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, margin: 0 }}>
            {isZh
              ? "所有季度均采用自然季度口径，Q1 为 1 月 1 日至 3 月 31 日，Q2 为 4 月 1 日至 6 月 30 日，Q3 为 7 月 1 日至 9 月 30 日，Q4 为 10 月 1 日至 12 月 31 日。"
              : "All quarters use calendar quarter convention: Q1 is Jan 1 – Mar 31, Q2 is Apr 1 – Jun 30, Q3 is Jul 1 – Sep 30, Q4 is Oct 1 – Dec 31."}
          </p>
        </Section>

        {/* 纠错 */}
        <Section title={isZh ? "错误纠正" : "Corrections"}>
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8, margin: 0 }}>
            {isZh ? (
              <>如发现数据错误，请通过{" "}
                <a href="https://x.com/hash_res" target="_blank" rel="noopener" style={{ color: "var(--brand)" }}>@hash_res</a>
                {" "}联系我们，我们会尽快修正。</>
            ) : (
              <>If you spot an error, reach us at{" "}
                <a href="https://x.com/hash_res" target="_blank" rel="noopener" style={{ color: "var(--brand)" }}>@hash_res</a>
                . We correct errors as soon as possible.</>
            )}
          </p>
        </Section>

        {/* 快捷链接 */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <Link href={`/${locale}/faq`} className="tag">{isZh ? "常见问题 →" : "FAQ →"}</Link>
          <Link href={`/${locale}/rankings/production`} className="tag">{isZh ? "查看数据 →" : "View Data →"}</Link>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
