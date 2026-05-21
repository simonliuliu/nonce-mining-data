import { getPublishedArticles } from "@/lib/notion";
import { getT } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import Link from "next/link";

export const revalidate = 3600;

// ─── 研究文章列表 SEO metadata ───────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.articlesList.title / desc
//
// 关键修复：
//   ❌ 旧版：完全没有 generateMetadata，标签显示 "HashResearch - Bitcoin Mining Data"
//   ✅ 新版：专属 title/desc + canonical + alternates + BreadcrumbList schema

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  const title = t("seo.articlesList.title");
  const desc  = t("seo.articlesList.desc");
  const path  = `/${locale}/articles`;

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en:          "/en/articles",
        zh:          "/zh/articles",
        "x-default": "/en/articles",
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

export default async function ArticlesPage({ params }) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const t    = getT(locale);

  let articles = [];
  try { articles = await getPublishedArticles(); } catch (e) {}

  // 严格按 Language 字段过滤：
  //   - language === locale → 显示
  //   - language 为空（旧数据，未打标签）→ 显示（兼容旧内容）
  //   - language 是其他语言 → 不显示
  const display = articles.filter(a => !a.language || a.language === locale);

  // 按 category 分组
  const grouped = {};
  for (const a of display) {
    const cat = a.category || (isZh ? "全部" : "All");
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  }
  const hasCategories = Object.keys(grouped).length > 1;

  // ─── 面包屑结构化数据 ───────────────────────────────────
  const breadcrumbData = breadcrumbSchema([
    { name: isZh ? "首页" : "Home",       url: `/${locale}` },
    { name: isZh ? "研究" : "Research",   url: `/${locale}/articles` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
        <Link href={`/${locale}`}>{isZh ? "首页" : "Home"}</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{isZh ? "研究" : "Research"}</span>
      </nav>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {isZh ? "研究报告" : "Research"}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          {isZh
            ? "比特币矿企深度分析、季报解读与行业数据洞察。"
            : "In-depth analysis and data insights on public Bitcoin mining companies."}
        </p>
      </div>

      {display.length === 0 ? (
        <div className="text-block" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text2)", margin: 0 }}>
            {isZh ? "暂无已发布的研究报告。" : "No articles published yet."}
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 32 }}>
            {hasCategories && (
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
                {category}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(a => (
                <Link
                  key={a.slug}
                  href={`/${locale}/articles/${a.slug}`}
                  className="text-block"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 5, lineHeight: 1.4 }}>
                        {a.title}
                      </div>
                      {a.meta_description && (
                        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.55, marginBottom: 8 }}>
                          {a.meta_description}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text3)", flexWrap: "wrap" }}>
                        {a.publish_date && <span>{a.publish_date}</span>}
                        {a.related_company && (
                          <span style={{ color: "var(--brand)", fontWeight: 500 }}>{a.related_company}</span>
                        )}
                        {a.category && hasCategories && (
                          <span style={{ background: "var(--bg3)", padding: "1px 6px", borderRadius: 4 }}>{a.category}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "var(--text3)", fontSize: 16, flexShrink: 0, marginTop: 2 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
