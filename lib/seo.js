// lib/seo.js
// 全站 SEO + AEO 工具：URL / Schema 生成函数
//
// 修改文案：去 lib/i18n.js 里的 seo.* 命名空间改，不要在这里改
// 修改域名：改 SITE_URL（建议用环境变量 NEXT_PUBLIC_SITE_URL）
// 修改品牌：改 SITE_NAME 常量
//
// 全部 schema 工具：
//   - canonicalUrl()         构造规范 URL
//   - websiteSchema()        WebSite + Organization（全站）
//   - breadcrumbSchema()     BreadcrumbList（深层页面）
//   - faqPageSchema()        FAQPage（FAQ 页用，争取 Featured Snippet）
//   - articleSchema()        Article（文章详情用，争取 Google News 收录）
//   - organizationSchema()   Organization（被报道的公司，公司详情用）
//   - datasetSchema()        Dataset（数据集，AEO 关键 schema）★ Pack 6 新增
//   - JsonLd                 React 组件：嵌入 JSON-LD 标签
//
// ──────────────────────────────────────────────────────────

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || "https://thehashresearch.com";
const SITE_NAME = "HashResearch";

// ─── Canonical URL 构造 ──────────────────────────────────────

export function canonicalUrl(path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

// ─── WebSite + Organization schema（全站根 layout 用）────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: "Bitcoin mining company data and analytics. Track BTC production, hashrate, treasury, and unit costs.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "zh"],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpg` },
        sameAs: ["https://x.com/hash_res"],
      },
    ],
  };
}

// ─── BreadcrumbList schema（深页面用）────────────────────────

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.url),
    })),
  };
}

// ─── FAQPage schema（FAQ 页用）───────────────────────────────

export function faqPageSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(f.answer || ""),
      },
    })),
  };
}

// ─── Article schema（研究文章详情页用）──────────────────────

export function articleSchema({ title, description, url, publishDate, image, locale }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || undefined,
    url: canonicalUrl(url),
    datePublished: publishDate || undefined,
    image: image ? [image] : undefined,
    inLanguage: locale === "zh" ? "zh-CN" : "en-US",
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.jpg` },
    },
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

// ─── Organization schema（被报道的公司，公司详情用）──────

export function organizationSchema({ name, ticker, headquarters, website, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    ...(ticker && { tickerSymbol: ticker }),
    ...(website && { url: website }),
    ...(headquarters && { address: { "@type": "PostalAddress", addressLocality: headquarters } }),
    ...(description && { description }),
  };
}

// ─── Dataset schema (AEO 关键 schema) ★ Pack 6 新增 ──────────
//
// 这是面向"答案引擎"（ChatGPT / Perplexity / Google AI Overview / Claude 等）的关键 schema
// 告诉 AI 引擎："这个页面是一个数据集，可以引用"
//
// 用在哪些页面：
//   - 排行榜 5 个页面（每个排行榜是一个数据集）
//   - 公司详情页（每家公司的季度数据是一个数据集）
//
// 参数：
//   - name           数据集名称（如 "BTC Production Rankings"）
//   - description    描述
//   - url            数据集 URL
//   - keywords       关键词数组（如 ["bitcoin mining", "BTC production"]）
//   - temporalCoverage 数据时间范围（如 "2023/2026"）
//   - locale         语言

export function datasetSchema({
  name,
  description,
  url,
  keywords = [],
  temporalCoverage,
  locale = "en",
  variableMeasured = [],
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: canonicalUrl(url),
    inLanguage: locale === "zh" ? "zh-CN" : "en-US",
    isAccessibleForFree: true,
    keywords: keywords.length > 0 ? keywords : undefined,
    temporalCoverage: temporalCoverage || undefined,

    // 数据集创建者 / 发布者
    creator: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },

    // 数据来源声明（增强可信度）
    citation: "SEC filings (10-Q, 10-K, 20-F, 8-K), company IR press releases, investor presentations",

    // 许可证（CC-BY 4.0：可引用但需署名）
    license: "https://creativecommons.org/licenses/by/4.0/",

    // 测量指标声明（AI 引擎特别看重的字段）
    variableMeasured: variableMeasured.length > 0
      ? variableMeasured.map(v => ({ "@type": "PropertyValue", name: v }))
      : undefined,
  };
}

// ─── JSON-LD 嵌入组件 ────────────────────────────────────────

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── 辅助：清理 HTML 标签 ────────────────────────────────────

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export { SITE_URL, SITE_NAME };
