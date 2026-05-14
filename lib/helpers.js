// lib/helpers.js

const COMPANIES = [
  "Marathon Digital", "CleanSpark", "Riot Platforms", "Core Scientific",
  "Hut 8", "Bitdeer", "Iris Energy", "HIVE Digital Technologies",
  "Bitfarms", "TeraWulf", "Canaan", "CIpher Digital", "BitFuFu", "Soluna Holdings",
];

const TICKERS = {
  "Marathon Digital":          "MARA",
  "CleanSpark":                "CLSK",
  "Riot Platforms":            "RIOT",
  "Core Scientific":           "CORZ",
  "Hut 8":                     "HUT",
  "Bitdeer":                   "BTDR",
  "Iris Energy":               "IREN",
  "HIVE Digital Technologies": "HIVE",
  "Bitfarms":                  "BITF",
  "TeraWulf":                  "WULF",
  "Canaan":                    "CAN",
  "CIpher Digital":            "CIFR",
  "BitFuFu":                   "FUFU",
  "Soluna Holdings":           "SLNH",
};

const COLORS = {
  "Marathon Digital":          "#F7931A",
  "CleanSpark":                "#00D4AA",
  "Riot Platforms":            "#FF4444",
  "Core Scientific":           "#FF8C42",
  "Hut 8":                     "#A78BFA",
  "Bitdeer":                   "#6C8EFF",
  "Iris Energy":               "#FBBF24",
  "HIVE Digital Technologies": "#60A5FA",
  "Bitfarms":                  "#F472B6",
  "TeraWulf":                  "#34D399",
  "Canaan":                    "#2DD4BF",
  "CIpher Digital":            "#FB923C",
  "BitFuFu":                   "#C084FC",
  "Soluna Holdings":           "#4ADE80",
};

const TICKER_COLORS = Object.fromEntries(
  Object.entries(TICKERS).map(([company, ticker]) => [ticker, COLORS[company]])
);

const PALETTE = Object.values(COLORS);

const RANKING_CONFIG = {
  production: { field: "btc_production",    label: "BTC Production",    unit: "BTC",   desc: true },
  hashrate:   { field: "hashrate_ehs",      label: "Hashrate",          unit: "EH/s",  desc: true },
  holdings:   { field: "btc_holdings",      label: "BTC Holdings",      unit: "BTC",   desc: true },
  cost:       { field: "cash_cost_per_btc", label: "Cash Cost per BTC", unit: "$",     desc: false },
  revenue:    { field: "total_revenue_100m",label: "Revenue",           unit: "$100M", desc: true },
  efficiency: { field: "efficiency_jth",    label: "Fleet Efficiency",  unit: "J/TH",  desc: false },
};

// ─── Data helpers ──────────────────────────────────────────────────────────────

function getQuarters(data) {
  return [...new Set(data.map(r => r.quarter))].filter(Boolean).sort();
}

function getYears(data) {
  return [...new Set(data.map(r => r.quarter?.slice(0, 4)))].filter(Boolean).sort();
}

function find(data, company, quarter) {
  return data.find(r => r.company === company && r.quarter === quarter);
}

// 动态获取数据里的所有公司（不依赖硬编码）
function getCompanies(data) {
  const seen = new Map();
  for (const r of data) {
    if (r.company && r.ticker && !seen.has(r.company)) {
      seen.set(r.company, r.ticker);
    }
  }
  return Array.from(seen.entries()).map(([company, ticker]) => ({ company, ticker }));
}

function calcChange(data, company, quarter, field, back) {
  const qs = getQuarters(data);
  const i = qs.indexOf(quarter);
  if (i < back) return null;
  const c = find(data, company, quarter);
  const p = find(data, company, qs[i - back]);
  if (!c || !p || c[field] == null || p[field] == null || p[field] === 0) return null;
  return ((c[field] - p[field]) / Math.abs(p[field])) * 100;
}

// enrichRows: 动态公司列表，null 排底部，0 正常排名
function enrichRows(data, quarter) {
  const companies = getCompanies(data);

  return companies.map(({ company, ticker }) => {
    const r = find(data, company, quarter) || {};
    let sd = r.report_period || quarter || "";
    const di = sd.lastIndexOf("-");
    if (di > -1) sd = sd.slice(di + 1).trim();
    return {
      company,
      ticker: ticker || r.ticker || TICKERS[company] || "",
      ...r,
      qoqProd: calcChange(data, company, quarter, "btc_production", 1),
      momProd: calcChange(data, company, quarter, "btc_production", 2),
      yoyProd: calcChange(data, company, quarter, "btc_production", 4),
      qoqHash: calcChange(data, company, quarter, "hashrate_ehs", 1),
      yoyHash: calcChange(data, company, quarter, "hashrate_ehs", 4),
      qoqHold: calcChange(data, company, quarter, "btc_holdings", 1),
      sourceDate: sd,
    };
  }).sort((a, b) => {
    // null 值排底部，有数据（包括 0）按值排序
    const av = a.btc_production;
    const bv = b.btc_production;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;   // a 没数据 → 排后面
    if (bv == null) return -1;  // b 没数据 → 排后面
    return bv - av;             // 都有数据 → 按产量降序
  });
}

function buildCompanyTimeseries(data, company) {
  return data
    .filter(r => r.company === company)
    .sort((a, b) => a.quarter.localeCompare(b.quarter))
    .map(r => ({
      quarter:        r.quarter,
      production:     r.btc_production,
      holdings:       r.btc_holdings,
      hashrate:       r.hashrate_ehs,
      revenue:        r.total_revenue_100m ? +(r.total_revenue_100m * 100).toFixed(1) : null,
      mining_revenue: r.mining_revenue_100m ? +(r.mining_revenue_100m * 100).toFixed(1) : null,
      gross_profit:   r.gross_profit_100m ? +(r.gross_profit_100m * 100).toFixed(1) : null,
      net_income:     r.net_income_100m ? +(r.net_income_100m * 100).toFixed(1) : null,
      cash_cost:      r.cash_cost_per_btc,
      energy_cost:    r.energy_cost_per_btc,
      all_in_cost:    r.all_in_cost_per_btc,
      power_mw:       r.power_capacity_mw,
      miner_count:    r.miner_count,
      efficiency:     r.efficiency_jth,
      gross_margin:   r.gross_profit_100m && r.total_revenue_100m
        ? +((r.gross_profit_100m / r.total_revenue_100m) * 100).toFixed(1) : null,
      net_margin:     r.net_income_100m && r.total_revenue_100m
        ? +((r.net_income_100m / r.total_revenue_100m) * 100).toFixed(1) : null,
    }));
}

function fmt(v)  { return v == null ? "—" : typeof v === "number" ? v.toLocaleString() : v; }
function fmtM(v) { return v == null ? "—" : `$${(v * 100).toFixed(1)}M`; }

module.exports = {
  COMPANIES, TICKERS, COLORS, TICKER_COLORS, PALETTE, RANKING_CONFIG,
  getQuarters, getYears, getCompanies, find, calcChange,
  enrichRows, buildCompanyTimeseries, fmt, fmtM,
};
