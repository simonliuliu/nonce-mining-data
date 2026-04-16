const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─── Helpers ───

function gp(prop) {
  if (!prop) return null;
  if (prop.type === "title")        return prop.title?.map(t => t.plain_text).join("") || null;
  if (prop.type === "rich_text")    return prop.rich_text?.map(t => t.plain_text).join("") || null;
  if (prop.type === "number")       return prop.number;
  if (prop.type === "select")       return prop.select?.name || null;
  if (prop.type === "multi_select") return prop.multi_select?.map(s => s.name) || [];
  if (prop.type === "checkbox")     return prop.checkbox;
  if (prop.type === "url")          return prop.url;
  if (prop.type === "date")         return prop.date?.start || null;
  if (prop.type === "formula")      return prop.formula?.number ?? prop.formula?.string ?? null;
  if (prop.type === "status")       return prop.status?.name || null;
  return null;
}

async function queryAll(dbId, filter) {
  const pages = [];
  let cursor;
  do {
    const r = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      filter,
      page_size: 100,
    });
    pages.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return pages;
}

async function getBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const r = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

function richTextToHtml(rts) {
  if (!rts) return "";
  return rts.map(rt => {
    let t = rt.plain_text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (rt.annotations?.bold)          t = `<strong>${t}</strong>`;
    if (rt.annotations?.italic)        t = `<em>${t}</em>`;
    if (rt.annotations?.code)          t = `<code>${t}</code>`;
    if (rt.annotations?.strikethrough) t = `<s>${t}</s>`;
    if (rt.href)                        t = `<a href="${rt.href}" target="_blank" rel="noopener">${t}</a>`;
    return t;
  }).join("");
}

function blocksToHtml(blocks) {
  const html = [];
  let inUl = false, inOl = false;
  for (const b of blocks) {
    const t = b.type;
    if (t !== "bulleted_list_item" && inUl) { html.push("</ul>"); inUl = false; }
    if (t !== "numbered_list_item" && inOl) { html.push("</ol>"); inOl = false; }
    if (t === "paragraph") {
      const inner = richTextToHtml(b.paragraph?.rich_text);
      html.push(inner ? `<p>${inner}</p>` : "<p>&nbsp;</p>");
    } else if (t === "heading_1") {
      html.push(`<h2>${richTextToHtml(b.heading_1?.rich_text)}</h2>`);
    } else if (t === "heading_2") {
      html.push(`<h3>${richTextToHtml(b.heading_2?.rich_text)}</h3>`);
    } else if (t === "heading_3") {
      html.push(`<h4>${richTextToHtml(b.heading_3?.rich_text)}</h4>`);
    } else if (t === "bulleted_list_item") {
      if (!inUl) { html.push("<ul>"); inUl = true; }
      html.push(`<li>${richTextToHtml(b.bulleted_list_item?.rich_text)}</li>`);
    } else if (t === "numbered_list_item") {
      if (!inOl) { html.push("<ol>"); inOl = true; }
      html.push(`<li>${richTextToHtml(b.numbered_list_item?.rich_text)}</li>`);
    } else if (t === "quote") {
      html.push(`<blockquote>${richTextToHtml(b.quote?.rich_text)}</blockquote>`);
    } else if (t === "divider") {
      html.push("<hr/>");
    } else if (t === "code") {
      html.push(`<pre><code>${richTextToHtml(b.code?.rich_text)}</code></pre>`);
    } else if (t === "callout") {
      const emoji = b.callout?.icon?.emoji || "💡";
      html.push(`<div class="callout">${emoji} ${richTextToHtml(b.callout?.rich_text)}</div>`);
    }
  }
  if (inUl) html.push("</ul>");
  if (inOl) html.push("</ol>");
  return html.join("\n");
}

// ─── Company name normalization ───

const NAME_MAP = {
  CleanSpark: "CleanSpark", CLSK: "CleanSpark",
  "Marathon Digital": "Marathon Digital", "MARA Holdings": "Marathon Digital", MARA: "Marathon Digital",
  Bitdeer: "Bitdeer", "Bitdeer Technologies": "Bitdeer", BTDR: "Bitdeer",
  Cango: "Cango", "Cango Inc.": "Cango", CANG: "Cango",
};
const TICKER_MAP = {
  CleanSpark: "CLSK", "Marathon Digital": "MARA", Bitdeer: "BTDR", Cango: "CANG",
};

