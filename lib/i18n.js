// lib/i18n.js
// 翻译字符串直接内联在这里，不依赖 JSON 文件导入

export const LOCALES = ["en", "zh"];
export const DEFAULT_LOCALE = "en";

const DICT = {
  // ──────────────────────────────────────────────────────────────
  //  ENGLISH
  // ──────────────────────────────────────────────────────────────
  en: {
    nav: {
      overview: "Overview",
      rankings: "Rankings",
      compare:  "Compare",
      research: "Research",
      docs:     "Methodology",
    },
    home: {
      title:    "Bitcoin Mining Company Data & Analytics",
      subtitle: "Track {count} publicly listed Bitcoin mining companies. Compare BTC production, BTC treasury, average operational hashrate, power capacity, fleet efficiency and unit costs. Data sourced from SEC filings, company announcements and investor materials.",
      exploreTitle:  "Explore by metric",
      profilesTitle: "Company profiles",
      metrics: {
        production: { label: "BTC Production",       desc: "Who mines the most?" },
        hashrate:   { label: "Hashrate",              desc: "Computing power" },
        holdings:   { label: "Treasury",              desc: "Bitcoin treasuries" },
        cost:       { label: "Cash Cost / BTC",       desc: "Cheapest producers" },
        revenue:    { label: "Revenue",               desc: "Top line comparison" },
        efficiency: { label: "Efficiency (J/TH)",     desc: "Energy per terahash" },
      },
    },
    cards: {
      totalMined: "Total BTC Production",
      totalHeld:  "Total BTC Treasury",
      spotPrice:  "BTC Spot Price (live)",
      avgCost:    "Avg Cash Cost / BTC",
      companies:  "{n} companies",
      ofSupply:   "{n}% of circulating supply",
      aboveCost:  "▲ {n}% above {q} avg cost",
      belowCost:  "▼ {n}% below {q} avg cost",
    },
    table: {
      company:    "Company",
      btcMined:   "BTC Production",
      qoq:        "Production QoQ%",
      yoy:        "Production YoY%",
      btcHeld:    "Treasury",
      hashrate:   "Hashrate",
      elecPrice:  "Elec. Price",
      cashCost:   "Cash Cost / BTC",
      energyCost: "Energy Cost / BTC",
      powerMW:    "Power (MW)",
      jth:        "Efficiency (J/TH)",
      source:     "Source",
      rankings:   "Company Rankings",
      companies:  "{n} companies",
    },
    // ★★★ 精简后的 tooltips（保留方法论核心含义）★★★
    tooltips: {
      btcMined:
        "Self-mined BTC attributable to the company this quarter. Excludes customer, hosted, and JV non-equity portions.",
      qoq:
        "Quarter-over-quarter change in self-mined BTC production.",
      yoy:
        "Year-over-year change in self-mined BTC production.",
      btcHeld:
        "BTC owned by the company at quarter end. Includes BTC lent or pledged where ownership remains with the company.",
      hashrate:
        "Preferred: average operational hashrate. Falls back to period-end, energized, installed, or deployed. Unit: EH/s.",
      elecPrice:
        "Preferred: actual operating electricity rate. Falls back to unit cost, PPA rate, or energy ÷ consumption. Unit: USD/kWh.",
      powerMW:
        "Energized power capacity supporting mining at quarter end. Falls back to developed, available, or hosting capacity. Unit: MW.",
      jth:
        "Average fleet or operational miner efficiency. Lower is better. Unit: J/TH.",
      energyCost:
        "Net electricity or energy cost per self-mined BTC.",
      cashCost:
        "Direct cash cost per self-mined BTC, excluding miner depreciation.",
      source:
        "Primary source: SEC filing or company announcement.",
    },
    rankings: {
      production: { title: "BTC Production",          fullTitle: "Bitcoin Mining Companies Ranked by BTC Production",          desc: "Sorted by self-mined BTC — highest first",              barLabel: "BTC Production (latest quarter)",         trendLabel: "BTC Production — quarterly trend (top 8)" },
      hashrate:   { title: "Hashrate",                 fullTitle: "Bitcoin Mining Companies Ranked by Hashrate",                 desc: "Sorted by operational hashrate (EH/s) — highest first", barLabel: "Hashrate (latest quarter, EH/s)",         trendLabel: "Hashrate — quarterly trend (top 8)" },
      holdings:   { title: "Treasury",                 fullTitle: "Bitcoin Mining Companies Ranked by BTC Treasury",             desc: "Sorted by BTC on balance sheet — highest first",        barLabel: "BTC Treasury (latest quarter)",           trendLabel: "BTC Treasury — quarterly trend (top 8)" },
      cost:       { title: "Cash Cost / BTC",          fullTitle: "Bitcoin Mining Companies Ranked by Cash Cost / BTC",          desc: "Direct cash cost per BTC — lowest is best",             barLabel: "Cash Cost / BTC (latest quarter)",        trendLabel: "Cash Cost / BTC — quarterly trend (top 8)" },
      efficiency: { title: "Efficiency (J/TH)",        fullTitle: "Bitcoin Mining Companies Ranked by Efficiency",               desc: "Energy per terahash (J/TH) — lower is better",          barLabel: "Efficiency (latest quarter, J/TH)",       trendLabel: "Efficiency — quarterly trend (top 8)" },
      detailedTitle: "Detailed rankings",
      companiesWithData: "{n} companies with data",
    },
    company: {
      // ★ 改名："About" → "Company Info"
      tabs:     { market: "Market Data", about: "Company Info", filings: "Filings & Data", faq: "FAQ" },
      sections: { mining: "⛏ Mining Operations", cost: "💸 Cost Analysis", research: "📰 Related Research", overview: "Overview", bizModel: "Business Model", quickFacts: "Quick Facts", methodology: "Data Methodology", peers: "Compare with Peers" },
      fields:   { btcMined: "BTC Production", holdings: "Treasury", hashrate: "Hashrate", cashCost: "Cash Cost / BTC", power: "Power (MW)", efficiency: "Efficiency (J/TH)", ticker: "Ticker", headquarters: "Headquarters", founded: "Founded", website: "Website" },
      table:    { quarter: "Quarter", btcMined: "BTC Production", holdings: "Treasury", hashrate: "Hashrate", cashCost: "Cash Cost / BTC", energyCost: "Energy Cost / BTC", powerMW: "Power (MW)", jth: "Efficiency (J/TH)", source: "Source", updated: "Last updated" },
      btcMiner:     "Bitcoin Miner",
      allCompanies: "← All companies",
      viewAll:      "View all research →",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions about Bitcoin mining metrics, data sources, and how to interpret miner performance data.",
      noContent: "No published FAQs yet.",
      noContentHint: "Set FAQ entries in Notion to 'Published' to display here.",
    },
    compare: {
      title:           "Compare Miners",
      subtitle:        "Select any two companies to compare BTC production, hashrate and cost efficiency side by side. Data from SEC filings.",
      chooseTwo:       "Choose two companies to compare",
      companyA:        "Company A",
      companyB:        "Company B",
      compareBtn:      "Compare →",
      whatsIncluded:   "What's included in the comparison",
      sameCompany:     "Please select two different companies.",
      noData:          "Insufficient company data available.",
      metricsAhead:    "metrics ahead",
      viewProfile:     "View profile →",
      compareOthers:   "Compare other companies",
      edge:            "Edge",
      metric:          "Metric",
    },
    footer: {
      copy: "© {year} HashResearch · Data sourced from SEC filings",
    },
  },

  // ──────────────────────────────────────────────────────────────
  //  中文
  // ──────────────────────────────────────────────────────────────
  zh: {
    nav: {
      overview: "概览",
      rankings: "排行榜",
      compare:  "对比",
      research: "研究",
      docs:     "方法论",
    },
    home: {
      title:    "比特币矿企数据与分析",
      subtitle: "追踪 {count} 家上市比特币矿企，对比 BTC 产量、BTC 持仓、平均运营算力、电力规模、能效与单币成本，数据来源包括 SEC 文件、公司公告与投资者材料。",
      exploreTitle:  "按指标浏览",
      profilesTitle: "公司档案",
      metrics: {
        production: { label: "BTC 产量",       desc: "谁挖得最多？" },
        hashrate:   { label: "算力",           desc: "运营算力规模" },
        holdings:   { label: "持仓",           desc: "BTC 储备" },
        cost:       { label: "单币现金成本",   desc: "最低成本生产者" },
        revenue:    { label: "营收",           desc: "营收对比" },
        efficiency: { label: "能效（J/TH）",   desc: "每 TH 能耗" },
      },
    },
    cards: {
      totalMined: "BTC 总产量",
      totalHeld:  "BTC 总持仓",
      spotPrice:  "BTC 现货价（实时）",
      avgCost:    "平均单币现金成本",
      companies:  "{n} 家公司",
      ofSupply:   "占流通量 {n}%",
      aboveCost:  "▲ 高于 {q} 平均成本 {n}%",
      belowCost:  "▼ 低于 {q} 平均成本 {n}%",
    },
    table: {
      company:    "公司",
      btcMined:   "BTC 产量",
      qoq:        "产量环比",
      yoy:        "产量同比",
      btcHeld:    "持仓",
      hashrate:   "算力",
      elecPrice:  "电价",
      cashCost:   "单币现金成本",
      energyCost: "单币能源成本",
      powerMW:    "电力（MW）",
      jth:        "能效（J/TH）",
      source:     "来源",
      rankings:   "公司排行榜",
      companies:  "{n} 家公司",
    },
    // ★★★ 精简后的 tooltips（保留方法论核心含义）★★★
    tooltips: {
      btcMined:
        "公司本季度自营挖矿且归属公司的 BTC。不含客户、托管或合资非权益部分。",
      qoq:
        "BTC 自挖产量的环比变化。",
      yoy:
        "BTC 自挖产量的同比变化。",
      btcHeld:
        "季末公司自有 BTC。含已借出或作担保但所有权仍归公司的部分。",
      hashrate:
        "优先采用季度平均运营算力；未披露则依次回退期末、已通电、已安装、已部署算力。单位：EH/s。",
      elecPrice:
        "优先采用实际运营电价；未披露则用单位电力成本、PPA 电价或能源费 ÷ 用电量推算。单位：美元 / kWh。",
      powerMW:
        "季末支持挖矿运营的已通电电力容量；未披露则回退已开发、可用、托管容量。单位：MW。",
      jth:
        "矿机集群或运营矿机的平均能效，越低越好。单位：J/TH。",
      energyCost:
        "每挖出 1 枚 BTC 的净电力或能源成本。",
      cashCost:
        "每挖出 1 枚 BTC 的直接现金成本，不含矿机折旧。",
      source:
        "数据来源：SEC 财报或公司公告。",
    },
    rankings: {
      production: { title: "BTC 产量",         fullTitle: "比特币矿企 BTC 产量排行",     desc: "按自挖 BTC 排序——从高到低",          barLabel: "BTC 产量（最新季度）",        trendLabel: "BTC 产量——季度趋势（Top 8）" },
      hashrate:   { title: "算力",             fullTitle: "比特币矿企算力排行",           desc: "按运营算力（EH/s）排序——从高到低",    barLabel: "算力（最新季度 EH/s）",       trendLabel: "算力——季度趋势（Top 8）" },
      holdings:   { title: "持仓",             fullTitle: "比特币矿企 BTC 持仓排行",     desc: "按资产负债表 BTC 持仓排序——从高到低", barLabel: "持仓（最新季度）",             trendLabel: "持仓——季度趋势（Top 8）" },
      cost:       { title: "单币现金成本",     fullTitle: "比特币矿企单币现金成本排行",   desc: "每枚 BTC 的直接现金成本——越低越好",   barLabel: "单币现金成本（最新季度）",     trendLabel: "单币现金成本——季度趋势（Top 8）" },
      efficiency: { title: "能效（J/TH）",     fullTitle: "比特币矿企能效排行",           desc: "每 TH 算力的能耗（J/TH）——越低越好",  barLabel: "能效（最新季度 J/TH）",        trendLabel: "能效——季度趋势（Top 8）" },
      detailedTitle:     "详细排行",
      companiesWithData: "{n} 家公司有数据",
    },
    company: {
      // ★ 改名："公司简介" → "公司信息"
      tabs:     { market: "市场数据", about: "公司信息", filings: "财报与数据", faq: "常见问题" },
      sections: { mining: "⛏ 挖矿运营", cost: "💸 成本分析", research: "📰 相关研究", overview: "概览", bizModel: "业务模式", quickFacts: "基本信息", methodology: "数据方法论", peers: "对比同行" },
      fields:   { btcMined: "BTC 产量", holdings: "持仓", hashrate: "算力", cashCost: "单币现金成本", power: "电力（MW）", efficiency: "能效（J/TH）", ticker: "股票代码", headquarters: "总部", founded: "成立年份", website: "官网" },
      table:    { quarter: "季度", btcMined: "BTC 产量", holdings: "持仓", hashrate: "算力", cashCost: "单币现金成本", energyCost: "单币能源成本", powerMW: "电力（MW）", jth: "能效（J/TH）", source: "来源", updated: "最近更新" },
      btcMiner:     "比特币矿企",
      allCompanies: "← 所有公司",
      viewAll:      "查看全部研究 →",
    },
    faq: {
      title:         "常见问题",
      subtitle:      "关于比特币挖矿指标、数据来源以及如何解读矿企数据的常见问题。",
      noContent:     "暂无已发布的常见问题。",
      noContentHint: "请在 Notion 中将 FAQ 条目状态设置为 Published 以在此处显示。",
    },
    compare: {
      title:         "对比矿企",
      subtitle:      "选择任意两家公司，并排对比它们的 BTC 产量、算力和成本效率。数据来源于 SEC 财报。",
      chooseTwo:     "选择两家公司进行对比",
      companyA:      "公司 A",
      companyB:      "公司 B",
      compareBtn:    "开始对比 →",
      whatsIncluded: "对比包含的指标",
      sameCompany:   "请选择两家不同的公司。",
      noData:        "暂无足够的公司数据。",
      metricsAhead:  "项指标领先",
      viewProfile:   "查看详情 →",
      compareOthers: "对比其他公司",
      edge:          "优势方",
      metric:        "指标",
    },
    footer: {
      copy: "© {year} HashResearch · 数据来源于 SEC 财报",
    },
  },
};

// ─── Translator factory ───────────────────────────────────────

export function getT(locale = DEFAULT_LOCALE) {
  const dict = DICT[locale] || DICT[DEFAULT_LOCALE];

  return function t(key, vars = {}) {
    const val = key.split(".").reduce((obj, k) => obj?.[k], dict);

    if (val == null) {
      const fallback = key.split(".").reduce((obj, k) => obj?.[k], DICT[DEFAULT_LOCALE]);
      if (fallback == null) return key;
      return interpolate(String(fallback), vars);
    }

    return interpolate(String(val), vars);
  };
}

function interpolate(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

// ─── Path helpers ──────────────────────────────────────────────

export function localePath(locale, path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

export function switchLocale(targetLocale, currentPath) {
  const withoutLocale = currentPath.replace(/^\/(en|zh)/, "") || "/";
  return localePath(targetLocale, withoutLocale);
}

export function isValidLocale(locale) {
  return LOCALES.includes(locale);
}
