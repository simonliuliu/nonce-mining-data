// app/layout.js — Root layout
// 只负责：<html><body>、全局 CSS、favicon、metadataBase
//
// 不负责：title / description / openGraph / canonical / alternates
// 这些都由 app/[locale]/layout.js 和各 page.js 提供
//
// 为什么？因为我们是双语站，根层的硬编码英文 metadata 会让中文页也显示英文
// description，影响中文 SEO。让 locale 层接管即可。

import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehashresearch.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),

  // 兜底 title - 子层一定会覆盖，这只是防止子层故障时浏览器 tab 显示空白
  // 当 generateMetadata 返回的 title 没有 default 字段时，会用这个
  title: {
    default: "HashResearch",
    template: "%s — HashResearch",
  },

  // 兜底 description - 同样，仅在子层故障时使用
  description:
    "Bitcoin mining company data and analytics. Track BTC production, hashrate, treasury, and unit costs across publicly listed Bitcoin miners.",

  // Favicon - 全站统一
  // 注意：/logo.jpg 在深色浏览器标签下会有白边，建议后续替换为带透明度的 PNG
  icons: {
    icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
