"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { switchLocale } from "@/lib/i18n";

const LANGS = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "zh", label: "简体中文", flag: "🇨🇳" },
];

export default function LangSwitcher({ currentLocale }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const router   = useRouter();
  const pathname = usePathname();

  const current = LANGS.find(l => l.code === currentLocale) || LANGS[0];

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(lang) {
    setOpen(false);
    if (lang.code === currentLocale) return;
    router.push(switchLocale(lang.code, pathname));
  }

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          background: "var(--bg3)",
          border: "1px solid var(--border2)",
          borderRadius: 7,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text2)",
          transition: "border-color 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
        onMouseLeave={e => !open && (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          viewBox="0 0 10 6"
          style={{
            width: 10, height: 6, opacity: 0.5,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          background: "var(--bg2)",
          border: "1px solid var(--border2)",
          borderRadius: 9,
          padding: 4,
          minWidth: 150,
          zIndex: 500,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {LANGS.map(lang => {
            const isActive = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  padding: "8px 12px",
                  background: isActive ? "var(--brand-dim)" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  cursor: isActive ? "default" : "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--brand)" : "var(--text2)",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg3)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>{lang.flag}</span>
                <span>{lang.label}</span>
                {isActive && (
                  <svg viewBox="0 0 12 12" style={{ width: 12, height: 12, marginLeft: "auto", flexShrink: 0 }}>
                    <path d="M2 6l3 3 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
