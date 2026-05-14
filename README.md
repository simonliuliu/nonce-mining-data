# Hash Research — Bitcoin Mining Data & Analytics

> Mining Insights. Digging Deeper.

**Hash Research** 是一个专注于上市比特币矿企数据的分析平台，追踪主要公开上市矿企的季度运营与财务指标，数据来源于 SEC 财报、公司公告与投资者材料。

🔗 网站：[hashresearch.co](https://hashresearch.co)  
🐦 Twitter：[@hash_res](https://x.com/hash_res)

---

## 产品功能

- **概览（Overview）** — 一张表纵览所有矿企的核心季度数据，支持季度筛选
- **排行榜（Rankings）** — 按 BTC 产量、算力、BTC 持仓、现金单币成本、机队能效五大维度排名
- **对比（Compare）** — 任意两家公司并排对比，快速找出差距
- **研究（Research）** — 原创深度分析文章，连接 Notion 后台
- **方法论（Methodology）** — 透明的数据口径说明，含 8 个核心指标定义与数据来源优先级
- **常见问题（FAQ）** — 指标解读与数据说明，连接 Notion 后台
- **中英双语** — 全站支持 `/en` 和 `/zh` 路径，自动根据浏览器语言跳转

---

## 数据覆盖

当前追踪 **16 家**上市比特币矿企，包括：

MARA · CLSK · RIOT · CORZ · HUT · BTDR · IREN · HIVE · BITF · WULF · CAN · CIFR · FUFU · SLNH · CANG · ABTC

**核心指标（每家公司每季度）：**

| 指标 | 说明 |
|---|---|
| BTC 季度产量 | 自挖 BTC，归属公司部分 |
| BTC 持仓 | 期末资产负债表 BTC |
| 算力（EH/s） | 优先采用季度平均运营算力 |
| 电价（$/kWh） | 实际或最接近实际运营电价 |
| 电力规模（MW） | 期末可运营电力容量 |
| 矿机能效（J/TH） | 矿机集群平均能效 |
| 单币能源成本 | 净电力成本 / BTC 产量 |
| 单币现金成本 | 直接现金成本 / BTC 产量 |

---

## 技术栈

- **框架**：Next.js 14（App Router）
- **数据后台**：Notion API
- **部署**：Vercel
- **样式**：CSS-in-JS，DM Sans + DM Mono 字体
- **图表**：Recharts

---

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 填写 NOTION_API_KEY 及各数据库 ID

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 会自动跳转到 `/en`。

### 环境变量

```
NOTION_API_KEY=
NOTION_QUARTERLY_DB=
NOTION_COMPANY_DB=
NOTION_SEO_DB=
NOTION_PROFILES_DB=
NOTION_METRICS_DB=
NOTION_FAQ_DB=
```

---

## Notion 数据库结构

所有内容类数据库（FAQ、Company Profiles、SEO Articles）均支持多语言，通过 `Language`（Select）字段区分，选项为 `en` / `zh`。

季度数据库无需语言字段，数字数据全球通用。

---

## 关于

**Hash Research** 由 [@hash_res](https://x.com/hash_res) 运营，专注于比特币矿企的数据分析与行业研究。

> 数据来源于公开的 SEC 文件与公司公告，不构成投资建议。
