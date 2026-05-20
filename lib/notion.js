const { Client } = require("@notionhq/client");
const { withRetry, dedupe } = require("./notion-retry");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// 解析 "US$11,730.00" 或 "$11730" 这类格式 → 数字
// 兼容三种输入：
//   - number 类型：直接返回（Notion 字段类型改为 Number 后的新格式）
//   - string 类型：清理货币符号和千分位逗号后解析（旧的 rich_text 格式）
//   - null/undefined：返回 null
function parseDollar(val) {
  if (val == null) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  if (typeof val !== "string") return null;
  const cleaned = val.replace(/[US$,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// ─── 解析数据来源字段 ───────────────────────────────────────────
// Notion 字段已从 URL 类型改为 Rich Text 类型，每行一个 URL
// 支持兼容：
//   - 旧数据：URL 类型遗留的单个字符串
//   - 新数据：rich text 多行 URL，按换行/空白分隔
//   - 任意空格、换行、Tab 都能正确分隔
// 返回值：URL 数组（去重，按出现顺序）
function parseSources(raw) {
  if (!raw || typeof raw !== "string") return [];
  // 用正则抓出所有 http(s) URL，自动忽略前后空白、换行、其他干扰字符
  const matches = raw.match(/https?:\/\/[^\s<>"']+/gi) || [];
  // 去重，保留第一次出现的顺序
  const seen = new Set();
  const out = [];
  for (const url of matches) {
    // 去掉末尾可能的标点（逗号、句号、分号、中文标点）
    const clean = url.replace(/[,.;。，；、]+$/, "");
    if (!seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }
  return out;
}

// ★ 加了 withRetry 包装：撞限流/网络抖动时自动重试
async function queryAll(dbId, filter) {
  const pages = [];
  let cursor;
  do {
    const r = await withRetry(
      () => notion.databases.query({
        database_id: dbId,
        start_cursor: cursor,
        filter,
        page_size: 100,
      }),
      `queryAll(${dbId.slice(-8)})`
    );
    pages.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return pages;
}

// ★ 加了 withRetry 包装
async function getBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const r = await withRetry(
      () => notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      }),
      `getBlocks(${pageId.slice(-8)})`
    );
    blocks.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

// Notion 颜色 → CSS 颜色映射
const NOTION_COLORS = {
  gray:"#9b9b9b",brown:"#b07d57",orange:"#c8922a",yellow:"#dfb24f",
  green:"#4ade80",blue:"#7EA8BE",purple:"#9E8FBF",pink:"#BE7E8F",red:"#f87171",
  gray_background:"rgba(120,120,120,0.15)",brown_background:"rgba(176,125,87,0.15)",
  orange_background:"rgba(200,146,42,0.15)",yellow_background:"rgba(223,178,79,0.15)",
  green_background:"rgba(74,222,128,0.12)",blue_background:"rgba(126,168,190,0.15)",
  purple_background:"rgba(158,143,191,0.15)",pink_background:"rgba(190,126,143,0.15)",
  red_background:"rgba(248,113,113,0.12)",
};

function richTextToHtml(rts) {
  if (!rts) return "";
  return rts.map(rt => {
    let t = rt.plain_text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                         .replace(/\n/g, "<br>");
    const a = rt.annotations || {};
    if (a.bold)          t = `<strong>${t}</strong>`;
    if (a.italic)        t = `<em>${t}</em>`;
    if (a.underline)     t = `<u>${t}</u>`;
    if (a.strikethrough) t = `<s>${t}</s>`;
    if (a.code)          t = `<code>${t}</code>`;
    // 文字颜色和背景色
    const col = a.color;
    if (col && col !== "default") {
      const css = NOTION_COLORS[col];
      if (css) {
        const style = col.includes("background")
          ? `background:${css};padding:1px 4px;border-radius:3px;`
          : `color:${css};`;
        t = `<span style="${style}">${t}</span>`;
      }
    }
    if (rt.href) t = `<a href="${rt.href}" target="_blank" rel="noopener">${t}</a>`;
    return t;
  }).join("");
}

async function blocksToHtml(blocks) {
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

    } else if (t === "image") {
      // 支持 Notion 托管图片（file）和外部图片（external）
      const img = b.image;
      const src = img?.type === "file"
        ? img.file?.url
        : img?.type === "external"
        ? img.external?.url
        : null;
      const caption = img?.caption?.length
        ? richTextToHtml(img.caption)
        : "";
      if (src) {
        html.push(
          `<figure style="margin:20px 0;text-align:center;">` +
          `<img src="${src}" alt="${caption || ""}" style="max-width:100%;border-radius:8px;border:1px solid rgba(255,255,255,0.08);" />` +
          (caption ? `<figcaption style="margin-top:8px;font-size:12px;color:#9b9b9b;">${caption}</figcaption>` : "") +
          `</figure>`
        );
      }

    } else if (t === "embed") {
      const url = b.embed?.url || "";
      const caption = b.embed?.caption?.length
        ? richTextToHtml(b.embed.caption)
        : "";
      // 对 Twitter/X 链接特殊处理，其他用 iframe
      const isTwitter = url.includes("twitter.com") || url.includes("x.com");
      if (isTwitter) {
        // 直接输出 Twitter 官方 blockquote 标签
        // 客户端 TweetLoader 加载 widgets.js 后会自动渲染为完整卡片
        // data-width="340" 告诉 Twitter widgets 渲染时使用 340px 宽度（默认 ~550px 太宽）
        html.push(
          `<div style="margin:20px auto;max-width:340px;">` +
          `<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark" data-width="340">` +
          `<a href="${url}">${url}</a>` +
          `</blockquote>` +
          `</div>`
        );
      } else {
        html.push(
          `<div style="margin:20px 0;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">` +
          `<iframe src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:10px;" allowfullscreen loading="lazy"></iframe>` +
          `</div>`
        );
      }

    } else if (t === "video") {
      const vid = b.video;
      const url = vid?.type === "external" ? vid.external?.url : vid?.file?.url || "";
      if (url) {
        // YouTube 转换为 embed URL
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (ytMatch) {
          html.push(
            `<div style="margin:20px 0;position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">` +
            `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:10px;" allowfullscreen loading="lazy"></iframe>` +
            `</div>`
          );
        } else {
          html.push(`<video src="${url}" controls style="max-width:100%;border-radius:8px;margin:20px 0;"></video>`);
        }
      }

    } else if (t === "bookmark") {
      const url = b.bookmark?.url || "";
      const caption = b.bookmark?.caption?.length
        ? richTextToHtml(b.bookmark.caption)
        : url;
      if (url) {
        html.push(
          `<div style="margin:12px 0;">` +
          `<a href="${url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#7EA8BE;font-size:13px;text-decoration:none;word-break:break-all;">` +
          `<span style="flex-shrink:0;">🔗</span>${caption}` +
          `</a></div>`
        );
      }

    } else if (t === "table") {
      const rows = b.table?.rows || [];
      const hasHeader = b.table?.has_column_header;
      const tableRows = await Promise.all(rows.map(async (row) => {
        const cells = row?.cells || [];
        return cells.map(cell => richTextToHtml(cell)).join("");
      }));
      let tableHtml = `<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid rgba(255,255,255,0.1);border-radius:8px;overflow:hidden;font-size:13px;">`;
      tableRows.forEach((rowContent, i) => {
        const cells = rowContent.split("</td><td>") || [rowContent];
        const tag = (hasHeader && i === 0) ? "th" : "td";
        const style = (hasHeader && i === 0)
          ? "background:rgba(255,255,255,0.06);font-weight:600;color:#e8e8e8;"
          : "color:#9b9b9b;";
        tableHtml += `<tr>`;
        // Re-split the row properly from raw cells
        const rawRow = b.table?.rows?.[i];
        if (rawRow?.cells) {
          rawRow.cells.forEach(cell => {
            tableHtml += `<${tag} style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.07);border-right:1px solid rgba(255,255,255,0.07);${style}">${richTextToHtml(cell)}</${tag}>`;
          });
        }
        tableHtml += `</tr>`;
      });
      tableHtml += `</table></div>`;
      html.push(tableHtml);

    } else if (t === "column_list") {
      // 需要递归渲染每个 column 的 children — 这里只生成占位，因为 children 需要额外 API 调用
      // 简化：渲染为普通段落序列
      html.push(`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:16px 0;">`);
      html.push(`</div>`);
    }
  }
  if (inUl) html.push("</ul>");
  if (inOl) html.push("</ol>");
  return html.join("\n");
}

// ─── Company name normalization ────────────────────────────────────────────────
// 统一公司名（含 Notion 里可能有的拼写错误）

const NAME_MAP = {
  // 新数据库 - 来自「名称」字段
  "Marathon Digital":    "Marathon Digital",
  "CleanSpark":          "CleanSpark",
  "CleanSprak":          "CleanSpark",   // Notion 里的拼写错误，自动修正
  "Bitdeer Technologies":"Bitdeer",
  "Bitdeer":             "Bitdeer",
  "Cango":               "Cango",
  "Cango Inc.":          "Cango",
  // Ticker 反查
  MARA:  "Marathon Digital",
  CLSK:  "CleanSpark",
  BTDR:  "Bitdeer",
  CANG:  "Cango",
  // 旧数据库兼容
  "MARA Holdings":       "Marathon Digital",
  "Bitdeer Technologies Group": "Bitdeer",
};

const TICKER_MAP = {
  "Marathon Digital": "MARA",
  CleanSpark:         "CLSK",
  Bitdeer:            "BTDR",
  Cango:              "CANG",
};

// ─── DB1: Quarterly Data（新数据库）────────────────────────────────────────────
//
// 新数据库字段对照：
//   名称           (title)      → company name
//   Ticker         (select)     → ticker
//   季度           (select)     → quarter, e.g. "2023Q1"
//   BTC 季度产量   (number)     → btc_production
//   BTC 持仓       (number)     → btc_holdings
//   算力 EH/s      (number)     → hashrate_ehs
//   矿机能效 J/TH  (number)     → efficiency_jth
//   电价($)        (number)     → electricity_price
//   电力规模 MW    (number)     → power_capacity_mw
//   单币现金成本   (number)     → cash_cost_per_btc  （兼容旧的 rich_text "US$11,730.00" 格式）
//   单币能源成本   (number)     → energy_cost_per_btc （同上）
//   主要原文链接   (url)        → source_url

async function _getQuarterlyData() {
  const dbId = process.env.NOTION_QUARTERLY_DB;
  if (!dbId) {
    console.error("[notion] ❌ NOTION_QUARTERLY_DB not set");
    return [];
  }

  let pages;
  try {
    pages = await queryAll(dbId);
  } catch (e) {
    console.error("[notion] ❌ getQuarterlyData failed:", e.code || e.status, e.message);
    return [];
  }

  if (!pages.length) {
    console.warn("[notion] ⚠ getQuarterlyData: 0 rows returned");
    return [];
  }

  const propNames = Object.keys(pages[0]?.properties || {});
  console.log(`[notion] ✅ getQuarterlyData: ${pages.length} pages. Fields: ${propNames.join(", ")}`);

  const seen = new Map();
  for (const page of pages) {
    const p = page.properties;

    // 公司名：优先用「名称」字段，再用 NAME_MAP 规范化
    const rawName   = gp(p["名称"]) || "";
    const rawTicker = gp(p["Ticker"]) || "";
    const company   = NAME_MAP[rawName] || NAME_MAP[rawTicker] || rawName;
    const ticker    = rawTicker || TICKER_MAP[company] || "";
    const quarter   = gp(p["季度"]) || "";

    if (!quarter || !company) continue;

    const key = `${company}|${quarter}`;
    if (seen.has(key)) continue;

    // 成本字段：rich_text 格式为 "US$11,730.00"，解析为数字
    const cashCostRaw   = gp(p["单币现金成本"]);
    const energyCostRaw = gp(p["单币能源成本"]);

    // 数据来源：字段类型从 URL 改为 Rich Text 后，可填多个 URL（每行一个）
    // parseSources 同时兼容旧的单 URL 数据
    const sources = parseSources(gp(p["主要原文链接"]));

    seen.set(key, {
      id:                  page.id,
      company,
      ticker,
      quarter,
      btc_production:      gp(p["BTC 季度产量"]),
      btc_holdings:        gp(p["BTC 持仓"]),
      hashrate_ehs:        gp(p["算力 EH/s"]),
      efficiency_jth:      gp(p["矿机能效 J/TH"]) || null,
      electricity_price:   gp(p["电价($)"]) || null,
      power_capacity_mw:   gp(p["电力规模 MW"]) || null,
      cash_cost_per_btc:   parseDollar(cashCostRaw),
      energy_cost_per_btc: parseDollar(energyCostRaw),
      // 新数据库暂无以下字段，保留 null 保持兼容性
      miner_count:          null,
      miner_model:          null,
      all_in_cost_per_btc:  null,
      total_revenue_100m:   null,
      mining_revenue_100m:  null,
      cost_of_revenue_100m: null,
      gross_profit_100m:    null,
      net_income_100m:      null,
      data_status:          null,
      // ★ 来源：sources 是 URL 数组，source_url 是第一个 URL（向后兼容）
      sources:              sources,
      source_url:           sources[0] || null,
      report_period:        quarter,
    });
  }

  const result = Array.from(seen.values()).sort(
    (a, b) => a.quarter.localeCompare(b.quarter) || a.company.localeCompare(b.company)
  );

  console.log(`[notion] ✅ getQuarterlyData: returning ${result.length} rows`);
  return result;
}

// ─── DB2: Annual Company Data ──────────────────────────────────────────────────

async function _getAnnualCompanyData() {
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

// ─── DB3: SEO Articles ────────────────────────────────────────────────────────

async function _getPublishedArticles() {
  const dbId = process.env.NOTION_SEO_DB;
  if (!dbId) return [];
  let pages;
  try {
    pages = await queryAll(dbId, { property: "Status", select: { equals: "Published" } });
  } catch (e) { console.error("[notion] getPublishedArticles:", e.message); return []; }
  return pages.map(page => {
    const p = page.properties;
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
      language:         gp(p["Language"]) || null,
    };
  }).filter(a => a.slug && a.title)
    .sort((a, b) => (b.publish_date || "").localeCompare(a.publish_date || ""));
}

async function _getArticleBySlug(slug) {
  const dbId = process.env.NOTION_SEO_DB;
  if (!dbId) return null;
  let r;
  try {
    // ★ 加了 withRetry 包装
    r = await withRetry(
      () => notion.databases.query({
        database_id: dbId,
        filter: { property: "Slug", rich_text: { equals: slug } },
        page_size: 1,
      }),
      `getArticleBySlug(${slug})`
    );
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

// ─── DB4: Company Profiles ─────────────────────────────────────────────────────

async function _getAllCompanyProfiles(locale) {
  const dbId = process.env.NOTION_PROFILES_DB;
  if (!dbId) return [];
  let pages = [];
  if (locale) {
    try {
      pages = await queryAll(dbId, {
        and: [
          { property: "Status",   select: { equals: "Active" } },
          { property: "Language", select: { equals: locale } },
        ],
      });
    } catch (e) { pages = []; }
  }
  if (!pages.length) {
    try {
      pages = await queryAll(dbId, { property: "Status", select: { equals: "Active" } });
    } catch (e) { console.error("[notion] getAllCompanyProfiles:", e.message); return []; }
  }
  return pages.map(page => {
    const p = page.properties;
    return {
      id:             page.id,
      company:        gp(p["Company Name"]),
      ticker:         gp(p["Ticker"]),
      slug:           gp(p["Slug"]),
      description:    gp(p["Description"]),
      business_model: gp(p["Business Model"]),
      headquarters:   gp(p["Headquarters"]),
      founded:        gp(p["Founded"]),
      website:        gp(p["Website"]),
      peers:          gp(p["Peers"]),
      language:       gp(p["Language"]) || null,
    };
  }).filter(p => p.ticker);
}

async function _getCompanyProfile(ticker, locale) {
  const dbId = process.env.NOTION_PROFILES_DB;
  if (!dbId) return null;

  const tryFetch = async (lang) => {
    try {
      const filter = lang
        ? { and: [
            { property: "Slug",     rich_text: { equals: ticker.toUpperCase() } },
            { property: "Language", select:    { equals: lang } },
          ]}
        : { property: "Slug", rich_text: { equals: ticker.toUpperCase() } };
      // ★ 加了 withRetry 包装
      const r = await withRetry(
        () => notion.databases.query({ database_id: dbId, filter, page_size: 1 }),
        `getCompanyProfile(${ticker},${lang || "any"})`
      );
      return r.results[0] || null;
    } catch (e) { return null; }
  };

  let page = locale ? await tryFetch(locale) : null;
  if (!page && locale !== "en") page = await tryFetch("en");
  if (!page) page = await tryFetch(null);
  if (!page) return null;

  const p      = page.properties;
  const blocks = await getBlocks(page.id);
  const profileHtml = await blocksToHtml(blocks);
  return {
    id:             page.id,
    company:        gp(p["Company Name"]),
    ticker:         gp(p["Ticker"]),
    slug:           gp(p["Slug"]),
    description:    gp(p["Description"]),
    business_model: gp(p["Business Model"]),
    headquarters:   gp(p["Headquarters"]),
    founded:        gp(p["Founded"]),
    website:        gp(p["Website"]),
    peers:          gp(p["Peers"]),
    language:       gp(p["Language"]) || null,
    blocks,
  };
}

// ─── DB5: Metrics Glossary ─────────────────────────────────────────────────────

async function _getAllMetrics() {
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

async function _getMetricBySlug(slug) {
  const dbId = process.env.NOTION_METRICS_DB;
  if (!dbId) return null;
  let r;
  try {
    // ★ 加了 withRetry 包装
    r = await withRetry(
      () => notion.databases.query({
        database_id: dbId,
        filter: { property: "Slug", rich_text: { equals: slug } },
        page_size: 1,
      }),
      `getMetricBySlug(${slug})`
    );
  } catch (e) { console.error("[notion] getMetricBySlug:", e.message); return null; }
  if (!r.results.length) return null;
  const page = r.results[0]; const p = page.properties;
  const blocks = await getBlocks(page.id);
  return { id: page.id, name: gp(p["Metric Name"]), slug: gp(p["Slug"]), related_ranking: gp(p["Related Ranking"]), blocks };
}

// ─── DB6: FAQ ──────────────────────────────────────────────────────────────────

async function _getFAQs(locale) {
  const dbId = process.env.NOTION_FAQ_DB;
  if (!dbId) return [];
  let pages = [];

  // Try locale-filtered query first
  if (locale) {
    try {
      pages = await queryAll(dbId, {
        and: [
          { property: "Status",   select: { equals: "Published" } },
          { property: "Language", select: { equals: locale } },
        ],
      });
    } catch (e) { pages = []; }
  }

  // Fallback: unfiltered (Language field not set yet, or no results)
  if (!pages.length) {
    try {
      pages = await queryAll(dbId, { property: "Status", select: { equals: "Published" } });
    } catch (e) { console.error("[notion] getFAQs:", e.message); return []; }
  }

  const items = [];
  for (const page of pages) {
    const p = page.properties;
    let blocks = [];
    try { blocks = await getBlocks(page.id); } catch (e) {}
    items.push({
      id:             page.id,
      question:       gp(p["Question"]),
      category:       gp(p["Category"]),
      related_metric: gp(p["Related Metric"]),
      order:          gp(p["Order"]) || 999,
      language:       gp(p["Language"]) || null,
      answer_html:    await blocksToHtml(blocks),
    });
  }
  return items.sort((a, b) => a.order - b.order);
}

// ─── 用 dedupe (React cache) 包装公开函数 ─────────────────────────────────────
// 同一次页面渲染内，对同一函数、同一参数的多次调用只会发一次 Notion 请求

const getQuarterlyData     = dedupe(_getQuarterlyData);
const getAnnualCompanyData = dedupe(_getAnnualCompanyData);
const getPublishedArticles = dedupe(_getPublishedArticles);
const getArticleBySlug     = dedupe(_getArticleBySlug);
const getAllCompanyProfiles= dedupe(_getAllCompanyProfiles);
const getCompanyProfile    = dedupe(_getCompanyProfile);
const getAllMetrics        = dedupe(_getAllMetrics);
const getMetricBySlug      = dedupe(_getMetricBySlug);
const getFAQs              = dedupe(_getFAQs);

module.exports = {
  getQuarterlyData, getAnnualCompanyData,
  getPublishedArticles, getArticleBySlug,
  getAllCompanyProfiles, getCompanyProfile,
  getAllMetrics, getMetricBySlug,
  getFAQs, blocksToHtml, TICKER_MAP, NAME_MAP,
};
