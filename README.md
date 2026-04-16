# Nonce Mining Data v3 — SEO-First Bitcoin Mining Database

A data website that tracks financial and operational metrics for public Bitcoin mining companies. Built with Next.js + Notion as backend CMS. Designed for SEO from the ground up — every data page is an explainable, indexable page.

## Architecture

```
Notion (6 databases)          Next.js (SSG + ISR)           Vercel CDN
┌──────────────────┐          ┌──────────────────┐          ┌─────────┐
│ 季度表           │──────▶  │ /                │──────▶  │ Global  │
│ 年度公司表       │──────▶  │ /company/MARA    │          │ Edge    │
│ SEO Articles     │──────▶  │ /rankings/...    │          │ < 100ms │
│ Company Profiles │──────▶  │ /metrics/...     │          │         │
│ Metrics Glossary │──────▶  │ /methodology     │          │         │
│ FAQ              │──────▶  │ /faq             │          │         │
└──────────────────┘          └──────────────────┘          └─────────┘
      你在这里编辑               自动构建                    用户访问
```

## Quick Start（5 分钟）

### 1. 安装 Node.js
确认已安装 Node.js 18+：
```bash
node --version   # 应该显示 v18.x 或更高
```
没有的话去 https://nodejs.org/ 下载 LTS 版本。

### 2. 创建 Notion Integration
1. 打开 https://www.notion.so/profile/integrations
2. 点 "New integration" → 名称填 `Mining Data Website` → Submit
3. 复制 Internal Integration Secret（`ntn_` 开头）

### 3. 授权数据库
在 Notion 中，打开以下 6 个数据库，每个都点 `•••` → Connections → 连接你的 Integration：

| 数据库 | 用途 |
|--------|------|
| 季度表 | 季度运营+财务数据 |
| 比特币挖矿公司数据表 - 2025 | 年度全公司数据 |
| SEO Articles | 文章内容 |
| Company Profiles | 公司简介+方法论+FAQ |
| Metrics Glossary | 指标释义 |
| FAQ | 问答 |

### 4. 配置环境变量
```bash
cp .env.example .env.local
```
编辑 `.env.local`，把 `NOTION_API_KEY=ntn_你的密钥粘贴在这里` 替换为真实密钥。其余 6 个数据库 ID 已预填好。

### 5. 安装 + 启动
```bash
npm install
npm run dev
```
打开 http://localhost:3000

---

## 页面结构

### 第一层：核心商业页面
| 路由 | 说明 |
|------|------|
| `/` | 首页 — 网站定位 + 公司快览 + 排行入口 |
| `/company/[ticker]` | 公司详情 — Profile + 图表 + Methodology + FAQ + 数据表 |
| `/rankings/[metric]` | 排行页 — 指标解释 + 排名表格（production/hashrate/holdings/cost/revenue/efficiency） |

### 第二层：解释型页面
| 路由 | 说明 |
|------|------|
| `/metrics/[slug]` | 指标释义 — 定义、重要性、使用方法、常见误区 |
| `/methodology` | 方法论 — 数据来源、口径、更新规则 |

### 第三层：问题型页面
| 路由 | 说明 |
|------|------|
| `/faq` | FAQ — 结构化问答，带 JSON-LD schema markup |

### 第四层：内容页面
| 路由 | 说明 |
|------|------|
| `/articles` | 文章列表 |
| `/articles/[slug]` | 文章详情 |

---

## 日常维护

### 更新季度数据
在 Notion「季度表」中新增/修改行 → 网站 1 小时内自动同步。

### 修改公司简介或方法论
在 Notion「Company Profiles」中编辑对应公司的页面正文 → 自动同步。
页面正文格式：第一个 `---` 分割线之前是 Methodology，之后是 FAQ。

### 新增指标释义
在 Notion「Metrics Glossary」中新增条目，填写 Slug 和正文内容，Status 设为 Published。

### 新增 FAQ
在 Notion「FAQ」数据库中新增条目，Answer 写在页面正文中，Status 设为 Published。

### 发布文章
在 Notion「SEO Articles」中写文章，填 Slug + Status = Published。

### 新增公司
1. 在「季度表」添加该公司的季度数据
2. 在「Company Profiles」添加该公司的 Profile（简介、业务模式、方法论、FAQ）
3. 在 `lib/notion.js` 的 `NAME_MAP` 和 `TICKER_MAP` 中添加名称映射
4. 在 `lib/helpers.js` 的 `COMPANIES`、`TICKERS`、`COLORS` 中添加

---

## 部署到 Vercel

1. `git init && git add -A && git commit -m "v3"`
2. 推送到 GitHub
3. 打开 https://vercel.com → Import → 选你的仓库
4. Environment Variables 中添加 `.env.local` 里的 7 个变量
5. Deploy

---

## 项目文件说明

```
├── .env.example              # 环境变量模板（6 个数据库 ID）
├── app/
│   ├── layout.js             # 全局布局 + 导航
│   ├── globals.css           # 全局样式
│   ├── page.js               # 首页（SEO 定位页）
│   ├── company/[ticker]/     # 公司详情（最高 SEO 价值）
│   ├── rankings/[metric]/    # 排行页（6 个指标）
│   ├── metrics/[slug]/       # 指标释义（10 个）
│   ├── methodology/          # 方法论
│   ├── faq/                  # FAQ（带 JSON-LD）
│   └── articles/             # 文章
├── components/
│   └── Charts.js             # Recharts 图表（6 种）
├── lib/
│   ├── notion.js             # Notion API（6 个数据库）
│   └── helpers.js            # 数据计算 + 排行配置
└── package.json
```
