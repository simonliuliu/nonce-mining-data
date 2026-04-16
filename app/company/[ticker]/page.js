import { getQuarterlyData, getCompanyProfile, getPublishedArticles, blocksToHtml } from "@/lib/notion";
import { TICKERS, COLORS, buildCompanyTimeseries } from "@/lib/helpers";
import CompanyTabs from "./CompanyTabs";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const T2C = {};
Object.entries(TICKERS).forEach(([k, v]) => (T2C[v] = k));

export async function generateMetadata({ params }) {
  const { ticker } = await params;
  const company = T2C[ticker?.toUpperCase()];
  if (!company) return { title: "Not Found" };
  return {
    title: `${company} (${ticker.toUpperCase()}) — BTC Production, Hashrate, Revenue — Nonce Mining Data`,
    description: `Detailed financial and operational data for ${company} (${ticker.toUpperCase()}). BTC production, hashrate, costs, revenue. Sourced from SEC filings.`,
  };
}

export default async function CompanyPage({ params }) {
  const { ticker } = await params;
  const tk = ticker?.toUpperCase();
  const company = T2C[tk];
  if (!company) notFound();

  const allData = await getQuarterlyData();
  const data = allData
    .filter(r => r.company === company)
    .sort((a, b) => a.quarter.localeCompare(b.quarter));
  const latest = data[data.length - 1];
  const color = COLORS[company];
  const ts = buildCompanyTimeseries(allData, company);

  let profile = null;
  try { profile = await getCompanyProfile(tk); } catch (e) {}
  const profileHtml = profile?.blocks ? blocksToHtml(profile.blocks) : "";
  const parts = profileHtml.split("<hr/>");
  const methodologyHtml = parts[0] || "";
  const faqHtml = parts[1] || "";

  const articles = await getPublishedArticles();
  const related = articles.filter(a => a.related_company?.toUpperCase().includes(tk));
  const peers = profile?.peers?.split(",").map(p => p.trim()).filter(p => p && p !== tk) || [];

  return (
    <>
      <Link href="/" style={{ fontSize: 13, color: "var(--text2)" }}>← All companies</Link>

      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0 0" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, color, fontFamily: "monospace", flexShrink: 0,
        }}>
          {tk}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{profile?.company || company}</h1>
          <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            <span>{tk} · BTC Miner</span>
            {profile?.headquarters && <span>📍 {profile.headquarters}</span>}
            {profile?.website && <a href={profile.website} target="_blank" rel="noopener" style={{ color }}>Website ↗</a>}
          </div>
        </div>
      </div>

      {/* CompanyTabs is a Client Component — only pass serializable data, NO functions */}
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
      />

      <div className="cta-banner" style={{ marginTop: 32 }}>
        <h3>Track {profile?.company || company} in real-time</h3>
        <p>Live production data, cost tracking, and alerts with Nonce.app</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
