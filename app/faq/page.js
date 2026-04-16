// app/faq/page.js
// Fully server-rendered FAQ page — answers must be in SSR HTML for Google
// FAQPage schema for Featured Snippets

import Link from "next/link";
import { buildMetadata, faqPageSchema, breadcrumbSchema, JsonLd } from "@/lib/seo";
import { getFAQs } from "@/lib/notion";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "FAQ — Bitcoin Mining Data & Metrics Explained",
  description: "Answers to common questions about Bitcoin mining metrics, data sources, and how to interpret mining company performance. Production, hashrate, cost, and more.",
  path: "/faq",
});

// ─── Hardcoded fallback FAQs (always rendered in HTML — not dependent on Notion) ──

const FALLBACK_FAQS = [
  {
    category: "Data & Methodology",
    question: "Where does your mining data come from?",
    answer: "All data is sourced from official SEC filings (10-K annual reports, 10-Q quarterly reports), official company press releases, and investor relations disclosures. We do not use unofficial estimates without clearly labeling them as such.",
  },
  {
    category: "Data & Methodology",
    question: "How often is the data updated?",
    answer: "Quarterly data is updated within 2 weeks of each company's SEC 10-Q or 10-K filing date. Monthly production data (where companies publish it) is typically updated within 1 week of the press release. The last update date is shown on each data page.",
  },
  {
    category: "Data & Methodology",
    question: "What is the difference between 'original data' and 'estimated data'?",
    answer: "Original data means the figure appears verbatim in an official SEC filing or press release. Estimated data means we calculated or approximated the figure from other disclosed information. All estimated figures are clearly labeled on data pages with their calculation basis.",
  },
  {
    category: "Metrics",
    question: "What is the difference between BTC Production and BTC Holdings?",
    answer: "BTC Production is the number of new bitcoins a company mines during a period (a flow metric). BTC Holdings is the total bitcoin on the company's balance sheet at period end (a stock metric). Holdings can increase through both mining and open-market purchases, and can decrease through sales.",
  },
  {
    category: "Metrics",
    question: "What is the difference between cash cost per BTC and all-in cost per BTC?",
    answer: "Cash cost per BTC includes only direct cash expenses to mine one bitcoin: primarily electricity and direct site operating costs. All-in cost per BTC adds non-cash charges like depreciation of mining equipment, plus G&A overhead and stock-based compensation. All-in cost is always higher and represents the true economic cost of mining.",
  },
  {
    category: "Metrics",
    question: "What does J/TH (fleet efficiency) mean?",
    answer: "J/TH stands for joules per terahash — the amount of electrical energy required to perform one terahash of computing. It measures how efficiently a mining fleet converts electricity into computing power. Lower J/TH is better: a more efficient fleet produces more bitcoin per dollar of electricity spent.",
  },
  {
    category: "Metrics",
    question: "Why does net income fluctuate so much for mining companies?",
    answer: "Mining company net income is heavily affected by non-cash items: (1) fair value adjustments on BTC holdings — unrealized gains or losses on held bitcoin flow through the income statement under current US GAAP rules; (2) depreciation of mining equipment; (3) impairment charges. A company can have growing revenue but report a net loss due to unrealized BTC price movements on their holdings.",
  },
  {
    category: "Metrics",
    question: "What is hashrate and why does it matter?",
    answer: "Hashrate measures the total computing power a mining company operates, in exahashes per second (EH/s). It determines the company's expected share of total Bitcoin network rewards. Higher hashrate = more expected BTC production. It's a key forward-looking indicator: hashrate growth today translates to higher production in future periods.",
  },
  {
    category: "Interpretation",
    question: "How should I compare production across different companies?",
    answer: "Compare production in context: (1) relative to hashrate (BTC per EH/s shows efficiency); (2) relative to cost (cash cost per BTC shows profitability); (3) relative to historical periods (QoQ and YoY growth shows trajectory). A company mining 3,000 BTC at $20,000 cash cost is more attractive than one mining 5,000 BTC at $45,000 cash cost at most bitcoin price levels.",
  },
  {
    category: "Interpretation",
    question: "Why does production sometimes drop even when a company expands hashrate?",
    answer: "Bitcoin network difficulty adjusts approximately every two weeks based on total global hashrate. If the whole industry grows hashrate faster than any individual company, that company's share of block rewards declines. Additionally, post-halving quarters see production drop ~50% unless hashrate grows proportionally.",
  },
  {
    category: "Companies",
    question: "Which public Bitcoin mining companies does this site track?",
    answer: "We currently track Marathon Digital Holdings (MARA), CleanSpark (CLSK), Bitdeer Technologies (BTDR), and Cango Inc. (CANG). We plan to expand coverage to additional companies as data becomes available.",
  },
  {
    category: "Companies",
    question: "Why do different companies report different metrics?",
    answer: "There is no universal standard for what mining companies must disclose. Some report monthly production updates; others only in quarterly filings. Cost definitions vary (some include depreciation in 'cash cost', others don't). We note these definitional differences in our methodology section and on each company's data page.",
  },
];

