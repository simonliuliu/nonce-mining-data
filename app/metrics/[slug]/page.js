// app/metrics/[slug]/page.js
// Programmatic metric glossary pages — SSR, SEO-rich, schema-annotated
// These pages target long-tail queries like "what is BTC production", "hashrate mining meaning"

import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, breadcrumbSchema, faqPageSchema, JsonLd } from "@/lib/seo";
import MetricsNavStrip from "@/app/metrics/MetricsNavStrip";

export const revalidate = 86400; // 24h — content changes rarely

// ─── Metric content database ──────────────────────────────────────────────────
// All content is hardcoded (not from Notion) because:
// 1. It's definitional — changes at most a few times a year
// 2. It MUST be in SSR HTML for Google to index
// 3. It's company-agnostic and standardized

const METRICS = {
  "btc-production": {
    slug: "btc-production",
    name: "BTC Production",
    unit: "BTC",
    rankingUrl: "/rankings/production",
    rankingLabel: "BTC Production Rankings",
    relatedSlugs: ["hashrate", "btc-holdings", "cash-cost-per-btc"],
    title: "What is BTC Production? Bitcoin Mining Output Explained",
    description:
      "BTC Production is the total amount of Bitcoin self-mined by a company during a reporting period. Learn how it's measured, why it matters for investors, and how we define it on this site.",
    summary:
      "BTC Production measures how many new bitcoins a mining company earns by operating mining hardware during a specific period. It is the most direct measure of a miner's operational output.",
    definition:
      "BTC Production (also called BTC mined or self-mined bitcoin) refers to the total Bitcoin earned by a company through the process of mining — i.e., solving cryptographic puzzles to validate transactions and earn block rewards. It does not include Bitcoin purchased on the open market.",
    why_it_matters: [
      "It is the primary revenue driver for pure-play Bitcoin miners — more BTC mined means more potential revenue at any given bitcoin price.",
      "It reflects the company's operational scale: a larger fleet of more efficient machines produces more BTC.",
      "It enables investors to calculate implied mining revenue and compare cost efficiency across companies.",
      "Quarter-over-quarter changes reveal whether a company is scaling up, maintaining, or losing mining capacity.",
    ],
    how_to_interpret: [
      "Higher is better, but only in context. A company mining 10,000 BTC with $200M in costs may be less efficient than one mining 5,000 BTC with $60M in costs.",
      "Compare production relative to hashrate (BTC per EH/s) to assess efficiency, not just absolute output.",
      "Watch for post-halving quarters — bitcoin block rewards halve approximately every four years, so production naturally drops ~50% unless hashrate grows to compensate.",
      "Monthly production reports (press releases) precede quarterly SEC filings. Use monthly data for more timely signals.",
    ],
    misconceptions: [
      "BTC Production ≠ BTC Holdings. Some companies sell mined BTC immediately; others accumulate. Check BTC Holdings separately.",
      "BTC Production ≠ Total BTC acquired. Companies like MARA also buy BTC on the open market. Production only counts self-mined coins.",
      "Higher hashrate does not always mean more BTC production. Network difficulty adjusts, and fleet efficiency (J/TH) matters as much as raw hashrate.",
    ],
    our_definition:
      "On this site, BTC Production is taken directly from SEC 10-Q and 10-K filings under 'bitcoin mined' or 'bitcoin production'. For quarters where the exact filing figure is unavailable, we use the company's official monthly mining update press releases. Estimated figures are clearly labeled.",
    faqs: [
      {
        question: "Why does BTC production fluctuate quarter to quarter?",
        answer: "Production varies due to changes in network difficulty (which adjusts to total global hashrate), changes in the company's own operational hashrate, planned maintenance downtime, and the halving events that cut block rewards in half approximately every four years.",
      },
      {
        question: "What is a good BTC production figure for a public miner?",
        answer: "Scale varies widely. As of 2025, the largest US public miners produce between 3,000 and 15,000+ BTC per quarter. More important than the absolute number is production relative to installed hashrate (BTC per EH/s) and relative to cash cost per BTC.",
      },
      {
        question: "How does halving affect BTC production?",
        answer: "Bitcoin halvings (approximately every 210,000 blocks, or ~4 years) cut the block reward in half. Unless miners expand their hashrate proportionally, their BTC production will drop ~50% in the first post-halving quarter. The most recent halving occurred in April 2024.",
      },
    ],
  },

  "hashrate": {
    slug: "hashrate",
    name: "Hashrate",
    unit: "EH/s",
    rankingUrl: "/rankings/hashrate",
    rankingLabel: "Hashrate Rankings",
    relatedSlugs: ["btc-production", "fleet-efficiency", "power-capacity"],
    title: "What is Hashrate? Bitcoin Mining Computing Power Explained",
    description:
      "Hashrate measures a Bitcoin miner's total computing power in exahashes per second (EH/s). Learn what it means, why it matters, and how public miners report it.",
    summary:
      "Hashrate is the total computational power a mining company operates, measured in exahashes per second (EH/s). It determines how many block-solving attempts a miner can make per second.",
    definition:
      "Hashrate (or hash rate) is the speed at which a mining machine — or a company's entire fleet — can perform SHA-256 cryptographic hash calculations. One exahash per second (1 EH/s) = 10^18 hashes per second. The higher a miner's hashrate relative to the total network hashrate, the greater their expected share of block rewards.",
    why_it_matters: [
      "Hashrate is a leading indicator of future BTC production. More hashrate (relative to the network) = more expected mining rewards.",
      "It reflects capital deployment: buying and installing machines translates directly into hashrate growth.",
      "Investors track hashrate to project revenue: hashrate × (network share) × block reward × BTC price = estimated mining revenue.",
      "Hashrate growth trends reveal competitive positioning — which miners are gaining or losing market share.",
    ],
    how_to_interpret: [
      "Look at both absolute hashrate and market share (company hashrate ÷ total network hashrate).",
      "Rapid hashrate growth is bullish operationally but may dilute earnings if BTC price doesn't keep up.",
      "Compare hashrate to power capacity (MW) to check utilization. A company with 500 MW and 10 EH/s is under-utilizing if newer machines should yield 3+ EH/s per 100 MW.",
      "Self-reported hashrate (from press releases) may differ from 'deployed' vs 'operational' hashrate — check footnotes.",
    ],
    misconceptions: [
      "More hashrate does not automatically mean more profit. Profitability depends on BTC price, difficulty, and cost per kilowatt-hour.",
      "Companies report 'installed' or 'deployed' hashrate, which may differ from actual operational hashrate at any given time.",
      "Hashrate is not fixed — it fluctuates with machine uptime, temperature, firmware, and power availability.",
    ],
    our_definition:
      "We use the end-of-period operational hashrate as reported in SEC quarterly filings or official press releases. Where only 'installed capacity' is disclosed, we note the distinction. All figures are in EH/s (exahashes per second).",
    faqs: [
      {
        question: "What is a typical hashrate for a public US Bitcoin miner?",
        answer: "As of Q4 2025, the largest US public miners operate between 20 EH/s and 70+ EH/s. The total Bitcoin network hashrate is approximately 700–800 EH/s, so top miners represent roughly 5–10% of global hashrate.",
      },
      {
        question: "What is the difference between TH/s, PH/s, and EH/s?",
        answer: "These are units of scale: 1 EH/s = 1,000 PH/s = 1,000,000 TH/s. Individual mining rigs operate in TH/s (e.g., 120 TH/s), while large companies aggregate to EH/s.",
      },
      {
        question: "How does network difficulty affect a miner's hashrate?",
        answer: "Network difficulty doesn't change a miner's physical hashrate, but it does affect how much bitcoin they earn per unit of hashrate. When global hashrate rises (more competition), difficulty increases, reducing each miner's expected rewards per EH/s.",
      },
    ],
  },

  "btc-holdings": {
    slug: "btc-holdings",
    name: "BTC Holdings",
    unit: "BTC",
    rankingUrl: "/rankings/holdings",
    rankingLabel: "BTC Holdings Rankings",
    relatedSlugs: ["btc-production", "cash-cost-per-btc", "revenue"],
    title: "What is BTC Holdings? Bitcoin Treasury Strategy Explained",
    description:
      "BTC Holdings is the total amount of Bitcoin a public mining company holds on its balance sheet. Learn what it signals about treasury strategy and risk exposure.",
    summary:
      "BTC Holdings is the total Bitcoin a mining company holds on its balance sheet at period end, including both self-mined and purchased bitcoin. It reflects the company's bitcoin treasury strategy.",
    definition:
      "BTC Holdings (or Bitcoin holdings) is the total number of bitcoin held by a public company at the end of a reporting period. It includes bitcoin earned through mining and bitcoin purchased on the open market. It is a balance sheet item, not a flow metric.",
    why_it_matters: [
      "Large BTC holdings create significant balance sheet exposure to bitcoin price movements — a price decline directly impacts net asset value.",
      "The 'hold-to-production ratio' (holdings ÷ quarterly production) shows how aggressively a company is accumulating vs. selling its mined coins.",
      "Companies with large BTC treasuries are effectively leveraged long bitcoin — their stock price correlates strongly with BTC price.",
      "Post-2023, BTC holdings must be marked to fair value under US GAAP, creating income statement volatility.",
    ],
    how_to_interpret: [
      "High holdings relative to production suggests a 'HODL' strategy. Low holdings suggests selling most mined BTC for operational cash flow.",
      "Rising holdings quarter-over-quarter means the company is accumulating faster than selling.",
      "Compare holdings to total market cap to assess BTC treasury as a fraction of company value.",
    ],
    misconceptions: [
      "BTC Holdings ≠ BTC mined that quarter. Holdings accumulates over many periods; production is a periodic flow.",
      "Large holdings can be a risk indicator, not just a positive. A price crash of 50% destroys 50% of the holdings' dollar value.",
    ],
    our_definition:
      "We take BTC Holdings from SEC balance sheet disclosures at period end. Figures represent total bitcoin on the balance sheet regardless of acquisition method. We do not separately track self-mined vs. purchased portions unless the company explicitly discloses this split.",
    faqs: [
      {
        question: "Why do some miners sell all their BTC while others hold it?",
        answer: "It depends on business strategy and balance sheet philosophy. Some miners (like CleanSpark historically) sell most mined BTC to maintain operational cash flow and minimize balance sheet risk. Others (like MARA) pursue a BTC accumulation strategy, treating their treasury as a core asset.",
      },
      {
        question: "How does fair value accounting affect BTC holdings reporting?",
        answer: "Under ASC 820 (US GAAP), public companies must mark bitcoin holdings to market value at each reporting date. This creates unrealized gains/losses that flow through the income statement, causing significant net income volatility even when operations are stable.",
      },
    ],
  },

  "cash-cost-per-btc": {
    slug: "cash-cost-per-btc",
    name: "Cash Cost per BTC",
    unit: "$/BTC",
    rankingUrl: "/rankings/cost",
    rankingLabel: "Cash Cost per BTC Rankings",
    relatedSlugs: ["all-in-cost-per-btc", "fleet-efficiency", "revenue"],
    title: "What is Cash Cost per BTC? Bitcoin Mining Cost Explained",
    description:
      "Cash Cost per BTC is the direct cash expense to mine one bitcoin, including electricity and direct site costs. Learn how it compares to all-in cost and why it's the primary profitability metric.",
    summary:
      "Cash Cost per BTC is the direct out-of-pocket cost to mine one bitcoin, primarily electricity and direct site operating costs. It is the most widely watched profitability indicator for Bitcoin miners.",
    definition:
      "Cash Cost per BTC represents the total direct cash expenditures required to mine one bitcoin, typically including: electricity costs, direct labor at mining sites, and other direct site-level operating expenses. It excludes non-cash charges like depreciation and stock-based compensation, and usually excludes corporate overhead.",
    why_it_matters: [
      "It defines the 'breakeven price' below which miners are cash-flow negative from mining operations.",
      "Lower cash cost means greater resilience during bitcoin price downturns — cheaper producers survive bear markets longer.",
      "It enables direct comparison of operational efficiency across miners regardless of fleet size.",
      "As BTC price rises above cash cost, mining margins expand rapidly, creating operating leverage.",
    ],
    how_to_interpret: [
      "Compare cash cost to the current BTC spot price to estimate mining margin: (BTC price - cash cost) / BTC price = gross mining margin.",
      "Lower is better, but context matters: a low cash cost with an aging fleet may not be sustainable as machines become obsolete.",
      "Watch for trend: rising cash cost quarter-over-quarter may signal electricity price increases, difficulty growth, or fleet aging.",
    ],
    misconceptions: [
      "Cash cost ≠ all-in cost. All-in cost includes depreciation, SG&A, and other non-cash items. Cash cost only captures actual cash outflows.",
      "A company with the lowest cash cost is not necessarily the most profitable overall — all-in costs and overhead can still make them unprofitable.",
      "Cash cost per BTC is affected by difficulty: if network difficulty rises, you need more electricity per BTC even with the same fleet.",
    ],
    our_definition:
      "On this site, Cash Cost per BTC is derived from company disclosures, typically 'cost of revenues' (cash portion only) divided by BTC produced in the period. Where companies disclose a specific 'cash cost per bitcoin mined' figure, we use that directly. Figures are in USD per BTC.",
    faqs: [
      {
        question: "What is a competitive cash cost per BTC in 2025?",
        answer: "In 2025, after the April 2024 halving, cash costs for efficient US public miners range from approximately $25,000 to $55,000 per BTC. Miners with sub-$35,000 cash costs are considered competitive at most bitcoin price levels.",
      },
      {
        question: "Why did cash costs jump after the April 2024 halving?",
        answer: "The halving cut block rewards from 6.25 BTC to 3.125 BTC per block. This immediately halved the BTC earned per unit of electricity consumed, roughly doubling the electricity cost per BTC mined. Miners who expanded hashrate aggressively pre-halving were able to partially offset this.",
      },
    ],
  },

  "all-in-cost-per-btc": {
    slug: "all-in-cost-per-btc",
    name: "All-in Cost per BTC",
    unit: "$/BTC",
    rankingUrl: "/rankings/cost",
    rankingLabel: "Cost Rankings",
    relatedSlugs: ["cash-cost-per-btc", "revenue", "fleet-efficiency"],
    title: "What is All-in Cost per BTC? Total Mining Cost Explained",
    description:
      "All-in Cost per BTC includes all costs — electricity, depreciation, SG&A, and overhead — to mine one bitcoin. It's the true full-cost measure of mining profitability.",
    summary:
      "All-in Cost per BTC is the total cost to mine one bitcoin including all operating expenses: electricity, depreciation of mining equipment, G&A overhead, and stock-based compensation. It is the comprehensive measure of mining profitability.",
    definition:
      "All-in Cost per BTC (also called total cost per BTC or fully-loaded cost) includes all costs attributable to mining operations: direct cash costs (electricity, direct labor), plus non-cash charges (depreciation of miners and facilities), plus G&A overhead allocated to mining, plus stock-based compensation. It represents the true economic cost of producing one bitcoin.",
    why_it_matters: [
      "It determines long-term sustainability — a company where all-in cost exceeds BTC price is destroying value even if cash margins are positive.",
      "Depreciation is a real cost: mining equipment becomes obsolete and must be replaced, so ignoring it understates true economics.",
      "Investors and analysts use all-in cost to assess whether a miner can sustain profitability through a full market cycle.",
    ],
    how_to_interpret: [
      "All-in cost is always higher than cash cost. The gap represents depreciation + overhead.",
      "A large gap between cash cost and all-in cost suggests heavy recent capex (new machines being depreciated) — which may be positive (fleet upgrade) or concerning (high leverage).",
    ],
    misconceptions: [
      "All-in cost is not always disclosed directly by companies — it often requires calculation from SEC filing line items.",
      "Companies use different definitions. Always check the footnote for what's included.",
    ],
    our_definition:
      "Where companies explicitly disclose 'all-in cost per bitcoin' or 'total cost per bitcoin', we use that figure. Otherwise we calculate: (total cost of revenues + G&A) / BTC production. Non-recurring items are excluded where identifiable. Estimated figures are labeled.",
    faqs: [
      {
        question: "Why is all-in cost so much higher than cash cost for some miners?",
        answer: "Heavy recent capital expenditure on new mining rigs creates large annual depreciation charges. A company that spent $500M on S21 miners in 2024 will have ~$100M/year in depreciation, which adds significantly to all-in cost per BTC.",
      },
    ],
  },

  "fleet-efficiency": {
    slug: "fleet-efficiency",
    name: "Fleet Efficiency",
    unit: "J/TH",
    rankingUrl: "/rankings/efficiency",
    rankingLabel: "Fleet Efficiency Rankings",
    relatedSlugs: ["hashrate", "power-capacity", "cash-cost-per-btc"],
    title: "What is Fleet Efficiency (J/TH)? Bitcoin Mining Energy Efficiency Explained",
    description:
      "Fleet Efficiency measures how much energy (in joules) a bitcoin miner's fleet uses per terahash of computing power. Lower J/TH = more efficient. Learn how it drives profitability.",
    summary:
      "Fleet Efficiency is measured in joules per terahash (J/TH) and represents how much electricity a mining fleet consumes per unit of computing power. Lower is better: more efficient fleets produce more BTC per dollar of electricity.",
    definition:
      "Fleet Efficiency (J/TH) is the weighted average energy consumption per unit of hash rate across a company's entire fleet of mining machines. It is calculated as: total power consumption (watts) ÷ total hashrate (TH/s). A lower J/TH means the fleet produces more hashes — and thus more expected BTC — per unit of electricity.",
    why_it_matters: [
      "It is the primary determinant of cash cost per BTC, since electricity is the largest variable cost in mining.",
      "Fleets with better (lower) J/TH are more resilient: they produce more BTC for the same power spend during difficulty spikes or price downturns.",
      "Efficiency improvements drive the industry: each new generation of ASICs (e.g., S21 Pro vs S19) delivers 20-40% better J/TH.",
    ],
    how_to_interpret: [
      "In 2025, a fleet averaging under 20 J/TH is considered highly efficient. 20-30 J/TH is competitive. Above 35 J/TH is aging fleet territory.",
      "Compare J/TH to electricity cost: at $0.04/kWh, a 20 J/TH fleet costs roughly $27K/BTC in electricity at current network difficulty.",
      "Improving J/TH over time is a strong signal of active fleet modernization (replacing older machines with newer ones).",
    ],
    misconceptions: [
      "Lower J/TH does not automatically mean lower total electricity cost — it depends on total installed hashrate as well.",
      "Manufacturers rate machines at lab temperatures. Real-world efficiency is typically 5-10% worse due to heat and altitude.",
    ],
    our_definition:
      "We use the company's self-reported fleet efficiency figure from SEC filings or investor presentations. This is typically a weighted average across all operating machines at period end. Units are J/TH (joules per terahash).",
    faqs: [
      {
        question: "What J/TH is considered state-of-the-art in 2025?",
        answer: "The most efficient machines available in 2025 (such as the Bitmain S21 Pro and MicroBT M66S) operate at approximately 15-17 J/TH. A fleet averaging below 20 J/TH is competitive for a large-scale miner.",
      },
      {
        question: "How do companies improve their fleet efficiency?",
        answer: "Fleet efficiency improves through: (1) purchasing and deploying next-generation miners, (2) decommissioning older, less efficient machines, and (3) overclocking or underclocking machines based on electricity pricing.",
      },
    ],
  },

  "power-capacity": {
    slug: "power-capacity",
    name: "Power Capacity",
    unit: "MW",
    rankingUrl: "/rankings/hashrate",
    rankingLabel: "Hashrate Rankings",
    relatedSlugs: ["hashrate", "fleet-efficiency", "btc-production"],
    title: "What is Power Capacity (MW) in Bitcoin Mining?",
    description:
      "Power Capacity is the total megawatts of electrical infrastructure a Bitcoin miner controls. It defines the upper limit of mining scale. Learn how it relates to hashrate and BTC production.",
    summary:
      "Power Capacity is the total electrical power (in megawatts, MW) available to a Bitcoin mining company for operating mining hardware. It sets the physical ceiling for how many miners can be deployed.",
    definition:
      "Power Capacity (MW) represents the total contracted or developed electrical power infrastructure available to a mining company. It includes power at operational sites and may include sites under development. 1 MW can typically power 250-350 modern ASIC mining machines depending on model efficiency.",
    why_it_matters: [
      "Power capacity is the ultimate bottleneck for mining scale — you can own all the machines in the world, but without power infrastructure, you can't mine.",
      "Securing low-cost, long-term power contracts at scale is a key competitive moat for large miners.",
      "Investors track power capacity growth as a leading indicator of future hashrate and production expansion.",
    ],
    how_to_interpret: [
      "Compare power capacity to actual operating hashrate to assess utilization. Underdeveloped capacity is a future growth signal.",
      "Power capacity × average miner efficiency (watts/TH) / 1,000,000 = estimated hashrate ceiling in EH/s.",
      "Consider electricity price alongside capacity — 500 MW at $0.02/kWh is far more valuable than 500 MW at $0.07/kWh.",
    ],
    misconceptions: [
      "Power capacity ≠ power consumption. Companies often have more capacity than they currently use if deployment is ongoing.",
      "MW figures may include sites under development or not yet contracted — check whether 'operational' vs 'total' capacity is stated.",
    ],
    our_definition:
      "We report total contracted or developed power capacity as disclosed in SEC filings or official company announcements. Where only operational power is disclosed, we note this. Units are MW (megawatts).",
    faqs: [
      {
        question: "How does power capacity translate to hashrate?",
        answer: "As a rough guide: 1 MW of power can run approximately 300 Antminer S21 Pro machines at 3.3 kW each, yielding about 50 TH/s per machine × 300 = ~15 TH/s per MW, or 0.000015 EH/s per MW. At 500 MW, that's ~7.5 EH/s.",
      },
    ],
  },

  "revenue": {
    slug: "revenue",
    name: "Revenue",
    unit: "$",
    rankingUrl: "/rankings/revenue",
    rankingLabel: "Revenue Rankings",
    relatedSlugs: ["btc-production", "cash-cost-per-btc", "btc-holdings"],
    title: "What is Revenue for Bitcoin Mining Companies?",
    description:
      "Mining revenue is primarily the dollar value of BTC earned from mining during a period. Learn how public miners recognize revenue, what's included, and how to compare across companies.",
    summary:
      "Revenue for a Bitcoin mining company is primarily the fair market value of bitcoin earned through mining operations during a reporting period. It may also include hosting fees, data center services, and other income streams.",
    definition:
      "Mining Revenue is recognized when bitcoin is earned (at the point of mining), valued at the BTC price at the time of receipt. Total Revenue may also include: hosting revenue (if the company hosts third-party miners), data center or HPC revenue, and other services. Revenue is reported in USD.",
    why_it_matters: [
      "Revenue growth drives investor confidence and stock valuation multiples.",
      "The composition of revenue matters: 100% mining revenue is different from 50% mining + 50% hosting — the latter is more stable.",
      "Revenue divided by BTC mined gives an implied BTC price realization rate.",
      "Gross margin (revenue minus cost of revenues) measures operational profitability.",
    ],
    how_to_interpret: [
      "Compare revenue trend to BTC price trend: are they tracking proportionally, or is the company over/under-performing the price?",
      "Check revenue mix: some miners are diversifying into HPC/AI hosting, which changes risk profile.",
      "Revenue can be high even when net income is negative, if depreciation and overhead are large.",
    ],
    misconceptions: [
      "High revenue does not mean profitability. Many miners have positive revenue but negative net income.",
      "Revenue recognition timing can differ from when BTC is sold — miners recognize revenue when BTC is mined, not necessarily when it's liquidated.",
    ],
    our_definition:
      "We use total revenue as reported in SEC 10-Q and 10-K income statements. We separately track mining revenue and total revenue where companies disclose the split. All figures are in USD, reported in units of $100M for cross-company comparison.",
    faqs: [
      {
        question: "Why can revenue fall even when BTC production increases?",
        answer: "Revenue depends on both production volume AND the BTC price at time of mining. If production rises 10% but BTC price falls 20%, revenue declines net. This is why miners track both metrics separately.",
      },
    ],
  },
};