// ─── DB1: Quarterly Data ───

async function getQuarterlyData() {
  const dbId = process.env.NOTION_QUARTERLY_DB;
  if (!dbId) {
    console.error("[notion] ❌ NOTION_QUARTERLY_DB not set");
    return [];
  }

  let pages;
  try {
    pages = await queryAll(dbId);
  } catch (e) {
    console.error("[notion] ❌ getQuarterlyData fetch failed:", e.code || e.status, e.message);
    if (e.code === "unauthorized") {
      console.error("[notion]    → Check NOTION_API_KEY and grant Integration access to the DB");
    } else if (e.message?.includes("ECONNREFUSED") || e.message?.includes("fetch failed") || e.message?.includes("ETIMEDOUT")) {
      console.error("[notion]    → Network blocked. Run: export https_proxy=http://127.0.0.1:7890 && npm run dev");
    }
    return [];
  }

  if (!pages.length) {
    console.warn("[notion] ⚠ getQuarterlyData: 0 pages — DB empty or Integration not granted access to this DB");
    return [];
  }

  // Log available property names once (helps debug name mismatches)
  const propNames = Object.keys(pages[0]?.properties || {});
  console.log(`[notion] ✅ getQuarterlyData: ${pages.length} pages. Properties: ${propNames.join(", ")}`);

  // Detect if 季度 property exists under a different name
  if (!propNames.includes("季度")) {
    const candidates = propNames.filter(k => k.includes("季") || k.toLowerCase().includes("quarter"));
    console.warn(`[notion] ⚠ Property '季度' not found. Candidates: [${candidates.join(", ")}]. All: [${propNames.join(", ")}]`);
  }

  const seen = new Map();
  for (const page of pages) {
    const p = page.properties;
    const raw     = gp(p["Company"]) || "";
    const company = NAME_MAP[raw] || raw;
    const quarter = gp(p["季度"]) || "";
    if (!quarter || !company) continue;
    const key = `${company}|${quarter}`;
    if (seen.has(key)) continue;
    seen.set(key, {
      id: page.id, company, ticker: TICKER_MAP[company] || gp(p["Ticker"]) || "", quarter,
      btc_production:       gp(p["BTC产量"]),
      btc_holdings:         gp(p["BTC持仓"]),
      hashrate_ehs:         gp(p["算力EHs"]),
      miner_count:          gp(p["矿机规模"]),
      miner_model:          gp(p["矿机型号"]),
      efficiency_jth:       gp(p["矿机能耗比JTH"]),
      electricity_price:    gp(p["电价($)"]),
      power_capacity_mw:    gp(p["电力规模MW"]),
      cash_cost_per_btc:    gp(p["现金单币成本"]),
      all_in_cost_per_btc:  gp(p["全成本单币成本"]),
      total_revenue_100m:   gp(p["总收入(100M)"]),
      mining_revenue_100m:  gp(p["挖矿收入(100M)"]),
      cost_of_revenue_100m: gp(p["收入成本(100M)"]),
      gross_profit_100m:    gp(p["毛利润(100M)"]),
      net_income_100m:      gp(p["净利润(100M)"]),
      data_source:          gp(p["信息源"]),
      data_status:          gp(p["数据状态"]),
      source_url:           gp(p["原文链接"]),
      report_period:        gp(p["报告周期"]),
    });
  }

  const result = Array.from(seen.values()).sort(
    (a, b) => a.quarter.localeCompare(b.quarter) || a.company.localeCompare(b.company)
  );
  console.log(`[notion] ✅ getQuarterlyData: returning ${result.length} rows`);
  return result;
}

// ─── DB2: Annual Company Data ───