// Group FAQs by category
function groupByCategory(faqs) {
  const groups = {};
  for (const faq of faqs) {
    const cat = faq.category || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(faq);
  }
  return groups;
}

export default async function FaqPage() {
  // Try to load additional FAQs from Notion (supplement, not replace, hardcoded)
  let notionFaqs = [];
  try {
    notionFaqs = await getFAQs();
  } catch (e) {
    // Silently fallback — hardcoded FAQs always render
  }

  // Merge: hardcoded first, then any Notion FAQs not already covered
  const allFaqs = [...FALLBACK_FAQS, ...notionFaqs];

  // Schema — only use clean text (strip HTML from Notion answers)
  const schemaFaqs = allFaqs.map(f => ({
    question: f.question,
    answer: (f.answer_html
      ? f.answer_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : f.answer) || "",
  })).filter(f => f.question && f.answer);

  const crumbSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ]);

  const groups = groupByCategory(allFaqs);

  return (
    <>
      <JsonLd data={faqPageSchema(schemaFaqs)} />
      <JsonLd data={crumbSchema} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
        <Link href="/">Home</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>FAQ</span>
      </nav>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Frequently Asked Questions</h1>
      <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 720, lineHeight: 1.7, marginBottom: 28 }}>
        Common questions about Bitcoin mining metrics, our data sources, and how to interpret miner performance data.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 220px", gap: 24, alignItems: "start" }}>
        {/* FAQ content — all rendered in SSR HTML */}
        <div>
          {Object.entries(groups).map(([category, faqs]) => (
            <section key={category} style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
                {category}
              </h2>
              <div style={{ display: "grid", gap: 12 }}>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                    {/* Q rendered as h3 for semantic structure */}
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{faq.question}</h3>
                    {/* A always in SSR HTML — either plain text or Notion HTML */}
                    {faq.answer_html
                      ? <div className="prose" style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: faq.answer_html }} />
                      : <p style={{ margin: 0, fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>{faq.answer}</p>
                    }
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Quick Links</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { href: "/methodology", label: "Data Methodology" },
                { href: "/metrics/btc-production", label: "BTC Production" },
                { href: "/metrics/hashrate", label: "Hashrate" },
                { href: "/metrics/cash-cost-per-btc", label: "Cash Cost per BTC" },
                { href: "/metrics/fleet-efficiency", label: "Fleet Efficiency" },
                { href: "/rankings/production", label: "Production Rankings" },
                { href: "/rankings/cost", label: "Cost Rankings" },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ fontSize: 13, color: "var(--orange)" }}>
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Data Sources</div>
            <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.65, margin: 0 }}>
              All data is sourced from SEC 10-Q and 10-K filings, official IR press releases, and company disclosures.
            </p>
          </div>
        </aside>
      </div>

      <div className="cta-banner" style={{ marginTop: 28 }}>
        <h3>Still have questions?</h3>
        <p>Nonce.app provides live mining analytics and real-time data</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}
