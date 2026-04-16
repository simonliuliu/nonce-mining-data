// app/sitemap.js
// Next.js dynamic sitemap — covers all indexable routes
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

import { getQuarterlyData, getPublishedArticles } from "@/lib/notion";
import { SITE_URL } from "@/lib/seo";

const TICKERS = ["MARA", "CLSK", "BTDR", "CANG"];
const METRICS  = ["production", "hashrate", "holdings", "cost", "revenue", "efficiency"];
const METRIC_SLUGS = [
  "btc-production", "hashrate", "btc-holdings", "cash-cost-per-btc",
  "all-in-cost-per-btc", "fleet-efficiency", "power-capacity", "revenue",
];

// Comparison pairs (all permutations of 4 companies = 6 pairs)
const COMPARE_PAIRS = [
  "mara-vs-clsk", "mara-vs-btdr", "mara-vs-cang",
  "clsk-vs-btdr", "clsk-vs-cang", "btdr-vs-cang",
];

export default async function sitemap() {
  const now = new Date().toISOString();

  // Static high-priority pages
  const statics = [
    { url: SITE_URL,                    lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/methodology`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/faq`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/articles`,      lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];

  // Company pages — high SEO value
  const companyPages = TICKERS.map(tk => ({
    url: `${SITE_URL}/company/${tk}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Ranking pages
  const rankingPages = METRICS.map(m => ({
    url: `${SITE_URL}/rankings/${m}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Metric glossary pages
  const metricPages = METRIC_SLUGS.map(slug => ({
    url: `${SITE_URL}/metrics/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  // Comparison pages
  const comparePages = COMPARE_PAIRS.map(pair => ({
    url: `${SITE_URL}/compare/${pair}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Article pages — dynamic from Notion
  let articlePages = [];
  try {
    const articles = await getPublishedArticles();
    articlePages = articles.map(a => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: a.publish_date ? new Date(a.publish_date).toISOString() : now,
      changeFrequency: "monthly",
      priority: 0.65,
    }));
  } catch (e) {
    console.error("[sitemap] articles error:", e.message);
  }

  return [
    ...statics,
    ...companyPages,
    ...rankingPages,
    ...metricPages,
    ...comparePages,
    ...articlePages,
  ];
}
