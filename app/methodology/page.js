import Link from "next/link";

export const metadata = {
  title: "Methodology — How We Collect and Standardize Mining Data — Nonce",
  description: "Our data collection methodology, source hierarchy, standardization rules, and how we handle estimated vs official figures.",
};

export default function MethodologyPage() {
  return (
    <>
      <Link href="/" style={{ fontSize: 13, color: "var(--text2)" }}>← Home</Link>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "16px 0 8px" }}>Methodology</h1>
      <p className="section-sub">How we collect, standardize, and maintain Bitcoin mining company data</p>

      <div className="prose">
        <h2>Data coverage</h2>
        <p>We track public Bitcoin mining companies that are listed on major stock exchanges (NASDAQ, NYSE) and file regular reports with the SEC. Our quarterly database currently covers companies from Q1 2023 onward. Our annual database covers fiscal year 2025 data for 15+ companies.</p>

        <h2>Source hierarchy</h2>
        <p>We prioritize data sources in this order:</p>
        <li><strong>Primary:</strong> SEC filings — 10-K (annual), 10-Q (quarterly), 6-K and 20-F (foreign issuers)</li>
        <li><strong>Secondary:</strong> Official investor relations materials — earnings releases, presentations, shareholder letters</li>
        <li><strong>Tertiary:</strong> Official monthly operational updates published by companies</li>
        <p>We do not use unverified third-party estimates, analyst models, or social media as data sources.</p>

        <h2>Fiscal year normalization</h2>
        <p>Most mining companies use a calendar fiscal year (January–December). Notable exception: CleanSpark uses an October–September fiscal year. We map all data to calendar quarters for cross-company comparability. Where a company's fiscal quarters don't align with calendar quarters, we note this in the company's methodology section.</p>

        <h2>Original vs estimated data</h2>
        <p>Each data point carries a status indicator:</p>
        <li><strong>原数据 (Original):</strong> Directly sourced from official filings with no modification</li>
        <li><strong>部分推算 (Partially estimated):</strong> Derived from official sources but requires calculation (e.g., quarterly figure derived from annual total minus other quarters)</li>
        <li><strong>推算为主 (Mostly estimated):</strong> Significant estimation involved — interpret with caution</li>

        <h2>Cost metric definitions</h2>
        <p><strong>Cash Cost per BTC:</strong> Direct operating cost to mine one Bitcoin. This typically includes electricity and site operations costs. Important caveat: there is no industry-standard definition. Each company reports slightly different cost components. We use whatever the company discloses as their most direct cash-based cost measure.</p>
        <p><strong>All-in Cost per BTC:</strong> Total cost including depreciation, SBC, and overhead. Very few companies report this figure directly; where we estimate it, we mark it clearly.</p>

        <h2>Handling missing data</h2>
        <p>When a company does not disclose a particular metric, we leave it blank ("—") rather than estimate it. We never fabricate data points. If a metric appears for some quarters but not others, it means the company changed its disclosure practices.</p>

        <h2>Update schedule</h2>
        <p>Data is updated within 1–2 weeks of official SEC filings being published. Quarterly data (10-Q/6-K) is typically available 30–45 days after quarter end. Annual data (10-K/20-F) is typically available 60–90 days after fiscal year end.</p>

        <h2>Currency and units</h2>
        <li><strong>Revenue/profit figures:</strong> USD, expressed in $100M (hundreds of millions)</li>
        <li><strong>Hashrate:</strong> EH/s (exahashes per second)</li>
        <li><strong>Fleet efficiency:</strong> J/TH (joules per terahash)</li>
        <li><strong>Power capacity:</strong> MW (megawatts)</li>
        <li><strong>Electricity price:</strong> $/kWh</li>

        <h2>Corrections and feedback</h2>
        <p>If you identify an error in our data, please contact us. Every data point links to its original SEC filing source, so discrepancies can be verified against the primary document.</p>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href="/faq" className="tag" style={{ padding: "6px 14px" }}>FAQ →</Link>
        <Link href="/rankings/production" className="tag" style={{ padding: "6px 14px" }}>View Rankings →</Link>
      </div>
    </>
  );
}
