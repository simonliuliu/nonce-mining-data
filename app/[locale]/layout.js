// app/[locale]/layout.js
// ✅ 不包含 <html><body>（由根 layout 提供）
// ✅ 不 import globals.css（根 layout 已引入）
// ✅ 负责：导航、主内容区、页脚、语言切换、全站 SEO schema、双语兜底 metadata

import Link from "next/link";
import NavBrand from "../NavBrand";
import LangSwitcher from "./LangSwitcher";
import { getT, isValidLocale, LOCALES } from "@/lib/i18n";
import { JsonLd, websiteSchema, canonicalUrl } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}

// ─── 语言层兜底 metadata ──────────────────────────────────────
//
// 重要修复：移除原来错误的 alternates.canonical 设置
// 之前所有页面 canonical 都被强制设为 /en 或 /zh，盖住了子页自己的设置
// 现在 canonical 由每个 page.js 自己声明
//
// 这里只声明：
//   - 站点级 title default + template（被子 page 覆盖）
//   - 双语 description 兜底
//   - OpenGraph siteName / locale / 默认图
//   - Twitter card 类型
//   - languages 跨语言映射（hreflang 全站统一）

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  return {
    title: {
      default: t("seo.defaultTitle"),
      template: `%s — ${t("seo.siteName")}`,
    },
    description: t("seo.defaultDesc"),

    openGraph: {
      siteName: t("seo.siteName"),
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@hash_res",
    },

    // hreflang：告诉搜索引擎中英文版互为译本
    // 这里只设语言层的兜底（指向各 locale 的首页）
    // 子 page 会用自己的具体 URL 覆盖这个 languages
    alternates: {
      languages: {
        en:          "/en",
        zh:          "/zh",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) notFound();

  const t = getT(locale);

  const NAV_LINKS = [
    { href: `/${locale}`,                      label: t("nav.overview") },
    { href: `/${locale}/rankings/production`,  label: t("nav.rankings") },
    { href: `/${locale}/compare`,              label: t("nav.compare")  },
    { href: `/${locale}/articles`,             label: t("nav.research") },
    { href: `/${locale}/methodology`,          label: t("nav.docs")     },
  ];

  return (
    <>
      {/* ─── 全站结构化数据（每个页面都嵌入）────────────
          告诉谷歌：
            - HashResearch 是一个网站（WebSite schema）
            - HashResearch 是一个组织（Organization schema）
          这让谷歌可能在搜索结果右侧展示知识面板（带 logo 的卡片）
          ──────────────────────────────────────────────── */}
      <JsonLd data={websiteSchema()} />

      <nav className="nav">
        <div className="container">
          <div className="nav-inner">
            <NavBrand locale={locale} />

            <div className="nav-tabs">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="nav-tab">
                  {l.label}
                </Link>
              ))}
            </div>

            <LangSwitcher currentLocale={locale} />
          </div>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
            <Link href={`/${locale}/methodology`}>{locale === "zh" ? "方法论" : "Methodology"}</Link>
            <Link href={`/${locale}/faq`}>{locale === "zh" ? "常见问题" : "FAQ"}</Link>
            <Link href={`/${locale}/rankings/production`}>{locale === "zh" ? "排行榜" : "Rankings"}</Link>
            <Link href={`/${locale}/compare`}>{locale === "zh" ? "对比" : "Compare"}</Link>
            <Link href={`/${locale}/articles`}>{locale === "zh" ? "研究" : "Research"}</Link>
            <a
              href="https://x.com/hash_res"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text3)" }}
            >
              <svg width="12" height="12" viewBox="0 0 1200 1227" fill="currentColor">
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z"/>
              </svg>
              @hash_res
            </a>
          </div>
          <div>{t("footer.copy", { year: new Date().getFullYear() })}</div>
        </div>
      </footer>
    </>
  );
}
