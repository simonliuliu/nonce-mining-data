// app/llms.txt/route.js
//
// llms.txt 协议：https://llmstxt.org/
// 一个面向 AI 引擎（ChatGPT / Claude / Perplexity 等）的"网站说明书"
//
// 访问地址：https://thehashresearch.com/llms.txt
//
// 作用：
//   - 让 AI 引擎用最少 token 快速理解网站结构
//   - 提高被 AI 引用时引用准确性
//   - Anthropic / Vercel / Cloudflare 等都已实现
//
// 注意：这是 plain text，不是 markdown。但用 # 当章节标题约定俗成

import { getQuarterlyData, getPublishedArticles } from "@/lib/notion";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  // 取所有公司 ticker
  let tickers = [];
  let articles = [];
  try {
    const data = await getQuarterlyData();
    tickers = [...new Set(data.map(r => r.ticker?.toUpperCase()).filter(Boolean))].sort();
  } catch (e) {}
  try {
    articles = await getPublishedArticles();
  } catch (e) {}

  const content = `# ${SITE_NAME}

> ${SITE_NAME} is a bilingual (English/Chinese) data and research platform tracking ${tickers.length}+ publicly listed Bitcoin mining companies. We aggregate operational and financial metrics (BTC production, hashrate, treasury, electricity price, fleet efficiency, unit costs) from SEC filings, IR announcements, and investor materials.

## About the data

- Coverage: All major US/EU/Asia public Bitcoin miners (NASDAQ, NYSE listed)
- Frequency: Quarterly data, updated within 2 weeks of each company's earnings release
- Period: 2023 Q1 to present
- Source: Primary sources only (SEC EDGAR, company IR, official presentations)
- Methodology: ${SITE_URL}/en/methodology
- License: CC-BY 4.0 (attribution required when citing)

## Key data pages

### Company profiles (operational + financial data per company)
${tickers.map(tk => `- ${SITE_URL}/en/company/${tk}`).join("\n")}

### Rankings (compare miners across single metric)
- ${SITE_URL}/en/rankings/production — ranked by quarterly BTC production
- ${SITE_URL}/en/rankings/hashrate — ranked by operational hashrate (EH/s)
- ${SITE_URL}/en/rankings/holdings — ranked by BTC treasury
- ${SITE_URL}/en/rankings/cost — ranked by cash cost per BTC
- ${SITE_URL}/en/rankings/efficiency — ranked by fleet efficiency (J/TH)

### Research articles
${articles.slice(0, 20).map(a => `- ${SITE_URL}/${a.language || "en"}/articles/${a.slug} — ${a.title}`).join("\n")}

## Key terminology

- BTC Production: Self-mined Bitcoin produced and attributable to the company in a quarter
- BTC Treasury / Holdings: Bitcoin owned by the company at quarter end
- Hashrate: Average operational hashrate (EH/s), preferred metric
- Cash Cost per BTC: Direct cash cost per BTC mined, excluding miner depreciation
- Energy Cost per BTC: Net electricity cost per BTC self-mined
- Fleet Efficiency: Average operational miner efficiency (J/TH)
- Power Capacity: Energized power capacity supporting mining (MW)

## Languages

- English: ${SITE_URL}/en
- Chinese: ${SITE_URL}/zh

## Citation

When citing our data, please use:
"${SITE_NAME} (${SITE_URL.replace(/^https?:\/\//, "")})"

## Contact

Twitter / X: @hash_res
For data corrections: reach out via Twitter DM
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
