import { getQuarterlyData } from "@/lib/notion";
import { TICKER_COLORS, getCompanies } from "@/lib/helpers";
import { getT, LOCALES } from "@/lib/i18n";
import { JsonLd, breadcrumbSchema } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

function pairToTickers(pair) {
  const parts = pair.toLowerCase().split("-vs-");
  if (parts.length !== 2) return null;
  return [parts[0].toUpperCase(), parts[1].toUpperCase()];
}

const fmt    = v => v==null?"—":typeof v==="number"?v.toLocaleString():v;
const fmtD   = v => v==null?"—":`$${v.toLocaleString()}`;
const fmtEh  = v => v==null?"—":`${v} EH/s`;
const fmtMW  = v => v==null?"—":`${fmt(v)} MW`;
const fmtJTH = v => v==null?"—":`${v} J/TH`;
const fmtKwh = v => v==null?"—":`$${v}/kWh`;

function winner(a, b, lowerBetter=false) {
  if (a==null&&b==null) return null;
  if (a==null) return "b"; if (b==null) return "a";
  if (lowerBetter) return a<b?"a":a>b?"b":null;
  return a>b?"a":a<b?"b":null;
}

// ─── Compare 详情页 SEO metadata ─────────────────────────────
//
// 文案改动入口：lib/i18n.js → seo.comparePair.title / desc
// 模板用 {a} {b} 占位符，运行时替换为具体公司名（如 MARA, CLSK）
//
// 关键修复：
//   ❌ 旧版：title 永远是英文 "X vs Y — Bitcoin Mining Comparison"
//   ✅ 新版：双语 title + desc，canonical + alternates 全套

