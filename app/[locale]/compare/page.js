import { getQuarterlyData } from "@/lib/notion";
import { getT, LOCALES } from "@/lib/i18n";
import CompareSelector from "./CompareSelector";

export const revalidate = 3600;

const INCLUDED = [
  { en: "BTC Production",         zh: "BTC 产量" },
  { en: "BTC Holdings",           zh: "BTC 持仓" },
  { en: "Hashrate (EH/s)",        zh: "算力（EH/s）" },
  { en: "Cash Cost / BTC",        zh: "现金单币成本" },
  { en: "Energy Cost / BTC",      zh: "能源单币成本" },
  { en: "Fleet Efficiency (J/TH)",zh: "机队能效（J/TH）" },
  { en: "Power Capacity (MW)",    zh: "电力规模（MW）" },
];

export default async function CompareLandingPage({ params }) {
  const { locale } = await params;
  const t = getT(locale);

  const allData = await getQuarterlyData();
  const companyMap = new Map();
  for (const r of allData) {
    if (!r.ticker || !r.company) continue;
    if (!companyMap.has(r.ticker) || r.quarter > companyMap.get(r.ticker).quarter)
      companyMap.set(r.ticker, r);
  }
  const companies = Array.from(companyMap.values())
    .sort((a, b) => (b.btc_production || 0) - (a.btc_production || 0))
    .map(r => ({ ticker: r.ticker, company: r.company }));

  // 只传序列化安全的数据给 Client Component（字符串、数组、对象）
  // 不传函数！
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
          {t("nav.compare")}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          {t("compare.title")}
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 560, lineHeight: 1.7, margin: 0 }}>
          {t("compare.subtitle")}
        </p>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px", maxWidth: 600, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
          {t("compare.chooseTwo")}
        </div>
        {companies.length >= 2
          ? (
            // 只传 locale（字符串）和 companies（数组），不传函数
            <CompareSelector
              companies={companies}
              locale={locale}
            />
          )
          : <p style={{ color: "var(--text3)", fontSize: 13 }}>{t("compare.noData")}</p>
        }
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", maxWidth: 600 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
          {t("compare.whatsIncluded")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
          {INCLUDED.map(item => (
            <div key={item.en} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="7" fill="rgba(76,175,80,0.15)" />
                <path d="M4 7l2 2 4-4" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {locale === "zh" ? item.zh : item.en}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
