import { getQuarterlyData, getCompanyProfile, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { TICKER_COLORS, buildCompanyTimeseries } from "@/lib/helpers";
import { getT } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema, organizationSchema, datasetSchema, canonicalUrl } from "@/lib/seo";
import CompanyTabs from "./CompanyTabs";
import CompanyLogoHeader from "./CompanyLogoHeader";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

async function resolveCompany(tk) {
  const allData = await getQuarterlyData();

  let row = allData.find(r => r.ticker?.toUpperCase() === tk);

  if (!row) {
    row = allData.find(r =>
      r.company?.toUpperCase().includes(tk) ||
      tk.includes((r.ticker || "").toUpperCase())
    );
  }

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

  const t = getT(locale);
  const path = `/${locale}/company/${tk}`;

  const title = t("seo.company.title", { company, ticker: tk });
  const desc  = t("seo.company.desc",  { company, ticker: tk });

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en: `/en/company/${tk}`,
        zh: `/zh/company/${tk}`,
        "x-default": `/en/company/${tk}`,
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
      card:        "summary_large_image",
      title,
      description: desc,
      site:        "@hash_res",
      images:      ["/og-default.png"],
    },
  };
}

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

  const data = allData
    .filter(r => r.company === company || r.ticker?.toUpperCase() === tk)
    .sort((a, b) => a.quarter.localeCompare(b.quarter));

  const latest = data[data.length - 1];
  const earliest = data[0];
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

  // ─── 结构化数据 ─────────────────────────────────────────
  // 注入 3 种 schema：
  //   1. Organization - 被报道的公司（如 MARA）
  //   2. BreadcrumbList - 搜索结果导航
  //   3. Dataset (★ Pack 6 新增) - 公司季度数据本身就是数据集
  const orgData = organizationSchema({
    name:         profile?.company || company,
    ticker:       tk,
    headquarters: profile?.headquarters,
    website:      profile?.website,
    description:  profile?.description,
  });

  const datasetData = datasetSchema({
    name:        locale === "zh"
      ? `${company}（${tk}）季度挖矿数据`
      : `${company} (${tk}) Quarterly Mining Data`,
    description: t("seo.company.desc", { company, ticker: tk }),
    url:         `/${locale}/company/${tk}`,
    keywords:    [
      tk, company,
      "bitcoin mining", "BTC production", "hashrate",
      "mining cost", "quarterly data",
    ],
    temporalCoverage: earliest && latest ? `${earliest.quarter}/${latest.quarter}` : undefined,
    variableMeasured: [
      "BTC Production", "BTC Treasury", "Hashrate (EH/s)",
      "Electricity Price", "Cash Cost per BTC", "Energy Cost per BTC",
      "Power Capacity (MW)", "Fleet Efficiency (J/TH)",
    ],
    locale,
  });

  const breadcrumbData = breadcrumbSchema([
    { name: locale === "zh" ? "首页" : "Home",      url: `/${locale}` },
    { name: locale === "zh" ? "公司" : "Companies", url: `/${locale}` },
    { name: `${company} (${tk})`,                    url: `/${locale}/company/${tk}` },
  ]);

  return (
    <>
      <JsonLd data={orgData} />
      <JsonLd data={datasetData} />
      <JsonLd data={breadcrumbData} />

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