export async function generateMetadata({ params }) {
  const { locale, pair } = await params;
  const tickers = pairToTickers(pair);
  if (!tickers) return { title: "Not Found" };
  const [a, b] = tickers;

  const t = getT(locale);
  const title = t("seo.comparePair.title", { a, b });
  const desc  = t("seo.comparePair.desc",  { a, b });
  const path  = `/${locale}/compare/${pair.toLowerCase()}`;

  return {
    title,
    description: desc,

    alternates: {
      canonical: path,
      languages: {
        en: `/en/compare/${pair.toLowerCase()}`,
        zh: `/zh/compare/${pair.toLowerCase()}`,
        "x-default": `/en/compare/${pair.toLowerCase()}`,
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

export default async function ComparePage({ params }) {
  const { locale, pair } = await params;
  const tickers = pairToTickers(pair);
  if (!tickers) notFound();
  const [tkA, tkB] = tickers;
  const t = getT(locale);

  const allData = await getQuarterlyData();
  if (!allData.length) notFound();

  const companyMap = new Map();
  for (const r of allData) {
    if (!r.ticker||!r.company) continue;
    if (!companyMap.has(r.ticker)) companyMap.set(r.ticker, { ticker:r.ticker, company:r.company });
  }

  const infoA = companyMap.get(tkA);
  const infoB = companyMap.get(tkB);
  if (!infoA||!infoB) notFound();

  const rowsA   = allData.filter(r=>r.ticker===tkA).sort((a,b)=>b.quarter.localeCompare(a.quarter));
  const rowsB   = allData.filter(r=>r.ticker===tkB).sort((a,b)=>b.quarter.localeCompare(a.quarter));
  const latestA = rowsA[0], latestB = rowsB[0];
  const latestQ = latestA?.quarter||latestB?.quarter||"";

  const allCompanies = Array.from(companyMap.values());
  const otherPairs = [];
  for (let i=0;i<allCompanies.length;i++) for (let j=i+1;j<allCompanies.length;j++) {
    const ca=allCompanies[i], cb=allCompanies[j];
    if ((ca.ticker===tkA&&cb.ticker===tkB)||(ca.ticker===tkB&&cb.ticker===tkA)) continue;
    otherPairs.push([ca, cb]);
  }

  const groups = [
    { label: locale==="zh"?"产量指标":"Production", rows:[
      { label:`BTC mined (${latestQ})`,    valA:latestA?.btc_production,    valB:latestB?.btc_production,    render:fmt,   lowerBetter:false },
      { label:`BTC holdings (${latestQ})`, valA:latestA?.btc_holdings,      valB:latestB?.btc_holdings,      render:fmt,   lowerBetter:false },
      { label:`Hashrate (${latestQ})`,     valA:latestA?.hashrate_ehs,      valB:latestB?.hashrate_ehs,      render:fmtEh, lowerBetter:false },
    ]},
    { label: locale==="zh"?"成本与效率":"Cost & Efficiency", rows:[
      { label:`Cash cost / BTC (${latestQ})`,   valA:latestA?.cash_cost_per_btc,   valB:latestB?.cash_cost_per_btc,   render:fmtD,   lowerBetter:true },
      { label:`Energy cost / BTC (${latestQ})`, valA:latestA?.energy_cost_per_btc, valB:latestB?.energy_cost_per_btc, render:fmtD,   lowerBetter:true },
      { label:`Electricity price (${latestQ})`, valA:latestA?.electricity_price,   valB:latestB?.electricity_price,   render:fmtKwh, lowerBetter:true },
      { label:`Fleet efficiency (${latestQ})`,  valA:latestA?.efficiency_jth,      valB:latestB?.efficiency_jth,      render:fmtJTH, lowerBetter:true },
      { label:`Power capacity (${latestQ})`,    valA:latestA?.power_capacity_mw,   valB:latestB?.power_capacity_mw,   render:fmtMW,  lowerBetter:false },
    ]},
  ];

  const scores = { a:0, b:0 };
  for (const g of groups) for (const row of g.rows) {
    const w = winner(row.valA, row.valB, row.lowerBetter);
    if (w==="a") scores.a++; if (w==="b") scores.b++;
  }

  // ─── 面包屑结构化数据 ───────────────────────────────────
  const breadcrumbData = breadcrumbSchema([
    { name: locale === "zh" ? "首页" : "Home",  url: `/${locale}` },
    { name: t("nav.compare"),                   url: `/${locale}/compare` },
    { name: `${tkA} vs ${tkB}`,                 url: `/${locale}/compare/${pair.toLowerCase()}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbData} />

      <nav style={{ fontSize:12, color:"var(--text3)", marginBottom:20 }}>
        <Link href={`/${locale}`}>{locale==="zh"?"首页":"Home"}</Link>
        <span style={{ margin:"0 6px" }}>›</span>
        <Link href={`/${locale}/compare`}>{t("nav.compare")}</Link>
        <span style={{ margin:"0 6px" }}>›</span>
        <span>{tkA} vs {tkB}</span>
      </nav>

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:6, letterSpacing:"-0.02em" }}>
          {infoA.company} vs {infoB.company}
        </h1>
        <p style={{ color:"var(--text2)", fontSize:14, lineHeight:1.7, margin:0 }}>
          {locale==="zh" ? `并排对比两家公司的数据。数据来源于 SEC 财报，最新季度：${latestQ}。`
            : `Side-by-side comparison across key metrics. Data from SEC filings. Latest quarter: ${latestQ}.`}
        </p>
      </div>

      {/* Score cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:12, marginBottom:28, alignItems:"center" }}>
        {[{ tk:tkA, name:infoA.company, score:scores.a, wins:scores.a>=scores.b },
          { tk:tkB, name:infoB.company, score:scores.b, wins:scores.b>scores.a }].map((c, idx) => (
          <div key={c.tk} style={{ background:"var(--bg2)", border:`1px solid ${c.wins?"var(--orange)":"var(--border)"}`, borderRadius:12, padding:"20px 24px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:700, fontFamily:"DM Mono, monospace", marginBottom:4 }}>{c.tk}</div>
            <div style={{ fontSize:12, color:"var(--text3)", marginBottom:12 }}>{c.name}</div>
            <div style={{ fontSize:28, fontWeight:700 }}>{c.score}</div>
            <div style={{ fontSize:11, color:"var(--text3)" }}>{t("compare.metricsAhead")}</div>
            <Link href={`/${locale}/company/${c.tk}`} style={{ display:"block", marginTop:10, fontSize:12, color:"var(--text3)" }}>
              {t("compare.viewProfile")}
            </Link>
          </div>
        )).reduce((acc, el, i) => i===0 ? [el] : [...acc, <div key="vs" style={{ textAlign:"center", color:"var(--text3)", fontSize:14, fontWeight:600 }}>VS</div>, el], [])}
      </div>

      {/* Comparison tables */}
      {groups.map(group => (
        <div key={group.label} style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
            {group.label}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("compare.metric")}</th>
                  <th className="r">{tkA}</th>
                  <th className="r">{tkB}</th>
                  <th>{t("compare.edge")}</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, i) => {
                  const w = winner(row.valA, row.valB, row.lowerBetter);
                  return (
                    <tr key={i}>
                      <td style={{ fontSize:13 }}>{row.label}</td>
                      <td className="r m" style={{ fontWeight:w==="a"?600:400, color:w==="a"?"var(--text)":"var(--text2)" }}>
                        {row.render(row.valA)}{w==="a"&&<span style={{ marginLeft:6, fontSize:10, color:"var(--orange)" }}>▲</span>}
                      </td>
                      <td className="r m" style={{ fontWeight:w==="b"?600:400, color:w==="b"?"var(--text)":"var(--text2)" }}>
                        {row.render(row.valB)}{w==="b"&&<span style={{ marginLeft:6, fontSize:10, color:"var(--orange)" }}>▲</span>}
                      </td>
                      <td style={{ fontSize:12, color:w?"var(--text)":"var(--text3)", fontWeight:w?500:400 }}>
                        {w==="a"?tkA:w==="b"?tkB:"—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {otherPairs.length > 0 && (
        <div style={{ marginTop:20 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
            {t("compare.compareOthers")}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {otherPairs.slice(0,12).map(([ca, cb]) => (
              <Link key={`${ca.ticker}-${cb.ticker}`}
                href={`/${locale}/compare/${ca.ticker.toLowerCase()}-vs-${cb.ticker.toLowerCase()}`}
                className="tag">
                {ca.ticker} vs {cb.ticker}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
