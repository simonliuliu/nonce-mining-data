import { getFAQs } from "@/lib/notion";
import { getT, LOCALES } from "@/lib/i18n";
import FaqAccordion from "@/components/FaqAccordion";
import Link from "next/link";

export const revalidate = 3600;

export async function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = getT(locale);
  return { title: t("faq.title"), description: t("faq.subtitle") };
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

  return (
    <>
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
