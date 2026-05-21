import { getQuarterlyData, getFAQs } from "@/lib/notion";
import { getQuarters, enrichRows, getCompanies } from "@/lib/helpers";
import { getT } from "@/lib/i18n";
import HomeClient from "./HomeClient";
import Link from "next/link";

export const revalidate = 3600;

// ─── 首页 SEO metadata ──────────────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.home.title / seo.home.desc
// 双语自动切换：访问 /en 显示英文 title，/zh 显示中文 title
//
// 注意：Next.js 的 metadata 是"浅合并"——page 层一旦设了 openGraph 或 twitter，
// 就会完全替换 layout 层的同名对象。所以这里需要把 layout 已经设的字段
// （images / locale / siteName / card 类型）显式重申一次。

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  const title = t("seo.home.title");
  const desc  = t("seo.home.desc");
  const path  = `/${locale}`;

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en:          "/en",
        zh:          "/zh",
        "x-default": "/en",
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
      card:        "summary_large_image",   // 必须显式指定，否则会回退到 summary
      title,
      description: desc,
      site:        "@hash_res",
      images:      ["/og-default.png"],
    },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  // Pass locale to getFAQs — returns content in correct language
  const [data, faqs] = await Promise.all([
    getQuarterlyData(),
    getFAQs(locale).catch(() => []),
  ]);

  const quarters  = getQuarters(data);
  const latestQ   = quarters[quarters.length - 1] || "";
  const companies = getCompanies(data);

  const enrichedByQuarter = {};
  for (const q of quarters) enrichedByQuarter[q] = enrichRows(data, q);

  const homeFaqs = faqs.slice(0, 5);

  return (
    <>
      <section style={{ margin: "0 0 32px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {t("home.title")}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.8, margin: 0, maxWidth: "66%" }}>
          {t("home.subtitle", { count: companies.length })}
        </p>
      </section>

      <HomeClient
        enrichedByQuarter={enrichedByQuarter}
        quarters={quarters}
        latestQ={latestQ}
        locale={locale}
      />

      {/* FAQ — Notion driven, language-filtered */}
      {homeFaqs.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text2)" }}>
              {t("faq.title")}
            </h2>
            <Link href={`/${locale}/faq`} style={{ fontSize: 12, color: "var(--brand)" }}>
              {locale === "zh" ? "查看全部 →" : "View all →"}
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {homeFaqs.map(faq => (
              <details key={faq.id} style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden" }}>
                <summary style={{ padding:"13px 16px", fontSize:14, fontWeight:500, color:"var(--text)", cursor:"pointer", listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center", userSelect:"none" }}>
                  <span>{faq.question}</span>
                  <span style={{ color:"var(--text3)", fontSize:18, lineHeight:1, flexShrink:0, marginLeft:12, fontWeight:300 }}>+</span>
                </summary>
                {faq.answer_html && (
                  <div className="prose" style={{ padding:"12px 16px 14px", borderTop:"1px solid var(--border)", fontSize:14 }}
                    dangerouslySetInnerHTML={{ __html: faq.answer_html }} />
                )}
              </details>
            ))}
          </div>

          {faqs.length > 5 && (
            <div style={{ textAlign:"center", marginTop:12 }}>
              <Link href={`/${locale}/faq`} style={{ fontSize:13, color:"var(--text3)", textDecoration:"none", padding:"8px 16px", border:"1px solid var(--border)", borderRadius:7, display:"inline-block" }}>
                {locale === "zh" ? `查看全部 ${faqs.length} 个问题 →` : `View all ${faqs.length} questions →`}
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
