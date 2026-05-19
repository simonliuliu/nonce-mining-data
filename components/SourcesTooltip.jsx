"use client";
import { useState, useRef, useEffect } from "react";

// ─── 域名 / 路径解析 ───────────────────────────────────────────
// 不依赖 URL 类型字段，根据域名自动识别图标和友好名称

function parseUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    // 路径的最后一段（去掉查询参数和哈希），作为"文件名"
    const segs = u.pathname.split("/").filter(Boolean);
    const fileName = segs[segs.length - 1] || "";
    return { host, fileName, path: u.pathname };
  } catch {
    return { host: url, fileName: "", path: "" };
  }
}

// 根据域名/路径返回类型图标和友好名称
function classify(url) {
  const { host, path } = parseUrl(url);
  const lower = (host + path).toLowerCase();

  if (host.endsWith("sec.gov"))                       return { icon: "📄", label: "SEC Filing" };
  if (host === "twitter.com" || host === "x.com")     return { icon: "🐦", label: "X / Twitter" };
  if (host.includes("youtube.com") || host === "youtu.be") return { icon: "🎥", label: "YouTube" };
  if (lower.includes("/earnings") || lower.includes("earnings-call")) return { icon: "🎙", label: "Earnings Call" };
  if (lower.includes("/press") || lower.includes("press-release") || host.startsWith("ir."))
                                                       return { icon: "📰", label: "IR Press Release" };
  if (lower.includes("/investor") || lower.includes("investor-deck") || lower.includes(".pdf"))
                                                       return { icon: "📊", label: "Investor Deck" };
  if (lower.includes("monthly") || lower.includes("update"))
                                                       return { icon: "📅", label: "Update" };
  return { icon: "🔗", label: host };
}

// ─── Main component ──────────────────────────────────────────
export default function SourcesTooltip({ sources = [], fallback = "—", quarter = "", locale = "en" }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState(null);
  const triggerRef = useRef(null);
  // 延迟关闭计时器：鼠标从 trigger 滑到 tooltip 时给一个缓冲窗口
  // 避免穿越视觉间隙时被误判为"离开"
  const closeTimerRef = useRef(null);

  // 组件卸载时清理计时器，避免内存泄漏
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // 0 个来源：显示 fallback
  if (!sources || sources.length === 0) {
    return <span style={{ color: "var(--text3)" }}>{fallback}</span>;
  }

  // 1 个来源：直接显示链接，全局 CSS 会自动加 ↗ 提示
  if (sources.length === 1) {
    return (
      <a href={sources[0]} target="_blank" rel="noopener">
        {quarter || (locale === "zh" ? "原文" : "Source")}
      </a>
    );
  }

  // 多个来源：显示 "2026Q1 (3)"，hover 弹出 tooltip
  const label    = quarter || (locale === "zh" ? "原文" : "Source");
  const count    = sources.length;
  const heading  = locale === "zh" ? `${count} 个数据来源` : `${count} sources`;

  // ─── Hover 处理：取消延迟关闭 + 立刻显示 ───
  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function showTooltip(e) {
    cancelClose();
    // 只有 trigger 触发时才重新定位（tooltip 内部 hover 不需要）
    if (e?.currentTarget === triggerRef.current) {
      const b = e.currentTarget.getBoundingClientRect();
      setPos({ x: b.left + b.width / 2, y: b.bottom });
    }
    setOpen(true);
  }

  // 离开时启动 120ms 计时器；如果在此期间鼠标进入 tooltip，cancelClose 会取消它
  function scheduleClose() {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={scheduleClose}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          cursor: "help",
          borderBottom: "1px dashed var(--text3)",
          paddingBottom: 1,
          // 与单个来源链接保持一致的琥珀黄色（来自全局 CSS 的 a[target=_blank]）
          color: "var(--orange, #F7931A)",
        }}
      >
        {label}
        <span style={{
          fontSize: 10,
          fontFamily: "DM Mono, monospace",
          color: "var(--text3)",
          background: "rgba(255,255,255,0.06)",
          padding: "1px 5px",
          borderRadius: 4,
          marginLeft: 2,
        }}>
          {count}
        </span>
      </span>

      {open && pos && (
        <div
          // 在 trigger 与 tooltip 之间放一层透明的"桥接区"
          // 鼠标穿越这片区域时不会丢失 hover 状态
          // 桥接区高度 = tooltip 与 trigger 的视觉间隙（6px）+ 缓冲（4px）
          onMouseEnter={showTooltip}
          onMouseLeave={scheduleClose}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,                          // 直接从 trigger 底部开始（消除间隙）
            transform: "translateX(-50%)",
            paddingTop: 8,                       // 用 padding 制造视觉间隙，但鼠标依然在元素内
            zIndex: 9999,
          }}
        >
          <div style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "10px 0 6px",
            minWidth: 320,
            maxWidth: 420,
            boxShadow: "0 16px 40px rgba(0,0,0,.6)",
            fontSize: 12,
          }}>
            <div style={{
              padding: "0 14px 8px",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 4,
            }}>
              {heading}
            </div>

            {sources.map((url, i) => {
              const { host, fileName } = parseUrl(url);
              const { icon, label } = classify(url);
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "9px 14px",
                    textDecoration: "none",
                    color: "var(--text2)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ flexShrink: 0, fontSize: 14, lineHeight: 1.3 }}>{icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text)",
                      marginBottom: 2,
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      fontFamily: "DM Mono, monospace",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {host}{fileName ? ` / ${fileName}` : ""}
                    </div>
                  </span>
                  <span style={{
                    flexShrink: 0,
                    color: "var(--text3)",
                    fontSize: 11,
                    marginTop: 2,
                  }}>↗</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
