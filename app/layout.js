// app/layout.js — Root layout
// 只负责 <html><body>、全局 CSS、以及全站通用的 metadata（favicon + 默认 title）

import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thehashresearch.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HashResearch - Bitcoin Mining Data",
    template: "%s — HashResearch",
  },
  description:
    "Track BTC production, BTC holdings, hashrate, power capacity, fleet efficiency and unit costs across major listed Bitcoin miners. Data sourced from SEC filings, company announcements and investor materials.",
  // ★ Favicon —— 让浏览器标签上显示 logo
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
    ],
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
