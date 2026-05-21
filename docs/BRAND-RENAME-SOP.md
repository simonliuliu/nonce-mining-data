# 品牌改名操作手册

> 文档目标：未来从 "HashResearch" 改成新品牌名时，告诉工程师/运营要改哪些文件、哪些 Notion 字段。  
> 适用人：技术 + 运营  
> 当前品牌名：**HashResearch**（无空格）  
> 当前域名：**thehashresearch.com**

---

## ⚠️ 改名前必读

### 1. 改名 vs 改域名是两件事
你可以：
- 🟢 **只改品牌名**（比如改成 "Nonce Insight"），域名继续用 `thehashresearch.com`
- 🟢 **只改域名**（比如换成 `data.nonce.app`），品牌名继续叫 HashResearch
- 🟢 **同时改**（既换品牌名又换域名）

每种情况要改的东西不一样。本文档同时覆盖这三种场景。

### 2. 改名会有 SEO 阵痛期
- 改完后 **2-4 周谷歌排名会暂时下降** —— 这是正常现象
- 用户搜旧品牌名找不到你了
- 旧域名上积累的"权重"需要时间转移

**建议**：
- 不要在重大流量增长期改名
- 改完立刻去 Google Search Console 提交"地址变更"
- 在文章和社交平台**双品牌并行**几周（"HashResearch（现已更名为 XXX）"）

---

## 一、改品牌名（不改域名）

### 改名清单：3 处代码 + 1 处图片 + Notion

#### 1️⃣ 改 `lib/i18n.js` — **全站文案 90% 都靠这个**

打开 `lib/i18n.js`，搜索 `HashResearch`（应该有十几处），全部替换为新品牌名。

具体位置：
- `en.seo.siteName`
- `en.seo.defaultTitle`
- `en.seo.*.title`（首页、公司、排行、Compare、Articles、Methodology、FAQ 全部）
- `en.footer.copy`
- `zh.seo.siteName`
- `zh.seo.defaultTitle`
- `zh.seo.*.title`
- `zh.footer.copy`

> 💡 用 VS Code 的"全文件查找替换"功能（Cmd+Shift+F）：
> - 查找：`HashResearch`
> - 替换：`你的新品牌名`
> - **只勾选 `lib/i18n.js` 这个文件**（避免误改）

#### 2️⃣ 改 `lib/seo.js` — Schema 里的品牌名

打开 `lib/seo.js`，找到这一行：
```js
const SITE_NAME = "HashResearch";
```
改成：
```js
const SITE_NAME = "你的新品牌名";
```

**就这一行**，整个 `seo.js` 只需要改这一处。其他所有 schema 函数都引用这个常量。

#### 3️⃣ 改 `app/layout.js` — 根布局兜底

打开 `app/layout.js`，找到：
```js
title: {
  default: "HashResearch",
  template: "%s — HashResearch",
},
```
改成：
```js
title: {
  default: "你的新品牌名",
  template: "%s — 你的新品牌名",
},
```

#### 4️⃣ 改 `app/NavBrand.jsx` — 导航栏品牌名

这是顶部导航栏左上角显示的品牌名。打开 `app/NavBrand.jsx`，搜 `HashResearch` 或 `Hash Research`，改成新品牌名。

> 注意：如果运营和你想保留旧 logo（图片），那只改 `<span>` 里的文字即可。
> 如果新品牌有新 logo，那 `/public/logo.jpg` 也要换。

#### 5️⃣ 替换 logo 图片

如果新品牌有新 logo：
- 替换 `/public/logo.jpg`（favicon + 导航栏头像）
- 替换 `/public/og-default.png`（社交分享卡片图）
- **保持文件名不变**，否则代码也要跟着改

#### 6️⃣ Notion 内容更新

| 数据库 | 字段 | 操作 |
|---|---|---|
| Company Profiles | （无需动） | 描述里如果有"HashResearch tracks..."这种自我提及，改一下 |
| SEO Articles | （无需动） | 文章正文里如果有自我提及，改一下 |
| FAQ | （无需动） | 答案里如果有自我提及，改一下 |

