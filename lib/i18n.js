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
      // ★ 新副标题
      subtitle: "Track {count} publicly listed Bitcoin mining companies. Compare BTC production, BTC holdings, average operational hashrate, power capacity, fleet efficiency and unit costs. Data sourced from SEC filings, company announcements and investor materials.",
      exploreTitle:  "Explore by metric",
      profilesTitle: "Company profiles",
      metrics: {
        production: { label: "BTC Production",   desc: "Who mines the most?" },
        hashrate:   { label: "Hashrate",          desc: "Computing power" },
        holdings:   { label: "BTC Holdings",      desc: "Bitcoin treasuries" },
        cost:       { label: "Production Cost",   desc: "Cheapest producers" },
        revenue:    { label: "Revenue",           desc: "Top line comparison" },
        efficiency: { label: "Fleet Efficiency",  desc: "Energy per terahash" },
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
      company:    "Company",
      btcMined:   "BTC mined",
      qoq:        "QoQ%",
      yoy:        "YoY%",
      btcHeld:    "BTC held",
      hashrate:   "Hashrate",
      elecPrice:  "Elec. price",
      cashCost:   "Cash cost / BTC",
      energyCost: "Energy cost / BTC",
      powerMW:    "Power (MW)",
      jth:        "J/TH",
      source:     "Source",
      rankings:   "Company Rankings",
      companies:  "{n} companies",
    },
    // ★★★ 优化后的指标 tooltips（基于方法论）★★★
    tooltips: {
      btcMined:
        "Self-mined BTC produced by the company in the calendar quarter and attributable to the company. Excludes BTC produced for customers, hosted customers, or non-equity portions of joint ventures.",
      qoq:
        "Quarter-over-quarter change in self-mined BTC production.",
      yoy:
        "Year-over-year change in self-mined BTC production.",
      btcHeld:
        "BTC owned by the company at quarter end. Includes BTC lent out or pledged as loan collateral where ownership remains with the company. Excludes BTC not yet on the balance sheet, held for customers, pending distribution to third parties, or held by investees.",
      hashrate:
        "Preferred: average operational hashrate for the calendar quarter. Where not disclosed, falls back in order to period-end, energized, installed, or deployed hashrate (clearly labeled as substitute). Unit: EH/s.",
      elecPrice:
        "Preferred: actual or nearest-to-actual operating electricity price. Where not disclosed, falls back in order to unit power cost, average power cost, energy expense ÷ consumption, PPA rate, hosting rate, target rate, or forecast rate. Unit: USD/kWh.",
      powerMW:
        "Power capacity supporting mining operations at quarter end. Where the standard metric is not disclosed, falls back in order to developed, available, energized, hosting, network operating, or facility capacity. Contracted, reserved, planned, or pipeline capacity is treated only as low-quality reference, not as primary metric. Unit: MW.",
      jth:
        "Preferred: average efficiency of the company's miner fleet or operational miners. Where not disclosed, falls back in order to operational miner efficiency, current miner efficiency, or deployed miner efficiency. Single-model specs and future targets are not used as primary metric. Lower is better. Unit: J/TH.",
      energyCost:
        "Net electricity or energy cost directly related to mining, per self-mined BTC. Used as disclosed when available; otherwise calculated as net mining-related electricity cost ÷ self-mined BTC production.",
      cashCost:
        "Direct cash cost per self-mined BTC, excluding miner depreciation. Used as disclosed when available; otherwise derived from verifiable mining cash cost, energy cost, hosting cost and other direct operating costs — excluding depreciation, amortization, impairment, stock-based compensation, interest, taxes and non-mining costs.",
      source:
        "Primary source: SEC filing, IR press release, or official company document.",
    },
    rankings: {
      production: { title: "BTC Production",     fullTitle: "Bitcoin Mining Companies Ranked by BTC Production",     desc: "Sorted by self-mined BTC — highest first",          barLabel: "BTC production (latest quarter)",      trendLabel: "BTC production — quarterly trend (top 8)" },
      hashrate:   { title: "Hashrate",            fullTitle: "Bitcoin Mining Companies Ranked by Hashrate",            desc: "Sorted by operational hashrate (EH/s) — highest first", barLabel: "Hashrate (latest quarter, EH/s)",       trendLabel: "Hashrate — quarterly trend (top 8)" },
      holdings:   { title: "BTC Holdings",        fullTitle: "Bitcoin Mining Companies Ranked by BTC Holdings",        desc: "Sorted by BTC on balance sheet — highest first",        barLabel: "BTC holdings (latest quarter)",         trendLabel: "BTC holdings — quarterly trend (top 8)" },
      cost:       { title: "Cash Cost per BTC",   fullTitle: "Bitcoin Mining Companies Ranked by Cash Cost per BTC",   desc: "Direct cash cost per BTC — lowest is best",             barLabel: "Cash cost per BTC (latest quarter)",    trendLabel: "Cash cost per BTC — quarterly trend (top 8)" },
      efficiency: { title: "Fleet Efficiency",    fullTitle: "Bitcoin Mining Companies Ranked by Fleet Efficiency",    desc: "Energy per terahash (J/TH) — lower is better",          barLabel: "Fleet efficiency (latest quarter, J/TH)", trendLabel: "Fleet efficiency — quarterly trend (top 8)" },
      detailedTitle: "Detailed rankings",
      companiesWithData: "{n} companies with data",
    },
    company: {
      tabs:     { market: "Market Data", about: "About", filings: "Filings & Data", faq: "FAQ" },
      sections: { mining: "⛏ Mining Operations", cost: "💸 Cost Analysis", research: "📰 Related Research", overview: "Overview", bizModel: "Business Model", quickFacts: "Quick Facts", methodology: "Data Methodology", peers: "Compare with Peers" },
      fields:   { btcMined: "BTC mined", holdings: "BTC holdings", hashrate: "Hashrate", cashCost: "Cash cost / BTC", power: "Power capacity", efficiency: "Fleet efficiency", ticker: "Ticker", headquarters: "Headquarters", founded: "Founded", website: "Website" },
      table:    { quarter: "Quarter", btcMined: "BTC mined", holdings: "Holdings", hashrate: "Hashrate", cashCost: "Cash cost", energyCost: "Energy cost", powerMW: "Power (MW)", jth: "J/TH", source: "Source", updated: "Last updated" },
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
      // ★ 新副标题
      subtitle: "追踪 {count} 家上市比特币矿企，对比 BTC 产量、BTC 持仓、平均运营算力、电力规模、矿机效率与单币成本，数据来源包括 SEC 文件、公司公告与投资者材料。",
      exploreTitle:  "按指标浏览",
      profilesTitle: "公司档案",
      metrics: {
        production: { label: "BTC 产量",  desc: "谁挖得最多？" },
        hashrate:   { label: "算力",       desc: "运营算力规模" },
        holdings:   { label: "BTC 持仓",   desc: "BTC 储备" },
        cost:       { label: "生产成本",   desc: "最低成本生产者" },
        revenue:    { label: "营收",       desc: "营收对比" },
        efficiency: { label: "矿机能效",   desc: "每 TH 能耗" },
      },
    },
    cards: {
      totalMined: "BTC 总产量",
      totalHeld:  "BTC 总持仓",
      spotPrice:  "BTC 现货价（实时）",
      avgCost:    "平均现金单币成本",
      companies:  "{n} 家公司",
      ofSupply:   "占流通量 {n}%",
      aboveCost:  "▲ 高于 {q} 平均成本 {n}%",
      belowCost:  "▼ 低于 {q} 平均成本 {n}%",
    },
    table: {
      company:    "公司",
      btcMined:   "BTC 产量",
      qoq:        "环比",
      yoy:        "同比",
      btcHeld:    "BTC 持仓",
      hashrate:   "算力",
      elecPrice:  "电价",
      cashCost:   "现金单币成本",
      energyCost: "能源单币成本",
      powerMW:    "电力（MW）",
      jth:        "J/TH",
      source:     "来源",
      rankings:   "公司排行榜",
      companies:  "{n} 家公司",
    },
    // ★★★ 优化后的指标 tooltips（基于方法论）★★★
    tooltips: {
      btcMined:
        "公司在该自然季度内自营挖矿产生、且归属于公司的 BTC。不包括客户、托管客户、合资但非公司权益部分产生的 BTC。",
      qoq:
        "BTC 自挖产量的环比变化（与上一季度对比）。",
      yoy:
        "BTC 自挖产量的同比变化（与去年同期对比）。",
      btcHeld:
        "季度末公司自有的 BTC。包括已经借出但所有权仍归公司的 BTC，以及已经作为借款担保或抵押、但所有权仍归公司的 BTC。不包括尚未计入公司资产负债表、代客户持有、待分配给第三方或被投资实体持有的 BTC。",
      hashrate:
        "优先采用自然季度平均运营算力。若公司未披露该口径，则依次采用期末算力、已通电算力、已安装算力或已部署算力作为替代，并明确标注为替代口径。单位：EH/s。",
      elecPrice:
        "优先采用公司实际或最接近实际运营的电力价格。若未披露实际电价，则依次采用单位电力成本、平均电力成本、能源费用 ÷ 用电量、PPA 电价、托管电价、目标电价或预测电价等口径。单位：美元 / kWh。",
      powerMW:
        "季度末可支持挖矿运营的电力容量。若公司未披露标准口径，则依次采用已开发容量、可用容量、已投运容量、托管容量、网络运营容量或设施容量作为替代。不采用签约容量、储备容量、规划容量或管线容量作为主口径，只作为低质量参考。单位：MW。",
      jth:
        "优先采用公司矿机集群或运营矿机的平均能效。若未披露该口径，则依次采用运营矿机能效、当前矿机能效或已部署矿机能效作为替代。不采用单一矿机型号参数或未来目标能效作为主口径。越低越好，单位：J/TH。",
      energyCost:
        "公司平均每挖出 1 枚 BTC 所发生的、与挖矿直接相关的净电力或能源成本。若公司直接披露该指标则直接采用；若未披露，则使用「与挖矿直接相关的净电力成本 ÷ 自挖 BTC 产量」计算。",
      cashCost:
        "公司平均每挖出 1 枚 BTC 所发生的直接现金成本，不包括矿机折旧。若公司直接披露该指标则直接采用；若未披露，则根据可验证的挖矿现金成本、能源成本、托管成本及其他直接运营成本推导，并剔除折旧、摊销、减值、股权激励、利息、税费及非挖矿成本。",
      source:
        "数据来源：SEC 财报、公司 IR 新闻稿或官方文件。",
    },
    rankings: {
      production: { title: "BTC 产量",     fullTitle: "比特币矿企 BTC 产量排行",   desc: "按自挖 BTC 排序——从高到低",       barLabel: "BTC 产量（最新季度）",        trendLabel: "BTC 产量——季度趋势（Top 8）" },
      hashrate:   { title: "算力",          fullTitle: "比特币矿企算力排行",         desc: "按运营算力（EH/s）排序——从高到低", barLabel: "算力（最新季度 EH/s）",       trendLabel: "算力——季度趋势（Top 8）" },
      holdings:   { title: "BTC 持仓",      fullTitle: "比特币矿企 BTC 持仓排行",   desc: "按资产负债表 BTC 持仓排序——从高到低", barLabel: "BTC 持仓（最新季度）",     trendLabel: "BTC 持仓——季度趋势（Top 8）" },
      cost:       { title: "单币现金成本",  fullTitle: "比特币矿企单币现金成本排行", desc: "每枚 BTC 的直接现金成本——越低越好", barLabel: "单币现金成本（最新季度）",    trendLabel: "单币现金成本——季度趋势（Top 8）" },
      efficiency: { title: "矿机能效",      fullTitle: "比特币矿企矿机能效排行",     desc: "每 TH 算力的能耗（J/TH）——越低越好", barLabel: "矿机能效（最新季度 J/TH）",  trendLabel: "矿机能效——季度趋势（Top 8）" },
      detailedTitle:     "详细排行",
      companiesWithData: "{n} 家公司有数据",
    },
    company: {
      tabs:     { market: "市场数据", about: "公司简介", filings: "财报与数据", faq: "常见问题" },
      sections: { mining: "⛏ 挖矿运营", cost: "💸 成本分析", research: "📰 相关研究", overview: "概览", bizModel: "业务模式", quickFacts: "基本信息", methodology: "数据方法论", peers: "对比同行" },
      fields:   { btcMined: "BTC 产量", holdings: "BTC 持仓", hashrate: "算力", cashCost: "现金单币成本", power: "电力规模", efficiency: "矿机能效", ticker: "股票代码", headquarters: "总部", founded: "成立年份", website: "官网" },
      table:    { quarter: "季度", btcMined: "BTC 产量", holdings: "BTC 持仓", hashrate: "算力", cashCost: "现金单币成本", energyCost: "能源单币成本", powerMW: "电力（MW）", jth: "J/TH", source: "来源", updated: "最近更新" },
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
