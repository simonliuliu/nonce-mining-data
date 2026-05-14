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
    description: `Detailed operational data for ${company} (${tk}). Data from SEC filings.`,
    alternates: { languages: { en: `/en/company/${tk}`, zh: `/zh/company/${tk}` } },
  };
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
  const color  = TICKER_COLORS[tk] || "#C8922A";
  const ts     = buildCompanyTimeseries(allData, company);

  // Pass locale — returns profile in correct language, falls back to en
  let profile = null;
  try { profile = await getCompanyProfile(tk, locale); } catch (e) {}

  const profileHtml     = profile?.blocks ? blocksToHtml(profile.blocks) : "";
  const parts           = profileHtml.split("<hr/>");
  const methodologyHtml = parts[0] || "";
  const faqHtml         = parts[1] || "";

  const related = articles.filter(a => a.related_company?.toUpperCase().includes(tk));
  const peers   = profile?.peers?.split(",").map(p => p.trim()).filter(p => p && p !== tk) || [];

  return (
    <>
      <Link href={`/${locale}`} style={{ fontSize:13, color:"var(--text3)" }}>
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
