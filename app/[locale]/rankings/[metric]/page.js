import { getQuarterlyData } from "@/lib/notion";
import { TICKER_COLORS, PALETTE, getQuarters, enrichRows, getCompanies, find } from "@/lib/helpers";
import { getT, LOCALES } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import RankingClient from "./RankingClient";
import RankingNavStrip from "../RankingNavStrip";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateStaticParams() {
  const metrics = ["production","hashrate","holdings","cost","efficiency"];
  return LOCALES.flatMap(locale => metrics.map(metric => ({ locale, metric })));
}

const FIELD_MAP = {
  production: { field:"btc_production",    sortAsc:false, tableCols:["btc_production","qoq","yoy","hashrate_ehs","btc_holdings","cash_cost_per_btc"] },
  hashrate:   { field:"hashrate_ehs",      sortAsc:false, tableCols:["hashrate_ehs","qoq_hash","yoy_hash","btc_production","power_capacity_mw","efficiency_jth"] },
  holdings:   { field:"btc_holdings",      sortAsc:false, tableCols:["btc_holdings","qoq_hold","btc_production","hashrate_ehs"] },
  cost:       { field:"cash_cost_per_btc", sortAsc:true,  tableCols:["cash_cost_per_btc","energy_cost_per_btc","electricity_price","efficiency_jth","power_capacity_mw","btc_production"] },
  efficiency: { field:"efficiency_jth",    sortAsc:true,  tableCols:["efficiency_jth","cash_cost_per_btc","energy_cost_per_btc","power_capacity_mw","hashrate_ehs","btc_production"] },
};

function buildBarData(rows, field, sortAsc) {
  return rows.filter(r => r[field]!=null && r[field]>0)
    .sort((a,b) => sortAsc ? (a[field]||Infinity)-(b[field]||Infinity) : (b[field]||0)-(a[field]||0))
    .map((r,i) => ({ ticker:r.ticker, company:r.company, value:r[field], color:TICKER_COLORS[r.ticker]||PALETTE[i%PALETTE.length] }));
}

function buildTrendData(data, field, quarters) {
  const companies = getCompanies(data);
  return quarters.map(q => {
    const obj = { quarter: q };
    for (const { company, ticker } of companies) {
      const r = find(data, company, q);
      obj[ticker] = r?.[field] ?? null;
    }
    return obj;
  });
}

function buildSummary(rows, field, sortAsc) {
  const vals = rows.map(r=>r[field]).filter(v=>v!=null&&v>0);
  if (!vals.length) return { count:0 };
  const total  = vals.reduce((s,v)=>s+v,0);
  const sorted = [...rows].filter(r=>r[field]>0).sort((a,b)=>sortAsc?a[field]-b[field]:b[field]-a[field]);
  return { total, avg:total/vals.length, count:vals.length, topTicker:sorted[0]?.ticker||"—", topValue:sorted[0]?.[field] };
}

// ─── 排行榜 SEO metadata ─────────────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.rankings.{metric}.title / desc
// 5 个 metric (production/hashrate/holdings/cost/efficiency) 各自一组文案
//
// 关键修复：
//   ❌ 旧版：只设了 title，没设 description / canonical / og 等
//   ✅ 新版：完整 metadata + alternates + og + twitter

export async function generateMetadata({ params }) {
  const { locale, metric } = await params;
  if (!FIELD_MAP[metric]) return { title: "Not Found" };

  const t = getT(locale);
  const title = t(`seo.rankings.${metric}.title`);
  const desc  = t(`seo.rankings.${metric}.desc`);
  const path  = `/${locale}/rankings/${metric}`;

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en: `/en/rankings/${metric}`,
        zh: `/zh/rankings/${metric}`,
        "x-default": `/en/rankings/${metric}`,
      },
    },

    openGraph: {
      title,
      description: desc,
      url:         path,
      type:        "website",
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

export default async function RankingPage({ params }) {
  const { locale, metric } = await params;
  if (!FIELD_MAP[metric]) notFound();

  const t   = getT(locale);
  const cfg = FIELD_MAP[metric];

  const meta = {
    title:      t(`rankings.${metric}.title`),
    fullTitle:  t(`rankings.${metric}.fullTitle`),
    desc:       t(`rankings.${metric}.desc`),
    barLabel:   t(`rankings.${metric}.barLabel`),
    trendLabel: t(`rankings.${metric}.trendLabel`),
    field:      cfg.field,
    sortAsc:    cfg.sortAsc,
    tableCols:  cfg.tableCols,
  };

  const data       = await getQuarterlyData();
  const quarters   = getQuarters(data);
  const latestQ    = quarters[quarters.length-1] || "";
  const latestRows = enrichRows(data, latestQ);

  const enrichedByQuarter = {};
  for (const q of quarters) enrichedByQuarter[q] = enrichRows(data, q);

  // ─── 面包屑结构化数据 ───────────────────────────────────
  // 让搜索结果显示 "HashResearch › 排行榜 › BTC 产量" 导航
  const breadcrumbData = breadcrumbSchema([
    { name: locale === "zh" ? "首页" : "Home",         url: `/${locale}` },
    { name: locale === "zh" ? "排行榜" : "Rankings",   url: `/${locale}/rankings/production` },
    { name: t(`rankings.${metric}.title`),              url: `/${locale}/rankings/${metric}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <RankingNavStrip locale={locale} activeMetric={metric} />
      <RankingClient
        metric={metric}
        meta={meta}
        barData={buildBarData(latestRows, cfg.field, cfg.sortAsc)}
        trendData={buildTrendData(data, cfg.field, quarters)}
        summary={buildSummary(latestRows, cfg.field, cfg.sortAsc)}
        enrichedByQuarter={enrichedByQuarter}
        quarters={quarters}
        companies={getCompanies(data)}
        locale={locale}
      />
    </>
  );
}