async function getAnnualCompanyData() {
  const dbId = process.env.NOTION_COMPANY_DB;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId); }
  catch (e) { console.error("[notion] getAnnualCompanyData:", e.message); return []; }
  return pages.map(page => {
    const p = page.properties;
    return {
      id: page.id, company: gp(p["Company"]) || "", ticker: gp(p["Ticker"]) || "",
      fiscal_year:          gp(p["Fiscal Year"]),
      btc_production:       gp(p["BTC 产量 (BTC)"]),
      btc_holdings:         gp(p["BTC 持仓 (BTC)"]),
      hashrate_ehs:         gp(p["算力 (EH/s)"]),
      miner_count:          gp(p["矿机规模（台）"]),
      efficiency_jth:       gp(p["矿机能耗比（J/TH）"]),
      electricity_price:    gp(p["电价 ($/kWh)"]),
      power_capacity_mw:    gp(p["电力规模（MW）"]),
      cash_cost_per_btc:    gp(p["现金单币成本 (USD/BTC)"]),
      all_in_cost_per_btc:  gp(p["全成本单币成本 (USD/BTC)"]),
      total_revenue_100m:   gp(p["总收入 ($100M)"]),
      mining_revenue_100m:  gp(p["挖矿收入 ($100M)"]),
      cost_of_revenue_100m: gp(p["收入成本 ($100M)"]),
      gross_profit_100m:    gp(p["毛利润 ($100M)"]),
      net_income_100m:      gp(p["净利润 ($100M)"]),
      source:               gp(p["Source"]),
      data_status:          gp(p["数据状态"]),
    };
  }).filter(r => r.company && r.fiscal_year);
}

// ─── DB3: SEO Articles ───

async function getPublishedArticles() {
  const dbId = process.env.NOTION_SEO_DB;
  if (!dbId) return [];
  let pages;
  try {
    pages = await queryAll(dbId, { property: "Status", select: { equals: "Published" } });
  } catch (e) { console.error("[notion] getPublishedArticles:", e.message); return []; }

  return pages.map(page => {
    const p = page.properties;
    // Cover: check property first, then page.cover
    const coverProp = gp(p["Cover Image"]);
    const coverPage = page.cover?.type === "external" ? page.cover.external?.url
      : page.cover?.type === "file" ? page.cover.file?.url : null;
    return {
      id: page.id,
      title:            gp(p["Title"]),
      slug:             gp(p["Slug"]),
      category:         gp(p["Category"]),
      related_company:  gp(p["Related Company"]),
      publish_date:     gp(p["Publish Date"]),
      meta_description: gp(p["Meta Description"]),
      keywords:         gp(p["Keywords"]) || [],
      featured:         gp(p["Featured"]),
      cta_type:         gp(p["CTA Type"]),
      cover_image:      coverProp || coverPage || null,
    };
  }).filter(a => a.slug && a.title)
    .sort((a, b) => (b.publish_date || "").localeCompare(a.publish_date || ""));
}

async function getArticleBySlug(slug) {
  const dbId = process.env.NOTION_SEO_DB;
  if (!dbId) return null;
  let r;
  try {
    r = await notion.databases.query({
      database_id: dbId,
      filter: { property: "Slug", rich_text: { equals: slug } },
      page_size: 1,
    });
  } catch (e) { console.error("[notion] getArticleBySlug:", e.message); return null; }
  if (!r.results.length) return null;
  const page = r.results[0]; const p = page.properties;
  const blocks = await getBlocks(page.id);
  const coverProp = gp(p["Cover Image"]);
  const coverPage = page.cover?.type === "external" ? page.cover.external?.url
    : page.cover?.type === "file" ? page.cover.file?.url : null;
  return {
    id: page.id,
    title:            gp(p["Title"]),
    slug:             gp(p["Slug"]),
    category:         gp(p["Category"]),
    related_company:  gp(p["Related Company"]),
    publish_date:     gp(p["Publish Date"]),
    meta_description: gp(p["Meta Description"]),
    keywords:         gp(p["Keywords"]) || [],
    cta_type:         gp(p["CTA Type"]),
    cover_image:      coverProp || coverPage || null,
    blocks,
  };
}

// ─── DB4: Company Profiles ───

