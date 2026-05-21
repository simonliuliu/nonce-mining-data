import { getArticleBySlug, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { JsonLd, articleSchema, breadcrumbSchema, canonicalUrl } from "@/lib/seo";
import Link from "next/link";
import TweetLoader from "@/components/TweetLoader";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// ─── 文章详情页 SEO metadata ─────────────────────────────────
//
// 这个页面的 metadata 完全从 Notion 拿（不在代码里写死）:
//   - title            → Notion 文章 Title 字段
//   - description      → Notion 文章 Meta Description 字段
//   - cover_image      → Notion 文章 Cover Image 字段（OG 图）
//   - publish_date     → Notion 文章 Publish Date 字段
//
// 运营在 Notion 里填这些字段即可，无需改代码。
//
// 关键修复：
//   ❌ 旧版：OG type 是默认的 "website"，不利于 Google Discover/News 抓取
//   ❌ 旧版：没有 OG image，社交分享卡片缺图
//   ❌ 旧版：没有 Article schema，失去 Article 富摘要机会
//   ❌ 旧版：没有 published_time 元信息
//   ✅ 新版：完整 Article schema + OG article + 封面图

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;

  try {
    const a = await getArticleBySlug(slug);
    if (!a) return { title: "Not Found" };

    const path = `/${locale}/articles/${slug}`;

    // OG 图优先用文章封面，没有则用默认图
    const ogImage = a.cover_image || "/og-default.png";

    return {
      title:       a.title,
      description: a.meta_description,

      alternates: {
        canonical: path,
        // 注意：文章详情的 hreflang 只在两种语言版本都存在时才有意义
        // 简单起见这里只指向当前 locale（避免误指向不存在的另一语言版本）
        languages: {
          [locale]: path,
        },
      },

      openGraph: {
        title:       a.title,
        description: a.meta_description,
        url:         path,
        type:        "article",                                   // ★ 关键变更
        siteName:    "HashResearch",
        locale:      locale === "zh" ? "zh_CN" : "en_US",
        images: [{ url: ogImage, width: 1200, height: 630, alt: a.title }],

        // OG article 专属字段（Google Discover / Facebook News Feed 会用）
        publishedTime: a.publish_date || undefined,
        authors:       ["HashResearch"],
        section:       a.category || undefined,
      },

      twitter: {
        card:        "summary_large_image",
        title:       a.title,
        description: a.meta_description,
        site:        "@hash_res",
        creator:     "@hash_res",
        images:      [ogImage],
      },
    };
  } catch (e) {
    return { title: "Not Found" };
  }
}

export default async function ArticlePage({ params }) {
  const { slug, locale } = await params;
  const isZh = locale === "zh";

  let article = null;
  try { article = await getArticleBySlug(slug); } catch (e) {}
  if (!article) notFound();

  const contentHtml = article.blocks ? await blocksToHtml(article.blocks) : "";

  // Related articles (same company, excluding current)
  let related = [];
  try {
    const all = await getPublishedArticles();
    related = all
      .filter(a => a.slug !== slug && a.related_company && a.related_company === article.related_company)
      .slice(0, 3);
  } catch (e) {}

  // ─── 结构化数据 ───────────────────────────────────────────
  // 两个 schema 注入文章页：
  //   1. Article schema：让谷歌识别这是新闻/文章，可能被 Google News / Discover 收录
  //   2. BreadcrumbList：搜索结果显示 "HashResearch › 研究 › 文章标题" 导航
  const articleData = articleSchema({
    title:       article.title,
    description: article.meta_description,
    url:         `/${locale}/articles/${slug}`,
    publishDate: article.publish_date,
    image:       article.cover_image,
    locale,
  });

  const breadcrumbData = breadcrumbSchema([
    { name: isZh ? "首页" : "Home",      url: `/${locale}` },
    { name: isZh ? "研究" : "Research",  url: `/${locale}/articles` },
    { name: article.title,                url: `/${locale}/articles/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleData} />
      <JsonLd data={breadcrumbData} />

      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
        <Link href={`/${locale}`}>{isZh ? "首页" : "Home"}</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link href={`/${locale}/articles`}>{isZh ? "研究" : "Research"}</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span style={{ color: "var(--text2)" }}>{article.title}</span>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(0, 240px)", gap: 40, alignItems: "start" }}>

        {/* 主内容 */}
        <article>
          {article.category && (
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              {article.category}
            </div>
          )}
          {article.related_company && (
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--brand)", marginBottom: 10 }}>
              {article.related_company}
            </div>
          )}

          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {article.title}
          </h1>

          {article.meta_description && (
            <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>
              {article.meta_description}
            </p>
          )}

          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
            {article.publish_date && <span>{article.publish_date}</span>}
            <span>{isZh ? "数据来源：SEC 财报" : "Data source: SEC filings"}</span>
          </div>

          <TweetLoader />
          {contentHtml ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            <p style={{ color: "var(--text3)", fontStyle: "italic" }}>
              {isZh ? "内容正在整理中..." : "Content coming soon..."}
            </p>
          )}

          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <Link href={`/${locale}/articles`} style={{ fontSize: 13, color: "var(--text3)" }}>
              ← {isZh ? "返回研究列表" : "Back to Research"}
            </Link>
          </div>
        </article>

        {/* 侧边栏 */}
        <aside style={{ position: "sticky", top: "calc(var(--nav-h) + 20px)" }}>
          {article.related_company && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                {isZh ? "公司数据" : "Company data"}
              </div>
              <Link
                href={`/${locale}/company/${article.related_company}`}
                className="text-block"
                style={{ display: "block", textDecoration: "none" }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--brand)" }}>
                  {article.related_company}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3 }}>
                  {isZh ? "查看完整数据 →" : "View full data →"}
                </div>
              </Link>
            </div>
          )}

          {related.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                {isZh ? "相关文章" : "Related"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {related.map(a => (
                  <Link key={a.slug} href={`/${locale}/articles/${a.slug}`} className="text-block" style={{ display: "block", textDecoration: "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", lineHeight: 1.4 }}>
                      {a.title}
                    </div>
                    {a.publish_date && (
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{a.publish_date}</div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
