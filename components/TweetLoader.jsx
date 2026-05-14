"use client";
import { useEffect } from "react";

// 加载 Twitter widgets.js，把页面里的 <blockquote class="twitter-tweet"> 渲染为完整卡片
export default function TweetLoader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const activate = () => {
      if (window.twttr?.widgets) {
        window.twttr.widgets.load();
      }
    };

    // 如果已经加载过，直接激活
    if (window.twttr) {
      activate();
      return;
    }

    // 避免重复加载
    if (document.querySelector('script[src*="widgets.js"]')) return;

    const s = document.createElement("script");
    s.src = "https://platform.twitter.com/widgets.js";
    s.async = true;
    s.charset = "utf-8";
    s.onload = activate;
    document.head.appendChild(s);
  }, []);

  return null;
}
