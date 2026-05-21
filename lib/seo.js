// lib/seo.js
// 全站 SEO 工具：URL / Schema 生成函数
//
// 修改文案：去 lib/i18n.js 里的 seo.* 命名空间改，不要在这里改
// 修改域名：改 SITE_URL（建议用环境变量）
//
// 当前所有 schema 工具：
//   - canonicalUrl()         构造规范 URL
//   - websiteSchema()        WebSite + Organization（全站）
//   - breadcrumbSchema()     BreadcrumbList（深层页面）
//   - faqPageSchema()        FAQPage（FAQ 页用）
//   - articleSchema()        Article（文章详情用）
//   - organizationSchema()   Organization（公司详情用）
//   - JsonLd                 React 组件：嵌入 JSON-LD 标签
//
// ──────────────────────────────────────────────────────────

// ★ 域名：未来变成 nonce.app 子域名时，改这里就行
// 优先使用 .env 里的 NEXT_PUBLIC_SITE_URL（部署到 Vercel 时方便切环境）
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL || "https://thehashresearch.com";
const SITE_NAME = "HashResearch";

// ─── Canonical URL 构造 ──────────────────────────────────────

export function canonicalUrl(path = "") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

// ─── WebSite + Organization schema（全站根 layout 用）────────
//
// 让谷歌知道"HashResearch 是一个组织/网站"，可能在搜索时显示：
//   - 知识面板（右侧带 logo 的卡片）
//   - SearchAction（搜索框直接出现在搜索结果里）

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
//
// 让搜索结果显示 "HashResearch › Rankings › BTC Production"
// 而不是冷冰冰的 URL。
//
// 用法：
//   breadcrumbSchema([
//     { name: "Home", url: "/en" },
//     { name: "Rankings", url: "/en/rankings/production" },
//   ])

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
//
// 让谷歌识别问答对，争取 Featured Snippet 精选摘要
//
// 用法（在 FAQ 页里）：
//   const faqs = [{ question: "...", answer: "纯文本，不要 HTML" }, ...]
//   <JsonLd data={faqPageSchema(faqs)} />

export function faqPageSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        // FAQPage schema 要求 answer 是纯文本，所以我们清掉 HTML 标签
        text: stripHtml(f.answer || ""),
      },
    })),
  };
}

// ─── Article schema（研究文章详情页用）──────────────────────
//
// 让文章有机会进入 Google News / Discover 推荐流

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

// ─── Organization schema（公司详情页用）────────────────────
//
// 让 MARA / CLSK 等公司在谷歌搜索时关联到我们的页面
// 注意：这是"被报道的公司"，不是我们自己 HashResearch

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

// ─── JSON-LD 嵌入组件 ────────────────────────────────────────
//
// 在 page.js 里这样用：
//   import { JsonLd, faqPageSchema } from "@/lib/seo";
//   ...
//   <JsonLd data={faqPageSchema(faqs)} />

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── 辅助：清理 HTML 标签 ────────────────────────────────────
// FAQPage schema 要求 answer 是纯文本，所以这里把 HTML 标签去掉

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")  // 移除所有标签
    .replace(/&nbsp;/g, " ")   // 替换 HTML entity
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")      // 多空格合并
    .trim();
}

// 导出常量给其他文件用（sitemap.js / robots.js）
export { SITE_URL, SITE_NAME };
