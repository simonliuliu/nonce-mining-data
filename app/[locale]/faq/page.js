import { getFAQs } from "@/lib/notion";
import { getT, LOCALES } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema, faqPageSchema } from "@/lib/seo";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";

export const revalidate = 3600;

export async function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}

// ─── FAQ 页 SEO metadata ─────────────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.faq.title / desc
//
// 关键修复：
//   ❌ 旧版：description 用 t("faq.subtitle")（这是给页面 H1 下方文字的，不是 SEO desc）
//   ❌ 旧版：没有 canonical / alternates / og 完整字段
//   ❌ 旧版：没有 FAQPage schema (失去 Featured Snippet 富摘要的机会)
//   ✅ 新版：完整 SEO metadata + FAQPage schema + BreadcrumbList

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  const title = t("seo.faq.title");
  const desc  = t("seo.faq.desc");
  const path  = `/${locale}/faq`;

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en:          "/en/faq",
        zh:          "/zh/faq",
        "x-default": "/en/faq",
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

export default async function FAQPage({ params }) {
  const { locale } = await params;
  const t    = getT(locale);
  const faqs = await getFAQs(locale).catch(() => []);

  // Group by category
  const grouped = {};
  for (const faq of faqs) {
    const cat = faq.category || (locale === "zh" ? "通用" : "General");
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(faq);
  }

  // ─── FAQPage 结构化数据 ─────────────────────────────────
  //
  // 这是 SEO 最关键的 schema 之一：
  //   - 让谷歌识别每个问答对
  //   - 争取 Featured Snippet 富摘要（搜索结果顶部带答案的卡片）
  //   - 当用户搜 "what is hashrate" / "算力是什么" 时,你的 FAQ 答案有机会
  //     直接显示在搜索结果最顶部
  //
  // 注意：FAQPage schema 要求 answer 是纯文本，不能含 HTML 标签
  // lib/seo.js 里的 faqPageSchema() 会自动用 stripHtml() 清理 HTML
  //
  // 至少需要 1 个 FAQ 才生成 schema（空数组不生成）
  const faqSchemaData = faqs.length > 0
    ? faqPageSchema(faqs.map(f => ({
        question: f.question,
        answer:   f.answer_html || f.answer || "",
      })))
    : null;

  // ─── 面包屑结构化数据 ───────────────────────────────────
  const breadcrumbData = breadcrumbSchema([
    { name: locale === "zh" ? "首页" : "Home",  url: `/${locale}` },
    { name: t("faq.title"),                     url: `/${locale}/faq` },
  ]);

  return (
    <>
      {faqSchemaData && <JsonLd data={faqSchemaData} />}
      <JsonLd data={breadcrumbData} />

      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
        <Link href={`/${locale}`}>{locale === "zh" ? "首页" : "Home"}</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{t("faq.title")}</span>
      </nav>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {t("faq.title")}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 600, lineHeight: 1.7, margin: 0 }}>
          {t("faq.subtitle")}
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="text-block" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ color: "var(--text2)", margin: "0 0 8px" }}>{t("faq.noContent")}</p>
          <p style={{ fontSize: 12, color: "var(--text3)", margin: 0 }}>{t("faq.noContentHint")}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 32 }}>
            {Object.keys(grouped).length > 1 && (
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
                {category}
              </div>
            )}
            <FaqAccordion faqs={items} locale={locale} />
          </div>
        ))
      )}
    </>
  );
}
