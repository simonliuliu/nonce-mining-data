import { getQuarterlyData, getCompanyProfile, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { TICKER_COLORS, buildCompanyTimeseries } from "@/lib/helpers";
import { getT } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema, organizationSchema, canonicalUrl } from "@/lib/seo";
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

// ─── 公司详情页 SEO metadata ─────────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.company.title / seo.company.desc
// 模板使用 {company} {ticker} 占位符，运行时替换
//
// 关键修复：
//   ❌ 旧版：description 是英文硬编码，中文页面也显示英文（P0 bug）
//   ✅ 新版：从 i18n 取文案，自动随 locale 切换中英

export async function generateMetadata({ params }) {
  const { ticker, locale } = await params;
  const tk = ticker?.toUpperCase();
  if (!tk) return { title: "Not Found" };

  const { company } = await resolveCompany(tk);
  if (!company) return { title: "Not Found" };

  const t = getT(locale);
  const path = `/${locale}/company/${tk}`;

  // 使用 i18n 模板，{company} {ticker} 会被替换
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

  // ─── 结构化数据 ───────────────────────────────────────────
  // 两个 schema 注入页面：
  //   1. Organization：让谷歌知道这是某家公司的页面
  //   2. BreadcrumbList：让搜索结果显示 "HashResearch › 公司 › MARA" 导航
  const orgData = organizationSchema({
    name:         profile?.company || company,
    ticker:       tk,
    headquarters: profile?.headquarters,
    website:      profile?.website,
    description:  profile?.description,
  });

  const breadcrumbData = breadcrumbSchema([
    { name: locale === "zh" ? "首页" : "Home",      url: `/${locale}` },
    { name: locale === "zh" ? "公司" : "Companies", url: `/${locale}` },
    { name: `${company} (${tk})`,                    url: `/${locale}/company/${tk}` },
  ]);

  return (
    <>
      <JsonLd data={orgData} />
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
