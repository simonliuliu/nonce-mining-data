"use client";
import { useRouter, usePathname } from "next/navigation";
import { switchLocale } from "@/lib/i18n";

export default function LangSwitcher({ currentLocale }) {
  const router   = useRouter();
  const pathname = usePathname();

  function handleSwitch(lang) {
    if (lang === currentLocale) return;
    router.push(switchLocale(lang, pathname));
  }

  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: "var(--bg3)",
      border: "1px solid var(--border2)",
      borderRadius: 7, overflow: "hidden", flexShrink: 0,
    }}>
      {["en", "zh"].map(lang => {
        const isActive = lang === currentLocale;
        return (
          <button key={lang} onClick={() => handleSwitch(lang)} style={{
            padding: "4px 12px", fontSize: 12,
            fontWeight: isActive ? 600 : 400,
            background: isActive ? "var(--brand)" : "transparent",
            color: isActive ? "#0a1820" : "var(--text3)",
            border: "none",
            cursor: isActive ? "default" : "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s, color 0.15s",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {lang}
          </button>
        );
      })}
    </div>
  );
}