async function getAllCompanyProfiles() {
  const dbId = process.env.NOTION_PROFILES_DB;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId, { property: "Status", select: { equals: "Active" } }); }
  catch (e) { console.error("[notion] getAllCompanyProfiles:", e.message); return []; }
  return pages.map(page => {
    const p = page.properties;
    return {
      id: page.id, company: gp(p["Company Name"]), ticker: gp(p["Ticker"]), slug: gp(p["Slug"]),
      description:    gp(p["Description"]),
      business_model: gp(p["Business Model"]),
      headquarters:   gp(p["Headquarters"]),
      founded:        gp(p["Founded"]),
      website:        gp(p["Website"]),
      peers:          gp(p["Peers"]),
    };
  }).filter(p => p.ticker);
}

async function getCompanyProfile(ticker) {
  const dbId = process.env.NOTION_PROFILES_DB;
  if (!dbId) return null;
  let r;
  try {
    r = await notion.databases.query({
      database_id: dbId,
      filter: { property: "Slug", rich_text: { equals: ticker.toUpperCase() } },
      page_size: 1,
    });
  } catch (e) { console.error("[notion] getCompanyProfile:", e.message); return null; }
  if (!r.results.length) return null;
  const page = r.results[0]; const p = page.properties;
  const blocks = await getBlocks(page.id);
  return {
    id: page.id, company: gp(p["Company Name"]), ticker: gp(p["Ticker"]), slug: gp(p["Slug"]),
    description:    gp(p["Description"]),
    business_model: gp(p["Business Model"]),
    headquarters:   gp(p["Headquarters"]),
    founded:        gp(p["Founded"]),
    website:        gp(p["Website"]),
    peers:          gp(p["Peers"]),
    blocks,
  };
}

// ─── DB5: Metrics Glossary ───

async function getAllMetrics() {
  const dbId = process.env.NOTION_METRICS_DB;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId, { property: "Status", select: { equals: "Published" } }); }
  catch (e) { console.error("[notion] getAllMetrics:", e.message); return []; }
  return pages.map(page => {
    const p = page.properties;
    return { id: page.id, name: gp(p["Metric Name"]), slug: gp(p["Slug"]), related_ranking: gp(p["Related Ranking"]) };
  }).filter(m => m.slug);
}

async function getMetricBySlug(slug) {
  const dbId = process.env.NOTION_METRICS_DB;
  if (!dbId) return null;
  let r;
  try {
    r = await notion.databases.query({
      database_id: dbId,
      filter: { property: "Slug", rich_text: { equals: slug } },
      page_size: 1,
    });
  } catch (e) { console.error("[notion] getMetricBySlug:", e.message); return null; }
  if (!r.results.length) return null;
  const page = r.results[0]; const p = page.properties;
  const blocks = await getBlocks(page.id);
  return { id: page.id, name: gp(p["Metric Name"]), slug: gp(p["Slug"]), related_ranking: gp(p["Related Ranking"]), blocks };
}

// ─── DB6: FAQ ───

async function getFAQs() {
  const dbId = process.env.NOTION_FAQ_DB;
  if (!dbId) return [];
  let pages;
  try { pages = await queryAll(dbId, { property: "Status", select: { equals: "Published" } }); }
  catch (e) { console.error("[notion] getFAQs:", e.message); return []; }
  const items = [];
  for (const page of pages) {
    const p = page.properties;
    let blocks = [];
    try { blocks = await getBlocks(page.id); } catch (e) {}
    items.push({
      id: page.id,
      question:       gp(p["Question"]),
      category:       gp(p["Category"]),
      related_metric: gp(p["Related Metric"]),
      order:          gp(p["Order"]) || 999,
      answer_html:    blocksToHtml(blocks),
    });
  }
  return items.sort((a, b) => a.order - b.order);
}

module.exports = {
  getQuarterlyData, getAnnualCompanyData,
  getPublishedArticles, getArticleBySlug,
  getAllCompanyProfiles, getCompanyProfile,
  getAllMetrics, getMetricBySlug,
  getFAQs, blocksToHtml, TICKER_MAP, NAME_MAP,
};
