import { getArticleBySlug, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import Link from "next/link";
import TweetLoader from "@/components/TweetLoader";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const a = await getArticleBySlug(slug);
    if (!a) return { title: "Not Found" };
    return {
      title: a.title,
      description: a.meta_description,
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

  return (
    <>
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
