import { getQuarterlyData, getCompanyProfile, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { TICKER_COLORS, buildCompanyTimeseries } from "@/lib/helpers";
import { getT } from "@/lib/i18n";
import CompanyTabs from "./CompanyTabs";
import CompanyLogoHeader from "./CompanyLogoHeader";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// ─── 从 Notion 数据动态查找公司名 ────────────────────────────────
// 替代之前对硬编码 TICKERS 的依赖。任何在 Notion 里出现过的 ticker 都自动可访问，
// 不需要每加一家新公司就改 helpers.js。
async function resolveCompany(tk) {
  const allData = await getQuarterlyData();
  // 从数据里找第一条匹配该 ticker 的记录，取其公司名
  const row = allData.find(r => r.ticker === tk);
  return { company: row?.company || null, allData };
}

export async function generateMetadata({ params }) {
  const { ticker, locale } = await params;
  const tk = ticker?.toUpperCase();
  if (!tk) return { title: "Not Found" };
  const { company } = await resolveCompany(tk);
  if (!company) return { title: "Not Found" };
  return {
    title: `${company} (${tk}) — BTC Production, Hashrate, Costs`,
    description: `Detailed operational data for ${company} (${tk}). BTC production, hashrate, costs from SEC filings.`,
    alternates: { languages: { en: `/en/company/${tk}`, zh: `/zh/company/${tk}` } },
  };
}

// ─── 相关文章过滤辅助 ──────────────────────────────────────────
function filterRelatedArticles(articles, ticker, companyName, locale) {
  const tkUp = ticker.toUpperCase();
  const cnUp = (companyName || "").toUpperCase();

  return articles.filter(a => {
    if (a.language && a.language !== locale) return false;
    const rc = a.related_company;
    if (!rc) return false;
    const rcList = Array.isArray(rc) ? rc : [rc];
    return rcList.some(v => {
      const upper = String(v).toUpperCase();
      return upper.includes(tkUp) || (cnUp && (upper.includes(cnUp) || cnUp.includes(upper)));
    });
  });
}

export default async function CompanyPage({ params }) {
  const { ticker, locale } = await params;
  const tk = ticker?.toUpperCase();
  if (!tk) notFound();

  const t = getT(locale);

  // ★ 关键改动：从数据动态解析公司名（不再依赖硬编码 TICKERS）
  const { company, allData } = await resolveCompany(tk);
  if (!company) notFound();

  const articles = await getPublishedArticles().catch(() => []);

  const data = allData
    .filter(r => r.company === company || r.ticker === tk)
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  const latest = data[data.length - 1];
  const color  = TICKER_COLORS[tk] || "#F7931A";
  const ts     = buildCompanyTimeseries(allData, company);

  let profile = null;
  try { profile = await getCompanyProfile(tk, locale); } catch (e) {}

  const profileHtml     = profile?.blocks ? await blocksToHtml(profile.blocks) : "";
  const parts           = profileHtml.split("<hr/>");
  const methodologyHtml = parts[0] || "";
  const faqHtml         = parts[1] || "";

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
