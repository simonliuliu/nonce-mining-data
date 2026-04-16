# ⛏ Nonce Mining Data

> 比特币上市矿企数据追踪平台 · 数据来源于 SEC 财报

**[🌐 访问网站](https://nonce-mining-data.vercel.app)** · **[📊 Nonce.app](https://nonce.app)**

---

## 简介

Nonce Mining Data 是一个专注于**上市比特币矿企**的数据分析网站，帮助矿业从业者和投资者系统追踪和对比主要矿企的运营与财务数据。

所有数据直接来源于 SEC 10-Q / 10-K 季报和年报、公司官方 IR 披露，以及月度挖矿报告。原始数据与推算数据均明确标注。

---

## 功能亮点

| 功能 | 说明 |
|---|---|
| 📈 **实时排行榜** | 按 BTC 产量、算力、持仓、成本、收入、效率 6 个维度对比所有矿企 |
| 🏢 **公司详情页** | 每家矿企的完整数据画像：图表、季度历史数据、Methodology、FAQ |
| ⚖️ **灵活对比** | 任意选择两家公司进行多维度横向对比 |
| 📖 **指标释义** | 8 个核心指标的定义、解读方法、常见误区，帮助用户读懂矿企数据 |
| 🔍 **SEO 友好** | 服务端渲染，结构化数据，完整 sitemap，针对矿企相关搜索词优化 |
| 📝 **研究文章** | 矿企分析、行业报告、数据解读，内容通过 Notion 管理 |

---

## 覆盖公司

| 公司 | 股票代码 | 交易所 |
|---|---|---|
| Marathon Digital Holdings | MARA | NASDAQ |
| CleanSpark | CLSK | NASDAQ |
| Bitdeer Technologies | BTDR | NASDAQ |
| Cango Inc. | CANG | NYSE |

> 持续扩展中，欢迎通过 Issue 提交希望覆盖的矿企。

---

## 追踪指标

- **BTC 产量** — 季度自挖 BTC 数量
- **算力** — 运营算力（EH/s）
- **BTC 持仓** — 资产负债表 BTC 持有量
- **现金单币成本** — 挖出 1 枚 BTC 的直接现金成本
- **全成本单币成本** — 含折旧和管理费用的完整成本
- **电力规模** — 合同电力容量（MW）
- **机队能耗比** — 能效指标（J/TH）
- **收入 / 毛利润 / 净利润** — 财务数据

---

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端框架 | Next.js 14 (App Router) |
| 内容管理 | Notion API |
| 数据来源 | SEC EDGAR / 公司官方 IR |
| 图表 | Recharts |
| 部署 | Vercel |
| 样式 | CSS Variables (Dark Theme) |

---

## 本地开发

**环境要求：** Node.js 18+

```bash
# 1. 克隆项目
git clone https://github.com/simonliuliu/nonce-mining-data.git
cd nonce-mining-data

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 Notion API Key 和各数据库 ID

# 4. 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 环境变量

在 `.env.local` 中配置以下变量（参考 `.env.example`）：

```
NOTION_API_KEY=          # Notion Integration Secret
NOTION_QUARTERLY_DB=     # 季度数据表 ID
NOTION_COMPANY_DB=       # 公司年度数据表 ID
NOTION_SEO_DB=           # SEO 文章数据库 ID
NOTION_PROFILES_DB=      # 公司 Profile 数据库 ID
NOTION_METRICS_DB=       # 指标释义数据库 ID
NOTION_FAQ_DB=           # FAQ 数据库 ID
```

---

## 数据说明

- 所有数据优先使用 **SEC 官方财报原始数据**
- 推算数据会在页面上明确标注「Estimated」
- 数据按季度更新，通常在季报发布后 1-2 周内同步
- 详细口径说明见网站 [Methodology 页面](/methodology)

---

## 关联产品

本站是 **[Nonce.app](https://nonce.app)** 的数据展示层。Nonce.app 提供实时挖矿数据追踪、告警和投资组合管理功能。

---

## License

MIT License · © 2025 Nonce
