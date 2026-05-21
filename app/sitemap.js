// app/sitemap.js
// Next.js 动态 sitemap，覆盖全站所有可索引路由
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
//
// 改动要点：
//   - 所有路径都带 /en /zh 双语前缀
//   - 公司 ticker 动态从 Notion 读取，新增公司无需改代码
//   - Compare 详情动态生成 N*(N-1)/2 种组合
//   - 文章列表动态读 Notion，按文章自身 language 决定 locale 路径
//   - 移除已删除的 /metrics 路由

import { getQuarterlyData, getPublishedArticles } from "@/lib/notion";
import { SITE_URL } from "@/lib/seo";

const LOCALES = ["en", "zh"];
const METRICS = ["production", "hashrate", "holdings", "cost", "efficiency"];

// 用最新季度的 lastModified 时间。如果取不到就用 now。
function now() { return new Date().toISOString(); }

export default async function sitemap() {
  const ts = now();

  // ── 1. 静态高优先级页（每个都生成 en/zh 两份）────────────
  const statics = [];
  for (const locale of LOCALES) {
    statics.push(
      { url: `${SITE_URL}/${locale}`,              lastModified: ts, changeFrequency: "daily",   priority: 1.0 },
      { url: `${SITE_URL}/${locale}/methodology`,  lastModified: ts, changeFrequency: "monthly", priority: 0.7 },
      { url: `${SITE_URL}/${locale}/faq`,          lastModified: ts, changeFrequency: "monthly", priority: 0.7 },
      { url: `${SITE_URL}/${locale}/articles`,     lastModified: ts, changeFrequency: "weekly",  priority: 0.7 },
      { url: `${SITE_URL}/${locale}/compare`,      lastModified: ts, changeFrequency: "monthly", priority: 0.7 },
    );
  }

  // ── 2. 公司详情页 - 动态从 Notion 读 ticker ───────────────
  let companyPages = [];
  let allTickers   = [];
  try {
    const data = await getQuarterlyData();
    // 去重 + 过滤空值
    allTickers = [...new Set(
      data.map(r => r.ticker?.toUpperCase()).filter(Boolean)
    )].sort();

    for (const locale of LOCALES) {
      for (const tk of allTickers) {
        companyPages.push({
          url: `${SITE_URL}/${locale}/company/${tk}`,
          lastModified: ts,
          changeFrequency: "weekly",
          priority: 0.9,
        });
      }
    }
  } catch (e) {
    console.error("[sitemap] companies error:", e.message);
  }

  // ── 3. 排行榜页 5 metric × 2 locale = 10 条 ─────────────
  const rankingPages = [];
  for (const locale of LOCALES) {
    for (const m of METRICS) {
      rankingPages.push({
        url: `${SITE_URL}/${locale}/rankings/${m}`,
        lastModified: ts,
        changeFrequency: "weekly",
        priority: 0.85,
      });
    }
  }

  // ── 4. Compare 详情页 - 动态生成所有公司两两组合 ────────
  // 14 家公司会生成 14*13/2 = 91 个对比页。如果以后涨到 30 家就是 435 个
  // ，仍在 sitemap 允许范围内（5 万条上限）
  const comparePages = [];
  if (allTickers.length >= 2) {
    for (let i = 0; i < allTickers.length; i++) {
      for (let j = i + 1; j < allTickers.length; j++) {
        const a = allTickers[i].toLowerCase();
        const b = allTickers[j].toLowerCase();
        for (const locale of LOCALES) {
          comparePages.push({
            url: `${SITE_URL}/${locale}/compare/${a}-vs-${b}`,
            lastModified: ts,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  }

  // ── 5. 文章详情 - 按文章自身 language 决定 locale ────────
  let articlePages = [];
  try {
    const articles = await getPublishedArticles();
    articlePages = articles.map(a => ({
      // 文章有 language 字段就用对应 locale，否则默认 en
      url: `${SITE_URL}/${a.language || "en"}/articles/${a.slug}`,
      lastModified: a.publish_date ? new Date(a.publish_date).toISOString() : ts,
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
    ...comparePages,
    ...articlePages,
  ];
}
