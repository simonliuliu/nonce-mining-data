// app/layout.js — 根布局（最小化）
// 只提供 <html><body> 骨架和 CSS
// 导航、语言切换、页脚全部由 app/[locale]/layout.js 负责

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
