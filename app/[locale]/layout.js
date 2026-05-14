// app/[locale]/layout.js
// ✅ 不包含 <html><body>（由根 layout 提供）
// ✅ 不 import globals.css（根 layout 已引入）
// ✅ 负责：导航、主内容区、页脚、语言切换

import Link from "next/link";
import NavBrand from "../NavBrand";
import LangSwitcher from "./LangSwitcher";
import { getT, isValidLocale, LOCALES } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!isValidLocale(locale)) notFound();

  const t = getT(locale);

  const NAV_LINKS = [
    { href: `/${locale}`,                     label: t("nav.overview")  },
    { href: `/${locale}/rankings/production`,  label: t("nav.rankings")  },
    { href: `/${locale}/compare`,              label: t("nav.compare")   },
    { href: `/${locale}/articles`,             label: t("nav.research")  },
    { href: `/${locale}/methodology`,          label: t("nav.docs")      },
  ];

  return (
    <>
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
            <a href="https://x.com/hash_res" target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text3)" }}>
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
