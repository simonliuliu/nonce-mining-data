import { getQuarterlyData, getCompanyProfile, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { TICKERS, TICKER_COLORS, buildCompanyTimeseries } from "@/lib/helpers";
import { getT } from "@/lib/i18n";
import CompanyTabs from "./CompanyTabs";
import CompanyLogoHeader from "./CompanyLogoHeader";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const T2C = {};
Object.entries(TICKERS).forEach(([company, ticker]) => { T2C[ticker] = company; });

export async function generateMetadata({ params }) {
  const { ticker, locale } = await params;
  const tk = ticker?.toUpperCase();
  const company = T2C[tk];
  if (!company) return { title: "Not Found" };
  return {
    title: `${company} (${tk}) — BTC Production, Hashrate, Costs`,
    description: `Detailed operational data for ${company} (${tk}). BTC production, hashrate, costs from SEC filings.`,
    alternates: { languages: { en: `/en/company/${tk}`, zh: `/zh/company/${tk}` } },
  };
}

// ─── 相关文章过滤辅助 ──────────────────────────────────────────
// 同时匹配 ticker（BTDR）和公司名（Bitdeer），并按 locale 过滤
function filterRelatedArticles(articles, ticker, companyName, locale) {
  const tkUp   = ticker.toUpperCase();
  const cnUp   = companyName.toUpperCase();

  return articles.filter(a => {
    // 1. 按 locale 过滤：article.language === locale，或没标 language（兼容旧数据）
    if (a.language && a.language !== locale) return false;

    // 2. 按 related_company 匹配（同时支持字符串和数组两种 Notion 字段类型）
    const rc = a.related_company;
    if (!rc) return false;

    const rcList = Array.isArray(rc) ? rc : [rc];
    return rcList.some(v => {
      const upper = String(v).toUpperCase();
      // 命中任一关键词即可：ticker (BTDR) 或公司名 (BITDEER, BITDEER TECHNOLOGIES 等)
      return upper.includes(tkUp) || upper.includes(cnUp) || cnUp.includes(upper);
    });
  });
}

export default async function CompanyPage({ params }) {
  const { ticker, locale } = await params;
  const tk      = ticker?.toUpperCase();
  const company = T2C[tk];
  if (!company) notFound();

  const t = getT(locale);

  const [allData, articles] = await Promise.all([
    getQuarterlyData(),
    getPublishedArticles().catch(() => []),
  ]);

  const data = allData
    .filter(r => r.company === company || r.ticker === tk)
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  const latest = data[data.length - 1];
  const color  = TICKER_COLORS[tk] || "#F7931A";
  const ts     = buildCompanyTimeseries(allData, company);

  // ★ 关键：传 locale，让 Notion 优先返回中文 profile（如有）
  let profile = null;
  try { profile = await getCompanyProfile(tk, locale); } catch (e) {}

  const profileHtml     = profile?.blocks ? await blocksToHtml(profile.blocks) : "";
  const parts           = profileHtml.split("<hr/>");
  const methodologyHtml = parts[0] || "";
  const faqHtml         = parts[1] || "";

  // ★★★ 修复后的相关文章过滤 ★★★
  const related = filterRelatedArticles(articles, tk, company, locale);

  const peers = profile?.peers?.split(",").map(p => p.trim()).filter(p => p && p !== tk) || [];

  return (
    <>
      <Link href={`/${locale}`} style={{ fontSize: 13, color: "var(--text3)" }}>
        {t("company.allCompanies")}
      </Link>

      <CompanyLogoHeader
        ticker={tk}
        company={profile?.company || company}
        color={color}
        headquarters={profile?.headquarters}
        website={profile?.website}
        btcMiner={t("company.btcMiner")}
      />

      <CompanyTabs
        ticker={tk}
        color={color}
        ts={ts}
        data={data}
        latest={latest}
        profile={profile}
        methodologyHtml={methodologyHtml}
        faqHtml={faqHtml}
        related={related}
        peers={peers}
        locale={locale}
      />
    </>
  );
}
