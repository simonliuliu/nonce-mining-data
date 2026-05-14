import { getQuarterlyData, getAllCompanyProfiles } from "@/lib/notion";
import { getQuarters, enrichRows, getCompanies } from "@/lib/helpers";
import HomeClient from "./HomeClient";
import Link from "next/link";

export const revalidate = 3600;

export default async function HomePage() {
  const data = await getQuarterlyData();
  const quarters = getQuarters(data);
  const latestQ = quarters[quarters.length - 1] || "";
  const profiles = await getAllCompanyProfiles().catch(() => []);
  const companies = getCompanies(data);

  const enrichedByQuarter = {};
  for (const q of quarters) {
    enrichedByQuarter[q] = enrichRows(data, q);
  }

  return (
    <>
      <section style={{ margin: "0 0 32px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Bitcoin Mining Company Data & Analytics
        </h1>
        <p style={{ fontSize: 15, color: "var(--text2)", maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Track the financial and operational performance of {companies.length} public Bitcoin mining companies.
          Production, hashrate, costs — sourced from SEC filings.
        </p>
      </section>

      <HomeClient
        enrichedByQuarter={enrichedByQuarter}
        quarters={quarters}
        latestQ={latestQ}
      />

      {/* Explore by metric */}
      <div style={{ marginTop: 48, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "var(--text2)" }}>
          Explore by metric
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {[
            { href: "/rankings/production", label: "BTC Production", desc: "Who mines the most?" },
            { href: "/rankings/hashrate",   label: "Hashrate",       desc: "Computing power" },
            { href: "/rankings/holdings",   label: "BTC Holdings",   desc: "Bitcoin treasuries" },
            { href: "/rankings/cost",       label: "Production Cost", desc: "Cheapest producers" },
            { href: "/rankings/revenue",    label: "Revenue",        desc: "Top line comparison" },
            { href: "/rankings/efficiency", label: "Fleet Efficiency",desc: "Energy per terahash" },
          ].map(m => (
            /* Use text-block class which already has border + hover handled cleanly */
            <Link key={m.href} href={m.href} className="text-block" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>{m.label} →</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{m.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Company profiles */}
      {profiles.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: "var(--text2)" }}>
            Company profiles
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
            {profiles.map(p => (
              <Link key={p.ticker} href={`/company/${p.ticker}`} className="text-block" style={{ textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>
                  {p.company} <span style={{ color: "var(--text3)", fontWeight: 400 }}>({p.ticker})</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text3)", lineHeight: 1.55 }}>
                  {p.description?.slice(0, 100)}{p.description?.length > 100 ? "..." : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
