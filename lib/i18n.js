// lib/i18n.js
// 翻译字符串直接内联在这里，不依赖 JSON 文件导入
// 避免路径解析问题

export const LOCALES = ["en", "zh"];
export const DEFAULT_LOCALE = "en";

const DICT = {
  en: {
    nav: {
      overview: "Overview", rankings: "Rankings", compare: "Compare",
      research: "Research", docs: "Methodology",
    },
    home: {
      title: "Bitcoin Mining Company Data & Analytics",
      subtitle: "Track the financial and operational performance of {count} public Bitcoin mining companies. Production, hashrate, costs — sourced from SEC filings.",
      exploreTitle: "Explore by metric",
      profilesTitle: "Company profiles",
      metrics: {
        production: { label: "BTC Production",  desc: "Who mines the most?" },
        hashrate:   { label: "Hashrate",         desc: "Computing power" },
        holdings:   { label: "BTC Holdings",     desc: "Bitcoin treasuries" },
        cost:       { label: "Production Cost",  desc: "Cheapest producers" },
        revenue:    { label: "Revenue",          desc: "Top line comparison" },
        efficiency: { label: "Fleet Efficiency", desc: "Energy per terahash" },
      },
    },
    cards: {
      totalMined: "Total BTC mined",
      totalHeld:  "Total BTC held",
      spotPrice:  "BTC Spot Price (live)",
      avgCost:    "Avg cash cost / BTC",
      companies:  "{n} companies",
      ofSupply:   "{n}% of circulating supply",
      aboveCost:  "▲ {n}% above {q} avg cost",
      belowCost:  "▼ {n}% below {q} avg cost",
    },
    table: {
      company: "Company", btcMined: "BTC mined", qoq: "QoQ%", yoy: "YoY%",
      btcHeld: "BTC held", hashrate: "Hashrate", elecPrice: "Elec. price",
      cashCost: "Cash cost", energyCost: "Energy cost", powerMW: "Power (MW)",
      jth: "J/TH", source: "Source", rankings: "Company Rankings",
      companies: "{n} companies",
    },
    tooltips: {
      btcMined: "Total Bitcoin self-mined during the quarter.",
      qoq: "Quarter-over-quarter BTC production change.",
      yoy: "Year-over-year BTC production change.",
      btcHeld: "Total Bitcoin on balance sheet at period end.",
      hashrate: "Operational hashrate in EH/s.",
      elecPrice: "Average electricity cost per kWh.",
      cashCost: "Direct cash cost — cash expenses / BTC.",
      energyCost: "Energy-only cost / BTC.",
      powerMW: "Total electrical power capacity in MW.",
      jth: "Fleet efficiency in J/TH. Lower = better.",
      source: "Source filing or press release.",
    },
    rankings: {
      production: { title: "BTC Production", fullTitle: "Bitcoin Mining Companies Ranked by BTC Production", desc: "Sorted by BTC self-mined — highest first", barLabel: "BTC production (latest quarter)", trendLabel: "BTC production — quarterly trend (top 8)" },
      hashrate:   { title: "Hashrate", fullTitle: "Bitcoin Mining Companies Ranked by Hashrate", desc: "Sorted by operational computing power (EH/s) — highest first", barLabel: "Hashrate (latest quarter, EH/s)", trendLabel: "Hashrate — quarterly trend (top 8)" },
      holdings:   { title: "BTC Holdings", fullTitle: "Bitcoin Mining Companies Ranked by BTC Holdings", desc: "Sorted by BTC on balance sheet — highest first", barLabel: "BTC holdings (latest quarter)", trendLabel: "BTC holdings — quarterly trend (top 8)" },
      cost:       { title: "Cash Cost per BTC", fullTitle: "Bitcoin Mining Companies Ranked by Cash Cost per BTC", desc: "Direct cash cost per BTC — lowest is best", barLabel: "Cash cost per BTC (latest quarter)", trendLabel: "Cash cost per BTC — quarterly trend (top 8)" },
      efficiency: { title: "Fleet Efficiency", fullTitle: "Bitcoin Mining Companies Ranked by Fleet Efficiency", desc: "Energy per terahash (J/TH) — lower is better", barLabel: "Fleet efficiency (latest quarter, J/TH)", trendLabel: "Fleet efficiency — quarterly trend (top 8)" },
      detailedTitle: "Detailed rankings",
      companiesWithData: "{n} companies with data",
    },
    company: {
      tabs: { market: "Market Data", about: "About", filings: "Filings & Data", faq: "FAQ" },
      sections: { mining: "⛏ Mining Operations", cost: "💸 Cost Analysis", research: "📰 Related Research", overview: "Overview", bizModel: "Business Model", quickFacts: "Quick Facts", methodology: "Data Methodology", peers: "Compare with Peers" },
      fields: { btcMined: "BTC mined", holdings: "BTC holdings", hashrate: "Hashrate", cashCost: "Cash cost / BTC", power: "Power capacity", efficiency: "Fleet efficiency", ticker: "Ticker", headquarters: "Headquarters", founded: "Founded", website: "Website" },
      table: { quarter: "Quarter", btcMined: "BTC mined", holdings: "Holdings", hashrate: "Hashrate", cashCost: "Cash cost", energyCost: "Energy cost", powerMW: "Power (MW)", jth: "J/TH", source: "Source", updated: "Last updated" },
      btcMiner: "Bitcoin Miner",
      allCompanies: "← All companies",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Common questions about Bitcoin mining metrics, data sources, and how to interpret miner performance data.",
      noContent: "No FAQ content published yet.",
      noContentHint: "In Notion, set FAQ entries to Status: Published.",
    },
    compare: {
      title: "Compare Bitcoin Mining Companies",
      subtitle: "Select any two companies to compare their BTC production, hashrate, and cost efficiency. Data from SEC filings.",
      chooseTwo: "Choose two companies to compare",
      companyA: "Company A", companyB: "Company B",
      compareBtn: "Compare →", whatsIncluded: "What's included",
      sameCompany: "Please select two different companies.",
      noData: "Not enough company data yet.",
      metricsAhead: "metrics ahead", viewProfile: "View profile →",
      compareOthers: "Compare other companies", edge: "Edge", metric: "Metric",
    },
    footer: { copy: "© {year} Hash Research · Data sourced from SEC filings" },
  },

  zh: {
    nav: {
      overview: "概览", rankings: "排行榜", compare: "对比",
      research: "研究", docs: "方法论",
    },
    home: {
      title: "比特币矿企数据与分析",
      subtitle: "追踪 {count} 家上市比特币矿企的财务与运营表现。产量、算力、成本——数据来源于 SEC 财报。",
      exploreTitle: "按指标探索",
      profilesTitle: "公司简介",
      metrics: {
        production: { label: "BTC 产量",    desc: "谁挖得最多？" },
        hashrate:   { label: "算力",         desc: "运营算力" },
        holdings:   { label: "BTC 持仓",     desc: "比特币储备规模" },
        cost:       { label: "生产成本",      desc: "最低成本矿企" },
        revenue:    { label: "营收",         desc: "收入对比" },
        efficiency: { label: "机队能效",      desc: "单位能耗产出" },
      },
    },
    cards: {
      totalMined: "BTC 总产量",
      totalHeld:  "BTC 总持仓",
      spotPrice:  "BTC 现货价（实时）",
      avgCost:    "平均现金单币成本",
      companies:  "{n} 家公司",
      ofSupply:   "占流通供应量 {n}%",
      aboveCost:  "▲ 较 {q} 平均成本高 {n}%",
      belowCost:  "▼ 较 {q} 平均成本低 {n}%",
    },
    table: {
      company: "公司", btcMined: "BTC 产量", qoq: "环比", yoy: "同比",
      btcHeld: "BTC 持仓", hashrate: "算力", elecPrice: "电价",
      cashCost: "现金单币成本", energyCost: "能源单币成本", powerMW: "电力（MW）",
      jth: "J/TH", source: "来源", rankings: "公司排行榜",
      companies: "{n} 家公司",
    },
    tooltips: {
      btcMined: "本季度自挖比特币总量。", qoq: "BTC 产量环比变化。", yoy: "BTC 产量同比变化。",
      btcHeld: "期末资产负债表上的 BTC 持有量。", hashrate: "实际运营算力（EH/s）。",
      elecPrice: "平均电价（美元/千瓦时）。", cashCost: "现金单币成本：直接现金支出 / BTC。",
      energyCost: "能源单币成本：纯电力成本 / BTC。", powerMW: "合同电力容量（MW）。",
      jth: "机队能效（J/TH），越低越好。", source: "原始财报或新闻稿来源。",
    },
    rankings: {
      production: { title: "BTC 产量", fullTitle: "比特币矿企 BTC 产量排行榜", desc: "按自挖 BTC 数量排序——从高到低", barLabel: "BTC 产量（最新季度）", trendLabel: "BTC 产量——季度趋势（前 8 名）" },
      hashrate:   { title: "算力", fullTitle: "比特币矿企算力排行榜", desc: "按运营算力（EH/s）排序——从高到低", barLabel: "算力（最新季度，EH/s）", trendLabel: "算力——季度趋势（前 8 名）" },
      holdings:   { title: "BTC 持仓", fullTitle: "比特币矿企 BTC 持仓排行榜", desc: "按资产负债表 BTC 持有量排序——从高到低", barLabel: "BTC 持仓（最新季度）", trendLabel: "BTC 持仓——季度趋势（前 8 名）" },
      cost:       { title: "现金单币成本", fullTitle: "比特币矿企现金单币成本排行榜", desc: "按每枚 BTC 直接现金成本排序——越低越好", barLabel: "现金单币成本（最新季度）", trendLabel: "现金单币成本——季度趋势（前 8 名）" },
      efficiency: { title: "机队能效", fullTitle: "比特币矿企机队能效排行榜", desc: "按每 TH 能耗（J/TH）排序——越低越好", barLabel: "机队能效（最新季度，J/TH）", trendLabel: "机队能效——季度趋势（前 8 名）" },
      detailedTitle: "详细排名",
      companiesWithData: "{n} 家公司有数据",
    },
    company: {
      tabs: { market: "市场数据", about: "公司简介", filings: "财报数据", faq: "常见问题" },
      sections: { mining: "⛏ 挖矿运营", cost: "💸 成本分析", research: "📰 相关研究", overview: "公司概况", bizModel: "商业模式", quickFacts: "基本信息", methodology: "数据方法论", peers: "对比同行" },
      fields: { btcMined: "BTC 产量", holdings: "BTC 持仓", hashrate: "算力", cashCost: "现金单币成本", power: "电力规模", efficiency: "机队能效", ticker: "股票代码", headquarters: "总部", founded: "成立年份", website: "官网" },
      table: { quarter: "季度", btcMined: "BTC 产量", holdings: "BTC 持仓", hashrate: "算力", cashCost: "现金单币成本", energyCost: "能源单币成本", powerMW: "电力（MW）", jth: "J/TH", source: "来源", updated: "最近更新" },
      btcMiner: "比特币矿企",
      allCompanies: "← 所有公司",
    },
    faq: {
      title: "常见问题",
      subtitle: "关于比特币挖矿指标、数据来源以及如何解读矿企数据的常见问题。",
      noContent: "暂无已发布的常见问题。",
      noContentHint: "请在 Notion 中将 FAQ 条目状态设置为 Published。",
    },
    compare: {
      title: "对比矿企",
      subtitle: "选择任意两家公司，并排对比它们的 BTC 产量、算力和成本效率。数据来源于 SEC 财报。",
      chooseTwo: "选择两家公司进行对比",
      companyA: "公司 A", companyB: "公司 B",
      compareBtn: "开始对比 →", whatsIncluded: "对比包含的指标",
      sameCompany: "请选择两家不同的公司。",
      noData: "暂无足够的公司数据。",
      metricsAhead: "项指标领先", viewProfile: "查看详情 →",
      compareOthers: "对比其他公司", edge: "优势方", metric: "指标",
    },
    footer: { copy: "© {year} Hash Research · 数据来源于 SEC 财报" },
  },
};

// ─── Core t() function ─────────────────────────────────────────

export function getT(locale = DEFAULT_LOCALE) {
  const dict = DICT[locale] || DICT[DEFAULT_LOCALE];

  return function t(key, vars = {}) {
    const val = key.split(".").reduce((obj, k) => obj?.[k], dict);
    if (val == null) {
      // Fallback to English
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
