import { getQuarterlyData, getCompanyProfile, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { TICKER_COLORS, buildCompanyTimeseries } from "@/lib/helpers";
import { getT } from "@/lib/i18n";
import CompanyTabs from "./CompanyTabs";
import CompanyLogoHeader from "./CompanyLogoHeader";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

// ─── 从 Notion 数据动态查找公司 ────────────────────────────────────
// 多策略匹配 ticker，不依赖任何硬编码列表，新增公司无需改代码。
//
// 匹配策略（按优先级）：
//   1. 精确匹配 r.ticker === tk
//   2. 大小写归一化匹配 r.ticker?.toUpperCase() === tk
//   3. 公司名子串匹配（处理 ticker 字段未填的边缘情况）
async function resolveCompany(tk) {
  const allData = await getQuarterlyData();

  // 策略 1 & 2：ticker 字段匹配
  let row = allData.find(r => r.ticker?.toUpperCase() === tk);

  // 策略 3：如果数据里 ticker 字段缺失，从公司名包含 tk 来反查
  // 比如某行 ticker 是空但 company="American Bitcoin"，URL 是 /ABTC
  if (!row) {
    row = allData.find(r =>
      r.company?.toUpperCase().includes(tk) ||
      tk.includes((r.ticker || "").toUpperCase())
    );
  }

  // 调试日志（开发时排查 404 用，生产环境不影响）
  if (!row) {
    const allTickers = [...new Set(allData.map(r => r.ticker).filter(Boolean))].sort();
    console.warn(`[company-page] ticker "${tk}" not found in Notion data.`);
    console.warn(`[company-page] Available tickers in data: ${allTickers.join(", ")}`);
  }

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

  const { company, allData } = await resolveCompany(tk);
  if (!company) notFound();

  const articles = await getPublishedArticles().catch(() => []);

  // 用 ticker 和公司名双重匹配，保证拿到所有该公司的季度数据
  const data = allData
    .filter(r => r.company === company || r.ticker?.toUpperCase() === tk)
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