具体 SQL 思路：在 Notion 里直接搜 `HashResearch`，把出现的地方都改了。

---

### 改完后必做的验证

#### 本地（5 分钟）

```bash
npm run dev
```

打开浏览器分别访问 `/en`、`/zh`、`/en/company/MARA`、`/zh/faq`，检查：

- [ ] 浏览器标签 title 是新品牌名
- [ ] 导航栏左上角是新品牌名
- [ ] 页脚显示新品牌名
- [ ] view-source 看 `<meta name="description">` 已更新

#### 生产环境（部署后）

- [ ] Vercel 部署成功
- [ ] 访问 `https://thehashresearch.com/sitemap.xml` 应能正常加载
- [ ] 在 Google Search Console 提交一次"网址检查"（首页 + 几个公司页）让谷歌重新抓取

---

## 二、改域名（不改品牌名）

举例：从 `thehashresearch.com` 改成 `data.nonce.app`。

### 改名清单：1 处代码 + 域名设置

#### 1️⃣ 改 `lib/seo.js` — 一行搞定

打开 `lib/seo.js`，找到这一行：
```js
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehashresearch.com";
```

**两种方式之一**：

**方式 A：直接改默认值**
```js
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://data.nonce.app";
```

**方式 B（推荐）：用环境变量，不动代码**

在 Vercel 的 Project Settings → Environment Variables 里添加：
- Name: `NEXT_PUBLIC_SITE_URL`
- Value: `https://data.nonce.app`

这种方式好处是：
- 不同环境（dev / staging / prod）可以用不同域名
- 改回去也容易，不用 commit 代码

#### 2️⃣ 改 `app/layout.js`

打开 `app/layout.js`，找到这一行：
```js
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehashresearch.com";
```
同样的处理。

#### 3️⃣ Vercel 域名设置

1. Vercel Dashboard → 你的项目 → Settings → Domains
2. 添加新域名 `data.nonce.app`
3. 按提示在 DNS 服务商（阿里云/Cloudflare 等）添加 CNAME 记录
4. 等 SSL 证书自动签发（一般几分钟到几小时）

#### 4️⃣ 设置 301 重定向（**重要**）

旧域名 `thehashresearch.com` 上积累的 SEO 权重要"转移"到新域名 `data.nonce.app`，必须设 301 重定向。

**方式 A：在 Vercel 设置**
1. 把 `thehashresearch.com` 保留为项目的备用域名
2. Vercel Dashboard → Settings → Domains → 把它设为 redirect → 目标 `data.nonce.app`

**方式 B：在 next.config.js 配置**（如果你不想保留旧域名）

```js
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'thehashresearch.com' }],
        destination: 'https://data.nonce.app/:path*',
        permanent: true,  // 301
      },
    ];
  },
};
```

#### 5️⃣ Google Search Console 地址变更

1. 在 Search Console 里**新增** `data.nonce.app` 资源（不是替换）
2. 验证所有权
3. 在旧域名（`thehashresearch.com`）资源里：设置 → "地址变更" → 选择新资源
4. 提交后谷歌会自动转移权重（**预计 1-3 个月完成**）

#### 6️⃣ 提交新 sitemap

在新域名的 Search Console 里：
- Sitemaps → 输入 `sitemap.xml` → 提交

---

### 改完后必做的验证

- [ ] 访问 `https://data.nonce.app` 能正常打开
- [ ] 访问 `https://thehashresearch.com` 自动跳转到 `data.nonce.app`
- [ ] view-source 看 `<link rel="canonical">` 是新域名
- [ ] sitemap.xml 里所有 URL 都用新域名
- [ ] Google Search Console 完成地址变更申请

---

## 三、同时改品牌名 + 域名

把上面两套都做一遍即可。**先改品牌名，部署稳定后再改域名**，分两步降低风险。

---

## 四、改名前后的对照表（速查）