// ─── Static params for build ──────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(METRICS).map(slug => ({ slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = METRICS[slug];
  if (!m) return { title: "Not Found" };
  return buildMetadata({
    title: m.title,
    description: m.description,
    path: `/metrics/${slug}`,
  });
}

// ─── Component helpers ────────────────────────────────────────────────────────

const SLUG_TO_LABEL = {
  "btc-production": "BTC Production",
  "hashrate": "Hashrate",
  "btc-holdings": "BTC Holdings",
  "cash-cost-per-btc": "Cash Cost per BTC",
  "all-in-cost-per-btc": "All-in Cost per BTC",
  "fleet-efficiency": "Fleet Efficiency",
  "power-capacity": "Power Capacity",
  "revenue": "Revenue",
};

const TICKER_COLOR = { MARA: "#F7931A", CLSK: "#00D4AA", BTDR: "#6C8EFF", CANG: "#FF6B9D" };
const TICKERS = ["MARA", "CLSK", "BTDR", "CANG"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MetricPage({ params }) {
  const { slug } = await params;
  const m = METRICS[slug];
  if (!m) notFound();

  // Schema: FAQPage + BreadcrumbList
  const faqSchema = faqPageSchema(m.faqs.map(f => ({ question: f.question, answer: f.answer })));
  const crumbSchema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Metrics", url: "/metrics/btc-production" },
    { name: m.name, url: `/metrics/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={crumbSchema} />

      {/* Breadcrumb */}
      <nav style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16 }}>
        <Link href="/">Home</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link href="/metrics">Metrics</Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{m.name}</span>
      </nav>

      {/* Metrics nav strip — all 8 metrics visible at top */}
      <MetricsNavStrip />

      {/* H1 + summary */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          Metric Glossary
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{m.name}</h1>
        <p style={{ fontSize: 16, color: "var(--text2)", maxWidth: 720, lineHeight: 1.7, margin: 0 }}>
          {m.summary}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 24, alignItems: "start" }}>
        {/* Main content */}
        <div>
          <Section title="Definition">
            <p style={{ lineHeight: 1.75 }}>{m.definition}</p>
          </Section>

          <Section title="Why it matters">
            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              {m.why_it_matters.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </Section>

          <Section title="How to interpret">
            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              {m.how_to_interpret.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </Section>

          <Section title="Common misconceptions">
            {m.misconceptions.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <span style={{ color: "var(--red)", flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✗</span>
                <span style={{ lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </Section>

          <Section title={`How we define ${m.name} on this site`}>
            <div style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderLeft: "3px solid var(--orange)", borderRadius: "0 8px 8px 0",
              padding: "14px 16px", lineHeight: 1.7, fontSize: 14,
            }}>
              {m.our_definition}
            </div>
          </Section>

          {/* FAQ — rendered in HTML for Google to index */}
          <Section title="Frequently Asked Questions">
            <div style={{ display: "grid", gap: 16 }}>
              {m.faqs.map((faq, i) => (
                <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{faq.question}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "var(--text2)" }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside>
          {/* Unit badge */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Unit</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--orange)", fontFamily: "monospace" }}>{m.unit}</div>
          </div>

          {/* See rankings */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>See Rankings</div>
            <Link href={m.rankingUrl} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--orange)", fontWeight: 600 }}>
              {m.rankingLabel} →
            </Link>
          </div>

          {/* Company data */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Company Data</div>
            <div style={{ display: "grid", gap: 8 }}>
              {TICKERS.map(tk => (
                <Link key={tk} href={`/company/${tk}`} style={{ fontSize: 13, color: TICKER_COLOR[tk], fontWeight: 500 }}>
                  {tk} →
                </Link>
              ))}
            </div>
          </div>

          {/* Related metrics */}
          {m.relatedSlugs.length > 0 && (
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Related Metrics</div>
              <div style={{ display: "grid", gap: 8 }}>
                {m.relatedSlugs.map(s => (
                  <Link key={s} href={`/metrics/${s}`} style={{ fontSize: 13 }}>
                    {SLUG_TO_LABEL[s] || s} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Methodology link */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Data Sources</div>
            <p style={{ fontSize: 12, color: "var(--text2)", margin: "0 0 8px" }}>
              All figures sourced from SEC 10-Q and 10-K filings, official press releases, and IR disclosures.
            </p>
            <Link href="/methodology" style={{ fontSize: 12, color: "var(--orange)" }}>Full methodology →</Link>
          </div>
        </aside>
      </div>

      <div className="cta-banner" style={{ marginTop: 28 }}>
        <h3>Track {m.name} in real-time</h3>
        <p>Live data, alerts, and portfolio tracking for Bitcoin miners with Nonce.app</p>
        <a href="https://nonce.app/" target="_blank" rel="noopener" className="cta-btn">Explore Nonce.app →</a>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
