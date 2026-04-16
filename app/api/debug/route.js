// app/api/debug/route.js
// 访问 http://localhost:3000/api/debug 查看 Notion 连接诊断报告
import { NextResponse } from "next/server";

export async function GET() {
  const out = {};

  // 1. 检查所有环境变量
  const envKeys = [
    "NOTION_API_KEY", "NOTION_QUARTERLY_DB", "NOTION_COMPANY_DB",
    "NOTION_SEO_DB", "NOTION_PROFILES_DB", "NOTION_METRICS_DB", "NOTION_FAQ_DB",
  ];
  out.env = {};
  for (const k of envKeys) {
    const v = process.env[k];
    out.env[k] = v ? `✅ ${v.slice(0, 10)}...` : "❌ MISSING";
  }

  // 2. 测试 Notion API 网络连通性
  try {
    const r = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
      },
    });
    const body = await r.json();
    out.connectivity = r.ok
      ? `✅ Connected — bot: ${body.name || body.id}`
      : `❌ HTTP ${r.status}: ${body.message}`;
  } catch (e) {
    out.connectivity = `❌ Network error: ${e.message}`;
    out.connectivity_hint =
      "Node.js 可能没走代理。试试：export https_proxy=http://127.0.0.1:7890 && npm run dev";
  }

  // 3. 测试季度表（最关键）
  const dbId = process.env.NOTION_QUARTERLY_DB;
  const key = process.env.NOTION_API_KEY;
  if (dbId && key) {
    try {
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 3 }),
      });
      const body = await r.json();
      if (r.ok && body.results?.length > 0) {
        const propNames = Object.keys(body.results[0].properties);
        out.quarterly_db = {
          status: `✅ ${body.results.length} rows returned (page_size=3, has_more=${body.has_more})`,
          all_property_names: propNames,
          "季度_found": propNames.includes("季度") ? "✅" : `❌ NOT FOUND — fix property name mapping`,
          Company_found: propNames.includes("Company") ? "✅" : `❌ NOT FOUND`,
          sample_row: Object.fromEntries(
            Object.entries(body.results[0].properties).slice(0, 5).map(([k, v]) => [k, v.type])
          ),
        };
      } else if (r.ok) {
        out.quarterly_db = `⚠ 0 rows returned — DB empty or Integration not granted access`;
      } else {
        out.quarterly_db = `❌ HTTP ${r.status}: ${body.message}`;
      }
    } catch (e) {
      out.quarterly_db = `❌ ${e.message}`;
    }
  } else {
    out.quarterly_db = "⏭ Skipped (env vars missing)";
  }

  return NextResponse.json(out, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