### 改品牌名 = 改 5 处

| # | 文件 | 改什么 | 影响 |
|---|---|---|---|
| 1 | `lib/i18n.js` | 全文替换 `HashResearch` → 新名 | 全站显示的品牌名 + 所有 SEO 文案 |
| 2 | `lib/seo.js` | `const SITE_NAME = "..."` 改一行 | 所有 schema 的 organization name |
| 3 | `app/layout.js` | title.default + template 改 | 浏览器标签兜底标题 |
| 4 | `app/NavBrand.jsx` | `<span>` 里的文字改 | 导航栏品牌名显示 |
| 5 | `/public/logo.jpg` + `og-default.png` | 替换图片（保持文件名） | favicon + 社交分享卡片 |

加上 Notion 内容里"自我提及"的地方。

### 改域名 = 改 1 处 + 设置

| # | 文件/设置 | 改什么 |
|---|---|---|
| 1 | Vercel 环境变量 `NEXT_PUBLIC_SITE_URL` | 设为新域名（**最简单**） |
| 2 | Vercel Domains | 添加新域名 + DNS CNAME |
| 3 | Vercel Redirects | 旧域名 301 → 新域名 |
| 4 | Google Search Console | 地址变更申请 |

---

## 五、最常见的踩坑

### ❌ 踩坑 1：只改了显示文字，忘了改 Schema 里的 name
**后果**：谷歌知识面板还是显示旧品牌名。  
**避免**：用 VS Code 全局搜索 `HashResearch`，全部确认改完。

### ❌ 踩坑 2：换域名不设 301 重定向
**后果**：旧域名上的 SEO 权重全部丢失，新域名要从 0 开始。  
**避免**：必须设 301，让权重转移。

### ❌ 踩坑 3：改完后没在 Google Search Console 提交地址变更
**后果**：谷歌不知道这是"同一个网站换地址"，可能当成新站从头爬。  
**避免**：在 Search Console 里走"地址变更"流程。

### ❌ 踩坑 4：图片改了文件名
**后果**：原本引用 `/logo.jpg` 的所有地方都 404。  
**避免**：替换图片但保持文件名不变。

### ❌ 踩坑 5：忘了改 Notion 里的自我提及
**后果**：用户看到首页是新品牌名，但点进文章/FAQ 还是旧品牌名，看起来很乱。  
**避免**：改完代码后，在 Notion 全文搜索旧品牌名，逐个改。

---

## 六、改名的最佳时机

| 时机 | 推荐度 |
|---|---|
| 网站刚上线 1-2 个月，流量还很少 | ⭐⭐⭐⭐⭐ 强烈推荐 |
| 上线 3-6 个月，开始有自然流量 | ⭐⭐⭐ 可以，但要做好阵痛准备 |
| 上线 1 年以上，有稳定流量来源 | ⭐⭐ 谨慎，建议有充分的迁移计划 |
| 重大产品发布前后 | ❌ 不要 |
| 流量增长期 | ❌ 不要 |

---

## 七、改名后的运营动作（让用户知道）

代码改完只是第一步。让用户知道改名：

1. **Twitter / X 公告**：发推说明改名，附新旧名对照
2. **网站顶部 banner**：贴出"HashResearch 现已更名为 XXX" 持续 1-2 个月
3. **邮件通知**（如果有订阅用户）
4. **更新所有外部链接**：合作伙伴网站、Discord/Telegram 简介、LinkedIn 等

---

## 八、一份"以防万一"的应急方案

如果改名后出问题（流量崩了 / 谷歌不收录），最快的回滚方法：

1. **代码回滚**：`git revert` 到改名前的提交，重新部署 → 5 分钟
2. **域名回滚**：在 Vercel 把主域名切回原域名，新域名设为重定向 → 10 分钟
3. **Search Console**：取消地址变更申请

整套回滚 30 分钟内可完成。

---

**END of 改名 SOP**

> 文档维护：每次品牌迭代后更新本文档
